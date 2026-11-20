import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Custom Vite plugin to handle /api/* serverless endpoints in local development
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];
        const apiName = urlPath.replace('/api/', '');
        const filePath = path.resolve(process.cwd(), 'api', `${apiName}.js`);

        if (!fs.existsSync(filePath)) {
          return next();
        }

        try {
          // Parse request body for POST/PUT requests
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString();
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch (e) {
              req.body = bodyStr;
            }
          }

          // Polyfill res.status().json() like Vercel Serverless Function
          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
          res.json = function (data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
          };

          // Dynamically import API handler (with timestamp to bust cache in dev)
          const module = await server.ssrLoadModule(`/api/${apiName}.js?t=${Date.now()}`);
          const handler = module.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ error: `Handler in /api/${apiName}.js is not a default export function` });
          }
        } catch (error) {
          console.error(`Error executing /api/${apiName}:`, error);
          if (!res.writableEnded) {
            res.status(500).json({
              error: error.message || 'Internal Server Error',
              stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
          }
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  // Make GEMINI_API_KEY available to process.env in local serverless middleware
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
  process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

  return {
    plugins: [react(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown-vendor': ['react-markdown', 'remark-gfm'],
            'supabase-vendor': ['@supabase/supabase-js'],
          }
        }
      }
    }
  };
});
