import React, { useState } from 'react';
import TranscriptItem from './TranscriptItem';
import {
  History,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

export default function HistorySliderDrawer({
  events = [],
  onSaveEdit,
  onSaveTranslation,
  onClearAllHistory,
  onDeleteEvents,
  currentSocketId,
  latestEvent,
  selectedLanguage = 'en'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUncertainOnly, setFilterUncertainOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // User Requested: jo abhi latest bola hai vo sab se upar dikhaye
  const [timeOrder, setTimeOrder] = useState('desc'); // 'desc' = latest spoken at the top

  const filteredEvents = events
    .filter((e) => {
      if (filterUncertainOnly && (!e.confidence || e.confidence >= 0.85)) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          (e.text || '').toLowerCase().includes(q) ||
          (e.participantName || '').toLowerCase().includes(q) ||
          (e.translation || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const tA = a.timestamp || 0;
      const tB = b.timestamp || 0;
      return timeOrder === 'desc' ? tB - tA : tA - tB;
    });

  const toggleSelect = (eventId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const isAllSelected = filteredEvents.length > 0 && filteredEvents.every(e => selectedIds.has(e.eventId));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map(e => e.eventId)));
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.size) return;
    if (window.confirm(`Delete ${selectedIds.size} selected history item(s)?`)) {
      onDeleteEvents(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleClearAll = () => {
    if (!events.length) return;
    if (window.confirm('Are you sure you want to CLEAR ALL history for this class? All stored speech events will be permanently reset.')) {
      onClearAllHistory();
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-[#131920] border border-[#2d333b] rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      
      {/* 1. Slim Slider Bar (Click to Slide Up / Down) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-[#131920] hover:bg-[#1a2233] border-b border-[#2d333b] flex items-center justify-between gap-3 cursor-pointer select-none transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide shrink-0">
            {getUIText('classVoiceHistory', selectedLanguage)}
          </span>
          <span className="text-[10px] bg-[#1a2233] text-blue-400 border border-[#2d333b] px-2 py-0.5 rounded-full font-mono shrink-0">
            {events.length} {getUIText('storedSpeeches', selectedLanguage)}
          </span>

          {/* Quick Ticker of Latest Speech Preview */}
          {latestEvent && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 truncate max-w-md pl-2 border-l border-[#2d333b]">
              <span className="text-blue-400 font-semibold">[{latestEvent.participantName}]:</span>
              <span className="italic truncate text-slate-300">"{latestEvent.text}"</span>
            </div>
          )}
        </div>

        {/* Right Slider Toggle Icon & Time */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {isOpen ? getUIText('clickToMinimize', selectedLanguage) : getUIText('clickToSlide', selectedLanguage)}
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 flex items-center justify-center transition border border-[#2d333b]">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* 2. Slid-Open History Content Container (Smooth Max Height) */}
      {isOpen && (
        <div className="p-3 bg-[#131920] space-y-2.5 animate-fade-in border-t border-[#2d333b]">
          
          {/* Top Action Toolbar: Search, Uncertainty Filter, and User-Requested "Clear All History" */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getUIText('searchHistoryPlaceholder', selectedLanguage)}
                className="w-full bg-[#1a2233] border border-[#2d333b] text-xs text-white rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Aggregation Time-Order Toggle (Latest on Top by default) */}
              <button
                onClick={() => setTimeOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  timeOrder === 'desc'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                    : 'bg-[#1a2233] text-slate-300 border-[#2d333b] hover:text-white'
                }`}
                title={timeOrder === 'desc' ? 'Latest speech sab se upar dikh rahi hai' : 'Purani speech pehle dikh rahi hai'}
              >
                <ArrowUpDown className="w-3 h-3 text-blue-400" />
                <span>{timeOrder === 'desc' ? getUIText('timeOrderLatest', selectedLanguage) : getUIText('timeOrderOldest', selectedLanguage)}</span>
              </button>

              <button
                onClick={() => setFilterUncertainOnly(!filterUncertainOnly)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  filterUncertainOnly
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-[#1a2233] text-slate-400 border-[#2d333b] hover:text-white'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>{getUIText('uncertainFilter', selectedLanguage)}</span>
              </button>

              {/* User-Requested: Clear All History Button */}
              <button
                onClick={handleClearAll}
                disabled={!events.length}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-sm ${
                  events.length
                    ? 'bg-blue-900/60 hover:bg-blue-800 text-blue-200 border-blue-500/50 hover:scale-102'
                    : 'bg-[#131920] text-slate-600 border-[#2d333b] cursor-not-allowed opacity-50'
                }`}
                title="Permanently Clear All History from Classroom & Local Database"
              >
                <Trash2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{getUIText('clearAllHistory', selectedLanguage)}</span>
              </button>
            </div>
          </div>

          {/* User-Requested: One by One Select Toolbar & Bulk Delete */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] rounded-xl border border-[#2d333b] text-xs gap-2 flex-wrap">
            <button
              onClick={handleToggleSelectAll}
              disabled={!filteredEvents.length}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition cursor-pointer font-medium select-none"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{getUIText('selectAll', selectedLanguage)} ({filteredEvents.length})</span>
            </button>

            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-400 font-mono font-bold bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {selectedIds.size} Selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{getUIText('deleteSelected', selectedLanguage)} ({selectedIds.size})</span>
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-slate-400 hover:text-white text-[11px] cursor-pointer underline"
                >
                  {getUIText('deselect', selectedLanguage)}
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">
                Tip: Click checkbox on any card to select one by one
              </span>
            )}
          </div>

          {/* Scrollable History List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No voice history found matching your search.
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <TranscriptItem
                  key={evt.eventId}
                  event={evt}
                  isSelected={selectedIds.has(evt.eventId)}
                  onToggleSelect={() => toggleSelect(evt.eventId)}
                  onDeleteSingle={() => {
                    if (window.confirm('Delete this history item?')) {
                      onDeleteEvents([evt.eventId]);
                    }
                  }}
                  onSaveEdit={onSaveEdit}
                  onSaveTranslation={onSaveTranslation}
                  isSelf={evt.participantId === currentSocketId}
                />
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
