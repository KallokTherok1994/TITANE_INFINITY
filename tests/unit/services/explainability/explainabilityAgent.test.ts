/**
 * TITANE∞ — Explainability Agent unit tests
 * Rule 16: Every service must have unit tests.
 * Covers: getExplainabilityAgentStatus, startExplainabilityAgent,
 *         resetExplainabilityTraceHistoryForTests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ─────────────────────────────────────────────
const mockGetAdvancedAgentStatus = vi.hoisted(() => vi.fn());
const mockGetRequestedProvider = vi.hoisted(() => vi.fn());

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

// The explainability service reads localStorage for trace history —
// no Tauri IPC needed; mock window.localStorage is built into jsdom.

import {
  getExplainabilityAgentStatus,
  startExplainabilityAgent,
  resetExplainabilityTraceHistoryForTests,
} from '@/services/explainability';

const QUALIFIED_STATUS = {
  id: 'explainability',
  readiness: 'partial',
  serviceState: 'Trace history available',
  evidence: ['Inference logged'],
  blockers: ['Runtime inference engine not wired'],
  nextStep: 'Connect real inference signals',
};

describe('getExplainabilityAgentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetExplainabilityTraceHistoryForTests();
    mockGetAdvancedAgentStatus.mockReturnValue(QUALIFIED_STATUS);
  });

  it('returns object with id=explainability', () => {
    const status = getExplainabilityAgentStatus();
    expect(status).toHaveProperty('id', 'explainability');
  });

  it('returns readiness string', () => {
    const status = getExplainabilityAgentStatus();
    expect(typeof status.readiness).toBe('string');
  });

  it('returns serviceState string', () => {
    const status = getExplainabilityAgentStatus();
    expect(typeof status.serviceState).toBe('string');
  });

  it('returns evidence array', () => {
    const status = getExplainabilityAgentStatus();
    expect(Array.isArray(status.evidence)).toBe(true);
  });

  it('returns blockers array', () => {
    const status = getExplainabilityAgentStatus();
    expect(Array.isArray(status.blockers)).toBe(true);
  });

  it('returns nextStep string', () => {
    const status = getExplainabilityAgentStatus();
    expect(typeof status.nextStep).toBe('string');
  });

  it('delegates to getAdvancedAgentStatus for base catalog lookup', () => {
    getExplainabilityAgentStatus();
    expect(mockGetAdvancedAgentStatus).toHaveBeenCalledWith('explainability');
  });

  it('is stable across multiple calls', () => {
    expect(() => getExplainabilityAgentStatus()).not.toThrow();
    expect(() => getExplainabilityAgentStatus()).not.toThrow();
  });
});

describe('startExplainabilityAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetExplainabilityTraceHistoryForTests();
    mockGetAdvancedAgentStatus.mockReturnValue(QUALIFIED_STATUS);
  });

  it('does not throw', () => {
    expect(() => startExplainabilityAgent()).not.toThrow();
  });

  it('returns a status object (not undefined)', () => {
    const result = startExplainabilityAgent();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('id', 'explainability');
  });

  it('can be called multiple times without error', () => {
    expect(() => {
      startExplainabilityAgent();
      startExplainabilityAgent();
    }).not.toThrow();
  });
});

describe('resetExplainabilityTraceHistoryForTests', () => {
  it('resets without throw', () => {
    expect(() => resetExplainabilityTraceHistoryForTests()).not.toThrow();
  });

  it('after reset, getExplainabilityAgentStatus remains stable', () => {
    resetExplainabilityTraceHistoryForTests();
    expect(() => getExplainabilityAgentStatus()).not.toThrow();
  });
});
