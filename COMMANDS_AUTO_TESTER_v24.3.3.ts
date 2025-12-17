/**
 * TITANE∞ v24.3.3 - MODE YOLO ACTIVÉ
 * Testeur automatique complet de TOUTES les commandes Tauri
 * Détecte les commandes cassées, manquantes ou avec erreurs
 */

import { invoke } from '@tauri-apps/api/core';

interface CommandTest {
  name: string;
  category: string;
  payload?: Record<string, unknown>;
  expectedError?: boolean; // true si on s'attend à une erreur (ex: sans paramètres)
}

/**
 * Liste COMPLÈTE de toutes les commandes Tauri enregistrées
 * Basée sur src-tauri/src/main.rs:542-742
 */
const ALL_COMMANDS: CommandTest[] = [
  // ═══ CORE MESSAGING ═══
  { name: 'send_message', category: 'Core', payload: { message: 'test' } },
  {
    name: 'ollama_query',
    category: 'Core',
    payload: { prompt: 'test', model: 'llama3.2' },
  },

  // ═══ OMEGA CONVERSATION ENGINE ═══
  { name: 'create_new_conversation', category: 'OMEGA', payload: {} },
  {
    name: 'conversation_generate',
    category: 'OMEGA',
    payload: { conversation_id: 'test', prompt: 'test' },
  },
  {
    name: 'conversation_process_message',
    category: 'OMEGA',
    payload: { conversation_id: 'test', message: 'test' },
  },
  { name: 'conversation_health_check', category: 'OMEGA' },
  { name: 'conversation_memory_stats', category: 'OMEGA' },

  // ═══ CHAT ORCHESTRATOR (v21 + R04) ═══
  {
    name: 'chat_send_message',
    category: 'Chat',
    payload: { conversationId: 'test', message: 'test', provider: 'ollama' },
  },
  {
    name: 'chat_stream_message',
    category: 'Chat',
    payload: { conversationId: 'test', message: 'test', provider: 'ollama' },
  },
  { name: 'chat_get_providers_status', category: 'Chat' },
  { name: 'chat_check_providers', category: 'Chat' },
  {
    name: 'chat_get_conversation',
    category: 'Chat',
    payload: { conversationId: 'test' },
  },
  { name: 'chat_create_conversation', category: 'Chat', payload: {} },
  {
    name: 'chat_delete_conversation',
    category: 'Chat',
    payload: { conversationId: 'test' },
  },
  {
    name: 'chat_generate_suggestions',
    category: 'Chat',
    payload: { conversationId: 'test' },
  },
  { name: 'chat_get_memory_stats', category: 'Chat' },

  // ═══ VOICE ENGINE (v21 - 17 commandes) ═══
  { name: 'voice_start_listening', category: 'Voice' },
  { name: 'voice_stop_listening', category: 'Voice' },
  { name: 'voice_cancel_recording', category: 'Voice' },
  { name: 'voice_is_recording', category: 'Voice' },
  {
    name: 'voice_transcribe_audio',
    category: 'Voice',
    payload: { audioData: [0, 0, 0] },
  },
  { name: 'voice_get_status', category: 'Voice' },
  { name: 'voice_get_config', category: 'Voice' },
  { name: 'voice_update_config', category: 'Voice', payload: { language: 'fr-FR' } },
  { name: 'voice_play_audio', category: 'Voice', payload: { audioData: [0, 0, 0] } },
  { name: 'voice_stop_speaking', category: 'Voice' },
  { name: 'voice_test_pipeline', category: 'Voice' },
  { name: 'voice_calibrate_microphone', category: 'Voice' },
  {
    name: 'voice_detect_wake_word',
    category: 'Voice',
    payload: { audioData: [0, 0, 0] },
  },
  { name: 'voice_get_available_models', category: 'Voice' },
  { name: 'voice_enable_duplex', category: 'Voice' },
  { name: 'voice_disable_duplex', category: 'Voice' },
  { name: 'voice_check_interruption', category: 'Voice' },

  // ═══ SINGULARITY STATE (v21 - 18 commandes) ═══
  { name: 'singularity_get_full_state', category: 'Singularity' },
  { name: 'singularity_get_physical', category: 'Singularity' },
  { name: 'singularity_get_cognitive', category: 'Singularity' },
  { name: 'singularity_get_symbolic', category: 'Singularity' },
  { name: 'singularity_get_adaptive', category: 'Singularity' },
  { name: 'singularity_get_meta', category: 'Singularity' },
  { name: 'singularity_get_global_coherence', category: 'Singularity' },
  { name: 'singularity_is_critical', category: 'Singularity' },
  {
    name: 'singularity_update_physical',
    category: 'Singularity',
    payload: { energy: 50.0 },
  },
  {
    name: 'singularity_update_cognitive',
    category: 'Singularity',
    payload: { clarity: 50.0 },
  },
  {
    name: 'singularity_update_symbolic',
    category: 'Singularity',
    payload: { creativity: 50.0 },
  },
  {
    name: 'singularity_update_adaptive',
    category: 'Singularity',
    payload: { confidence: 50.0 },
  },
  {
    name: 'singularity_update_meta',
    category: 'Singularity',
    payload: { intensity: 50.0 },
  },
  {
    name: 'singularity_update_full_state',
    category: 'Singularity',
    payload: { energy: 50.0 },
  },
  { name: 'sync_singularity', category: 'Singularity' },
  { name: 'singularity_save_state', category: 'Singularity' },
  { name: 'singularity_load_state', category: 'Singularity' },

  // ═══ SYSTEM CENTER DIAGNOSTICS ═══
  { name: 'sc_run_quick_diagnostics', category: 'SystemCenter' },
  { name: 'sc_run_full_diagnostics', category: 'SystemCenter' },
  { name: 'sc_get_diagnostic_status', category: 'SystemCenter' },

  // ═══ SECURE API KEY MANAGEMENT ═══
  { name: 'chat_set_gemini_key', category: 'Security', payload: { key: 'test-key' } },
  { name: 'get_gemini_key_status', category: 'Security' },
  { name: 'chat_set_openai_key', category: 'Security', payload: { key: 'test-key' } },
  { name: 'get_openai_key_status', category: 'Security' },
  { name: 'chat_set_anthropic_key', category: 'Security', payload: { key: 'test-key' } },
  { name: 'get_anthropic_key_status', category: 'Security' },
  { name: 'check_system_integrity', category: 'Security' },

  // ═══ PROVIDER-SPECIFIC AI GENERATION ═══
  { name: 'chat_generate_gemini', category: 'AI-Providers', payload: { prompt: 'test' } },
  { name: 'chat_generate_openai', category: 'AI-Providers', payload: { prompt: 'test' } },
  { name: 'chat_generate_claude', category: 'AI-Providers', payload: { prompt: 'test' } },

  // ═══ OLLAMA STATUS ═══
  { name: 'ai_check_ollama_status', category: 'AI-Providers' },

  // ═══ AUTH OS COMMANDS ═══
  { name: 'auth_get_status', category: 'Auth' },
  { name: 'auth_generate_dev_token', category: 'Auth' },
  { name: 'auth_validate_dev_token', category: 'Auth', payload: { token: 'test' } },
  { name: 'auth_revoke_dev_token', category: 'Auth', payload: { token: 'test' } },
  { name: 'auth_save_api_keys', category: 'Auth', payload: { keys: {} } },
  { name: 'auth_get_api_keys', category: 'Auth' },
  { name: 'auth_delete_api_key', category: 'Auth', payload: { provider: 'test' } },
  {
    name: 'auth_grant_role',
    category: 'Auth',
    payload: { userId: 'test', role: 'user' },
  },
  {
    name: 'auth_revoke_role',
    category: 'Auth',
    payload: { userId: 'test', role: 'user' },
  },

  // ═══ AUDIO SYSTEM COMMANDS (TTS + MICROPHONE) ═══
  {
    name: 'tts_speak',
    category: 'Audio',
    payload: { text: 'Bonjour TITANE Infinity', settings: { engine: 'piper' } },
  },
  { name: 'tts_stop', category: 'Audio' },
  {
    name: 'test_tts',
    category: 'Audio',
    payload: { text: 'Test TTS', settings: { engine: 'piper' } },
  },
  { name: 'test_microphone', category: 'Audio', payload: { durationMs: 1000 } },
  { name: 'get_audio_output_devices', category: 'Audio' },
  { name: 'get_audio_input_devices', category: 'Audio' },

  // ═══ HELIOS API (SYSTEM MONITORING) ═══
  { name: 'get_helios_state', category: 'Helios' },

  // ═══ MEMORY API (STORAGE + TIMELINE) ═══
  { name: 'get_memory_state', category: 'Memory' },
  { name: 'write_snapshot', category: 'Memory', payload: { key: 'test', data: {} } },
  { name: 'read_snapshot', category: 'Memory', payload: { key: 'test' } },
  { name: 'write_log', category: 'Memory', payload: { message: 'test' } },
  { name: 'read_logs', category: 'Memory' },
  { name: 'add_timeline_event', category: 'Memory', payload: { event: 'test' } },
  { name: 'memory_get_active_projects', category: 'Memory' },
  { name: 'memory_get_recent_decisions', category: 'Memory' },

  // ═══ GOVERNANCE COMMANDS (v21.5.3 - 11 commandes) ═══
  { name: 'get_ia_policies', category: 'Governance' },
  { name: 'save_ia_policies', category: 'Governance', payload: { policies: [] } },
  { name: 'toggle_ia_policy', category: 'Governance', payload: { policyId: 'test' } },
  {
    name: 'create_ia_policy',
    category: 'Governance',
    payload: { name: 'test', rules: [] },
  },
  { name: 'delete_ia_policy', category: 'Governance', payload: { policyId: 'test' } },
  { name: 'get_permission_matrix', category: 'Governance' },
  { name: 'clear_permission_audit', category: 'Governance' },
  { name: 'get_security_log', category: 'Governance' },
  { name: 'append_security_log', category: 'Governance', payload: { entry: 'test' } },
  { name: 'export_security_log', category: 'Governance' },
  { name: 'clear_security_log', category: 'Governance' },

  // ═══ SYSTEM CENTER COMMANDS (v21.5.3 - 7 commandes) ═══
  { name: 'sc_clear_logs', category: 'SystemCenter' },
  {
    name: 'sc_add_log',
    category: 'SystemCenter',
    payload: { level: 'info', message: 'test' },
  },
  { name: 'sc_initialize_cluster', category: 'SystemCenter' },
  { name: 'sc_shutdown_cluster', category: 'SystemCenter' },
  { name: 'sc_hypervision_stop', category: 'SystemCenter' },
  { name: 'sc_hypervision_clear_anomalies', category: 'SystemCenter' },
  {
    name: 'sc_hypervision_resolve_anomaly',
    category: 'SystemCenter',
    payload: { anomalyId: 'test' },
  },

  // ═══ MEMORY OS COMMANDS (v21.5.3 - 5 commandes) ═══
  { name: 'memory_clear', category: 'MemoryOS' },
  { name: 'memory_promote', category: 'MemoryOS', payload: { entryId: 'test' } },
  { name: 'memory_demote', category: 'MemoryOS', payload: { entryId: 'test' } },
  { name: 'memory_delete', category: 'MemoryOS', payload: { entryId: 'test' } },
  { name: 'memory_prune', category: 'MemoryOS', payload: { olderThanDays: 30 } },

  // ═══ DEVTOOLS COMMANDS (v21.5.3 - 3 commandes) ═══
  { name: 'devtools_enable', category: 'DevTools' },
  { name: 'devtools_disable', category: 'DevTools' },
  { name: 'devtools_debug_clear', category: 'DevTools' },

  // ═══ WHISPER STREAMING COMMANDS (v21.5.3 - 3 commandes) ═══
  { name: 'start_whisper_streaming', category: 'Whisper' },
  { name: 'stop_whisper_streaming', category: 'Whisper' },
  { name: 'send_audio_chunk', category: 'Whisper', payload: { chunk: [0, 0, 0] } },

  // ═══ PERSISTENT MEMORY COMMANDS (v21.5.3 - 4 commandes) ═══
  {
    name: 'persistent_memory_promote_entry',
    category: 'PersistentMemory',
    payload: { entryId: 'test' },
  },
  {
    name: 'persistent_memory_archive_entry',
    category: 'PersistentMemory',
    payload: { entryId: 'test' },
  },
  {
    name: 'persistent_memory_delete_entry',
    category: 'PersistentMemory',
    payload: { entryId: 'test' },
  },
  {
    name: 'persistent_memory_add_to_bundle',
    category: 'PersistentMemory',
    payload: { entryId: 'test', bundleId: 'test' },
  },

  // ═══ UI THEME COMMANDS (v21.5.3 - 2 commandes) ═══
  { name: 'save_ui_theme', category: 'UI', payload: { theme: { name: 'test' } } },
  { name: 'load_ui_theme', category: 'UI' },

  // ═══ SELF-HEALING COMMANDS (v21.5.3 - 4 commandes) ═══
  { name: 'self_healing_trigger', category: 'SelfHealing' },
  { name: 'self_healing_get_status', category: 'SelfHealing' },
  { name: 'self_healing_enable', category: 'SelfHealing' },
  { name: 'self_healing_disable', category: 'SelfHealing' },
];

interface TestResult {
  command: string;
  category: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'NOT_REGISTERED';
  duration_ms: number;
  error?: string;
}

/**
 * Test une seule commande avec timeout
 */
async function testCommand(cmd: CommandTest, timeout = 5000): Promise<TestResult> {
  const startTime = performance.now();

  try {
    // Timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Command timeout')), timeout);
    });

    // Execute command with timeout
    await Promise.race([invoke(cmd.name, cmd.payload || {}), timeoutPromise]);

    const duration = performance.now() - startTime;

    return {
      command: cmd.name,
      category: cmd.category,
      status: 'SUCCESS',
      duration_ms: Math.round(duration),
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Détecter si la commande n'est pas enregistrée
    const isNotRegistered =
      errorMessage.includes('not found') ||
      errorMessage.includes('No handler') ||
      errorMessage.includes('unknown variant');

    return {
      command: cmd.name,
      category: cmd.category,
      status: errorMessage.includes('timeout')
        ? 'TIMEOUT'
        : isNotRegistered
          ? 'NOT_REGISTERED'
          : 'ERROR',
      duration_ms: Math.round(duration),
      error: errorMessage,
    };
  }
}

/**
 * Test toutes les commandes et génère un rapport
 */
export async function testAllCommands(): Promise<{
  total: number;
  success: number;
  errors: number;
  timeouts: number;
  notRegistered: number;
  results: TestResult[];
  summary: Record<string, { total: number; success: number; errors: number }>;
}> {
  console.log(
    '🧪 [COMMAND TESTER] Début du test de',
    ALL_COMMANDS.length,
    'commandes...'
  );

  const results: TestResult[] = [];
  const summary: Record<string, { total: number; success: number; errors: number }> = {};

  // Test toutes les commandes en parallèle par catégorie (pour éviter overload)
  for (const cmd of ALL_COMMANDS) {
    const result = await testCommand(cmd, 3000); // 3s timeout
    results.push(result);

    // Update summary
    if (!summary[cmd.category]) {
      summary[cmd.category] = { total: 0, success: 0, errors: 0 };
    }
    summary[cmd.category].total++;
    if (result.status === 'SUCCESS') {
      summary[cmd.category].success++;
    } else {
      summary[cmd.category].errors++;
    }

    // Log progress
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(
      `${icon} [${cmd.category}] ${cmd.name} - ${result.status} (${result.duration_ms}ms)`
    );
  }

  const total = results.length;
  const success = results.filter(r => r.status === 'SUCCESS').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const timeouts = results.filter(r => r.status === 'TIMEOUT').length;
  const notRegistered = results.filter(r => r.status === 'NOT_REGISTERED').length;

  console.log('\n📊 [COMMAND TESTER] Rapport final:');
  console.log('  Total:', total);
  console.log('  ✅ Succès:', success, `(${((success / total) * 100).toFixed(1)}%)`);
  console.log('  ❌ Erreurs:', errors, `(${((errors / total) * 100).toFixed(1)}%)`);
  console.log('  ⏱️  Timeouts:', timeouts, `(${((timeouts / total) * 100).toFixed(1)}%)`);
  console.log(
    '  🚫 Non enregistrées:',
    notRegistered,
    `(${((notRegistered / total) * 100).toFixed(1)}%)`
  );

  return {
    total,
    success,
    errors,
    timeouts,
    notRegistered,
    results,
    summary,
  };
}

/**
 * Test commandes audio spécifiquement
 */
export async function testAudioCommands(): Promise<void> {
  console.log('\n🎵 [AUDIO TESTER] Test spécifique des commandes audio...\n');

  const audioCommands = ALL_COMMANDS.filter(cmd => cmd.category === 'Audio');

  for (const cmd of audioCommands) {
    const result = await testCommand(cmd, 5000);
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${icon} ${cmd.name}: ${result.status} (${result.duration_ms}ms)`);
    if (result.error) {
      console.log(`  ↳ Erreur: ${result.error}`);
    }
  }
}

/**
 * Export rapport en JSON
 */
export async function generateCommandsReport(): Promise<string> {
  const testResults = await testAllCommands();

  const report = {
    timestamp: new Date().toISOString(),
    version: 'v24.3.3',
    mode: 'YOLO',
    total_commands: testResults.total,
    statistics: {
      success: testResults.success,
      errors: testResults.errors,
      timeouts: testResults.timeouts,
      not_registered: testResults.notRegistered,
      success_rate: ((testResults.success / testResults.total) * 100).toFixed(2) + '%',
    },
    by_category: testResults.summary,
    failed_commands: testResults.results
      .filter(r => r.status !== 'SUCCESS')
      .map(r => ({
        command: r.command,
        category: r.category,
        status: r.status,
        error: r.error,
      })),
    all_results: testResults.results,
  };

  return JSON.stringify(report, null, 2);
}

// Auto-run si exécuté directement dans console
if (typeof window !== 'undefined') {
  interface WindowWithTestFunctions extends Window {
    testAllCommands: typeof testAllCommands;
    testAudioCommands: typeof testAudioCommands;
    generateCommandsReport: typeof generateCommandsReport;
  }

  const win = window as unknown as WindowWithTestFunctions;
  win.testAllCommands = testAllCommands;
  win.testAudioCommands = testAudioCommands;
  win.generateCommandsReport = generateCommandsReport;

  console.log('🚀 Command Tester v24.3.3 chargé!');
  console.log('📝 Utilisation:');
  console.log('  - testAllCommands() : Tester toutes les commandes');
  console.log('  - testAudioCommands() : Tester uniquement les commandes audio');
  console.log('  - generateCommandsReport() : Générer rapport JSON complet');
}
