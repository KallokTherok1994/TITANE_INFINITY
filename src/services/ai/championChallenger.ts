/**
 * TITANE∞ — OMEGA CHAMPION/CHALLENGER SCAFFOLD
 * ═══════════════════════════════════════════════════════════════════
 * Minimal comparison scaffold for Lock #2.
 * Reads config/championChallenger.json (read-only at runtime).
 * Logs divergences when comparison is enabled.
 * Does NOT alter the main request path — sidecar only.
 *
 * Constitution: I1 (no fake PASS), I3 (no hidden routing), I6 (minimal patch)
 * Lock: #2 — CHAMPION_CHALLENGER_READY
 * ═══════════════════════════════════════════════════════════════════
 */

import type { CanonicalMode, EffortLevel, ModelClass } from './omegaModeClassifier';

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

  // Static fallback — matches config/championChallenger.json structure
  cachedRegistry = {
    version: '1.0.0',
    lock: '#2',
    champions: {
      DIRECT: { provider: 'ollama', model: 'sonnet', confidence_threshold: 0.8 },
      CLARIFY_LIGHT: { provider: 'ollama', model: 'sonnet', confidence_threshold: 0.68 },
      DEEP_REASONING: { provider: 'gemini', model: 'opus', confidence_threshold: 0.85 },
      ARCHITECT: { provider: 'gemini', model: 'opus', confidence_threshold: 0.87 },
      REPAIR: { provider: 'ollama', model: 'sonnet', confidence_threshold: 0.8 },
      CERTIFY: { provider: 'gemini', model: 'opus', confidence_threshold: 0.88 },
      EXPLORATION: { provider: 'ollama', model: 'sonnet', confidence_threshold: 0.67 },
      SHADOW_LEARNING: { provider: 'ollama', model: 'sonnet', confidence_threshold: 1.0 },
    },
    challengers: {
      DIRECT: [{ provider: 'gemini', model: 'haiku', rationale: 'Lower latency' }],
      DEEP_REASONING: [{ provider: 'claude', model: 'opus', rationale: 'Stronger CoT' }],
      ARCHITECT: [{ provider: 'claude', model: 'opus', rationale: 'Better synthesis' }],
      CERTIFY: [
        { provider: 'openai', model: 'opus', rationale: 'Native reasoning_effort' },
      ],
    },
    comparison: {
      enabled: false,
      sample_rate: 0.0,
      max_parallel_calls: 1,
      log_divergence: true,
      metrics: ['latency_ms', 'token_count', 'accuracy_score', 'honesty_score'],
    },
    promotion_rules: {
      min_samples: 50,
      accuracy_improvement: 0.05,
      latency_penalty_ms: 2000,
      require_human_approval: true,
    },
  };

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
    console.warn(
      `[ChampionChallenger] DIVERGENCE mode=${result.mode} ` +
        `champion=${result.champion.provider}/${result.champion.model} ` +
        `challenger=${result.challenger.provider}/${result.challenger.model} ` +
        `detail=${result.divergence_detail ?? 'none'}`
    );
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
