import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TargetGPAPredictorProps {
  profile: UserProfile;
  onBack: () => void;
}

export default function TargetGPAPredictor({ profile, onBack }: TargetGPAPredictorProps) {
  const [currentCgpa, setCurrentCgpa] = useState<string>('8.2');
  const [completedCredits, setCompletedCredits] = useState<string>('60');
  const [targetCgpa, setTargetCgpa] = useState<string>('8.5');
  const [upcomingCredits, setUpcomingCredits] = useState<string>('20');

  const [predictedSgpa, setPredictedSgpa] = useState<number | null>(null);
  const [probabilityText, setProbabilityText] = useState<string>('');
  const [probabilityLevel, setProbabilityLevel] = useState<'high' | 'medium' | 'low' | 'impossible'>('medium');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [sem5Sgpa, setSem5Sgpa] = useState<number>(8.0);
  const [sem6Sgpa, setSem6Sgpa] = useState<number>(8.0);
  const [sem7Sgpa, setSem7Sgpa] = useState<number>(8.0);
  const [sem8Sgpa, setSem8Sgpa] = useState<number>(8.0);

  const handlePredict = () => {
    setErrorMessage('');
    const curCgpa = parseFloat(currentCgpa);
    const complCreds = parseFloat(completedCredits);
    const tarCgpa = parseFloat(targetCgpa);
    const upCreds = parseFloat(upcomingCredits);

    // Validations
    if (isNaN(curCgpa) || isNaN(complCreds) || isNaN(tarCgpa) || isNaN(upCreds)) {
      setErrorMessage('Please provide valid numerical parameters.');
      setPredictedSgpa(null);
      return;
    }

    if (curCgpa > profile.gpaScale || tarCgpa > profile.gpaScale || curCgpa < 0 || tarCgpa < 0) {
      setErrorMessage(`GPAs cannot exceed the system limit of ${profile.gpaScale}.0`);
      setPredictedSgpa(null);
      return;
    }

    if (complCreds <= 0 || upCreds <= 0) {
      setErrorMessage('Completed and upcoming credits must be greater than zero.');
      setPredictedSgpa(null);
      return;
    }

    // Mathematical formula
    const totalCredits = complCreds + upCreds;
    const requiredSgpa = ((tarCgpa * totalCredits) - (curCgpa * complCreds)) / upCreds;

    setPredictedSgpa(parseFloat(requiredSgpa.toFixed(2)));

    // Probability analyzer
    if (requiredSgpa > profile.gpaScale) {
      setProbabilityLevel('impossible');
      setProbabilityText('Mathematical Impossibility (Exceeds maximum score scale)');
    } else if (requiredSgpa <= curCgpa) {
      setProbabilityLevel('high');
      setProbabilityText('Extremely High Probability (Requires score lower than current CGPA)');
    } else if (profile.gpaScale === 10) {
      if (requiredSgpa <= 7.0) {
        setProbabilityLevel('high');
        setProbabilityText('Very High Probability (Easily attainable with standard passing marks)');
      } else if (requiredSgpa <= 8.5) {
        setProbabilityLevel('high');
        setProbabilityText('High Probability (Comfortably achievable with regular coursework preparation)');
      } else if (requiredSgpa <= 9.2) {
        setProbabilityLevel('medium');
        setProbabilityText('Moderate Probability (Requires consistent first-class grades)');
      } else {
        setProbabilityLevel('low');
        setProbabilityText('Low Probability (Requires near-perfect grades & exceptional marks)');
      }
    } else {
      // 4.0 Scale
      if (requiredSgpa <= 2.5) {
        setProbabilityLevel('high');
        setProbabilityText('Very High Probability (Easily attainable with basic effort)');
      } else if (requiredSgpa <= 3.2) {
        setProbabilityLevel('high');
        setProbabilityText('High Probability (Achievable with standard focused studying)');
      } else if (requiredSgpa <= 3.7) {
        setProbabilityLevel('medium');
        setProbabilityText('Moderate Probability (Requires a solid string of A/B+ grades)');
      } else {
        setProbabilityLevel('low');
        setProbabilityText('Low Probability (Requires almost perfect straight-A semesters)');
      }
    }
  };

  return (
    <div id="target-gpa-predictor" className="space-y-8 pb-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
          <h1 className="text-xl font-bold text-white">
            Target GPA <span className="font-odoo-slant">Predictor</span>
          </h1>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            PREDICTION PARAMETERS
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Fill in your current achievements to calculate exactly what SGPA you need in the next semesters.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current CGPA */}
          <div className="space-y-2">
            <label htmlFor="cur-cgpa" className="text-xs font-mono text-neutral-400 uppercase">Current CGPA</label>
            <input
              id="cur-cgpa"
              type="number"
              step="0.01"
              value={currentCgpa}
              onChange={(e) => setCurrentCgpa(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-medium"
              placeholder="e.g. 8.2"
            />
          </div>

          {/* Completed Credits */}
          <div className="space-y-2">
            <label htmlFor="completed-credits" className="text-xs font-mono text-neutral-400 uppercase">Completed Credits</label>
            <input
              id="completed-credits"
              type="number"
              value={completedCredits}
              onChange={(e) => setCompletedCredits(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-medium"
              placeholder="e.g. 60"
            />
          </div>

          {/* Target CGPA */}
          <div className="space-y-2">
            <label htmlFor="target-cgpa" className="text-xs font-mono text-neutral-400 uppercase">Target CGPA</label>
            <input
              id="target-cgpa"
              type="number"
              step="0.01"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-medium"
              placeholder="e.g. 8.5"
            />
          </div>

          {/* Upcoming Semester Credits */}
          <div className="space-y-2">
            <label htmlFor="upcoming-credits" className="text-xs font-mono text-neutral-400 uppercase">Upcoming Credits</label>
            <input
              id="upcoming-credits"
              type="number"
              value={upcomingCredits}
              onChange={(e) => setUpcomingCredits(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 font-medium"
              placeholder="e.g. 20"
            />
          </div>
        </div>

        <button
          onClick={handlePredict}
          className="w-full py-4 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Predict Required SGPA</span>
        </button>
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {predictedSgpa !== null && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  REQUIRED FUTURE SGPA
                </span>
                <div className={`text-4xl font-extrabold tracking-tight mt-1 font-sans ${probabilityLevel === 'impossible' ? 'text-neutral-500' : 'text-white'}`}>
                  {predictedSgpa <= 0 ? '0.00' : predictedSgpa}
                  <span className="text-xs font-mono font-normal text-neutral-500 ml-1">
                    SGPA REQUIRED
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  PROBABILITY
                </span>
                <span className={`text-xs font-bold font-mono uppercase px-2.5 py-1 rounded-full border mt-1 inline-block ${probabilityLevel === 'high'
                    ? 'border-white text-white bg-white/5'
                    : probabilityLevel === 'medium'
                      ? 'border-neutral-500 text-neutral-400 bg-neutral-900/40'
                      : 'border-neutral-800 text-neutral-500 bg-black'
                  }`}>
                  {probabilityLevel}
                </span>
              </div>
            </div>

            {/* Probability indicator card */}
            <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl flex items-start gap-3">
              {probabilityLevel === 'impossible' ? (
                <AlertTriangle className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Probability Analysis
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  {probabilityText}. To raise your CGPA from <span className="font-bold text-white font-mono">{currentCgpa}</span> to <span className="font-bold text-white font-mono">{targetCgpa}</span>, you must average an SGPA of <span className="font-bold text-white font-mono">{predictedSgpa}</span> over the next <span className="font-bold text-white font-mono">{upcomingCredits} credits</span>.
                </p>
              </div>
            </div>

            {/* Micro comparison analytics */}
            <div className="border-t border-neutral-800 pt-4">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-2">
                ACADEMIC MATHEMATICS
              </span>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500">Current Total Points:</span>
                  <span className="font-bold text-neutral-300 font-mono mt-0.5 block">
                    {(parseFloat(currentCgpa) * parseFloat(completedCredits)).toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Target Total Points:</span>
                  <span className="font-bold text-neutral-300 font-mono mt-0.5 block">
                    {(parseFloat(targetCgpa) * (parseFloat(completedCredits) + parseFloat(upcomingCredits))).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Graduation Simulator & Credit Planner Section */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            GRADUATION SIMULATOR & CREDIT PLANNER
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Simulate your expected GPAs for future semesters to project your graduation honors classification.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { sem: 5, val: sem5Sgpa, set: setSem5Sgpa },
            { sem: 6, val: sem6Sgpa, set: setSem6Sgpa },
            { sem: 7, val: sem7Sgpa, set: setSem7Sgpa },
            { sem: 8, val: sem8Sgpa, set: setSem8Sgpa },
          ].map((item) => (
            <div key={item.sem} className="space-y-2 bg-black/20 p-4 rounded-2xl border border-neutral-900">
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span>SEMESTER {item.sem} EXPECTED SGPA</span>
                <span className="text-white font-bold">{item.val.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="4"
                max={profile.gpaScale}
                step="0.05"
                value={item.val}
                onChange={(e) => item.set(parseFloat(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-1 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Live graduation summary results */}
        {(() => {
          const curCgpaNum = parseFloat(currentCgpa) || 0;
          const complCredsNum = parseFloat(completedCredits) || 0;
          const totalSemCredits = 20; // assuming 20 credits per upcoming semester
          const totalGradCredits = complCredsNum + (totalSemCredits * 4);
          const estimatedPoints = (curCgpaNum * complCredsNum) +
            ((sem5Sgpa + sem6Sgpa + sem7Sgpa + sem8Sgpa) * totalSemCredits);
          const estimatedGradCGPA = totalGradCredits > 0 ? parseFloat((estimatedPoints / totalGradCredits).toFixed(2)) : 0.0;

          let graduationClass = 'Second Class';
          if (estimatedGradCGPA >= (profile.gpaScale === 10 ? 8.5 : 3.5)) {
            graduationClass = 'First Class with Distinction 🏆';
          } else if (estimatedGradCGPA >= (profile.gpaScale === 10 ? 6.5 : 3.0)) {
            graduationClass = 'First Class 🎓';
          } else if (estimatedGradCGPA >= (profile.gpaScale === 10 ? 5.0 : 2.0)) {
            graduationClass = 'Second Class 📁';
          } else {
            graduationClass = 'Pass Class 📋';
          }

          return (
            <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span>PROJECTED GRADUATION CGPA</span>
                <span className="text-white font-bold text-lg font-mono">{estimatedGradCGPA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400 border-t border-neutral-900 pt-3">
                <span>HONORS CLASSIFICATION</span>
                <span className="text-white font-bold">{graduationClass}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
