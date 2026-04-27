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
import { secureInvoke } from '@/lib/security';

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
 * v30.3.0: True random sampling replaces deterministic hash-based sampling
 */
export function shouldCompare(mode: CanonicalMode): boolean {
  const registry = loadRegistry();
  if (!registry.comparison.enabled) return false;
  if (registry.comparison.sample_rate <= 0) return false;

  // v30.3.0: True random sampling for unbiased A/B testing
  return Math.random() < registry.comparison.sample_rate;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TRACKING — v30.3.0: Active divergence metrics
// ─────────────────────────────────────────────────────────────────────────────

/** In-memory comparison history for promotion evaluation */
interface ComparisonStats {
  totalComparisons: number;
  divergenceCount: number;
  challengerWins: number; // challenger had lower latency OR fewer tokens
  avgLatencyDelta: number; // champion - challenger (negative = challenger faster)
  lastUpdated: number;
}

const comparisonHistory = new Map<string, ComparisonStats>();

/**
 * Record a comparison result with divergence tracking.
 * v30.3.0: Tracks win/loss ratio and latency delta for promotion evaluation
 */
export function recordComparison(result: ComparisonResult): void {
  const registry = loadRegistry();

  // Always track metrics, even if log_divergence is off
  const key = result.mode;
  const existing = comparisonHistory.get(key) || {
    totalComparisons: 0,
    divergenceCount: 0,
    challengerWins: 0,
    avgLatencyDelta: 0,
    lastUpdated: 0,
  };

  existing.totalComparisons++;
  if (result.divergence) existing.divergenceCount++;

  // Challenger "wins" if faster and uses fewer tokens
  const latencyDelta = result.champion.latency_ms - result.challenger.latency_ms;
  if (latencyDelta > 0 && result.challenger.token_count <= result.champion.token_count) {
    existing.challengerWins++;
  }

  // Running average of latency delta
  existing.avgLatencyDelta =
    (existing.avgLatencyDelta * (existing.totalComparisons - 1) + latencyDelta) /
    existing.totalComparisons;
  existing.lastUpdated = Date.now();

  comparisonHistory.set(key, existing);

  // Log divergence if enabled
  if (registry.comparison.log_divergence && result.divergence) {
    logger.warn('DIVERGENCE detected', {
      mode: result.mode,
      champion: `${result.champion.provider}/${result.champion.model}`,
      challenger: `${result.challenger.provider}/${result.challenger.model}`,
      detail: result.divergence_detail ?? 'none',
      stats: {
        total: existing.totalComparisons,
        divergences: existing.divergenceCount,
        challengerWins: existing.challengerWins,
        avgLatencyDeltaMs: Math.round(existing.avgLatencyDelta),
      },
    });
  }
}

/**
 * v30.3.0: Get comparison stats for a given mode (for promotion evaluation)
 */
export function getComparisonStats(mode: CanonicalMode): ComparisonStats | null {
  return comparisonHistory.get(mode) ?? null;
}

/**
 * v30.3.0: Evaluate if a challenger should be promoted based on comparison history
 */
export function shouldPromoteChallenger(mode: CanonicalMode): boolean {
  const stats = comparisonHistory.get(mode);
  if (!stats) return false;

  const rules = getPromotionRules();
  if (stats.totalComparisons < rules.min_samples) return false;

  const winRate = stats.challengerWins / stats.totalComparisons;
  const latencyOk = stats.avgLatencyDelta > -rules.latency_penalty_ms; // negative = challenger slower

  // Challenger promoted if win rate >= 70% and latency is acceptable
  return winRate >= 0.7 && latencyOk;
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
  comparisonHistory.clear();
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME VALIDATION — v31.2.13: Proactive champion availability check
// ─────────────────────────────────────────────────────────────────────────────

export interface ChampionAvailabilityResult {
  available: boolean;
  championModel: string;
  installedModels: string[];
  warning: string | null;
}

/**
 * Proactively validates that the declared champion model is installed in Ollama.
 * Called at startup — non-blocking. Emits a structured warning if champion is absent.
 * Never throws; returns `available: false` with warning on any error.
 *
 * Uses the canonical `ai_check_ollama_status` IPC command via secureInvoke.
 * Rule 5 One Door: all IPC routed through secureInvoke.
 */
export async function validateChampionAvailability(
  mode: CanonicalMode = 'DIRECT',
): Promise<ChampionAvailabilityResult> {
  const champion = getChampion(mode);
  const championModel = champion?.model ?? 'gemma2:2b';

  try {
    const status = await secureInvoke<{ ok: boolean; content?: { models?: string[] } }>(
      'ai_check_ollama_status',
    );

    if (!status?.ok || !status.content) {
      logger.warn('[ChampionChallenger] Ollama offline — cannot validate champion availability', {
        championModel,
        mode,
      });
      return { available: false, championModel, installedModels: [], warning: 'OLLAMA_OFFLINE' };
    }

    const installedModels: string[] = (status.content.models ?? []).map((m: string) =>
      m.toLowerCase(),
    );

    const available =
      installedModels.includes(championModel.toLowerCase()) ||
      installedModels.some((m) => m.startsWith((championModel.split(':')[0] ?? championModel).toLowerCase()));

    if (!available) {
      logger.warn(
        `[ChampionChallenger] Champion model "${championModel}" not found in Ollama. ` +
          `Installed: ${installedModels.join(', ')}. Fallback will activate automatically.`,
        { championModel, mode, installedModels },
      );
    } else {
      logger.debug(`[ChampionChallenger] Champion "${championModel}" confirmed available.`, {
        mode,
      });
    }

    return {
      available,
      championModel,
      installedModels,
      warning: available ? null : 'CHAMPION_MODEL_NOT_INSTALLED',
    };
  } catch (err) {
    logger.warn('[ChampionChallenger] Failed to validate champion availability', {
      error: String(err),
      championModel,
      mode,
    });
    return {
      available: false,
      championModel,
      installedModels: [],
      warning: 'VALIDATION_ERROR',
    };
  }
}
