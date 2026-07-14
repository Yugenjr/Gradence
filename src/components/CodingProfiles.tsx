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
  hackos?: number;
}

const getLeetcodeUrl = () => {
  // Check if running natively inside Capacitor
  const isNative = (window as any).Capacitor?.isNativePlatform ? (window as any).Capacitor.isNativePlatform() : false;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isNative && isLocal) {
    return '/leetcode-graphql';
  }
  return 'https://leetcode.com/graphql';
};

const getCodechefUrl = (username: string) => {
  // Check if running natively inside Capacitor
  const isNative = (window as any).Capacitor?.isNativePlatform ? (window as any).Capacitor.isNativePlatform() : false;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isNative && isLocal) {
    return `/codechef-api/${username}`;
  }
  return `https://codechef-rating-i7yd.onrender.com/${username}`;
};

export default function CodingProfiles({ onBack }: CodingProfilesProps) {
  const [leetcode, setLeetcode] = useState<ProfileData>({ username: '', solved: 0, rating: 'Beginner' });
  const [github, setGithub] = useState<ProfileData>({ username: '', solved: 0, rating: '0 Repos' });
  const [codeforces, setCodeforces] = useState<ProfileData>({ username: '', solved: 0, rating: 'Newbie' });
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
      if (codingProfiles.codechef) setCodechef(codingProfiles.codechef);
    }
  }, [codingProfiles]);

  const handleSave = async () => {
    const data = { leetcode, github, codeforces, codechef };
    await saveCodingProfiles(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSyncProfiles = async () => {
    setIsFetching(true);
    const synced: string[] = [];
    const failed: string[] = [];

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
        } else if (res.status === 404) {
          throw new Error('User not found on GitHub');
        } else {
          throw new Error(`API error (${res.status})`);
        }
      } catch (e: any) {
        console.error('GitHub sync failed:', e);
        failed.push(`GitHub: ${e.message || 'Network error'}`);
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
          } else {
            throw new Error('CF Status Failed');
          }
        } else if (resStatus.status === 400) {
          throw new Error('User not found on Codeforces');
        } else {
          throw new Error(`API error (${resStatus.status})`);
        }
      } catch (e: any) {
        console.error('Codeforces sync failed:', e);
        failed.push(`Codeforces: ${e.message || 'Network error'}`);
      }
    }

    // 3. Fetch LeetCode (GraphQL via proxy/direct with REST fallback)
    if (leetcode.username) {
      try {
        let success = false;
        
        // A. Attempt GraphQL query (works natively on device and locally on dev proxy)
        try {
          const query = `
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  ranking
                }
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
            }
          `;
          const res = await fetch(getLeetcodeUrl(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Referer": "https://leetcode.com"
            },
            body: JSON.stringify({
              query: query,
              variables: { username: leetcode.username }
            })
          });
          if (res.ok) {
            const info = await res.json();
            if (info?.data?.matchedUser) {
              const user = info.data.matchedUser;
              const allStats = user.submitStats?.acSubmissionNum?.find((item: any) => item.difficulty === 'All');
              const solvedVal = allStats ? allStats.count : 0;
              const rankVal = user.profile?.ranking ? `Rank #${user.profile.ranking.toLocaleString()}` : 'Beginner';
              
              setLeetcode(prev => ({
                ...prev,
                solved: solvedVal,
                rating: rankVal
              }));
              synced.push('LeetCode');
              success = true;
            } else if (info?.errors) {
              throw new Error('User not found on LeetCode');
            }
          }
        } catch (gqlErr) {
          console.warn("GraphQL sync attempt failed, trying REST API fallback...", gqlErr);
        }

        // B. Fallback to public REST API (alfa-leetcode-api) - works everywhere including production web deployments
        if (!success) {
          const [profileRes, solvedRes] = await Promise.all([
            fetch(`https://alfa-leetcode-api.onrender.com/${leetcode.username}`),
            fetch(`https://alfa-leetcode-api.onrender.com/${leetcode.username}/solved`)
          ]);
          
          if (profileRes.ok && solvedRes.ok) {
            const profileInfo = await profileRes.json();
            const solvedInfo = await solvedRes.json();
            
            if (profileInfo.errors) {
              throw new Error('User not found on LeetCode');
            }

            const solvedVal = solvedInfo.solvedProblem !== undefined ? solvedInfo.solvedProblem : 0;
            const rankVal = profileInfo.ranking ? `Rank #${parseInt(profileInfo.ranking).toLocaleString()}` : 'Beginner';
            
            setLeetcode(prev => ({
              ...prev,
              solved: solvedVal,
              rating: rankVal
            }));
            synced.push('LeetCode');
            success = true;
          }
        }

        if (!success) {
          throw new Error('All endpoints failed (Proxies might be down)');
        }
      } catch (e: any) {
        console.error('LeetCode sync failed:', e);
        failed.push(`LeetCode: ${e.message || 'Network error'}`);
      }
    }


    // 5. Fetch CodeChef
    if (codechef.username) {
      try {
        const res = await fetch(getCodechefUrl(codechef.username));
        if (res.ok) {
          const info = await res.json();
          if (info.currentRank !== undefined && info.problemSolved !== undefined) {
            const solvedVal = parseInt(info.problemSolved) || 0;
            const ratingPoints = parseInt(info.currentRank) || 0;
            
            let starsVal = '1-Star';
            if (ratingPoints >= 2500) starsVal = '7-Star';
            else if (ratingPoints >= 2200) starsVal = '6-Star';
            else if (ratingPoints >= 2000) starsVal = '5-Star';
            else if (ratingPoints >= 1800) starsVal = '4-Star';
            else if (ratingPoints >= 1600) starsVal = '3-Star';
            else if (ratingPoints >= 1400) starsVal = '2-Star';
            else starsVal = '1-Star';
            
            setCodechef(prev => ({
              ...prev,
              solved: solvedVal,
              rating: `${ratingPoints} (${starsVal})`
            }));
            synced.push('CodeChef');
          } else {
            throw new Error('Invalid response format or User not found');
          }
        } else if (res.status === 404) {
          throw new Error('User not found on CodeChef');
        } else {
          throw new Error(`API Proxy error (${res.status})`);
        }
      } catch (e: any) {
        console.error('CodeChef sync failed:', e);
        failed.push(`CodeChef: ${e.message || 'Network error, proxy might be asleep'}`);
      }
    }

    setIsFetching(false);
    
    let alertMsg = '';
    if (synced.length > 0) {
      alertMsg += `✅ Synchronized successfully: ${synced.join(', ')}\n\n`;
    }
    if (failed.length > 0) {
      alertMsg += `❌ Failed to sync:\n- ${failed.join('\n- ')}\n\nYou can try again later, or enter the values manually in the inputs.`;
    }
    
    if (!synced.length && !failed.length) {
      alertMsg = 'Please enter at least one competitive programming handle to synchronize.';
    }
    
    if (alertMsg) {
      alert(alertMsg.trim());
    }
  };

  const totalSolved = leetcode.solved + codeforces.solved + codechef.solved;

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
          <div className="flex gap-8 sm:gap-12">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white font-mono">{totalSolved} Problems</h3>
              <span className="text-xs text-neutral-400 mt-1 block">Across competitive platforms</span>
            </div>
            <div className="w-px bg-neutral-800"></div>
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white font-mono">{github.solved} Projects</h3>
              <span className="text-xs text-neutral-400 mt-1 block">Public GitHub Repositories</span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncProfiles}
              disabled={isFetching}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-neutral-900 border border-neutral-800 text-xs font-semibold rounded-xl text-white hover:border-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Sync Profiles</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none py-2.5 px-5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 !text-black" />
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
            note: 'Auto-sync available'
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
            name: 'CodeChef', 
            icon: Award, 
            state: codechef, 
            set: setCodechef, 
            ph: 'codechef_chef', 
            metric: 'Problems Solved',
            ratingLabel: 'Stars Tier',
            note: 'Auto-sync available'
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
                <div className={`grid ${platform.state.hackos !== undefined ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
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
                  {platform.state.hackos !== undefined && (
                    <div className="space-y-1">
                      <label htmlFor={`hackos-${platform.name}`} className="text-[9px] font-mono text-neutral-450 uppercase">Hackos</label>
                      <input
                        id={`hackos-${platform.name}`}
                        type="number"
                        min="0"
                        value={platform.state.hackos || ''}
                        onChange={(e) => platform.set({ ...platform.state, hackos: Math.max(0, parseInt(e.target.value) || 0) })}
                        placeholder="0"
                        className="w-full bg-black border border-neutral-855 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
