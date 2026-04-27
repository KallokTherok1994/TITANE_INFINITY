/**
 * TITANE∞ — Auto-Diagnostic Agent unit tests
 * Rule 16: Every service must have unit tests.
 * Covers: getDiagnosticAgentStatus, startDiagnosticAgent, resetDiagnosticReportHistoryForTests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ─────────────────────────────────────────────
const mockGetAdvancedAgentStatus = vi.hoisted(() => vi.fn());
const mockGetActiveAIProviders = vi.hoisted(() => vi.fn());
const mockOllamaGetMetrics = vi.hoisted(() => vi.fn());
const mockAlertingGetActiveAlerts = vi.hoisted(() => vi.fn());
const mockChatMetricsGetSnapshot = vi.hoisted(() => vi.fn());

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

vi.mock('@/config/featureFlags', () => ({
  getActiveAIProviders: mockGetActiveAIProviders,
}));

vi.mock('@/services/ai/providers/ollama', () => ({
  ollamaProvider: { getStats: mockOllamaGetMetrics },
}));

vi.mock('@/services/monitoring/alerting', () => ({
  alerting: { getActiveAlerts: mockAlertingGetActiveAlerts },
}));

vi.mock('@/services/monitoring/chatMetrics', () => ({
  chatMetrics: { getGlobalMetrics: mockChatMetricsGetSnapshot },
}));

import {
  getDiagnosticAgentStatus,
  startDiagnosticAgent,
  resetDiagnosticReportHistoryForTests,
} from '@/services/diagnostic';

const STATUS_QUALIFIED = {
  id: 'diagnostic',
  readiness: 'qualified',
  serviceState: 'active',
  evidence: ['Report generated'],
  blockers: [],
  nextStep: '',
};

describe('getDiagnosticAgentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDiagnosticReportHistoryForTests();
    mockGetAdvancedAgentStatus.mockReturnValue(STATUS_QUALIFIED);
    mockGetActiveAIProviders.mockReturnValue(['ollama']);
    mockOllamaGetMetrics.mockReturnValue({ errorCount: 0, endpointHealthy: true, config: { model: 'gemma2:2b', endpoint: 'http://127.0.0.1:11434' } });
    mockAlertingGetActiveAlerts.mockReturnValue([]);
    mockChatMetricsGetSnapshot.mockReturnValue({ totalErrors: 0, successCount: 0, errorCount: 0, totalSessions: 0, avgResponseTime: 0 });
  });

  it('returns an object with id=diagnostic', () => {
    const status = getDiagnosticAgentStatus();
    expect(status).toHaveProperty('id', 'diagnostic');
  });

  it('returns readiness field (string)', () => {
    const status = getDiagnosticAgentStatus();
    expect(typeof status.readiness).toBe('string');
  });

  it('returns serviceState field (string)', () => {
    const status = getDiagnosticAgentStatus();
    expect(typeof status.serviceState).toBe('string');
  });

  it('returns evidence array', () => {
    const status = getDiagnosticAgentStatus();
    expect(Array.isArray(status.evidence)).toBe(true);
  });

  it('returns blockers array', () => {
    const status = getDiagnosticAgentStatus();
    expect(Array.isArray(status.blockers)).toBe(true);
  });

  it('returns nextStep string', () => {
    const status = getDiagnosticAgentStatus();
    expect(typeof status.nextStep).toBe('string');
  });

  it('delegates to getAdvancedAgentStatus for base fields', () => {
    getDiagnosticAgentStatus();
    expect(mockGetAdvancedAgentStatus).toHaveBeenCalledWith('diagnostic');
  });

  it('is stable across multiple calls (no throw)', () => {
    expect(() => getDiagnosticAgentStatus()).not.toThrow();
    expect(() => getDiagnosticAgentStatus()).not.toThrow();
  });
});

describe('startDiagnosticAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDiagnosticReportHistoryForTests();
    mockGetAdvancedAgentStatus.mockReturnValue(STATUS_QUALIFIED);
    mockGetActiveAIProviders.mockReturnValue(['ollama']);
    mockOllamaGetMetrics.mockReturnValue({ errorCount: 0, endpointHealthy: true, config: { model: 'gemma2:2b', endpoint: 'http://127.0.0.1:11434' } });
    mockAlertingGetActiveAlerts.mockReturnValue([]);
    mockChatMetricsGetSnapshot.mockReturnValue({ totalErrors: 0, successCount: 0, errorCount: 0, totalSessions: 0, avgResponseTime: 0 });
  });

  it('does not throw', () => {
    expect(() => startDiagnosticAgent()).not.toThrow();
  });

  it('returns a status object (not undefined)', () => {
    const result = startDiagnosticAgent();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('id', 'diagnostic');
  });

  it('can be called multiple times without error', () => {
    expect(() => {
      startDiagnosticAgent();
      startDiagnosticAgent();
    }).not.toThrow();
  });
});

describe('resetDiagnosticReportHistoryForTests', () => {
  it('resets without throw', () => {
    expect(() => resetDiagnosticReportHistoryForTests()).not.toThrow();
  });
});
