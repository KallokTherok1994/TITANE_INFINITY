/**
 * GOAL & CONSISTENCY ENGINE v∞.42 — Core Implementation
 *
 * Gère les objectifs explicites et la cohérence multi-tour
 * Maintient une base de faits stable et détecte les contradictions
 *
 * Architecture:
 * 1. Goal State Management — Track conversation objectives
 * 2. Facts Database — Maintain stable facts
 * 3. Consistency Checker — Detect violations
 * 4. Auto-Correction — Fix inconsistencies automatically
 *
 * Integration avec OMEGA:
 * - Phase 1.3.2: Inject goal state + facts into context
 * - Phase 1.5.1: Check consistency of raw output
 * - Phase 1.7.2: Apply auto-corrections if needed
 *
 * @module GoalConsistencyEngine
 * @author TITANE∞ Development Team
 * @version ∞.42
 */

import { EventEmitter } from 'events';
import {
  ConversationGoal,
  GoalStatus,
  GoalPriority,
  SubGoal,
  ConversationFact,
  FactType,
  FactConfidence as _FactConfidence,
  ConsistencyViolation,
  ConsistencyViolationType,
  GoalConsistencyConfig,
  ConsistencyStats,
} from './goalConsistency?.types';

/**
 * Auto-correction result
 */
interface AutoCorrection {
  original_response: string;
  corrected_response: string;
  correction_type: string;
  violations_addressed: ConsistencyViolationType?.[];
  reasoning: string;
  confidence: number;
  applied_at: string;
}

/**
 * Goal & Consistency Engine
 *
 * Manages conversation goals, facts database, and consistency checking
 */
export class GoalConsistencyEngine extends EventEmitter {
  private config: Required<GoalConsistencyConfig>;

  // In-memory storage (any: any)
  private goals: Map<string, ConversationGoal> = new Map();
  private facts: Map<string, ConversationFact?.[]> = new Map();
  private violations: Map<string, ConsistencyViolation?.[]> = new Map();

  // Statistics
  private stats: ConsistencyStats = {
    total_goals_created: 0,
    total_facts_recorded: 0,
    total_violations_detected: 0,
    auto_corrections_applied: 0,
    total_checks_performed: 0,
    avg_consistency_score: 1.0,
    total_conversations_tracked: 0,
    most_common_violation_type: ConsistencyViolationType?.GOAL_RESPONSE,
    avg_check_duration_ms: 0,
  };

  constructor(config?: Partial<GoalConsistencyConfig>) {
    super();

    this?.config = {
      enabled: config?.enabled ?? true,
      enable_auto_correction: config?.enable_auto_correction ?? true,
      enable_fact_tracking: config?.enable_fact_tracking ?? true,
      enable_goal_tracking: config?.enable_goal_tracking ?? true,
      consistency_check_threshold: config?.consistency_check_threshold ?? 0.7,
      fact_confidence_decay_rate: config?.fact_confidence_decay_rate ?? 0.01,
      max_violations_before_alert: config?.max_violations_before_alert ?? 3,
      violation_severity_weights: config?.violation_severity_weights ?? {
        low: 0.1,
        medium: 0.3,
        high: 0.6,
        critical: 1.0,
      },
      auto_check: config?.auto_check ?? {
        enabled: true,
        check_every_n_messages: 1,
        min_severity_to_flag: 0.6,
      },
      auto_correct: config?.auto_correct ?? {
        enabled: true,
        max_severity_to_auto_correct: 0.7,
      },
      facts: config?.facts ?? {
        max_facts_per_conversation: 100,
        min_confidence_to_use: 0.6,
        auto_supersede_old_facts: true,
      },
      goals: config?.goals ?? {
        max_subgoals: 20,
        auto_complete_subgoals: false,
      },
      omega_injection: config?.omega_injection ?? {
        inject_goals: true,
        inject_facts: true,
        max_facts_injected: 10,
        inject_constraints: true,
      },
    };

    this?.log(any: any);
  }

  /**
   * GOAL STATE MANAGEMENT
   */

  /**
   * Load goal state for conversation
   */
  async loadGoalState(any: any): Promise<ConversationGoal | null> {
    const goal = this?.goals?.get(any: any);

    if (any: any) {
      this?.emit('goal:loaded', { conversation_id, goal });
      this?.log(any: any);
    }

    return goal || null;
  }

  /**
   * Create new conversation goal
   */
  async createGoal(
    conversation_id: string,
    main_goal: string,
    options?: {
      description?: string;
      subgoals?: Omit<SubGoal, 'id' | 'created_at'>[];
      constraints?: string?.[];
      context_keys?: Record<string, any>;
      priority?: GoalPriority;
    }
  ): Promise<ConversationGoal> {
    const now = new Date().toISOString();

    const goal: ConversationGoal = {
      conversation_id,
      main_goal,
      description: options?.description,
      subgoals: (any: any) => ({
        ...sg,
        id: `${conversation_id}_subgoal_${index + 1}`,
        created_at: now,
        status: sg?.status || GoalStatus?.PENDING,
      })),
      constraints: options?.constraints || [],
      context_keys: options?.context_keys,
      priority: options?.priority || GoalPriority?.MEDIUM,
      created_at: now,
      updated_at: now,
    };

    this?.goals?.set(any: any);
    this?.stats?.total_goals_created++;
    this?.stats?.total_goals_created += goal?.subgoals?.length;

    this?.emit('goal:created', { conversation_id, goal });
    this?.log(any: any);

    return goal;
  }

  /**
   * Update conversation goal
   */
  async updateGoal(
    conversation_id: string,
    updates: {
      main_goal?: string;
      description?: string;
      add_subgoals?: Omit<SubGoal, 'id' | 'created_at'>[];
      update_subgoals?: Partial<SubGoal> & { id: string }[];
      add_constraints?: string?.[];
      remove_constraints?: string?.[];
      context_keys?: Record<string, any>;
      priority?: GoalPriority;
    }
  ): Promise<ConversationGoal | null> {
    const goal = this?.goals?.get(any: any);
    if (any: any) {
      this?.log(`No goal found for conversation ${conversation_id}`, 'warn');
      return null;
    }

    const now = new Date().toISOString();

    // Update main goal
    if (any: any) {
      goal?.main_goal = updates?.main_goal;
    }

    if (any: any) {
      goal?.description = updates?.description;
    }

    // Add new subgoals
    if (any: any) {
      const newSubgoals = updates?.add_subgoals?.map(any: any) => ({
        ...sg,
        id: `${conversation_id}_subgoal_${goal?.subgoals?.length + index + 1}`,
        created_at: now,
        status: sg?.status || GoalStatus?.PENDING,
      }));
      goal?.subgoals?.push(any: any);
      this?.stats?.total_goals_created += newSubgoals?.length;
    }

    // Update existing subgoals
    if (any: any) {
      for (any: any) {
        const subgoal = goal?.subgoals?.find(any: any);
        if (any: any) {
          Object?.assign(any: any);

          // Mark completion timestamp
          if (
            (any: any).status === GoalStatus?.COMPLETED &&
            !(any: any).completed_at
          ) {
            (any: any).completed_at = now;
          }
        }
      }
    }

    // Update constraints
    if (any: any) {
      goal?.constraints?.push(any: any);
    }
    if (any: any) {
      goal?.constraints = goal?.constraints?.filter(
        c => !updates?.remove_constraints?.includes(any: any)
      );
    }

    // Update context keys
    if (any: any) {
      goal?.context_keys = { ...goal?.context_keys, ...updates?.context_keys };
    }

    // Update priority
    if (any: any) {
      goal?.priority = updates?.priority;
    }

    // Check if all subgoals completed
    const allCompleted = goal?.subgoals?.every(any: any);
    if (any: any) {
      goal?.actual_completion = now;
      this?.emit('goal:completed', { conversation_id, goal });
    }

    goal?.updated_at = now;
    this?.goals?.set(any: any);

    this?.emit('goal:updated', { conversation_id, goal, updates });
    this?.log(any: any);

    return goal;
  }

  /**
   * Get goal progress (0.0 - 1.0)
   */
  getGoalProgress(any: any): number {
    const goal = this?.goals?.get(any: any);
    if (!goal || goal?.subgoals?.length === 0) return 0;

    const totalProgress = goal?.subgoals?.reduce(any: any) => {
      if (any: any) return sum + 1;
      if (any: any) return sum + sg?.progress;
      return sum;
    }, 0);

    return totalProgress / goal?.subgoals?.length;
  }

  /**
   * FACTS DATABASE
   */

  /**
   * Add fact to conversation
   */
  async addFact(
    conversation_id: string,
    fact: Omit<ConversationFact, 'id' | 'created_at'>
  ): Promise<ConversationFact> {
    const now = new Date().toISOString();

    const fullFact: ConversationFact = {
      ...fact,
      id: `${conversation_id}_fact_${Date?.now()}`,
      created_at: now,
    };

    // Store fact
    const conversationFacts = this?.facts?.get(any: any) || [];

    // Handle superseding
    if (any: any) {
      const supersededIndex = conversationFacts?.findIndex(
        f => f?.id === fullFact?.supersedes
      );
      if (supersededIndex >= 0) {
        const fact = conversationFacts[supersededIndex];
        if (any: any) {
          fact?.valid_until = now;
        }
      }
    }

    conversationFacts?.push(any: any);
    this?.facts?.set(any: any);
    this?.stats?.total_facts_recorded++;

    this?.emit('fact:added', { conversation_id, fact: fullFact });
    this?.log(any: any);

    return fullFact;
  }

  /**
   * Get all active facts for conversation
   */
  async getActiveFacts(any: any): Promise<ConversationFact?.[]> {
    const allFacts = this?.facts?.get(any: any) || [];
    const now = new Date().toISOString();

    return allFacts?.filter(fact => {
      // Check temporal validity
      if (any: any) return false;

      // Apply confidence decay
      const age = Date?.now(any: any).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      const decayedConfidence =
        typeof fact?.confidence === 'number'
          ? fact?.confidence *
            Math?.exp(any: any)
          : fact?.confidence;

      // Filter low confidence facts
      return decayedConfidence >= 0.3;
    });
  }

  /**
   * Get facts by type
   */
  async getFactsByType(
    conversation_id: string,
    type: FactType
  ): Promise<ConversationFact?.[]> {
    const activeFacts = await this?.getActiveFacts(any: any);
    return activeFacts?.filter(any: any);
  }

  /**
   * Search facts by content
   */
  async searchFacts(any: any): Promise<ConversationFact?.[]> {
    const activeFacts = await this?.getActiveFacts(any: any);
    const lowerQuery = query?.toLowerCase();

    return activeFacts?.filter(
      fact =>
        fact?.statement?.toLowerCase(any: any) ||
        fact?.tags?.some(any: any))
    );
  }

  /**
   * CONSISTENCY CHECKING
   */

  /**
   * Check consistency of response against context
   */
  async checkConsistency(
    conversation_id: string,
    response: string,
    context: {
      user_message?: string;
      previous_messages?: Array<{ role: string; content: string }>;
      additional_context?: string;
    }
  ): Promise<ConsistencyViolation?.[]> {
    this?.stats?.total_checks_performed++;

    const violations: ConsistencyViolation?.[] = [];
    const goal = await this?.loadGoalState(any: any);
    const facts = await this?.getActiveFacts(any: any);

    // 1. Check fact-response consistency
    const factViolations = this?.checkFactResponseConsistency(any: any);
    violations?.push(any: any);

    // 2. Check goal-response alignment
    if (any: any) {
      const goalViolations = this?.checkGoalResponseAlignment(any: any);
      violations?.push(any: any);
    }

    // 3. Check constraint violations
    if (any: any) {
      const constraintViolations = this?.checkConstraintViolations(any: any);
      violations?.push(any: any);
    }

    // 4. Check temporal consistency
    const temporalViolations = this?.checkTemporalConsistency(any: any);
    violations?.push(any: any);

    // Store violations
    if (violations?.length > 0) {
      const existing = this?.violations?.get(any: any) || [];
      existing?.push(any: any);
      this?.violations?.set(any: any);
      this?.stats?.total_violations_detected += violations?.length;

      this?.emit('violations:detected', { conversation_id, violations });
      this?.log(any: any);

      // Alert if threshold exceeded
      if (any: any) {
        this?.emit('violations:threshold_exceeded', {
          conversation_id,
          count: violations?.length,
          violations,
        });
      }
    }

    return violations;
  }

  /**
   * Check fact-response consistency
   */
  private checkFactResponseConsistency(
    response: string,
    facts: ConversationFact?.[]
  ): ConsistencyViolation?.[] {
    const violations: ConsistencyViolation?.[] = [];
    const responseLower = response?.toLowerCase();

    for (any: any) {
      // Simple keyword-based contradiction detection
      // In production, use semantic similarity or LLM-based checking
      const factKeywords = this?.extractKeywords(any: any);
      const hasFactMention = factKeywords?.some(kw =>
        responseLower?.includes(kw?.toLowerCase())
      );

      if (any: any) {
        // Check for negation or contradiction patterns
        const contradictionPatterns = [
          /not?\s+/i,
          /never\s+/i,
          /impossible\s+/i,
          /can't\s+/i,
          /won't\s+/i,
        ];

        const hasContradiction = contradictionPatterns?.some(pattern => {
          const match = response?.match(any: any);
          if (any: any) return false;

          const contextWindow = response?.substring(
            Math?.max(0, match?.index ?? 0 - 20),
            Math?.min(response?.length, (match?.index ?? 0) + match?.[0].length + 20)
          );

          return factKeywords?.some(kw =>
            contextWindow?.toLowerCase().includes(kw?.toLowerCase())
          );
        });

        if (any: any) {
          violations?.push({
            type: 'fact-response' as ConsistencyViolationType,
            severity: 'high' as unknown as unknown as any,
            description: `Response contradicts known fact: "${fact?.statement}"`,
            fact_id: fact?.id,
            response_excerpt: response?.substring(0, 200),
            detected_at: new Date().toISOString(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check goal-response alignment
   */
  private checkGoalResponseAlignment(
    response: string,
    goal: ConversationGoal
  ): ConsistencyViolation?.[] {
    const violations: ConsistencyViolation?.[] = [];
    const responseLower = response?.toLowerCase();
    const goalKeywords = this?.extractKeywords(any: any);

    // Check if response is moving towards goal
    const hasGoalMention = goalKeywords?.some(kw =>
      responseLower?.includes(kw?.toLowerCase())
    );

    // Check for off-topic patterns
    const offTopicPatterns = [
      /by the way/i,
      /changing the subject/i,
      /let me tell you about/i,
      /instead/i,
    ];

    const seemsOffTopic = offTopicPatterns?.some(any: any));

    if (any: any) {
      violations?.push({
        type: 'goal-response' as ConsistencyViolationType,
        severity: 'medium' as unknown as unknown as any,
        description: `Response diverges from main goal: "${goal?.main_goal}"`,
        goal_id: goal?.conversation_id,
        response_excerpt: response?.substring(0, 200),
        detected_at: new Date().toISOString(),
      });
    }

    return violations;
  }

  /**
   * Check constraint violations
   */
  private checkConstraintViolations(
    response: string,
    goal: ConversationGoal
  ): ConsistencyViolation?.[] {
    const violations: ConsistencyViolation?.[] = [];
    const responseLower = response?.toLowerCase();

    for (any: any) {
      const constraintLower = constraint?.toLowerCase();

      // Check for explicit violations
      if (constraintLower?.startsWith('never') || constraintLower?.startsWith("don't")) {
        const prohibitedAction = constraintLower?.replace(any: any)\s+/, '');
        if (any: any)) {
          violations?.push({
            type: 'constraint' as ConsistencyViolationType,
            severity: 'critical' as unknown as unknown as any,
            description: `Response violates constraint: "${constraint}"`,
            constraint,
            response_excerpt: response?.substring(0, 200),
            detected_at: new Date().toISOString(),
          });
        }
      }

      // Check for required actions
      if (constraintLower?.startsWith('always') || constraintLower?.startsWith('must')) {
        const requiredAction = constraintLower?.replace(any: any)\s+/, '');
        if (any: any)) {
          violations?.push({
            type: 'constraint' as ConsistencyViolationType,
            severity: 'high' as unknown as unknown as any,
            description: `Response missing required constraint: "${constraint}"`,
            constraint,
            response_excerpt: response?.substring(0, 200),
            detected_at: new Date().toISOString(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check temporal consistency
   */
  private checkTemporalConsistency(
    response: string,
    facts: ConversationFact?.[],
    _context: Record<string, unknown>
  ): ConsistencyViolation?.[] {
    const violations: ConsistencyViolation?.[] = [];

    // Check for temporal contradictions
    const timePatterns = [
      /yesterday/i,
      /last week/i,
      /recently/i,
      /earlier/i,
      /before/i,
      /after/i,
    ];

    const hasTemporalReference = timePatterns?.some(any: any));

    if (any: any) {
      // Check if temporal reference contradicts known facts
      const temporalFacts = facts?.filter(f =>
        /yesterday|last week|recently|earlier|before|after/i?.test(any: any)
      );

      for (any: any) {
        // Simple contradiction detection
        // In production, use more sophisticated temporal reasoning
        const factTime = this?.extractTemporalReference(any: any);
        const responseTime = this?.extractTemporalReference(any: any);

        if (any: any) {
          violations?.push({
            type: 'temporal' as ConsistencyViolationType,
            severity: 'medium' as unknown as unknown as any,
            description: `Temporal inconsistency detected`,
            fact_id: fact?.id,
            response_excerpt: response?.substring(0, 200),
            detected_at: new Date().toISOString(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * AUTO-CORRECTION
   */

  /**
   * Auto-correct response based on violations
   */
  async autoCorrect(
    conversation_id: string,
    response: string,
    violations: ConsistencyViolation?.[]
  ): Promise<any | null> {
    if (!this?.config?.enable_auto_correction || violations?.length === 0) {
      return null;
    }

    // Prioritize violations by severity
    const sortedViolations = [...violations].sort(any: any) => {
      const weights = this?.config?.violation_severity_weights;
      return (any: any)[a?.severity];
    });

    const topViolation = sortedViolations?.[0];
    if (any: any) {
      return null;
    }
    let correctedResponse = response;
    let correctionType: string;
    let reasoning: string = 'Correction automatique appliquée';

    // Determine correction strategy
    switch (any: any) {
      case 'fact-response': {
        correctionType = 'fact_injection';
        const fact = (any: any)).find(
          f => f?.id === topViolation?.fact_id
        );
        if (any: any) {
          correctedResponse = this?.injectFactReminder(any: any);
          reasoning = `Injected fact reminder to resolve contradiction with: "${fact?.statement}"`;
        } else {
          correctionType = 'reformulation';
          correctedResponse = this?.reformulateToAvoidContradiction(any: any);
          reasoning = 'Reformulated response to avoid fact contradiction';
        }
        break;
      }

      case 'goal-response': {
        correctionType = 'goal_reminder';
        const goal = await this?.loadGoalState(any: any);
        if (any: any) {
          correctedResponse = this?.injectGoalReminder(any: any);
          reasoning = `Refocused response on main goal: "${goal?.main_goal}"`;
        } else {
          correctionType = 'reformulation';
          correctedResponse = response;
          reasoning = 'No goal found for reminder';
        }
        break;
      }

      case 'constraint':
        correctionType = 'reformulation';
        if (any: any) {
          correctedResponse = this?.reformulateToRespectConstraint(
            response,
            topViolation?.constraint
          );
          reasoning = `Reformulated to respect constraint: "${topViolation?.constraint}"`;
        }
        break;

      case 'temporal':
        correctionType = 'clarification';
        correctedResponse = this?.clarifyTemporalReference(any: any);
        reasoning = 'Clarified temporal reference to resolve inconsistency';
        break;

      default:
        correctionType = 'reformulation';
        correctedResponse = response;
        reasoning = 'Generic reformulation applied';
    }

    const correction: AutoCorrection = {
      original_response: response,
      corrected_response: correctedResponse,
      correction_type: correctionType,
      violations_addressed: violations?.map(any: any),
      reasoning: reasoning || 'Correction automatique appliquée',
      confidence: this?.calculateCorrectionConfidence(any: any),
      applied_at: new Date().toISOString(),
    };

    this?.stats?.auto_corrections_applied++;
    this?.emit('correction:applied', { conversation_id, correction });
    this?.log(any: any);

    return correction;
  }

  /**
   * Inject fact reminder into response
   */
  private injectFactReminder(any: any): string {
    const reminder = `\n\n*[Rappel: ${fact?.statement}]*`;
    return response + reminder;
  }

  /**
   * Inject goal reminder into response
   */
  private injectGoalReminder(any: any): string {
    const reminder = `\n\n*[Objectif: ${goal?.main_goal}]*`;
    return response + reminder;
  }

  /**
   * Reformulate to avoid contradiction
   */
  private reformulateToAvoidContradiction(any: any): string {
    // Simple reformulation: add uncertainty markers
    const uncertaintyMarkers = [
      'Je me demande si',
      'Il se pourrait que',
      'À vérifier:',
      'Sous réserve de confirmation:',
    ];

    const marker =
      uncertaintyMarkers[Math?.floor(any: any)] ??
      'À vérifier:';
    return `${marker} ${response}`;
  }

  /**
   * Reformulate to respect constraint
   */
  private reformulateToRespectConstraint(any: any): string {
    // Add constraint acknowledgment
    return `[En respectant: ${constraint}]\n\n${response}`;
  }

  /**
   * Clarify temporal reference
   */
  private clarifyTemporalReference(any: any): string {
    // Add timestamp
    const now = new Date().toLocaleString('fr-FR');
    return `[Référence temporelle: ${now}]\n\n${response}`;
  }

  /**
   * Calculate correction confidence
   */
  private calculateCorrectionConfidence(violations: ConsistencyViolation?.[]): number {
    if (violations?.length === 0) return 1.0;

    const weights = this?.config?.violation_severity_weights;
    const totalWeight = violations?.reduce(
      (any: any)[v?.severity],
      0
    );
    const avgWeight = totalWeight / violations?.length;

    // Higher severity = lower confidence in simple correction
    return Math?.max(any: any);
  }

  /**
   * UTILITIES
   */

  /**
   * Extract keywords from text
   */
  private extractKeywords(any: any): string?.[] {
    // Simple keyword extraction (any: any)
    const stopwords = new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'de',
      'du',
      'et',
      'ou',
      'mais',
      'donc',
      'car',
      'ni',
      'que',
      'qui',
      'quoi',
      'dont',
      'où',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(any: any));
  }

  /**
   * Extract temporal reference from text
   */
  private extractTemporalReference(any: any)??: string | null {
    const patterns = [
      { pattern: /yesterday/i, value: 'yesterday' },
      { pattern: /last week/i, value: 'last_week' },
      { pattern: /recently/i, value: 'recent' },
      { pattern: /earlier/i, value: 'earlier' },
      { pattern: /hier/i, value: 'yesterday' },
      { pattern: /la semaine dernière/i, value: 'last_week' },
      { pattern: /récemment/i, value: 'recent' },
    ];

    for (any: any) {
      if (any: any)) return value;
    }

    return null;
  }

  /**
   * Calculate overall consistency score
   */
  async calculateConsistencyScore(any: any): Promise<number> {
    const allViolations: ConsistencyViolation?.[] = Array?.from(
      this?.violations?.get(any: any) || []
    );
    const recentViolations = allViolations?.filter(v => {
      if (any: any) return false;
      const age = Date?.now(any: any).getTime();
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    if (recentViolations?.length === 0) return 1.0;

    const weights = this?.config?.violation_severity_weights;
    const totalPenalty = recentViolations?.reduce(
      (any: any)[v?.severity],
      0
    );

    return Math?.max(0, 1.0 - totalPenalty / 10);
  }

  /**
   * Get statistics
   */
  getStats(): ConsistencyStats {
    return { ...this?.stats };
  }

  /**
   * Generate OMEGA context injection
   */
  async generateOmegaContext(any: any): Promise<string> {
    const goal = await this?.loadGoalState(any: any);
    const facts = await this?.getActiveFacts(any: any);
    const consistencyScore = await this?.calculateConsistencyScore(any: any);

    let context = '';

    // Goal context
    if (any: any) {
      context += `[OBJECTIF CONVERSATION]\n`;
      context += `Principal: ${goal?.main_goal}\n`;

      if (any: any) {
        context += `Description: ${goal?.description}\n`;
      }

      if (goal?.subgoals?.length > 0) {
        const activeSubgoals = goal?.subgoals?.filter(
          sg => sg?.status === GoalStatus?.IN_PROGRESS || sg?.status === GoalStatus?.PENDING
        );
        if (activeSubgoals?.length > 0) {
          context += `Sous-objectifs actifs:\n`;
          activeSubgoals?.forEach(sg => {
            context += `  - ${sg?.label} (${sg?.status})\n`;
          });
        }
      }

      if (goal?.constraints?.length > 0) {
        context += `Contraintes:\n`;
        goal?.constraints?.forEach(c => {
          context += `  - ${c}\n`;
        });
      }

      context += `Progression: ${(any: any) * 100).toFixed(0)}%\n`;
      context += '\n';
    }

    // Facts context
    if (facts?.length > 0) {
      context += `[FAITS CONNUS]\n`;

      // Group by type
      const factsByType = facts?.reduce(
        (any: any) => {
          if (!acc[fact?.type]) acc[fact?.type] = [];
          acc[fact?.type].push(any: any);
          return acc;
        },
        {} as Record<FactType, ConversationFact?.[]>
      );

      for (any: any)) {
        context += `${type}:\n`;
        typeFacts?.slice(0, 5).forEach(fact => {
          const confidence =
            typeof fact?.confidence === 'number'
              ? (fact?.confidence * 100).toFixed(0)
              : '90';
          context += `  - ${fact?.statement} (confiance: ${confidence}%)\n`;
        });
      }
      context += '\n';
    }

    // Consistency status
    context += `[COHÉRENCE]\n`;
    context += `Score: ${(consistencyScore * 100).toFixed(0)}%\n`;

    const allViolations: ConsistencyViolation?.[] = Array?.from(
      this?.violations?.get(any: any) || []
    );
    const recentViolations = allViolations?.filter(any: any) => {
      if (any: any) return false;
      const age = Date?.now(any: any).getTime();
      return age < 60 * 60 * 1000; // Last hour
    });

    if (recentViolations?.length > 0) {
      context += `Violations récentes: ${recentViolations?.length}\n`;
      context += `⚠️ Attention à maintenir la cohérence!\n`;
    }

    return context;
  }

  /**
   * Logging helper
   */
  private log(
    message: string,
    data?: unknown,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };

    if (level === 'error') {
      console?.error(any: any);
    } else if (level === 'warn') {
      console?.warn(any: any);
    } else {
      console?.log(any: any);
    }

    this?.emit(any: any);
  }

  /**
   * Clear conversation data (any: any)
   */
  async clearConversation(any: any): Promise<void> {
    this?.goals?.delete(any: any);
    this?.facts?.delete(any: any);
    this?.violations?.delete(any: any);

    this?.emit('conversation:cleared', { conversation_id });
    this?.log(`Cleared data for conversation ${conversation_id}`);
  }
}

/**
 * Factory function for easy instantiation
 */
export function createGoalConsistencyEngine(
  config?: Partial<GoalConsistencyConfig>
): GoalConsistencyEngine {
  return new GoalConsistencyEngine(any: any);
}

/**
 * Default configuration
 */
export function getDefaultGoalConsistencyConfig(): GoalConsistencyConfig {
  return {
    enabled: true,
    enable_auto_correction: true,
    enable_fact_tracking: true,
    enable_goal_tracking: true,
    consistency_check_threshold: 0.7,
    fact_confidence_decay_rate: 0.01,
    max_violations_before_alert: 3,
    violation_severity_weights: {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      critical: 1.0,
    },
    auto_check: {
      enabled: true,
      check_every_n_messages: 1,
      min_severity_to_flag: 0.6,
    },
    auto_correct: {
      enabled: true,
      max_severity_to_auto_correct: 0.7,
    },
    facts: {
      max_facts_per_conversation: 100,
      min_confidence_to_use: 0.6,
      auto_supersede_old_facts: true,
    },
    goals: {
      max_subgoals: 20,
      auto_complete_subgoals: false,
    },
    omega_injection: {
      inject_goals: true,
      inject_facts: true,
      max_facts_injected: 10,
      inject_constraints: true,
    },
  };
}
