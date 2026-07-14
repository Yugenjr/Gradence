import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceSubject } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, PlusCircle, Check } from 'lucide-react';

interface AttendanceTrackerProps {
  savedSubjects: AttendanceSubject[];
  onSaveSubjects: (subjects: AttendanceSubject[]) => void;
  onBack: () => void;
}

export default function AttendanceTracker({ savedSubjects, onSaveSubjects, onBack }: AttendanceTrackerProps) {
  const [subjects, setSubjects] = useState<AttendanceSubject[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTarget, setNewSubTarget] = useState(75);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [simAttended, setSimAttended] = useState<number>(0);
  const [simMissed, setSimMissed] = useState<number>(0);

  // Initialize from saved state or load defaults
  useEffect(() => {
    setSubjects(savedSubjects);
    if (savedSubjects && savedSubjects.length > 0) {
      setSelectedSubId(prev => savedSubjects.some(s => s.id === prev) ? prev : savedSubjects[0].id);
    } else {
      setSelectedSubId('');
    }
  }, [savedSubjects]);

  useEffect(() => {
    setSimAttended(0);
    setSimMissed(0);
  }, [selectedSubId]);

  const activeSubject = subjects.find(s => s.id === selectedSubId) || subjects[0] || null;

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const newSub: AttendanceSubject = {
      id: `att-${Date.now()}`,
      name: newSubName.trim(),
      present: 0,
      total: 0,
      requiredPercentage: newSubTarget,
      history: []
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    setSelectedSubId(newSub.id);
    onSaveSubjects(updated);
    setNewSubName('');
    setIsAddFormOpen(false);
  };

  const handleRemoveSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    if (selectedSubId === id && updated.length > 0) {
      setSelectedSubId(updated[0].id);
    }
    onSaveSubjects(updated);
  };

  const handleUpdateAttendance = (id: string, isPresent: boolean, isIncrement: boolean) => {
    const updated = subjects.map(s => {
      if (s.id === id) {
        let p = s.present;
        let t = s.total;
        let hist = [...(s.history || [])];

        // Sanitize pre-existing invalid states where present > total
        if (t < p) {
          t = p;
        }

        if (isIncrement) {
          t += 1;
          if (isPresent) {
            p += 1;
            hist.push('present');
          } else {
            hist.push('absent');
          }
        } else {
          // Decrement (reverting/deleting last logged state)
          if (isPresent) {
            // Revert/minus an Attended class
            if (p > 0) {
              p -= 1;
              t -= 1;
              const lastIdx = hist.lastIndexOf('present');
              if (lastIdx !== -1) {
                hist.splice(lastIdx, 1);
              }
            }
          } else {
            // Revert/minus a Missed class
            if (t > p) {
              t -= 1;
              const lastIdx = hist.lastIndexOf('absent');
              if (lastIdx !== -1) {
                hist.splice(lastIdx, 1);
              }
            }
          }
        }

        // Final safeguard to ensure total >= present and no negative values
        if (p < 0) p = 0;
        if (t < p) t = p;

        return { ...s, present: p, total: t, history: hist };
      }
      return s;
    });
    setSubjects(updated);
    onSaveSubjects(updated);
  };

  const handleSetTarget = (id: string, target: number) => {
    const updated = subjects.map(s => {
      if (s.id === id) {
        return { ...s, requiredPercentage: target };
      }
      return s;
    });
    setSubjects(updated);
    onSaveSubjects(updated);
  };

  // Compute live calculations
  const calculateAttendanceStats = (sub: AttendanceSubject | null) => {
    if (!sub) return null;
    const { present, total, requiredPercentage } = sub;
    const currentPercent = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0.0;
    const targetFraction = requiredPercentage / 100;

    let skipCount = 0;
    let attendCount = 0;

    // Projection calculation: can skip
    if (currentPercent >= requiredPercentage && total > 0) {
      let tempPresent = present;
      let tempTotal = total;
      while (tempTotal > 0) {
        const nextPercent = (tempPresent / (tempTotal + 1)) * 100;
        if (nextPercent >= requiredPercentage) {
          skipCount += 1;
          tempTotal += 1;
        } else {
          break;
        }
      }
    }

    // Projection calculation: need to attend consecutively
    if (currentPercent < requiredPercentage) {
      let tempPresent = present;
      let tempTotal = total;
      while (true) {
        tempPresent += 1;
        tempTotal += 1;
        const nextPercent = (tempPresent / tempTotal) * 100;
        attendCount += 1;
        if (nextPercent >= requiredPercentage) {
          break;
        }
        if (attendCount > 100) break; // Avoid infinite loops
      }
    }

    // Next class projection
    const ifAttendPercent = total > 0 ? parseFloat((((present + 1) / (total + 1)) * 100).toFixed(1)) : 100.0;
    const ifSkipPercent = total > 0 ? parseFloat(((present / (total + 1)) * 100).toFixed(1)) : 0.0;

    return {
      percentage: currentPercent,
      skipCount,
      attendCount,
      ifAttendPercent,
      ifSkipPercent,
      isSafe: currentPercent >= requiredPercentage
    };
  };

  const stats = calculateAttendanceStats(activeSubject);

  const simulatedPresent = activeSubject ? activeSubject.present + simAttended : 0;
  const simulatedTotal = (activeSubject && (simAttended > 0 || simMissed > 0)) ? activeSubject.total + simAttended + simMissed : 0;
  const simulatedPercent = simulatedTotal > 0 ? parseFloat(((simulatedPresent / simulatedTotal) * 105).toFixed(1)) : 0;
  // Cap at 100%
  const simulatedPercentCapped = Math.min(100, simulatedTotal > 0 ? parseFloat(((simulatedPresent / simulatedTotal) * 100).toFixed(1)) : 0);

  // SVG parameters for standard circular progress
  const radius = 70;
  const strokeWidth = 10;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = stats ? circumference - (Math.min(stats.percentage, 100) / 100) * circumference : circumference;

  return (
    <div id="attendance-tracker" className="space-y-8 pb-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
          <h1 className="text-xl font-bold text-white font-odoo-slant">Attendance Tracker</h1>
        </div>
      </div>

      {/* Two Column Layout: Subject list & Main active subject details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest px-1">
              SUBJECT WORKSPACE
            </span>
            <button 
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="text-xs text-white hover:underline flex items-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5" /> TRACK NEW
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isAddFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-4 space-y-4 overflow-hidden"
              >
                <div>
                  <label htmlFor="new-sub-name" className="text-[10px] font-mono text-neutral-400 uppercase">SUBJECT NAME</label>
                  <input
                    id="new-sub-name"
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full mt-1 bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="new-sub-target" className="text-[10px] font-mono text-neutral-400 uppercase">REQUIRED TARGET ({newSubTarget}%)</label>
                  <input
                    id="new-sub-target"
                    type="range"
                    min="50"
                    max="100"
                    value={newSubTarget}
                    onChange={(e) => setNewSubTarget(parseInt(e.target.value))}
                    className="w-full accent-white bg-neutral-800 h-1 rounded-lg mt-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubject}
                    className="flex-1 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200"
                  >
                    Track Subject
                  </button>
                  <button
                    onClick={() => setIsAddFormOpen(false)}
                    className="py-2 px-3 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl hover:bg-neutral-900"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {subjects.map((sub) => {
              const isSelected = selectedSubId === sub.id;
              const subPercent = sub.total > 0 ? parseFloat(((sub.present / sub.total) * 100).toFixed(1)) : 0;
              const isBelow = subPercent < sub.requiredPercentage && sub.total > 0;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`press-card p-4 rounded-[24px] border text-left flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected 
                      ? 'border-white bg-[#171717]' 
                      : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                  }`}
                >
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-white truncate">{sub.name}</h4>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      {sub.present}/{sub.total} classes • Target {sub.requiredPercentage}%
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold font-mono block ${isBelow ? 'text-neutral-400 line-through decoration-white/40' : 'text-white'}`}>
                      {sub.total > 0 ? `${subPercent}%` : '—'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSubject(sub.id);
                      }}
                      className="text-[9px] font-mono text-neutral-600 hover:text-white mt-1 uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Active subject insights */}
        <div className="lg:col-span-2">
          {activeSubject ? (
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6">
              
              {/* Active Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{activeSubject.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Live calculation workspace. Press +/- to log attendance.
                  </p>
                </div>

                {/* Live +/- class actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateAttendance(activeSubject.id, false, true)}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    + Missed
                  </button>
                  <button
                    onClick={() => handleUpdateAttendance(activeSubject.id, true, true)}
                    className="px-4 py-1.5 bg-white hover:bg-neutral-200 rounded-xl text-xs font-semibold text-black"
                  >
                    + Attended
                  </button>
                </div>
              </div>

              {/* Large circular attendance tracker & Stats block */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-4">
                {/* SVG circular indicator */}
                <div className="relative flex items-center justify-center select-none shrink-0">
                  <svg className="w-40 h-40 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#262626"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#ffffff"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Inside central text */}
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold tracking-tight font-sans block">
                      {activeSubject.total > 0 ? `${stats?.percentage}%` : '—'}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mt-0.5">
                      ATTENDANCE
                    </span>
                  </div>
                </div>

                {/* Mini metrics columns */}
                <div className="space-y-4 w-full sm:max-w-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 p-3.5 rounded-2xl border border-neutral-900">
                      <span className="text-[9px] font-mono text-neutral-400 block uppercase">Classes Logged</span>
                      <span className="text-lg font-bold font-mono text-white mt-0.5 block">{activeSubject.total}</span>
                    </div>
                    <div className="bg-black/30 p-3.5 rounded-2xl border border-neutral-900">
                      <span className="text-[9px] font-mono text-neutral-400 block uppercase">Classes Attended</span>
                      <span className="text-lg font-bold font-mono text-white mt-0.5 block">{activeSubject.present}</span>
                    </div>
                  </div>

                  {/* Range target slider */}
                  <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-neutral-900">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>REQUIRED TARGET</span>
                      <span className="text-white font-bold">{activeSubject.requiredPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={activeSubject.requiredPercentage}
                      onChange={(e) => handleSetTarget(activeSubject.id, parseInt(e.target.value))}
                      className="w-full accent-white bg-neutral-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Live projection result card */}
              {stats && activeSubject && activeSubject.total > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4"
                >
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    PROJECTION ENGINE
                  </span>

                  {stats.isSafe ? (
                    <div className="flex items-start gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Attendance Optimal</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                          You are currently meeting your target of <span className="text-white font-semibold">{activeSubject.requiredPercentage}%</span>. You can skip the next <span className="text-white font-bold font-mono">{stats.skipCount}</span> classes consecutively without falling below requirements.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
                      <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Attendance Critical</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                          You are currently below target. You need to attend the next <span className="text-white font-bold font-mono">{stats.attendCount}</span> classes consecutively to reach your goal of <span className="text-white font-semibold">{activeSubject.requiredPercentage}%</span>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Future action projection metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Attend next class:</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">{stats.ifAttendPercent}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Skip next class:</span>
                      <span className="font-bold text-neutral-400 font-mono mt-0.5 block">{stats.ifSkipPercent}%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Interactive Attendance Rescue Engine Simulator */}
              {activeSubject && activeSubject.total > 0 && (
                <div className="bg-black/30 p-5 rounded-[24px] border border-neutral-900 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                      RESCUE ENGINE SIMULATOR
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      simulatedTotal > 0 && simulatedPercentCapped >= activeSubject.requiredPercentage
                        ? 'border-white text-white'
                        : 'border-neutral-850 text-neutral-500'
                    }`}>
                      {simulatedTotal > 0 ? `Simulated: ${simulatedPercentCapped}%` : 'No simulation'}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Test hypothetical future schedules to predict if they rescue your attendance requirements.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="sim-attended" className="text-[9px] font-mono text-neutral-500 uppercase">Will Attend</label>
                      <input
                        id="sim-attended"
                        type="number"
                        min="0"
                        value={simAttended || ''}
                        onChange={(e) => setSimAttended(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="0 classes"
                        className="w-full bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="sim-missed" className="text-[9px] font-mono text-neutral-500 uppercase">Will Miss</label>
                      <input
                        id="sim-missed"
                        type="number"
                        min="0"
                        value={simMissed || ''}
                        onChange={(e) => setSimMissed(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="0 classes"
                        className="w-full bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-medium"
                      />
                    </div>
                  </div>

                  {simulatedTotal > 0 && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      simulatedPercentCapped >= activeSubject.requiredPercentage
                        ? 'bg-neutral-900/40 border-neutral-800 text-neutral-200'
                        : 'bg-red-950/20 border-red-900/30 text-red-300'
                    }`}>
                      {simulatedPercentCapped >= activeSubject.requiredPercentage ? (
                        <span>✓ This schedule <strong>rescues</strong> your attendance! You will sit at <strong>{simulatedPercentCapped}%</strong> (above target {activeSubject.requiredPercentage}%).</span>
                      ) : (
                        <span>✗ Critical! This schedule leaves you at <strong>{simulatedPercentCapped}%</strong>, which is below your target of {activeSubject.requiredPercentage}%.</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Adjust class history manually */}
              {activeSubject && activeSubject.total > 0 && (
                <div className="flex justify-between items-center bg-black/10 p-4 rounded-2xl border border-neutral-900 text-xs">
                  <span className="text-neutral-400 font-mono">Manual logs adjustments</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateAttendance(activeSubject.id, false, false)}
                      className="px-2 py-1 border border-neutral-800 rounded-lg hover:border-neutral-600 hover:text-white"
                    >
                      - Missed
                    </button>
                    <button
                      onClick={() => handleUpdateAttendance(activeSubject.id, true, false)}
                      className="px-2 py-1 border border-neutral-800 rounded-lg hover:border-neutral-600 hover:text-white"
                    >
                      - Attended
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 bg-[#171717] border border-[#2A2A2A] rounded-[24px]">
              <span className="text-xs font-mono text-neutral-500 block uppercase">No subject active</span>
              <p className="text-sm text-neutral-400 mt-2">Track your first subject from the side menu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
