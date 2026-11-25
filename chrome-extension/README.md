# 🎙️ MyClassRoom — Zoom Speaker Voice Translator, Notes & History (Manifest V3)

A fast, clean Chrome Extension built specifically for attending **Zoom, Google Meet, YouTube, or online live classes**. It runs on the **right side** of your browser, captures the speaker's voice, translates it in real-time, and provides dedicated **Study Notes** and **Lecture History Save** sections—**zero login or classroom setup required**.

---

## 🌟 Key Capabilities

### 1. 🎙️ Live Speaker Translator (Right Side)
- **Zero Login / Zero Room Setup**: Designed for Zoom/Meet where classes are already in progress. Open the extension and start translating immediately.
- **Microphone / Speaker Audio Capture**: Listens to the teacher or speaker with continuous recognition using browser-native **Web Speech API**.
- **Interactive Language Swap**: One-click swap between **English ➔ Hindi** and **Hindi ➔ English** via the central swap button (`⇄`).
- **Live Interim Preview**: Shows speech being spoken and translates in real-time before finalizing.
- **Uncertainty Highlighting**: Predictions with confidence `< 0.85` automatically highlight with an **Amber badge & border (`#FF851B`)**.
- **Per-Card Actions**:
  - `📌 Note`: One-click append of the translated sentence into your **Notes section**.
  - `🔊 Listen`: Text-to-Speech (TTS) pronunciation in Hindi or English.
  - `📋 Copy`: Instant clipboard copy.
  - `✕ Delete`: Remove individual card.
- **Zero-Mic Simulator**: Built-in **Simulate** button with bilingual classroom phrases to test translation instantly even before connecting a mic.

### 2. 📝 Dedicated Notes Section
- **Study Notepad**: A built-in editable lecture notepad for students to take personal notes, key takeaways, and assignment reminders during a Zoom call.
- **1-Click Import**: Click **Import from Translator** to convert all spoken translations into structured bullet points with timestamps.
- **• Bullet Button**: Quick bullet point formatting.
- **Auto-Saved Locally**: Automatically saves every keystroke into Chrome local storage—notes are never lost even if the browser closes!
- **Export & Copy**: 1-click **Copy Notes** to clipboard or **Export** as a `.txt` file.

### 3. 🕒 Dedicated History Save Section
- **1-Click Session Save**: In the Translator tab, click **Save Session** to package the entire lecture transcript with date, time, and language metadata.
- **Instant Search**: Full-text search across all past saved lecture titles, translated sentences, and original speech.
- **Send to Notes**: Click **📝 Send to Notes** on any past lecture to load it directly into your active notepad.
- **Export Past Transcripts**: Download any past lecture transcript as a formatted `.txt` file with exact timestamps.
- **Delete / Clear**: Delete individual past sessions or clear all history.

---

## 🎨 Design System & Colors
Faithfully matches the MyClassRoom website design:
- **Navy Main Background:** `#0d1117`
- **Container Surfaces:** `#141d2b`, `#161b22`, `#1a2538`
- **Borders:** `#2d333b`
- **Accent Blue:** `#3b82f6` / `#58a6ff`
- **Uncertainty Highlight:** Amber `#FF851B`
- **Recording Pulse:** Red `#dc2626` animated glow

---

## 📁 Extension Architecture

```
chrome-extension/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Service Worker (Side Panel API & Context Menus)
├── sidepanel.html             # Native Chrome Right Side Panel UI
├── popup.html                 # Action Toolbar Popup UI
├── style.css                  # MyClassRoom dark theme styling
├── app.js                     # Tab switcher, Speech recognition, Notes & History manager
├── content.js                 # Floating subtitle overlay for web pages
├── content.css                # Floating subtitle styling
├── lib/
│   ├── socket.io.min.js       # Bundled local Socket.IO client (Manifest V3 CSP compliant)
│   ├── socket-service.js      # Socket client connector
│   ├── translator.js          # Translation pipeline & offline dictionary
│   └── tts.js                 # Web Speech Synthesis audio engine
├── icons/
│   ├── icon16.png             # 16x16 extension icon
│   ├── icon48.png             # 48x48 extension icon
│   └── icon128.png            # 128x128 extension icon
└── README.md                  # Complete documentation and setup guide
```

---

## 🚀 How to Load and Run in Google Chrome

### Step 1: Open Chrome Extensions
1. Open **Google Chrome** (or Microsoft Edge / Brave).
2. Navigate to: `chrome://extensions/`
3. In the top-right corner, toggle **Developer mode** **ON**.

### Step 2: Load Unpacked
1. Click the **Load unpacked** button in the top-left corner.
2. Select the folder:
   ```
   c:\Users\princ\OneDrive\DesktopAi app\Nexhack\chrome-extension
   ```
3. **"MyClassRoom - Live Voice Translator"** will appear in your extensions list!
4. Click Chrome's **Puzzle Piece 🧩** icon on the toolbar and **Pin 📌** the MyClassRoom extension.

### Step 3: Open on the Right Side of Your Screen
- Click the pinned icon to open the popup, then click the **Dock to Right Side Panel (⊞)** icon in the header.
- *Or:* Right-click anywhere on any webpage (e.g., Zoom web, Google Meet, YouTube) and choose **"🎙️ Open MyClassRoom Voice Translator"**.
- The extension will dock as a persistent panel on the **right side** of your screen alongside your Zoom or meeting window!

---

## 🧪 Quick 3-Step Walkthrough

### 1. Test Speaker Translation
1. On the **Translator** tab, click **Listen to Speaker (Zoom / Mic)** (or click **Simulate**).
2. The speech is transcribed and translated in real-time (English ➔ Hindi or Hindi ➔ English).
3. Click the **📌 Note** button on any translated card to push it straight into your Notes!

### 2. View and Edit Study Notes
1. Click the **Notes** tab.
2. Notice your pinned translations appear as structured study bullet points.
3. Type custom notes or annotations directly into the notepad—everything is auto-saved locally.
4. Click **Export** or **Copy** to save your notes.

### 3. Save and Search Lecture History
1. In the **Translator** tab, click **Save Session**.
2. Switch to the **History** tab to see your saved lecture with full sentence count and timestamps.
3. Use the search bar to find past lecture topics instantly!
