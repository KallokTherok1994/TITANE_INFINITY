/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * AGENT HELIOS — Physical / System / Monitoring
 * Surveillance charge CPU/GPU, mémoire, stabilité système
 * ═══════════════════════════════════════════════════════════════════
 */

import type { Agent, AgentState, AgentEvent, AgentResponse, AgentRole } from '../multi_agent_engine';

export class HeliosAgent implements Agent {
  id = 'helios';
  name = 'Helios';
  role: AgentRole = 'physical';
  permissions = ['system:monitor', 'system:metrics', 'system:health'];

  state: AgentState = {
    status: 'idle',
    lastTick: 0,
    cycleCount: 0,
    health: 100,
    load: 0,
    errors: [],
    metrics: {},
  };

  private metrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    gpuUsage: 0,
    responseTime: 0,
    activeModules: 0,
  };

  async initialize(): Promise<void> {
    console.log('🔥 [HELIOS] Initializing physical monitoring agent...');
    this.state.status = 'active';
    this.state.health = 100;
    await this.updateMetrics();
  }

  async tick(): Promise<void> {
    this.state.cycleCount++;
    this.state.lastTick = Date.now();

    // Update metrics
    await this.updateMetrics();

    // Calculate health based on load
    this.calculateHealth();

    // Detect anomalies
    this.detectAnomalies();
  }

  private async updateMetrics(): Promise<void> {
    try {
      // CPU (simulated - in real impl, use Tauri command)
      this.metrics.cpuUsage = Math.random() * 40 + 10; // 10-50%

      // Memory
      const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
      if (typeof performance !== 'undefined' && perfWithMemory.memory) {
        const mem = perfWithMemory.memory;
        this.metrics.memoryUsage = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;
      } else {
        this.metrics.memoryUsage = Math.random() * 30 + 20;
      }

      // Response time (avg of last operations)
      this.metrics.responseTime = Math.random() * 50 + 10; // 10-60ms

      // Active modules
      this.metrics.activeModules = 20; // Fixed for now

      this.state.metrics = { ...this.metrics };
    } catch (error) {
      (this.state.errors ??= []).push(`Metrics update failed: ${error}`);
    }
  }

  private calculateHealth(): void {
    const { cpuUsage, memoryUsage, responseTime } = this.metrics;

    // Health = 100 - penalties
    let health = 100;

    // CPU penalty
    if (cpuUsage > 80) health -= 20;
    else if (cpuUsage > 60) health -= 10;

    // Memory penalty
    if (memoryUsage > 90) health -= 20;
    else if (memoryUsage > 70) health -= 10;

    // Response time penalty
    if (responseTime > 100) health -= 15;
    else if (responseTime > 50) health -= 5;

    this.state.health = Math.max(0, health);
    this.state.load = (cpuUsage + memoryUsage) / 2;
  }

  private detectAnomalies(): void {
    const { cpuUsage, memoryUsage, responseTime } = this.metrics;

    if (cpuUsage > 90) {
      this.emit({
        type: 'anomaly_detected',
        source: this.id,
        timestamp: Date.now(),
        payload: { type: 'high_cpu', value: cpuUsage },
        priority: 'high',
      });
    }

    if (memoryUsage > 95) {
      this.emit({
        type: 'anomaly_detected',
        source: this.id,
        timestamp: Date.now(),
        payload: { type: 'high_memory', value: memoryUsage },
        priority: 'critical',
      });
    }

    if (responseTime > 200) {
      this.emit({
        type: 'anomaly_detected',
        source: this.id,
        timestamp: Date.now(),
        payload: { type: 'high_latency', value: responseTime },
        priority: 'medium',
      });
    }
  }

  async handle(event: AgentEvent): Promise<AgentResponse> {
    if (event.type === 'get_metrics') {
      return {
        success: true,
        data: this.metrics,
      };
    }

    if (event.type === 'adjust_frequency') {
      // Adjust monitoring frequency based on load
      return {
        success: true,
        recommendations: ['Reduce monitoring frequency to save resources'],
      };
    }

    return { success: false, error: 'Unknown event type' };
  }

  emit(event: AgentEvent): void {
    // Events are handled by MultiAgentEngine
    console.log(`🔥 [HELIOS] Emitting event: ${event.type}`);
  }

  async pause(): Promise<void> {
    this.state.status = 'paused';
    console.log('⏸️  [HELIOS] Paused');
  }

  async resume(): Promise<void> {
    this.state.status = 'active';
    console.log('▶️  [HELIOS] Resumed');
  }

  async shutdown(): Promise<void> {
    this.state.status = 'idle';
    console.log('🔻 [HELIOS] Shutdown');
  }

  getHealth(): number {
    return this.state.health;
  }

  getMetrics(): Record<string, number> {
    return this.state.metrics;
  }
}
