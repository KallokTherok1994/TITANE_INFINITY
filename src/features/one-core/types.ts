/**
 * TITANE_INFINITY v16.2.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ ONE CORE v∞ — Types & Interfaces (OPUS #6)
 * ═══════════════════════════════════════════════════════════════════
 */

// État d'un centre
export interface CenterStatus {
  name: string;
  category: string;
  engines_count: number;
  active_engines: number;
  global_health: number;
  route: string;
}

// État global ONE CORE
export interface OneCoreState {
  version: string;
  codename: string;
  timestamp: number;
  global_health: number;
  consciousness_level: number;
  coherence_score: number;
  total_engines: number;
  active_engines: number;
  total_centers: number;
  centers: CenterStatus[];
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  mode: string;
  uptime_seconds: number;
  last_sync: number;
}

// État d'un moteur
export interface EngineStatus {
  name: string;
  version: string;
  active: boolean;
  health: number;
  load: number;
  last_update: number;
  errors_count: number;
  warnings_count: number;
}

// Commande ONE CORE
export interface OneCoreCommand {
  id: string;
  name: string;
  description: string;
  category: string;
  dangerous: boolean;
}

// Résultat d'action
export interface OneCoreActionResult {
  success: boolean;
  action: string;
  message: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

// Diagnostic
export interface OneCoreDiagnostic {
  timestamp: number;
  duration_ms: number;
  tests_total: number;
  tests_passed: number;
  tests_failed: number;
  warnings: string[];
  errors: string[];
  recommendations: string[];
  overall_status: string;
}

// Métriques temps réel
export interface OneCoreMetrics {
  timestamp: number;
  requests_per_second: number;
  avg_response_time_ms: number;
  active_connections: number;
  memory_pressure: number;
  cpu_pressure: number;
  io_pressure: number;
  queue_depth: number;
}

// Tabs ONE CORE
export type OneCoreTabs = 'overview' | 'centers' | 'commands' | 'diagnostic' | 'metrics';

export const ONE_CORE_TABS: Array<{ id: OneCoreTabs; label: string; icon: string }> = [
  { id: 'overview', label: "Vue d'ensemble", icon: '🌌' },
  { id: 'centers', label: 'Centres', icon: '🏛️' },
  { id: 'commands', label: 'Commandes', icon: '⚡' },
  { id: 'diagnostic', label: 'Diagnostic', icon: '🔍' },
  { id: 'metrics', label: 'Métriques', icon: '📊' },
];

// Constantes
export const CONSCIOUSNESS_LEVELS = [
  { level: 0, name: 'Dormant', color: '#666' },
  { level: 1, name: 'Réactif', color: '#00aaff' },
  { level: 2, name: 'Conscient', color: '#00ff88' },
  { level: 3, name: 'Éveillé', color: '#ffaa00' },
  { level: 4, name: 'Transcendant', color: '#ff00ff' },
];

export const SYSTEM_MODES = [
  { id: 'normal', name: 'Normal', color: '#00ff88' },
  { id: 'degraded', name: 'Dégradé', color: '#ffaa00' },
  { id: 'maintenance', name: 'Maintenance', color: '#00aaff' },
  { id: 'emergency', name: 'Urgence', color: '#ff4444' },
  { id: 'performance', name: 'Performance', color: '#ff00ff' },
  { id: 'eco', name: 'Économie', color: '#88ff88' },
];
