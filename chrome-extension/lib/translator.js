/**
/**
 * Real-Time Multilingual Educational Translation Engine
 * 1. High-Performance Local Backend Gateway (/api/translate)
 * 2. Direct Public Translation Fallback (Google GTX)
 * 3. Exact Offline Educational Phrase & Word Dictionary
 * 4. Fast In-Memory Translation Cache
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', bcp47: 'en-US', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'hi', bcp47: 'hi-IN', label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'es', bcp47: 'es-ES', label: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', bcp47: 'fr-FR', label: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', bcp47: 'de-DE', label: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ja', bcp47: 'ja-JP', label: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', bcp47: 'zh-CN', label: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'ru', bcp47: 'ru-RU', label: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ar', bcp47: 'ar-SA', label: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'pt', bcp47: 'pt-BR', label: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'it', bcp47: 'it-IT', label: 'Italian', flag: '🇮🇳', native: 'Italiano' },
  { code: 'ko', bcp47: 'ko-KR', label: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'nl', bcp47: 'nl-NL', label: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'tr', bcp47: 'tr-TR', label: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'vi', bcp47: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'id', bcp47: 'id-ID', label: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'mr', bcp47: 'mr-IN', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
  { code: 'bn', bcp47: 'bn-IN', label: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
  { code: 'gu', bcp47: 'gu-IN', label: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
  { code: 'ta', bcp47: 'ta-IN', label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', bcp47: 'te-IN', label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'kn', bcp47: 'kn-IN', label: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { code: 'ml', bcp47: 'ml-IN', label: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
  { code: 'pa', bcp47: 'pa-IN', label: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', bcp47: 'ur-PK', label: 'Urdu', flag: '🇵🇰', native: 'اردو' }
];

export function getLanguageInfo(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

// In-Memory Translation Cache
const TRANSLATION_CACHE = new Map();

// Local Exact Educational & Conversational Phrases
export const PHRASE_MAP = {
  'hello': 'नमस्ते',
  'hi': 'नमस्ते',
  'good morning': 'सुप्रभात',
  'good morning class': 'सुप्रभात कक्षा',
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
  'today we will study binary search': 'आज हम बाइनरी सर्च का अध्ययन करेंगे',
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
export const WORD_DICT = {
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

// Reverse Dictionary for Hindi to English
const REVERSE_PHRASE_MAP = {};
Object.entries(PHRASE_MAP).forEach(([en, hi]) => {
  REVERSE_PHRASE_MAP[hi.trim().toLowerCase()] = en;
});

const REVERSE_WORD_DICT = {};
Object.entries(WORD_DICT).forEach(([en, hi]) => {
  REVERSE_WORD_DICT[hi.trim().toLowerCase()] = en;
});

/**
 * Synchronous instant offline dictionary lookup (0ms)
 */
export function getOfflineTranslation(text, sourceLang = 'en', targetLang = 'hi') {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim().toLowerCase().replace(/[.,?!]/g, '');
  if (!clean) return '';
  if (sourceLang === targetLang) return text;

  if (sourceLang === 'en' && targetLang === 'hi') {
    if (PHRASE_MAP[clean]) return PHRASE_MAP[clean];
    if (WORD_DICT[clean]) return WORD_DICT[clean];
  } else if (sourceLang === 'hi' && targetLang === 'en') {
    if (REVERSE_PHRASE_MAP[clean]) return REVERSE_PHRASE_MAP[clean];
    if (REVERSE_WORD_DICT[clean]) return REVERSE_WORD_DICT[clean];
  }

  return '';
}

/**
 * Full Sentence Automatic Translation
 * Pipeline: Local Cache -> Local Server /api/translate -> Google GTX Web -> Fallback
 */
export async function translateText(text, sourceLang = 'en', targetLang = 'hi', backendUrl = 'http://localhost:5000') {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (sourceLang === targetLang) return trimmed;

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey);
  }

  // Exact offline match
  const offlineExact = getOfflineTranslation(trimmed, sourceLang, targetLang);
  if (offlineExact && trimmed.split(/\s+/).length <= 4) {
    TRANSLATION_CACHE.set(cacheKey, offlineExact);
    return offlineExact;
  }

  // 1. Try Local Backend Server Translation Endpoint
  try {
    const cleanBackend = backendUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanBackend}/api/translate?text=${encodeURIComponent(trimmed)}&from=${sourceLang}&to=${targetLang}`, {
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
    // If backend proxy unreachable, fall through to Google GTX
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
    // Fall back to offline dictionary word-by-word
  }

  // 3. Simple word-by-word fallback if offline
  if (sourceLang === 'en' && targetLang === 'hi') {
    const words = trimmed.split(/\s+/);
    const converted = words.map(w => WORD_DICT[w.toLowerCase().replace(/[^a-z]/g, '')] || w);
    const joined = converted.join(' ');
    if (joined !== trimmed) {
      return joined;
    }
  }

  return trimmed;
}
