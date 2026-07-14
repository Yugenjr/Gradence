import { useState } from 'react';
import { Building2, Trophy, Clock, ArrowLeft } from 'lucide-react';

interface EventsScreenProps {
  onBack: () => void;
}

export default function EventsScreen({ onBack }: EventsScreenProps) {
  const [tab, setTab] = useState<'internal' | 'external'>('internal');

  return (
    <div id="events-screen" className="space-y-8 pb-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
          <h1 className="text-xl font-bold text-white font-odoo-slant">Campus & External Events</h1>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tab Selector Switcher */}
        <div className="flex bg-[#121213] border border-[#2A2A2A] rounded-2xl p-1 gap-1">
          {[
            { id: 'internal', label: 'Internal Events', icon: Building2 },
            { id: 'external', label: 'External Events', icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                tab === id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Detailed Status Card */}
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-12 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Clock className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-base font-bold text-white mt-2">Coming Soon</p>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {tab === 'internal'
                ? 'Sri Eshwar Campus Connect is currently cataloging upcoming internal college events. Check back soon for workshops, seminars, and tech fests.'
                : 'Hackathons, coding challenges, and innovation contests from Unstop, Devpost, and other platforms are currently syncing.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
