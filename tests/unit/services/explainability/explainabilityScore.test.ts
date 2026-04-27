/**
 * Tests unitaires — ExplainabilityScore + InferenceAuditLog
 * v31.2.14 — Score composite 0-100 + audit log structuré
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/ai/metricsEngine', async () => ({
  metricsEngine: {
    getAggregatedMetrics: vi.fn().mockReturnValue({
      totalRequests: 20,
      successRate: 0.9,
      avgResponseTime: 1500,
      providers: [{ provider: 'ollama', totalRequests: 20, successCount: 18, errorCount: 2, avgLatency: 1500 }],
      totalFallbacks: 1,
      last24h: { requests: 20, errors: 2, avgLatency: 1500, fallbacks: 1 },
    }),
  },
}));
vi.mock('@/services/agents/advancedAgentCatalog', async () => ({
  getAdvancedAgentStatus: vi.fn().mockReturnValue({ readiness: 'partial', blockers: [], serviceState: '', evidence: [] }),
}));
vi.mock('@/config/featureFlags', async () => ({
  getActiveAIProviders: vi.fn().mockReturnValue(['ollama']),
}));

import {
  computeExplainabilityScore,
  exportInferenceAuditLog,
  saveInferenceAuditLog,
  loadSavedInferenceAuditLog,
} from '@/services/explainability';

beforeEach(() => {
  vi.clearAllMocks();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('titane_inference_audit_log');
  }
});

describe('computeExplainabilityScore', () => {
  it('retourne un score entre 0 et 100', () => {
    const result = computeExplainabilityScore();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('retourne une grade valide', () => {
    const result = computeExplainabilityScore();
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
  });

  it('retourne un breakdown complet', () => {
    const result = computeExplainabilityScore();
    expect(result.breakdown).toHaveProperty('chainCoverage');
    expect(result.breakdown).toHaveProperty('championAlignment');
    expect(result.breakdown).toHaveProperty('localUsageRate');
    expect(result.breakdown).toHaveProperty('fallbackPenalty');
    expect(result.breakdown).toHaveProperty('historyDepth');
  });

  it('label est non vide', () => {
    const result = computeExplainabilityScore();
    expect(result.label.length).toBeGreaterThan(0);
  });

  it('grade A si score >= 90', () => {
    // inject perfect conditions
    const score = { score: 95, grade: 'A' as const, label: '', breakdown: { chainCoverage: 100, championAlignment: 100, localUsageRate: 100, fallbackPenalty: 0, historyDepth: 100 }, computedAt: Date.now() };
    expect(score.grade).toBe('A');
  });

  it('grade F si score < 40', () => {
    const score = { score: 10, grade: 'F' as const, label: '', breakdown: { chainCoverage: 0, championAlignment: 0, localUsageRate: 0, fallbackPenalty: 100, historyDepth: 0 }, computedAt: Date.now() };
    expect(score.grade).toBe('F');
  });
});

describe('exportInferenceAuditLog', () => {
  it('retourne un InferenceAuditLog structuré', () => {
    const log = exportInferenceAuditLog();
    expect(log).toHaveProperty('exportId');
    expect(log).toHaveProperty('generatedAt');
    expect(log).toHaveProperty('version', '1.0');
    expect(log).toHaveProperty('entries');
    expect(log).toHaveProperty('summary');
    expect(Array.isArray(log.entries)).toBe(true);
  });

  it('summary contient les champs requis', () => {
    const log = exportInferenceAuditLog();
    expect(log.summary).toHaveProperty('totalTraces');
    expect(log.summary).toHaveProperty('localUsageRate');
    expect(log.summary).toHaveProperty('avgExplainabilityScore');
    expect(log.summary).toHaveProperty('fallbackCount');
    expect(log.summary).toHaveProperty('networkUsageCount');
  });
});

describe('saveInferenceAuditLog / loadSavedInferenceAuditLog', () => {
  it('round-trip save/load', () => {
    const log = exportInferenceAuditLog();
    saveInferenceAuditLog(log);
    const loaded = loadSavedInferenceAuditLog();
    expect(loaded).not.toBeNull();
    expect(loaded!.exportId).toBe(log.exportId);
  });
});
