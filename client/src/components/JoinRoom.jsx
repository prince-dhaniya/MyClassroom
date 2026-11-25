import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Sparkles,
  Globe,
  ArrowRight,
  ShieldCheck,
  Video,
  Crown,
  GraduationCap,
  ShieldAlert,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translator';
import { useTheme } from '../context/ThemeContext';

export default function JoinRoom({ onJoin, initialError = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [roomId, setRoomId] = useState('lecture-101');
  const [participantName, setParticipantName] = useState('Prof. Sharma');
  const [language, setLanguage] = useState('en');
  const [role, setRole] = useState('admin'); // 'admin' | 'student'
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  // Check URL params for ?room=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setRoomId(urlRoom);
      }
    }
  }, []);

  const quickRooms = [
    { id: 'lecture-101', label: 'CS101: Data Structures' },
    { id: 'physics-lab', label: 'PHY202: Quantum Mechanics' },
    { id: 'seminar-hall', label: 'Hall A: Keynote Seminar' }
  ];

  const quickRoles = [
    { name: 'Prof. Sharma (Teacher)', lang: 'en', role: 'admin' },
    { name: 'Aman Patel (Student)', lang: 'hi', role: 'student' },
    { name: 'Priya Singh (Student)', lang: 'mr', role: 'student' },
    { name: 'Carlos Gomez (Student)', lang: 'es', role: 'student' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter or select a Room ID');
      return;
    }
    if (!participantName.trim()) {
      setError('Please enter your Display Name');
      return;
    }
    setError('');
    onJoin({
      roomId: roomId.trim().toLowerCase(),
      participantName: participantName.trim(),
      language,
      role
    });
  };

  return (
    <div className="min-h-screen bg-[#10697a] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition cursor-pointer shadow-md select-none text-xs font-semibold theme-toggle-btn"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-blue-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-400" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0d1117] text-blue-400 mb-3 border border-[#2d333b] shadow-lg">
            <Radio className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Live Multilingual <span className="text-blue-400">Classroom</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            NexHack 2.0 • Real-Time Classroom Subtitles & Live Moderation
          </p>
        </div>

        {/* Join Card */}
        <div className="bg-[#0d1117] border border-[#2d333b] rounded-2xl p-6 shadow-2xl space-y-4">
          
          {/* Security & Moderation Banner */}
          <div className="bg-[#161b22] border border-[#2d333b] rounded-xl p-2.5 flex items-start gap-2.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold text-white block mb-0.5">Single-Session Login & Teacher Control</span>
              <span className="text-slate-400">Duplicate logins are prevented. Teacher has full authority to kick or block any student.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="bg-blue-950/90 border border-blue-500/60 text-blue-200 text-xs px-3.5 py-2.5 rounded-xl flex items-start gap-2 shadow-sm animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Room ID Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Room ID / Code
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. lecture-101"
                className="w-full bg-[#161b22] border border-[#2d333b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono"
                required
              />
              
              {/* Quick Preset Rooms */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickRooms.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRoomId(r.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                      roomId === r.id
                        ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                        : 'bg-[#161b22] border-[#2d333b] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection (Teacher / Admin vs Student) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    if (!participantName || participantName.includes('Student')) {
                      setParticipantName('Prof. Sharma');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    role === 'admin'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40'
                      : 'bg-[#161b22] border-[#2d333b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className={`w-4 h-4 ${role === 'admin' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block text-white">Teacher / Admin</span>
                    <span className="text-[10px] text-blue-300/80 block">Class Leader & Host</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('student');
                    if (participantName.includes('Prof')) {
                      setParticipantName('Aman Patel');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    role === 'student'
                      ? 'bg-blue-500/15 border-blue-500/50 text-white shadow-sm ring-1 ring-blue-500/30'
                      : 'bg-[#161b22] border-[#2d333b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block text-white">Student</span>
                    <span className="text-[10px] text-slate-400 block">Class Attendee</span>
                  </div>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-1.5">
                {role === 'admin'
                  ? '👑 As Teacher/Admin, you will have exclusive controls to kick or block disruptive students.'
                  : '🔒 As Student, only 1 session is allowed. Duplicate logins will be blocked.'}
              </p>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Prof. Sharma or Aman Patel"
                className="w-full bg-[#161b22] border border-[#2d333b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                required
              />

              {/* Quick Presets for Demo */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickRoles.map((qr) => (
                  <button
                    type="button"
                    key={qr.name}
                    onClick={() => {
                      setParticipantName(qr.name);
                      setLanguage(qr.lang);
                      setRole(qr.role);
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                      participantName === qr.name
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#161b22] border-[#2d333b] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {qr.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#161b22] border border-[#2d333b] focus:border-blue-500 text-white rounded-xl px-3.5 py-2.5 text-xs transition outline-none font-medium cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{role === 'admin' ? 'Start Classroom (Teacher)' : 'Enter Classroom (Student)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl p-2.5">
            <span className="text-blue-400 font-semibold block">Teacher Access</span>
            Kick & Block
          </div>
          <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl p-2.5">
            <span className="text-blue-400 font-semibold block">Single Login</span>
            Anti-duplicate
          </div>
          <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl p-2.5">
            <span className="text-blue-400 font-semibold block">12+ Languages</span>
            Live Subtitles
          </div>
        </div>

      </div>
    </div>
  );
}
