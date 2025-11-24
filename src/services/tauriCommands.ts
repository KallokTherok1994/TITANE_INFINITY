/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v18.0.0 — TAURI COMMANDS REGISTRY
 * Registre centralisé de toutes les commandes Tauri ↔ React
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type { CoreResponse } from '../core/ARCHITECTURE_TYPES_v∞';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TauriCommand {
  name: string;
  description: string;
  params?: Record<string, string>;
  returnType: string;
  active: boolean; // Mock backend active or not
}

// ═══════════════════════════════════════════════════════════════
// COMMAND REGISTRY (Source of Truth)
// ═══════════════════════════════════════════════════════════════

export const TAURI_COMMANDS: Record<string, TauriCommand> = {
  // ━━━ MOCK BACKEND (Active) ━━━
  'singularity_get_state': {
    name: 'singularity_get_state',
    description: 'Get current Singularity state',
    returnType: 'SingularityState',
    active: true,
  },
  'singularity_sync_state': {
    name: 'singularity_sync_state',
    description: 'Sync state with backend',
    params: { state: 'SingularityState' },
    returnType: 'void',
    active: true
  },
  'helios_get_modules': {
    name: 'helios_get_modules',
    description: 'Get all Helios modules',
    returnType: 'Vec<HeliosModule>',
    active: true,
  },
  'helios_get_health': {
    name: 'helios_get_health',
    description: 'Get Helios health status',
    returnType: 'HealthStatus',
    active: true,
  },
  'memory_get_active_projects': {
    name: 'memory_get_active_projects',
    description: 'Get active projects from Memory',
    params: { limit: 'number' },
    returnType: 'Vec<Project>',
    active: true,
  },
  'memory_get_recent_memories': {
    name: 'memory_get_recent_memories',
    description: 'Get recent memories',
    params: { limit: 'number' },
    returnType: 'Vec<Memory>',
    active: true,
  },
  'nexus_get_status': {
    name: 'nexus_get_status',
    description: 'Get Nexus orchestration status',
    returnType: 'NexusStatus',
    active: true,
  },
  'persona_get_multipliers': {
    name: 'persona_get_multipliers',
    description: 'Get Persona multipliers',
    returnType: 'PersonaMultipliers',
    active: true,
  },
  'chat_send_message': {
    name: 'chat_send_message',
    description: 'Send message to AI chat',
    params: { messages: 'Vec<Message>', config: 'ChatConfig' },
    returnType: 'string',
    active: true,
  },
  'voice_start_recording': {
    name: 'voice_start_recording',
    description: 'Start voice recording',
    returnType: 'void',
    active: true,
  },
  'voice_stop_recording': {
    name: 'voice_stop_recording',
    description: 'Stop voice recording',
    returnType: 'AudioData',
    active: true,
  },
  'voice_speak': {
    name: 'voice_speak',
    description: 'Speak text using TTS',
    params: { text: 'string', voice: 'string' },
    returnType: 'void',
    active: true,
  },

  // ━━━ ENGINE COMMANDS (v14) ━━━
  'engine_init': {
    name: 'engine_init',
    description: 'Initialize Singularity Engine',
    returnType: 'void',
    active: true,
  },
  'engine_tick': {
    name: 'engine_tick',
    description: 'Tick engine frame',
    returnType: 'EngineState',
    active: true,
  },
  'engine_stop': {
    name: 'engine_stop',
    description: 'Stop engine',
    returnType: 'void',
    active: true,
  },
  'engine_get_state': {
    name: 'engine_get_state',
    description: 'Get engine state',
    returnType: 'EngineState',
    active: true,
  },
  'engine_get_health': {
    name: 'engine_get_health',
    description: 'Get engine health',
    returnType: 'HealthStatus',
    active: true,
  },

  // ━━━ DEVTOOLS ━━━
  'devtools_get_logs': {
    name: 'devtools_get_logs',
    description: 'Get DevTools logs',
    returnType: 'Vec<LogEntry>',
    active: true,
  },
  'devtools_get_metrics': {
    name: 'devtools_get_metrics',
    description: 'Get DevTools metrics',
    returnType: 'Metrics',
    active: true,
  },
  'devtools_inspect_singularity': {
    name: 'devtools_inspect_singularity',
    description: 'Inspect Singularity state',
    returnType: 'SingularityInspection',
    active: true,
  },

  // ━━━ CORE SYSTEM ━━━
  'system_get_status': {
    name: 'system_get_status',
    description: 'Get system status',
    returnType: 'SystemStatus',
    active: true,
  },
  'system_get_info': {
    name: 'system_get_info',
    description: 'Get system info',
    returnType: 'SystemInfo',
    active: true,
  },

  // ━━━ DISABLED / EXPERIMENTAL ━━━
  'meta_mode_get_current_mode': {
    name: 'meta_mode_get_current_mode',
    description: 'Get current Meta-Mode',
    returnType: 'string',
    active: false, // Inactive
  },
  'meta_mode_get_history': {
    name: 'meta_mode_get_history',
    description: 'Get Meta-Mode history',
    returnType: 'Vec<ModeHistory>',
    active: false,
  },
  'meta_mode_reset': {
    name: 'meta_mode_reset',
    description: 'Reset Meta-Mode to default',
    returnType: 'void',
    active: false,
  },
  'delete_conversation': {
    name: 'delete_conversation',
    description: 'Delete a conversation by ID',
    params: { conversationId: 'string' },
    returnType: 'void',
    active: false,
  },
  'clear_all_memory': {
    name: 'clear_all_memory',
    description: 'Clear all memory entries',
    returnType: 'void',
    active: false,
  },
  'memory_clear': {
    name: 'memory_clear',
    description: 'Clear memory core',
    returnType: 'void',
    active: false,
  },
  'singularity_update_physical': {
    name: 'singularity_update_physical',
    description: 'Update physical state',
    params: { physical: 'PhysicalState' },
    returnType: 'void',
    active: false,
  },
  'singularity_update_cognitive': {
    name: 'singularity_update_cognitive',
    description: 'Update cognitive state',
    params: { cognitive: 'CognitiveState' },
    returnType: 'void',
    active: false,
  },
  'singularity_update_symbolic': {
    name: 'singularity_update_symbolic',
    description: 'Update symbolic state',
    params: { symbolic: 'SymbolicState' },
    returnType: 'void',
    active: false,
  },
  'singularity_update_adaptive': {
    name: 'singularity_update_adaptive',
    description: 'Update adaptive state',
    params: { adaptive: 'AdaptiveState' },
    returnType: 'void',
    active: false,
  },
  'singularity_update_meta': {
    name: 'singularity_update_meta',
    description: 'Update meta state',
    params: { meta: 'MetaState' },
    returnType: 'void',
    active: false,
  },
  'singularity_update_full_state': {
    name: 'singularity_update_full_state',
    description: 'Update full Singularity state',
    params: { state: 'SingularityState' },
    returnType: 'void',
    active: false,
  },
  'singularity_save_state': {
    name: 'singularity_save_state',
    description: 'Save Singularity state to disk',
    returnType: 'void',
    active: false,
  },
  'singularity_load_state': {
    name: 'singularity_load_state',
    description: 'Load Singularity state from disk',
    returnType: 'SingularityState',
    active: false,
  }
};

// ═══════════════════════════════════════════════════════════════
// TYPED INVOKE WRAPPERS
// ═══════════════════════════════════════════════════════════════

export async function invokeTauriCommand<T = any>(
  command: string,
  params?: Record<string, any>
): Promise<CoreResponse<T>> {
  const cmd = TAURI_COMMANDS[command];

  if (!cmd) {
    console.warn(`⚠️ Unknown Tauri command: ${command}`);
    return {
      success: false,
      error: `Unknown command: ${command}`,
      timestamp: Date.now(),
    };
  }

  if (!cmd.active) {
    console.warn(`⚠️ Inactive command: ${command}`);
    return {
      success: false,
      error: `Command not active: ${command}`,
      timestamp: Date.now(),
    };
  }

  try {
    const result = await invoke<T>(command, params || {});
    return {
      success: true,
      data: result,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`❌ Error invoking ${command}:`, error);
    return {
      success: false,
      error: String(error),
      timestamp: Date.now(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SPECIFIC COMMAND HELPERS
// ═══════════════════════════════════════════════════════════════

export const TauriAPI = {
  // Singularity
  getSingularityState: () =>
    invokeTauriCommand<any>('singularity_get_state'),

  syncSingularityState: (state: any) =>
    invokeTauriCommand('singularity_sync_state', { state }),

  // Helios
  getHeliosModules: () =>
    invokeTauriCommand<any[]>('helios_get_modules'),

  getHeliosHealth: () =>
    invokeTauriCommand<string>('helios_get_health'),

  // Memory
  getActiveProjects: (limit = 10) =>
    invokeTauriCommand<any[]>('memory_get_active_projects', { limit }),

  getRecentMemories: (limit = 20) =>
    invokeTauriCommand<any[]>('memory_get_recent_memories', { limit }),

  // Nexus
  getNexusStatus: () =>
    invokeTauriCommand<any>('nexus_get_status'),

  // Persona
  getPersonaMultipliers: () =>
    invokeTauriCommand<any>('persona_get_multipliers'),

  // Chat
  sendChatMessage: (messages: any[], config: any) =>
    invokeTauriCommand<string>('chat_send_message', { messages, config }),

  // Voice
  startVoiceRecording: () =>
    invokeTauriCommand('voice_start_recording'),

  stopVoiceRecording: () =>
    invokeTauriCommand<any>('voice_stop_recording'),

  speak: (text: string, voice = 'default') =>
    invokeTauriCommand('voice_speak', { text, voice }),

  // Engine
  initEngine: () =>
    invokeTauriCommand('engine_init'),

  tickEngine: () =>
    invokeTauriCommand<any>('engine_tick'),

  stopEngine: () =>
    invokeTauriCommand('engine_stop'),

  getEngineState: () =>
    invokeTauriCommand<any>('engine_get_state'),

  getEngineHealth: () =>
    invokeTauriCommand<string>('engine_get_health'),

  // DevTools
  getDevToolsLogs: () =>
    invokeTauriCommand<any[]>('devtools_get_logs'),

  getDevToolsMetrics: () =>
    invokeTauriCommand<any>('devtools_get_metrics'),

  inspectSingularity: () =>
    invokeTauriCommand<any>('devtools_inspect_singularity'),

  // System
  getSystemStatus: () =>
    invokeTauriCommand<any>('system_get_status'),

  getSystemInfo: () =>
    invokeTauriCommand<any>('system_get_info'),
};

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

export function getActiveCommands(): string[] {
  return Object.keys(TAURI_COMMANDS).filter(key => TAURI_COMMANDS[key].active);
}

export function getInactiveCommands(): string[] {
  return Object.keys(TAURI_COMMANDS).filter(key => !TAURI_COMMANDS[key].active);
}

export function validateCommand(command: string): boolean {
  const cmd = TAURI_COMMANDS[command];
  return cmd !== undefined && cmd.active;
}
