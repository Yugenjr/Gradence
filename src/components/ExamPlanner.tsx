import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Exam } from '../types';
import { ArrowLeft, Calendar, Plus, Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface ExamPlannerProps {
  savedExams: Exam[];
  onSaveExams: (exams: Exam[]) => void;
  onBack: () => void;
}

export default function ExamPlanner({ savedExams, onSaveExams, onBack }: ExamPlannerProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [subName, setSubName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Load and sort exams by date
  useEffect(() => {
    if (savedExams) {
      const sorted = [...savedExams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setExams(sorted);
    }
  }, [savedExams]);

  const handleAddExam = () => {
    if (!subName.trim() || !examDate) return;
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      subject: subName.trim(),
      date: examDate,
      priority
    };
    const updated = [...exams, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setExams(updated);
    onSaveExams(updated);

    // Reset Form
    setSubName('');
    setExamDate('');
    setPriority('medium');
    setIsAddFormOpen(false);
  };

  const handleRemoveExam = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    onSaveExams(updated);
  };

  // Compute remaining days
  const getDaysRemaining = (dateString: string) => {
    const examTime = new Date(dateString).getTime();
    const today = new Date();
    // Set hours to midnight for uniform calculation
    today.setHours(0, 0, 0, 0);
    const diffTime = examTime - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div id="exam-planner" className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">Exam Planner</h1>
          </div>
        </div>

        {exams.length > 0 && (
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-200 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Exam</span>
          </button>
        )}
      </div>

      {/* Add Exam Form Drawer */}
      <AnimatePresence>
        {isAddFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4"
          >
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
              SCHEDULE NEW EXAM
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="new-exam-sub" className="text-[10px] font-mono text-neutral-400 uppercase">SUBJECT NAME</label>
                <input
                  id="new-exam-sub"
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Physics Theory"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-exam-date" className="text-[10px] font-mono text-neutral-400 uppercase">ASSESSMENT DATE</label>
                <input
                  id="new-exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">PRIORITY STATUS</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 text-xs font-mono rounded-xl border transition-all ${
                      priority === p
                        ? 'border-college-blue bg-college-blue text-white'
                        : 'border-neutral-800 bg-black/40 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddExam}
                className="flex-1 py-2.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200"
              >
                Schedule Assessment
              </button>
              <button
                onClick={() => setIsAddFormOpen(false)}
                className="py-2.5 px-4 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl hover:bg-neutral-900"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timeline View */}
      {exams.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#171717] border border-[#2A2A2A] rounded-[24px] text-center space-y-6">
          <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center bg-black">
            <Calendar className="w-6 h-6 text-neutral-500 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">You have no upcoming exams.</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Plan and coordinate your coursework schedules easily using our offline calendar tracker.
            </p>
          </div>
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="px-6 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200"
          >
            Add Exam
          </button>
        </div>
      ) : (
        <div className="relative border-l border-neutral-800 pl-6 ml-3 space-y-6">
          {exams.map((exam, idx) => {
            const daysLeft = getDaysRemaining(exam.date);
            const isCritical = daysLeft <= 3 && daysLeft >= 0;
            const isPassed = daysLeft < 0;

            let priorityColor = 'border-neutral-700 text-neutral-400 bg-neutral-900/50';
            if (exam.priority === 'high') priorityColor = 'border-white text-white bg-white/5';
            else if (exam.priority === 'medium') priorityColor = 'border-neutral-500 text-neutral-400 bg-neutral-900/30';

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Timeline node circle */}
                <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-black ${
                  isCritical ? 'border-white animate-pulse' : 'border-neutral-600'
                }`} />

                <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4 hover:border-neutral-600 transition-colors">
                  {/* Subject and Actions Row */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {exam.subject}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs text-neutral-400 font-mono">
                          {new Date(exam.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveExam(exam.id)}
                      className="text-xs text-neutral-600 hover:text-white transition-colors uppercase font-mono p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Priority and Countdown Info */}
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityColor}`}>
                        {exam.priority} PRIORITY
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {isPassed ? (
                        <span className="text-xs text-neutral-500 font-bold font-mono uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : daysLeft === 0 ? (
                        <span className="text-xs text-white font-bold font-mono uppercase animate-pulse">
                          Today
                        </span>
                      ) : daysLeft === 1 ? (
                        <span className="text-xs text-white font-bold font-mono uppercase">
                          Tomorrow
                        </span>
                      ) : (
                        <span className={`text-xs font-bold font-mono ${isCritical ? 'text-white' : 'text-neutral-300'}`}>
                          {daysLeft} DAYS LEFT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
