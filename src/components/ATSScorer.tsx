import React, { useState } from 'react';
import { Sparkles, Loader, Upload } from 'lucide-react';
import { askGroq, ChatMessage } from '../services/ai';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface ATSScorerProps {
  apiKey: string;
}

interface ATSResult {
  score: number;
  matched: string[];
  missing: string[];
  tips: string[];
  summary: string;
}

function parseATSResponse(raw: string): ATSResult {
  const scoreMatch = raw.match(/ATS[_\s]?SCORE[:\s]+(\d+)/i) || raw.match(/SCORE[:\s]+(\d+)/i);
  const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 0;

  const matchedMatch = raw.match(/MATCHED[_\s]?KEYWORDS?[:\s]+([^\n]+(?:\n[-•*][^\n]+)*)/i);
  const missingMatch = raw.match(/MISSING[_\s]?KEYWORDS?[:\s]+([^\n]+(?:\n[-•*][^\n]+)*)/i);
  const tipsMatch = raw.match(/TIPS?[:\s]+([\s\S]+?)(?=\n[A-Z]{3,}:|$)/i);
  const summaryMatch = raw.match(/SUMMARY[:\s]+([^\n]+)/i);

  const parseList = (str: string | undefined) =>
    str ? str.split(/[\n,]/).map(s => s.replace(/^[-•*\s]+/, '').trim()).filter(Boolean) : [];

  return {
    score,
    matched: parseList(matchedMatch?.[1]),
    missing: parseList(missingMatch?.[1]),
    tips: parseList(tipsMatch?.[1]),
    summary: summaryMatch?.[1]?.trim() || '',
  };
}

export default function ATSScorer({ apiKey }: ATSScorerProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError(null);

    try {
      const fileType = file.type;
      
      if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || '');
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        setResumeText(text);
      } else if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          text += pageText + '\n';
        }
        setResumeText(text);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
      }
    } catch (err: any) {
      console.error('File reading failed', err);
      setUploadError(err.message || 'Failed to read file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) return;
    setLoading(true);
    setResult(null);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the student's resume against the job description and return EXACTLY in this format:

ATS SCORE: [0-100]
SUMMARY: [one line summary of match quality]
MATCHED KEYWORDS: [comma separated list of keywords found in both resume and JD]
MISSING KEYWORDS: [comma separated list of important JD keywords missing from resume]
TIPS:
- [tip 1]
- [tip 2]
- [tip 3]
- [tip 4]
- [tip 5]

Be strict and realistic. Score based on keyword match, skills alignment, and role fit.`,
      },
      {
        role: 'user',
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDesc}`,
      },
    ];

    const raw = await askGroq(messages, apiKey);
    setResult(parseATSResponse(raw));
    setLoading(false);
  };

  const scoreColor = (s: number) =>
    s >= 75 ? 'text-green-400' : s >= 50 ? 'text-college-yellow' : 'text-red-400';

  const scoreBg = (s: number) =>
    s >= 75 ? 'bg-green-400' : s >= 50 ? 'bg-college-yellow' : 'bg-red-400';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">ATS Score Analyzer</p>
        <p className="text-xs text-neutral-400 mt-0.5">Paste your resume & job description to get your ATS compatibility score.</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Your Resume Text</label>
            <label className="flex items-center gap-1.5 text-[10px] font-mono text-college-yellow hover:text-college-yellow-hover cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload PDF / TXT
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
          {uploadError && (
            <p className="text-[10px] font-mono text-red-500 mb-1">{uploadError}</p>
          )}
          {uploadingFile && (
            <p className="text-[10px] font-mono text-college-yellow animate-pulse mb-1">Extracting text from resume file...</p>
          )}
          <textarea
            rows={6}
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here or upload a file..."
            className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Job Description</label>
          <textarea
            rows={6}
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste the job description you're applying for..."
            className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !resumeText.trim() || !jobDesc.trim()}
        className="w-full py-3.5 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Analyzing...' : 'Analyze ATS Score'}
      </button>

      {result && (
        <div className="space-y-3">
          {/* Score card */}
          <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2A2A2A" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={result.score >= 75 ? '#4ade80' : result.score >= 50 ? '#f2c10f' : '#f87171'}
                  strokeWidth="3"
                  strokeDasharray={`${result.score} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold font-mono ${scoreColor(result.score)}`}>
                {result.score}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">ATS Score</p>
              <p className={`text-2xl font-bold font-mono ${scoreColor(result.score)}`}>{result.score}/100</p>
              {result.summary && <p className="text-xs text-neutral-400 mt-1">{result.summary}</p>}
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${scoreBg(result.score)}`} style={{ width: `${result.score}%` }} />
          </div>

          {/* Matched keywords */}
          {result.matched.length > 0 && (
            <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest font-bold">✓ Matched Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((kw, i) => (
                  <span key={i} className="text-sm font-semibold px-3.5 py-1.5 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {result.missing.length > 0 && (
            <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">✗ Missing Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((kw, i) => (
                  <span key={i} className="text-sm font-semibold px-3.5 py-1.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-mono text-college-yellow uppercase tracking-widest font-bold">Improvement Tips</p>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-neutral-300 flex gap-2">
                    <span className="text-college-yellow shrink-0">→</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
