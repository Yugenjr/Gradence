import { Calculator, CheckSquare, PieChart, Calendar, Hash, ArrowRight, Compass, Code, Map, Clock, FileText } from 'lucide-react';
import { ToolType } from '../types';

interface ToolsScreenProps {
  onSelectTool: (tool: ToolType) => void;
}

export default function ToolsScreen({ onSelectTool }: ToolsScreenProps) {
  const tools = [
    {
      id: 'cgpa' as ToolType,
      title: 'CGPA Calculator',
      subtitle: 'Analyze semesters, calculate SGPA & archive academic history',
      icon: Calculator,
    },
    {
      id: 'attendance' as ToolType,
      title: 'Attendance Tracker',
      subtitle: 'Manage subjects, compute skipped class margins & predict stats',
      icon: CheckSquare,
    },
    {
      id: 'gpa' as ToolType,
      title: 'Target GPA Predictor',
      subtitle: 'Forecast required future SGPAs to hit your dream target GPA',
      icon: PieChart,
    },
    {
      id: 'exam' as ToolType,
      title: 'Exam Planner',
      subtitle: 'Schedule upcoming assessments with smart priority countdowns',
      icon: Calendar,
    },
    {
      id: 'converter' as ToolType,
      title: 'Academic Converters',
      subtitle: 'Convert grades to points & calculate percentages instantly',
      icon: Hash,
    },
    {
      id: 'coding' as ToolType,
      title: 'Coding Profiles Tracker',
      subtitle: 'Monitor problem counts across LeetCode, Codeforces, GitHub and more',
      icon: Code,
    },
    {
      id: 'roadmaps' as ToolType,
      title: 'Roadmaps Manager',
      subtitle: 'Track and check off stages of your followed career learning paths',
      icon: Map,
    },
    {
      id: 'planner' as ToolType,
      title: 'OS Daily Planner',
      subtitle: 'Manage class schedules, daily habits checklists and target date countdowns',
      icon: Clock,
    },
    {
      id: 'events' as ToolType,
      title: 'Campus & External Events',
      subtitle: 'Browse internal Sri Eshwar events and external hackathons from Unstop',
      icon: Calendar,
    },
    {
      id: 'resume' as ToolType,
      title: 'Resume Builder',
      subtitle: 'Build, edit, and download a professional resume aligned with SECE standards',
      icon: FileText,
    }
  ];

  return (
    <div id="tools-screen" className="space-y-8 pb-4">
      <div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block flex items-center gap-1.5 bg-neutral-950 border border-neutral-900 rounded-full px-2.5 py-1 w-fit mb-1 shadow-inner">
          <Compass className="w-3.5 h-3.5 text-college-yellow" />
          SRI ESHWAR CAMPUS CORE
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
          Academic <span className="text-white font-odoo-slant">Tools</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          Precision offline calculators engineered to keep your grades aligned.
        </p>
      </div>

      {/* Grid of full width/large cards */}
      <div className="grid grid-cols-1 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="press-card bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5 text-left flex items-center justify-between gap-4 hover:border-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {tool.subtitle}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-5 bg-neutral-950 rounded-[24px] border border-neutral-900 flex items-center gap-3">
        <Compass className="w-4 h-4 text-neutral-500 shrink-0" />
        <p className="text-xs text-neutral-500 font-mono">
          All calculation logic is client-side. No network queries or latency.
        </p>
      </div>
    </div>
  );
}
