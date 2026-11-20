import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { apiService } from '../services/api';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  RefreshCw,
  HelpCircle,
  Layers,
  FileCode,
  BookOpen
} from 'lucide-react';

export default function PDFSummarizer() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [extractedData, setExtractedData] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'keyPoints' | 'questions' | 'raw'
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selected);
      setError('');
      setSummaryResult(null);
      setExtractedData(null);
    }
  };

  const handleExtractAndSummarize = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setError('');
    setIsExtracting(true);
    setExtractionProgress(10);

    try {
      // Step 1: Extract text using PDF.js
      const extraction = await extractTextFromPDF(file, ({ progress }) => {
        setExtractionProgress(progress);
      });

      setExtractedData(extraction);
      setIsExtracting(false);
      setIsSummarizing(true);

      // Step 2: Call serverless summarize endpoint
      const result = await apiService.summarizeDocument(
        extraction.text,
        file.name,
        subject
      );

      setSummaryResult(result);
    } catch (err) {
      console.error('Extraction/Summarization error:', err);
      setError(err.message || 'Failed to process and summarize this PDF.');
    } finally {
      setIsExtracting(false);
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    const fullText = `STUDYMATE AI SUMMARY: ${file?.name || 'Document'}\nSubject: ${subject}\n\n${summaryResult.summary}\n\nKEY TAKEAWAYS:\n${summaryResult.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || ''}\n\nEXAM QUESTIONS:\n${summaryResult.questions?.map((q, i) => `Q${i + 1}: ${q.q}\nA: ${q.a}`).join('\n\n') || ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    if (!summaryResult) return;
    const markdownContent = `# StudyMate AI Summary: ${file?.name || 'Notes'}\n**Subject:** ${subject}\n**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n${summaryResult.summary}\n\n## 🔑 Key Revision Takeaways\n${summaryResult.keyPoints?.map((p) => `- ${p}`).join('\n') || ''}\n\n## ❓ Important Exam & Viva Questions\n${summaryResult.questions?.map((q, i) => `### Q${i + 1}. ${q.q}\n**Answer:** ${q.a}`).join('\n\n') || ''}\n`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(file?.name || 'notes').replace(/\.pdf$/i, '')}_summary.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateQuizFromNotes = () => {
    navigate('/quiz', {
      state: {
        subject,
        topic: file?.name?.replace(/\.pdf$/i, '') || 'Uploaded Document Notes',
        studyNotes: extractedData?.text?.slice(0, 5000) || summaryResult?.summary || ''
      }
    });
  };

  const handleCreateFlashcardsFromNotes = () => {
    navigate('/flashcards', {
      state: {
        subject,
        topic: file?.name?.replace(/\.pdf$/i, '') || 'PDF Lecture Revision',
        notes: summaryResult?.keyPoints?.join('\n') || extractedData?.text?.slice(0, 4000) || ''
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-blue-light">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">PDF Notes Summarizer</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Upload lecture notes, research slides, or textbooks. PDF.js extracts text in your browser, and Gemini generates structured exam summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-800 border border-navy-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-brand-purple"
          >
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="DBMS">DBMS & Databases</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Mathematics">Engineering Mathematics</option>
            <option value="General Study">General Academic Study</option>
          </select>
        </div>
      </div>

      {/* Upload Box */}
      <div className="glass-panel rounded-2xl p-6 border border-navy-700/80">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) {
              setFile(dropped);
              setSummaryResult(null);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            file
              ? 'border-brand-purple/60 bg-brand-purple/5'
              : 'border-navy-700 hover:border-brand-purple/40 bg-navy-900/50 hover:bg-navy-900/80'
          }`}
        >
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light shadow-glow-purple/20">
              <Upload className="w-7 h-7" />
            </div>

            {file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
                <label
                  htmlFor="pdf-upload"
                  className="mt-2 inline-block text-xs text-brand-purple-light hover:underline cursor-pointer"
                >
                  Choose a different file
                </label>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your lecture PDF notes here, or{' '}
                  <label
                    htmlFor="pdf-upload"
                    className="text-brand-purple-light underline cursor-pointer hover:text-white"
                  >
                    browse files
                  </label>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports college PDFs, lecture presentations, and text handouts up to 15MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Progress */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isExtracting && `Extracting text with PDF.js (${extractionProgress}%)...`}
            {isSummarizing && 'Gemini AI is analyzing concepts, key formulas, and exam questions...'}
          </div>

          <button
            onClick={handleExtractAndSummarize}
            disabled={!file || isExtracting || isSummarizing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white text-xs font-bold shadow-glow-purple flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtracting || isSummarizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Summarize Notes with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {(isExtracting || isSummarizing) && (
          <div className="mt-4 w-full bg-navy-800 rounded-full h-2 overflow-hidden border border-navy-700">
            <div
              className="bg-gradient-to-r from-brand-purple to-brand-blue h-2 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: isExtracting ? `${extractionProgress}%` : '85%' }}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Summary Results View */}
      {summaryResult && (
        <div className="glass-panel rounded-2xl border border-navy-700/80 overflow-hidden space-y-0">
          {/* Result Action Bar */}
          <div className="p-4 bg-navy-900 border-b border-navy-700/80 flex flex-wrap items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-brand-purple text-white shadow-glow-purple/20'
                    : 'text-slate-400 hover:text-white bg-navy-800'
                }`}
              >
                Executive Summary
              </button>
              <button
                onClick={() => setActiveTab('keyPoints')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'keyPoints'
                    ? 'bg-brand-purple text-white shadow-glow-purple/20'
                    : 'text-slate-400 hover:text-white bg-navy-800'
                }`}
              >
                Key Takeaways ({summaryResult.keyPoints?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-brand-purple text-white shadow-glow-purple/20'
                    : 'text-slate-400 hover:text-white bg-navy-800'
                }`}
              >
                Exam & Viva Q&A ({summaryResult.questions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-brand-purple text-white'
                    : 'text-slate-400 hover:text-white bg-navy-800'
                }`}
              >
                Extracted Text
              </button>
            </div>

            {/* Utility Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 text-xs font-medium transition-colors"
                title="Copy Summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 text-xs font-medium transition-colors"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* Content Pane */}
          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summaryResult.summary}
                </ReactMarkdown>
              </div>
            )}

            {activeTab === 'keyPoints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  High-Yield Revision Points:
                </h3>
                {summaryResult.keyPoints?.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-navy-800/70 border border-navy-700/80 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Important University Examination / Viva Questions:
                </h3>
                {summaryResult.questions?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-navy-800/80 border border-navy-700 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30">
                        Q{idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{item.q}</h4>
                    </div>
                    <div className="pl-8 pt-1 text-xs text-slate-300 leading-relaxed bg-navy-900/60 p-3 rounded-lg border border-navy-800">
                      <span className="font-semibold text-brand-blue-light block mb-1">
                        Model Answer:
                      </span>
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'raw' && (
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 max-h-96 overflow-y-auto font-mono text-xs text-slate-400 whitespace-pre-wrap">
                {extractedData?.text || 'No raw text available.'}
              </div>
            )}
          </div>

          {/* Bottom Direct Study Accelerators */}
          <div className="p-4 bg-navy-950/80 border-t border-navy-700/80 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              ⚡ Accelerate Revision: Convert this document directly into study resources.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateQuizFromNotes}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Generate Quiz from this PDF</span>
              </button>
              <button
                onClick={handleCreateFlashcardsFromNotes}
                className="px-4 py-2 rounded-xl bg-brand-purple/20 text-brand-purple-light hover:bg-brand-purple/30 border border-brand-purple/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Create Flashcards Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
