/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — TAURI BRIDGE CENTRALISÉ + EVENT SUBSCRIPTIONS
 * Service unique pour toutes les commandes Tauri ↔ React + Event System
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';
import type {
  CoreResponse,
  CoreError,
  ChatMessage,
  ChatConfig,
  VoiceRecordingResult,
  SystemStatus,
  SystemMetrics,
  ModuleInfo,
  ProjectInfo,
  PersonaMultipliers,
  HeliosMetrics,
  NexusGraph,
  MemoryEntry,
  HealthStatus,
} from '../core/ARCHITECTURE_TYPES_v∞';
import type { SingularityFrontendState } from '../core/state/SingularityState';

// ═══════════════════════════════════════════════════════════════
// LOGGING & DEBUG
// ═══════════════════════════════════════════════════════════════

const DEBUG_MODE = import.meta.env.DEV;

function logCommand(command: string, params?: Record<string, unknown>): void {
  if (DEBUG_MODE) {
    console.log(`[TauriBridge] → ${command}`, params ?? '');
  }
}

function logResponse(command: string, response: unknown, duration: number): void {
  if (DEBUG_MODE) {
    console.log(`[TauriBridge] ← ${command} (${duration}ms)`, response);
  }
}

function logError(command: string, error: unknown): void {
  console.error(`[TauriBridge] ✗ ${command}`, error);
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

function createCoreError(category: CoreError['category'], message: string, details?: string): CoreError {
  return {
    category,
    message,
    details,
    timestamp: Date.now(),
  };
}

function wrapError(error: unknown): CoreError {
  if (typeof error === 'string') {
    return createCoreError('internal', error);
  }
  if (error instanceof Error) {
    return createCoreError('internal', error.message, error.stack);
  }
  return createCoreError('internal', 'Unknown error', JSON.stringify(error));
}

// ═══════════════════════════════════════════════════════════════
// CORE INVOKE WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper centralisé pour toutes les commandes Tauri
 * - Logging automatique
 * - Error handling unifié
 * - Timeout configurable
 * - Retry logic optionnel
 */
export async function invokeTauriCommand<T = unknown>(
  command: string,
  params?: Record<string, unknown>,
  options: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<CoreResponse<T>> {
  const { timeout = 30000, retries = 0, retryDelay = 1000 } = options;

  const startTime = Date.now();
  logCommand(command, params);

  // Guard: Vérifier environnement Tauri
  const env = detectEnvironment();
  if (!env.isTauri) {
    return {
      success: false,
      error: 'Not running in Tauri environment',
      timestamp: Date.now(),
    };
  }

  let lastError: CoreError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Timeout race avec secureInvoke
      const invokePromise = secureInvoke<T>(command, params);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(createCoreError('timeout', `Command ${command} timed out after ${timeout}ms`)), timeout)
      );

      const data = await Promise.race([invokePromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      logResponse(command, data, duration);

      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      lastError = wrapError(error);
      logError(command, lastError);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TYPED API WRAPPERS (30+ commandes)
// ═══════════════════════════════════════════════════════════════

// --- SINGULARITY ---
export async function getSingularityState() {
  return invokeTauriCommand<Partial<SingularityFrontendState>>('singularity_get_state');
}

export async function syncSingularityState(state: Partial<SingularityFrontendState>) {
  return invokeTauriCommand<void>('singularity_sync_state', { state });
}

// --- HELIOS ---
export async function getHeliosModules() {
  return invokeTauriCommand<ModuleInfo[]>('helios_get_modules');
}

export async function getHeliosHealth() {
  return invokeTauriCommand<HealthStatus>('helios_get_health');
}

// --- MEMORY ---
export async function getActiveProjects(limit = 10) {
  return invokeTauriCommand<ProjectInfo[]>('memory_get_active_projects', { limit });
}

export async function getRecentMemories(limit = 20) {
  return invokeTauriCommand<MemoryEntry[]>('memory_get_recent_memories', { limit });
}

// --- NEXUS ---
export async function getNexusStatus() {
  return invokeTauriCommand<NexusGraph>('nexus_get_status');
}

// --- PERSONA ---
export async function getPersonaMultipliers() {
  return invokeTauriCommand<PersonaMultipliers>('persona_get_multipliers');
}

// --- CHAT ---
export async function sendChatMessage(messages: ChatMessage[], config: ChatConfig) {
  return invokeTauriCommand<string>(
    'chat_send_message',
    { messages, config },
    { timeout: 30000, retries: 2, retryDelay: 1000 }
  );
}

// --- VOICE ---
export async function startVoiceRecording() {
  return invokeTauriCommand<string>('start_recording');
}

export async function stopVoiceRecording() {
  return invokeTauriCommand<VoiceRecordingResult>('stop_recording');
}

export async function voiceSpeak(text: string, voice?: string) {
  return invokeTauriCommand<void>('speak', { text, voice });
}

// --- ENGINE MANAGEMENT ---
export async function engineInit() {
  return invokeTauriCommand<void>('engine_init');
}

export async function engineTick() {
  return invokeTauriCommand<void>('engine_tick');
}

export async function engineMetrics() {
  return invokeTauriCommand<HeliosMetrics>('engine_metrics');
}

export async function engineHealth() {
  return invokeTauriCommand<HealthStatus>('engine_health');
}

export async function engineModules() {
  return invokeTauriCommand<ModuleInfo[]>('engine_modules');
}

// --- DEVTOOLS ---
export async function getDevToolsLogs() {
  return invokeTauriCommand<string[]>('devtools_get_logs');
}

export async function clearDevToolsLogs() {
  return invokeTauriCommand<void>('devtools_clear_logs');
}

// --- SYSTEM ---
export async function getSystemStatus() {
  return invokeTauriCommand<SystemStatus>('system_get_status');
}

export async function getSystemMetrics() {
  return invokeTauriCommand<SystemMetrics>('system_get_metrics');
}

// --- FILE SYSTEM ---

/**
 * File listing options (v19.0 Task 5)
 */
export interface ListFilesOptions {
  recursive?: boolean;
  includeHidden?: boolean;
  extensions?: string[]; // e.g., ['.txt', '.md']
  maxDepth?: number;
}

/**
 * File metadata (v19.0 Task 5)
 */
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  modified: number; // Unix timestamp
  created?: number;
  permissions?: string;
}

/**
 * Read file content
 */
export async function readFile(path: string) {
  return invokeTauriCommand<string>('fs_read_file', { path });
}

/**
 * Write file content
 */
export async function writeFile(path: string, content: string) {
  return invokeTauriCommand<void>('fs_write_file', { path, content });
}

/**
 * List files in directory (v19.0 Task 5)
 */
export async function listFiles(path: string, options: ListFilesOptions = {}) {
  return invokeTauriCommand<FileInfo[]>('fs_list_files', { path, options });
}

/**
 * Delete file or directory (v19.0 Task 5)
 */
export async function deleteFile(path: string, recursive: boolean = false) {
  return invokeTauriCommand<void>('fs_delete', { path, recursive });
}

/**
 * Copy file or directory (v19.0 Task 5)
 */
export async function copyFile(source: string, dest: string, overwrite: boolean = false) {
  return invokeTauriCommand<void>('fs_copy', { source, dest, overwrite });
}

/**
 * Move/rename file or directory (v19.0 Task 5)
 */
export async function moveFile(source: string, dest: string, overwrite: boolean = false) {
  return invokeTauriCommand<void>('fs_move', { source, dest, overwrite });
}

/**
 * Get file metadata (v19.0 Task 5)
 */
export async function getFileInfo(path: string) {
  return invokeTauriCommand<FileInfo>('fs_info', { path });
}

/**
 * Check if file/directory exists (v19.0 Task 5)
 */
export async function fileExists(path: string) {
  return invokeTauriCommand<boolean>('fs_exists', { path });
}

/**
 * Create directory (v19.0 Task 5)
 */
export async function createDirectory(path: string, recursive: boolean = true) {
  return invokeTauriCommand<void>('fs_create_dir', { path, recursive });
}

// ═══════════════════════════════════════════════════════════════
// BATCH COMMANDS (NEW v19.0 Task 4)
// ═══════════════════════════════════════════════════════════════

export type BatchCommand = {
  command: string;
  params?: Record<string, unknown>;
  id?: string; // Optional identifier for tracking
};

export type BatchResult<T = any> = {
  id?: string;
  success: boolean;
  data?: T;
  error?: CoreError;
  duration: number;
};

export type BatchProgress = {
  completed: number;
  total: number;
  percentage: number;
  currentCommand?: string;
};

export type BatchOptions = {
  mode?: 'parallel' | 'sequential';
  atomic?: boolean; // If true, rollback all on any failure
  timeout?: number;
  onProgress?: (progress: BatchProgress) => void;
  stopOnError?: boolean; // Stop execution on first error (sequential only)
};

/**
 * Execute multiple Tauri commands in batch
 * @param commands Array of commands to execute
 * @param options Batch execution options
 * @returns Array of results (one per command)
 */
export async function batchInvoke<T = any>(
  commands: BatchCommand[],
  options: BatchOptions = {}
): Promise<BatchResult<T>[]> {
  const {
    mode = 'parallel',
    atomic = false,
    timeout = 60000,
    onProgress,
    stopOnError = false,
  } = options;

  const results: BatchResult<T>[] = [];
  const startTime = Date.now();
  let completed = 0;

  const updateProgress = (currentCommand?: string) => {
    if (onProgress) {
      onProgress({
        completed,
        total: commands.length,
        percentage: Math.round((completed / commands.length) * 100),
        currentCommand,
      });
    }
  };

  if (mode === 'parallel') {
    // Execute all commands in parallel
    const promises = commands.map(async (cmd, index) => {
      const cmdStartTime = Date.now();
      const cmdId = cmd.id || `cmd_${index}`;

      try {
        updateProgress(cmd.command);
        const response = await invokeTauriCommand<T>(cmd.command, cmd.params, { timeout });
        const duration = Date.now() - cmdStartTime;

        completed++;
        updateProgress();

        return {
          id: cmdId,
          success: response.success,
          data: response.data,
          duration,
        };
      } catch (error) {
        const duration = Date.now() - cmdStartTime;
        completed++;
        updateProgress();

        return {
          id: cmdId,
          success: false,
          error: wrapError(error),
          duration,
        };
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Atomic: if any failed, consider entire batch failed
    if (atomic && batchResults.some(r => !r.success)) {
      throw new Error(`Batch failed (atomic mode): ${batchResults.filter(r => !r.success).length} commands failed`);
    }
  } else {
    // Sequential execution
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const cmdStartTime = Date.now();
      const cmdId = cmd.id || `cmd_${i}`;

      updateProgress(cmd.command);

      try {
        const response = await invokeTauriCommand<T>(cmd.command, cmd.params, { timeout });
        const duration = Date.now() - cmdStartTime;

        results.push({
          id: cmdId,
          success: response.success,
          data: response.data,
          duration,
        });

        completed++;
        updateProgress();
      } catch (error) {
        const duration = Date.now() - cmdStartTime;
        const result = {
          id: cmdId,
          success: false,
          error: wrapError(error),
          duration,
        };

        results.push(result);
        completed++;
        updateProgress();

        // Stop on error if requested
        if (stopOnError) {
          throw new Error(`Batch stopped at command ${i + 1}/${commands.length}: ${cmd.command}`);
        }

        // Atomic: stop on first error
        if (atomic) {
          throw new Error(`Batch failed (atomic mode) at command ${i + 1}: ${cmd.command}`);
        }
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  if (DEBUG_MODE) {
    console.log(`[TauriBridge] Batch complete: ${commands.length} commands in ${totalDuration}ms (${mode} mode)`);
  }

  return results;
}

/**
 * Execute commands in parallel (shorthand)
 */
export async function parallelInvoke<T = any>(
  commands: BatchCommand[],
  options?: Omit<BatchOptions, 'mode'>
): Promise<BatchResult<T>[]> {
  return batchInvoke<T>(commands, { ...options, mode: 'parallel' });
}

/**
 * Execute commands sequentially (shorthand)
 */
export async function sequentialInvoke<T = any>(
  commands: BatchCommand[],
  options?: Omit<BatchOptions, 'mode'>
): Promise<BatchResult<T>[]> {
  return batchInvoke<T>(commands, { ...options, mode: 'sequential' });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  // Core
  invokeTauriCommand,

  // Batch (NEW v19.0)
  batchInvoke,
  parallelInvoke,
  sequentialInvoke,

  // Singularity
  getSingularityState,
  syncSingularityState,

  // Helios
  getHeliosModules,
  getHeliosHealth,

  // Memory
  getActiveProjects,
  getRecentMemories,

  // Nexus
  getNexusStatus,

  // Persona
  getPersonaMultipliers,

  // Chat
  sendChatMessage,

  // Voice
  startVoiceRecording,
  stopVoiceRecording,
  voiceSpeak,

  // Engine
  engineInit,
  engineTick,
  engineMetrics,
  engineHealth,
  engineModules,

  // DevTools
  getDevToolsLogs,
  clearDevToolsLogs,

  // System
  getSystemStatus,
  getSystemMetrics,

  // FileSystem (v19.0 Task 5 Enhanced)
  readFile,
  writeFile,
  listFiles,
  deleteFile,
  copyFile,
  moveFile,
  getFileInfo,
  fileExists,
  createDirectory,
};
