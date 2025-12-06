/**
 * TITANE∞ v19.3 — Security Hardening Module (Frontend)
 * 
 * TypeScript wrapper pour Rate Limiting & Audit Logging
 */

import { invoke } from '@tauri-apps/api/tauri'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RateLimitStats {
  count: number
  limit: number
  remaining: number
  reset_at: string // ISO 8601 timestamp
}

export interface AuditEvent {
  timestamp: string // ISO 8601 timestamp
  event_type: AuditEventType
  user_id: string
  details: Record<string, any>
  severity: AuditSeverity
  ip_address?: string
  module?: string
}

export type AuditEventType = 
  | 'LoginAttempt'
  | 'ConfigChange'
  | 'DataAccess'
  | 'DataModification'
  | 'SecurityViolation'
  | 'PrivilegedAction'
  | 'RateLimitExceeded'
  | 'SystemError'
  | { Custom: string }

export type AuditSeverity = 'Info' | 'Warning' | 'Critical'

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtenir les statistiques de rate limiting pour un utilisateur
 * @param userId - ID utilisateur (optionnel, défaut: "anonymous")
 * @returns Statistiques actuelles (count, limit, remaining, reset_at)
 */
export async function getRateLimitStats(userId?: string): Promise<RateLimitStats> {
  return await invoke<RateLimitStats>('get_rate_limit_stats', { 
    userId 
  })
}

/**
 * Réinitialiser le rate limit pour un utilisateur (admin only)
 * @param userId - ID utilisateur à réinitialiser
 */
export async function resetRateLimit(userId: string): Promise<void> {
  await invoke<void>('reset_rate_limit', { userId })
}

/**
 * Nettoyer les anciennes entrées de rate limiting (maintenance)
 */
export async function cleanupRateLimiter(): Promise<void> {
  await invoke<void>('cleanup_rate_limiter')
}

/**
 * Tester le rate limiting (DevTools uniquement)
 * @returns Résultats des tests (60 requêtes)
 */
export async function testRateLimit(): Promise<string> {
  return await invoke<string>('test_rate_limit')
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enregistrer un événement d'audit personnalisé
 * @param eventType - Type d'événement (config_change, data_access, etc.)
 * @param userId - ID utilisateur
 * @param details - Détails de l'événement (texte libre)
 * @param severity - Niveau de sévérité (info, warning, critical)
 */
export async function logAuditEvent(
  eventType: string,
  userId: string,
  details: string,
  severity: 'info' | 'warning' | 'critical' = 'info'
): Promise<void> {
  await invoke<void>('log_audit_event', {
    eventType,
    userId,
    details,
    severity
  })
}

/**
 * Lire tous les événements d'audit pour une date donnée
 * @param date - Date au format YYYY-MM-DD (ex: "2025-12-06")
 * @returns Liste des événements d'audit
 */
export async function getAuditLogs(date: string): Promise<AuditEvent[]> {
  return await invoke<AuditEvent[]>('get_audit_logs', { date })
}

/**
 * Rechercher les événements d'audit par type
 * @param date - Date au format YYYY-MM-DD
 * @param eventType - Type d'événement à filtrer
 * @returns Liste des événements filtrés
 */
export async function searchAuditLogsByType(
  date: string,
  eventType: string
): Promise<AuditEvent[]> {
  return await invoke<AuditEvent[]>('search_audit_logs_by_type', {
    date,
    eventType
  })
}

/**
 * Rechercher les événements d'audit par sévérité
 * @param date - Date au format YYYY-MM-DD
 * @param minSeverity - Niveau minimum de sévérité (info, warning, critical)
 * @returns Liste des événements filtrés
 */
export async function searchAuditLogsBySeverity(
  date: string,
  minSeverity: 'info' | 'warning' | 'critical'
): Promise<AuditEvent[]> {
  return await invoke<AuditEvent[]>('search_audit_logs_by_severity', {
    date,
    minSeverity
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtenir la date actuelle au format YYYY-MM-DD (pour audit logs)
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Vérifier si un rate limit warning devrait être affiché
 * @param stats - Statistiques de rate limiting
 * @param warningThreshold - Seuil d'avertissement (défaut: 5 requêtes restantes)
 * @returns true si un warning devrait être affiché
 */
export function shouldShowRateLimitWarning(
  stats: RateLimitStats,
  warningThreshold: number = 5
): boolean {
  return stats.remaining <= warningThreshold
}

/**
 * Calculer le temps restant avant reset du rate limit
 * @param resetAt - Timestamp ISO 8601 du reset
 * @returns Nombre de secondes avant reset
 */
export function getSecondsUntilReset(resetAt: string): number {
  const now = Date.now()
  const reset = new Date(resetAt).getTime()
  return Math.max(0, Math.ceil((reset - now) / 1000))
}

/**
 * Formater le message d'erreur de rate limit pour l'utilisateur
 * @param stats - Statistiques de rate limiting
 * @returns Message d'erreur formaté
 */
export function formatRateLimitError(stats: RateLimitStats): string {
  const seconds = getSecondsUntilReset(stats.reset_at)
  const minutes = Math.ceil(seconds / 60)
  
  if (minutes > 1) {
    return `Rate limit atteint. Réessayez dans ${minutes} minutes.`
  } else if (seconds > 0) {
    return `Rate limit atteint. Réessayez dans ${seconds} secondes.`
  } else {
    return 'Rate limit atteint. Réessayez dans quelques instants.'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifier si une erreur est une erreur de rate limit
 * @param error - Erreur à vérifier
 * @returns true si c'est une erreur de rate limit
 */
export function isRateLimitError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('Rate limit exceeded') || error.includes('Too many requests')
  }
  if (error instanceof Error) {
    return error.message.includes('Rate limit exceeded') || error.message.includes('Too many requests')
  }
  return false
}

/**
 * Extraire le temps d'attente d'une erreur de rate limit
 * @param error - Erreur de rate limit
 * @returns Temps d'attente en secondes (ou null si non trouvé)
 */
export function extractWaitTimeFromError(error: unknown): number | null {
  const errorStr = typeof error === 'string' ? error : (error as Error).message
  const match = errorStr.match(/Try again in (\d+) seconds/)
  return match ? parseInt(match[1]) : null
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Rate Limiting
  getRateLimitStats,
  resetRateLimit,
  cleanupRateLimiter,
  testRateLimit,
  
  // Audit Logging
  logAuditEvent,
  getAuditLogs,
  searchAuditLogsByType,
  searchAuditLogsBySeverity,
  
  // Utilities
  getCurrentDate,
  shouldShowRateLimitWarning,
  getSecondsUntilReset,
  formatRateLimitError,
  isRateLimitError,
  extractWaitTimeFromError,
}
