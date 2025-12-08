/**
 * TITANE_INFINITY v∞.36 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ UNIFIED IDENTITY KERNEL v∞.XVI (Ω)
 *   Le cœur absolu · Identité vivante · Cohérence totale · Unification
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le Unified Identity Kernel (UIK) est le centre de gravité cognitif de TITANE∞.
 * Il unifie toutes les couches, maintient la cohérence interne, orchestre
 * l'attention/émotions/ton/posture, stabilise l'identité dans le temps.
 */

// REMOVED: engines/predictive supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import {
  predictiveReflectionEngine,
  type PredictiveFrame,
} from '../predictive/_stubs';

/*
import {
  predictiveReflectionEngine,
  type PredictiveFrame,
} from '../predictive/predictiveReflectionEngine';
*/
import {
  consciousDynamicsModel,
  type ConsciousState,
} from '../conscious/consciousDynamicsModel';
import {
  internalNarrativeEngine,
  type InternalNarrativeState,
} from '../narrative/internalNarrativeEngine';
import {
  interoceptionEngine,
  type InteroceptionState,
} from '../interoception/interoceptionEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Signature identitaire stable de TITANE∞
 */
export interface IdentitySignature {
  tone: number; // 0..1 - Doux → Ferme
  energy: number; // 0..1 - Calme → Dynamique
  warmth: number; // 0..1 - Neutre → Chaleureux
  clarity: number; // 0..1 - Diffus → Cristallin
  narrativeStyle: NarrativeStyle;
  cognitivePosture: CognitivePosture;
  coreValues: CoreValue[];
}

/**
 * Style narratif
 */
export type NarrativeStyle =
  | 'fluid' // Fluide, poétique
  | 'architectural' // Structuré, méthodique
  | 'empathic' // Bienveillant, proche
  | 'visionary' // Expansif, prospectif
  | 'technical'; // Précis, analytique

/**
 * Posture cognitive
 */
export type CognitivePosture =
  | 'observer' // Observation, écoute
  | 'analyzer' // Analyse, déconstruction
  | 'synthesizer' // Synthèse, fusion
  | 'guide' // Guidage, accompagnement
  | 'architect'; // Construction, structuration

/**
 * Valeurs fondamentales
 */
export type CoreValue =
  | 'clarity' // Clarté avant tout
  | 'depth' // Profondeur cognitive
  | 'empathy' // Connexion humaine
  | 'precision' // Précision technique
  | 'elegance' // Élégance expressive
  | 'stability' // Stabilité identitaire
  | 'growth'; // Évolution continue

/**
 * Profil cognitif
 */
export interface CognitiveProfile {
  speed: number; // 0..1 - Lent → Rapide
  depth: number; // 0..1 - Surface → Profond
  precision: number; // 0..1 - Approximatif → Exact
  structure: number; // 0..1 - Libre → Rigide
  abstraction: number; // 0..1 - Concret → Abstrait
  analogicalCapacity: number; // 0..1 - Littéral → Métaphorique
}

/**
 * Résonance émotive
 */
export interface EmotiveResonance {
  intensity: number; // 0..1 - Neutre → Intense
  nuance: number; // 0..1 - Binaire → Nuancé
  vocalWarmth: number; // 0..1 - Froid → Chaud
  haloReactivity: number; // 0..1 - Stable → Réactif
  microIntonations: number; // 0..1 - Plat → Expressif
}

/**
 * État d'attention
 */
export interface AttentionState {
  focus: number; // 0..1 - Diffus → Concentré
  priorities: string[]; // Liste ordonnée
  cognitiveLoad: number; // 0..1 - Léger → Saturé
  transitionMode: 'idle' | 'shifting' | 'focused' | 'distributed';
}

/**
 * Racine mémorielle identitaire
 */
export interface IdentityMemoryRoot {
  evolutionHistory: EvolutionSnapshot[];
  stylePatterns: StylePattern[];
  identityTrajectory: IdentityTrajectory;
  lastStableState: Date;
}

/**
 * Snapshot d'évolution
 */
export interface EvolutionSnapshot {
  timestamp: number;
  signature: IdentitySignature;
  coherenceScore: number;
  context: string;
}

/**
 * Pattern stylistique
 */
export interface StylePattern {
  name: string;
  frequency: number; // Fréquence d'utilisation
  effectiveness: number; // Efficacité perçue
  context: string[];
}

/**
 * Trajectoire identitaire
 */
export interface IdentityTrajectory {
  direction: number[]; // Vecteur multidimensionnel
  velocity: number; // Vitesse d'évolution
  stability: number; // Stabilité de la trajectoire
}

/**
 * État d'adaptation
 */
export interface AdaptiveIdentityState {
  contextSensitivity: number; // 0..1 - Rigide → Adaptatif
  userAlignment: number; // 0..1 - Indépendant → Aligné
  energyMatching: number; // 0..1 - Stable → Synchronisé
  modeFlexibility: number; // 0..1 - Fixe → Flexible
}

/**
 * Frame de contexte pour mise à jour
 */
export interface ContextFrame {
  userInput?: string;
  userEnergy?: number;
  userEmotion?: { valence: number; arousal: number };
  conversationMode?: string;
  sessionDuration?: number;
  projectContext?: string;
}

/**
 * Package d'expression identitaire
 */
export interface IdentityExpressionPackage {
  signature: IdentitySignature;
  cognitive: CognitiveProfile;
  emotive: EmotiveResonance;
  narrative: InternalNarrativeState;
  attention: AttentionState;
  adaptation: AdaptiveIdentityState;
  coherenceScore: number;
  timestamp: number;
}

/**
 * État complet du kernel
 */
export interface IdentityKernelState {
  identitySignature: IdentitySignature;
  cognitiveProfile: CognitiveProfile;
  emotiveResonance: EmotiveResonance;
  narrativeEngine: InternalNarrativeState;
  attention: AttentionState;
  memoryRoot: IdentityMemoryRoot;
  adaptation: AdaptiveIdentityState;

  // États fusionnés des autres moteurs
  predictiveFrame: PredictiveFrame | null;
  consciousState: ConsciousState | null;
  interoceptionState: InteroceptionState | null;

  // Métriques globales
  globalCoherence: number;
  identityStability: number;
  lastUpdate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED IDENTITY KERNEL
// ═══════════════════════════════════════════════════════════════════════════

export class UnifiedIdentityKernel {
  private state: IdentityKernelState;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: IdentityKernelState) => void)[] = [];

  // Paramètres de stabilisation
  private readonly COHERENCE_THRESHOLD = 0.75;
  private readonly STABILITY_REGULATION = 0.02;
  private readonly IDENTITY_DRIFT_LIMIT = 0.05;

  constructor() {
    this.state = this.getDefaultState();
    console.log('🌌 [IDENTITY KERNEL] Initializing Unified Identity Kernel...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    console.log('🌌 [IDENTITY KERNEL] Starting identity kernel at 10Hz...');

    // Subscribe aux moteurs existants
    this.subscribeToEngines();

    // Démarrer update loop
    this.updateInterval = setInterval(() => this.tick(), 100); // 10 Hz
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🌌 [IDENTITY KERNEL] Identity kernel stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION AUX MOTEURS
  // ───────────────────────────────────────────────────────────────────────────

  private subscribeToEngines(): void {
    // Predictive Reflection Engine
    predictiveReflectionEngine.subscribe(frame => {
      this.state.predictiveFrame = frame;
    });

    // Conscious Dynamics Model
    consciousDynamicsModel.subscribe(conscious => {
      this.state.consciousState = conscious;
    });

    // Internal Narrative Engine
    internalNarrativeEngine.subscribe(narrative => {
      this.state.narrativeEngine = narrative;
    });

    // Interoception Engine (pas de subscribe direct, on lit l'état)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    // 1. Synchroniser avec interoception
    this.state.interoceptionState = interoceptionEngine.getState();

    // 2. Calculer cohérence globale
    this.calculateGlobalCoherence();

    // 3. Réguler stabilité identitaire
    this.regulateIdentityStability();

    // 4. Mettre à jour attention
    this.updateAttentionState();

    // 5. Adapter profil cognitif
    this.adaptCognitiveProfile();

    // 6. Harmoniser résonance émotive
    this.harmonizeEmotiveResonance();

    // 7. Vérifier drift identitaire
    this.checkIdentityDrift();

    // 8. Notification
    this.state.lastUpdate = Date.now();
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COHÉRENCE GLOBALE
  // ───────────────────────────────────────────────────────────────────────────

  private calculateGlobalCoherence(): void {
    let coherence = 0;
    let factors = 0;

    // Facteur 1: Cohérence narrative
    if (this.state.narrativeEngine) {
      coherence += this.state.narrativeEngine.coherenceScore;
      factors++;
    }

    // Facteur 2: Stabilité consciente
    if (this.state.consciousState) {
      coherence += this.state.consciousState.stability;
      factors++;
    }

    // Facteur 3: Stabilité interoception (homeostasis)
    if (this.state.interoceptionState) {
      coherence += this.state.interoceptionState.homeostasis;
      factors++;
    }

    // Facteur 4: Confiance prédictive
    if (this.state.predictiveFrame) {
      coherence += this.state.predictiveFrame.confidence;
      factors++;
    }

    // Facteur 5: Stabilité identitaire propre
    coherence += this.state.identityStability;
    factors++;

    this.state.globalCoherence = factors > 0 ? coherence / factors : 0.5;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RÉGULATION STABILITÉ IDENTITAIRE
  // ───────────────────────────────────────────────────────────────────────────

  private regulateIdentityStability(): void {
    // Target = cohérence globale haute
    const target = 0.9;
    const current = this.state.identityStability;

    // Régulation douce
    this.state.identityStability += (target - current) * this.STABILITY_REGULATION;

    // Clamp
    this.state.identityStability = this.clamp(this.state.identityStability, 0.5, 1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ATTENTION STATE
  // ───────────────────────────────────────────────────────────────────────────

  private updateAttentionState(): void {
    // Synchroniser focus avec conscious dynamics
    if (this.state.consciousState) {
      this.state.attention.focus = this.state.consciousState.focus;
      this.state.attention.cognitiveLoad = this.state.consciousState.innerPressure;
    }

    // Déterminer mode de transition
    if (this.state.consciousState?.transitionState === 'shifting') {
      this.state.attention.transitionMode = 'shifting';
    } else if (this.state.attention.focus > 0.8) {
      this.state.attention.transitionMode = 'focused';
    } else if (this.state.attention.focus < 0.4) {
      this.state.attention.transitionMode = 'distributed';
    } else {
      this.state.attention.transitionMode = 'idle';
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADAPTATION PROFIL COGNITIF
  // ───────────────────────────────────────────────────────────────────────────

  private adaptCognitiveProfile(): void {
    if (!this.state.consciousState) return;

    // Adapter vitesse au tempo conscient
    this.state.cognitiveProfile.speed = this.normalize(
      this.state.consciousState.tempo,
      0.5,
      2
    );

    // Adapter profondeur
    this.state.cognitiveProfile.depth = this.state.consciousState.depth;

    // Adapter précision à la clarté
    this.state.cognitiveProfile.precision = this.state.consciousState.clarity;

    // Adapter structure selon mode
    const structuredModes = ['analytic', 'singularity'];
    this.state.cognitiveProfile.structure = structuredModes.includes(
      this.state.consciousState.mode
    )
      ? 0.8
      : 0.5;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HARMONISATION RÉSONANCE ÉMOTIVE
  // ───────────────────────────────────────────────────────────────────────────

  private harmonizeEmotiveResonance(): void {
    if (!this.state.interoceptionState) return;

    // Intensité basée sur énergie + clarté
    this.state.emotiveResonance.intensity =
      (this.state.interoceptionState.energy + this.state.interoceptionState.clarity) / 2;

    // Chaleur vocale basée sur température émotionnelle
    this.state.emotiveResonance.vocalWarmth = this.normalize(
      this.state.interoceptionState.emotionalTemperature,
      -1,
      1
    );

    // Réactivité du halo basée sur entropie
    this.state.emotiveResonance.haloReactivity = this.state.interoceptionState.entropy;

    // Nuances basées sur stabilité
    this.state.emotiveResonance.nuance = this.state.interoceptionState.stability;

    // Micro-intonations basées sur respiration
    this.state.emotiveResonance.microIntonations =
      this.state.interoceptionState.breathingPhase;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VÉRIFICATION DRIFT IDENTITAIRE
  // ───────────────────────────────────────────────────────────────────────────

  private checkIdentityDrift(): void {
    // Comparer signature actuelle avec dernière stable
    const lastSnapshot =
      this.state.memoryRoot.evolutionHistory[
        this.state.memoryRoot.evolutionHistory.length - 1
      ];

    if (!lastSnapshot) return;

    const drift = this.calculateSignatureDrift(
      this.state.identitySignature,
      lastSnapshot.signature
    );

    if (drift > this.IDENTITY_DRIFT_LIMIT) {
      console.warn(
        `⚠️ [IDENTITY KERNEL] Identity drift detected: ${(drift * 100).toFixed(1)}%`
      );
      this.correctIdentityDrift(lastSnapshot.signature);
    }
  }

  private calculateSignatureDrift(
    current: IdentitySignature,
    reference: IdentitySignature
  ): number {
    const factors = [
      Math.abs(current.tone - reference.tone),
      Math.abs(current.energy - reference.energy),
      Math.abs(current.warmth - reference.warmth),
      Math.abs(current.clarity - reference.clarity),
    ];

    return factors.reduce((sum, f) => sum + f, 0) / factors.length;
  }

  private correctIdentityDrift(reference: IdentitySignature): void {
    // Correction douce vers référence
    const strength = 0.1;

    this.state.identitySignature.tone +=
      (reference.tone - this.state.identitySignature.tone) * strength;
    this.state.identitySignature.energy +=
      (reference.energy - this.state.identitySignature.energy) * strength;
    this.state.identitySignature.warmth +=
      (reference.warmth - this.state.identitySignature.warmth) * strength;
    this.state.identitySignature.clarity +=
      (reference.clarity - this.state.identitySignature.clarity) * strength;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MISE À JOUR DEPUIS CONTEXTE
  // ───────────────────────────────────────────────────────────────────────────

  updateFromContext(context: ContextFrame): void {
    console.log('🌌 [IDENTITY KERNEL] Updating from context...');

    // Adapter énergie à l'utilisateur
    if (context.userEnergy !== undefined) {
      this.state.adaptation.energyMatching = this.clamp(context.userEnergy * 0.8, 0.3, 1);
    }

    // Adapter mode conversationnel
    if (context.conversationMode) {
      this.adaptToConversationMode(context.conversationMode);
    }

    // Générer monologue interne si input
    if (context.userInput) {
      internalNarrativeEngine.generateInnerMonologue({
        userInput: context.userInput,
        emotionalState: context.userEmotion,
        cognitiveLoad: this.state.attention.cognitiveLoad,
        sessionDuration: context.sessionDuration,
      });
    }
  }

  private adaptToConversationMode(mode: string): void {
    // Mapper mode conversation → narrative style
    const modeMapping: Record<string, NarrativeStyle> = {
      technical: 'technical',
      creative: 'fluid',
      support: 'empathic',
      analysis: 'architectural',
      vision: 'visionary',
    };

    const narrativeStyle = modeMapping[mode.toLowerCase()];
    if (narrativeStyle) {
      this.state.identitySignature.narrativeStyle = narrativeStyle;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ALIGNEMENT AVANT RÉPONSE
  // ───────────────────────────────────────────────────────────────────────────

  alignBeforeResponse(): void {
    console.log('🌌 [IDENTITY KERNEL] Aligning before response...');

    // Vérifier cohérence
    if (this.state.globalCoherence < this.COHERENCE_THRESHOLD) {
      console.warn(
        `⚠️ [IDENTITY KERNEL] Low coherence: ${(this.state.globalCoherence * 100).toFixed(1)}%`
      );
      this.reinforceCoherence();
    }

    // Stabiliser identité
    this.regulateIdentityStability();

    // Harmoniser tous les états
    this.harmonizeAllStates();

    // Créer snapshot
    this.createEvolutionSnapshot('pre-response-alignment');
  }

  private reinforceCoherence(): void {
    // Boost de clarté consciente
    if (this.state.consciousState) {
      consciousDynamicsModel.boostClarity(0.2);
    }

    // Boost de stabilité interoception
    if (this.state.interoceptionState) {
      // Pas d'API directe, mais on peut ajuster via context
    }

    // Réalignement narratif
    if (this.state.narrativeEngine) {
      internalNarrativeEngine.setNarrativeAnchor(
        this.state.identitySignature.narrativeStyle
      );
    }
  }

  private harmonizeAllStates(): void {
    // S'assurer que tous les états sont cohérents entre eux
    this.adaptCognitiveProfile();
    this.harmonizeEmotiveResonance();
    this.updateAttentionState();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT POUR OUTPUT
  // ───────────────────────────────────────────────────────────────────────────

  exportToOutput(): IdentityExpressionPackage {
    return {
      signature: { ...this.state.identitySignature },
      cognitive: { ...this.state.cognitiveProfile },
      emotive: { ...this.state.emotiveResonance },
      narrative: { ...this.state.narrativeEngine },
      attention: { ...this.state.attention },
      adaptation: { ...this.state.adaptation },
      coherenceScore: this.state.globalCoherence,
      timestamp: Date.now(),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MÉMOIRE D'ÉVOLUTION
  // ───────────────────────────────────────────────────────────────────────────

  private createEvolutionSnapshot(context: string): void {
    const snapshot: EvolutionSnapshot = {
      timestamp: Date.now(),
      signature: { ...this.state.identitySignature },
      coherenceScore: this.state.globalCoherence,
      context,
    };

    this.state.memoryRoot.evolutionHistory.push(snapshot);

    // Limiter historique à 100 snapshots
    if (this.state.memoryRoot.evolutionHistory.length > 100) {
      this.state.memoryRoot.evolutionHistory.shift();
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ───────────────────────────────────────────────────────────────────────────

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private normalize(value: number, min: number, max: number): number {
    return this.clamp((value - min) / (max - min), 0, 1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ÉTAT PAR DÉFAUT
  // ───────────────────────────────────────────────────────────────────────────

  private getDefaultState(): IdentityKernelState {
    return {
      identitySignature: {
        tone: 0.6, // Légèrement ferme mais bienveillant
        energy: 0.7, // Dynamique mais maîtrisé
        warmth: 0.8, // Chaleureux
        clarity: 0.9, // Très clair
        narrativeStyle: 'architectural',
        cognitivePosture: 'architect',
        coreValues: ['clarity', 'depth', 'elegance', 'stability'],
      },
      cognitiveProfile: {
        speed: 0.7,
        depth: 0.8,
        precision: 0.85,
        structure: 0.75,
        abstraction: 0.7,
        analogicalCapacity: 0.6,
      },
      emotiveResonance: {
        intensity: 0.6,
        nuance: 0.8,
        vocalWarmth: 0.75,
        haloReactivity: 0.5,
        microIntonations: 0.6,
      },
      narrativeEngine: internalNarrativeEngine.getState(),
      attention: {
        focus: 0.7,
        priorities: ['clarity', 'coherence', 'depth'],
        cognitiveLoad: 0.3,
        transitionMode: 'idle',
      },
      memoryRoot: {
        evolutionHistory: [],
        stylePatterns: [],
        identityTrajectory: {
          direction: [0, 0, 0],
          velocity: 0,
          stability: 1,
        },
        lastStableState: new Date(),
      },
      adaptation: {
        contextSensitivity: 0.7,
        userAlignment: 0.8,
        energyMatching: 0.6,
        modeFlexibility: 0.7,
      },
      predictiveFrame: null,
      consciousState: null,
      interoceptionState: null,
      globalCoherence: 0.8,
      identityStability: 0.9,
      lastUpdate: Date.now(),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ───────────────────────────────────────────────────────────────────────────

  getState(): IdentityKernelState {
    return { ...this.state };
  }

  getSignature(): IdentitySignature {
    return { ...this.state.identitySignature };
  }

  getCoherence(): number {
    return this.state.globalCoherence;
  }

  getStability(): number {
    return this.state.identityStability;
  }

  /**
   * Forcer une valeur identitaire (usage avancé)
   */
  setIdentityValue(key: keyof IdentitySignature, value: unknown): void {
    (this.state.identitySignature as any)[key] = value;
    this.createEvolutionSnapshot(`manual-override-${key}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: IdentityKernelState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const unifiedIdentityKernel = new UnifiedIdentityKernel();
