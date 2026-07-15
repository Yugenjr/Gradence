import { useState } from 'react';
import { ArrowLeft, Clock, CheckSquare, Calendar, Plus, Trash2, Save } from 'lucide-react';
import { useGradence } from '../context/GradenceContext';

interface DailyPlannerProps {
  onBack: () => void;
}

interface TimetableItem {
  id: string;
  subject: string;
  time: string;
  room: string;
}

interface CountdownItem {
  id: string;
  title: string;
  date: string;
}

interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
}

export default function DailyPlanner({ onBack }: DailyPlannerProps) {
  const [activeTab, setActiveTab] = useState<'timetable' | 'habits' | 'countdowns'>('timetable');

  const {
    timetable,
    habits,
    countdowns,
    saveTimetable,
    saveHabits,
    saveCountdowns
  } = useGradence();

  // Form states
  const [classSubject, setClassSubject] = useState('');
  const [classTime, setClassTime] = useState('');
  const [classRoom, setClassRoom] = useState('');

  const [habitName, setHabitName] = useState('');

  const [cdTitle, setCdTitle] = useState('');
  const [cdDate, setCdDate] = useState('');

  // Actions
  const handleAddClass = () => {
    if (!classSubject.trim() || !classTime.trim()) return;

    // Format classTime from 24h "HH:MM" to 12h "HH:MM AM/PM"
    let formattedTime = classTime.trim();
    const timeParts = classTime.match(/^(\d{2}):(\d{2})$/);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = timeParts[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
      formattedTime = `${hoursStr}:${minutes} ${ampm}`;
    }

    const newItem: TimetableItem = {
      id: `class-${Date.now()}`,
      subject: classSubject.trim(),
      time: formattedTime,
      room: classRoom.trim() || 'General'
    };
    saveTimetable([...timetable, newItem]);
    setClassSubject('');
    setClassTime('');
    setClassRoom('');
  };

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    const newItem: HabitItem = {
      id: `hab-${Date.now()}`,
      name: habitName.trim(),
      completed: false
    };
    saveHabits([...habits, newItem]);
    setHabitName('');
  };

  const handleAddCountdown = () => {
    if (!cdTitle.trim() || !cdDate.trim()) return;
    const newItem: CountdownItem = {
      id: `cd-${Date.now()}`,
      title: cdTitle.trim(),
      date: cdDate
    };
    saveCountdowns([...countdowns, newItem]);
    setCdTitle('');
    setCdDate('');
  };

  const handleDeleteClass = (id: string) => {
    saveTimetable(timetable.filter(c => c.id !== id));
  };

  const handleDeleteHabit = (id: string) => {
    saveHabits(habits.filter(h => h.id !== id));
  };

  const handleDeleteCountdown = (id: string) => {
    saveCountdowns(countdowns.filter(c => c.id !== id));
  };

  return (
    <div id="daily-planner" className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block font-mono">STUDENT LIFE OS</span>
          <h1 className="text-xl font-bold text-white">
            OS Daily <span className="font-odoo-slant">Planner</span>
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#121213] border border-[#2A2A2A] rounded-2xl p-1 gap-1">
        {[
          { id: 'timetable', label: 'Class Timetable', icon: Clock },
          { id: 'habits', label: 'Habit Matrix', icon: CheckSquare },
          { id: 'countdowns', label: 'Target Dates', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${isActive ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form and listing container */}
      <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-6">

        {/* Tab 1: Timetable */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">ADD DAILY CLASS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Subject / Course"
                  value={classSubject}
                  onChange={(e) => setClassSubject(e.target.value)}
                  className="bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="time"
                  value={classTime}
                  onChange={(e) => setClassTime(e.target.value)}
                  className="bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="Room (e.g. Room 402)"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  className="bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <button
                onClick={addClassSubject => handleAddClass()}
                className="py-2.5 px-4 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200"
              >
                <Plus className="w-3.5 h-3.5" /> Save Lecture Time
              </button>
            </div>

            <div className="border-t border-neutral-900 pt-6 space-y-3">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">SCHEDULED CLASSES</h3>
              {timetable.length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono">No lectures added for today.</p>
              ) : (
                timetable.map((item) => (
                  <div key={item.id} className="p-3.5 bg-black/40 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.time} - {item.subject}</span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">{item.room}</span>
                    </div>
                    <button onClick={() => handleDeleteClass(item.id)} className="text-neutral-500 hover:text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Habits */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">ADD NEW HABIT OBJECTIVE</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Code 1 dynamic programming question"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="flex-1 bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleAddHabit}
                  className="py-2 px-4 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200"
                >
                  Add Habit
                </button>
              </div>
            </div>

            <div className="border-t border-neutral-900 pt-6 space-y-3">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">HABIT CHECKLIST</h3>
              {habits.length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono">No custom habits configured.</p>
              ) : (
                habits.map((item) => (
                  <div key={item.id} className="p-3.5 bg-black/40 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-neutral-200">{item.name}</span>
                    <button onClick={() => handleDeleteHabit(item.id)} className="text-neutral-500 hover:text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Countdowns */}
        {activeTab === 'countdowns' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">ADD COUNTDOWN TIMER</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Event / Target Name"
                  value={cdTitle}
                  onChange={(e) => setCdTitle(e.target.value)}
                  className="bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="date"
                  value={cdDate}
                  onChange={(e) => setCdDate(e.target.value)}
                  className="bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={handleAddCountdown}
                className="py-2.5 px-4 bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Target Date
              </button>
            </div>

            <div className="border-t border-neutral-900 pt-6 space-y-3">
              <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">SCHEDULED TARGET DATES</h3>
              {countdowns.length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono">No target dates tracked.</p>
              ) : (
                countdowns.map((item) => (
                  <div key={item.id} className="p-3.5 bg-black/40 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.title}</span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">Target: {item.date}</span>
                    </div>
                    <button onClick={() => handleDeleteCountdown(item.id)} className="text-neutral-500 hover:text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
