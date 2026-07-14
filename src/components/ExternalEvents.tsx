import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Search, Globe, Users, Filter, Code } from 'lucide-react';
// @ts-ignore
import eventsData from '../assets/events.json';

interface EventData {
  id: string;
  title: string;
  description: string;
  platform: string;
  url: string;
  image_url: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  event_type: string;
  mode: string;
  location: string;
  prize_pool: string;
  tags: string[];
  team_size: string;
  eligibility: string;
  registration_status: string;
}

export default function ExternalEvents({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');

  useEffect(() => {
    // In production, this would be a fetch() call to the raw GitHub URL
    // e.g. fetch('https://raw.githubusercontent.com/username/repo/main/scraper/events.json')
    setEvents(eventsData || []);
  }, []);

  const platforms = ['All', ...Array.from(new Set(events.map(e => e.platform)))];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || e.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const openUrl = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search hackathons, workshops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F0F10] border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                selectedPlatform === p 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-[#0F0F10] border border-neutral-900 rounded-3xl overflow-hidden hover:border-neutral-700 transition-colors flex flex-col group">
            {/* Banner image */}
            {event.image_url ? (
              <div className="h-32 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] to-transparent z-10" />
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-white uppercase">
                  {event.platform}
                </div>
              </div>
            ) : (
              <div className="h-20 w-full bg-neutral-900 relative flex items-center justify-between px-6 border-b border-neutral-800">
                <Code className="w-8 h-8 text-neutral-700" />
                <div className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-neutral-400 uppercase">
                  {event.platform}
                </div>
              </div>
            )}
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-white mb-2 leading-tight">{event.title}</h3>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-[11px] text-neutral-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{event.mode}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{event.location}</span>
                    </div>
                  )}
                  {event.start_date && (
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-900">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Status</span>
                  <span className={`text-xs font-bold ${event.registration_status.toLowerCase() === 'open' ? 'text-green-400' : 'text-neutral-300'}`}>
                    {event.registration_status}
                  </span>
                </div>
                <button 
                  onClick={() => openUrl(event.url)}
                  className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <Filter className="w-12 h-12 text-neutral-800 mb-3" />
            <p className="text-white font-bold mb-1">No events found</p>
            <p className="text-neutral-500 text-sm max-w-sm">
              We couldn't find any events matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
