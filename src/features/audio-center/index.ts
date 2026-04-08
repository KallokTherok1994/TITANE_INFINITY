/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — AUDIO CENTER MODULE
 *   Exports publics du Centre Audio
 * ═══════════════════════════════════════════════════════════════════
 */

// Types
export * from './types';

// Services
export { audioService } from './services/audioService';

// Hooks
export { useAudio } from './hooks/useAudio';

// Components
export { AudioCenterPage } from './AudioCenterPage';
export { default as AudioCenterPageDefault } from './AudioCenterPage';
