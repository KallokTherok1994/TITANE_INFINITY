/**
 * TITANE∞ — Client Tauri Unique (PHASE_2)
 *
 * **Invariants:**
 * - `invoke()` autorisé uniquement dans ce fichier
 * - 1 wrapper typé par command Tauri
 * - Aucune logique métier ajoutée
 * - Erreurs normalisées via TAPIError
 * - Aucun log sensible
 *
 * **Usage:**
 * ```ts
 * import { tauriClient } from '@/lib/tauriClient';
 * await tauriClient.memoryGetState();
 * ```
 *
 * © 2026 TITANE Team. All rights reserved.
 */

import { secureInvoke } from '@/lib/security';
import { TAURI_COMMANDS, type TauriCommand } from '@/lib/tauriCommands';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Erreur Tauri standardisée
 */
export interface TauriError {
  code: string;
  message: string;
  command?: string;
  timestamp: number;
}

/**
 * Options d'invocation
 */
export interface TauriInvokeOptions {
  timeout?: number;
  skipWhitelistCheck?: boolean;
  skipInjectionCheck?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TAURI UNIQUE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Client Tauri centralisé avec wrappers typés
 *
 * **RÈGLE CRITIQUE:** Aucun appel `invoke()` direct autorisé hors de ce fichier
 */
class TauriClient {
  /**
   * Invoke générique (privé, utilisé uniquement par les wrappers)
   */
  private async invoke<T>(
    command: TauriCommand,
    payload: Record<string, unknown> = {},
    options?: TauriInvokeOptions
  ): Promise<T> {
    try {
      return await secureInvoke<T>(command, payload, options);
    } catch (error) {
      throw this.normalizeError(error, command);
    }
  }

  /**
   * Normalise les erreurs Tauri
   */
  private normalizeError(error: unknown, command?: string): TauriError {
    const timestamp = Date.now();

    if (error instanceof Error) {
      return {
        code: 'TAURI_ERROR',
        message: error.message,
        command,
        timestamp,
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'TAURI_ERROR',
        message: error,
        command,
        timestamp,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      command,
      timestamp,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WRAPPERS TYPÉS (1 par command) — AUTO-GENERATED
  // ═══════════════════════════════════════════════════════════════════════════

  async addTimelineEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ADD_TIMELINE_EVENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async agendaDeleteEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AGENDA_DELETE_EVENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async agendaSaveEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AGENDA_SAVE_EVENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async agendaSaveEvents(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AGENDA_SAVE_EVENTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async agendaSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AGENDA_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async aiCheckOllamaStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AI_CHECK_OLLAMA_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async aiGenerateLocal(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AI_GENERATE_LOCAL,
      (params as Record<string, unknown>) || {}
    );
  }

  async aiScanLocalModels(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AI_SCAN_LOCAL_MODELS,
      (params as Record<string, unknown>) || {}
    );
  }

  async aiSetLocalModel(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AI_SET_LOCAL_MODEL,
      (params as Record<string, unknown>) || {}
    );
  }

  async aiStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AI_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async analyzeBundleSize(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ANALYZE_BUNDLE_SIZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixAddMutex(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_ADD_MUTEX,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixResetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_RESET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixRestartPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_RESTART_PIPELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixRestartTauriCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_RESTART_TAURI_COMMAND,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixResyncLipsync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_RESYNC_LIPSYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixRustWarning(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_RUST_WARNING,
      (params as Record<string, unknown>) || {}
    );
  }

  async autofixTypescriptError(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOFIX_TYPESCRIPT_ERROR,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealClearNarrative(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_CLEAR_NARRATIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealClearPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_CLEAR_PIPELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealClearTtsQueue(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_CLEAR_TTS_QUEUE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealInitCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_INIT_COGNITIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealInitNarrative(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_INIT_NARRATIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealInitTts(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_INIT_TTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealRebuildMemoryIndex(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_REBUILD_MEMORY_INDEX,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealReloadAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_RELOAD_AVATAR,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealResetAdaptive(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_RESET_ADAPTIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealResetCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_RESET_COGNITIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealResyncLipsync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_RESYNC_LIPSYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealResyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_RESYNC_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealStartAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_START_AVATAR,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealStartPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_START_PIPELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealStopAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_STOP_AVATAR,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealStopPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_STOP_PIPELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async autohealValidateMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOHEAL_VALIDATE_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async automationExecuteAction(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTOMATION_EXECUTE_ACTION,
      (params as Record<string, unknown>) || {}
    );
  }

  async autonomyCleanMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTONOMY_CLEAN_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async autonomyFixTtsSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTONOMY_FIX_TTS_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async autonomyLogReport(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTONOMY_LOG_REPORT,
      (params as Record<string, unknown>) || {}
    );
  }

  async autonomyPing(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTONOMY_PING,
      (params as Record<string, unknown>) || {}
    );
  }

  async autonomyResyncSingularityState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.AUTONOMY_RESYNC_SINGULARITY_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async calibrateTitaneVoice(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CALIBRATE_TITANE_VOICE,
      (params as Record<string, unknown>) || {}
    );
  }

  async cameraStart(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CAMERA_START,
      (params as Record<string, unknown>) || {}
    );
  }

  async cancelRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CANCEL_RECORDING,
      (params as Record<string, unknown>) || {}
    );
  }

  async chatGetProvidersStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async chatModeChange(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CHAT_MODE_CHANGE,
      (params as Record<string, unknown>) || {}
    );
  }

  async chatModeSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CHAT_MODE_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async chatSendMessage(params?: unknown): Promise<unknown> {
    throw new Error(
      'Legacy chat_send_message is disabled. Use conversation_generate via ConversationManager.'
    );
  }

  async chatGenerateOpenai(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CHAT_GENERATE_OPENAI,
      (params as Record<string, unknown>) || {}
    );
  }

  async generateModePrompt(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GENERATE_MODE_PROMPT,
      (params as Record<string, unknown>) || {}
    );
  }

  async createModule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CREATE_MODULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async checkSqliteAvailable(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CHECK_SQLITE_AVAILABLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async clearAllMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLEAR_ALL_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async clearEventStream(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLEAR_EVENT_STREAM,
      (params as Record<string, unknown>) || {}
    );
  }

  async clearLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLEAR_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async clearMemoryCache(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLEAR_MEMORY_CACHE,
      (params as Record<string, unknown>) || {}
    );
  }

  async clearSystemLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLEAR_SYSTEM_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudRemoveDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_REMOVE_DEVICE,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudRestoreVault(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_RESTORE_VAULT,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudUpdateConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_UPDATE_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudAutoHeal(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_AUTO_HEAL,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudBackupVault(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_BACKUP_VAULT,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudGetDevices(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_GET_DEVICES,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudGetStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_GET_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudGetSyncHistory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_GET_SYNC_HISTORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudListBackups(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_LIST_BACKUPS,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudSyncPull(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_SYNC_PULL,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudSyncPush(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_SYNC_PUSH,
      (params as Record<string, unknown>) || {}
    );
  }

  async cloudVerifyIntegrity(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CLOUD_VERIFY_INTEGRITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async cognitiveGetMap(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.COGNITIVE_GET_MAP,
      (params as Record<string, unknown>) || {}
    );
  }

  async cognitiveGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.COGNITIVE_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async command(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.COMMAND,
      (params as Record<string, unknown>) || {}
    );
  }

  async completeOnboarding(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.COMPLETE_ONBOARDING,
      (params as Record<string, unknown>) || {}
    );
  }

  async confirmSelfHealingAction(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CONFIRM_SELF_HEALING_ACTION,
      (params as Record<string, unknown>) || {}
    );
  }

  async createConversation(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CREATE_CONVERSATION,
      (params as Record<string, unknown>) || {}
    );
  }

  async createNewConversation(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CREATE_NEW_CONVERSATION,
      (params as Record<string, unknown>) || {}
    );
  }

  async conversationGenerate(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CONVERSATION_GENERATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async conversationHealthCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CONVERSATION_HEALTH_CHECK,
      (params as Record<string, unknown>) || {}
    );
  }

  async conversationMemoryStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CONVERSATION_MEMORY_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async conversationReset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CONVERSATION_RESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpSetAiConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_SET_AI_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpGetAiConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_GET_AI_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpSetDesignConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_SET_DESIGN_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpGetDesignConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_GET_DESIGN_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async getDesignConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_GET_DESIGN_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpGetModulesStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_GET_MODULES_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getModulesStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_GET_MODULES_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpCheckForUpdates(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_CHECK_FOR_UPDATES,
      (params as Record<string, unknown>) || {}
    );
  }

  async cpToggleModule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_TOGGLE_MODULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardClearMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_CLEAR_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardDetectThreats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_DETECT_THREATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardEmergencyRollback(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_EMERGENCY_ROLLBACK,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardEmergencyShutdown(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_EMERGENCY_SHUTDOWN,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardKillThread(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_KILL_THREAD,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardResetPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_RESET_PIPELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async crashguardRestartModule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CRASHGUARD_RESTART_MODULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async deleteConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DELETE_CONFIG_PRESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async exportConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXPORT_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async expGetGlobalState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXP_GET_GLOBAL_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async expGetCategories(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXP_GET_CATEGORIES,
      (params as Record<string, unknown>) || {}
    );
  }

  async expGetProjects(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXP_GET_PROJECTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async expGetTalents(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXP_GET_TALENTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getAllConfigs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_ALL_CONFIGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async importConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IMPORT_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async deleteConversation(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DELETE_CONVERSATION,
      (params as Record<string, unknown>) || {}
    );
  }

  async deleteSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DELETE_SNAPSHOT,
      (params as Record<string, unknown>) || {}
    );
  }

  async getTravelStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_TRAVEL_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async listSnapshots(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LIST_SNAPSHOTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async deleteState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DELETE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devApplyPatch(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEV_APPLY_PATCH,
      (params as Record<string, unknown>) || {}
    );
  }

  async devGetLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEV_GET_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async devInspectFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEV_INSPECT_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devRunCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEV_RUN_COMMAND,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsDebugClear(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_DEBUG_CLEAR,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsDebugLast(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_DEBUG_LAST,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsDebugStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_DEBUG_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsDisable(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_DISABLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsEnable(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_ENABLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsMemoryStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_MEMORY_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsMemoryHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_MEMORY_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsMemorySearch(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_MEMORY_SEARCH,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsKnn(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_KNN,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsAnalyze(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_ANALYZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devtoolsStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DEVTOOLS_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineModules(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_MODULES,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineSingularityReset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_SINGULARITY_RESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesMonitoringGetDashboard(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_MONITORING_GET_DASHBOARD,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesGetDashboard(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_MONITORING_GET_DASHBOARD,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesMonitoringGetHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_MONITORING_GET_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesMonitoringGetMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_MONITORING_GET_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineGetNexusState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_GET_NEXUS_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineGetSingularityState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_GET_SINGULARITY_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async executeShellCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXECUTE_SHELL_COMMAND,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineStop(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_STOP,
      (params as Record<string, unknown>) || {}
    );
  }

  async engineTick(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINE_TICK,
      (params as Record<string, unknown>) || {}
    );
  }

  async evolutionGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EVOLUTION_GET_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async evolutionRunCycle(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EVOLUTION_RUN_CYCLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async evolutionSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EVOLUTION_SAVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async experienceUpdateState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.EXPERIENCE_UPDATE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async fsExists(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.FS_EXISTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async fullbodyAdvanceFrame(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.FULLBODY_ADVANCE_FRAME,
      (params as Record<string, unknown>) || {}
    );
  }

  async fusionAutoOptimize(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.FUSION_AUTO_OPTIMIZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async fusionMerge(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.FUSION_MERGE,
      (params as Record<string, unknown>) || {}
    );
  }

  async fusionSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.FUSION_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async getFilesByCategory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_FILES_BY_CATEGORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async getHeliosMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_HELIOS_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getCpuMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_CPU_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getEngineHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_ENGINE_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async getEnginesStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_ENGINES_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getHeliosState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_HELIOS_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getModuleHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_MODULE_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async getOnboardingPreferences(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_ONBOARDING_PREFERENCES,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSystemInfo(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SYSTEM_INFO,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSystemMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SYSTEM_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSystemHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SYSTEM_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async getRuntimeConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_RUNTIME_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async stateGet(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.STATE_GET,
      (params as Record<string, unknown>) || {}
    );
  }

  async getCognitiveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_COGNITIVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSingularityState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SINGULARITY_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSingularityStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SINGULARITY_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getTimeline(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_TIMELINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async healthCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HEALTH_CHECK,
      (params as Record<string, unknown>) || {}
    );
  }

  async hybridAnalyzeCode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYBRID_ANALYZE_CODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperSetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_SET_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperGetThoughts(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_GET_THOUGHTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperGetInsights(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_GET_INSIGHTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperThink(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_THINK,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperReason(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_REASON,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperImagine(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_IMAGINE,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperGenerateInsight(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_GENERATE_INSIGHT,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperPredictIssues(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_PREDICT_ISSUES,
      (params as Record<string, unknown>) || {}
    );
  }

  async hyperAccelerate(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPER_ACCELERATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async hypervisionStart(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPERVISION_START,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetMatrix(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_MATRIX,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetPersonalitySnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_PERSONALITY_SNAPSHOT,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityListVoiceProfiles(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_LIST_VOICE_PROFILES,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetCurrentTone(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_CURRENT_TONE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetCurrentMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_CURRENT_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetAvailableModes(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_AVAILABLE_MODES,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetActiveRules(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_ACTIVE_RULES,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityGetCoherenceScore(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_GET_COHERENCE_SCORE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityDisableRule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_DISABLE_RULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identityEnableRule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_ENABLE_RULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identitySetMatrix(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_SET_MATRIX,
      (params as Record<string, unknown>) || {}
    );
  }

  async identitySetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_SET_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async identitySetActiveVoiceProfile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.IDENTITY_SET_ACTIVE_VOICE_PROFILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async installUpdate(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.INSTALL_UPDATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async checkForUpdates(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.CP_CHECK_FOR_UPDATES,
      (params as Record<string, unknown>) || {}
    );
  }

  async knowledgeIngest(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.KNOWLEDGE_INGEST,
      (params as Record<string, unknown>) || {}
    );
  }

  async knowledgeSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.KNOWLEDGE_SAVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async loadConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LOAD_CONFIG_PRESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async listConfigPresets(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LIST_CONFIG_PRESETS,
      (params as Record<string, unknown>) || {}
    );
  }

  async listConversations(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LIST_CONVERSATIONS,
      (params as Record<string, unknown>) || {}
    );
  }

  async loadConversation(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LOAD_CONVERSATION,
      (params as Record<string, unknown>) || {}
    );
  }

  async logEntries(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LOG_ENTRIES,
      (params as Record<string, unknown>) || {}
    );
  }

  async logToFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LOG_TO_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryCheckAndRepair(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_CHECK_AND_REPAIR,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryClear(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_CLEAR,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryClearAll(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_CLEAR_ALL,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_CLUSTER,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryCompress(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_COMPRESS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryCreateBackup(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_CREATE_BACKUP,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryDeleteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_DELETE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryExtractPatterns(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_EXTRACT_PATTERNS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryEvolutionStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_EVOLUTION_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetClusters(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_CLUSTERS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetActiveProjects(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_ACTIVE_PROJECTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetAllKeys(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_ALL_KEYS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getMemoryStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GET_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryHierarchyHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_HIERARCHY_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryGrow(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_GROW,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryIngestFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_INGEST_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryParse(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_PARSE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryPrune(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_PRUNE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memorySearch(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_SEARCH,
      (params as Record<string, unknown>) || {}
    );
  }

  async memorySaveChatInteraction(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_SAVE_CHAT_INTERACTION,
      (params as Record<string, unknown>) || {}
    );
  }

  async memorySaveEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_SAVE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryScan(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_SCAN,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryStore(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_STORE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memorySynthesize(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_SYNTHESIZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async memoryEvolveFull(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MEMORY_EVOLVE_FULL,
      (params as Record<string, unknown>) || {}
    );
  }

  async meshInitialize(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MESH_INITIALIZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async meshGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MESH_GET_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaGetAlignment(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_GET_ALIGNMENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaGetMonitoringMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_GET_MONITORING_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaGetReport(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_GET_REPORT,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaSelftestAll(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_SELFTEST_ALL,
      (params as Record<string, unknown>) || {}
    );
  }

  async metaTriggerSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.META_TRIGGER_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async multiAiGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.MULTI_AI_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async nexusGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.NEXUS_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async harmoniaGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HARMONIA_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestratorGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATOR_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestratorGetMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATOR_GET_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestratorInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATOR_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestrationGetUnifiedState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATION_GET_UNIFIED_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestrationGetCognitiveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATION_GET_COGNITIVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestratorRunCycle(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATOR_RUN_CYCLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async orchestratorSetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ORCHESTRATOR_SET_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async parseDocument(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PARSE_DOCUMENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async detectFileFormat(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.DETECT_FILE_FORMAT,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceCompressMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_COMPRESS_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceGetMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_GET_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceOptimizeGpu(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_OPTIMIZE_GPU,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceReduceRenderQuality(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_REDUCE_RENDER_QUALITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceResetOptimizations(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_RESET_OPTIMIZATIONS,
      (params as Record<string, unknown>) || {}
    );
  }

  async performanceThrottleCpu(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERFORMANCE_THROTTLE_CPU,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryAddToBundle(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_ADD_TO_BUNDLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryArchiveEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_ARCHIVE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryCreateBundle(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_CREATE_BUNDLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryCreateSummary(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_CREATE_SUMMARY,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryDeleteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_DELETE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryExport(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_EXPORT,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryGetBundles(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_GET_BUNDLES,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryGetContext(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_GET_CONTEXT,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_GET_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryRead(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_READ,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryPromoteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_PROMOTE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async persistentMemoryWriteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSISTENT_MEMORY_WRITE_ENTRY,
      (params as Record<string, unknown>) || {}
    );
  }

  async personaGetMultipliers(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PERSONA_GET_MULTIPLIERS,
      (params as Record<string, unknown>) || {}
    );
  }

  async ping(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PING,
      (params as Record<string, unknown>) || {}
    );
  }

  async pingGemini(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PING_GEMINI,
      (params as Record<string, unknown>) || {}
    );
  }

  async pingOllama(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PING_OLLAMA,
      (params as Record<string, unknown>) || {}
    );
  }

  async progressionSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.PROGRESSION_SAVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async readJsonFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.READ_JSON_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async realityAddEntity(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_ADD_ENTITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async realityGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async realityInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async realityRenderFrame(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_RENDER_FRAME,
      (params as Record<string, unknown>) || {}
    );
  }

  async realitySetRenderConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_SET_RENDER_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async realityTogglePhysics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALITY_TOGGLE_PHYSICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async realtimeNetworkTask(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REALTIME_NETWORK_TASK,
      (params as Record<string, unknown>) || {}
    );
  }

  async rejectSelfHealingAction(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REJECT_SELF_HEALING_ACTION,
      (params as Record<string, unknown>) || {}
    );
  }

  async reportChatError(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.REPORT_CHAT_ERROR,
      (params as Record<string, unknown>) || {}
    );
  }

  async resetMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RESET_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async resetOnboarding(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RESET_ONBOARDING,
      (params as Record<string, unknown>) || {}
    );
  }

  async restartCores(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RESTART_CORES,
      (params as Record<string, unknown>) || {}
    );
  }

  async restoreSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RESTORE_SNAPSHOT,
      (params as Record<string, unknown>) || {}
    );
  }

  async runHardeningSelftest(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RUN_HARDENING_SELFTEST,
      (params as Record<string, unknown>) || {}
    );
  }

  async runSystemDiagnostic(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RUN_SYSTEM_DIAGNOSTIC,
      (params as Record<string, unknown>) || {}
    );
  }

  async saveConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SAVE_CONFIG_PRESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async updateUiToken(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.UPDATE_UI_TOKEN,
      (params as Record<string, unknown>) || {}
    );
  }

  async loadUiTheme(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.LOAD_UI_THEME,
      (params as Record<string, unknown>) || {}
    );
  }

  async resetUiTheme(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.RESET_UI_THEME,
      (params as Record<string, unknown>) || {}
    );
  }

  async saveUiTheme(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SAVE_UI_THEME,
      (params as Record<string, unknown>) || {}
    );
  }

  async scAddLog(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_ADD_LOG,
      (params as Record<string, unknown>) || {}
    );
  }

  async scClearLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_CLEAR_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetClusterStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_CLUSTER_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetClusterPeers(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_CLUSTER_PEERS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetLogStats(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_LOG_STATS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionGetMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_GET_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionGetLayers(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_GET_LAYERS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionGetAnomalies(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_GET_ANOMALIES,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionStart(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HYPERVISION_START,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionClearAnomalies(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_CLEAR_ANOMALIES,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionResolveAnomaly(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_RESOLVE_ANOMALY,
      (params as Record<string, unknown>) || {}
    );
  }

  async scHypervisionStop(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_HYPERVISION_STOP,
      (params as Record<string, unknown>) || {}
    );
  }

  async scInitializeCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INITIALIZE_CLUSTER,
      (params as Record<string, unknown>) || {}
    );
  }

  async scShutdownCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_SHUTDOWN_CLUSTER,
      (params as Record<string, unknown>) || {}
    );
  }

  async hasSecret(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.HAS_SECRET,
      (params as Record<string, unknown>) || {}
    );
  }

  async secureListFiles(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SECURE_LIST_FILES,
      (params as Record<string, unknown>) || {}
    );
  }

  async secureStoreKey(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SECURE_STORE_KEY,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSelfHealingHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_GET_HEALTH,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSelfHealingState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSelfHealingPrediction(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_GET_PREDICTION,
      (params as Record<string, unknown>) || {}
    );
  }

  async forceSelfHealingEvaluation(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_FORCE_EVALUATION,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealClearCache(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_CLEAR_CACHE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealIsolateModule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_ISOLATE_MODULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealMiniAudit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_MINI_AUDIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRebuildMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_REBUILD_MEMORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRegenerateConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_REGENERATE_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRepairJson(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_REPAIR_JSON,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealResetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_RESET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRestartModule(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_RESTART_MODULE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRestartProcess(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_RESTART_PROCESS,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealRestartWorker(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_RESTART_WORKER,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealSaveProfile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_SAVE_PROFILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealSwitchProvider(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_SWITCH_PROVIDER,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealSyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_SYNC_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async selfhealSyncWithSingularity(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SELFHEAL_SYNC_WITH_SINGULARITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async sendAudioChunk(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SEND_AUDIO_CHUNK,
      (params as Record<string, unknown>) || {}
    );
  }

  async getDashboardMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_DASHBOARD_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getCoreInfo(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_CORE_INFO,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSystemLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SYSTEM_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getEventStream(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_EVENT_STREAM,
      (params as Record<string, unknown>) || {}
    );
  }

  async getLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async getAudioOutputDevices(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_AUDIO_OUTPUT_DEVICES,
      (params as Record<string, unknown>) || {}
    );
  }

  async getAudioInputDevices(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_AUDIO_INPUT_DEVICES,
      (params as Record<string, unknown>) || {}
    );
  }

  async vadTest(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VAD_TEST,
      (params as Record<string, unknown>) || {}
    );
  }

  async setAudioInputDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SET_AUDIO_INPUT_DEVICE,
      (params as Record<string, unknown>) || {}
    );
  }

  async setAudioOutputDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SET_AUDIO_OUTPUT_DEVICE,
      (params as Record<string, unknown>) || {}
    );
  }

  async setState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityAutonomyHeal(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_AUTONOMY_HEAL,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityCheckCoherence(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_CHECK_COHERENCE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityGetFullState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_GET_FULL_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityGetGlobalCoherence(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_GET_GLOBAL_COHERENCE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityLoadState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_LOAD_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularitySaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_SAVE_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularitySelfCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_SELF_CHECK,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdateAdaptive(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_ADAPTIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdateCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_COGNITIVE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdateFullState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_FULL_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdateMeta(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_META,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdatePhysical(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_PHYSICAL,
      (params as Record<string, unknown>) || {}
    );
  }

  async singularityUpdateSymbolic(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SINGULARITY_UPDATE_SYMBOLIC,
      (params as Record<string, unknown>) || {}
    );
  }

  async speak(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SPEAK,
      (params as Record<string, unknown>) || {}
    );
  }

  async startRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.START_RECORDING,
      (params as Record<string, unknown>) || {}
    );
  }

  async startWhisperStreaming(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.START_WHISPER_STREAMING,
      (params as Record<string, unknown>) || {}
    );
  }

  async stopRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.STOP_RECORDING,
      (params as Record<string, unknown>) || {}
    );
  }

  async stopWhisperStreaming(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.STOP_WHISPER_STREAMING,
      (params as Record<string, unknown>) || {}
    );
  }

  async storeFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.STORE_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  async submitEvolutionData(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SUBMIT_EVOLUTION_DATA,
      (params as Record<string, unknown>) || {}
    );
  }

  async syncEvolutionState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SYNC_EVOLUTION_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async systemGetStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SYSTEM_GET_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async systemOptimize(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SYSTEM_OPTIMIZE,
      (params as Record<string, unknown>) || {}
    );
  }

  async systemRecovery(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SYSTEM_RECOVERY,
      (params as Record<string, unknown>) || {}
    );
  }

  async testMicrophone(
    params?: unknown,
    options?: TauriInvokeOptions
  ): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TEST_MICROPHONE,
      (params as Record<string, unknown>) || {},
      options
    );
  }

  async testTts(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TEST_TTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async testAiLocal(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TEST_AI_LOCAL,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanForceSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_FORCE_SNAPSHOT,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanPersistenceInit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_PERSISTENCE_INIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanPersistenceShutdown(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_PERSISTENCE_SHUTDOWN,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanPersistEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_PERSIST_EVENT,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanStateGet(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_STATE_GET,
      (params as Record<string, unknown>) || {}
    );
  }

  async toggleSafeMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TOGGLE_SAFE_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async toggleSingularity(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TOGGLE_SINGULARITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async ttsSpeak(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TTS_SPEAK,
      (params as Record<string, unknown>) || {}
    );
  }

  async ttsStop(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TTS_STOP,
      (params as Record<string, unknown>) || {}
    );
  }

  async updateChatEngineConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.UPDATE_CHAT_ENGINE_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async updateRuntimeConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.UPDATE_RUNTIME_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async vadConfigure(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VAD_CONFIGURE,
      (params as Record<string, unknown>) || {}
    );
  }

  async vadGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VAD_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async vadProcessFrame(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VAD_PROCESS_FRAME,
      (params as Record<string, unknown>) || {}
    );
  }

  async vadReset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VAD_RESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async vectorStoreDelete(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VECTOR_STORE_DELETE,
      (params as Record<string, unknown>) || {}
    );
  }

  async vectorStoreInsert(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VECTOR_STORE_INSERT,
      (params as Record<string, unknown>) || {}
    );
  }

  async vectorStoreUpdate(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.VECTOR_STORE_UPDATE,
      (params as Record<string, unknown>) || {}
    );
  }

  // DEPRECATED: Use secureInvoke('start_recording', { config }) directly
  // async voiceStartRecording(params?: unknown): Promise<unknown> {
  //   return await this.invoke('start_recording', (params as Record<string, unknown>) || {});
  // }

  async windowSetFullscreen(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_SET_FULLSCREEN,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowSetZoom(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_SET_ZOOM,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowZoomReset(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_ZOOM_RESET,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowGetZoom(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_GET_ZOOM,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowIsFullscreen(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_IS_FULLSCREEN,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowToggleFullscreen(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_TOGGLE_FULLSCREEN,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowZoomIn(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_ZOOM_IN,
      (params as Record<string, unknown>) || {}
    );
  }

  async windowZoomOut(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WINDOW_ZOOM_OUT,
      (params as Record<string, unknown>) || {}
    );
  }

  async writeLog(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WRITE_LOG,
      (params as Record<string, unknown>) || {}
    );
  }

  async writeSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.WRITE_SNAPSHOT,
      (params as Record<string, unknown>) || {}
    );
  }

  async xpGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.XP_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async xpSyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.XP_SYNC_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPER MODE WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async devmodeGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeEnable(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_ENABLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeDisable(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_DISABLE,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeValidatePatch(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_VALIDATE_PATCH,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeApplyPatch(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_APPLY_PATCH,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodePreview(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_PREVIEW,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeRollback(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_ROLLBACK,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeGetHistory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_GET_HISTORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeCreateBackup(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_CREATE_BACKUP,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeRestoreBackup(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_RESTORE_BACKUP,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeGetSuggestions(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_GET_SUGGESTIONS,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeChangelog(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_CHANGELOG,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesBuildStart(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_BUILD_START,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesBuildGetStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_BUILD_GET_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesBuildGetResult(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_BUILD_GET_RESULT,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesBuildCancel(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_BUILD_CANCEL,
      (params as Record<string, unknown>) || {}
    );
  }

  async enginesBuildClean(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_BUILD_CLEAN,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QA MONITORING WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async qaGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaListTestSuites(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_LIST_TEST_SUITES,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaRunTestSuite(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_RUN_TEST_SUITE,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaGetTestResult(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_TEST_RESULT,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaListMonitors(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_LIST_MONITORS,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaCreateMonitor(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_CREATE_MONITOR,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaToggleMonitor(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_TOGGLE_MONITOR,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaDeleteMonitor(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_DELETE_MONITOR,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaGetSystemMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_SYSTEM_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaListAlerts(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_LIST_ALERTS,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaAcknowledgeAlert(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_ACKNOWLEDGE_ALERT,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaResolveAlert(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_RESOLVE_ALERT,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaGetHardeningConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_HARDENING_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaUpdateHardeningConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_UPDATE_HARDENING_CONFIG,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaRunSecurityAudit(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_RUN_SECURITY_AUDIT,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaGetPerformanceReport(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_PERFORMANCE_REPORT,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaGetLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_GET_LOGS,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaExportMetricsPrometheus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_EXPORT_METRICS_PROMETHEUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async qaHealthCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.QA_HEALTH_CHECK,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ONE CORE WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async oneCoreGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_GET_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreGetMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_GET_METRICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreListCommands(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_LIST_COMMANDS,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreGetEventHistory(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_GET_EVENT_HISTORY,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreExecuteCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_EXECUTE_COMMAND,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreRunDiagnostic(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_RUN_DIAGNOSTIC,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreForceSync(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_FORCE_SYNC,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreCleanup(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_CLEANUP,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreSetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_SET_MODE,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreVerifyIntegrity(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_VERIFY_INTEGRITY,
      (params as Record<string, unknown>) || {}
    );
  }

  async oneCoreGetEngineStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ONE_CORE_GET_ENGINE_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM CENTER HOOKS WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async scRunQuickDiagnostics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_RUN_QUICK_DIAGNOSTICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scRunFullDiagnostics(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_RUN_FULL_DIAGNOSTICS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetEnv(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_ENV,
      (params as Record<string, unknown>) || {}
    );
  }

  async scGetDiagnosticStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_GET_DIAGNOSTIC_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async scIntrospectionGenerate(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_GENERATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async scIntrospectionPreview(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_PREVIEW,
      (params as Record<string, unknown>) || {}
    );
  }

  async scIntrospectionAutoFix(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_AUTO_FIX,
      (params as Record<string, unknown>) || {}
    );
  }

  async scIntrospectionQuickScan(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_QUICK_SCAN,
      (params as Record<string, unknown>) || {}
    );
  }

  async scIntrospectionFullScan(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_FULL_SCAN,
      (params as Record<string, unknown>) || {}
    );
  }

  async introspectionScan(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.INTROSPECTION_SCAN,
      (params as Record<string, unknown>) || {}
    );
  }

  async introspectionAutoFix(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.SC_INTROSPECTION_AUTO_FIX,
      (params as Record<string, unknown>) || {}
    );
  }

  async getMemoryState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_MEMORY_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getSystemState(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_SYSTEM_STATE,
      (params as Record<string, unknown>) || {}
    );
  }

  async getPersistenceStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.GET_PERSISTENCE_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async titanGetPersistenceStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.TITAN_GET_PERSISTENCE_STATUS,
      (params as Record<string, unknown>) || {}
    );
  }

  async devmodeAnalyzeFile(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.ENGINES_DEVMODE_ANALYZE_FILE,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO CENTER WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async sttTranscribe(params?: unknown): Promise<unknown> {
    return await this.invoke(
      TAURI_COMMANDS.STT_TRANSCRIBE,
      (params as Record<string, unknown>) || {}
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
}

/**
 * Instance unique du client Tauri (singleton)
 */
export const tauriClient = new TauriClient();

/**
 * Export du type pour faciliter les tests
 */
export type { TauriClient };
