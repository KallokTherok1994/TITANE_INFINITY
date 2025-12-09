/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LoadBalancer - Resource load balancing
 * Migrated from Harmonia equilibrium logic
 */

import type {
  LoadBalanceState,
  ProviderLoad,
  LoadRecommendation,
} from '../types';

/**
 * LoadBalancer - Balances load across providers
 *
 * Features:
 * - Load tracking per provider
 * - Capacity management
 * - Rebalancing recommendations
 * - Utilization optimization
 */
export class LoadBalancer {
  private providers: Map<string, ProviderLoad> = new Map();
  private readonly defaultCapacity = 100;
  private readonly targetUtilization = 0.7; // 70% target

  /**
   * Register a provider
   */
  registerProvider(id: string, capacity?: number): void {
    this.providers.set(id, {
      id,
      currentLoad: 0,
      capacity: capacity ?? this.defaultCapacity,
      utilization: 0,
    });
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  /**
   * Update load for a provider
   */
  updateLoad(id: string, load: number): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.currentLoad = load;
      provider.utilization = load / provider.capacity;
    }
  }

  /**
   * Increment load (e.g., new request)
   */
  incrementLoad(id: string, amount = 1): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.currentLoad += amount;
      provider.utilization = provider.currentLoad / provider.capacity;
    }
  }

  /**
   * Decrement load (e.g., request completed)
   */
  decrementLoad(id: string, amount = 1): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.currentLoad = Math.max(0, provider.currentLoad - amount);
      provider.utilization = provider.currentLoad / provider.capacity;
    }
  }

  /**
   * Get current load balance state
   */
  getState(): LoadBalanceState {
    const totalLoad = this.getTotalLoad();
    const avgLoad = this.providers.size > 0 ? totalLoad / this.providers.size : 0;
    const recommendations = this.generateRecommendations();

    return {
      providers: new Map(this.providers),
      totalLoad,
      avgLoad,
      balanced: this.isBalanced(),
      recommendations,
    };
  }

  /**
   * Get total load across all providers
   */
  getTotalLoad(): number {
    let total = 0;
    this.providers.forEach(p => {
      total += p.currentLoad;
    });
    return total;
  }

  /**
   * Check if system is balanced
   */
  isBalanced(): boolean {
    if (this.providers.size < 2) return true;

    const loads = Array.from(this.providers.values()).map(p => p.utilization);
    const avg = loads.reduce((a, b) => a + b, 0) / loads.length;

    // Consider balanced if all providers within 20% of average
    return loads.every(load => Math.abs(load - avg) < 0.2);
  }

  /**
   * Get the best provider for a new request
   */
  getBestProvider(): string | undefined {
    let bestId: string | undefined;
    let bestScore = -Infinity;

    this.providers.forEach((provider, id) => {
      // Score based on available capacity
      const availableCapacity = provider.capacity - provider.currentLoad;
      const score = availableCapacity / provider.capacity;

      if (score > bestScore && provider.utilization < 0.95) {
        bestScore = score;
        bestId = id;
      }
    });

    return bestId;
  }

  /**
   * Trigger rebalancing
   */
  async rebalance(): Promise<void> {
    console.log('[LoadBalancer] Rebalancing...');

    const recommendations = this.generateRecommendations();

    for (const rec of recommendations) {
      console.log(
        `[LoadBalancer] ${rec.providerId}: ${rec.action} to ${rec.targetLoad} (${rec.reason})`
      );
    }

    // In real implementation, this would redistribute load
  }

  /**
   * Generate rebalancing recommendations
   */
  private generateRecommendations(): LoadRecommendation[] {
    const recommendations: LoadRecommendation[] = [];
    const avgLoad = this.getTotalLoad() / Math.max(1, this.providers.size);

    this.providers.forEach((provider, id) => {
      const diff = provider.currentLoad - avgLoad;
      const threshold = avgLoad * 0.2; // 20% threshold

      if (diff > threshold) {
        recommendations.push({
          providerId: id,
          action: 'decrease',
          targetLoad: avgLoad,
          reason: `Utilization ${(provider.utilization * 100).toFixed(0)}% above target`,
        });
      } else if (diff < -threshold && provider.utilization < this.targetUtilization - 0.2) {
        recommendations.push({
          providerId: id,
          action: 'increase',
          targetLoad: avgLoad,
          reason: `Utilization ${(provider.utilization * 100).toFixed(0)}% below target`,
        });
      } else {
        recommendations.push({
          providerId: id,
          action: 'maintain',
          targetLoad: provider.currentLoad,
          reason: 'Within acceptable range',
        });
      }
    });

    return recommendations;
  }

  /**
   * Get provider with highest load
   */
  getHighestLoad(): ProviderLoad | undefined {
    let highest: ProviderLoad | undefined;
    let maxLoad = -Infinity;

    this.providers.forEach(provider => {
      if (provider.currentLoad > maxLoad) {
        maxLoad = provider.currentLoad;
        highest = provider;
      }
    });

    return highest;
  }

  /**
   * Get provider with lowest load
   */
  getLowestLoad(): ProviderLoad | undefined {
    let lowest: ProviderLoad | undefined;
    let minLoad = Infinity;

    this.providers.forEach(provider => {
      if (provider.currentLoad < minLoad && provider.utilization < 0.95) {
        minLoad = provider.currentLoad;
        lowest = provider;
      }
    });

    return lowest;
  }
}
