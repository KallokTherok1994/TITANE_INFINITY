/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: oauthService IPC bridge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import {
  initiateFacebookLogin,
  handleFacebookCallback,
  getFacebookProfile,
  logoutFacebook,
} from '@/services/auth/oauthService';

beforeEach(() => vi.clearAllMocks());

describe('oauthService', () => {
  it('initiateFacebookLogin calls oauth_facebook_initiate', async () => {
    const mockResp = { auth_url: 'https://fb.com/dialog', state: 'abc' };
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(mockResp);

    const result = await initiateFacebookLogin();
    expect(invoke).toHaveBeenCalledWith('oauth_facebook_initiate');
    expect(result).toEqual(mockResp);
  });

  it('handleFacebookCallback calls oauth_facebook_callback with url', async () => {
    const mockProfile = {
      provider: 'facebook', user_id: '123', name: 'Test',
      email: null, picture_url: null, access_token_stored: true,
    };
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(mockProfile);

    const url = 'titane://auth/callback?code=XYZW&state=abc123';
    const result = await handleFacebookCallback(url);
    expect(invoke).toHaveBeenCalledWith('oauth_facebook_callback', { url });
    expect(result.provider).toBe('facebook');
  });

  it('getFacebookProfile calls oauth_facebook_get_profile', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getFacebookProfile();
    expect(invoke).toHaveBeenCalledWith('oauth_facebook_get_profile');
    expect(result).toBeNull();
  });

  it('logoutFacebook calls oauth_facebook_logout', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await logoutFacebook();
    expect(invoke).toHaveBeenCalledWith('oauth_facebook_logout');
    expect(result).toBe(true);
  });

  it('propagates errors from invoke', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('IPC error'));
    await expect(initiateFacebookLogin()).rejects.toThrow('IPC error');
  });
});
