import React, { useState } from 'react';
import JoinRoom from './components/JoinRoom';
import LiveRoom from './components/LiveRoom';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './context/ThemeContext';

const SESSION_STORAGE_KEY = 'classroom_active_session';
const CLIENT_SESSION_ID_KEY = 'classroom_client_uid';

function getOrCreateClientSessionId() {
  try {
    let uid = sessionStorage.getItem(CLIENT_SESSION_ID_KEY);
    if (!uid) {
      uid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(CLIENT_SESSION_ID_KEY, uid);
    }
    return uid;
  } catch (e) {
    return 'sess_' + Date.now();
  }
}

export default function App() {
  const { theme, isDark } = useTheme();
  const [joinError, setJoinError] = useState('');

  // Restore active room session from sessionStorage so refresh does NOT send user back!
  const [roomData, setRoomData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlRoom = params.get('room');
        const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // If URL specifies a room and it doesn't match saved session, let user join that room
          if (urlRoom && parsed.roomId && parsed.roomId !== urlRoom) {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved room session:', e);
    }
    return null;
  });

  const handleJoin = ({ roomId, participantName, language, role }) => {
    const sessionId = getOrCreateClientSessionId();
    const data = {
      roomId,
      participantName,
      language,
      role: role || (participantName.toLowerCase().includes('prof') ? 'admin' : 'student'),
      sessionId
    };
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomId);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.warn('Could not save session to storage:', e);
    }
    setJoinError('');
    setRoomData(data);
  };

  const handleUpdateLanguage = (newLang) => {
    setRoomData((prev) => {
      if (!prev) return null;
      const updated = { ...prev, language: newLang };
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  const handleLeave = (reason = '') => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    } catch (e) { }
    if (reason) setJoinError(reason);
    setRoomData(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0d1117] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'} selection:bg-blue-400 selection:text-slate-900 font-sans antialiased transition-colors duration-200`}>
      {!roomData ? (
        <JoinRoom onJoin={handleJoin} initialError={joinError} />
      ) : (
        <ErrorBoundary>
          <LiveRoom
            roomId={roomData.roomId}
            participantName={roomData.participantName}
            initialLanguage={roomData.language}
            role={roomData.role}
            sessionId={roomData.sessionId || getOrCreateClientSessionId()}
            onLanguageChange={handleUpdateLanguage}
            onLeaveRoom={handleLeave}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
