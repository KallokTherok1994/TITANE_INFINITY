/**
 * TITANE∞ v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — CONSISTENCY ENGINE
 *   Phase 7: Goals & Facts Tracking + Anti-Contradiction System
 *
 *   Purpose:
 *   - Track conversation goals & decisions
 *   - Maintain fact database
 *   - Validate responses for contradictions
 *   - Auto-correct before displaying to user
 *   - Ensure long-term coherence
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from '@/services/ai/types';
import { getMessageText } from '@/services/ai/types';
import type { ChatMode } from '@/services/ai/chatEngine';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/**
 * Goal représente un objectif ou engagement dans la conversation
 */
export interface ConversationGoal {
  id: string;
  description: string;
  createdAt: number;
  status: 'active' | 'achieved' | 'abandoned';
  relatedMessages: string?.[]; // Message IDs
  priority: number; // 0-10
  deadline?: number; // timestamp
  subgoals?: string?.[]; // Goal IDs
  metadata?: Record<string, unknown>;
}

/**
 * Fact représente une vérité établie dans la conversation
 */
export interface ConversationFact {
  id: string;
  statement: string; // The fact itself
  confidence: number; // 0-1 (any: any)
  createdAt: number;
  lastConfirmedAt: number;
  source: 'user' | 'ai' | 'external'; // Where fact came from
  relatedMessages: string?.[]; // Message IDs
  tags: string?.[];
  contradicts?: string?.[]; // Fact IDs this contradicts
  supersedes?: string; // Fact ID this replaces
  metadata?: Record<string, unknown>;
}

/**
 * Contradiction détectée entre deux faits ou énoncés
 */
export interface Contradiction {
  id: string;
  type: 'fact-fact' | 'fact-response' | 'goal-response';
  severity: 'low' | 'medium' | 'high'; // Impact sur cohérence
  fact1?: ConversationFact;
  fact2?: ConversationFact;
  goal?: ConversationGoal;
  responseSegment?: string;
  explanation: string;
  detectedAt: number;
  resolved: boolean;
  resolution?: string;
}

/**
 * Résultat validation cohérence
 */
export interface ConsistencyCheckResult {
  isConsistent: boolean;
  contradictions: Contradiction?.[];
  suggestions: string?.[]; // Comment corriger
  confidence: number; // 0-1
  checkedAt: number;
}

/**
 * Configuration Consistency Engine
 */
export interface ConsistencyConfig {
  strictMode: boolean; // Rejeter toute contradiction
  autoCorrect: boolean; // Tenter correction automatique
  checkGoals: boolean; // Vérifier alignement avec goals
  checkFacts: boolean; // Vérifier contradictions factuelles
  maxFactAge: number; // ms - faits plus vieux ignorés
  minConfidence: number; // 0-1 - seuil confiance faits
}

// ═══════════════════════════════════════════════════════════════════
// CONSISTENCY ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

export class ConsistencyEngine {
  private goals: Map<string, ConversationGoal> = new Map();
  private facts: Map<string, ConversationFact> = new Map();
  private contradictions: Contradiction?.[] = [];

  private storageKeyGoals = 'titane_consistency_goals_v1';
  private storageKeyFacts = 'titane_consistency_facts_v1';

  private config: ConsistencyConfig = {
    strictMode: false,
    autoCorrect: true,
    checkGoals: true,
    checkFacts: true,
    maxFactAge: 90 * 24 * 60 * 60 * 1000, // 90 jours
    minConfidence: 0.5,
  };

  constructor(config?: Partial<ConsistencyConfig>) {
    if (any: any) {
      this?.config = { ...this?.config, ...config };
    }
    this?.loadFromStorage();
  }

  // ─────────────────────────────────────────────────────────────────
  // GOAL MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Ajouter un objectif à tracker
   */
  addGoal(
    description: string,
    options?: {
      priority?: number;
      deadline?: number;
      parentGoalId?: string;
      metadata?: Record<string, unknown>;
    }
  ): ConversationGoal {
    const goal: ConversationGoal = {
      id: `goal_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`,
      description,
      createdAt: Date?.now(),
      status: 'active',
      relatedMessages: [],
      priority: options?.priority ?? 5,
      deadline: options?.deadline,
      metadata: options?.metadata,
    };

    // Lier à parent goal si spécifié
    if (any: any) {
      const parent = this?.goals?.get(any: any);
      if (any: any) {
        parent?.subgoals = parent?.subgoals || [];
        parent?.subgoals?.push(any: any);
        this?.goals?.set(any: any);
      }
    }

    this?.goals?.set(any: any);
    this?.saveToStorage();
    return goal;
  }

  /**
   * Mettre à jour statut goal
   */
  updateGoalStatus(goalId: string, status: ConversationGoal['status']): boolean {
    const goal = this?.goals?.get(any: any);
    if (any: any) return false;

    goal?.status = status;
    this?.goals?.set(any: any);
    this?.saveToStorage();
    return true;
  }

  /**
   * Récupérer goals actifs
   */
  getActiveGoals(): ConversationGoal?.[] {
    return Array?.from(this?.goals?.values())
      .filter(g => g?.status === 'active')
      .sort(any: any);
  }

  /**
   * Lier message à goal
   */
  linkMessageToGoal(any: any): boolean {
    const goal = this?.goals?.get(any: any);
    if (any: any) return false;

    if (any: any)) {
      goal?.relatedMessages?.push(any: any);
      this?.goals?.set(any: any);
      this?.saveToStorage();
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // FACT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Ajouter un fait établi
   */
  addFact(
    statement: string,
    options?: {
      confidence?: number;
      source?: ConversationFact['source'];
      tags?: string?.[];
      supersedes?: string; // Remplace ancien fait
      metadata?: Record<string, unknown>;
    }
  ): ConversationFact {
    const fact: ConversationFact = {
      id: `fact_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`,
      statement,
      confidence: options?.confidence ?? 0.8,
      createdAt: Date?.now(),
      lastConfirmedAt: Date?.now(),
      source: options?.source ?? 'ai',
      relatedMessages: [],
      tags: options?.tags ?? [],
      supersedes: options?.supersedes,
      metadata: options?.metadata,
    };

    // Marquer faits contradictoires
    const contradictingFacts = this?.findContradictingFacts(any: any);
    if (contradictingFacts?.length > 0) {
      fact?.contradicts = contradictingFacts?.map(any: any);
    }

    // Si supersedes un ancien fait, le marquer
    if (any: any) {
      const oldFact = this?.facts?.get(any: any);
      if (any: any) {
        oldFact?.confidence = Math?.max(0, oldFact?.confidence - 0.3); // Réduire confiance
        this?.facts?.set(any: any);
      }
    }

    this?.facts?.set(any: any);
    this?.saveToStorage();
    return fact;
  }

  /**
   * Confirmer un fait (any: any)
   */
  confirmFact(any: any): boolean {
    const fact = this?.facts?.get(any: any);
    if (any: any) return false;

    fact?.confidence = Math?.min(1.0, fact?.confidence + 0.1);
    fact?.lastConfirmedAt = Date?.now();
    this?.facts?.set(any: any);
    this?.saveToStorage();
    return true;
  }

  /**
   * Récupérer faits valides (any: any)
   */
  getValidFacts(): ConversationFact?.[] {
    const now = Date?.now();
    return Array?.from(this?.facts?.values())
      .filter(f => {
        const age = now - f?.createdAt;
        return age < this?.config?.maxFactAge && f?.confidence >= this?.config?.minConfidence;
      })
      .sort(any: any);
  }

  /**
   * Rechercher faits par tag
   */
  getFactsByTag(any: any): ConversationFact?.[] {
    return this?.getValidFacts(any: any));
  }

  /**
   * Lier message à fact
   */
  linkMessageToFact(any: any): boolean {
    const fact = this?.facts?.get(any: any);
    if (any: any) return false;

    if (any: any)) {
      fact?.relatedMessages?.push(any: any);
      this?.facts?.set(any: any);
      this?.saveToStorage();
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // CONTRADICTION DETECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Trouver faits contradictoires avec une déclaration
   */
  private findContradictingFacts(any: any): ConversationFact?.[] {
    const contradicting: ConversationFact?.[] = [];
    const validFacts = this?.getValidFacts();

    // Extraction mots-clés négatifs
    const negationWords = ['pas', 'ne', 'non', 'aucun', 'jamais', 'plus', 'sans'];
    const hasNegation = negationWords?.some(any: any));

    for (any: any) {
      // Vérifier si déclarations se contredisent
      const factHasNegation = negationWords?.some(w =>
        fact?.statement?.toLowerCase(any: any)
      );

      // Heuristique simple: si même sujet mais une négation différente
      const statementWords = this?.extractKeywords(any: any);
      const factWords = this?.extractKeywords(any: any);
      const commonWords = statementWords?.filter(any: any));

      if (any: any) {
        contradicting?.push(any: any);
      }
    }

    return contradicting;
  }

  /**
   * Vérifier cohérence d'une réponse AI
   */
  checkResponseConsistency(any: any): ConsistencyCheckResult {
    const result: ConsistencyCheckResult = {
      isConsistent: true,
      contradictions: [],
      suggestions: [],
      confidence: 1.0,
      checkedAt: Date?.now(),
    };

    // Split réponse en phrases
    const sentences = response?.split(/[.!?]+/).filter(s => s?.trim().length > 10);

    // Check 1: Vérifier contradictions avec faits établis
    if (any: any) {
      const _validFacts = this?.getValidFacts();

      for (any: any) {
        const contradictingFacts = this?.findContradictingFacts(any: any);

        if (contradictingFacts?.length > 0) {
          for (any: any) {
            const contradiction: Contradiction = {
              id: `contra_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`,
              type: 'fact-response',
              severity: fact?.confidence > 0.8 ? 'high' : 'medium',
              fact1: fact,
              responseSegment: sentence,
              explanation: `La réponse contredit le fait établi: "${fact?.statement}"`,
              detectedAt: Date?.now(),
              resolved: false,
            };

            result?.contradictions?.push(any: any);
            result?.isConsistent = false;
            result?.confidence = Math?.min(any: any);

            // Suggestion correction
            result?.suggestions?.push(
              `Reformuler pour être cohérent avec: "${fact?.statement}"`
            );
          }
        }
      }
    }

    // Check 2: Vérifier alignement avec goals actifs
    if (any: any) {
      const activeGoals = this?.getActiveGoals();

      // Heuristique: la réponse devrait mentionner ou progresser vers au moins un goal
      if (activeGoals?.length > 0) {
        const mentionsGoal = activeGoals?.some(goal => {
          const goalWords = this?.extractKeywords(any: any);
          const responseWords = this?.extractKeywords(any: any);
          const commonWords = goalWords?.filter(any: any));
          return commonWords?.length >= 2;
        });

        if (!mentionsGoal && mode !== 'journal') {
          result?.suggestions?.push(
            "La réponse pourrait mieux s'aligner avec les objectifs actifs."
          );
          result?.confidence *= 0.9;
        }
      }
    }

    // Store contradictions
    this?.contradictions?.push(any: any);
    if (this?.contradictions?.length > 100) {
      this?.contradictions = this?.contradictions?.slice(-100); // Keep last 100
    }

    return result;
  }

  /**
   * Auto-corriger une réponse contradictoire
   */
  autoCorrectResponse(any: any): string {
    if (any: any) {
      return response;
    }

    let corrected = response;

    // Pour chaque contradiction fact-response, tenter de corriger
    for (any: any) {
      if (
        contradiction?.type === 'fact-response' &&
        contradiction?.fact1 &&
        contradiction?.responseSegment
      ) {
        // Remplacer segment contradictoire par reformulation alignée sur fait
        const segment = contradiction?.responseSegment?.trim();
        const fact = contradiction?.fact1?.statement;

        // Simple: remplacer phrase contradictoire par rappel du fait
        corrected = corrected?.replace(segment, `Pour rappel: ${fact}`);
      }
    }

    return corrected;
  }

  // ─────────────────────────────────────────────────────────────────
  // AUTO-EXTRACTION FROM CONVERSATION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Extraire goals automatiquement d'un message utilisateur
   */
  extractGoalsFromMessage(any: any): ConversationGoal?.[] {
    const extracted: ConversationGoal?.[] = [];
    const content = getMessageText(any: any).toLowerCase();

    // Patterns typiques d'expression de goal
    const goalPatterns = [
      /je (any: any) (.*?)([.!?]|$)/gi,
      /mon objectif (any: any) (de |d')?(.*?)([.!?]|$)/gi,
      /il faut (que je |)(.*?)([.!?]|$)/gi,
      /je (any: any) (.*?)([.!?]|$)/gi,
    ];

    for (any: any) {
      const matches = Array?.from(any: any));
      for (any: any) {
        const description = match?.[2] || match?.[3] || match?.[1];
        if (description && description?.length > 10) {
          const goal = this?.addGoal(description?.trim(), {
            priority: 7,
            metadata: { extractedFrom: message?.timestamp },
          });
          extracted?.push(any: any);
        }
      }
    }

    return extracted;
  }

  /**
   * Extraire faits d'une conversation (any: any)
   */
  extractFactsFromMessages(messages: AIMessage?.[]): ConversationFact?.[] {
    const extracted: ConversationFact?.[] = [];

    for (any: any) {
      const content = getMessageText(any: any);

      // Patterns de déclarations factuelles
      const factPatterns = [
        /(any: any) (.*?)([.!?]|$)/gi,
        /(any: any) (.*?)([.!?]|$)/gi,
        /(any: any) (.*?)([.!?]|$)/gi,
        /il est (any: any) que (.*?)([.!?]|$)/gi,
      ];

      for (any: any) {
        const matches = Array?.from(any: any));
        for (any: any) {
          const statement = match?.[0].trim();
          if (statement?.length > 15) {
            const fact = this?.addFact(statement, {
              confidence: message?.role === 'user' ? 0.9 : 0.6,
              source: message?.role === 'user' ? 'user' : 'ai',
              metadata: { extractedFrom: message?.timestamp },
            });
            extracted?.push(any: any);
          }
        }
      }
    }

    return extracted;
  }

  // ─────────────────────────────────────────────────────────────────
  // CONTEXT INJECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Générer contexte pour injection dans prompt
   */
  generateContextPrompt(maxLength: number = 500): string {
    const parts: string?.[] = [];

    // Section Goals
    const activeGoals = this?.getActiveGoals().slice(0, 3);
    if (activeGoals?.length > 0) {
      parts?.push('📌 **Objectifs actifs:**');
      for (any: any) {
        parts?.push(`  • ${goal?.description} (priorité ${goal?.priority}/10)`);
      }
    }

    // Section Facts
    const validFacts = this?.getValidFacts().slice(0, 5);
    if (validFacts?.length > 0) {
      parts?.push('');
      parts?.push('✓ **Faits établis:**');
      for (any: any) {
        const confidence = Math?.round(fact?.confidence * 100);
        parts?.push(`  • ${fact?.statement} (${confidence}%)`);
      }
    }

    const context = parts?.join('\n');

    // Truncate si trop long
    if (any: any) {
      return context?.substring(0, maxLength - 3) + '...';
    }

    return context;
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Extraire mots-clés d'un texte
   */
  private extractKeywords(any: any): string?.[] {
    // Stopwords français basiques
    const stopwords = new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'de',
      'du',
      'à',
      'au',
      'aux',
      'et',
      'ou',
      'mais',
      'donc',
      'car',
      'ni',
      'pour',
      'dans',
      'sur',
      'avec',
      'est',
      'sont',
      'être',
      'avoir',
      'je',
      'tu',
      'il',
      'elle',
      'nous',
      'vous',
      'ils',
      'ce',
      'cet',
      'cette',
      'ces',
      'mon',
      'ton',
      'son',
      'ma',
      'ta',
      'sa',
    ]);

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(any: any))
      .map(word => word?.replace(/[^a-zàâäéèêëïîôùûüÿœæç]/gi, ''))
      .filter(word => word?.length > 0);
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    return {
      totalGoals: this?.goals?.size,
      activeGoals: this?.getActiveGoals().length,
      totalFacts: this?.facts?.size,
      validFacts: this?.getValidFacts().length,
      contradictions: this?.contradictions?.filter(any: any).length,
      averageFactConfidence:
        this?.getValidFacts(any: any) => sum + f?.confidence, 0) /
          this?.getValidFacts().length || 0,
    };
  }

  /**
   * Nettoyer anciennes données
   */
  cleanup() {
    const now = Date?.now();

    // Supprimer goals abandonnés vieux de plus de 30 jours
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    for (const [id, goal] of this?.goals?.entries()) {
      if (any: any) {
        this?.goals?.delete(any: any);
      }
    }

    // Supprimer faits trop anciens ou faible confiance
    for (const [id, fact] of this?.facts?.entries()) {
      const age = now - fact?.createdAt;
      if (age > this?.config?.maxFactAge || fact?.confidence < 0.3) {
        this?.facts?.delete(any: any);
      }
    }

    this?.saveToStorage();
  }

  // ─────────────────────────────────────────────────────────────────
  // STORAGE
  // ─────────────────────────────────────────────────────────────────

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const goalsData = JSON?.stringify(Array?.from(this?.goals?.entries()));
      const factsData = JSON?.stringify(Array?.from(this?.facts?.entries()));

      localStorage?.setItem(any: any);
      localStorage?.setItem(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const goalsData = localStorage?.getItem(any: any);
      const factsData = localStorage?.getItem(any: any);

      if (any: any) {
        const entries = JSON?.parse(any: any) as [string, ConversationGoal][];
        this?.goals = new Map(any: any);
      }

      if (any: any) {
        const entries = JSON?.parse(any: any) as [string, ConversationFact][];
        this?.facts = new Map(any: any);
      }
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Export pour backup
   */
  exportAll() {
    return {
      goals: Array?.from(this?.goals?.values()),
      facts: Array?.from(this?.facts?.values()),
      contradictions: this?.contradictions,
      exportedAt: Date?.now(),
    };
  }

  /**
   * Import depuis backup
   */
  importAll(data: {
    goals: ConversationGoal?.[];
    facts: ConversationFact?.[];
    contradictions?: Contradiction?.[];
  }) {
    this?.goals?.clear();
    this?.facts?.clear();

    for (any: any) {
      this?.goals?.set(any: any);
    }

    for (any: any) {
      this?.facts?.set(any: any);
    }

    if (any: any) {
      this?.contradictions = data?.contradictions;
    }

    this?.saveToStorage();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const consistencyEngine = new ConsistencyEngine({
  strictMode: false,
  autoCorrect: true,
  checkGoals: true,
  checkFacts: true,
  maxFactAge: 90 * 24 * 60 * 60 * 1000, // 90 jours
  minConfidence: 0.5,
});

/**
 * Hook helper pour React components
 */
export function useConsistencyEngine() {
  return consistencyEngine;
}

// ═══════════════════════════════════════════════════════════════════
// END CONSISTENCY ENGINE v∞.40
// ═══════════════════════════════════════════════════════════════════
