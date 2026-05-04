// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAUTH SERVICE — IPC bridge for Facebook PKCE flow
// ═══════════════════════════════════════════════════════════════

import { invoke } from '@tauri-apps/api/core';

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
  return invoke<OAuthInitiateResponse>('oauth_facebook_initiate');
}

/** Handle callback URL from deep-link (titane://auth/callback?code=...&state=...) */
export async function handleFacebookCallback(url: string): Promise<OAuthProfile> {
  return invoke<OAuthProfile>('oauth_facebook_callback', { url });
}

/** Get cached Facebook profile (null if not logged in) */
export async function getFacebookProfile(): Promise<OAuthProfile | null> {
  return invoke<OAuthProfile | null>('oauth_facebook_get_profile');
}

/** Logout from Facebook — clears all credentials */
export async function logoutFacebook(): Promise<boolean> {
  return invoke<boolean>('oauth_facebook_logout');
}
