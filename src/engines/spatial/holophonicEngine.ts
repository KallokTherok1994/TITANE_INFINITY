/**
 * TITANE_INFINITY v∞.11 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ HOLOPHONIC 3D VOICE & SPATIAL PRESENCE ENGINE v∞.Ω
 *   Positionnement audio 3D · HRTF binaural · Sound design cognitif
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TitanSpatialState = {
  // Position 3D
  x: number; // -1 (gauche) → 1 (droite)
  y: number; // -1 (bas) → 1 (haut)
  z: number; // 0 (proche) → 1 (loin)

  // Caractéristiques spatiales
  width: number; // 0 (point) → 1 (diffus)
  focus: number; // 0 (ambient) → 1 (ciblé)

  // Profondeur perceptuelle
  distance: number; // 0 (intime) → 1 (distant)
};

export type SpatialPreset =
  | 'coach' // Devant, proche, focus moyen
  | 'meta' // Au-dessus, large, ambiant
  | 'deep-work' // Arrière, loin, diffus
  | 'insight' // Proche, haut, halo
  | 'empathy' // Très proche, centré, intime
  | 'architect' // Devant-haut, précis
  | 'neutral'; // Centré, équilibré

export type CognitiveSound =
  | 'thinking' // Réflexion
  | 'insight' // Éclair de clarté
  | 'mode_switch' // Changement de mode
  | 'error_soft' // Erreur douce
  | 'heal_complete' // Auto-guérison terminée
  | 'wake_word' // Wake word détecté
  | 'listening' // Écoute active
  | 'processing'; // Traitement en cours

export type SpatialOptions = {
  fadeIn?: number; // ms
  fadeOut?: number; // ms
  spatialize?: boolean; // Activer la spatialisation
  priority?: 'low' | 'normal' | 'high';
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS SPATIAUX
// ═══════════════════════════════════════════════════════════════════════════

const SPATIAL_PRESETS: Record<SpatialPreset, TitanSpatialState> = {
  coach: {
    x: 0,
    y: 0.1,
    z: 0.3,
    width: 0.4,
    focus: 0.7,
    distance: 0.3,
  },
  meta: {
    x: 0,
    y: 0.6,
    z: 0.4,
    width: 0.7,
    focus: 0.4,
    distance: 0.5,
  },
  'deep-work': {
    x: 0,
    y: -0.1,
    z: 0.7,
    width: 0.8,
    focus: 0.2,
    distance: 0.7,
  },
  insight: {
    x: 0,
    y: 0.4,
    z: 0.2,
    width: 0.5,
    focus: 0.8,
    distance: 0.2,
  },
  empathy: {
    x: 0,
    y: 0,
    z: 0.1,
    width: 0.3,
    focus: 0.9,
    distance: 0.1,
  },
  architect: {
    x: 0,
    y: 0.3,
    z: 0.3,
    width: 0.2,
    focus: 0.9,
    distance: 0.3,
  },
  neutral: {
    x: 0,
    y: 0,
    z: 0.5,
    width: 0.5,
    focus: 0.5,
    distance: 0.5,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LEXIQUE SONORE COGNITIF
// ═══════════════════════════════════════════════════════════════════════════

type SoundConfig = {
  frequency: number;
  duration: number;
  volume: number;
  waveform: OscillatorType;
  description: string;
};

const COGNITIVE_SOUNDS: Record<CognitiveSound, SoundConfig> = {
  thinking: {
    frequency: 220,
    duration: 0.3,
    volume: 0.05,
    waveform: 'sine',
    description: 'Subtle shimmer - réflexion en cours',
  },
  insight: {
    frequency: 880,
    duration: 0.2,
    volume: 0.15,
    waveform: 'sine',
    description: 'Tintement cristallin - éclair de clarté',
  },
  mode_switch: {
    frequency: 440,
    duration: 0.4,
    volume: 0.1,
    waveform: 'triangle',
    description: "Variation d'intervalle - changement de mode",
  },
  error_soft: {
    frequency: 150,
    duration: 0.2,
    volume: 0.08,
    waveform: 'sawtooth',
    description: 'Micro-glitch doux - erreur soft',
  },
  heal_complete: {
    frequency: 660,
    duration: 0.5,
    volume: 0.12,
    waveform: 'sine',
    description: 'Retour harmonieux - guérison terminée',
  },
  wake_word: {
    frequency: 550,
    duration: 0.15,
    volume: 0.1,
    waveform: 'sine',
    description: 'Ping signature - wake word détecté',
  },
  listening: {
    frequency: 330,
    duration: 0.25,
    volume: 0.06,
    waveform: 'sine',
    description: 'Ton doux - écoute active',
  },
  processing: {
    frequency: 440,
    duration: 0.35,
    volume: 0.07,
    waveform: 'triangle',
    description: 'Pulsation légère - traitement en cours',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class HolophonicEngine {
  private audioContext: AudioContext | null;
  private spatialState: TitanSpatialState;
  private panner: PannerNode | null;
  private gainNode: GainNode | null;
  private convolver: ConvolverNode | null;
  private isInitialized: boolean;
  private soundIntensity: 'off' | 'minimal' | 'normal' | 'rich';
  private subscribers: Array<(state: TitanSpatialState) => void>;

  constructor() {
    this.audioContext = null;
    this.spatialState = SPATIAL_PRESETS.neutral;
    this.panner = null;
    this.gainNode = null;
    this.convolver = null;
    this.isInitialized = false;
    this.soundIntensity = 'normal';
    this.subscribers = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎧 [HOLOPHONIC] Initializing spatial audio engine...');

      // Créer le contexte audio
      const AudioContextClass =
        (
          window as Window &
            typeof globalThis & { webkitAudioContext?: typeof AudioContext }
        ).AudioContext ||
        (
          window as Window &
            typeof globalThis & { webkitAudioContext?: typeof AudioContext }
        ).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      this.audioContext = new AudioContextClass();

      // Créer le gain node (volume principal)
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.7;
      this.gainNode.connect(this.audioContext.destination);

      // Créer le panner (spatialisation HRTF)
      this.panner = this.audioContext.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'inverse';
      this.panner.refDistance = 1;
      this.panner.maxDistance = 10;
      this.panner.rolloffFactor = 1;
      this.panner.coneInnerAngle = 360;
      this.panner.coneOuterAngle = 0;
      this.panner.coneOuterGain = 0;
      this.panner.connect(this.gainNode);

      // Appliquer l'état spatial initial
      this.updatePannerPosition();

      this.isInitialized = true;
      console.log('✅ [HOLOPHONIC] Spatial audio engine initialized');
    } catch (error) {
      console.error('❌ [HOLOPHONIC] Failed to initialize:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPATIAL STATE
  // ═══════════════════════════════════════════════════════════════════════════

  public setSpatialState(state: Partial<TitanSpatialState>): void {
    this.spatialState = { ...this.spatialState, ...state };
    this.updatePannerPosition();
    this.notifySubscribers();
  }

  public setPreset(preset: SpatialPreset): void {
    console.log(`🎧 [HOLOPHONIC] Setting preset: ${preset}`);
    this.spatialState = { ...SPATIAL_PRESETS[preset] };
    this.updatePannerPosition();
    this.notifySubscribers();
  }

  public getSpatialState(): TitanSpatialState {
    return { ...this.spatialState };
  }

  private updatePannerPosition(): void {
    if (!this.panner) return;

    const { x, y, z } = this.spatialState;

    // Convertir z (0..1) en distance (1..10)
    const distance = 1 + z * 9;

    // Position 3D
    const posX = x * distance;
    const posY = y * distance;
    const posZ = -distance; // Négatif = devant l'utilisateur

    this.panner.setPosition(posX, posY, posZ);

    // Listener toujours à l'origine, face à -Z
    if (this.audioContext) {
      const listener = this.audioContext.listener;
      if (listener.positionX) {
        listener.positionX.value = 0;
        listener.positionY.value = 0;
        listener.positionZ.value = 0;
        listener.forwardX.value = 0;
        listener.forwardY.value = 0;
        listener.forwardZ.value = -1;
        listener.upX.value = 0;
        listener.upY.value = 1;
        listener.upZ.value = 0;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE PLAYBACK (spatialisation)
  // ═══════════════════════════════════════════════════════════════════════════

  public async playVoice(
    audioBuffer: AudioBuffer,
    options: SpatialOptions = {}
  ): Promise<void> {
    if (!this.audioContext || !this.panner) {
      console.warn('🎧 [HOLOPHONIC] Audio context not initialized');
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    if (options.spatialize !== false) {
      source.connect(this.panner);
    } else if (this.gainNode) {
      source.connect(this.gainNode);
    }

    // Fade in
    if (options.fadeIn && this.gainNode) {
      const now = this.audioContext.currentTime;
      const fadeInDuration = options.fadeIn / 1000;
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(0.7, now + fadeInDuration);
    }

    source.start();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COGNITIVE SOUND CUES
  // ═══════════════════════════════════════════════════════════════════════════

  public playCue(cue: CognitiveSound, options: SpatialOptions = {}): void {
    if (this.soundIntensity === 'off') return;
    if (!this.audioContext || !this.gainNode) return;

    const config = COGNITIVE_SOUNDS[cue];

    // Ajuster le volume selon l'intensité
    let volume = config.volume;
    if (this.soundIntensity === 'minimal') volume *= 0.5;
    if (this.soundIntensity === 'rich') volume *= 1.5;

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = config.waveform;
    oscillator.frequency.value = config.frequency;

    // Envelope ADSR simple
    const now = this.audioContext.currentTime;
    const attack = 0.01;
    const decay = 0.05;
    const sustain = config.duration - attack - decay - 0.05;
    const _release = 0.05;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(volume * 0.7, now + attack + decay);
    gain.gain.setValueAtTime(volume * 0.7, now + attack + decay + sustain);
    gain.gain.linearRampToValueAtTime(0, now + config.duration);

    // Routing
    oscillator.connect(gain);
    if (options.spatialize !== false && this.panner) {
      gain.connect(this.panner);
    } else {
      gain.connect(this.gainNode);
    }

    oscillator.start(now);
    oscillator.stop(now + config.duration);

    console.log(`🎵 [HOLOPHONIC] Playing cue: ${cue} (${config.description})`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  public setSoundIntensity(intensity: 'off' | 'minimal' | 'normal' | 'rich'): void {
    console.log(`🎧 [HOLOPHONIC] Sound intensity: ${intensity}`);
    this.soundIntensity = intensity;
  }

  public setOutputDevice(deviceId?: string): void {
    // Web Audio API ne supporte pas directement la sélection de device
    // Nécessiterait MediaDevices.getUserMedia ou Web Audio API extensions
    console.log(
      `🎧 [HOLOPHONIC] Output device change requested: ${deviceId || 'default'}`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  public subscribe(callback: (state: TitanSpatialState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.spatialState);
      } catch (error) {
        console.error('🎧 [HOLOPHONIC] Error in subscriber:', error);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('▶️ [HOLOPHONIC] Audio context resumed');
    }
  }

  public getContext(): AudioContext | null {
    return this.audioContext;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const holophonicEngine = new HolophonicEngine();
