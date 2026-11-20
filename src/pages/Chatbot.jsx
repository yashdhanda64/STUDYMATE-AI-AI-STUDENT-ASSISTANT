import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { chatService } from '../services/supabase';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Code2,
  Calculator,
  Cpu,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  { id: 'Data Structures & Algorithms', label: 'DSA & Algorithms', icon: Code2 },
  { id: 'Operating Systems & Networks', label: 'OS & Networks', icon: Cpu },
  { id: 'Database Management Systems', label: 'DBMS & SQL', icon: Layers },
  { id: 'Engineering Mathematics', label: 'Mathematics', icon: Calculator },
  { id: 'Computer Science Core', label: 'CS Core', icon: BookOpen },
  { id: 'General Academic', label: 'General Academic', icon: Sparkles },
];

const SUGGESTED_PROMPTS = [
  {
    subject: 'Data Structures & Algorithms',
    prompt: 'Explain the working of Dijkstra’s Algorithm with time complexity $O((V+E) \\log V)$ and a short step-by-step example.'
  },
  {
    subject: 'Operating Systems & Networks',
    prompt: 'Explain the 4 Coffman conditions for Deadlock and how Deadlock Prevention differs from Deadlock Avoidance.'
  },
  {
    subject: 'Database Management Systems',
    prompt: 'What are ACID properties in DBMS? Explain Atomicity, Consistency, Isolation, and Durability with a bank transaction example.'
  },
  {
    subject: 'Engineering Mathematics',
    prompt: 'Explain Bayes’ Theorem, its mathematical formula $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$, and how it applies to machine learning.'
  }
];

export default function Chatbot() {
  const { user } = useAuth();
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].id);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Load chat history from Supabase / Local demo
  useEffect(() => {
    let mounted = true;
    async function fetchHistory() {
      try {
        const history = await chatService.getChatHistory(user?.id, subject);
        if (mounted) {
          if (history && history.length > 0) {
            setMessages(history);
          } else {
            // Default welcome message
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content: `👋 **Hello! I'm StudyMate AI, your dedicated academic study partner.**\n\nI specialize in university engineering, mathematics, computer science, and exam preparation. Ask me any conceptual question, request a proof, algorithm walkthrough, or viva/exam preparation breakdown.\n\n*Choose a suggested prompt below or type your question to begin!*`,
                created_at: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
      }
    }
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [user, subject]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isLoading) return;

    setError('');
    const userMsg = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text.trim(),
      subject,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      chatService.saveChatMessage(user?.id, {
        subject,
        role: 'user',
        content: userMsg.content
      }).catch(e => console.warn('Chat DB save notice:', e));

      // Call serverless API with context history
      const historyContext = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await apiService.sendChatMessage(userMsg.content, subject, historyContext);

      const botReply = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'No response generated.',
        subject,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botReply]);

      // Save assistant response to database
      chatService.saveChatMessage(user?.id, {
        subject,
        role: 'assistant',
        content: botReply.content
      }).catch(e => console.warn('Chat DB save notice:', e));

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to reach AI tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm(`Clear chat history for "${subject}"?`)) {
      try {
        await chatService.clearChatHistory(user?.id, subject);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Chat history cleared. What would you like to learn in **${subject}** today?`,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error('Clear chat error:', err);
      }
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] glass-panel rounded-2xl border border-navy-700/80 overflow-hidden">
      {/* Top Controls: Subject Selection & Actions */}
      <div className="p-3.5 border-b border-navy-700/80 bg-navy-950/60 flex flex-wrap items-center justify-between gap-3">
        {/* Subject Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {SUBJECT_OPTIONS.map((s) => {
            const Icon = s.icon;
            const isSelected = subject === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple/20'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:text-slate-200 hover:bg-navy-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-navy-700 text-xs font-medium transition-colors"
          title="Clear current conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shrink-0 shadow-glow-purple/20 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group rounded-2xl px-4 py-3.5 text-sm max-w-[85%] md:max-w-[75%] border transition-all ${
                  isUser
                    ? 'bg-brand-purple text-white border-brand-purple/40 shadow-sm rounded-tr-sm'
                    : 'bg-navy-800/90 text-slate-200 border-navy-700 shadow-md rounded-tl-sm'
                }`}
              >
                {/* Copy button on hover */}
                <button
                  onClick={() => handleCopy(msg.content, index)}
                  className={`absolute top-2 right-2 p-1 rounded-md transition-opacity ${
                    isUser
                      ? 'text-white/70 hover:text-white opacity-0 group-hover:opacity-100'
                      : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 bg-navy-700/60'
                  }`}
                  title="Copy message text"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <div className="prose prose-invert prose-sm max-w-none leading-relaxed break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    isUser ? 'text-white/60' : 'text-slate-500'
                  }`}
                >
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-navy-700 border border-navy-600 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs uppercase mt-1">
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shrink-0 shadow-glow-purple/20">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-navy-800/90 border border-navy-700 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-brand-purple animate-spin" />
              <span>StudyMate AI is analyzing academic materials...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Questions (shown if message count is small) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-navy-950/40 border-t border-navy-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Suggested University Academic Questions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSubject(item.subject);
                  handleSendMessage(item.prompt);
                }}
                className="text-left p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-800 border border-navy-700/80 hover:border-brand-purple/40 text-xs text-slate-300 hover:text-white transition-all line-clamp-2"
              >
                <span className="text-brand-purple-light font-medium block text-[10px] uppercase">
                  {item.subject}
                </span>
                {item.prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box Footer */}
      <div className="p-4 bg-navy-900 border-t border-navy-700/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask any question about ${subject} (e.g. proof, algorithm, code, concepts)...`}
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple placeholder:text-slate-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white font-medium shadow-glow-purple disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-2 text-[10px] text-center text-slate-500">
          StudyMate AI provides educational explanations powered by Gemini. Always cross-verify with your course syllabus.
        </p>
      </div>
    </div>
  );
}
