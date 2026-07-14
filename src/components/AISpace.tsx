import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Semester, AttendanceSubject, RoadmapStage } from '../types';
import { askGroq, ChatMessage, calculateHeuristicScore, extractScore } from '../services/ai';
import { useGradence } from '../context/GradenceContext';
import {
  Sparkles,
  Send,
  UserCheck,
  BookOpen,
  Compass,
  FileText,
  User,
  Zap,
  Map,
  Copy,
  Check
} from 'lucide-react';
import ATSScorer from './ATSScorer';

interface AISpaceProps {
  profile: UserProfile;
  semesters: Semester[];
  attendanceSubjects: AttendanceSubject[];
  onNavigateToTool?: (tool: any) => void;
}

function parseInline(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={idx} className="font-extrabold text-white">{part}</strong>;
    }
    return part;
  });
}

function parseMarkdown(text: string) {
  if (!text) return null;
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, idx) => {
        if (line.trim().startsWith('### ')) {
          return <h3 key={idx} className="text-xs font-bold text-white mt-3 mb-1">{parseInline(line.replace('### ', ''))}</h3>;
        }
        if (line.trim().startsWith('#### ')) {
          return <h4 key={idx} className="text-[11px] font-bold text-white mt-2 mb-1">{parseInline(line.replace('#### ', ''))}</h4>;
        }
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return <li key={idx} className="ml-4 list-disc text-neutral-300 my-0.5">{parseInline(line.substring(2))}</li>;
        }
        return <p key={idx} className="min-h-[1em]">{parseInline(line)}</p>;
      })}
    </div>
  );
}

export default function AISpace({ profile, semesters, attendanceSubjects, onNavigateToTool }: AISpaceProps) {
  const { roadmaps, saveRoadmaps } = useGradence();
  const [activeModule, setActiveModule] = useState<'chat' | 'placement' | 'career' | 'ats'>('chat');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello, **${profile.name}**! I am your Gradence AI Academic OS Assistant. I'm connected to the Groq Cloud API. Ask me anything about your current semesters, study guidance, or career preparation!` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && (lastMessage.role === 'user' || isLoading)) {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isLoading]);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyWholeChat = () => {
    const formattedChat = chatHistory
      .map(msg => {
        const sender = msg.role === 'user' ? 'Student' : 'Gradence AI';
        return `[${sender}]:\n${msg.content}\n`;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(formattedChat)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy chat: ', err);
      });
  };

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopySingleMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
      });
  };

  const [copiedPlacement, setCopiedPlacement] = useState(false);
  const handleCopyPlacementFeedback = () => {
    let header = 'Placement OS Feedback';
    if (placementTab === 'skills') header = 'Skills Alignment Compatibility Feedback';
    else if (placementTab === 'project') header = 'Project Roadmap & Tech Stack Feedback';
    else if (placementTab === 'resume') header = 'Resume Audit Feedback';

    const scoreString = placementTab === 'resume' ? ` (Score: ${placementScore}/100)` : '';
    const textToCopy = `${header}${scoreString}\n\n${placementFeedback}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedPlacement(true);
        setTimeout(() => setCopiedPlacement(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const [copiedRoadmap, setCopiedRoadmap] = useState(false);
  const handleCopyRoadmap = () => {
    const textToCopy = `AI Career Roadmap - ${careerGoal}\n\n${roadmapResult}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedRoadmap(true);
        setTimeout(() => setCopiedRoadmap(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy roadmap: ', err);
      });
  };

  // Resume & Placement states
  const [resumeText, setResumeText] = useState('');
  const [placementScore, setPlacementScore] = useState<number | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState('');
  const [placementTab, setPlacementTab] = useState<'skills' | 'project' | 'resume'>('skills');

  // Custom Roadmap states
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [roadmapResult, setRoadmapResult] = useState('');

  const handleFollowRoadmap = () => {
    try {
      const activeCount = roadmaps.filter(rm => !rm.isCompleted).length;
      if (activeCount >= 4) {
        alert('Focus limit reached! You can track at most 4 active roadmaps simultaneously. Complete or delete an existing active roadmap before following a new one.');
        return;
      }

      // Parse stages dynamically from roadmapResult
      const lines = roadmapResult.split('\n');
      const parsedStages: RoadmapStage[] = [];
      let currentParent: RoadmapStage | null = null;
      let stageCount = 1;
      let subCount = 1;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isHeader = trimmed.startsWith('#');
        const isNumbered = /^\d+\.\s+/.test(trimmed);
        const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');

        if (isHeader || isNumbered) {
          let name = trimmed
            .replace(/^#+\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/\*\*?/g, '')
            .trim();

          if (name.endsWith(':')) {
            name = name.slice(0, -1).trim();
          }

          const lowerName = name.toLowerCase();
          if (
            lowerName === 'skill roadmap' ||
            lowerName === 'skills roadmap' ||
            lowerName === 'action plan' ||
            lowerName === 'career roadmap' ||
            lowerName === 'roadmap'
          ) {
            continue;
          }

          if (name.length > 2 && name.length < 120) {
            currentParent = {
              id: `st-${stageCount++}`,
              name: name,
              completed: false,
              subStages: []
            };
            parsedStages.push(currentParent);
          }
        } else if (isBullet && currentParent) {
          const subName = trimmed
            .replace(/^[\*\-\s]+/, '')
            .replace(/\*\*?/g, '')
            .trim();

          if (subName.length > 2 && subName.length < 200) {
            currentParent.subStages = currentParent.subStages || [];
            currentParent.subStages.push({
              id: `${currentParent.id}-sub-${subCount++}`,
              name: subName,
              completed: false
            });
          }
        }
      }

      const finalStages = parsedStages.length > 0 ? parsedStages : [
        { id: 'st-1', name: 'Stage 1: Foundation (Study core syntax, frameworks, and certification paths)', completed: false },
        { id: 'st-2', name: 'Stage 2: Project Build (Deploy full-stack REST API and Docker containerization)', completed: false },
        { id: 'st-3', name: 'Stage 3: Interview Ready (Solve 50 coding problems and validate resume parameters)', completed: false },
      ];

      const newRm = {
        id: `rm-${Date.now()}`,
        title: careerGoal || 'Custom Specialist',
        targetRole: careerGoal,
        stages: finalStages,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };

      const updated = [...roadmaps, newRm];
      saveRoadmaps(updated);
      if (onNavigateToTool) {
        onNavigateToTool('roadmaps');
      } else {
        alert(`Now following: "${careerGoal}". You can check off its stages under Tools > Roadmaps Manager.`);
      }
    } catch (e) {
      console.error('Follow failed', e);
    }
  };

  // Local storage api key check
  const apiKey = profile.groqApiKey || localStorage.getItem('gradence_groq_api_key') || '';

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setUserInput('');
    setIsLoading(true);

    // Build context
    const contextPrompt = `
      Current Student Context:
      Name: ${profile.name}
      University: ${profile.university}
      Semester: ${profile.currentSemester}
      GPA Scale: ${profile.gpaScale}
      Current Semesters Data: ${JSON.stringify(semesters)}
      Current Attendance Data: ${JSON.stringify(attendanceSubjects)}
    `;

    const messagesToSend: ChatMessage[] = [
      { role: 'system', content: `You are the Gradence AI Assistant. Keep answers concise, highly structured, and styled with markdown. ${contextPrompt}` },
      ...updatedHistory
    ];

    const response = await askGroq(messagesToSend, apiKey);
    setChatHistory([...updatedHistory, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleAnalyzePlacement = async () => {
    if (!resumeText.trim()) return;
    setIsLoading(true);

    let systemPrompt = '';
    if (placementTab === 'skills') {
      systemPrompt = `You are the Gradence Career & Placement Assistant.
Analyze the student's technical skills list for placement readiness and alignment with tier-1 placement companies.
Identify matching industry-relevant roles (e.g., Frontend Developer, Backend Developer, Fullstack) and sector compatibility.
Specify critical complementary skills they should study to pair with these.
Keep the response extremely brief, clear, and structured using markdown (maximum 120-150 words).

IMPORTANT: You MUST evaluate the completeness and alignment of the input to calculate a realistic compatibility score between 0 and 100.
- If the input is extremely short, generic, invalid, or meaningless (such as just a single character, number, symbol, or gibberish), the score MUST be 0.
- For valid queries, return a realistic score reflecting alignment.
Include this score on a separate line at the very end of your response in the exact format: "SCORE: X" where X is the integer score (e.g., SCORE: 75). Do not include any text after this.`;
    } else if (placementTab === 'project') {
      systemPrompt = `You are the Gradence Project Architectural Mentor.
Analyze the user's project idea.
Recommend a modern, industry-standard tech stack (Frontend, Backend, Database, DevOps).
Provide a structured 3-phase development roadmap (e.g., Phase 1: Database & API Setup, Phase 2: Frontend Integration, Phase 3: Optimizations & Deployment).
Detail how building this project fits resume expectations and alignment with premium placement companies.
Keep the response extremely brief, clear, and structured using markdown (maximum 120-150 words).

IMPORTANT: You MUST evaluate the complexity and industry relevance of the project to calculate a realistic implementation score between 0 and 100.
- If the input is extremely short, generic, invalid, or meaningless (such as just a single character, number, symbol, or gibberish), the score MUST be 0.
- For valid queries, return a realistic score reflecting complexity.
Include this score on a separate line at the very end of your response in the exact format: "SCORE: X" where X is the integer score (e.g., SCORE: 75). Do not include any text after this.`;
    } else {
      systemPrompt = `You are the Gradence Resume Audit Expert.
Audit the provided student resume points or project experience details.
Identify structural formatting gaps, missing tech metrics (e.g., performance speedups, user capacity, scaling stats), or generic phrasing.
Provide a clear, 2-step actionable revision plan with concrete rewrite advice.
Keep the response extremely brief, clear, and structured using markdown (maximum 120-150 words).

IMPORTANT: You MUST evaluate the completeness and impact of the resume points to calculate a realistic resume score between 0 and 100.
- If the input is extremely short, generic, invalid, or meaningless (such as just a single character, number, symbol, or gibberish), the score MUST be 0.
- For valid queries, return a realistic score reflecting quality.
Include this score on a separate line at the very end of your response in the exact format: "SCORE: X" where X is the integer score (e.g., SCORE: 75). Do not include any text after this.`;
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `PlacementTab: ${placementTab}\nInput: ${resumeText}\nUniversity: ${profile.university}`
      }
    ];

    const response = await askGroq(messages, apiKey);

    // Extract dynamic score
    let parsedScore = extractScore(response);
    if (parsedScore === 75 && !response.includes('75')) {
      parsedScore = calculateHeuristicScore(resumeText);
    }

    // Clean SCORE prefix from display text
    const cleanFeedback = response.replace(/\bSCORE:\s*\d+\b/g, '').trim();

    setPlacementFeedback(cleanFeedback);
    setPlacementScore(parsedScore);
    setIsLoading(false);
  };

  const handleGenerateRoadmap = async () => {
    setIsLoading(true);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert career advisor and technical mentor. Generate a highly detailed, deep, and comprehensive step-by-step career certification and skill roadmap based on the student\'s target role. The roadmap must be extremely thorough and structured. Provide a deep dive into: 1. Core languages & fundamentals (with concepts). 2. Advanced frameworks & tools. 3. Database design & management. 4. DevOps, cloud architecture, and containerization. 5. System design principles (caching, message queues, microservices) relevant to this role. 6. Industry-respected certifications (e.g. AWS, GCP, Associate Developer, etc.) that will boost their credentials. 7. A concrete Action Plan with projects & interview prep. Structure your response with clear headings (using ### or ####) for each phase or stage (e.g. "Phase 1: ...", "Stage 2: ..."), followed by bullet points detailing specific skills and certifications. Make it deep, extensive, and actionable!'
      },
      {
        role: 'user',
        content: `Target Role: ${careerGoal}. Current Semester: ${profile.currentSemester}`
      }
    ];

    const response = await askGroq(messages, apiKey);
    setRoadmapResult(response);
    setIsLoading(false);
  };

  // Helper calculations for Digital Twin / Academic Health
  const calculateCGPA = () => {
    if (semesters.length === 0) return 0.0;
    const totalSGPACredits = semesters.reduce((sum, sem) => sum + (sem.sgpa * sem.totalCredits), 0);
    const totalCredits = semesters.reduce((sum, sem) => sum + sem.totalCredits, 0);
    return totalCredits === 0 ? 0.0 : parseFloat((totalSGPACredits / totalCredits).toFixed(2));
  };
  const currentCGPA = calculateCGPA();
  const healthScore = Math.min(100, Math.round((currentCGPA / profile.gpaScale) * 100));

  return (
    <div id="ai-space" className="space-y-8 pb-4">
      {/* Top Banner */}
      <div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block flex items-center gap-1.5 bg-neutral-950 border border-neutral-900 rounded-full px-2.5 py-1 w-fit mb-1 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-college-yellow" />
          SRI ESHWAR INTELLIGENCE NODE
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
          Gradence <span className="text-white font-odoo-slant">Intelligence</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          Real-time LLM reasoning powered by Groq Llama-3.3-70B.
        </p>
      </div>

      {/* Digital Twin Widget */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
              STUDENT DIGITAL TWIN
            </span>
            <span className="text-[10px] font-mono text-neutral-500">LIVE SYNCED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-neutral-900">
              <span className="text-[10px] font-mono text-neutral-500 block uppercase">ACADEMIC HEALTH</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">{healthScore}%</span>
              <div className="w-full bg-neutral-900 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full" style={{ width: `${healthScore}%` }} />
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-neutral-900">
              <span className="text-[10px] font-mono text-neutral-500 block uppercase">CAREER MOMENTUM</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {placementScore ? `${placementScore}%` : '65%'}
              </span>
              <div className="w-full bg-neutral-900 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full" style={{ width: `${placementScore || 65}%` }} />
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-neutral-900">
              <span className="text-[10px] font-mono text-neutral-500 block uppercase">SEMESTER SUCCESS INDEX</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">91.4%</span>
              <div className="w-full bg-neutral-900 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full" style={{ width: '91.4%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Selector tabs */}
      <div className="flex bg-[#121213] border border-[#2A2A2A] rounded-2xl p-1 gap-1">
        {[
          { id: 'chat', label: 'AI Workspace', icon: BookOpen },
          { id: 'placement', label: 'Placement OS', icon: UserCheck },
          { id: 'career', label: 'Career Roadmaps', icon: Compass },
          { id: 'ats', label: 'ATS Score', icon: Sparkles },
        ].map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${isActive ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Content */}
      <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] min-h-[400px] flex flex-col overflow-hidden">

        {/* Chat / AI Assistant Module */}
        {activeModule === 'chat' && (
          <div className="flex flex-col p-6">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                AI Chat Assistant
              </span>
              {chatHistory.length > 1 && (
                <button
                  onClick={handleCopyWholeChat}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-white cursor-pointer transition-all"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copySuccess ? 'Copied!' : 'Copy Chat'}
                </button>
              )}
            </div>
            <div ref={messagesContainerRef} className="h-[380px] overflow-y-auto space-y-4 pr-2 scrollbar-none">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white text-black'
                    }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-[20px] text-xs leading-relaxed relative group ${msg.role === 'user' ? 'bg-white text-black' : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                    }`}>
                    <div className="whitespace-pre-line pr-5">{parseMarkdown(msg.content)}</div>
                    <button
                      onClick={() => handleCopySingleMessage(msg.content, idx)}
                      className={`absolute top-2 right-2 p-1 border border-transparent cursor-pointer ${
                        msg.role === 'user' ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                      title="Copy message"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-4 rounded-[20px] bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                    Groq LLM is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-neutral-800 pt-4 mt-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI Study Mentor: 'How do I raise my current CGPA?' or 'Summarize Master Theorem'"
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 bg-white hover:bg-neutral-200 text-black rounded-xl flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Placement Readiness Module */}
        {activeModule === 'placement' && (() => {
          const tabConfig = {
            skills: {
              title: "SKILLS ALIGNMENT COMPATIBILITY",
              desc: "Paste your technical skills or stack below to calculate your alignment with premium placement companies.",
              placeholder: "e.g., React, Node.js, SQL, TypeScript, Docker, Python...",
              btnLabel: "Calculate Skills Alignment",
              scoreLabel: "COMPATIBILITY SCORE"
            },
            project: {
              title: "PROJECT ROADMAP & ARCHITECTURE",
              desc: "Paste your project ideas or requirements below to generate a step-by-step development roadmap and tech stack.",
              placeholder: "e.g., A collaborative real-time code editing platform with chat rooms and shared workspaces...",
              btnLabel: "Generate Development Roadmap",
              scoreLabel: "COMPLEXITY SCORE"
            },
            resume: {
              title: "RESUME AUDIT & METRICS CHECK",
              desc: "Paste your resume bullet points or project accomplishment details to audit for impact, phrasing, and metrics.",
              placeholder: "e.g., Developed the task planner backend with Node/Express. Configured authentication. Sped up DB calls...",
              btnLabel: "Audit Resume Points",
              scoreLabel: "RESUME STRENGTH SCORE"
            }
          }[placementTab];

          return (
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">PLACEMENT & PROJECT OS</h3>
                  <p className="text-xs text-neutral-400 mt-1">Select an audit tool below to analyze your readiness.</p>
                </div>

                {/* Sub-pill Navigator */}
                <div className="flex bg-neutral-950 border border-neutral-900 rounded-xl p-0.5 gap-0.5 max-w-md shrink-0">
                  {[
                    { id: 'skills', label: 'Skills Alignment' },
                    { id: 'project', label: 'Project Roadmap' },
                    { id: 'resume', label: 'Resume Audit' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setPlacementTab(tab.id as any);
                        setPlacementFeedback('');
                        setPlacementScore(null);
                        setResumeText('');
                      }}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                        placementTab === tab.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-900 pt-4">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                  {tabConfig.title}
                </span>
                <p className="text-xs text-neutral-400 mb-4">{tabConfig.desc}</p>

                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={tabConfig.placeholder}
                  className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-neutral-600"
                />
              </div>

              <button
                onClick={handleAnalyzePlacement}
                disabled={isLoading || !resumeText.trim()}
                className="w-full py-3.5 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {tabConfig.btnLabel}
              </button>

              {placementFeedback && (
                <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                      Audit Feedback
                    </span>
                    <button
                      onClick={handleCopyPlacementFeedback}
                      className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-white cursor-pointer transition-all"
                    >
                      {copiedPlacement ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPlacement ? 'Copied!' : 'Copy Results'}
                    </button>
                  </div>

                  {placementTab === 'resume' && (
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <span className="text-[10px] font-mono text-neutral-400">{tabConfig.scoreLabel}</span>
                      <span className="text-lg font-bold font-mono text-white">{placementScore}/100</span>
                    </div>
                  )}
                  <div className="text-xs leading-relaxed text-neutral-300 pt-1">
                    {parseMarkdown(placementFeedback)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Career OS Module */}
        {activeModule === 'career' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">AI CAREER ROADMAP GENERATOR</h3>
              <p className="text-xs text-neutral-400 mt-1">Select your domain, and the AI Mentor will construct specialized certification & higher study planning guidelines.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. AWS Cloud Architect, Machine Learning Engineer"
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={handleGenerateRoadmap}
                className="px-4 py-3 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 cursor-pointer"
              >
                Draft Roadmap
              </button>
            </div>

            {isLoading && !roadmapResult && (
              <div className="text-center py-8 text-xs text-neutral-500 font-mono">
                Compiling certifications and learning objectives...
              </div>
            )}

            {roadmapResult && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Roadmap Details
                  </span>
                  <button
                    onClick={handleCopyRoadmap}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-white cursor-pointer transition-all"
                  >
                    {copiedRoadmap ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedRoadmap ? 'Copied!' : 'Copy Roadmap'}
                  </button>
                </div>
                <div className="bg-black/40 border border-neutral-800 rounded-2xl p-5 text-xs text-neutral-300 leading-relaxed">
                  {parseMarkdown(roadmapResult)}
                </div>
                <button
                  onClick={handleFollowRoadmap}
                  className="w-full py-3.5 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 cursor-pointer"
                >
                  <Map className="w-4 h-4" />
                  Follow this Roadmap
                </button>
              </div>
            )}
          </div>
        )}


        {/* ATS Scorer Module */}
        {activeModule === 'ats' && (
          <div className="p-4">
            <ATSScorer apiKey={apiKey} />
          </div>
        )}

      </div>
    </div>
  );
}
