import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Semester, 
  AttendanceSubject, 
  Exam, 
  Activity, 
  TabType, 
  ToolType 
} from './types';

// Component Imports
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import BottomNavBar from './components/BottomNavBar';
import HomeDashboard from './components/HomeDashboard';
import ToolsScreen from './components/ToolsScreen';
import CGPACalculator from './components/CGPACalculator';
import AttendanceTracker from './components/AttendanceTracker';
import TargetGPAPredictor from './components/TargetGPAPredictor';
import ExamPlanner from './components/ExamPlanner';
import Converter from './components/Converter';
import ProgressScreen from './components/ProgressScreen';
import SettingsScreen from './components/SettingsScreen';
import AISpace from './components/AISpace';
import CodingProfiles from './components/CodingProfiles';
import RoadmapsManager from './components/RoadmapsManager';
import DailyPlanner from './components/DailyPlanner';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top on tab or tool change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentTab, activeTool]);

  // Core Persistent States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [attendanceSubjects, setAttendanceSubjects] = useState<AttendanceSubject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('gradence_profile');
      const storedSemesters = localStorage.getItem('gradence_semesters');
      const storedAttendance = localStorage.getItem('gradence_attendance_subjects');
      const storedExams = localStorage.getItem('gradence_exams');
      const storedActivities = localStorage.getItem('gradence_activities');

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
        setIsInitialized(true);
      }

      if (storedSemesters) setSemesters(JSON.parse(storedSemesters));
      if (storedAttendance) setAttendanceSubjects(JSON.parse(storedAttendance));
      
      if (storedExams) {
        setExams(JSON.parse(storedExams));
      } else {
        setExams([]);
        localStorage.setItem('gradence_exams', JSON.stringify([]));
      }

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      } else {
        setActivities([]);
        localStorage.setItem('gradence_activities', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Failed to load local storage values', e);
    }
  }, []);

  // Sync profile values to root DOM to allow light/dark themes easily
  useEffect(() => {
    if (profile) {
      const isDark = profile.theme === 'dark' || 
        (profile.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#000000';
      } else {
        document.documentElement.classList.remove('dark');
        // Let's keep a high-contrast elegant light mode if selected, but maintain our premium sleek styling
        document.documentElement.style.backgroundColor = '#0a0a0a';
      }
    }
  }, [profile]);

  // Log activity helper
  const logActivity = (type: Activity['type'], title: string, detail: string) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type,
      title,
      detail,
      timestamp: new Date().toISOString()
    };
    const updated = [newActivity, ...activities].slice(0, 20);
    setActivities(updated);
    localStorage.setItem('gradence_activities', JSON.stringify(updated));
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (newProfile: UserProfile, initialSemesters?: { number: number, sgpa: number }[]) => {
    setProfile(newProfile);
    localStorage.setItem('gradence_profile', JSON.stringify(newProfile));
    
    if (initialSemesters && initialSemesters.length > 0) {
      const sems: Semester[] = initialSemesters.map(item => ({
        id: `sem-${item.number}`,
        number: item.number,
        name: `Semester ${item.number}`,
        sgpa: item.sgpa,
        totalCredits: 20, // default credits
        subjects: []
      }));
      setSemesters(sems);
      localStorage.setItem('gradence_semesters', JSON.stringify(sems));
    } else {
      setSemesters([]);
      localStorage.setItem('gradence_semesters', JSON.stringify([]));
    }

    setIsInitialized(true);
    logActivity('profile', 'Workspace Set Up', `Welcome, ${newProfile.name}. Academic Profile customized successfully.`);
  };

  // Save Semester Handler
  const handleSaveSemester = (semester: Semester) => {
    const existsIdx = semesters.findIndex(s => s.number === semester.number);
    let updated: Semester[];
    if (existsIdx >= 0) {
      updated = [...semesters];
      updated[existsIdx] = semester;
    } else {
      updated = [...semesters, semester].sort((a, b) => a.number - b.number);
    }
    setSemesters(updated);
    localStorage.setItem('gradence_semesters', JSON.stringify(updated));
    logActivity('cgpa', `Semester ${semester.number} Saved`, `Archived ${semester.subjects.length} courses with an SGPA of ${semester.sgpa.toFixed(2)}.`);

    // Automatically synchronize active semester level
    if (profile && semester.number >= profile.currentSemester && semester.number < 8) {
      const updatedProfile = { ...profile, currentSemester: semester.number + 1 };
      setProfile(updatedProfile);
      localStorage.setItem('gradence_profile', JSON.stringify(updatedProfile));
    }
  };

  // Save Attendance Subjects Handler
  const handleSaveAttendance = (subjects: AttendanceSubject[]) => {
    setAttendanceSubjects(subjects);
    localStorage.setItem('gradence_attendance_subjects', JSON.stringify(subjects));
    // Avoid double logging on every click, but capture major adjustments if needed
  };

  // Save Exams Handler
  const handleSaveExams = (newExams: Exam[]) => {
    setExams(newExams);
    localStorage.setItem('gradence_exams', JSON.stringify(newExams));
    if (newExams.length > exams.length) {
      const added = newExams[newExams.length - 1];
      logActivity('exam', 'Exam Scheduled', `Assessment for "${added.subject}" set for ${added.date}.`);
    } else if (newExams.length < exams.length) {
      logActivity('exam', 'Assessment Cleared', 'Upcoming assessment log updated.');
    }
  };

  // Update Profile parameters inside Settings
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('gradence_profile', JSON.stringify(newProfile));
    logActivity('profile', 'Settings Changed', 'System and academic parameters updated.');
  };

  // Database Reset
  const handleResetData = () => {
    localStorage.clear();
    setProfile(null);
    setSemesters([]);
    setAttendanceSubjects([]);
    setExams([]);
    setActivities([]);
    setIsInitialized(false);
  };

  // Export Data JSON string
  const handleExportData = () => {
    const backupObj = {
      profile,
      semesters,
      attendanceSubjects,
      exams,
      activities
    };
    return JSON.stringify(backupObj, null, 2);
  };

  // Import Backup Data JSON
  const handleImportData = (dataString: string) => {
    try {
      const parsed = JSON.parse(dataString);
      if (parsed.profile && typeof parsed.profile.name === 'string') {
        localStorage.setItem('gradence_profile', JSON.stringify(parsed.profile));
        if (parsed.semesters) localStorage.setItem('gradence_semesters', JSON.stringify(parsed.semesters));
        if (parsed.attendanceSubjects) localStorage.setItem('gradence_attendance_subjects', JSON.stringify(parsed.attendanceSubjects));
        if (parsed.exams) localStorage.setItem('gradence_exams', JSON.stringify(parsed.exams));
        if (parsed.activities) localStorage.setItem('gradence_activities', JSON.stringify(parsed.activities));
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  // Aggregate current average attendance percentage
  const getAttendanceAvg = () => {
    if (attendanceSubjects.length === 0) return 0;
    const totalLogCount = attendanceSubjects.reduce((sum, s) => sum + s.total, 0);
    const totalPresentCount = attendanceSubjects.reduce((sum, s) => sum + s.present, 0);
    if (totalLogCount === 0) return 0;
    return parseFloat(((totalPresentCount / totalLogCount) * 100).toFixed(1));
  };

  // Navigation controller for home-to-tool link
  const handleNavigateToTool = (tool: ToolType) => {
    setCurrentTab('tools');
    setActiveTool(tool);
  };

  // Helper to render the active tab content
  const renderTabContent = () => {
    if (!profile) return null;

    switch (currentTab) {
      case 'home':
        return (
          <HomeDashboard 
            profile={profile}
            semesters={semesters}
            exams={exams}
            activities={activities}
            onNavigateToTool={handleNavigateToTool}
            attendanceAvg={getAttendanceAvg()}
          />
        );
      
      case 'tools':
        if (activeTool === 'cgpa') {
          return (
            <CGPACalculator 
              profile={profile}
              savedSemesters={semesters}
              onSaveSemester={handleSaveSemester}
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'attendance') {
          return (
            <AttendanceTracker 
              savedSubjects={attendanceSubjects}
              onSaveSubjects={handleSaveAttendance}
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'gpa') {
          return (
            <TargetGPAPredictor 
              profile={profile}
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'exam') {
          return (
            <ExamPlanner 
              savedExams={exams}
              onSaveExams={handleSaveExams}
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'converter') {
          return (
            <Converter 
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'coding') {
          return (
            <CodingProfiles 
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'roadmaps') {
          return (
            <RoadmapsManager 
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'planner') {
          return (
            <DailyPlanner 
              onBack={() => setActiveTool(null)}
            />
          );
        }
        return (
          <ToolsScreen 
            onSelectTool={(tool) => setActiveTool(tool)}
          />
        );

      case 'progress':
        return (
          <ProgressScreen 
            semesters={semesters}
            attendanceSubjects={attendanceSubjects}
            gpaScale={profile.gpaScale}
          />
        );

      case 'ai':
        return (
          <AISpace 
            profile={profile}
            semesters={semesters}
            attendanceSubjects={attendanceSubjects}
          />
        );

      case 'settings':
        return (
          <SettingsScreen 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div id="app-root-shell" className="h-[100dvh] min-h-[100dvh] overflow-hidden bg-black text-white relative flex flex-col">
      <AnimatePresence mode="wait">
        {/* Splash Screen */}
        {showSplash && (
          <div key="splash" className="h-full w-full">
            <SplashScreen onComplete={() => setShowSplash(false)} />
          </div>
        )}

        {/* Onboarding screen if first time */}
        {!showSplash && !isInitialized && (
          <div key="onboarding" className="w-full h-full bg-black overflow-y-auto">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        )}

        {/* Primary Dashboard Container */}
        {!showSplash && isInitialized && profile && (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col overflow-hidden relative"
          >
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neutral-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-900/10 rounded-full blur-[120px] pointer-events-none" />

            <main ref={mainContentRef} className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-28 overflow-y-auto scrollbar-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentTab}-${activeTool || 'list'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Float Bottom Navigation */}
            <BottomNavBar 
              activeTab={currentTab} 
              onChangeTab={(tab) => {
                setCurrentTab(tab);
                setActiveTool(null); // Reset tool detail view on tab swap
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
