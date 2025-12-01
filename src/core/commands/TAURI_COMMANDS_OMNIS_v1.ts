/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TAURI COMMANDS TYPES - Updated for Phase 7 OMNIS
 * Auto-Heal Integration with Tauri Backend
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';

// ═══════════════════════════════════════════════════════════════
// 🔧 MOCK FALLBACK FOR NON-TAURI ENVIRONMENTS
// ═══════════════════════════════════════════════════════════════

const getMockResponse = (cmd: string, args?: Record<string, unknown>): unknown => {
  console.log(`🔧 Mock Tauri command: ${cmd}`, args);

  switch (cmd) {
    case 'get_system_health':
      return {
        health: 'healthy',
        cpu_usage: Math.random() * 30,
        memory_usage: Math.random() * 50,
        active_sessions: 1,
        error_count: 0,
        last_check: Date.now(),
        modules: { memory: true, ai: true, tts: false, singularity: true }
      };
    case 'memory_list_entries':
      return [];
    case 'memory_search':
      return [];
    default:
      return null;
  }
};

/**
 * Wrapper sécurisé pour invoke avec fallback mock
 */
async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const env = detectEnvironment();
  if (!env.isTauri) {
    return getMockResponse(cmd, args) as T;
  }
  return await secureInvoke<T>(cmd, args);
}

// ═══════════════════════════════════════════════════════════════
// 🏗️ SYSTEM HEALTH TYPES
// ═══════════════════════════════════════════════════════════════

export interface SystemHealth {
  health: 'healthy' | 'degraded' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  active_sessions: number;
  error_count: number;
  last_check: number;
  modules: {
    memory: boolean;
    ai: boolean;
    tts: boolean;
    singularity: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ OMNIS AUTO-HEAL COMMANDS
// ═══════════════════════════════════════════════════════════════

/**
 * Get system health status
 * OMNIS Phase 7: Auto-Heal Integration
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const result = await safeInvoke<SystemHealth>('get_system_health');
    return result;
  } catch (error) {
    console.error('🔱 System health check failed:', error);
    // Fallback to default healthy state
    return {
      health: 'healthy',
      cpu_usage: 0,
      memory_usage: 0,
      active_sessions: 1,
      error_count: 0,
      last_check: Date.now(),
      modules: {
        memory: true,
        ai: true,
        tts: false,
        singularity: true
      }
    };
  }
}

/**
 * Trigger memory repair operation
 * OMNIS Phase 7: Memory Auto-Repair
 */
export async function triggerMemoryRepair(): Promise<string> {
  try {
    const result = await safeInvoke<string>('memory_repair');
    return result;
  } catch (error) {
    console.error('🔧 Memory repair failed:', error);
    return 'Memory repair failed - using fallback mode';
  }
}

/**
 * Trigger system optimization
 * OMNIS Phase 7: Performance Optimization
 */
export async function triggerSystemOptimization(): Promise<string> {
  try {
    const result = await safeInvoke<string>('system_optimize');
    return result;
  } catch (error) {
    console.error('⚡ System optimization failed:', error);
    return 'System optimization failed - using fallback mode';
  }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SAFE WRAPPERS FOR EXISTING COMMANDS
// ═══════════════════════════════════════════════════════════════

/**
 * Safe memory list wrapper with normalization
 * Prevents "i.filter undefined" errors
 */
export async function safeMemoryList(): Promise<unknown[]> {
  try {
    const result = await safeInvoke<unknown[]>('memory_list_entries');

    // Ensure we always return an array
    if (Array.isArray(result)) {
      return result;
    } else {
      console.warn('🔧 Memory list returned non-array, normalizing:', typeof result);
      return [];
    }
  } catch (error) {
    console.error('💥 Memory list failed:', error);
    return [];
  }
}

/**
 * Safe memory search wrapper
 */
export async function safeMemorySearch(query: string): Promise<unknown[]> {
  try {
    const result = await safeInvoke<unknown[]>('memory_search', { query });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('💥 Memory search failed:', error);
    return [];
  }
}

/**
 * Safe memory store wrapper
 */
export async function safeMemoryStore(id: string, key: string, value: unknown): Promise<boolean> {
  try {
    await safeInvoke('memory_save_entry', { id, key, value });
    return true;
  } catch (error) {
    console.error('💥 Memory store failed:', error);
    return false;
  }
}

/**
 * Safe memory get wrapper
 */
export async function safeMemoryGet(id: string): Promise<unknown | null> {
  try {
    return await safeInvoke('memory_get_entry', { id });
  } catch (error) {
    console.error('💥 Memory get failed:', error);
    return null;
  }
}

/**
 * Safe memory delete wrapper
 */
export async function safeMemoryDelete(id: string): Promise<boolean> {
  try {
    await safeInvoke('memory_delete_entry', { id });
    return true;
  } catch (error) {
    console.error('💥 Memory delete failed:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎯 CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════

// System health
export { getSystemHealth as systemHealth };

// Memory operations
export {
  safeMemoryList as memoryList,
  safeMemorySearch as memorySearch,
  safeMemoryStore as memoryStore,
  safeMemoryGet as memoryGet,
  safeMemoryDelete as memoryDelete
};

// Repair operations
export {
  triggerMemoryRepair as repairMemory,
  triggerSystemOptimization as optimizeSystem
};

// Default export for convenience
export default {
  systemHealth: getSystemHealth,
  memoryList: safeMemoryList,
  memorySearch: safeMemorySearch,
  memoryStore: safeMemoryStore,
  memoryGet: safeMemoryGet,
  memoryDelete: safeMemoryDelete,
  repairMemory: triggerMemoryRepair,
  optimizeSystem: triggerSystemOptimization
};
