import { useState, useEffect } from 'react';
import { Building2, Trophy, Clock, ArrowLeft, ChevronRight, Code2 } from 'lucide-react';
import ExternalEvents from './ExternalEvents';

interface EventsScreenProps {
  onBack: () => void;
}

// @ts-ignore
import fallbackEventsData from '../assets/internal_events.json';

export default function EventsScreen({ onBack }: EventsScreenProps) {
  const [tab, setTab] = useState<'internal' | 'external'>('internal');
  const [internalEvents, setInternalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch internal events from GAS Web App URL or fallback to local JSON
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const gasUrl = import.meta.env.VITE_INTERNAL_EVENTS_GAS_URL;
        let data = fallbackEventsData;
        
        if (gasUrl) {
          try {
            const response = await fetch(gasUrl);
            if (response.ok) {
              data = await response.json();
            }
          } catch (e) {
            console.error("Failed to fetch from GAS, using fallback", e);
          }
        }
        
        setInternalEvents(data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

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
        {tab === 'internal' ? (
          <div className="space-y-6 mt-4 animate-fade-in">
            {/* Section Header */}
            <div>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Campus Circulars</p>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mt-1">LATEST COLLEGE NOTIFICATIONS</h2>
            </div>

            {/* Mapped Events */}
            <div className="space-y-5">
              {loading ? (
                <div className="text-center py-10 text-neutral-400 font-mono text-xs">
                  Fetching latest circulars from cloud...
                </div>
              ) : (
                internalEvents.map((event) => (
                <div key={event.id} className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] overflow-hidden shadow-xl hover:border-neutral-700 transition-all flex flex-col md:flex-row">
                  {/* Banner Image / Placeholder */}
                  <div className="md:w-2/5 relative h-48 md:h-auto min-h-[220px] bg-neutral-900 overflow-hidden flex items-center justify-center">
                    {event.image ? (
                      <img 
                        src={event.image} 
                        alt={`${event.title} Banner`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1F1F21] to-[#0A0A0C] border-r border-[#2A2A2A] flex flex-col items-center justify-center p-6 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg">
                          <Code2 className="w-6 h-6 text-college-yellow" />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest text-center">Sri Eshwar Campus OS</span>
                      </div>
                    )}
                    {event.tag && (
                      <div className="absolute top-3 left-3 bg-college-yellow text-black text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                        {event.tag}
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {event.badges.map((badge, idx) => (
                          <span key={idx} className="text-[9px] font-semibold bg-neutral-900 border border-neutral-800 text-neutral-350 px-2.5 py-0.5 rounded-lg">
                            {badge}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-neutral-900">
                      <div>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Event Date</span>
                        <span className="text-xs text-white font-semibold block mt-0.5">{event.date}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Eligibility</span>
                        <span className="text-xs text-white font-semibold block mt-0.5">{event.eligibility}</span>
                      </div>
                    </div>

                    {/* CTA Link Button */}
                    <a 
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-college-yellow hover:bg-college-yellow-hover text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-center"
                    >
                      <span>{event.ctaText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <ExternalEvents onBack={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
