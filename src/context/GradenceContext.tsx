import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Semester, AttendanceSubject, Exam, Activity, CareerRoadmap } from '../types';
import { setItem, getItem, clearAll, migrateLocalStorageToPreferences } from '../services/storage';
import { saveApiKey, getApiKey, removeApiKey } from '../services/secureStorage';

export interface TimetableItem {
  id: string;
  subject: string;
  time: string;
  room: string;
}

export interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface CountdownItem {
  id: string;
  title: string;
  date: string;
}

export interface ProfileData {
  username: string;
  solved: number;
  rating: string;
  hackos?: number;
}

export interface CodingProfilesState {
  leetcode: ProfileData;
  github: ProfileData;
  codeforces: ProfileData;
  codechef: ProfileData;
}

interface GradenceContextType {
  profile: UserProfile | null;
  semesters: Semester[];
  attendanceSubjects: AttendanceSubject[];
  exams: Exam[];
  activities: Activity[];
  roadmaps: CareerRoadmap[];
  timetable: TimetableItem[];
  countdowns: CountdownItem[];
  habits: HabitItem[];
  codingProfiles: CodingProfilesState | null;
  isInitialized: boolean;
  isStorageLoading: boolean;

  updateProfile: (profile: UserProfile) => Promise<void>;
  saveSemester: (semester: Semester) => Promise<void>;
  saveAttendance: (subjects: AttendanceSubject[]) => Promise<void>;
  saveExams: (newExams: Exam[]) => Promise<void>;
  saveTimetable: (list: TimetableItem[]) => Promise<void>;
  saveCountdowns: (list: CountdownItem[]) => Promise<void>;
  saveHabits: (list: HabitItem[]) => Promise<void>;
  saveCodingProfiles: (data: CodingProfilesState) => Promise<void>;
  saveRoadmaps: (roadmaps: CareerRoadmap[]) => Promise<void>;
  logActivity: (type: Activity['type'], title: string, detail: string) => Promise<void>;
  resetData: () => Promise<void>;
  importData: (dataString: string) => Promise<boolean>;
  exportData: () => Promise<string>;
}

const GradenceContext = createContext<GradenceContextType | undefined>(undefined);

export const GradenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [attendanceSubjects, setAttendanceSubjects] = useState<AttendanceSubject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [codingProfiles, setCodingProfiles] = useState<CodingProfilesState | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  // Load from offline preferences storage
  useEffect(() => {
    async function loadData() {
      try {
        await migrateLocalStorageToPreferences();

        const storedProfile = await getItem('gradence_profile');
        const storedSemesters = await getItem('gradence_semesters');
        const storedAttendance = await getItem('gradence_attendance_subjects');
        const storedExams = await getItem('gradence_exams');
        const storedActivities = await getItem('gradence_activities');
        const storedRoadmaps = await getItem('gradence_followed_roadmaps');
        const storedTimetable = await getItem('gradence_timetable');
        const storedCountdowns = await getItem('gradence_countdowns');
        const storedHabits = await getItem('gradence_habits');
        const storedCoding = await getItem('gradence_coding_profiles');
        const securedApiKey = await getApiKey();

        if (storedProfile) {
          let profileObj = JSON.parse(storedProfile);
          if (profileObj.groqApiKey && !securedApiKey) {
            await saveApiKey(profileObj.groqApiKey);
          }
          profileObj.groqApiKey = securedApiKey || profileObj.groqApiKey || '';
          
          const { groqApiKey: _, ...cleanProfile } = profileObj;
          await setItem('gradence_profile', JSON.stringify(cleanProfile));

          setProfile(profileObj);
          setIsInitialized(true);
        }

        if (storedSemesters) setSemesters(JSON.parse(storedSemesters));
        if (storedAttendance) setAttendanceSubjects(JSON.parse(storedAttendance));
        if (storedExams) setExams(JSON.parse(storedExams));
        if (storedActivities) setActivities(JSON.parse(storedActivities));
        if (storedRoadmaps) setRoadmaps(JSON.parse(storedRoadmaps));
        if (storedTimetable) setTimetable(JSON.parse(storedTimetable));
        if (storedCountdowns) setCountdowns(JSON.parse(storedCountdowns));
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        if (storedCoding) setCodingProfiles(JSON.parse(storedCoding));
      } catch (e) {
        console.error('Failed to load storage values in GradenceContext', e);
      } finally {
        setIsStorageLoading(false);
      }
    }
    loadData();
  }, []);

  const logActivity = async (type: Activity['type'], title: string, detail: string) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type,
      title,
      detail,
      timestamp: new Date().toISOString()
    };
    const updated = [newActivity, ...activities].slice(0, 20);
    setActivities(updated);
    await setItem('gradence_activities', JSON.stringify(updated));
  };

  const updateProfile = async (newProfile: UserProfile) => {
    if (newProfile.groqApiKey !== undefined) {
      await saveApiKey(newProfile.groqApiKey);
    }
    const { groqApiKey, ...cleanProfile } = newProfile;
    await setItem('gradence_profile', JSON.stringify(cleanProfile));
    setProfile(newProfile);
    setIsInitialized(true);
    await logActivity('profile', 'Settings Changed', 'System and academic parameters updated.');
  };

  const saveSemester = async (semester: Semester) => {
    const existsIdx = semesters.findIndex(s => s.number === semester.number);
    let updated: Semester[];
    if (existsIdx >= 0) {
      updated = [...semesters];
      updated[existsIdx] = semester;
    } else {
      updated = [...semesters, semester].sort((a, b) => a.number - b.number);
    }
    setSemesters(updated);
    await setItem('gradence_semesters', JSON.stringify(updated));
    await logActivity('cgpa', `Semester ${semester.number} Saved`, `Archived ${semester.subjects.length} courses with an SGPA of ${semester.sgpa.toFixed(2)}.`);

    if (profile && semester.number >= profile.currentSemester && semester.number < 8) {
      const updatedProfile = { ...profile, currentSemester: semester.number + 1 };
      setProfile(updatedProfile);
      const { groqApiKey: _, ...cleanProf } = updatedProfile;
      await setItem('gradence_profile', JSON.stringify(cleanProf));
    }
  };

  const saveAttendance = async (subjects: AttendanceSubject[]) => {
    setAttendanceSubjects(subjects);
    await setItem('gradence_attendance_subjects', JSON.stringify(subjects));
  };

  const saveExams = async (newExams: Exam[]) => {
    setExams(newExams);
    await setItem('gradence_exams', JSON.stringify(newExams));
    if (newExams.length > exams.length) {
      const added = newExams[newExams.length - 1];
      await logActivity('exam', 'Exam Scheduled', `Assessment for "${added.subject}" set for ${added.date}.`);
    } else if (newExams.length < exams.length) {
      await logActivity('exam', 'Assessment Cleared', 'Upcoming assessment log updated.');
    }
  };

  const saveTimetable = async (list: TimetableItem[]) => {
    setTimetable(list);
    await setItem('gradence_timetable', JSON.stringify(list));
  };

  const saveCountdowns = async (list: CountdownItem[]) => {
    setCountdowns(list);
    await setItem('gradence_countdowns', JSON.stringify(list));
  };

  const saveHabits = async (list: HabitItem[]) => {
    setHabits(list);
    await setItem('gradence_habits', JSON.stringify(list));
  };

  const saveCodingProfiles = async (data: CodingProfilesState) => {
    setCodingProfiles(data);
    await setItem('gradence_coding_profiles', JSON.stringify(data));
  };

  const resetData = async () => {
    await clearAll();
    await removeApiKey();
    setProfile(null);
    setSemesters([]);
    setAttendanceSubjects([]);
    setExams([]);
    setActivities([]);
    setRoadmaps([]);
    setTimetable([]);
    setCountdowns([]);
    setHabits([]);
    setCodingProfiles(null);
    setIsInitialized(false);
  };

  const exportData = async (): Promise<string> => {
    const backupObj = {
      profile,
      semesters,
      attendanceSubjects,
      exams,
      activities,
      roadmaps,
      timetable,
      countdowns,
      habits,
      coding: codingProfiles
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importData = async (dataString: string): Promise<boolean> => {
    try {
      if (!dataString || !dataString.trim()) {
        return false;
      }
      
      const parsed = JSON.parse(dataString);
      if (!parsed.profile || typeof parsed.profile !== 'object' || typeof parsed.profile.name !== 'string') {
        return false;
      }

      // Sanitize profile to avoid runtime UI crashes
      const rawProfile = parsed.profile;
      const sanitizedProfile: UserProfile = {
        name: typeof rawProfile.name === 'string' ? rawProfile.name : 'Student',
        university: typeof rawProfile.university === 'string' ? rawProfile.university : 'General University',
        currentSemester: typeof rawProfile.currentSemester === 'number' ? rawProfile.currentSemester : 1,
        theme: (rawProfile.theme === 'light' || rawProfile.theme === 'dark' || rawProfile.theme === 'system') ? rawProfile.theme : 'dark',
        gpaScale: (rawProfile.gpaScale === 4 || rawProfile.gpaScale === 10) ? rawProfile.gpaScale : 10,
        groqApiKey: typeof rawProfile.groqApiKey === 'string' ? rawProfile.groqApiKey : ''
      };

      const { groqApiKey, ...cleanProfile } = sanitizedProfile;
      if (groqApiKey) {
        await saveApiKey(groqApiKey);
      } else {
        await removeApiKey();
      }
      await setItem('gradence_profile', JSON.stringify(cleanProfile));
      setProfile(sanitizedProfile);

      // Validate & restore semesters
      const sems = Array.isArray(parsed.semesters) ? parsed.semesters : [];
      await setItem('gradence_semesters', JSON.stringify(sems));
      setSemesters(sems);

      // Validate & restore attendance
      const att = Array.isArray(parsed.attendanceSubjects) ? parsed.attendanceSubjects : 
                  (Array.isArray(parsed.attendance) ? parsed.attendance : []);
      await setItem('gradence_attendance_subjects', JSON.stringify(att));
      setAttendanceSubjects(att);

      // Validate & restore exams
      const ex = Array.isArray(parsed.exams) ? parsed.exams : [];
      await setItem('gradence_exams', JSON.stringify(ex));
      setExams(ex);

      // Validate & restore activities
      const act = Array.isArray(parsed.activities) ? parsed.activities : [];
      await setItem('gradence_activities', JSON.stringify(act));
      setActivities(act);

      // Validate & restore roadmaps
      const road = Array.isArray(parsed.roadmaps) ? parsed.roadmaps : [];
      await setItem('gradence_followed_roadmaps', JSON.stringify(road));
      setRoadmaps(road);

      // Validate & restore timetable
      const time = Array.isArray(parsed.timetable) ? parsed.timetable : [];
      await setItem('gradence_timetable', JSON.stringify(time));
      setTimetable(time);

      // Validate & restore countdowns
      const count = Array.isArray(parsed.countdowns) ? parsed.countdowns : [];
      await setItem('gradence_countdowns', JSON.stringify(count));
      setCountdowns(count);

      // Validate & restore habits
      const habs = Array.isArray(parsed.habits) ? parsed.habits : [];
      await setItem('gradence_habits', JSON.stringify(habs));
      setHabits(habs);

      // Validate & restore coding profiles
      if (parsed.coding && typeof parsed.coding === 'object') {
        await setItem('gradence_coding_profiles', JSON.stringify(parsed.coding));
        setCodingProfiles(parsed.coding);
      } else {
        await setItem('gradence_coding_profiles', JSON.stringify(null));
        setCodingProfiles(null);
      }

      setIsInitialized(true);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const saveRoadmaps = async (updated: CareerRoadmap[]) => {
    setRoadmaps(updated);
    await setItem('gradence_followed_roadmaps', JSON.stringify(updated));
  };

  return (
    <GradenceContext.Provider
      value={{
        profile,
        semesters,
        attendanceSubjects,
        exams,
        activities,
        roadmaps,
        timetable,
        countdowns,
        habits,
        codingProfiles,
        isInitialized,
        isStorageLoading,
        updateProfile,
        saveSemester,
        saveAttendance,
        saveExams,
        saveTimetable,
        saveCountdowns,
        saveHabits,
        saveCodingProfiles,
        saveRoadmaps,
        logActivity,
        resetData,
        importData,
        exportData
      }}
    >
      {children}
    </GradenceContext.Provider>
  );
};

export const useGradence = () => {
  const context = useContext(GradenceContext);
  if (context === undefined) {
    throw new Error('useGradence must be used within a GradenceProvider');
  }
  return context;
};
