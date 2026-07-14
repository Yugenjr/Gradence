import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../assets/logo.png';
import { UserProfile } from '../types';
import { Sparkles, GraduationCap, Moon, Sun, Monitor, ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile, initialSemesters?: { number: number, sgpa: number }[]) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('Sri Eshwar College of Engineering');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [theme, setTheme] = useState<'se-dark' | 'se-light' | 'dark' | 'light' | 'system'>('se-dark');
  const [gpaScale, setGpaScale] = useState<4 | 10>(10);
  const [prevSgpas, setPrevSgpas] = useState<{[key: number]: string}>({});

  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [customUni, setCustomUni] = useState('');
  const [isCustomUniActive, setIsCustomUniActive] = useState(false);

  const universities = [
    'Sri Eshwar College of Engineering',
    'IIT Bombay',
    'National University of Singapore',
    'University of Toronto',
    'Oxford University',
    'MIT',
    'Stanford University',
    'Custom...'
  ];

  const totalSteps = currentSemester > 1 ? 4 : 3;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) return;
      setStep(3);
    } else if (step === 3) {
      if (currentSemester > 1) {
        setStep(4);
      } else {
        submitOnboarding();
      }
    } else if (step === 4) {
      submitOnboarding();
    }
  };

  const submitOnboarding = () => {
    const finalUni = isCustomUniActive ? (customUni.trim() || 'My University') : university;
    const initialSemesters: { number: number, sgpa: number }[] = [];
    
    if (currentSemester > 1) {
      for (let i = 1; i < currentSemester; i++) {
        const val = parseFloat(prevSgpas[i]) || 0;
        initialSemesters.push({ number: i, sgpa: val });
      }
    }

    onComplete({
      name: name.trim(),
      university: finalUni,
      currentSemester,
      theme,
      gpaScale
    }, initialSemesters);
  };

  return (
    <div id="onboarding-container" className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Top logo & header */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-neutral-800 rounded-lg flex items-center justify-center bg-white overflow-hidden p-0.5">
            <img src={logoImg} alt="G" className="w-full h-full object-contain rounded" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase font-odoo-slant text-neutral-400">GRADENCE</span>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          STEP 0{step} / 0{totalSteps}
        </div>
      </div>

      {/* Main Content Carousel */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full my-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 text-center sm:text-left"
            >
              {/* Premium Vector Illustration built in CSS */}
              <div className="h-48 w-full flex items-center justify-center relative bg-gradient-to-b from-neutral-950 to-transparent rounded-3xl border border-neutral-900/50 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                
                {/* Interlocking modern rings/geometric layout */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border border-neutral-800 absolute flex items-center justify-center"
                >
                  <div className="w-24 h-24 rounded-full border border-dashed border-neutral-700/50" />
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="z-10 bg-black/80 backdrop-blur-md p-5 rounded-3xl border border-neutral-800 shadow-xl max-w-xs flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center text-white">
                    <GraduationCap className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Gradence Core v1.0</div>
                    <div className="text-sm font-semibold mt-0.5">Perfect Academic Order</div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-odoo-slant leading-tight">
                  Your Academic<br />Companion.
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
                  Track your academic journey beautifully. Manage CGPA, predict attendance, organize upcoming exams, and analyze your progress offline-first.
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-odoo-slant">
                  Academic Profile
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure your primary workspace values. All data remains stored locally.
                </p>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="student-name" className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Your Name</label>
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#171717] border border-[#2A2A2A] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                {/* GPA System Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">Grading Scale</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGpaScale(10)}
                      className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        gpaScale === 10
                          ? 'border-white bg-[#171717] text-white'
                          : 'border-[#2A2A2A] bg-[#0F0F10] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>10.0 scale</span>
                      <span className="text-[10px] font-mono text-neutral-500">e.g. India, Europe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGpaScale(4)}
                      className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        gpaScale === 4
                          ? 'border-white bg-[#171717] text-white'
                          : 'border-[#2A2A2A] bg-[#0F0F10] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>4.0 scale</span>
                      <span className="text-[10px] font-mono text-neutral-500">e.g. USA, Canada</span>
                    </button>
                  </div>
                </div>

                {/* University Selection */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">University</label>
                  {isCustomUniActive ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customUni}
                        onChange={(e) => setCustomUni(e.target.value)}
                        placeholder="Enter university name"
                        className="flex-1 bg-[#171717] border border-[#2A2A2A] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomUniActive(false)}
                        className="px-3 border border-[#2A2A2A] rounded-2xl hover:border-neutral-700 text-xs text-neutral-400 font-mono"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsUniDropdownOpen(!isUniDropdownOpen)}
                        className="w-full bg-[#171717] border border-[#2A2A2A] rounded-2xl px-4 py-3.5 text-sm text-white text-left flex justify-between items-center focus:outline-none"
                      >
                        <span>{university}</span>
                        <span className="text-xs text-neutral-500">▼</span>
                      </button>

                      {isUniDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-[#171717] border border-[#2A2A2A] rounded-2xl shadow-2xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                          {universities.map((uni) => (
                            <button
                              key={uni}
                              type="button"
                              onClick={() => {
                                if (uni === 'Custom...') {
                                  setIsCustomUniActive(true);
                                } else {
                                  setUniversity(uni);
                                }
                                setIsUniDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-[#202022] hover:text-white transition-colors border-b border-neutral-900 last:border-b-0"
                            >
                              {uni}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Semester Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">Current Semester</label>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setCurrentSemester(sem)}
                        className={`flex-1 min-w-[44px] h-11 rounded-xl border text-sm font-medium transition-all ${
                          currentSemester === sem
                            ? 'border-white bg-[#171717] text-white'
                            : 'border-[#2A2A2A] bg-[#0F0F10] text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && currentSemester > 1 && (
            <motion.div
              key="stepPrevSgpas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-odoo-slant">
                  Previous Semesters
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Enter your obtained SGPAs. If not announced yet, leave as 0.
                </p>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {Array.from({ length: currentSemester - 1 }, (_, i) => i + 1).map((semNum) => (
                  <div key={semNum} className="space-y-2">
                    <label htmlFor={`prev-sgpa-${semNum}`} className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                      Semester {semNum} SGPA
                    </label>
                    <input
                      id={`prev-sgpa-${semNum}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max={gpaScale}
                      value={prevSgpas[semNum] || ''}
                      onChange={(e) => setPrevSgpas({ ...prevSgpas, [semNum]: e.target.value })}
                      placeholder={`e.g. ${gpaScale === 10 ? '8.5' : '3.4'}`}
                      className="w-full bg-[#171717] border border-[#2A2A2A] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {((step === 3 && currentSemester === 1) || (step === 4 && currentSemester > 1)) && (
            <motion.div
              key="stepTheme"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-odoo-slant">
                  Choose Theme
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure your visual space. You can change this anytime.
                </p>
              </div>

              <div className="space-y-4">
                {/* Theme Selector List */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setTheme('se-dark')}
                    className={`w-full p-3.5 rounded-3xl border text-left flex items-center justify-between transition-all ${
                      theme === 'se-dark'
                        ? 'border-white bg-[#171717]'
                        : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative">
                        <Moon className="w-5 h-5 text-[#f2c10f]" />
                        <Sparkles className="w-3 h-3 text-[#1e4e8c] absolute top-1.5 right-1.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Sri Eshwar Dark</div>
                        <div className="text-xs text-neutral-500">Official Blue & Yellow branding on dark workspace</div>
                      </div>
                    </div>
                    {theme === 'se-dark' && <Check className="w-5 h-5 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('se-light')}
                    className={`w-full p-3.5 rounded-3xl border text-left flex items-center justify-between transition-all ${
                      theme === 'se-light'
                        ? 'border-white bg-[#171717]'
                        : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative">
                        <Sun className="w-5 h-5 text-[#f2c10f]" />
                        <Sparkles className="w-3 h-3 text-[#1e4e8c] absolute top-1.5 right-1.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Sri Eshwar Light</div>
                        <div className="text-xs text-neutral-500">Official Blue & Yellow branding on light workspace</div>
                      </div>
                    </div>
                    {theme === 'se-light' && <Check className="w-5 h-5 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`w-full p-3.5 rounded-3xl border text-left flex items-center justify-between transition-all ${
                      theme === 'dark'
                        ? 'border-white bg-[#171717]'
                        : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Classic Dark</div>
                        <div className="text-xs text-neutral-500">Pure AMOLED black for distraction-free focus</div>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-5 h-5 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`w-full p-3.5 rounded-3xl border text-left flex items-center justify-between transition-all ${
                      theme === 'light'
                        ? 'border-white bg-[#171717]'
                        : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        <Sun className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Nordic Light</div>
                        <div className="text-xs text-neutral-500">Clean, elegant high-contrast bright slate</div>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="w-5 h-5 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`w-full p-3.5 rounded-3xl border text-left flex items-center justify-between transition-all ${
                      theme === 'system'
                        ? 'border-white bg-[#171717]'
                        : 'border-[#2A2A2A] bg-[#0F0F10] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">System Synchronized</div>
                        <div className="text-xs text-neutral-500">Automatically switch depending on device style</div>
                      </div>
                    </div>
                    {theme === 'system' && <Check className="w-5 h-5 text-white" />}
                  </button>
                </div>

                <div className="p-4 bg-neutral-950 rounded-3xl border border-neutral-900 flex items-start gap-3 mt-4">
                  <Sparkles className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Gradence is optimized for an ultra-premium, dark, grayscale interface. Pure black saves battery and looks incredibly clean.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="max-w-md mx-auto w-full flex flex-col gap-4">
        {/* Step Indicators */}
        <div className="flex justify-center gap-1.5 py-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                step === s ? 'w-6 bg-white' : 'w-1.5 bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleNext}
          disabled={step === 2 && !name.trim()}
          className={`w-full py-4 rounded-3xl border flex items-center justify-center gap-2 font-medium text-sm transition-all text-black bg-white cursor-pointer active:scale-[0.98] ${
            step === 2 && !name.trim() ? 'opacity-50 pointer-events-none' : 'hover:bg-neutral-200'
          }`}
        >
          <span>{step === totalSteps ? 'Finish Registration' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
