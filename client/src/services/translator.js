/**
 * Real-Time Multilingual Educational Translation Engine
 * 1. High-Performance Local Backend Gateway (/api/translate)
 * 2. Direct Public Translation Fallback (Zero API Key Required)
 * 3. Exact Offline Educational Phrase & Word Dictionary
 * 4. Fast In-Memory Translation Cache
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', bcp47: 'en-US', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'hi', bcp47: 'hi-IN', label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'mr', bcp47: 'mr-IN', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
  { code: 'bn', bcp47: 'bn-IN', label: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
  { code: 'gu', bcp47: 'gu-IN', label: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
  { code: 'ta', bcp47: 'ta-IN', label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', bcp47: 'te-IN', label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'es', bcp47: 'es-ES', label: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', bcp47: 'fr-FR', label: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', bcp47: 'de-DE', label: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ja', bcp47: 'ja-JP', label: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', bcp47: 'zh-CN', label: 'Chinese', flag: '🇨🇳', native: '中文' }
];

export function getLanguageInfo(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

// In-Memory Translation Cache
const TRANSLATION_CACHE = new Map();

// Local Exact Educational & Conversational Phrases
const PHRASE_MAP = {
  'hello': 'नमस्ते',
  'hi': 'नमस्ते',
  'good morning': 'सुप्रभात',
  'good morning everyone': 'सभी को सुप्रभात',
  'good afternoon': 'शुभ दोपहर',
  'good evening': 'शुभ संध्या',
  'welcome to class': 'कक्षा में आपका स्वागत है',
  'welcome': 'स्वागत है',
  'how are you': 'आप कैसे हैं?',
  'how are you all': 'आप सब कैसे हैं?',
  'i am fine': 'मैं ठीक हूँ',
  'can you hear me': 'क्या आप मुझे सुन सकते हैं?',
  'can everyone hear me': 'क्या सब मुझे सुन पा रहे हैं?',
  'yes i can hear you': 'हाँ, मैं आपको सुन सकता हूँ',
  'please open your book': 'कृपया अपनी पुस्तक खोलें',
  'please open your notebook': 'कृपया अपनी नोटबुक खोलें',
  'today we will study': 'आज हम अध्ययन करेंगे',
  'today we will learn': 'आज हम सीखेंगे',
  'binary search': 'बाइनरी सर्च',
  'do you have any questions': 'क्या आपके पास कोई प्रश्न है?',
  'any questions': 'कोई प्रश्न?',
  'any doubt': 'कोई संदेह?',
  'thank you': 'धन्यवाद',
  'thank you very much': 'बहुत बहुत धन्यवाद',
  'see you tomorrow': 'कल मिलते हैं',
  'attendance is mandatory': 'उपस्थिति अनिवार्य है',
  'listen carefully': 'ध्यान से सुनें',
  'look at the screen': 'स्क्रीन पर देखें',
  'let us start': 'आइए शुरू करते हैं',
  'let us begin': 'आइए शुरू करें',
  'turn on your camera': 'अपना कैमरा चालू करें',
  'turn off your mic': 'अपना माइक बंद करें',
  'what is your name': 'आपका नाम क्या है?',
  'my name is': 'मेरा नाम है'
};

// Common word dictionary for offline fallback
const WORD_DICT = {
  'i': 'मैं', 'you': 'आप', 'we': 'हम', 'they': 'वे', 'he': 'वह', 'she': 'वह', 'it': 'यह',
  'this': 'यह', 'that': 'वह', 'what': 'क्या', 'where': 'कहाँ', 'when': 'कब', 'why': 'क्यों',
  'how': 'कैसे', 'who': 'कौन', 'which': 'कौन सा',
  'is': 'है', 'am': 'हूँ', 'are': 'हैं', 'was': 'था', 'were': 'थे',
  'learn': 'सीखना', 'study': 'अध्ययन', 'teach': 'पढ़ाना', 'read': 'पढ़ना', 'write': 'लिखना',
  'speak': 'बोलना', 'listen': 'सुनना', 'understand': 'समझना', 'know': 'जानना',
  'teacher': 'शिक्षक', 'professor': 'प्रोफेसर', 'student': 'छात्र', 'class': 'कक्षा', 'classroom': 'कक्षा',
  'lesson': 'पाठ', 'chapter': 'अध्याय', 'question': 'प्रश्न', 'answer': 'उत्तर', 'problem': 'समस्या',
  'algorithm': 'एल्गोरिदम', 'function': 'फ़ंक्शन', 'variable': 'वेरिएबल', 'loop': 'लूप',
  'array': 'एरे', 'data': 'डेटा', 'structure': 'संरचना', 'computer': 'कंप्यूटर', 'science': 'विज्ञान',
  'code': 'कोड', 'program': 'प्रोग्राम', 'time': 'समय', 'memory': 'मेमोरी', 'screen': 'स्क्रीन',
  'camera': 'कैमरा', 'microphone': 'माइक्रोफ़ोन', 'video': 'वीडियो', 'audio': 'ऑडियो',
  'good': 'अच्छा', 'bad': 'बुरा', 'yes': 'हाँ', 'no': 'नहीं', 'please': 'कृपया', 'thanks': 'धन्यवाद'
};

/**
 * Synchronous instant offline dictionary lookup (0ms)
 * ONLY matches exact phrase to prevent accidental substring false-positives!
 */
export function getOfflineTranslation(text, sourceLang = 'en', targetLang = 'hi') {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim().toLowerCase().replace(/[.,?!]/g, '');

  if (!clean) return '';
  if (sourceLang === targetLang) return text;

  // Exact phrase match ONLY (never substring match!)
  if (PHRASE_MAP[clean]) {
    return PHRASE_MAP[clean];
  }

  // Exact single word match
  if (WORD_DICT[clean]) {
    return WORD_DICT[clean];
  }

  return '';
}

/**
 * Full Sentence Automatic Translation
 * Pipeline: Local Cache -> Local Server /api/translate -> Google GTX Web -> MyMemory -> Fallback
 */
export async function translateText(text, sourceLang = 'en', targetLang = 'hi') {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (sourceLang === targetLang) return trimmed;

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey);
  }

  // Exact offline match for short phrases (1-2 words)
  const offlineExact = getOfflineTranslation(trimmed, sourceLang, targetLang);
  if (offlineExact && trimmed.split(/\s+/).length <= 2) {
    TRANSLATION_CACHE.set(cacheKey, offlineExact);
    return offlineExact;
  }

  // 1. Try Local Backend Server Translation Endpoint
  try {
    const res = await fetch(`http://localhost:5000/api/translate?text=${encodeURIComponent(trimmed)}&from=${sourceLang}&to=${targetLang}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.translation) {
        const result = data.translation.trim();
        TRANSLATION_CACHE.set(cacheKey, result);
        return result;
      }
    }
  } catch (backendErr) {
    // If backend proxy unreachable, try direct web APIs
  }

  // 2. Direct Google GTX Web API
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(gtxUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const parsed = await res.json();
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        const translated = parsed[0].map(s => s[0]).join('').trim();
        if (translated) {
          TRANSLATION_CACHE.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (gtxErr) {
    // Fall back to MyMemory
  }

  // 3. LibreTranslate Open-Source Free Endpoint
  try {
    const ltRes = await fetch('https://translate.argosopentech.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: trimmed,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (ltRes.ok) {
      const ltData = await ltRes.json();
      if (ltData && ltData.translatedText) {
        const trans = ltData.translatedText.trim();
        TRANSLATION_CACHE.set(cacheKey, trans);
        return trans;
      }
    }
  } catch (ltErr) {
    // Continue to MyMemory
  }

  // 4. Free MyMemory Public Translation API
  try {
    const pair = `${sourceLang}|${targetLang}`;
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(mmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let result = data.responseData.translatedText.trim();
        if (result && !result.toLowerCase().startsWith('invalid') && !result.toLowerCase().startsWith('query limit')) {
          TRANSLATION_CACHE.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (mmErr) {
    // Fall through to offline
  }

  // 4. Offline word-by-word token lookup
  const words = trimmed.toLowerCase().replace(/[.,?!]/g, '').split(/\s+/);
  const translatedWords = words.map(w => WORD_DICT[w] || w);
  const result = translatedWords.join(' ');
  TRANSLATION_CACHE.set(cacheKey, result);
  return result;
}
