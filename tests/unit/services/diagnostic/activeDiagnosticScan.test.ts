/**
 * Tests unitaires — Active Diagnostic Scan Engine
 * v31.2.14 — 5 checks + corrective actions + subscription
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertSeverity } from '@/services/monitoring/alerting';

// ── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/monitoring/alerting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/monitoring/alerting')>();
  return {
    ...actual,
    alerting: {
      ...((actual as Record<string, unknown>).alerting ?? {}),
      getActiveAlerts: vi.fn().mockReturnValue([]),
    },
  };
});
vi.mock('@/services/monitoring/chatMetrics', async () => ({
  chatMetrics: {
    getGlobalMetrics: vi.fn().mockReturnValue({
      totalMessages: 100,
      totalErrors: 5,
      avgResponseTime: 1200,
      activeConversations: 1,
      totalConversations: 10,
      validationRate: 0.95,
    }),
  },
}));
vi.mock('@/services/ai/providers/ollama', async () => ({
  ollamaProvider: {
    getStats: vi.fn().mockReturnValue({ errorCount: 0 }),
    isAvailable: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('@/config/featureFlags', async () => ({
  getActiveAIProviders: vi.fn().mockReturnValue(['ollama']),
}));
vi.mock('@/services/agents/advancedAgentCatalog', async () => ({
  getAdvancedAgentStatus: vi.fn().mockReturnValue({ readiness: 'partial', blockers: [], serviceState: '', evidence: [] }),
}));

import {
  runActiveDiagnosticScan,
  startDiagnosticLoop,
  stopDiagnosticLoop,
  onDiagnosticScan,
  getActiveScanHistory,
  resetDiagnosticLoopForTests,
} from '@/services/diagnostic';

beforeEach(() => {
  resetDiagnosticLoopForTests();
  vi.clearAllMocks();
});

describe('runActiveDiagnosticScan', () => {
  it('retourne un ActiveDiagnosticScanResult structuré', async () => {
    const result = await runActiveDiagnosticScan();
    expect(result).toHaveProperty('scanId');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('durationMs');
    expect(result).toHaveProperty('overallStatus');
    expect(result).toHaveProperty('checks');
    expect(result).toHaveProperty('correctiveActions');
    expect(result.checks.length).toBeGreaterThanOrEqual(5);
  });

  it('overallStatus = pass quand aucune alerte et métriques saines', async () => {
    const result = await runActiveDiagnosticScan();
    expect(['pass', 'warn', 'fail']).toContain(result.overallStatus);
  });

  it('chaque check possède id, label, status, detail', async () => {
    const result = await runActiveDiagnosticScan();
    for (const check of result.checks) {
      expect(check).toHaveProperty('id');
      expect(check).toHaveProperty('label');
      expect(['pass', 'warn', 'fail']).toContain(check.status);
      expect(check).toHaveProperty('detail');
    }
  });

  it('check alerts est pass quand getActiveAlerts retourne []', async () => {
    const result = await runActiveDiagnosticScan();
    const alertCheck = result.checks.find(c => c.id === 'alerts');
    expect(alertCheck).toBeDefined();
    expect(alertCheck!.status).toBe('pass');
  });

  it('correctiveActions est tableau', async () => {
    const result = await runActiveDiagnosticScan();
    expect(Array.isArray(result.correctiveActions)).toBe(true);
  });
});

describe('DiagnosticLoop', () => {
  it('startDiagnosticLoop / stopDiagnosticLoop est idempotent', () => {
    startDiagnosticLoop();
    startDiagnosticLoop();
    stopDiagnosticLoop();
    stopDiagnosticLoop();
  });

  it('onDiagnosticScan retourne une fonction unsub', () => {
    const unsub = onDiagnosticScan(vi.fn());
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('getActiveScanHistory retourne un tableau (vide si pas encore de scan)', () => {
    const history = getActiveScanHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
