/**
 * TITANE∞ v21 — Visual Semantic Grammar
 * Le langage visuel de TITANE∞
 *
 * Ce fichier définit la "grammaire" qui traduit les états internes
 * en phénomènes visuels cohérents, expressifs et signifiants.
 *
 * C'est le CŒUR du système sémiotique de TITANE∞.
 *
 * Architecture:
 * État Interne → Grammaire Sémantique → Phénomènes Visuels
 */

// ═════════════════════════════════════════════════════════════════
// TYPES — ÉTATS INTERNES OS
// ═════════════════════════════════════════════════════════════════

export enum EngineState {
  IDENTITY = 'identity', // Moteur #1 - Identité
  ALIGNMENT = 'alignment', // Moteur #2 - Alignement
  CORRECTION = 'correction', // Moteur #3 - Correction
  META_REVIEW = 'meta_review', // Moteur #4 - Méta-révision
  SELF_HEALING = 'self_healing', // Moteur #5 - Auto-réparation
  PERFORMANCE = 'performance', // Moteur #6 - Performance
  EVOLUTION = 'evolution', // Moteur #7 - Évolution
  BEHAVIOR = 'behavior', // Moteur #8 - Comportement
  AUDIT = 'audit', // Moteur #9 - Audit/Exécution
}

export enum OmegaPipelineStage {
  STAGE_0 = 'omega_0_idle', // Idle
  STAGE_1 = 'omega_1_reception', // Réception
  STAGE_2 = 'omega_2_analysis', // Analyse
  STAGE_3 = 'omega_3_context', // Contextualisation
  STAGE_4 = 'omega_4_reasoning', // Raisonnement
  STAGE_5 = 'omega_5_synthesis', // Synthèse
  STAGE_6 = 'omega_6_validation', // Validation
  STAGE_7 = 'omega_7_formatting', // Formatage
  STAGE_8 = 'omega_8_delivery', // Livraison
  STAGE_9 = 'omega_9_learning', // Apprentissage
  STAGE_10 = 'omega_10_integration', // Intégration
}

export enum MemoryState {
  STM_ACTIVE = 'stm_active', // Mémoire court terme active
  MTM_CONSOLIDATING = 'mtm_consolidating', // Mémoire moyen terme en consolidation
  LTM_RETRIEVING = 'ltm_retrieving', // Mémoire long terme en récupération
  LTM_SATURATED = 'ltm_saturated', // Mémoire long terme saturée
}

// ═════════════════════════════════════════════════════════════════
// TYPES — PHÉNOMÈNES VISUELS
// ═════════════════════════════════════════════════════════════════

export interface VisualPhenomenon {
  id: string;
  type: PhenomenonType;
  intensity: number; // 0-1
  duration?: number; // ms, undefined = permanent
  priority: number; // 0-10, higher = more important
  semanticMeaning: string; // Human-readable description
  config: PhenomenonConfig;
}

export enum PhenomenonType {
  // Orbital
  ORBITAL_RING_ACTIVATION = 'orbital_ring_activation',
  ORBITAL_RING_PERTURBATION = 'orbital_ring_perturbation',
  ORBITAL_SPEED_CHANGE = 'orbital_speed_change',
  ORBITAL_SECONDARY_RING = 'orbital_secondary_ring',

  // Particles
  PARTICLE_BURST = 'particle_burst',
  PARTICLE_SPIRAL = 'particle_spiral',
  PARTICLE_DENSITY_SHIFT = 'particle_density_shift',
  PARTICLE_COLOR_SHIFT = 'particle_color_shift',
  PARTICLE_SPEED_CHANGE = 'particle_speed_change',

  // Glow & Aura
  GLOW_PULSE = 'glow_pulse',
  GLOW_INTENSITY_SHIFT = 'glow_intensity_shift',
  AURA_EXPANSION = 'aura_expansion',
  AURA_CONTRACTION = 'aura_contraction',
  AURA_COLOR_MORPH = 'aura_color_morph',

  // Effects
  ENERGY_ARCS = 'energy_arcs',
  HEALING_WAVES = 'healing_waves',
  GLITCH_EFFECT = 'glitch_effect',
  AUDIO_WAVEFORM = 'audio_waveform',

  // Core
  CORE_PULSE = 'core_pulse',
  CORE_BREATH = 'core_breath',
  CORE_SIGNATURE = 'core_signature',

  // Transitions
  PHASE_TRANSITION = 'phase_transition',
  SMOOTH_MORPH = 'smooth_morph',
}

export interface PhenomenonConfig {
  // Orbital
  orbitalSpeed?: number;
  orbitalRadius?: number;
  ringCount?: number;
  ringOpacity?: number;

  // Particles
  particleDensity?: number;
  particleSpeed?: number;
  particleColor?: string;
  particleSize?: number;

  // Glow
  glowIntensity?: number;
  glowColor?: string;
  glowRadius?: number;
  pulseFrequency?: number;

  // Aura
  auraSize?: number;
  auraColor?: string;
  auraOpacity?: number;

  // Colors
  colors?: string[];

  // Effects
  arcCount?: number;
  arcIntensity?: number;
  waveCount?: number;
  waveSpeed?: number;
  glitchIntensity?: number;

  // Animations
  easingFunction?: string;
  delay?: number;
}

// ═════════════════════════════════════════════════════════════════
// GRAMMAIRE — RÈGLES SÉMANTIQUES
// ═════════════════════════════════════════════════════════════════

/**
 * Grammaire Sémantique Principale
 * Traduit les états internes en phénomènes visuels
 */
export class VisualSemanticGrammar {
  // ─────────────────────────────────────────────────────────────
  // MOTEURS → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traduit l'état d'un moteur en phénomènes visuels
   */
  static translateEngineState(
    engine: EngineState,
    intensity: number,
    metadata?: Record<string, unknown>
  ): VisualPhenomenon[] {
    const phenomena: VisualPhenomenon[] = [];

    switch (engine) {
      case EngineState.IDENTITY:
        // Identité → Signature lumineuse unique, pulsation distinctive
        phenomena.push({
          id: `identity_signature_${Date.now()}`,
          type: PhenomenonType.CORE_SIGNATURE,
          intensity,
          priority: 9,
          semanticMeaning: 'Signature visuelle identitaire de TITANE∞',
          config: {
            pulseFrequency: 0.8 + intensity * 0.4, // 0.8-1.2 Hz
            glowColor: '#4FB5FF', // Bleu signature TITANE
            glowIntensity: 0.6 + intensity * 0.4,
          },
        });
        break;

      case EngineState.ALIGNMENT:
        // Alignement → Cohérence orbitale, stabilité des anneaux
        phenomena.push({
          id: `alignment_orbital_${Date.now()}`,
          type: PhenomenonType.ORBITAL_RING_ACTIVATION,
          intensity,
          priority: 8,
          semanticMeaning: 'Anneaux orbitaux représentant la cohérence systémique',
          config: {
            orbitalSpeed: 1.0 * intensity,
            ringOpacity: 0.4 + intensity * 0.4,
            ringCount: Math.floor(2 + intensity * 2), // 2-4 anneaux
          },
        });

        if (intensity < 0.5) {
          // Alignement faible → Perturbation orbitale
          phenomena.push({
            id: `alignment_perturbation_${Date.now()}`,
            type: PhenomenonType.ORBITAL_RING_PERTURBATION,
            intensity: 1 - intensity,
            priority: 7,
            semanticMeaning: "Perturbation orbitale indiquant perte d'alignement",
            config: {
              glitchIntensity: 0.2 * (1 - intensity),
            },
          });
        }
        break;

      case EngineState.CORRECTION:
        // Correction → Arcs énergétiques, réparation visuelle
        phenomena.push({
          id: `correction_arcs_${Date.now()}`,
          type: PhenomenonType.ENERGY_ARCS,
          intensity,
          priority: 7,
          semanticMeaning: 'Arcs énergétiques de correction active',
          config: {
            arcCount: Math.floor(2 + intensity * 4), // 2-6 arcs
            arcIntensity: 0.5 + intensity * 0.5,
          },
        });
        break;

      case EngineState.SELF_HEALING:
        // Auto-réparation → Vagues de guérison, lissage
        phenomena.push({
          id: `healing_waves_${Date.now()}`,
          type: PhenomenonType.HEALING_WAVES,
          intensity,
          duration: 2000,
          priority: 8,
          semanticMeaning: 'Vagues de guérison auto-réparatrices',
          config: {
            waveCount: Math.floor(3 + intensity * 3), // 3-6 vagues
            waveSpeed: 0.8 + intensity * 0.4,
            glowColor: '#00FF88', // Vert guérison
          },
        });
        break;

      case EngineState.PERFORMANCE:
        // Performance → Densité particules adaptative
        phenomena.push({
          id: `performance_particles_${Date.now()}`,
          type: PhenomenonType.PARTICLE_DENSITY_SHIFT,
          intensity,
          priority: 6,
          semanticMeaning: 'Densité particules adaptée à la charge système',
          config: {
            particleDensity: Math.max(0.3, 1.0 - intensity * 0.5), // Plus de charge = moins de particules
          },
        });
        break;

      case EngineState.EVOLUTION:
        // Évolution → Transition de phase, changement de couleur
        phenomena.push({
          id: `evolution_phase_${Date.now()}`,
          type: PhenomenonType.PHASE_TRANSITION,
          intensity,
          duration: 3000,
          priority: 9,
          semanticMeaning: 'Transition de phase évolutive',
          config: {
            auraSize: 1.0 + intensity * 0.3,
            easingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
          },
        });

        phenomena.push({
          id: `evolution_spiral_${Date.now()}`,
          type: PhenomenonType.PARTICLE_SPIRAL,
          intensity,
          duration: 2000,
          priority: 7,
          semanticMeaning: 'Spirale particules indiquant évolution',
          config: {
            particleSpeed: 1.2 + intensity * 0.8,
          },
        });
        break;

      case EngineState.BEHAVIOR:
        // Comportement → Modulation émotionnelle des couleurs
        phenomena.push({
          id: `behavior_color_${Date.now()}`,
          type: PhenomenonType.AURA_COLOR_MORPH,
          intensity,
          priority: 6,
          semanticMeaning: 'Modulation couleur selon comportement',
          config: {
            auraColor: (metadata?.emotionalColor as string) || '#4FB5FF',
            easingFunction: 'ease-in-out',
          },
        });
        break;

      case EngineState.AUDIT:
        // Audit → Pulsation de validation
        phenomena.push({
          id: `audit_pulse_${Date.now()}`,
          type: PhenomenonType.CORE_PULSE,
          intensity,
          duration: 1000,
          priority: 5,
          semanticMeaning: 'Pulsation de validation audit',
          config: {
            pulseFrequency: 2.0, // Rapide
            glowIntensity: 0.7,
          },
        });
        break;
    }

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // PIPELINE OMEGA → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traduit l'étape du pipeline OMEGA en phénomènes visuels
   */
  static translateOmegaStage(
    stage: OmegaPipelineStage,
    progress: number
  ): VisualPhenomenon[] {
    const phenomena: VisualPhenomenon[] = [];

    switch (stage) {
      case OmegaPipelineStage.STAGE_0:
        // Idle → Respiration lente
        phenomena.push({
          id: `omega_idle_${Date.now()}`,
          type: PhenomenonType.CORE_BREATH,
          intensity: 0.3,
          priority: 3,
          semanticMeaning: 'Respiration au repos',
          config: {
            pulseFrequency: 0.5, // Très lent
            glowIntensity: 0.3,
          },
        });
        break;

      case OmegaPipelineStage.STAGE_1:
        // Réception → Burst particules initial
        phenomena.push({
          id: `omega_reception_${Date.now()}`,
          type: PhenomenonType.PARTICLE_BURST,
          intensity: 0.8,
          duration: 500,
          priority: 7,
          semanticMeaning: 'Burst initial de réception',
          config: {
            particleDensity: 1.5,
            particleSpeed: 2.0,
          },
        });
        break;

      case OmegaPipelineStage.STAGE_2:
      case OmegaPipelineStage.STAGE_3:
      case OmegaPipelineStage.STAGE_4:
        // Processing → Arcs énergétiques soutenus
        phenomena.push({
          id: `omega_processing_${Date.now()}`,
          type: PhenomenonType.ENERGY_ARCS,
          intensity: 0.6 + progress * 0.3,
          priority: 6,
          semanticMeaning: 'Traitement cognitif en cours',
          config: {
            arcCount: 3,
            arcIntensity: 0.6,
          },
        });

        phenomena.push({
          id: `omega_orbital_${Date.now()}`,
          type: PhenomenonType.ORBITAL_SPEED_CHANGE,
          intensity: 0.8,
          priority: 5,
          semanticMeaning: 'Vitesse orbitale augmentée (traitement actif)',
          config: {
            orbitalSpeed: 1.5,
          },
        });
        break;

      case OmegaPipelineStage.STAGE_8:
        // Livraison → Micro arcs électriques
        phenomena.push({
          id: `omega_delivery_${Date.now()}`,
          type: PhenomenonType.ENERGY_ARCS,
          intensity: 0.9,
          duration: 400,
          priority: 8,
          semanticMeaning: 'Livraison de la réponse',
          config: {
            arcCount: 6,
            arcIntensity: 0.8,
            particleColor: '#FFD700', // Or
          },
        });
        break;

      case OmegaPipelineStage.STAGE_9:
      case OmegaPipelineStage.STAGE_10:
        // Apprentissage/Intégration → Vagues de consolidation
        phenomena.push({
          id: `omega_learning_${Date.now()}`,
          type: PhenomenonType.HEALING_WAVES,
          intensity: 0.6,
          duration: 1500,
          priority: 6,
          semanticMeaning: 'Consolidation apprentissage',
          config: {
            waveCount: 4,
            waveSpeed: 0.6,
            glowColor: '#9D4EDD', // Violet
          },
        });
        break;
    }

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // MÉMOIRE → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traduit l'état mémoire en phénomènes visuels
   */
  static translateMemoryState(
    memoryState: MemoryState,
    intensity: number
  ): VisualPhenomenon[] {
    const phenomena: VisualPhenomenon[] = [];

    switch (memoryState) {
      case MemoryState.STM_ACTIVE:
        // Mémoire court terme → Particules rapides
        phenomena.push({
          id: `memory_stm_${Date.now()}`,
          type: PhenomenonType.PARTICLE_SPEED_CHANGE,
          intensity,
          priority: 5,
          semanticMeaning: 'Activité mémoire court terme',
          config: {
            particleSpeed: 1.5 + intensity * 0.5,
          },
        });
        break;

      case MemoryState.MTM_CONSOLIDATING:
        // Consolidation → Vagues lentes
        phenomena.push({
          id: `memory_mtm_${Date.now()}`,
          type: PhenomenonType.HEALING_WAVES,
          intensity,
          duration: 2000,
          priority: 6,
          semanticMeaning: 'Consolidation mémoire moyen terme',
          config: {
            waveCount: 3,
            waveSpeed: 0.5,
            glowColor: '#4FB5FF',
          },
        });
        break;

      case MemoryState.LTM_RETRIEVING:
        // Récupération → Pulsation profonde
        phenomena.push({
          id: `memory_ltm_retrieve_${Date.now()}`,
          type: PhenomenonType.CORE_PULSE,
          intensity,
          priority: 7,
          semanticMeaning: 'Récupération mémoire long terme',
          config: {
            pulseFrequency: 0.8,
            glowIntensity: 0.7,
            glowColor: '#9D4EDD',
          },
        });
        break;

      case MemoryState.LTM_SATURATED:
        // Saturation → Respiration lumineuse lente
        phenomena.push({
          id: `memory_ltm_saturated_${Date.now()}`,
          type: PhenomenonType.CORE_BREATH,
          intensity,
          priority: 8,
          semanticMeaning: 'Saturation mémoire long terme',
          config: {
            pulseFrequency: 0.4, // Très lent
            glowIntensity: 0.9,
            glowColor: '#FF6B6B', // Rouge alerte
          },
        });
        break;
    }

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // ÉVÉNEMENTS → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traduit un événement système en phénomènes visuels
   */
  static translateSystemEvent(
    event: string,
    _metadata?: Record<string, unknown>
  ): VisualPhenomenon[] {
    const phenomena: VisualPhenomenon[] = [];

    switch (event) {
      case 'processing_start':
        phenomena.push({
          id: `event_start_${Date.now()}`,
          type: PhenomenonType.PARTICLE_BURST,
          intensity: 0.9,
          duration: 600,
          priority: 8,
          semanticMeaning: 'Démarrage traitement',
          config: { particleDensity: 2.0, particleSpeed: 2.5 },
        });
        break;

      case 'error_detected':
        phenomena.push({
          id: `event_error_${Date.now()}`,
          type: PhenomenonType.GLITCH_EFFECT,
          intensity: 0.8,
          duration: 300,
          priority: 9,
          semanticMeaning: 'Erreur détectée',
          config: { glitchIntensity: 0.7 },
        });
        break;

      case 'error_resolved':
        phenomena.push({
          id: `event_resolved_${Date.now()}`,
          type: PhenomenonType.HEALING_WAVES,
          intensity: 0.9,
          duration: 1500,
          priority: 8,
          semanticMeaning: 'Erreur résolue',
          config: { waveCount: 5, glowColor: '#00FF88' },
        });
        break;

      case 'voice_started':
        phenomena.push({
          id: `event_voice_start_${Date.now()}`,
          type: PhenomenonType.AUDIO_WAVEFORM,
          intensity: 1.0,
          priority: 9,
          semanticMeaning: 'Voix activée',
          config: { auraSize: 1.3 },
        });
        break;

      case 'voice_ended':
        phenomena.push({
          id: `event_voice_end_${Date.now()}`,
          type: PhenomenonType.AURA_CONTRACTION,
          intensity: 0.8,
          duration: 800,
          priority: 7,
          semanticMeaning: 'Voix désactivée',
          config: { auraSize: 1.0 },
        });
        break;

      case 'alignment_loss':
        phenomena.push({
          id: `event_alignment_loss_${Date.now()}`,
          type: PhenomenonType.ORBITAL_RING_PERTURBATION,
          intensity: 0.6,
          duration: 1000,
          priority: 7,
          semanticMeaning: "Perte d'alignement",
          config: { glitchIntensity: 0.4 },
        });
        break;

      case 'alignment_restored':
        phenomena.push({
          id: `event_alignment_restored_${Date.now()}`,
          type: PhenomenonType.ORBITAL_RING_ACTIVATION,
          intensity: 0.9,
          duration: 1200,
          priority: 8,
          semanticMeaning: 'Alignement restauré',
          config: { ringOpacity: 0.8, orbitalSpeed: 1.2 },
        });
        break;
    }

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // SIGNATURE VISUELLE TITANE∞
  // ─────────────────────────────────────────────────────────────

  /**
   * Génère la signature visuelle unique de TITANE∞
   * Cette signature est toujours présente, c'est l'identité visuelle
   */
  static getSignaturePhenomenon(): VisualPhenomenon {
    return {
      id: 'titane_signature_permanent',
      type: PhenomenonType.CORE_SIGNATURE,
      intensity: 1.0,
      priority: 10,
      semanticMeaning: 'Signature visuelle permanente TITANE∞',
      config: {
        pulseFrequency: 1.0, // 1 Hz - rythme cardiaque
        glowColor: '#4FB5FF',
        glowIntensity: 0.7,
        orbitalSpeed: 1.0,
        particleDensity: 0.8,
        auraSize: 1.0,
      },
    };
  }
}

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

export default VisualSemanticGrammar;
