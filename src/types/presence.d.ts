// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Presence OS Types
// ═══════════════════════════════════════════════════════════════

export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
  distance?: number;
  [key: string]: unknown;
}

export interface CognitiveState {
  attention: number;
  focus: number;
  workingMemory: number;
  processingSpeed: number;
  cognitiveLoad?: number;
  [key: string]: unknown;
}

export interface AffectiveState {
  valence: number;
  arousal: number;
  dominance: number;
  warmth: number;
  emotionalState?: string;
  [key: string]: unknown;
}

export interface ExpressiveState {
  energy: number;
  expressiveness: number;
  communicationStyle?: string;
  [key: string]: unknown;
}

export interface PresenceState {
  mode: string;
  cognitive: CognitiveState;
  affective: AffectiveState;
  expressive: ExpressiveState;
  spatial: SpatialPosition;
  distance?: number;
  timestamp?: number;
  [key: string]: unknown;
}

export interface MetricRowProps {
  label: string;
  value: number;
  range: [number, number];
  unit?: string;
  color?: string;
}
