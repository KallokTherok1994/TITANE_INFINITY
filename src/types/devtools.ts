/**
 * TITANE∞ v26.4.0 — DevTools Types
 * Type definitions for DevTools components
 */

// Import system LogEntry if needed (re-export for convenience)
import type { LogEntry as SystemLogEntry } from './system';

// Re-export LogEntry from system.d.ts
export type LogEntry = SystemLogEntry;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE HEALTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CoreHealth {
  status: 'healthy' | 'degraded' | 'failing';
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: number;
  timestamp: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Engine {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  health: number;
  metrics?: {
    requests: number;
    errors: number;
    latency: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM EVENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY NODE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MemoryNode {
  id: string;
  type: 'conversation' | 'project' | 'context' | 'knowledge';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  children?: MemoryNode[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA POINT (for graphs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}
