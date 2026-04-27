/**
 * Tests unitaires — ThreatScore + IPC Anomaly Detection
 * v31.2.14 — Security Active Agent — threat scoring + anomaly patterns
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/monitoring/alerting', async () => ({
  AlertSeverity: { INFO: 'info', WARNING: 'warning', CRITICAL: 'critical', ERROR: 'error' },
  alerting: { getActiveAlerts: vi.fn().mockReturnValue([]) },
  aiHealthMonitor: { getActiveAlerts: vi.fn().mockReturnValue([]) },
}));
vi.mock('@/services/monitoring/performanceAlerts', async () => ({
  performanceAlerts: { getAlerts: vi.fn().mockReturnValue([]) },
}));
vi.mock('@/services/ai/predictiveAlerts', async () => ({
  PredictiveAlerts: { getAlerts: vi.fn().mockReturnValue([]) },
}));
vi.mock('@/lib/uiLogger', async () => ({
  uiLogger: { getLogs: vi.fn().mockReturnValue([]) },
}));
vi.mock('@/config/featureFlags', async () => ({
  getActiveAIProviders: vi.fn().mockReturnValue(['ollama']),
  FEATURE_FLAGS: { ENABLE_EXTERNAL_AI: false, ENABLE_LOCAL_LLM: true },
}));
const mockGetTransportMode = vi.fn().mockReturnValue('IPC');
vi.mock('@/lib/security', async () => ({
  getTransportMode: mockGetTransportMode,
}));
const mockGetAllProviders = vi.fn().mockReturnValue([
  { id: 'ollama', isActive: true, isHealthy: true, failureCount: 0, consecutiveFailures: 0, lastFailure: null },
]);
vi.mock('@/services/governance/GovernanceConnector', async () => ({
  getGovernanceConnector: vi.fn().mockReturnValue({ getAllProviders: mockGetAllProviders }),
}));
vi.mock('@/services/agents/advancedAgentCatalog', async () => ({
  getAdvancedAgentStatus: vi.fn().mockReturnValue({ readiness: 'partial', blockers: [], serviceState: '', evidence: [] }),
}));
vi.mock('@/lib/tauri-client', async () => ({
  tauriClient: {},
  isTauriAvailable: vi.fn().mockReturnValue(false),
}));

import {
  computeThreatScore,
  detectIPCAnomalies,
  recordIPCCall,
  resetIPCCallWindowForTests,
} from '@/services/security_active';

beforeEach(() => {
  resetIPCCallWindowForTests();
  vi.clearAllMocks();
  mockGetTransportMode.mockReturnValue('IPC');
  mockGetAllProviders.mockReturnValue([
    { id: 'ollama', isActive: true, isHealthy: true, failureCount: 0, consecutiveFailures: 0, lastFailure: null },
  ]);
});

describe('computeThreatScore', () => {
  it('retourne score=0 et level=none en situation saine', () => {
    const result = computeThreatScore();
    expect(result.score).toBe(0);
    expect(result.level).toBe('none');
  });

  it('retourne score élevé si transport != IPC', () => {
    mockGetTransportMode.mockReturnValue('HTTP');
    const result = computeThreatScore();
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(['high', 'critical']).toContain(result.level);
    expect(result.topThreats.some(t => t.includes('One Door'))).toBe(true);
    expect(result.mitigations.length).toBeGreaterThan(0);
  });

  it('level escalade avec providers dégradés', () => {
    mockGetAllProviders.mockReturnValue([
      { id: 'ollama', isActive: true, isHealthy: false, failureCount: 5, consecutiveFailures: 3, lastFailure: Date.now() },
    ]);
    const result = computeThreatScore();
    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown.consecutiveFailures).toBeGreaterThan(0);
  });

  it('breakdown contient tous les champs', () => {
    const result = computeThreatScore();
    expect(result.breakdown).toHaveProperty('detectionEventScore');
    expect(result.breakdown).toHaveProperty('containmentViolations');
    expect(result.breakdown).toHaveProperty('oneDoorViolation');
    expect(result.breakdown).toHaveProperty('unacknowledgedCritical');
    expect(result.breakdown).toHaveProperty('consecutiveFailures');
  });

  it('label est non vide', () => {
    const result = computeThreatScore();
    expect(result.label.length).toBeGreaterThan(0);
  });
});

describe('detectIPCAnomalies', () => {
  it('retourne 0 anomalie sur fenêtre vide', () => {
    const report = detectIPCAnomalies();
    expect(report.totalAnomalies).toBe(0);
    expect(report.anomalies).toHaveLength(0);
  });

  it('détecte BURST quand > 30 appels même commande', () => {
    for (let i = 0; i < 35; i++) {
      recordIPCCall('chat_send_message', true);
    }
    const report = detectIPCAnomalies();
    const burst = report.anomalies.find(a => a.pattern === 'BURST');
    expect(burst).toBeDefined();
    expect(burst!.command).toBe('chat_send_message');
  });

  it('détecte REPEATED_FAIL quand ≥5 echecs même commande', () => {
    for (let i = 0; i < 6; i++) {
      recordIPCCall('ollama_generate', false);
    }
    const report = detectIPCAnomalies();
    const fail = report.anomalies.find(a => a.pattern === 'REPEATED_FAIL');
    expect(fail).toBeDefined();
  });

  it('détecte RATE_EXCEEDED quand > 100 appels total', () => {
    for (let i = 0; i < 105; i++) {
      recordIPCCall(`cmd_${i % 5}`, true);
    }
    const report = detectIPCAnomalies();
    const rate = report.anomalies.find(a => a.pattern === 'RATE_EXCEEDED');
    expect(rate).toBeDefined();
  });

  it('détecte TRANSPORT_MISMATCH quand transport != IPC', () => {
    mockGetTransportMode.mockReturnValue('HTTP');
    const report = detectIPCAnomalies();
    const mismatch = report.anomalies.find(a => a.pattern === 'TRANSPORT_MISMATCH');
    expect(mismatch).toBeDefined();
    expect(mismatch!.severity).toBe('critical');
  });

  it('highestSeverity est critical si au moins une anomalie critique', () => {
    mockGetTransportMode.mockReturnValue('HTTP');
    const report = detectIPCAnomalies();
    expect(report.highestSeverity).toBe('critical');
  });

  it('summary est non vide', () => {
    const report = detectIPCAnomalies();
    expect(report.summary.length).toBeGreaterThan(0);
  });
});
