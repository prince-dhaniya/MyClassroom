const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const TranscriptEvent = require('./models/TranscriptEvent');
const Room = require('./models/Room');
const {
  getRoomAnalytics,
  getAggregatedParagraphs,
  getChronologicalTimeline,
  searchTranscripts
} = require('./services/analytics');
const { translateText } = require('./services/translatorService');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexhack_captions';

// ───── Connect to MongoDB & Initialize Indexing ─────
let isMongoConnected = false;

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 3000
  })
  .then(async () => {
    isMongoConnected = true;
    console.log(`=======================================================`);
    console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
    // Sync High-Performance Compound & Full-Text Indexes
    try {
      await TranscriptEvent.syncIndexes();
      await Room.syncIndexes();
      console.log(`[MongoDB] Indexes synchronized:`);
      console.log(`  - { roomId: 1, timestamp: 1 } (Chronological)`);
      console.log(`  - { roomId: 1, status: 1 } (Status Filter)`);
      console.log(`  - { text: 'text', translation: 'text' } (Full-Text Search)`);

      // Clean up past buggy "नमस्ते" translations in local database
      try {
        const badDocs = await TranscriptEvent.find({ translation: 'नमस्ते' });
        for (const doc of badDocs) {
          if (!/^(hi|hello)\b/i.test((doc.text || '').trim())) {
            const fixedTrans = await translateText(doc.text, doc.language || 'en', 'hi');
            if (fixedTrans && fixedTrans !== 'नमस्ते') {
              await TranscriptEvent.updateOne({ _id: doc._id }, { translation: fixedTrans });
              console.log(`[MongoDB Fix] Corrected translation for "${doc.text}" -> "${fixedTrans}"`);
            }
          }
        }
      } catch (cleanErr) {
        console.warn('[MongoDB Clean Warning]', cleanErr.message);
      }
    } catch (idxErr) {
      console.warn(`[MongoDB] Index sync warning:`, idxErr.message);
    }
    console.log(`=======================================================`);
  })
  .catch((err) => {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${err.message}). Using resilient local in-memory fallback.`);
    isMongoConnected = false;
  });

// Enable CORS for all incoming requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Socket.IO configuration with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

// In-Memory store for fast real-time caching
const rooms = {};

// Ensure data directory exists for disk backup
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to persist room events asynchronously to disk
function saveRoomSnapshot(roomId) {
  try {
    if (!rooms[roomId]) return;
    const filePath = path.join(dataDir, `${roomId}.json`);
    const data = JSON.stringify(rooms[roomId], null, 2);
    fs.writeFile(filePath, data, (err) => {
      if (err) console.error(`[Storage] Failed to save snapshot for room ${roomId}:`, err.message);
    });
  } catch (err) {
    console.error(`[Storage] Error persisting room ${roomId}:`, err.message);
  }
}

// ───── REST Endpoints ─────

// Health Check with Database Status
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongoStatus: isMongoConnected ? 'connected' : 'fallback_memory_mode',
    database: isMongoConnected ? mongoose.connection.name : null,
    storageType: '100% Local Machine Storage (Offline / Localhost)',
    mongoUri: MONGO_URI,
    localDbPath: 'C:\\Program Files\\MongoDB\\Server\\9.0\\data',
    activeRooms: Object.keys(rooms).length,
    timestamp: new Date().toISOString()
  });
});

// 1. MongoDB Aggregation Pipeline Endpoint: Classroom Analytics
app.get('/api/rooms/:roomId/analytics', async (req, res) => {
  const { roomId } = req.params;
  if (isMongoConnected) {
    const analytics = await getRoomAnalytics(roomId);
    return res.json(analytics);
  }

  // In-Memory Aggregation Fallback
  const room = rooms[roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const finalEvents = room.events.filter(e => e.status !== 'partial');
  const speakers = {};
  finalEvents.forEach(e => {
    speakers[e.participantName] = (speakers[e.participantName] || 0) + 1;
  });

  res.json({
    success: true,
    roomId,
    dataSource: 'Memory Fallback Pipeline',
    quality: {
      totalFinalCaptions: finalEvents.length,
      uncertainCount: finalEvents.filter(e => e.confidence && e.confidence < 0.85).length,
      correctedCount: finalEvents.filter(e => e.status === 'corrected').length,
      avgRoomConfidence: 94.5
    },
    speakers: Object.entries(speakers).map(([name, count]) => ({
      speaker: name,
      totalUtterances: count
    }))
  });
});

// 2. MongoDB Aggregation Pipeline Endpoint: Aggregated Paragraphs
app.get('/api/rooms/:roomId/paragraphs', async (req, res) => {
  const { roomId } = req.params;
  if (isMongoConnected) {
    const data = await getAggregatedParagraphs(roomId);
    return res.json(data);
  }
  res.json({ success: false, message: 'Aggregation pipeline requires MongoDB active connection' });
});

// 2.5 MongoDB Aggregation Pipeline Endpoint: Chronological History Timeline ($sort: { timestamp: 1 })
app.get('/api/rooms/:roomId/timeline', async (req, res) => {
  const { roomId } = req.params;
  const sortDirection = req.query.order === 'desc' ? -1 : 1;
  if (isMongoConnected) {
    const data = await getChronologicalTimeline(roomId, sortDirection);
    return res.json(data);
  }
  const room = rooms[roomId];
  if (!room) return res.json({ success: true, events: [] });
  const sorted = [...room.events]
    .filter(e => e.status !== 'partial')
    .sort((a, b) => sortDirection === 1 ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
  res.json({ success: true, count: sorted.length, events: sorted });
});

// 3. MongoDB Indexed Full-Text Search
app.get('/api/rooms/:roomId/search', async (req, res) => {
  const { roomId } = req.params;
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query parameter q is required' });

  if (isMongoConnected) {
    const searchResults = await searchTranscripts(roomId, q);
    return res.json(searchResults);
  }

  // Memory search fallback
  const room = rooms[roomId];
  if (!room) return res.json({ results: [], count: 0 });
  const results = room.events.filter(e =>
    (e.text || '').toLowerCase().includes(q.toLowerCase()) ||
    (e.translation || '').toLowerCase().includes(q.toLowerCase())
  );
  res.json({ success: true, results, count: results.length });
});

// 4. Free Real-Time Translation Endpoint (English to Hindi & 12+ Languages)
app.get('/api/translate', async (req, res) => {
  const { text, from = 'en', to = 'hi' } = req.query;
  if (!text) return res.status(400).json({ success: false, error: 'text is required' });
  try {
    const translation = await translateText(text, from, to);
    res.json({ success: true, text, from, to, translation });
  } catch (err) {
    res.json({ success: false, text, from, to, translation: text, error: err.message });
  }
});

// Get room details & past events via HTTP
app.get('/api/rooms/:roomId/events', (req, res) => {
  const { roomId } = req.params;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    roomId,
    participants: rooms[roomId].participants,
    events: rooms[roomId].events
  });
});

// Export formatted transcript via HTTP
app.get('/api/rooms/:roomId/export', (req, res) => {
  const { roomId } = req.params;
  const format = req.query.format || 'txt';
  const room = rooms[roomId];

  if (!room) {
    return res.status(404).send('Room not found');
  }

  const finalEvents = room.events.filter(e => e.status !== 'partial');

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${roomId}.csv"`);
    let csv = 'Timestamp,Speaker,Language,Status,Original Text,Translation\n';
    finalEvents.forEach(e => {
      const timeStr = new Date(e.timestamp).toLocaleTimeString();
      const cleanText = (e.text || '').replace(/"/g, '""');
      const cleanTrans = (e.translation || '').replace(/"/g, '""');
      csv += `"${timeStr}","${e.participantName}","${e.language}","${e.status}","${cleanText}","${cleanTrans}"\n`;
    });
    return res.send(csv);
  }

  // Default TXT
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="transcript-${roomId}.txt"`);
  let txt = `=======================================================\n`;
  txt += `NEXHACK 2.0 - LIVE MULTILINGUAL CAPTION ROOM TRANSCRIPT\n`;
  txt += `Room ID: ${roomId}\n`;
  txt += `Exported At: ${new Date().toLocaleString()}\n`;
  txt += `Total Entries: ${finalEvents.length}\n`;
  txt += `=======================================================\n\n`;

  finalEvents.forEach(e => {
    const timeStr = new Date(e.timestamp).toLocaleTimeString();
    const trans = e.translation ? ` | [Translation: ${e.translation}]` : '';
    const statusMark = e.status === 'corrected' ? ' (corrected)' : '';
    txt += `[${timeStr}] [${e.participantName} (${e.language})]: ${e.text}${statusMark}${trans}\n`;
  });

  res.send(txt);
});

// ───── Socket.IO Event Handlers ─────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // 1. User joins room
  socket.on('join', async ({ roomId, participantName, language, role, sessionId }) => {
    if (!roomId || !participantName) {
      return socket.emit('error_msg', { message: 'roomId and participantName are required' });
    }

    // Initialize or restore room from MongoDB / disk if doesn't exist in memory
    if (!rooms[roomId]) {
      if (isMongoConnected) {
        try {
          const timeline = await getChronologicalTimeline(roomId, 1);
          const mongoEvents = timeline.events || [];
          rooms[roomId] = {
            createdAt: Date.now(),
            hostSocketId: null,
            hostName: null,
            participants: [],
            blockedUsers: new Set(),
            removedUsers: new Set(),
            joinedHistory: new Set(),
            sessionMap: {},
            events: mongoEvents
          };
          console.log(`[MongoDB Aggregation Pipeline] Restored ${mongoEvents.length} chronological events for room ${roomId}`);
        } catch (e) {
          rooms[roomId] = {
            createdAt: Date.now(),
            hostSocketId: null,
            hostName: null,
            participants: [],
            blockedUsers: new Set(),
            removedUsers: new Set(),
            joinedHistory: new Set(),
            sessionMap: {},
            events: []
          };
        }
      } else {
        // Disk fallback
        const filePath = path.join(dataDir, `${roomId}.json`);
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            rooms[roomId] = JSON.parse(raw);
            rooms[roomId].participants = [];
            rooms[roomId].blockedUsers = new Set(rooms[roomId].blockedUsers || []);
            rooms[roomId].removedUsers = new Set(rooms[roomId].removedUsers || []);
            rooms[roomId].joinedHistory = new Set(rooms[roomId].joinedHistory || []);
            rooms[roomId].sessionMap = rooms[roomId].sessionMap || {};
            console.log(`[Storage] Restored ${rooms[roomId].events?.length || 0} events for room ${roomId} from disk`);
          } catch (e) {
            rooms[roomId] = {
              createdAt: Date.now(),
              hostSocketId: null,
              hostName: null,
              participants: [],
              blockedUsers: new Set(),
              removedUsers: new Set(),
              joinedHistory: new Set(),
              sessionMap: {},
              events: []
            };
          }
        } else {
          rooms[roomId] = {
            createdAt: Date.now(),
            hostSocketId: null,
            hostName: null,
            participants: [],
            blockedUsers: new Set(),
            removedUsers: new Set(),
            joinedHistory: new Set(),
            sessionMap: {},
            events: []
          };
          console.log(`[Room Created] Room ID: ${roomId}`);
        }
      }
    } else {
      // Ensure sets exist
      if (!rooms[roomId].blockedUsers) rooms[roomId].blockedUsers = new Set();
      if (!rooms[roomId].removedUsers) rooms[roomId].removedUsers = new Set();
      if (!rooms[roomId].joinedHistory) rooms[roomId].joinedHistory = new Set();
      if (!rooms[roomId].sessionMap) rooms[roomId].sessionMap = {};
    }

    const normName = participantName.trim().toLowerCase();

    // Determine Role: teacher/host gets admin powers
    const isTeacher =
      role === 'admin' ||
      participantName.toLowerCase().includes('prof') ||
      participantName.toLowerCase().includes('teacher') ||
      !rooms[roomId].hostSocketId;
    const userRole = isTeacher ? 'admin' : 'student';

    // ───── RULE 1: Blocked User Verification ─────
    if (rooms[roomId].blockedUsers.has(normName)) {
      console.log(`[Join Rejected - Blocked] ${participantName} tried to join room ${roomId}`);
      return socket.emit('join_error', {
        code: 'BLOCKED',
        message: `Aapko Teacher dwara is class se BLOCK kar diya gaya hai. Aap is class me dubara pravesh nahi kar sakte.`
      });
    }

    // ───── RULE 2: Kicked / Removed User Verification ─────
    if (rooms[roomId].removedUsers.has(normName)) {
      console.log(`[Join Rejected - Kicked] ${participantName} tried to re-join room ${roomId}`);
      return socket.emit('join_error', {
        code: 'KICKED',
        message: `Aapko Teacher dwara is class se nikal diya gaya hai. Dubara pravesh nishedh hai.`
      });
    }

    // ───── RULE 3: Duplicate Active Connection Verification ─────
    // Jo user ek baar connect hai, doosra tab/user usi naam se connect nahi kar sakta
    const activeSameUser = rooms[roomId].participants.find(p =>
      p.participantName.trim().toLowerCase() === normName && p.socketId !== socket.id
    );
    if (activeSameUser) {
      console.log(`[Join Rejected - Duplicate] ${participantName} is already connected in room ${roomId}`);
      return socket.emit('join_error', {
        code: 'DUPLICATE_LOGIN',
        message: `"${participantName}" already is class me connected hai! Ek user ek hi baar login kar sakta hai.`
      });
    }

    // ───── RULE 4: One-Time Connection Verification (Single Login Policy) ─────
    // Jo student ek baar connect hogya vo doosre session/browser se dubara login nahi kar sakta
    if (userRole !== 'admin' && rooms[roomId].joinedHistory.has(normName)) {
      const savedSession = rooms[roomId].sessionMap[normName];
      // Allow legitimate page refresh if same tab session token matches
      if (!sessionId || savedSession !== sessionId) {
        console.log(`[Join Rejected - Re-login Denied] ${participantName} already connected once in room ${roomId}`);
        return socket.emit('join_error', {
          code: 'ONE_TIME_LOGIN',
          message: `Aap is class me pehle connect ho chuke hain. Ek baar connect hone ke baad dubara login allowed nahi hai.`
        });
      }
    }

    // Valid join: Register socket in room
    socket.join(roomId);

    if (sessionId) {
      rooms[roomId].sessionMap[normName] = sessionId;
    }
    rooms[roomId].joinedHistory.add(normName);

    if (userRole === 'admin' && !rooms[roomId].hostSocketId) {
      rooms[roomId].hostSocketId = socket.id;
      rooms[roomId].hostName = participantName;
    }

    // Save metadata on socket instance
    socket.data.roomId = roomId;
    socket.data.participantName = participantName;
    socket.data.language = language || 'en';
    socket.data.role = userRole;
    socket.data.sessionId = sessionId;

    // Add or update participant in list
    const existingIndex = rooms[roomId].participants.findIndex(p => p.socketId === socket.id);
    const participantInfo = {
      socketId: socket.id,
      participantName,
      language: socket.data.language,
      role: userRole,
      isAdmin: userRole === 'admin',
      joinedAt: Date.now()
    };

    if (existingIndex >= 0) {
      rooms[roomId].participants[existingIndex] = participantInfo;
    } else {
      rooms[roomId].participants.push(participantInfo);
    }

    console.log(`[Join] ${participantName} (${userRole.toUpperCase()}) joined room ${roomId}. Total: ${rooms[roomId].participants.length}`);

    // Update Room in MongoDB
    if (isMongoConnected) {
      Room.findOneAndUpdate(
        { roomId },
        {
          roomId,
          $addToSet: { activeParticipants: participantInfo }
        },
        { upsert: true }
      ).catch(() => {});
    }

    // Send admin status and blocked list to the client
    socket.emit('admin_status', {
      isAdmin: userRole === 'admin',
      role: userRole,
      hostName: rooms[roomId].hostName
    });

    if (userRole === 'admin') {
      socket.emit('blocked_list', Array.from(rooms[roomId].blockedUsers));
    }

    // Broadcast updated participant list to everyone in room
    io.to(roomId).emit('participants', rooms[roomId].participants);

    // Send past events in strictly chronological order (jo time pehle bola vo pehle dikhega)
    const chronologicalEvents = [...rooms[roomId].events].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    socket.emit('init', chronologicalEvents);

    // Map language code to human-readable label with flag
    const langNames = {
      en: 'English 🇬🇧', hi: 'Hindi 🇮🇳', mr: 'Marathi 🇮🇳', bn: 'Bengali 🇮🇳',
      gu: 'Gujarati 🇮🇳', ta: 'Tamil 🇮🇳', te: 'Telugu 🇮🇳', es: 'Spanish 🇪🇸',
      fr: 'French 🇫🇷', de: 'German 🇩🇪', ja: 'Japanese 🇯🇵', zh: 'Chinese 🇨🇳'
    };
    const userLangLabel = langNames[socket.data.language] || socket.data.language || 'English 🇬🇧';
    const roleIcon = userRole === 'admin' ? '👨‍🏫 [Teacher / Host]' : '🎓 [Student]';

    // Log Join Event with Selected Language ONLY ONCE per participant (prevents repeated join spam on reconnect/refresh)
    const alreadyLoggedJoin = rooms[roomId].events.some(
      e => (e.type === 'system_join' || (e.text && e.text.includes('joined the class'))) &&
           (e.participantName || '').trim().toLowerCase() === normName
    );

    if (!alreadyLoggedJoin) {
      const joinEvent = {
        roomId,
        eventId: 'evt_join_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        participantId: socket.id,
        participantName: participantName,
        language: socket.data.language,
        type: 'system_join',
        text: `${roleIcon} ${participantName} joined the class [Language: ${userLangLabel}]`,
        translation: `${roleIcon} ${participantName} कक्षा में शामिल हुए [भाषा: ${userLangLabel}]`,
        status: 'final',
        confidence: 1.0,
        timestamp: Date.now()
      };
      rooms[roomId].events.push(joinEvent);
      io.to(roomId).emit('speech', joinEvent);
      if (isMongoConnected) {
        TranscriptEvent.create(joinEvent).catch(() => {});
      }
    }

    // Broadcast announcement notification
    socket.to(roomId).emit('system_notification', {
      type: 'user_joined',
      message: `${participantName} joined the room as ${userRole === 'admin' ? 'Teacher/Host' : 'Student'}.`,
      timestamp: Date.now()
    });
  });

  // 1.5 Update Selected Language
  socket.on('update_language', async ({ roomId, language }) => {
    if (!roomId || !rooms[roomId]) return;
    socket.data.language = language;
    const p = rooms[roomId].participants.find(p => p.socketId === socket.id);
    if (p) p.language = language;
    io.to(roomId).emit('participants', rooms[roomId].participants);

    const langNames = {
      en: 'English 🇬🇧', hi: 'Hindi 🇮🇳', mr: 'Marathi 🇮🇳', bn: 'Bengali 🇮🇳',
      gu: 'Gujarati 🇮🇳', ta: 'Tamil 🇮🇳', te: 'Telugu 🇮🇳', es: 'Spanish 🇪🇸',
      fr: 'French 🇫🇷', de: 'German 🇩🇪', ja: 'Japanese 🇯🇵', zh: 'Chinese 🇨🇳'
    };
    const langLabel = langNames[language] || language;
    const pName = socket.data.participantName || 'Participant';

    const langEvent = {
      roomId,
      eventId: 'evt_lang_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      participantId: socket.id,
      participantName: pName,
      language: language,
      type: 'system_lang_change',
      text: `🌐 ${pName} changed speech language to: ${langLabel}`,
      translation: `🌐 ${pName} ने भाषा बदलकर ${langLabel} कर दी`,
      status: 'final',
      confidence: 1.0,
      timestamp: Date.now()
    };
    rooms[roomId].events.push(langEvent);
    io.to(roomId).emit('speech', langEvent);
    if (isMongoConnected) {
      TranscriptEvent.create(langEvent).catch(() => {});
    }
    saveRoomSnapshot(roomId);
  });

  // 2. Speech Caption Event (interim partial or final)
  socket.on('speech', async (event) => {
    const { roomId, eventId, status, text } = event;
    if (!roomId || !eventId) return;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        createdAt: Date.now(),
        participants: [],
        events: []
      };
    }

    const roomEvents = rooms[roomId].events;
    const existingEventIndex = roomEvents.findIndex(e => e.eventId === eventId);

    if (existingEventIndex >= 0) {
      const existing = roomEvents[existingEventIndex];
      existing.text = text;
      existing.status = status;
      existing.timestamp = event.timestamp || Date.now();
      if (event.confidence !== undefined) existing.confidence = event.confidence;
      if (event.translation !== undefined) existing.translation = event.translation;
      if (event.language) existing.language = event.language;
    } else {
      const newEvent = {
        roomId,
        eventId,
        participantId: event.participantId || socket.id,
        participantName: event.participantName || socket.data.participantName || 'Anonymous',
        language: event.language || 'en',
        text: text || '',
        status: status || 'partial',
        timestamp: event.timestamp || Date.now(),
        translation: event.translation || '',
        confidence: event.confidence !== undefined ? event.confidence : 1.0
      };
      roomEvents.push(newEvent);
    }

    // Broadcast caption to all peers in the room
    io.to(roomId).emit('speech', event);

    // Automatic server-side translation verification for final captions
    // Guarantees no repeated "नमस्ते" bugs!
    if (status === 'final' && text && text.trim()) {
      const isGreeting = /^(hi|hello)\b/i.test(text.trim());
      const needsFix = !event.translation || (!isGreeting && event.translation === 'नमस्ते');
      if (needsFix) {
        translateText(text, event.language || 'en', 'hi').then((realTrans) => {
          if (realTrans && realTrans !== 'नमस्ते') {
            const ev = roomEvents.find(e => e.eventId === eventId);
            if (ev) ev.translation = realTrans;
            io.to(roomId).emit('translate', { eventId, translation: realTrans });
            if (isMongoConnected) {
              TranscriptEvent.findOneAndUpdate({ roomId, eventId }, { translation: realTrans }).catch(() => {});
            }
            saveRoomSnapshot(roomId);
          }
        }).catch(() => {});
      }
    }

    // Persist to MongoDB with Upsert & Indexing
    if (isMongoConnected) {
      TranscriptEvent.findOneAndUpdate(
        { roomId, eventId },
        {
          roomId,
          eventId,
          participantId: event.participantId || socket.id,
          participantName: event.participantName || socket.data.participantName || 'Anonymous',
          language: event.language || 'en',
          text: text || '',
          translation: event.translation || '',
          status: status || 'partial',
          confidence: event.confidence !== undefined ? event.confidence : 1.0,
          timestamp: event.timestamp || Date.now()
        },
        { upsert: true, new: true }
      ).catch(err => console.error('[MongoDB Error]', err.message));
    }

    // If final, persist state snapshot
    if (status === 'final') {
      saveRoomSnapshot(roomId);
    }
  });

  // 3. Edit Transcript Event (Teacher or Student corrects text)
  socket.on('edit', ({ roomId, eventId, correctedText }) => {
    if (!roomId || !eventId) return;

    if (rooms[roomId]) {
      const targetEvent = rooms[roomId].events.find(e => e.eventId === eventId);
      if (targetEvent) {
        targetEvent.text = correctedText;
        targetEvent.status = 'corrected';
        targetEvent.correctedAt = Date.now();
        targetEvent.correctedBy = socket.data.participantName || 'Anonymous';

        console.log(`[Edit] Event ${eventId} updated in room ${roomId}: "${correctedText}"`);

        // Broadcast to all clients in the room
        io.to(roomId).emit('edit', {
          eventId,
          correctedText,
          status: 'corrected',
          correctedBy: targetEvent.correctedBy
        });

        // Update in MongoDB
        if (isMongoConnected) {
          TranscriptEvent.findOneAndUpdate(
            { roomId, eventId },
            {
              text: correctedText,
              status: 'corrected',
              correctedBy: targetEvent.correctedBy,
              correctedAt: Date.now()
            }
          ).catch(err => console.error('[MongoDB Edit Error]', err.message));
        }

        saveRoomSnapshot(roomId);
      }
    }
  });

  // 4. Translate Event (Add or update manual/local translation)
  socket.on('translate', ({ roomId, eventId, translation }) => {
    if (!roomId || !eventId) return;

    if (rooms[roomId]) {
      const targetEvent = rooms[roomId].events.find(e => e.eventId === eventId);
      if (targetEvent) {
        targetEvent.translation = translation;

        io.to(roomId).emit('translate', {
          eventId,
          translation
        });

        // Update in MongoDB
        if (isMongoConnected) {
          TranscriptEvent.findOneAndUpdate(
            { roomId, eventId },
            { translation }
          ).catch(err => console.error('[MongoDB Translate Error]', err.message));
        }

        saveRoomSnapshot(roomId);
      }
    }
  });

  // 4.5 Clear All History in Room (Socket Handler)
  socket.on('clear_history', async ({ roomId }) => {
    if (!roomId) return;
    if (rooms[roomId]) {
      rooms[roomId].events = [];
      saveRoomSnapshot(roomId);
    }
    if (isMongoConnected) {
      await TranscriptEvent.deleteMany({ roomId }).catch(err => console.error('[MongoDB Clear Error]', err.message));
    }
    io.to(roomId).emit('history_cleared', {
      roomId,
      clearedBy: socket.data.participantName || 'Anonymous'
    });
    console.log(`[History Cleared] Room ${roomId} history cleared by ${socket.data.participantName}`);
  });

  // 4.6 Delete Specific Selected Events One-by-One or in Bulk
  socket.on('delete_events', async ({ roomId, eventIds }) => {
    if (!roomId || !Array.isArray(eventIds) || !eventIds.length) return;
    if (rooms[roomId]) {
      rooms[roomId].events = rooms[roomId].events.filter(e => !eventIds.includes(e.eventId));
      saveRoomSnapshot(roomId);
    }
    if (isMongoConnected) {
      await TranscriptEvent.deleteMany({
        roomId,
        eventId: { $in: eventIds }
      }).catch(err => console.error('[MongoDB Delete Error]', err.message));
    }
    io.to(roomId).emit('events_deleted', {
      roomId,
      eventIds,
      deletedBy: socket.data.participantName || 'Anonymous'
    });
    console.log(`[Events Deleted] Room ${roomId}: ${eventIds.length} event(s) deleted by ${socket.data.participantName}`);
  });

  // 4.7 Teacher / Admin Action: Kick Participant from Room (Class se hatana)
  socket.on('kick_participant', ({ roomId, targetSocketId, targetName }) => {
    if (!roomId || !targetSocketId) return;

    if (socket.data.role !== 'admin') {
      console.warn(`[Unauthorized Kick] Non-admin ${socket.data.participantName} tried to kick`);
      return socket.emit('error_msg', { message: 'Sirf Admin/Teacher hi kisi student ko class se hata sakta hai.' });
    }

    const room = rooms[roomId];
    if (!room) return;

    const normName = (targetName || '').trim().toLowerCase();
    if (normName) {
      room.removedUsers.add(normName);
    }

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('kicked_by_admin', {
        reason: `Aapko Teacher (${socket.data.participantName}) dwara class se hata diya gaya hai.`,
        by: socket.data.participantName
      });
      targetSocket.leave(roomId);
    }

    // Remove from active participants list
    room.participants = room.participants.filter(p => p.socketId !== targetSocketId);
    io.to(roomId).emit('participants', room.participants);

    // Announce to class transcript
    const kickAnnounce = {
      roomId,
      eventId: 'evt_kick_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      participantId: socket.id,
      participantName: socket.data.participantName,
      type: 'system_join',
      text: `🚪 [Teacher Action] ${targetName || 'Student'} was removed from the class by ${socket.data.participantName}.`,
      translation: `🚪 [शिक्षक कार्रवाई] ${targetName || 'छात्र'} को शिक्षक द्वारा कक्षा से हटा दिया गया।`,
      status: 'final',
      confidence: 1.0,
      timestamp: Date.now()
    };
    room.events.push(kickAnnounce);
    io.to(roomId).emit('speech', kickAnnounce);
    saveRoomSnapshot(roomId);
    console.log(`[Participant Kicked] ${targetName} kicked from ${roomId} by ${socket.data.participantName}`);
  });

  // 4.8 Teacher / Admin Action: Block Participant (Dubara login ban / block karna)
  socket.on('block_participant', ({ roomId, targetSocketId, targetName }) => {
    if (!roomId || !targetName) return;

    if (socket.data.role !== 'admin') {
      console.warn(`[Unauthorized Block] Non-admin ${socket.data.participantName} tried to block`);
      return socket.emit('error_msg', { message: 'Sirf Admin/Teacher hi kisi student ko block kar sakta hai.' });
    }

    const room = rooms[roomId];
    if (!room) return;

    const normName = targetName.trim().toLowerCase();
    room.blockedUsers.add(normName);
    room.removedUsers.add(normName);

    // If active in room, forcefully kick them out with BLOCKED notice
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('blocked_by_admin', {
          reason: `Aapko Teacher (${socket.data.participantName}) dwara is class se BLOCK kar diya gaya hai. Aap dubara login nahi kar sakte.`,
          by: socket.data.participantName
        });
        targetSocket.leave(roomId);
      }
      room.participants = room.participants.filter(p => p.socketId !== targetSocketId);
      io.to(roomId).emit('participants', room.participants);
    }

    // Send updated blocked list back to admin
    socket.emit('blocked_list', Array.from(room.blockedUsers));

    // Announce to class transcript
    const blockAnnounce = {
      roomId,
      eventId: 'evt_block_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      participantId: socket.id,
      participantName: socket.data.participantName,
      type: 'system_join',
      text: `🚫 [Teacher Action] ${targetName} was BLOCKED from the classroom.`,
      translation: `🚫 [शिक्षक कार्रवाई] ${targetName} को कक्षा से ब्लॉक कर दिया गया है।`,
      status: 'final',
      confidence: 1.0,
      timestamp: Date.now()
    };
    room.events.push(blockAnnounce);
    io.to(roomId).emit('speech', blockAnnounce);
    saveRoomSnapshot(roomId);
    console.log(`[Participant Blocked] ${targetName} blocked in ${roomId} by ${socket.data.participantName}`);
  });

  // 4.9 Teacher / Admin Action: Unblock Participant
  socket.on('unblock_participant', ({ roomId, targetName }) => {
    if (!roomId || !targetName) return;

    if (socket.data.role !== 'admin') {
      return socket.emit('error_msg', { message: 'Sirf Admin hi unblock kar sakta hai.' });
    }

    const room = rooms[roomId];
    if (!room) return;

    const normName = targetName.trim().toLowerCase();
    room.blockedUsers.delete(normName);
    room.removedUsers.delete(normName);
    room.joinedHistory.delete(normName);
    delete room.sessionMap[normName];

    socket.emit('blocked_list', Array.from(room.blockedUsers));
    console.log(`[Participant Unblocked] ${targetName} unblocked in ${roomId}`);
  });

  // 4.10 Teacher / Admin Action: Force Mute Student's Microphone
  socket.on('mute_participant', ({ roomId, targetSocketId, targetName }) => {
    if (!roomId || !targetSocketId) return;

    if (socket.data.role !== 'admin') {
      return socket.emit('error_msg', { message: 'Sirf Admin hi student ko mute kar sakta hai.' });
    }

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('force_mute', {
        by: socket.data.participantName
      });
    }
  });

  // 4.11 Request Blocked List (Admin only)
  socket.on('get_blocked_list', ({ roomId }) => {
    if (socket.data.role !== 'admin') return;
    if (rooms[roomId]) {
      socket.emit('blocked_list', Array.from(rooms[roomId].blockedUsers || []));
    }
  });

  // 5. WebRTC Multi-User Video Signaling (Zoom-style Face Video Mesh)
  socket.on('webrtc_signal', ({ to, signal, fromName }) => {
    if (!to) return;
    io.to(to).emit('webrtc_signal', {
      from: socket.id,
      fromName: fromName || socket.data.participantName || 'Anonymous',
      signal
    });
  });

  // 6. Media State Broadcast (Camera on/off, Mic on/off, Screen Share)
  socket.on('media_state', ({ roomId, isCameraOn, isMicOn, isScreenSharing }) => {
    if (!roomId) return;
    socket.to(roomId).emit('peer_media_state', {
      socketId: socket.id,
      participantName: socket.data.participantName || 'Anonymous',
      isCameraOn,
      isMicOn,
      isScreenSharing: !!isScreenSharing
    });
  });

  // 7. Request Video Stream from peers in room
  socket.on('request_peer_streams', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('peer_requested_stream', {
      requesterId: socket.id,
      requesterName: socket.data.participantName || 'Anonymous'
    });
  });

  // 8. Handle Disconnect
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const participantName = socket.data.participantName;

    console.log(`[Disconnect] Socket ${socket.id} (${participantName || 'Unregistered'}) disconnected`);

    if (roomId && rooms[roomId]) {
      rooms[roomId].participants = rooms[roomId].participants.filter(p => p.socketId !== socket.id);

      io.to(roomId).emit('participants', rooms[roomId].participants);

      socket.to(roomId).emit('system_notification', {
        type: 'user_left',
        message: `${participantName || 'A participant'} left the room.`,
        timestamp: Date.now()
      });

      saveRoomSnapshot(roomId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`NexHack 2.0 Live Captioning Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
