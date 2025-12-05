/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * TITANE∞ v15.0 - Type Constants
 * Constantes runtime pour types system.d.ts
 */

import type { HealthStatus } from './system';

/**
 * Couleurs CSS pour chaque HealthStatus
 */
export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  Healthy: 'var(--success-500)',
  Degraded: 'var(--warning-500)',
  Critical: 'var(--danger-500)',
  Offline: 'var(--gray-500)'
};

/**
 * Mapping module names vers icônes
 */
export const MODULE_ICONS: Record<string, string> = {
  Helios: 'helios',
  Nexus: 'nexus',
  Harmonia: 'harmonia',
  Sentinel: 'sentinel',
  Watchdog: 'watchdog',
  SelfHeal: 'self-heal',
  AdaptiveEngine: 'adaptive-engine',
  Memory: 'memory'
};
