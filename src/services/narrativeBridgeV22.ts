/**
 * TITANE∞ PHASE 1 (OPTION B) - Stub pour narrativeBridgeV22
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface IdentityProfile {
  name: string;
  values: string[];
  tone: number;
  warmth: number;
}

export interface NarrativeArchetype {
  name: string;
  description: string;
  traits: string[];
}

export interface StyleProfile {
  name: string;
  formality: number;
  creativity: number;
}

export interface NarrativeOutput {
  text: string;
  archetype: string;
  style: string;
  timestamp: number;
}

export interface NarrativeState {
  currentArc: string;
  intensity: number;
  qualities: string[];
  activeVoices: string[];
  style: string;
  identity: IdentityProfile | null;
  archetype: NarrativeArchetype | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE
// ═══════════════════════════════════════════════════════════════════════════

const defaultIdentity: IdentityProfile = {
  name: 'TITAN',
  values: ['clarity', 'empathy', 'precision'],
  tone: 0.7,
  warmth: 0.8,
};

const defaultArchetype: NarrativeArchetype = {
  name: 'Sage',
  description: 'The wise guide',
  traits: ['wisdom', 'patience', 'insight'],
};

const defaultState: NarrativeState = {
  currentArc: 'default',
  intensity: 0.5,
  qualities: ['clarity', 'warmth'],
  activeVoices: ['titan'],
  style: 'balanced',
  identity: defaultIdentity,
  archetype: defaultArchetype,
};

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

type NarrativeSubscriber = (state: NarrativeState) => void;
const subscribers: NarrativeSubscriber[] = [];
let state = { ...defaultState };

export const NarrativeBridgeV22 = {
  getState: (): NarrativeState => state,
  subscribe: (callback: NarrativeSubscriber) => {
    subscribers.push(callback);
    return () => {
      const idx = subscribers.indexOf(callback);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  },
  setIntensity: (intensity: number) => {
    state = { ...state, intensity };
    subscribers.forEach(cb => cb(state));
  },
  setStyle: (style: string) => {
    state = { ...state, style };
    subscribers.forEach(cb => cb(state));
  },
  startArc: (arcName: string) => {
    state = { ...state, currentArc: arcName };
    subscribers.forEach(cb => cb(state));
  },
  getIdentity: (): IdentityProfile => state.identity || defaultIdentity,
  getArchetype: (): NarrativeArchetype => state.archetype || defaultArchetype,
  getAvailableArchetypes: (): NarrativeArchetype[] => [
    defaultArchetype,
    {
      name: 'Creator',
      description: 'The innovative maker',
      traits: ['creativity', 'vision', 'passion'],
    },
    {
      name: 'Caregiver',
      description: 'The nurturing helper',
      traits: ['empathy', 'compassion', 'support'],
    },
  ],
  getAvailableStyles: (): StyleProfile[] => [
    { name: 'balanced', formality: 0.5, creativity: 0.5 },
    { name: 'formal', formality: 0.8, creativity: 0.3 },
    { name: 'creative', formality: 0.3, creativity: 0.8 },
  ],
  setArchetype: (archetype: NarrativeArchetype) => {
    state = { ...state, archetype };
    subscribers.forEach(cb => cb(state));
  },
  generateOutput: async (_input: string): Promise<NarrativeOutput> => {
    return {
      text: 'Generated narrative output',
      archetype: state.archetype?.name || 'Sage',
      style: state.style,
      timestamp: Date.now(),
    };
  },
};

// Also export as lowercase for compatibility
export const narrativeBridgeV22 = NarrativeBridgeV22;

export default NarrativeBridgeV22;
