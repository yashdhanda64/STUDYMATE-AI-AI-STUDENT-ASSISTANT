import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { notesService } from '../services/supabase';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Tag,
  Sparkles,
  FileText,
  Layers,
  X,
  Check,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';

const SUBJECT_LIST = [
  'All Subjects',
  'Data Structures & Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Engineering Mathematics',
  'Web Development & Cloud',
  'General Revision'
];

export default function Notes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_LIST[1]);
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    try {
      const data = await notesService.getNotes(user?.id);
      setNotes(data || []);
    } catch (e) {
      console.error('Failed to load notes:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setSubject(SUBJECT_LIST[1]);
    setContent('');
    setTagsInput('');
    setIsPinned(false);
    setPreviewMode(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject);
    setContent(note.content);
    setTagsInput(note.tags?.join(', ') || '');
    setIsPinned(Boolean(note.is_pinned));
    setPreviewMode(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Both title and content are required.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      if (editingNote) {
        const updated = await notesService.updateNote(editingNote.id, {
          title: title.trim(),
          subject,
          content: content.trim(),
          tags: tagsArray,
          is_pinned: isPinned
        });
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
      } else {
        const created = await notesService.createNote(user?.id, {
          title: title.trim(),
          subject,
          content: content.trim(),
          tags: tagsArray,
          is_pinned: isPinned
        });
        setNotes((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save note error:', err);
      setFormError(err.message || 'Failed to save note.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this study note?')) {
      try {
        await notesService.deleteNote(noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch (e) {
        console.error('Delete note error:', e);
      }
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const nextPin = !note.is_pinned;
      await notesService.updateNote(note.id, { is_pinned: nextPin });
      setNotes((prev) =>
        prev
          .map((n) => (n.id === note.id ? { ...n, is_pinned: nextPin } : n))
          .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      );
    } catch (e) {
      console.error('Pin toggle error:', e);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All Subjects' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Notes Manager</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Store, search, and pin rich Markdown revision notes. Backed by Supabase PostgreSQL for cloud sync.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-transform active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-navy-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Subject Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {SUBJECT_LIST.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-brand-purple text-white shadow-glow-purple/20'
                  : 'text-slate-400 hover:text-white bg-navy-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or tags..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-navy-700/80">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No notes found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || selectedSubject !== 'All Subjects'
              ? 'Try different search terms or clear subject filters.'
              : 'Create your first note to organize revision materials for your semester exams!'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold shadow-glow-purple"
          >
            <Plus className="w-3.5 h-3.5" /> Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                note.is_pinned
                  ? 'border-brand-purple/50 bg-brand-purple/5 shadow-glow-purple/10'
                  : 'border-navy-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                {/* Card Top: Subject & Pin */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30 truncate">
                    {note.subject}
                  </span>
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`p-1 rounded-lg transition-colors ${
                      note.is_pinned
                        ? 'text-brand-purple-light bg-brand-purple/20'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{note.title}</h3>

                {/* Markdown content preview */}
                <div className="text-xs text-slate-300 line-clamp-4 leading-relaxed prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.content}
                  </ReactMarkdown>
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {note.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-400 bg-navy-800 px-2 py-0.5 rounded-md border border-navy-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-navy-700/60 flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(note.updated_at || note.created_at).toLocaleDateString()}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate('/flashcards', {
                        state: {
                          subject: note.subject,
                          topic: note.title,
                          notes: note.content
                        }
                      })
                    }
                    className="p-1 text-slate-400 hover:text-brand-purple-light"
                    title="Generate Flashcards from this note"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-navy-900 border border-navy-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-navy-700/60 flex items-center justify-between bg-navy-950/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>{editingNote ? 'Edit Study Note' : 'Create Study Note'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master-Theorem Formula Breakdown"
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
                    {SUBJECT_LIST.filter((s) => s !== 'All Subjects').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Content (Markdown Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-xs text-brand-purple-light hover:underline flex items-center gap-1"
                  >
                    {previewMode ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{previewMode ? 'Edit Mode' : 'Markdown Preview'}</span>
                  </button>
                </div>

                {previewMode ? (
                  <div className="w-full h-64 p-4 rounded-xl bg-navy-950 border border-navy-700 overflow-y-auto prose prose-invert prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*No content to preview*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    rows={10}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write detailed revision notes, code blocks, or proofs... Supports Markdown tables, lists, and bold text."
                    className="w-full px-4 py-3 rounded-xl bg-navy-800 border border-navy-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-purple resize-none placeholder:text-slate-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Algorithms, ExamPrep, Viva"
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="pin-note"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-purple bg-navy-900 border-navy-600 focus:ring-brand-purple cursor-pointer"
                  />
                  <label htmlFor="pin-note" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Pin this note to the top of the board
                  </label>
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
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
