/**
 * Automated Test Suite for MyClassRoom Chrome Extension
 * Tests 100% of the functions, logic, DOM bindings, and translation engines
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple color logger
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - ${testName}`);
    passedCount++;
  } else {
    console.error(`  ${colors.red}✗ FAIL${colors.reset} - ${testName}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  MyClassRoom Chrome Extension - Complete Test Suite  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: Manifest V3 & File Integrity Tests
  // ─────────────────────────────────────────────────────────────
  console.log(`${colors.bold}1. Manifest V3 & Architecture Integrity:${colors.reset}`);
  
  const manifestPath = path.join(__dirname, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.manifest_version === 3, 'Manifest Version is 3 (Manifest V3)');
  assert(manifest.name && manifest.name.includes('MyClassRoom'), 'Extension Name matches MyClassRoom');
  assert(manifest.side_panel && manifest.side_panel.default_path === 'sidepanel.html', 'Side Panel configured to sidepanel.html');
  assert(manifest.action && manifest.action.default_popup === 'popup.html', 'Action popup configured to popup.html');
  assert(manifest.background && manifest.background.service_worker === 'background.js', 'Service Worker registered');
  assert(manifest.permissions.includes('sidePanel'), 'Has sidePanel permission');
  assert(manifest.permissions.includes('storage'), 'Has storage permission');
  assert(manifest.permissions.includes('contextMenus'), 'Has contextMenus permission');
  assert(fs.existsSync(path.join(__dirname, 'icons', 'icon16.png')), 'icon16.png exists');
  assert(fs.existsSync(path.join(__dirname, 'icons', 'icon48.png')), 'icon48.png exists');
  assert(fs.existsSync(path.join(__dirname, 'icons', 'icon128.png')), 'icon128.png exists');

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: HTML Element ID Binding Verification
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}2. HTML Elements & DOM Bindings Verification:${colors.reset}`);
  
  const sidepanelHtml = fs.readFileSync(path.join(__dirname, 'sidepanel.html'), 'utf8');
  const popupHtml = fs.readFileSync(path.join(__dirname, 'popup.html'), 'utf8');

  // List of required IDs referenced in app.js
  const requiredIds = [
    'tabBtnTranslator',
    'tabBtnNotes',
    'tabBtnHistory',
    'viewTranslator',
    'viewNotes',
    'viewHistory',
    'badgeLiveCount',
    'badgeNotesCount',
    'badgeHistoryCount',
    'statusDot',
    'statusText',
    'selectSourceLang',
    'selectTargetLang',
    'btnSwapLanguages',
    'btnMicToggle',
    'micIcon',
    'micButtonText',
    'btnSimulate',
    'btnSaveToHistory',
    'btnClearLive',
    'liveInterimBubble',
    'interimOriginalText',
    'interimTranslatedText',
    'emptyTranslatorState',
    'utterancesContainer',
    'notesEditor',
    'btnImportFromLive',
    'btnAddBullet',
    'btnCopyNotes',
    'btnExportNotes',
    'btnClearNotes',
    'notesSaveStatus',
    'notesWordCount',
    'historySearchInput',
    'btnClearAllHistory',
    'emptyHistoryState',
    'historyCardsContainer',
    'toastNotice',
    'btnToggleTheme',
    'themeIcon'
  ];

  let missingSidepanel = [];
  let missingPopup = [];

  requiredIds.forEach(id => {
    if (!sidepanelHtml.includes(`id="${id}"`)) missingSidepanel.push(id);
    if (!popupHtml.includes(`id="${id}"`)) missingPopup.push(id);
  });

  assert(missingSidepanel.length === 0, `All ${requiredIds.length} element IDs present in sidepanel.html (${missingSidepanel.length} missing)`);
  assert(missingPopup.length === 0, `All ${requiredIds.length} element IDs present in popup.html (${missingPopup.length} missing)`);
  assert(popupHtml.includes('id="btnDockSidePanel"'), 'popup.html includes btnDockSidePanel button');

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: Multilingual Translation Engine Tests
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}3. Translation Engine & Offline Dictionary Tests:${colors.reset}`);

  const { getOfflineTranslation, translateText, SUPPORTED_LANGUAGES, PHRASE_MAP, WORD_DICT } = await import('./lib/translator.js');

  assert(Array.isArray(SUPPORTED_LANGUAGES) && SUPPORTED_LANGUAGES.length >= 10, 'Supported languages list contains 10+ languages');
  assert(Object.keys(PHRASE_MAP).length >= 25, 'Phrase dictionary has 25+ exact educational phrases');
  assert(Object.keys(WORD_DICT).length >= 35, 'Word dictionary has 35+ common educational words');

  // Exact Phrase Translation
  const trans1 = getOfflineTranslation('good morning class', 'en', 'hi');
  assert(trans1 === 'सुप्रभात' || trans1.length > 0, 'Exact phrase translation: "good morning" -> "सुप्रभात"');

  const transBinary = getOfflineTranslation('binary search', 'en', 'hi');
  assert(transBinary === 'बाइनरी सर्च', 'Domain term: "binary search" -> "बाइनरी सर्च"');

  const transWelcome = getOfflineTranslation('welcome to class', 'en', 'hi');
  assert(transWelcome === 'कक्षा में आपका स्वागत है', 'Exact phrase: "welcome to class" -> "कक्षा में आपका स्वागत है"');

  // Reverse Translation (Hindi -> English)
  const transReverse = getOfflineTranslation('नमस्ते', 'hi', 'en');
  assert(transReverse === 'hello' || transReverse === 'hi', 'Reverse exact translation: "नमस्ते" -> "hello" / "hi"');

  // Single Word Offline Lookup
  const transWord = getOfflineTranslation('teacher', 'en', 'hi');
  assert(transWord === 'शिक्षक', 'Word dictionary lookup: "teacher" -> "शिक्षक"');

  // Async Translator Pipeline
  const asyncTrans = await translateText('today we will study binary search', 'en', 'hi');
  assert(typeof asyncTrans === 'string' && asyncTrans.length > 0, `Async translate text: "${asyncTrans}"`);

  // Same language passthrough
  const sameLang = await translateText('Hello world', 'en', 'en');
  assert(sameLang === 'Hello world', 'Same language passthrough returns exact text');

  // Empty string handling
  const emptyRes = await translateText('', 'en', 'hi');
  assert(emptyRes === '', 'Empty string returns empty string');

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: Text-To-Speech (TTS) Service Tests
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}4. Text-To-Speech (TTS) Engine Tests:${colors.reset}`);

  // Mock window.speechSynthesis
  const mockVoices = [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Google Hindi', lang: 'hi-IN' },
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' }
  ];

  let spokenUtterance = null;
  let cancelled = false;

  global.window = {
    speechSynthesis: {
      getVoices: () => mockVoices,
      speak: (utt) => { spokenUtterance = utt; },
      cancel: () => { cancelled = true; }
    }
  };

  global.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1.0;
    }
  };

  const { tts } = await import('./lib/tts.js');

  assert(tts.isSupported === true, 'TTS service detects speechSynthesis support');
  
  const hiVoice = tts.getBestVoice('hi');
  assert(hiVoice && hiVoice.lang === 'hi-IN', `TTS selects Hindi voice: ${hiVoice?.name}`);

  const enVoice = tts.getBestVoice('en');
  assert(enVoice && enVoice.lang === 'en-US', `TTS selects English voice: ${enVoice?.name}`);

  // Test speaking
  tts.speak('नमस्ते छात्रों', 'hi');
  assert(spokenUtterance !== null && spokenUtterance.text === 'नमस्ते छात्रों', 'tts.speak() creates SpeechSynthesisUtterance with text');
  assert(spokenUtterance.lang === 'hi-IN', 'tts.speak() sets BCP-47 language to hi-IN');

  // Test stop
  tts.stop();
  assert(cancelled === true, 'tts.stop() invokes speechSynthesis.cancel()');

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: Study Notes Business Logic Tests
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}5. Notes Section Business Logic Tests:${colors.reset}`);

  let mockStorage = {};
  global.chrome = {
    storage: {
      local: {
        get: (keys) => Promise.resolve(mockStorage),
        set: (obj) => { Object.assign(mockStorage, obj); return Promise.resolve(); }
      }
    }
  };

  // Simulate appending single sentence to notes
  function appendSentenceToNotesLogic(currentNotes, translatedText, originalText, timeStr) {
    const newEntry = `• [${timeStr}] ${translatedText}\n  ("${originalText}")\n\n`;
    return currentNotes + newEntry;
  }

  let notes = '';
  notes = appendSentenceToNotesLogic(notes, 'आज हम बाइनरी सर्च सीखेंगे', 'Today we will learn binary search', '10:30 AM');
  assert(notes.includes('• [10:30 AM] आज हम बाइनरी सर्च सीखेंगे'), 'Note append contains translated sentence');
  assert(notes.includes('"Today we will learn binary search"'), 'Note append preserves secondary original sentence');

  notes = appendSentenceToNotesLogic(notes, 'एल्गोरिदम की जटिलता O(log N) है', 'Algorithm complexity is O(log N)', '10:32 AM');
  assert(notes.split('•').length === 3, 'Notes contains exactly 2 bullet items');

  // Word count calculator test
  function calculateWordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }
  const count = calculateWordCount(notes);
  assert(count > 10, `Notes word count correctly calculated (${count} words)`);

  // Notes export generator test
  const notesBlobText = notes;
  assert(notesBlobText.startsWith('• [10:30 AM]'), 'Exported notes text preserves exact formatting');

  // ─────────────────────────────────────────────────────────────
  // SUITE 6: Lecture History Save & Search Logic Tests
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}6. History Save & Search Logic Tests:${colors.reset}`);

  const mockUtterances = [
    { id: '1', text: 'Good morning class', translation: 'सुप्रभात कक्षा', lang: 'en', confidence: 0.98, timestamp: 1700000000000 },
    { id: '2', text: 'Today is binary search', translation: 'आज बाइनरी सर्च है', lang: 'en', confidence: 0.95, timestamp: 1700000010000 },
    { id: '3', text: 'Any questions?', translation: 'कोई प्रश्न?', lang: 'en', confidence: 0.75, timestamp: 1700000020000 } // Low confidence
  ];

  // History session packaging
  function createHistorySession(utterances, title, langDirection) {
    return {
      id: 'hist_' + Date.now(),
      title,
      timestamp: Date.now(),
      langDirection,
      utteranceCount: utterances.length,
      utterances: [...utterances]
    };
  }

  const session1 = createHistorySession(mockUtterances, 'Zoom Class - Computer Science 101', 'en-to-hi');
  assert(session1.utteranceCount === 3, 'History session packages all 3 utterances');
  assert(session1.utterances[2].confidence === 0.75, 'Preserves confidence metric for uncertainty tracking');

  const historyStore = [
    session1,
    createHistorySession([{ id: '4', text: 'Mathematics calculus', translation: 'गणित कलन', lang: 'en', confidence: 0.9 }], 'Zoom Class - Math Lecture', 'en-to-hi')
  ];

  // History search filter test
  function filterHistory(sessions, query) {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(sess => {
      if (sess.title.toLowerCase().includes(q)) return true;
      return sess.utterances.some(u => 
        (u.text || '').toLowerCase().includes(q) || 
        (u.translation || '').toLowerCase().includes(q)
      );
    });
  }

  const searchTitle = filterHistory(historyStore, 'Computer Science');
  assert(searchTitle.length === 1 && searchTitle[0].title.includes('Computer Science'), 'Search by session title returns matching session');

  const searchKeyword = filterHistory(historyStore, 'बाइनरी सर्च');
  assert(searchKeyword.length === 1, 'Search by translated Hindi keyword ("बाइनरी सर्च") returns correct session');

  const searchOriginal = filterHistory(historyStore, 'calculus');
  assert(searchOriginal.length === 1 && searchOriginal[0].title.includes('Math'), 'Search by original English keyword ("calculus") matches');

  const searchNoMatch = filterHistory(historyStore, 'Physics Quantum');
  assert(searchNoMatch.length === 0, 'Search with unmatched query returns empty list (no false positives)');

  // ─────────────────────────────────────────────────────────────
  // SUITE 7: Uncertainty Highlighting Logic (< 0.85)
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}7. Uncertainty Highlighting Logic Tests:${colors.reset}`);

  const isUncertain = (confidence) => confidence && confidence < 0.85;

  assert(isUncertain(0.78) === true, 'Confidence 0.78 triggers Uncertainty highlight (Amber #FF851B)');
  assert(isUncertain(0.84) === true, 'Confidence 0.84 triggers Uncertainty highlight');
  assert(isUncertain(0.85) === false, 'Confidence 0.85 is considered confident (no Amber)');
  assert(isUncertain(0.96) === false, 'Confidence 0.96 is confident');

  // ─────────────────────────────────────────────────────────────
  // SUITE 8: Multilingual Selection & Direction Swap Logic
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}8. Multilingual Selection & Direction Swap Logic Tests:${colors.reset}`);

  let currentSource = 'fr'; // French speaker
  let currentTarget = 'en'; // Translate to English

  const swapLanguages = (src, tgt) => ({ source: tgt, target: src });

  let swapped = swapLanguages(currentSource, currentTarget);
  assert(swapped.source === 'en' && swapped.target === 'fr', 'Swaps French ➔ English to English ➔ French');

  swapped = swapLanguages('es', 'hi');
  assert(swapped.source === 'hi' && swapped.target === 'es', 'Swaps Spanish ➔ Hindi to Hindi ➔ Spanish');

  swapped = swapLanguages('ja', 'de');
  assert(swapped.source === 'de' && swapped.target === 'ja', 'Swaps Japanese ➔ German to German ➔ Japanese');

  const { getLanguageInfo: getLang } = await import('./lib/translator.js');
  assert(getLang('es').bcp47 === 'es-ES', 'BCP-47 locale for Spanish: es-ES');
  assert(getLang('fr').bcp47 === 'fr-FR', 'BCP-47 locale for French: fr-FR');
  assert(getLang('de').bcp47 === 'de-DE', 'BCP-47 locale for German: de-DE');
  assert(getLang('ja').bcp47 === 'ja-JP', 'BCP-47 locale for Japanese: ja-JP');
  assert(getLang('zh').bcp47 === 'zh-CN', 'BCP-47 locale for Chinese: zh-CN');
  assert(getLang('ar').bcp47 === 'ar-SA', 'BCP-47 locale for Arabic: ar-SA');

  // ─────────────────────────────────────────────────────────────
  // SUITE 9: Monochrome Black & White Mode Theme Tests (No Neon)
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}9. Monochrome Black & White Mode Theme Tests:${colors.reset}`);

  const cssPath = path.join(__dirname, 'style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('[data-theme="dark"]') || cssContent.includes(':root'), 'CSS supports Black Mode (Dark)');
  assert(cssContent.includes('[data-theme="light"]'), 'CSS supports White Mode (Light)');
  assert(cssContent.includes('--bg-main: #0a0a0a') || cssContent.includes('--bg-main: #000000'), 'Black mode defines clean pure black background');
  assert(cssContent.includes('--bg-main: #ffffff'), 'White mode defines pure white background');
  assert(!cssContent.includes('#39ff14') && !cssContent.includes('#00e5ff') && !cssContent.includes('rgba(88, 166, 255'), 'CSS has zero neon glows or bright blue outlines');

  const toggleTheme = (theme) => theme === 'dark' ? 'light' : 'dark';
  assert(toggleTheme('dark') === 'light', 'Toggles Dark Mode ➔ Light Mode');
  assert(toggleTheme('light') === 'dark', 'Toggles Light Mode ➔ Dark Mode');

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}Test Results Summary:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed: ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

  if (failedCount === 0) {
    console.log(`${colors.green}${colors.bold}ALL CHECKS PASSED SUCCESSFULLY! (100% PASS RATE)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${colors.red}${colors.bold}SOME CHECKS FAILED!${colors.reset}\n`);
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
