import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Calendar, CalendarClock, GraduationCap, X } from 'lucide-react';
import { useGradence } from '../context/GradenceContext';
import { extractTextFromPdf } from '../utils/pdfParser';
import { parseAcademicCalendar } from '../services/ai';
import { AcademicEvent } from '../types';

interface AcademicCalendarScreenProps {
  onBack: () => void;
}

export default function AcademicCalendarScreen({ onBack }: AcademicCalendarScreenProps) {
  const { profile, academicEvents, saveAcademicEvents } = useGradence();
  const [isUploading, setIsUploading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (!profile?.groqApiKey) {
      setError('Please enter your Groq API Key in Settings to use the AI Academic Calendar Parser.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setLoadingText('Extracting raw text from PDF locally...');

    try {
      // 1. Extract text using local pdfjs
      const rawText = await extractTextFromPdf(file);
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Could not extract any text from the PDF. It might be scanned images.");
      }

      setLoadingText('Connecting to Groq AI to structure academic events...');
      
      // 2. Parse using AI
      const currentSem = profile?.currentSemester || 1;
      const parsedEvents = await parseAcademicCalendar(rawText, currentSem, profile.groqApiKey);
      
      if (!parsedEvents || parsedEvents.length === 0) {
        throw new Error("AI could not find any academic events applicable to your year.");
      }

      // Add IDs if missing and sort by date
      const completeEvents: AcademicEvent[] = parsedEvents.map(e => ({
        ...e,
        id: e.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 3. Save to Context
      await saveAcademicEvents(completeEvents);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsUploading(false);
      setLoadingText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearEvents = async () => {
    if (window.confirm("Are you sure you want to clear all academic events?")) {
      await saveAcademicEvents([]);
    }
  };

  // Group events by month
  const groupedEvents: { [key: string]: AcademicEvent[] } = {};
  academicEvents.forEach(evt => {
    const dateObj = new Date(evt.date);
    const month = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groupedEvents[month]) groupedEvents[month] = [];
    groupedEvents[month].push(evt);
  });

  return (
    <div id="academic-calendar-screen" className="space-y-8 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">AI TOOL</span>
          <h1 className="text-xl font-bold font-odoo-slant">
            <span className="!text-white">Academic</span> <span className="!text-college-yellow">Calendar</span>
          </h1>
        </div>
      </div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white">Smart Event Extraction</h3>
            <p className="text-sm text-neutral-400 mt-1 max-w-sm">
              Upload your college's PDF Academic Calendar. Our AI will extract all events specifically for <strong className="text-white">Year {Math.ceil((profile?.currentSemester || 1) / 2)}</strong> and schedule notifications automatically.
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-college-blue/20 border border-college-blue/30 items-center justify-center">
            <GraduationCap className="w-6 h-6 text-college-blue" />
          </div>
        </div>

        <input 
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full py-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
            isUploading 
              ? 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-70'
              : 'border-[#2A2A2A] hover:border-white hover:bg-neutral-900 cursor-pointer'
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-6 h-6 border-2 border-college-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-white mt-2">Processing Document</span>
              <span className="text-xs text-neutral-500 font-mono">{loadingText}</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-neutral-400" />
              <span className="text-sm font-bold text-white">Upload Calendar PDF</span>
              <span className="text-xs text-neutral-500 font-mono">Max 10MB • Text-based PDF required</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Your Timeline</h4>
          {academicEvents.length > 0 && (
            <button
              onClick={handleClearEvents}
              className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        {academicEvents.length === 0 ? (
          <div className="text-center py-12 bg-black/40 border border-neutral-900 rounded-[24px]">
            <CalendarClock className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <span className="text-sm text-neutral-500 font-medium">No academic events extracted yet.</span>
          </div>
        ) : (
          <div className="space-y-8 pl-1">
            {Object.keys(groupedEvents).map(month => (
              <div key={month} className="space-y-4">
                <span className="text-xs font-bold text-college-blue uppercase tracking-widest px-2">{month}</span>
                <div className="space-y-3">
                  {groupedEvents[month].map(evt => {
                    const d = new Date(evt.date);
                    const isPast = d < new Date(new Date().setHours(0,0,0,0));
                    
                    return (
                      <div key={evt.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isPast ? 'bg-black/20 border-neutral-900 opacity-60' : 'bg-[#0F0F10] border-[#2A2A2A] hover:border-neutral-700'}`}>
                        <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 !bg-black rounded-xl border border-neutral-800">
                          <span className="text-xs font-mono !text-college-yellow uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-lg font-bold !text-white leading-none mt-0.5">{d.getDate()}</span>
                        </div>
                        <div className="pt-1">
                          <h5 className={`text-sm font-bold ${isPast ? 'text-neutral-400 line-through' : 'text-white'}`}>{evt.title}</h5>
                          {evt.targetYear && (
                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800 mt-2 inline-block">
                              Year {evt.targetYear} Only
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
