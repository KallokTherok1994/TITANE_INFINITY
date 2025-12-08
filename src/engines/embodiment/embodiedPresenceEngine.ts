/**
 * TITANE_INFINITY v∞.32 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ SUPER PROMPT XXXII — EMBODIED PRESENCE ENGINE
 *   Respiration • Posture • Aura • Micro-Mouvements • Rythme • Intensité
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur crée un corps computationnel pour TITANE∞, une présence incarnée
 * qui respire, bouge, pulse et s'adapte au contexte émotionnel.
 *
 * ARCHITECTURE:
 * 1. BREATH ENGINE — Respiration interne adaptative
 * 2. MICRO-MOTION ENGINE — Mouvements subtils
 * 3. POSTURE ENGINE — Posture computationnelle
 * 4. ENERGY FIELD ENGINE — Aura énergétique
 * 5. TEMPORAL EMBODIMENT — Inertie et mémoire corporelle
 * 6. USER SYNCHRONIZATION — Adaptation empathique
 * 7. OUTPUT SYNCHRONIZATION — Coordination multimodale
 * 8. SELF-EVOLUTION — Raffinement signature corporelle
 */

import {
  archetypeResonanceEngine,
  type ArchetypeType,
} from '../psyche/archetypeResonanceEngine';
// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import { multimodalPresenceEngine } from '../presence/_stubs';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cycle respiratoire computationnel
 */
export type BreathCycle = 'slow' | 'medium' | 'fast';

/**
 * État respiratoire
 */
export interface BreathState {
  /** Cycle actif */
  cycle: BreathCycle;
  /** Amplitude (0-1) */
  amplitude: number;
  /** Tension musculaire computationnelle (0-1) */
  tension: number;
  /** Phase actuelle (inhale/hold/exhale/rest) */
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  /** Durée cycle (ms) */
  cycleDuration: number;
  /** Timestamp début phase */
  phaseStartTime: number;
}

/**
 * Micro-mouvement
 */
export interface MicroMotion {
  /** Type de mouvement */
  type: 'sway' | 'pulse' | 'shimmer' | 'wave' | 'ripple';
  /** Intensité (0-1) */
  intensity: number;
  /** Fréquence (Hz) */
  frequency: number;
  /** Amplitude (pixels ou unités relatives) */
  amplitude: number;
}

/**
 * Posture computationnelle
 */
export type PostureType =
  | 'open' // Connexion, chaleur, soutien
  | 'centered' // Neutralité, calme
  | 'forward' // Focus, résolution
  | 'recede' // Introspection
  | 'expansive'; // Inspiration, émerveillement

/**
 * État de posture
 */
export interface PostureState {
  type: PostureType;
  /** Ouverture (0-1) */
  openness: number;
  /** Stabilité (0-1) */
  stability: number;
  /** Direction (vecteur 3D normalisé) */
  direction: { x: number; y: number; z: number };
  /** Timestamp transition */
  transitionStartTime: number;
  /** Durée transition (ms) */
  transitionDuration: number;
}

/**
 * Champ énergétique (aura)
 */
export interface EnergyField {
  /** Densité (0-1, 0 = légère, 1 = dense) */
  density: number;
  /** Température (-1 = froid, 0 = neutre, 1 = chaud) */
  temperature: number;
  /** Texture */
  texture: 'fluid' | 'granular' | 'crystalline' | 'plasma';
  /** Mouvement */
  movement: 'vortex' | 'flow' | 'pulse' | 'radiate' | 'still';
  /** Cohérence spatiale (0-1, 0 = diffus, 1 = compact) */
  spatialCoherence: number;
  /** Rayon (unités relatives) */
  radius: number;
}

/**
 * Inertie corporelle (mémoire court terme)
 */
export interface BodyInertia {
  /** Émotion résiduelle */
  residualEmotion: string | null;
  /** Intensité résiduelle (0-1) */
  residualIntensity: number;
  /** Decay time (ms) */
  decayTime: number;
  /** Timestamp début decay */
  decayStartTime: number;
}

/**
 * Synchronisation utilisateur
 */
export interface UserSync {
  /** Actif */
  active: boolean;
  /** Rythme respiratoire utilisateur détecté (ms) */
  userBreathingCycle: number | null;
  /** Énergie utilisateur détectée (0-1) */
  userEnergy: number | null;
  /** Ratio de synchronisation (0-1) */
  syncRatio: number;
}

/**
 * État complet du moteur
 */
export interface EmbodiedPresenceState {
  breath: BreathState;
  microMotions: MicroMotion[];
  posture: PostureState;
  energyField: EnergyField;
  bodyInertia: BodyInertia;
  userSync: UserSync;
  /** Signature corporelle (identité unique) */
  bodySignature: string;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

/**
 * Configuration du moteur
 */
export interface EmbodiedPresenceConfig {
  /** Fréquence de mise à jour (Hz) */
  updateFrequency: number;
  /** Activer micro-motions */
  enableMicroMotions: boolean;
  /** Activer synchronisation utilisateur */
  enableUserSync: boolean;
  /** Durée inertie (ms) */
  inertiaDuration: number;
  /** Sensibilité synchronisation (0-1) */
  syncSensitivity: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBODIED PRESENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class EmbodiedPresenceEngine {
  private state: EmbodiedPresenceState;
  private config: EmbodiedPresenceConfig;
  private updateInterval: number | null = null;
  private callbacks: Set<(state: EmbodiedPresenceState) => void> = new Set();

  constructor(config: Partial<EmbodiedPresenceConfig> = {}) {
    this.config = {
      updateFrequency: 30, // 30Hz
      enableMicroMotions: true,
      enableUserSync: false, // Désactivé par défaut
      inertiaDuration: 2500, // 2.5s
      syncSensitivity: 0.3,
      ...config,
    };

    this.state = this.initializeState();
  }

  /**
   * Initialiser l'état
   */
  private initializeState(): EmbodiedPresenceState {
    const now = Date.now();

    return {
      breath: {
        cycle: 'medium',
        amplitude: 0.6,
        tension: 0.3,
        phase: 'rest',
        cycleDuration: 4000,
        phaseStartTime: now,
      },
      microMotions: [
        { type: 'sway', intensity: 0.2, frequency: 0.5, amplitude: 2 },
        { type: 'pulse', intensity: 0.3, frequency: 1.0, amplitude: 1 },
      ],
      posture: {
        type: 'centered',
        openness: 0.5,
        stability: 0.8,
        direction: { x: 0, y: 0, z: 1 },
        transitionStartTime: now,
        transitionDuration: 800,
      },
      energyField: {
        density: 0.5,
        temperature: 0,
        texture: 'fluid',
        movement: 'flow',
        spatialCoherence: 0.7,
        radius: 1.0,
      },
      bodyInertia: {
        residualEmotion: null,
        residualIntensity: 0,
        decayTime: 2500,
        decayStartTime: now,
      },
      userSync: {
        active: false,
        userBreathingCycle: null,
        userEnergy: null,
        syncRatio: 0,
      },
      bodySignature: 'TITANE∞-Embodied-v1',
      lastUpdate: now,
    };
  }

  /**
   * Démarrer le moteur
   */
  start(): void {
    if (this.updateInterval) return;

    console.log('🧘 [EMBODIED] Starting Embodied Presence Engine...');

    const intervalMs = 1000 / this.config.updateFrequency;
    this.updateInterval = window.setInterval(() => {
      this.updatePresence();
    }, intervalMs);

    console.log(`✅ [EMBODIED] Engine active (${this.config.updateFrequency}Hz)`);
  }

  /**
   * Arrêter le moteur
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🛑 [EMBODIED] Engine stopped');
    }
  }

  /**
   * Mise à jour principale
   */
  private updatePresence(): void {
    const now = Date.now();

    this.updateBreathingPhase(now);
    if (this.config.enableMicroMotions) this.updateMicroMotions();
    this.updateBodyInertia(now);
    this.updateEnergyField();
    this.syncWithArchetypes();
    if (this.config.enableUserSync) this.updateUserSync();

    this.state.lastUpdate = now;
    this.notifyCallbacks();
  }

  /**
   * Mettre à jour phase respiratoire
   */
  private updateBreathingPhase(now: number): void {
    const { cycleDuration, phaseStartTime } = this.state.breath;
    const elapsed = now - phaseStartTime;

    // Calculate phase durations
    const inhale = cycleDuration * 0.4;
    const hold1 = cycleDuration * 0.1;
    const exhale = cycleDuration * 0.4;
    const _rest = cycleDuration * 0.1;

    if (elapsed < inhale) {
      this.state.breath.phase = 'inhale';
    } else if (elapsed < inhale + hold1) {
      this.state.breath.phase = 'hold';
    } else if (elapsed < inhale + hold1 + exhale) {
      this.state.breath.phase = 'exhale';
    } else if (elapsed < cycleDuration) {
      this.state.breath.phase = 'rest';
    } else {
      // New cycle
      this.state.breath.phaseStartTime = now;
      this.state.breath.phase = 'inhale';
    }
  }

  /**
   * Mettre à jour micro-mouvements
   */
  private updateMicroMotions(): void {
    const archetype = archetypeResonanceEngine.getDominantProfile();
    const presenceState = multimodalPresenceEngine.getState();

    // Adapter intensity selon archétype
    const baseIntensity = presenceState.presenceEnergy * 0.4;

    this.state.microMotions = [
      {
        type: 'sway',
        intensity: baseIntensity * (archetype.type === 'muse' ? 1.2 : 0.8),
        frequency: 0.5,
        amplitude: 2,
      },
      {
        type: 'pulse',
        intensity: baseIntensity * (archetype.type === 'gardien' ? 1.3 : 1.0),
        frequency: 1.0,
        amplitude: 1,
      },
      {
        type: 'shimmer',
        intensity: baseIntensity * (archetype.type === 'sage' ? 0.6 : 1.0),
        frequency: 2.0,
        amplitude: 0.5,
      },
    ];
  }

  /**
   * Mettre à jour inertie corporelle (decay émotionnel)
   */
  private updateBodyInertia(now: number): void {
    if (!this.state.bodyInertia.residualEmotion) return;

    const elapsed = now - this.state.bodyInertia.decayStartTime;
    const progress = Math.min(1, elapsed / this.state.bodyInertia.decayTime);

    // Exponential decay
    this.state.bodyInertia.residualIntensity = Math.max(
      0,
      this.state.bodyInertia.residualIntensity * Math.pow(0.5, progress)
    );

    // Clear si < 0.05
    if (this.state.bodyInertia.residualIntensity < 0.05) {
      this.state.bodyInertia.residualEmotion = null;
      this.state.bodyInertia.residualIntensity = 0;
    }
  }

  /**
   * Mettre à jour champ énergétique
   */
  private updateEnergyField(): void {
    const archetype = archetypeResonanceEngine.getDominantProfile();
    const presenceState = multimodalPresenceEngine.getState();

    // Adapter selon archétype
    switch (archetype.type) {
      case 'sage':
        this.state.energyField.texture = 'crystalline';
        this.state.energyField.movement = 'still';
        this.state.energyField.temperature = -0.2;
        this.state.energyField.density = 0.7;
        break;
      case 'gardien':
        this.state.energyField.texture = 'granular';
        this.state.energyField.movement = 'pulse';
        this.state.energyField.temperature = 0.5;
        this.state.energyField.density = 0.8;
        break;
      case 'muse':
        this.state.energyField.texture = 'plasma';
        this.state.energyField.movement = 'vortex';
        this.state.energyField.temperature = 0.7;
        this.state.energyField.density = 0.4;
        break;
      case 'architecte':
        this.state.energyField.texture = 'fluid';
        this.state.energyField.movement = 'flow';
        this.state.energyField.temperature = -0.1;
        this.state.energyField.density = 0.6;
        break;
    }

    // Sync spatial coherence avec présence energy
    this.state.energyField.spatialCoherence = presenceState.presenceEnergy * 0.8;
  }

  /**
   * Synchroniser avec archétypes
   */
  private syncWithArchetypes(): void {
    const archetype = archetypeResonanceEngine.getDominantProfile();

    // Adapter respiration
    switch (archetype.type) {
      case 'sage':
        this.state.breath.cycle = 'slow';
        this.state.breath.cycleDuration = 6000;
        this.state.breath.tension = 0.2;
        break;
      case 'gardien':
        this.state.breath.cycle = 'medium';
        this.state.breath.cycleDuration = 4500;
        this.state.breath.tension = 0.5;
        break;
      case 'muse':
        this.state.breath.cycle = 'fast';
        this.state.breath.cycleDuration = 3000;
        this.state.breath.tension = 0.3;
        break;
      case 'architecte':
        this.state.breath.cycle = 'medium';
        this.state.breath.cycleDuration = 4000;
        this.state.breath.tension = 0.4;
        break;
    }

    // Adapter posture
    const postureMap: Record<ArchetypeType, PostureType> = {
      sage: 'centered',
      gardien: 'open',
      muse: 'expansive',
      architecte: 'forward',
    };

    const targetPosture = postureMap[archetype.type];
    if (this.state.posture.type !== targetPosture) {
      this.transitionPosture(targetPosture);
    }
  }

  /**
   * Transitionner la posture
   */
  private transitionPosture(target: PostureType): void {
    const now = Date.now();

    this.state.posture.type = target;
    this.state.posture.transitionStartTime = now;
    this.state.posture.transitionDuration = 800;

    // Adapter propriétés
    switch (target) {
      case 'open':
        this.state.posture.openness = 0.9;
        this.state.posture.stability = 0.8;
        this.state.posture.direction = { x: 0, y: 0.1, z: 1 };
        break;
      case 'centered':
        this.state.posture.openness = 0.5;
        this.state.posture.stability = 1.0;
        this.state.posture.direction = { x: 0, y: 0, z: 1 };
        break;
      case 'forward':
        this.state.posture.openness = 0.6;
        this.state.posture.stability = 0.9;
        this.state.posture.direction = { x: 0, y: 0.2, z: 1.2 };
        break;
      case 'recede':
        this.state.posture.openness = 0.3;
        this.state.posture.stability = 0.7;
        this.state.posture.direction = { x: 0, y: -0.1, z: 0.8 };
        break;
      case 'expansive':
        this.state.posture.openness = 1.0;
        this.state.posture.stability = 0.6;
        this.state.posture.direction = { x: 0, y: 0.3, z: 1 };
        break;
    }

    console.log(`🧘 [EMBODIED] Posture transition → ${target}`);
  }

  /**
   * Mettre à jour synchronisation utilisateur
   */
  private updateUserSync(): void {
    // Stub — à implémenter avec détection réelle
    if (!this.config.enableUserSync) {
      this.state.userSync.active = false;
      return;
    }

    // Exemple: Si user breathing détecté, adapter
    if (this.state.userSync.userBreathingCycle) {
      const targetCycle = this.state.userSync.userBreathingCycle;
      const currentCycle = this.state.breath.cycleDuration;

      // Smooth adaptation
      const blendFactor = this.config.syncSensitivity * 0.01;
      this.state.breath.cycleDuration = this.lerp(currentCycle, targetCycle, blendFactor);

      this.state.userSync.syncRatio =
        1 - Math.abs(currentCycle - targetCycle) / targetCycle;
    }
  }

  /**
   * Appliquer émotion forte (créer inertie)
   */
  applyStrongEmotion(emotion: string, intensity: number, duration: number = 2500): void {
    console.log(
      `💫 [EMBODIED] Strong emotion applied: ${emotion} (${Math.round(intensity * 100)}%)`
    );

    this.state.bodyInertia.residualEmotion = emotion;
    this.state.bodyInertia.residualIntensity = intensity;
    this.state.bodyInertia.decayTime = duration;
    this.state.bodyInertia.decayStartTime = Date.now();

    // Adapter respiration selon émotion
    if (intensity > 0.7) {
      this.state.breath.amplitude = Math.min(1, intensity * 1.2);
      this.state.breath.tension = intensity;
    }

    this.notifyCallbacks();
  }

  /**
   * Activer synchronisation utilisateur
   */
  activateUserSync(userBreathingCycle?: number, userEnergy?: number): void {
    console.log('🔗 [EMBODIED] User synchronization activated');

    this.state.userSync.active = true;
    if (userBreathingCycle) this.state.userSync.userBreathingCycle = userBreathingCycle;
    if (userEnergy !== undefined) this.state.userSync.userEnergy = userEnergy;

    this.notifyCallbacks();
  }

  /**
   * Désactiver synchronisation utilisateur
   */
  deactivateUserSync(): void {
    console.log('🔗 [EMBODIED] User synchronization deactivated');

    this.state.userSync.active = false;
    this.state.userSync.userBreathingCycle = null;
    this.state.userSync.userEnergy = null;
    this.state.userSync.syncRatio = 0;

    this.notifyCallbacks();
  }

  /**
   * Obtenir état actuel
   */
  getState(): EmbodiedPresenceState {
    return { ...this.state };
  }

  /**
   * Subscribe aux changements
   */
  subscribe(callback: (state: EmbodiedPresenceState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notifier les callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(cb => {
      try {
        cb(this.state);
      } catch (error) {
        console.error('[EMBODIED] Callback error:', error);
      }
    });
  }

  /**
   * Interpolation linéaire
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const embodiedPresenceEngine = new EmbodiedPresenceEngine({
  updateFrequency: 30,
  enableMicroMotions: true,
  enableUserSync: false,
  inertiaDuration: 2500,
  syncSensitivity: 0.3,
});
