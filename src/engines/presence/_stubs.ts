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

export type PresenceMode = 'default' | 'idle' | 'healing' | 'storytelling' | 'listening' | 'learning' | 'creating' | 'insight' | 'empathy' | 'architect' | 'deep-work' | 'singularity' | 'thinking' | 'speaking' | 'deep_reflection' | 'empathic_sync';

export interface ExpressiveIntention {
  type: string;
  intensity: number;
  duration?: number;
}

export interface MultimodalPresenceState {
  mode: PresenceMode;
  breathing: number;
  energy: number;
  coherence: number;
  presenceEnergy: number;
  halo: {
    size: number;
    opacity: number;
    color: string;
  };
  avatar: {
    expression: string;
    posture: string;
  };
  currentIntention?: ExpressiveIntention;
}

const defaultMultimodalState: MultimodalPresenceState = {
  mode: 'default',
  breathing: 0,
  energy: 100,
  coherence: 100,
  presenceEnergy: 100,
  halo: {
    size: 1,
    opacity: 0.8,
    color: '#ffffff',
  },
  avatar: {
    expression: 'neutral',
    posture: 'centered',
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

export type PresenceOSMode = 'neutral' | 'insight' | 'empathy' | 'architect' | 'deep-work' | 'singularity' | 'listening' | 'processing';

export interface CognitiveState {
  reasoningStyle: string;
  depth: number;
  tempo: number;
  analyticalIntensity: number;
  coherence: number;
}

export interface AffectiveState {
  emotion: string;
  intensity: number;
  valence: number;
  stability: number;
}

export interface ExpressiveOSState {
  timbreBlend: { warm: number; neutral: number; analytical: number; empathic: number };
}

export interface SpatialState {
  proximity: number;
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
}

export const unifiedPresenceEngine = {
  getState: () => ({}),
  start: () => {},
  stop: () => {},
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

export const narrativeProtocol = {
  startNewArc: (_sessionId: string) => {},
  stop: () => {},
};
