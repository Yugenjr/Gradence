import { useState, useEffect } from 'react';
import { ArrowLeft, Hash, Calculator, HelpCircle } from 'lucide-react';

interface ConverterProps {
  onBack: () => void;
}

type ConverterTab = 'gpa-percent' | 'grade-points' | 'credits';

export default function Converter({ onBack }: ConverterProps) {
  const [activeTab, setActiveTab] = useState<ConverterTab>('gpa-percent');

  // GPA ↔ Percentage state
  const [cgpaInput, setCgpaInput] = useState<string>('8.5');
  const [percentResult, setPercentResult] = useState<string>('');

  const [percentInput, setPercentInput] = useState<string>('80.75');
  const [cgpaResult, setCgpaResult] = useState<string>('');

  // Grade ↔ Points state
  const [selectedGrade, setSelectedGrade] = useState<string>('A+');
  const [scaleType, setScaleType] = useState<4 | 10>(10);
  const [pointsResult, setPointsResult] = useState<number>(9);

  // Credits Calculator state
  const [completedCreds, setCompletedCreds] = useState<string>('45');
  const [currentCgpa, setCurrentCgpa] = useState<string>('8.2');
  const [newCourseCredits, setNewCourseCredits] = useState<string>('4');
  const [expectedCourseGpa, setExpectedCourseGpa] = useState<string>('9.0');
  const [creditsGpaResult, setCreditsGpaResult] = useState<string>('');

  // Calculate GPA ↔ Percentage in real-time
  useEffect(() => {
    const cgpa = parseFloat(cgpaInput);
    if (!isNaN(cgpa) && cgpa >= 0 && cgpa <= 10) {
      // Standard formula: CGPA * 9.5 (or some custom formats, let's use the standard AICTE formula: (CGPA - 0.75) * 10 or CGPA * 9.5)
      // Let's provide a beautiful prompt-based calculation: Percentage = CGPA * 9.5
      setPercentResult((cgpa * 9.5).toFixed(1));
    } else {
      setPercentResult('—');
    }
  }, [cgpaInput]);

  useEffect(() => {
    const pct = parseFloat(percentInput);
    if (!isNaN(pct) && pct >= 0 && pct <= 100) {
      setCgpaResult((pct / 9.5).toFixed(2));
    } else {
      setCgpaResult('—');
    }
  }, [percentInput]);

  // Grade ↔ Points mapping in real-time
  useEffect(() => {
    if (scaleType === 10) {
      const mapping: Record<string, number> = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0
      };
      setPointsResult(mapping[selectedGrade] !== undefined ? mapping[selectedGrade] : 9);
    } else {
      const mapping: Record<string, number> = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
      };
      setPointsResult(mapping[selectedGrade] !== undefined ? mapping[selectedGrade] : 3.7);
    }
  }, [selectedGrade, scaleType]);

  // Credits Calculator calculations in real-time
  useEffect(() => {
    const compCred = parseFloat(completedCreds);
    const curGpa = parseFloat(currentCgpa);
    const newCred = parseFloat(newCourseCredits);
    const newGpa = parseFloat(expectedCourseGpa);

    if (!isNaN(compCred) && !isNaN(curGpa) && !isNaN(newCred) && !isNaN(newGpa)) {
      const totalPoints = (curGpa * compCred) + (newGpa * newCred);
      const totalCreds = compCred + newCred;
      if (totalCreds > 0) {
        setCreditsGpaResult((totalPoints / totalCreds).toFixed(3));
      } else {
        setCreditsGpaResult('—');
      }
    } else {
      setCreditsGpaResult('—');
    }
  }, [completedCreds, currentCgpa, newCourseCredits, expectedCourseGpa]);

  const grades10 = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
  const grades4 = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

  return (
    <div id="converter" className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
          <h1 className="text-xl font-bold text-white font-odoo-slant">Academic Converters</h1>
        </div>
      </div>

      {/* Segmented Control Selector */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-1.5 flex gap-1">
        <button
          onClick={() => {
            setActiveTab('gpa-percent');
            setCgpaInput('8.5');
          }}
          className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs px-1 sm:px-3 font-semibold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'gpa-percent'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          GPA ↔ Percent
        </button>
        <button
          onClick={() => {
            setActiveTab('grade-points');
            setSelectedGrade(scaleType === 10 ? 'A+' : 'A');
          }}
          className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs px-1 sm:px-3 font-semibold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'grade-points'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Grade ↔ Points
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs px-1 sm:px-3 font-semibold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'credits'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Credits Calc
        </button>
      </div>

      {/* Dynamic Main Workspace Container */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6">
        
        {/* GPA ↔ Percentage Converter */}
        {activeTab === 'gpa-percent' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CGPA TO PERCENTAGE
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Convert CGPA (10-point scale) to standard academic board percentage instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Left Column: CGPA Input */}
              <div className="space-y-2">
                <label htmlFor="input-cgpa" className="text-xs font-mono text-neutral-400 uppercase">Input CGPA</label>
                <input
                  id="input-cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={cgpaInput}
                  onChange={(e) => setCgpaInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-mono font-medium"
                />
              </div>

              {/* Right Column: Instant result */}
              <div className="p-4 bg-black/40 border border-neutral-900 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Percentage Output</span>
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono mt-1 block">
                  {percentResult}%
                </span>
                <span className="text-[9px] text-neutral-500 font-mono mt-1 block">formula: CGPA * 9.5</span>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                PERCENTAGE TO CGPA
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Left Column: Percentage Input */}
              <div className="space-y-2">
                <label htmlFor="input-percent" className="text-xs font-mono text-neutral-400 uppercase">Input Percentage (%)</label>
                <input
                  id="input-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percentInput}
                  onChange={(e) => setPercentInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-mono font-medium"
                />
              </div>

              {/* Right Column: Instant result */}
              <div className="p-4 bg-black/40 border border-neutral-900 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">CGPA Output</span>
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono mt-1 block">
                  {cgpaResult}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono mt-1 block">formula: % / 9.5</span>
              </div>
            </div>
          </div>
        )}

        {/* Grade ↔ Points Converter */}
        {activeTab === 'grade-points' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                GRADE TO GRADE POINTS
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Identify the numerical grade-point equivalents of letter grades instantly.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono text-neutral-400 uppercase block">Scale System</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setScaleType(10);
                    setSelectedGrade('O');
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
                    scaleType === 10
                      ? 'border-white bg-[#262626] text-white'
                      : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  10.0 scale (S / A+ / O)
                </button>
                <button
                  onClick={() => {
                    setScaleType(4);
                    setSelectedGrade('A');
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
                    scaleType === 4
                      ? 'border-white bg-[#262626] text-white'
                      : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  4.0 scale (A / A- / B)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
              <div className="space-y-2">
                <label htmlFor="select-grade" className="text-xs font-mono text-neutral-400 uppercase">Select Grade</label>
                <div className="flex gap-2 flex-wrap">
                  {(scaleType === 10 ? grades10 : grades4).map((gr) => (
                    <button
                      key={gr}
                      onClick={() => setSelectedGrade(gr)}
                      className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all ${
                        selectedGrade === gr
                          ? 'border-white bg-black text-white'
                          : 'border-neutral-800 bg-black/40 text-neutral-500 hover:border-neutral-600'
                      }`}
                    >
                      {gr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-black/40 border border-neutral-900 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">GPA Grade Points</span>
                <span className="text-4xl font-extrabold tracking-tight text-white font-mono mt-1 block">
                  {pointsResult.toFixed(1)}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono mt-1.5 block">
                  Academic weight on a {scaleType}.0 scale
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Credits Calculator */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CUMULATIVE CREDITS WEIGHT CALCULATOR
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Find exactly how a new high-credit course will affect your overall cumulative GPA weight.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="comp-creds" className="text-xs font-mono text-neutral-400 uppercase">Completed Credits</label>
                <input
                  id="comp-creds"
                  type="number"
                  value={completedCreds}
                  onChange={(e) => setCompletedCreds(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. 45"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="curr-cgpa" className="text-xs font-mono text-neutral-400 uppercase">Current CGPA</label>
                <input
                  id="curr-cgpa"
                  type="number"
                  step="0.01"
                  value={currentCgpa}
                  onChange={(e) => setCurrentCgpa(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. 8.2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-creds" className="text-xs font-mono text-neutral-400 uppercase">New Course Credits</label>
                <input
                  id="new-creds"
                  type="number"
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. 4"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="expected-gpa" className="text-xs font-mono text-neutral-400 uppercase">Expected Grade in Course</label>
                <input
                  id="expected-gpa"
                  type="number"
                  step="0.1"
                  value={expectedCourseGpa}
                  onChange={(e) => setExpectedCourseGpa(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. 9.0"
                />
              </div>
            </div>

            <div className="p-5 bg-black/40 border border-neutral-900 rounded-[24px] text-center border-t border-t-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Projected Cumulative CGPA After Course</span>
              <span className="text-4xl font-extrabold tracking-tight text-white mt-1 block">
                {creditsGpaResult}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono mt-1.5 block">
                Aggregated over {parseFloat(completedCreds) + (parseFloat(newCourseCredits) || 0)} total credits
              </span>
            </div>
          </div>
        )}

      </div>

      <div className="p-5 bg-neutral-950 rounded-[24px] border border-neutral-900 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500 leading-relaxed font-mono">
          Looking for custom board conversions? Feel free to toggle settings or customize grading scale in the Academic System menu.
        </p>
      </div>
    </div>
  );
}
