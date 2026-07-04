import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Semester, Exam, Activity, ToolType, Quote } from '../types';
import { 
  Calculator, 
  Calendar, 
  CheckSquare, 
  ChevronRight, 
  Flame, 
  GraduationCap, 
  Hash, 
  PieChart, 
  TrendingUp, 
  Compass,
  Clock
} from 'lucide-react';

interface HomeDashboardProps {
  profile: UserProfile;
  semesters: Semester[];
  exams: Exam[];
  activities: Activity[];
  onNavigateToTool: (tool: ToolType) => void;
  attendanceAvg: number;
}

const QUOTES: Quote[] = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" }
];

export default function HomeDashboard({ 
  profile, 
  semesters, 
  exams, 
  activities, 
  onNavigateToTool,
  attendanceAvg 
}: HomeDashboardProps) {
  const [greeting, setGreeting] = useState('Good Evening');
  const [quote, setQuote] = useState<Quote>(QUOTES[0]);

  const [habits, setHabits] = useState<{ id: string; name: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('gradence_habits');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'hab-1', name: 'Attend All Lectures', completed: false },
      { id: 'hab-2', name: 'Solve 1 Coding Challenge', completed: false },
      { id: 'hab-3', name: 'Revise Core Notes', completed: false }
    ];
  });

  const toggleHabit = (id: string) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    localStorage.setItem('gradence_habits', JSON.stringify(updated));
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Determine greeting based on current local time
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Pick a pseudo-random quote based on day
    const day = new Date().getDate();
    setQuote(QUOTES[day % QUOTES.length]);
  }, []);

  // Calculate current cumulative GPA
  const calculateCGPA = () => {
    if (semesters.length === 0) return 0.0;
    const totalSGPACredits = semesters.reduce((sum, sem) => sum + (sem.sgpa * sem.totalCredits), 0);
    const totalCredits = semesters.reduce((sum, sem) => sum + sem.totalCredits, 0);
    if (totalCredits === 0) return 0.0;
    return parseFloat((totalSGPACredits / totalCredits).toFixed(2));
  };

  const cgpa = calculateCGPA();

  // Find next upcoming exam
  const nextExam = exams.length > 0 ? exams[0] : null;

  return (
    <div id="home-dashboard" className="space-y-8 pb-4">
      {/* Header Profile Info */}
      <div className="flex justify-between items-start pt-4">
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
            WORKSPACE
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
            {greeting},<br />
            <span className="text-white font-odoo-slant">{profile.name}</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {profile.university} • Semester {profile.currentSemester}
          </p>
        </div>
        
        {/* Top visual accent */}
        <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#2A2A2A] flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white stroke-[1.5]" />
        </div>
      </div>

      {/* Large Premium Academic Overview Card */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
            ACADEMIC SUMMARY
          </div>

          {/* Grid layout for main stats */}
          <div className="grid grid-cols-2 gap-6 pt-2 border-b border-neutral-800 pb-6">
            {/* CGPA */}
            <div>
              <div className="text-3xl font-extrabold tracking-tight font-sans">
                {cgpa > 0 ? cgpa.toFixed(2) : '—'}
                <span className="text-xs text-neutral-500 font-mono font-normal ml-1">
                  / {profile.gpaScale === 10 ? '10.0' : '4.0'}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">Current CGPA</div>
            </div>

            {/* Attendance */}
            <div>
              <div className="text-3xl font-extrabold tracking-tight font-sans">
                {attendanceAvg > 0 ? `${attendanceAvg.toFixed(1)}%` : '—'}
              </div>
              <div className="text-xs text-neutral-400 mt-1">Attendance</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-b border-neutral-800 pb-6">
            {/* Upcoming Exam */}
            <div>
              <div className="text-sm font-semibold truncate text-white">
                {nextExam ? nextExam.subject : 'No exams scheduled'}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Upcoming Exam</div>
            </div>

            {/* Semester Progress */}
            <div>
              <div className="text-sm font-semibold text-white">
                Semester {profile.currentSemester}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Academic Status</div>
            </div>
          </div>

          {/* Digital Twin Core Metrics */}
          <div className="pt-6">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-3">
              DIGITAL TWIN TWIN ENGINE
            </span>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">ACADEMIC HEALTH</span>
                <span className="text-sm font-extrabold text-white mt-1 block">
                  {cgpa > 0 ? `${Math.round((cgpa / profile.gpaScale) * 100)}%` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">CAREER MOMENTUM</span>
                <span className="text-sm font-extrabold text-white mt-1 block">
                  {cgpa > 0 ? `${Math.round((cgpa / profile.gpaScale) * 92)}%` : '65%'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">ACADEMIC RISK</span>
                <span className={`text-[9px] font-bold uppercase mt-1 inline-block ${
                  attendanceAvg < 75 && attendanceAvg > 0 ? 'text-neutral-400 underline decoration-white' : 'text-white'
                }`}>
                  {attendanceAvg === 0 ? 'NOT SET' : attendanceAvg < 75 ? 'CRITICAL' : 'OPTIMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Life OS Widgets Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Timetable & Countdowns */}
        <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            TODAY'S TIMETABLE & COUNTDOWNS
          </span>
          <div className="space-y-3">
            {/* Default Class schedule */}
            <div className="p-3 bg-black/40 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white block">09:30 AM - Software Architecture</span>
                <span className="text-[10px] text-neutral-500 font-mono">Room 402 • Core Lecture</span>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-400">TODAY</span>
            </div>
            <div className="p-3 bg-black/40 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white block">11:15 AM - Cryptography Lab</span>
                <span className="text-[10px] text-neutral-500 font-mono">Lab 2A • Practical</span>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-400">TODAY</span>
            </div>

            {/* Dynamic Exam countdown */}
            {exams.map(exam => {
              const days = getDaysRemaining(exam.date);
              return (
                <div key={exam.id} className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{exam.subject} Exam</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Date: {exam.date}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    days <= 3 ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    {days === 0 ? 'TODAY' : `${days} DAYS LEFT`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit & Productivity Streak OS */}
        <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            PRODUCTIVITY & HABIT TRACKING
          </span>
          <div className="space-y-2.5">
            {habits.map(habit => (
              <div 
                key={habit.id} 
                onClick={() => toggleHabit(habit.id)}
                className="flex items-center gap-3 p-3 bg-black/40 border border-neutral-900 rounded-xl cursor-pointer hover:border-neutral-700 select-none transition-all"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  habit.completed ? 'bg-white border-white' : 'border-neutral-700'
                }`}>
                  {habit.completed && <div className="w-2 h-2 bg-black rounded-sm" />}
                </div>
                <span className={`text-xs ${habit.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                  {habit.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Title */}
      <div>
        <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
          QUICK TOOLS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'cgpa' as ToolType, label: 'CGPA Calc', icon: Calculator },
            { id: 'attendance' as ToolType, label: 'Attendance', icon: CheckSquare },
            { id: 'gpa' as ToolType, label: 'Target GPA', icon: PieChart },
            { id: 'exam' as ToolType, label: 'Exam Plan', icon: Calendar },
            { id: 'converter' as ToolType, label: 'Converters', icon: Hash }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigateToTool(action.id)}
                className="press-card bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-4 text-left flex flex-col justify-between h-28 hover:bg-[#1a1a1c] hover:border-neutral-700 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block truncate">
                    {action.label}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block mt-0.5">
                    Launch →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Activity & Quote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] p-6">
          <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4 flex justify-between items-center">
            <span>RECENT SYSTEM ACTIVITIES</span>
            <span className="text-[9px] text-neutral-500">REALTIME LOG</span>
          </h3>

          <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-neutral-600 font-mono">No recent activity found.</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b border-neutral-900 pb-3 last:border-b-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">{act.title}</span>
                    <span className="text-neutral-400 block mt-0.5">{act.detail}</span>
                    <span className="text-[9px] text-neutral-500 font-mono block mt-1">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Quote Section */}
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Flame className="w-24 h-24 text-white" />
          </div>

          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
              TODAY'S INTENT
            </span>
            <p className="text-sm font-medium italic text-white/90 mt-6 leading-relaxed">
              "{quote.text}"
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center border-t border-neutral-800 pt-4">
            <span className="text-xs font-mono text-neutral-400">— {quote.author}</span>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-mono text-neutral-400">
              STREAK: ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
