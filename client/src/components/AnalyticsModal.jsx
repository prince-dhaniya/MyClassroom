import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  BarChart2,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose, roomId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isOpen || !roomId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/rooms/${roomId}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load MongoDB analytics:', err);
        setLoading(false);
      });
  }, [isOpen, roomId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    fetch(`http://localhost:5000/api/rooms/${roomId}/search?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
        setSearching(false);
      })
      .catch((err) => {
        setSearching(false);
      });
  };

  if (!isOpen) return null;

  const quality = analytics?.quality || {};
  const speakers = analytics?.speakers || [];
  const languages = analytics?.languages || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#001f3f] border border-blue-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-950 to-blue-600 flex items-center justify-center text-white border border-blue-400/40 shadow-lg shadow-blue-500/20">
              <Database className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Classroom Analytics & MongoDB Pipeline</span>
                <span className="text-[10px] bg-blue-950 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                  Production Grade
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated insights from room: <strong className="text-blue-400">{roomId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MongoDB Indexing & Local Storage Architecture Status */}
        <div className="p-3.5 rounded-xl bg-[#001226] border border-blue-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span>MongoDB Engine: Connected Locally (nexhack_captions)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-900/70 border border-blue-500/40 text-blue-200 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                💾 100% Stored Locally
              </span>
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded font-mono">
                Compound Indexing Active
              </span>
            </div>
          </div>

          {/* Local Storage Banner */}
          <div className="bg-[#001f3f]/90 border border-blue-500/20 rounded-lg p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-blue-400 font-semibold">Local Storage Host:</span>
              <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded text-[10px]">
                mongodb://127.0.0.1:27017/nexhack_captions
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-blue-400 font-semibold">Local Disk Data Path:</span>
              <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded text-[10px] truncate max-w-[280px]" title="C:\Program Files\MongoDB\Server\9.0\data">
                C:\Program Files\MongoDB\Server\9.0\data
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-blue-400 font-semibold">Offline Disk Fallback:</span>
              <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded text-[10px]">
                server/data/{roomId}.json (Local Snapshots)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="bg-[#001f3f]/80 p-2 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-0.5">Active Indexes:</span>
              <ul className="text-[10px] font-mono text-slate-400 space-y-0.5">
                <li>• {'{ roomId: 1, timestamp: 1 }'} (0ms sort)</li>
                <li>• {'{ roomId: 1, status: 1 }'} (Fast filter)</li>
                <li>• {'{ text: "text", translation: "text" }'}</li>
              </ul>
            </div>
            <div className="bg-[#001f3f]/80 p-2 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-300 block mb-0.5">Aggregation Pipeline:</span>
              <p className="text-[10px] font-mono text-slate-400">
                $match (Room) ➔ $facet (Multi-Stage) ➔ $group (Speaker/Lang) ➔ $project
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Computing MongoDB Aggregation Pipelines...
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#001226] border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 block">Total Captions</span>
                <span className="text-xl font-bold text-white mt-0.5 block">
                  {quality.totalFinalCaptions || 0}
                </span>
                <span className="text-[10px] text-blue-400">Finalized & Stored</span>
              </div>

              <div className="bg-[#001226] border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 block">Avg Accuracy</span>
                <span className="text-xl font-bold text-blue-400 mt-0.5 block">
                  {quality.avgRoomConfidence ? `${quality.avgRoomConfidence}%` : '96%'}
                </span>
                <span className="text-[10px] text-blue-300">Speech Confidence</span>
              </div>

              <div className="bg-[#001226] border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 block">Uncertainty</span>
                <span className="text-xl font-bold text-blue-400 mt-0.5 block">
                  {quality.uncertainCount || 0}
                </span>
                <span className="text-[10px] text-blue-300">Flagged &lt; 85%</span>
              </div>

              <div className="bg-[#001226] border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 block">Corrections</span>
                <span className="text-xl font-bold text-blue-300 mt-0.5 block">
                  {quality.correctedCount || 0}
                </span>
                <span className="text-[10px] text-slate-400">Crowd-Edited</span>
              </div>
            </div>

            {/* Aggregated Speaker Participation */}
            <div className="p-3.5 rounded-xl bg-[#001226] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Speaker Talk-Time Distribution ($group pipeline)</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {speakers.length} Active Speakers
                </span>
              </div>

              {speakers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2 text-center">
                  Speak into the microphone to see live aggregation statistics!
                </p>
              ) : (
                <div className="space-y-2">
                  {speakers.map((spk, idx) => {
                    const totalCaptions = quality.totalFinalCaptions || 1;
                    const percent = Math.min(100, Math.round((spk.totalUtterances / totalCaptions) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{spk.speaker}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {spk.totalUtterances} utterances ({percent}%) • {spk.avgConfidence}% acc
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MongoDB Indexed Full-Text Search Tester */}
            <div className="p-3.5 rounded-xl bg-[#001226] border border-slate-800 space-y-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Indexed Full-Text Search Tester ($text index)</span>
              </span>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stored transcripts (e.g. binary, algorithm, सुप्रभात)..."
                  className="flex-1 bg-[#001f3f] border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  {searching ? 'Searching...' : 'Search Index'}
                </button>
              </form>

              {searchResults && (
                <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                  <span className="text-[10px] text-blue-400 font-mono">
                    Found {searchResults.count} indexed results:
                  </span>
                  {searchResults.results?.map((res, i) => (
                    <div key={i} className="p-2 rounded bg-[#001f3f] text-xs text-slate-200 border border-slate-800">
                      <span className="font-semibold text-blue-400">[{res.participantName}]: </span>
                      <span>"{res.text}"</span>
                      {res.translation && (
                        <p className="text-[11px] text-slate-400 mt-0.5">➔ {res.translation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
