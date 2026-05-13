/**
 * TITANE∞ v34.0.3 — GlobalRuntimePulse tests (Rule 16)
 *
 * Vérifie:
 *   - rendu initial (status=PROBING)
 *   - LIVE quand quick_health_check répond ok + latence faible
 *   - DEGRADED quand IPC échoue
 *   - PARTIAL hors Tauri (NO_TAURI_RUNTIME)
 *   - data-testid stable + attributs runtime
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalRuntimePulse } from '../GlobalRuntimePulse';

// Mock invoke + tauriProtector
vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));
vi.mock('@/utils/tauriProtector', () => ({
  isTauriRuntimeAvailable: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

describe('GlobalRuntimePulse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with stable data-testid', () => {
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(false);
    render(<GlobalRuntimePulse />);
    expect(screen.getByTestId('global-runtime-pulse')).toBeInTheDocument();
  });

  it('shows PARTIAL when Tauri runtime unavailable', async () => {
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(false);
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('PARTIAL');
    });
  });

  it('shows LIVE when quick_health_check returns ok', async () => {
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(true);
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

  it('shows DEGRADED when IPC fails', async () => {
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(true);
    vi.mocked(safeInvokeCanonical).mockResolvedValue({
      ok: false,
      content: null,
      error: { code: 'IPC_FAIL', message: 'backend down' },
    });
    render(<GlobalRuntimePulse />);
    await waitFor(() => {
      const el = screen.getByTestId('global-runtime-pulse');
      expect(el.getAttribute('data-status')).toBe('DEGRADED');
    });
  });

  it('exposes latency in data attribute', async () => {
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(true);
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
    vi.mocked(isTauriRuntimeAvailable).mockReturnValue(false);
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
