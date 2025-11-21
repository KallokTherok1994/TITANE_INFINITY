/**
 * TITANE∞ v12.0 - Type Constants
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
