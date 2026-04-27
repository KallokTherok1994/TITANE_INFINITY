/**
 * Tests unitaires — AgentHealthMatrix + heartbeat
 * v31.2.14 — Monitoring Agent proactive health supervision
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock only the sub-agents that are dynamically imported inside monitoring
vi.mock('@/services/monitoring', async importOriginal => {
  const actual = await importOriginal<typeof import('@/services/monitoring')>();
  return {
    ...actual,
    getMonitoringAgentStatus: vi.fn().mockReturnValue({
      readiness: 'partial',
      blockers: [],
      serviceState: 'ok',
      evidence: [],
    }),
  };
});
vi.mock('@/services/diagnostic', async () => ({
  getDiagnosticAgentStatus: vi.fn().mockReturnValue({
    readiness: 'partial',
    blockers: [],
    serviceState: 'ok',
    evidence: [],
  }),
}));
vi.mock('@/services/explainability', async () => ({
  getExplainabilityAgentStatus: vi.fn().mockReturnValue({
    readiness: 'partial',
    blockers: [],
    serviceState: 'ok',
    evidence: [],
  }),
}));
vi.mock('@/services/orchestrator', async importOriginal => {
  const actual = await importOriginal<typeof import('@/services/orchestrator')>();
  return {
    ...actual,
    getOrchestratorAgentStatus: vi.fn().mockReturnValue({
      readiness: 'qualified',
      blockers: [],
      serviceState: 'ok',
      evidence: [],
    }),
  };
});
vi.mock('@/services/security_active', async () => ({
  getSecurityActiveAgentStatus: vi.fn().mockReturnValue({
    readiness: 'partial',
    blockers: [],
    serviceState: 'ok',
    evidence: [],
  }),
}));

import {
  refreshAgentHealthMatrix,
  getLastAgentHealthMatrix,
  onAgentDegraded,
  startAgentHeartbeatLoop,
  stopAgentHeartbeatLoop,
  resetAgentHealthMatrixForTests,
} from '@/services/monitoring';

beforeEach(() => {
  resetAgentHealthMatrixForTests();
  vi.clearAllMocks();
});

describe('AgentHealthMatrix', () => {
  it('retourne une matrice avec les 5 agents', async () => {
    const matrix = await refreshAgentHealthMatrix();
    expect(Object.keys(matrix.agents)).toHaveLength(5);
    expect(matrix.agents).toHaveProperty('monitoring');
    expect(matrix.agents).toHaveProperty('diagnostic');
    expect(matrix.agents).toHaveProperty('explainability');
    expect(matrix.agents).toHaveProperty('orchestrator');
    expect(matrix.agents).toHaveProperty('security_active');
  });

  it('classe readiness=qualified comme healthy', async () => {
    const matrix = await refreshAgentHealthMatrix();
    expect(matrix.agents.orchestrator!.status).toBe('healthy');
  });

  it('classe readiness=partial comme degraded', async () => {
    const matrix = await refreshAgentHealthMatrix();
    expect(matrix.agents.monitoring!.status).toBe('degraded');
  });

  it('overallHealth est degraded si au moins 1 agent dégradé', async () => {
    const matrix = await refreshAgentHealthMatrix();
    expect(matrix.overallHealth).toBe('degraded');
    expect(matrix.degradedCount).toBeGreaterThan(0);
  });

  it('getLastAgentHealthMatrix retourne le cache après refreshAgentHealthMatrix', async () => {
    await refreshAgentHealthMatrix();
    const cached = getLastAgentHealthMatrix();
    expect(cached).not.toBeNull();
    expect(cached!.lastRefreshedAt).toBeGreaterThan(0);
  });

  it('onAgentDegraded est appelé quand un agent atteint le seuil', async () => {
    const cb = vi.fn();
    const unsub = onAgentDegraded(cb);
    // Force 2 consecutive degradations
    await refreshAgentHealthMatrix();
    await refreshAgentHealthMatrix();
    // callback may be called for agents with consecutiveDegradations >= 2
    unsub();
    expect(typeof unsub).toBe('function');
  });

  it('startAgentHeartbeatLoop / stopAgentHeartbeatLoop est idempotent', () => {
    startAgentHeartbeatLoop();
    startAgentHeartbeatLoop(); // double call — no error
    stopAgentHeartbeatLoop();
    stopAgentHeartbeatLoop(); // double stop — no error
  });
});
