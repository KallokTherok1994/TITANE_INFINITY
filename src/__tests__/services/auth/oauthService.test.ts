/**
 * TITANE_INFINITY v∞ — Proprietary License
 * Tests: oauthService IPC bridge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// oauthService routes all IPC through safeInvokeCanonical (One Door compliance)
vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import {
  initiateFacebookLogin,
  handleFacebookCallback,
  getFacebookProfile,
  logoutFacebook,
} from '@/services/auth/oauthService';

const mockSafe = safeInvokeCanonical as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe('oauthService', () => {
  it('initiateFacebookLogin calls oauth_facebook_initiate', async () => {
    const mockResp = { auth_url: 'https://fb.com/dialog', state: 'abc' };
    mockSafe.mockResolvedValue({ ok: true, content: mockResp, error: null });

    const result = await initiateFacebookLogin();
    expect(safeInvokeCanonical).toHaveBeenCalledWith('oauth_facebook_initiate');
    expect(result).toEqual(mockResp);
  });

  it('handleFacebookCallback calls oauth_facebook_callback with url', async () => {
    const mockProfile = {
      provider: 'facebook',
      user_id: '123',
      name: 'Test',
      email: null,
      picture_url: null,
      access_token_stored: true,
    };
    mockSafe.mockResolvedValue({ ok: true, content: mockProfile, error: null });

    const url = 'titane://auth/callback?code=XYZW&state=abc123';
    const result = await handleFacebookCallback(url);
    expect(safeInvokeCanonical).toHaveBeenCalledWith('oauth_facebook_callback', { url });
    expect(result.provider).toBe('facebook');
  });

  it('getFacebookProfile calls oauth_facebook_get_profile', async () => {
    mockSafe.mockResolvedValue({ ok: true, content: null, error: null });
    const result = await getFacebookProfile();
    expect(safeInvokeCanonical).toHaveBeenCalledWith('oauth_facebook_get_profile');
    expect(result).toBeNull();
  });

  it('logoutFacebook calls oauth_facebook_logout', async () => {
    mockSafe.mockResolvedValue({ ok: true, content: true, error: null });
    const result = await logoutFacebook();
    expect(safeInvokeCanonical).toHaveBeenCalledWith('oauth_facebook_logout');
    expect(result).toBe(true);
  });

  it('propagates errors from invoke', async () => {
    mockSafe.mockResolvedValue({ ok: false, content: null, error: 'IPC error' });
    await expect(initiateFacebookLogin()).rejects.toThrow('IPC error');
  });
});
