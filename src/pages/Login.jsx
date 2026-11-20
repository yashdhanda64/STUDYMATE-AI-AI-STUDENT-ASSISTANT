import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const { signIn, enterDemoMode, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!email || !password) {
      setError('Please provide both your university email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-brand-purple/30 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-purple/15 rounded-full blur-[110px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue p-0.5 shadow-glow-purple flex items-center justify-center">
            <img src="/logo.svg" alt="StudyMate Logo" className="w-10 h-10 rounded-xl" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-tight">StudyMate</span>
            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded bg-brand-purple text-white">AI</span>
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome Back, Scholar
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your notes, quizzes, and AI tutor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-navy-700/80 shadow-2xl">
          {/* Quick Demo Access banner for portfolio reviewers */}
          <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-brand-purple/15 to-brand-blue/15 border border-brand-purple/30 text-left">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Instant Portfolio Review</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Explore all working AI tools and dashboard metrics immediately without registering.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="mt-2.5 w-full py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Enter as Demo Student (Alex Chen)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-navy-900 px-3 text-slate-400 font-semibold tracking-wider">
                Or Sign In with Supabase
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resetMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetMessage('Password reset simulation triggered. Check inbox.')}
                  className="text-[11px] text-brand-purple-light hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white font-semibold text-sm shadow-glow-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-brand-purple-light font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
