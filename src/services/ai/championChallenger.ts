/**
 * TITANE∞ — OMEGA CHAMPION/CHALLENGER SCAFFOLD
 * ═══════════════════════════════════════════════════════════════════
 * Minimal comparison scaffold for Lock #2.
 * Reads config/championChallenger.json as the single source of truth.
 * Logs divergences when comparison is enabled.
 * Can influence provider ordering through the canonical kernel.
 *
 * Constitution: I1 (no fake PASS), I3 (no hidden routing), I6 (minimal patch)
 * Lock: #2 — CHAMPION_CHALLENGER_READY
 * ═══════════════════════════════════════════════════════════════════
 */

import championChallengerRegistry from '../../../config/championChallenger.json';
import type { CanonicalMode } from './omegaModeClassifier';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChampionChallenger');

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ChampionEntry {
  provider: string;
  model: string;
  confidence_threshold: number;
}

export interface ChallengerEntry {
  provider: string;
  model: string;
  rationale: string;
}

export interface ComparisonConfig {
  enabled: boolean;
  sample_rate: number;
  max_parallel_calls: number;
  log_divergence: boolean;
  metrics: string[];
}

export interface PromotionRules {
  min_samples: number;
  accuracy_improvement: number;
  latency_penalty_ms: number;
  require_human_approval: boolean;
}

export interface ChampionChallengerRegistry {
  version: string;
  lock: string;
  champions: Record<string, ChampionEntry>;
  challengers: Record<string, ChallengerEntry[]>;
  comparison: ComparisonConfig;
  promotion_rules: PromotionRules;
}

export interface ComparisonResult {
  mode: CanonicalMode;
  champion: {
    provider: string;
    model: string;
    latency_ms: number;
    token_count: number;
  };
  challenger: {
    provider: string;
    model: string;
    latency_ms: number;
    token_count: number;
  };
  divergence: boolean;
  divergence_detail?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY LOADER (lazy, cached)
// ─────────────────────────────────────────────────────────────────────────────

let cachedRegistry: ChampionChallengerRegistry | null = null;

/**
 * Load the champion/challenger registry from config.
 * In browser context, this is a static import fallback.
 * In Tauri context, could be loaded via IPC (future).
 */
export function loadRegistry(): ChampionChallengerRegistry {
  if (cachedRegistry) return cachedRegistry;

  cachedRegistry = championChallengerRegistry as ChampionChallengerRegistry;
  return cachedRegistry;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the champion provider/model for a given canonical mode.
 */
export function getChampion(mode: CanonicalMode): ChampionEntry | null {
  const registry = loadRegistry();
  return registry.champions[mode] ?? null;
}

/**
 * Get registered challengers for a given canonical mode.
 */
export function getChallengers(mode: CanonicalMode): ChallengerEntry[] {
  const registry = loadRegistry();
  return registry.challengers[mode] ?? [];
}

/**
 * Check if comparison is enabled and this turn should be sampled.
 */
export function shouldCompare(mode: CanonicalMode): boolean {
  const registry = loadRegistry();
  if (!registry.comparison.enabled) return false;
  if (registry.comparison.sample_rate <= 0) return false;

  // Deterministic sampling: hash mode name → probability
  const hash = mode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const probability = (hash % 100) / 100;
  return probability < registry.comparison.sample_rate;
}

/**
 * Record a comparison result (no-op placeholder — future: send to analytics).
 */
export function recordComparison(result: ComparisonResult): void {
  const registry = loadRegistry();
  if (!registry.comparison.log_divergence) return;

  if (result.divergence) {
    logger.warn('DIVERGENCE detected', {
      mode: result.mode,
      champion: `${result.champion.provider}/${result.champion.model}`,
      challenger: `${result.challenger.provider}/${result.challenger.model}`,
      detail: result.divergence_detail ?? 'none',
    });
  }
}

/**
 * Get promotion rules for evaluating whether a challenger should become champion.
 */
export function getPromotionRules(): PromotionRules {
  return loadRegistry().promotion_rules;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET (for tests)
// ─────────────────────────────────────────────────────────────────────────────

export function resetRegistryCache(): void {
  cachedRegistry = null;
}
