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
  SINGULARITY_GET_GLOBAL_COHERENCE: 'singularity_get_global_coherence',
  SINGULARITY_IS_CRITICAL: 'singularity_is_critical',
  SINGULARITY_GET_STATE: 'get_singularity_state',
  SINGULARITY_SYNC: 'sync_singularity',
  SINGULARITY_GET_SYMBOLIC: 'singularity_get_symbolic',
  SINGULARITY_GET_ADAPTIVE: 'singularity_get_adaptive',
  SINGULARITY_GET_META: 'singularity_get_meta',

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY v∞ (v20) - Global Unified State (NEW)
  // ═══════════════════════════════════════════════════════════════
  SINGULARITY_V_GET: 'singularity_get',              // Récupère état complet v∞
  SINGULARITY_V_SET: 'singularity_set',              // Définit nouvel état v∞
  SINGULARITY_V_DIFF: 'singularity_diff',            // Calcule diff entre états
  SINGULARITY_V_HASH: 'singularity_hash',            // Récupère hash SHA-256
  SINGULARITY_V_SYNC: 'singularity_sync',            // Deep Sync des 20 moteurs
  SINGULARITY_V_META: 'singularity_meta',            // Méta-évaluation cognitive
  SINGULARITY_V_INTEGRITY: 'singularity_integrity',  // Vérification intégrité
  SINGULARITY_V_REPAIR: 'singularity_repair',        // Auto-réparation
  SINGULARITY_V_EXPORT: 'singularity_export_json',   // Export JSON complet
  SINGULARITY_V_SNAPSHOT: 'singularity_snapshot',    // Snapshot résumé
  SINGULARITY_V_SELFTEST: 'singularity_selftest_full', // Self-test complet 10 tests

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

  // ═══════════════════════════════════════════════════════════════
  // QA SYSTEM v19.8 - Automated Testing & Quality Assurance
  // ═══════════════════════════════════════════════════════════════
  QA_RUN_ALL: 'qa_run_all',
  QA_RUN_MODULE: 'qa_run_module',
  QA_GET_LAST_REPORT: 'qa_get_last_report',

  // ═══════════════════════════════════════════════════════════════
  // ADAPTIVE ENGINE v21 - Auto-Optimization & Learning
  // ═══════════════════════════════════════════════════════════════
  ADAPTIVE_GET_PROFILE: 'adaptive_get_profile',
  ADAPTIVE_SET_MODE: 'adaptive_set_mode',
  ADAPTIVE_LEARN: 'adaptive_learn',
  ADAPTIVE_RUN_OPTIMIZATION: 'adaptive_run_optimization',
  ADAPTIVE_GET_HISTORY: 'adaptive_get_history',
  ADAPTIVE_CAPTURE_SAMPLE: 'adaptive_capture_sample',
  ADAPTIVE_GET_SUMMARY: 'adaptive_get_summary',

  // ═══════════════════════════════════════════════════════════════
  // NARRATIVE ENGINE v22 - Expressive & Symbolic Layer
  // ═══════════════════════════════════════════════════════════════
  NARRATIVE_GENERATE: 'narrative_generate',
  NARRATIVE_GET_STYLE: 'narrative_get_style',
  NARRATIVE_SET_STYLE: 'narrative_set_style',
  NARRATIVE_GET_IDENTITY: 'narrative_get_identity',
  NARRATIVE_EVOLVE: 'narrative_evolve',
  NARRATIVE_GET_ARCHETYPE: 'narrative_get_archetype',
  NARRATIVE_SET_ARCHETYPE: 'narrative_set_archetype',

  // ═══════════════════════════════════════════════════════════════
  // IMMERSIVE AVATAR ENGINE v23 - Voice, Lip-Sync & Expressions
  // ═══════════════════════════════════════════════════════════════
  AVATAR_PREPARE_SPEECH: 'avatar_prepare_speech',
  AVATAR_FINISH_SPEECH: 'avatar_finish_speech',
  AVATAR_ENABLE_IMMERSION: 'avatar_enable_immersion',
  AVATAR_ON_WAKE_WORD: 'avatar_on_wake_word',
  AVATAR_GET_CURRENT_MORPH: 'avatar_get_current_morph',
  AVATAR_ADVANCE_LIP_SYNC: 'avatar_advance_lip_sync',
  AVATAR_GET_EXPRESSION: 'avatar_get_expression',
  AVATAR_GET_STATE: 'avatar_get_state',
  AVATAR_RUN_SELFTEST: 'avatar_run_selftest',

  // ═══════════════════════════════════════════════════════════════
  // FULL-BODY AVATAR ENGINE v24 - Complete Body, Gestures & Postures
  // ═══════════════════════════════════════════════════════════════
  FULLBODY_INITIALIZE: 'fullbody_initialize',
  FULLBODY_ADVANCE_FRAME: 'fullbody_advance_frame',
  FULLBODY_ACTIVATE_GESTURE: 'fullbody_activate_gesture',
  FULLBODY_UPDATE_EXPRESSION: 'fullbody_update_expression',
  FULLBODY_UPDATE_LIPSYNC: 'fullbody_update_lipsync',
  FULLBODY_UPDATE_STATE: 'fullbody_update_state',
  FULLBODY_ON_WAKE_WORD: 'fullbody_on_wake_word',
  FULLBODY_EXPORT_SKELETON: 'fullbody_export_skeleton',
  FULLBODY_UPDATE_CONTEXT: 'fullbody_update_context',
  FULLBODY_GET_POSTURE: 'fullbody_get_posture',
  FULLBODY_GET_STATS: 'fullbody_get_stats',
  FULLBODY_RUN_SELFTEST: 'fullbody_run_selftest',
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
 * BACKEND SYNC STATUS (v20.0):
 *
 * ✅ Mock Mode (33 commandes):
 *    - Helios: 2/2
 *    - Memory: 13/13 (incl. ingest_file)
 *    - Nexus: 2/2
 *    - Singularity: 10/10 (v17)
 *    - Experience: 2/2
 *    - DevTools: 3/3
 *    - FileImport: 1/1 (import_file)
 *
 * ✅ Singularity v∞ v20.0 (11 commandes NOUVELLES):
 *    - singularity_get: Récupère SingularityStateVInfinity complet
 *    - singularity_set: Définit nouvel état (avec validation intégrité)
 *    - singularity_diff: Calcule différences entre 2 états
 *    - singularity_hash: Récupère hash SHA-256 global
 *    - singularity_sync: Deep Sync des 20 moteurs unifiés
 *    - singularity_meta: Génère rapport méta-cognition
 *    - singularity_integrity: Vérification intégrité complète
 *    - singularity_repair: Auto-réparation des corruptions
 *    - singularity_export_json: Export JSON état complet
 *    - singularity_snapshot: Snapshot résumé (léger)
 *    - singularity_selftest_full: Self-test 10 tests complets ✨ NEW
 *    - Enregistrées dans src-tauri/src/main.rs ✅
 *    - Backend Rust actif (singularity_state_vinfinity.rs, singularity_commands.rs, singularity_selftest.rs) ✅
 *    - Structure: 20 moteurs fusionnés → 1 état global cohérent
 *
 * ✅ QA System v19.8 (3 commandes):
 *    - qa_run_all: Exécute tous les tests QA
 *    - qa_run_module: Exécute test d'un module spécifique
 *    - qa_get_last_report: Récupère dernier rapport QA
 *    - Enregistrées dans src-tauri/src/main.rs
 *    - Backend Rust actif (qa_engine.rs, qa_commands.rs)
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
