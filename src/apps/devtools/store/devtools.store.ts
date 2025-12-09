/**
 * TITANE∞ v20.0 — DevTools Store
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type EngineStatus = 'running' | 'idle' | 'error' | 'starting' | 'stopped';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type SystemHealth = 'healthy' | 'warning' | 'critical';

export interface Engine {
  id: string;
  name: string;
  status: EngineStatus;
  lastExecution?: number; // timestamp
  executionDuration?: number; // ms
  cpu: number; // percentage
  memory: number; // MB
  errorCount: number;
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: number[]; // last 20 values
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string; // engine name
  message: string;
  details?: string;
}

export interface ErrorEntry {
  id: string;
  timestamp: number;
  engine: string;
  message: string;
  stack?: string;
  impact: 'high' | 'medium' | 'low';
  resolved: boolean;
}

export interface MemoryNode {
  id: string;
  type: 'stm' | 'mtm' | 'ltm';
  label: string;
  size: number; // bytes
  entries: number;
  lastUpdate: number;
  children?: MemoryNode[];
}

export interface OmegaStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number; // ms
  engines?: string[];
  error?: string;
}

// ─────────────────────────────────────────────────────────────────
// STORE STATE
// ─────────────────────────────────────────────────────────────────

interface DevToolsState {
  // System
  systemHealth: SystemHealth;
  activeEngines: number;
  totalEngines: number;

  // Engines
  engines: Engine[];
  
  // Metrics
  metrics: Record<string, Metric>;
  
  // Logs
  logs: LogEntry[];
  maxLogs: number;
  
  // Errors
  errors: ErrorEntry[];
  
  // Memory
  memoryTree: MemoryNode[];
  
  // Omega Pipeline
  currentPipeline: OmegaStep[];
  pipelineHistory: OmegaStep[][];
  
  // UI State
  autoScrollLogs: boolean;
  selectedEngine: string | null;
  timeRange: '30s' | '2m' | '5m' | '10m' | '1h';
  
  // Actions
  updateEngine: (id: string, updates: Partial<Engine>) => void;
  addLog: (log: LogEntry) => void;
  addError: (error: ErrorEntry) => void;
  updateMetric: (id: string, value: number) => void;
  updateMemory: (tree: MemoryNode[]) => void;
  updatePipeline: (steps: OmegaStep[]) => void;
  clearLogs: () => void;
  resolveError: (id: string) => void;
  setAutoScrollLogs: (enabled: boolean) => void;
  setSelectedEngine: (id: string | null) => void;
  setTimeRange: (range: '30s' | '2m' | '5m' | '10m' | '1h') => void;
}

// ─────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────

export const useDevToolsStore = create<DevToolsState>((set) => ({
  // Initial state
  systemHealth: 'healthy',
  activeEngines: 0,
  totalEngines: 9,
  
  engines: [
    { id: 'helios', name: 'Helios', status: 'running', cpu: 12, memory: 45, errorCount: 0 },
    { id: 'nexus', name: 'Nexus', status: 'running', cpu: 8, memory: 32, errorCount: 0 },
    { id: 'sentinel', name: 'Sentinel', status: 'idle', cpu: 2, memory: 15, errorCount: 0 },
    { id: 'harmonia', name: 'Harmonia', status: 'running', cpu: 15, memory: 67, errorCount: 0 },
    { id: 'memory-core', name: 'MemoryCore', status: 'running', cpu: 10, memory: 128, errorCount: 0 },
    { id: 'engine-0', name: 'Orchestrator', status: 'running', cpu: 5, memory: 24, errorCount: 0 },
    { id: 'engine-1', name: 'Style Engine', status: 'idle', cpu: 1, memory: 12, errorCount: 0 },
    { id: 'engine-2', name: 'Coherence', status: 'running', cpu: 7, memory: 28, errorCount: 0 },
    { id: 'engine-infinity', name: 'Engine∞', status: 'running', cpu: 20, memory: 89, errorCount: 0 },
  ],
  
  metrics: {
    'ipc-latency-p50': { id: 'ipc-latency-p50', label: 'IPC Latency P50', value: 12, unit: 'ms', trend: 'stable', history: [], timestamp: Date.now() },
    'ipc-latency-p90': { id: 'ipc-latency-p90', label: 'IPC Latency P90', value: 25, unit: 'ms', trend: 'down', history: [], timestamp: Date.now() },
    'omega-duration': { id: 'omega-duration', label: 'Omega Duration', value: 145, unit: 'ms', trend: 'stable', history: [], timestamp: Date.now() },
    'cpu-usage': { id: 'cpu-usage', label: 'CPU Usage', value: 34, unit: '%', trend: 'up', history: [], timestamp: Date.now() },
    'memory-usage': { id: 'memory-usage', label: 'Memory Usage', value: 512, unit: 'MB', trend: 'stable', history: [], timestamp: Date.now() },
  },
  
  logs: [],
  maxLogs: 500,
  
  errors: [],
  
  memoryTree: [
    {
      id: 'stm',
      type: 'stm',
      label: 'Short-Term Memory',
      size: 2048576, // 2MB
      entries: 15,
      lastUpdate: Date.now() - 1000,
      children: [],
    },
    {
      id: 'mtm',
      type: 'mtm',
      label: 'Mid-Term Memory',
      size: 8388608, // 8MB
      entries: 47,
      lastUpdate: Date.now() - 5000,
      children: [],
    },
    {
      id: 'ltm',
      type: 'ltm',
      label: 'Long-Term Memory',
      size: 33554432, // 32MB
      entries: 1234,
      lastUpdate: Date.now() - 60000,
      children: [],
    },
  ],
  
  currentPipeline: [],
  pipelineHistory: [],
  
  autoScrollLogs: true,
  selectedEngine: null,
  timeRange: '2m',
  
  // Actions
  updateEngine: (id, updates) => set((state) => ({
    engines: state.engines.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  
  addLog: (log) => set((state) => {
    const newLogs = [log, ...state.logs].slice(0, state.maxLogs);
    return { logs: newLogs };
  }),
  
  addError: (error) => set((state) => ({
    errors: [error, ...state.errors],
  })),
  
  updateMetric: (id, value) => set((state) => {
    const metric = state.metrics[id];
    if (!metric) return state;
    
    const newHistory = [...metric.history, value].slice(-20);
    const trend = newHistory.length >= 2
      ? value > newHistory[newHistory.length - 2]
        ? 'up'
        : value < newHistory[newHistory.length - 2]
          ? 'down'
          : 'stable'
      : 'stable';
    
    return {
      metrics: {
        ...state.metrics,
        [id]: {
          ...metric,
          value,
          history: newHistory,
          trend,
          timestamp: Date.now(),
        },
      },
    };
  }),
  
  updateMemory: (tree) => set({ memoryTree: tree }),
  
  updatePipeline: (steps) => set((state) => ({
    currentPipeline: steps,
    pipelineHistory: [steps, ...state.pipelineHistory].slice(0, 10),
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  resolveError: (id) => set((state) => ({
    errors: state.errors.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
  })),
  
  setAutoScrollLogs: (enabled) => set({ autoScrollLogs: enabled }),
  
  setSelectedEngine: (id) => set({ selectedEngine: id }),
  
  setTimeRange: (range) => set({ timeRange: range }),
}));
