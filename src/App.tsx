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
import { GradenceProvider, useGradence } from './context/GradenceContext';

export default function App() {
  return (
    <GradenceProvider>
      <AppContent />
    </GradenceProvider>
  );
}

function AppContent() {
  const {
    profile,
    semesters,
    attendanceSubjects,
    exams,
    activities,
    isInitialized,
    isStorageLoading,
    updateProfile,
    saveSemester,
    saveSemesters,
    saveAttendance,
    saveExams,
    resetData,
    importData,
    exportData
  } = useGradence();

  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top on tab or tool change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentTab, activeTool]);

  // Sync profile values to root DOM to allow light/dark themes easily
  useEffect(() => {
    if (profile) {
      // Resolve active theme string
      let activeTheme = profile.theme;
      if (activeTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = prefersDark ? 'se-dark' : 'se-light';
      }

      // Reset all theme classes first
      document.documentElement.classList.remove('dark', 'light-theme', 'se-dark-theme', 'se-light-theme');

      if (activeTheme === 'se-dark') {
        document.documentElement.classList.add('dark', 'se-dark-theme');
        document.documentElement.style.backgroundColor = '#000000';
      } else if (activeTheme === 'se-light') {
        document.documentElement.classList.add('light-theme', 'se-light-theme');
        document.documentElement.style.backgroundColor = '#153e75';
      } else if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#000000';
      } else if (activeTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.style.backgroundColor = '#f5f5f7';
      }
    }
  }, [profile]);

  // Onboarding Complete Handler
  const handleOnboardingComplete = (newProfile: UserProfile, initialSemesters?: { number: number, sgpa: number }[]) => {
    updateProfile(newProfile);

    if (initialSemesters && initialSemesters.length > 0) {
      const semestersToSave = initialSemesters.map(item => ({
        id: `sem-${item.number}`,
        number: item.number,
        name: `Semester ${item.number}`,
        sgpa: item.sgpa,
        totalCredits: 20, // default credits
        subjects: []
      }));
      saveSemesters(semestersToSave);
    }
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
              onSaveSemester={saveSemester}
              onBack={() => setActiveTool(null)}
            />
          );
        }
        if (activeTool === 'attendance') {
          return (
            <AttendanceTracker
              savedSubjects={attendanceSubjects}
              onSaveSubjects={saveAttendance}
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
              onSaveExams={saveExams}
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
            onUpdateProfile={updateProfile}
            onResetData={resetData}
            onExportData={exportData}
            onImportData={importData}
          />
        );

      default:
        return null;
    }
  };

  if (isStorageLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 relative">
        <div className="w-8 h-8 border-2 border-t-white border-white/10 rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          Gradence OS is initializing...
        </span>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[9px] text-neutral-600 uppercase tracking-widest font-mono whitespace-nowrap">
          developed by team detroit
        </div>
      </div>
    );
  }

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
