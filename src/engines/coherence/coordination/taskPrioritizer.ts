/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TaskPrioritizer - Task prioritization for CoherenceEngine
 * Logic extracted from Nexus Engine coordination
 */

import type { Task, PrioritizedTasks, TaskType } from '../types';

/**
 * TaskPrioritizer - Intelligent task prioritization
 *
 * Features:
 * - Priority scoring based on type, deadline, dependencies
 * - Batch organization (immediate, high, normal, low, deferred)
 * - Deadline-aware scheduling
 * - Dependency resolution
 */
export class TaskPrioritizer {
  // Type weights for prioritization
  private readonly typeWeights: Record<TaskType, number> = {
    healing: 100, // Critical - system health
    conversation: 80, // High - user interaction
    analysis: 60, // Medium-high - cognitive processing
    memory: 50, // Medium - storage operations
    sync: 30, // Low - background sync
    cleanup: 10, // Lowest - maintenance
  };

  /**
   * Prioritize a list of tasks into batches
   */
  prioritize(tasks: Task[]): PrioritizedTasks {
    // Score all tasks
    const scoredTasks = tasks.map(task => ({
      task,
      score: this.calculateScore(task),
    }));

    // Sort by score descending
    scoredTasks.sort((a, b) => b.score - a.score);

    // Partition into priority buckets
    const result: PrioritizedTasks = {
      immediate: [],
      high: [],
      normal: [],
      low: [],
      deferred: [],
    };

    for (const { task, score } of scoredTasks) {
      if (score >= 150) {
        result.immediate.push(task);
      } else if (score >= 100) {
        result.high.push(task);
      } else if (score >= 50) {
        result.normal.push(task);
      } else if (score >= 20) {
        result.low.push(task);
      } else {
        result.deferred.push(task);
      }
    }

    return result;
  }

  /**
   * Calculate priority score for a task
   */
  private calculateScore(task: Task): number {
    let score = 0;

    // 1. Base priority
    score += task.priority * 10;

    // 2. Type weight
    score += this.typeWeights[task.type] ?? 40;

    // 3. Deadline urgency
    if (task.deadline) {
      const timeUntilDeadline = task.deadline - Date.now();
      if (timeUntilDeadline < 0) {
        // Overdue - maximum urgency
        score += 100;
      } else if (timeUntilDeadline < 1000) {
        // Less than 1 second
        score += 80;
      } else if (timeUntilDeadline < 5000) {
        // Less than 5 seconds
        score += 50;
      } else if (timeUntilDeadline < 30000) {
        // Less than 30 seconds
        score += 20;
      }
    }

    // 4. Age bonus (older tasks get slight priority)
    const age = Date.now() - task.createdAt;
    if (age > 60000) {
      // Older than 1 minute
      score += 10;
    } else if (age > 30000) {
      // Older than 30 seconds
      score += 5;
    }

    // 5. No dependencies bonus
    if (!task.dependencies || task.dependencies.length === 0) {
      score += 15;
    }

    return score;
  }

  /**
   * Get next executable tasks (respecting dependencies)
   */
  getExecutableTasks(tasks: Task[], completedIds: Set<string>): Task[] {
    return tasks.filter(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return true;
      }
      return task.dependencies.every(dep => completedIds.has(dep));
    });
  }

  /**
   * Estimate batch execution time
   */
  estimateExecutionTime(prioritized: PrioritizedTasks): number {
    const avgTimeMs: Record<TaskType, number> = {
      healing: 500,
      conversation: 2000,
      analysis: 1000,
      memory: 100,
      sync: 500,
      cleanup: 200,
    };

    let total = 0;
    const allTasks = [
      ...prioritized.immediate,
      ...prioritized.high,
      ...prioritized.normal,
      ...prioritized.low,
      ...prioritized.deferred,
    ];

    for (const task of allTasks) {
      total += avgTimeMs[task.type] ?? 500;
    }

    return total;
  }
}
