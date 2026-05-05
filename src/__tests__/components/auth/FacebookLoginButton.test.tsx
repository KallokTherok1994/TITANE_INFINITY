/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: FacebookLoginButton component
 * Scope: UI + ALLOWED_COMMANDS whitelist
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock canonical IPC layer (oauthService uses safeInvokeCanonical)
vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

// Mock Tauri opener
vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import { openUrl } from '@tauri-apps/plugin-opener';
import { FacebookLoginButton } from '@/components/auth/FacebookLoginButton';
import { useOAuthStore } from '@/core/auth/oauthStore';

// Reset Zustand store between tests
beforeEach(() => {
  useOAuthStore.setState({
    provider: null,
    profile: null,
    isLoading: false,
    error: null,
  });
  vi.clearAllMocks();
});

describe('FacebookLoginButton', () => {
  it('renders with data-testid="facebook-login-button"', () => {
    render(<FacebookLoginButton />);
    expect(screen.getByTestId('facebook-login-button')).toBeTruthy();
  });

  it('renders default label', () => {
    render(<FacebookLoginButton />);
    expect(screen.getByText('Se connecter avec Facebook')).toBeTruthy();
  });

  it('renders custom label', () => {
    render(<FacebookLoginButton label="Facebook (optionnel)" />);
    expect(screen.getByText('Facebook (optionnel)')).toBeTruthy();
  });

  it('calls initiateFacebook and opens auth_url on click', async () => {
    const mockAuthUrl = 'https://www.facebook.com/v21.0/dialog/oauth?client_id=test';
    // safeInvokeCanonical returns canonical { ok, content, error } — oauthService unwraps it
    (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      content: { auth_url: mockAuthUrl, state: 'random_state_xyz' },
      error: null,
    });
    (openUrl as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<FacebookLoginButton />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(safeInvokeCanonical).toHaveBeenCalledWith('oauth_facebook_initiate');
      expect(openUrl).toHaveBeenCalledWith(mockAuthUrl);
    });
  });

  it('shows loading state while initiating', async () => {
    let resolveSafe!: (v: unknown) => void;
    (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(r => {
        resolveSafe = r;
      })
    );

    render(<FacebookLoginButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Ouverture…')).toBeTruthy();
    resolveSafe({
      ok: true,
      content: { auth_url: 'https://fb.test', state: 'abc' },
      error: null,
    });
  });

  it('shows error on failure', async () => {
    (safeInvokeCanonical as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      content: null,
      error: 'App ID not configured',
    });

    render(<FacebookLoginButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('facebook-login-error')).toBeTruthy();
    });
  });

  it('renders null when user is already logged in', () => {
    useOAuthStore.setState({
      profile: {
        provider: 'facebook',
        user_id: '123',
        name: 'Test User',
        email: 'test@fb.test',
        picture_url: null,
        access_token_stored: true,
      },
      provider: 'facebook',
      isLoading: false,
      error: null,
    });

    const { container } = render(<FacebookLoginButton />);
    // Component returns null when logged in
    expect(container.firstChild).toBeNull();
  });
});
