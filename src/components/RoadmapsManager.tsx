import { useState, useEffect } from 'react';
import { ArrowLeft, Map, CheckCircle2, Circle, Trash2, Calendar, Target, AlertTriangle } from 'lucide-react';
import { CareerRoadmap } from '../types';

interface RoadmapsManagerProps {
  onBack?: () => void;
}

export default function RoadmapsManager({ onBack }: RoadmapsManagerProps) {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gradence_followed_roadmaps');
    if (saved) {
      try {
        setRoadmaps(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse followed roadmaps', e);
      }
    }
  }, []);

  const saveRoadmaps = (updated: CareerRoadmap[]) => {
    setRoadmaps(updated);
    localStorage.setItem('gradence_followed_roadmaps', JSON.stringify(updated));
  };

  const handleToggleStage = (roadmapId: string, stageId: string) => {
    const updated = roadmaps.map(rm => {
      if (rm.id === roadmapId) {
        const nextStages = rm.stages.map(st => st.id === stageId ? { ...st, completed: !st.completed } : st);
        // Automatically check if all stages are completed
        const allDone = nextStages.every(st => st.completed);
        return { ...rm, stages: nextStages, isCompleted: allDone };
      }
      return rm;
    });
    saveRoadmaps(updated);
  };

  const handleToggleCompleted = (roadmapId: string) => {
    const updated = roadmaps.map(rm => {
      if (rm.id === roadmapId) {
        const nextVal = !rm.isCompleted;
        // If marking complete, check off all stages. If marking incomplete, uncheck them.
        const nextStages = rm.stages.map(st => ({ ...st, completed: nextVal }));
        return { ...rm, isCompleted: nextVal, stages: nextStages };
      }
      return rm;
    });
    saveRoadmaps(updated);
  };

  const handleDeleteRoadmap = (roadmapId: string) => {
    if (window.confirm('Delete this career roadmap from your tracker?')) {
      const updated = roadmaps.filter(rm => rm.id !== roadmapId);
      saveRoadmaps(updated);
    }
  };

  const activeCount = roadmaps.filter(rm => !rm.isCompleted).length;

  return (
    <div id="roadmaps-manager" className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block font-mono">CAREER PLANNER</span>
          <h1 className="text-xl font-bold text-white font-odoo-slant">Roadmaps Manager</h1>
        </div>
      </div>

      {/* Stats and limits widget */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">ACTIVE PATHS</span>
            <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
              {activeCount} <span className="text-xs text-neutral-500 font-normal">/ 4 max</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">COMPLETED PATHS</span>
            <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
              {roadmaps.filter(rm => rm.isCompleted).length}
            </span>
          </div>
        </div>
      </div>

      {/* Roadmap listing container */}
      <div className="space-y-6">
        {roadmaps.length === 0 ? (
          <div className="text-center py-16 bg-[#121213] border border-[#2A2A2A] rounded-[24px] space-y-3">
            <Map className="w-8 h-8 text-neutral-600 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white">No Followed Roadmaps</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Go to the <strong>AI Space &rarr; Career Roadmaps</strong> tab, type a target role to generate a path, and click follow!
              </p>
            </div>
          </div>
        ) : (
          roadmaps.map((rm) => {
            const completedStages = rm.stages.filter(s => s.completed).length;
            const totalStages = rm.stages.length;
            const percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

            return (
              <div 
                key={rm.id} 
                className={`border rounded-[24px] p-6 space-y-5 transition-all ${
                  rm.isCompleted 
                    ? 'bg-[#171717]/40 border-neutral-800' 
                    : 'bg-[#121213] border-[#2A2A2A]'
                }`}
              >
                {/* Info and delete actions */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{rm.title}</h3>
                      {rm.isCompleted && (
                        <span className="text-[10px] bg-white text-black font-semibold font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ FINISHED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      Target Role: {rm.targetRole} • Followed on {new Date(rm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteRoadmap(rm.id)}
                    className="text-neutral-500 hover:text-white p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-450">
                    <span>STAGE PROGRESSION</span>
                    <span>{percent}% ({completedStages}/{totalStages})</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-500 ease-out" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Stages checkpoints */}
                <div className="space-y-2.5 border-t border-neutral-900 pt-4">
                  {rm.stages.map((stage) => (
                    <div 
                      key={stage.id}
                      onClick={() => handleToggleStage(rm.id, stage.id)}
                      className="flex items-center gap-3 p-3 bg-black/40 border border-neutral-900 hover:border-neutral-700 rounded-xl cursor-pointer select-none transition-all"
                    >
                      <button className="text-neutral-500">
                        {stage.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`text-xs ${stage.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                        {stage.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fully complete checkoff toggle */}
                <div className="border-t border-neutral-900 pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">MANUAL ACTION</span>
                  <button
                    onClick={() => handleToggleCompleted(rm.id)}
                    className={`py-2 px-4 rounded-xl text-[10px] font-mono font-semibold transition-all ${
                      rm.isCompleted
                        ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    {rm.isCompleted ? 'Mark as Active' : 'Mark Fully Completed'}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
