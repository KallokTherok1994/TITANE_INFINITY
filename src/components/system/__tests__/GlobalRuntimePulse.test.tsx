/**
 * TITANE∞ v34.0.4 — GlobalRuntimePulse tests (Rule 16, AH-v101)
 *
 * Vérifie:
 *   - rendu initial (status=PROBING)
 *   - LIVE quand quick_health_check répond ok + latence faible
 *   - DEGRADED quand IPC échoue avec code backend
 *   - PARTIAL quand transport indisponible (NO_TRANSPORT / IPC_TIMEOUT)
 *   - data-testid stable + attributs runtime
 *
 * Note v34.0.4: le composant n'utilise plus isTauriRuntimeAvailable() pour
 * éviter le verrou du cache singleton; il s'appuie uniquement sur le code
 * d'erreur retourné par safeInvokeCanonical.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalRuntimePulse } from '../GlobalRuntimePulse';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';

describe('GlobalRuntimePulse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with stable data-testid', () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'NO_TRANSPORT', message: 'no bridge' },
    });
    render(<GlobalRuntimePulse />);
    expect(screen.getByTestId('global-runtime-pulse')).toBeInTheDocument();
  });

  it('shows PARTIAL when transport unavailable (NO_TRANSPORT)', async () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'NO_TRANSPORT', message: 'no bridge' },
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('PARTIAL');
    });
  });

  it('shows PARTIAL on IPC_TIMEOUT', async () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'IPC_TIMEOUT', message: 'timeout' },
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('PARTIAL');
    });
  });

  it('shows LIVE when quick_health_check returns ok', async () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: true,
      content: { status: 'ok' },
      error: null,
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('LIVE');
    });
  });

  it('shows DEGRADED when IPC returns backend error code', async () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'BACKEND_ERROR', message: 'backend down' },
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('DEGRADED');
    });
  });

  it('exposes latency in data attribute', async () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: true,
      content: { status: 'ok' },
      error: null,
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      const latency = el.getAttribute('data-latency');
      expect(latency).not.toBeNull();
      expect(Number(latency)).toBeGreaterThanOrEqual(0);
    });
  });

  it('has aria-live polite for screen readers', () => {
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'NO_TRANSPORT', message: 'no bridge' },
    });
    render(<GlobalRuntimePulse />);
    const el = screen.getByTestId('global-runtime-pulse');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('role')).toBe('status');
  });
});

describe('SurfaceTruthBadge — Living Pulse (v34.0.3)', () => {
  it.each(['PARTIAL', 'DEGRADED', 'ERROR', 'FALLBACK', 'SIMULATED', 'NOT_WIRED', 'UNKNOWN'] as const)(
    'pulses on non-calm variant: %s',
    async variant => {
      const { SurfaceTruthBadge } = await import('../SurfaceTruthBadge');
      render(<SurfaceTruthBadge variant={variant} />);
      const el = screen.getByTestId(`surface-truth-badge-${variant.toLowerCase()}`);
      expect(el.getAttribute('data-pulsing')).toBe('true');
      expect(el.className).toContain('animate-pulse');
    },
  );

  it.each(['LIVE', 'DISPLAY_ONLY', 'LEGACY'] as const)(
    'stays calm (no pulse) on variant: %s',
    async variant => {
      const { SurfaceTruthBadge } = await import('../SurfaceTruthBadge');
      render(<SurfaceTruthBadge variant={variant} />);
      const el = screen.getByTestId(`surface-truth-badge-${variant.toLowerCase()}`);
      expect(el.getAttribute('data-pulsing')).toBe('false');
      expect(el.className).not.toContain('animate-pulse');
    },
  );
});
