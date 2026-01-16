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
import type { SingularityState } from '@/types/singularityState';

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
    return await this.invoke(TAURI_COMMANDS.ADD_TIMELINE_EVENT, params || {});
  }

  async agendaDeleteEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AGENDA_DELETE_EVENT, params || {});
  }

  async agendaSaveEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AGENDA_SAVE_EVENT, params || {});
  }

  async agendaSaveEvents(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AGENDA_SAVE_EVENTS, params || {});
  }

  async agendaSync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AGENDA_SYNC, params || {});
  }

  async autofixAddMutex(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_ADD_MUTEX, params || {});
  }

  async autofixResetState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_RESET_STATE, params || {});
  }

  async autofixRestartPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_RESTART_PIPELINE, params || {});
  }

  async autofixRestartTauriCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_RESTART_TAURI_COMMAND, params || {});
  }

  async autofixResyncLipsync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_RESYNC_LIPSYNC, params || {});
  }

  async autofixRustWarning(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_RUST_WARNING, params || {});
  }

  async autofixTypescriptError(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOFIX_TYPESCRIPT_ERROR, params || {});
  }

  async autohealClearNarrative(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_CLEAR_NARRATIVE, params || {});
  }

  async autohealClearPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_CLEAR_PIPELINE, params || {});
  }

  async autohealClearTtsQueue(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_CLEAR_TTS_QUEUE, params || {});
  }

  async autohealInitCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_INIT_COGNITIVE, params || {});
  }

  async autohealInitNarrative(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_INIT_NARRATIVE, params || {});
  }

  async autohealInitTts(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_INIT_TTS, params || {});
  }

  async autohealRebuildMemoryIndex(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_REBUILD_MEMORY_INDEX, params || {});
  }

  async autohealReloadAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_RELOAD_AVATAR, params || {});
  }

  async autohealResetAdaptive(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_RESET_ADAPTIVE, params || {});
  }

  async autohealResetCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_RESET_COGNITIVE, params || {});
  }

  async autohealResyncLipsync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_RESYNC_LIPSYNC, params || {});
  }

  async autohealResyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_RESYNC_STATE, params || {});
  }

  async autohealStartAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_START_AVATAR, params || {});
  }

  async autohealStartPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_START_PIPELINE, params || {});
  }

  async autohealStopAvatar(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_STOP_AVATAR, params || {});
  }

  async autohealStopPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_STOP_PIPELINE, params || {});
  }

  async autohealValidateMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOHEAL_VALIDATE_MEMORY, params || {});
  }

  async automationExecuteAction(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTOMATION_EXECUTE_ACTION, params || {});
  }

  async autonomyCleanMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTONOMY_CLEAN_MEMORY, params || {});
  }

  async autonomyFixTtsSync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTONOMY_FIX_TTS_SYNC, params || {});
  }

  async autonomyLogReport(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTONOMY_LOG_REPORT, params || {});
  }

  async autonomyPing(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTONOMY_PING, params || {});
  }

  async autonomyResyncSingularityState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.AUTONOMY_RESYNC_SINGULARITY_STATE, params || {});
  }

  async calibrateTitaneVoice(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CALIBRATE_TITANE_VOICE, params || {});
  }

  async cameraStart(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CAMERA_START, params || {});
  }

  async cancelRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CANCEL_RECORDING, params || {});
  }

  async chatGetProvidersStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS, params || {});
  }

  async chatModeChange(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CHAT_MODE_CHANGE, params || {});
  }

  async chatModeSync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CHAT_MODE_SYNC, params || {});
  }

  async chatSendMessage(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CHAT_SEND_MESSAGE, params || {});
  }

  async checkSqliteAvailable(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CHECK_SQLITE_AVAILABLE, params || {});
  }

  async clearAllMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLEAR_ALL_MEMORY, params || {});
  }

  async clearEventStream(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLEAR_EVENT_STREAM, params || {});
  }

  async clearLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLEAR_LOGS, params || {});
  }

  async clearMemoryCache(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLEAR_MEMORY_CACHE, params || {});
  }

  async clearSystemLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLEAR_SYSTEM_LOGS, params || {});
  }

  async cloudRemoveDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLOUD_REMOVE_DEVICE, params || {});
  }

  async cloudRestoreVault(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLOUD_RESTORE_VAULT, params || {});
  }

  async cloudUpdateConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CLOUD_UPDATE_CONFIG, params || {});
  }

  async cognitiveGetMap(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.COGNITIVE_GET_MAP, params || {});
  }

  async command(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.COMMAND, params || {});
  }

  async completeOnboarding(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.COMPLETE_ONBOARDING, params || {});
  }

  async confirmSelfHealingAction(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CONFIRM_SELF_HEALING_ACTION, params || {});
  }

  async conversationGenerate(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CONVERSATION_GENERATE, params || {});
  }

  async conversationReset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CONVERSATION_RESET, params || {});
  }

  async cpSetAiConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CP_SET_AI_CONFIG, params || {});
  }

  async cpSetDesignConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CP_SET_DESIGN_CONFIG, params || {});
  }

  async cpToggleModule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CP_TOGGLE_MODULE, params || {});
  }

  async crashguardClearMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_CLEAR_MEMORY, params || {});
  }

  async crashguardEmergencyRollback(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_EMERGENCY_ROLLBACK, params || {});
  }

  async crashguardEmergencyShutdown(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_EMERGENCY_SHUTDOWN, params || {});
  }

  async crashguardKillThread(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_KILL_THREAD, params || {});
  }

  async crashguardResetPipeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_RESET_PIPELINE, params || {});
  }

  async crashguardRestartModule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.CRASHGUARD_RESTART_MODULE, params || {});
  }

  async deleteConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DELETE_CONFIG_PRESET, params || {});
  }

  async deleteConversation(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DELETE_CONVERSATION, params || {});
  }

  async deleteSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DELETE_SNAPSHOT, params || {});
  }

  async deleteState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DELETE_STATE, params || {});
  }

  async devApplyPatch(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEV_APPLY_PATCH, params || {});
  }

  async devGetLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEV_GET_LOGS, params || {});
  }

  async devInspectFile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEV_INSPECT_FILE, params || {});
  }

  async devRunCommand(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEV_RUN_COMMAND, params || {});
  }

  async devtoolsDebugClear(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEVTOOLS_DEBUG_CLEAR, params || {});
  }

  async devtoolsDisable(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEVTOOLS_DISABLE, params || {});
  }

  async devtoolsEnable(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.DEVTOOLS_ENABLE, params || {});
  }

  async engineInit(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ENGINE_INIT, params || {});
  }

  async engineSingularityReset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ENGINE_SINGULARITY_RESET, params || {});
  }

  async enginesMonitoringGetDashboard(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ENGINES_MONITORING_GET_DASHBOARD, params || {});
  }

  async engineStop(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ENGINE_STOP, params || {});
  }

  async engineTick(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ENGINE_TICK, params || {});
  }

  async evolutionGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.EVOLUTION_GET_STATS, params || {});
  }

  async evolutionRunCycle(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.EVOLUTION_RUN_CYCLE, params || {});
  }

  async evolutionSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.EVOLUTION_SAVE_STATE, params || {});
  }

  async experienceUpdateState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.EXPERIENCE_UPDATE_STATE, params || {});
  }

  async fsExists(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.FS_EXISTS, params || {});
  }

  async fullbodyAdvanceFrame(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.FULLBODY_ADVANCE_FRAME, params || {});
  }

  async fusionAutoOptimize(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.FUSION_AUTO_OPTIMIZE, params || {});
  }

  async fusionMerge(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.FUSION_MERGE, params || {});
  }

  async fusionSync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.FUSION_SYNC, params || {});
  }

  async getFilesByCategory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_FILES_BY_CATEGORY, params || {});
  }

  async getHeliosMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_HELIOS_METRICS, params || {});
  }

  async getModuleHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_MODULE_HEALTH, params || {});
  }

  async getOnboardingPreferences(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_ONBOARDING_PREFERENCES, params || {});
  }

  async getSystemHealth(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_SYSTEM_HEALTH, params || {});
  }

  async getTimeline(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.GET_TIMELINE, params || {});
  }

  async healthCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.HEALTH_CHECK, params || {});
  }

  async hybridAnalyzeCode(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.HYBRID_ANALYZE_CODE, params || {});
  }

  async hyperSetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.HYPER_SET_MODE, params || {});
  }

  async hypervisionStart(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.HYPERVISION_START, params || {});
  }

  async identityDisableRule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.IDENTITY_DISABLE_RULE, params || {});
  }

  async identityEnableRule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.IDENTITY_ENABLE_RULE, params || {});
  }

  async identitySetMatrix(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.IDENTITY_SET_MATRIX, params || {});
  }

  async identitySetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.IDENTITY_SET_MODE, params || {});
  }

  async identitySetVoiceProfile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.IDENTITY_SET_VOICE_PROFILE, params || {});
  }

  async installUpdate(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.INSTALL_UPDATE, params || {});
  }

  async knowledgeIngest(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.KNOWLEDGE_INGEST, params || {});
  }

  async knowledgeSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.KNOWLEDGE_SAVE_STATE, params || {});
  }

  async loadConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.LOAD_CONFIG_PRESET, params || {});
  }

  async logEntries(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.LOG_ENTRIES, params || {});
  }

  async logToFile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.LOG_TO_FILE, params || {});
  }

  async memoryCheckAndRepair(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_CHECK_AND_REPAIR, params || {});
  }

  async memoryClear(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_CLEAR, params || {});
  }

  async memoryClearAll(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_CLEAR_ALL, params || {});
  }

  async memoryCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_CLUSTER, params || {});
  }

  async memoryCompress(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_COMPRESS, params || {});
  }

  async memoryCreateBackup(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_CREATE_BACKUP, params || {});
  }

  async memoryDeleteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_DELETE_ENTRY, params || {});
  }

  async memoryExtractPatterns(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_EXTRACT_PATTERNS, params || {});
  }

  async memoryGetActiveProjects(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_GET_ACTIVE_PROJECTS, params || {});
  }

  async memoryGetStats(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_GET_STATS, params || {});
  }

  async memoryGrow(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_GROW, params || {});
  }

  async memoryIngestFile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_INGEST_FILE, params || {});
  }

  async memoryParse(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_PARSE, params || {});
  }

  async memoryPrune(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_PRUNE, params || {});
  }

  async memorySaveChatInteraction(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_SAVE_CHAT_INTERACTION, params || {});
  }

  async memorySaveEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_SAVE_ENTRY, params || {});
  }

  async memoryScan(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_SCAN, params || {});
  }

  async memoryStore(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_STORE, params || {});
  }

  async memorySynthesize(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MEMORY_SYNTHESIZE, params || {});
  }

  async meshInitialize(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.MESH_INITIALIZE, params || {});
  }

  async metaGetAlignment(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_GET_ALIGNMENT, params || {});
  }

  async metaGetMonitoringMetrics(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_GET_MONITORING_METRICS, params || {});
  }

  async metaGetReport(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_GET_REPORT, params || {});
  }

  async metaGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_GET_STATE, params || {});
  }

  async metaSelftestAll(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_SELFTEST_ALL, params || {});
  }

  async metaTriggerSync(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.META_TRIGGER_SYNC, params || {});
  }

  async orchestratorRunCycle(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ORCHESTRATOR_RUN_CYCLE, params || {});
  }

  async orchestratorSetMode(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.ORCHESTRATOR_SET_MODE, params || {});
  }

  async parseDocument(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PARSE_DOCUMENT, params || {});
  }

  async performanceCompressMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERFORMANCE_COMPRESS_MEMORY, params || {});
  }

  async performanceOptimizeGpu(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERFORMANCE_OPTIMIZE_GPU, params || {});
  }

  async performanceReduceRenderQuality(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERFORMANCE_REDUCE_RENDER_QUALITY, params || {});
  }

  async performanceResetOptimizations(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERFORMANCE_RESET_OPTIMIZATIONS, params || {});
  }

  async performanceThrottleCpu(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERFORMANCE_THROTTLE_CPU, params || {});
  }

  async persistentMemoryAddToBundle(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERSISTENT_MEMORY_ADD_TO_BUNDLE, params || {});
  }

  async persistentMemoryArchiveEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERSISTENT_MEMORY_ARCHIVE_ENTRY, params || {});
  }

  async persistentMemoryDeleteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERSISTENT_MEMORY_DELETE_ENTRY, params || {});
  }

  async persistentMemoryPromoteEntry(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERSISTENT_MEMORY_PROMOTE_ENTRY, params || {});
  }

  async personaGetMultipliers(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PERSONA_GET_MULTIPLIERS, params || {});
  }

  async ping(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PING, params || {});
  }

  async pingGemini(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PING_GEMINI, params || {});
  }

  async pingOllama(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PING_OLLAMA, params || {});
  }

  async progressionSaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.PROGRESSION_SAVE_STATE, params || {});
  }

  async readJsonFile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.READ_JSON_FILE, params || {});
  }

  async realityAddEntity(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REALITY_ADD_ENTITY, params || {});
  }

  async realitySetRenderConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REALITY_SET_RENDER_CONFIG, params || {});
  }

  async realityTogglePhysics(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REALITY_TOGGLE_PHYSICS, params || {});
  }

  async realtimeNetworkTask(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REALTIME_NETWORK_TASK, params || {});
  }

  async rejectSelfHealingAction(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REJECT_SELF_HEALING_ACTION, params || {});
  }

  async reportChatError(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.REPORT_CHAT_ERROR, params || {});
  }

  async resetMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.RESET_MEMORY, params || {});
  }

  async resetOnboarding(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.RESET_ONBOARDING, params || {});
  }

  async restartCores(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.RESTART_CORES, params || {});
  }

  async restoreSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.RESTORE_SNAPSHOT, params || {});
  }

  async runHardeningSelftest(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.RUN_HARDENING_SELFTEST, params || {});
  }

  async saveConfigPreset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SAVE_CONFIG_PRESET, params || {});
  }

  async saveUiTheme(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SAVE_UI_THEME, params || {});
  }

  async scAddLog(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_ADD_LOG, params || {});
  }

  async scClearLogs(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_CLEAR_LOGS, params || {});
  }

  async scHypervisionClearAnomalies(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_HYPERVISION_CLEAR_ANOMALIES, params || {});
  }

  async scHypervisionResolveAnomaly(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_HYPERVISION_RESOLVE_ANOMALY, params || {});
  }

  async scHypervisionStop(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_HYPERVISION_STOP, params || {});
  }

  async scInitializeCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_INITIALIZE_CLUSTER, params || {});
  }

  async scShutdownCluster(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SC_SHUTDOWN_CLUSTER, params || {});
  }

  async secureListFiles(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SECURE_LIST_FILES, params || {});
  }

  async secureStoreKey(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SECURE_STORE_KEY, params || {});
  }

  async selfhealClearCache(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_CLEAR_CACHE, params || {});
  }

  async selfhealIsolateModule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_ISOLATE_MODULE, params || {});
  }

  async selfhealMiniAudit(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_MINI_AUDIT, params || {});
  }

  async selfhealRebuildMemory(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_REBUILD_MEMORY, params || {});
  }

  async selfhealRegenerateConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_REGENERATE_CONFIG, params || {});
  }

  async selfhealRepairJson(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_REPAIR_JSON, params || {});
  }

  async selfhealResetState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_RESET_STATE, params || {});
  }

  async selfhealRestartModule(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_RESTART_MODULE, params || {});
  }

  async selfhealRestartProcess(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_RESTART_PROCESS, params || {});
  }

  async selfhealRestartWorker(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_RESTART_WORKER, params || {});
  }

  async selfhealSaveProfile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_SAVE_PROFILE, params || {});
  }

  async selfhealSwitchProvider(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_SWITCH_PROVIDER, params || {});
  }

  async selfhealSyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_SYNC_STATE, params || {});
  }

  async selfhealSyncWithSingularity(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SELFHEAL_SYNC_WITH_SINGULARITY, params || {});
  }

  async sendAudioChunk(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SEND_AUDIO_CHUNK, params || {});
  }

  async setAudioInputDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SET_AUDIO_INPUT_DEVICE, params || {});
  }

  async setAudioOutputDevice(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SET_AUDIO_OUTPUT_DEVICE, params || {});
  }

  async setState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SET_STATE, params || {});
  }

  async singularityAutonomyHeal(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_AUTONOMY_HEAL, params || {});
  }

  async singularityCheckCoherence(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_CHECK_COHERENCE, params || {});
  }

  async singularityGetFullState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_GET_FULL_STATE, params || {});
  }

  async singularityGetGlobalCoherence(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_GET_GLOBAL_COHERENCE, params || {});
  }

  async singularityLoadState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_LOAD_STATE, params || {});
  }

  async singularitySaveState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_SAVE_STATE, params || {});
  }

  async singularitySelfCheck(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_SELF_CHECK, params || {});
  }

  async singularityUpdateAdaptive(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_ADAPTIVE, params || {});
  }

  async singularityUpdateCognitive(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_COGNITIVE, params || {});
  }

  async singularityUpdateFullState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_FULL_STATE, params || {});
  }

  async singularityUpdateMeta(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_META, params || {});
  }

  async singularityUpdatePhysical(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_PHYSICAL, params || {});
  }

  async singularityUpdateSymbolic(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SINGULARITY_UPDATE_SYMBOLIC, params || {});
  }

  async speak(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SPEAK, params || {});
  }

  async startRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.START_RECORDING, params || {});
  }

  async startWhisperStreaming(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.START_WHISPER_STREAMING, params || {});
  }

  async stopRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.STOP_RECORDING, params || {});
  }

  async stopWhisperStreaming(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.STOP_WHISPER_STREAMING, params || {});
  }

  async storeFile(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.STORE_FILE, params || {});
  }

  async submitEvolutionData(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SUBMIT_EVOLUTION_DATA, params || {});
  }

  async syncEvolutionState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SYNC_EVOLUTION_STATE, params || {});
  }

  async systemGetStatus(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SYSTEM_GET_STATUS, params || {});
  }

  async systemOptimize(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SYSTEM_OPTIMIZE, params || {});
  }

  async systemRecovery(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.SYSTEM_RECOVERY, params || {});
  }

  async testMicrophone(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TEST_MICROPHONE, params || {});
  }

  async testTts(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TEST_TTS, params || {});
  }

  async titanForceSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TITAN_FORCE_SNAPSHOT, params || {});
  }

  async titanPersistenceInit(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TITAN_PERSISTENCE_INIT, params || {});
  }

  async titanPersistenceShutdown(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TITAN_PERSISTENCE_SHUTDOWN, params || {});
  }

  async titanPersistEvent(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TITAN_PERSIST_EVENT, params || {});
  }

  async titanStateGet(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TITAN_STATE_GET, params || {});
  }

  async toggleSafeMode(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TOGGLE_SAFE_MODE, params || {});
  }

  async toggleSingularity(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TOGGLE_SINGULARITY, params || {});
  }

  async ttsSpeak(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TTS_SPEAK, params || {});
  }

  async ttsStop(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.TTS_STOP, params || {});
  }

  async updateChatEngineConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.UPDATE_CHAT_ENGINE_CONFIG, params || {});
  }

  async updateRuntimeConfig(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.UPDATE_RUNTIME_CONFIG, params || {});
  }

  async vadConfigure(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VAD_CONFIGURE, params || {});
  }

  async vadGetState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VAD_GET_STATE, params || {});
  }

  async vadProcessFrame(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VAD_PROCESS_FRAME, params || {});
  }

  async vadReset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VAD_RESET, params || {});
  }

  async vectorStoreDelete(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VECTOR_STORE_DELETE, params || {});
  }

  async vectorStoreInsert(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VECTOR_STORE_INSERT, params || {});
  }

  async vectorStoreUpdate(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VECTOR_STORE_UPDATE, params || {});
  }

  async voiceStartRecording(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.VOICE_START_RECORDING, params || {});
  }

  async windowSetFullscreen(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.WINDOW_SET_FULLSCREEN, params || {});
  }

  async windowSetZoom(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.WINDOW_SET_ZOOM, params || {});
  }

  async windowZoomReset(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.WINDOW_ZOOM_RESET, params || {});
  }

  async writeLog(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.WRITE_LOG, params || {});
  }

  async writeSnapshot(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.WRITE_SNAPSHOT, params || {});
  }

  async xpSyncState(params?: unknown): Promise<unknown> {
    return await this.invoke(TAURI_COMMANDS.XP_SYNC_STATE, params || {});
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
