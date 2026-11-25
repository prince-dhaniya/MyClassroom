import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  LogOut,
  Ban,
  RotateCcw,
  Search,
  Crown,
  GraduationCap,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

export default function ParticipantList({
  isOpen,
  onClose,
  participants = [],
  currentSocketId,
  activeSpeakerId,
  isAdmin = false,
  peerMediaStates = {},
  blockedList = [],
  onKickParticipant,
  onBlockParticipant,
  onUnblockParticipant,
  onMuteParticipant,
  selectedLanguage = 'en',
  roomId
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'blocked'
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'kick' | 'block', target: { socketId, name } }

  if (!isOpen) return null;

  const filteredActive = participants.filter((p) =>
    (p.participantName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlocked = blockedList.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmExecute = () => {
    if (!confirmAction) return;
    const { type, target } = confirmAction;
    if (type === 'kick') {
      onKickParticipant(target.socketId, target.name);
    } else if (type === 'block') {
      onBlockParticipant(target.socketId, target.name);
    }
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in">
      <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl max-w-xl w-full h-[90vh] max-h-[680px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-[#2d333b] flex items-center justify-between gap-3 bg-[#131920] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Class Roster & Controls
                </h3>
                {isAdmin ? (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-blue-400" />
                    Teacher Admin
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-[#2d333b] px-2 py-0.5 rounded-full font-medium">
                    Student Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Room: <span className="font-mono text-slate-200 font-semibold">{roomId}</span> • Total {participants.length} connected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white flex items-center justify-center transition border border-[#2d333b] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 border-b border-[#2d333b] space-y-2.5 bg-[#161b22] shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name..."
              className="w-full bg-[#0d1117] border border-[#2d333b] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#1a2233] text-slate-300 border-[#2d333b] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Members ({participants.length})</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('blocked')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'blocked'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-[#1a2233] text-blue-300 border-[#2d333b] hover:text-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-blue-400" />
                <span>Blocked Students ({blockedList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Active Participants */}
        {activeTab === 'active' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredActive.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active participants found matching "{searchQuery}"
              </div>
            ) : (
              filteredActive.map((p) => {
                const isSelf = p.socketId === currentSocketId;
                const isUserTeacher =
                  p.role === 'admin' ||
                  (p.participantName || '').toLowerCase().includes('prof') ||
                  (p.participantName || '').toLowerCase().includes('teacher');
                const peerState = peerMediaStates[p.socketId] || {};
                const isSpeaking = activeSpeakerId === p.socketId;

                return (
                  <div
                    key={p.socketId}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isUserTeacher
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : isSelf
                        ? 'bg-[#1a2233] border-blue-500/40'
                        : 'bg-[#111820] border-[#2d333b] hover:border-[#384252]'
                    }`}
                  >
                    {/* User Identity & Badges */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isUserTeacher
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : isSelf
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                            : 'bg-[#1a2233] text-slate-200 border-[#2d333b]'
                        }`}
                      >
                        {p.participantName ? p.participantName.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate max-w-[160px]">
                            {p.participantName}
                          </span>
                          {isUserTeacher && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              Teacher / Admin
                            </span>
                          )}
                          {isSelf && (
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              You
                            </span>
                          )}
                          {!isUserTeacher && !isSelf && (
                            <span className="bg-[#1a2233] text-slate-400 border border-[#2d333b] text-[9px] font-medium px-1.5 py-0.2 rounded-md">
                              Student
                            </span>
                          )}
                        </div>

                        {/* Subtitle / Status */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="uppercase font-mono bg-[#0d1117] px-1 rounded border border-[#2d333b]">
                            {p.language?.toUpperCase() || 'EN'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {peerState.isCameraOn ? (
                              <Camera className="w-3 h-3 text-blue-400" />
                            ) : (
                              <CameraOff className="w-3 h-3 text-slate-500" />
                            )}
                            <span>{peerState.isCameraOn ? 'Cam On' : 'Cam Off'}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {peerState.isMicOn || isSpeaking ? (
                              <Volume2 className="w-3 h-3 text-blue-400" />
                            ) : (
                              <VolumeX className="w-3 h-3 text-slate-500" />
                            )}
                            <span>{peerState.isMicOn ? 'Mic On' : 'Muted'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons (Exclusive to Teacher!) */}
                    {isAdmin && !isSelf && !isUserTeacher && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Mute Button */}
                        <button
                          onClick={() => onMuteParticipant(p.socketId, p.participantName)}
                          className="px-2 py-1 bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-[#2d333b] transition cursor-pointer"
                          title="Mute student mic"
                        >
                          <VolumeX className="w-3 h-3 inline mr-1 text-slate-400" />
                          <span className="hidden sm:inline">Mute</span>
                        </button>

                        {/* Remove / Kick Button */}
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'kick',
                              target: { socketId: p.socketId, name: p.participantName }
                            })
                          }
                          className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 hover:text-white rounded-lg text-xs font-bold border border-blue-500/30 transition cursor-pointer flex items-center gap-1"
                          title="Remove student from class"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Kick</span>
                        </button>

                        {/* Block Button */}
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'block',
                              target: { socketId: p.socketId, name: p.participantName }
                            })
                          }
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-bold border border-blue-500/30 hover:border-blue-500 transition cursor-pointer flex items-center gap-1"
                          title="Permanently block student from classroom"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Block</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Blocked Students (Admin Only) */}
        {activeTab === 'blocked' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredBlocked.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="font-semibold text-white">No Blocked Students</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Disruptive students blocked by the teacher appear here.</p>
              </div>
            ) : (
              filteredBlocked.map((name, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center font-bold">
                      <Ban className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white capitalize block">{name}</span>
                      <span className="text-[10px] text-blue-300/80">Blocked from re-entering classroom</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onUnblockParticipant(name)}
                    className="px-3 py-1 bg-[#1a2233] hover:bg-blue-600 text-slate-200 hover:text-white border border-[#2d333b] hover:border-blue-500 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-blue-400" />
                    <span>Unblock Student</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Policy Info */}
        <div className="p-3 border-t border-[#2d333b] bg-[#131920] text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Anti-Duplicate Login Active • Only 1 session per student allowed</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">Secure Mesh v2.0</span>
        </div>

        {/* Action Confirmation Modal (Kick or Block) */}
        {confirmAction && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-500/40 text-blue-400">
                {confirmAction.type === 'block' ? <Ban className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {confirmAction.type === 'block' ? 'Block Student Permanently?' : 'Remove Student from Class?'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confirmAction.type === 'block' ? (
                    <>
                      Are you sure you want to <b>BLOCK</b> <span className="text-white font-bold">{confirmAction.target.name}</span>? They will be immediately disconnected and prevented from ever logging back in.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <b>REMOVE (KICK)</b> <span className="text-white font-bold">{confirmAction.target.name}</span> from this session?
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-3 py-2 bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#2d333b] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExecute}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white transition shadow cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                >
                  {confirmAction.type === 'block' ? 'Yes, Block Student' : 'Yes, Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}