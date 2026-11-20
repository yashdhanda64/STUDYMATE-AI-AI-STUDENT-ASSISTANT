import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Bot,
  FileText,
  HelpCircle,
  CalendarCheck,
  BookOpen,
  Layers,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Cpu,
  Database,
  Zap,
  Star,
  Github,
  Code2
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Study Chatbot',
    desc: 'Instant academic answers with step-by-step math breakdowns, clean code samples, and viva-ready explanations powered by Google Gemini.',
    color: 'from-purple-500/20 to-blue-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    icon: FileText,
    title: 'PDF Notes Summarizer',
    desc: 'Upload lecture slides and textbooks. Extract text with PDF.js, generate concise summaries, key revision points, and viva exam questions.',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    icon: HelpCircle,
    title: 'AI Quiz Generator',
    desc: 'Generate customized MCQs with customizable difficulty (Easy, Medium, Hard). Take tests, track live scores, and get clear answer explanations.',
    color: 'from-cyan-500/20 to-emerald-500/20',
    borderColor: 'border-cyan-500/30'
  },
  {
    icon: CalendarCheck,
    title: 'Smart Study Planner',
    desc: 'Organize study tasks with deadlines, subject tags, and priority levels. Stay on top of your daily goals and university syllabus schedules.',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-pink-500/30'
  },
  {
    icon: BookOpen,
    title: 'Notes Manager',
    desc: 'Draft and organize rich subject notes with search and pin capabilities, backed by Supabase PostgreSQL for cloud persistence.',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  },
  {
    icon: Layers,
    title: 'AI Flashcards & Spaced Revision',
    desc: 'Generate active-recall flashcard decks from any topic or note. Flip through with smooth 3D cards and track your mastered concepts.',
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30'
  }
];

const STEPS = [
  {
    step: '01',
    title: 'Upload or Ask Anything',
    desc: 'Drop in lecture PDFs, enter your syllabus topics, or ask the AI academic chatbot any conceptual doubt.'
  },
  {
    step: '02',
    title: 'AI Synthesizes & Tests',
    desc: 'Google Gemini creates instant summaries, high-yield flashcards, and practice quizzes calibrated to your difficulty level.'
  },
  {
    step: '03',
    title: 'Track Progress & Ace Exams',
    desc: 'Log focused study hours, monitor quiz accuracy, and track syllabus coverage on your personal analytics dashboard.'
  }
];

export default function Landing() {
  const { user, enterDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-md border-b border-navy-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue p-0.5 shadow-glow-purple flex items-center justify-center">
            <img src="/logo.svg" alt="StudyMate Logo" className="w-9 h-9 rounded-lg" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">StudyMate</span>
            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded bg-brand-purple text-white">AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold shadow-glow-purple hover:opacity-95 transition-all flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold shadow-glow-purple hover:opacity-95 transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Glow backdrop blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-purple/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-purple-light" />
          <span>Powered by Google Gemini 2.5 & Supabase</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your Smart <span className="bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-blue bg-clip-text text-transparent">Learning Partner</span> for University Excellence.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The all-in-one AI productivity platform for engineering and college students. Ask doubts, summarize PDF lecture notes, auto-generate quizzes, practice flashcards, and plan your study routine.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white font-semibold text-base shadow-glow-purple hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            Start Learning for Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/dashboard"
            onClick={enterDemoMode}
            className="px-7 py-3.5 rounded-xl bg-navy-800/90 hover:bg-navy-750 text-slate-200 border border-navy-700 hover:border-slate-500 font-semibold text-base transition-all flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Explore Live Demo
          </Link>
        </div>

        {/* Feature Badges under CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Built for B.Tech CSE & IT
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Gemini 2.5 Flash
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PostgreSQL Row Level Security
          </span>
        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-16 rounded-2xl p-2 bg-gradient-to-b from-navy-700/80 to-navy-900 border border-navy-700/80 shadow-2xl max-w-5xl mx-auto">
          <div className="rounded-xl bg-navy-950 p-4 sm:p-6 border border-navy-800/80 text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-navy-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">studymate.ai/dashboard</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-brand-purple-light">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Student Workspace</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                <p className="text-xs text-slate-400">Weekly Study Hours</p>
                <p className="text-2xl font-bold text-white mt-1">18.5 hrs</p>
                <p className="text-[11px] text-emerald-400 mt-1">↑ 22% from last week</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                <p className="text-xs text-slate-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-white mt-1">24 / 28</p>
                <p className="text-[11px] text-brand-purple-light mt-1">85% completion rate</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                <p className="text-xs text-slate-400">Quizzes Attempted</p>
                <p className="text-2xl font-bold text-white mt-1">12 Quizzes</p>
                <p className="text-[11px] text-blue-400 mt-1">88% Avg Accuracy</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                <p className="text-xs text-slate-400">Flashcards Mastered</p>
                <p className="text-2xl font-bold text-white mt-1">142 Cards</p>
                <p className="text-[11px] text-cyan-400 mt-1">Ready for semester exams</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ask Gemini: "Explain Dijkstra vs Bellman-Ford complexity"</p>
                  <p className="text-xs text-slate-400">Markdown formatted, $O((V+E)\log V)$ math, and edge case explanations.</p>
                </div>
              </div>
              <Link
                to="/chat"
                className="px-4 py-2 rounded-lg bg-brand-purple/20 text-brand-purple-light border border-brand-purple/40 text-xs font-semibold hover:bg-brand-purple/30 transition-colors whitespace-nowrap"
              >
                Launch Chatbot →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-navy-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-purple-light">
            Comprehensive Learning Ecosystem
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Academic High Performance
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Every tool is purpose-built to help you understand tough concepts faster, prepare for semester examinations, and retain technical knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`glass-panel rounded-2xl p-6 border ${feat.borderColor} hover:-translate-y-1 transition-all duration-200 group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feat.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-navy-800 bg-navy-950/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Simple 3-Step Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            From Heavy Notes to Exam Mastery
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((s, i) => (
            <div key={i} className="relative p-6 rounded-2xl bg-navy-900 border border-navy-800">
              <span className="text-4xl font-black text-brand-purple/30 font-mono mb-4 block">
                {s.step}
              </span>
              <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section id="tech-stack" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-navy-800">
        <div className="text-center mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Built with Modern Full-Stack & AI Architecture
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-300 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800">
            <Cpu className="w-4 h-4 text-brand-purple" />
            <span>Google Gemini 2.5 Flash SDK</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase PostgreSQL & Auth</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800">
            <Code2 className="w-4 h-4 text-brand-blue" />
            <span>React + Vite (ESM)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Vercel Serverless Functions</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 max-w-4xl mx-auto w-full border-t border-navy-800 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue p-1 mx-auto mb-6 shadow-glow-purple flex items-center justify-center">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Crafted for 2nd-Year B.Tech CSE & IT Students
        </h3>
        <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
          StudyMate AI is designed as a real-world, high-impact portfolio project showcasing clean full-stack architecture, prompt engineering with the official Gemini SDK, PostgreSQL Row Level Security (RLS), and modern responsive UI/UX principles.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold text-sm transition-colors shadow-glow-purple"
          >
            Create Free Account
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-navy-800 py-8 px-6 bg-navy-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="StudyMate Logo" className="w-5 h-5 rounded" />
            <span className="font-semibold text-slate-400">StudyMate AI © {new Date().getFullYear()}</span>
            <span>– Your Smart Learning Partner</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Gemini Studio</a>
            <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Supabase</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
