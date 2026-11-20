import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Zap
} from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [major, setMajor] = useState('B.Tech CSE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign up failed:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
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
          Join StudyMate AI
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Create your smart academic workspace in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-navy-700/80 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

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
                  placeholder="alex.chen@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Degree / Academic Stream
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors"
                >
                  <option value="B.Tech CSE">B.Tech Computer Science & Engineering</option>
                  <option value="B.Tech IT">B.Tech Information Technology</option>
                  <option value="B.Tech AI & DS">B.Tech AI & Data Science</option>
                  <option value="B.Tech ECE">B.Tech Electronics & Communication</option>
                  <option value="BCA / MCA">BCA / MCA</option>
                  <option value="B.Sc / M.Sc Sciences">B.Sc / M.Sc Computer Science / Sciences</option>
                  <option value="Other Engineering">Other Engineering & Technology</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white font-semibold text-sm shadow-glow-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Student Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-navy-700/80 text-center">
            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white text-xs font-semibold border border-navy-700 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Instantly in Demo Mode</span>
            </button>
            <p className="mt-4 text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-purple-light font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
