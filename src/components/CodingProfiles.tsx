import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Code, Github, Award, Flame, Save, RefreshCw } from 'lucide-react';
import { useGradence } from '../context/GradenceContext';

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

  const { codingProfiles, saveCodingProfiles } = useGradence();

  const [isSaved, setIsSaved] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Sync with context on load
  useEffect(() => {
    if (codingProfiles) {
      if (codingProfiles.leetcode) setLeetcode(codingProfiles.leetcode);
      if (codingProfiles.github) setGithub(codingProfiles.github);
      if (codingProfiles.codeforces) setCodeforces(codingProfiles.codeforces);
      if (codingProfiles.atcoder) setAtcoder(codingProfiles.atcoder);
      if (codingProfiles.codechef) setCodechef(codingProfiles.codechef);
    }
  }, [codingProfiles]);

  const handleSave = async () => {
    const data = { leetcode, github, codeforces, atcoder, codechef };
    await saveCodingProfiles(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSyncProfiles = async () => {
    setIsFetching(true);
    const synced: string[] = [];

    // 1. Fetch GitHub
    if (github.username) {
      try {
        const res = await fetch(`https://api.github.com/users/${github.username}`);
        if (res.ok) {
          const info = await res.json();
          setGithub(prev => ({
            ...prev,
            solved: info.public_repos || 0,
            rating: `${info.followers || 0} Followers`
          }));
          synced.push('GitHub');
        }
      } catch (e) {
        console.error('Failed to sync GitHub', e);
      }
    }

    // 2. Fetch Codeforces
    if (codeforces.username) {
      try {
        const resStatus = await fetch(`https://codeforces.com/api/user.status?handle=${codeforces.username}`);
        if (resStatus.ok) {
          const statusData = await resStatus.json();
          if (statusData.status === 'OK') {
            const uniqueProblems = new Set();
            statusData.result.forEach((sub: any) => {
              if (sub.verdict === 'OK' && sub.problem) {
                uniqueProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
              }
            });
            const solvedCount = uniqueProblems.size;

            // Fetch rank rating
            const resInfo = await fetch(`https://codeforces.com/api/user.info?handles=${codeforces.username}`);
            let rankName = 'Newbie';
            if (resInfo.ok) {
              const infoData = await resInfo.json();
              if (infoData.status === 'OK' && infoData.result.length > 0) {
                rankName = infoData.result[0].rank || 'Newbie';
              }
            }

            setCodeforces(prev => ({
              ...prev,
              solved: solvedCount,
              rating: rankName.charAt(0).toUpperCase() + rankName.slice(1)
            }));
            synced.push('Codeforces');
          }
        }
      } catch (e) {
        console.error('Failed to sync Codeforces', e);
      }
    }

    setIsFetching(false);
    if (synced.length > 0) {
      alert(`Synchronized ${synced.join(' & ')} successfully! Note: LeetCode, CodeChef, and AtCoder must be entered manually.`);
    } else {
      alert('Please enter a GitHub username or Codeforces handle to synchronize them.');
    }
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
              <span>Sync CF & GitHub</span>
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
            ratingLabel: 'Rank Tier',
            note: 'Manual entry required'
          },
          { 
            name: 'GitHub', 
            icon: Github, 
            state: github, 
            set: setGithub, 
            ph: 'github_user', 
            metric: 'Public Repos count',
            ratingLabel: 'Profile Status',
            note: 'Auto-sync available'
          },
          { 
            name: 'Codeforces', 
            icon: Award, 
            state: codeforces, 
            set: setCodeforces, 
            ph: 'cf_handle', 
            metric: 'Solved Problems',
            ratingLabel: 'Contest Rank',
            note: 'Auto-sync available'
          },
          { 
            name: 'AtCoder', 
            icon: Flame, 
            state: atcoder, 
            set: setAtcoder, 
            ph: 'atcoder_id', 
            metric: 'Solved Tasks',
            ratingLabel: 'Rating Color',
            note: 'Manual entry required'
          },
          { 
            name: 'CodeChef', 
            icon: Award, 
            state: codechef, 
            set: setCodechef, 
            ph: 'codechef_chef', 
            metric: 'Problems Solved',
            ratingLabel: 'Stars Tier',
            note: 'Manual entry required'
          },
        ].map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="bg-[#121213] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{platform.name}</h4>
                    <span className="text-[9px] text-neutral-500 font-mono block">Platform profile config</span>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-semibold px-2 py-0.5 rounded ${
                  platform.note.includes('Auto') ? 'bg-white/5 border border-white/10 text-neutral-300' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                }`}>
                  {platform.note}
                </span>
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
