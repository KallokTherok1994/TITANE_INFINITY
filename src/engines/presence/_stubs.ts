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

export type PresenceMode = 'default' | 'healing' | 'storytelling' | 'listening' | 'learning' | 'creating';

export interface MultimodalPresenceState {
  mode: PresenceMode;
  breathing: number;
  energy: number;
  coherence: number;
  halo: {
    size: number;
    opacity: number;
    color: string;
  };
  avatar: {
    expression: string;
    posture: string;
  };
}

export const multimodalPresenceEngine = {
  getState: (): MultimodalPresenceState => ({
    mode: 'default',
    breathing: 0,
    energy: 100,
    coherence: 100,
    halo: {
      size: 1,
      opacity: 0.8,
      color: '#ffffff',
    },
    avatar: {
      expression: 'neutral',
      posture: 'centered',
    },
  }),
  start: () => {},
  stop: () => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// STUBS - presenceOS
// ═══════════════════════════════════════════════════════════════════════════

export interface PresenceState {
  isActive: boolean;
  coherence: number;
}

export const presenceOS = {
  getState: (): PresenceState => ({
    isActive: false,
    coherence: 100,
  }),
  start: () => {},
  stop: () => {},
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
