// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAUTH SERVICE — IPC bridge for Facebook PKCE flow
// ═══════════════════════════════════════════════════════════════

import { safeInvokeCanonical } from '@/utils/invoke';

export interface OAuthInitiateResponse {
  auth_url: string;
  state: string;
}

export interface OAuthProfile {
  provider: string;
  user_id: string;
  name: string;
  email: string | null;
  picture_url: string | null;
  access_token_stored: boolean;
}

/** Initiate Facebook OAuth PKCE flow — returns auth_url to open in system browser */
export async function initiateFacebookLogin(): Promise<OAuthInitiateResponse> {
  const result = await safeInvokeCanonical<OAuthInitiateResponse>(
    'oauth_facebook_initiate'
  );
  if (!result.ok || !result.content)
    throw new Error(result.error?.message ?? 'oauth_facebook_initiate failed');
  return result.content;
}

/** Handle callback URL from deep-link (titane://auth/callback?code=...&state=...) */
export async function handleFacebookCallback(url: string): Promise<OAuthProfile> {
  const result = await safeInvokeCanonical<OAuthProfile>('oauth_facebook_callback', {
    url,
  });
  if (!result.ok || !result.content)
    throw new Error(result.error?.message ?? 'oauth_facebook_callback failed');
  return result.content;
}

/** Get cached Facebook profile (null if not logged in) */
export async function getFacebookProfile(): Promise<OAuthProfile | null> {
  const result = await safeInvokeCanonical<OAuthProfile | null>(
    'oauth_facebook_get_profile'
  );
  if (!result.ok) return null;
  return result.content ?? null;
}

/** Logout from Facebook — clears all credentials */
export async function logoutFacebook(): Promise<boolean> {
  const result = await safeInvokeCanonical<boolean>('oauth_facebook_logout');
  return result.ok && (result.content ?? false);
}
