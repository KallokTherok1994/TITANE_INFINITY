/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO SERVICES INDEX
 *   Point d'entrée centralisé pour tous les services audio
 * ═══════════════════════════════════════════════════════════════════
 */

// State Machine (P1.1)
export {
  audioStateMachine,
  AudioStateMachine,
  type AudioConversationState,
  type AudioEvent,
  type StateChangeListener,
  type AudioStateMachineConfig,
} from './audioStateMachine';

// Health Check (P1.5)
export {
  audioHealthService,
  type AudioHealthReport,
  type HealthTestResult,
} from './audioHealthCheck';
