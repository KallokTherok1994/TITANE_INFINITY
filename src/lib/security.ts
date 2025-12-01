/**
 * TITANE∞ v17 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v17 - Frontend Security Module
 * Type guards, validation, anti-injection, command whitelist
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { safeInvokeTauri } from '@/utils/tauriProtector';

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

/**
 * Commandes qui retournent void/null (Unit en Rust → null en JS)
 * Ces commandes sont valides même avec une réponse null/undefined
 * ✅ AJOUTÉ v19.3 pour support Audio/TTS
 */
export const VOID_COMMANDS = new Set<string>([
  // Audio/TTS commands that return () in Rust
  'tts_speak',
  'tts_stop',
  'stop_speaking',
  'set_audio_output_device',
  'set_audio_input_device',
  'vad_reset',
  'vad_configure',
  // Overdrive Voice Engine commands
  'voice_stop_speaking',
  // Memory commands that return ()
  'memory_delete_entry',
  'memory_clear_all',
  'memory_prune',
  'memory_delete',
  'clear_memory',
  'clear_logs',
  // Session commands
  'session_end',
  'end_session',
  // State save commands
  'state_save',
  'singularity_save_state',
  'singularity_reset',
  // Persistence commands that return ()
  'titan_persist_event',
  'titan_force_snapshot',
]);

/**
 * Whitelist des commandes Tauri autorisées
 * DOIT correspondre à commands/security.rs côté Rust
 * ✅ SYNCHRONISÉ v16.2.2+ (27 nov 2025)
 */
export const ALLOWED_COMMANDS = new Set<string>([
  // ═══════════════════════════════════════════════════════════════
  // HELIOS - System Monitoring
  // ═══════════════════════════════════════════════════════════════
  'get_helios_state',
  'get_system_health',
  'get_helios_metrics',
  'get_system_info',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY - Storage & Timeline
  // ═══════════════════════════════════════════════════════════════
  'get_memory_state',
  'memory_get_state',
  'write_snapshot',
  'read_snapshot',
  'write_log',
  'read_logs',
  'add_timeline_event',
  'get_timeline',
  'get_active_projects',
  'get_recent_decisions',
  'get_knowledge',
  'get_active_rituals',
  'save_chat_interaction',
  'memory_save_chat_interaction',
  'memory_get_active_projects',
  'memory_get_recent_decisions',
  'memory_get_knowledge',
  'memory_get_active_rituals',
  'memory_get_timeline',
  'memory_ingest_file',
  'import_file',
  'get_all_files',
  'get_files_by_category',
  'clear_memory',
  'store_file',

  // Legacy Memory commands
  'memory_init',
  'memory_save_entry',
  'memory_get_entry',
  'memory_delete_entry',
  'memory_list_entries',
  'memory_update_entry',
  'memory_clear_all',
  'memory_search',
  'memory_export',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY ENGINE (Overdrive)
  // ═══════════════════════════════════════════════════════════════
  'memory_store',
  'memory_store_conversation',
  'memory_get_related',
  'memory_rebuild_index',
  'memory_get_stats',
  'memory_prune',
  'memory_delete',
  'memory_import',

  // ═══════════════════════════════════════════════════════════════
  // AI / CHAT COMMANDS
  // ═══════════════════════════════════════════════════════════════
  'ai_send_prompt',
  'ai_get_response',
  'ai_set_model',
  'ai_get_available_models',
  'query_ai',
  'get_ai_status',
  'test_gemini',
  'test_ollama',
  'chat_generate',
  'upload_and_process_file',

  // Chat Orchestrator (v18)
  'chat_send_message',
  'chat_get_providers_status',
  'chat_check_providers',
  'chat_create_conversation',
  'chat_get_conversation',
  'chat_delete_conversation',
  'chat_set_gemini_key',
  'chat_stream_message',
  'generate_response',
  'stream_response',
  'speak_text',
  'save_memory',
  'load_memory',
  'reset_memory',
  'health_check',
  // Control Panel (secure)
  'cp_get_ai_config',
  'cp_set_ai_config',

  // ═══════════════════════════════════════════════════════════════
  // VOICE / TTS / ASR (v16.2.2+)
  // ═══════════════════════════════════════════════════════════════
  'speak',
  'stop_speaking',
  'is_speaking',
  'start_recording',
  'stop_recording',
  'transcribe_audio',

  // ═══════════════════════════════════════════════════════════════
  // AUDIO CENTER (v19.2+)
  // ═══════════════════════════════════════════════════════════════
  'tts_speak',
  'tts_stop',
  'test_tts',
  'get_audio_output_devices',
  'get_audio_input_devices',
  'set_audio_output_device',
  'set_audio_input_device',
  'test_microphone',
  // Note: update_*_settings commands removed - settings stored locally

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY STATE
  // ═══════════════════════════════════════════════════════════════
  'singularity_get_state',
  'singularity_get_full_state',
  'singularity_get_physical',
  'singularity_get_cognitive',
  'singularity_get_symbolic',
  'singularity_get_adaptive',
  'singularity_get_meta',
  'singularity_get_global_coherence',
  'singularity_is_critical',
  'get_singularity_state',
  'sync_singularity',
  'singularity_update_metric',
  'singularity_reset',
  'update_singularity_state',
  'singularity_self_check',

  // Singularity Mutation Commands (v16.2.2+)
  'singularity_update_physical',
  'singularity_update_cognitive',
  'singularity_update_symbolic',
  'singularity_update_adaptive',
  'singularity_update_meta',
  'singularity_update_full_state',
  'singularity_save_state',
  'singularity_load_state',

  // ═══════════════════════════════════════════════════════════════
  // NEXUS - Validation
  // ═══════════════════════════════════════════════════════════════
  'validate_nexus',
  'get_nexus_graph',

  // ═══════════════════════════════════════════════════════════════
  // XP & EXPERIENCE SYSTEM (v24)
  // ═══════════════════════════════════════════════════════════════
  'xp_add',
  'xp_get_level',
  'xp_get_total',
  'xp_get_state',
  'experience_get_state',
  'experience_update_state',

  // ═══════════════════════════════════════════════════════════════
  // COGNITIVE LAYER
  // ═══════════════════════════════════════════════════════════════
  'cognitive_analyze',
  'cognitive_get_insights',
  'get_cognitive_state',
  'update_cognitive_mode',

  // ═══════════════════════════════════════════════════════════════
  // DEVTOOLS & LOGS
  // ═══════════════════════════════════════════════════════════════
  'get_logs',
  'clear_logs',

  // ═══════════════════════════════════════════════════════════════
  // DEVOPS (v19)
  // ═══════════════════════════════════════════════════════════════
  'devops_run',
  'devops_stats',

  // ═══════════════════════════════════════════════════════════════
  // SECURE COMMANDS (v∞)
  // ═══════════════════════════════════════════════════════════════
  'secure_import_file',
  'secure_read_file',
  'secure_list_files',
  'secure_delete_file',
  'get_gemini_key_status',
  'get_permission_audit',
  'validate_chat_message',
  'check_system_integrity',

  // ═══════════════════════════════════════════════════════════════
  // STATE & SESSION
  // ═══════════════════════════════════════════════════════════════
  'state_get',
  'state_save',
  'get_system_state',
  'get_module_health',
  'session_start',
  'session_end',
  'session_get_current',
  'start_session',
  'end_session',
  'get_session_info',

  // ═══════════════════════════════════════════════════════════════
  // SECURITY & HARDENING
  // ═══════════════════════════════════════════════════════════════
  'run_hardening_selftest',

  // ═══════════════════════════════════════════════════════════════
  // VAD (Voice Activity Detection) v∞
  // ═══════════════════════════════════════════════════════════════
  'vad_get_state',
  'vad_process_frame',
  'vad_configure',
  'vad_reset',
  'vad_test',

  // ═══════════════════════════════════════════════════════════════
  // OVERDRIVE VOICE ENGINE v∞.OPUS-DIAG
  // ═══════════════════════════════════════════════════════════════
  'voice_start_listening',
  'voice_stop_listening',
  'voice_transcribe_audio',
  'voice_detect_wake_word',
  'voice_synthesize_speech',
  'voice_play_audio',
  'voice_stop_speaking',
  'voice_get_config',
  'voice_update_config',
  'voice_get_status',
  'voice_calibrate_microphone',

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE ENGINE v∞.MPE
  // ═══════════════════════════════════════════════════════════════
  'titan_persist_event',
  'titan_force_snapshot',
  'titan_load_state',
  'titan_get_events_since',
  'titan_list_snapshots',
  'titan_recover_state',
  'titan_get_persistence_status',
  'titan_verify_integrity',
  'titan_get_last_snapshot',

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM CENTER / CLUSTER (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'sc_get_cluster_status',
  'sc_get_cluster_peers',
  'sc_initialize_cluster',
  'sc_shutdown_cluster',

  // ═══════════════════════════════════════════════════════════════
  // RUNTIME & CONFIG (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'get_runtime_config',

  // ═══════════════════════════════════════════════════════════════
  // AVATAR & FULLBODY (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'avatar_prepare_speech',
  'avatar_finish_speech',
  'avatar_enable_immersion',
  'avatar_on_wake_word',
  'avatar_get_current_morph',
  'avatar_advance_lip_sync',
  'avatar_get_expression',
  'avatar_get_state',
  'avatar_run_selftest',
  'fullbody_initialize',
  'fullbody_advance_frame',
  'fullbody_activate_gesture',
  'fullbody_update_expression',
  'fullbody_update_lipsync',
  'fullbody_update_state',
  'fullbody_on_wake_word',
  'fullbody_export_skeleton',
  'fullbody_update_context',
  'fullbody_get_posture',
  'fullbody_get_stats',
  'fullbody_run_selftest',

  // ═══════════════════════════════════════════════════════════════
  // ENGINE CORE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'engine_init',
  'engine_tick',
  'engine_stop',
  'meta_mode_reset',

  // ═══════════════════════════════════════════════════════════════
  // QA & AUTOFIX (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'qa_run_all',
  'qa_run_module',
  'qa_get_last_report',
  'autofix_detect_rust_warnings',
  'autofix_detect_typescript_errors',
  'autofix_detect_react_hook_violations',
  'autofix_detect_invalid_states',
  'autofix_fix_issue',
  'autofix_fix_all',
  'autofix_get_history',
  'autofix_get_stats',
  'autofix_reset',

  // ═══════════════════════════════════════════════════════════════
  // PERSONA & NARRATIVE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'persona_initialize',
  'persona_get_state',
  'persona_update',
  'persona_react',
  'persona_reset',
  'persona_get_multipliers',
  'narrative_generate',
  'narrative_get_style',
  'narrative_set_style',
  'narrative_get_identity',
  'narrative_evolve',
  'narrative_get_archetype',
  'narrative_set_archetype',

  // ═══════════════════════════════════════════════════════════════
  // ADAPTIVE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'adaptive_get_profile',
  'adaptive_set_mode',
  'adaptive_learn',
  'adaptive_run_optimization',
  'adaptive_get_history',
  'adaptive_capture_sample',
  'adaptive_get_summary',

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE OPTIMIZER (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'performance_get_metrics',
  'performance_throttle_cpu',
  'performance_optimize_gpu',
  'performance_reduce_render_quality',
  'performance_compress_memory',
  'performance_reset_optimizations',

  // ═══════════════════════════════════════════════════════════════
  // AUTONOMY ENGINE (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'autonomy_scan_backend',
  'autonomy_fix_states',
  'autonomy_heal_modules',
  'autonomy_optimize_performance',
  'autonomy_evolve_ia',
  'autonomy_test_ia_coherence',
  'autonomy_ping',
  'autonomy_shield_state',
  'autonomy_analyse_logs',
  'autonomy_log_report',
  'autonomy_scan_ia',
  'autonomy_scan_tts',
  'autonomy_scan_avatar',
  'autonomy_scan_memory',
  'autonomy_scan_singularity_state',
  'autonomy_fix_tts_sync',
  'autonomy_resync_singularity_state',
  'autonomy_clean_memory',

  // ═══════════════════════════════════════════════════════════════
  // OMNIS AUTO-HEAL (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'get_system_health',
  'memory_repair',
  'system_optimize',
  'memory_list_entries',
  'memory_save_entry',
  'memory_get_entry',
  'memory_delete_entry',

  // ═══════════════════════════════════════════════════════════════
  // SELF-HEALING SYNC LAYER (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'selfheal_get_vitals',
  'selfheal_load_profile',
  'selfheal_save_profile',
  'selfheal_sync_with_singularity',
]);

/**
 * Patterns d'injection détectés (aligné avec ai/security.rs)
 */
const INJECTION_PATTERNS = [
  /<script/gi,
  /javascript:/gi,
  /eval\s*\(/gi,
  /__proto__/gi,
  /constructor\s*\[/gi,
  /\$\{/g,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /\.\.\//g,
];

/**
 * Taille maximale des payloads (10 MB)
 */
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024;

/**
 * Timeout maximal par défaut (30s)
 */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Cache pour détecter les boucles infinies
 */
interface CallTracker {
  count: number;
  firstCall: number;
  lastCall: number;
}

const callTracking = new Map<string, CallTracker>();
const MAX_CALLS_PER_SECOND = 10;
const TRACKING_WINDOW_MS = 1000;

const TEST_ONLY_COMMANDS = new Set<string>(['test_command', 'get_projects']);
const isTestEnvironment =
  (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
  (typeof globalThis !== 'undefined' && Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

// ────────────────────────────────────────────────────────────────
// Types & Interfaces
// ────────────────────────────────────────────────────────────────

export interface SecureInvokeOptions {
  /** Timeout en ms (défaut: 30000) */
  timeout?: number;
  /** Désactiver validation anti-injection (défaut: false) */
  skipInjectionCheck?: boolean;
  /** Désactiver validation whitelist (défaut: false) */
  skipWhitelistCheck?: boolean;
  /** Désactiver anti-loop protection (défaut: false) */
  skipLoopCheck?: boolean;
  /** Considérer une réponse de fallback comme une erreur (défaut: false) */
  treatFallbackAsError?: boolean;
}

export interface CommandValidationResult {
  valid: boolean;
  errors: string[];
}

export interface HardeningTestResult {
  name: string;
  passed: boolean;
  details: string;
}

export interface HardeningReport {
  tests: HardeningTestResult[];
  pass_rate: number;
  timestamp: string;
}

// ────────────────────────────────────────────────────────────────
// Validation Functions
// ────────────────────────────────────────────────────────────────

/**
 * Valider qu'une commande est dans la whitelist
 */
export function validateCommand(command: string): CommandValidationResult {
  const errors: string[] = [];

  if (!command || typeof command !== 'string') {
    errors.push('Command must be a non-empty string');
    return { valid: false, errors };
  }

  if (!ALLOWED_COMMANDS.has(command)) {
    if (isTestEnvironment && TEST_ONLY_COMMANDS.has(command)) {
      return { valid: true, errors: [] };
    }
    errors.push(
      `Command "${command}" is not in whitelist. Allowed: ${Array.from(ALLOWED_COMMANDS).join(', ')}`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Détecter les tentatives d'injection dans le payload
 */
export function detectInjection(payload: Record<string, unknown>): CommandValidationResult {
  const errors: string[] = [];

  // Convertir payload en JSON pour analyse
  const jsonString = JSON.stringify(payload);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(jsonString)) {
      errors.push(`Injection pattern detected: ${pattern.source}`);
      // Reset lastIndex pour regex globales
      pattern.lastIndex = 0;
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valider la taille du payload
 */
export function validatePayloadSize(payload: Record<string, unknown>): CommandValidationResult {
  const errors: string[] = [];
  const jsonString = JSON.stringify(payload);
  const sizeBytes = new Blob([jsonString]).size;

  if (sizeBytes > MAX_PAYLOAD_SIZE) {
    errors.push(
      `Payload too large: ${sizeBytes} bytes (max: ${MAX_PAYLOAD_SIZE} bytes)`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Détecter les boucles infinies (trop d'appels rapides)
 */
export function detectInfiniteLoop(command: string): CommandValidationResult {
  const now = Date.now();
  const key = command;

  if (!callTracking.has(key)) {
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  const tracker = callTracking.get(key);
  if (!tracker) {
    // Shouldn't happen but handle gracefully
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  // Reset si fenêtre expirée
  if (now - tracker.firstCall > TRACKING_WINDOW_MS) {
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  // Incrémenter compteur
  tracker.count += 1;
  tracker.lastCall = now;

  // Vérifier dépassement
  if (tracker.count > MAX_CALLS_PER_SECOND) {
    const errors = [
      `Infinite loop detected: "${command}" called ${tracker.count} times in ${TRACKING_WINDOW_MS}ms (max: ${MAX_CALLS_PER_SECOND})`,
    ];
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Nettoyer le cache de tracking (à appeler périodiquement)
 */
export function cleanupCallTracking(): void {
  const now = Date.now();
  for (const [key, tracker] of callTracking.entries()) {
    if (now - tracker.lastCall > TRACKING_WINDOW_MS * 5) {
      callTracking.delete(key);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Cleanup automatique toutes les 5 secondes (v24.20: with cleanup)
// ─────────────────────────────────────────────────────────────────

let callTrackingIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Démarrer le cleanup call tracking (appelé automatiquement)
 */
function startCallTrackingCleanup() {
  if (callTrackingIntervalId !== null) return; // Already running

  callTrackingIntervalId = setInterval(cleanupCallTracking, 5000);
  console.log('[Security] Call tracking cleanup activé (5s)');
}

/**
 * Arrêter le cleanup call tracking (cleanup)
 */
export function stopCallTrackingCleanup() {
  if (callTrackingIntervalId !== null) {
    clearInterval(callTrackingIntervalId);
    callTrackingIntervalId = null;
    console.log('[Security] Call tracking cleanup désactivé');
  }
}

// Démarrer cleanup si dans le navigateur
if (typeof window !== 'undefined') {
  startCallTrackingCleanup();
}

// ────────────────────────────────────────────────────────────────
// Type Guards
// ────────────────────────────────────────────────────────────────

/**
 * Type guard pour vérifier qu'un objet est un Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard pour HardeningReport
 */
export function isHardeningReport(value: unknown): value is HardeningReport {
  if (!isRecord(value)) return false;

  const hasTests =
    Array.isArray(value.tests) &&
    value.tests.every(
      (test) =>
        isRecord(test) &&
        typeof test.name === 'string' &&
        typeof test.passed === 'boolean' &&
        typeof test.details === 'string'
    );

  const hasPassRate = typeof value.pass_rate === 'number';
  const hasTimestamp = typeof value.timestamp === 'string';

  return hasTests && hasPassRate && hasTimestamp;
}

/**
 * Type guard pour tableau de strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Type guard pour valider qu'une réponse Tauri est valide
 */
export function isValidTauriResponse<T>(
  value: unknown,
  validator?: (val: unknown) => val is T
): value is T {
  if (value === null || value === undefined) {
    return false;
  }

  // Si validator personnalisé fourni
  if (validator) {
    return validator(value);
  }

  // Validation générique (non-null, non-undefined)
  return true;
}

// ────────────────────────────────────────────────────────────────
// Secure Response Validation
// ────────────────────────────────────────────────────────────────

/**
 * Valider une réponse Tauri avec type guard optionnel
 */
export function validateResponse<T>(
  response: unknown,
  validator?: (val: unknown) => val is T
): CommandValidationResult & { data?: T } {
  const errors: string[] = [];

  // Si validator personnalisé fourni, l'utiliser (peut accepter null)
  if (validator) {
    if (!validator(response)) {
      errors.push('Response failed custom validation');
      return { valid: false, errors };
    }
    return {
      valid: true,
      errors: [],
      data: response as T,
    };
  }

  // Validation générique : accepter objets valides, rejeter null/undefined
  if (response === null || response === undefined) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: response as T,
  };
}

/**
 * Sanitizer générique pour supprimer les propriétés dangereuses
 */
export function sanitizeResponse<T>(response: T): T {
  if (typeof response !== 'object' || response === null) {
    return response;
  }

  // Supprimer __proto__ et constructor
  const sanitized = JSON.parse(JSON.stringify(response));

  if ('__proto__' in sanitized) {
    delete sanitized.__proto__;
  }
  if ('constructor' in sanitized) {
    delete sanitized.constructor;
  }

  return sanitized;
}

// ────────────────────────────────────────────────────────────────
// Secure Invoke Wrapper
// ────────────────────────────────────────────────────────────────

/**
 * Wrapper sécurisé pour invoke Tauri
 *
 * Protections:
 * - ✅ Command whitelist validation
 * - ✅ Injection pattern detection
 * - ✅ Payload size validation
 * - ✅ Infinite loop detection
 * - ✅ Timeout protection
 * - ✅ Response validation with type guards
 *
 * @example
 * ```ts
 * // Simple call
 * const state = await secureInvoke<MemoryState>('memory_get_state');
 *
 * // With payload
 * await secureInvoke('memory_save_entry', {
 *   key: 'test',
 *   value: 'data'
 * });
 *
 * // With custom validator
 * const report = await secureInvoke<HardeningReport>(
 *   'run_hardening_selftest',
 *   {},
 *   { timeout: 60000 },
 *   isHardeningReport
 * );
 * ```
 */
export async function secureInvoke<T>(
  command: string,
  payload: Record<string, unknown> = {},
  options: SecureInvokeOptions = {},
  validator?: (val: unknown) => val is T
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    skipInjectionCheck = false,
    skipWhitelistCheck = false,
    skipLoopCheck = false,
    treatFallbackAsError = false,
  } = options;

  // [1] Validation commande whitelist
  if (!skipWhitelistCheck) {
    const cmdValidation = validateCommand(command);
    if (!cmdValidation.valid) {
      const errorMsg = `Security: ${cmdValidation.errors.join('; ')}`;
      console.error(`[Security] ✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  // [2] Détection injection
  if (!skipInjectionCheck) {
    const injectionCheck = detectInjection(payload);
    if (!injectionCheck.valid) {
      const errorMsg = `Security: ${injectionCheck.errors.join('; ')}`;
      console.error(`[Security] ✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  // [3] Validation taille payload
  const sizeCheck = validatePayloadSize(payload);
  if (!sizeCheck.valid) {
    const errorMsg = `Security: ${sizeCheck.errors.join('; ')}`;
    console.error(`[Security] ✗ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // [4] Détection boucle infinie
  if (!skipLoopCheck) {
    const loopCheck = detectInfiniteLoop(command);
    if (!loopCheck.valid) {
      const errorMsg = `Security: ${loopCheck.errors.join('; ')}`;
      console.error(`[Security] ✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  // [5] Invoke avec timeout
  try {
    const isTestEnv =
      (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
      (typeof globalThis !== 'undefined' && Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

    let response: unknown;
    if (isTestEnv) {
      // En environnement de test, utiliser directement le module mocké pour laisser Vitest contrôler les rejets/résolutions
      const tauriCore = await import('@tauri-apps/api/core');
      response = await Promise.race([
        tauriCore.invoke<T>(command, payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)),
      ]);
    } else {
      response = await safeInvokeTauri<T>(command, payload, timeout);
    }

    // [6] Validation réponse - avec support des commandes void
    const isVoidCommand = VOID_COMMANDS.has(command);

    // Pour les commandes void, null/undefined est une réponse valide
    if (isVoidCommand && (response === null || response === undefined)) {
      // Commande void réussie - retourner un objet vide typé ou null
      return (response ?? null) as T;
    }

    const responseValidation = validateResponse<T>(response, validator);
    if (!responseValidation.valid) {
      const errorMsg = `Response validation failed: ${responseValidation.errors.join('; ')}`;
      console.error(`[Security] ✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // [7] Sanitization
    if (responseValidation.data === null || responseValidation.data === undefined) {
      throw new Error('Response validation succeeded but data is null/undefined');
    }
    const sanitized = sanitizeResponse(responseValidation.data);

    // Si configuré, considérer explicitement les fallbacks comme des erreurs pour permettre les retries
    if (
      treatFallbackAsError &&
      sanitized !== null &&
      typeof sanitized === 'object' &&
      'fallback' in (sanitized as Record<string, unknown>) &&
      (sanitized as Record<string, unknown>).fallback === true
    ) {
      throw new Error('Fallback response received');
    }

    return sanitized;
  } catch (error) {
    // Log et re-throw
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Security] ✗ secureInvoke("${command}") failed:`, errorMsg);
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────
// Security Testing
// ────────────────────────────────────────────────────────────────

/**
 * Appeler le self-test backend de sécurité
 * Retourne le rapport de hardening avec type safety
 */
export async function runSecuritySelfTest(): Promise<HardeningReport> {
  const report = await secureInvoke<HardeningReport>(
    'run_hardening_selftest',
    {},
    { timeout: 60000 },
    isHardeningReport
  );

  console.log(
    `[Security Self-Test] Pass rate: ${(report.pass_rate * 100).toFixed(1)}%`
  );
  console.table(
    report.tests.map((t) => ({
      Test: t.name,
      Status: t.passed ? '✅ PASS' : '❌ FAIL',
      Details: t.details,
    }))
  );

  return report;
}

/**
 * Exporter les statistiques de sécurité frontend
 */
export function getSecurityStats() {
  return {
    tracked_commands: callTracking.size,
    allowed_commands: ALLOWED_COMMANDS.size,
    tracking_window_ms: TRACKING_WINDOW_MS,
    max_calls_per_second: MAX_CALLS_PER_SECOND,
    max_payload_size_bytes: MAX_PAYLOAD_SIZE,
    default_timeout_ms: DEFAULT_TIMEOUT_MS,
  };
}

// ═══════════════════════════════════════════════════════════════
// v19.0 PHASE 2: AI SECURITY MODULES
// ═══════════════════════════════════════════════════════════════

export { AIInputSanitizer, type SanitizationResult } from './security/AIInputSanitizer';
export {
  AIResponseValidator,
  type AIValidationResult,
  ChatResponseSchema,
  StreamingChunkSchema,
  MetaModeResponseSchema,
  type ChatResponse,
  type StreamingChunk,
  type MetaModeResponse,
} from './security/AIResponseValidator';
export {
  AIRateLimiter,
  globalAIRateLimiter,
  type RateLimitConfig,
  type RateLimitStatus,
  type RequestMetrics,
} from './security/AIRateLimiter';
export {
  SecureAIService,
  type SecureAIRequest,
  type SecureAIResponse,
  type SecureAIServiceFunction,
} from './security/SecureAIService';
