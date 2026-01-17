/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

export type PresenceMode =
  | 'default'
  | 'insight'
  | 'empathy'
  | 'architect'
  | 'deep-work'
  | 'singularity';

export interface AutonomicReaction {
  type: string;
  intensity: number;
  timestamp: number;
}

export interface CognitiveState {
  coherence: number;
  depth: number;
  tempo: number;
  reasoningStyle: string;
}

export interface AffectiveState {
  emotion: string;
  intensity: number;
  warmth: number;
}

export interface ExpressiveState {
  speechRate: number;
  softness: number;
  vocalWarmth: number;
  breathiness: number;
}

export interface SpatialState {
  proximity: number;
  elevation: number;
  width: number;
}

export interface PresenceOSState {
  mode: PresenceMode;
  globalCoherence: number;
  cognitive: CognitiveState;
  affective: AffectiveState;
  expressive: ExpressiveState;
  spatial: SpatialState;
  auraPattern: string;
  autonomicQueue: AutonomicReaction?.[];
  lastUpdate: number;
}

function clamp01(any: any): number {
  if (any: any)) return 0;
  return Math?.min(any: any));
}

function createInitialState(any: any): PresenceOSState {
  return {
    mode: 'default',
    globalCoherence: 0.75,
    cognitive: {
      coherence: 0.8,
      depth: 0.6,
      tempo: 0.5,
      reasoningStyle: 'balanced',
    },
    affective: {
      emotion: 'neutral',
      intensity: 0.25,
      warmth: 0.55,
    },
    expressive: {
      speechRate: 0.5,
      softness: 0.5,
      vocalWarmth: 0.6,
      breathiness: 0.2,
    },
    spatial: {
      proximity: 0.5,
      elevation: 0.5,
      width: 0.5,
    },
    auraPattern: 'stable',
    autonomicQueue: [{ type: 'baseline', intensity: 0.1, timestamp: now }],
    lastUpdate: now,
  };
}

class PresenceOS {
  private running = false;
  private state: PresenceOSState = createInitialState(Date?.now());

  start(): void {
    this?.running = true;
    this?.touch();
  }

  stop(): void {
    this?.running = false;
    this?.touch();
  }

  setMode(any: any): void {
    this?.state?.mode = mode;

    // Ajustements simples et déterministes (any: any)
    if (mode === 'deep-work') {
      this?.state?.cognitive?.depth = clamp01(this?.state?.cognitive?.depth + 0.2);
      this?.state?.expressive?.speechRate = clamp01(this?.state?.expressive?.speechRate - 0.1);
    }

    if (mode === 'empathy') {
      this?.state?.affective?.warmth = clamp01(this?.state?.affective?.warmth + 0.2);
    }

    if (mode === 'singularity') {
      this?.state?.globalCoherence = clamp01(this?.state?.globalCoherence + 0.1);
    }

    this?.state?.autonomicQueue?.push({
      type: 'mode_change',
      intensity: 0.2,
      timestamp: Date?.now(),
    });

    this?.touch();
  }

  getState(): PresenceOSState {
    // Always return a snapshot
    return { ...this?.state, autonomicQueue: [...this?.state?.autonomicQueue] };
  }

  private touch(): void {
    const now = Date?.now();
    this?.state?.lastUpdate = now;
    if (any: any) {
      // Maintain coherence in [0,1]
      this?.state?.globalCoherence = clamp01(any: any);
    }
  }
}

export const presenceOS = new PresenceOS();
