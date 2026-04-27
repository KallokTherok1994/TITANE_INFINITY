/**
 * TITANE_INFINITY — Unit tests: Project Health Metrics (Phase B2)
 * Rule 16: New service function → unit tests required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Tauri IPC before import ─────────────────────────────
// Use vi.hoisted() to define the mock fn before vi.mock() hoisting.

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));

// ── Import target ────────────────────────────────────────────

import { getProjectHealthMetrics, resetProjectHealthMetricsCacheForTests } from '@/services/monitoring';

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  resetProjectHealthMetricsCacheForTests();
});

describe('getProjectHealthMetrics', () => {
  it('returns a valid ProjectHealthMetrics object when IPC returns empty strings', async () => {
    mockInvoke.mockResolvedValue('');

    const metrics = await getProjectHealthMetrics();

    expect(metrics).toHaveProperty('incidentRecurrenceRate');
    expect(metrics).toHaveProperty('mostImpactedRing');
    expect(metrics).toHaveProperty('avgLeadTimeMinutes');
    expect(metrics).toHaveProperty('computedAt');
    expect(metrics).toHaveProperty('evidenceNote');
  });

  it('handles IPC rejections gracefully via Promise.allSettled (first describe)', async () => {
    // Promise.allSettled captures rejections \u2014 mostImpactedRing stays 'unknown'.
    mockInvoke.mockRejectedValue(new Error('IPC unavailable'));

    const metrics = await getProjectHealthMetrics();

    expect(metrics.incidentRecurrenceRate).toBe(0);
    expect(metrics.mostImpactedRing).toBe('unknown');
    expect(typeof metrics.computedAt).toBe('string');
  });

  it('returns incidentRecurrenceRate as a number', async () => {
    mockInvoke.mockResolvedValue('');

    const metrics = await getProjectHealthMetrics();

    expect(typeof metrics.incidentRecurrenceRate).toBe('number');
    expect(metrics.incidentRecurrenceRate).toBeGreaterThanOrEqual(0);
    expect(metrics.incidentRecurrenceRate).toBeLessThanOrEqual(1);
  });

  it('returns a valid ISO timestamp in computedAt', async () => {
    mockInvoke.mockResolvedValue('');

    const metrics = await getProjectHealthMetrics();

    expect(new Date(metrics.computedAt).getTime()).toBeGreaterThan(0);
  });
});

// ── Import target ────────────────────────────────────────────

import { getProjectHealthMetrics } from '@/services/monitoring';

// ── Helpers ──────────────────────────────────────────────────

const AUTOHEAL_SAMPLE = JSON.stringify([
  { id: 'rule-1', prevention_test: 'detect_recurrence + cargo test' },
  { id: 'rule-2', prevention_test: 'detect_recurrence' },
  { id: 'rule-3', prevention_test: 'pnpm vitest run' },
])
  .replace('[', '')
  .replace(']', '')
  .split('},')
  .join('}\n');

const UI_EVENTS_SAMPLE = [
  JSON.stringify({ ring: 'Ring4', surface: 'ChatPage' }),
  JSON.stringify({ ring: 'Ring4', surface: 'MonitoringDashboard' }),
  JSON.stringify({ ring: 'Ring3', surface: 'useChat' }),
].join('\n');

beforeEach(() => {
  vi.clearAllMocks();
  // Reset module-level cache by invalidating the module.
  vi.resetModules();
});

// ── Tests ────────────────────────────────────────────────────

describe('getProjectHealthMetrics', () => {
  it('returns a valid ProjectHealthMetrics object', async () => {
    mockInvoke.mockResolvedValue('{}');

    const metrics = await getProjectHealthMetrics();

    expect(metrics).toHaveProperty('incidentRecurrenceRate');
    expect(metrics).toHaveProperty('mostImpactedRing');
    expect(metrics).toHaveProperty('avgLeadTimeMinutes');
    expect(metrics).toHaveProperty('computedAt');
    expect(metrics).toHaveProperty('evidenceNote');
  });

  it('handles IPC rejections gracefully via Promise.allSettled', async () => {
    // Promise.allSettled captures rejections — function never hits catch block.
    // Both registries fail → incidentRecurrenceRate=0, mostImpactedRing='unknown'.
    mockInvoke.mockRejectedValue(new Error('IPC unavailable'));

    const metrics = await getProjectHealthMetrics();

    expect(metrics.incidentRecurrenceRate).toBe(0);
    expect(metrics.mostImpactedRing).toBe('unknown');
    expect(typeof metrics.computedAt).toBe('string');
  });

  it('computes non-zero recurrence rate when autoheal has detect_recurrence entries', async () => {
    const autohealLines = [
      JSON.stringify({ id: 'a', prevention_test: 'detect_recurrence + unit' }),
      JSON.stringify({ id: 'b', prevention_test: 'detect_recurrence' }),
      JSON.stringify({ id: 'c', prevention_test: 'pnpm vitest' }),
    ].join('\n');

    mockInvoke
      .mockResolvedValueOnce(autohealLines) // autoheal
      .mockResolvedValueOnce('');           // ui-events

    // Re-import to bypass TTL cache
    const { getProjectHealthMetrics: fn } = await import('@/services/monitoring');
    const metrics = await fn();

    expect(metrics.incidentRecurrenceRate).toBeGreaterThan(0);
  });

  it('detects most impacted ring from ui-events', async () => {
    const uiEvents = [
      JSON.stringify({ ring: 'Ring4' }),
      JSON.stringify({ ring: 'Ring4' }),
      JSON.stringify({ ring: 'Ring3' }),
    ].join('\n');

    mockInvoke
      .mockResolvedValueOnce('') // autoheal
      .mockResolvedValueOnce(uiEvents); // ui-events

    const { getProjectHealthMetrics: fn } = await import('@/services/monitoring');
    const metrics = await fn();

    expect(metrics.mostImpactedRing).toBe('Ring4');
  });
});
