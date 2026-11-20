import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  tasksService,
  quizService,
  flashcardsService,
  studySessionsService,
  notesService
} from '../services/supabase';
import DashboardCard from '../components/DashboardCard';
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  Layers,
  Bot,
  FileText,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Plus,
  Play,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import StudyTimerModal from '../components/StudyTimerModal';

export default function Dashboard() {
  const { user, profile, isDemoMode, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        const [loadedTasks, loadedQuizzes, loadedCards, loadedSessions, loadedNotes] =
          await Promise.all([
            tasksService.getTasks(user?.id),
            quizService.getQuizHistory(user?.id),
            flashcardsService.getFlashcards(user?.id),
            studySessionsService.getStudySessions(user?.id),
            notesService.getNotes(user?.id)
          ]);

        if (mounted) {
          setTasks(loadedTasks || []);
          setQuizzes(loadedQuizzes || []);
          setFlashcards(loadedCards || []);
          setSessions(loadedSessions || []);
          setNotes(loadedNotes || []);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Calculations
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const completedTasksCount = tasks.filter((t) => t.is_completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalQuizzes = quizzes.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(
          quizzes.reduce((acc, q) => acc + (q.score / (q.total_questions || 5)) * 100, 0) /
            totalQuizzes
        )
      : 0;

  const masteredCardsCount = flashcards.filter((f) => f.is_mastered).length;

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await tasksService.toggleTaskCompleted(taskId, !currentStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
      );
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter((t) => t.scheduled_date === todayStr || !t.is_completed).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80 bg-gradient-to-r from-navy-900 via-navy-850 to-brand-purple/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-purple-light">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {getGreeting()},{' '}
            <span className="bg-gradient-to-r from-brand-purple-light to-brand-blue bg-clip-text text-transparent">
              {profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar'}
            </span>
            !
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {profile?.major || 'B.Tech CSE/IT'} student at {profile?.university || 'University'}. You have{' '}
            <span className="text-white font-semibold">{tasks.filter((t) => !t.is_completed).length} pending tasks</span>{' '}
            and an average quiz accuracy of <span className="text-emerald-400 font-semibold">{avgQuizScore}%</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTimerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white text-xs font-semibold shadow-glow-purple flex items-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Study Session</span>
          </button>
          <Link
            to="/chat"
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-brand-purple-light" />
            <span>Ask AI Doubt</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Study Hours"
          value={`${totalStudyHours} hrs`}
          subtitle={`${sessions.length} logged focus sessions`}
          icon={Clock}
          color="purple"
          trend={`${totalStudyMinutes} mins logged`}
          onClick={() => navigate('/progress')}
        />
        <DashboardCard
          title="Tasks Completed"
          value={`${completedTasksCount} / ${totalTasksCount}`}
          subtitle={`${taskCompletionRate}% syllabus tasks finished`}
          icon={CheckCircle2}
          color="blue"
          trend={`${taskCompletionRate}% rate`}
          onClick={() => navigate('/planner')}
        />
        <DashboardCard
          title="Quiz Accuracy"
          value={`${avgQuizScore}%`}
          subtitle={`${totalQuizzes} quizzes completed`}
          icon={HelpCircle}
          color="emerald"
          trend={`${totalQuizzes} attempts`}
          onClick={() => navigate('/quiz')}
        />
        <DashboardCard
          title="Mastered Flashcards"
          value={`${masteredCardsCount} / ${flashcards.length}`}
          subtitle="Spaced repetition retention"
          icon={Layers}
          color="cyan"
          trend="Active Recall"
          onClick={() => navigate('/flashcards')}
        />
      </div>

      {/* Quick Access AI Tools Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span>AI Learning Launchpad</span>
          </h2>
          <span className="text-xs text-slate-400">All modules active & ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/chat"
            className="glass-panel rounded-2xl p-4 border border-brand-purple/20 hover:border-brand-purple/50 hover:shadow-glow-purple/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-purple-light transition-colors">
                    AI Study Chatbot
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-purple-light group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Academic Q&A with Markdown math notation, coding edge cases, and exam tips.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/summarizer"
            className="glass-panel rounded-2xl p-4 border border-brand-blue/20 hover:border-brand-blue/50 hover:shadow-glow-blue/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue-light shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-blue-light transition-colors">
                    PDF Notes Summarizer
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-blue-light group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Extract lecture slides with PDF.js and generate executive summaries & viva questions.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/quiz"
            className="glass-panel rounded-2xl p-4 border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    AI Quiz Generator
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Custom MCQs for any engineering subject with instant scoring and explanations.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/planner"
            className="glass-panel rounded-2xl p-4 border border-pink-500/20 hover:border-pink-500/50 hover:shadow-pink-500/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                    Smart Study Planner
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Organize daily academic goals with priority levels and syllabus deadlines.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/notes"
            className="glass-panel rounded-2xl p-4 border border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Notes Manager
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Organize rich subject notes, pin key materials, and sync with Supabase PostgreSQL.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/flashcards"
            className="glass-panel rounded-2xl p-4 border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Flashcards & Revision
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Interactive 3D flip flashcards generated by AI for spaced repetition review.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Today's Tasks & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="glass-panel rounded-2xl p-5 border border-navy-700/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple-light" />
              <h3 className="text-sm font-bold text-white">Priority Study Tasks</h3>
            </div>
            <Link
              to="/planner"
              className="text-xs text-brand-purple-light hover:underline flex items-center gap-1 font-semibold"
            >
              Open Planner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todaysTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>No pending study tasks! You're completely caught up.</p>
              <Link
                to="/planner"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-brand-purple-light border border-navy-700 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Task
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    task.is_completed
                      ? 'bg-navy-900/40 border-navy-800/80 text-slate-500'
                      : 'bg-navy-800/60 border-navy-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task.id, task.is_completed)}
                      className="w-4 h-4 rounded text-brand-purple bg-navy-900 border-navy-600 focus:ring-brand-purple cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          task.is_completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{task.subject}</span>
                        {task.scheduled_time && (
                          <span className="text-[10px] text-slate-500">• {task.scheduled_time}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      task.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {task.priority || 'Normal'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes & Recent Notes */}
        <div className="space-y-6">
          {/* Recent Quiz Performance */}
          <div className="glass-panel rounded-2xl p-5 border border-navy-700/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Recent Quiz Performance</h3>
              </div>
              <Link
                to="/quiz"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Take New Quiz <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {quizzes.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <p>No quizzes taken yet. Test your knowledge in any subject!</p>
                <Link
                  to="/quiz"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-emerald-400 border border-navy-700 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Start First Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {quizzes.slice(0, 3).map((q) => {
                  const scorePct = Math.round((q.score / (q.total_questions || 5)) * 100);
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-navy-800/60 border border-navy-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{q.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Difficulty: <span className="text-slate-300 capitalize">{q.difficulty}</span> •{' '}
                          {new Date(q.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                            scorePct >= 80
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : scorePct >= 60
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {q.score} / {q.total_questions} ({scorePct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Notes preview */}
          <div className="glass-panel rounded-2xl p-5 border border-navy-700/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Subject Notes</h3>
              </div>
              <Link
                to="/notes"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                View All ({notes.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No saved notes yet.</p>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => navigate('/notes')}
                    className="p-2.5 rounded-xl bg-navy-800/40 border border-navy-700/70 hover:border-amber-500/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white truncate max-w-[240px]">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-brand-purple-light bg-brand-purple/10 px-1.5 py-0.5 rounded">
                        {n.subject}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Study Session Modal */}
      {isTimerOpen && (
        <StudyTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      )}
    </div>
  );
}
