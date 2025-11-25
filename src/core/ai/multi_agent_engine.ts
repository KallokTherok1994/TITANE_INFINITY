/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ - MULTI-AGENT ENGINE (Super-Prompt O)
 * 5 Agents Internes: Helios, Harmonia, Persona, Memory-Core, Watchdog
 * ═══════════════════════════════════════════════════════════════════
 */

// ══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ══════════════════════════════════════════════════════════════════

export type AgentRole = 'physical' | 'emotional' | 'expressive' | 'memory' | 'security';

export type AgentStatus = 'idle' | 'active' | 'paused' | 'error' | 'suspended' | 'running';

export interface AgentState {
  status: AgentStatus;
  lastTick: number;
  cycleCount: number;
  health: number; // 0-100
  load: number; // 0-100
  errors: string[];
  metrics: Record<string, number>;
  data?: Record<string, unknown>; // Additional agent-specific data
  id?: string; // Agent ID for state tracking
}

export interface AgentEvent {
  type: string;
  source: string;
  timestamp: number;
  payload: unknown;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>; // Additional event data
}

export interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  recommendations?: string[];
  message?: string; // Response message for agents
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  state: AgentState;
  permissions: string[];

  // Lifecycle
  initialize(): Promise<void>;
  tick(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  shutdown(): Promise<void>;

  // Communication
  handle(event: AgentEvent): Promise<AgentResponse>;
  emit(event: AgentEvent): void;

  // Monitoring
  getHealth(): number;
  getMetrics(): Record<string, number>;
}

export interface AgentCoordination {
  agents: Agent[];
  globalState: {
    coherence: number; // 0-100
    stability: number; // 0-100
    load: number; // 0-100
    errors: number;
  };
  lastSync: number;
}

// ══════════════════════════════════════════════════════════════════
// MULTI-AGENT ENGINE
// ══════════════════════════════════════════════════════════════════

class MultiAgentEngine {
  private agents: Map<string, Agent> = new Map();
  private eventBus: AgentEvent[] = [];
  private coordination: AgentCoordination;
  private tickInterval: number = 5000; // 5 seconds
  private running: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.coordination = {
      agents: [],
      globalState: {
        coherence: 100,
        stability: 100,
        load: 0,
        errors: 0,
      },
      lastSync: Date.now(),
    };
  }

  // ──────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    console.log('🌌 [MULTI-AGENT] Initializing Multi-Agent System...');

    // Agents will be registered dynamically
    // This allows lazy loading and modular architecture

    this.running = true;
    this.startOrchestrationLoop();

    console.log('✅ [MULTI-AGENT] System initialized');
  }

  // ──────────────────────────────────────────────────────────────
  // AGENT REGISTRATION
  // ──────────────────────────────────────────────────────────────

  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      console.warn(`⚠️ [MULTI-AGENT] Agent ${agent.id} already registered`);
      return;
    }

    this.agents.set(agent.id, agent);
    this.coordination.agents.push(agent);

    console.log(`✅ [MULTI-AGENT] Registered agent: ${agent.name} (${agent.role})`);
  }

  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.agents.delete(agentId);
    this.coordination.agents = this.coordination.agents.filter(a => a.id !== agentId);

    console.log(`🔻 [MULTI-AGENT] Unregistered agent: ${agent.name}`);
  }

  // ──────────────────────────────────────────────────────────────
  // ORCHESTRATION LOOP
  // ──────────────────────────────────────────────────────────────

  private startOrchestrationLoop(): void {
    this.intervalId = setInterval(async () => {
      await this.orchestrationCycle();
    }, this.tickInterval);
  }

  private async orchestrationCycle(): Promise<void> {
    if (!this.running) return;

    // 1. Collect states from all agents
    const states = await this.collectStates();

    // 2. Analyze global coherence
    const coherence = this.calculateCoherence(states);

    // 3. Detect anomalies
    const anomalies = this.detectAnomalies(states);

    // 4. Apply corrections if needed
    if (anomalies.length > 0) {
      await this.applyCorrections(anomalies);
    }

    // 5. Synchronize agents
    await this.synchronizeAgents();

    // 6. Update global state
    this.updateGlobalState(coherence, states);

    // 7. Emit coordination event
    this.emitEvent({
      type: 'coordination_cycle',
      source: 'multi_agent_engine',
      timestamp: Date.now(),
      payload: this.coordination,
      priority: 'low',
    });
  }

  // ──────────────────────────────────────────────────────────────
  // STATE COLLECTION & ANALYSIS
  // ──────────────────────────────────────────────────────────────

  private async collectStates(): Promise<Map<string, AgentState>> {
    const states = new Map<string, AgentState>();

    for (const [id, agent] of this.agents) {
      try {
        states.set(id, agent.state);
      } catch (error) {
        console.error(`❌ [MULTI-AGENT] Failed to collect state from ${id}:`, error);
      }
    }

    return states;
  }

  private calculateCoherence(states: Map<string, AgentState>): number {
    if (states.size === 0) return 100;

    let totalHealth = 0;
    let activeAgents = 0;

    for (const state of states.values()) {
      if (state.status === 'active') {
        totalHealth += state.health;
        activeAgents++;
      }
    }

    return activeAgents > 0 ? totalHealth / activeAgents : 100;
  }

  private detectAnomalies(states: Map<string, AgentState>): string[] {
    const anomalies: string[] = [];

    for (const [id, state] of states) {
      // Health below 30%
      if (state.health < 30) {
        anomalies.push(`agent_${id}_low_health`);
      }

      // Load above 90%
      if (state.load > 90) {
        anomalies.push(`agent_${id}_high_load`);
      }

      // Status error
      if (state.status === 'error') {
        anomalies.push(`agent_${id}_error`);
      }

      // Too many errors
      if (state.errors.length > 10) {
        anomalies.push(`agent_${id}_excessive_errors`);
      }
    }

    return anomalies;
  }

  private async applyCorrections(anomalies: string[]): Promise<void> {
    console.log(`🔧 [MULTI-AGENT] Applying corrections for ${anomalies.length} anomalies`);

    for (const anomaly of anomalies) {
      const [, agentId, issue] = anomaly.split('_');
      const agent = this.agents.get(agentId);

      if (!agent) continue;

      try {
        if (issue === 'low' || issue === 'health') {
          // Pause and resume to reset
          await agent.pause();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await agent.resume();
        } else if (issue === 'high' || issue === 'load') {
          // Pause briefly to reduce load
          await agent.pause();
          await new Promise(resolve => setTimeout(resolve, 2000));
          await agent.resume();
        } else if (issue === 'error') {
          // Restart agent
          await agent.shutdown();
          await agent.initialize();
        }
      } catch (error) {
        console.error(`❌ [MULTI-AGENT] Failed to correct ${agentId}:`, error);
      }
    }
  }

  private async synchronizeAgents(): Promise<void> {
    // Tick all active agents
    const tickPromises = Array.from(this.agents.values())
      .filter(agent => agent.state.status === 'active')
      .map(agent => agent.tick().catch(err => {
        console.error(`❌ [MULTI-AGENT] Agent ${agent.id} tick failed:`, err);
      }));

    await Promise.all(tickPromises);
  }

  private updateGlobalState(coherence: number, states: Map<string, AgentState>): void {
    let totalLoad = 0;
    let totalErrors = 0;

    for (const state of states.values()) {
      totalLoad += state.load;
      totalErrors += state.errors.length;
    }

    this.coordination.globalState = {
      coherence,
      stability: coherence, // Simplified
      load: states.size > 0 ? totalLoad / states.size : 0,
      errors: totalErrors,
    };

    this.coordination.lastSync = Date.now();
  }

  // ──────────────────────────────────────────────────────────────
  // EVENT BUS
  // ──────────────────────────────────────────────────────────────

  private emitEvent(event: AgentEvent): void {
    this.eventBus.push(event);

    // Keep only last 100 events
    if (this.eventBus.length > 100) {
      this.eventBus.shift();
    }

    // Broadcast to all agents
    for (const agent of this.agents.values()) {
      agent.handle(event).catch(err => {
        console.error(`❌ [MULTI-AGENT] Agent ${agent.id} failed to handle event:`, err);
      });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────

  getCoordination(): AgentCoordination {
    return this.coordination;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  async pauseAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      await agent.pause();
    }
  }

  async resumeAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      await agent.resume();
    }
  }

  // Get all agent states
  getAllAgentStates(): Map<string, AgentState> {
    const states = new Map<string, AgentState>();
    this.agents.forEach((agent, id) => {
      states.set(id, { ...agent.state });
    });
    return states;
  }

  // Get global system state
  getState(): {
    isRunning: boolean;
    globalCoherence: number;
    globalStability: number;
    globalLoad: number;
    totalErrors: number;
  } {
    const agents = Array.from(this.agents.values());
    const totalHealth = agents.reduce((sum, a) => sum + a.state.health, 0);
    const totalLoad = agents.reduce((sum, a) => sum + a.state.load, 0);
    const totalErrors = agents.reduce((sum, a) => sum + a.state.errors.length, 0);

    return {
      isRunning: this.running,
      globalCoherence: agents.length > 0 ? totalHealth / agents.length : 100,
      globalStability: agents.length > 0 ? 100 - totalLoad / agents.length : 100,
      globalLoad: agents.length > 0 ? totalLoad / agents.length : 0,
      totalErrors,
    };
  }

  async shutdown(): Promise<void> {
    console.log('🔻 [MULTI-AGENT] Shutting down...');

    this.running = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Shutdown all agents
    const shutdownPromises = Array.from(this.agents.values())
      .map(agent => agent.shutdown().catch(err => {
        console.error(`❌ [MULTI-AGENT] Failed to shutdown ${agent.id}:`, err);
      }));

    await Promise.all(shutdownPromises);

    console.log('✅ [MULTI-AGENT] Shutdown complete');
  }
}

// ══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ══════════════════════════════════════════════════════════════════

export const multiAgentEngine = new MultiAgentEngine();
