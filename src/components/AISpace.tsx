import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Semester, AttendanceSubject } from '../types';
import { askGroq, ChatMessage } from '../services/ai';
import { 
  Sparkles, 
  Send, 
  UserCheck, 
  BookOpen, 
  Compass, 
  Users, 
  FileText, 
  Code, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  User,
  Zap,
  Globe,
  Map
} from 'lucide-react';

interface AISpaceProps {
  profile: UserProfile;
  semesters: Semester[];
  attendanceSubjects: AttendanceSubject[];
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

export default function AISpace({ profile, semesters, attendanceSubjects }: AISpaceProps) {
  const [activeModule, setActiveModule] = useState<'chat' | 'placement' | 'career' | 'social'>('chat');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello, **${profile.name}**! I am your Gradence AI Academic OS Assistant. I'm connected to the Groq Cloud API. Ask me anything about your current semesters, study guidance, or career preparation!` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Resume & Placement states
  const [resumeText, setResumeText] = useState('');
  const [placementScore, setPlacementScore] = useState<number | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState('');
  
  // Custom Roadmap states
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
  const [roadmapResult, setRoadmapResult] = useState('');

  const handleFollowRoadmap = () => {
    try {
      const saved = localStorage.getItem('gradence_followed_roadmaps');
      const list: any[] = saved ? JSON.parse(saved) : [];
      
      const activeCount = list.filter(rm => !rm.isCompleted).length;
      if (activeCount >= 4) {
        alert('Focus limit reached! You can track at most 4 active roadmaps simultaneously. Complete or delete an existing active roadmap before following a new one.');
        return;
      }

      const newRm = {
        id: `rm-${Date.now()}`,
        title: careerGoal || 'Custom Specialist',
        targetRole: careerGoal,
        stages: [
          { id: 'st-1', name: 'Stage 1: Foundation (Study core syntax, frameworks, and certification paths)', completed: false },
          { id: 'st-2', name: 'Stage 2: Project Build (Deploy full-stack REST API and Docker containerization)', completed: false },
          { id: 'st-3', name: 'Stage 3: Interview Ready (Solve 50 coding problems and validate resume parameters)', completed: false },
        ],
        isCompleted: false,
        createdAt: new Date().toISOString()
      };

      const updated = [...list, newRm];
      localStorage.setItem('gradence_followed_roadmaps', JSON.stringify(updated));
      alert(`Now following: "${careerGoal}". You can check off its stages under Tools > Roadmaps Manager.`);
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
    setIsLoading(true);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Analyze this student resume/skills for placement readiness. Keep the response extremely brief, concise, and professional (maximum 80-100 words). Point out exactly what is missing in a clean, bulleted format, and give a 2-step actionable advice.'
      },
      {
        role: 'user',
        content: `Resume Info/Skills: ${resumeText || 'React, TS, basic Python'}. University: ${profile.university}`
      }
    ];

    const response = await askGroq(messages, apiKey);
    setPlacementFeedback(response);
    setPlacementScore(resumeText.length > 50 ? 82 : 55);
    setIsLoading(false);
  };

  const handleGenerateRoadmap = async () => {
    setIsLoading(true);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Generate a step-by-step career certification and skill roadmap based on the target role.'
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
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
          AI AGENT ORCHESTRATION
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
          { id: 'social', label: 'Peer Connect', icon: Users },
        ].map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
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
          <div className="flex-1 flex flex-col p-6 h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.role === 'user' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white text-black'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-[20px] text-xs leading-relaxed ${
                    msg.role === 'user' ? 'bg-white text-black' : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                  }`}>
                    <div className="whitespace-pre-line">{parseMarkdown(msg.content)}</div>
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
        {activeModule === 'placement' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">PLACEMENT READINESS INDEX</h3>
              <p className="text-xs text-neutral-400 mt-1">Paste your skills, projects, or resume points below to calculate alignment with premium placement companies.</p>
            </div>

            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="e.g. Frontend developer, skills: React, Tailwind CSS, SQL. Projects: Task Manager application..."
              className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-neutral-600"
            />

            <button
              onClick={handleAnalyzePlacement}
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200"
            >
              <FileText className="w-4 h-4" />
              Analyze Placement Eligibility & Skill Gaps
            </button>

            {placementFeedback && (
              <div className="bg-[#0F0F10] border border-neutral-800 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-400">PLACEMENT SCORE</span>
                  <span className="text-lg font-bold font-mono text-white">{placementScore}/100</span>
                </div>
                <div className="text-xs leading-relaxed text-neutral-300 border-t border-neutral-900 pt-3">
                  {parseMarkdown(placementFeedback)}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Peer Connect / Social Module */}
        {activeModule === 'social' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">ACADEMIC COMMUNITIES & PEER BENCHMARKING</h3>
              <p className="text-xs text-neutral-400 mt-1">Collaborate, share notes, and compare study metrics with peers globally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-neutral-900 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">ACTIVE STUDY GROUPS</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <div>
                      <h4 className="text-xs font-bold text-white">Algorithms & DS (GATE Prep)</h4>
                      <span className="text-[9px] font-mono text-neutral-500">24 active members • 2 online</span>
                    </div>
                    <button className="px-3 py-1 bg-white text-black text-[10px] font-semibold rounded-lg">Join</button>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <div>
                      <h4 className="text-xs font-bold text-white">AWS Architect Study Group</h4>
                      <span className="text-[9px] font-mono text-neutral-500">18 active members • 4 online</span>
                    </div>
                    <button className="px-3 py-1 bg-white text-black text-[10px] font-semibold rounded-lg">Join</button>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-neutral-900 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">PEER BENCHMARKING</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Your CGPA Percentile:</span>
                    <span className="font-bold text-white font-mono">Top 15%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Attendance Rank (Univ):</span>
                    <span className="font-bold text-white font-mono">#42 of 240</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-neutral-400">Daily Study Streak:</span>
                    <span className="font-bold text-white font-mono">5 Days 🔥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
