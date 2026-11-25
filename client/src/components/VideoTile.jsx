import React, { useEffect, useRef, useState } from 'react';
import {
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Pin,
  PinOff,
  Shield,
  LogOut,
  Ban,
  Crown,
  MoreVertical
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

const LANG_MAP = {
  en: { label: 'English', flag: '🇬🇧' },
  hi: { label: 'Hindi', flag: '🇮🇳' },
  mr: { label: 'Marathi', flag: '🇮🇳' },
  bn: { label: 'Bengali', flag: '🇮🇳' },
  gu: { label: 'Gujarati', flag: '🇮🇳' },
  ta: { label: 'Tamil', flag: '🇮🇳' },
  te: { label: 'Telugu', flag: '🇮🇳' },
  es: { label: 'Spanish', flag: '🇪🇸' },
  fr: { label: 'French', flag: '🇫🇷' },
  de: { label: 'German', flag: '🇩🇪' },
  ja: { label: 'Japanese', flag: '🇯🇵' },
  zh: { label: 'Chinese', flag: '🇨🇳' }
};

export default function VideoTile({
  stream,
  socketId,
  participantName,
  isSelf,
  isCameraOn,
  isSpeaking,
  isMicOn,
  language = 'en',
  selectedLanguage = 'en',
  isScreenSharing = false,
  isSpotlighted,
  onToggleSpotlight,
  totalTiles = 1,
  isAdmin = false,
  onKick,
  onBlock,
  onMute
}) {
  const videoRef = useRef(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const langObj = LANG_MAP[language] || { label: (language || 'en').toUpperCase(), flag: '🌐' };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Determine role title (e.g., Professor or Student)
  const isProfessor = (participantName || '').toLowerCase().includes('prof') || (participantName || '').toLowerCase().includes('teacher');

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0d1117] video-tile-surface border transition-all duration-300 flex flex-col items-center justify-center group shadow-md ${
        isSpeaking
          ? 'border-blue-500 ring-1 ring-blue-500/40'
          : 'border-[#2d333b] hover:border-[#384252]'
      } ${
        isSpotlighted ? 'col-span-full row-span-2' : ''
      }`}
      style={{ minHeight: totalTiles <= 2 ? '220px' : '160px' }}
    >
      {/* Video Element */}
      {stream && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf} // Always mute local video to avoid acoustic feedback
          className="w-full h-full object-cover mirror-mode"
          style={{ transform: isSelf && !isScreenSharing ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        /* Camera Off Avatar Screen */
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-[#111820]">
          <div className="relative mb-2">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md transition duration-300 ${
              isSpeaking
                ? 'bg-blue-600 text-white scale-105'
                : 'bg-[#1a2233] text-slate-300 border border-[#2d333b]'
            }`}>
              {participantName ? participantName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* Audio Pulsing Waves when speaking */}
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            )}
          </div>

          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[150px]">
            {participantName}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 justify-center flex-wrap">
            <span>{isProfessor ? `👨‍🏫 ${getUIText('professorRole', selectedLanguage)}` : `🎓 ${getUIText('studentRole', selectedLanguage)}`}</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 bg-[#1a2233] px-1.5 py-0.5 rounded font-medium border border-[#2d333b]">
              {langObj.flag} {langObj.label}
            </span>
          </span>
        </div>
      )}

      {/* Top Overlay Badges & Admin Controls */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {isProfessor && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow backdrop-blur-sm flex items-center gap-1">
              <Crown className="w-3 h-3 text-blue-200" />
              <span>Teacher</span>
            </span>
          )}
          {isSelf && (
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              {getUIText('you', selectedLanguage)}
            </span>
          )}
          {isScreenSharing && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow backdrop-blur-sm flex items-center gap-1">
              🖥️ {getUIText('screen', selectedLanguage)}
            </span>
          )}
        </div>

        {/* Right Controls: Admin Moderation Menu & Spotlight */}
        <div className="flex items-center gap-1.5 pointer-events-auto relative">
          
          {/* Teacher/Admin Exclusive Control Menu on Student Tile */}
          {isAdmin && !isSelf && !isProfessor && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition backdrop-blur-md cursor-pointer flex items-center gap-1 shadow"
                title="Teacher Moderation Controls"
              >
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-fade-in text-left">
                  <div className="text-[9px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-[#2d333b]">
                    Manage: {participantName}
                  </div>
                  
                  {onMute && (
                    <button
                      onClick={() => {
                        onMute(socketId, participantName);
                        setShowAdminMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#1a2233] hover:text-white transition cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mute Student</span>
                    </button>
                  )}

                  {onKick && (
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        if (window.confirm(`Are you sure you want to remove "${participantName}" from the class?`)) {
                          onKick(socketId, participantName);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-blue-400" />
                      <span>Kick from Class</span>
                    </button>
                  )}

                  {onBlock && (
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        if (window.confirm(`Are you sure you want to permanently BLOCK "${participantName}" from this class? They will not be able to log back in.`)) {
                          onBlock(socketId, participantName);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5 text-blue-400" />
                      <span>Block Student</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pin / Spotlight Button */}
          {onToggleSpotlight && (
            <button
              onClick={onToggleSpotlight}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-slate-700 text-white transition backdrop-blur-md opacity-0 group-hover:opacity-100 cursor-pointer"
              title={isSpotlighted ? 'Unpin' : 'Spotlight full stage'}
            >
              {isSpotlighted ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Overlay Label */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2 max-w-[70%] truncate pointer-events-auto">
          <div className="shrink-0">
            {isSpeaking ? (
              <Volume2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            ) : isMicOn ? (
              <Mic className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <span className="text-xs font-semibold text-white truncate">
            {participantName}
          </span>
        </div>

        <span className="bg-[#161b22]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-200 border border-[#2d333b] flex items-center gap-1 shadow pointer-events-auto">
          <span>{langObj.flag}</span>
          <span className="hidden sm:inline">{langObj.label}</span>
          <span className="sm:hidden uppercase">{language}</span>
        </span>
      </div>

    </div>
  );
}
