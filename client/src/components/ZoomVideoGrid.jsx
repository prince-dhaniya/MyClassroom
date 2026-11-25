import React, { useState } from 'react';
import VideoTile from './VideoTile';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  UserPlus,
  MonitorUp,
  Users,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

export default function ZoomVideoGrid({
  participants = [],
  currentSocketId,
  localStream,
  remoteStreams = {},
  peerMediaStates = {},
  isCameraOn,
  isListening,
  selectedLanguage = 'en',
  isScreenSharing = false,
  onToggleScreenShare,
  onToggleMic,
  onToggleCamera,
  latestEvent,
  activeSpeakerId,
  roomId,
  participantName,
  isAdmin = false,
  onKick,
  onBlock,
  onMute,
  onOpenInviteModal,
  onOpenRoster
}) {
  const [spotlightId, setSpotlightId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine local user and remote participants into unified list
  const allTiles = [
    {
      socketId: currentSocketId || 'local',
      participantName: participantName || 'You',
      isSelf: true,
      stream: localStream,
      isCameraOn: isCameraOn,
      isMicOn: isListening,
      isSpeaking: activeSpeakerId === currentSocketId || isListening,
      language: selectedLanguage || 'en',
      isScreenSharing: isScreenSharing
    },
    ...participants
      .filter(p => p.socketId !== currentSocketId)
      .map(p => {
        const peerState = peerMediaStates[p.socketId] || {};
        const stream = remoteStreams[p.socketId];
        return {
          socketId: p.socketId,
          participantName: p.participantName,
          isSelf: false,
          stream: stream,
          isCameraOn: peerState.isCameraOn !== undefined ? peerState.isCameraOn : !!stream,
          isMicOn: peerState.isMicOn !== undefined ? peerState.isMicOn : false,
          isSpeaking: activeSpeakerId === p.socketId,
          language: p.language || 'en',
          isScreenSharing: peerState.isScreenSharing || false
        };
      })
  ];

  const total = allTiles.length;

  let gridColsClass = 'grid-cols-1';
  if (spotlightId) {
    gridColsClass = 'grid-cols-1';
  } else {
    if (total === 1) gridColsClass = 'grid-cols-1';
    else if (total === 2) gridColsClass = 'grid-cols-1 sm:grid-cols-2';
    else if (total === 3 || total === 4) gridColsClass = 'grid-cols-2';
    else if (total >= 5) gridColsClass = 'grid-cols-2 lg:grid-cols-3';
  }

  return (
    <div
      className={`relative bg-[#1a2233] border border-[#2d333b] rounded-2xl overflow-hidden shadow-xl flex flex-col group transition-all duration-300 ${
        isFullscreen ? 'h-[520px]' : 'h-[320px] sm:h-[380px]'
      }`}
    >
      
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-b from-[#0d1117]/90 via-[#0d1117]/40 to-transparent flex items-center justify-between pointer-events-none">
        
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <span className="flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{getUIText('classroom', selectedLanguage)}</span>
          </span>

          {isAdmin && (
            <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
              <Crown className="w-3 h-3 text-blue-400" />
              <span>Teacher Admin</span>
            </span>
          )}

          <span className="text-xs bg-[#161b22]/90 text-slate-300 border border-[#2d333b] px-2.5 py-0.5 rounded-md backdrop-blur-md">
            Room: <strong className="text-white">{roomId}</strong> ({total} {getUIText('faces', selectedLanguage)})
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Class Roster / Moderation Button */}
          {onOpenRoster && (
            <button
              onClick={onOpenRoster}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md transition cursor-pointer border shadow-sm ${
                isAdmin
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40'
                  : 'bg-[#161b22] hover:bg-[#242d3d] text-slate-200 border-[#2d333b]'
              }`}
              title={isAdmin ? 'Manage Class Roster & Students' : 'View Class Participants'}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAdmin ? 'Manage Students' : 'Roster'}</span>
              <span className="bg-[#1a2233] px-1 rounded text-[10px] font-mono">{total}</span>
            </button>
          )}

          <button
            onClick={onOpenInviteModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#242d3d] text-slate-200 border border-[#2d333b] text-xs font-semibold backdrop-blur-md transition cursor-pointer shadow-sm"
            title="Invite students"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{getUIText('inviteGuide', selectedLanguage)}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#161b22]/90 hover:bg-[#242d3d] text-white transition border border-[#2d333b] backdrop-blur-md cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Video Stage'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Tiles Grid Container */}
      <div className="flex-1 p-2.5 pt-10 pb-14 overflow-y-auto">
        <div className={`grid gap-2.5 h-full ${gridColsClass}`}>
          {allTiles.map((tile) => (
            <VideoTile
              key={tile.socketId}
              socketId={tile.socketId}
              stream={tile.stream}
              participantName={tile.participantName}
              isSelf={tile.isSelf}
              isCameraOn={tile.isCameraOn}
              isSpeaking={tile.isSpeaking}
              isMicOn={tile.isMicOn}
              language={tile.language}
              selectedLanguage={selectedLanguage}
              isScreenSharing={tile.isScreenSharing}
              isSpotlighted={spotlightId === tile.socketId}
              onToggleSpotlight={() => setSpotlightId(spotlightId === tile.socketId ? null : tile.socketId)}
              totalTiles={total}
              isAdmin={isAdmin}
              onKick={onKick}
              onBlock={onBlock}
              onMute={onMute}
            />
          ))}
        </div>
      </div>

      {/* Floating On-Screen Mic, Camera & Screen Share Quick Controls */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#161b22]/95 border border-[#2d333b] backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl">
        {/* On-Screen Mic Button */}
        <button
          onClick={onToggleMic}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-md transition cursor-pointer select-none ${
            isListening
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-800 hover:bg-blue-700 text-blue-200'
          }`}
          title={isListening ? 'Click to Turn Off Microphone' : 'Click to Turn On Microphone'}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>{getUIText('micOff', selectedLanguage)}</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>{getUIText('micOn', selectedLanguage)}</span>
            </>
          )}
        </button>

        {/* On-Screen Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer select-none ${
            isCameraOn
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow'
              : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 border border-[#2d333b]'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>{getUIText('camOff', selectedLanguage)}</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3.5 h-3.5" />
              <span>{getUIText('camOn', selectedLanguage)}</span>
            </>
          )}
        </button>

        {/* On-Screen Screen Share Button */}
        {onToggleScreenShare && (
          <button
            onClick={onToggleScreenShare}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer select-none ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 border border-[#2d333b]'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <MonitorUp className="w-3.5 h-3.5" />
            <span>{isScreenSharing ? getUIText('stopShare', selectedLanguage) : getUIText('shareScreen', selectedLanguage)}</span>
          </button>
        )}
      </div>

    </div>
  );
}
