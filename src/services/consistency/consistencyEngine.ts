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
  relatedMessages: string[]; // Message IDs
  priority: number; // 0-10
  deadline?: number; // timestamp
  subgoals?: string[]; // Goal IDs
  metadata?: Record<string, unknown>;
}

// Alias pour compatibilité tests
export type Goal = ConversationGoal;

/**
 * Fact représente une vérité établie dans la conversation
 */
export interface ConversationFact {
  id: string;
  statement: string; // The fact itself
  confidence: number; // 0-1 (how certain we are)
  createdAt: number;
  lastConfirmedAt: number;
  source: 'user' | 'ai' | 'external'; // Where fact came from
  relatedMessages: string[]; // Message IDs
  tags: string[];
  contradicts?: string[]; // Fact IDs this contradicts
  supersedes?: string; // Fact ID this replaces
  metadata?: Record<string, unknown>;
}

// Alias pour compatibilité tests
export type Fact = ConversationFact;

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
  contradictions: Contradiction[];
  suggestions: string[]; // Comment corriger
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
  private contradictions: Contradiction[] = [];

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
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
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
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description,
      createdAt: Date.now(),
      status: 'active',
      relatedMessages: [],
      priority: options?.priority ?? 5,
      deadline: options?.deadline,
      metadata: options?.metadata,
    };

    // Lier à parent goal si spécifié
    if (options?.parentGoalId) {
      const parent = this.goals.get(options.parentGoalId);
      if (parent) {
        parent.subgoals = parent.subgoals || [];
        parent.subgoals.push(goal.id);
        this.goals.set(parent.id, parent);
      }
    }

    this.goals.set(goal.id, goal);
    this.saveToStorage();
    return goal;
  }

  /**
   * Mettre à jour statut goal
   */
  updateGoalStatus(goalId: string, status: ConversationGoal['status']): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    goal.status = status;
    this.goals.set(goalId, goal);
    this.saveToStorage();
    return true;
  }

  /**
   * Récupérer goals actifs
   */
  getActiveGoals(): ConversationGoal[] {
    return Array.from(this.goals.values())
      .filter(g => g.status === 'active')
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Lier message à goal
   */
  linkMessageToGoal(goalId: string, messageId: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    if (!goal.relatedMessages.includes(messageId)) {
      goal.relatedMessages.push(messageId);
      this.goals.set(goalId, goal);
      this.saveToStorage();
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
      tags?: string[];
      supersedes?: string; // Remplace ancien fait
      metadata?: Record<string, unknown>;
    }
  ): ConversationFact {
    const fact: ConversationFact = {
      id: `fact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      statement,
      confidence: options?.confidence ?? 0.8,
      createdAt: Date.now(),
      lastConfirmedAt: Date.now(),
      source: options?.source ?? 'ai',
      relatedMessages: [],
      tags: options?.tags ?? [],
      supersedes: options?.supersedes,
      metadata: options?.metadata,
    };

    // Marquer faits contradictoires
    const contradictingFacts = this.findContradictingFacts(statement);
    if (contradictingFacts.length > 0) {
      fact.contradicts = contradictingFacts.map(f => f.id);
    }

    // Si supersedes un ancien fait, le marquer
    if (options?.supersedes) {
      const oldFact = this.facts.get(options.supersedes);
      if (oldFact) {
        oldFact.confidence = Math.max(0, oldFact.confidence - 0.3); // Réduire confiance
        this.facts.set(oldFact.id, oldFact);
      }
    }

    this.facts.set(fact.id, fact);
    this.saveToStorage();
    return fact;
  }

  /**
   * Confirmer un fait (augmente confiance)
   */
  confirmFact(factId: string): boolean {
    const fact = this.facts.get(factId);
    if (!fact) return false;

    fact.confidence = Math.min(1.0, fact.confidence + 0.1);
    fact.lastConfirmedAt = Date.now();
    this.facts.set(factId, fact);
    this.saveToStorage();
    return true;
  }

  /**
   * Récupérer faits valides (récents + confiance suffisante)
   */
  getValidFacts(): ConversationFact[] {
    const now = Date.now();
    return Array.from(this.facts.values())
      .filter(f => {
        const age = now - f.createdAt;
        return age < this.config.maxFactAge && f.confidence >= this.config.minConfidence;
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rechercher faits par tag
   */
  getFactsByTag(tag: string): ConversationFact[] {
    return this.getValidFacts().filter(f => f.tags.includes(tag));
  }

  /**
   * Lier message à fact
   */
  linkMessageToFact(factId: string, messageId: string): boolean {
    const fact = this.facts.get(factId);
    if (!fact) return false;

    if (!fact.relatedMessages.includes(messageId)) {
      fact.relatedMessages.push(messageId);
      this.facts.set(factId, fact);
      this.saveToStorage();
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // CONTRADICTION DETECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Trouver faits contradictoires avec une déclaration
   */
  private findContradictingFacts(statement: string): ConversationFact[] {
    const contradicting: ConversationFact[] = [];
    const validFacts = this.getValidFacts();

    // Extraction mots-clés négatifs
    const negationWords = ['pas', 'ne', 'non', 'aucun', 'jamais', 'plus', 'sans'];
    const hasNegation = negationWords.some(w => statement.toLowerCase().includes(w));

    for (const fact of validFacts) {
      // Vérifier si déclarations se contredisent
      const factHasNegation = negationWords.some(w =>
        fact.statement.toLowerCase().includes(w)
      );

      // Heuristique simple: si même sujet mais une négation différente
      const statementWords = this.extractKeywords(statement);
      const factWords = this.extractKeywords(fact.statement);
      const commonWords = statementWords.filter(w => factWords.includes(w));

      if (commonWords.length >= 2 && hasNegation !== factHasNegation) {
        contradicting.push(fact);
      }
    }

    return contradicting;
  }

  /**
   * Vérifier cohérence d'une réponse AI
   */
  checkResponseConsistency(response: string, mode?: ChatMode): ConsistencyCheckResult {
    const result: ConsistencyCheckResult = {
      isConsistent: true,
      contradictions: [],
      suggestions: [],
      confidence: 1.0,
      checkedAt: Date.now(),
    };

    // Split réponse en phrases
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);

    // Check 1: Vérifier contradictions avec faits établis
    if (this.config.checkFacts) {
      const _validFacts = this.getValidFacts();

      for (const sentence of sentences) {
        const contradictingFacts = this.findContradictingFacts(sentence);

        if (contradictingFacts.length > 0) {
          for (const fact of contradictingFacts) {
            const contradiction: Contradiction = {
              id: `contra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'fact-response',
              severity: fact.confidence > 0.8 ? 'high' : 'medium',
              fact1: fact,
              responseSegment: sentence,
              explanation: `La réponse contredit le fait établi: "${fact.statement}"`,
              detectedAt: Date.now(),
              resolved: false,
            };

            result.contradictions.push(contradiction);
            result.isConsistent = false;
            result.confidence = Math.min(result.confidence, 1.0 - fact.confidence);

            // Suggestion correction
            result.suggestions.push(
              `Reformuler pour être cohérent avec: "${fact.statement}"`
            );
          }
        }
      }
    }

    // Check 2: Vérifier alignement avec goals actifs
    if (this.config.checkGoals) {
      const activeGoals = this.getActiveGoals();

      // Heuristique: la réponse devrait mentionner ou progresser vers au moins un goal
      if (activeGoals.length > 0) {
        const mentionsGoal = activeGoals.some(goal => {
          const goalWords = this.extractKeywords(goal.description);
          const responseWords = this.extractKeywords(response);
          const commonWords = goalWords.filter(w => responseWords.includes(w));
          return commonWords.length >= 2;
        });

        if (!mentionsGoal && mode !== 'journal') {
          result.suggestions.push(
            "La réponse pourrait mieux s'aligner avec les objectifs actifs."
          );
          result.confidence *= 0.9;
        }
      }
    }

    // Store contradictions
    this.contradictions.push(...result.contradictions);
    if (this.contradictions.length > 100) {
      this.contradictions = this.contradictions.slice(-100); // Keep last 100
    }

    return result;
  }

  /**
   * Auto-corriger une réponse contradictoire
   */
  autoCorrectResponse(response: string, checkResult: ConsistencyCheckResult): string {
    if (!this.config.autoCorrect || checkResult.isConsistent) {
      return response;
    }

    let corrected = response;

    // Pour chaque contradiction fact-response, tenter de corriger
    for (const contradiction of checkResult.contradictions) {
      if (
        contradiction.type === 'fact-response' &&
        contradiction.fact1 &&
        contradiction.responseSegment
      ) {
        // Remplacer segment contradictoire par reformulation alignée sur fait
        const segment = contradiction.responseSegment.trim();
        const fact = contradiction.fact1.statement;

        // Simple: remplacer phrase contradictoire par rappel du fait
        corrected = corrected.replace(segment, `Pour rappel: ${fact}`);
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
  extractGoalsFromMessage(message: AIMessage): ConversationGoal[] {
    const extracted: ConversationGoal[] = [];
    const content = message.content.toLowerCase();

    // Patterns typiques d'expression de goal
    const goalPatterns = [
      /je (veux|voudrais|souhaite|dois|aimerais) (.*?)([.!?]|$)/gi,
      /mon objectif (est|serait) (de |d')?(.*?)([.!?]|$)/gi,
      /il faut (que je |)(.*?)([.!?]|$)/gi,
      /je (cherche à|compte) (.*?)([.!?]|$)/gi,
    ];

    for (const pattern of goalPatterns) {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        const description = match[2] || match[3] || match[1];
        if (description && description.length > 10) {
          const goal = this.addGoal(description.trim(), {
            priority: 7,
            metadata: { extractedFrom: message.timestamp },
          });
          extracted.push(goal);
        }
      }
    }

    return extracted;
  }

  /**
   * Extraire faits d'une conversation (user + AI)
   */
  extractFactsFromMessages(messages: AIMessage[]): ConversationFact[] {
    const extracted: ConversationFact[] = [];

    for (const message of messages) {
      const content = message.content;

      // Patterns de déclarations factuelles
      const factPatterns = [
        /(?:je suis|je m'appelle|mon nom est) (.*?)([.!?]|$)/gi,
        /(?:j'habite|je vis) (?:à|en|au) (.*?)([.!?]|$)/gi,
        /(?:je travaille|je suis employé|mon métier est) (.*?)([.!?]|$)/gi,
        /il est (?:important|clair|évident) que (.*?)([.!?]|$)/gi,
      ];

      for (const pattern of factPatterns) {
        const matches = Array.from(content.matchAll(pattern));
        for (const match of matches) {
          const statement = match[0].trim();
          if (statement.length > 15) {
            const fact = this.addFact(statement, {
              confidence: message.role === 'user' ? 0.9 : 0.6,
              source: message.role === 'user' ? 'user' : 'ai',
              metadata: { extractedFrom: message.timestamp },
            });
            extracted.push(fact);
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
    const parts: string[] = [];

    // Section Goals
    const activeGoals = this.getActiveGoals().slice(0, 3);
    if (activeGoals.length > 0) {
      parts.push('📌 **Objectifs actifs:**');
      for (const goal of activeGoals) {
        parts.push(`  • ${goal.description} (priorité ${goal.priority}/10)`);
      }
    }

    // Section Facts
    const validFacts = this.getValidFacts().slice(0, 5);
    if (validFacts.length > 0) {
      parts.push('');
      parts.push('✓ **Faits établis:**');
      for (const fact of validFacts) {
        const confidence = Math.round(fact.confidence * 100);
        parts.push(`  • ${fact.statement} (${confidence}%)`);
      }
    }

    const context = parts.join('\n');

    // Truncate si trop long
    if (context.length > maxLength) {
      return context.substring(0, maxLength - 3) + '...';
    }

    return context;
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Extraire mots-clés d'un texte
   */
  private extractKeywords(text: string): string[] {
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
      .filter(word => word.length > 3 && !stopwords.has(word))
      .map(word => word.replace(/[^a-zàâäéèêëïîôùûüÿœæç]/gi, ''))
      .filter(word => word.length > 0);
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    return {
      totalGoals: this.goals.size,
      activeGoals: this.getActiveGoals().length,
      totalFacts: this.facts.size,
      validFacts: this.getValidFacts().length,
      contradictions: this.contradictions.filter(c => !c.resolved).length,
      averageFactConfidence:
        this.getValidFacts().reduce((sum, f) => sum + f.confidence, 0) /
          this.getValidFacts().length || 0,
    };
  }

  /**
   * Nettoyer anciennes données
   */
  cleanup() {
    const now = Date.now();

    // Supprimer goals abandonnés vieux de plus de 30 jours
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    for (const [id, goal] of this.goals.entries()) {
      if (goal.status === 'abandoned' && goal.createdAt < thirtyDaysAgo) {
        this.goals.delete(id);
      }
    }

    // Supprimer faits trop anciens ou faible confiance
    for (const [id, fact] of this.facts.entries()) {
      const age = now - fact.createdAt;
      if (age > this.config.maxFactAge || fact.confidence < 0.3) {
        this.facts.delete(id);
      }
    }

    this.saveToStorage();
  }

  // ─────────────────────────────────────────────────────────────────
  // STORAGE
  // ─────────────────────────────────────────────────────────────────

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const goalsData = JSON.stringify(Array.from(this.goals.entries()));
      const factsData = JSON.stringify(Array.from(this.facts.entries()));

      localStorage.setItem(this.storageKeyGoals, goalsData);
      localStorage.setItem(this.storageKeyFacts, factsData);
    } catch (error) {
      console.error('[ConsistencyEngine] Save failed:', error);
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const goalsData = localStorage.getItem(this.storageKeyGoals);
      const factsData = localStorage.getItem(this.storageKeyFacts);

      if (goalsData) {
        const entries = JSON.parse(goalsData) as [string, ConversationGoal][];
        this.goals = new Map(entries);
      }

      if (factsData) {
        const entries = JSON.parse(factsData) as [string, ConversationFact][];
        this.facts = new Map(entries);
      }
    } catch (error) {
      console.error('[ConsistencyEngine] Load failed:', error);
    }
  }

  /**
   * Export pour backup
   */
  exportAll() {
    return {
      goals: Array.from(this.goals.values()),
      facts: Array.from(this.facts.values()),
      contradictions: this.contradictions,
      exportedAt: Date.now(),
    };
  }

  /**
   * Import depuis backup
   */
  importAll(data: {
    goals: ConversationGoal[];
    facts: ConversationFact[];
    contradictions?: Contradiction[];
  }) {
    this.goals.clear();
    this.facts.clear();

    for (const goal of data.goals) {
      this.goals.set(goal.id, goal);
    }

    for (const fact of data.facts) {
      this.facts.set(fact.id, fact);
    }

    if (data.contradictions) {
      this.contradictions = data.contradictions;
    }

    this.saveToStorage();
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
