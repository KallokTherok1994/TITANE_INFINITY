// ⚡ TITANE∞ v22 — Sound Engine
// Moteur audio intelligent avec signature sonore premium

import { SystemState, stateEngine } from '../visual/STATE_ENGINE';
import { DS_CONSTANTS } from '../visual/DS_CONSTANTS';

// 🎵 Types de sons
export type SoundType =
  | 'click' // Clic UI
  | 'hover' // Survol
  | 'success' // Succès
  | 'warning' // Avertissement
  | 'error' // Erreur
  | 'pulse' // Pulse système
  | 'transition' // Transition
  | 'open' // Ouverture
  | 'close' // Fermeture
  | 'tick' // Tick data
  | 'whoosh' // Mouvement rapide
  | 'ambient'; // Ambiance

// 🎨 Configuration d'un son
export interface SoundConfig {
  type: SoundType;
  volume: number; // 0-1
  pitch?: number; // 0.5-2.0
  duration?: number; // ms
  delay?: number; // ms
  loop?: boolean;
  fadeIn?: number; // ms
  fadeOut?: number; // ms
}

// 🎼 Mapping état → son
const STATE_SOUNDS: Record<SystemState, SoundConfig> = {
  stable: {
    type: 'pulse',
    volume: DS_CONSTANTS.audio.soft,
    pitch: 1.0,
    duration: 200,
  },
  processing: {
    type: 'tick',
    volume: DS_CONSTANTS.audio.soft,
    pitch: 1.2,
    duration: 100,
    loop: true,
  },
  warning: {
    type: 'warning',
    volume: DS_CONSTANTS.audio.medium,
    pitch: 1.0,
    duration: 300,
  },
  danger: {
    type: 'error',
    volume: DS_CONSTANTS.audio.loud,
    pitch: 0.9,
    duration: 400,
  },
  null: {
    type: 'ambient',
    volume: DS_CONSTANTS.audio.whisper,
    pitch: 1.0,
    duration: 0,
  },
  offline: {
    type: 'ambient',
    volume: DS_CONSTANTS.audio.muted,
    pitch: 0.8,
    duration: 0,
  },
};

// 🎧 Sound Engine principal
export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = DS_CONSTANTS.audio.medium;
  private enabled: boolean = true;
  private soundCache: Map<SoundType, AudioBuffer> = new Map();
  private activeSounds: Map<string, AudioBufferSourceNode> = new Map();

  // 🌙 Mode jour/nuit
  private timeBasedVolume: number = 1.0;

  constructor() {
    this.initializeAudioContext();
    this.setupTimeBasedVolume();
  }

  /**
   * Initialiser le contexte audio
   */
  private initializeAudioContext(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Volume adaptatif selon l'heure (jour/nuit)
   */
  private setupTimeBasedVolume(): void {
    const updateVolume = () => {
      const hour = new Date().getHours();
      // Nuit (22h-7h) : volume réduit 50%
      // Jour (7h-22h) : volume normal 100%
      this.timeBasedVolume = hour >= 22 || hour < 7 ? 0.5 : 1.0;
    };

    updateVolume();
    // Vérifier toutes les heures
    setInterval(updateVolume, 3600000);
  }

  /**
   * Générer un son synthétique (oscillateur)
   */
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    const finalVolume = volume * this.masterVolume * this.timeBasedVolume;
    gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  /**
   * Jouer un son selon son type
   */
  playSound(config: SoundConfig): void {
    if (!this.enabled || !this.audioContext) return;

    const { type, volume, pitch = 1.0, duration = 200, delay = 0 } = config;

    setTimeout(() => {
      switch (type) {
        case 'click':
          this.generateTone(800 * pitch, 50, 'square', volume);
          break;

        case 'hover':
          this.generateTone(600 * pitch, 30, 'sine', volume * 0.5);
          break;

        case 'success':
          // Deux notes montantes
          this.generateTone(523 * pitch, 100, 'sine', volume); // C5
          setTimeout(() => this.generateTone(659 * pitch, 100, 'sine', volume), 80); // E5
          break;

        case 'warning':
          // Note descendante
          this.generateTone(700 * pitch, duration, 'triangle', volume);
          setTimeout(() => this.generateTone(500 * pitch, duration, 'triangle', volume * 0.7), duration / 2);
          break;

        case 'error':
          // Buzz lourd
          this.generateTone(200 * pitch, duration, 'sawtooth', volume);
          break;

        case 'pulse':
          // Pulse doux
          this.generateTone(400 * pitch, duration, 'sine', volume * 0.6);
          break;

        case 'tick':
          // Tick court
          this.generateTone(1200 * pitch, 20, 'square', volume * 0.4);
          break;

        case 'transition':
          // Whoosh synthétique
          this.generateTone(800 * pitch, duration, 'sine', volume);
          break;

        case 'open':
          // Montée rapide
          this.generateTone(300 * pitch, duration, 'sine', volume);
          break;

        case 'close':
          // Descente rapide
          this.generateTone(600 * pitch, duration, 'sine', volume);
          break;

        case 'whoosh':
          // Balayage fréquence
          if (this.audioContext) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(1000 * pitch, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200 * pitch, this.audioContext.currentTime + duration / 1000);

            gain.gain.setValueAtTime(volume * this.masterVolume * this.timeBasedVolume, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            osc.start();
            osc.stop(this.audioContext.currentTime + duration / 1000);
          }
          break;

        case 'ambient':
          // Silence ou ton très bas
          this.generateTone(100 * pitch, duration, 'sine', volume * 0.1);
          break;
      }
    }, delay);
  }

  /**
   * Jouer un son selon l'état système
   */
  playStateSound(state: SystemState): void {
    const soundConfig = STATE_SOUNDS[state];
    this.playSound(soundConfig);
  }

  /**
   * Feedback sonore sur changement de valeur module
   */
  playModuleFeedback(moduleName: string, value: number, previousValue: number): void {
    if (!this.enabled) return;

    const delta = Math.abs(value - previousValue);
    if (delta < 5) return; // Ignore petits changements

    const volume = Math.min(DS_CONSTANTS.audio.soft, (delta / 100) * DS_CONSTANTS.audio.medium);

    if (value > previousValue) {
      // Montée
      this.generateTone(600 + value * 4, 100, 'sine', volume);
    } else {
      // Descente
      this.generateTone(800 - value * 4, 100, 'sine', volume);
    }
  }

  /**
   * Activer/désactiver le son
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Définir le volume global
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Obtenir le volume effectif (avec time-based adjustment)
   */
  getEffectiveVolume(): number {
    return this.masterVolume * this.timeBasedVolume;
  }

  /**
   * Stop tous les sons actifs
   */
  stopAllSounds(): void {
    this.activeSounds.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Déjà stoppé
      }
    });
    this.activeSounds.clear();
  }

  /**
   * Nettoyer les ressources
   */
  dispose(): void {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 🌟 Instance singleton
export const soundEngine = new SoundEngine();
