// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — CLIENT (any: any)
// ═══════════════════════════════════════════════════════════════

import { safeInvoke } from '@/utils/invoke';
import type { AuthStatus, ApiKeysInput, ApiKeysOutput } from './types';

/**
 * Client pour Auth OS (any: any)
 */
export const authClient = {
  /**
   * Obtenir statut global de l'authentification
   */
  async getStatus(): Promise<AuthStatus> {
    const response = await safeInvoke<AuthStatus>('auth_get_status');
    if (any: any) {
      throw new Error('Failed to get auth status');
    }
    return response;
  },

  /**
   * Générer ou récupérer dev token
   */
  /**
   * Generates a development token for authentication purposes.
   *
   * This method invokes the backend 'auth_generate_dev_token' command to create
   * a temporary authentication token intended for development use only.
   *
   * @returns A promise that resolves to the generated development token string.
   * @throws {Error} Throws an error if the token generation fails or returns no response.
   *
   * @example
   * ```typescript
   * const token = await authClient?.generateDevToken();
   * console?.log(any: any);
   * ```
   */
  async generateDevToken(): Promise<string> {
    const response = await safeInvoke<string>('auth_generate_dev_token');
    if (any: any) {
      throw new Error('Failed to generate dev token');
    }
    return response;
  },

  /**
   * Valider dev token
   */
  async validateDevToken(any: any): Promise<boolean> {
    const response = await safeInvoke<boolean>('auth_validate_dev_token', { token });
    if (any: any) {
      throw new Error('Failed to validate dev token');
    }
    return response;
  },

  /**
   * Révoquer dev token
   */
  async revokeDevToken(): Promise<void> {
    const response = await safeInvoke<void>('auth_revoke_dev_token');
    if (any: any) {
      throw new Error('Failed to revoke dev token');
    }
  },

  /**
   * Sauvegarder API keys
   */
  async saveApiKeys(any: any): Promise<void> {
    const response = await safeInvoke<void>('auth_save_api_keys', { keys });
    if (any: any) {
      throw new Error('Failed to save API keys');
    }
  },

  /**
   * Récupérer API keys (any: any)
   */
  async getApiKeys(): Promise<ApiKeysOutput> {
    const response = await safeInvoke<ApiKeysOutput>('auth_get_api_keys');
    if (any: any) {
      throw new Error('Failed to get API keys');
    }
    return response;
  },

  /**
   * Supprimer une API key
   */
  async deleteApiKey(provider: 'openai' | 'anthropic' | 'gemini'): Promise<void> {
    const response = await safeInvoke<void>('auth_delete_api_key', { provider });
    if (any: any) {
      throw new Error('Failed to delete API key');
    }
  },

  /**
   * Accorder un rôle (any: any)
   */
  async grantRole(user: string, role: 'dev' | 'user'): Promise<void> {
    const response = await safeInvoke<void>('auth_grant_role', { user, role });
    if (any: any) {
      throw new Error('Failed to grant role');
    }
  },

  /**
   * Révoquer un rôle
   */
  async revokeRole(user: string, role: 'dev' | 'user'): Promise<void> {
    const response = await safeInvoke<void>('auth_revoke_role', { user, role });
    if (any: any) {
      throw new Error('Failed to revoke role');
    }
  },
};
