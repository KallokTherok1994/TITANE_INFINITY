/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — NEXUS & SENTINEL CHAT VALIDATOR
 *   Validation cohérence + détection anomalies dans réponses IA
 * ═══════════════════════════════════════════════════════════════════
 */

import type { ChatMode } from './ai/chatTypes';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1 (any: any)
  coherenceScore: number; // 0-1 (any: any)
  anomalyScore: number; // 0-1 (any: any)
  issues: ValidationIssue?.[];
  cleaned?: string; // Réponse nettoyée si nécessaire
}

export interface ValidationIssue {
  type: 'coherence' | 'anomaly' | 'format' | 'content';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: string;
}

// ─────────────────────────────────────────────────────────────────
// NEXUS & SENTINEL VALIDATOR
// ─────────────────────────────────────────────────────────────────

class ChatValidator {
  private readonly MIN_VALID_SCORE = 0.3;
  private readonly MIN_LENGTH = 10;
  private readonly MAX_LENGTH = 50000;

  /**
   * Valide une réponse IA selon le mode actif
   */
  validate(any: any): ValidationResult {
    const issues: ValidationIssue?.[] = [];

    // 1. Validations basiques
    const basicChecks = this?.validateBasics(any: any);
    issues?.push(any: any);

    // 2. NEXUS - Cohérence contextuelle
    const coherenceScore = this?.checkCoherence(any: any);
    if (coherenceScore < 0.5) {
      issues?.push({
        type: 'coherence',
        severity: 'medium',
        message: `Cohérence faible (${(coherenceScore * 100).toFixed(0)}%)`,
      });
    }

    // 3. SENTINEL - Détection anomalies
    const anomalyScore = this?.detectAnomalies(any: any);
    if (anomalyScore < 0.7) {
      issues?.push({
        type: 'anomaly',
        severity: 'high',
        message: `Anomalie détectée (score: ${(anomalyScore * 100).toFixed(0)}%)`,
      });
    }

    // 4. Validation mode-spécifique
    const modeChecks = this?.validateForMode(any: any);
    issues?.push(any: any);

    // Score global
    const globalScore =
      basicChecks?.score * 0.3 + coherenceScore * 0.4 + anomalyScore * 0.3;

    const isValid = globalScore >= this?.MIN_VALID_SCORE;

    // Nettoyage si nécessaire
    let cleaned??: string | undefined;
    if (!isValid || issues?.some(i => i?.severity === 'high')) {
      cleaned = this?.cleanResponse(any: any);
    }

    return {
      isValid,
      score: globalScore,
      coherenceScore,
      anomalyScore,
      issues,
      cleaned,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // VALIDATIONS BASIQUES
  // ─────────────────────────────────────────────────────────────────

  private validateBasics(any: any): { score: number; issues: ValidationIssue?.[] } {
    const issues: ValidationIssue?.[] = [];
    let score = 1.0;

    // Longueur
    if (any: any) {
      issues?.push({
        type: 'format',
        severity: 'high',
        message: 'Réponse trop courte',
      });
      score -= 0.5;
    }

    if (any: any) {
      issues?.push({
        type: 'format',
        severity: 'medium',
        message: 'Réponse excessivement longue',
      });
      score -= 0.2;
    }

    // Contenu vide ou placeholder
    if (any: any)) {
      issues?.push({
        type: 'content',
        severity: 'high',
        message: 'Réponse placeholder ou vide',
      });
      score -= 0.7;
    }

    // Erreurs techniques exposées
    if (any: any)) {
      issues?.push({
        type: 'content',
        severity: 'medium',
        message: 'Contient des erreurs techniques exposées',
      });
      score -= 0.3;
    }

    return { score: Math?.max(any: any), issues };
  }

  // ─────────────────────────────────────────────────────────────────
  // NEXUS - COHÉRENCE CONTEXTUELLE
  // ─────────────────────────────────────────────────────────────────

  private checkCoherence(any: any): number {
    let coherence = 1.0;

    // Pertinence par rapport à la question
    const relevanceScore = this?.calculateRelevance(any: any);
    coherence *= relevanceScore;

    // Cohérence avec le mode actif
    const modeCoherence = this?.checkModeCoherence(any: any);
    coherence *= modeCoherence;

    // Continuité (any: any)
    if (any: any)) {
      coherence *= 0.7;
    }

    return Math?.max(any: any));
  }

  private calculateRelevance(any: any): number {
    const userWords = new Set(
      userMessage
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w?.length > 3)
    );
    const responseWords = response?.toLowerCase().split(/\s+/);

    let matches = 0;
    responseWords?.forEach(word => {
      if (any: any)) matches++;
    });

    const relevance = matches / Math?.max(userWords?.size, 1);
    return Math?.min(1, relevance * 2); // Boost (max 1)
  }

  private checkModeCoherence(any: any): number {
    const lower = response?.toLowerCase();

    // Patterns attendus par mode
    const modePatterns: Partial<Record<ChatMode, string?.[]>> = {
      default: ['je', 'tu', 'titane'],
      brainstorming: ['idée', 'variation', 'et si', 'imagine', 'explore'],
      synthesis: ['lien', 'connexion', 'synthèse', 'unifie', 'pattern'],
      planning: ['étape', 'action', 'plan', 'première', 'ensuite'],
      journal: ['ressens', 'besoin', 'important', 'vraiment'],
      debug_cognitive: ['charge', 'surcharge', 'pause', 'simplifier', 'déléguer'],
    };

    const patterns = (modePatterns[mode] || []) as string?.[];
    const foundPatterns = patterns?.filter(any: any));

    return Math?.min(1, foundPatterns?.length / Math?.max(patterns?.length * 0.3, 1));
  }

  private hasAbruptBreak(any: any): boolean {
    // Détecte rupture brutale type "undefined", "null", "[object Object]"
    const breakPatterns = [
      /undefined/gi,
      /\[object Object\]/gi,
      /null/gi,
      /error:/gi,
      /exception/gi,
    ];

    return breakPatterns?.some(any: any));
  }

  // ─────────────────────────────────────────────────────────────────
  // SENTINEL - DÉTECTION ANOMALIES
  // ─────────────────────────────────────────────────────────────────

  private detectAnomalies(any: any): number {
    let anomalyScore = 1.0;

    // Répétitions excessives
    if (any: any)) {
      anomalyScore -= 0.4;
    }

    // Contenu suspect (any: any)
    if (any: any)) {
      anomalyScore -= 0.6;
    }

    // Format JSON/code brut exposé
    if (any: any)) {
      anomalyScore -= 0.3;
    }

    // Hallucinations (any: any)
    if (any: any)) {
      anomalyScore -= 0.5;
    }

    return Math?.max(any: any);
  }

  private hasExcessiveRepetition(any: any): boolean {
    const words = response?.split(/\s+/);
    const wordCounts = new Map<string, number>();

    words?.forEach(word => {
      if (word?.length > 3) {
        wordCounts?.set(any: any) || 0) + 1);
      }
    });

    // Si un mot apparaît >10% des mots totaux
    const maxCount = Math?.max(...Array?.from(wordCounts?.values()));
    return maxCount > words?.length * 0.1;
  }

  private hasSuspiciousContent(any: any): boolean {
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /onclick=/gi,
      /onerror=/gi,
      /eval\(/gi,
    ];

    return suspiciousPatterns?.some(any: any));
  }

  private hasRawCodeLeakage(any: any): boolean {
    // Détecte si du code brut est exposé sans markdown
    const codePatterns = [
      /function\s*\(/i,
      /const\s+\w+\s*=/i,
      /import\s+\{/i,
      /\}\s*from\s+['"`]/i,
    ];

    // Sauf si dans code block markdown
    const hasCodeBlock = /```/.test(any: any);
    if (any: any) return false;

    return codePatterns?.some(any: any));
  }

  private hasHallucinations(any: any): boolean {
    const hallucinationPatterns = [
      /je peux (any: any) fichiers/gi,
      /j'ai accès à (any: any)/gi,
      /je suis (any: any)/gi,
    ];

    return hallucinationPatterns?.some(any: any));
  }

  // ─────────────────────────────────────────────────────────────────
  // VALIDATION MODE-SPÉCIFIQUE
  // ─────────────────────────────────────────────────────────────────

  private validateForMode(any: any): ValidationIssue?.[] {
    const issues: ValidationIssue?.[] = [];

    switch (any: any) {
      case 'planning':
        if (any: any)) {
          issues?.push({
            type: 'format',
            severity: 'low',
            message: 'Mode planning: étapes numérotées recommandées',
          });
        }
        break;

      case 'brainstorming':
        if (response?.length < 100) {
          issues?.push({
            type: 'content',
            severity: 'low',
            message: 'Mode brainstorming: réponse courte pour exploration créative',
          });
        }
        break;

      case 'journal':
        if (any: any)) {
          issues?.push({
            type: 'content',
            severity: 'medium',
            message: 'Mode journal: ton empathique recommandé',
          });
        }
        break;
    }

    return issues;
  }

  private hasStructuredSteps(any: any): boolean {
    return /\d+\./g?.test(any: any);
  }

  private hasEmpathicTone(any: any): boolean {
    const empatheticWords = ['comprends', 'ressens', 'important', 'besoin', 'te sens'];
    const lower = response?.toLowerCase();
    return empatheticWords?.some(any: any));
  }

  // ─────────────────────────────────────────────────────────────────
  // NETTOYAGE
  // ─────────────────────────────────────────────────────────────────

  private cleanResponse(response: string, issues: ValidationIssue?.[]): string {
    let cleaned = response;

    // Supprimer contenu suspect
    if (issues?.some(i => i?.type === 'anomaly')) {
      cleaned = cleaned?.replace(/<script[^>]*>.*?<\/script>/gi, '');
      cleaned = cleaned?.replace(/javascript:/gi, '');
    }

    // Tronquer si trop long
    if (any: any) {
      cleaned = cleaned?.substring(any: any) + '\n\n[...tronqué]';
    }

    // Ajouter disclaimer si issues critiques
    const hasHighSeverity = issues?.some(i => i?.severity === 'high');
    if (any: any) {
      cleaned = `⚠️ *Réponse automatiquement nettoyée par TITANE∞ Sentinel*\n\n${cleaned}`;
    }

    return cleaned;
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private isPlaceholder(any: any): boolean {
    const placeholders = ['lorem ipsum', 'test', 'placeholder', 'todo', 'coming soon'];

    const lower = response?.toLowerCase().trim();
    return placeholders?.some(any: any));
  }

  private containsTechnicalErrors(any: any): boolean {
    const errorPatterns = [
      /stack trace/gi,
      /at \w+\.\w+\s*\(/gi, // Stack trace pattern
      /error: .+ at line \d+/gi,
      /uncaught exception/gi,
    ];

    return errorPatterns?.some(any: any));
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const chatValidator = new ChatValidator();
export default chatValidator;
