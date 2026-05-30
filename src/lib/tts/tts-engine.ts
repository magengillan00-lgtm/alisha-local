// ============================================================
// Alisha Local - TTS Engine (Web Speech API)
// ============================================================
import type { TTSConfig, TTSLanguage } from '@/types';

class TTSEngine {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lipSyncCallback: ((value: number) => void) | null = null;
  private lipSyncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
    }
  }

  isAvailable(): boolean {
    return this.synthesis !== null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getVoicesForLanguage(lang: TTSLanguage): SpeechSynthesisVoice[] {
    const langCode = this.getLanguageCode(lang);
    return this.getVoices().filter((v) => v.lang.startsWith(langCode));
  }

  private getLanguageCode(lang: TTSLanguage): string {
    const map: Record<TTSLanguage, string> = {
      ar: 'ar',
      en: 'en',
      ja: 'ja',
    };
    return map[lang];
  }

  speak(text: string, config: TTSConfig, onEnd?: () => void): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = this.getLanguageCode(config.language);
    utterance.lang = langCode;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    // Try to find a matching voice
    const voices = this.getVoicesForLanguage(config.language);
    if (config.voiceName) {
      const found = voices.find((v) => v.name === config.voiceName);
      if (found) utterance.voice = found;
    } else if (voices.length > 0) {
      // Prefer a female voice for Alisha
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha')
      );
      utterance.voice = femaleVoice || voices[0];
    }

    utterance.onend = () => {
      this.stopLipSync();
      onEnd?.();
    };

    utterance.onerror = () => {
      this.stopLipSync();
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);

    // Start lip sync simulation
    if (this.lipSyncCallback) {
      this.startLipSync(text);
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.stopLipSync();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  setLipSyncCallback(callback: (value: number) => void): void {
    this.lipSyncCallback = callback;
  }

  private startLipSync(text: string): void {
    // Simulate lip-sync by analyzing the text and creating mouth movement patterns
    const chars = text.split('');
    let index = 0;

    this.lipSyncInterval = setInterval(() => {
      if (index >= chars.length) {
        // Continue with subtle movements even after text is "read"
        this.lipSyncCallback?.(Math.random() * 0.3);
        return;
      }

      const char = chars[index].toLowerCase();
      let mouthOpen = 0;

      // Map characters to mouth positions
      if ('اىأإآة'.includes(char) || 'a'.includes(char)) {
        mouthOpen = 0.9;
      } else if ('وؤذ'.includes(char) || 'ou'.includes(char)) {
        mouthOpen = 0.7;
      } else if ('يئ'.includes(char) || 'ei'.includes(char)) {
        mouthOpen = 0.5;
      } else if (char === ' ') {
        mouthOpen = 0.05;
      } else if (char === '.' || char === '،' || char === '!') {
        mouthOpen = 0.0;
      } else {
        mouthOpen = 0.4 + Math.random() * 0.3;
      }

      this.lipSyncCallback?.(mouthOpen);
      index++;
    }, 80); // ~12 chars per second
  }

  private stopLipSync(): void {
    if (this.lipSyncInterval) {
      clearInterval(this.lipSyncInterval);
      this.lipSyncInterval = null;
    }
    this.lipSyncCallback?.(0);
  }
}

// Singleton instance
let ttsInstance: TTSEngine | null = null;

export function getTTSEngine(): TTSEngine {
  if (!ttsInstance) {
    ttsInstance = new TTSEngine();
  }
  return ttsInstance;
}

export { TTSEngine };
