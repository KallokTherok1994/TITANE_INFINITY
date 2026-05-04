/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: UnifiedLauncherPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { UnifiedLauncherPanel } from '@/components/launcher/UnifiedLauncherPanel';
import { useOAuthStore } from '@/core/auth/oauthStore';

beforeEach(() => {
  useOAuthStore.setState({
    provider: null,
    profile: null,
    isLoading: false,
    error: null,
  });
  vi.clearAllMocks();
});

describe('UnifiedLauncherPanel', () => {
  it('renders with data-testid="unified-launcher-panel"', () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    render(<UnifiedLauncherPanel />);
    expect(screen.getByTestId('unified-launcher-panel')).toBeTruthy();
  });

  it('shows Ollama reachable status after step completes', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, model: 'gemma2:2b' });

    render(<UnifiedLauncherPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('unified-launcher-ollama-status')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('shows launch button when ready', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    render(<UnifiedLauncherPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('unified-launcher-launch-button')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('calls onLaunchComplete when launch button is clicked', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const onLaunchComplete = vi.fn();

    render(<UnifiedLauncherPanel onLaunchComplete={onLaunchComplete} />);

    await waitFor(() => {
      const btn = screen.queryByTestId('unified-launcher-launch-button');
      if (btn) btn.click();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(onLaunchComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('shows step indicators', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    render(<UnifiedLauncherPanel />);
    expect(screen.getByTestId('unified-launcher-steps')).toBeTruthy();
  });
});
