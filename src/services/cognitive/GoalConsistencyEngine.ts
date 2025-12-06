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
  FactConfidence,
  ConsistencyViolation,
  ViolationType,
  ViolationSeverity,
  AutoCorrection,
  CorrectionType,
  GoalConsistencyConfig,
  GoalConsistencyStats
} from './goalConsistency.types';

/**
 * Goal & Consistency Engine
 * 
 * Manages conversation goals, facts database, and consistency checking
 */
export class GoalConsistencyEngine extends EventEmitter {
  private config: Required<GoalConsistencyConfig>;
  
  // In-memory storage (can be replaced with persistent storage)
  private goals: Map<string, ConversationGoal> = new Map();
  private facts: Map<string, ConversationFact[]> = new Map();
  private violations: Map<string, ConsistencyViolation[]> = new Map();
  
  // Statistics
  private stats: GoalConsistencyStats = {
    total_goals_created: 0,
    total_subgoals_created: 0,
    total_facts_stored: 0,
    total_violations_detected: 0,
    total_corrections_applied: 0,
    consistency_checks_performed: 0,
    avg_consistency_score: 1.0
  };

  constructor(config?: Partial<GoalConsistencyConfig>) {
    super();
    
    this.config = {
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
        critical: 1.0
      }
    };

    this.log('GoalConsistencyEngine initialized', this.config);
  }

  /**
   * GOAL STATE MANAGEMENT
   */

  /**
   * Load goal state for conversation
   */
  async loadGoalState(conversation_id: string): Promise<ConversationGoal | null> {
    const goal = this.goals.get(conversation_id);
    
    if (goal) {
      this.emit('goal:loaded', { conversation_id, goal });
      this.log(`Goal loaded for conversation ${conversation_id}`, goal);
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
      constraints?: string[];
      context_keys?: Record<string, any>;
      priority?: GoalPriority;
    }
  ): Promise<ConversationGoal> {
    const now = new Date().toISOString();
    
    const goal: ConversationGoal = {
      conversation_id,
      main_goal,
      description: options?.description,
      subgoals: (options?.subgoals || []).map((sg, index) => ({
        ...sg,
        id: `${conversation_id}_subgoal_${index + 1}`,
        created_at: now,
        status: sg.status || GoalStatus.PENDING
      })),
      constraints: options?.constraints || [],
      context_keys: options?.context_keys,
      priority: options?.priority || GoalPriority.MEDIUM,
      created_at: now,
      updated_at: now
    };

    this.goals.set(conversation_id, goal);
    this.stats.total_goals_created++;
    this.stats.total_subgoals_created += goal.subgoals.length;

    this.emit('goal:created', { conversation_id, goal });
    this.log(`Goal created for conversation ${conversation_id}`, goal);

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
      add_constraints?: string[];
      remove_constraints?: string[];
      context_keys?: Record<string, any>;
      priority?: GoalPriority;
    }
  ): Promise<ConversationGoal | null> {
    const goal = this.goals.get(conversation_id);
    if (!goal) {
      this.log(`No goal found for conversation ${conversation_id}`, 'warn');
      return null;
    }

    const now = new Date().toISOString();

    // Update main goal
    if (updates.main_goal) {
      goal.main_goal = updates.main_goal;
    }

    if (updates.description !== undefined) {
      goal.description = updates.description;
    }

    // Add new subgoals
    if (updates.add_subgoals) {
      const newSubgoals = updates.add_subgoals.map((sg, index) => ({
        ...sg,
        id: `${conversation_id}_subgoal_${goal.subgoals.length + index + 1}`,
        created_at: now,
        status: sg.status || GoalStatus.PENDING
      }));
      goal.subgoals.push(...newSubgoals);
      this.stats.total_subgoals_created += newSubgoals.length;
    }

    // Update existing subgoals
    if (updates.update_subgoals) {
      for (const update of updates.update_subgoals) {
        const subgoal = goal.subgoals.find(sg => sg.id === update.id);
        if (subgoal) {
          Object.assign(subgoal, update);
          
          // Mark completion timestamp
          if (update.status === GoalStatus.COMPLETED && !subgoal.completed_at) {
            subgoal.completed_at = now;
          }
        }
      }
    }

    // Update constraints
    if (updates.add_constraints) {
      goal.constraints.push(...updates.add_constraints);
    }
    if (updates.remove_constraints) {
      goal.constraints = goal.constraints.filter(
        c => !updates.remove_constraints!.includes(c)
      );
    }

    // Update context keys
    if (updates.context_keys) {
      goal.context_keys = { ...goal.context_keys, ...updates.context_keys };
    }

    // Update priority
    if (updates.priority) {
      goal.priority = updates.priority;
    }

    // Check if all subgoals completed
    const allCompleted = goal.subgoals.every(
      sg => sg.status === GoalStatus.COMPLETED
    );
    if (allCompleted && !goal.actual_completion) {
      goal.actual_completion = now;
      this.emit('goal:completed', { conversation_id, goal });
    }

    goal.updated_at = now;
    this.goals.set(conversation_id, goal);

    this.emit('goal:updated', { conversation_id, goal, updates });
    this.log(`Goal updated for conversation ${conversation_id}`, updates);

    return goal;
  }

  /**
   * Get goal progress (0.0 - 1.0)
   */
  getGoalProgress(conversation_id: string): number {
    const goal = this.goals.get(conversation_id);
    if (!goal || goal.subgoals.length === 0) return 0;

    const totalProgress = goal.subgoals.reduce((sum, sg) => {
      if (sg.status === GoalStatus.COMPLETED) return sum + 1;
      if (sg.progress !== undefined) return sum + sg.progress;
      return sum;
    }, 0);

    return totalProgress / goal.subgoals.length;
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
      id: `${conversation_id}_fact_${Date.now()}`,
      created_at: now
    };

    // Store fact
    const conversationFacts = this.facts.get(conversation_id) || [];
    
    // Handle superseding
    if (fullFact.supersedes) {
      const supersededIndex = conversationFacts.findIndex(f => f.id === fullFact.supersedes);
      if (supersededIndex >= 0) {
        conversationFacts[supersededIndex].valid_until = now;
      }
    }
    
    conversationFacts.push(fullFact);
    this.facts.set(conversation_id, conversationFacts);
    this.stats.total_facts_stored++;

    this.emit('fact:added', { conversation_id, fact: fullFact });
    this.log(`Fact added to conversation ${conversation_id}`, fullFact);

    return fullFact;
  }

  /**
   * Get all active facts for conversation
   */
  async getActiveFacts(conversation_id: string): Promise<ConversationFact[]> {
    const allFacts = this.facts.get(conversation_id) || [];
    const now = new Date().toISOString();

    return allFacts.filter(fact => {
      // Check temporal validity
      if (fact.valid_until && fact.valid_until < now) return false;
      
      // Apply confidence decay
      const age = Date.now() - new Date(fact.created_at).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      const decayedConfidence = typeof fact.confidence === 'number'
        ? fact.confidence * Math.exp(-this.config.fact_confidence_decay_rate * daysSinceCreation)
        : fact.confidence;
      
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
  ): Promise<ConversationFact[]> {
    const activeFacts = await this.getActiveFacts(conversation_id);
    return activeFacts.filter(fact => fact.type === type);
  }

  /**
   * Search facts by content
   */
  async searchFacts(
    conversation_id: string,
    query: string
  ): Promise<ConversationFact[]> {
    const activeFacts = await this.getActiveFacts(conversation_id);
    const lowerQuery = query.toLowerCase();
    
    return activeFacts.filter(fact => 
      fact.statement.toLowerCase().includes(lowerQuery) ||
      fact.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
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
  ): Promise<ConsistencyViolation[]> {
    this.stats.consistency_checks_performed++;

    const violations: ConsistencyViolation[] = [];
    const goal = await this.loadGoalState(conversation_id);
    const facts = await this.getActiveFacts(conversation_id);

    // 1. Check fact-response consistency
    const factViolations = this.checkFactResponseConsistency(response, facts);
    violations.push(...factViolations);

    // 2. Check goal-response alignment
    if (goal) {
      const goalViolations = this.checkGoalResponseAlignment(response, goal);
      violations.push(...goalViolations);
    }

    // 3. Check constraint violations
    if (goal) {
      const constraintViolations = this.checkConstraintViolations(response, goal);
      violations.push(...constraintViolations);
    }

    // 4. Check temporal consistency
    const temporalViolations = this.checkTemporalConsistency(response, facts, context);
    violations.push(...temporalViolations);

    // Store violations
    if (violations.length > 0) {
      const existing = this.violations.get(conversation_id) || [];
      existing.push(...violations);
      this.violations.set(conversation_id, existing);
      this.stats.total_violations_detected += violations.length;

      this.emit('violations:detected', { conversation_id, violations });
      this.log(`Detected ${violations.length} consistency violations`, violations);

      // Alert if threshold exceeded
      if (violations.length >= this.config.max_violations_before_alert) {
        this.emit('violations:threshold_exceeded', { 
          conversation_id, 
          count: violations.length,
          violations 
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
    facts: ConversationFact[]
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const responseLower = response.toLowerCase();

    for (const fact of facts) {
      // Simple keyword-based contradiction detection
      // In production, use semantic similarity or LLM-based checking
      const factKeywords = this.extractKeywords(fact.statement);
      const hasFactMention = factKeywords.some(kw => responseLower.includes(kw.toLowerCase()));

      if (hasFactMention) {
        // Check for negation or contradiction patterns
        const contradictionPatterns = [
          /not?\s+/i,
          /never\s+/i,
          /impossible\s+/i,
          /can't\s+/i,
          /won't\s+/i
        ];

        const hasContradiction = contradictionPatterns.some(pattern => {
          const match = response.match(pattern);
          if (!match) return false;
          
          const contextWindow = response.substring(
            Math.max(0, match.index! - 20),
            Math.min(response.length, match.index! + match[0].length + 20)
          );
          
          return factKeywords.some(kw => 
            contextWindow.toLowerCase().includes(kw.toLowerCase())
          );
        });

        if (hasContradiction) {
          violations.push({
            type: 'fact-response' as ViolationType,
            severity: 'high' as ViolationSeverity,
            description: `Response contradicts known fact: "${fact.statement}"`,
            fact_id: fact.id,
            response_excerpt: response.substring(0, 200),
            detected_at: new Date().toISOString()
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
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const responseLower = response.toLowerCase();
    const goalKeywords = this.extractKeywords(goal.main_goal);

    // Check if response is moving towards goal
    const hasGoalMention = goalKeywords.some(kw => 
      responseLower.includes(kw.toLowerCase())
    );

    // Check for off-topic patterns
    const offTopicPatterns = [
      /by the way/i,
      /changing the subject/i,
      /let me tell you about/i,
      /instead/i
    ];

    const seemsOffTopic = offTopicPatterns.some(pattern => 
      pattern.test(response)
    );

    if (seemsOffTopic && !hasGoalMention) {
      violations.push({
        type: 'goal-response' as ViolationType,
        severity: 'medium' as ViolationSeverity,
        description: `Response diverges from main goal: "${goal.main_goal}"`,
        goal_id: goal.conversation_id,
        response_excerpt: response.substring(0, 200),
        detected_at: new Date().toISOString()
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
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const responseLower = response.toLowerCase();

    for (const constraint of goal.constraints) {
      const constraintLower = constraint.toLowerCase();
      
      // Check for explicit violations
      if (constraintLower.startsWith('never') || constraintLower.startsWith('don\'t')) {
        const prohibitedAction = constraintLower.replace(/^(never|don't)\s+/, '');
        if (responseLower.includes(prohibitedAction)) {
          violations.push({
            type: 'constraint' as ViolationType,
            severity: 'critical' as ViolationSeverity,
            description: `Response violates constraint: "${constraint}"`,
            constraint,
            response_excerpt: response.substring(0, 200),
            detected_at: new Date().toISOString()
          });
        }
      }
      
      // Check for required actions
      if (constraintLower.startsWith('always') || constraintLower.startsWith('must')) {
        const requiredAction = constraintLower.replace(/^(always|must)\s+/, '');
        if (!responseLower.includes(requiredAction)) {
          violations.push({
            type: 'constraint' as ViolationType,
            severity: 'high' as ViolationSeverity,
            description: `Response missing required constraint: "${constraint}"`,
            constraint,
            response_excerpt: response.substring(0, 200),
            detected_at: new Date().toISOString()
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
    facts: ConversationFact[],
    context: any
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    
    // Check for temporal contradictions
    const timePatterns = [
      /yesterday/i,
      /last week/i,
      /recently/i,
      /earlier/i,
      /before/i,
      /after/i
    ];

    const hasTemporalReference = timePatterns.some(pattern => pattern.test(response));

    if (hasTemporalReference) {
      // Check if temporal reference contradicts known facts
      const temporalFacts = facts.filter(f => 
        /yesterday|last week|recently|earlier|before|after/i.test(f.statement)
      );

      for (const fact of temporalFacts) {
        // Simple contradiction detection
        // In production, use more sophisticated temporal reasoning
        const factTime = this.extractTemporalReference(fact.statement);
        const responseTime = this.extractTemporalReference(response);

        if (factTime && responseTime && factTime !== responseTime) {
          violations.push({
            type: 'temporal' as ViolationType,
            severity: 'medium' as ViolationSeverity,
            description: `Temporal inconsistency detected`,
            fact_id: fact.id,
            response_excerpt: response.substring(0, 200),
            detected_at: new Date().toISOString()
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
    violations: ConsistencyViolation[]
  ): Promise<AutoCorrection | null> {
    if (!this.config.enable_auto_correction || violations.length === 0) {
      return null;
    }

    // Prioritize violations by severity
    const sortedViolations = [...violations].sort((a, b) => {
      const weights = this.config.violation_severity_weights;
      return weights[b.severity] - weights[a.severity];
    });

    const topViolation = sortedViolations[0];
    let correctedResponse = response;
    let correctionType: CorrectionType;
    let reasoning: string;

    // Determine correction strategy
    switch (topViolation.type) {
      case 'fact-response':
        correctionType = 'fact_injection';
        const fact = (await this.getActiveFacts(conversation_id)).find(
          f => f.id === topViolation.fact_id
        );
        if (fact) {
          correctedResponse = this.injectFactReminder(response, fact);
          reasoning = `Injected fact reminder to resolve contradiction with: "${fact.statement}"`;
        } else {
          correctionType = 'reformulation';
          correctedResponse = this.reformulateToAvoidContradiction(response);
          reasoning = 'Reformulated response to avoid fact contradiction';
        }
        break;

      case 'goal-response':
        correctionType = 'goal_reminder';
        const goal = await this.loadGoalState(conversation_id);
        if (goal) {
          correctedResponse = this.injectGoalReminder(response, goal);
          reasoning = `Refocused response on main goal: "${goal.main_goal}"`;
        } else {
          correctionType = 'reformulation';
          correctedResponse = response;
          reasoning = 'No goal found for reminder';
        }
        break;

      case 'constraint':
        correctionType = 'reformulation';
        correctedResponse = this.reformulateToRespectConstraint(
          response,
          topViolation.constraint!
        );
        reasoning = `Reformulated to respect constraint: "${topViolation.constraint}"`;
        break;

      case 'temporal':
        correctionType = 'clarification';
        correctedResponse = this.clarifyTemporalReference(response);
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
      violations_addressed: violations.map(v => v.type),
      reasoning,
      confidence: this.calculateCorrectionConfidence(violations),
      applied_at: new Date().toISOString()
    };

    this.stats.total_corrections_applied++;
    this.emit('correction:applied', { conversation_id, correction });
    this.log('Auto-correction applied', correction);

    return correction;
  }

  /**
   * Inject fact reminder into response
   */
  private injectFactReminder(response: string, fact: ConversationFact): string {
    const reminder = `\n\n*[Rappel: ${fact.statement}]*`;
    return response + reminder;
  }

  /**
   * Inject goal reminder into response
   */
  private injectGoalReminder(response: string, goal: ConversationGoal): string {
    const reminder = `\n\n*[Objectif: ${goal.main_goal}]*`;
    return response + reminder;
  }

  /**
   * Reformulate to avoid contradiction
   */
  private reformulateToAvoidContradiction(response: string): string {
    // Simple reformulation: add uncertainty markers
    const uncertaintyMarkers = [
      'Je me demande si',
      'Il se pourrait que',
      'À vérifier:',
      'Sous réserve de confirmation:'
    ];
    
    const marker = uncertaintyMarkers[Math.floor(Math.random() * uncertaintyMarkers.length)];
    return `${marker} ${response}`;
  }

  /**
   * Reformulate to respect constraint
   */
  private reformulateToRespectConstraint(response: string, constraint: string): string {
    // Add constraint acknowledgment
    return `[En respectant: ${constraint}]\n\n${response}`;
  }

  /**
   * Clarify temporal reference
   */
  private clarifyTemporalReference(response: string): string {
    // Add timestamp
    const now = new Date().toLocaleString('fr-FR');
    return `[Référence temporelle: ${now}]\n\n${response}`;
  }

  /**
   * Calculate correction confidence
   */
  private calculateCorrectionConfidence(violations: ConsistencyViolation[]): number {
    if (violations.length === 0) return 1.0;
    
    const weights = this.config.violation_severity_weights;
    const totalWeight = violations.reduce((sum, v) => sum + weights[v.severity], 0);
    const avgWeight = totalWeight / violations.length;
    
    // Higher severity = lower confidence in simple correction
    return Math.max(0.3, 1.0 - avgWeight);
  }

  /**
   * UTILITIES
   */

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (remove stopwords)
    const stopwords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
      'donc', 'car', 'ni', 'que', 'qui', 'quoi', 'dont', 'où',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.has(word));
  }

  /**
   * Extract temporal reference from text
   */
  private extractTemporalReference(text: string): string | null {
    const patterns = [
      { pattern: /yesterday/i, value: 'yesterday' },
      { pattern: /last week/i, value: 'last_week' },
      { pattern: /recently/i, value: 'recent' },
      { pattern: /earlier/i, value: 'earlier' },
      { pattern: /hier/i, value: 'yesterday' },
      { pattern: /la semaine dernière/i, value: 'last_week' },
      { pattern: /récemment/i, value: 'recent' }
    ];

    for (const { pattern, value } of patterns) {
      if (pattern.test(text)) return value;
    }

    return null;
  }

  /**
   * Calculate overall consistency score
   */
  async calculateConsistencyScore(conversation_id: string): Promise<number> {
    const recentViolations = (this.violations.get(conversation_id) || [])
      .filter(v => {
        const age = Date.now() - new Date(v.detected_at).getTime();
        return age < 24 * 60 * 60 * 1000; // Last 24 hours
      });

    if (recentViolations.length === 0) return 1.0;

    const weights = this.config.violation_severity_weights;
    const totalPenalty = recentViolations.reduce(
      (sum, v) => sum + weights[v.severity],
      0
    );

    return Math.max(0, 1.0 - (totalPenalty / 10));
  }

  /**
   * Get statistics
   */
  getStats(): GoalConsistencyStats {
    return { ...this.stats };
  }

  /**
   * Generate OMEGA context injection
   */
  async generateOmegaContext(conversation_id: string): Promise<string> {
    const goal = await this.loadGoalState(conversation_id);
    const facts = await this.getActiveFacts(conversation_id);
    const consistencyScore = await this.calculateConsistencyScore(conversation_id);

    let context = '';

    // Goal context
    if (goal) {
      context += `[OBJECTIF CONVERSATION]\n`;
      context += `Principal: ${goal.main_goal}\n`;
      
      if (goal.description) {
        context += `Description: ${goal.description}\n`;
      }

      if (goal.subgoals.length > 0) {
        const activeSubgoals = goal.subgoals.filter(
          sg => sg.status === GoalStatus.IN_PROGRESS || sg.status === GoalStatus.PENDING
        );
        if (activeSubgoals.length > 0) {
          context += `Sous-objectifs actifs:\n`;
          activeSubgoals.forEach(sg => {
            context += `  - ${sg.label} (${sg.status})\n`;
          });
        }
      }

      if (goal.constraints.length > 0) {
        context += `Contraintes:\n`;
        goal.constraints.forEach(c => {
          context += `  - ${c}\n`;
        });
      }

      context += `Progression: ${(this.getGoalProgress(conversation_id) * 100).toFixed(0)}%\n`;
      context += '\n';
    }

    // Facts context
    if (facts.length > 0) {
      context += `[FAITS CONNUS]\n`;
      
      // Group by type
      const factsByType = facts.reduce((acc, fact) => {
        if (!acc[fact.type]) acc[fact.type] = [];
        acc[fact.type].push(fact);
        return acc;
      }, {} as Record<FactType, ConversationFact[]>);

      for (const [type, typeFacts] of Object.entries(factsByType)) {
        context += `${type}:\n`;
        typeFacts.slice(0, 5).forEach(fact => {
          const confidence = typeof fact.confidence === 'number' 
            ? (fact.confidence * 100).toFixed(0) 
            : '90';
          context += `  - ${fact.statement} (confiance: ${confidence}%)\n`;
        });
      }
      context += '\n';
    }

    // Consistency status
    context += `[COHÉRENCE]\n`;
    context += `Score: ${(consistencyScore * 100).toFixed(0)}%\n`;
    
    const recentViolations = (this.violations.get(conversation_id) || [])
      .filter(v => {
        const age = Date.now() - new Date(v.detected_at).getTime();
        return age < 60 * 60 * 1000; // Last hour
      });

    if (recentViolations.length > 0) {
      context += `Violations récentes: ${recentViolations.length}\n`;
      context += `⚠️ Attention à maintenir la cohérence!\n`;
    }

    return context;
  }

  /**
   * Logging helper
   */
  private log(message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    if (level === 'error') {
      console.error('[GoalConsistencyEngine]', logEntry);
    } else if (level === 'warn') {
      console.warn('[GoalConsistencyEngine]', logEntry);
    } else {
      console.log('[GoalConsistencyEngine]', logEntry);
    }

    this.emit('log', logEntry);
  }

  /**
   * Clear conversation data (for cleanup)
   */
  async clearConversation(conversation_id: string): Promise<void> {
    this.goals.delete(conversation_id);
    this.facts.delete(conversation_id);
    this.violations.delete(conversation_id);

    this.emit('conversation:cleared', { conversation_id });
    this.log(`Cleared data for conversation ${conversation_id}`);
  }
}

/**
 * Factory function for easy instantiation
 */
export function createGoalConsistencyEngine(
  config?: Partial<GoalConsistencyConfig>
): GoalConsistencyEngine {
  return new GoalConsistencyEngine(config);
}

/**
 * Default configuration
 */
export function getDefaultGoalConsistencyConfig(): GoalConsistencyConfig {
  return {
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
      critical: 1.0
    }
  };
}
