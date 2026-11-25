const https = require('https');

// In-Memory cache for translations
const translationCache = new Map();

/**
 * Universal Free Translation Service (Zero API Key)
 * 1. Primary: Google GTX public endpoint (Super fast, highly accurate, handles full sentences)
 * 2. Secondary: MyMemory free API
 * 3. Fallback: Exact word/phrase matching
 */
async function translateText(text, sourceLang = 'en', targetLang = 'hi') {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (sourceLang === targetLang) return trimmed;

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 1. Google GTX Public API
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const gtxResult = await new Promise((resolve, reject) => {
      const req = https.get(gtxUrl, { timeout: 4000 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GTX status code ${res.statusCode}`));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
              const fullText = parsed[0].map(item => item[0]).join('');
              resolve(fullText);
            } else {
              reject(new Error('Invalid GTX response format'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('GTX request timeout'));
      });
    });

    if (gtxResult && gtxResult.trim()) {
      translationCache.set(cacheKey, gtxResult.trim());
      return gtxResult.trim();
    }
  } catch (err) {
    // Fall back to LibreTranslate / MyMemory
  }

  // 2. LibreTranslate Open-Source Free Endpoint
  try {
    const postData = JSON.stringify({
      q: trimmed,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });
    const ltOptions = {
      hostname: 'translate.argosopentech.com',
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 3500
    };
    const ltResult = await new Promise((resolve, reject) => {
      const req = https.request(ltOptions, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`LT status ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.translatedText) {
              resolve(parsed.translatedText.trim());
            } else {
              reject(new Error('Invalid LT response'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('LT timeout'));
      });
      req.write(postData);
      req.end();
    });

    if (ltResult && ltResult.trim()) {
      translationCache.set(cacheKey, ltResult.trim());
      return ltResult.trim();
    }
  } catch (ltErr) {
    // Continue to MyMemory
  }

  // 3. MyMemory Free API
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
    const mmResult = await new Promise((resolve, reject) => {
      const req = https.get(mmUrl, { timeout: 4000 }, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`MM status ${res.statusCode}`));
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.responseData && parsed.responseData.translatedText) {
              const trans = parsed.responseData.translatedText.trim();
              if (!trans.toLowerCase().startsWith('invalid') && !trans.toLowerCase().startsWith('query limit')) {
                resolve(trans);
              } else {
                reject(new Error('MM limit or invalid'));
              }
            } else {
              reject(new Error('No MM translation'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('MM timeout'));
      });
    });

    if (mmResult && mmResult.trim()) {
      translationCache.set(cacheKey, mmResult.trim());
      return mmResult.trim();
    }
  } catch (err) {
    // Offline fallback
  }

  // 3. Simple dictionary fallback if completely offline
  const dict = {
    'hello': 'नमस्ते',
    'hi': 'नमस्ते',
    'good morning': 'सुप्रभात',
    'good afternoon': 'शुभ दोपहर',
    'thank you': 'धन्यवाद',
    'welcome': 'स्वागत है',
    'yes': 'हाँ',
    'no': 'नहीं'
  };
  const lower = trimmed.toLowerCase().replace(/[.,?!]/g, '');
  if (dict[lower]) {
    return dict[lower];
  }

  return trimmed;
}

module.exports = {
  translateText,
  translationCache
};
