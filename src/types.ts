export interface UserProfile {
  name: string;
  university: string;
  currentSemester: number;
  theme: 'se-dark' | 'se-light' | 'dark' | 'light' | 'system';
  gpaScale: 4 | 10;
  groqApiKey?: string;
}

export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string; // e.g. "A", "B+", "O", etc.
  gradePoints: number;
}

export interface Semester {
  id: string;
  number: number;
  name: string;
  sgpa: number;
  totalCredits: number;
  subjects: Subject[];
}

export interface AttendanceSubject {
  id: string;
  name: string;
  present: number;
  total: number;
  requiredPercentage: number;
  history?: ('present' | 'absent')[];
}

export interface Exam {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
}

export interface Activity {
  id: string;
  type: 'cgpa' | 'attendance' | 'exam' | 'converter' | 'profile' | 'planner';
  title: string;
  detail: string;
  timestamp: string; // ISO string
}

export interface Quote {
  text: string;
  author: string;
}

export interface RoadmapStage {
  id: string;
  name: string;
  completed: boolean;
  subStages?: RoadmapStage[];
}

export interface CareerRoadmap {
  id: string;
  title: string;
  targetRole: string;
  stages: RoadmapStage[];
  isCompleted: boolean;
  createdAt: string;
}

export type TabType = 'home' | 'tools' | 'progress' | 'settings' | 'ai';
export type ToolType = 'cgpa' | 'attendance' | 'gpa' | 'exam' | 'converter' | 'coding' | 'roadmaps' | 'planner' | 'events' | 'resume';

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
