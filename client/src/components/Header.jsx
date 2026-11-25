import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Globe,
  Clock,
  Activity,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart2,
  Crown,
  Copy,
  Check,
  Shield,
  Sun,
  Moon
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';
import { useTheme } from '../context/ThemeContext';

export default function Header({
  roomId,
  participantName,
  participantCount,
  selectedLanguage,
  connectionStatus,
  captionDelay,
  isAdmin = false,
  onLeaveRoom,
  onOpenAnalytics,
  onOpenRoster
}) {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [copiedLink, setCopiedLink] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      setElapsedTime(`${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?room=' + roomId;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="bg-[#161b22] border-b border-[#2d333b] px-4 py-2.5 shadow-sm select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Room Info - "My ClassRoom" logo kept intact as requested */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-white border border-blue-500/30">
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                <span>My</span> <span className="text-blue-400">ClassRoom</span>
              </h1>
              <span className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {getUIText('liveClass', selectedLanguage)}
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                  <Crown className="w-3 h-3 text-blue-400" />
                  <span>Teacher Admin</span>
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span>{getUIText('room', selectedLanguage)}:</span>
                <span className="font-semibold text-slate-200 bg-[#1a2233] px-1.5 py-0.5 rounded border border-[#2d333b] font-mono">
                  {roomId}
                </span>
              </span>

              {/* 1-Click Copy Room Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-[10px] bg-[#1a2233] hover:bg-[#242d3d] text-blue-400 hover:text-white px-2 py-0.5 rounded border border-[#2d333b] transition cursor-pointer"
                title="Copy direct invite link for students"
              >
                {copiedLink ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics & Status Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-950/60 text-blue-300 border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="capitalize">{getUIText(connectionStatus, selectedLanguage) || connectionStatus}</span>
          </div>

          {/* Active Participants Count / Click to Open Roster */}
          <button
            onClick={onOpenRoster}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition cursor-pointer shadow-sm ${
              isAdmin
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-500/40'
                : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 border-[#2d333b]'
            }`}
            title="Open class roster and member controls"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">{participantCount} {participantCount === 1 ? getUIText('peer', selectedLanguage) : getUIText('peers', selectedLanguage)}</span>
            {isAdmin && <span className="text-[9px] bg-blue-500/20 px-1 rounded font-bold">Manage</span>}
          </button>

          {/* Session Duration Timer */}
          <div className="flex items-center gap-1.5 bg-[#1a2233] text-slate-300 px-2.5 py-1 rounded-full text-xs border border-[#2d333b]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-200">{elapsedTime}</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer shadow-sm select-none theme-toggle-btn"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-blue-400" />
                <span>{getUIText('lightMode', selectedLanguage) || 'Light'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>{getUIText('darkMode', selectedLanguage) || 'Dark'}</span>
              </>
            )}
          </button>

          {/* Leave Room Button */}
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-sm"
            title="Leave captioning room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{getUIText('leave', selectedLanguage)}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
