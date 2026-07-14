import { useState, ChangeEvent } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CapgoFilePicker } from '@capgo/capacitor-file-picker';
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
  onImportData: (dataString: string) => Promise<boolean>;
  onExportData: () => Promise<string>;
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
  const [groqApiKey, setGroqApiKey] = useState(profile.groqApiKey || '');

  const [isSaved, setIsSaved] = useState(false);
  const [isImportBoxOpen, setIsImportBoxOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeInfoPage, setActiveInfoPage] = useState<'about' | 'faq' | 'privacy' | 'terms' | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: name.trim(),
      university: university.trim(),
      currentSemester,
      theme,
      gpaScale,
      groqApiKey: groqApiKey.trim()
    });
    localStorage.setItem('gradence_groq_api_key', groqApiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleBackup = async () => {
    try {
      const dataStr = await onExportData();
      const filename = `gradence_backup_${new Date().toISOString().split('T')[0]}.json`;

      // 1. Save backup as a physical JSON file using Capacitor Filesystem
      const result = await Filesystem.writeFile({
        path: filename,
        data: dataStr,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      });

      // 2. Alert the user with the success state and native path
      alert(`Backup exported successfully!\n\nSaved to Documents folder:\n${result.uri}`);

      // 3. Optionally launch the native share sheet
      if (navigator.share) {
        try {
          const file = new File([dataStr], filename, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Gradence Backup JSON',
              text: 'Gradence offline data profile backup file.'
            });
          }
        } catch (shareErr) {
          console.warn('Optional native share sheet was cancelled or failed', shareErr);
        }
      }
    } catch (e: any) {
      console.error('Backup trigger failed', e);
      alert(`Failed to save backup file: ${e.message || e}`);
    }
  };

  const handleCopyBackup = async () => {
    try {
      const dataStr = await onExportData();
      navigator.clipboard.writeText(dataStr);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to copy JSON backup. Please use manual export.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultText = event.target?.result;
      if (typeof resultText === 'string') {
        setImportText(resultText);
        setImportStatus('idle');
      }
    };
    reader.onerror = () => {
      alert('Failed to read file. Please verify it is a valid JSON document.');
    };
    reader.readAsText(file);
  };

  const handleUploadFileClick = async () => {
    try {
      const result = await CapgoFilePicker.pickFiles({
        types: ['application/json'],
        readData: true
      });

      if (result.files && result.files.length > 0) {
        const file = result.files[0];
        if (file.data) {
          // Decode base64 file data string
          const decoded = atob(file.data);
          setImportText(decoded);
          setImportStatus('idle');
          alert(`Backup file "${file.name}" loaded successfully.\n\nClick "Verify and Restore" to import.`);
        }
      }
    } catch (e: any) {
      console.warn('Native FilePicker failed, falling back to hidden HTML file input click', e);
      const hiddenInput = document.getElementById('hidden-file-input');
      if (hiddenInput) {
        hiddenInput.click();
      }
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    const success = await onImportData(importText.trim());
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
    setIsDeleteModalOpen(true);
  };

  if (activeInfoPage === 'about') {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveInfoPage(null)}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">INFO</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">About Gradence</h1>
          </div>
        </div>

        <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
          <p className="text-xs text-neutral-350 leading-relaxed">
            <strong>Gradence</strong> is an AI-powered academic operating system designed for modern students. It helps organize grades, forecast attendance, plan assessments, track competitive coding progress, and generate structured career roadmaps offline-first.
          </p>
          <div className="border-t border-neutral-900 pt-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Developed By</span>
              <span className="text-white font-mono">Team_Detroit</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Contact Email</span>
              <a href="mailto:theteamdetroit@gmail.com" className="text-white hover:underline font-mono">theteamdetroit@gmail.com</a>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-550">Application Version</span>
              <span className="text-neutral-300 font-mono">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeInfoPage === 'faq') {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveInfoPage(null)}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">FAQ</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">Help & FAQ</h1>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { q: 'Where is my data stored?', a: 'All grade logs, attendance registries, and local settings are stored 100% offline inside your device’s local browser/webview sandbox storage. No personal data is ever uploaded to external servers.' },
            { q: 'How does the Attendance Tracker work?', a: 'It calculates your current active lecture logs. The predictor forecasts whether you can safely skip upcoming sessions without falling below your requested minimum attendance threshold (e.g. 75%).' },
            { q: 'Can I backup my profile details?', a: 'Yes! Use the "Export JSON" button inside the Settings page to download your full system backup file. You can load this backup on any device using "Import Backup".' },
            { q: 'How do I add custom coding profile handles?', a: 'Under the Tools section, launch the Coding Profile Tracker. Enter your user handles for Codeforces and GitHub to auto-sync problem counts. LeetCode and CodeChef counts can be managed manually.' }
          ].map((faq, idx) => (
            <div key={idx} className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-5 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{faq.q}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeInfoPage === 'privacy') {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveInfoPage(null)}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">POLICY</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">Privacy Policy</h1>
          </div>
        </div>

        <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4 text-xs text-neutral-350 leading-relaxed">
          <h3 className="font-bold text-white uppercase font-mono">1. Local Storage-First Sandbox</h3>
          <p>Gradence operates entirely offline. Your data, configuration profiles, and API credentials are kept strictly on your local device. We have zero access to your information.</p>
          <h3 className="font-bold text-white uppercase font-mono mt-4">2. Zero Analytics & Tracking</h3>
          <p>We do not use telemetry tools, cookies, trackers, or user behavioral analytics. The application operates silently and privately.</p>
          <h3 className="font-bold text-white uppercase font-mono mt-4">3. Third-Party Endpoints</h3>
          <p>When you sync your Codeforces or GitHub handles, queries run directly from your client IP to public APIs. These external calls are subject to their respective terms and privacy policies.</p>
        </div>
      </div>
    );
  }

  if (activeInfoPage === 'terms') {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveInfoPage(null)}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">LEGAL</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">Terms & Conditions</h1>
          </div>
        </div>

        <div className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4 text-xs text-neutral-350 leading-relaxed">
          <h3 className="font-bold text-white uppercase font-mono">1. Agreement to Terms</h3>
          <p>By using the Gradence application, you agree to comply with these terms. Gradence is a personal academic tracking utility provided to you free of charge.</p>
          <h3 className="font-bold text-white uppercase font-mono mt-4">2. "As Is" Provision</h3>
          <p>This software is provided "as is" without warranty of any kind. Predictions (including attendance allowances or target SGPA requirements) are forecasts based on user-supplied numbers and should be self-verified.</p>
          <h3 className="font-bold text-white uppercase font-mono mt-4">3. Third-Party API Limits</h3>
          <p>You agree to use external developer APIs (e.g. Groq Cloud, GitHub REST, Codeforces REST) responsibly within their respective usage limits.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="settings-screen" className="space-y-8 pb-4">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block flex items-center gap-1.5 bg-neutral-950 border border-neutral-900 rounded-full px-2.5 py-1 w-fit mb-1 shadow-inner">
          <Settings className="w-3.5 h-3.5 text-college-yellow" />
          SRI ESHWAR CAMPUS CORE
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

          <div className="space-y-1">
            <label htmlFor="student-theme-select" className="text-[10px] font-mono text-neutral-400 uppercase">App Color Theme</label>
            <select
              id="student-theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold h-9"
            >
              <option value="se-dark">Sri Eshwar Dark</option>
              <option value="se-light">Sri Eshwar White</option>
              <option value="dark">Classic Dark</option>
              <option value="light">Nordic Light</option>
              <option value="system">System Synchronized</option>
            </select>
          </div>

          {/* Groq Cloud API Key Input */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="groq-api-key-input" className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              Groq API Key
            </label>
            <input
              id="groq-api-key-input"
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
            />
            <span className="text-[9px] font-mono text-neutral-500 block">
              Direct connection to Groq Llama Inference. Keys are saved only locally.
            </span>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleBackup}
            className="py-3 border border-[#2A2A2A] rounded-xl text-xs font-semibold text-neutral-300 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={handleCopyBackup}
            className="py-3 border border-[#2A2A2A] rounded-xl text-xs font-semibold text-neutral-300 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span>{copySuccess ? 'Copied Backup!' : 'Copy to Clipboard'}</span>
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
            
            <div className="border-t border-neutral-800/60 pt-3 space-y-1.5">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                OR SELECT BACKUP JSON FILE
              </span>
              <button
                type="button"
                onClick={handleUploadFileClick}
                className="w-full py-2.5 bg-black/40 border border-neutral-900 hover:border-neutral-700 rounded-xl text-xs text-neutral-350 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                <Upload className="w-4 h-4" />
                <span>Upload JSON File</span>
              </button>
              <input
                id="hidden-file-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            
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

      {/* Informational Guidelines Section */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Info className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            GRADENCE SYSTEM DETAILS
          </h3>
        </div>

        <div className="space-y-2">
          {[
            { id: 'about', label: 'About Gradence' },
            { id: 'faq', label: 'Help & FAQ' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'terms', label: 'Terms & Conditions' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveInfoPage(item.id as any)}
              className="w-full p-3.5 bg-black/40 border border-neutral-900 hover:border-neutral-700 rounded-xl flex justify-between items-center text-xs text-neutral-200 transition-all cursor-pointer font-medium"
            >
              <span>{item.label}</span>
              <span className="text-neutral-500 font-mono">&rarr;</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 font-mono pt-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DESIGNED FOR PRIVACY-FIRST FOCUS</span>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121213] border border-[#2A2A2A] rounded-[28px] max-w-sm w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="space-y-2 text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Erase All Database Records?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Deleting all data is permanent. We strongly recommend exporting a backup before continuing.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await handleBackup();
                }}
                className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup First</span>
              </button>
              
              <button
                onClick={async () => {
                  await onResetData();
                  setIsDeleteModalOpen(false);
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Anyway</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-2.5 bg-transparent border border-neutral-900 hover:border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
