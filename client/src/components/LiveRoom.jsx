import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import ParticipantList from './ParticipantList';
import ZoomVideoGrid from './ZoomVideoGrid';
import HistorySliderDrawer from './HistorySliderDrawer';
import RightTranslatorPanel from './RightTranslatorPanel';
import FloatingSubtitleCard from './FloatingSubtitleCard';
import Controls from './Controls';
import InviteModal from './InviteModal';
import AnalyticsModal from './AnalyticsModal';
import { getSocket } from '../services/socket';
import { getOfflineTranslation, translateText, SUPPORTED_LANGUAGES, getLanguageInfo } from '../services/translator';
import tts from '../services/tts';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function LiveRoom({
  roomId,
  participantName,
  initialLanguage = 'en',
  role = 'student',
  sessionId,
  onLanguageChange,
  onLeaveRoom
}) {
  // ───── State ─────
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [isAdmin, setIsAdmin] = useState(
    role === 'admin' ||
    (participantName || '').toLowerCase().includes('prof') ||
    (participantName || '').toLowerCase().includes('teacher')
  );
  const [blockedList, setBlockedList] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [kickedNotice, setKickedNotice] = useState(null);
  const [blockedNotice, setBlockedNotice] = useState(null);
  const [moderationToast, setModerationToast] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [peerMediaStates, setPeerMediaStates] = useState({}); // { [socketId]: { isCameraOn, isMicOn } }
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [syncBanner, setSyncBanner] = useState(null);
  const [captionDelay, setCaptionDelay] = useState(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [currentSocketId, setCurrentSocketId] = useState('');
  const [hardwareError, setHardwareError] = useState(null);
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // ───── Refs ─────
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentEventIdRef = useRef(null);
  const isListeningRef = useRef(false);
  const speakerTimeoutRef = useRef(null);
  const speechLangRef = useRef(selectedLanguage);
  const audioStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const autoSpeakRef = useRef(false);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  useEffect(() => {
    speechLangRef.current = selectedLanguage;
  }, [selectedLanguage]);

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ───── WebRTC Helper Functions ─────
  const createPeerConnection = useCallback((peerSocketId) => {
    if (peersRef.current[peerSocketId]) {
      return peersRef.current[peerSocketId];
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peersRef.current[peerSocketId] = pc;

    // Send local tracks to peer if local camera/screen stream exists
    const currentStream = screenStreamRef.current || cameraStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc_signal', {
          to: peerSocketId,
          signal: { candidate: event.candidate }
        });
      }
    };

    // Receive remote tracks (e.g. Professor video or student video)
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote stream track from: ${peerSocketId}`);
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [peerSocketId]: event.streams[0]
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        pc.close();
        delete peersRef.current[peerSocketId];
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[peerSocketId];
          return updated;
        });
      }
    };

    return pc;
  }, []);

  const initiateCallToPeer = useCallback(async (peerSocketId) => {
    try {
      const pc = createPeerConnection(peerSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('webrtc_signal', {
        to: peerSocketId,
        fromName: participantName,
        signal: { sdp: offer }
      });
    } catch (err) {
      console.warn('[WebRTC] Error initiating call to peer:', err);
    }
  }, [createPeerConnection, participantName]);

  // ───── Socket.IO Integration ─────
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      console.log('[Socket] Connected with ID:', socket.id);
      setCurrentSocketId(socket.id);
      setConnectionStatus('connected');
      socket.emit('join', {
        roomId,
        participantName,
        language: speechLangRef.current,
        role,
        sessionId
      });
      // Ask existing peers in room to share their video streams
      socket.emit('request_peer_streams', { roomId });
    };

    const onDisconnect = () => {
      setConnectionStatus('reconnecting');
      setSyncBanner('syncing');
    };

    const onReconnect = () => {
      setConnectionStatus('connected');
      setSyncBanner('syncing');
      socket.emit('join', {
        roomId,
        participantName,
        language: speechLangRef.current,
        role,
        sessionId
      });
      socket.emit('request_peer_streams', { roomId });
    };

    const onParticipants = (list) => {
      setParticipants(list);
      // Clean up disconnected peers
      const activeIds = new Set(list.map((p) => p.socketId));
      Object.keys(peersRef.current).forEach((peerId) => {
        if (!activeIds.has(peerId)) {
          peersRef.current[peerId].close();
          delete peersRef.current[peerId];
        }
      });
      setRemoteStreams((prev) => {
        const next = {};
        Object.keys(prev).forEach((id) => {
          if (activeIds.has(id)) next[id] = prev[id];
        });
        return next;
      });
    };

    const onInit = (initialEvents) => {
      setEvents((prev) => {
        const map = new Map();
        (initialEvents || []).forEach((e) => map.set(e.eventId, e));
        prev.forEach((e) => {
          if (!map.has(e.eventId)) map.set(e.eventId, e);
        });
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      });
      if (syncBanner === 'syncing') {
        setSyncBanner('synced');
        setTimeout(() => setSyncBanner(null), 3000);
      }
    };

    const onSpeech = (evt) => {
      if (evt.timestamp) setCaptionDelay(Math.max(5, Date.now() - evt.timestamp));
      if (evt.participantId) {
        setActiveSpeakerId(evt.participantId);
        if (speakerTimeoutRef.current) clearTimeout(speakerTimeoutRef.current);
        speakerTimeoutRef.current = setTimeout(() => {
          setActiveSpeakerId(null);
        }, 2200);
      }

      // Auto-translate locally if speech arrived without translation
      if (!evt.translation && evt.text && evt.status === 'final') {
        const targetLang = evt.language === 'hi' ? 'en' : 'hi';
        translateText(evt.text, evt.language || 'en', targetLang).then((trans) => {
          if (trans) {
            setEvents((prev) =>
              prev.map((e) => (e.eventId === evt.eventId && !e.translation ? { ...e, translation: trans } : e))
            );
            if (autoSpeakRef.current && evt.type !== 'system_join' && evt.type !== 'system_lang_change') {
              tts.speak(trans, targetLang);
            }
          }
        });
      } else if (evt.translation && evt.status === 'final' && autoSpeakRef.current && evt.type !== 'system_join' && evt.type !== 'system_lang_change') {
        tts.speak(evt.translation, 'hi');
      }

      setEvents((prev) => {
        const idx = prev.findIndex((e) => e.eventId === evt.eventId);
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = { ...u[idx], ...evt };
          return u.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        }
        return [...prev, evt].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      });
    };

    const onEdit = ({ eventId, correctedText, status, correctedBy }) => {
      setEvents((prev) =>
        prev.map((e) => (e.eventId === eventId ? { ...e, text: correctedText, status: status || 'corrected', correctedBy } : e))
      );
    };

    const onTranslate = ({ eventId, translation }) => {
      setEvents((prev) => prev.map((e) => (e.eventId === eventId ? { ...e, translation } : e)));
      if (translation && autoSpeakRef.current) {
        tts.speak(translation, 'hi');
      }
    };

    const onHistoryCleared = () => {
      setEvents([]);
    };

    const onEventsDeleted = ({ eventIds }) => {
      if (Array.isArray(eventIds)) {
        setEvents((prev) => prev.filter((e) => !eventIds.includes(e.eventId)));
      }
    };

    // WebRTC Signaling Handler
    const onWebRTCSignal = async ({ from, fromName, signal }) => {
      try {
        let pc = peersRef.current[from];
        if (!pc) {
          pc = createPeerConnection(from);
        }

        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_signal', {
              to: from,
              fromName: participantName,
              signal: { sdp: answer }
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('[WebRTC] Signaling error with peer:', from, err);
      }
    };

    // Peer Media State Handler
    const onPeerMediaState = ({ socketId, isCameraOn: pCam, isMicOn: pMic, isScreenSharing: pScreen }) => {
      setPeerMediaStates((prev) => ({
        ...prev,
        [socketId]: { isCameraOn: pCam, isMicOn: pMic, isScreenSharing: pScreen }
      }));
    };

    // When someone joins and requests existing video streams
    const onPeerRequestedStream = ({ requesterId }) => {
      if ((cameraStreamRef.current && isCameraOn) || (screenStreamRef.current && isScreenSharing)) {
        initiateCallToPeer(requesterId);
      }
    };

    // Admin & Moderation Listeners
    const onAdminStatus = ({ isAdmin: adminFlag }) => {
      console.log('[Socket] Admin status:', adminFlag);
      setIsAdmin(adminFlag);
    };

    const onBlockedList = (list) => {
      console.log('[Socket] Blocked list updated:', list);
      setBlockedList(list || []);
    };

    const onJoinError = ({ code, message }) => {
      console.error('[Socket] Join error:', code, message);
      onLeaveRoom(message);
    };

    const onKickedByAdmin = (data) => {
      console.warn('[Moderation] Kicked by admin:', data);
      setKickedNotice(data);
    };

    const onBlockedByAdmin = (data) => {
      console.warn('[Moderation] Blocked by admin:', data);
      setBlockedNotice(data);
    };

    const onForceMute = ({ by }) => {
      console.warn('[Moderation] Force muted by:', by);
      if (isListeningRef.current) {
        stopRecognition();
      }
      setModerationToast(`Your microphone was muted by the Teacher (${by}).`);
      setTimeout(() => setModerationToast(null), 4500);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect', onReconnect);
    socket.on('participants', onParticipants);
    socket.on('init', onInit);
    socket.on('speech', onSpeech);
    socket.on('edit', onEdit);
    socket.on('translate', onTranslate);
    socket.on('history_cleared', onHistoryCleared);
    socket.on('events_deleted', onEventsDeleted);
    socket.on('webrtc_signal', onWebRTCSignal);
    socket.on('peer_media_state', onPeerMediaState);
    socket.on('peer_requested_stream', onPeerRequestedStream);
    socket.on('admin_status', onAdminStatus);
    socket.on('blocked_list', onBlockedList);
    socket.on('join_error', onJoinError);
    socket.on('kicked_by_admin', onKickedByAdmin);
    socket.on('blocked_by_admin', onBlockedByAdmin);
    socket.on('force_mute', onForceMute);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect', onReconnect);
      socket.off('participants', onParticipants);
      socket.off('init', onInit);
      socket.off('speech', onSpeech);
      socket.off('edit', onEdit);
      socket.off('translate', onTranslate);
      socket.off('history_cleared', onHistoryCleared);
      socket.off('events_deleted', onEventsDeleted);
      socket.off('webrtc_signal', onWebRTCSignal);
      socket.off('peer_media_state', onPeerMediaState);
      socket.off('peer_requested_stream', onPeerRequestedStream);
      socket.off('admin_status', onAdminStatus);
      socket.off('blocked_list', onBlockedList);
      socket.off('join_error', onJoinError);
      socket.off('kicked_by_admin', onKickedByAdmin);
      socket.off('blocked_by_admin', onBlockedByAdmin);
      socket.off('force_mute', onForceMute);
      if (speakerTimeoutRef.current) clearTimeout(speakerTimeoutRef.current);
      if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, [roomId, participantName, createPeerConnection, initiateCallToPeer, isCameraOn, isScreenSharing]);

  // ───── Web Speech API (Microphone Recognition) ─────
  const startRecognition = useCallback(async () => {
    if (!isSpeechRecognitionSupported) {
      setHardwareError({
        title: 'Browser Speech API Not Supported',
        message: 'Your browser does not have Web Speech API enabled. Please use Google Chrome or Microsoft Edge, or click the "Simulate Speech" button below.'
      });
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
      }
    } catch (err) {
      setHardwareError({
        title: 'Microphone Permission Blocked',
        message: 'Click the Lock 🔒 icon in the URL bar (next to http://localhost:3000), set Microphone to "Allow", and refresh.'
      });
      return;
    }

    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      const langObj = getLanguageInfo(selectedLanguage);
      recognition.lang = langObj.bcp47;
      currentEventIdRef.current = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setHardwareError(null);
        socketRef.current?.emit('media_state', { roomId, isCameraOn, isMicOn: true });
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        let conf = 1.0;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const r = event.results[i];
          if (r[0]) {
            if (r.isFinal) {
              final += r[0].transcript;
              if (r[0].confidence > 0) conf = r[0].confidence;
            } else {
              interim += r[0].transcript;
              if (r[0].confidence > 0) conf = r[0].confidence;
            }
          }
        }

        const isFinal = !!final;
        const text = final || interim;
        if (!text.trim()) return;

        const targetLang = selectedLanguage === 'hi' ? 'en' : 'hi';
        const instantTrans = getOfflineTranslation(text, selectedLanguage, targetLang);
        const thisEventId = currentEventIdRef.current;

        socketRef.current?.emit('speech', {
          roomId,
          eventId: thisEventId,
          participantId: socketRef.current?.id || 'local',
          participantName,
          language: selectedLanguage,
          text,
          status: isFinal ? 'final' : 'partial',
          timestamp: Date.now(),
          confidence: conf,
          translation: instantTrans
        });

        if (isFinal) {
          // Immediately fetch and broadcast full sentence translation
          translateText(text, selectedLanguage, targetLang).then((fullTrans) => {
            if (fullTrans) {
              setEvents((prev) =>
                prev.map((e) => (e.eventId === thisEventId ? { ...e, translation: fullTrans } : e))
              );
              socketRef.current?.emit('translate', {
                roomId,
                eventId: thisEventId,
                translation: fullTrans
              });
            }
          });

          currentEventIdRef.current = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        }
      };

      recognition.onerror = (err) => {
        if (err.error === 'not-allowed' || err.error === 'audio-capture') {
          setIsListening(false);
          isListeningRef.current = false;
          setHardwareError({
            title: 'Microphone Denied',
            message: 'Microphone access is blocked. Allow it via the Lock 🔒 icon in the URL bar.'
          });
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsListening(false);
          socketRef.current?.emit('media_state', { roomId, isCameraOn, isMicOn: false });
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      isListeningRef.current = false;
      setHardwareError({
        title: 'Speech Init Failed',
        message: err.message || 'Use Simulate Speech instead.'
      });
    }
  }, [isSpeechRecognitionSupported, roomId, participantName, selectedLanguage, isCameraOn]);

  const stopRecognition = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    socketRef.current?.emit('media_state', { roomId, isCameraOn, isMicOn: false });
  }, [roomId, isCameraOn]);

  const toggleMic = () => {
    if (isListening) stopRecognition();
    else startRecognition();
  };

  // ───── Camera (WebRTC Multi-Peer Video Streaming) ─────
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraOn(false);

      if (!isScreenSharing) {
        setLocalStream(null);
        // Stop tracks on all peer connections
        Object.values(peersRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          senders.forEach((sender) => {
            if (sender.track) pc.removeTrack(sender);
          });
        });
      }

      socketRef.current?.emit('media_state', { roomId, isCameraOn: false, isMicOn: isListening, isScreenSharing });
    } else {
      // Turn on camera
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Webcam mediaDevices not available in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });

        cameraStreamRef.current = stream;
        if (!isScreenSharing) {
          setLocalStream(stream);
        }
        setIsCameraOn(true);
        setHardwareError(null);

        // Broadcast to room that our camera is now ON
        socketRef.current?.emit('media_state', { roomId, isCameraOn: true, isMicOn: isListening, isScreenSharing });

        // Add stream tracks to all peers and send updated offers
        if (!isScreenSharing) {
          participants
            .filter((p) => p.socketId !== currentSocketId)
            .forEach((p) => {
              initiateCallToPeer(p.socketId);
            });
        }
      } catch (err) {
        console.error('[Camera Error]:', err);
        setHardwareError({
          title: 'Camera Access Blocked or Not Found',
          message: err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Click the Lock 🔒 icon in your browser URL bar and set Camera to "Allow".'
            : 'No working webcam detected or another application is using it.'
        });
      }
    }
  };

  // ───── Screen Share (WebRTC Display Media) ─────
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Turn off screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);

      if (isCameraOn && cameraStreamRef.current) {
        setLocalStream(cameraStreamRef.current);
        const camTrack = cameraStreamRef.current.getVideoTracks()[0];
        if (camTrack) {
          Object.values(peersRef.current).forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(camTrack);
            } else {
              pc.addTrack(camTrack, cameraStreamRef.current);
            }
          });
        }
      } else {
        setLocalStream(null);
        Object.values(peersRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          senders.forEach((sender) => {
            if (sender.track && sender.track.kind === 'video') {
              pc.removeTrack(sender);
            }
          });
        });
      }

      socketRef.current?.emit('media_state', {
        roomId,
        isCameraOn,
        isMicOn: isListening,
        isScreenSharing: false
      });
    } else {
      // Turn on screen sharing
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error('Screen sharing is not supported in this browser.');
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });

        screenStreamRef.current = screenStream;
        setLocalStream(screenStream);
        setIsScreenSharing(true);
        setHardwareError(null);

        // Native stop-sharing button listener (Chrome/Edge native blue bar)
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            if (screenStreamRef.current) {
              screenStreamRef.current.getTracks().forEach((t) => t.stop());
              screenStreamRef.current = null;
            }
            setIsScreenSharing(false);
            if (isCameraOn && cameraStreamRef.current) {
              setLocalStream(cameraStreamRef.current);
            } else {
              setLocalStream(null);
            }
            socketRef.current?.emit('media_state', {
              roomId,
              isCameraOn,
              isMicOn: isListening,
              isScreenSharing: false
            });
          };
        }

        // Replace track or add track to peers
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          } else if (videoTrack) {
            pc.addTrack(videoTrack, screenStream);
          }
        });

        // Broadcast to room
        socketRef.current?.emit('media_state', {
          roomId,
          isCameraOn,
          isMicOn: isListening,
          isScreenSharing: true
        });

        participants
          .filter((p) => p.socketId !== currentSocketId)
          .forEach((p) => {
            initiateCallToPeer(p.socketId);
          });
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          console.error('[Screen Share Error]:', err);
          setHardwareError({
            title: 'Screen Sharing Cancelled or Blocked',
            message: err.message || 'Could not access display media.'
          });
        }
      }
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    socketRef.current?.emit('update_language', { roomId, language: langCode });
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    if (isListening) {
      stopRecognition();
      setTimeout(startRecognition, 300);
    }
  };

  useEffect(() => {
    return () => {
      stopRecognition();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [stopRecognition]);

  // ───── Handlers ─────
  const handleSaveEdit = (eventId, text) => {
    socketRef.current?.emit('edit', { roomId, eventId, correctedText: text });
  };

  const handleSaveTranslation = (eventId, translation) => {
    socketRef.current?.emit('translate', { roomId, eventId, translation });
  };

  const handleClearAllHistory = () => {
    socketRef.current?.emit('clear_history', { roomId });
  };

  const handleDeleteEvents = (eventIds) => {
    socketRef.current?.emit('delete_events', { roomId, eventIds });
  };

  // ───── Admin Moderation Handlers ─────
  const handleKickParticipant = (targetSocketId, targetName) => {
    socketRef.current?.emit('kick_participant', { roomId, targetSocketId, targetName });
  };

  const handleBlockParticipant = (targetSocketId, targetName) => {
    socketRef.current?.emit('block_participant', { roomId, targetSocketId, targetName });
  };

  const handleUnblockParticipant = (targetName) => {
    socketRef.current?.emit('unblock_participant', { roomId, targetName });
  };

  const handleMuteParticipant = (targetSocketId, targetName) => {
    socketRef.current?.emit('mute_participant', { roomId, targetSocketId, targetName });
  };

  const handleSimulateSpeech = async (phrase) => {
    const id = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const words = phrase.text.split(' ');
    let idx = 0;

    const targetLang = phrase.lang === 'hi' ? 'en' : 'hi';
    const autoTrans = await translateText(phrase.text, phrase.lang, targetLang);

    const iv = setInterval(() => {
      idx = Math.min(idx + 2, words.length);
      const done = idx >= words.length;

      socketRef.current?.emit('speech', {
        roomId,
        eventId: id,
        participantId: socketRef.current?.id || 'sim',
        participantName: phrase.speaker || participantName,
        language: phrase.lang,
        text: words.slice(0, idx).join(' '),
        status: done ? 'final' : 'partial',
        timestamp: Date.now(),
        confidence: phrase.confidence,
        translation: done ? autoTrans : ''
      });

      if (done) clearInterval(iv);
    }, 280);
  };

  const handleExport = (format = 'txt') => {
    const finals = events.filter((e) => e.status !== 'partial');
    if (!finals.length) {
      alert('No finalized captions to export yet.');
      return;
    }

    let content, mime, ext;
    if (format === 'csv') {
      mime = 'text/csv';
      ext = 'csv';
      content = 'Timestamp,Speaker,Language,Status,Text,Translation\n';
      finals.forEach((e) => {
        const t = new Date(e.timestamp).toLocaleTimeString();
        content += `"${t}","${e.participantName}","${e.language}","${e.status}","${(e.text || '').replace(/"/g, '""')}","${(e.translation || '').replace(/"/g, '""')}"\n`;
      });
    } else {
      mime = 'text/plain';
      ext = 'txt';
      content = `=======================================================\nNEXHACK 2.0 - LIVE MULTILINGUAL CLASSROOM TRANSCRIPT\nRoom: ${roomId} | Exported: ${new Date().toLocaleString()}\nTotal Captions: ${finals.length}\n=======================================================\n\n`;
      finals.forEach((e) => {
        const t = new Date(e.timestamp).toLocaleTimeString();
        const tr = e.translation ? ` | [Translation: ${e.translation}]` : '';
        const c = e.status === 'corrected' ? ' (corrected)' : '';
        content += `[${t}] [${e.participantName} (${e.language})]: ${e.text}${c}${tr}\n`;
      });
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = `transcript-${roomId}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;
  const translatedEvents = events.filter((e) => e.status === 'final' || e.status === 'corrected');

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors duration-200">
      
      {/* 1. Top Header */}
      <Header
        roomId={roomId}
        participantName={participantName}
        participantCount={participants.length}
        selectedLanguage={selectedLanguage}
        connectionStatus={connectionStatus}
        captionDelay={captionDelay}
        isAdmin={isAdmin}
        onLeaveRoom={() => setShowLeaveModal(true)}
        onOpenAnalytics={() => setShowAnalyticsModal(true)}
        onOpenRoster={() => setShowRosterModal(true)}
      />

      {/* 2. Error Banner */}
      {hardwareError && (
        <div className="bg-blue-950/90 border-b border-blue-500 px-4 py-2 text-xs text-blue-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <b className="text-white">{hardwareError.title}:</b> {hardwareError.message}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowTroubleshootModal(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
            >
              How to Fix
            </button>
            <button
              onClick={() => setHardwareError(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Reconnect Sync Banner */}
      {syncBanner && (
        <div className={`px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 ${
          syncBanner === 'syncing' ? 'bg-blue-950 text-blue-300 animate-pulse' : 'bg-blue-900 text-blue-200'
        }`}>
          {syncBanner === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reconnected, syncing missed captions...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Room state fully synced! All missed captions recovered.</span>
            </>
          )}
        </div>
      )}

      {/* 4. MAIN WORKSPACE (Big Zoom Grid + History Slider Drawer + Right Hindi Notes) */}
      <div className="flex-1 w-full p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Main Center Area: ZOOM Video Grid + History Slider Drawer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 min-h-0">
          
          {/* Zoom Multi-User Video Grid (Faces + Professor Subtitles + On-screen Mic/Cam) */}
          <div className="flex-1 min-h-[300px] max-h-[480px]">
            <ZoomVideoGrid
              participants={participants}
              currentSocketId={currentSocketId}
              localStream={localStream}
              remoteStreams={remoteStreams}
              peerMediaStates={peerMediaStates}
              isCameraOn={isCameraOn}
              isListening={isListening}
              isScreenSharing={isScreenSharing}
              selectedLanguage={selectedLanguage}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onToggleScreenShare={toggleScreenShare}
              latestEvent={latestEvent}
              activeSpeakerId={activeSpeakerId}
              roomId={roomId}
              participantName={participantName}
              isAdmin={isAdmin}
              onKick={handleKickParticipant}
              onBlock={handleBlockParticipant}
              onMute={handleMuteParticipant}
              onOpenInviteModal={() => setShowInviteModal(true)}
              onOpenRoster={() => setShowRosterModal(true)}
            />
          </div>

          {/* User Requested: History Slider Drawer (Compact, does not make page tall!) */}
          <div className="shrink-0">
            <HistorySliderDrawer
              events={events}
              onSaveEdit={handleSaveEdit}
              onSaveTranslation={handleSaveTranslation}
              onClearAllHistory={handleClearAllHistory}
              onDeleteEvents={handleDeleteEvents}
              currentSocketId={currentSocketId}
              latestEvent={latestEvent}
              selectedLanguage={selectedLanguage}
            />
          </div>

        </div>

        {/* Right Side: Multilingual Lecture Notes (4 cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col overflow-hidden min-h-0">
          <RightTranslatorPanel
            events={translatedEvents}
            onSaveTranslation={handleSaveTranslation}
            currentSocketId={currentSocketId}
            selectedLanguage={selectedLanguage}
          />
        </div>

      </div>

      {/* 5. STICKY ALWAYS-VISIBLE BOTTOM CONTROL BAR */}
      <div className="sticky bottom-0 left-0 right-0 z-40 shrink-0">
        <Controls
          isListening={isListening}
          onToggleMic={toggleMic}
          isCameraOn={isCameraOn}
          onToggleCamera={toggleCamera}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={toggleScreenShare}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={handleLanguageChange}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
          onExport={handleExport}
          onSimulateSpeech={handleSimulateSpeech}
          isSpeechRecognitionSupported={isSpeechRecognitionSupported}
          onOpenTroubleshoot={() => setShowTroubleshootModal(true)}
        />
      </div>

      {/* 6. Multi-User Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomId={roomId}
      />

      {/* 7. MongoDB Analytics & Pipeline Dashboard */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        roomId={roomId}
      />

      {/* 7. Permission Guide Modal */}
      {showTroubleshootModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d333b]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Mic & Camera Permission Guide</h3>
              </div>
              <button
                onClick={() => setShowTroubleshootModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2d333b] space-y-1.5">
                <p className="font-semibold text-white">1. Browser Permissions (Chrome / Edge)</p>
                <p className="text-slate-400">Click the <b>Lock 🔒</b> icon in the URL bar → Set <b>Microphone</b> and <b>Camera</b> to <b>"Allow"</b> → Refresh.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2d333b] space-y-1.5">
                <p className="font-semibold text-white">2. Windows Privacy Settings</p>
                <p className="text-slate-400">Settings → Privacy & Security → <b>Microphone</b> (and <b>Camera</b>) → Turn <b>ON</b> "Let desktop apps access...".</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-blue-500/30 space-y-1.5">
                <p className="font-semibold text-blue-400">3. Test without Mic</p>
                <p className="text-slate-300">Click <b>"Simulate Speech"</b> on the bottom bar to inject live bilingual phrases instantly without any hardware.</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTroubleshootModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Full-Screen Draggable Subtitles (Can be dragged ANYWHERE across entire window!) */}
      <FloatingSubtitleCard
        latestEvent={latestEvent}
        isListening={isListening}
        selectedLanguage={selectedLanguage}
      />

      {/* 9. Leave Room Confirmation UI Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
            
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <LogOut className="w-8 h-8" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {getUIText('leaveConfirmTitle', selectedLanguage)}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                {getUIText('leaveConfirmDesc', selectedLanguage)}
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2.5 bg-[#1a2233] hover:bg-[#242d3d] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-[#2d333b] transition cursor-pointer shadow-sm active:scale-98"
              >
                {getUIText('leaveConfirmCancel', selectedLanguage)}
              </button>
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  onLeaveRoom();
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getUIText('leaveConfirmYes', selectedLanguage)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Class Roster & Moderation Modal */}
      <ParticipantList
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        participants={participants}
        currentSocketId={currentSocketId}
        activeSpeakerId={activeSpeakerId}
        isAdmin={isAdmin}
        peerMediaStates={peerMediaStates}
        blockedList={blockedList}
        onKickParticipant={handleKickParticipant}
        onBlockParticipant={handleBlockParticipant}
        onUnblockParticipant={handleUnblockParticipant}
        onMuteParticipant={handleMuteParticipant}
        selectedLanguage={selectedLanguage}
        roomId={roomId}
      />

      {/* 11. Student Removed (Kicked) Alert Dialog */}
      {kickedNotice && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10002] flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-[#161b22] border border-blue-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <LogOut className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Removed from Classroom</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {kickedNotice.reason || 'You have been removed from this live class by the Teacher.'}
              </p>
            </div>
            <button
              onClick={() => onLeaveRoom(kickedNotice.reason || 'Removed by Teacher')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Exit to Home
            </button>
          </div>
        </div>
      )}

      {/* 12. Student Blocked Alert Dialog */}
      {blockedNotice && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10003] flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-[#161b22] border border-blue-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Permanently Blocked</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {blockedNotice.reason || 'You have been blocked from this classroom by the Teacher. You cannot log back in.'}
              </p>
            </div>
            <button
              onClick={() => onLeaveRoom(blockedNotice.reason || 'Blocked from classroom')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Exit to Home
            </button>
          </div>
        </div>
      )}

      {/* 13. Toast Notification for Teacher Moderation Actions */}
      {moderationToast && (
        <div className="fixed bottom-24 right-6 z-[9999] bg-[#161b22] border border-blue-500/50 shadow-2xl text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{moderationToast}</span>
        </div>
      )}

    </div>
  );
}
