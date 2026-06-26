import { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Settings, 
  Sliders, 
  Trash2, 
  Download, 
  Upload, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Check, 
  ArrowLeft 
} from 'lucide-react';

interface SettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
  onImportData: (dataString: string) => boolean;
  onExportData: () => string;
}

export default function SettingsScreen({ 
  profile, 
  onUpdateProfile, 
  onResetData,
  onImportData,
  onExportData
}: SettingsScreenProps) {
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [currentSemester, setCurrentSemester] = useState(profile.currentSemester);
  const [gpaScale, setGpaScale] = useState<4 | 10>(profile.gpaScale);
  const [theme, setTheme] = useState(profile.theme);

  const [isSaved, setIsSaved] = useState(false);
  const [isImportBoxOpen, setIsImportBoxOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: name.trim(),
      university: university.trim(),
      currentSemester,
      theme,
      gpaScale
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleBackup = () => {
    try {
      const dataStr = onExportData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `gradence_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = onImportData(importText.trim());
    if (success) {
      setImportStatus('success');
      setImportText('');
      setTimeout(() => {
        setImportStatus('idle');
        setIsImportBoxOpen(false);
        // Page reload to refresh all states
        window.location.reload();
      }, 1500);
    } else {
      setImportStatus('error');
    }
  };

  const handleClearEverything = () => {
    if (window.confirm('Are you absolutely sure you want to clear all archived semesters, attendance logs, and customized profile parameters? This action is non-reversible.')) {
      onResetData();
      window.location.reload();
    }
  };

  return (
    <div id="settings-screen" className="space-y-8 pb-32">
      {/* Header */}
      <div>
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
          CONTROL CENTER
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
          System <span className="text-white font-odoo-slant">Settings</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          Configure profile details, academic grading scale, and export backups.
        </p>
      </div>

      {/* Profile Details Container */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <User className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            USER PROFILE DETAILS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="student-name-input" className="text-[10px] font-mono text-neutral-400 uppercase">Your Name</label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="student-university-input" className="text-[10px] font-mono text-neutral-400 uppercase">University</label>
            <input
              id="student-university-input"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="student-semester-select" className="text-[10px] font-mono text-neutral-400 uppercase">Active Semester</label>
            <select
              id="student-semester-select"
              value={currentSemester}
              onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold h-9"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="student-gpa-select" className="text-[10px] font-mono text-neutral-400 uppercase">GPA Grading Scale</label>
            <select
              id="student-gpa-select"
              value={gpaScale}
              onChange={(e) => setGpaScale(parseInt(e.target.value) as 4 | 10)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold h-9"
            >
              <option value="10">10.0 grading system</option>
              <option value="4">4.0 grading system</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isSaved
              ? 'bg-neutral-800 text-green-400 border border-green-900/30'
              : 'bg-white hover:bg-neutral-200 text-black'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Profile Information Saved</span>
            </>
          ) : (
            <span>Save Profile Parameters</span>
          )}
        </button>
      </div>

      {/* Backup and Restore container */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            BACKUP & OFFLINE RESTORE
          </h3>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Gradence stores all your records inside your browser's offline storage. Download manual backup files to move your logs between other devices easily.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleBackup}
            className="py-3 border border-[#2A2A2A] rounded-xl text-xs font-semibold text-neutral-300 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setIsImportBoxOpen(!isImportBoxOpen)}
            className="py-3 border border-[#2A2A2A] rounded-xl text-xs font-semibold text-neutral-300 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
          </button>
        </div>

        {isImportBoxOpen && (
          <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-3">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
              PASTE BACKUP DATA HERE
            </span>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste JSON data here (e.g. {"profile": ...})'
              rows={4}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
            />
            
            {importStatus === 'success' && (
              <p className="text-xs text-green-400 font-mono">✓ Backup data imported successfully. Reloading workspace...</p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-red-400 font-mono">✗ Invalid backup parameters. Please double-check JSON.</p>
            )}

            <button
              onClick={handleImport}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl"
            >
              Verify and Restore Records
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <ShieldAlert className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            DANGER ZONE
          </h3>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Clear all locally cached database values. All progress statistics, registered classes, and grades will be deleted.
        </p>

        <button
          onClick={handleClearEverything}
          className="w-full py-3 bg-neutral-950 hover:bg-red-950/20 text-red-500 border border-neutral-900 hover:border-red-900/30 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Erase All Database Records</span>
        </button>
      </div>

      {/* About Section */}
      <div className="p-6 bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            ABOUT GRADENCE COMPANION
          </span>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Gradence is a premium minimalist student suite. Version 1.0.0. Engineered completely for offline-first privacy. Absolutely no data is monitored, aggregated, or uploaded to any web servers.
        </p>

        <div className="flex items-center gap-1 text-[10px] text-neutral-600 font-mono mt-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DESIGNED WITH OBSESSIVE FOCUS IN 2026</span>
        </div>
      </div>
    </div>
  );
}
