#!/usr/bin/env node
/**
 * TITANE∞ — IPC Conversion Script
 * Convertit secureInvoke → tauriClient wrappers pour features hooks/services
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// =============================================================================
// COMMAND MAPPINGS
// =============================================================================

const COMMAND_MAPS = {
  // Developer Mode
  engines_devmode_get_state: 'devmodeGetState',
  engines_devmode_enable: 'devmodeEnable',
  engines_devmode_disable: 'devmodeDisable',
  engines_devmode_validate_patch: 'devmodeValidatePatch',
  engines_devmode_apply_patch: 'devmodeApplyPatch',
  engines_devmode_preview: 'devmodePreview',
  engines_devmode_rollback: 'devmodeRollback',
  engines_devmode_get_history: 'devmodeGetHistory',
  engines_devmode_create_backup: 'devmodeCreateBackup',
  engines_devmode_restore_backup: 'devmodeRestoreBackup',
  engines_devmode_get_suggestions: 'devmodeGetSuggestions',
  engines_devmode_changelog: 'devmodeChangelog',
  engines_build_start: 'enginesBuildStart',
  engines_build_get_status: 'enginesBuildGetStatus',
  engines_build_get_result: 'enginesBuildGetResult',
  engines_build_cancel: 'enginesBuildCancel',
  engines_build_clean: 'enginesBuildClean',
  engines_get_dashboard: 'enginesGetDashboard',

  // QA Monitoring
  qa_get_state: 'qaGetState',
  qa_list_test_suites: 'qaListTestSuites',
  qa_run_test_suite: 'qaRunTestSuite',
  qa_get_test_result: 'qaGetTestResult',
  qa_list_monitors: 'qaListMonitors',
  qa_create_monitor: 'qaCreateMonitor',
  qa_toggle_monitor: 'qaToggleMonitor',
  qa_delete_monitor: 'qaDeleteMonitor',
  qa_get_system_metrics: 'qaGetSystemMetrics',
  qa_list_alerts: 'qaListAlerts',
  qa_acknowledge_alert: 'qaAcknowledgeAlert',
  qa_resolve_alert: 'qaResolveAlert',
  qa_get_hardening_config: 'qaGetHardeningConfig',
  qa_update_hardening_config: 'qaUpdateHardeningConfig',
  qa_run_security_audit: 'qaRunSecurityAudit',
  qa_get_performance_report: 'qaGetPerformanceReport',
  qa_get_logs: 'qaGetLogs',
  qa_export_metrics_prometheus: 'qaExportMetricsPrometheus',
  qa_health_check: 'qaHealthCheck',

  // OneCore
  one_core_get_state: 'oneCoreGetState',
  one_core_get_metrics: 'oneCoreGetMetrics',
  one_core_list_commands: 'oneCoreListCommands',
  one_core_get_event_history: 'oneCoreGetEventHistory',
  one_core_execute_command: 'oneCoreExecuteCommand',
  one_core_run_diagnostic: 'oneCoreRunDiagnostic',
  one_core_force_sync: 'oneCoreForceSync',
  one_core_cleanup: 'oneCoreCleanup',
  one_core_set_mode: 'oneCoreSetMode',
  one_core_verify_integrity: 'oneCoreVerifyIntegrity',
  one_core_get_engine_status: 'oneCoreGetEngineStatus',

  // System Center
  sc_run_quick_diagnostics: 'scRunQuickDiagnostics',
  sc_run_full_diagnostics: 'scRunFullDiagnostics',
  sc_get_diagnostic_status: 'scGetDiagnosticStatus',
  sc_introspection_generate: 'scIntrospectionGenerate',
  sc_introspection_preview: 'scIntrospectionPreview',
  sc_introspection_auto_fix: 'scIntrospectionAutoFix',
  sc_introspection_quick_scan: 'scIntrospectionQuickScan',
  sc_introspection_full_scan: 'scIntrospectionFullScan',
  get_cognitive_state: 'getCognitiveState',
  get_singularity_state: 'getSingularityState',
  get_memory_state: 'getMemoryState',
  get_system_health: 'getSystemHealth',
  get_module_health: 'getModuleHealth',
  get_helios_metrics: 'getHeliosMetrics',
  get_runtime_config: 'getRuntimeConfig',
  get_persistence_status: 'getPersistenceStatus',
  get_system_state: 'getSystemState',
  singularity_get_full_state: 'singularityGetFullState',
  titan_get_persistence_status: 'titanGetPersistenceStatus',
  engines_devmode_analyze_file: 'devmodeAnalyzeFile',

  // Audio Center
  vad_reset: 'vadReset',
  stt_transcribe: 'sttTranscribe',
};

// =============================================================================
// CONVERSION LOGIC
// =============================================================================

function convertFile(filePath) {
  console.log(`\n🔄 Processing: ${filePath}`);

  let content = readFileSync(filePath, 'utf-8');
  let changeCount = 0;

  // 1. Replace import
  if (content.includes("from '@/lib/security'")) {
    content = content.replace(
      /import\s*{\s*secureInvoke\s*}\s*from\s+'@\/lib\/security'/g,
      "import { tauriClient } from '@/lib/tauriClient'"
    );
    changeCount++;
    console.log('  ✅ Import replaced');
  }

  // 2. Replace each command invocation
  Object.entries(COMMAND_MAPS).forEach(([cmd, wrapper]) => {
    // Pattern 1: await secureInvoke<Type>('command', { params })
    const pattern1 = new RegExp(
      `await\\s+secureInvoke<([^>]+)>\\('${cmd}',\\s*({[^}]*})\\)`,
      'g'
    );
    content = content.replace(pattern1, (match, type, params) => {
      changeCount++;
      return `await tauriClient.${wrapper}(${params}) as ${type}`;
    });

    // Pattern 2: await secureInvoke<Type>('command')
    const pattern2 = new RegExp(`await\\s+secureInvoke<([^>]+)>\\('${cmd}'\\)`, 'g');
    content = content.replace(pattern2, (match, type) => {
      changeCount++;
      return `await tauriClient.${wrapper}() as ${type}`;
    });

    // Pattern 3: secureInvoke<Type>('command').catch (no await, used in Promise.all)
    const pattern3 = new RegExp(`secureInvoke<([^>]+)>\\('${cmd}'\\)\\.catch`, 'g');
    content = content.replace(pattern3, (match, type) => {
      changeCount++;
      return `tauriClient.${wrapper}().catch`;
    });

    // Pattern 4: secureInvoke<Type>('command', { params }).catch
    const pattern4 = new RegExp(
      `secureInvoke<([^>]+)>\\('${cmd}',\\s*({[^}]*})\\)\\.catch`,
      'g'
    );
    content = content.replace(pattern4, (match, type, params) => {
      changeCount++;
      return `tauriClient.${wrapper}(${params}).catch`;
    });

    // Pattern 5: const result = await secureInvoke<Type>(\n      'command'
    const pattern5 = new RegExp(`await\\s+secureInvoke<([^>]+)>\\(\\s*'${cmd}'`, 'g');
    content = content.replace(pattern5, (match, type) => {
      changeCount++;
      return `await tauriClient.${wrapper}() as ${type}`;
    });
  });

  // 3. Write back
  writeFileSync(filePath, content, 'utf-8');

  console.log(`  📝 Total changes: ${changeCount}`);
  return changeCount;
}

// =============================================================================
// MAIN
// =============================================================================

const FILES = [
  'src/features/developer-mode/useDeveloperMode.ts',
  'src/features/qa-monitoring/useQAMonitoring.ts',
  'src/features/one-core/useOneCore.ts',
  'src/features/system-center/hooks/useDebuggerLiveOS.ts',
  'src/features/system-center/hooks/useSystemDiagnostics.ts',
  'src/features/system-center/hooks/useIntrospection.ts',
  'src/features/audio-center/services/audioService.ts',
];

let totalChanges = 0;

console.log(' ═══════════════════════════════════════════════════════════════');
console.log('TITANE∞ IPC Conversion Script');
console.log('═══════════════════════════════════════════════════════════════\n');

FILES.forEach(file => {
  const fullPath = resolve(process.cwd(), file);
  try {
    const changes = convertFile(fullPath);
    totalChanges += changes;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`✅ Conversion complete: ${totalChanges} total changes`);
console.log('═══════════════════════════════════════════════════════════════\n');
