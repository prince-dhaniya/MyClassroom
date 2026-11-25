/**
 * Browser-Based Text-to-Speech (TTS) Service for Chrome Extension
 * Uses the Web Speech Synthesis API (window.speechSynthesis)
 */

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSupported = !!this.synth;

    if (this.isSupported) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  getBestVoice(langCode = 'hi') {
    if (!this.voices.length) this.loadVoices();

    const targetCode = langCode.toLowerCase();
    
    // Exact or prefix match
    const match = this.voices.find(v => 
      v.lang.toLowerCase().startsWith(targetCode) || 
      v.lang.toLowerCase().replace('_', '-').startsWith(targetCode)
    );
    if (match) return match;

    if (targetCode.startsWith('hi')) {
      const googleHindi = this.voices.find(v => 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('india')
      );
      if (googleHindi) return googleHindi;
    }

    if (targetCode.startsWith('en')) {
      const googleEn = this.voices.find(v => 
        v.lang.toLowerCase().includes('en-us') || 
        v.name.toLowerCase().includes('english')
      );
      if (googleEn) return googleEn;
    }

    return this.voices[0] || null;
  }

  speak(text, langCode = 'hi', rate = 1.0, onEnd = null) {
    if (!this.isSupported || !text || !text.trim()) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    const bcpMap = {
      hi: 'hi-IN',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ru: 'ru-RU',
      ar: 'ar-SA',
      pt: 'pt-BR',
      it: 'it-IT',
      ko: 'ko-KR',
      nl: 'nl-NL',
      tr: 'tr-TR',
      vi: 'vi-VN',
      id: 'id-ID',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      ur: 'ur-PK'
    };

    utterance.lang = bcpMap[langCode] || langCode;
    const voice = this.getBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('TTS speak error:', e);
      if (onEnd) onEnd();
    }
  }

  stop() {
    if (!this.isSupported || !this.synth) return;
    try {
      this.synth.cancel();
    } catch (e) {
      // Ignore
    }
  }
}

export const tts = new TTSService();
export default tts;
