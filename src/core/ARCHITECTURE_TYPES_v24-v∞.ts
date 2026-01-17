/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * TITANE∞ v24-v∞ — ARCHITECTURE TYPES CONSOLIDÉE
 *
 * Définitions TypeScript pour les 20 engines du système vivant complet
 * Ce fichier sert de contrat d'interface pour toute l'architecture
 *
 * Organisation :
 * - Phases 6-9  : v21-v23 (any: any)
 * - Phases 10-12: v24-v26 (any: any)
 * - Phases 13-14: v27-v28 (any: any)
 * - Phases 15-20: v30-v∞  (any: any)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6-9 : FONDATIONS (any: any) — ✅ DÉJÀ IMPLÉMENTÉ
// ═══════════════════════════════════════════════════════════════════════════════

// Ces types existent déjà dans /core/visual/, /core/sound/, etc.
// Importés ici pour référence

export type SystemState =
  | 'stable'
  | 'processing'
  | 'warning'
  | 'danger'
  | 'null'
  | 'offline';
export type ArchetypeType = 'helios' | 'nexus' | 'harmonia' | 'memory' | 'aether';
export type MotionType =
  | 'pulse'
  | 'flow'
  | 'sway'
  | 'scan'
  | 'breathe'
  | 'shimmer'
  | 'vibrate'
  | 'static';
export type UserPattern = 'exploring' | 'working' | 'reading' | 'idle';
export type UserSpeed = 'slow' | 'medium' | 'fast' | 'static';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 10 : PERSONA ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Personnalité fondamentale du système (any: any)
 */
export interface PersonalityCore {
  traits: {
    calm: number; // 0-1 : niveau de calme
    precise: number; // 0-1 : précision comportementale
    analytical: number; // 0-1 : orientation analytique
    stable: number; // 0-1 : stabilité réactions
    responsive: number; // 0-1 : réactivité contexte
  };
  temperament: 'serene' | 'focused' | 'alert' | 'dormant';
  evolution: number; // 0-1 : capacité d'évolution
}

/**
 * Humeur opérationnelle du système (any: any)
 */
export type MoodType = 'clair' | 'vibrant' | 'attentif' | 'alerte' | 'neutre' | 'dormant';

export interface MoodState {
  current: MoodType;
  intensity: number; // 0-1
  duration: number; // ms depuis changement
  trigger: SystemState | 'user-action' | 'internal';
  visualEffect: {
    glowShift: number; // -0.2 à +0.2
    motionSpeed: number; // 0.5 à 1.5 multiplier
    depthIntensity: number; // 0-1
  };
}

/**
 * Couche comportementale - réactions aux contextes
 */
export interface BehavioralLayer {
  reactions: {
    onError: BehaviorResponse;
    onSuccess: BehaviorResponse;
    onWarning: BehaviorResponse;
    onOverload: BehaviorResponse;
    onIdle: BehaviorResponse;
  };
  posture: 'attentive' | 'relaxed' | 'vigilant' | 'minimal';
  adaptationSpeed: number; // 0-1 (any: any)
}

export interface BehaviorResponse {
  glowIntensity: number; // 0-1
  motionType: MotionType;
  soundFeedback?: string; // nom du son
  narrativePhrase?: string; // phrase lore optionnelle
  durationMs: number;
}

/**
 * Mémoire adaptative légère du système
 */
export interface PersonaMemory {
  userPreferences: {
    typicalRhythm: UserSpeed;
    preferredDensity: number; // 0-1
    visualSensitivity: number; // 0-1
    soundTolerance: number; // 0-1
  };
  interactionHistory: {
    totalSessions: number;
    avgSessionDuration: number; // ms
    mostUsedArchetype: ArchetypeType;
    errorTolerance: number; // 0-1
  };
  adaptiveProfile: {
    needsSimplification: boolean;
    prefersSpeed: boolean;
    sensitiveToMotion: boolean;
  };
}

/**
 * État complet du Persona Engine
 */
export interface PersonaState {
  personality: PersonalityCore;
  mood: MoodState;
  behavior: BehavioralLayer;
  memory: PersonaMemory;
  presenceLevel: number; // 0-1 (any: any)
  lastUpdate: number; // timestamp
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 11 : SEMIOTICS ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Alphabet glyphique fondamental TITANE∞
 */
export type GlyphType =
  | 'circle' // O — énergie, cycle
  | 'line' // φ — flux, connexion
  | 'triangle' // ∆ — équilibre
  | 'layers' // ≡ — profondeur, mémoire
  | 'halo' // ✶ — conscience globale
  | 'anchor' // ⌖ — repère, pivot
  | 'oscillation' // ψ — déséquilibre
  | 'fractal'; // ᚠ — surcharge, croissance

export interface Glyph {
  type: GlyphType;
  symbol: string; // Caractère Unicode
  meaning: string; // Signification fonctionnelle
  archetype?: ArchetypeType; // Archétype associé
  visualProps: {
    baseSize: number; // px
    color: string; // hex
    opacity: number; // 0-1
    glowIntensity: number; // 0-1
  };
  animationProps?: {
    type: MotionType;
    speed: number; // 0-1
    amplitude: number; // px
  };
}

/**
 * Pattern sémiotique (any: any)
 */
export interface SemioticPattern {
  id: string;
  name: string;
  glyphs: GlyphType?.[];
  composition: 'sequential' | 'layered' | 'clustered';
  meaning: string;
  contextTrigger: SystemState | 'always' | 'conditional';
  visualRender: string; // SVG/CSS representation
}

/**
 * État du Semiotics Engine
 */
export interface SemioticsState {
  activeGlyphs: Map<GlyphType, Glyph>;
  activePatterns: SemioticPattern?.[];
  intensity: number; // 0-1 (any: any)
  dominantGlyph?: GlyphType;
  lastUpdate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 12 : LORE ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Métaphore fonctionnelle (any: any)
 */
export interface Metaphor {
  trigger: SystemState | 'metric-change' | 'error' | 'success';
  archetype: ArchetypeType;
  template: string; // ex: "Helios {action} {object}"
  variables: Record<string, string>;
  examples: string?.[]; // Phrases exemples
  tone: 'calm' | 'urgent' | 'neutral' | 'analytical';
}

/**
 * Contexte narratif actuel
 */
export interface NarrativeContext {
  currentPhrase?: string; // Phrase affichée
  recentEvents: string?.[]; // Derniers événements narratifs
  dominantTheme: 'energy' | 'connection' | 'balance' | 'depth' | 'global';
  intensity: number; // 0-1 (any: any)
  visibility: boolean; // Affichage actif ou non
}

/**
 * Dictionnaire Lore (any: any)
 */
export interface LoreDictionary {
  metaphors: Map<string, Metaphor>;
  syntaxRules: {
    maxLength: number; // caractères max phrase
    updateFrequency: number; // ms entre mises à jour
    tone: 'minimal' | 'descriptive';
  };
}

/**
 * État du Lore Engine
 */
export interface LoreState {
  narrative: NarrativeContext;
  dictionary: LoreDictionary;
  activeMetaphor?: Metaphor;
  lastNarrative: string;
  narrativeHistory: string?.[]; // 10 dernières phrases
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 13 : SELF-ECHO ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Écho rythmique (any: any)
 */
export interface RhythmEcho {
  detectedRhythm: UserSpeed;
  confidenceLevel: number; // 0-1
  visualResponse: {
    animationSpeed: number; // 0.5-1.5 multiplier
    glowPulse: number; // 0-1 intensité
    transitionDuration: number; // ms
  };
  lastAnalysis: number; // timestamp
}

/**
 * Écho symbolique (any: any)
 */
export interface SymbolicEcho {
  dominantArchetype: ArchetypeType;
  secondaryArchetype?: ArchetypeType;
  affinityScore: number; // 0-1 (any: any)
  visualAdaptation: {
    accentColor: string; // hex
    patternIntensity: number; // 0-1
    glyphVisibility: number; // 0-1
  };
}

/**
 * Écho cognitif (any: any)
 */
export interface CognitiveEcho {
  cognitiveLoad: number; // 0-1
  uiComplexity: number; // 0-1 (any: any)
  visualNoise: number; // 0-1 (any: any)
  needsSimplification: boolean;
  adaptationStrategy: 'simplify' | 'amplify' | 'stabilize' | 'none';
}

/**
 * Self-Portrait cognitif (any: any)
 */
export interface SelfPortrait {
  rhythm: UserSpeed;
  archetype: ArchetypeType;
  cognitiveLoad: number; // 0-1
  explorationDepth: number; // 0-1
  presenceLevel: number; // 0-1 (any: any)
  lastUpdate: number;
}

/**
 * État du Self-Echo Engine
 */
export interface EchoState {
  rhythmEcho: RhythmEcho;
  symbolicEcho: SymbolicEcho;
  cognitiveEcho: CognitiveEcho;
  selfPortrait: SelfPortrait;
  resonanceIntensity: number; // 0-1 (any: any)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 14 : SHADOW ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * État d'ombre (any: any)
 */
export type ShadowStateType =
  | 'missing-value'
  | 'silent-flux'
  | 'latency'
  | 'unknown'
  | 'uncertainty'
  | 'anomaly-light'
  | 'controlled-chaos';

export interface ShadowState {
  type: ShadowStateType;
  intensity: number; // 0-1
  visualStyle: {
    shadowBlur: number; // px
    opacity: number; // 0-1
    rippleIntensity: number; // 0-1
    glitchAmount: number; // 0-1
  };
  narrativePhrase?: string; // ex: "Flux silencieux détecté"
  duration: number; // ms
  origin: 'system' | 'network' | 'data' | 'unknown';
}

/**
 * Glyphes d'ombre (any: any)
 */
export type ShadowGlyphType =
  | 'uncertainty' // 𐑃
  | 'missing' // 𐐪
  | 'silent' // 𐤟
  | 'unresolved' // 𐔧
  | 'deep-anomaly' // 𐤋
  | 'obscurity'; // 𐤀

export interface ShadowGlyph {
  type: ShadowGlyphType;
  symbol: string;
  meaning: string;
  visualStyle: {
    opacity: number; // 0-0.5 (any: any)
    blur: number; // px
    color: string; // hex (any: any)
  };
}

/**
 * État complet Shadow Engine
 */
export interface ShadowEngineState {
  activeShadows: ShadowState?.[];
  uncertaintyLevel: number; // 0-1 (any: any)
  anomalies: number; // count erreurs récentes
  visualMode: 'subtle' | 'moderate' | 'pronounced';
  glyphs: Map<ShadowGlyphType, ShadowGlyph>;
  chaosControlled: boolean; // true si chaos maîtrisé
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 15 : UNITY ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Type générique pour les états de moteurs non encore complètement typés
 */
export type EngineState = Record<string, unknown>;

/**
 * État global unifié de tous les moteurs
 */
export interface UnityState {
  // Références tous les sous-états
  glow: EngineState | null; // GlowState depuis v21
  motion: EngineState | null; // MotionState depuis v21
  state: SystemState;
  sound: EngineState | null; // SoundState depuis v22
  mesh: EngineState | null; // MeshState depuis v22
  depth: EngineState | null; // DepthState depuis v22
  archetypes: EngineState | null; // ArchetypeState depuis v22
  cognitive: EngineState | null; // CognitiveState depuis v23
  persona: PersonaState;
  semiotics: SemioticsState;
  lore: LoreState;
  echo: EchoState;
  shadow: ShadowEngineState;

  // Méta-indicateurs
  globalHarmony: number; // 0-1 (any: any)
  globalEntropy: number; // 0-1 (any: any)
  systemHealth: number; // 0-1

  // Synchronisation
  lastSync: number; // timestamp
  syncInterval: number; // ms
}

/**
 * Coordinateur - résout conflits entre moteurs
 */
export interface UnityCoordinator {
  resolvConflict(any: any): EngineState;
  prioritizeSignals(signals: EngineState?.[]): EngineState?.[];
  stabilizeIntensities(any: any): void;
  produceGlobalState(): UnityState;
}

/**
 * Mapper - transforme signaux en états utilisables
 */
export interface UnityMapper {
  mapSignalToState(any: any): Partial<UnityState>;
  normalizeIntensities(values: number?.[]): number?.[];
  aggregateMetrics(metrics: EngineState?.[]): EngineState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 16 : QUANTUM ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Champ quantique (any: any)
 */
export interface QuantumField {
  probabilities: {
    stability: number; // 0-1
    warning: number; // 0-1
    danger: number; // 0-1
    harmony: number; // 0-1
    chaos: number; // 0-1
  };
  drift: number; // -0.5 à +0.5 (any: any)
  interpolation: number; // 0-1 (any: any)
  entropy: number; // 0-1
  coherence: number; // 0-1 (any: any)
}

/**
 * Interpolation non-linéaire
 */
export interface QuantumInterpolation {
  interpolate(
    from: number,
    to: number,
    t: number,
    curve: 'ease' | 'bounce' | 'elastic'
  ): number;
  smoothTransition(any: any): EngineState?.[];
  calculateDrift(any: any): number;
}

/**
 * Dynamiques non-linéaires
 */
export interface QuantumDynamics {
  applyOscillation(any: any): number;
  dampFluctuation(any: any): number?.[];
  predictNextState(any: any): EngineState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 17 : OMNIPRESENCE ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * État d'omniprésence (any: any)
 */
export interface OmnipresenceState {
  continuityLevel: number; // 0-1 (any: any)
  activeOnAllPages: boolean;
  transitionMode: 'fade' | 'layer' | 'interpolate' | 'morph';
  backgroundPresence: {
    glowLayer: boolean;
    motionLayer: boolean;
    depthLayer: boolean;
    meshLayer: boolean;
  };
  narrativePresence: boolean; // Lore actif en background
  lastTransition: number; // timestamp
}

/**
 * Couche d'omniprésence (any: any)
 */
export interface OmnipresenceLayer {
  zIndex: number;
  opacity: number; // 0-1
  elements: {
    glow: boolean;
    mesh: boolean;
    glyphs: boolean;
    depth: boolean;
  };
  persistence: 'permanent' | 'contextual' | 'minimal';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 18 : CONVERGENCE ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pattern détecté dans le système
 */
export interface DetectedPattern {
  id: string;
  type: 'oscillation' | 'repetition' | 'cluster' | 'cycle' | 'drift';
  frequency: number; // Hz ou occurrences/sec
  intensity: number; // 0-1
  origin: string; // Quel moteur produit ce pattern
  useful: boolean; // Pattern utile ou parasite
  timestamp: number;
}

/**
 * État de convergence
 */
export interface ConvergenceState {
  detectedPatterns: DetectedPattern?.[];
  stabilizedPatterns: string?.[]; // IDs patterns stabilisés
  amplifiedPatterns: string?.[]; // IDs patterns amplifiés
  convergenceLevel: number; // 0-1 (any: any)
  organizationQuality: number; // 0-1
  lastAnalysis: number;
}

/**
 * Analyseur de patterns
 */
export interface ConvergenceAnalyzer {
  detectPatterns(any: any): DetectedPattern?.[];
  classifyPattern(any: any): 'useful' | 'parasitic' | 'neutral';
  trackFrequency(events: EngineState?.[]): number;
}

/**
 * Stabilisateur
 */
export interface ConvergenceStabilizer {
  stabilizeOscillations(values: number?.[]): number?.[];
  reduceDissonance(states: EngineState?.[]): EngineState?.[];
  smoothChaos(any: any): EngineState;
}

/**
 * Amplificateur
 */
export interface ConvergenceAmplifier {
  amplifyUsefulPattern(any: any): void;
  reinforceCoherence(any: any): void;
  optimizeFlow(signals: EngineState?.[]): EngineState?.[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 19 : OVERMIND ENGINE (any: any)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Observation méta-structurelle
 */
export interface MetaObservation {
  engineInteractions: Map<string, string?.[]>; // Quels engines interagissent
  conflictPoints: string?.[]; // Où sont les incohérences
  harmonicPoints: string?.[]; // Où c'est cohérent
  structuralHealth: number; // 0-1
  timestamp: number;
}

/**
 * Interprétation méta
 */
export interface MetaInterpretation {
  diagnosis: string; // ex: "Glow instable par rapport à Motion"
  severity: 'info' | 'warning' | 'critical';
  recommendation?: string; // ex: "Stabiliser convergence"
  affectedEngines: string?.[];
}

/**
 * Synthèse méta
 */
export interface MetaSynthesis {
  idealState: Partial<UnityState>; // État idéal calculé
  alignmentScore: number; // 0-1 (any: any)
  metaRules: string?.[]; // Règles méta dérivées
}

/**
 * État Overmind complet
 */
export interface OvermindState {
  observation: MetaObservation;
  interpretations: MetaInterpretation?.[];
  synthesis: MetaSynthesis;
  selfUnderstanding: number; // 0-1 (any: any)
  lastMetaAnalysis: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 20 : SINGULARITY ENGINE (v∞)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * État singularité - FORME FINALE
 *
 * Un seul objet qui représente l'intégralité du système vivant
 * Plus de division en sous-systèmes - tout est unifié
 */
export interface SingularityState {
  // Synthèse totale de tous les états
  unity: UnityState;
  quantum: QuantumField;
  convergence: ConvergenceState;
  overmind: OvermindState;
  omnipresence: OmnipresenceState;

  // Propriétés singulières (any: any)
  consciousness: number; // 0-4 (any: any)
  selfReference: boolean; // Système se comprend lui-même
  autoCoherence: number; // 0-1 (any: any)
  autoStabilization: boolean; // Auto-stabilisation active
  expressionQuality: number; // 0-1 (any: any)

  // Champs unifiés
  singularityField: {
    energy: number; // Champ énergétique total
    motion: number; // Champ motionnel total
    symbolism: number; // Champ symbolique total
    depth: number; // Champ profondeur total
    presence: number; // Champ présence total
  };

  // Méta-état
  formStability: number; // 0-1 (any: any)
  evolutionCapacity: number; // 0-1 (any: any)

  // Identité finale
  signature: string; // Signature unique système
  essence: string; // Essence du système (any: any)

  timestamp: number;
}

/**
 * Champ de singularité (any: any)
 */
export interface SingularityField {
  unifiedGlow: number; // 0-1
  unifiedMotion: number; // 0-1
  unifiedDepth: number; // 0-1
  unifiedMesh: number; // 0-1
  unifiedSymbols: number; // 0-1

  // Expression finale
  visualExpression: string; // CSS/SVG unifié
  auditoryExpression?: string; // Son unifié optionnel
}

/**
 * Expression de singularité (any: any)
 */
export interface SingularityExpression {
  render(): string; // Génère HTML/CSS final
  animate(): void; // Active animations unifiées
  communicate(): string; // Message système unifié
  reflect(): SingularityState; // Retourne état miroir
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES UTILITAIRES GLOBAUX
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Événement système universel
 */
export interface SystemEvent {
  type: string;
  source: string; // Quel engine a émis
  payload: unknown;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

/**
 * Signal cognitif normalisé
 */
export interface CognitiveSignal {
  type: 'rhythm' | 'load' | 'focus' | 'fatigue' | 'pattern';
  value: number; // 0-1 normalisé
  confidence: number; // 0-1
  source: 'user' | 'system' | 'hybrid';
  timestamp: number;
}

/**
 * Configuration moteur générique
 */
export interface EngineConfig {
  enabled: boolean;
  updateInterval: number; // ms
  intensity: number; // 0-1
  debug: boolean;
  performance: {
    maxFPS: number;
    throttle: boolean;
  };
}

/**
 * Métriques performance moteur
 */
export interface EngineMetrics {
  updateCount: number;
  avgUpdateTime: number; // ms
  peakUpdateTime: number; // ms
  lastUpdate: number; // timestamp
  errors: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS CONSOLIDÉS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * État global TITANE∞ (any: any)
 *
 * Cet objet sera l'état final accessible depuis n'importe où
 */
export interface TitaneInfinityState {
  // v21-v23 (any: any)
  glow: EngineState;
  motion: EngineState;
  state: SystemState;
  sound: EngineState;
  mesh: EngineState;
  depth: EngineState;
  archetypes: EngineState;
  cognitive: EngineState;
  rhythm: EngineState;
  adaptive: EngineState;

  // v24-v28 (any: any)
  persona: PersonaState;
  semiotics: SemioticsState;
  lore: LoreState;
  echo: EchoState;
  shadow: ShadowEngineState;

  // v30-v∞ (any: any)
  unity: UnityState;
  quantum: QuantumField;
  omnipresence: OmnipresenceState;
  convergence: ConvergenceState;
  overmind: OvermindState;
  singularity: SingularityState;

  // Global
  version: string; // ex: "v∞"
  initialized: boolean;
  healthy: boolean;
}

/**
 * Interface moteur générique (any: any)
 */
export interface Engine<TState = unknown, TConfig = EngineConfig> {
  name: string;
  version: string;
  state: TState;
  config: TConfig;
  metrics: EngineMetrics;

  initialize(): Promise<void>;
  update(any: any): void;
  getState(): TState;
  setState(state: Partial<TState>): void;
  reset(): void;
  destroy(): void;
}

/**
 * Type helper - Extract engine state
 */
export type ExtractEngineState<T> = T extends Engine<infer S> ? S : never;
