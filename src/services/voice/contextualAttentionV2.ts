/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — CONTEXTUAL ATTENTION ENGINE v2.0
 *
 *   Système d'attention contextuelle adaptative:
 *   - Seuils dynamiques selon situation
 *   - Détection proximité micro
 *   - Adaptation bruit ambiant
 *   - Priorités contextuelles
 *   - Learning adaptatif environnemental
 * ═══════════════════════════════════════════════════════════════════
 */

import { type AttentionState } from './attentionTypes';

/**
 * Contexte environnemental
 */
export interface EnvironmentContext {
  /** Niveau sonore ambiant (0-1) */
  ambientNoiseLevel: number;

  /** Distance estimée micro (near, medium, far) */
  microphoneDistance: 'near' | 'medium' | 'far' | 'unknown';

  /** Qualité signal audio (0-1) */
  signalQuality: number;

  /** Présence autres voix détectées */
  multipleVoices: boolean;

  /** Timestamp dernière mesure */
  lastMeasured: number;
}

/**
 * Contexte applicatif
 */
export interface ApplicationContext {
  /** Mode actuel application */
  mode: 'focus' | 'normal' | 'background';

  /** Tâche en cours sensible */
  criticalTask: boolean;

  /** Utilisateur actif récemment */
  recentActivity: boolean;

  /** Heure de la journée */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Profil contextuel complet
 */
export interface ContextProfile {
  environment: EnvironmentContext;
  application: ApplicationContext;

  /** Historique activations */
  recentActivations: {
    timestamp: number;
    success: boolean;
    falsePositive: boolean;
  }[];

  /** Timestamp création */
  timestamp: number;
}

/**
 * Configuration adaptative
 */
export interface AdaptiveConfig {
  /** Seuil wake word (0-1) */
  wakeThreshold: number;

  /** Seuil attention (0-1) */
  attentionThreshold: number;

  /** Durée minimale activation (ms) */
  minActivationDuration: number;

  /** Fenêtre écoute active (ms) */
  listeningWindow: number;

  /** Priorité barge-in (0-1) */
  bargeInPriority: number;

  /** Raison adaptation */
  reason: string;
}

/**
 * Règles contextuelles
 */
export interface ContextRule {
  id: string;
  condition: (profile: ContextProfile) => boolean;
  config: Partial<AdaptiveConfig>;
  priority: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   CONTEXTUAL ATTENTION ENGINE v2.0
 * ═══════════════════════════════════════════════════════════════════
 */
class ContextualAttentionEngineV2 {

  private currentContext: ContextProfile;
  private rules: ContextRule[] = [];
  private baseConfig: AdaptiveConfig;
  private adaptedConfig: AdaptiveConfig;

  constructor() {
    // Base configuration (défaut)
    this.baseConfig = {
      wakeThreshold: 0.5,
      attentionThreshold: 0.6,
      minActivationDuration: 300,
      listeningWindow: 5000,
      bargeInPriority: 0.5,
      reason: 'default',
    };

    this.adaptedConfig = { ...this.baseConfig };

    // Context initial
    this.currentContext = this.createDefaultContext();

    // Charger règles prédéfinies
    this.initializeRules();
  }

  // ═══ CONTEXT MANAGEMENT ═══

  /**
   * Créer contexte par défaut
   */
  private createDefaultContext(): ContextProfile {
    return {
      environment: {
        ambientNoiseLevel: 0.3,
        microphoneDistance: 'unknown',
        signalQuality: 0.8,
        multipleVoices: false,
        lastMeasured: Date.now(),
      },
      application: {
        mode: 'normal',
        criticalTask: false,
        recentActivity: true,
        timeOfDay: this.getTimeOfDay(),
      },
      recentActivations: [],
      timestamp: Date.now(),
    };
  }

  /**
   * Déterminer moment de la journée
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Mettre à jour contexte environnemental
   */
  updateEnvironment(update: Partial<EnvironmentContext>): void {
    this.currentContext.environment = {
      ...this.currentContext.environment,
      ...update,
      lastMeasured: Date.now(),
    };

    this.currentContext.timestamp = Date.now();

    // Re-calculer configuration adaptée
    this.recalculateAdaptedConfig();

    console.log('[ContextualAttention] 🌍 Environment updated');
  }

  /**
   * Mettre à jour contexte applicatif
   */
  updateApplication(update: Partial<ApplicationContext>): void {
    this.currentContext.application = {
      ...this.currentContext.application,
      ...update,
    };

    // Refresh timeOfDay
    if (!update.timeOfDay) {
      this.currentContext.application.timeOfDay = this.getTimeOfDay();
    }

    this.currentContext.timestamp = Date.now();

    // Re-calculer configuration adaptée
    this.recalculateAdaptedConfig();

    console.log('[ContextualAttention] 📱 Application context updated');
  }

  /**
   * Analyser audio pour contexte environnemental
   */
  analyzeAudioContext(audioBuffer: Float32Array): void {
    // 1. Niveau sonore ambiant (RMS)
    let rms = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      rms += audioBuffer[i] * audioBuffer[i];
    }
    rms = Math.sqrt(rms / audioBuffer.length);

    // 2. Estimation distance micro (via énergie + qualité signal)
    let distance: 'near' | 'medium' | 'far' = 'medium';
    if (rms > 0.3) distance = 'near';
    else if (rms < 0.1) distance = 'far';

    // 3. Qualité signal (SNR approximatif)
    const signalQuality = Math.min(1, rms * 2);

    // 4. Détection voix multiples (via variance spectrale - simplified)
    const variance = this.calculateSpectralVariance(audioBuffer);
    const multipleVoices = variance > 0.5;

    this.updateEnvironment({
      ambientNoiseLevel: rms,
      microphoneDistance: distance,
      signalQuality,
      multipleVoices,
    });
  }

  /**
   * Calculer variance spectrale (proxy pour voix multiples)
   */
  private calculateSpectralVariance(audio: Float32Array): number {
    const numBands = 8;
    const bandSize = Math.floor(audio.length / numBands);
    const bandEnergies: number[] = [];

    for (let i = 0; i < numBands; i++) {
      const start = i * bandSize;
      const end = Math.min(start + bandSize, audio.length);

      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(audio[j]);
      }

      bandEnergies.push(sum / (end - start));
    }

    // Variance des énergies par bande
    const mean = bandEnergies.reduce((a, b) => a + b, 0) / bandEnergies.length;
    const variance = bandEnergies.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / bandEnergies.length;

    return Math.min(1, variance * 10); // Normalize
  }

  // ═══ ADAPTIVE RULES ═══

  /**
   * Initialiser règles prédéfinies
   */
  private initializeRules(): void {
    this.rules = [

      // Règle 1: Environnement bruyant
      {
        id: 'noisy_environment',
        priority: 10,
        condition: (profile) => profile.environment.ambientNoiseLevel > 0.5,
        config: {
          wakeThreshold: 0.7,          // Plus strict
          attentionThreshold: 0.75,
          minActivationDuration: 500,  // Plus long
          reason: 'noisy_environment',
        },
      },

      // Règle 2: Distance micro far
      {
        id: 'far_microphone',
        priority: 9,
        condition: (profile) => profile.environment.microphoneDistance === 'far',
        config: {
          wakeThreshold: 0.4,          // Plus permissif
          attentionThreshold: 0.5,
          listeningWindow: 7000,       // Plus long
          reason: 'far_microphone',
        },
      },

      // Règle 3: Distance micro near
      {
        id: 'near_microphone',
        priority: 8,
        condition: (profile) => profile.environment.microphoneDistance === 'near',
        config: {
          wakeThreshold: 0.6,
          minActivationDuration: 200,  // Plus court
          reason: 'near_microphone',
        },
      },

      // Règle 4: Voix multiples détectées
      {
        id: 'multiple_voices',
        priority: 11,
        condition: (profile) => profile.environment.multipleVoices,
        config: {
          wakeThreshold: 0.8,          // Très strict
          attentionThreshold: 0.85,
          reason: 'multiple_voices',
        },
      },

      // Règle 5: Tâche critique
      {
        id: 'critical_task',
        priority: 12,
        condition: (profile) => profile.application.criticalTask,
        config: {
          wakeThreshold: 0.9,          // Quasi-désactivé
          bargeInPriority: 0.2,        // Peu prioritaire
          reason: 'critical_task',
        },
      },

      // Règle 6: Mode focus
      {
        id: 'focus_mode',
        priority: 11,
        condition: (profile) => profile.application.mode === 'focus',
        config: {
          wakeThreshold: 0.75,
          bargeInPriority: 0.3,
          reason: 'focus_mode',
        },
      },

      // Règle 7: Mode background
      {
        id: 'background_mode',
        priority: 7,
        condition: (profile) => profile.application.mode === 'background',
        config: {
          wakeThreshold: 0.3,          // Très permissif
          reason: 'background_mode',
        },
      },

      // Règle 8: Nuit (silent mode)
      {
        id: 'night_time',
        priority: 9,
        condition: (profile) => profile.application.timeOfDay === 'night',
        config: {
          wakeThreshold: 0.65,
          attentionThreshold: 0.7,
          reason: 'night_time',
        },
      },

      // Règle 9: Nombreux false positives récents
      {
        id: 'high_false_positives',
        priority: 13,
        condition: (profile) => {
          const recent = profile.recentActivations.slice(-10);
          const falsePositives = recent.filter(a => a.falsePositive).length;
          return falsePositives > 3;
        },
        config: {
          wakeThreshold: 0.8,          // Augmenter seuil
          reason: 'high_false_positives',
        },
      },

      // Règle 10: Signal faible qualité
      {
        id: 'low_signal_quality',
        priority: 10,
        condition: (profile) => profile.environment.signalQuality < 0.5,
        config: {
          wakeThreshold: 0.7,
          attentionThreshold: 0.75,
          reason: 'low_signal_quality',
        },
      },

    ];

    console.log(`[ContextualAttention] 📋 Loaded ${this.rules.length} rules`);
  }

  /**
   * Re-calculer configuration adaptée selon règles
   */
  private recalculateAdaptedConfig(): void {
    // Start with base config
    let config = { ...this.baseConfig };

    // Apply rules in priority order
    const applicableRules = this.rules
      .filter(rule => rule.condition(this.currentContext))
      .sort((a, b) => b.priority - a.priority);

    console.log(`[ContextualAttention] 🎯 Applying ${applicableRules.length} rules`);

    for (const rule of applicableRules) {
      config = {
        ...config,
        ...rule.config,
      };

      console.log(`  → ${rule.id} (priority ${rule.priority})`);
    }

    this.adaptedConfig = config;

    console.log(`[ContextualAttention] ✅ Config: threshold=${config.wakeThreshold.toFixed(2)}, reason="${config.reason}"`);
  }

  // ═══ PUBLIC API ═══

  /**
   * Obtenir configuration adaptée actuelle
   */
  getAdaptedConfig(): AdaptiveConfig {
    return { ...this.adaptedConfig };
  }

  /**
   * Obtenir seuil wake word adapté
   */
  getWakeThreshold(): number {
    return this.adaptedConfig.wakeThreshold;
  }

  /**
   * Obtenir contexte actuel
   */
  getContext(): ContextProfile {
    return { ...this.currentContext };
  }

  /**
   * Enregistrer activation (succès ou false positive)
   */
  recordActivation(success: boolean, falsePositive: boolean = false): void {
    this.currentContext.recentActivations.push({
      timestamp: Date.now(),
      success,
      falsePositive,
    });

    // Keep last 20
    if (this.currentContext.recentActivations.length > 20) {
      this.currentContext.recentActivations.shift();
    }

    // Re-evaluate si needed (false positive rate changed)
    if (falsePositive) {
      this.recalculateAdaptedConfig();
    }
  }

  /**
   * Ajouter règle custom
   */
  addRule(rule: ContextRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);

    this.recalculateAdaptedConfig();

    console.log(`[ContextualAttention] ➕ Added rule: ${rule.id}`);
  }

  /**
   * Retirer règle
   */
  removeRule(id: string): void {
    const index = this.rules.findIndex(r => r.id === id);
    if (index !== -1) {
      this.rules.splice(index, 1);
      this.recalculateAdaptedConfig();
      console.log(`[ContextualAttention] ➖ Removed rule: ${id}`);
    }
  }

  /**
   * Reset base config
   */
  setBaseConfig(config: Partial<AdaptiveConfig>): void {
    this.baseConfig = {
      ...this.baseConfig,
      ...config,
    };

    this.recalculateAdaptedConfig();

    console.log('[ContextualAttention] 🔧 Base config updated');
  }

  /**
   * Export statistics
   */
  getStatistics(): Record<string, unknown> {
    const recent = this.currentContext.recentActivations;
    const successRate = recent.length > 0
      ? recent.filter(a => a.success).length / recent.length
      : 0;
    const falsePositiveRate = recent.length > 0
      ? recent.filter(a => a.falsePositive).length / recent.length
      : 0;

    return {
      context: {
        ambientNoise: this.currentContext.environment.ambientNoiseLevel.toFixed(2),
        micDistance: this.currentContext.environment.microphoneDistance,
        signalQuality: this.currentContext.environment.signalQuality.toFixed(2),
        multipleVoices: this.currentContext.environment.multipleVoices,
        appMode: this.currentContext.application.mode,
        timeOfDay: this.currentContext.application.timeOfDay,
      },
      adaptedConfig: {
        wakeThreshold: this.adaptedConfig.wakeThreshold.toFixed(2),
        reason: this.adaptedConfig.reason,
      },
      performance: {
        totalActivations: recent.length,
        successRate: (successRate * 100).toFixed(1) + '%',
        falsePositiveRate: (falsePositiveRate * 100).toFixed(1) + '%',
      },
      activeRules: this.rules
        .filter(rule => rule.condition(this.currentContext))
        .map(r => r.id),
    };
  }

  /**
   * Reset complet
   */
  reset(): void {
    this.currentContext = this.createDefaultContext();
    this.adaptedConfig = { ...this.baseConfig };
    console.log('[ContextualAttention] 🔄 Reset complete');
  }
}

/**
 * Singleton instance
 */
export const contextualAttentionV2 = new ContextualAttentionEngineV2();

export default contextualAttentionV2;
