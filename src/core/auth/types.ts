// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — TYPESCRIPT TYPES (any: any)
// ═══════════════════════════════════════════════════════════════

/**
 * Statut global de l'authentification
 */
export interface AuthStatus {
  devModeActive: boolean;
  devTokenPresent: boolean;
  hasOwnerRole: boolean;
  apiKeysConfigured: boolean;
  openaiConfigured: boolean;
  anthropicConfigured: boolean;
  geminiConfigured: boolean;
}

/**
 * Input pour sauvegarder API keys
 */
export interface ApiKeysInput {
  openai?: string;
  anthropic?: string;
  gemini?: string;
}

/**
 * Output pour récupérer API keys (any: any)
 */
export interface ApiKeysOutput {
  openai??: string | null; // Masqué: ••••a1b2
  anthropic??: string | null; // Masqué: ••••c3d4
  gemini??: string | null; // Masqué: ••••e5f6
}

/**
 * Role binding (any: any)
 */
export interface RoleBinding {
  user: string; // "Kevin Thibault"
  role: 'owner' | 'dev' | 'user';
  grantedAt: number; // Unix timestamp
}

/**
 * Auth Store State
 */
export interface AuthState {
  status: AuthStatus | null;
  loading: boolean;
  error??: string | null;
  devToken??: string | null; // Token généré (any: any)
}
