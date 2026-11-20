import React, { useState, useEffect } from 'react';
import { studySessionsService } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  BookOpen,
  Sparkles
} from 'lucide-react';

const PRESET_MINUTES = [
  { label: 'Pomodoro (25m)', minutes: 25 },
  { label: 'Deep Focus (50m)', minutes: 50 },
  { label: 'Quick Sprint (15m)', minutes: 15 },
];

const SUBJECTS = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Mathematics & Discrete Math',
  'Web Development & Cloud',
  'General Revision'
];

export default function StudyTimerModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [notes, setNotes] = useState('');
  const [hasLogged, setHasLogged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTimeLeftSeconds(selectedMinutes * 60);
    setIsRunning(false);
  }, [selectedMinutes]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      // Play audio notification or trigger alert
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeftSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeftSeconds) / totalSeconds) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(selectedMinutes * 60);
  };

  const handleLogSession = async () => {
    setIsSaving(true);
    try {
      const durationElapsed = Math.max(1, Math.round((totalSeconds - timeLeftSeconds) / 60));
      await studySessionsService.logStudySession(user?.id, {
        subject,
        duration_minutes: durationElapsed,
        notes: notes.trim() || `Completed ${durationElapsed} min focused study block.`
      });
      setHasLogged(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Failed to log session:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-700/60 flex items-center justify-between bg-navy-950/40">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Clock className="w-5 h-5 text-brand-purple" />
            <span>Focus Study Timer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {PRESET_MINUTES.map((p) => (
              <button
                key={p.minutes}
                disabled={isRunning}
                onClick={() => setSelectedMinutes(p.minutes)}
                className={`py-2 px-2 text-xs rounded-xl font-medium border transition-colors ${
                  selectedMinutes === p.minutes
                    ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple/20'
                    : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-750'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center bg-navy-800/80 border-4 border-navy-700 shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  className="stroke-navy-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  className="stroke-brand-purple transition-all duration-300"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center z-10">
                <div className="text-4xl font-extrabold text-white tracking-wider font-mono">
                  {formattedTime}
                </div>
                <div className="text-xs text-brand-purple-light font-medium mt-1">
                  {isRunning ? 'Focusing...' : timeLeftSeconds === 0 ? 'Completed!' : 'Ready'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-glow-purple'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Focus
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject & Log Details */}
          <div className="space-y-3 pt-3 border-t border-navy-700/60">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Study Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Session Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Read trees chapter, solved 3 graph problems"
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={handleLogSession}
              disabled={isSaving || hasLogged}
              className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border transition-colors ${
                hasLogged
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-navy-800 hover:bg-navy-750 text-brand-purple-light border-brand-purple/30'
              }`}
            >
              {hasLogged ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Logged to Progress Tracker!
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Log This Study Time
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
