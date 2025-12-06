/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CHAT SHARED TYPES
 *   Break circular dependencies between chatEngine and chatValidator
 * ═══════════════════════════════════════════════════════════════════
 */

export type ChatMode =
  | 'default'
  | 'dev-senior'
  | 'nexus-guide'
  | 'sentinel-guardian'
  | 'artisan-creator'
  | 'visionary-philosopher'
  | 'omega-meta'
  | 'brainstorming'
  | 'synthesis'
  | 'planning'
  | 'journal'
  | 'debug_cognitive';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1 (qualité globale)
  coherenceScore: number; // 0-1 (cohérence Nexus)
  anomalyScore: number; // 0-1 (0 = anomalie détectée)
  issues: ValidationIssue[];
  cleaned?: string; // Réponse nettoyée si nécessaire
}

export interface ValidationIssue {
  type: 'coherence' | 'anomaly' | 'format' | 'content';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: string;
}

export interface ChatValidator {
  validate(
    response: string,
    mode: ChatMode,
    userMessage: string
  ): ValidationResult;
}
