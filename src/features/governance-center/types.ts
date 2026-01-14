/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   TYPES — Centre Gouvernance & Sécurité
 *   Définitions TypeScript pour secrets, politiques, permissions, journal
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// RÔLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Rôles hiérarchiques TITANE∞
 * ROOT > SYSTEM > IA > USER
 */
export type Role = 'Root' | 'System' | 'Ia' | 'User';

/**
 * Statut d'audit pour une action
 */
export type AuditStatus = 'Allowed' | 'Denied' | 'Alert';

/**
 * Entrée du journal d'audit des permissions
 */
export interface PermissionAudit {
  timestamp: number;
  role: Role;
  action: string;
  status: AuditStatus;
  source: string;
}

/**
 * Matrice de permissions (action → rôles autorisés)
 */
export type PermissionMatrix = Record<string, Role[]>;

/**
 * Catégorie de permission pour l'affichage UI
 */
export interface PermissionCategory {
  id: string;
  label: string;
  icon: string;
  actions: string[];
}

// ═══════════════════════════════════════════════════════════════
// SECRETS
// ═══════════════════════════════════════════════════════════════

/**
 * Statut d'un secret (sans exposer la valeur)
 */
export interface SecretStatus {
  key: string;
  configured: boolean;
  maskedValue: string | null;
  lastUpdated: number | null;
  category: SecretCategory;
}

/**
 * Catégories de secrets
 */
export type SecretCategory = 'api_key' | 'token' | 'credential' | 'certificate' | 'other';

/**
 * Résultat d'opération sur secret
 */
export interface SecretOperationResult {
  key: string;
  stored: boolean;
  envPurged: boolean;
}

/**
 * Status de la clé Gemini
 */
export interface GeminiKeyStatus {
  configured: boolean;
  provider_enabled: boolean;
  masked_key: string | null;
  env_present: boolean;
  env_purged: boolean;
  was_updated: boolean;
}

/**
 * Status de la clé GitHub Copilot
 * (Retour direct du backend Rust, sans enveloppe SecureResponse)
 */
export interface CopilotKeyStatus {
  configured: boolean;
  status: string;
  message: string | null;
}

/**
 * Status d'Ollama (local, pas de clé)
 */
export interface OllamaStatus {
  provider_enabled: boolean;
  available: boolean;
  url: string;
  models: string[];
}

/**
 * Liste des secrets connus du système
 */
export const KNOWN_SECRETS: {
  key: string;
  label: string;
  category: SecretCategory;
  description?: string;
}[] = [
  {
    key: 'gemini_api_key',
    label: 'Gemini API Key',
    category: 'api_key',
    description: 'Google Gemini API (https://ai.google.dev)',
  },
  {
    key: 'openai_api_key',
    label: 'OpenAI API Key',
    category: 'api_key',
    description: 'OpenAI Platform API (https://platform.openai.com)',
  },
  {
    key: 'anthropic_api_key',
    label: 'Anthropic API Key',
    category: 'api_key',
    description: 'Anthropic Claude API (https://console.anthropic.com)',
  },
  {
    key: 'copilot_api_key',
    label: 'GitHub Copilot API Key',
    category: 'api_key',
    description:
      'GitHub Copilot / GitHub Models API (https://github.com/marketplace/models)',
  },
  {
    key: 'ollama_url',
    label: 'Ollama URL',
    category: 'api_key',
    description: 'URL du serveur Ollama local (default: http://localhost:11434)',
  },
  {
    key: 'github_token',
    label: 'GitHub Token',
    category: 'token',
    description: "Token d'accès personnel GitHub",
  },
  {
    key: 'backup_encryption_key',
    label: 'Backup Encryption Key',
    category: 'credential',
    description: 'Clé de chiffrement pour les backups',
  },
];

// ═══════════════════════════════════════════════════════════════
// POLITIQUES IA
// ═══════════════════════════════════════════════════════════════

/**
 * Types de politiques
 */
export type PolicyType = 'limit' | 'guardrail' | 'restriction' | 'audit';

/**
 * Niveau de sévérité
 */
export type PolicySeverity = 'info' | 'warning' | 'critical';

/**
 * Politique IA individuelle
 */
export interface IAPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  severity: PolicySeverity;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Politiques prédéfinies TITANE∞
 */
export const DEFAULT_POLICIES: IAPolicy[] = [
  {
    id: 'max_tokens_per_request',
    name: 'Limite de tokens par requête',
    description: 'Limite le nombre maximum de tokens générés par requête IA',
    type: 'limit',
    severity: 'warning',
    enabled: true,
    config: { maxTokens: 4096 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'content_filter',
    name: 'Filtre de contenu',
    description: 'Bloque les contenus inappropriés ou dangereux',
    type: 'guardrail',
    severity: 'critical',
    enabled: true,
    config: { categories: ['harmful', 'illegal', 'explicit'] },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'rate_limit',
    name: 'Limite de débit',
    description: 'Limite le nombre de requêtes IA par minute',
    type: 'limit',
    severity: 'warning',
    enabled: true,
    config: { requestsPerMinute: 60 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'memory_access_audit',
    name: 'Audit accès mémoire',
    description: 'Journalise tous les accès à la mémoire persistante',
    type: 'audit',
    severity: 'info',
    enabled: true,
    config: { logLevel: 'verbose' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'external_api_restriction',
    name: 'Restriction API externes',
    description: 'Restreint les appels à des APIs non autorisées',
    type: 'restriction',
    severity: 'critical',
    enabled: true,
    config: {
      allowedDomains: [
        'generativelanguage.googleapis.com',
        'api.openai.com',
        'api.anthropic.com',
        'api.github.com',
        'models.github.com',
      ],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ═══════════════════════════════════════════════════════════════
// JOURNAL DE SÉCURITÉ
// ═══════════════════════════════════════════════════════════════

/**
 * Niveau de log
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Catégorie d'événement de sécurité
 */
export type SecurityEventCategory =
  | 'authentication'
  | 'authorization'
  | 'secrets'
  | 'policy'
  | 'system'
  | 'audit';

/**
 * Entrée du journal de sécurité
 */
export interface SecurityLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: SecurityEventCategory;
  event: string;
  details: string;
  source: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Filtres pour le journal
 */
export interface SecurityLogFilters {
  level?: LogLevel;
  category?: SecurityEventCategory;
  startDate?: number;
  endDate?: number;
  search?: string;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════
// RÉPONSES API
// ═══════════════════════════════════════════════════════════════

/**
 * Réponse sécurisée générique
 */
export interface SecureResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

/**
 * État global du centre de gouvernance
 */
export interface GovernanceState {
  // Secrets
  secretsStatus: SecretStatus[];
  geminiStatus: GeminiKeyStatus | null;
  openaiStatus: GeminiKeyStatus | null;
  anthropicStatus: GeminiKeyStatus | null;
  copilotStatus: CopilotKeyStatus | null; // ✨ v26.3 - GitHub Copilot
  ollamaStatus: OllamaStatus | null;

  // Politiques
  policies: IAPolicy[];

  // Permissions
  permissionMatrix: PermissionMatrix;
  permissionAudit: PermissionAudit[];

  // Journal
  securityLog: SecurityLogEntry[];
  logFilters: SecurityLogFilters;

  // UI
  loading: boolean;
  error: string | null;
  activeTab: GovernanceTab;
}

/**
 * Onglets du centre de gouvernance
 */
export type GovernanceTab = 'secrets' | 'policies' | 'permissions' | 'logs';

/**
 * Configuration des onglets
 */
export const GOVERNANCE_TABS: { id: GovernanceTab; label: string; icon: string }[] = [
  { id: 'secrets', label: 'Secrets', icon: '🔐' },
  { id: 'policies', label: 'Politiques IA', icon: '📋' },
  { id: 'permissions', label: 'Permissions', icon: '🛡️' },
  { id: 'logs', label: 'Journal', icon: '📜' },
];

// ═══════════════════════════════════════════════════════════════
// KEVIN THIBAULT — SUPER ADMIN
// ═══════════════════════════════════════════════════════════════

/**
 * Kevin Thibault est le seul superAdmin de TITANE∞
 * Toutes les actions critiques nécessitent son autorisation
 */
export const SUPER_ADMIN = {
  id: 'kevin_thibault',
  name: 'Kevin Thibault',
  role: 'Root' as Role,
  permissions: ['*'], // Toutes les permissions
};

/**
 * Vérifier si l'utilisateur actuel est Kevin (superAdmin)
 */
export function isSuperAdmin(userId?: string): boolean {
  return userId === SUPER_ADMIN.id;
}
