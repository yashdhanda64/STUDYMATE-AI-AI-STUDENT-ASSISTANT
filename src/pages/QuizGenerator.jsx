import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { quizService } from '../services/supabase';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  History,
  AlertCircle,
  FileText
} from 'lucide-react';

const SUBJECT_LIST = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management Systems (DBMS)',
  'Computer Networks',
  'Engineering Mathematics & Discrete Math',
  'Software Engineering & OOP',
  'Artificial Intelligence & Machine Learning'
];

export default function QuizGenerator() {
  const { user } = useAuth();
  const location = useLocation();

  // Configuration Form State
  const [subject, setSubject] = useState(location.state?.subject || SUBJECT_LIST[0]);
  const [topic, setTopic] = useState(location.state?.topic || 'Binary Search Trees & Graphs');
  const [difficulty, setDifficulty] = useState('Medium'); // 'Easy' | 'Medium' | 'Hard'
  const [count, setCount] = useState(5);
  const [studyNotes, setStudyNotes] = useState(location.state?.studyNotes || '');

  // Quiz Execution State
  const [stage, setStage] = useState('config'); // 'config' | 'taking' | 'results'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);

  // History State
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await quizService.getQuizHistory(user?.id);
        setQuizHistory(history || []);
      } catch (e) {
        console.warn('Failed to load quiz history:', e);
      }
    }
    loadHistory();
  }, [user]);

  const handleStartQuiz = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await apiService.generateQuiz({
        subject,
        topic: topic.trim() || subject,
        difficulty,
        count,
        studyNotes: studyNotes.trim()
      });

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Received an empty quiz response. Please try again.');
      }

      setQuestions(data.questions);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setQuizStartTime(Date.now());
      setStage('taking');
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz questions with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    // Calculate Score
    let calculatedScore = 0;
    questions.forEach((q) => {
      const userChoice = selectedAnswers[q.id];
      if (userChoice === q.correctAnswer) {
        calculatedScore++;
      }
    });

    const elapsed = Math.round((Date.now() - (quizStartTime || Date.now())) / 1000);
    setTimeTakenSeconds(elapsed);

    // Save to Database
    try {
      const savedRecord = await quizService.saveQuizResult(user?.id, {
        subject,
        difficulty,
        score: calculatedScore,
        total_questions: questions.length,
        questions_data: questions.map((q) => ({
          ...q,
          userSelected: selectedAnswers[q.id]
        }))
      });
      setQuizHistory((prev) => [savedRecord, ...prev]);
    } catch (e) {
      console.warn('Failed to save quiz result:', e);
    }

    setStage('results');

    // Trigger celebratory confetti if passed well (>= 70%)
    if ((calculatedScore / questions.length) >= 0.7) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const currentQ = questions[currentIndex];
  const score = questions.reduce((acc, q) => (selectedAnswers[q.id] === q.correctAnswer ? acc + 1 : acc), 0);
  const scorePercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>AI Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">AI Quiz Generator</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Generate multiple-choice exams for any engineering topic. Practice active recall with instant answer explanations.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 text-xs font-semibold transition-colors self-start md:self-auto"
        >
          <History className="w-4 h-4 text-brand-purple-light" />
          <span>Past Quizzes ({quizHistory.length})</span>
        </button>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="glass-panel rounded-2xl p-6 border border-navy-700/80 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-brand-purple" />
              <span>Your Quiz History & Scores</span>
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {quizHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No previous quizzes saved yet. Complete a quiz to view your score history!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quizHistory.map((item) => {
                const pct = Math.round((item.score / (item.total_questions || 5)) * 100);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-navy-850 border border-navy-700/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[180px]">
                        {item.subject}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        <span className="capitalize">{item.difficulty}</span> •{' '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                        pct >= 80
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : pct >= 50
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {item.score}/{item.total_questions} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STAGE 1: CONFIGURATION FORM */}
      {stage === 'config' && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-navy-700/80 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-2">
            <h2 className="text-xl font-bold text-white">Configure Your Quiz</h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize subject, syllabus topic, and difficulty level
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-sm focus:outline-none focus:border-brand-purple"
              >
                {SUBJECT_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specific Topic or Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Graph Traversals, Paging & Segmentation, Relational Algebra"
                className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-sm focus:outline-none focus:border-brand-purple placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        difficulty === lvl
                          ? 'bg-cyan-500 text-navy-950 border-cyan-400 font-extrabold shadow-sm'
                          : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-750'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        count === cnt
                          ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple/20'
                          : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-750'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reference Material / Study Notes (Optional)
              </label>
              <textarea
                value={studyNotes}
                onChange={(e) => setStudyNotes(e.target.value)}
                rows={3}
                placeholder="Paste class notes, syllabus points, or textbook excerpts to generate a tailored quiz..."
                className="w-full px-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-purple placeholder:text-slate-500 resize-none"
              />
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-brand-purple to-brand-blue hover:from-cyan-400 hover:to-brand-blue-dark text-white font-bold text-sm shadow-glow-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI is Formulating Examination Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Start Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: TAKING THE QUIZ */}
      {stage === 'taking' && currentQ && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-navy-700/80 max-w-3xl mx-auto space-y-6">
          {/* Header Progress */}
          <div className="flex items-center justify-between pb-4 border-b border-navy-700/80 text-xs text-slate-400">
            <span className="font-semibold text-brand-purple-light uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                {difficulty}
              </span>
              <span>{subject}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-purple to-cyan-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* 4 Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              const optionLetters = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-4 rounded-xl text-left border flex items-center gap-3.5 transition-all ${
                    isSelected
                      ? 'bg-brand-purple/20 border-brand-purple text-white shadow-glow-purple/20'
                      : 'bg-navy-800/80 border-navy-700/80 text-slate-200 hover:bg-navy-750 hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-brand-purple text-white'
                        : 'bg-navy-700 text-slate-400'
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-navy-700/80">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: RESULTS & EXPLANATIONS */}
      {stage === 'results' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Score Header Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-navy-700/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-purple to-cyan-500 p-0.5 mx-auto flex items-center justify-center shadow-glow-purple">
              <div className="w-full h-full bg-navy-900 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quiz Results Completed
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                You Scored {score} out of {questions.length} ({scorePercentage}%)
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Subject: <span className="text-brand-purple-light font-semibold">{subject}</span> •
                Difficulty: <span className="capitalize">{difficulty}</span> • Time: {timeTakenSeconds}s
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentIndex(0);
                  setQuizStartTime(Date.now());
                  setStage('taking');
                }}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </button>

              <button
                onClick={() => setStage('config')}
                className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold flex items-center gap-2 shadow-glow-purple"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Another Quiz
              </button>
            </div>
          </div>

          {/* Question Explanations List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Detailed Question Analysis & Explanations:
            </h3>

            {questions.map((q, idx) => {
              const userSelected = selectedAnswers[q.id];
              const isCorrect = userSelected === q.correctAnswer;
              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-300">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-3">{q.question}</h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                    {q.options?.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctAnswer;
                      const isOptionSelected = optIdx === userSelected;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border ${
                            isOptionCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold'
                              : isOptionSelected && !isOptionCorrect
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 line-through'
                              : 'bg-navy-800/40 border-navy-750 text-slate-400'
                          }`}
                        >
                          <span className="font-bold mr-1.5">
                            {['A', 'B', 'C', 'D'][optIdx]}.
                          </span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-800 text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-brand-purple-light block mb-1">
                        Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
