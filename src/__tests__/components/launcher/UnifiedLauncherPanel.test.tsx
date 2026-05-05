/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: UnifiedLauncherPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import { UnifiedLauncherPanel } from '@/components/launcher/UnifiedLauncherPanel';
import { useOAuthStore } from '@/core/auth/oauthStore';

/** Canonical { ok, content } responses for a ready state */
function mockSafeInvokeReady() {
  (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockImplementation((cmd: string) => {
    if (cmd === 'ai_check_ollama_status')
      return Promise.resolve({
        ok: true,
        content: { ok: true, model: 'gemma2:2b' },
        error: null,
      });
    if (cmd === 'oauth_facebook_get_profile')
      return Promise.resolve({ ok: true, content: null, error: null });
    return Promise.resolve({ ok: true, content: null, error: null });
  });
}

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
    (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockImplementation(
      (cmd: string) => {
        if (cmd === 'ai_check_ollama_status')
          return Promise.resolve({ ok: true, content: { ok: false }, error: null });
        return Promise.resolve({ ok: true, content: null, error: null });
      }
    );
    render(<UnifiedLauncherPanel />);
    expect(screen.getByTestId('unified-launcher-panel')).toBeTruthy();
  });

  it('shows Ollama reachable status after step completes', async () => {
    mockSafeInvokeReady();

    render(<UnifiedLauncherPanel />);

    await waitFor(
      () => {
        expect(screen.getByTestId('unified-launcher-ollama-status')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('shows launch button when ready', async () => {
    mockSafeInvokeReady();

    render(<UnifiedLauncherPanel />);

    await waitFor(
      () => {
        expect(screen.getByTestId('unified-launcher-launch-button')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('calls onLaunchComplete when launch button is clicked', async () => {
    mockSafeInvokeReady();
    const onLaunchComplete = vi.fn();

    render(<UnifiedLauncherPanel onLaunchComplete={onLaunchComplete} />);

    const btn = await screen.findByTestId(
      'unified-launcher-launch-button',
      {},
      { timeout: 3000 }
    );
    fireEvent.click(btn);

    expect(onLaunchComplete).toHaveBeenCalled();
  });

  it('shows step indicators', async () => {
    (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockImplementation(
      (cmd: string) => {
        if (cmd === 'ai_check_ollama_status')
          return Promise.resolve({ ok: true, content: { ok: false }, error: null });
        return Promise.resolve({ ok: true, content: null, error: null });
      }
    );
    render(<UnifiedLauncherPanel />);
    expect(screen.getByTestId('unified-launcher-steps')).toBeTruthy();
  });
});
