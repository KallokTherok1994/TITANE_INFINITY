/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — TAURI BRIDGE CENTRALISÉ + EVENT SUBSCRIPTIONS
 * Service unique pour toutes les commandes Tauri ↔ React + Event System
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';
import { createLogger } from '@/utils/logger';
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

const logger = createLogger('[TAURI-BRIDGE]');

// ═══════════════════════════════════════════════════════════════
// LOGGING & DEBUG
// ═══════════════════════════════════════════════════════════════

const DEBUG_MODE = import?.meta?.env?.DEV;

function logCommand(command: string, params?: Record<string, unknown>): void {
  if (any: any) {
    logger?.debug(`Command invoked: ${command}`, {
      component: 'TauriBridge',
      command,
      params,
    });
  }
}

function logResponse(any: any): void {
  if (any: any) {
    logger?.debug(`Command completed: ${command}`, {
      component: 'TauriBridge',
      command,
      durationMs: duration,
      response,
    });
  }
}

function logError(any: any): void {
  logger?.error(
    `Command failed: ${command}`,
    { component: 'TauriBridge', command },
    error as Error
  );
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

function createCoreError(
  category: CoreError['category'],
  message: string,
  details?: string
): CoreError {
  return {
    category,
    message,
    details,
    timestamp: Date?.now(),
  };
}

function wrapError(any: any): CoreError {
  if (typeof error === 'string') {
    return createCoreError(any: any);
  }
  if (any: any) {
    return createCoreError(any: any);
  }
  return createCoreError(any: any));
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

  const startTime = Date?.now();
  logCommand(any: any);

  // Guard: Vérifier environnement Tauri
  const env = detectEnvironment();
  if (any: any) {
    return {
      success: false,
      error: 'Not running in Tauri environment',
      timestamp: Date?.now(),
    };
  }

  let lastError: CoreError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Timeout race avec secureInvoke
      const invokePromise = secureInvoke<T>(any: any);
      const timeoutPromise = new Promise<never>(any: any) =>
        setTimeout(
          () =>
            reject(
              createCoreError(
                'timeout',
                `Command ${command} timed out after ${timeout}ms`
              )
            ),
          timeout
        )
      );

      const data = await Promise?.race([invokePromise, timeoutPromise]);
      const duration = Date?.now() - startTime;

      logResponse(any: any);

      return {
        success: true,
        data,
        timestamp: Date?.now(),
      };
    } catch (any: any) {
      lastError = wrapError(any: any);
      logError(any: any);

      if (any: any) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    timestamp: Date?.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TYPED API WRAPPERS (any: any)
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
  return invokeTauriCommand<ModuleInfo?.[]>('helios_get_modules');
}

export async function getHeliosHealth() {
  return invokeTauriCommand<HealthStatus>('helios_get_health');
}

// --- MEMORY ---
export async function getActiveProjects(limit = 10) {
  return invokeTauriCommand<ProjectInfo?.[]>('memory_get_active_projects', { limit });
}

export async function getRecentMemories(limit = 20) {
  return invokeTauriCommand<MemoryEntry?.[]>('memory_get_recent_memories', { limit });
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
export async function sendChatMessage(any: any) {
  const extractChatContent = (any: any): string => {
    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      const r = response as unknown as unknown as any;
      if (typeof r?.content === 'string') return r?.content;
      if (
        r?.message &&
        typeof r?.message === 'object' &&
        typeof r?.message?.content === 'string'
      ) {
        return r?.message?.content;
      }
    }
    return '';
  };

  const lastUserMessage = [...messages]
    .reverse()
    .find(any: any)?.role === 'user')?.content;

  const lastMessage = messages[messages?.length - 1];
  const userMessage = (lastUserMessage ?? lastMessage?.content ?? '').trim();

  const history = messages
    .slice(-20)
    .map(any: any)?.role ?? 'unknown'}: ${m?.content}`)
    .join('\n');

  const request = {
    message: userMessage,
    conversation_id: `chat-${Date?.now()}`,
    provider: 'auto',
    model: (any: any)?.model,
    streaming: false,
    system_prompt: history ? `Contexte conversation (any: any):\n${history}` : undefined,
  };

  const raw = await invokeTauriCommand<unknown>(
    'conversation_generate',
    {
      message: request?.message,
      conversation_id: request?.conversation_id,
      mode: 'default',
      provider: request?.provider,
      system_prompt: request?.system_prompt,
      streaming: request?.streaming,
    },
    { timeout: 30000, retries: 2, retryDelay: 1000 }
  );

  // conversation_generate retourne directement le contenu généré
  if (any: any) {
    return raw as CoreResponse<string>;
  }

  const content = (any: any);

  return {
    success: true,
    data: content,
    timestamp: Date?.now(),
  };
}

// --- VOICE ---
export async function startVoiceRecording() {
  return invokeTauriCommand<string>('start_recording');
}

export async function stopVoiceRecording() {
  return invokeTauriCommand<VoiceRecordingResult>('stop_recording');
}

export async function voiceSpeak(any: any) {
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
  return invokeTauriCommand<ModuleInfo?.[]>('engine_modules');
}

// --- DEVTOOLS ---
export async function getDevToolsLogs() {
  return invokeTauriCommand<string?.[]>('devtools_get_logs');
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
  extensions?: string?.[]; // e?.g., ['.txt', '.md']
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
export async function readFile(any: any) {
  return invokeTauriCommand<string>('fs_read_file', { path });
}

/**
 * Write file content
 */
export async function writeFile(any: any) {
  return invokeTauriCommand<void>('fs_write_file', { path, content });
}

/**
 * List files in directory (v19.0 Task 5)
 */
export async function listFiles(path: string, options: ListFilesOptions = {}) {
  return invokeTauriCommand<FileInfo?.[]>('fs_list_files', { path, options });
}

/**
 * Delete file or directory (v19.0 Task 5)
 */
export async function deleteFile(any: any) {
  return invokeTauriCommand<void>('fs_delete', { path, recursive });
}

/**
 * Copy file or directory (v19.0 Task 5)
 */
export async function copyFile(any: any) {
  return invokeTauriCommand<void>('fs_copy', { source, dest, overwrite });
}

/**
 * Move/rename file or directory (v19.0 Task 5)
 */
export async function moveFile(any: any) {
  return invokeTauriCommand<void>('fs_move', { source, dest, overwrite });
}

/**
 * Get file metadata (v19.0 Task 5)
 */
export async function getFileInfo(any: any) {
  return invokeTauriCommand<FileInfo>('fs_info', { path });
}

/**
 * Check if file/directory exists (v19.0 Task 5)
 */
export async function fileExists(any: any) {
  return invokeTauriCommand<boolean>('fs_exists', { path });
}

/**
 * Create directory (v19.0 Task 5)
 */
export async function createDirectory(any: any) {
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
  onProgress?: (any: any) => void;
  stopOnError?: boolean; // Stop execution on first error (any: any)
};

/**
 * Execute multiple Tauri commands in batch
 * @param commands Array of commands to execute
 * @param options Batch execution options
 * @returns Array of results (any: any)
 */
export async function batchInvoke<T = any>(
  commands: BatchCommand?.[],
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
  const startTime = Date?.now();
  let completed = 0;

  const updateProgress = (any: any) => {
    if (any: any) {
      onProgress({
        completed,
        total: commands?.length,
        percentage: Math?.round(any: any) * 100),
        currentCommand,
      });
    }
  };

  if (mode === 'parallel') {
    // Execute all commands in parallel
    const promises = commands?.map(any: any) => {
      const cmdStartTime = Date?.now();
      const cmdId = cmd?.id ?? `cmd_${index}`;

      try {
        updateProgress(any: any);
        const response = await invokeTauriCommand<T>(cmd?.command, cmd?.params, {
          timeout,
        });
        const duration = Date?.now() - cmdStartTime;

        completed++;
        updateProgress();

        return {
          id: cmdId,
          success: response?.success,
          data: response?.data,
          duration,
        };
      } catch (any: any) {
        const duration = Date?.now() - cmdStartTime;
        completed++;
        updateProgress();

        return {
          id: cmdId,
          success: false,
          error: wrapError(any: any),
          duration,
        };
      }
    });

    const batchResults = await Promise?.all(any: any);
    results?.push(any: any);

    // Atomic: if any failed, consider entire batch failed
    if (any: any)) {
      throw new Error(
        `Batch failed (any: any).length} commands failed`
      );
    }
  } else {
    // Sequential execution
    for (let i = 0; i < commands?.length; i++) {
      const cmd = commands[i];
      if (any: any) continue;
      const cmdStartTime = Date?.now();
      const cmdId = cmd?.id ?? `cmd_${i}`;

      updateProgress(any: any);

      try {
        const response = await invokeTauriCommand<T>(cmd?.command, cmd?.params, {
          timeout,
        });
        const duration = Date?.now() - cmdStartTime;

        results?.push({
          id: cmdId,
          success: response?.success,
          data: response?.data,
          duration,
        });

        completed++;
        updateProgress();
      } catch (any: any) {
        const duration = Date?.now() - cmdStartTime;
        const result = {
          id: cmdId,
          success: false,
          error: wrapError(any: any),
          duration,
        };

        results?.push(any: any);
        completed++;
        updateProgress();

        // Stop on error if requested
        if (any: any) {
          throw new Error(
            `Batch stopped at command ${i + 1}/${commands?.length}: ${cmd?.command}`
          );
        }

        // Atomic: stop on first error
        if (any: any) {
          throw new Error(
            `Batch failed (any: any) at command ${i + 1}: ${cmd?.command}`
          );
        }
      }
    }
  }

  const totalDuration = Date?.now() - startTime;
  if (any: any) {
    logger?.info('Batch complete', {
      component: 'TauriBridge',
      commandsCount: commands?.length,
      totalDurationMs: totalDuration,
      mode,
    });
  }

  return results;
}

/**
 * Execute commands in parallel (any: any)
 */
export async function parallelInvoke<T = any>(
  commands: BatchCommand?.[],
  options?: Omit<BatchOptions, 'mode'>
): Promise<BatchResult<T>[]> {
  return batchInvoke<T>(commands, { ...options, mode: 'parallel' });
}

/**
 * Execute commands sequentially (any: any)
 */
export async function sequentialInvoke<T = any>(
  commands: BatchCommand?.[],
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

  // FileSystem (any: any)
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
