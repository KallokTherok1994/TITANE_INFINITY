/**
 * Tests unitaires — Agent de Sécurité Active
 * Scope: recordIPCCall, detectIPCAnomalies, computeThreatScore,
 *        acknowledgeSecurityDashboardEvent, getSecurityDashboardRefreshIntervalMs,
 *        getLastSecurityContainmentCorrelationExport, resetIPCCallWindowForTests
 * Rule 16: nouveau service → tests unitaires obligatoires
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks (vi.hoisted garantit l'initialisation avant le hoist vi.mock) ──────

const {
  mockGetAdvancedAgentStatus,
  mockGetActiveAIProviders,
  mockGetTransportMode,
  mockGetActiveAlerts,
  mockGetPerformanceAlerts,
  mockGetPredictiveAlerts,
  mockGetLogs,
  mockGetAllProviders,
  mockGetGovernanceConnector,
  mockIsTauriAvailable,
  mockTauriClientInvoke,
} = vi.hoisted(() => {
  const getAllProviders = vi.fn(() => [
    {
      id: 'ollama',
      isActive: true,
      isHealthy: true,
      isConfigured: true,
      failureCount: 0,
      consecutiveFailures: 0,
      lastFailure: 0,
    },
  ]);
  return {
    mockGetAdvancedAgentStatus: vi.fn(() => ({
      id: 'security_active',
      name: 'Sécurité Active',
      readiness: 'partial',
      readinessLabel: 'PARTIAL',
      serviceState: 'mock',
      evidence: ['mock evidence'],
      blockers: [],
      nextStep: 'mock step',
      detailSections: [],
    })),
    mockGetActiveAIProviders: vi.fn(() => ['ollama', 'tauri-backend']),
    mockGetTransportMode: vi.fn(() => 'IPC'),
    mockGetActiveAlerts: vi.fn(() => []),
    mockGetPerformanceAlerts: vi.fn(() => []),
    mockGetPredictiveAlerts: vi.fn(() => []),
    mockGetLogs: vi.fn(() => []),
    mockGetAllProviders: getAllProviders,
    mockGetGovernanceConnector: vi.fn(() => ({ getAllProviders: getAllProviders })),
    mockIsTauriAvailable: vi.fn(() => false),
    mockTauriClientInvoke: vi.fn().mockRejectedValue(new Error('TAURI_UNAVAILABLE')),
  };
});

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

vi.mock('@/config/featureFlags', () => ({
  getActiveAIProviders: mockGetActiveAIProviders,
  FEATURE_FLAGS: { security: true },
}));

vi.mock('@/services/ai/transports/ollamaTransport', () => ({
  getTransportMode: mockGetTransportMode,
}));

vi.mock('@/services/ai/healthMonitor', () => ({
  aiHealthMonitor: { getActiveAlerts: mockGetActiveAlerts },
}));

vi.mock('@/services/ai/performanceAlerts', () => ({
  performanceAlerts: { getAlerts: mockGetPerformanceAlerts },
}));

vi.mock('@/lib/predictiveAlerts', () => ({
  PredictiveAlerts: { getAlerts: mockGetPredictiveAlerts },
}));

vi.mock('@/lib/UILogger', () => ({
  uiLogger: { getLogs: mockGetLogs, log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/governance/GovernanceConnector', () => ({
  getGovernanceConnector: mockGetGovernanceConnector,
}));

vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: mockIsTauriAvailable,
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: { invoke: mockTauriClientInvoke },
}));

// ── Import après mocks ────────────────────────────────────────────────────────

import {
  recordIPCCall,
  detectIPCAnomalies,
  computeThreatScore,
  acknowledgeSecurityDashboardEvent,
  getSecurityDashboardRefreshIntervalMs,
  getLastSecurityContainmentCorrelationExport,
  resetIPCCallWindowForTests,
} from '../index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function clearStorage() {
  window.localStorage.clear();
  window.sessionStorage.clear();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getSecurityDashboardRefreshIntervalMs', () => {
  it('retourne 10000ms (constante canonique)', () => {
    expect(getSecurityDashboardRefreshIntervalMs()).toBe(10000);
  });
});

describe('recordIPCCall + detectIPCAnomalies — état sain', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('0 anomalie au départ (fenêtre IPC vide)', () => {
    const report = detectIPCAnomalies();
    expect(Array.isArray(report.anomalies)).toBe(true);
    expect(report.anomalies).toHaveLength(0);
    expect(report.totalAnomalies).toBe(0);
  });

  it('highestSeverity = info quand 0 anomalies', () => {
    const report = detectIPCAnomalies();
    expect(report.highestSeverity).toBe('info');
  });

  it('10 calls success pour même commande → pas de BURST (seuil = 30)', () => {
    for (let i = 0; i < 10; i++) {
      recordIPCCall('ping', true);
    }
    const report = detectIPCAnomalies();
    expect(report.anomalies.filter(a => a.pattern === 'BURST')).toHaveLength(0);
    expect(report.anomalies.filter(a => a.pattern === 'REPEATED_FAIL')).toHaveLength(0);
  });
});

describe('recordIPCCall + detectIPCAnomalies — détection BURST', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('31 calls dans la fenêtre de temps → anomalie BURST', () => {
    for (let i = 0; i < 31; i++) {
      recordIPCCall('health_check', true);
    }
    const report = detectIPCAnomalies();
    const burst = report.anomalies.filter(a => a.pattern === 'BURST');
    expect(burst.length).toBeGreaterThan(0);
    expect(burst[0].command).toBe('health_check');
  });

  it('highestSeverity >= warning après BURST', () => {
    for (let i = 0; i < 31; i++) {
      recordIPCCall('health_check', true);
    }
    const report = detectIPCAnomalies();
    expect(['warning', 'critical']).toContain(report.highestSeverity);
  });
});

describe('recordIPCCall + detectIPCAnomalies — REPEATED_FAIL', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('5 failures pour même commande → anomalie REPEATED_FAIL', () => {
    for (let i = 0; i < 5; i++) {
      recordIPCCall('web_research', false);
    }
    const report = detectIPCAnomalies();
    const repeated = report.anomalies.filter(a => a.pattern === 'REPEATED_FAIL');
    expect(repeated.length).toBeGreaterThan(0);
    expect(repeated[0].command).toBe('web_research');
  });

  it('4 failures ne déclenche pas encore REPEATED_FAIL', () => {
    for (let i = 0; i < 4; i++) {
      recordIPCCall('web_search', false);
    }
    const report = detectIPCAnomalies();
    const repeated = report.anomalies.filter(
      a => a.pattern === 'REPEATED_FAIL' && a.command === 'web_search'
    );
    expect(repeated).toHaveLength(0);
  });
});

describe('recordIPCCall + detectIPCAnomalies — RATE_EXCEEDED', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('101 calls toutes commandes confondues → anomalie RATE_EXCEEDED', () => {
    for (let i = 0; i < 101; i++) {
      recordIPCCall(`cmd_${i % 10}`, true);
    }
    const report = detectIPCAnomalies();
    const rate = report.anomalies.filter(a => a.pattern === 'RATE_EXCEEDED');
    expect(rate.length).toBeGreaterThan(0);
  });
});

describe('detectIPCAnomalies — structure de retour', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('retourne les champs structurels obligatoires', () => {
    const report = detectIPCAnomalies();
    expect(Array.isArray(report.anomalies)).toBe(true);
    expect(typeof report.totalAnomalies).toBe('number');
    expect(typeof report.highestSeverity).toBe('string');
    expect(typeof report.summary).toBe('string');
    expect(typeof report.computedAt).toBe('number');
  });

  it('chaque anomalie a les champs id, pattern, severity, detectedAt', () => {
    for (let i = 0; i < 31; i++) {
      recordIPCCall('test_cmd', true);
    }
    const report = detectIPCAnomalies();
    if (report.anomalies.length > 0) {
      const a = report.anomalies[0];
      expect(typeof a.id).toBe('string');
      expect(typeof a.pattern).toBe('string');
      expect(typeof a.severity).toBe('string');
      expect(typeof a.detectedAt).toBe('number');
    }
  });
});

describe('computeThreatScore', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: true,
        isConfigured: true,
        failureCount: 0,
        consecutiveFailures: 0,
        lastFailure: 0,
      },
    ]);
  });

  it('retourne un score structuré avec champs obligatoires', () => {
    const score = computeThreatScore();
    expect(typeof score.score).toBe('number');
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(typeof score.level).toBe('string');
    expect(score.breakdown).toBeDefined();
    expect(Array.isArray(score.topThreats)).toBe(true);
    expect(Array.isArray(score.mitigations)).toBe(true);
  });

  it('score = 0 et level = none sans événements de sécurité', () => {
    const score = computeThreatScore();
    expect(score.score).toBe(0);
    expect(score.level).toBe('none');
  });

  it('score > 0 quand One Door violation (transport != IPC)', () => {
    mockGetTransportMode.mockReturnValue('HTTP');
    const score = computeThreatScore();
    expect(score.score).toBeGreaterThan(0);
    expect(score.breakdown.oneDoorViolation).toBe(50);
  });

  it('score > 0 quand provider avec consecutiveFailures >= 3', () => {
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: false,
        isConfigured: true,
        failureCount: 5,
        consecutiveFailures: 3,
        lastFailure: Date.now(),
      },
    ]);
    const score = computeThreatScore();
    expect(score.score).toBeGreaterThan(0);
    expect(score.breakdown.consecutiveFailures).toBeGreaterThan(0);
  });

  it('accepte un filtre de sévérité sans throw', () => {
    const score = computeThreatScore('critical' as Parameters<typeof computeThreatScore>[0]);
    expect(typeof score.score).toBe('number');
  });

  it('level est dans les valeurs autorisées', () => {
    const score = computeThreatScore();
    expect(['none', 'low', 'medium', 'high', 'critical']).toContain(score.level);
  });

  it('label contient le score', () => {
    const score = computeThreatScore();
    expect(score.label).toContain('0/100');
  });
});

describe('acknowledgeSecurityDashboardEvent', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('persiste l\'acquittement dans localStorage sans throw', () => {
    expect(() => acknowledgeSecurityDashboardEvent('evt-001')).not.toThrow();
  });

  it('acquittement persisté est retrouvable dans localStorage', () => {
    acknowledgeSecurityDashboardEvent('evt-test-123');
    const allKeys = Object.keys(window.localStorage);
    const hasAck = allKeys.some(key => {
      try {
        const value = window.localStorage.getItem(key) ?? '';
        return value.includes('evt-test-123');
      } catch {
        return false;
      }
    });
    expect(hasAck).toBe(true);
  });

  it('acknowledgeSecurityDashboardEvent est idempotent', () => {
    acknowledgeSecurityDashboardEvent('evt-dup');
    expect(() => acknowledgeSecurityDashboardEvent('evt-dup')).not.toThrow();
  });
});

describe('getLastSecurityContainmentCorrelationExport', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('retourne null quand aucun export existant', () => {
    const result = getLastSecurityContainmentCorrelationExport();
    expect(result).toBeNull();
  });
});

describe('resetIPCCallWindowForTests', () => {
  beforeEach(() => {
    clearStorage();
    mockGetTransportMode.mockReturnValue('IPC');
    mockGetActiveAlerts.mockReturnValue([]);
    mockGetPerformanceAlerts.mockReturnValue([]);
    mockGetPredictiveAlerts.mockReturnValue([]);
    mockGetLogs.mockReturnValue([]);
  });

  it('vide la fenêtre IPC — 0 anomalie BURST/RATE après reset', () => {
    for (let i = 0; i < 40; i++) {
      recordIPCCall('reset_test', true);
    }
    resetIPCCallWindowForTests();
    const report = detectIPCAnomalies();
    expect(report.anomalies.filter(a => a.pattern === 'BURST')).toHaveLength(0);
    expect(report.anomalies.filter(a => a.pattern === 'RATE_EXCEEDED')).toHaveLength(0);
  });

  it('resetIPCCallWindowForTests ne throw pas', () => {
    expect(() => resetIPCCallWindowForTests()).not.toThrow();
  });

  it('totalAnomalies = 0 après reset', () => {
    for (let i = 0; i < 40; i++) {
      recordIPCCall('reset_test2', true);
    }
    resetIPCCallWindowForTests();
    const report = detectIPCAnomalies();
    expect(report.totalAnomalies).toBe(0);
  });
});
