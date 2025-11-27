/**
 * TITANE_INFINITY v15.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — HYBRID TTS SERVICE
 *   Service TTS hybride avec fallback Web Speech API
 *   Priorité: Tauri Backend → Web Speech API → Silence
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

export interface TTSConfig {
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0.0 - 2.0
  volume?: number; // 0.0 - 1.0
  voice?: string;
  lang?: string; // 'fr-FR', 'en-US'
}

export interface TTSStatus {
  provider: 'tauri' | 'webspeech' | 'none';
  available: boolean;
  speaking: boolean;
}

/**
 * Service TTS hybride
 */
class HybridTTSService {
  private speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private tauriAvailable: boolean | null = null;

  /**
   * Vérifie disponibilité Tauri Backend
   */
  private async checkTauriAvailable(): Promise<boolean> {
    if (this.tauriAvailable !== null) {
      return this.tauriAvailable;
    }

    try {
      // Teste si commande speak existe (ai_chat.rs)
      await secureInvoke('ping'); // Simple health check
      this.tauriAvailable = true;
      console.log('✅ TTS: Tauri backend available');
      return true;
    } catch (error) {
      this.tauriAvailable = false;
      console.log('⚠️ TTS: Tauri backend unavailable, using Web Speech API fallback');
      return false;
    }
  }

  /**
   * Vérifie disponibilité Web Speech API
   */
  private checkWebSpeechAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Synthétise texte via Tauri Backend
   */
  private async speakTauri(text: string, config: TTSConfig = {}, useOnline: boolean = false): Promise<void> {
    try {
      console.log('🎤 TTS (Tauri): Synthesizing...');
      console.log(`📡 Mode: ${useOnline ? 'Online (Google TTS)' : 'Local (espeak/piper)'}`);
      console.log(`⚙️  Config: rate=${config.rate || 1.0}, pitch=${config.pitch || 1.0}, voice=${config.voice || 'default'}`);
      this.speaking = true;

      // ✅ v19.2.0: Transmission paramètres rate/pitch/voice frontend → backend
      await secureInvoke('speak', {
        text,
        use_online: useOnline,
        rate: config.rate || null,
        pitch: config.pitch || null,
        voice: config.voice || null,
      });

      console.log('✅ TTS (Tauri): Success');
    } catch (error) {
      console.error('❌ TTS (Tauri): Error:', error);
      throw error;
    } finally {
      this.speaking = false;
    }
  }

  /**
   * Synthétise texte via Web Speech API
   */
  private async speakWebSpeech(text: string, config: TTSConfig = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.checkWebSpeechAvailable()) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      console.log('🌐 TTS (Web Speech API): Synthesizing...');
      this.speaking = true;

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Configuration
      utterance.lang = config.lang || 'fr-FR';
      utterance.rate = config.rate || 1.0;
      utterance.pitch = config.pitch || 1.0;
      utterance.volume = config.volume || 1.0;

      // Sélection voix si spécifiée
      if (config.voice) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(
          (v) => v.name === config.voice || v.lang === config.lang
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Callbacks
      utterance.onend = () => {
        console.log('✅ TTS (Web Speech API): Success');
        this.speaking = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ TTS (Web Speech API): Error:', event.error);
        this.speaking = false;
        this.currentUtterance = null;
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      // Synthèse
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Synthétise texte (avec fallback automatique)
   */
  async speak(text: string, config: TTSConfig = {}, useOnline: boolean = false): Promise<void> {
    if (!text.trim()) {
      console.warn('⚠️ TTS: Empty text, skipping');
      return;
    }

    console.log('\n🔊 TTS: Starting synthesis...');
    console.log(`📝 Text: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
    console.log(`🌐 Mode: ${useOnline ? 'Online' : 'Offline First'}`);

    // Stratégie 1: Tauri Backend (priorité)
    const tauriAvailable = await this.checkTauriAvailable();
    if (tauriAvailable) {
      try {
        await this.speakTauri(text, config, useOnline);
        return;
      } catch (error) {
        console.warn('⚠️ TTS: Tauri failed, falling back to Web Speech API');
      }
    }

    // Stratégie 2: Web Speech API (fallback)
    if (this.checkWebSpeechAvailable()) {
      try {
        await this.speakWebSpeech(text, config);
        return;
      } catch (error) {
        console.warn('⚠️ TTS: Web Speech API failed');
      }
    }

    // Stratégie 3: Silent mode (dernier recours)
    console.log('🔇 TTS: No provider available, silent mode');
  }

  /**
   * Arrête synthèse en cours
   */
  async stop(): Promise<void> {
    console.log('⏹️ TTS: Stopping...');

    // v19.2.0: Arrêt Tauri via commande stop_speaking
    if (this.tauriAvailable) {
      try {
        await secureInvoke('stop_speaking');
        console.log('✅ TTS: Tauri backend stopped');
      } catch (error) {
        console.warn('⚠️ TTS: Tauri stop failed:', error);
      }
    }

    // Arrêt Web Speech API
    if (this.checkWebSpeechAvailable()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }

    this.speaking = false;
    console.log('✅ TTS: Stopped');
  }

  /**
   * Obtient statut TTS
   */
  async getStatus(): Promise<TTSStatus> {
    const tauriAvailable = await this.checkTauriAvailable();
    const webSpeechAvailable = this.checkWebSpeechAvailable();

    // v19.2.0: Vérifier état backend si disponible
    let backendSpeaking = false;
    if (tauriAvailable) {
      try {
        backendSpeaking = await secureInvoke<boolean>('is_speaking');
      } catch (error) {
        console.warn('⚠️ TTS: Could not check backend speaking state:', error);
      }
    }

    let provider: 'tauri' | 'webspeech' | 'none' = 'none';
    let available = false;

    if (tauriAvailable) {
      provider = 'tauri';
      available = true;
    } else if (webSpeechAvailable) {
      provider = 'webspeech';
      available = true;
    }

    return {
      provider,
      available,
      speaking: backendSpeaking || this.speaking, // v19.2.0: Combine backend + local state
    };
  }

  /**
   * Obtient voix disponibles
   */
  async getAvailableVoices(): Promise<Array<{ name: string; lang: string }>> {
    // Web Speech API (plus fiable que backend Tauri pour liste voix)
    if (this.checkWebSpeechAvailable()) {
      const voices = window.speechSynthesis.getVoices();
      return voices.map((v) => ({
        name: v.name,
        lang: v.lang,
      }));
    }

    return [];
  }

  /**
   * Reset cache Tauri disponibilité
   */
  resetCache(): void {
    this.tauriAvailable = null;
  }
}

// Export singleton
export const hybridTTS = new HybridTTSService();
export default hybridTTS;
