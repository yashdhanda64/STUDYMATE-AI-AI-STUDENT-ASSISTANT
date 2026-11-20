import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  studySessionsService,
  tasksService,
  quizService,
  flashcardsService,
  profileService
} from '../services/supabase';
import DashboardCard from '../components/DashboardCard';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  HelpCircle,
  Layers,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Plus,
  Save,
  Check
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Engineering Mathematics',
  'Web Development & Cloud',
  'General Revision'
];

export default function Progress() {
  const { user, profile, updateProfile } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Session Logger Form
  const [logSubject, setLogSubject] = useState(SUBJECT_OPTIONS[0]);
  const [logMinutes, setLogMinutes] = useState(60);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // Profile Goal Settings Form
  const [dailyGoal, setDailyGoal] = useState(profile?.study_goal_hours || 4.0);
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    loadAllStats();
  }, [user]);

  const loadAllStats = async () => {
    try {
      const [loadedSessions, loadedTasks, loadedQuizzes, loadedCards] = await Promise.all([
        studySessionsService.getStudySessions(user?.id),
        tasksService.getTasks(user?.id),
        quizService.getQuizHistory(user?.id),
        flashcardsService.getFlashcards(user?.id)
      ]);

      setSessions(loadedSessions || []);
      setTasks(loadedTasks || []);
      setQuizzes(loadedQuizzes || []);
      setFlashcards(loadedCards || []);
    } catch (e) {
      console.error('Failed to load progress stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    try {
      const newSess = await studySessionsService.logStudySession(user?.id, {
        subject: logSubject,
        duration_minutes: parseInt(logMinutes, 10) || 30,
        notes: logNotes.trim() || 'Logged study session.'
      });
      setSessions((prev) => [newSess, ...prev]);
      setLogSuccess(true);
      setLogNotes('');
      setTimeout(() => setLogSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ study_goal_hours: parseFloat(dailyGoal) });
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  // Metrics Calculations
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalQuizzes = quizzes.length;
  const avgQuizPct =
    totalQuizzes > 0
      ? Math.round(
          quizzes.reduce((acc, q) => acc + (q.score / (q.total_questions || 5)) * 100, 0) /
            totalQuizzes
        )
      : 0;

  const masteredCards = flashcards.filter((f) => f.is_mastered).length;

  // Weekly study minutes distribution (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMinutes = sessions
      .filter((s) => s.session_date === dateStr)
      .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    return { dateStr, dayName, minutes: dayMinutes, hours: (dayMinutes / 60).toFixed(1) };
  });

  const maxWeeklyMinutes = Math.max(...last7Days.map((d) => d.minutes), 120);

  // Subject-wise Breakdown
  const subjectMap = {};
  sessions.forEach((s) => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration_minutes;
  });
  const subjectBreakdown = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Performance Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Progress & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Monitor revision hours, task completion rate, and examination accuracy trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs">
            <span className="text-slate-400 block">Target Daily Goal:</span>
            <span className="text-sm font-bold text-white">{profile?.study_goal_hours || 4.0} hrs / day</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Focus Time"
          value={`${totalHours} hrs`}
          subtitle={`${sessions.length} logged sessions`}
          icon={Clock}
          color="purple"
          trend={`${totalMinutes} mins`}
        />
        <DashboardCard
          title="Tasks Completed"
          value={`${completedTasks} / ${tasks.length}`}
          subtitle={`${taskRate}% completion velocity`}
          icon={CheckCircle2}
          color="blue"
          trend={`${taskRate}% rate`}
        />
        <DashboardCard
          title="Quiz Mastery"
          value={`${avgQuizPct}%`}
          subtitle={`${totalQuizzes} quizzes completed`}
          icon={HelpCircle}
          color="emerald"
          trend="Score Avg"
        />
        <DashboardCard
          title="Mastered Cards"
          value={`${masteredCards} / ${flashcards.length}`}
          subtitle="Long-term memory retention"
          icon={Layers}
          color="cyan"
          trend="Active Recall"
        />
      </div>

      {/* Charts Section: Weekly Activity & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Time Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-navy-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-purple-light" />
              <h3 className="text-sm font-bold text-white">Weekly Focus Time (Last 7 Days)</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Minutes Logged</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2">
            {last7Days.map((day, idx) => {
              const heightPct = Math.min(100, Math.max(8, Math.round((day.minutes / maxWeeklyMinutes) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.minutes}m
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-brand-purple to-brand-blue group-hover:from-brand-purple-light group-hover:to-cyan-400 transition-all shadow-glow-purple/20"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-300 uppercase">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-navy-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Consistent study blocks yield maximum GPA retention</span>
            <span className="text-brand-purple-light font-semibold">
              {(totalMinutes / 7).toFixed(0)}m daily avg
            </span>
          </div>
        </div>

        {/* Subject-Wise Time Allocation */}
        <div className="glass-panel rounded-2xl p-6 border border-navy-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Subject Time Allocation</h3>
            </div>
            <span className="text-xs text-slate-400">Total Minutes</span>
          </div>

          <div className="space-y-3.5 my-auto">
            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No study sessions logged yet. Use the Pomodoro Timer or form below!
              </p>
            ) : (
              subjectBreakdown.slice(0, 5).map(([subj, mins], i) => {
                const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200 truncate max-w-[200px]">{subj}</span>
                      <span className="text-brand-purple-light">
                        {mins}m ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-navy-800 rounded-full h-2 overflow-hidden border border-navy-750">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-brand-purple h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-navy-700/60 text-xs text-slate-400">
            Based on active Pomodoro blocks and manual study entries
          </div>
        </div>
      </div>

      {/* Two Column Forms: Manual Session Logger & Goal Setter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Session Logger */}
        <div className="glass-panel rounded-2xl p-6 border border-navy-700/80">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-brand-purple" />
            <h3 className="text-sm font-bold text-white">Log Completed Study Session</h3>
          </div>

          {logSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Study session successfully logged to database!</span>
            </div>
          )}

          <form onSubmit={handleManualLog} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={logSubject}
                  onChange={(e) => setLogSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  required
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Session Focus / Topics Covered
              </label>
              <input
                type="text"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g. Solved 4 Dynamic Programming problems, reviewed Bellman-Ford"
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold shadow-glow-purple flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Record Study Session</span>
            </button>
          </form>
        </div>

        {/* Daily Study Goal Configuration */}
        <div className="glass-panel rounded-2xl p-6 border border-navy-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Personal Study Goal</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Set your target daily study hours. We'll benchmark your weekly analytics against this target.
            </p>

            {goalSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Goal updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Study Target (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="p-3 rounded-xl bg-navy-800/60 border border-navy-700 text-xs text-slate-300">
                <span className="font-semibold text-white block">Student Profile:</span>
                <span>{profile?.full_name || 'Alex Chen'} • {profile?.major || 'B.Tech CSE'}</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-brand-purple-light border border-brand-purple/40 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Target Settings</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Logged Study Sessions History Table */}
      <div className="glass-panel rounded-2xl p-6 border border-navy-700/80">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-blue" />
          <span>Recent Logged Study Sessions ({sessions.length})</span>
        </h3>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No study sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-800/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Date</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4 rounded-r-lg">Focus Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750">
                {sessions.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-navy-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400">{s.session_date}</td>
                    <td className="py-3 px-4 font-semibold text-white">{s.subject}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-brand-purple/15 text-brand-purple-light font-bold">
                        {s.duration_minutes} mins
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                      {s.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
