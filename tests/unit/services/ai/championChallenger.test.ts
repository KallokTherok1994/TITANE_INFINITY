/**
 * TITANE∞ — Tests ChampionChallenger (Phase F1)
 * Scaffold OMEGA Lock #2 — comparaison champion vs challenger, divergence tracking
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => mockLogger,
  logger: mockLogger,
}));

import {
  loadRegistry,
  getChampion,
  getChallengers,
  shouldCompare,
  recordComparison,
  getComparisonStats,
  shouldPromoteChallenger,
  getPromotionRules,
  resetRegistryCache,
} from '@/services/ai/championChallenger';
import type { ComparisonResult } from '@/services/ai/championChallenger';
import type { CanonicalMode } from '@/services/ai/omegaModeClassifier';

describe('ChampionChallenger', () => {
  beforeEach(() => {
    resetRegistryCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetRegistryCache();
  });

  // ── loadRegistry ──────────────────────────────────────────────
  describe('loadRegistry()', () => {
    it('charge le registre sans erreur', () => {
      const registry = loadRegistry();
      expect(registry).toBeDefined();
      expect(registry.lock).toBe('#2');
    });

    it('retourne un objet avec champions et challengers', () => {
      const registry = loadRegistry();
      expect(registry.champions).toBeDefined();
      expect(registry.challengers).toBeDefined();
    });

    it('retourne le même objet en cache au deuxième appel', () => {
      const r1 = loadRegistry();
      const r2 = loadRegistry();
      expect(r1).toBe(r2);
    });
  });

  // ── getChampion ───────────────────────────────────────────────
  describe('getChampion()', () => {
    it('retourne le champion ollama pour mode DIRECT', () => {
      const champion = getChampion('DIRECT' as CanonicalMode);
      expect(champion).not.toBeNull();
      expect(champion?.provider).toBe('ollama');
      expect(champion?.model).toBe('gemma2:2b');
    });

    it('retourne null pour un mode inexistant', () => {
      const champion = getChampion('UNKNOWN_MODE' as CanonicalMode);
      expect(champion).toBeNull();
    });

    it('confidence_threshold est entre 0 et 1', () => {
      const champion = getChampion('DIRECT' as CanonicalMode);
      if (champion) {
        expect(champion.confidence_threshold).toBeGreaterThan(0);
        expect(champion.confidence_threshold).toBeLessThanOrEqual(1);
      }
    });
  });

  // ── getChallengers ────────────────────────────────────────────
  describe('getChallengers()', () => {
    it('retourne un tableau (vide ou rempli) pour un mode connu', () => {
      const challengers = getChallengers('DIRECT' as CanonicalMode);
      expect(Array.isArray(challengers)).toBe(true);
    });

    it('retourne tableau vide pour mode inconnu', () => {
      const challengers = getChallengers('UNKNOWN_MODE' as CanonicalMode);
      expect(challengers).toEqual([]);
    });
  });

  // ── shouldCompare ─────────────────────────────────────────────
  describe('shouldCompare()', () => {
    it('retourne un boolean', () => {
      const result = shouldCompare('DIRECT' as CanonicalMode);
      expect(typeof result).toBe('boolean');
    });

    it('retourne false si comparison.enabled = false (mock config)', () => {
      // On peut vérifier le comportement via la config chargée
      const registry = loadRegistry();
      if (!registry.comparison.enabled) {
        expect(shouldCompare('DIRECT' as CanonicalMode)).toBe(false);
      } else {
        // Avec sample_rate <= 0, retourne false
        if (registry.comparison.sample_rate <= 0) {
          expect(shouldCompare('DIRECT' as CanonicalMode)).toBe(false);
        } else {
          // Avec sample_rate > 0, le résultat est stochastique — on vérifie juste le type
          const r = shouldCompare('DIRECT' as CanonicalMode);
          expect(typeof r).toBe('boolean');
        }
      }
    });
  });

  // ── recordComparison + getComparisonStats ─────────────────────
  describe('recordComparison() + getComparisonStats()', () => {
    const MODE: CanonicalMode = 'DIRECT' as CanonicalMode;

    const makeResult = (divergence: boolean, challengerFaster: boolean): ComparisonResult => ({
      mode: MODE,
      champion: { provider: 'ollama', model: 'gemma2:2b', latency_ms: challengerFaster ? 200 : 100, token_count: 50 },
      challenger: { provider: 'claude', model: 'claude-3-haiku', latency_ms: challengerFaster ? 100 : 200, token_count: 50 },
      divergence,
      divergence_detail: divergence ? 'different answer' : undefined,
    });

    it('retourne null si aucune comparaison enregistrée', () => {
      expect(getComparisonStats(MODE)).toBeNull();
    });

    it('enregistre une comparaison et retourne des stats', () => {
      recordComparison(makeResult(false, false));
      const stats = getComparisonStats(MODE);
      expect(stats).not.toBeNull();
      expect(stats!.totalComparisons).toBe(1);
    });

    it('incrémente divergenceCount sur divergence=true', () => {
      recordComparison(makeResult(true, false));
      const stats = getComparisonStats(MODE);
      expect(stats!.divergenceCount).toBe(1);
    });

    it('ne compte pas divergenceCount sur divergence=false', () => {
      recordComparison(makeResult(false, false));
      const stats = getComparisonStats(MODE);
      expect(stats!.divergenceCount).toBe(0);
    });

    it('incrémente challengerWins quand challenger est plus rapide', () => {
      recordComparison(makeResult(false, true)); // challenger plus rapide
      const stats = getComparisonStats(MODE);
      expect(stats!.challengerWins).toBeGreaterThanOrEqual(0);
      // Challenger wins si latency delta > 0 et tokens <=
      expect(stats!.challengerWins).toBe(1);
    });

    it('accumule plusieurs comparaisons correctement', () => {
      recordComparison(makeResult(false, false));
      recordComparison(makeResult(true, false));
      recordComparison(makeResult(false, true));
      const stats = getComparisonStats(MODE);
      expect(stats!.totalComparisons).toBe(3);
      expect(stats!.divergenceCount).toBe(1);
    });
  });

  // ── getPromotionRules ─────────────────────────────────────────
  describe('getPromotionRules()', () => {
    it('retourne des règles de promotion avec min_samples > 0', () => {
      const rules = getPromotionRules();
      expect(rules.min_samples).toBeGreaterThan(0);
    });

    it('accuracy_improvement est entre 0 et 1', () => {
      const rules = getPromotionRules();
      expect(rules.accuracy_improvement).toBeGreaterThan(0);
      expect(rules.accuracy_improvement).toBeLessThanOrEqual(1);
    });
  });

  // ── shouldPromoteChallenger ───────────────────────────────────
  describe('shouldPromoteChallenger()', () => {
    it('retourne false si aucune comparaison (pas assez de données)', () => {
      expect(shouldPromoteChallenger('DIRECT' as CanonicalMode)).toBe(false);
    });

    it('retourne false si require_human_approval=true (garde humain)', () => {
      const rules = getPromotionRules();
      if (rules.require_human_approval) {
        // Ajouter beaucoup de comparaisons gagnantes pour challenger
        for (let i = 0; i < 20; i++) {
          recordComparison({
            mode: 'DIRECT' as CanonicalMode,
            champion: { provider: 'ollama', model: 'gemma2:2b', latency_ms: 200, token_count: 50 },
            challenger: { provider: 'claude', model: 'claude-3-haiku', latency_ms: 80, token_count: 40 },
            divergence: false,
          });
        }
        // Même avec données suffisantes, require_human_approval doit bloquer la promotion auto
        expect(shouldPromoteChallenger('DIRECT' as CanonicalMode)).toBe(false);
      }
    });
  });

  // ── resetRegistryCache ────────────────────────────────────────
  describe('resetRegistryCache()', () => {
    it('force le rechargement du registre au prochain loadRegistry()', () => {
      const r1 = loadRegistry();
      resetRegistryCache();
      const r2 = loadRegistry();
      // Après reset, le cache est rechargé — les deux instances doivent être équivalentes
      expect(r2.version).toBe(r1.version);
    });
  });
});
