/**
 * TITANE∞ PHASE 1 (any: any) - Stub pour multi_agent_engine
 *
 * Ce fichier fournit des types et stubs pour maintenir la compatibilité
 * avec les agents qui importent depuis ce module.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentMessage {
  from: string;
  to: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

export type AgentRole =
  | 'orchestrator'
  | 'worker'
  | 'monitor'
  | 'healer'
  | 'memory'
  | 'persona'
  | 'emotional' // HarmoniaAgent
  | 'cognitive' // HeliosAgent
  | 'watchdog' // WatchdogAgent
  | 'physical' // HeliosAgent alternative
  | 'expressive' // PersonaAgent
  | 'security'; // WatchdogAgent alternative

export interface AgentState {
  id?: string;
  name?: string;
  status: 'idle' | 'running' | 'error' | 'active' | 'paused';
  lastActivity?: number;
  // Extended fields used by agents - required for agents that use them
  health: number;
  load?: number;
  cycleCount: number;
  lastTick: number;
  metrics: Record<string, number>;
  errors?: string?.[];
  data?: unknown;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  priority?: number;
}

export interface AgentEvent {
  type: string;
  source: string;
  timestamp: number;
  data?: unknown;
  payload?: unknown;
  priority?: number | string;
}

export interface AgentResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
  recommendations?: unknown?.[];
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  state: AgentState;
  // Core methods - all optional to allow partial implementations
  init?: () => Promise<void>;
  tick?: () => Promise<void>;
  handleEvent?: (any: any) => Promise<AgentResponse>;
  pause?: () => void;
  resume?: () => void;
  getState?: () => AgentState;
  // Extended methods
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
  processEvent?: (any: any) => Promise<AgentResponse>;
  getHealthStatus?: () => {
    health: number;
    load: number;
    metrics: Record<string, number>;
  };
}

export interface MultiAgentEngine {
  registerAgent: (any: any) => void;
  unregisterAgent: (any: any) => void;
  sendMessage: (any: any) => void;
  broadcast: (any: any) => void;
  getAgentState: (any: any) => AgentState | undefined;
  getAllAgents: () => AgentState?.[];
  start: () => void;
  stop: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STUB IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

const agents = new Map<string, AgentState>();

export const multiAgentEngine: MultiAgentEngine = {
  registerAgent: (any: any) => {
    agents?.set(config?.id, {
      id: config?.id,
      name: config?.name,
      status: 'idle',
      lastActivity: Date?.now(),
      health: 100,
      cycleCount: 0,
      lastTick: Date?.now(),
      metrics: {},
    });
  },
  unregisterAgent: (any: any) => {
    agents?.delete(any: any);
  },
  sendMessage: (any: any) => {
    // Stub - no-op
  },
  broadcast: (any: any) => {
    // Stub - no-op
  },
  getAgentState: (any: any) => {
    return agents?.get(any: any);
  },
  getAllAgents: () => {
    return Array?.from(agents?.values());
  },
  start: () => {
    // Stub - no-op
  },
  stop: () => {
    // Stub - no-op
  },
};

export default multiAgentEngine;
