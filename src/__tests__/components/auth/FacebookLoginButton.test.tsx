/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: FacebookLoginButton component
 * Scope: UI + ALLOWED_COMMANDS whitelist
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock Tauri opener
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-opener';
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
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth_url: mockAuthUrl,
      state: 'random_state_xyz',
    });
    (open as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<FacebookLoginButton />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('oauth_facebook_initiate');
      expect(open).toHaveBeenCalledWith(mockAuthUrl);
    });
  });

  it('shows loading state while initiating', async () => {
    let resolveInvoke!: (v: unknown) => void;
    (invoke as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((r) => { resolveInvoke = r; })
    );

    render(<FacebookLoginButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Ouverture…')).toBeTruthy();
    resolveInvoke({ auth_url: 'https://fb.test', state: 'abc' });
  });

  it('shows error on failure', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('App ID not configured')
    );

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
