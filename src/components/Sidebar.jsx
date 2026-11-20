import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  FileText,
  HelpCircle,
  CalendarCheck,
  BookOpen,
  Layers,
  BarChart3,
  LogOut,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Chatbot', path: '/chat', icon: Bot, badge: 'Gemini' },
  { name: 'PDF Summarizer', path: '/summarizer', icon: FileText },
  { name: 'Quiz Generator', path: '/quiz', icon: HelpCircle },
  { name: 'Study Planner', path: '/planner', icon: CalendarCheck },
  { name: 'Notes Manager', path: '/notes', icon: BookOpen },
  { name: 'Flashcards', path: '/flashcards', icon: Layers },
  { name: 'Progress Tracker', path: '/progress', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-700/70 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-navy-700/60 bg-navy-950/40">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue p-0.5 shadow-glow-purple flex items-center justify-center">
              <img src="/logo.svg" alt="StudyMate Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base group-hover:text-brand-purple-light transition-colors">
                  StudyMate
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-purple text-white uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Smart Learning Partner</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Study Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-purple/20 to-brand-blue/15 text-white border border-brand-purple/30 shadow-glow-purple/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/80 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-brand-purple-light' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple-light border border-brand-purple/40">
                        {item.badge}
                      </span>
                    )}

                    {isActive && !item.badge && (
                      <ChevronRight className="w-3.5 h-3.5 text-brand-purple-light" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Sign Out Footer */}
        <div className="p-3 border-t border-navy-700/60 bg-navy-950/40">
          <div className="p-3 rounded-xl bg-navy-800/90 border border-navy-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.full_name || 'Alex Chen'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile?.major || 'B.Tech CSE/IT'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
