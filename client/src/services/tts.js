/**
 * Free Browser-Based Text-to-Speech (TTS) Service
 * Uses the Web Speech Synthesis API (window.speechSynthesis)
 * 100% Free, zero external API keys required, works directly in Chrome/Edge/Firefox/Safari.
 */

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSupported = !!this.synth;
    this.autoSpeak = false;

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
    
    // Find matching language voice (e.g. 'hi-IN' or 'hi')
    const match = this.voices.find(v => 
      v.lang.toLowerCase().startsWith(langCode.toLowerCase()) || 
      v.lang.toLowerCase().replace('_', '-').startsWith(langCode.toLowerCase())
    );
    if (match) return match;

    // Fallback to Google Hindi / Natural Hindi or default
    const googleVoice = this.voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india'));
    if (googleVoice) return googleVoice;

    return this.voices[0] || null;
  }

  speak(text, langCode = 'hi', rate = 1.0, onEnd = null) {
    if (!this.isSupported || !text || !text.trim()) return;

    // Cancel any ongoing speech to avoid queue pileup
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    
    // BCP-47 Language mapping
    const bcpMap = {
      hi: 'hi-IN',
      en: 'en-US',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN'
    };

    const targetBcp = bcpMap[langCode] || langCode;
    utterance.lang = targetBcp;

    const voice = this.getBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate; // 0.8 - 1.2
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  isSpeaking() {
    return !!(this.synth && this.synth.speaking);
  }

  toggleAutoSpeak() {
    this.autoSpeak = !this.autoSpeak;
    if (!this.autoSpeak) this.stop();
    return this.autoSpeak;
  }
}

export const tts = new TTSService();
export default tts;
