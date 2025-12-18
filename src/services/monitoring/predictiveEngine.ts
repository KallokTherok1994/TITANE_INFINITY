/**
 * TITANE∞ - Predictive Error Intelligence Engine
 *
 * Analyse prédictive des patterns d'erreurs avec machine learning-like heuristics
 * Corrélation multi-dimensionnelle et prédiction de pannes
 */

import { createLogger } from '@/utils/logger';
import type { ConsoleLogEntry, ErrorCategory } from './consoleMonitor';

const logger = createLogger('[PREDICTIVE-ENGINE]');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ErrorCorrelation {
  pattern: string;
  category: ErrorCategory;
  frequency: number;
  lastOccurrence: number;
  relatedErrors: string[];
  predictedImpact: 'low' | 'medium' | 'high' | 'critical';
  timeToFailure?: number; // Milliseconds until predicted system failure
}

export interface SystemHealthPrediction {
  overallHealth: number; // 0-100
  criticalityScore: number; // 0-100
  timeToFailure: number | null; // null = stable
  riskFactors: Array<{
    factor: string;
    weight: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  recommendations: string[];
}

export interface ErrorPattern {
  sequence: ErrorCategory[];
  frequency: number;
  leadsToCrash: boolean;
  averageTimespan: number; // Milliseconds between errors in pattern
}

// ═══════════════════════════════════════════════════════════════
// PREDICTIVE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

class PredictiveErrorEngine {
  private errorHistory: Array<{
    category: ErrorCategory;
    timestamp: number;
    message: string;
  }> = [];

  private correlationMap = new Map<string, ErrorCorrelation>();
  private patternSequences: ErrorPattern[] = [];

  private readonly MAX_HISTORY = 10000;
  private readonly PATTERN_WINDOW = 300000; // 5 minutes
  private readonly CRITICAL_ERROR_RATE = 20; // errors per minute

  /**
   * Record error for analysis
   */
  recordError(entry: ConsoleLogEntry, category: ErrorCategory): void {
    this.errorHistory.push({
      category,
      timestamp: entry.timestamp,
      message: entry.message.substring(0, 100),
    });

    // Maintain history size
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory.shift();
    }

    // Update correlations
    this.updateCorrelations(entry.message, category);

    // Detect patterns
    this.detectPatterns();
  }

  /**
   * Update error correlations
   */
  private updateCorrelations(message: string, category: ErrorCategory): void {
    const key = message.substring(0, 50);
    const existing = this.correlationMap.get(key);

    if (existing) {
      existing.frequency++;
      existing.lastOccurrence = Date.now();
    } else {
      this.correlationMap.set(key, {
        pattern: key,
        category,
        frequency: 1,
        lastOccurrence: Date.now(),
        relatedErrors: [],
        predictedImpact: this.calculatePredictedImpact(category, 1),
      });
    }

    // Find related errors (occurred within 10 seconds)
    const recentWindow = Date.now() - 10000;
    const recentErrors = this.errorHistory
      .filter(e => e.timestamp > recentWindow && e.message !== message)
      .map(e => e.message.substring(0, 50));

    if (existing && recentErrors.length > 0) {
      existing.relatedErrors = [
        ...new Set([...existing.relatedErrors, ...recentErrors]),
      ].slice(0, 10);
    }
  }

  /**
   * Calculate predicted impact based on category and frequency
   */
  private calculatePredictedImpact(
    category: ErrorCategory,
    frequency: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const categoryWeights: Record<ErrorCategory, number> = {
      memory: 4,
      security: 5,
      runtime: 4,
      network: 2,
      performance: 2,
      ui: 1,
      data: 2,
      unknown: 1,
    };

    const weight = categoryWeights[category] ?? 1;
    const score = weight * Math.log(frequency + 1);

    if (score > 8) return 'critical';
    if (score > 5) return 'high';
    if (score > 2) return 'medium';
    return 'low';
  }

  /**
   * Detect recurring error patterns
   */
  private detectPatterns(): void {
    const now = Date.now();
    const recentErrors = this.errorHistory.filter(
      e => e.timestamp > now - this.PATTERN_WINDOW
    );

    if (recentErrors.length < 3) return;

    // Sliding window pattern detection
    const windowSize = 3;
    for (let i = 0; i <= recentErrors.length - windowSize; i++) {
      const sequence = recentErrors.slice(i, i + windowSize).map(e => e.category);
      const sequenceKey = sequence.join('→');

      // Check if pattern exists
      const existingPattern = this.patternSequences.find(
        p => p.sequence.join('→') === sequenceKey
      );

      if (existingPattern) {
        existingPattern.frequency++;

        // Calculate average timespan
        const firstError = recentErrors[i];
        const lastError = recentErrors[i + windowSize - 1];
        if (!firstError || !lastError) continue;
        const timespan = lastError.timestamp - firstError.timestamp;
        existingPattern.averageTimespan =
          (existingPattern.averageTimespan * (existingPattern.frequency - 1) + timespan) /
          existingPattern.frequency;
      } else if (this.isSignificantPattern(sequence)) {
        const firstError = recentErrors[i];
        const lastError = recentErrors[i + windowSize - 1];
        if (!firstError || !lastError) continue;
        this.patternSequences.push({
          sequence,
          frequency: 1,
          leadsToCrash: this.predictsCrash(sequence),
          averageTimespan: lastError.timestamp - firstError.timestamp,
        });
      }
    }

    // Cleanup old patterns
    this.patternSequences = this.patternSequences
      .filter(p => p.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50);
  }

  /**
   * Check if pattern is significant
   */
  private isSignificantPattern(sequence: ErrorCategory[]): boolean {
    // Patterns with critical categories are always significant
    const hasCritical = sequence.some(
      c => c === 'memory' || c === 'security' || c === 'runtime'
    );
    if (hasCritical) return true;

    // Same category repeated is significant
    const firstCategory = sequence[0];
    if (!firstCategory) return false;
    const allSame = sequence.every(c => c === firstCategory);
    return allSame;
  }

  /**
   * Predict if pattern leads to crash
   */
  private predictsCrash(sequence: ErrorCategory[]): boolean {
    const crashPatterns: ErrorCategory[][] = [
      ['memory', 'memory', 'memory'],
      ['runtime', 'memory', 'runtime'],
      ['network', 'runtime', 'memory'],
      ['security', 'runtime', 'runtime'],
    ];

    const sequenceStr = sequence.join('→');
    return crashPatterns.some(p => p.join('→') === sequenceStr);
  }

  /**
   * Predict system health with ML-like heuristics
   */
  predictSystemHealth(): SystemHealthPrediction {
    const now = Date.now();
    const last1min = this.errorHistory.filter(e => e.timestamp > now - 60000);
    const last5min = this.errorHistory.filter(e => e.timestamp > now - 300000);
    const last15min = this.errorHistory.filter(e => e.timestamp > now - 900000);

    // Calculate error rates
    const errorRate1min = last1min.length;
    const errorRate5min = last5min.length / 5;
    const errorRate15min = last15min.length / 15;

    // Calculate category distribution
    const categoryCount: Record<ErrorCategory, number> = {
      network: 0,
      memory: 0,
      runtime: 0,
      security: 0,
      performance: 0,
      ui: 0,
      data: 0,
      unknown: 0,
    };

    last5min.forEach(e => categoryCount[e.category]++);

    // Calculate health score (0-100)
    let healthScore = 100;

    // Deduct for error rate
    healthScore -= Math.min(errorRate1min * 2, 40);
    healthScore -= Math.min(categoryCount.memory * 5, 20);
    healthScore -= Math.min(categoryCount.security * 4, 20);
    healthScore -= Math.min(categoryCount.runtime * 3, 15);

    // Calculate criticality score
    const criticalityScore = Math.min(
      (categoryCount.memory * 10 +
        categoryCount.security * 8 +
        categoryCount.runtime * 6 +
        errorRate1min * 2) /
        2,
      100
    );

    // Predict time to failure
    let timeToFailure: number | null = null;
    if (errorRate1min >= this.CRITICAL_ERROR_RATE) {
      // Critical error rate - predict failure in next 5 minutes
      timeToFailure = 300000;
    } else if (errorRate5min > errorRate15min * 1.5) {
      // Accelerating error rate - predict failure based on trend
      const acceleration = errorRate5min / Math.max(errorRate15min, 0.1);
      timeToFailure = Math.max(600000 / acceleration, 60000);
    }

    // Identify risk factors
    const riskFactors: SystemHealthPrediction['riskFactors'] = [];

    if (categoryCount.memory > 5) {
      riskFactors.push({
        factor: 'Memory errors increasing',
        weight: 0.8,
        trend: this.getTrend(last1min, last5min, 'memory'),
      });
    }

    if (categoryCount.security > 0) {
      riskFactors.push({
        factor: 'Security vulnerabilities detected',
        weight: 1.0,
        trend: 'increasing',
      });
    }

    if (errorRate1min > errorRate5min * 1.5) {
      riskFactors.push({
        factor: 'Error rate accelerating',
        weight: 0.9,
        trend: 'increasing',
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (categoryCount.memory > 3) {
      recommendations.push('Clear memory cache and restart heavy components');
    }

    if (categoryCount.network > 10) {
      recommendations.push('Check network connectivity and API endpoints');
    }

    if (this.patternSequences.some(p => p.leadsToCrash)) {
      recommendations.push(
        'Critical error pattern detected - immediate intervention required'
      );
    }

    if (healthScore < 50) {
      recommendations.push('System health critical - consider full restart');
    }

    return {
      overallHealth: Math.max(healthScore, 0),
      criticalityScore: Math.min(criticalityScore, 100),
      timeToFailure,
      riskFactors,
      recommendations,
    };
  }

  /**
   * Get trend for specific category
   */
  private getTrend(
    recent: Array<{ category: ErrorCategory }>,
    older: Array<{ category: ErrorCategory }>,
    category: ErrorCategory
  ): 'increasing' | 'stable' | 'decreasing' {
    const recentCount = recent.filter(e => e.category === category).length;
    const olderAvg = older.filter(e => e.category === category).length / 5;

    if (recentCount > olderAvg * 1.5) return 'increasing';
    if (recentCount < olderAvg * 0.5) return 'decreasing';
    return 'stable';
  }

  /**
   * Get top correlations
   */
  getTopCorrelations(limit = 10): ErrorCorrelation[] {
    return Array.from(this.correlationMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Get detected patterns
   */
  getPatterns(): ErrorPattern[] {
    return [...this.patternSequences];
  }

  /**
   * Clear old data (cleanup)
   */
  cleanup(): void {
    const cutoff = Date.now() - 3600000; // 1 hour
    this.errorHistory = this.errorHistory.filter(e => e.timestamp > cutoff);

    // Cleanup correlations
    for (const [key, corr] of this.correlationMap.entries()) {
      if (corr.lastOccurrence < cutoff) {
        this.correlationMap.delete(key);
      }
    }

    logger.info('Predictive engine cleanup completed', {
      component: 'PredictiveEngine',
      historySize: this.errorHistory.length,
      correlations: this.correlationMap.size,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════

export const predictiveEngine = new PredictiveErrorEngine();

// Cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => predictiveEngine.cleanup(), 3600000);
}
