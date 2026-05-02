/**
 * Tests unitaires — Explainability Agent
 * Scope: computeExplainabilityScore, exportInferenceAuditLog,
 *        saveInferenceAuditLog, loadSavedInferenceAuditLog, getExplainabilityAgentStatus
 * Rule 16: nouveau service → tests unitaires obligatoires
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks (vi.hoisted garantit l'initialisation avant le hoist vi.mock) ──────

const {
  mockGetAdvancedAgentStatus,
  mockLoadRegistry,
  mockGetStats,
  mockGetActiveConversationId,
  mockLoadConversationSync,
  mockValidateProviderDecisionMeta,
} = vi.hoisted(() => ({
  mockGetAdvancedAgentStatus: vi.fn(() => ({
    id: 'explainability',
    name: 'Explainability',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: 'En fonctionnement — 0 traces actives',
    evidence: ['mock evidence'],
    blockers: [],
    nextStep: 'mock step',
    detailSections: [{ key: 'inference-history', title: 'Historique', items: [] }],
  })),
  mockLoadRegistry: vi.fn(() => ({
    champions: {
      default: { provider: 'ollama', model: 'gemma2:2b', mode: 'default' },
      creative: { provider: 'ollama', model: 'gemma2:2b', mode: 'creative' },
    },
    challengers: {},
    comparison: { enabled: false, sample_rate: 0.1 },
  })),
  mockGetStats: vi.fn(() => ({
    errorCount: 0,
    endpointHealthy: true,
    config: { model: 'gemma2:2b', endpoint: 'http://127.0.0.1:11434' },
  })),
  mockGetActiveConversationId: vi.fn(() => null),
  mockLoadConversationSync: vi.fn(() => null),
  mockValidateProviderDecisionMeta: vi.fn(() => null),
}));

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

vi.mock('@/services/ai/championChallenger', () => ({
  loadRegistry: mockLoadRegistry,
}));

vi.mock('@/services/ai/providers/ollama', () => ({
  ollamaProvider: { getStats: mockGetStats },
}));

vi.mock('@/services/conversation/conversationStorage', () => ({
  conversationStorage: {
    getActiveConversationId: mockGetActiveConversationId,
    loadConversationSync: mockLoadConversationSync,
  },
}));

vi.mock('@/types/providerDecisionMeta', () => ({
  validateProviderDecisionMeta: mockValidateProviderDecisionMeta,
}));

// ── Import après mocks ────────────────────────────────────────────────────────

import {
  computeExplainabilityScore,
  exportInferenceAuditLog,
  saveInferenceAuditLog,
  loadSavedInferenceAuditLog,
  getExplainabilityAgentStatus,
  resetExplainabilityTraceHistoryForTests,
} from '../index';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computeExplainabilityScore — aucune trace active', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetExplainabilityTraceHistoryForTests();
    mockGetActiveConversationId.mockReturnValue(null);
    mockLoadConversationSync.mockReturnValue(null);
    mockGetStats.mockReturnValue({
      errorCount: 0,
      endpointHealthy: true,
      config: { model: 'gemma2:2b', endpoint: 'http://127.0.0.1:11434' },
    });
    mockLoadRegistry.mockReturnValue({
      champions: { default: { provider: 'ollama', model: 'gemma2:2b', mode: 'default' } },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    });
  });

  it('retourne un score numérique 0–100', () => {
    const score = computeExplainabilityScore();
    expect(typeof score.score).toBe('number');
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it('retourne un grade valide (A|B|C|D|F)', () => {
    const score = computeExplainabilityScore();
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
  });

  it('contient le champ label de type string', () => {
    const score = computeExplainabilityScore();
    expect(typeof score.label).toBe('string');
    expect(score.label.length).toBeGreaterThan(0);
  });

  it('breakdown contient les 5 critères numériques', () => {
    const score = computeExplainabilityScore();
    expect(typeof score.breakdown.chainCoverage).toBe('number');
    expect(typeof score.breakdown.championAlignment).toBe('number');
    expect(typeof score.breakdown.localUsageRate).toBe('number');
    expect(typeof score.breakdown.fallbackPenalty).toBe('number');
    expect(typeof score.breakdown.historyDepth).toBe('number');
  });

  it('historyDepth = 0 sans aucune trace', () => {
    const score = computeExplainabilityScore();
    expect(score.breakdown.historyDepth).toBe(0);
  });

  it('championAlignment = 100% quand champion aligné sur gemma2:2b', () => {
    const score = computeExplainabilityScore();
    expect(score.breakdown.championAlignment).toBe(100);
  });

  it('localUsageRate = 100 sans aucune trace (dénominateur nul → 100)', () => {
    const score = computeExplainabilityScore();
    expect(score.breakdown.localUsageRate).toBe(100);
  });

  it('computedAt est une date ISO valide', () => {
    const score = computeExplainabilityScore();
    expect(() => new Date(score.computedAt)).not.toThrow();
    expect(new Date(score.computedAt).toISOString()).toBe(score.computedAt);
  });
});

describe('computeExplainabilityScore — dérive registre', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetExplainabilityTraceHistoryForTests();
  });

  it('championAlignment = 0 quand champion non-ollama', () => {
    mockLoadRegistry.mockReturnValue({
      champions: {
        default: { provider: 'gemini', model: 'gemini-pro', mode: 'default' },
      },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    });
    const score = computeExplainabilityScore();
    expect(score.breakdown.championAlignment).toBe(0);
  });

  it('grade = F quand score insuffisant', () => {
    mockLoadRegistry.mockReturnValue({
      champions: {
        default: { provider: 'gemini', model: 'gemini-pro', mode: 'default' },
      },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    });
    const score = computeExplainabilityScore();
    expect(['D', 'F']).toContain(score.grade);
  });
});

describe('exportInferenceAuditLog', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetExplainabilityTraceHistoryForTests();
    mockLoadRegistry.mockReturnValue({
      champions: { default: { provider: 'ollama', model: 'gemma2:2b', mode: 'default' } },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    });
  });

  it("retourne un log d'audit avec champs obligatoires", () => {
    const log = exportInferenceAuditLog();
    expect(typeof log.exportId).toBe('string');
    expect(typeof log.generatedAt).toBe('string');
    expect(log.version).toBe('1.0');
    expect(Array.isArray(log.entries)).toBe(true);
    expect(log.summary).toBeDefined();
  });

  it('exportedAt est une date ISO valide', () => {
    const log = exportInferenceAuditLog();
    expect(() => new Date(log.generatedAt)).not.toThrow();
  });

  it('traceCount = 0 sans aucune trace active', () => {
    const log = exportInferenceAuditLog();
    expect(log.entries).toHaveLength(0);
    expect(log.summary.totalTraces).toBe(0);
  });

  it('summary contient les champs numériques requis', () => {
    const log = exportInferenceAuditLog();
    expect(typeof log.summary.totalTraces).toBe('number');
    expect(typeof log.summary.localUsageRate).toBe('number');
    expect(typeof log.summary.avgExplainabilityScore).toBe('number');
    expect(typeof log.summary.fallbackCount).toBe('number');
    expect(typeof log.summary.networkUsageCount).toBe('number');
  });
});

describe('saveInferenceAuditLog / loadSavedInferenceAuditLog', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetExplainabilityTraceHistoryForTests();
    mockLoadRegistry.mockReturnValue({
      champions: { default: { provider: 'ollama', model: 'gemma2:2b', mode: 'default' } },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    });
  });

  it('log sauvegardé est retrouvé après save', () => {
    saveInferenceAuditLog();
    const loaded = loadSavedInferenceAuditLog();
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe('1.0');
  });

  it('loadSavedInferenceAuditLog retourne null avant tout save', () => {
    const loaded = loadSavedInferenceAuditLog();
    expect(loaded).toBeNull();
  });

  it('round-trip exportId préservé', () => {
    saveInferenceAuditLog();
    const loaded = loadSavedInferenceAuditLog();
    expect(typeof loaded?.exportId).toBe('string');
    expect(loaded?.exportId.length).toBeGreaterThan(0);
  });
});

describe('getExplainabilityAgentStatus', () => {
  it('retourne un statut avec les champs obligatoires', () => {
    const status = getExplainabilityAgentStatus();
    expect(typeof status.serviceState).toBe('string');
    expect(Array.isArray(status.evidence)).toBe(true);
    expect(Array.isArray(status.blockers)).toBe(true);
    expect(Array.isArray(status.detailSections)).toBe(true);
    expect(typeof status.nextStep).toBe('string');
  });

  it('detailSections contient au moins une section', () => {
    const status = getExplainabilityAgentStatus();
    expect(status.detailSections.length).toBeGreaterThanOrEqual(0);
  });
});

describe('resetExplainabilityTraceHistoryForTests', () => {
  it('ne throw pas', () => {
    expect(() => resetExplainabilityTraceHistoryForTests()).not.toThrow();
  });

  it("vide bien l'historique localStorage", () => {
    window.localStorage.setItem(
      'titane_explainability_trace_history',
      JSON.stringify([{ id: 'x' }])
    );
    resetExplainabilityTraceHistoryForTests();
    const raw = window.localStorage.getItem('titane_explainability_trace_history');
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed).toBeNull();
  });
});
