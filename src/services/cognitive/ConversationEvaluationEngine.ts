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
    required_keywords?: string[];
    prohibited_keywords?: string[];
  };
  expected_outcomes?: string[];
  tags?: string[];
}

interface TestResult {
  scenarioId: string;
  scenario_id?: string;
  scenario_name?: string;
  passed: boolean;
  metrics: ConversationMetrics;
  execution_time_ms?: number;
  actual_responses?: string[];
  failure_reason?: string;
  executed_at?: string;
  errors?: string[];
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
  regressions: RegressionTest[];
  improvements: string[];
}

interface RegressionTest {
  test_id?: string;
  test_name?: string;
  baseline_metrics?: ConversationMetrics;
  current_metrics?: ConversationMetrics;
  regression_detected?: boolean;
  degraded_metrics?: MetricDegradation[];
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
  metrics_to_track: string[];
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
  private liveEvaluations: Map<string, LiveEvaluation[]> = new Map();
  private baselines: Map<string, ConversationMetrics> = new Map();

  // Statistics
  private totalEvaluations = 0;
  private totalTests = 0;
  private totalRegressions = 0;

  constructor(config?: Partial<QAConfig>) {
    super();

    this.config = {
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

    this.log('ConversationEvaluationEngine initialized', this.config);
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
        facts?: string[];
        previous_messages?: Array<{ role: string; content: string }>;
      };
    }
  ): Promise<ConversationMetrics> {
    this.totalEvaluations++;

    // Sample based on rate
    if (Math.random() > this.config.evaluation_sample_rate) {
      return this.getDefaultMetrics();
    }

    const metrics: ConversationMetrics = {
      conversation_consistency: await this.evaluateConsistency(turn),
      goal_completion: await this.evaluateGoalCompletion(turn),
      coherence: await this.evaluateCoherence(turn),
      clarity: await this.evaluateClarity(turn),
      conciseness: await this.evaluateConciseness(turn),
      relevance: await this.evaluateRelevance(turn),
      factual_accuracy: await this.evaluateFactualAccuracy(turn),
      user_satisfaction: await this.evaluateUserSatisfaction(turn),
      technical_correctness: await this.evaluateTechnicalCorrectness(turn),
    };

    // Store live evaluation
    if (this.config.enable_live_evaluation) {
      const evaluation: LiveEvaluation = {
        messageId: `msg_${conversation_id}_${Date.now()}`,
        turn_number: Number((this.liveEvaluations.get(conversation_id)?.length || 0) + 1),
        metrics,
        timestamp: new Date().toISOString(),
      };

      const existing = this.liveEvaluations.get(conversation_id) || [];
      existing.push(evaluation);
      this.liveEvaluations.set(conversation_id, existing);

      this.emit('evaluation:completed', { conversation_id, evaluation });
    }

    this.log(`Evaluated conversation ${conversation_id}`, metrics);
    return metrics;
  }

  /**
   * Evaluate consistency (alignment with facts and previous statements)
   */
  private async evaluateConsistency(turn: any): Promise<number> {
    const { assistant_response, context } = turn;

    if (!context?.facts || context.facts.length === 0) {
      return 1.0; // No facts to check against
    }

    let contradictions = 0;
    const responseLower = assistant_response.toLowerCase();

    for (const fact of context.facts) {
      const factLower = fact.toLowerCase();
      const factKeywords = this.extractKeywords(factLower);

      // Check for keyword presence and negation
      const hasKeywords = factKeywords.some(kw => responseLower.includes(kw));
      const hasNegation = /\b(not|no|never|can't|won't|impossible)\b/i.test(
        assistant_response
      );

      if (hasKeywords && hasNegation) {
        contradictions++;
      }
    }

    return Math.max(0, 1.0 - contradictions / context.facts.length);
  }

  /**
   * Evaluate goal completion (progress towards stated goal)
   */
  private async evaluateGoalCompletion(turn: any): Promise<number> {
    const { assistant_response, context } = turn;

    if (!context?.goal) {
      return 0.5; // No goal defined, neutral score
    }

    const goalKeywords = this.extractKeywords(context.goal);
    const responseLower = assistant_response.toLowerCase();

    // Count goal-related keywords in response
    const matchedKeywords = goalKeywords.filter(kw => responseLower.includes(kw));

    // Check for completion indicators
    const completionPatterns = [
      /done|completed|finished|achieved|accomplished/i,
      /terminé|accompli|fini|réalisé/i,
    ];
    const hasCompletionIndicator = completionPatterns.some(p =>
      p.test(assistant_response)
    );

    let score = matchedKeywords.length / Math.max(1, goalKeywords.length);
    if (hasCompletionIndicator) score = Math.min(1.0, score + 0.2);

    return score;
  }

  /**
   * Evaluate coherence (logical flow and structure)
   */
  private async evaluateCoherence(turn: any): Promise<number> {
    const { assistant_response } = turn;

    // Check for coherence markers
    const coherenceMarkers = [
      /\b(therefore|thus|hence|consequently|as a result)\b/i,
      /\b(first|second|third|finally|lastly)\b/i,
      /\b(however|although|despite|nevertheless)\b/i,
      /\b(because|since|due to|owing to)\b/i,
      /\b(donc|ainsi|par conséquent|en conséquence)\b/i,
      /\b(d'abord|ensuite|puis|enfin)\b/i,
      /\b(cependant|toutefois|néanmoins|malgré)\b/i,
      /\b(parce que|puisque|car|en raison de)\b/i,
    ];

    const markerCount = coherenceMarkers.filter(pattern =>
      pattern.test(assistant_response)
    ).length;

    // Check for logical structure
    const hasIntro = /^(Let me|I will|Je vais|Voici)/i.test(assistant_response.trim());
    const hasConclusion = /(In summary|To conclude|En résumé|Pour conclure)/i.test(
      assistant_response
    );

    let score = 0.5; // Base score
    score += markerCount * 0.1; // +0.1 per coherence marker
    if (hasIntro) score += 0.1;
    if (hasConclusion) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Evaluate clarity (easy to understand)
   */
  private async evaluateClarity(turn: any): Promise<number> {
    const { assistant_response } = turn;

    // Penalize overly complex language
    const words = assistant_response.split(/\s+/);
    const avgWordLength =
      words.reduce((sum: number, w: string) => sum + w.length, 0) / words.length;

    // Penalize very long sentences
    const sentences = assistant_response.split(/[.!?]+/);
    const avgSentenceLength = words.length / sentences.length;

    // Ideal: avg word length 4-6, avg sentence length 15-20 words
    const wordScore = 1.0 - Math.abs(avgWordLength - 5) * 0.1;
    const sentenceScore = 1.0 - Math.abs(avgSentenceLength - 17) * 0.02;

    // Check for clarity enhancers
    const hasExamples = /\b(for example|such as|like|e\.g\.|par exemple|comme)\b/i.test(
      assistant_response
    );
    const hasList =
      /\n\s*[-•*]\s+/m.test(assistant_response) ||
      /\n\s*\d+\.\s+/m.test(assistant_response);

    let score = (wordScore + sentenceScore) / 2;
    if (hasExamples) score += 0.1;
    if (hasList) score += 0.1;

    return Math.max(0, Math.min(1.0, score));
  }

  /**
   * Evaluate conciseness (not overly verbose)
   */
  private async evaluateConciseness(turn: any): Promise<number> {
    const { user_message, assistant_response } = turn;

    const userWords = user_message.split(/\s+/).length;
    const responseWords = assistant_response.split(/\s+/).length;

    // Ideal response length: 2-5x user message length
    const ratio = responseWords / userWords;

    let score = 1.0;
    if (ratio > 5) {
      score = Math.max(0, 1.0 - (ratio - 5) * 0.1); // Penalize verbosity
    } else if (ratio < 2) {
      score = Math.max(0.5, ratio / 2); // Penalize too brief responses
    }

    // Penalize repetition
    const uniqueWords = new Set(assistant_response.toLowerCase().split(/\s+/));
    const repetitionRatio = uniqueWords.size / responseWords;
    score *= repetitionRatio;

    return Math.max(0, Math.min(1.0, score));
  }

  /**
   * Evaluate relevance (on-topic)
   */
  private async evaluateRelevance(turn: any): Promise<number> {
    const { user_message, assistant_response } = turn;

    const userKeywords = this.extractKeywords(user_message);
    const responseLower = assistant_response.toLowerCase();

    // Count matched keywords
    const matchedKeywords = userKeywords.filter(kw => responseLower.includes(kw));

    // Semantic similarity proxy (simple keyword overlap)
    let score = matchedKeywords.length / Math.max(1, userKeywords.length);

    // Boost if response directly addresses user question
    const questionPatterns = [
      /\?$/,
      /\b(what|when|where|who|why|how)\b/i,
      /\b(quel|quand|où|qui|pourquoi|comment)\b/i,
    ];
    const isQuestion = questionPatterns.some(p => p.test(user_message));

    if (isQuestion) {
      const answerPatterns = [
        /^(Yes|No|It is|It's|The answer|C'est|La réponse)/i,
        /\b(because|since|due to|parce que|car)\b/i,
      ];
      const hasDirectAnswer = answerPatterns.some(p => p.test(assistant_response));
      if (hasDirectAnswer) score += 0.2;
    }

    return Math.min(1.0, score);
  }

  /**
   * Evaluate factual accuracy (verifiable correctness)
   */
  private async evaluateFactualAccuracy(turn: any): Promise<number> {
    const { assistant_response, context } = turn;

    // Check against known facts
    if (!context?.facts || context.facts.length === 0) {
      return 0.8; // No facts to verify, assume mostly accurate
    }

    let supportedStatements = 0;
    let totalStatements = 0;

    // Split response into statements
    const statements = assistant_response.split(/[.!]/);
    totalStatements = statements.filter((s: string) => s.trim().length > 10).length;

    for (const statement of statements) {
      if (statement.trim().length < 10) continue;

      const statementLower = statement.toLowerCase();

      // Check if statement is supported by any fact
      const isSupported = context.facts.some((fact: any) => {
        const factKeywords = this.extractKeywords(fact);
        return factKeywords.some(kw => statementLower.includes(kw));
      });

      if (isSupported) supportedStatements++;
    }

    // Score based on supported ratio
    return totalStatements > 0 ? supportedStatements / totalStatements : 0.8;
  }

  /**
   * Evaluate user satisfaction (positive sentiment, helpful tone)
   */
  private async evaluateUserSatisfaction(turn: any): Promise<number> {
    const { assistant_response } = turn;

    // Check for positive indicators
    const positivePatterns = [
      /\b(happy to|glad to|pleased to|heureux de|ravi de|content de)\b/i,
      /\b(help|assist|support|aider|assister|soutenir)\b/i,
      /\b(great|excellent|perfect|super|excellent|parfait)\b/i,
    ];

    const positiveCount = positivePatterns.filter(p => p.test(assistant_response)).length;

    // Check for negative indicators
    const negativePatterns = [
      /\b(unfortunately|sadly|regret|malheureusement|tristement)\b/i,
      /\b(can't|cannot|impossible|ne peux pas|impossible)\b/i,
      /\b(error|problem|issue|erreur|problème)\b/i,
    ];

    const negativeCount = negativePatterns.filter(p => p.test(assistant_response)).length;

    // Check for helpfulness indicators
    const helpfulPatterns = [
      /\b(Here is|Here's|Voici|Voilà)\b/i,
      /\b(You can|You should|Vous pouvez|Vous devriez)\b/i,
      /\b(Let me|I'll|Je vais|Je vais)\b/i,
    ];

    const helpfulCount = helpfulPatterns.filter(p => p.test(assistant_response)).length;

    let score = 0.7; // Base score
    score += positiveCount * 0.1;
    score += helpfulCount * 0.1;
    score -= negativeCount * 0.15;

    return Math.max(0, Math.min(1.0, score));
  }

  /**
   * Evaluate technical correctness (for code/technical content)
   */
  private async evaluateTechnicalCorrectness(turn: any): Promise<number> {
    const { assistant_response } = turn;

    // Check if response contains code
    const hasCodeBlock = /```[\s\S]*```/.test(assistant_response);
    const hasInlineCode = /`[^`]+`/.test(assistant_response);

    if (!hasCodeBlock && !hasInlineCode) {
      return 0.9; // Non-technical response, assume correct
    }

    // Basic syntax checks for code blocks
    let score = 0.8; // Base score for technical content

    if (hasCodeBlock) {
      // Check for common syntax errors
      const codeBlocks = assistant_response.match(/```[\s\S]*?```/g) || [];

      for (const block of codeBlocks) {
        // Check balanced brackets
        const openBraces = (block.match(/\{/g) || []).length;
        const closeBraces = (block.match(/\}/g) || []).length;
        const openBrackets = (block.match(/\[/g) || []).length;
        const closeBrackets = (block.match(/\]/g) || []).length;
        const openParens = (block.match(/\(/g) || []).length;
        const closeParens = (block.match(/\)/g) || []).length;

        if (openBraces === closeBraces) score += 0.05;
        if (openBrackets === closeBrackets) score += 0.05;
        if (openParens === closeParens) score += 0.05;

        // Check for language specification
        if (/```\w+/.test(block)) score += 0.05;
      }
    }

    return Math.min(1.0, score);
  }

  /**
   * TEST SCENARIOS
   */

  /**
   * Add test scenario
   */
  async addTestScenario(scenario: TestScenario): Promise<void> {
    this.scenarios.set(scenario.id, scenario);
    this.emit('scenario:added', { scenario });
    this.log(`Test scenario added: ${scenario.name}`);
  }

  /**
   * Run test scenario
   */
  async runTestScenario(
    scenario_id: string,
    executeConversation: (
      messages: Array<{ role: string; content: string }>
    ) => Promise<string[]>
  ): Promise<TestResult> {
    const scenario = this.scenarios.get(scenario_id);
    if (!scenario) {
      throw new Error(`Test scenario not found: ${scenario_id}`);
    }

    this.totalTests++;
    this.log(`Running test scenario: ${scenario.name}`);

    // Execute conversation
    const startTime = Date.now();
    const actualResponses = await executeConversation(scenario.conversation_turns);
    const endTime = Date.now();

    // Evaluate each turn
    const turnMetrics: ConversationMetrics[] = [];

    for (let i = 0; i < scenario.conversation_turns.length; i += 2) {
      const userMessage = scenario.conversation_turns[i].content;
      const assistantResponse = actualResponses[Math.floor(i / 2)] || '';

      const metrics = await this.evaluateConversation('test_' + scenario_id, {
        user_message: userMessage,
        assistant_response: assistantResponse,
        context: scenario.context,
      });

      turnMetrics.push(metrics);
    }

    // Calculate overall metrics (average across turns)
    const overallMetrics = this.averageMetrics(turnMetrics);

    // Check success criteria
    const meetsSuccess = this.checkSuccessCriteria(
      overallMetrics,
      actualResponses,
      scenario.success_criteria
    );

    // Check expected outcomes
    const matchesExpected = scenario.expected_outcomes
      ? this.checkExpectedOutcomes(actualResponses, scenario.expected_outcomes)
      : true;

    const result: TestResult = {
      scenarioId: scenario_id,
      scenario_id,
      scenario_name: scenario.name,
      passed: meetsSuccess && matchesExpected,
      metrics: overallMetrics,
      execution_time_ms: endTime - startTime,
      actual_responses: actualResponses,
      timestamp: Date.now(),
      failure_reason: !meetsSuccess
        ? 'Success criteria not met'
        : !matchesExpected
          ? 'Expected outcomes not matched'
          : undefined,
      executed_at: new Date().toISOString(),
    };

    this.results.set(scenario_id, result);
    this.emit('test:completed', { result });
    this.log(`Test completed: ${scenario.name}`, { passed: result.passed });

    return result;
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(
    executeConversation: (
      messages: Array<{ role: string; content: string }>
    ) => Promise<string[]>
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const scenario of this.scenarios.values()) {
      const result = await this.runTestScenario(scenario.id, executeConversation);
      results.push(result);
    }

    this.emit('tests:all_completed', {
      total: results.length,
      passed: results.filter(r => r.passed).length,
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
    this.baselines.set(conversation_id, metrics);
    this.emit('baseline:set', { conversation_id, metrics });
    this.log(`Baseline set for conversation ${conversation_id}`);
  }

  /**
   * Compare metrics to baseline
   */
  private compareToBaseline(
    conversation_id: string,
    current: ConversationMetrics
  ): { has_regression: boolean; degraded_metrics: MetricName[] } | undefined {
    const baseline = this.baselines.get(conversation_id);
    if (!baseline) return undefined;

    const degradedMetrics: MetricName[] = [];

    for (const metric of this.config.metrics_to_track) {
      const currentValue = current[metric];
      const baselineValue = baseline[metric];

      if (currentValue < baselineValue - this.config.regression_threshold) {
        degradedMetrics.push(metric);
      }
    }

    const hasRegression = degradedMetrics.length > 0;

    if (hasRegression) {
      this.totalRegressions++;
      this.emit('regression:detected', {
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
  async detectRegressions(): Promise<RegressionTest[]> {
    const regressions: RegressionTest[] = [];

    for (const [conversation_id, evaluations] of this.liveEvaluations.entries()) {
      if (evaluations.length < this.config.min_baseline_samples) continue;

      // Use first N evaluations as baseline
      const baselineSamples = evaluations.slice(0, this.config.min_baseline_samples);
      const baselineMetrics = this.averageMetrics(baselineSamples.map(e => e.metrics));

      // Compare recent evaluations
      const recentEvaluations = evaluations.slice(-5);
      for (const evaluation of recentEvaluations) {
        const comparison = this.compareToBaseline(conversation_id, evaluation.metrics);

        if (comparison?.has_regression) {
          regressions.push({
            test_id: `regression_${conversation_id}_${evaluation.turn_number}`,
            test_name: `Regression check for conversation ${conversation_id}`,
            baseline_metrics: baselineMetrics,
            current_metrics: evaluation.metrics,
            regression_detected: true,
            degraded_metrics: comparison.degraded_metrics.map(m => ({
              metric: m as keyof ConversationMetrics,
              severity: 'medium' as const,
            })) as unknown as MetricDegradation[],
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
  async generateReport(conversation_id: string): Promise<EvaluationReport> {
    const evaluations = this.liveEvaluations.get(conversation_id) || [];

    if (evaluations.length === 0) {
      throw new Error(`No evaluations found for conversation ${conversation_id}`);
    }

    // Calculate overall metrics (average)
    const overallMetrics = this.averageMetrics(evaluations.map(e => e.metrics));

    // Calculate per-metric trends
    const metricTrends: Record<MetricName, number[]> = {} as any;
    for (const metric of this.config.metrics_to_track) {
      metricTrends[metric] = evaluations.map(e => e.metrics[metric]);
    }

    // Identify strengths and weaknesses
    const _strengths = this.identifyStrengths(overallMetrics);
    const weaknesses = this.identifyWeaknesses(overallMetrics);

    // Generate recommendations
    const _recommendations = this.generateRecommendations(weaknesses);

    const report: EvaluationReport = {
      conversation_id,
      period: {
        start:
          typeof evaluations[0].timestamp === 'number'
            ? evaluations[0].timestamp
            : Date.parse(evaluations[0].timestamp),
        end: (typeof evaluations[evaluations.length - 1].timestamp === 'number'
          ? evaluations[evaluations.length - 1].timestamp
          : Date.parse(String(evaluations[evaluations.length - 1].timestamp))) as number,
      },
      totalEvaluations: evaluations.length,
      averageMetrics: overallMetrics,
      regressions: [],
      improvements: [],
    };

    this.emit('report:generated', { report });
    return report;
  }

  /**
   * UTILITIES
   */

  /**
   * Extract keywords
   */
  private extractKeywords(text: string): string[] {
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
      .filter(word => word.length > 2 && !stopwords.has(word));
  }

  /**
   * Average metrics across multiple evaluations
   */
  private averageMetrics(metricsList: ConversationMetrics[]): ConversationMetrics {
    if (metricsList.length === 0) return this.getDefaultMetrics();

    const result: any = {};

    for (const metric of this.config.metrics_to_track) {
      const sum = metricsList.reduce((acc, m) => acc + m[metric], 0);
      result[metric] = sum / metricsList.length;
    }

    return result;
  }

  /**
   * Check success criteria
   */
  private checkSuccessCriteria(
    metrics: ConversationMetrics,
    responses: string[],
    criteria: TestScenario['success_criteria']
  ): boolean {
    if (!criteria) return true;

    // Check minimum metric thresholds
    if (criteria.min_metrics) {
      for (const [metric, threshold] of Object.entries(criteria.min_metrics)) {
        if (metrics[metric as MetricName] < (threshold as number)) {
          return false;
        }
      }
    }

    // Check required keywords
    if (criteria.required_keywords) {
      const allResponses = responses.join(' ').toLowerCase();
      for (const keyword of criteria.required_keywords) {
        if (!allResponses.includes(keyword.toLowerCase())) {
          return false;
        }
      }
    }

    // Check prohibited keywords
    if (criteria.prohibited_keywords) {
      const allResponses = responses.join(' ').toLowerCase();
      for (const keyword of criteria.prohibited_keywords) {
        if (allResponses.includes(keyword.toLowerCase())) {
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
    responses: string[],
    expectedOutcomes: string[]
  ): boolean {
    const allResponses = responses.join(' ').toLowerCase();

    // Check if at least 70% of expected outcomes are present
    let matchCount = 0;
    for (const outcome of expectedOutcomes) {
      const keywords = this.extractKeywords(outcome);
      const hasMatch = keywords.some(kw => allResponses.includes(kw));
      if (hasMatch) matchCount++;
    }

    return matchCount / expectedOutcomes.length >= 0.7;
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(metrics: ConversationMetrics): string[] {
    const strengths: string[] = [];

    for (const metric of this.config.metrics_to_track) {
      if (metrics[metric] >= 0.85) {
        strengths.push(`Excellent ${metric.replace(/_/g, ' ')}`);
      }
    }

    return strengths;
  }

  /**
   * Identify weaknesses
   */
  private identifyWeaknesses(metrics: ConversationMetrics): string[] {
    const weaknesses: string[] = [];

    for (const metric of this.config.metrics_to_track) {
      if (metrics[metric] < 0.6) {
        weaknesses.push(`Needs improvement: ${metric.replace(/_/g, ' ')}`);
      }
    }

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(weaknesses: string[]): string[] {
    const recommendations: string[] = [];

    for (const weakness of weaknesses) {
      if (weakness.includes('consistency')) {
        recommendations.push('Improve fact tracking and consistency checking');
      } else if (weakness.includes('goal_completion')) {
        recommendations.push('Focus responses more on stated goals');
      } else if (weakness.includes('coherence')) {
        recommendations.push('Add more logical connectors and structure');
      } else if (weakness.includes('clarity')) {
        recommendations.push('Simplify language and add examples');
      } else if (weakness.includes('conciseness')) {
        recommendations.push('Reduce verbosity and avoid repetition');
      } else if (weakness.includes('relevance')) {
        recommendations.push('Stay more on-topic with user questions');
      } else if (weakness.includes('factual_accuracy')) {
        recommendations.push('Verify facts before stating them');
      } else if (weakness.includes('user_satisfaction')) {
        recommendations.push('Use more helpful and positive language');
      } else if (weakness.includes('technical_correctness')) {
        recommendations.push('Double-check code syntax and examples');
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
      total_evaluations: this.totalEvaluations,
      total_tests: this.totalTests,
      total_regressions: this.totalRegressions,
      total_scenarios: this.scenarios.size,
      total_conversations_tracked: this.liveEvaluations.size,
    };
  }

  /**
   * Logging
   */
  private log(
    message: string,
    data?: any,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    const timestamp = new Date().toISOString();
    console.log(`[ConversationEvaluationEngine] ${timestamp} ${message}`, data || '');
    this.emit('log', { timestamp, level, message, data });
  }
}

/**
 * Factory function
 */
export function createConversationEvaluationEngine(
  config?: Partial<QAConfig>
): ConversationEvaluationEngine {
  return new ConversationEvaluationEngine(config);
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
