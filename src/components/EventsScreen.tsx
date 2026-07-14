import { useState } from 'react';
import { Building2, Trophy, Clock } from 'lucide-react';

export default function EventsScreen() {
  const [tab, setTab] = useState<'internal' | 'external'>('internal');

  return (
    <div className="space-y-4">
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

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[20px] p-10 flex flex-col items-center justify-center text-center gap-3">
        <Clock className="w-8 h-8 text-neutral-600" />
        <p className="text-sm font-semibold text-white">Coming Soon</p>
        <p className="text-xs text-neutral-500">
          {tab === 'internal'
            ? 'Campus events from Sri Eshwar will be listed here.'
            : 'Live hackathons & competitions from Unstop will appear here.'}
        </p>
      </div>
    </div>
  );
}
