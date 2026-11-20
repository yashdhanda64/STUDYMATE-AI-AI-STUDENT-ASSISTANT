import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Bell,
  Timer,
  Sparkles,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import StudyTimerModal from './StudyTimerModal';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/chat': 'AI Study Chatbot',
  '/summarizer': 'PDF Notes Summarizer',
  '/quiz': 'AI Quiz Generator',
  '/planner': 'Smart Study Planner',
  '/notes': 'Notes Manager',
  '/flashcards': 'AI Flashcard Revision',
  '/progress': 'Progress Tracker'
};

export default function Navbar({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user, profile, signOut, isDemoMode, isSupabaseConfigured } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeSessionMinutes, setActiveSessionMinutes] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentTitle = PAGE_TITLES[location.pathname] || 'StudyMate AI';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-navy-900/80 backdrop-blur-md border-b border-navy-700/60 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 lg:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {currentTitle}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 rounded-full">
              B.Tech Academic Partner
            </span>
          </div>
        </div>

        {/* Right: Actions, Timer, Status & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Study Session Timer Trigger */}
          <button
            onClick={() => setIsTimerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 hover:border-brand-purple/40 text-xs md:text-sm font-medium transition-all shadow-sm"
            title="Start Pomodoro / Study Timer"
          >
            <Timer className="w-4 h-4 text-brand-purple" />
            <span className="hidden sm:inline">Study Timer</span>
          </button>

          {/* Supabase Status Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={
              isSupabaseConfigured
                ? 'Connected to live Supabase PostgreSQL database'
                : 'Running in Local Demo Mode. Configure .env with Supabase keys for cloud sync.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isSupabaseConfigured ? 'Cloud Synced' : 'Demo Mode'}</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-navy-800 hover:bg-navy-750 border border-navy-700 focus:outline-none transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-300 max-w-[100px] truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'Student'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-navy-800 border border-navy-700 shadow-2xl py-2 z-50 text-slate-200"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-navy-700/80">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile?.full_name || 'Student User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || 'student@university.edu'}</p>
                  <p className="text-[11px] text-brand-purple-light mt-1">
                    {profile?.major || 'B.Tech CSE/IT'}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/progress"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-navy-700/60 transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-blue" />
                    <span>View Profile & Analytics</span>
                  </Link>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-2 text-xs hover:bg-navy-700/60 text-slate-300 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Gemini API Key</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>

                <div className="pt-1 border-t border-navy-700/80">
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/login');
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Pomodoro / Study Timer Modal */}
      {isTimerOpen && (
        <StudyTimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
        />
      )}
    </>
  );
}
