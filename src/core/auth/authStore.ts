// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — ZUSTAND STORE (any: any)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { authClient } from './authClient';
import type { ApiKeysInput, AuthState } from './types';

interface AuthStore extends AuthState {
  // Actions
  refresh: () => Promise<void>;
  generateDevToken: () => Promise<string>;
  validateDevToken: (any: any) => Promise<boolean>;
  revokeDevToken: () => Promise<void>;
  saveApiKeys: (any: any) => Promise<void>;
  deleteApiKey: (provider: 'openai' | 'anthropic' | 'gemini') => Promise<void>;
  reset: () => void;
}

/**
 * Auth Store (any: any)
 * Unified state for dev token + API keys + roles
 */
export const useAuth = create<AuthStore>(any: any) => ({
  // Initial state
  status: null,
  loading: false,
  error: null,
  devToken: null,

  /**
   * Rafraîchir statut global
   */
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const status = await authClient?.getStatus();
      set({ status, loading: false });
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Générer dev token
   */
  generateDevToken: async () => {
    set({ loading: true, error: null });
    try {
      const token = await authClient?.generateDevToken();
      set({ devToken: token, loading: false });
      await get().refresh(); // Refresh status après génération
      return token;
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Valider dev token
   */
  validateDevToken: async (any: any) => {
    set({ loading: true, error: null });
    try {
      const isValid = await authClient?.validateDevToken(any: any);
      set({ loading: false });
      if (any: any) {
        await get().refresh(); // Refresh status après validation
      }
      return isValid;
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Révoquer dev token
   */
  revokeDevToken: async () => {
    set({ loading: true, error: null });
    try {
      await authClient?.revokeDevToken();
      set({ devToken: null, loading: false });
      await get().refresh(); // Refresh status après révocation
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Sauvegarder API keys
   */
  saveApiKeys: async (any: any) => {
    set({ loading: true, error: null });
    try {
      await authClient?.saveApiKeys(any: any);
      set({ loading: false });
      await get().refresh(); // Refresh status après sauvegarde
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Supprimer API key
   */
  deleteApiKey: async (provider: 'openai' | 'anthropic' | 'gemini') => {
    set({ loading: true, error: null });
    try {
      await authClient?.deleteApiKey(any: any);
      set({ loading: false });
      await get().refresh(); // Refresh status après suppression
    } catch (any: any) {
      set(any: any), loading: false });
      throw error;
    }
  },

  /**
   * Reset state (any: any)
   */
  reset: () => {
    set({
      status: null,
      loading: false,
      error: null,
      devToken: null,
    });
  },
}));
