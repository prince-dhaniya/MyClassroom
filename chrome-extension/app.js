import { translateText, getOfflineTranslation, SUPPORTED_LANGUAGES, getLanguageInfo } from './lib/translator.js';
import { tts } from './lib/tts.js';

/**
 * MyClassRoom - Multilingual Zoom Speaker Voice Translator, Notes & History Companion
 * Supports 25+ Global & Regional Languages with 1-Click Swap
 * Pure Client-Side, Zero Login / Room Setup Required
 */

// ───── Application State ─────
const state = {
  activeTab: 'translator', // 'translator' | 'notes' | 'history'
  theme: 'dark',           // 'dark' (Black Mode) | 'light' (White Mode)
  sourceLang: 'en',        // Speaker language (e.g. English, French, Spanish, German, Japanese, Hindi)
  targetLang: 'hi',        // Translation language (e.g. Hindi, English, Spanish, etc.)
  isRecording: false,
  playingTTSId: null,
  utterances: [],          // [{ id, text, translation, sourceLang, targetLang, confidence, timestamp }]
  notes: '',
  history: [],             // [{ id, title, timestamp, sourceLang, targetLang, utterances: [] }]
  searchQuery: ''
};

let recognitionInstance = null;
let simulationIndex = 0;

// Curated realistic classroom phrases across multiple languages for instant zero-mic testing
const SIMULATION_PHRASES = [
  { text: 'Good morning class, today we will study binary search algorithm.', lang: 'en', confidence: 0.98 },
  { text: 'Bonjour à tous, aujourd\'hui nous allons étudier les structures de données.', lang: 'fr', confidence: 0.96 },
  { text: 'Buenos días estudiantes, hoy aprenderemos sobre algoritmos de búsqueda.', lang: 'es', confidence: 0.97 },
  { text: 'Guten Morgen, heute besprechen wir die Grundlagen der Informatik.', lang: 'de', confidence: 0.95 },
  { text: 'नमस्ते छात्रों, आज हम डेटा स्ट्रक्चर और एल्गोरिदम की बात करेंगे।', lang: 'hi', confidence: 0.95 },
  { text: 'Time complexity for binary search is logarithmic O(log N).', lang: 'en', confidence: 0.78 }, // < 0.85 triggers Amber uncertainty!
  { text: 'Please open your notebook and write down the key formulas.', lang: 'en', confidence: 0.97 },
  { text: 'क्या आप सभी मुझे स्पष्ट रूप से सुन पा रहे हैं?', lang: 'hi', confidence: 0.96 }
];

// ───── DOM Element References ─────
const DOM = {
  // Navigation Tabs
  tabBtnTranslator: document.getElementById('tabBtnTranslator'),
  tabBtnNotes: document.getElementById('tabBtnNotes'),
  tabBtnHistory: document.getElementById('tabBtnHistory'),
  viewTranslator: document.getElementById('viewTranslator'),
  viewNotes: document.getElementById('viewNotes'),
  viewHistory: document.getElementById('viewHistory'),
  badgeLiveCount: document.getElementById('badgeLiveCount'),
  badgeNotesCount: document.getElementById('badgeNotesCount'),
  badgeHistoryCount: document.getElementById('badgeHistoryCount'),

  // Header
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  btnDockSidePanel: document.getElementById('btnDockSidePanel'),

  // Multilingual Language Selection
  selectSourceLang: document.getElementById('selectSourceLang'),
  selectTargetLang: document.getElementById('selectTargetLang'),
  btnSwapLanguages: document.getElementById('btnSwapLanguages'),

  // Voice Controls
  btnMicToggle: document.getElementById('btnMicToggle'),
  micIcon: document.getElementById('micIcon'),
  micButtonText: document.getElementById('micButtonText'),
  btnSimulate: document.getElementById('btnSimulate'),
  btnSaveToHistory: document.getElementById('btnSaveToHistory'),
  btnClearLive: document.getElementById('btnClearLive'),
  liveInterimBubble: document.getElementById('liveInterimBubble'),
  interimOriginalText: document.getElementById('interimOriginalText'),
  interimTranslatedText: document.getElementById('interimTranslatedText'),
  emptyTranslatorState: document.getElementById('emptyTranslatorState'),
  utterancesContainer: document.getElementById('utterancesContainer'),

  // Notes View
  notesEditor: document.getElementById('notesEditor'),
  btnImportFromLive: document.getElementById('btnImportFromLive'),
  btnAddBullet: document.getElementById('btnAddBullet'),
  btnCopyNotes: document.getElementById('btnCopyNotes'),
  btnExportNotes: document.getElementById('btnExportNotes'),
  btnClearNotes: document.getElementById('btnClearNotes'),
  notesSaveStatus: document.getElementById('notesSaveStatus'),
  notesWordCount: document.getElementById('notesWordCount'),

  // History View
  historySearchInput: document.getElementById('historySearchInput'),
  btnClearAllHistory: document.getElementById('btnClearAllHistory'),
  emptyHistoryState: document.getElementById('emptyHistoryState'),
  historyCardsContainer: document.getElementById('historyCardsContainer'),

  toastNotice: document.getElementById('toastNotice')
};

// ───── Toast Notification Helper ─────
function showToast(message, duration = 2200) {
  if (!DOM.toastNotice) return;
  DOM.toastNotice.textContent = message;
  DOM.toastNotice.style.display = 'block';
  setTimeout(() => {
    DOM.toastNotice.style.display = 'none';
  }, duration);
}

// ───── Populate 25+ Language Dropdowns ─────
function populateLanguageDropdowns() {
  if (!DOM.selectSourceLang || !DOM.selectTargetLang) return;

  DOM.selectSourceLang.innerHTML = '';
  DOM.selectTargetLang.innerHTML = '';

  SUPPORTED_LANGUAGES.forEach(l => {
    const opt1 = document.createElement('option');
    opt1.value = l.code;
    opt1.textContent = `${l.flag} ${l.label} (${l.native})`;
    DOM.selectSourceLang.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = l.code;
    opt2.textContent = `${l.flag} ${l.label} (${l.native})`;
    DOM.selectTargetLang.appendChild(opt2);
  });

  DOM.selectSourceLang.value = state.sourceLang;
  DOM.selectTargetLang.value = state.targetLang;
}

// ───── Persistent Local Storage Helpers ─────
async function loadStoredData() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get([
        'myclassroom_notes',
        'myclassroom_history',
        'myclassroom_source_lang',
        'myclassroom_target_lang'
      ]);
      if (data.myclassroom_notes) state.notes = data.myclassroom_notes;
      if (Array.isArray(data.myclassroom_history)) state.history = data.myclassroom_history;
      if (data.myclassroom_source_lang) state.sourceLang = data.myclassroom_source_lang;
      if (data.myclassroom_target_lang) state.targetLang = data.myclassroom_target_lang;
    } else {
      const savedNotes = localStorage.getItem('myclassroom_notes');
      if (savedNotes) state.notes = savedNotes;
      const savedHist = localStorage.getItem('myclassroom_history');
      if (savedHist) state.history = JSON.parse(savedHist);
      const savedSrc = localStorage.getItem('myclassroom_source_lang');
      if (savedSrc) state.sourceLang = savedSrc;
      const savedTgt = localStorage.getItem('myclassroom_target_lang');
      if (savedTgt) state.targetLang = savedTgt;
    }
  } catch (e) {
    console.warn('Storage load error:', e);
  }

  populateLanguageDropdowns();

  if (DOM.notesEditor) {
    DOM.notesEditor.value = state.notes;
    updateNotesStats();
  }
  updateHistoryBadge();
}

async function saveLanguagePreferences() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        myclassroom_source_lang: state.sourceLang,
        myclassroom_target_lang: state.targetLang
      });
    } else {
      localStorage.setItem('myclassroom_source_lang', state.sourceLang);
      localStorage.setItem('myclassroom_target_lang', state.targetLang);
    }
  } catch (e) {
    console.warn('Language preference save error:', e);
  }
}

async function saveNotesToStorage(content) {
  state.notes = content;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ myclassroom_notes: content });
    } else {
      localStorage.setItem('myclassroom_notes', content);
    }
    if (DOM.notesSaveStatus) DOM.notesSaveStatus.textContent = '✓ Auto-saved locally';
  } catch (e) {
    console.warn('Notes save error:', e);
  }
  updateNotesStats();
}

async function saveHistoryToStorage(historyArray) {
  state.history = historyArray;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ myclassroom_history: historyArray });
    } else {
      localStorage.setItem('myclassroom_history', JSON.stringify(historyArray));
    }
  } catch (e) {
    console.warn('History save error:', e);
  }
  updateHistoryBadge();
}

// ───── Navigation Tabs Switching ─────
function switchTab(tabName) {
  state.activeTab = tabName;

  DOM.tabBtnTranslator?.classList.toggle('active', tabName === 'translator');
  DOM.tabBtnNotes?.classList.toggle('active', tabName === 'notes');
  DOM.tabBtnHistory?.classList.toggle('active', tabName === 'history');

  DOM.viewTranslator?.classList.toggle('active', tabName === 'translator');
  DOM.viewNotes?.classList.toggle('active', tabName === 'notes');
  DOM.viewHistory?.classList.toggle('active', tabName === 'history');

  if (tabName === 'history') {
    renderHistoryView();
  }
}

// ───── Web Speech Recognition (Speaker Audio Capture) ─────
function setupSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn('Web Speech API is not supported in this browser context.');
    return;
  }

  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    state.isRecording = true;
    updateMicButtonUI(true);
    const srcInfo = getLanguageInfo(state.sourceLang);
    showToast(`🎙️ Listening to speaker (${srcInfo.label})...`);
  };

  recognition.onresult = async (event) => {
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

    const text = (final || interim).trim();
    if (!text) return;

    const sourceLang = state.sourceLang;
    const targetLang = state.targetLang;

    // Live Interim Speech Bubble
    if (DOM.liveInterimBubble) {
      DOM.liveInterimBubble.style.display = 'flex';
      DOM.interimOriginalText.textContent = text;
      const instantTrans = getOfflineTranslation(text, sourceLang, targetLang);
      DOM.interimTranslatedText.textContent = instantTrans || 'Translating...';
    }

    if (final) {
      const translation = await translateText(text, sourceLang, targetLang);
      const utteranceObj = {
        id: 'utt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        text,
        translation,
        sourceLang,
        targetLang,
        confidence: conf,
        timestamp: Date.now()
      };

      state.utterances.unshift(utteranceObj); // Latest on top
      renderUtterances();

      setTimeout(() => {
        if (!state.isRecording && DOM.liveInterimBubble) {
          DOM.liveInterimBubble.style.display = 'none';
        }
      }, 1400);
    }
  };

  recognition.onerror = (err) => {
    console.warn('Speech recognition error:', err.error);
    if (err.error === 'not-allowed') {
      showToast('Microphone access blocked. Please check browser permissions.');
      stopRecording();
    }
  };

  recognition.onend = () => {
    if (state.isRecording) {
      try { recognition.start(); } catch (_) {}
    } else {
      updateMicButtonUI(false);
      if (DOM.liveInterimBubble) DOM.liveInterimBubble.style.display = 'none';
    }
  };

  recognitionInstance = recognition;
}

function startRecording() {
  if (!recognitionInstance) setupSpeechRecognition();
  if (!recognitionInstance) {
    showToast('Speech recognition unavailable. Click "Simulate" to test!');
    return;
  }

  const langInfo = getLanguageInfo(state.sourceLang);
  recognitionInstance.lang = langInfo.bcp47;

  try {
    recognitionInstance.start();
    state.isRecording = true;
    updateMicButtonUI(true);
  } catch (e) {
    console.warn('Recognition start exception:', e);
  }
}

function stopRecording() {
  state.isRecording = false;
  if (recognitionInstance) {
    try { recognitionInstance.stop(); } catch (_) {}
  }
  updateMicButtonUI(false);
  if (DOM.liveInterimBubble) DOM.liveInterimBubble.style.display = 'none';
}

function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
    showToast('Listening paused.');
  } else {
    startRecording();
  }
}

function updateMicButtonUI(isRecording) {
  if (!DOM.btnMicToggle || !DOM.micButtonText) return;
  const srcInfo = getLanguageInfo(state.sourceLang);
  if (isRecording) {
    DOM.btnMicToggle.classList.add('recording');
    DOM.micButtonText.textContent = `Listening (${srcInfo.label})...`;
    if (DOM.statusDot) DOM.statusDot.className = 'status-dot active';
    if (DOM.statusText) DOM.statusText.textContent = `Listening (${srcInfo.label})`;
  } else {
    DOM.btnMicToggle.classList.remove('recording');
    DOM.micButtonText.textContent = `Listen to Speaker (${srcInfo.label})`;
    if (DOM.statusDot) DOM.statusDot.className = 'status-dot';
    if (DOM.statusText) DOM.statusText.textContent = 'Ready to Translate';
  }
}

// ───── Language Swap Handler ─────
function handleSwapLanguages() {
  const temp = state.sourceLang;
  state.sourceLang = state.targetLang;
  state.targetLang = temp;

  if (DOM.selectSourceLang) DOM.selectSourceLang.value = state.sourceLang;
  if (DOM.selectTargetLang) DOM.selectTargetLang.value = state.targetLang;

  saveLanguagePreferences();

  if (recognitionInstance) {
    recognitionInstance.lang = getLanguageInfo(state.sourceLang).bcp47;
  }

  const srcInfo = getLanguageInfo(state.sourceLang);
  const tgtInfo = getLanguageInfo(state.targetLang);
  showToast(`Swapped: ${srcInfo.label} ⇄ ${tgtInfo.label}`);
  updateMicButtonUI(state.isRecording);
  renderUtterances();
}

// ───── Realistic Speaker Simulation ─────
async function handleSimulateSpeaker() {
  const phrase = SIMULATION_PHRASES[simulationIndex % SIMULATION_PHRASES.length];
  simulationIndex++;

  const sourceLang = phrase.lang || state.sourceLang;
  const targetLang = state.targetLang === sourceLang ? (sourceLang === 'en' ? 'hi' : 'en') : state.targetLang;

  showToast(`Simulating speaker: "${phrase.text.substring(0, 30)}..."`);

  const translation = await translateText(phrase.text, sourceLang, targetLang);
  const utteranceObj = {
    id: 'utt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text: phrase.text,
    translation,
    sourceLang,
    targetLang,
    confidence: phrase.confidence,
    timestamp: Date.now()
  };

  state.utterances.unshift(utteranceObj);
  renderUtterances();
}

// ───── Render Live Utterances Stream ─────
function renderUtterances() {
  if (!DOM.utterancesContainer || !DOM.emptyTranslatorState) return;

  const count = state.utterances.length;
  if (DOM.badgeLiveCount) DOM.badgeLiveCount.textContent = String(count);

  if (count === 0) {
    DOM.emptyTranslatorState.style.display = 'block';
    DOM.utterancesContainer.innerHTML = '';
    return;
  }

  DOM.emptyTranslatorState.style.display = 'none';
  DOM.utterancesContainer.innerHTML = '';

  state.utterances.forEach((utt) => {
    const isUncertain = utt.confidence && utt.confidence < 0.85;
    const timeStr = new Date(utt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const srcInfo = getLanguageInfo(utt.sourceLang || state.sourceLang);
    const tgtInfo = getLanguageInfo(utt.targetLang || state.targetLang);
    const langBadge = `${srcInfo.flag} ➔ ${tgtInfo.flag}`;

    const card = document.createElement('div');
    card.className = `utterance-card ${isUncertain ? 'uncertain' : ''}`;

    card.innerHTML = `
      <div class="utterance-meta">
        <div style="display: flex; align-items: center; gap: 5px;">
          <span>${timeStr}</span>
          <span style="font-size: 9.5px; background: rgba(56, 139, 253, 0.15); color: var(--blue-brand); padding: 1px 5px; border-radius: 4px; font-weight: 700;">${langBadge}</span>
          ${isUncertain ? '<span class="uncertain-tag" title="Confidence < 85%">Uncertain</span>' : ''}
        </div>
        <div class="utterance-actions">
          <button class="btn-card-action btn-add-to-note" title="Add this translation directly to Notes section">
            <span>📌 Note</span>
          </button>
          <button class="btn-card-action btn-tts-listen" title="Listen to translation">
            <span>🔊</span>
          </button>
          <button class="btn-card-action btn-copy-card" title="Copy translated text">
            <span>📋</span>
          </button>
          <button class="btn-card-action btn-delete-card" title="Delete utterance">
            <span>✕</span>
          </button>
        </div>
      </div>
      <div class="primary-translation">${escapeHTML(utt.translation || utt.text)}</div>
      <div class="secondary-original">"${escapeHTML(utt.text)}"</div>
    `;

    // Add to Notes button
    card.querySelector('.btn-add-to-note').addEventListener('click', () => {
      appendSentenceToNotes(utt.translation || utt.text, utt.text, timeStr, srcInfo.label, tgtInfo.label);
      showToast('Added to Notes!');
    });

    // TTS Listen button
    card.querySelector('.btn-tts-listen').addEventListener('click', () => {
      tts.speak(utt.translation || utt.text, utt.targetLang || state.targetLang);
    });

    // Copy button
    card.querySelector('.btn-copy-card').addEventListener('click', () => {
      navigator.clipboard.writeText(utt.translation || utt.text).then(() => showToast('Copied to clipboard!'));
    });

    // Delete button
    card.querySelector('.btn-delete-card').addEventListener('click', () => {
      state.utterances = state.utterances.filter(u => u.id !== utt.id);
      renderUtterances();
    });

    DOM.utterancesContainer.appendChild(card);
  });
}

// ───── NOTES SECTION FUNCTIONS ─────
function appendSentenceToNotes(translatedText, originalText, timeStr, srcLabel = '', tgtLabel = '') {
  const current = DOM.notesEditor?.value || '';
  const langTag = srcLabel && tgtLabel ? ` [${srcLabel} ➔ ${tgtLabel}]` : '';
  const newEntry = `• [${timeStr}]${langTag} ${translatedText}\n  ("${originalText}")\n\n`;
  const updated = current + newEntry;
  if (DOM.notesEditor) {
    DOM.notesEditor.value = updated;
    saveNotesToStorage(updated);
  }
}

function handleImportAllLiveToNotes() {
  if (!state.utterances.length) {
    showToast('No live translations to import.');
    return;
  }

  const timeHeader = `\n--- 📝 Lecture Notes (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}) ---\n`;
  let compiled = timeHeader;

  // Chronological order for notes
  [...state.utterances].reverse().forEach(u => {
    const srcInfo = getLanguageInfo(u.sourceLang || state.sourceLang);
    const tgtInfo = getLanguageInfo(u.targetLang || state.targetLang);
    const timeStr = new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    compiled += `• [${timeStr}] [${srcInfo.label} ➔ ${tgtInfo.label}] ${u.translation || u.text}\n  ("${u.text}")\n`;
  });

  compiled += `---------------------------------------------------\n\n`;

  const updated = (DOM.notesEditor?.value || '') + compiled;
  DOM.notesEditor.value = updated;
  saveNotesToStorage(updated);
  showToast(`Imported ${state.utterances.length} translations into Notes!`);
  switchTab('notes');
}

function updateNotesStats() {
  const text = DOM.notesEditor?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (DOM.notesWordCount) DOM.notesWordCount.textContent = `${words} words`;
  if (DOM.badgeNotesCount) DOM.badgeNotesCount.textContent = words > 0 ? String(words) : '0';
}

function handleCopyNotes() {
  const text = DOM.notesEditor?.value || '';
  if (!text.trim()) {
    showToast('Notes are empty.');
    return;
  }
  navigator.clipboard.writeText(text).then(() => showToast('Full notes copied to clipboard!'));
}

function handleExportNotes() {
  const text = DOM.notesEditor?.value || '';
  if (!text.trim()) {
    showToast('Notes are empty.');
    return;
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lecture_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Notes downloaded (.txt)');
}

function handleClearNotes() {
  if (!DOM.notesEditor?.value.trim()) return;
  if (confirm('Are you sure you want to CLEAR all notes?')) {
    DOM.notesEditor.value = '';
    saveNotesToStorage('');
    showToast('Notes cleared.');
  }
}

// ───── HISTORY SECTION FUNCTIONS ─────
function handleSaveCurrentSessionToHistory() {
  if (!state.utterances.length) {
    showToast('No translations to save in session.');
    return;
  }

  const now = new Date();
  const srcInfo = getLanguageInfo(state.sourceLang);
  const tgtInfo = getLanguageInfo(state.targetLang);
  const title = `Zoom Class (${srcInfo.label} ➔ ${tgtInfo.label}) - ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  const sessionObj = {
    id: 'hist_' + Date.now(),
    title,
    timestamp: Date.now(),
    sourceLang: state.sourceLang,
    targetLang: state.targetLang,
    utteranceCount: state.utterances.length,
    utterances: [...state.utterances]
  };

  const updatedHistory = [sessionObj, ...state.history];
  saveHistoryToStorage(updatedHistory);
  showToast(`Session saved to History (${state.utterances.length} items)!`);
  updateHistoryBadge();
}

function updateHistoryBadge() {
  if (DOM.badgeHistoryCount) {
    DOM.badgeHistoryCount.textContent = String(state.history.length);
  }
}

function renderHistoryView() {
  if (!DOM.historyCardsContainer || !DOM.emptyHistoryState) return;

  const query = state.searchQuery.trim().toLowerCase();
  const filtered = state.history.filter(sess => {
    if (!query) return true;
    if (sess.title.toLowerCase().includes(query)) return true;
    return sess.utterances.some(u => 
      (u.text || '').toLowerCase().includes(query) || 
      (u.translation || '').toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    DOM.emptyHistoryState.style.display = 'block';
    DOM.historyCardsContainer.innerHTML = '';
    return;
  }

  DOM.emptyHistoryState.style.display = 'none';
  DOM.historyCardsContainer.innerHTML = '';

  filtered.forEach(sess => {
    const dateStr = new Date(sess.timestamp).toLocaleString();
    const srcInfo = getLanguageInfo(sess.sourceLang || 'en');
    const tgtInfo = getLanguageInfo(sess.targetLang || 'hi');
    const langLabel = `${srcInfo.flag} ➔ ${tgtInfo.flag}`;
    const previewText = sess.utterances.slice(0, 3).map(u => u.translation || u.text).join(' • ');

    const card = document.createElement('div');
    card.className = 'history-card';

    card.innerHTML = `
      <div class="history-card-header">
        <div class="history-title">
          <span>${escapeHTML(sess.title)}</span>
          <span style="font-size: 9.5px; background: rgba(56, 139, 253, 0.2); color: var(--blue-brand); padding: 1px 5px; border-radius: 4px; font-weight: 700;">${langLabel}</span>
        </div>
        <div class="history-meta">
          <span>${sess.utterances.length} sentences</span>
          <span>${dateStr}</span>
        </div>
      </div>
      <div class="history-preview">"${escapeHTML(previewText || 'No transcript text')}"</div>
      <div class="history-card-actions">
        <button class="btn-card-action btn-send-to-notes" title="Append this session's transcript into Notes">
          <span>📝 Send to Notes</span>
        </button>
        <button class="btn-card-action btn-copy-hist" title="Copy full transcript">
          <span>📋 Copy</span>
        </button>
        <button class="btn-card-action btn-export-hist" title="Download as text file">
          <span>📥 Export</span>
        </button>
        <button class="btn-card-action btn-del-hist" style="color: #f87171;" title="Delete this session">
          <span>🗑️</span>
        </button>
      </div>
    `;

    // Send to Notes
    card.querySelector('.btn-send-to-notes').addEventListener('click', () => {
      let notesText = `\n--- 📚 ${sess.title} (${dateStr}) ---\n`;
      sess.utterances.forEach(u => {
        notesText += `• ${u.translation || u.text}\n  ("${u.text}")\n`;
      });
      notesText += `---------------------------------------------------\n\n`;

      const updated = (DOM.notesEditor?.value || '') + notesText;
      DOM.notesEditor.value = updated;
      saveNotesToStorage(updated);
      showToast('Loaded into Notes!');
      switchTab('notes');
    });

    // Copy Transcript
    card.querySelector('.btn-copy-hist').addEventListener('click', () => {
      const text = sess.utterances.map(u => `[${new Date(u.timestamp).toLocaleTimeString()}] ${u.translation || u.text} (${u.text})`).join('\n');
      navigator.clipboard.writeText(text).then(() => showToast('Session transcript copied!'));
    });

    // Export TXT
    card.querySelector('.btn-export-hist').addEventListener('click', () => {
      let txt = `=======================================================\n`;
      txt += `MYCLASSROOM - SAVED LECTURE SESSION\n`;
      txt += `Title: ${sess.title}\n`;
      txt += `Date: ${dateStr}\n`;
      txt += `Language: ${srcInfo.label} ➔ ${tgtInfo.label}\n`;
      txt += `Total Sentences: ${sess.utterances.length}\n`;
      txt += `=======================================================\n\n`;

      sess.utterances.forEach(u => {
        txt += `[${new Date(u.timestamp).toLocaleTimeString()}]\n`;
        txt += `Translation: ${u.translation || u.text}\n`;
        txt += `Original:    ${u.text}\n\n`;
      });

      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sess.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Session downloaded (.txt)');
    });

    // Delete Session
    card.querySelector('.btn-del-hist').addEventListener('click', () => {
      if (confirm('Delete this saved session?')) {
        const updated = state.history.filter(s => s.id !== sess.id);
        saveHistoryToStorage(updated);
        renderHistoryView();
        showToast('Session deleted.');
      }
    });

    DOM.historyCardsContainer.appendChild(card);
  });
}

function handleClearAllHistory() {
  if (!state.history.length) return;
  if (confirm('Are you sure you want to CLEAR ALL saved lecture history?')) {
    saveHistoryToStorage([]);
    renderHistoryView();
    showToast('All history cleared.');
  }
}

// ───── Utility Helpers ─────
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ───── Setup Event Listeners ─────
function attachEventListeners() {
  // Navigation Tabs
  DOM.tabBtnTranslator?.addEventListener('click', () => switchTab('translator'));
  DOM.tabBtnNotes?.addEventListener('click', () => switchTab('notes'));
  DOM.tabBtnHistory?.addEventListener('click', () => switchTab('history'));

  // Multilingual Language Selectors
  DOM.selectSourceLang?.addEventListener('change', (e) => {
    state.sourceLang = e.target.value;
    saveLanguagePreferences();
    if (recognitionInstance) {
      recognitionInstance.lang = getLanguageInfo(state.sourceLang).bcp47;
    }
    updateMicButtonUI(state.isRecording);
    showToast(`Speaker language: ${getLanguageInfo(state.sourceLang).label}`);
  });

  DOM.selectTargetLang?.addEventListener('change', (e) => {
    state.targetLang = e.target.value;
    saveLanguagePreferences();
    showToast(`Translate to: ${getLanguageInfo(state.targetLang).label}`);
    renderUtterances();
  });

  DOM.btnSwapLanguages?.addEventListener('click', handleSwapLanguages);

  // Microphone & Simulator
  DOM.btnMicToggle?.addEventListener('click', toggleRecording);
  DOM.btnSimulate?.addEventListener('click', handleSimulateSpeaker);

  // Live Translator Actions
  DOM.btnSaveToHistory?.addEventListener('click', handleSaveCurrentSessionToHistory);
  DOM.btnClearLive?.addEventListener('click', () => {
    if (state.utterances.length && confirm('Clear current live translations?')) {
      state.utterances = [];
      renderUtterances();
      showToast('Live feed cleared.');
    }
  });

  // Notes Actions
  DOM.notesEditor?.addEventListener('input', (e) => {
    saveNotesToStorage(e.target.value);
  });
  DOM.btnImportFromLive?.addEventListener('click', handleImportAllLiveToNotes);
  DOM.btnAddBullet?.addEventListener('click', () => {
    const cur = DOM.notesEditor?.value || '';
    const updated = cur + '\n• ';
    DOM.notesEditor.value = updated;
    DOM.notesEditor.focus();
    saveNotesToStorage(updated);
  });
  DOM.btnCopyNotes?.addEventListener('click', handleCopyNotes);
  DOM.btnExportNotes?.addEventListener('click', handleExportNotes);
  DOM.btnClearNotes?.addEventListener('click', handleClearNotes);

  // History Actions
  DOM.historySearchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderHistoryView();
  });
  DOM.btnClearAllHistory?.addEventListener('click', handleClearAllHistory);

  // Dock to Side Panel (Popup only)
  DOM.btnDockSidePanel?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {
            window.open('sidepanel.html', '_blank', 'width=420,height=700');
          });
        }
      });
    } else {
      window.open('sidepanel.html', '_blank', 'width=420,height=700');
    }
  });
}

// ───── Bootstrapping ─────
async function initApp() {
  await loadStoredData();
  attachEventListeners();
  setupSpeechRecognition();
  renderUtterances();
  console.log('[MyClassRoom Extension] Multilingual Zoom Voice Translator initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
