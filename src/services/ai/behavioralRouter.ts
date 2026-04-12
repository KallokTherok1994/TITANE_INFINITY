/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   BEHAVIORAL ROUTER — Unified Decision-Making Controller
 *   Connects memory, preferences, intent, observability into one decision
 *   This is the "nervous system" of TITANE's living architecture
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';
import type { ResponseProfileId } from './responsePolicy';
import { RESPONSE_PROFILES, classifyIntent, estimateComplexity } from './responsePolicy';
import type { IntentClassification } from './responsePolicy';
import type { MemoryContext } from './memoryIntegration';
import { memoryIntegration } from './memoryIntegration';
import type { DurablePreference } from './preferenceEngine';

const logger = createLogger('BehavioralRouter');

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/** Signal from any subsystem to the behavioral router */
export interface BehavioralSignal {
  source: 'memory' | 'preference' | 'intent' | 'observability' | 'identity';
  type: string; // e.g., 'depth_hint', 'skill_hint', 'initiative_hint'
  value: unknown;
  confidence: number; // 0.0-1.0
  timestamp: number;
}

/** Initiative action TITANE can propose */
export interface InitiativeAction {
  type: 'suggest' | 'remind' | 'propose' | 'warn';
  message: string;
  trigger: string; // what triggered this initiative
  priority: 'low' | 'medium' | 'high';
}

/** Unified behavioral decision produced by the router */
export interface BehavioralDecision {
  profileId: ResponseProfileId;
  skillId?: string; // skill to activate (if any)
  initiativeAction?: InitiativeAction; // proactive action (if any)
  reasoning: string; // why this decision was made
  signals: BehavioralSignal[]; // signals that influenced this decision
  confidence: number; // 0.0-1.0
}

/** Configuration for the behavioral router */
export interface BehavioralRouterConfig {
  enableMemoryInfluence: boolean; // default: true
  enablePreferenceInfluence: boolean; // default: true
  enableObservabilityInfluence: boolean; // default: false (Phase 3)
  enableInitiative: boolean; // default: false (Phase 2)
  maxSignalsPerDecision: number; // default: 10
  minConfidenceThreshold: number; // default: 0.4
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT CONFIG
// ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: BehavioralRouterConfig = {
  enableMemoryInfluence: true,
  enablePreferenceInfluence: true,
  enableObservabilityInfluence: false,
  enableInitiative: true,
  maxSignalsPerDecision: 10,
  minConfidenceThreshold: 0.4,
};

// ─────────────────────────────────────────────────────────────────
// BEHAVIORAL ROUTER CLASS
// ─────────────────────────────────────────────────────────────────

export class BehavioralRouter {
  private config: BehavioralRouterConfig;

  constructor(config: Partial<BehavioralRouterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.debug('BehavioralRouter initialized', { config: this.config });
  }

  /**
   * Collect all behavioral signals from memory, preferences, intent
   * v30.3.0: Complexity-aware signal scoring + multi-intent depth escalation
   */
  collectSignals(
    message: string,
    memoryContext: MemoryContext,
    preferences: DurablePreference[],
    intentResult: IntentClassification
  ): BehavioralSignal[] {
    const signals: BehavioralSignal[] = [];
    const now = Date.now();

    // 1. Intent signals
    signals.push({
      source: 'intent',
      type: 'intent_classification',
      value: intentResult.intent,
      confidence: intentResult.confidence,
      timestamp: now,
    });

    // v30.3.0: Complexity-aware depth hint — escalates based on message complexity
    const complexity = estimateComplexity(message);
    const intentDepthMap: Record<string, ResponseProfileId> = {
      conversational: 'DIRECT',
      information_request: 'DEVELOPED',
      action_request: 'DEVELOPED',
      memory_recall: 'DIRECT',
      current_info: 'DEVELOPED',
      preference_signal: 'DEVELOPED',
      creative: 'DEEP',
      diagnostic: 'DEEP',
      research_analysis: 'DEEP',
      deep_reflection: 'DEEP',
      professional_document: 'DEVELOPED',
      memory_management: 'DEVELOPED',
      message_analysis: 'DEVELOPED',
      data_collection: 'DEEP',
    };
    let intentDepth = intentDepthMap[intentResult.intent] ?? 'DEVELOPED';

    // v30.3.0: Graduated complexity escalation applied to intent depth
    const PROFILE_RANK: Record<ResponseProfileId, number> = {
      DIRECT: 0, BALANCED: 1, DEVELOPED: 2, DEEP: 3, ARCHITECT: 4, OMEGA: 5,
    };
    const RANK_PROFILE: Record<number, ResponseProfileId> = {
      0: 'DIRECT', 1: 'BALANCED', 2: 'DEVELOPED', 3: 'DEEP', 4: 'ARCHITECT', 5: 'OMEGA',
    };

    if (complexity > 0.72 && PROFILE_RANK[intentDepth] < PROFILE_RANK['DEEP']) {
      intentDepth = 'DEEP';
    } else if (complexity > 0.55 && PROFILE_RANK[intentDepth] < PROFILE_RANK['DEVELOPED']) {
      intentDepth = 'DEVELOPED';
    }

    // v30.3.0: Confidence scaled by complexity alignment
    const depthConfidence = Math.min(0.95, intentResult.confidence + complexity * 0.08);
    signals.push({
      source: 'intent',
      type: 'depth_hint',
      value: intentDepth,
      confidence: depthConfidence,
      timestamp: now,
    });

    // v30.3.0: Complexity signal for downstream consumers
    signals.push({
      source: 'intent',
      type: 'complexity_score',
      value: complexity,
      confidence: 0.85,
      timestamp: now,
    });

    // v30.3.0: Multi-intent secondary signal — if secondary intent exists, add depth boost
    if (intentResult.secondaryIntent) {
      const secondaryDepth = intentDepthMap[intentResult.secondaryIntent.intent] ?? 'DEVELOPED';
      if (PROFILE_RANK[secondaryDepth] > PROFILE_RANK[intentDepth]) {
        signals.push({
          source: 'intent',
          type: 'secondary_depth_hint',
          value: secondaryDepth,
          confidence: intentResult.secondaryIntent.confidence * 0.7,
          timestamp: now,
        });
      }
    }

    // 2. Memory signals
    if (this.config.enableMemoryInfluence) {
      // Check if memory has relevant context
      const hasRelevantMemory =
        memoryContext.activeProjects.length > 0 ||
        memoryContext.recentDecisions.length > 0 ||
        memoryContext.relevantKnowledge.length > 0;

      if (hasRelevantMemory) {
        signals.push({
          source: 'memory',
          type: 'context_available',
          value: true,
          confidence: 0.8,
          timestamp: now,
        });

        // Memory-based depth hint: if memory is relevant, prefer DEVELOPED+
        if (intentResult.memoryRelevance === 'high') {
          signals.push({
            source: 'memory',
            type: 'depth_hint',
            value: 'DEVELOPED',
            confidence: 0.7,
            timestamp: now,
          });
        }
      }
    }

    // 3. Preference signals
    // v30.3.0: Exponential decay for preference confidence (90-day half-life)
    if (this.config.enablePreferenceInfluence && preferences.length > 0) {
      const halfLifeMs = 90 * 24 * 60 * 60 * 1000;
      for (const pref of preferences) {
        // v30.3.0: Time-weighted durability using exponential decay
        const age = now - pref.lastSeen;
        const decayedDurability = pref.durability * Math.exp((-Math.LN2 * age) / halfLifeMs);
        if (decayedDurability >= 0.3) {
          // Depth preference
          if (pref.category === 'depth') {
            const prefDepthMap: Record<string, ResponseProfileId> = {
              short: 'DIRECT',
              standard: 'BALANCED',
              developed: 'DEVELOPED',
              deep: 'DEEP',
            };
            const prefDepth = prefDepthMap[pref.value];
            if (prefDepth) {
              signals.push({
                source: 'preference',
                type: 'depth_hint',
                value: prefDepth,
                confidence: decayedDurability,
                timestamp: now,
              });
            }
          }

          // Structure preference
          if (pref.category === 'structure') {
            signals.push({
              source: 'preference',
              type: 'structure_hint',
              value: pref.value,
              confidence: decayedDurability,
              timestamp: now,
            });
          }

          // Action bias preference
          if (pref.category === 'action_bias') {
            signals.push({
              source: 'preference',
              type: 'action_bias',
              value: pref.value,
              confidence: decayedDurability,
              timestamp: now,
            });
          }
        }
      }
    }

    // 4. Identity signals (always active)
    signals.push({
      source: 'identity',
      type: 'action_biased',
      value: true,
      confidence: 1.0,
      timestamp: now,
    });

    signals.push({
      source: 'identity',
      type: 'memory_aware',
      value: true,
      confidence: 1.0,
      timestamp: now,
    });

    // Limit signals
    const limitedSignals = signals.slice(0, this.config.maxSignalsPerDecision);

    logger.debug('Signals collected', {
      total: signals.length,
      limited: limitedSignals.length,
      sources: [...new Set(limitedSignals.map(s => s.source))],
    });

    return limitedSignals;
  }

  /**
   * Resolve conflicting signals
   * Priority: preference > memory > intent > identity
   */
  resolveConflicts(signals: BehavioralSignal[]): BehavioralSignal[] {
    const depthSignals = signals.filter(s => s.type === 'depth_hint');

    if (depthSignals.length <= 1) {
      return signals;
    }

    // Find the highest priority depth signal
    const priorityOrder: Record<string, number> = {
      preference: 4,
      memory: 3,
      intent: 2,
      identity: 1,
    };

    let bestSignal: BehavioralSignal = depthSignals[0]!;
    let bestPriority = priorityOrder[bestSignal.source] ?? 0;

    for (const signal of depthSignals) {
      const priority = priorityOrder[signal.source] ?? 0;
      if (priority > bestPriority) {
        bestSignal = signal;
        bestPriority = priority;
      } else if (priority === bestPriority && signal.confidence > bestSignal.confidence) {
        bestSignal = signal;
      }
    }

    // Remove non-winning depth signals
    const filteredSignals = signals.filter(
      s => s.type !== 'depth_hint' || s === bestSignal
    );

    logger.debug('Conflicts resolved', {
      originalDepthSignals: depthSignals.length,
      winningSource: bestSignal.source,
      winningValue: bestSignal.value,
    });

    return filteredSignals;
  }

  /**
   * Make a unified behavioral decision from signals
   */
  decide(signals: BehavioralSignal[], mode: string): BehavioralDecision {
    const resolvedSignals = this.resolveConflicts(signals);

    // Determine profile from depth signals
    const depthSignal = resolvedSignals.find(s => s.type === 'depth_hint');
    const profileId = (depthSignal?.value as ResponseProfileId) ?? 'DEVELOPED';
    const confidence = depthSignal?.confidence ?? 0.5;

    // Build reasoning
    const reasoningParts: string[] = [];

    const intentSignal = resolvedSignals.find(s => s.source === 'intent');
    if (intentSignal) {
      reasoningParts.push(`Intent: ${intentSignal.value}`);
    }

    if (depthSignal) {
      reasoningParts.push(`Profil: ${depthSignal.value} (source: ${depthSignal.source})`);
    }

    const memorySignal = resolvedSignals.find(s => s.source === 'memory');
    if (memorySignal) {
      reasoningParts.push('Mémoire disponible');
    }

    const prefSignals = resolvedSignals.filter(s => s.source === 'preference');
    if (prefSignals.length > 0) {
      reasoningParts.push(`${prefSignals.length} préférence(s) active(s)`);
    }

    const decision: BehavioralDecision = {
      profileId,
      reasoning: reasoningParts.join(' | ') || 'Fallback: mode par défaut',
      signals: resolvedSignals,
      confidence: Math.min(1.0, confidence),
    };

    logger.debug('Decision made', {
      profileId: decision.profileId,
      confidence: decision.confidence,
      signalCount: resolvedSignals.length,
    });

    return decision;
  }

  /**
   * Detect initiative opportunities based on memory context
   * Returns an InitiativeAction if TITANE should proactively suggest something
   */
  private detectInitiative(
    memoryContext: MemoryContext,
    intentResult: IntentClassification
  ): InitiativeAction | undefined {
    if (!this.config.enableInitiative) {
      return undefined;
    }

    const now = Date.now();

    // Initiative 1: Stagnant project reminder
    for (const project of memoryContext.activeProjects) {
      if (project.status === 'active' && project.progress < 50) {
        const lastActivity = new Date(project.lastActivity).getTime();
        const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);

        if (daysSinceActivity > 7) {
          return {
            type: 'remind',
            message: `Le projet "${project.title}" est actif mais n'a pas avancé depuis ${Math.floor(daysSinceActivity)} jours. Progression: ${project.progress}%.`,
            trigger: 'stagnant_project',
            priority: project.priority === 'high' ? 'high' : 'medium',
          };
        }
      }
    }

    // Initiative 2: Pending decision reminder
    for (const decision of memoryContext.recentDecisions) {
      if (decision.status === 'pending' && decision.impact === 'high') {
        return {
          type: 'remind',
          message: `La décision "${decision.title}" est en attente depuis le ${decision.timestamp}. Impact: élevé.`,
          trigger: 'pending_decision',
          priority: 'medium',
        };
      }
    }

    // Initiative 3: Knowledge gap suggestion
    if (intentResult.intent === 'information_request' && intentResult.confidence < 0.6) {
      const knowledgeCount = memoryContext.relevantKnowledge.length;
      if (knowledgeCount < 3) {
        return {
          type: 'suggest',
          message:
            "Je remarque que ma base de connaissances est limitée sur ce sujet. Souhaites-tu que j'approfondisse ?",
          trigger: 'knowledge_gap',
          priority: 'low',
        };
      }
    }

    return undefined;
  }

  /**
   * Full pipeline: collect signals → resolve conflicts → decide → detect initiative
   */
  route(
    message: string,
    memoryContext: MemoryContext,
    preferences: DurablePreference[],
    intentResult: IntentClassification,
    mode: string
  ): BehavioralDecision {
    const signals = this.collectSignals(
      message,
      memoryContext,
      preferences,
      intentResult
    );
    const decision = this.decide(signals, mode);

    // Phase 2: Detect initiative opportunities
    const initiative = this.detectInitiative(memoryContext, intentResult);
    if (initiative) {
      decision.initiativeAction = initiative;
      logger.debug('Initiative detected', {
        type: initiative.type,
        trigger: initiative.trigger,
        priority: initiative.priority,
      });
    }

    return decision;
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const behavioralRouter = new BehavioralRouter();

export default behavioralRouter;
