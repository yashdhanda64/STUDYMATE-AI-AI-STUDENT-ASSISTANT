import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksService } from '../services/supabase';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Data Structures & Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Engineering Mathematics',
  'Web Development & Cloud',
  'General Revision'
];

export default function StudyPlanner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed' | 'weekly'
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[1]);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [priority, setPriority] = useState('medium');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await tasksService.getTasks(user?.id);
      setTasks(data || []);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setSubject(SUBJECT_OPTIONS[1]);
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime('14:00');
    setPriority('medium');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setSubject(task.subject);
    setScheduledDate(task.scheduled_date);
    setScheduledTime(task.scheduled_time || '14:00');
    setPriority(task.priority || 'medium');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }

    try {
      if (editingTask) {
        const updated = await tasksService.updateTask(editingTask.id, {
          title: title.trim(),
          subject,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          priority
        });
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      } else {
        const created = await tasksService.createTask(user?.id, {
          title: title.trim(),
          subject,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          priority
        });
        setTasks((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save task error:', err);
      setFormError(err.message || 'Failed to save task.');
    }
  };

  const handleToggleCompleted = async (task) => {
    try {
      const nextStatus = !task.is_completed;
      await tasksService.toggleTaskCompleted(task.id, nextStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextStatus } : t))
      );
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this study task?')) {
      try {
        await tasksService.deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch (e) {
        console.error('Delete error:', e);
      }
    }
  };

  // Filter Tasks
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || t.subject === selectedSubject;

    if (!matchesSearch || !matchesSubject) return false;

    if (activeTab === 'today') return t.scheduled_date === todayStr;
    if (activeTab === 'upcoming') return t.scheduled_date > todayStr && !t.is_completed;
    if (activeTab === 'completed') return t.is_completed;
    return true; // 'all'
  });

  // Calculate Next 7 Days for Weekly Schedule View
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-400">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Time & Syllabus Management</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Smart Study Planner</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Schedule revision blocks, prioritize high-credit subjects, and conquer your semester syllabus.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-transform active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-navy-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Tasks (${tasks.length})` },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'weekly', label: 'Weekly Board' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-purple text-white shadow-glow-purple/20'
                  : 'text-slate-400 hover:text-white bg-navy-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-navy-800 border border-navy-700 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-purple"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* WEEKLY BOARD VIEW */}
      {activeTab === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {daysOfWeek.map((day) => {
            const dayTasks = tasks.filter((t) => t.scheduled_date === day.dateStr);
            const isToday = day.dateStr === todayStr;
            return (
              <div
                key={day.dateStr}
                className={`glass-panel rounded-2xl p-3 border flex flex-col min-h-[300px] ${
                  isToday ? 'border-brand-purple/60 bg-brand-purple/5' : 'border-navy-700/80'
                }`}
              >
                <div className="flex items-baseline justify-between pb-2 mb-2 border-b border-navy-700/60">
                  <div>
                    <span className="text-xs font-bold text-white uppercase">{day.dayName}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {day.month} {day.dayNumber}
                    </span>
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-brand-purple text-white">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-6">No tasks</p>
                  ) : (
                    dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-2 rounded-xl border text-xs ${
                          t.is_completed
                            ? 'bg-navy-900/40 border-navy-800 text-slate-500'
                            : 'bg-navy-800/80 border-navy-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="checkbox"
                            checked={t.is_completed}
                            onChange={() => handleToggleCompleted(t)}
                            className="w-3.5 h-3.5 rounded text-brand-purple bg-navy-900 border-navy-600 focus:ring-brand-purple"
                          />
                          <span
                            className={`text-[9px] font-bold uppercase px-1 rounded ${
                              t.priority === 'high'
                                ? 'text-rose-400 bg-rose-500/10'
                                : t.priority === 'medium'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-slate-400'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <p
                          className={`font-semibold mt-1 truncate ${
                            t.is_completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {t.title}
                        </p>
                        <p className="text-[10px] text-brand-purple-light truncate">{t.subject}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STANDARD LIST VIEW */
        <div className="glass-panel rounded-2xl border border-navy-700/80 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-300">No study tasks found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery || selectedSubject !== 'All Subjects'
                  ? 'Try adjusting your filters or search keywords'
                  : 'Add your first revision task to start organizing your schedule!'}
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold shadow-glow-purple"
              >
                <Plus className="w-3.5 h-3.5" /> Create Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-navy-700/60">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    task.is_completed
                      ? 'bg-navy-950/40 text-slate-500'
                      : 'hover:bg-navy-800/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleCompleted(task)}
                      className="w-4 h-4 rounded text-brand-purple bg-navy-900 border-navy-600 focus:ring-brand-purple mt-0.5 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.is_completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20 text-[11px] font-medium">
                          {task.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {task.scheduled_date}
                        </span>
                        {task.scheduled_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.scheduled_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {task.priority || 'Normal'}
                    </span>

                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-750 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700/80 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-700/60 flex items-center justify-between bg-navy-950/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-brand-purple" />
                <span>{editingTask ? 'Edit Study Task' : 'Add New Study Task'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Binary Search Trees & AVL Rotations"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                >
                  {SUBJECT_OPTIONS.filter((s) => s !== 'All Subjects').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Low', color: 'text-slate-300' },
                    { id: 'medium', label: 'Medium', color: 'text-amber-400' },
                    { id: 'high', label: 'High', color: 'text-rose-400' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        priority === p.id
                          ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                          : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-750'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold shadow-glow-purple"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
