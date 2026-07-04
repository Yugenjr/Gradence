import { Home, Compass, BarChart2, Settings, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNavBar({ activeTab, onChangeTab }: BottomNavBarProps) {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'tools' as TabType, label: 'Tools', icon: Compass },
    { id: 'ai' as TabType, label: 'AI Space', icon: Sparkles },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart2 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 select-none">
      <div className="bg-black/80 backdrop-blur-xl border border-[#2A2A2A] rounded-full px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-2 px-4 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                isActive 
                  ? 'text-white' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <IconComponent className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[9px] font-mono font-medium tracking-wide">
                {tab.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
