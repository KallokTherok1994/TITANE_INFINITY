/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — IA CONTEXT TYPES
 * Types TypeScript pour le contexte IA (Phase 8)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Statut d'un moteur IA
 */
export enum IAStatus {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Error = 'Error',
  Disabled = 'Disabled',
  Testing = 'Testing',
}

/**
 * Métriques d'utilisation d'un moteur IA
 */
export interface IAEngineMetrics {
  /** Nombre total de requêtes */
  total_requests: number;

  /** Nombre de requêtes réussies */
  successful_requests: number;

  /** Nombre de requêtes échouées */
  failed_requests: number;

  /** Latence moyenne (ms) */
  average_latency_ms: number;

  /** Total de tokens utilisés */
  total_tokens: number;

  /** Dernière utilisation (ISO 8601) */
  last_used_at: string | null;
}

/**
 * Enregistrement d'une requête IA
 */
export interface IARequestRecord {
  /** ID unique de la requête */
  request_id: string;

  /** Moteur utilisé */
  engine: string;

  /** Agent ayant fait la requête */
  agent_id: string | null;

  /** Timestamp de la requête */
  timestamp: string;

  /** Latence (ms) */
  latency_ms: number;

  /** Nombre de tokens */
  tokens: number;

  /** Succès ou échec */
  success: boolean;

  /** Message d'erreur éventuel */
  error_message: string | null;

  /** Fallback utilisé ? */
  fallback_used: boolean;
}

/**
 * Contexte IA global du système
 */
export interface IAContext {
  /** Moteur IA actuellement actif */
  active_engine: string | null;

  /** Liste des moteurs IA disponibles */
  available_engines: string[];

  /** Statut de chaque moteur IA */
  engine_status: Record<string, IAStatus>;

  /** Métriques d'utilisation par moteur */
  engine_metrics: Record<string, IAEngineMetrics>;

  /** Dernier agent ayant utilisé l'IA */
  last_used_agent: string | null;

  /** Permissions IA par agent */
  agent_permissions: Record<string, string>;

  /** Recommandations de moteur par agent */
  agent_recommendations: Record<string, string>;

  /** Historique des requêtes IA (max 100) */
  request_history: IARequestRecord[];

  /** Configuration du fallback automatique */
  auto_fallback_enabled: boolean;

  /** Ordre de fallback */
  fallback_order: string[];

  /** Version du contexte IA */
  version: string;

  /** Timestamp de dernière mise à jour */
  updated_at: string;
}

/**
 * Statistiques globales IA
 */
export interface IAGlobalStats {
  total_requests: number;
  total_successful: number;
  total_failed: number;
  success_rate: number;
  total_tokens: number;
  engines_available: number;
  active_engine: string | null;
  last_used_agent: string | null;
}

/**
 * Résultat de commande générique
 */
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Labels d'affichage pour les statuts IA
 */
export const IAStatusLabels: Record<IAStatus, string> = {
  [IAStatus.Available]: '🟢 Disponible',
  [IAStatus.Unavailable]: '⚪ Indisponible',
  [IAStatus.Error]: '🔴 Erreur',
  [IAStatus.Disabled]: '⛔ Désactivé',
  [IAStatus.Testing]: '🔵 Test en cours',
};

/**
 * Couleurs pour les statuts IA
 */
export const IAStatusColors: Record<IAStatus, string> = {
  [IAStatus.Available]: '#22c55e',
  [IAStatus.Unavailable]: '#9ca3af',
  [IAStatus.Error]: '#ef4444',
  [IAStatus.Disabled]: '#f97316',
  [IAStatus.Testing]: '#3b82f6',
};

/**
 * Labels d'affichage pour les moteurs IA
 */
export const IAEngineLabels: Record<string, string> = {
  openai: '🤖 OpenAI GPT-4',
  claude: '🧠 Anthropic Claude 3.5',
  gemini: '✨ Google Gemini',
  local: '🏠 TITANE Local',
  ollama: '🦙 Ollama',
};

/**
 * Couleurs pour les moteurs IA
 */
export const IAEngineColors: Record<string, string> = {
  openai: '#10a37f',
  claude: '#d97757',
  gemini: '#4285f4',
  local: '#667eea',
  ollama: '#22c55e',
};

/**
 * Calcule le taux de réussite en pourcentage
 */
export function calculateSuccessRate(metrics: IAEngineMetrics): number {
  if (metrics.total_requests === 0) return 0;
  return (metrics.successful_requests / metrics.total_requests) * 100;
}

/**
 * Formate la latence moyenne pour affichage
 */
export function formatLatency(latency_ms: number): string {
  if (latency_ms < 1000) {
    return `${latency_ms}ms`;
  }
  return `${(latency_ms / 1000).toFixed(2)}s`;
}

/**
 * Formate le nombre de tokens pour affichage
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return tokens.toString();
  } else if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  } else {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
}

/**
 * Formate le timestamp pour affichage relatif
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
