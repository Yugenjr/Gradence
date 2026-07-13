import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Semester, Subject } from '../types';
import { Plus, Trash2, ArrowLeft, Save, PlusCircle, Check } from 'lucide-react';

interface CGPACalculatorProps {
  profile: UserProfile;
  savedSemesters: Semester[];
  onSaveSemester: (semester: Semester) => void;
  onBack: () => void;
}

export default function CGPACalculator({ profile, savedSemesters, onSaveSemester, onBack }: CGPACalculatorProps) {
  const [selectedSemNum, setSelectedSemNum] = useState<number>(profile.currentSemester);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [calculatedSGPA, setCalculatedSGPA] = useState<number | null>(null);
  const [calculatedCredits, setCalculatedCredits] = useState<number>(0);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Define grades based on GPA scale
  const gradeOptions = profile.gpaScale === 10 
    ? [
        { label: 'O (10)', value: 'O', points: 10 },
        { label: 'A+ (9)', value: 'A+', points: 9 },
        { label: 'A (8)', value: 'A', points: 8 },
        { label: 'B+ (7)', value: 'B+', points: 7 },
        { label: 'B (6)', value: 'B', points: 6 },
        { label: 'C (5)', value: 'C', points: 5 },
        { label: 'D (4)', value: 'D', points: 4 },
        { label: 'F (0)', value: 'F', points: 0 }
      ]
    : [
        { label: 'A (4.0)', value: 'A', points: 4.0 },
        { label: 'A- (3.7)', value: 'A-', points: 3.7 },
        { label: 'B+ (3.3)', value: 'B+', points: 3.3 },
        { label: 'B (3.0)', value: 'B', points: 3.0 },
        { label: 'B- (2.7)', value: 'B-', points: 2.7 },
        { label: 'C+ (2.3)', value: 'C+', points: 2.3 },
        { label: 'C (2.0)', value: 'C', points: 2.0 },
        { label: 'D (1.0)', value: 'D', points: 1.0 },
        { label: 'F (0.0)', value: 'F', points: 0.0 }
      ];

  // Load existing semester data if it exists, otherwise initialize template subjects
  useEffect(() => {
    const existing = savedSemesters.find(s => s.number === selectedSemNum);
    if (existing && existing.subjects.length > 0) {
      setSubjects(existing.subjects);
      setCalculatedSGPA(existing.sgpa);
      const totalC = existing.subjects.reduce((sum, s) => sum + s.credits, 0);
      setCalculatedCredits(totalC);
    } else {
      // Default placeholder subjects
      setSubjects([
        { id: '1', name: 'Advanced Mathematics', credits: 4, grade: gradeOptions[0].value, gradePoints: gradeOptions[0].points },
        { id: '2', name: 'Software Engineering', credits: 3, grade: gradeOptions[1].value, gradePoints: gradeOptions[1].points },
        { id: '3', name: 'Data Structures Lab', credits: 2, grade: gradeOptions[0].value, gradePoints: gradeOptions[0].points }
      ]);
      setCalculatedSGPA(null);
      setCalculatedCredits(0);
    }
    setIsSavedSuccessfully(false);
  }, [selectedSemNum, savedSemesters, profile.gpaScale]);

  const handleAddSubject = () => {
    const newId = Date.now().toString();
    const newSub: Subject = {
      id: newId,
      name: `Course ${subjects.length + 1}`,
      credits: 3,
      grade: gradeOptions[0].value,
      gradePoints: gradeOptions[0].points
    };
    setSubjects([...subjects, newSub]);
    setCalculatedSGPA(null);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setCalculatedSGPA(null);
  };

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        if (updates.grade !== undefined) {
          const opt = gradeOptions.find(o => o.value === updates.grade);
          updated.gradePoints = opt ? opt.points : 0;
        }
        return updated;
      }
      return s;
    }));
    setCalculatedSGPA(null);
  };

  const calculateResults = () => {
    if (subjects.length === 0) {
      setCalculatedSGPA(0);
      setCalculatedCredits(0);
      return;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach(s => {
      totalPoints += s.gradePoints * s.credits;
      totalCredits += s.credits;
    });

    const sgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
    setCalculatedSGPA(sgpa);
    setCalculatedCredits(totalCredits);
  };

  const handleSaveSemester = () => {
    if (calculatedSGPA === null) return;
    const sem: Semester = {
      id: `sem-${selectedSemNum}`,
      number: selectedSemNum,
      name: `Semester ${selectedSemNum}`,
      sgpa: calculatedSGPA,
      totalCredits: calculatedCredits,
      subjects: subjects
    };
    onSaveSemester(sem);
    setIsSavedSuccessfully(true);
    alert('Semester data saved successfully!');
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 2500);
  };

  return (
    <div id="cgpa-calculator" className="space-y-8 pb-4">
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
          <h1 className="text-xl font-bold text-white font-odoo-slant">CGPA Calculator</h1>
        </div>
      </div>

      {/* Beautiful Semester selector */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-3">
          SELECT ACTIVE SEMESTER
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
            const isSaved = savedSemesters.some(s => s.number === num);
            const isSelected = selectedSemNum === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedSemNum(num)}
                className={`flex-1 min-w-[56px] py-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'border-white bg-[#262626] text-white font-bold'
                    : 'border-[#2A2A2A] bg-black/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span>Sem {num}</span>
                {isSaved && (
                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-neutral-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List of subject cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            SUBJECTS & GRADES ({subjects.length})
          </span>
          <button 
            onClick={handleAddSubject}
            className="text-xs text-white hover:underline flex items-center gap-1 font-mono"
          >
            <Plus className="w-3.5 h-3.5" /> ADD SUBJECT
          </button>
        </div>

        <AnimatePresence initial={false}>
          {subjects.map((sub, idx) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            >
              {/* Subject details inputs */}
              <div className="flex-1 space-y-2 sm:space-y-0 sm:flex sm:items-center gap-4">
                {/* Subject Name */}
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => handleUpdateSubject(sub.id, { name: e.target.value })}
                  placeholder="e.g. Physics"
                  className="bg-black/30 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600 w-full sm:max-w-xs font-medium"
                />

                <div className="flex items-center justify-between gap-4">
                  {/* Credits Stepper */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 uppercase">Credits</span>
                    <div className="flex items-center border border-neutral-800 bg-black/20 rounded-xl overflow-hidden h-9">
                      <button
                        type="button"
                        onClick={() => handleUpdateSubject(sub.id, { credits: Math.max(1, sub.credits - 1) })}
                        className="px-2.5 hover:bg-neutral-800 text-neutral-400 font-semibold text-sm h-full"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-mono text-white font-bold">{sub.credits}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSubject(sub.id, { credits: sub.credits + 1 })}
                        className="px-2.5 hover:bg-neutral-800 text-neutral-400 font-semibold text-sm h-full"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Grade Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 uppercase">Grade</span>
                    <select
                      value={sub.grade}
                      onChange={(e) => handleUpdateSubject(sub.id, { grade: e.target.value })}
                      className="bg-black/40 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600 font-semibold h-9"
                    >
                      {gradeOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#171717]">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Trash Action */}
              <button
                onClick={() => handleRemoveSubject(sub.id)}
                disabled={subjects.length <= 1}
                className="w-10 h-10 border border-neutral-800 hover:border-red-900/50 hover:bg-red-950/20 rounded-xl flex items-center justify-center text-neutral-500 hover:text-red-400 transition-all cursor-pointer shrink-0 self-end sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {subjects.length === 0 && (
          <div className="text-center py-8 border border-dashed border-[#2A2A2A] rounded-[24px]">
            <p className="text-xs text-neutral-500 font-mono">No subjects added yet.</p>
            <button 
              onClick={handleAddSubject}
              className="mt-3 text-xs bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-neutral-200"
            >
              Add Subject
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Subject & Calculate Buttons */}
      <div className="space-y-4">
        <button
          onClick={calculateResults}
          className="w-full py-4 rounded-3xl border border-white text-black bg-white text-sm font-semibold hover:bg-neutral-200 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Calculate Semester SGPA</span>
        </button>

        {/* Floating result card */}
        {calculatedSGPA !== null && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  CALCULATION RESULT
                </span>
                <div className="text-4xl font-extrabold tracking-tight text-white mt-1 font-sans">
                  {calculatedSGPA.toFixed(2)}
                  <span className="text-xs font-mono font-normal text-neutral-500 ml-1">
                    SGPA
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  CREDITS
                </span>
                <div className="text-2xl font-bold text-neutral-300 font-mono mt-1">
                  {calculatedCredits}
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-neutral-900 rounded-2xl">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                GRADE SUMMARY
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You passed <span className="text-white font-bold font-mono">{subjects.length}</span> subjects for an aggregated total of <span className="text-white font-bold font-mono">{calculatedCredits} credits</span>. This is {calculatedSGPA >= (profile.gpaScale === 10 ? 8.5 : 3.5) ? 'an Outstanding' : 'a solid'} performance!
              </p>
            </div>

            {/* Save Semester Button */}
            <button
              onClick={handleSaveSemester}
              className={`w-full py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isSavedSuccessfully
                  ? 'bg-neutral-800 text-green-400 border border-green-900/30'
                  : 'bg-black text-white hover:bg-neutral-950 border border-[#2A2A2A]'
              }`}
            >
              {isSavedSuccessfully ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Semester Archived Successfully</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save to Academic History</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
