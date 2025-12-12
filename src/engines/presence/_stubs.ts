/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/presence supprimés
 *
 * Ce fichier fournit des stubs pour maintenir la compatibilité
 * temporaire avec les modules qui référencent encore engines/presence.
 *
 * ⚠️ engines/presence a été supprimé lors de la restructuration.
 * Ces stubs retournent des valeurs par défaut pour éviter les erreurs
 * de compilation. Les modules dépendants devront être refactorisés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - multimodalPresenceEngine
// ═══════════════════════════════════════════════════════════════════════════

export type PresenceMode =
  | 'default'
  | 'idle'
  | 'healing'
  | 'storytelling'
  | 'listening'
  | 'learning'
  | 'creating'
  | 'insight'
  | 'empathy'
  | 'architect'
  | 'deep-work'
  | 'singularity'
  | 'thinking'
  | 'speaking'
  | 'deep_reflection'
  | 'empathic_sync';

export interface ExpressiveIntention {
  type: string;
  intensity: number;
  duration?: number;
}

export interface HaloColorExpression {
  hue: number;
  saturation: number;
  lightness: number;
}

export interface HaloState {
  size: number;
  opacity: number;
  color: HaloColorExpression;
  state: string;
  intensity: number;
  pulsation: number;
}

export interface BreathingState {
  phase: number;
  cycleDuration: number;
  amplitude: number;
}

export interface AvatarMicroMimics {
  eyeMovement: { x: number; y: number };
  headTilt: { pitch: number; yaw: number; roll: number };
  microExpression: string;
  facialGlow: number;
  lastBlink: number;
  blinkRate: number;
}

export interface MultimodalPresenceState {
  mode: PresenceMode;
  breathing: number | BreathingState;
  energy: number;
  coherence: number;
  presenceEnergy: number;
  halo: HaloState;
  avatar: AvatarMicroMimics;
  innerState: {
    thinkingState: string | null;
    mentalColor: string | null;
    coherence: number;
  };
  userMirroring: {
    active: boolean;
    mirrorRatio: number;
    detectedUserState: string | null;
  };
  currentIntention?: ExpressiveIntention;
}

const defaultMultimodalState: MultimodalPresenceState = {
  mode: 'default',
  breathing: {
    phase: 0,
    cycleDuration: 4000,
    amplitude: 0.5,
  },
  energy: 100,
  coherence: 100,
  presenceEnergy: 100,
  halo: {
    size: 1,
    opacity: 0.8,
    color: {
      hue: 200,
      saturation: 50,
      lightness: 50,
    },
    state: 'idle',
    intensity: 0.8,
    pulsation: 0,
  },
  avatar: {
    eyeMovement: { x: 0, y: 0 },
    headTilt: { pitch: 0, yaw: 0, roll: 0 },
    microExpression: 'neutral',
    facialGlow: 0.5,
    lastBlink: Date.now(),
    blinkRate: 3000,
  },
  innerState: {
    thinkingState: null,
    mentalColor: null,
    coherence: 1.0,
  },
  userMirroring: {
    active: false,
    mirrorRatio: 0.5,
    detectedUserState: null,
  },
  currentIntention: undefined,
};

type MultimodalSubscriber = (state: MultimodalPresenceState) => void;
const multimodalSubscribers: MultimodalSubscriber[] = [];
let multimodalState = { ...defaultMultimodalState };

export const multimodalPresenceEngine = {
  getState: (): MultimodalPresenceState => multimodalState,
  start: () => {},
  stop: () => {},
  subscribe: (callback: MultimodalSubscriber) => {
    multimodalSubscribers.push(callback);
    return () => {
      const idx = multimodalSubscribers.indexOf(callback);
      if (idx > -1) multimodalSubscribers.splice(idx, 1);
    };
  },
  setMode: (mode: PresenceMode) => {
    multimodalState = { ...multimodalState, mode };
    multimodalSubscribers.forEach(cb => cb(multimodalState));
  },
  applyIntention: (type: string, intensity = 1.0, _duration = 3000) => {
    multimodalState = {
      ...multimodalState,
      currentIntention: { type, intensity },
    };
    multimodalSubscribers.forEach(cb => cb(multimodalState));
  },
  syncWithInnerDialogue: (_innerState: unknown) => {},
  activateHealingMode: () => {
    multimodalState = { ...multimodalState, mode: 'healing' };
    multimodalSubscribers.forEach(cb => cb(multimodalState));
  },
  activateStoryMode: () => {
    multimodalState = { ...multimodalState, mode: 'storytelling' };
    multimodalSubscribers.forEach(cb => cb(multimodalState));
  },
  activateListeningMode: () => {
    multimodalState = { ...multimodalState, mode: 'listening' };
    multimodalSubscribers.forEach(cb => cb(multimodalState));
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - presenceOS
// ═══════════════════════════════════════════════════════════════════════════

export type PresenceOSMode =
  | 'neutral'
  | 'insight'
  | 'empathy'
  | 'architect'
  | 'deep-work'
  | 'singularity'
  | 'listening'
  | 'processing';

export interface CognitiveState {
  reasoningStyle: string;
  depth: number;
  tempo: number;
  analyticalIntensity: number;
  coherence: number;
}

export interface AffectiveState {
  valence: number;
  arousal: number;
  dominance: number;
  warmth: number;
  emotionalState?: string;
  [key: string]: unknown;
}

export interface ExpressiveOSState {
  timbreBlend: { warm: number; neutral: number; analytical: number; empathic: number };
  speechRate?: number;
  softness?: number;
  vocalWarmth?: number;
  breathiness?: number;
  microPauses?: number;
}

export interface SpatialState {
  proximity: number;
  elevation?: number;
  width?: number;
}

export interface PresenceState {
  isActive: boolean;
  coherence: number;
  mode: PresenceOSMode;
  cognitive: CognitiveState;
  affective: AffectiveState;
  expressive: ExpressiveOSState;
  spatial: SpatialState;
  auraPattern: string;
  globalCoherence: number;
}

const defaultPresenceOSState: PresenceState = {
  isActive: false,
  coherence: 100,
  mode: 'neutral',
  cognitive: {
    reasoningStyle: 'analytical',
    depth: 0.7,
    tempo: 0.5,
    analyticalIntensity: 0.6,
    coherence: 0.8,
  },
  affective: {
    emotion: 'neutral',
    intensity: 0.5,
    valence: 0.5,
    stability: 0.8,
  },
  expressive: {
    timbreBlend: { warm: 0.3, neutral: 0.4, analytical: 0.2, empathic: 0.1 },
  },
  spatial: {
    proximity: 0.5,
  },
  auraPattern: 'default',
  globalCoherence: 0.85,
};

type PresenceOSSubscriber = (state: PresenceState) => void;
const presenceOSSubscribers: PresenceOSSubscriber[] = [];
let presenceOSState = { ...defaultPresenceOSState };

export const presenceOS = {
  getState: (): PresenceState => presenceOSState,
  start: () => {
    presenceOSState = { ...presenceOSState, isActive: true };
    presenceOSSubscribers.forEach(cb => cb(presenceOSState));
  },
  stop: () => {
    presenceOSState = { ...presenceOSState, isActive: false };
    presenceOSSubscribers.forEach(cb => cb(presenceOSState));
  },
  subscribe: (callback: PresenceOSSubscriber) => {
    presenceOSSubscribers.push(callback);
    return () => {
      const idx = presenceOSSubscribers.indexOf(callback);
      if (idx > -1) presenceOSSubscribers.splice(idx, 1);
    };
  },
  setMode: (mode: PresenceOSMode, _immediate?: boolean) => {
    presenceOSState = { ...presenceOSState, mode };
    presenceOSSubscribers.forEach(cb => cb(presenceOSState));
  },
  reactToUserInput: (_input: string, _emotion?: string) => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - unifiedPresenceEngine
// ═══════════════════════════════════════════════════════════════════════════

export interface TonicProfile {
  name: string;
  intensity: number;
  formality: 'casual' | 'professional' | 'technical' | 'creative';
  emotionalDepth: 'surface' | 'moderate' | 'deep' | 'profound';
  narrativeDensity: 'sparse' | 'moderate' | 'rich' | 'dense';
  energyLevel: 'low' | 'moderate' | 'high' | 'peak';
}

export interface UserContext {
  cognitiveLoad: number;
  fatigue: number;
  tempo: number;
  taskComplexity: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number;
  interactionPattern: string;
}

export interface IdentityMatrix {
  coreValues: string[];
  missionStatement: string;
  traits: Record<string, number>;
}

export interface UnifiedPresenceState {
  visualIntensity: number;
  accentStrength: number;
  pulseRate: number;
  ambientHue: number;
  clarityLevel: number;
  complexityHandled: number;
  intentionAlignment: number;
  warmth: number;
  proximity: number;
  intensity: number;
  supportLevel: number;
  narrativeContinuity: number;
  identityStability: number;
  mythologicalDepth: number;
}

const defaultUnifiedState: UnifiedPresenceState = {
  visualIntensity: 75,
  accentStrength: 50,
  pulseRate: 60,
  ambientHue: 250,
  clarityLevel: 80,
  complexityHandled: 60,
  intentionAlignment: 90,
  warmth: 65,
  proximity: 55,
  intensity: 70,
  supportLevel: 75,
  narrativeContinuity: 85,
  identityStability: 95,
  mythologicalDepth: 50,
};

const defaultTonicProfile: TonicProfile = {
  name: 'balanced',
  intensity: 0.7,
  formality: 'professional',
  emotionalDepth: 'moderate',
  narrativeDensity: 'moderate',
  energyLevel: 'moderate',
};

const defaultUserContext: UserContext = {
  cognitiveLoad: 50,
  fatigue: 30,
  tempo: 60,
  taskComplexity: 50,
  timeOfDay: 'afternoon',
  sessionDuration: 0,
  interactionPattern: 'exploratory',
};

const defaultIdentityMatrix: IdentityMatrix = {
  coreValues: ['excellence', 'empathy', 'innovation', 'integrity'],
  missionStatement: "Accompagner l'humain vers son plein potentiel",
  traits: { wisdom: 0.8, creativity: 0.9, empathy: 0.85, precision: 0.9 },
};

type UnifiedSubscriber = (state: UnifiedPresenceState) => void;
const unifiedSubscribers: UnifiedSubscriber[] = [];
const unifiedState = { ...defaultUnifiedState };
let currentProfile = { ...defaultTonicProfile };

export const unifiedPresenceEngine = {
  getState: (): UnifiedPresenceState => unifiedState,
  start: () => {},
  stop: () => {},
  subscribe: (callback: UnifiedSubscriber) => {
    unifiedSubscribers.push(callback);
    return () => {
      const idx = unifiedSubscribers.indexOf(callback);
      if (idx > -1) unifiedSubscribers.splice(idx, 1);
    };
  },
  getUserContext: (): UserContext => defaultUserContext,
  getCurrentProfile: (): TonicProfile => currentProfile,
  setProfile: (profileName: string) => {
    currentProfile = { ...currentProfile, name: profileName };
    unifiedSubscribers.forEach(cb => cb(unifiedState));
  },
  getIdentityMatrix: (): IdentityMatrix => defaultIdentityMatrix,
};

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - presenceIntegrations
// ═══════════════════════════════════════════════════════════════════════════

export const presenceIntegrations = {
  startAll: () => {},
  stopAll: () => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - narrativeProtocol
// ═══════════════════════════════════════════════════════════════════════════

export interface NarrativeArc {
  id: string;
  phase: 'beginning' | 'exploration' | 'deepwork' | 'synthesis' | 'closure';
  continuityScore: number;
  moments: NarrativeMoment[];
  startedAt: number;
}

export interface NarrativeMoment {
  type: 'transition' | 'achievement' | 'challenge' | 'insight' | 'rest';
  description: string;
  emotionalImpact: number;
  contextTags: string[];
  timestamp: number;
}

export interface SymbolicElement {
  key: string;
  symbol: string;
  meaning: string;
  active: boolean;
  intensity: number;
}

const defaultArc: NarrativeArc = {
  id: 'default-arc',
  phase: 'beginning',
  continuityScore: 100,
  moments: [],
  startedAt: Date.now(),
};

const defaultSymbols: SymbolicElement[] = [
  {
    key: 'infinity',
    symbol: '∞',
    meaning: 'infinite potential',
    active: true,
    intensity: 0.8,
  },
  { key: 'diamond', symbol: '◇', meaning: 'clarity', active: false, intensity: 0.5 },
];

let currentArc = { ...defaultArc };
let activeSymbols = [...defaultSymbols];

export const narrativeProtocol = {
  startNewArc: (sessionId: string) => {
    currentArc = {
      id: sessionId,
      phase: 'beginning',
      continuityScore: 100,
      moments: [],
      startedAt: Date.now(),
    };
  },
  stop: () => {},
  getCurrentArc: (): NarrativeArc => currentArc,
  getActiveSymbols: (): SymbolicElement[] => activeSymbols.filter(s => s.active),
  addNarrativeMoment: (moment: Omit<NarrativeMoment, 'timestamp'>) => {
    currentArc.moments.push({ ...moment, timestamp: Date.now() });
  },
  transitionPhase: (phase: NarrativeArc['phase']) => {
    currentArc.phase = phase;
  },
  activateSymbol: (symbolKey: string) => {
    activeSymbols = activeSymbols.map(s =>
      s.key === symbolKey ? { ...s, active: true } : s
    );
  },
};
