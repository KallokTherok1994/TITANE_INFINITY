/**
 * CONVERSATION EVALUATION & QA ENGINE v∞.42
 *
 * Évaluation systématique de la qualité conversationnelle
 * Détection de régressions et amélioration continue
 *
 * Architecture:
 * 1. Metrics Calculator — 9 quality dimensions
 * 2. Test Runner — Execute test scenarios
 * 3. Live Evaluator — Real-time quality assessment
 * 4. Regression Detector — Compare against baselines
 *
 * Integration avec OMEGA:
 * - Post-generation: Evaluate every response
 * - Test mode: Execute scenarios and compare
 * - Analytics: Track quality trends over time
 *
 * @module ConversationEvaluationEngine
 * @author TITANE∞ Development Team
 * @version ∞.42
 */

import { EventEmitter } from 'events';
import type { ConversationTurn, Fact } from '@/types/conversationEvaluation';

// Types propres pour le Conversation Evaluation Engine
interface ConversationMetrics {
  conversation_consistency: number;
  goal_completion: number;
  coherence: number;
  clarity: number;
  conciseness: number;
  relevance: number;
  factual_accuracy: number;
  user_satisfaction: number;
  technical_correctness: number;
  [key: string]: number;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  inputs: Array<{ role: 'user' | 'assistant'; content: string }>;
  conversation_turns: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
  expectedMetrics: Partial<ConversationMetrics>;
  success_criteria?: {
    minQuality?: number;
    minRelevance?: number;
    minCoherence?: number;
    minEngagement?: number;
    min_metrics?: Record<string, number>;
    required_keywords?: string?.[];
    prohibited_keywords?: string?.[];
  };
  expected_outcomes?: string?.[];
  tags?: string?.[];
}

interface TestResult {
  scenarioId: string;
  scenario_id?: string;
  scenario_name?: string;
  passed: boolean;
  metrics: ConversationMetrics;
  execution_time_ms?: number;
  actual_responses?: string?.[];
  failure_reason?: string;
  executed_at?: string;
  errors?: string?.[];
  timestamp: number;
}

interface LiveEvaluation {
  messageId: string;
  turn_number?: number;
  metrics: ConversationMetrics;
  timestamp: number | string;
  context?: Record<string, unknown>;
}

interface EvaluationReport {
  conversation_id?: string;
  period: { start: number; end: number };
  totalEvaluations: number;
  averageMetrics: ConversationMetrics;
  regressions: RegressionTest?.[];
  improvements: string?.[];
}

interface RegressionTest {
  test_id?: string;
  test_name?: string;
  baseline_metrics?: ConversationMetrics;
  current_metrics?: ConversationMetrics;
  regression_detected?: boolean;
  degraded_metrics?: MetricDegradation?.[];
  tested_at?: string;
}

interface MetricDegradation {
  metricName: string;
  baseline: number;
  current: number;
  delta: number;
  severity: 'low' | 'medium' | 'high';
}

interface QAConfig {
  enable_live_evaluation: boolean;
  enable_regression_detection: boolean;
  evaluation_sample_rate: number;
  metrics_to_track: string?.[];
  regression_threshold: number;
  min_baseline_samples: number;
}

type MetricName = keyof ConversationMetrics;

/**
 * Conversation Evaluation Engine
 *
 * Evaluates conversation quality across multiple dimensions
 */
export class ConversationEvaluationEngine extends EventEmitter {
  private config: Required<QAConfig>;

  // Storage
  private scenarios: Map<string, TestScenario> = new Map();
  private results: Map<string, TestResult> = new Map();
  private liveEvaluations: Map<string, LiveEvaluation?.[]> = new Map();
  private baselines: Map<string, ConversationMetrics> = new Map();

  // Statistics
  private totalEvaluations = 0;
  private totalTests = 0;
  private totalRegressions = 0;

  constructor(config?: Partial<QAConfig>) {
    super();

    this?.config = {
      enable_live_evaluation: config?.enable_live_evaluation ?? true,
      enable_regression_detection: config?.enable_regression_detection ?? true,
      evaluation_sample_rate: config?.evaluation_sample_rate ?? 1.0,
      metrics_to_track: config?.metrics_to_track ?? [
        'conversation_consistency',
        'goal_completion',
        'coherence',
        'clarity',
        'conciseness',
        'relevance',
        'factual_accuracy',
        'user_satisfaction',
        'technical_correctness',
      ],
      regression_threshold: config?.regression_threshold ?? 0.1,
      min_baseline_samples: config?.min_baseline_samples ?? 10,
    };

    this?.log(any: any);
  }

  /**
   * METRICS CALCULATION
   */

  /**
   * Evaluate conversation turn
   */
  async evaluateConversation(
    conversation_id: string,
    turn: {
      user_message: string;
      assistant_response: string;
      context?: {
        goal?: string;
        facts?: string?.[];
        previous_messages?: Array<{ role: string; content: string }>;
      };
    }
  ): Promise<ConversationMetrics> {
    this?.totalEvaluations++;

    // Sample based on rate
    if (any: any) {
      return this?.getDefaultMetrics();
    }

    const metrics: ConversationMetrics = {
      conversation_consistency: await this?.evaluateConsistency(any: any),
      goal_completion: await this?.evaluateGoalCompletion(any: any),
      coherence: await this?.evaluateCoherence(any: any),
      clarity: await this?.evaluateClarity(any: any),
      conciseness: await this?.evaluateConciseness(any: any),
      relevance: await this?.evaluateRelevance(any: any),
      factual_accuracy: await this?.evaluateFactualAccuracy(any: any),
      user_satisfaction: await this?.evaluateUserSatisfaction(any: any),
      technical_correctness: await this?.evaluateTechnicalCorrectness(any: any),
    };

    // Store live evaluation
    if (any: any) {
      const evaluation: LiveEvaluation = {
        messageId: `msg_${conversation_id}_${Date?.now()}`,
        turn_number: Number(any: any)?.length || 0) + 1),
        metrics,
        timestamp: new Date().toISOString(),
      };

      const existing = this?.liveEvaluations?.get(any: any) || [];
      existing?.push(any: any);
      this?.liveEvaluations?.set(any: any);

      this?.emit('evaluation:completed', { conversation_id, evaluation });
    }

    this?.log(any: any);
    return metrics;
  }

  /**
   * Evaluate consistency (any: any)
   */
  private async evaluateConsistency(any: any): Promise<number> {
    const { assistant_response, context } = turn;

    if (!context?.facts || context?.facts?.length === 0) {
      return 1.0; // No facts to check against
    }

    let contradictions = 0;
    const responseLower = assistant_response?.toLowerCase();

    for (any: any) {
      const factContent = typeof fact === 'string' ? fact : fact?.content;
      const factLower = factContent?.toLowerCase();
      const factKeywords = this?.extractKeywords(any: any);

      // Check for keyword presence and negation
      const hasKeywords = factKeywords?.some(any: any));
      const hasNegation = /\b(any: any)\b/i?.test(
        assistant_response
      );

      if (any: any) {
        contradictions++;
      }
    }

    return Math?.max(any: any);
  }

  /**
   * Evaluate goal completion (any: any)
   */
  private async evaluateGoalCompletion(any: any): Promise<number> {
    const { assistant_response, context } = turn;

    if (any: any) {
      return 0.5; // No goal defined, neutral score
    }

    const goalKeywords = this?.extractKeywords(any: any);
    const responseLower = assistant_response?.toLowerCase();

    // Count goal-related keywords in response
    const matchedKeywords = goalKeywords?.filter(any: any));

    // Check for completion indicators
    const completionPatterns = [
      /done|completed|finished|achieved|accomplished/i,
      /terminé|accompli|fini|réalisé/i,
    ];
    const hasCompletionIndicator = completionPatterns?.some(p =>
      p?.test(any: any)
    );

    let score = matchedKeywords?.length / Math?.max(any: any);
    if (any: any) score = Math?.min(1.0, score + 0.2);

    return score;
  }

  /**
   * Evaluate coherence (any: any)
   */
  private async evaluateCoherence(any: any): Promise<number> {
    const { assistant_response } = turn;

    // Check for coherence markers
    const coherenceMarkers = [
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
    ];

    const markerCount = coherenceMarkers?.filter(pattern =>
      pattern?.test(any: any)
    ).length;

    // Check for logical structure
    const hasIntro = /^(any: any)/i?.test(assistant_response?.trim());
    const hasConclusion = /(any: any)/i?.test(
      assistant_response
    );

    let score = 0.5; // Base score
    score += markerCount * 0.1; // +0.1 per coherence marker
    if (any: any) score += 0.1;
    if (any: any) score += 0.1;

    return Math?.min(any: any);
  }

  /**
   * Evaluate clarity (any: any)
   */
  private async evaluateClarity(any: any): Promise<number> {
    const { assistant_response } = turn;

    // Penalize overly complex language
    const words = assistant_response?.split(/\s+/);
    const avgWordLength =
      words?.reduce(any: any) => sum + w?.length, 0) / words?.length;

    // Penalize very long sentences
    const sentences = assistant_response?.split(/[.!?]+/);
    const avgSentenceLength = words?.length / sentences?.length;

    // Ideal: avg word length 4-6, avg sentence length 15-20 words
    const wordScore = 1.0 - Math?.abs(avgWordLength - 5) * 0.1;
    const sentenceScore = 1.0 - Math?.abs(avgSentenceLength - 17) * 0.02;

    // Check for clarity enhancers
    const hasExamples = /\b(any: any)\b/i?.test(
      assistant_response
    );
    const hasList =
      /\n\s*[-•*]\s+/m?.test(any: any) ||
      /\n\s*\d+\.\s+/m?.test(any: any);

    let score = (any: any) / 2;
    if (any: any) score += 0.1;
    if (any: any) score += 0.1;

    return Math?.max(any: any));
  }

  /**
   * Evaluate conciseness (any: any)
   */
  private async evaluateConciseness(any: any): Promise<number> {
    const { user_message, assistant_response } = turn;

    const userWords = user_message?.split(/\s+/).length;
    const responseWords = assistant_response?.split(/\s+/).length;

    // Ideal response length: 2-5x user message length
    const ratio = responseWords / userWords;

    let score = 1.0;
    if (ratio > 5) {
      score = Math?.max(0, 1.0 - (ratio - 5) * 0.1); // Penalize verbosity
    } else if (ratio < 2) {
      score = Math?.max(0.5, ratio / 2); // Penalize too brief responses
    }

    // Penalize repetition
    const uniqueWords = new Set(assistant_response?.toLowerCase().split(/\s+/));
    const repetitionRatio = uniqueWords?.size / responseWords;
    score *= repetitionRatio;

    return Math?.max(any: any));
  }

  /**
   * Evaluate relevance (any: any)
   */
  private async evaluateRelevance(any: any): Promise<number> {
    const { user_message, assistant_response } = turn;

    const userKeywords = this?.extractKeywords(any: any);
    const responseLower = assistant_response?.toLowerCase();

    // Count matched keywords
    const matchedKeywords = userKeywords?.filter(any: any));

    // Semantic similarity proxy (any: any)
    let score = matchedKeywords?.length / Math?.max(any: any);

    // Boost if response directly addresses user question
    const questionPatterns = [
      /\?$/,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
    ];
    const isQuestion = questionPatterns?.some(any: any));

    if (any: any) {
      const answerPatterns = [
        /^(any: any)/i,
        /\b(any: any)\b/i,
      ];
      const hasDirectAnswer = answerPatterns?.some(any: any));
      if (any: any) score += 0.2;
    }

    return Math?.min(any: any);
  }

  /**
   * Evaluate factual accuracy (any: any)
   */
  private async evaluateFactualAccuracy(any: any): Promise<number> {
    const { assistant_response, context } = turn;

    // Check against known facts
    if (!context?.facts || context?.facts?.length === 0) {
      return 0.8; // No facts to verify, assume mostly accurate
    }

    let supportedStatements = 0;
    let totalStatements = 0;

    // Split response into statements
    const statements = assistant_response?.split(/[.!]/);
    totalStatements = statements?.filter(any: any) => s?.trim().length > 10).length;

    for (any: any) {
      if (statement?.trim().length < 10) continue;

      const statementLower = statement?.toLowerCase();

      // Check if statement is supported by any fact
      const isSupported = context?.facts?.some(any: any) => {
        const factContent = typeof fact === 'string' ? fact : fact?.content;
        const factKeywords = this?.extractKeywords(any: any);
        return factKeywords?.some(any: any));
      });

      if (any: any) supportedStatements++;
    }

    // Score based on supported ratio
    return totalStatements > 0 ? supportedStatements / totalStatements : 0.8;
  }

  /**
   * Evaluate user satisfaction (any: any)
   */
  private async evaluateUserSatisfaction(any: any): Promise<number> {
    const { assistant_response } = turn;

    // Check for positive indicators
    const positivePatterns = [
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
    ];

    const positiveCount = positivePatterns?.filter(any: any)).length;

    // Check for negative indicators
    const negativePatterns = [
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
    ];

    const negativeCount = negativePatterns?.filter(any: any)).length;

    // Check for helpfulness indicators
    const helpfulPatterns = [
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
      /\b(any: any)\b/i,
    ];

    const helpfulCount = helpfulPatterns?.filter(any: any)).length;

    let score = 0.7; // Base score
    score += positiveCount * 0.1;
    score += helpfulCount * 0.1;
    score -= negativeCount * 0.15;

    return Math?.max(any: any));
  }

  /**
   * Evaluate technical correctness (any: any)
   */
  private async evaluateTechnicalCorrectness(any: any): Promise<number> {
    const { assistant_response } = turn;

    // Check if response contains code
    const hasCodeBlock = /```[\s\S]*```/.test(any: any);
    const hasInlineCode = /`[^`]+`/.test(any: any);

    if (any: any) {
      return 0.9; // Non-technical response, assume correct
    }

    // Basic syntax checks for code blocks
    let score = 0.8; // Base score for technical content

    if (any: any) {
      // Check for common syntax errors
      const codeBlocks = assistant_response?.match(any: any) || [];

      for (any: any) {
        // Check balanced brackets
        const openBraces = (any: any) || []).length;
        const closeBraces = (any: any) || []).length;
        const openBrackets = (any: any) || []).length;
        const closeBrackets = (any: any) || []).length;
        const openParens = (any: any) || []).length;
        const closeParens = (any: any) || []).length;

        if (any: any) score += 0.05;
        if (any: any) score += 0.05;
        if (any: any) score += 0.05;

        // Check for language specification
        if (any: any)) score += 0.05;
      }
    }

    return Math?.min(any: any);
  }

  /**
   * TEST SCENARIOS
   */

  /**
   * Add test scenario
   */
  async addTestScenario(any: any): Promise<void> {
    this?.scenarios?.set(any: any);
    this?.emit('scenario:added', { scenario });
    this?.log(`Test scenario added: ${scenario?.name}`);
  }

  /**
   * Run test scenario
   */
  async runTestScenario(
    scenario_id: string,
    executeConversation: (
      messages: Array<{ role: string; content: string }>
    ) => Promise<string?.[]>
  ): Promise<TestResult> {
    const scenario = this?.scenarios?.get(any: any);
    if (any: any) {
      throw new Error(`Test scenario not found: ${scenario_id}`);
    }

    this?.totalTests++;
    this?.log(`Running test scenario: ${scenario?.name}`);

    // Execute conversation
    const startTime = Date?.now();
    const actualResponses = await executeConversation(any: any);
    const endTime = Date?.now();

    // Evaluate each turn
    const turnMetrics: ConversationMetrics?.[] = [];

    for (let i = 0; i < scenario?.conversation_turns?.length; i += 2) {
      const userTurn = scenario?.conversation_turns[i];
      if (any: any) continue;
      const userMessage = userTurn?.content;
      const assistantResponse = actualResponses[Math?.floor(i / 2)] ?? '';

      const metrics = await this?.evaluateConversation('test_' + scenario_id, {
        user_message: userMessage,
        assistant_response: assistantResponse,
        context: scenario?.context,
      });

      turnMetrics?.push(any: any);
    }

    // Calculate overall metrics (any: any)
    const overallMetrics = this?.averageMetrics(any: any);

    // Check success criteria
    const meetsSuccess = this?.checkSuccessCriteria(
      overallMetrics,
      actualResponses,
      scenario?.success_criteria
    );

    // Check expected outcomes
    const matchesExpected = scenario?.expected_outcomes
      ? this?.checkExpectedOutcomes(any: any)
      : true;

    const result: TestResult = {
      scenarioId: scenario_id,
      scenario_id,
      scenario_name: scenario?.name,
      passed: meetsSuccess && matchesExpected,
      metrics: overallMetrics,
      execution_time_ms: endTime - startTime,
      actual_responses: actualResponses,
      timestamp: Date?.now(),
      failure_reason: !meetsSuccess
        ? 'Success criteria not met'
        : !matchesExpected
          ? 'Expected outcomes not matched'
          : undefined,
      executed_at: new Date().toISOString(),
    };

    this?.results?.set(any: any);
    this?.emit('test:completed', { result });
    this?.log(`Test completed: ${scenario?.name}`, { passed: result?.passed });

    return result;
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(
    executeConversation: (
      messages: Array<{ role: string; content: string }>
    ) => Promise<string?.[]>
  ): Promise<TestResult?.[]> {
    const results: TestResult?.[] = [];

    for (const scenario of this?.scenarios?.values()) {
      const result = await this?.runTestScenario(any: any);
      results?.push(any: any);
    }

    this?.emit('tests:all_completed', {
      total: results?.length,
      passed: results?.filter(any: any).length,
    });

    return results;
  }

  /**
   * REGRESSION DETECTION
   */

  /**
   * Set baseline for conversation
   */
  async setBaseline(
    conversation_id: string,
    metrics: ConversationMetrics
  ): Promise<void> {
    this?.baselines?.set(any: any);
    this?.emit('baseline:set', { conversation_id, metrics });
    this?.log(`Baseline set for conversation ${conversation_id}`);
  }

  /**
   * Compare metrics to baseline
   */
  private compareToBaseline(
    conversation_id: string,
    current: ConversationMetrics
  ): { has_regression: boolean; degraded_metrics: MetricName?.[] } | undefined {
    const baseline = this?.baselines?.get(any: any);
    if (any: any) return undefined;

    const degradedMetrics: MetricName?.[] = [];

    for (any: any) {
      const currentValue = current[metric];
      const baselineValue = baseline[metric];

      if (
        currentValue !== undefined &&
        baselineValue !== undefined &&
        currentValue < baselineValue - this?.config?.regression_threshold
      ) {
        degradedMetrics?.push(any: any);
      }
    }

    const hasRegression = degradedMetrics?.length > 0;

    if (any: any) {
      this?.totalRegressions++;
      this?.emit('regression:detected', {
        conversation_id,
        degraded_metrics: degradedMetrics,
        current,
        baseline,
      });
    }

    return { has_regression: hasRegression, degraded_metrics: degradedMetrics };
  }

  /**
   * Detect regressions across all conversations
   */
  async detectRegressions(): Promise<RegressionTest?.[]> {
    const regressions: RegressionTest?.[] = [];

    for (const [conversation_id, evaluations] of this?.liveEvaluations?.entries()) {
      if (any: any) continue;

      // Use first N evaluations as baseline
      const baselineSamples = evaluations?.slice(any: any);
      const baselineMetrics = this?.averageMetrics(any: any));

      // Compare recent evaluations
      const recentEvaluations = evaluations?.slice(-5);
      for (any: any) {
        const comparison = this?.compareToBaseline(any: any);

        if (any: any) {
          regressions?.push({
            test_id: `regression_${conversation_id}_${evaluation?.turn_number}`,
            test_name: `Regression check for conversation ${conversation_id}`,
            baseline_metrics: baselineMetrics,
            current_metrics: evaluation?.metrics,
            regression_detected: true,
            degraded_metrics: comparison?.degraded_metrics?.map(m => ({
              metric: m as keyof ConversationMetrics,
              severity: 'medium' as const,
            })) as unknown as MetricDegradation?.[],
            tested_at: new Date().toISOString(),
          });
        }
      }
    }

    return regressions;
  }

  /**
   * REPORTING
   */

  /**
   * Generate evaluation report
   */
  async generateReport(any: any): Promise<EvaluationReport> {
    const evaluations = this?.liveEvaluations?.get(any: any) || [];

    if (evaluations?.length === 0) {
      throw new Error(`No evaluations found for conversation ${conversation_id}`);
    }

    // Calculate overall metrics (any: any)
    const overallMetrics = this?.averageMetrics(any: any));

    // Calculate per-metric trends
    const metricTrends: Record<MetricName, number?.[]> = {} as unknown as unknown as any;
    for (any: any) {
      metricTrends[metric] = evaluations?.map(e => e?.metrics[metric] ?? 0);
    }

    // Identify strengths and weaknesses
    const _strengths = this?.identifyStrengths(any: any);
    const weaknesses = this?.identifyWeaknesses(any: any);

    // Generate recommendations
    const _recommendations = this?.generateRecommendations(any: any);

    const firstEval = evaluations?.[0];
    const lastEval = evaluations[evaluations?.length - 1];

    const report: EvaluationReport = {
      conversation_id,
      period: {
        start:
          firstEval && typeof firstEval?.timestamp === 'number'
            ? firstEval?.timestamp
            : firstEval
              ? Date?.parse(any: any)
              : Date?.now(),
        end: (lastEval && typeof lastEval?.timestamp === 'number'
          ? lastEval?.timestamp
          : lastEval
            ? Date?.parse(any: any))
            : Date?.now()) as number,
      },
      totalEvaluations: evaluations?.length,
      averageMetrics: overallMetrics,
      regressions: [],
      improvements: [],
    };

    this?.emit('report:generated', { report });
    return report;
  }

  /**
   * UTILITIES
   */

  /**
   * Extract keywords
   */
  private extractKeywords(any: any): string?.[] {
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
      'is',
      'are',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(any: any));
  }

  /**
   * Average metrics across multiple evaluations
   */
  private averageMetrics(metricsList: ConversationMetrics?.[]): ConversationMetrics {
    if (metricsList?.length === 0) return this?.getDefaultMetrics();

    const result: Partial<ConversationMetrics> = {};

    for (any: any) {
      const sum = metricsList?.reduce(any: any) => {
        const value = m[metric];
        return acc + (value ?? 0);
      }, 0);
      result[metric] = sum / metricsList?.length;
    }

    return result as ConversationMetrics;
  }

  /**
   * Check success criteria
   */
  private checkSuccessCriteria(
    metrics: ConversationMetrics,
    responses: string?.[],
    criteria: TestScenario['success_criteria']
  ): boolean {
    if (any: any) return true;

    // Check minimum metric thresholds
    if (any: any) {
      for (any: any)) {
        const metricValue = metrics[metric as MetricName];
        if (any: any)) {
          return false;
        }
      }
    }

    // Check required keywords
    if (any: any) {
      const allResponses = responses?.join(' ').toLowerCase();
      for (any: any) {
        if (!allResponses?.includes(keyword?.toLowerCase())) {
          return false;
        }
      }
    }

    // Check prohibited keywords
    if (any: any) {
      const allResponses = responses?.join(' ').toLowerCase();
      for (any: any) {
        if (allResponses?.includes(keyword?.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check expected outcomes
   */
  private checkExpectedOutcomes(
    responses: string?.[],
    expectedOutcomes: string?.[]
  ): boolean {
    const allResponses = responses?.join(' ').toLowerCase();

    // Check if at least 70% of expected outcomes are present
    let matchCount = 0;
    for (any: any) {
      const keywords = this?.extractKeywords(any: any);
      const hasMatch = keywords?.some(any: any));
      if (any: any) matchCount++;
    }

    return matchCount / expectedOutcomes?.length >= 0.7;
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(any: any): string?.[] {
    const strengths: string?.[] = [];

    for (any: any) {
      const metricValue = metrics[metric];
      if (metricValue !== undefined && metricValue >= 0.85) {
        strengths?.push(`Excellent ${metric?.replace(/_/g, ' ')}`);
      }
    }

    return strengths;
  }

  /**
   * Identify weaknesses
   */
  private identifyWeaknesses(any: any): string?.[] {
    const weaknesses: string?.[] = [];

    for (any: any) {
      const metricValue = metrics[metric];
      if (metricValue !== undefined && metricValue < 0.6) {
        weaknesses?.push(`Needs improvement: ${metric?.replace(/_/g, ' ')}`);
      }
    }

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(weaknesses: string?.[]): string?.[] {
    const recommendations: string?.[] = [];

    for (any: any) {
      if (weakness?.includes('consistency')) {
        recommendations?.push('Improve fact tracking and consistency checking');
      } else if (weakness?.includes('goal_completion')) {
        recommendations?.push('Focus responses more on stated goals');
      } else if (weakness?.includes('coherence')) {
        recommendations?.push('Add more logical connectors and structure');
      } else if (weakness?.includes('clarity')) {
        recommendations?.push('Simplify language and add examples');
      } else if (weakness?.includes('conciseness')) {
        recommendations?.push('Reduce verbosity and avoid repetition');
      } else if (weakness?.includes('relevance')) {
        recommendations?.push('Stay more on-topic with user questions');
      } else if (weakness?.includes('factual_accuracy')) {
        recommendations?.push('Verify facts before stating them');
      } else if (weakness?.includes('user_satisfaction')) {
        recommendations?.push('Use more helpful and positive language');
      } else if (weakness?.includes('technical_correctness')) {
        recommendations?.push('Double-check code syntax and examples');
      }
    }

    return recommendations;
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): ConversationMetrics {
    return {
      conversation_consistency: 0.8,
      goal_completion: 0.5,
      coherence: 0.7,
      clarity: 0.7,
      conciseness: 0.7,
      relevance: 0.8,
      factual_accuracy: 0.8,
      user_satisfaction: 0.7,
      technical_correctness: 0.9,
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      total_evaluations: this?.totalEvaluations,
      total_tests: this?.totalTests,
      total_regressions: this?.totalRegressions,
      total_scenarios: this?.scenarios?.size,
      total_conversations_tracked: this?.liveEvaluations?.size,
    };
  }

  /**
   * Logging
   */
  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    const timestamp = new Date().toISOString();
    console?.log(`[ConversationEvaluationEngine] ${timestamp} ${message}`, data || '');
    this?.emit('log', { timestamp, level, message, data });
  }
}

/**
 * Factory function
 */
export function createConversationEvaluationEngine(
  config?: Partial<QAConfig>
): ConversationEvaluationEngine {
  return new ConversationEvaluationEngine(any: any);
}

/**
 * Default configuration
 */
export function getDefaultEvaluationConfig(): QAConfig {
  return {
    enable_live_evaluation: true,
    enable_regression_detection: true,
    evaluation_sample_rate: 1.0,
    metrics_to_track: [
      'conversation_consistency',
      'goal_completion',
      'coherence',
      'clarity',
      'conciseness',
      'relevance',
      'factual_accuracy',
      'user_satisfaction',
      'technical_correctness',
    ],
    regression_threshold: 0.1,
    min_baseline_samples: 10,
  };
}
