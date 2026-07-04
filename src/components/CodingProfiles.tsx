import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Code, Github, Award, Flame, Save, RefreshCw } from 'lucide-react';

interface CodingProfilesProps {
  onBack: () => void;
}

interface ProfileData {
  username: string;
  solved: number;
  rating: string;
}

export default function CodingProfiles({ onBack }: CodingProfilesProps) {
  const [leetcode, setLeetcode] = useState<ProfileData>({ username: '', solved: 0, rating: 'Beginner' });
  const [github, setGithub] = useState<ProfileData>({ username: '', solved: 0, rating: '0 Repos' });
  const [codeforces, setCodeforces] = useState<ProfileData>({ username: '', solved: 0, rating: 'Newbie' });
  const [atcoder, setAtcoder] = useState<ProfileData>({ username: '', solved: 0, rating: 'Grey' });
  const [codechef, setCodechef] = useState<ProfileData>({ username: '', solved: 0, rating: '1-Star' });

  const [isSaved, setIsSaved] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gradence_coding_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.leetcode) setLeetcode(parsed.leetcode);
        if (parsed.github) setGithub(parsed.github);
        if (parsed.codeforces) setCodeforces(parsed.codeforces);
        if (parsed.atcoder) setAtcoder(parsed.atcoder);
        if (parsed.codechef) setCodechef(parsed.codechef);
      } catch (e) {
        console.error('Failed to load coding profiles', e);
      }
    }
  }, []);

  const handleSave = () => {
    const data = { leetcode, github, codeforces, atcoder, codechef };
    localStorage.setItem('gradence_coding_profiles', JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSyncProfiles = () => {
    setIsFetching(true);
    setTimeout(() => {
      // Intuitively calculate hypothetical progress based on entered handles
      if (leetcode.username) {
        setLeetcode(prev => ({ ...prev, solved: Math.max(12, Math.floor(Math.random() * 200) + 50), rating: 'Specialist' }));
      }
      if (github.username) {
        setGithub(prev => ({ ...prev, solved: Math.max(5, Math.floor(Math.random() * 30) + 10), rating: 'Active Contributor' }));
      }
      if (codeforces.username) {
        setCodeforces(prev => ({ ...prev, solved: Math.max(8, Math.floor(Math.random() * 150) + 30), rating: 'Pupil' }));
      }
      if (atcoder.username) {
        setAtcoder(prev => ({ ...prev, solved: Math.max(4, Math.floor(Math.random() * 80) + 15), rating: 'Brown' }));
      }
      if (codechef.username) {
        setCodechef(prev => ({ ...prev, solved: Math.max(6, Math.floor(Math.random() * 100) + 20), rating: '3-Star' }));
      }
      setIsFetching(false);
    }, 1500);
  };

  const totalSolved = leetcode.solved + github.solved + codeforces.solved + atcoder.solved + codechef.solved;

  return (
    <div id="coding-profiles" className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">PORTFOLIO</span>
          <h1 className="text-xl font-bold text-white font-odoo-slant">Coding Profile Tracker</h1>
        </div>
      </div>

      {/* Overview Block */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-mono">{totalSolved} Problems</h3>
            <span className="text-xs text-neutral-400 mt-1 block">Total Solved Across All Competitive Platforms</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncProfiles}
              disabled={isFetching}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-xs font-semibold rounded-xl text-white hover:border-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Simulate Sync</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none py-2.5 px-5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved!' : 'Save Handles'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { 
            name: 'LeetCode', 
            icon: Code, 
            state: leetcode, 
            set: setLeetcode, 
            ph: 'leetcode_user', 
            metric: 'Problems Solved',
            ratingLabel: 'Rank Tier'
          },
          { 
            name: 'GitHub', 
            icon: Github, 
            state: github, 
            set: setGithub, 
            ph: 'github_user', 
            metric: 'Contributions/Repos',
            ratingLabel: 'Profile Status'
          },
          { 
            name: 'Codeforces', 
            icon: Award, 
            state: codeforces, 
            set: setCodeforces, 
            ph: 'cf_handle', 
            metric: 'Solved Problems',
            ratingLabel: 'Contest Rank'
          },
          { 
            name: 'AtCoder', 
            icon: Flame, 
            state: atcoder, 
            set: setAtcoder, 
            ph: 'atcoder_id', 
            metric: 'Solved Tasks',
            ratingLabel: 'Rating Color'
          },
          { 
            name: 'CodeChef', 
            icon: Award, 
            state: codechef, 
            set: setCodechef, 
            ph: 'codechef_chef', 
            metric: 'Problems Solved',
            ratingLabel: 'Stars Tier'
          },
        ].map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{platform.name}</h4>
                  <span className="text-[10px] text-neutral-500 font-mono">Platform profile configuration</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Username handle */}
                <div className="space-y-1">
                  <label htmlFor={`handle-${platform.name}`} className="text-[9px] font-mono text-neutral-450 uppercase">Username / Handle</label>
                  <input
                    id={`handle-${platform.name}`}
                    type="text"
                    value={platform.state.username}
                    onChange={(e) => platform.set({ ...platform.state, username: e.target.value })}
                    placeholder={platform.ph}
                    className="w-full bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>

                {/* Problems Solved count & rating tier */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor={`solved-${platform.name}`} className="text-[9px] font-mono text-neutral-450 uppercase">{platform.metric}</label>
                    <input
                      id={`solved-${platform.name}`}
                      type="number"
                      min="0"
                      value={platform.state.solved || ''}
                      onChange={(e) => platform.set({ ...platform.state, solved: Math.max(0, parseInt(e.target.value) || 0) })}
                      placeholder="0"
                      className="w-full bg-black border border-neutral-855 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`rating-${platform.name}`} className="text-[9px] font-mono text-neutral-450 uppercase">{platform.ratingLabel}</label>
                    <input
                      id={`rating-${platform.name}`}
                      type="text"
                      value={platform.state.rating}
                      onChange={(e) => platform.set({ ...platform.state, rating: e.target.value })}
                      placeholder="e.g. Master"
                      className="w-full bg-black border border-neutral-855 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
