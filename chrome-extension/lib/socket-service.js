/**
 * Socket.IO Connector for MyClassRoom Chrome Extension
 * Connects with existing MyClassRoom Backend (Node.js + Socket.IO)
 */

export class SocketService {
  constructor() {
    this.socket = null;
    this.backendUrl = 'http://localhost:5000';
    this.roomId = 'lecture-101';
    this.participantName = 'Extension User';
    this.language = 'en';
    this.role = 'student';
    this.listeners = new Map();
    this.isConnected = false;
  }

  init({ backendUrl, roomId, participantName, language, role }) {
    if (backendUrl) this.backendUrl = backendUrl.replace(/\/+$/, '');
    if (roomId) this.roomId = roomId;
    if (participantName) this.participantName = participantName;
    if (language) this.language = language;
    if (role) this.role = role;

    this.connect();
  }

  connect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (_) {}
    }

    if (typeof io === 'undefined') {
      console.error('[SocketService] Socket.io client library not loaded.');
      this.emitLocal('error', 'Socket.IO client not available');
      return;
    }

    try {
      this.socket = io(this.backendUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 8000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[Extension Socket] Connected to MyClassRoom backend:', this.socket.id);
        this.emitLocal('status_change', { status: 'connected', socketId: this.socket.id });

        // Join room immediately
        this.socket.emit('join', {
          roomId: this.roomId,
          participantName: this.participantName,
          language: this.language,
          role: this.role,
          sessionId: 'ext_' + Date.now()
        });
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.warn('[Extension Socket] Disconnected:', reason);
        this.emitLocal('status_change', { status: 'disconnected', reason });
      });

      this.socket.on('connect_error', (err) => {
        this.isConnected = false;
        this.emitLocal('status_change', { status: 'offline', error: err.message });
      });

      this.socket.on('init', (data) => {
        this.emitLocal('init', data);
      });

      this.socket.on('participants', (list) => {
        this.emitLocal('participants', list);
      });

      this.socket.on('speech', (evt) => {
        this.emitLocal('speech', evt);
      });

      this.socket.on('edit', (data) => {
        this.emitLocal('edit', data);
      });

      this.socket.on('translate', (data) => {
        this.emitLocal('translate', data);
      });

      this.socket.on('history_cleared', () => {
        this.emitLocal('history_cleared');
      });

      this.socket.on('events_deleted', (data) => {
        this.emitLocal('events_deleted', data);
      });

    } catch (e) {
      console.error('[SocketService] Error creating connection:', e);
      this.isConnected = false;
      this.emitLocal('status_change', { status: 'error', error: e.message });
    }
  }

  sendSpeech(eventData) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('speech', {
      roomId: this.roomId,
      participantName: this.participantName,
      ...eventData
    });
  }

  sendEdit(eventId, correctedText) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('edit', {
      roomId: this.roomId,
      eventId,
      correctedText
    });
  }

  deleteEvents(eventIds) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('delete_events', {
      roomId: this.roomId,
      eventIds
    });
  }

  clearHistory() {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('clear_history', {
      roomId: this.roomId
    });
  }

  updateRoom(newRoomId, newParticipantName) {
    this.roomId = newRoomId || this.roomId;
    if (newParticipantName) this.participantName = newParticipantName;
    if (this.socket && this.isConnected) {
      this.socket.emit('join', {
        roomId: this.roomId,
        participantName: this.participantName,
        language: this.language,
        role: this.role,
        sessionId: 'ext_' + Date.now()
      });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('Listener callback error:', e); }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      try { this.socket.disconnect(); } catch (_) {}
      this.socket = null;
      this.isConnected = false;
    }
  }
}
