import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { flashcardsService } from '../services/supabase';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Shuffle,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';

const SUBJECT_LIST = [
  'All Subjects',
  'Data Structures & Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Engineering Mathematics',
  'General Revision'
];

export default function Flashcards() {
  const { user } = useAuth();
  const location = useLocation();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [genTopic, setGenTopic] = useState(location.state?.topic || 'Operating Systems Deadlocks');
  const [genSubject, setGenSubject] = useState(location.state?.subject || SUBJECT_LIST[2]);
  const [genCount, setGenCount] = useState(6);
  const [genNotes, setGenNotes] = useState(location.state?.notes || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Manual Add Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualQ, setManualQ] = useState('');
  const [manualA, setManualA] = useState('');
  const [manualDeck, setManualDeck] = useState('Quick Revision Deck');
  const [manualSubject, setManualSubject] = useState(SUBJECT_LIST[1]);

  useEffect(() => {
    loadFlashcards();
    if (location.state?.topic) {
      setIsAiModalOpen(true);
    }
  }, [user]);

  const loadFlashcards = async () => {
    try {
      const data = await flashcardsService.getFlashcards(user?.id);
      setCards(data || []);
    } catch (e) {
      console.error('Failed to load flashcards:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(
    (c) => selectedSubject === 'All Subjects' || c.subject === selectedSubject
  );

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleToggleMastered = async (card) => {
    try {
      const nextMastered = !card.is_mastered;
      await flashcardsService.toggleMastered(card.id, nextMastered);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, is_mastered: nextMastered } : c))
      );
    } catch (e) {
      console.error('Toggle mastered error:', e);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Delete this flashcard?')) {
      try {
        await flashcardsService.deleteFlashcard(cardId);
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        if (currentIndex >= filteredCards.length - 1) {
          setCurrentIndex(0);
        }
      } catch (e) {
        console.error('Delete card error:', e);
      }
    }
  };

  const handleGenerateWithAI = async (e) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      setModalError('Please specify a topic.');
      return;
    }

    setModalError('');
    setIsGenerating(true);

    try {
      const data = await apiService.generateFlashcards({
        topic: genTopic.trim(),
        subject: genSubject,
        count: genCount,
        notes: genNotes.trim()
      });

      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error('No flashcards generated. Please try a different topic.');
      }

      const formattedCards = data.flashcards.map((c) => ({
        deck_title: data.deckTitle || `${genTopic} Deck`,
        subject: genSubject,
        question: c.question,
        answer: c.answer,
        is_mastered: false
      }));

      const saved = await flashcardsService.saveFlashcards(user?.id, formattedCards);
      setCards((prev) => [...saved, ...prev]);
      setIsAiModalOpen(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('AI Flashcard generation error:', err);
      setModalError(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!manualQ.trim() || !manualA.trim()) return;

    try {
      const cardObj = {
        deck_title: manualDeck.trim() || 'Core Revision',
        subject: manualSubject,
        question: manualQ.trim(),
        answer: manualA.trim(),
        is_mastered: false
      };

      const saved = await flashcardsService.saveFlashcards(user?.id, [cardObj]);
      setCards((prev) => [...saved, ...prev]);
      setIsManualModalOpen(false);
      setManualQ('');
      setManualA('');
    } catch (e) {
      console.error('Manual card save error:', e);
    }
  };

  const masteredCount = filteredCards.filter((c) => c.is_mastered).length;
  const masteryPercentage = filteredCards.length > 0 ? Math.round((masteredCount / filteredCards.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Recall & Spaced Repetition</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">AI Flashcard Revision</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Accelerate memory retention before semester exams. Flip through high-yield question & answer cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brand-purple-light" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Subject Filter & Mastery Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-navy-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {SUBJECT_LIST.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
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

        {/* Mastery Pill */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-xs font-bold text-white">
              Mastered: {masteredCount} / {filteredCards.length}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              {masteryPercentage}% Recall Readiness
            </span>
          </div>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-navy-700"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FLASHCARD STUDY VIEW */}
      {filteredCards.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-navy-700/80">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No flashcards in this subject</p>
          <p className="text-xs text-slate-500 mt-1">
            Generate a set of flashcards using Google Gemini AI or write your own.
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-glow-purple"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate Deck with AI
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Deck Metadata & Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-brand-purple-light uppercase">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20 text-[10px] font-bold">
                {currentCard.subject}
              </span>
              <span className="text-slate-500">• {currentCard.deck_title}</span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full h-80 sm:h-96 cursor-pointer select-none perspective-1000"
          >
            <div
              className={`w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT (QUESTION) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-8 glass-panel border border-brand-purple/30 shadow-2xl flex flex-col justify-between backface-hidden bg-gradient-to-br from-navy-900 via-navy-850 to-brand-purple/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purple-light font-bold text-[10px] uppercase tracking-wider border border-brand-purple/30">
                    Question
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-brand-purple" /> Click to flip
                  </span>
                </div>

                <div className="my-auto text-center px-4">
                  <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                    {currentCard.question}
                  </p>
                </div>

                <div className="text-center text-[11px] text-slate-500">
                  Tap anywhere on the card to reveal the answer
                </div>
              </div>

              {/* BACK (ANSWER) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl p-8 glass-panel border border-brand-blue/30 shadow-2xl flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-navy-900 via-navy-850 to-brand-blue/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                    Answer & Explanation
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-brand-blue" /> Click to flip
                  </span>
                </div>

                <div className="my-auto text-center px-4 overflow-y-auto max-h-52">
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-700/60">
                  <span className="text-[10px] text-slate-400">
                    {currentCard.is_mastered ? '⭐ Mastered' : '⏳ Needs practice'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(currentCard.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 text-xs"
                  >
                    Delete card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Prev / Mastered / Next */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => handleToggleMastered(currentCard)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                currentCard.is_mastered
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-navy-800 text-slate-300 border-navy-700 hover:border-emerald-500/40'
              }`}
            >
              {currentCard.is_mastered ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mastered</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Mark as Mastered</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold flex items-center gap-2 shadow-glow-purple transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI GENERATION MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700/80 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-700/60 flex items-center justify-between bg-navy-950/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                <span>Generate Flashcards with Gemini</span>
              </h3>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateWithAI} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                >
                  {SUBJECT_LIST.filter((s) => s !== 'All Subjects').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic or Concept
                </label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Operating Systems Paging & Segmentation"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number of Cards
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 10].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGenCount(c)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        genCount === c
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'bg-navy-800 text-slate-300 border-navy-700'
                      }`}
                    >
                      {c} Cards
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes Excerpt (Optional)
                </label>
                <textarea
                  rows={3}
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="Paste lecture notes or textbook summary to formulate flashcards directly from your syllabus..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini is Crafting Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Flashcards Deck</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL CARD CREATION MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700/80 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-700/60 flex items-center justify-between bg-navy-950/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-purple" />
                <span>Create Flashcard Manually</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple"
                >
                  {SUBJECT_LIST.filter((s) => s !== 'All Subjects').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Front (Question / Prompt)
                </label>
                <textarea
                  rows={2}
                  required
                  value={manualQ}
                  onChange={(e) => setManualQ(e.target.value)}
                  placeholder="e.g. What is the Master Theorem condition for T(n) = 2T(n/2) + O(n)?"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Back (Answer)
                </label>
                <textarea
                  rows={4}
                  required
                  value={manualA}
                  onChange={(e) => setManualA(e.target.value)}
                  placeholder="e.g. Case 2: Since f(n) = Theta(n^(log_b a)), T(n) = Theta(n log n)."
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-xs shadow-glow-purple"
              >
                Add Flashcard to Deck
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
