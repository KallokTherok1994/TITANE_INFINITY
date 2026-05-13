import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ExplainabilityDashboard } from '@/services/explainability/ExplainabilityDashboard';

/**
 * Phase R+ — React.memo non-regression suite.
 *
 * Goal: verify that React.memo wrappers on the 6 agent dashboards
 * (and AgentDashboardsPanel parent) actually prevent re-renders when
 * props are referentially stable, which is the entire point of
 * memoization. A failing assertion here means the parent passes a new
 * reference each render, defeating the memo.
 *
 * Strategy:
 *   - Wrap the memoized component in a counter shell that re-renders N
 *     times by toggling its own state, but ALWAYS passes the same
 *     (zero) props to the child.
 *   - Spy on the underlying component function body via a module-level
 *     counter; since the dashboard is wrapped, the inner function must
 *     NOT be invoked when props are unchanged.
 *
 * Note: ExplainabilityDashboard receives no props, so any re-render of
 * the child is a memoization failure.
 */

let renderCount = 0;

vi.mock('@/services/explainability/index', async () => {
  const actual = await vi.importActual<typeof import('@/services/explainability/index')>(
    '@/services/explainability/index',
  );
  return {
    ...actual,
    getExplainabilityAgentStatus: (...args: unknown[]) => {
      renderCount += 1;
      return actual.getExplainabilityAgentStatus(...(args as []));
    },
  };
});

function HostShell({ ticks }: { ticks: number }) {
  return (
    <div data-testid="host-shell" data-ticks={ticks}>
      <ExplainabilityDashboard />
    </div>
  );
}

beforeEach(() => {
  renderCount = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('React.memo non-regression — ExplainabilityDashboard', () => {
  it('memoized dashboard does not invoke status fn on parent re-render with stable props', () => {
    const { rerender } = render(<HostShell ticks={0} />);
    const initialCount = renderCount;
    expect(initialCount).toBeGreaterThan(0);

    // Re-render parent shell 5 times with different parent state but
    // same (zero) child props. Memo must hold.
    for (let i = 1; i <= 5; i += 1) {
      rerender(<HostShell ticks={i} />);
    }

    // Allow microtasks but NO interval ticks.
    expect(renderCount).toBe(initialCount);
  });

  it('memoized dashboard still calls status fn after interval tick', () => {
    render(<HostShell ticks={0} />);
    const before = renderCount;

    // Advance fake timers past the 60s refresh interval.
    vi.advanceTimersByTime(65_000);

    expect(renderCount).toBeGreaterThan(before);
  });
});
