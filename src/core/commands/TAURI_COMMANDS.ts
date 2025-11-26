/**
 * TITANE_INFINITY v18 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v18 — CENTRALIZED TAURI COMMANDS
 *   Table unique de toutes les commandes Backend → Frontend
 *   Synchronisé avec src-tauri/src/main.rs
 * ═══════════════════════════════════════════════════════════════════
 */

export const TAURI_COMMANDS = {
  // ═══════════════════════════════════════════════════════════════
  // HELIOS - System Monitoring
  // ═══════════════════════════════════════════════════════════════
  HELIOS_GET_STATE: 'get_helios_state',
  HELIOS_GET_HEALTH: 'get_system_health',
  HELIOS_GET_METRICS: 'get_helios_metrics', // v∞

  // ═══════════════════════════════════════════════════════════════
  // MEMORY - Storage & Timeline
  // ═══════════════════════════════════════════════════════════════
  MEMORY_GET_STATE: 'get_memory_state',
  MEMORY_GET_STATE_DETAILED: 'memory_get_state', // v∞ (avec détails avancés)
  MEMORY_WRITE_SNAPSHOT: 'write_snapshot',
  MEMORY_READ_SNAPSHOT: 'read_snapshot',
  MEMORY_WRITE_LOG: 'write_log',
  MEMORY_READ_LOGS: 'read_logs',
  MEMORY_ADD_TIMELINE_EVENT: 'add_timeline_event',
  MEMORY_GET_TIMELINE: 'get_timeline',
  MEMORY_GET_ACTIVE_PROJECTS: 'get_active_projects',
  MEMORY_GET_RECENT_DECISIONS: 'get_recent_decisions',
  MEMORY_GET_KNOWLEDGE: 'get_knowledge',
  MEMORY_GET_ACTIVE_RITUALS: 'get_active_rituals',
  MEMORY_SAVE_CHAT_INTERACTION: 'save_chat_interaction',
  MEMORY_INGEST_FILE: 'memory_ingest_file',

  // ═══════════════════════════════════════════════════════════════
  // NEXUS - Validation & Graph
  // ═══════════════════════════════════════════════════════════════
  NEXUS_VALIDATE: 'validate_nexus',
  NEXUS_GET_GRAPH: 'get_nexus_graph',

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY - Unity State
  // ═══════════════════════════════════════════════════════════════
  SINGULARITY_GET_FULL_STATE: 'singularity_get_full_state',
  SINGULARITY_GET_PHYSICAL: 'singularity_get_physical',
  SINGULARITY_GET_COGNITIVE: 'singularity_get_cognitive',
  SINGULARITY_GET_SYMBOLIC: 'singularity_get_symbolic',
  SINGULARITY_GET_ADAPTIVE: 'singularity_get_adaptive',
  SINGULARITY_GET_META: 'singularity_get_meta',
  SINGULARITY_GET_GLOBAL_COHERENCE: 'singularity_get_global_coherence',
  SINGULARITY_IS_CRITICAL: 'singularity_is_critical',
  SINGULARITY_GET_STATE: 'get_singularity_state',
  SINGULARITY_SYNC: 'sync_singularity',

  // ═══════════════════════════════════════════════════════════════
  // EXPERIENCE - XP & Knowledge Domains
  // ═══════════════════════════════════════════════════════════════
  EXPERIENCE_GET_STATE: 'experience_get_state',
  EXPERIENCE_UPDATE_STATE: 'experience_update_state',

  // ═══════════════════════════════════════════════════════════════
  // FILE IMPORT - Ingestion & Analysis
  // ═══════════════════════════════════════════════════════════════
  FILE_IMPORT: 'import_file',
  FILE_ANALYZE: 'file_analyze', // TODO: Ajouter au backend (Phase 6)
  FILE_UPLOAD_AND_PROCESS: 'upload_and_process_file', // v∞ Unified

  // ═══════════════════════════════════════════════════════════════
  // DEVTOOLS - Logging & Debug
  // ═══════════════════════════════════════════════════════════════
  DEVTOOLS_GET_LOGS: 'get_logs',
  DEVTOOLS_CLEAR_LOGS: 'clear_logs',
  DEVTOOLS_GET_SYSTEM_INFO: 'get_system_info',

  // ═══════════════════════════════════════════════════════════════
  // CHAT AI - Unified Command (v∞)
  // ═══════════════════════════════════════════════════════════════
  CHAT_GENERATE: 'chat_generate', // v∞ Commande unifiée simplifiée

  // ═══════════════════════════════════════════════════════════════
  // CHAT AI - Orchestrator Hybride (Gemini + Ollama + Local)
  // ═══════════════════════════════════════════════════════════════
  CHAT_SEND_MESSAGE: 'chat_send_message',
  CHAT_STREAM_MESSAGE: 'chat_stream_message',
  CHAT_CREATE_CONVERSATION: 'chat_create_conversation',
  CHAT_GET_CONVERSATION: 'chat_get_conversation',
  CHAT_DELETE_CONVERSATION: 'chat_delete_conversation',
  CHAT_SET_GEMINI_KEY: 'chat_set_gemini_key',
  CHAT_GET_PROVIDERS_STATUS: 'chat_get_providers_status',
  CHAT_CHECK_PROVIDERS: 'chat_check_providers',

  // ═══════════════════════════════════════════════════════════════
  // AI LEGACY - Old AI Commands (v15)
  // ═══════════════════════════════════════════════════════════════
  AI_QUERY: 'ai_query', // Legacy: ai_chat.rs, superseded by chat_send_message

  // ═══════════════════════════════════════════════════════════════
  // PERSONA ENGINE - Visual Adaptation
  // ═══════════════════════════════════════════════════════════════
  PERSONA_INITIALIZE: 'persona_initialize',
  PERSONA_GET_STATE: 'persona_get_state',
  PERSONA_UPDATE: 'persona_update',
  PERSONA_REACT: 'persona_react',
  PERSONA_RESET: 'persona_reset',
  PERSONA_GET_MULTIPLIERS: 'persona_get_multipliers',
} as const;

// ═══════════════════════════════════════════════════════════════
// TYPE HELPER
// ═══════════════════════════════════════════════════════════════

export type TauriCommand = typeof TAURI_COMMANDS[keyof typeof TAURI_COMMANDS];

/**
 * Type guard pour vérifier si une string est une commande valide
 */
export function isValidTauriCommand(cmd: string): cmd is TauriCommand {
  return Object.values(TAURI_COMMANDS).includes(cmd as TauriCommand);
}

/**
 * Helper pour invoke() avec validation
 */
export async function invokeTauri<T>(
  command: TauriCommand,
  args?: Record<string, unknown>
): Promise<T> {
  if (!isValidTauriCommand(command)) {
    throw new Error(`Invalid Tauri command: ${command}`);
  }

  // Dynamic import pour éviter erreurs SSR
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

// ═══════════════════════════════════════════════════════════════
// MAPPING DOCUMENTATION
// ═══════════════════════════════════════════════════════════════

/**
 * BACKEND SYNC STATUS (v18):
 *
 * ✅ Mock Mode (33 commandes):
 *    - Helios: 2/2
 *    - Memory: 13/13 (incl. ingest_file)
 *    - Nexus: 2/2
 *    - Singularity: 10/10
 *    - Experience: 2/2
 *    - DevTools: 3/3
 *    - FileImport: 1/1 (import_file)
 *
 * ⚠️  Chat AI (8 commandes):
 *    - Définies dans src-tauri/src/overdrive/chat_orchestrator.rs
 *    - NON enregistrées dans main.rs (backend réel non activé)
 *    - Utiliser frontend providers pour l'instant (gemini/ollama/titaneLocal)
 *
 * ⚠️  AI_QUERY (1 commande):
 *    - Définie dans src-tauri/src/commands/ai_chat.rs
 *    - NON enregistrée dans main.rs
 *    - Legacy v15, superseded by chat_orchestrator
 *
 * ⚠️  PERSONA (6 commandes):
 *    - Définies dans src-tauri/src/system/persona_engine/commands.rs
 *    - NON enregistrées dans main.rs
 *    - Utiliser personaTauriBridge avec gestion d'erreur
 *
 * TODO Phase 3 (Chat Backend):
 *    1. Enregistrer chat_* commands dans main.rs
 *    2. Intégrer chat_orchestrator dans chatEngine
 *    3. Ajouter fallback frontend si backend indisponible
 *
 * TODO Phase 6 (File Import):
 *    1. Créer file_analyze command dans Rust
 *    2. Support .txt, .md, .pdf, .docx, .json, .csv
 *    3. Integration avec memory_ingest_file existant
 */
