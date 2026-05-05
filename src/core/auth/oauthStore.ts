// TITANE_INFINITY v∞ — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   OAUTH STORE — Zustand store for Facebook OAuth state
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { openUrl } from '@tauri-apps/plugin-opener';
import {
  type OAuthProfile,
  initiateFacebookLogin,
  handleFacebookCallback,
  getFacebookProfile,
  logoutFacebook,
} from '@/services/auth/oauthService';

interface OAuthState {
  /** Connected provider name (e.g. 'facebook') or null */
  provider: string | null;
  /** Current OAuth profile or null */
  profile: OAuthProfile | null;
  /** Whether an OAuth operation is in progress */
  isLoading: boolean;
  /** Last error message or null */
  error: string | null;

  /** Initiate Facebook login — opens system browser */
  initiateFacebook: () => Promise<void>;
  /** Handle deep-link callback URL (titane://auth/callback?...) */
  handleCallback: (url: string) => Promise<void>;
  /** Load profile from Rust secure storage */
  loadProfile: () => Promise<void>;
  /** Logout and clear credentials */
  logout: () => Promise<void>;
  /** Clear last error */
  clearError: () => void;
}

export const useOAuthStore = create<OAuthState>(set => ({
  provider: null,
  profile: null,
  isLoading: false,
  error: null,

  initiateFacebook: async () => {
    set({ isLoading: true, error: null });
    try {
      const { auth_url } = await initiateFacebookLogin();
      // Open in system default browser (not in Tauri WebView — PKCE flow)
      await openUrl(auth_url);
    } catch (err) {
      set({ error: String(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  handleCallback: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await handleFacebookCallback(url);
      set({ profile, provider: 'facebook', isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  loadProfile: async () => {
    try {
      const profile = await getFacebookProfile();
      if (profile) {
        set({ profile, provider: 'facebook' });
      }
    } catch {
      // Non-fatal: user just isn't logged in
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutFacebook();
      set({ profile: null, provider: null, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
