/**
 * TITANE∞ — Security Active Agent unit tests
 * Rule 16: Every service must have unit tests.
 * Covers: getSecurityActiveAgentStatus, startSecurityActiveAgent,
 *         getSecurityDashboardRefreshIntervalMs, acknowledgeSecurityDashboardEvent
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ─────────────────────────────────────────────
const mockGetAdvancedAgentStatus = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

// Mock Tauri IPC to prevent real desktop calls
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));

import {
  getSecurityActiveAgentStatus,
  startSecurityActiveAgent,
  getSecurityDashboardRefreshIntervalMs,
  acknowledgeSecurityDashboardEvent,
  getLastSecurityContainmentCorrelationExport,
  SecurityAuditSeverityFilter,
} from '@/services/security_active';

const QUALIFIED_STATUS = {
  id: 'security_active',
  readiness: 'qualified',
  serviceState: 'active',
  evidence: ['Anomaly detection active'],
  blockers: [],
  nextStep: '',
};

describe('getSecurityActiveAgentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdvancedAgentStatus.mockReturnValue(QUALIFIED_STATUS);
  });

  it('returns object with id=security_active', () => {
    const status = getSecurityActiveAgentStatus();
    expect(status).toHaveProperty('id', 'security_active');
  });

  it('returns readiness string', () => {
    const status = getSecurityActiveAgentStatus();
    expect(typeof status.readiness).toBe('string');
  });

  it('returns serviceState string', () => {
    const status = getSecurityActiveAgentStatus();
    expect(typeof status.serviceState).toBe('string');
  });

  it('returns evidence array', () => {
    const status = getSecurityActiveAgentStatus();
    expect(Array.isArray(status.evidence)).toBe(true);
  });

  it('returns blockers array', () => {
    const status = getSecurityActiveAgentStatus();
    expect(Array.isArray(status.blockers)).toBe(true);
  });

  it('delegates to getAdvancedAgentStatus for base fields', () => {
    getSecurityActiveAgentStatus();
    expect(mockGetAdvancedAgentStatus).toHaveBeenCalledWith('security_active');
  });

  it('is stable across multiple calls', () => {
    expect(() => getSecurityActiveAgentStatus()).not.toThrow();
    expect(() => getSecurityActiveAgentStatus()).not.toThrow();
  });
});

describe('startSecurityActiveAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdvancedAgentStatus.mockReturnValue(QUALIFIED_STATUS);
  });

  it('does not throw', () => {
    expect(() => startSecurityActiveAgent()).not.toThrow();
  });

  it('returns a status object (not undefined)', () => {
    const result = startSecurityActiveAgent();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('id', 'security_active');
  });

  it('can be called multiple times without error', () => {
    expect(() => {
      startSecurityActiveAgent();
      startSecurityActiveAgent();
    }).not.toThrow();
  });
});

describe('getSecurityDashboardRefreshIntervalMs', () => {
  it('returns a positive number', () => {
    const interval = getSecurityDashboardRefreshIntervalMs();
    expect(typeof interval).toBe('number');
    expect(interval).toBeGreaterThan(0);
  });

  it('returns at least 5 seconds (5000ms)', () => {
    const interval = getSecurityDashboardRefreshIntervalMs();
    expect(interval).toBeGreaterThanOrEqual(5000);
  });
});

describe('acknowledgeSecurityDashboardEvent', () => {
  it('does not throw when called with a valid event ID', () => {
    expect(() => acknowledgeSecurityDashboardEvent('ev-test-123')).not.toThrow();
  });

  it('handles empty string event ID gracefully', () => {
    expect(() => acknowledgeSecurityDashboardEvent('')).not.toThrow();
  });
});

describe('getLastSecurityContainmentCorrelationExport', () => {
  it('returns null or string (no active export on clean env)', () => {
    const result = getLastSecurityContainmentCorrelationExport();
    expect(result === null || typeof result === 'string').toBe(true);
  });
});
