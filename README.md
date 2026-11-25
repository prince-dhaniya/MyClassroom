# NexHack 2.0 — Problem Statement 02 (EdTech)
## 🎙️ Live Multilingual Captioning Room

A real-time, resilient classroom captioning and translation room designed for multilingual learners and accessible education. Runs **100% locally** on laptop/desktop using browser-native **Web Speech API** and an offline educational dictionary—**zero cloud AI API keys required**.

---

## 🌟 Key Highlights & Challenge Solutions

| Requirement | Implementation in Application |
|---|---|
| **Stream & Identify** | Real-time speech streaming via WebSockets with visible speaker names, custom avatars, and language indicators. |
| **Revise Without Losing Context** | Distinguishes interim `partial` updates from `final` utterances using persistent `eventId` tracking. |
| **Multilingual Support** | Instant toggle between **English (`en-US`)** and **Hindi (`hi-IN`)** with code-switching capability. |
| **Uncertainty Highlighting** | Captions with speech engine confidence `< 0.85` are highlighted in **Amber (`#FF851B`)** to warn readers of uncertain speech. |
| **Recover Missed Speech** | Socket.IO auto-reconnect with historical event deduplication (`init` replay)—students who drop off recover all missed captions seamlessly without duplicating the live stream. |
| **Preserve Corrections** | Inline click-to-edit interface allowing teachers/students to correct transcripts. Corrections are broadcasted live with `(edited)` badges and retained in exports. |
| **Caption Delay Metric** | Live latency tracker calculates and displays real-time caption delay (`ms`) between utterance capture and client rendering. |
| **Persistent Export** | Download clean formatted transcripts as **`.txt`** or **`.csv`** with exact timestamps, speaker names, original text, and translations. |
| **Zero Cloud API / Local** | Operates completely offline with Web Speech API and an offline classroom translation engine. |
| **Quick Demo Simulator** | Built-in bilingual speech simulator to demonstrate dual-speaker interleaving and reconnects even when testing two tabs on a single microphone. |

---

## 🎨 Design System
Tailored to the hackathon specification:
- **Navy Blue (`#001f3f` / `#001226`)**: Background, container surfaces, and header styling.
- **Teal (`#39CCCC`)**: Active elements, buttons, speaker pulses, and badges.
- **Amber (`#FF851B`)**: Low-confidence predictions (`< 85%`) and uncertainty highlights.

---

## 🏗️ Project Architecture

```
Nexhack/
├── server/                    # Node.js + Express + Socket.IO backend
│   ├── index.js               # WebSocket room store, event dispatcher, REST APIs
│   ├── test_server.js         # Automated end-to-end WebSocket test suite
│   ├── package.json           # Backend dependencies (express, socket.io, cors, dotenv)
│   └── data/                  # Optional JSON persistence store for room transcripts
│
├── client/                    # Modern React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Room info, connection badge, timer & delay meter
│   │   │   ├── JoinRoom.jsx         # Room ID and speaker name login card
│   │   │   ├── LiveRoom.jsx         # Central controller (Web Speech API + Socket.IO)
│   │   │   ├── ParticipantList.jsx  # Live participant mesh with active speaker status
│   │   │   ├── TranscriptList.jsx   # Scrollable caption feed with search & filter
│   │   │   ├── TranscriptItem.jsx   # Caption row with amber highlight, edit & translation
│   │   │   └── Controls.jsx         # Mic toggle, language switch, simulator, export
│   │   ├── services/
│   │   │   ├── socket.js            # Socket.IO client instance and hooks
│   │   │   └── translator.js        # Offline educational dictionary & tokenizer
│   │   ├── App.jsx                  # Main view switcher
│   │   ├── index.css                # Tailwind theme and animations
│   │   └── main.jsx                 # React root entry
│   ├── vite.config.js               # Vite + Tailwind + React configuration
│   └── package.json                 # Client dependencies
│
├── package.json               # Root scripts to run backend and frontend simultaneously
└── README.md                  # Complete documentation and demo instructions
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (>= v16 recommended; tested on v22.14.0)
- **npm** (>= v7)
- Recommended Browser: **Google Chrome** or **Microsoft Edge** (native Web Speech API support)

---

### Option 1: Run Both Client & Server Concurrently (Recommended)

From the project root (`c:\Users\princ\Desktop\Nexhack`):

```bash
# 1. Run both backend (port 5000) and frontend (port 3000) together
npm run dev
```

Open your browser at:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

### Option 2: Run Separately in Individual Terminals

#### Terminal 1 — Backend:
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

#### Terminal 2 — Frontend:
```bash
cd client
npm install
npm run dev
# Vite client runs on http://localhost:3000
```

---

## 🧪 Step-by-Step Hackathon Demo Walkthrough

### Step 1: Teacher & Student Setup
1. Open two browser windows side-by-side:
   - **Window 1 (Teacher):** Join Room `lecture-101` with name `Prof. Sharma (Teacher)`, language `English`.
   - **Window 2 (Student):** Join Room `lecture-101` with name `Aman Patel (Student)`, language `हिन्दी`.
2. Notice the **Participants list** on the left updates in real time showing both peers.

### Step 2: Live Multilingual Speech Streaming
1. In Window 1 (Teacher), click **Start Microphone** and speak:
   > *"Good morning class, today we will study binary search."*
2. Watch how **interim partial captions** stream in real time and then finalize.
3. Switch language to **हिन्दी (hi-IN)** on the controls bar and speak:
   > *"नमस्ते छात्रों, आज हम एल्गोरिथ्म की बात करेंगे।"*
4. Notice both windows immediately display the Hindi speech!

*(Note: If two tabs share one microphone or if mic permission is blocked, click the **Simulate Speech** button on the bottom bar to inject realistic live streaming test phrases!)*

### Step 3: Low-Confidence Uncertainty Highlighting
1. Speech recognition predictions with confidence `< 0.85` automatically highlight with an **Amber badge and glow** (`#FF851B`).
2. Try clicking **Simulate Speech** -> select the phrase with lower confidence (e.g., 78%) to see the Amber uncertainty marker in action.

### Step 4: Real-Time Inline Caption Correction
1. In either Teacher or Student window, click on any caption or the **Edit** pencil icon.
2. Modify the text (e.g. correct a typo or add context) and click **Save & Broadcast**.
3. Notice that the update instantly synchronizes across all peers and marks the caption with a **Corrected** badge.

### Step 5: Network Disconnect & Reconnect Recovery
1. In Window 2 (Student), close the tab or disconnect to simulate bad classroom internet.
2. In Window 1 (Teacher), speak or simulate 2 new captions.
3. Re-open or refresh Window 2 and rejoin `lecture-101`.
4. Observe the banner: **"Reconnected, syncing missed captions from room history..."** followed by **"Room state fully synced!"**.
5. All missed speech entries appear chronologically without any duplicate items!

### Step 6: Export Persistent Transcript
1. Click **Export TXT** or **CSV** on the bottom control bar.
2. Inspect the downloaded file. It preserves:
   - Full timestamps `[HH:MM:SS]`
   - Speaker tags `[Prof. Sharma (en)]`
   - All applied corrections and edits
   - Translations (if provided)

---

## 🛠️ Automated Unit & WebSocket Test Suite

We also provide an automated Socket.IO end-to-end test script:

```bash
cd server
node test_server.js
```

**Results:**
```text
--- Starting NexHack 2.0 Live Caption Room Test Suite ---
[PASS] Test server started on port 5055
[PASS] Dual clients connected via WebSocket
[PASS] Room Join: 2 participants verified (2 peers in list)
[PASS] Interim partial caption received by Student
[PASS] Final caption successfully received by Student
[PASS] Caption edit broadcast verified to all peers
[PASS] Student disconnected (simulating network drop)
[PASS] Reconnection recovered 2 missed events without duplication!
--- ALL TEST SUITE CHECKS PASSED (4/4) ---
```

---

## 🧩 Chrome Extension (Manifest V3) — Zoom Speaker Voice Translator, Notes & History

A native Chrome Extension companion that docks directly on the **right side** of any browser window or opens via popup, built specifically for Zoom/Meet/online lectures.

### Features
- **Zero Login / Zero Setup**: No room IDs or login required—start translating speech immediately during Zoom classes.
- **Right Side Panel (`sidepanel.html`) & Popup (`popup.html`)**: Matches the MyClassRoom design language (Navy `#0d1117`, Blue `#58a6ff`, Amber `#FF851B`).
- **Real-Time Speaker Voice Translation**: Browser Web Speech API (`webkitSpeechRecognition`) with live interim & final updates.
- **Interactive Direction Swap**: One-click toggle between English ➔ Hindi and Hindi ➔ English via middle arrow button (`⇄`).
- **Uncertainty Highlighting**: Confidence `< 0.85` automatically highlights in Amber.
- **Dedicated Notes Section**: Built-in study notepad with 1-click import from live translations, auto-saved locally, copy, and export (.txt).
- **Dedicated History Save Section**: Save complete lecture sessions with timestamps, full-text search across past lectures, send to notes, and export.
- **Audio TTS**: Pronounce translations in natural Hindi or English.

### Load in Google Chrome
1. Navigate to `chrome://extensions/` in Google Chrome.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** (top left).
4. Select the `chrome-extension/` directory.
5. Click the extension icon or right-click any page and select **"🎙️ Open MyClassRoom Voice Translator"** to dock it on the right side!

For complete extension documentation, see [chrome-extension/README.md](file:///c:/Users/princ/OneDrive/DesktopAi%20app/Nexhack/chrome-extension/README.md).

---

## 📄 License & Credits
Developed for **NexHack 2.0 Hackathon** (Geeta University & CodeForge Society) — Problem Statement 02 (EdTech).
