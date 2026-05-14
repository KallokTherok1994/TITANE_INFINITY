/**
 * Vitest — SurfaceTruthBadge (v34.0.13 canonical surface truth overlay)
 *
 * Covers:
 *  - renders the toggle when forceEnabled
 *  - opens the overlay on click
 *  - the overlay exposes the canonical truth fields
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { SurfaceTruthBadge } from '@/components/dev/SurfaceTruthBadge';

vi.mock('@/hooks/useSurfaceTruth', () => ({
  useSurfaceTruth: () => ({
    appVersion: '34.0.13',
    buildTimestamp: '2026-04-16T12:34:56.000Z',
    storeVersion: 34,
    swScope: 'http://localhost/',
    swController: true,
    transport: 'web' as const,
    chunkHash: '/assets/main-abc123.js',
    dataSurfaceTruth: 'dashboard',
  }),
}));

describe('SurfaceTruthBadge', () => {
  afterEach(() => cleanup());

  it('does not render when disabled', () => {
    const { container } = render(<SurfaceTruthBadge forceEnabled={false} />);
    expect(container.querySelector('[data-testid="surface-truth-toggle"]')).toBeNull();
  });

  it('renders the toggle and opens the overlay on click', () => {
    const { getByTestId, queryByTestId } = render(
      <SurfaceTruthBadge forceEnabled={true} />
    );
    expect(queryByTestId('surface-truth-badge')).toBeNull();
    fireEvent.click(getByTestId('surface-truth-toggle'));
    const badge = getByTestId('surface-truth-badge');
    expect(badge).toBeTruthy();
    expect(getByTestId('surface-truth-version').textContent).toContain('34.0.13');
    expect(getByTestId('surface-truth-store').textContent).toContain('v34');
    expect(getByTestId('surface-truth-sw').textContent).toContain('controller-active');
    expect(getByTestId('surface-truth-attr').textContent).toContain('dashboard');
  });

  it('opens by default when defaultOpen is set', () => {
    const { getByTestId } = render(
      <SurfaceTruthBadge forceEnabled={true} defaultOpen={true} />
    );
    expect(getByTestId('surface-truth-badge')).toBeTruthy();
  });
});
