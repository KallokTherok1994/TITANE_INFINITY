# Backup Source Search

## find results
./.vite-cache/deps/@opentelemetry_api.js
./.vite-cache/deps/@opentelemetry_api.js.map
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md
./_archive/omnis_backup_20251215
./_archive/proof_packs_2026-03-26/MEMORY_RESTORE_CLOSURE_2026-03-20_2247_61df44d0b/02_BACKUP_COVERAGE_MAP.md
./_archive/proof_packs_2026-03-26/MEMORY_RESTORE_CLOSURE_2026-03-20_2247_61df44d0b/04_RUST_LTM_BACKUP_PATH_MAP.md
./dist/assets/telemetryEngine-CEEphy57.js
./dist/assets/telemetryEngine-CEEphy57.js.br
./dist/assets/telemetryEngine-CEEphy57.js.gz
./docs/99_ARCHIVE/obsolete/BACKUP_PROTECTION_REPORT.md
./docs/99_ARCHIVE/obsolete/FIX_BACKUP_v2.0.md
./docs/adr/ADR-002-performance-guards-telemetry.md
./docs/backup_20251218_122526
./docs/backup_20251218_122540
./docs/backup_20251218_123316
./docs/super-prompts/CHANGELOG_V1_BACKUP.md
./legacy/backend/main_backup.rs
./memory/backup
./memory/backup/cognitive.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/cognitive.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/cognitive.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/harmonics.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/harmonics.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/harmonics.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/ltm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/ltm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/ltm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/mtm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/mtm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/mtm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/singularity.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/singularity.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/singularity.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/stm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/stm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/stm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/system_state.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/system_state.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/system_state.json.backup-2026-03-23T12-49-39-977Z
./node_modules/.pnpm/@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+core@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+resources@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+semantic-conventions@1.40.0
./node_modules/.pnpm/node_modules/@opentelemetry
./node_modules/.pnpm/vitest@4.1.1_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_402750081a0eb862733f9a599cb31063
./node_modules/.pnpm/vitest@4.1.2_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_1202c9a508990b03c89eb33315907e7f
./proof_packs/ORCHESTRATOR_FIXES_2026-03-23_1007_641001554/10_DIFF_FILES.diff
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/frontend_supervision.patch
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/governance_and_tooling.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/package.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src.diff
./reports/instructions-seal/20260214-011649/06_DIFF.patch
./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json
./scripts/core/lib/telemetry.sh
./scripts/setup/TITANE_PRE_MIGRATION_BACKUP.sh
./src-tauri/icons/backup_icons_20251128_145500
./src-tauri/src/api/telemetry_api.rs
./src-tauri/src/devtools/telemetry.rs
./src-tauri/src/memory/telemetry.rs
./src-tauri/src/monitoring/telemetry
./src-tauri/src/persistence/backup.rs
./src-tauri/src/time/backup_engine.rs
./src/services/backup
./src/services/backup/AutoBackupService.ts
./src/services/telemetry
./src/services/telemetry/useProductionHealthTelemetry.ts
./src/types/telemetry.ts
./src/utils/advancedTelemetry.ts
./src/utils/telemetryEngine.ts
./titane_local_training/backup_info.txt

## rg results (supervision/telemetry)
./titane_local_training/dataset.jsonl:20:{"prompt": "Crée un handler Tauri pour memory_debug_scan", "response": "```rust\n#[tauri::command]\nasync fn memory_debug_scan {\nlog::info!(\"Mock: memory_debug_scan called\");\n    let report = telemetry::scan_memory_directory();\n    Ok(serde_json::to_value(report).unwrap_or_else(|_| {\n        json!({\n            \"base_path\": \"memory\",\n            \"missing\": true,\n            \"total_size_bytes\": 0,\n            \"files\": []\n}\n```"}
./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./registry/ui-events.jsonl:67:{"id":"ui-042","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|no-silence|e2e","change_type":"fix","summary":"Durcissement anti-silence du panneau Santé Prod + test E2E ciblé","reason":"Éviter un crash ErrorBoundary en mode web sans runtime Tauri; valider un état visible (données ou erreur) et action de refresh.","files_changed":["src/lib/security.ts","src/services/telemetry/useProductionHealthTelemetry.ts","src/features/production-health/ProductionHealthPanel.tsx","e2e/features/production-health.spec.ts"],"tests_run":["pnpm exec playwright test features/production-health.spec.ts --project=chromium (3 passed)","pnpm run test:architecture","pnpm run test:rust"],"proofs":["Erreur visible au lieu de silence/crash","E2E ciblé production-health: 3/3 PASS"],"risk_level":"low","rollback":"git restore -- src/lib/security.ts src/services/telemetry/useProductionHealthTelemetry.ts src/features/production-health/ProductionHealthPanel.tsx e2e/features/production-health.spec.ts registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 3 Services + Ring 4 UI/E2E","maturity_status":"QUALIFIED"}
./registry/ui-events.jsonl:71:{"id": "post_prod_ops_phase3_continuous_diff_complete_20260223T175650Z", "timestamp_utc": "2026-02-23T17:56:50Z", "event_type": "PHASE_3_CONTINUOUS_DIFF_VERDICT", "campaign": "POST-PROD_OPS_CONTINUOUS_GOVERNANCE", "phase": 3, "prod_version": "v27.0.5-prod", "prod_tag_sha": "a1bf79e29be3e6188bd4ab0f9c4d864dd433ab69", "check_count": 1, "metrics_checked": 6, "metrics_stable": 6, "metrics_improved": 5, "metrics_warning": 0, "metrics_critical": 0, "provider_health": "stable_improved", "conversation_engine_health": "stable_improved", "ui_health": "stable_improved", "telemetry_status": "normal", "anomalies_new": 0, "verdict": "PASS_STABLE", "next_phase_ready": true, "next_phase": "POST-PROD_OPS_PHASE_4_TRUTH_CENTER", "proof_pack_location": "runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/"}
./pnpm-lock.yaml:7543:      '@opentelemetry/api': ^1.9.0
./pnpm-lock.yaml:7555:      '@opentelemetry/api':
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:139:pnpm add @opentelemetry/api @opentelemetry/sdk-trace-web @opentelemetry/instrumentation
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:142:#### `src/services/telemetry/tracer.ts`
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:148:#### `src/services/telemetry/ipcInstrumentation.ts`
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:154:#### `src/services/telemetry/logCorrelator.ts`
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:184:#### `src/services/telemetry/driftDetector.ts`
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:256:src/services/telemetry/tracer.ts
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:257:src/services/telemetry/ipcInstrumentation.ts
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:258:src/services/telemetry/logCorrelator.ts
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:259:src/services/telemetry/driftDetector.ts
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md:284:1. ✅ Installer `react-force-graph-2d` et `@opentelemetry/*`
./tests/unit/fusion/SingularityFusionEngine.test.ts:179:          telemetry: false,
./tests/unit/autonomy/SingularityAutonomyEngine.test.ts:294:    it('updates health score based on live telemetry', async () => {
./e2e/features/production-health.spec.ts:3: * Validate Admin tab integration and core telemetry UI states.
./scripts/certification/phases_real/p11_human_acceptance_real.sh:151:3. Activate production telemetry and monitoring
./scripts/test-final-integration.sh:30:    ["telemetry_test"]=0
./scripts/test-final-integration.sh:88:        "scripts/core/lib/telemetry.sh"
./scripts/test-final-integration.sh:113:        "scripts/core/lib/telemetry.sh"
./scripts/test-final-integration.sh:288:test_telemetry() {
./scripts/test-final-integration.sh:294:    if source scripts/core/lib/telemetry.sh 2>/dev/null; then
./scripts/test-final-integration.sh:295:        log_success "Telemetry library loads successfully" "telemetry_test"
./scripts/test-final-integration.sh:303:    telemetry_start_timer "test_timer" 2>/dev/null
./scripts/test-final-integration.sh:305:    local duration=$(telemetry_stop_timer "test_timer" 2>/dev/null)
./scripts/test-final-integration.sh:308:        log_success "Telemetry timer works ($duration ms)" "telemetry_test"
./scripts/test-final-integration.sh:315:    if telemetry_log_event "test_event" "Test message" "{}" 2>/dev/null; then
./scripts/test-final-integration.sh:316:        log_success "Telemetry event logging works" "telemetry_test"
./scripts/test-final-integration.sh:420:- Timers: $(if [[ ${TEST_RESULTS["telemetry_test"]} -ge 2 ]]; then echo "✅ Performance Tracking"; else echo "❌ Issues"; fi)
./scripts/test-final-integration.sh:533:    test_telemetry
./scripts/install-all.sh:22:source "$CORE_DIR/lib/telemetry.sh"
./scripts/install-all.sh:138:    TITANE_TELEMETRY_ENABLED     Enable/disable telemetry
./scripts/install-all.sh:210:    local start_time=$(telemetry_start_timer "complete_install")
./scripts/install-all.sh:213:        local duration=$(telemetry_stop_timer "complete_install" "$start_time")
./scripts/install-all.sh:217:        local duration=$(telemetry_stop_timer "complete_install" "$start_time")
./scripts/install-all.sh:281:        telemetry_get_stats "1d"
./scripts/install-all.sh:371:    telemetry_start_timer "master_install"
./scripts/install-all.sh:401:            telemetry_stop_timer "master_install"
./scripts/install-all.sh:414:        telemetry_stop_timer "master_install"
./src/__tests__/utils/performanceGuards.test.ts:89:  let telemetry: AdvancedTelemetry;
./src/__tests__/utils/performanceGuards.test.ts:92:    telemetry = new AdvancedTelemetry({ enableConsoleLogging: false });
./src/__tests__/utils/performanceGuards.test.ts:96:    telemetry.stop();
./src/__tests__/utils/performanceGuards.test.ts:100:    telemetry.trackMetric('test', 'counter', 42);
./src/__tests__/utils/performanceGuards.test.ts:102:    const events = telemetry.getEvents({ type: 'metric', category: 'test' });
./src/__tests__/utils/performanceGuards.test.ts:109:    telemetry.trackError('test', error);
./src/__tests__/utils/performanceGuards.test.ts:111:    const events = telemetry.getEvents({ type: 'error', category: 'test' });
./src/__tests__/utils/performanceGuards.test.ts:117:    telemetry.trackWarning('test', 'Warning message');
./src/__tests__/utils/performanceGuards.test.ts:119:    const events = telemetry.getEvents({ type: 'warning', category: 'test' });
./src/__tests__/utils/performanceGuards.test.ts:125:    telemetry.trackInfo('test', 'Info message');
./src/__tests__/utils/performanceGuards.test.ts:127:    const events = telemetry.getEvents({ type: 'info', category: 'test' });
./src/__tests__/utils/performanceGuards.test.ts:132:    await telemetry.trackOperation('test', 'operation', async () => {
./src/__tests__/utils/performanceGuards.test.ts:137:    const aggregation = telemetry.getAggregation('test', 'operation.duration');
./src/__tests__/utils/performanceGuards.test.ts:144:      telemetry.trackMetric('test', 'values', i);
./src/__tests__/utils/performanceGuards.test.ts:147:    const aggregation = telemetry.getAggregation('test', 'values');
./src/__tests__/utils/performanceGuards.test.ts:157:    telemetry.trackMetric('test', 'metric', 100);
./src/__tests__/utils/performanceGuards.test.ts:158:    telemetry.trackError('test', new Error('Test'));
./src/__tests__/utils/performanceGuards.test.ts:159:    telemetry.trackWarning('test', 'Warning');
./src/__tests__/utils/performanceGuards.test.ts:161:    const health = telemetry.getHealthMetrics();
./src/__tests__/utils/performanceGuards.test.ts:169:      telemetry.trackMetric('test', 'counter', i);
./src/__tests__/utils/performanceGuards.test.ts:172:    telemetry.flush();
./src/__tests__/utils/performanceGuards.test.ts:174:    const events = telemetry.getEvents();
./src/__tests__/utils/performanceGuards.test.ts:179:    telemetry.trackMetric('category1', 'metric1', 1);
./src/__tests__/utils/performanceGuards.test.ts:180:    telemetry.trackMetric('category2', 'metric2', 2);
./src/__tests__/utils/performanceGuards.test.ts:181:    telemetry.trackError('category1', new Error('Error'));
./src/__tests__/utils/performanceGuards.test.ts:183:    const category1Events = telemetry.getEvents({ category: 'category1' });
./src/__tests__/utils/performanceGuards.test.ts:186:    const metricEvents = telemetry.getEvents({ type: 'metric' });
./src/__tests__/utils/performanceGuards.test.ts:189:    const errorEvents = telemetry.getEvents({ type: 'error' });
./src/__tests__/utils/performanceGuards.test.ts:194:    const endTimer = telemetry.startTimer('test', 'timer');
./src/__tests__/utils/performanceGuards.test.ts:200:    const aggregation = telemetry.getAggregation('test', 'timer');
./src/__tests__/utils/performanceGuards.test.ts:217:  it('should have global telemetry', () => {
./scripts/core/orchestrator.sh:18:source "$SCRIPT_DIR/lib/telemetry.sh"
./scripts/core/orchestrator.sh:78:    telemetry_log_event "task_completed" "Task $task_id completed successfully"
./scripts/core/orchestrator.sh:91:    telemetry_log_event "task_failed" "Task $task_id failed: $error"
./scripts/core/orchestrator.sh:201:    local start_time=$(telemetry_start_timer "task_$task_id")
./scripts/core/orchestrator.sh:202:    if telemetry_wrap_command "$command"; then
./scripts/core/orchestrator.sh:203:        local duration=$(telemetry_stop_timer "task_$task_id" "$start_time")
./scripts/core/orchestrator.sh:208:        local duration=$(telemetry_stop_timer "task_$task_id" "$start_time")
./scripts/core/orchestrator.sh:216:    local start_time=$(telemetry_start_timer "workflow_$workflow_name")
./scripts/core/orchestrator.sh:229:    local duration=$(telemetry_stop_timer "workflow_$workflow_name" "$start_time")
./scripts/core/orchestrator.sh:234:        telemetry_log_event "workflow_completed" "Workflow $workflow_name completed successfully"
./scripts/core/orchestrator.sh:238:        telemetry_log_event "workflow_failed" "Workflow $workflow_name failed: ${failed_tasks[*]}"
./scripts/core/lib/telemetry.sh:10:TELEMETRY_DIR="${TITANE_TELEMETRY_DIR:-$HOME/.cache/titane-infinity/telemetry}"
./scripts/core/lib/telemetry.sh:29:telemetry_init() {
./scripts/core/lib/telemetry.sh:63:telemetry_start_timer() {
./scripts/core/lib/telemetry.sh:69:telemetry_stop_timer() {
./scripts/core/lib/telemetry.sh:79:    telemetry_record_metric "performance.${operation}.duration_ms" "$duration_ms"
./scripts/core/lib/telemetry.sh:80:    telemetry_record_metric "performance.${operation}.last_run" "$(date +%s)"
./scripts/core/lib/telemetry.sh:85:telemetry_record_metric() {
./scripts/core/lib/telemetry.sh:110:telemetry_log_event() {
./scripts/core/lib/telemetry.sh:156:telemetry_log_command() {
./scripts/core/lib/telemetry.sh:170:    telemetry_log_event "command_executed" "Command executed" "$metadata"
./scripts/core/lib/telemetry.sh:177:telemetry_get_stats() {
./scripts/core/lib/telemetry.sh:278:telemetry_export_session() {
./scripts/core/lib/telemetry.sh:310:telemetry_cleanup() {
./scripts/core/lib/telemetry.sh:334:telemetry_wrap_command() {
./scripts/core/lib/telemetry.sh:336:    local start_time=$(telemetry_start_timer "command")
./scripts/core/lib/telemetry.sh:345:    local duration=$(telemetry_stop_timer "command" "$start_time")
./scripts/core/lib/telemetry.sh:346:    telemetry_log_command "$command" "$exit_code" "$duration"
./scripts/core/lib/telemetry.sh:351:telemetry_track_cache() {
./scripts/core/lib/telemetry.sh:353:    telemetry_log_event "cache_$operation" "Cache $operation"
./scripts/core/lib/telemetry.sh:361:telemetry_init
./scripts/core/lib/telemetry.sh:364:trap 'telemetry_export_session' EXIT
./scripts/core/modules/system-check.sh:16:source "scripts/core/lib/telemetry.sh"
./scripts/core/modules/system-check.sh:424:telemetry_start_timer "system_check"
./scripts/core/modules/system-check.sh:430:telemetry_stop_timer "system_check"
./scripts/core/modules/dependency-manager.sh:16:source "$SCRIPT_DIR/lib/telemetry.sh"
./scripts/core/modules/dependency-manager.sh:143:    telemetry_start_timer "pnpm_install"
./scripts/core/modules/dependency-manager.sh:146:        telemetry_stop_timer "pnpm_install"
./scripts/core/modules/dependency-manager.sh:155:        telemetry_stop_timer "pnpm_install"
./scripts/core/modules/dependency-manager.sh:167:    telemetry_start_timer "npm_install"
./scripts/core/modules/dependency-manager.sh:170:        telemetry_stop_timer "npm_install"
./scripts/core/modules/dependency-manager.sh:174:        telemetry_stop_timer "npm_install"
./scripts/core/modules/dependency-manager.sh:236:    telemetry_start_timer "cargo_update"
./scripts/core/modules/dependency-manager.sh:240:        telemetry_stop_timer "cargo_update"
./scripts/core/modules/dependency-manager.sh:244:        telemetry_start_timer "cargo_check"
./scripts/core/modules/dependency-manager.sh:246:            telemetry_stop_timer "cargo_check"
./scripts/core/modules/dependency-manager.sh:250:            telemetry_stop_timer "cargo_check"
./scripts/core/modules/dependency-manager.sh:255:        telemetry_stop_timer "cargo_update"
./scripts/core/modules/dependency-manager.sh:446:telemetry_start_timer "dependency_install"
./scripts/core/modules/dependency-manager.sh:452:telemetry_stop_timer "dependency_install"
./src/features/production-health/ProductionHealthPanel.tsx:8:import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';
./src/features/production-health/ProductionHealthPanel.tsx:9:import type { ProductionHealthErrorKind } from '@/services/telemetry/useProductionHealthTelemetry';
./src/features/production-health/ProductionHealthPanel.tsx:11:import type { ProductionHealthStatus } from '@/types/telemetry';
./src/features/kernel/MemoryGraph.tsx:22:  const telemetry = useTelemetry();
./src/features/kernel/MemoryGraph.tsx:33:    const telemetryInterval = setInterval(() => {
./src/features/kernel/MemoryGraph.tsx:39:      clearInterval(telemetryInterval);
./src/features/kernel/MemoryGraph.tsx:258:      {telemetry && (
./src/features/kernel/MemoryGraph.tsx:262:            {telemetry.base_path} — {telemetry.files.length} fichiers —{' '}
./src/features/kernel/MemoryGraph.tsx:263:            {(telemetry.total_size_bytes / (1024 * 1024)).toFixed(2)} MB
./src/features/kernel/MemoryGraph.tsx:265:          {telemetry.files.length === 0 ? (
./src/features/kernel/MemoryGraph.tsx:269:              {telemetry.files.slice(0, 5).map(file => (
./src/config/offline-first.ts:43:  telemetry: false,
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/08_ROLLBACK.md:8:- frontend_supervision.patch is EMPTY; untracked frontend files were removed and cannot be rehydrated from this proof pack.
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:86:+    "@opentelemetry/api": "^1.9.1",
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:87:+    "@opentelemetry/sdk-trace-web": "^2.6.1",
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:1430:diff --git a/src-tauri/src/api/telemetry_api.rs b/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:1432:--- a/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:1433:+++ b/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:3673:+    Ok("No synthetic optimization was applied in this compatibility path. Use the SystemHealth command surface for real health telemetry and auto-heal control.".to_string())
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:10376:             telemetry: None,
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:11557:diff --git a/src-tauri/src/memory/telemetry.rs b/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:11559:--- a/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:11560:+++ b/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:12038:diff --git a/src-tauri/src/monitoring/telemetry/mod.rs b/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:12040:--- a/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:12041:+++ b/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:13950:     pub async fn telemetry(&self) -> HashMap<String, String> {
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/07_DIFF_FILES.md:10:- frontend_supervision.patch
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:32: M src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:115: M src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:124: M src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:243:?? src-tauri/src/commands/supervision_commands.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:282:?? src/services/telemetry/ipcInstrumentation.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:283:?? src/services/telemetry/tracer.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:344: src-tauri/src/api/telemetry_api.rs                 |  29 +-
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:427: src-tauri/src/memory/telemetry.rs                  |  19 +-
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:436: src-tauri/src/monitoring/telemetry/mod.rs          |   4 +-
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:542:src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:625:src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/01_BOOTSTRAP.md:634:src-tauri/src/monitoring/telemetry/mod.rs
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2697:./docs/adr/ADR-002-performance-guards-telemetry.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4609:./docs/_evidence/v27/v26_ui_telemetry_discovery/DISCOVERY_REPORT.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6467:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/api-logs/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6468:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/api/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6469:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/context-async-hooks/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6470:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6471:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/core/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6472:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-amqplib/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6473:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-connect/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6474:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-dataloader/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6475:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-express/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6476:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-fs/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6477:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-generic-pool/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6478:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-graphql/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6479:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-hapi/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6480:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-http/node_modules/@opentelemetry/semantic-conventions/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6481:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-http/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6482:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-ioredis/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6483:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-kafkajs/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6484:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-knex/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6485:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-koa/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6486:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-lru-memoizer/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6487:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-mongodb/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6488:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-mongoose/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6489:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-mysql2/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6490:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-mysql/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6491:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-pg/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6492:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6493:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-redis-4/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6494:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-tedious/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6495:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/instrumentation-undici/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6496:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/redis-common/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6497:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/resources/node_modules/@opentelemetry/semantic-conventions/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6498:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/resources/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6499:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/sdk-trace-base/node_modules/@opentelemetry/semantic-conventions/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6500:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/sdk-trace-base/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6501:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/semantic-conventions/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6502:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@opentelemetry/sql-common/README.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:6541:./.tools/node/_extract/node-v24.0.0-linux-x64/lib/node_modules/lighthouse/node_modules/@sentry/opentelemetry/README.md
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:1156:diff --git a/src-tauri/src/api/telemetry_api.rs b/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:1158:--- a/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:1159:+++ b/src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:3399:+    Ok("No synthetic optimization was applied in this compatibility path. Use the SystemHealth command surface for real health telemetry and auto-heal control.".to_string())
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:10102:             telemetry: None,
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11283:diff --git a/src-tauri/src/memory/telemetry.rs b/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11285:--- a/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11286:+++ b/src-tauri/src/memory/telemetry.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11764:diff --git a/src-tauri/src/monitoring/telemetry/mod.rs b/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11766:--- a/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:11767:+++ b/src-tauri/src/monitoring/telemetry/mod.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:13676:     pub async fn telemetry(&self) -> HashMap<String, String> {
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/00_EXEC_SUMMARY.md:6:- Archive failure: untracked frontend supervision cluster content was not preserved (frontend_supervision.patch is empty)
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/archive_candidates.txt:10:src/services/telemetry/ipcInstrumentation.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/archive_candidates.txt:11:src/services/telemetry/tracer.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/untracked_files.txt:238:src-tauri/src/commands/supervision_commands.rs
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/untracked_files.txt:283:src/services/telemetry/ipcInstrumentation.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/untracked_files.txt:284:src/services/telemetry/tracer.ts
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/package.diff:20:+    "@opentelemetry/api": "^1.9.1",
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/package.diff:21:+    "@opentelemetry/sdk-trace-web": "^2.6.1",
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/03_ARCHIVE_CANDIDATES.md:3:Primary candidate: Frontend supervision / telemetry cluster
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/03_ARCHIVE_CANDIDATES.md:4:- Evidence: PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md and matching UI/telemetry files
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/03_ARCHIVE_CANDIDATES.md:5:- Intended archive method: inventory + patch (frontend_supervision.patch)
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/03_ARCHIVE_CANDIDATES.md:9:- frontend_supervision.patch is EMPTY (archive failed)
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/05_ACTION_LOG.md:91:frontend_supervision.patch is empty (0 bytes). The archive capture for untracked frontend supervision files failed, and those files were removed by git clean. Content is not recoverable from this proof pack.
./src/services/lazy.ts:14: * - Memory + telemetry
./src/services/lazy.ts:85: * Load telemetry + metrics services (performance engine, reporters)
./src/services/lazy.ts:86: * Chunk: services-telemetry (~150KB)
./src/services/lazy.ts:87: * Called: On performance dashboard or telemetry panel
./src/services/lazy.ts:90:  if (moduleCache.has('telemetry')) {
./src/services/lazy.ts:91:    return moduleCache.get('telemetry');
./src/services/lazy.ts:95:  moduleCache.set('telemetry', module);
./src/services/telemetry/useProductionHealthTelemetry.ts:9:import type { ProductionHealthSummary } from '@/types/telemetry';
./src/services/telemetry/useProductionHealthTelemetry.ts:35:  if (msg.includes('Invalid telemetry payload') || msg.includes('Invalid CSV'))
./src/services/telemetry/useProductionHealthTelemetry.ts:104:        throw new Error('Invalid telemetry payload');
./src/services/tauri/backend-v17.2.types.ts:661:    telemetry: boolean;
./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/governance_status_report.json:15:  "telemetry_deviations": 0,
./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json:47:  "overall_telemetry_verdict": "STABLE",
./docs/api/_media/CHANGELOG.md:190:- **`devtools/telemetry.rs`**: Télémétrie système
./docs/api/_media/CHANGELOG.md:275:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/api/_media/CHANGELOG.md:291:- ✅ Observabilité totale via DevTools (logs + metrics + telemetry)
./docs/V26_UI_IMPLEMENTATION.md:11:**Path:** `src/types/telemetry.ts` (NEW)
./docs/V26_UI_IMPLEMENTATION.md:60:**Path:** `src/services/telemetry/useProductionHealthTelemetry.ts` (NEW)
./docs/V26_UI_IMPLEMENTATION.md:71:import type { ProductionHealthSummary } from '@/types/telemetry';
./docs/V26_UI_IMPLEMENTATION.md:156:import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';
./docs/V26_UI_IMPLEMENTATION.md:158:import type { ProductionHealthStatus } from '@/types/telemetry';
./docs/V26_UI_IMPLEMENTATION.md:628:**Path:** `src-tauri/src/api/telemetry_api.rs` (NEW)
./docs/V26_UI_IMPLEMENTATION.md:1013:pub mod telemetry_api;
./docs/V26_UI_IMPLEMENTATION.md:1021:    telemetry_api::read_production_week1_csv
./docs/V26_UI_IMPLEMENTATION.md:1071:cargo test --lib telemetry_api::tests -- --nocapture
./docs/V26_UI_IMPLEMENTATION.md:1074:pnpm run test:unit -- telemetry
./docs/V26_UI_IMPLEMENTATION.md:1088:  src/types/telemetry.ts \
./docs/V26_UI_IMPLEMENTATION.md:1089:  src/services/telemetry/useProductionHealthTelemetry.ts \
./docs/V26_UI_IMPLEMENTATION.md:1092:  src-tauri/src/api/telemetry_api.rs \
./docs/V26_UI_IMPLEMENTATION.md:1098:git commit -m "feat(ui): production health telemetry V25 week1 (Ring 1-4, Tauri IPC)"
./src/components/SystemIntegrationHub.tsx:15:import { titaneTelemetry } from '../utils/telemetryEngine';
./src/components/SystemIntegrationHub.tsx:20:// import type { TelemetryReport } from '../utils/telemetryEngine';
./src/components/SystemIntegrationHub.tsx:44:  telemetryAlerts: number;
./src/components/SystemIntegrationHub.tsx:58:    telemetryAlerts: 0,
./src/components/SystemIntegrationHub.tsx:85:      t: state.telemetryAlerts,
./src/components/SystemIntegrationHub.tsx:115:      const telemetryReport = titaneTelemetry.generateTelemetryReport('5m');
./src/components/SystemIntegrationHub.tsx:124:        telemetryAlerts: telemetryReport.alerts.filter(a => !a.acknowledged).length,
./src/components/SystemIntegrationHub.tsx:442:        {hubState.telemetryAlerts > 0 && (
./src/components/SystemIntegrationHub.tsx:456:            🚨 {hubState.telemetryAlerts}
./src/components/SystemIntegrationHub.tsx:590:                style={{ color: hubState.telemetryAlerts > 0 ? '#ff6b6b' : '#00ff88' }}
./src/components/SystemIntegrationHub.tsx:592:                {hubState.telemetryAlerts}
./src/stores/memoryStore.ts:25:  telemetry: MemoryDirectoryReport | null;
./src/stores/memoryStore.ts:44:  telemetry: null,
./src/stores/memoryStore.ts:136:          const telemetry = await backendV17.memory.debugScan();
./src/stores/memoryStore.ts:137:          set({ telemetry });
./src/stores/memoryStore.selectors.ts:18:export const useTelemetry = () => useMemoryStore(state => state.telemetry);
./_archive/scripts_2026-03-26/test-quantum-integration.sh:163:        "src/utils/telemetryEngine.ts"
./src/hooks/useAppInitialization.ts:246:    import('../utils/telemetryEngine').catch(err => {
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/04_BLAME_HEAD.txt:690:51ad2571b 690 (Kevin Thibault 2026-02-17 18:10:48 -0500 690) - Weekly assessment of Day 1-7 telemetry
./src/lib/fusion/types.ts:32:  /** Toggle telemetry subsystem */
./src/lib/fusion/types.ts:33:  telemetry?: boolean;
./src/lib/fusion/types.ts:48:  telemetry: boolean;
./src/lib/fusion/types.ts:189:  'telemetry',
./src/lib/fusion/types.ts:233:  telemetry: true,
./src/utils/quantumIntelligence.ts:12:import { titaneTelemetry } from './telemetryEngine';
./src/utils/quantumIntelligence.ts:448:    const telemetryReport = titaneTelemetry.generateTelemetryReport('15m');
./src/utils/quantumIntelligence.ts:455:      telemetryReport.summary.systemHealth,
./src/utils/quantumIntelligence.ts:456:      telemetryReport.summary.performanceScore,
./src/utils/quantumIntelligence.ts:457:      telemetryReport.summary.alertsGenerated / 10, // Normaliser
./src/utils/telemetryEngine.ts:97:    console.log('📊 [TELEMETRY] Initializing advanced telemetry & analytics engine...');
./src/utils/telemetryEngine.ts:115:      '📈 [TELEMETRY] Advanced telemetry engine online with',
./src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./src/utils/quantumOrchestrator.ts:14:import { titaneTelemetry } from './telemetryEngine';
./src/utils/quantumOrchestrator.ts:47:  telemetry: {
./src/utils/quantumOrchestrator.ts:137:        metrics => metrics.telemetry.active_alerts > 3,
./src/utils/quantumOrchestrator.ts:196:        metrics => metrics.telemetry.performance_score < 0.7,
./src/utils/quantumOrchestrator.ts:231:        metrics => metrics.telemetry.active_alerts > 10,
./src/utils/quantumOrchestrator.ts:279:          Date.now() - this.lastMetrics?.telemetry.data_collection_rate > 300000, // 5 minutes
./src/utils/quantumOrchestrator.ts:307:      const [quantumState, healingState, telemetryReport, bootStats] =
./src/utils/quantumOrchestrator.ts:346:        telemetry: {
./src/utils/quantumOrchestrator.ts:348:            telemetryReport.status === 'fulfilled' && telemetryReport.value?.metrics
./src/utils/quantumOrchestrator.ts:349:              ? telemetryReport.value.metrics.performance_score?.value || 0.5
./src/utils/quantumOrchestrator.ts:352:            telemetryReport.status === 'fulfilled' && telemetryReport.value?.alerts
./src/utils/quantumOrchestrator.ts:353:              ? telemetryReport.value.alerts.filter(a => !a.acknowledged).length
./src/utils/quantumOrchestrator.ts:356:            telemetryReport.status === 'fulfilled' && telemetryReport.value?.metrics
./src/utils/quantumOrchestrator.ts:357:              ? telemetryReport.value.metrics.data_collection_rate?.value || 0
./src/utils/quantumOrchestrator.ts:360:            telemetryReport.status === 'fulfilled' && telemetryReport.value?.patterns
./src/utils/quantumOrchestrator.ts:361:              ? telemetryReport.value.patterns.filter(p => p.confidence > 0.8).length /
./src/utils/quantumOrchestrator.ts:362:                Math.max(1, telemetryReport.value.patterns.length)
./src/utils/quantumOrchestrator.ts:396:        telemetry: {
./src/utils/quantumOrchestrator.ts:430:      metrics.telemetry.active_alerts /
./src/utils/quantumOrchestrator.ts:431:      Math.max(1, metrics.telemetry.data_collection_rate);
./src/utils/quantumOrchestrator.ts:433:      this.lastMetrics.telemetry.active_alerts /
./src/utils/quantumOrchestrator.ts:434:      Math.max(1, this.lastMetrics.telemetry.data_collection_rate);
./src/utils/quantumOrchestrator.ts:441:      metrics.telemetry.performance_score - this.lastMetrics.telemetry.performance_score
./src/utils/quantumOrchestrator.ts:448:    if (metrics.telemetry.performance_score < 0.6) {
./src/utils/quantumOrchestrator.ts:456:    if (metrics.telemetry.active_alerts > 5) {
./src/utils/quantumOrchestrator.ts:473:      metrics.telemetry.performance_score < 0.6 ||
./src/utils/quantumOrchestrator.ts:475:        metrics.telemetry.performance_score < 0.8) ||
./src/utils/quantumOrchestrator.ts:477:        metrics.telemetry.performance_score < 0.7)
./src/utils/quantumOrchestrator.ts:492:    if (metrics.telemetry.data_collection_rate < 30) {
./src/utils/quantumOrchestrator.ts:496:    if (metrics.telemetry.performance_score < 0.6) {
./src/utils/quantumOrchestrator.ts:506:    if (metrics.telemetry.performance_score < 0.4) aggressiveness += 0.3;
./src/utils/quantumOrchestrator.ts:517:      metrics.telemetry.pattern_detection_accuracy > 0.6 &&
./src/utils/quantumOrchestrator.ts:534:      const [quantumLearning, healingLearning, telemetryLearning] =
./src/utils/quantumOrchestrator.ts:551:      const improvements = [quantumLearning, healingLearning, telemetryLearning].filter(
./src/utils/performanceOptimizer.ts:472:      './telemetryEngine.ts',
./src/utils/advancedTelemetry.ts:374:   * Stop telemetry
./src/core/singularity/SingularityFusionEngine.ts:396:      // new_state has: { memory_sync, logs_sync, dataset_sync, singularity_sync, performance_guards, auto_healing, crash_protection, telemetry }
./src/core/singularity/SingularityFusionEngine.ts:402:        emotion: newState.telemetry ?? intention.requires_emotion,
./src/core/types/system.types.ts:21:  telemetry: boolean;
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:2073:reports/e2e_memory_guard_validate/2026-02-12T00:52:33Z/rust_telemetry_tests.log
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:10733:runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:11261:src-tauri/src/devtools/telemetry.rs
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:11555:src-tauri/src/monitoring/telemetry
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:11761:src-tauri/src/memory/telemetry.rs
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:12023:src-tauri/src/api/telemetry_api.rs
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:19944:docs/adr/ADR-002-performance-guards-telemetry.md
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:20315:src/types/telemetry.ts
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:20629:src/utils/telemetryEngine.ts
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:21515:src/services/telemetry
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:21516:src/services/telemetry/useProductionHealthTelemetry.ts
./_archive/proof_packs_2026-03-26/SEAL_PROD_2026-03-03_2143_98262da88/01_BOOTSTRAP.md:22271:scripts/core/lib/telemetry.sh
./src/types/backend.d.ts:300:  telemetry_enabled: boolean;
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:9:- Archive failure: untracked frontend supervision cluster content was not preserved (frontend_supervision.patch is empty)
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:31:Primary candidate: Frontend supervision / telemetry cluster
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:32:- Evidence: PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md and matching UI/telemetry files
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:33:- Intended archive method: inventory + patch (frontend_supervision.patch)
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:37:- frontend_supervision.patch is EMPTY (archive failed)
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:85:- frontend_supervision.patch is EMPTY; untracked frontend files were removed and cannot be rehydrated from this proof pack.
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:332:src-tauri/src/commands/supervision_commands.rs
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:377:src/services/telemetry/ipcInstrumentation.ts
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/02_PREVIOUS_PACK_STATE.md:378:src/services/telemetry/tracer.ts
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:1:./.vite-cache/deps/@opentelemetry_api.js
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:2:./.vite-cache/deps/@opentelemetry_api.js.map
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:7:./dist/assets/telemetryEngine-CEEphy57.js
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:8:./dist/assets/telemetryEngine-CEEphy57.js.br
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:9:./dist/assets/telemetryEngine-CEEphy57.js.gz
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:12:./docs/adr/ADR-002-performance-guards-telemetry.md
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:40:./node_modules/.pnpm/@opentelemetry+api@1.9.1
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:41:./node_modules/.pnpm/@opentelemetry+core@2.6.1_@opentelemetry+api@1.9.1
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:42:./node_modules/.pnpm/@opentelemetry+resources@2.6.1_@opentelemetry+api@1.9.1
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:43:./node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.6.1_@opentelemetry+api@1.9.1
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:44:./node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.6.1_@opentelemetry+api@1.9.1
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:45:./node_modules/.pnpm/@opentelemetry+semantic-conventions@1.40.0
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:46:./node_modules/.pnpm/node_modules/@opentelemetry
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:47:./node_modules/.pnpm/vitest@4.1.1_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_402750081a0eb862733f9a599cb31063
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:48:./node_modules/.pnpm/vitest@4.1.2_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_1202c9a508990b03c89eb33315907e7f
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:51:./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/frontend_supervision.patch
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:57:./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:58:./scripts/core/lib/telemetry.sh
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:61:./src-tauri/src/api/telemetry_api.rs
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:62:./src-tauri/src/devtools/telemetry.rs
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:63:./src-tauri/src/memory/telemetry.rs
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:64:./src-tauri/src/monitoring/telemetry
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:69:./src/services/telemetry
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:70:./src/services/telemetry/useProductionHealthTelemetry.ts
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:71:./src/types/telemetry.ts
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt:73:./src/utils/telemetryEngine.ts
./docs/api/README.md:160:- **`telemetry.rs`**: Télémétrie OS/Hardware
./docs/DEPLOYMENT_REPORT_v26.3.0.md:285:- Review runtime logs if telemetry available
./docs/90_release/DEPLOYMENT_EXECUTION_REPORT_v26.3.0.md:156:- Monitor telemetry/logs (if available)
./docs/adr/004-type-safe-any-elimination-strategy.md:93:- **Impact**: Type-safe logging and telemetry
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:300:src-tauri/src/memory/telemetry.rs:134:        let size_bytes = metadata.len();
./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/90_release/PRODUCTION_STATUS_v27.0.1_OPERATIONAL.md:202:- Collect telemetry on chat usage
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/12_UNIT_RUN_ATTEMPT_2.txt:47088:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/12_UNIT_RUN_ATTEMPT_2.txt:49676:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/12_UNIT_RUN_ATTEMPT_2.txt:49693:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./docs/90_release/PRODUCTION_DEPLOYMENT_VERDICT_v27.0.2.md:142:- Track error telemetry (new error types should have different distribution)
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/13_UNIT_RUN_ATTEMPT_3.txt:47109:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/13_UNIT_RUN_ATTEMPT_3.txt:49697:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/13_UNIT_RUN_ATTEMPT_3.txt:49714:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./docs/90_release/DEPLOYMENT_FINAL_REPORT_v26.3.0.md:192:4. **Monitor telemetry** for first 24 hours
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_2.txt:48973:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_2.txt:51076:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_2.txt:51093:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./docs/super-prompts/backend/SUPER_PROMPT_02_RUST_BACKEND_CLEANUP.md:377:    pub enable_telemetry: bool,
./docs/super-prompts/backend/SUPER_PROMPT_02_RUST_BACKEND_CLEANUP.md:390:            enable_telemetry: false,
./docs/90_release/DEPLOYMENT_MANIFEST_v27.0.0.md:172:# Désactiver telemetry en production
./docs/90_release/DEPLOYMENT_MANIFEST_v27.0.0.md:189:telemetry = false
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_3.txt:47846:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_3.txt:47863:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_3.txt:48774:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/06_INT_RUN_ATTEMPT_1.txt:2402:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/06_INT_RUN_ATTEMPT_1.txt:2419:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/06_INT_RUN_ATTEMPT_1.txt:2571:      telemetry: [33mfalse[39m
./docs/backup_20251218_122540/BUILD_VALIDATION_REPORT.md:67:- Modules dépréciés: `memory::telemetry` → migration vers `unified_memory_v2`
./docs/backup_20251218_122540/BUILD_VALIDATION_REPORT.md:250:   - Migrer `memory::telemetry` → `unified_memory_v2`
./docs/backup_20251218_122540/RESUME_VISUEL_v26.2.md:211:- Opt-in telemetry (privacy-first)
./docs/backup_20251218_122540/RUST_DEPRECATION_MIGRATION_PLAN.md:25:- `memory::telemetry` → `unified_memory_v2::get_state()`
./docs/backup_20251218_122540/RUST_DEPRECATION_MIGRATION_PLAN.md:87:use crate::memory::telemetry;
./docs/90_release/PRODUCTION_DEPLOYMENT_v27.2.0_SEALED.md:225:- ⏳ Analyze telemetry
./docs/backup_20251218_122540/ANALYSE_SECURITE_PERFORMANCE_v24.2.0.md:81:   - ✅ No telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_1.txt:48688:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_1.txt:51195:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_1.txt:51212:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./docs/90_release/PRODUCTION_DEPLOYMENT_MANIFEST_v27.0.3.md:89:3. Enable production telemetry and monitoring
./docs/backup_20251218_122540/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:479:- Zero remote telemetry (local-only)
./docs/backup_20251218_122540/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:661:- Remote telemetry opt-in
./docs/90_release/PRODUCTION_GO_LIVE_AUTHORIZATION.md:98:   - Production telemetry enabled
./docs/90_release/PRODUCTION_GO_LIVE_AUTHORIZATION.md:189:titane-infinity  # Starts with production telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_2.txt:49073:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_2.txt:50061:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_2.txt:50078:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./docs/CHANGELOG.md:162:  - Directive de supervision
./docs/backup_20251218_122540/CHANGELOG.md:2687:- **`devtools/telemetry.rs`**: Télémétrie système
./docs/backup_20251218_122540/CHANGELOG.md:2776:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/backup_20251218_122540/CHANGELOG.md:2792:- ✅ Observabilité totale via DevTools (logs + metrics + telemetry)
./docs/90_release/CHANGELOG__CHANGELOG.md.md:3344:- **`devtools/telemetry.rs`**: Télémétrie système
./docs/90_release/CHANGELOG__CHANGELOG.md.md:3433:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/90_release/CHANGELOG__CHANGELOG.md.md:3449:- ✅ Observabilité totale via DevTools (logs + metrics + telemetry)
./docs/phases/PHASE_3_SPRINT_13_RUST_COVERAGE_BASELINE.md:100:| `memory/telemetry` | ✅ **Well Tested** | **18 tests** (env, scan, detect, version parsing) |
./docs/phases/PHASE_3_SPRINT_13_RUST_COVERAGE_BASELINE.md:110:- ✅ `memory/telemetry`: **18 tests discovered** (env, scan, detect, version parsing)
./docs/phases/PHASE_3_SPRINT_13_RUST_COVERAGE_BASELINE.md:190:- [x] Gap identification: memory/telemetry, rate_limit, 403 untested files
./docs/phases/PHASE_3_SPRINT_13_RUST_COVERAGE_BASELINE.md:213:   - Add tests to memory/telemetry module
./docs/phases/PHASE_3_SPRINT_13_RUST_COVERAGE_CHALLENGE.md:135:- memory/telemetry: ❌ (mentionné dans logs)
./docs/phases/PHASE_3_COMPLETE.md:69:- ✅ **22 tests découverts** dans modules "gap" (telemetry: 18, rate_limit: 4)
./docs/phases/PHASE_3_COMPLETE.md:76:Modules critiques (telemetry, rate_limit) avaient **excellent coverage** malgré perception initiale de "gaps". Leçon: **vérifier avant d'assumer**.
./docs/phases/PHASE_3_COMPLETE.md:234:**Découverte:** telemetry (18 tests), rate_limit (4 tests) - excellents alors que flaggés "gaps"  
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:17:- ✅ **memory/telemetry**: **18 tests** (env resolution, scan, detect, version parsing)
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:43:| **memory/telemetry** | **18** | ✅ Good | P1 |
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:76:- ✅ memory/telemetry: **18 tests** (env, scan, detect, version)
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:145:- memory/telemetry: "0% coverage"
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:149:- memory/telemetry: **18 comprehensive tests**
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:162:  - `test_get_stats` (telemetry)
./docs/phases/PHASE_3_SPRINT_13_FINAL_REPORT.md:279:**Challenge:** Grep-based analysis flagged memory/telemetry as "0% coverage".
./src-tauri/src/api/mod.rs:15:pub mod telemetry_api;
./src-tauri/src/api/memory_api.rs:8:    memory::telemetry,
./src-tauri/src/api/memory_api.rs:144:    let report = telemetry::scan_memory_directory();
./src-tauri/src/fusion_commands_week1.rs:30:    pub telemetry: bool,
./src-tauri/src/fusion_commands_week1.rs:43:            telemetry: true,
./src-tauri/src/fusion_commands_week1.rs:136:    pub telemetry: Option<bool>,
./src-tauri/src/fusion_commands_week1.rs:246:    if let Some(val) = request.telemetry {
./src-tauri/src/fusion_commands_week1.rs:247:        if val != modules.telemetry {
./src-tauri/src/fusion_commands_week1.rs:248:            modules.telemetry = val;
./src-tauri/src/fusion_commands_week1.rs:250:                activated.push("telemetry".to_string());
./src-tauri/src/fusion_commands_week1.rs:252:                deactivated.push("telemetry".to_string());
./src-tauri/src/fusion_commands_week1.rs:519:            telemetry: None,
./docs/phases/PHASE_3_SPRINT_13_COMPLETE.md:42:- ✅ **Well tested:** `agent_system`, `singularity_state`, `types/*`, `memory/telemetry` (18 tests)
./docs/phases/PHASE_3_SPRINT_13_COMPLETE.md:53:1. **memory/telemetry:** 0% coverage, critical module
./docs/phases/PHASE_3_SPRINT_13_COMPLETE.md:91:   - memory/telemetry: 0% coverage
./docs/phases/PHASE_3_SPRINT_13_COMPLETE.md:166:- **3** modules with critical gaps (memory/telemetry, rate_limit, utils)
./docs/phases/PHASE_3_SPRINT_13_COMPLETE.md:172:- Target memory/telemetry (0% → 80%+)
./src-tauri/src/mock_commands.rs:9:use crate::memory::telemetry;
./src-tauri/src/mock_commands.rs:246:    let report = telemetry::scan_memory_directory();
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_3.txt:48371:      telemetry: [33mfalse[39m
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_3.txt:49360:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_3.txt:49377:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./src-tauri/src/services/network_gateway.rs:353:    pub async fn telemetry(&self) -> HashMap<String, String> {
./src-tauri/src/memory/mod.rs:11:pub mod telemetry;
./src-tauri/src/memory/telemetry.rs:101:/// Scan the memory directory and return lightweight telemetry for observability.
./src-tauri/src/main.rs:727:    pub mod telemetry_api {
./src-tauri/src/main.rs:728:        include!("api/telemetry_api.rs");
./src-tauri/src/main.rs:1697:            api::telemetry_api::read_production_week1_csv,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:189:src/__tests__/utils/performanceGuards.test.ts:161:    const health = telemetry.getHealthMetrics();
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:190:src/__tests__/utils/performanceGuards.test.ts:194:    const endTimer = telemetry.startTimer('test', 'timer');
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1005:src/utils/quantumIntelligence.ts:455:      telemetryReport.summary.systemHealth,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1171:src/utils/telemetryEngine.ts:11:import { titaneSelfHealing } from './selfHealingSystem';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1172:src/utils/telemetryEngine.ts:12:import { bootHealthMonitor } from './advancedBootMonitor';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1173:src/utils/telemetryEngine.ts:46:    systemHealth: number;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1174:src/utils/telemetryEngine.ts:165:      const healthReport = bootHealthMonitor.generateReport();
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1175:src/utils/telemetryEngine.ts:166:      const healingState = titaneSelfHealing.getSystemState();
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1176:src/utils/telemetryEngine.ts:181:          name: 'System Health Score',
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1177:src/utils/telemetryEngine.ts:209:          name: 'Page Load Time',
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1178:src/utils/telemetryEngine.ts:540:      setTimeout(() => {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1179:src/utils/telemetryEngine.ts:954:        systemHealth: this.calculateOverallHealth(),
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1180:src/utils/telemetryEngine.ts:1080:  private calculateOverallHealth(): number {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1312:src/utils/quantumOrchestrator.ts:307:      const [quantumState, healingState, telemetryReport, bootStats] =
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1815:src/types/telemetry.ts:7:export type ProductionHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1816:src/types/telemetry.ts:17:export interface ProductionHealthSample {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1817:src/types/telemetry.ts:27:  providerTimeoutsPerHour?: number;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1818:src/types/telemetry.ts:31:export interface ProductionHealthSummary {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1819:src/types/telemetry.ts:32:  status: ProductionHealthStatus;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:1820:src/types/telemetry.ts:38:  lastSample: ProductionHealthSample;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:4441:src/features/production-health/ProductionHealthPanel.tsx:8:import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:4442:src/features/production-health/ProductionHealthPanel.tsx:10:import type { ProductionHealthStatus } from '@/types/telemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7321:src/services/telemetry/useProductionHealthTelemetry.ts:9:import type { ProductionHealthSummary } from '@/types/telemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7322:src/services/telemetry/useProductionHealthTelemetry.ts:11:export interface UseProductionHealthTelemetryOptions {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7323:src/services/telemetry/useProductionHealthTelemetry.ts:16:function isProductionHealthSummary(value: unknown): value is ProductionHealthSummary {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7324:src/services/telemetry/useProductionHealthTelemetry.ts:32:export function useProductionHealthTelemetry(
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7325:src/services/telemetry/useProductionHealthTelemetry.ts:33:  options: UseProductionHealthTelemetryOptions = {}
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7326:src/services/telemetry/useProductionHealthTelemetry.ts:37:  const [data, setData] = useState<ProductionHealthSummary | null>(null);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7327:src/services/telemetry/useProductionHealthTelemetry.ts:40:  const intervalRef = useRef<NodeJS.Timeout | null>(null);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7328:src/services/telemetry/useProductionHealthTelemetry.ts:65:      if (!isProductionHealthSummary(response)) {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/09_rg_admin_src.txt:7329:src/services/telemetry/useProductionHealthTelemetry.ts:100:    isHealthy: data?.status === 'GREEN',
./src-tauri/src/monitoring/telemetry/mod.rs:9:/// Telemetry event (from devtools/telemetry.rs)
./src-tauri/src/monitoring/telemetry/mod.rs:31:    /// Record telemetry event
./src-tauri/src/monitoring/telemetry/mod.rs:63:    pub fn export_opentelemetry(&self) -> Result<String, String> {
./src-tauri/src/monitoring/telemetry/mod.rs:71:        Ok(format!("# HELP titane_events_total Total telemetry events\n# TYPE titane_events_total counter\ntitane_events_total {}\n", self.events.len()))
./src-tauri/src/monitoring/telemetry/mod.rs:91:    fn test_telemetry_exporter_new() {
./src-tauri/src/monitoring/mod.rs:3://   Unified monitoring, metrics, performance, and telemetry
./src-tauri/src/monitoring/mod.rs:24://! └── telemetry/     - Telemetry export (OpenTelemetry, Prometheus)
./src-tauri/src/monitoring/mod.rs:30:pub mod telemetry;
./src-tauri/src/monitoring/mod.rs:41:    pub telemetry: Arc<RwLock<telemetry::TelemetryExporter>>,
./src-tauri/src/monitoring/mod.rs:72:            telemetry: Arc::new(RwLock::new(telemetry::TelemetryExporter::new())),
./src-tauri/src/monitoring/mod.rs:129:        assert!(Arc::strong_count(&engine.telemetry) == 1);
./src-tauri/src/agent_system/config.rs:26:    pub supervision_config: SupervisionConfig,
./src-tauri/src/agent_system/config.rs:55:            supervision_config: SupervisionConfig::default(),
./src-tauri/src/agent_system/config.rs:81:            supervision_config: SupervisionConfig {
./src-tauri/src/agent_system/config.rs:112:            supervision_config: SupervisionConfig {
./src-tauri/src/agent_system/config.rs:147:            supervision_config: SupervisionConfig {
./src-tauri/src/agent_system/config.rs:231:    pub fn supervision_config(mut self, config: SupervisionConfig) -> Self {
./src-tauri/src/agent_system/config.rs:232:        self.config.supervision_config = config;
./src-tauri/src/agent_system/supervisor.rs:11:/// Stratégie de supervision
./src-tauri/src/agent_system/supervisor.rs:20:    /// Auto-supervision (l'agent se supervise lui-même)
./src-tauri/src/agent_system/supervisor.rs:30:/// Configuration de supervision
./src-tauri/src/agent_system/supervisor.rs:52:/// Événement de supervision
./src-tauri/src/agent_system/supervisor.rs:61:/// Type d'événement de supervision
./src-tauri/src/agent_system/mod.rs:76:            supervisor: Supervisor::new(config.supervision_config.clone()),
./src-tauri/src/meta/mod.rs:6://! This module implements the highest-level cognitive supervision:
./src-tauri/src/kernel/priorities.rs:76:            "indexer" | "compactor" | "analytics" | "telemetry" => CognitivePriority::Background,
./docs/backup_20251218_122526/RUST_DEPRECATION_MIGRATION_PLAN.md:25:- `memory::telemetry` → `unified_memory_v2::get_state()`
./docs/backup_20251218_122526/RUST_DEPRECATION_MIGRATION_PLAN.md:87:use crate::memory::telemetry;
./src-tauri/src/devtools/logging.rs:92:                           // - Library: opentelemetry crate with tracing integration
./src-tauri/src/devtools/mod.rs:12:pub mod telemetry;
./src-tauri/src/devtools/mod.rs:25:pub use telemetry::*;
./src-tauri/src/devtools/telemetry.rs:14:    // Implementation: Full distributed tracing and telemetry system
./src-tauri/src/devtools/telemetry.rs:32:        // Implementation: Persistent telemetry event storage and aggregation
./src-tauri/src/devtools/telemetry.rs:33:        // - Storage: Append to ~/.titane/telemetry/events.jsonl (JSON Lines format)
./src-tauri/src/core/legacy.rs:10:use crate::memory::telemetry;
./src-tauri/src/core/legacy.rs:64:/// MemoryCore vΩ.6 — disk-backed persistence with telemetry hooks
./src-tauri/src/core/legacy.rs:134:        let audit_report = telemetry::scan_memory_directory();
./src-tauri/src/core/legacy.rs:135:        let disk_mode = telemetry::detect_disk_mode(&audit_report);
./src-tauri/src/core/legacy.rs:356:        let base_dir = telemetry::resolve_memory_dir();
./docs/backup_20251218_122540/RUST_WARNINGS_FIXED.md:30:   - `memory::telemetry` → `unified_memory_v2`
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_1.txt:28129:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_1.txt:28146:[90mstderr[2m | tests/unit/autonomy/SingularityAutonomyEngine.test.ts[2m > [22m[2mSingularityAutonomyEngine[2m > [22m[2mauto_test[2m > [22m[2mupdates health score based on live telemetry
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_1.txt:32724:      telemetry: [33mfalse[39m
./_archive/proof_packs_2026-03-26/audio_truth_2026-03-15_1902_e91124efc/01_BOOTSTRAP.md:70:af6e2cd89 fix(telemetry): ADMIN_SANTE_PROD_RUNTIME_2026-03-15
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28277: .../v26_ui_telemetry_discovery/A_api_ipc_scan.txt  |     36 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28279: .../v27/v26_ui_telemetry_discovery/A_head.txt      |      1 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28280: .../v26_ui_telemetry_discovery/A_router_scan.txt   |     30 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28281: .../v27/v26_ui_telemetry_discovery/A_status.txt    |      4 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28282: .../v26_ui_telemetry_discovery/A_tauri_config.txt  |     27 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28283: .../v26_ui_telemetry_discovery/A_ui_candidates.txt |     20 -
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/04_git_diff_release_head_stat.txt:28284: .../v26_ui_telemetry_discovery/DISCOVERY_REPORT.md |    539 -
./src-tauri/src/types/memory.rs:34:/// File-level telemetry for the memory directory audit
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:1273:src-tauri/src/api/telemetry_api.rs:48:#[tauri::command]
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2825:src-tauri/src/memory/telemetry.rs:140:            .and_then(system_time_to_millis)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2826:src-tauri/src/memory/telemetry.rs:199:fn system_time_to_millis(time: SystemTime) -> Option<i64> {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2827:src-tauri/src/memory/telemetry.rs:428:    fn test_system_time_to_millis() {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2828:src-tauri/src/memory/telemetry.rs:430:        let millis = system_time_to_millis(now);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2829:src-tauri/src/memory/telemetry.rs:437:    fn test_system_time_to_millis_epoch() {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:2830:src-tauri/src/memory/telemetry.rs:439:        let millis = system_time_to_millis(epoch);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7971:src-tauri/src/agent_system/config.rs:26:    pub supervision_config: SupervisionConfig,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7974:src-tauri/src/agent_system/config.rs:55:            supervision_config: SupervisionConfig::default(),
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7977:src-tauri/src/agent_system/config.rs:81:            supervision_config: SupervisionConfig {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7980:src-tauri/src/agent_system/config.rs:112:            supervision_config: SupervisionConfig {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7984:src-tauri/src/agent_system/config.rs:147:            supervision_config: SupervisionConfig {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7995:src-tauri/src/agent_system/config.rs:231:    pub fn supervision_config(mut self, config: SupervisionConfig) -> Self {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:7996:src-tauri/src/agent_system/config.rs:232:        self.config.supervision_config = config;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:8019:src-tauri/src/agent_system/mod.rs:76:            supervisor: Supervisor::new(config.supervision_config.clone()),
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/12_rg_tauri_commands.txt:9221:src-tauri/src/devtools/telemetry.rs:14:    // Implementation: Full distributed tracing and telemetry system
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:1389:src-tauri/src/core/legacy.rs:64:/// MemoryCore vΩ.6 — disk-backed persistence with telemetry hooks
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2208:src-tauri/src/devtools/telemetry.rs:32:        // Implementation: Persistent telemetry event storage and aggregation
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2499:src-tauri/src/memory/telemetry.rs:11:/// Resolve the base directory storing persisted memory JSON files.
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2985:src/utils/telemetryEngine.ts:204:      if (typeof window === 'undefined') return [];
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2986:src/utils/telemetryEngine.ts:876:    if (typeof window === 'undefined') return;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2987:src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2988:src/utils/telemetryEngine.ts:906:    if (typeof window === 'undefined') return;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/16_rg_storage_undefined.txt:2989:src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./docs/backup_20251218_122540/SESSION_REPORT_v26.2_PREDICTIVE.md:734:- Opt-in telemetry (privacy-first)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:774:src-tauri/src/api/telemetry_api.rs:24:    pub provider_timeouts_per_hour: Option<f64>,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:775:src-tauri/src/api/telemetry_api.rs:70:                provider_timeouts_per_hour: None,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:776:src-tauri/src/api/telemetry_api.rs:118:                provider_timeouts_per_hour: None,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:777:src-tauri/src/api/telemetry_api.rs:171:    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:778:src-tauri/src/api/telemetry_api.rs:184:        provider_timeouts_per_hour,
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/13_rg_provider_omega.txt:5213:src/types/telemetry.ts:27:  providerTimeoutsPerHour?: number;
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26410:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_api_ipc_scan.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26411:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_backend_structure.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26412:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_head.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26413:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_router_scan.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26414:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_status.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26415:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_tauri_config.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26416:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_ui_candidates.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/09_diff_docs.txt:26417:D	docs/_evidence/v27/v26_ui_telemetry_discovery/DISCOVERY_REPORT.md
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:1087:src/stores/memoryStore.selectors.ts:18:export const useTelemetry = () => useMemoryStore(state => state.telemetry);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:1759:src/types/telemetry.ts:7:export type ProductionHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:1760:src/types/telemetry.ts:9:export const PRODUCTION_HEALTH_THRESHOLDS = {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:1761:src/types/telemetry.ts:17:export interface ProductionHealthSample {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:1762:src/types/telemetry.ts:31:export interface ProductionHealthSummary {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:6995:src/features/production-health/ProductionHealthPanel.tsx:8:import { useProductionHealthTelemetry } from '@/services/telemetry/useProductionHealthTelemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:6997:src/features/production-health/ProductionHealthPanel.tsx:10:import type { ProductionHealthStatus } from '@/types/telemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:9640:src/utils/quantumIntelligence.ts:12:import { titaneTelemetry } from './telemetryEngine';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:11636:src/services/telemetry/useProductionHealthTelemetry.ts:7:import { useEffect, useState, useCallback, useRef } from 'react';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:11637:src/services/telemetry/useProductionHealthTelemetry.ts:8:import { tauriClient } from '@/lib/tauriClient';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:11638:src/services/telemetry/useProductionHealthTelemetry.ts:9:import type { ProductionHealthSummary } from '@/types/telemetry';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:11639:src/services/telemetry/useProductionHealthTelemetry.ts:11:export interface UseProductionHealthTelemetryOptions {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:11640:src/services/telemetry/useProductionHealthTelemetry.ts:32:export function useProductionHealthTelemetry(
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12272:src/utils/telemetryEngine.ts:10:import { _titaneAI } from './aiPredictiveEngine';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12273:src/utils/telemetryEngine.ts:11:import { titaneSelfHealing } from './selfHealingSystem';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12274:src/utils/telemetryEngine.ts:12:import { bootHealthMonitor } from './advancedBootMonitor';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12275:src/utils/telemetryEngine.ts:13:import { performanceOptimizer } from './performanceOptimizer';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12276:src/utils/telemetryEngine.ts:905:  private async saveData(): Promise<void> {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12277:src/utils/telemetryEngine.ts:917:      console.warn('📊 [TELEMETRY] Failed to save data:', error);
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12278:src/utils/telemetryEngine.ts:1102:        this.saveData();
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12279:src/utils/telemetryEngine.ts:1110:export const titaneTelemetry = new TitaneTelemetryEngine();
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12280:src/utils/telemetryEngine.ts:1113:export type {
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12455:src/utils/quantumOrchestrator.ts:14:import { titaneTelemetry } from './telemetryEngine';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12991:src/components/SystemIntegrationHub.tsx:15:import { titaneTelemetry } from '../utils/telemetryEngine';
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/11_rg_invoke_src.txt:12996:src/components/SystemIntegrationHub.tsx:20:// import type { TelemetryReport } from '../utils/telemetryEngine';
./docs/backup_20251218_122526/CHANGELOG.md:2687:- **`devtools/telemetry.rs`**: Télémétrie système
./docs/backup_20251218_122526/CHANGELOG.md:2776:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/backup_20251218_122526/CHANGELOG.md:2792:- ✅ Observabilité totale via DevTools (logs + metrics + telemetry)
./docs/current/performance/OPTIMISATIONS_CONTINUES_v26.2_COMPLETE.md:550:- [ ] Opt-in telemetry (privacy-first avec anonymization)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/17_rg_todo_stub.txt:2003:src-tauri/src/devtools/telemetry.rs:12:/// Collecteur de télémétrie simple (placeholder pour future expansion)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/17_rg_todo_stub.txt:2074:src-tauri/src/monitoring/telemetry/mod.rs:62:    /// Export for OpenTelemetry (placeholder)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/boot/17_rg_todo_stub.txt:2075:src-tauri/src/monitoring/telemetry/mod.rs:68:    /// Export for Prometheus (placeholder)
./docs/current/audits/AUDIT_FINAL_v26.2_COMPLETE.md:575:- ✅ Zero remote telemetry (local-only)
./docs/current/audits/AUDIT_FINAL_v26.2_COMPLETE.md:750:- Opt-in telemetry (privacy-first)
./docs/backup_20251218_122540/OPTIMISATIONS_CONTINUES_v26.2_COMPLETE.md:550:- [ ] Opt-in telemetry (privacy-first avec anonymization)
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28277:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_api_ipc_scan.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28278:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_backend_structure.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28279:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_head.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28280:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_router_scan.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28281:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_status.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28282:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_tauri_config.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28283:D	docs/_evidence/v27/v26_ui_telemetry_discovery/A_ui_candidates.txt
./_archive/proof_packs_2026-03-26/ADMIN_TOTAL_AUDIT_FIX_2026-03-14_1901_b771239b0/raw/01_diff_name_status_all.txt:28284:D	docs/_evidence/v27/v26_ui_telemetry_discovery/DISCOVERY_REPORT.md
./_archive/proof_packs_2026-03-26/E2E_DESKTOP_ULTRA_2026-03-17_1730_32391d3a/06_TARGET_AUTHORITY_MAP.md:46:- feat(heal+telemetry+persona): wire autoHealEngine (e5515d71f)
./_archive/proof_packs_2026-03-26/E2E_DESKTOP_ULTRA_2026-03-17_1730_32391d3a/01_BOOTSTRAP.md:16:e5515d71f feat(heal+telemetry+persona): wire autoHealEngine to circuitBreaker, activate telemetry at boot, clarify persona path
./docs/backup_20251218_122540/AUDIT_FINAL_v26.2_COMPLETE.md:575:- ✅ Zero remote telemetry (local-only)
./docs/backup_20251218_122540/AUDIT_FINAL_v26.2_COMPLETE.md:750:- Opt-in telemetry (privacy-first)
./docs/backup_20251218_122526/RUST_WARNINGS_FIXED.md:30:   - `memory::telemetry` → `unified_memory_v2`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:1288:./docs/adr/ADR-002-performance-guards-telemetry.md:146:import { globalPerformanceGuard, TrackPerformance } from '@/utils/performanceGuards';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:1289:./docs/adr/ADR-002-performance-guards-telemetry.md:147:import { globalTelemetry, TrackTelemetry } from '@/utils/advancedTelemetry';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:1290:./docs/adr/ADR-002-performance-guards-telemetry.md:173:import { globalTelemetry } from '@/utils/advancedTelemetry';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:7265:./titane_local_training/dataset.jsonl:20:{"prompt": "Crée un handler Tauri pour memory_debug_scan", "response": "```rust\n#[tauri::command]\nasync fn memory_debug_scan {\nlog::info!(\"Mock: memory_debug_scan called\");\n    let report = telemetry::scan_memory_directory();\n    Ok(serde_json::to_value(report).unwrap_or_else(|_| {\n        json!({\n            \"base_path\": \"memory\",\n            \"missing\": true,\n            \"total_size_bytes\": 0,\n            \"files\": []\n}\n```"}
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:20143:./docs/SESSION_IMPLEMENTATION_DEVTOOLS_v17.2.0.md:46:- `src-tauri/src/devtools/telemetry.rs` - Placeholder pour expansion future
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:22988:./docs/_evidence/v27/E_rg_v26_v27.txt:1212:./src-tauri/src/lib.rs:81:pub mod monitoring; // ✅ v27.0: Unified Monitoring Engine (metrics, performance, health, telemetry)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:23730:./docs/_evidence/v27/A2_find_maxdepth4_sorted.txt:7216:./src-tauri/src/devtools/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:23931:./docs/_evidence/v27/A2_find_maxdepth4_sorted.txt:7417:./src-tauri/src/memory/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:23999:./docs/_evidence/v27/A2_find_maxdepth4_sorted.txt:7485:./src-tauri/src/monitoring/telemetry
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25910:./docs/_evidence/v27/snapshot-20260113-081652/A2_find_maxdepth4.txt:7232:./src-tauri/src/devtools/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:26111:./docs/_evidence/v27/snapshot-20260113-081652/A2_find_maxdepth4.txt:7433:./src-tauri/src/memory/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:26179:./docs/_evidence/v27/snapshot-20260113-081652/A2_find_maxdepth4.txt:7501:./src-tauri/src/monitoring/telemetry
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:27182:./docs/99_ARCHIVE/merged/STATUS_v17.2.0_FINAL.md:70:- `src-tauri/src/devtools/telemetry.rs` (200 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34073:./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:186:**File**: `src-tauri/src/devtools/telemetry.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34074:./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:417:- **Fichier**: `src-tauri/src/devtools/telemetry.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:37988:./docs/_evidence/audit-2026-01-15/inventory_files.txt:68375:src-tauri/src/devtools/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:38189:./docs/_evidence/audit-2026-01-15/inventory_files.txt:68576:src-tauri/src/memory/telemetry.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:38251:./docs/_evidence/audit-2026-01-15/inventory_files.txt:68638:src-tauri/src/monitoring/telemetry/mod.rs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140029:src/utils/quantumIntelligence.ts:12:import { titaneTelemetry } from './telemetryEngine';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140040:src/utils/telemetryEngine.ts:10:import { _titaneAI } from './aiPredictiveEngine';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140041:src/utils/telemetryEngine.ts:11:import { titaneSelfHealing } from './selfHealingSystem';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140042:src/utils/telemetryEngine.ts:12:import { bootHealthMonitor } from './advancedBootMonitor';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140043:src/utils/telemetryEngine.ts:13:import { performanceOptimizer } from './performanceOptimizer';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:140123:src/utils/quantumOrchestrator.ts:14:import { titaneTelemetry } from './telemetryEngine';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:142711:src/components/SystemIntegrationHub.tsx:15:import { titaneTelemetry } from '../utils/telemetryEngine';
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:142716:src/components/SystemIntegrationHub.tsx:20:// import type { TelemetryReport } from '../utils/telemetryEngine';
./docs/FINAL_ARCHITECTURE_v17.2.0.md:73:- `telemetry.rs` (50 lignes)
./docs/FINAL_ARCHITECTURE_v17.2.0.md:267:│   └── telemetry.rs        # Future: distributed tracing
./docs/backup_20251218_122526/SESSION_REPORT_v26.2_PREDICTIVE.md:734:- Opt-in telemetry (privacy-first)
./docs/SESSION_IMPLEMENTATION_DEVTOOLS_v17.2.0.md:46:- `src-tauri/src/devtools/telemetry.rs` - Placeholder pour expansion future
./docs/SESSION_IMPLEMENTATION_DEVTOOLS_v17.2.0.md:171:│   └── telemetry.rs        (Future expansion)
./docs/SESSION_IMPLEMENTATION_DEVTOOLS_v17.2.0.md:326:- ✅ **Pas de TODOs** (sauf telemetry.rs pour future)
./docs/backup_20251218_122540/VALIDATION_FINALE_v26.2.md:264:- Opt-in telemetry
./docs/backup_20251218_122540/ANALYSE_COMPLETE_PRODUCTION_v24.2.0.md:373:✅ **Zero Trust**: Local-first, no telemetry, Tauri-only
./docs/backend/BACKEND_OPTIMIZATION_PLAN.md:309:- ✅ Error telemetry (track error rates by type)
./docs/SYNTHESE_FINALE_v17.2.0.md:46:✅ telemetry.rs      - Placeholder future (50 lignes)
./docs/SYNTHESE_FINALE_v17.2.0.md:151:- ✅ Pas de TODOs (sauf telemetry.rs pour expansion future)
./docs/backup_20251218_122526/OPTIMISATIONS_CONTINUES_v26.2_COMPLETE.md:550:- [ ] Opt-in telemetry (privacy-first avec anonymization)
./docs/backup_20251218_122540/README_v19.5.2_OLD.md:716:- **`telemetry.rs`**: Télémétrie OS/Hardware
./docs/DUAL_RUNTIME_WORKFLOW.md:904:# Enable telemetry in runtime/dev/.env.development
./docs/DUAL_RUNTIME_WORKFLOW.md:906:VITE_TELEMETRY_ENDPOINT=http://localhost:3001/telemetry
./docs/backup_20251218_122526/AUDIT_FINAL_v26.2_COMPLETE.md:575:- ✅ Zero remote telemetry (local-only)
./docs/backup_20251218_122526/AUDIT_FINAL_v26.2_COMPLETE.md:750:- Opt-in telemetry (privacy-first)
./docs/ai/SECRETS_STORAGE.md:381:- Pas de telemetry
./docs/roadmap/CORE_ENGINE_TRACK.md:119:**What:** Backend modules (telemetry, security, IPC) are secure, tested, and maintainable
./docs/roadmap/CORE_ENGINE_TRACK.md:130:- Test coverage report (by module: telemetry, security, IPC, memory_os)
./docs/GO_ALL_SESSION_2026-01-07.md:23:| **monitoring/telemetry/** | 7 | New → ~80% | ✅ Complete |
./docs/GO_ALL_SESSION_2026-01-07.md:34:└── telemetry/mod.rs       (100 lines, 7 tests)
./docs/GO_ALL_SESSION_2026-01-07.md:169:5. **monitoring/telemetry/mod.rs** (100 lines, 7 tests)
./docs/GO_ALL_SESSION_2026-01-07.md:228:   - mod.rs, metrics/mod.rs, performance/mod.rs, health/mod.rs, telemetry/mod.rs
./docs/GO_ALL_SESSION_2026-01-07.md:239:└── telemetry/mod.rs
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:62:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:63:./registry/ui-events.jsonl:67:{"id":"ui-042","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|no-silence|e2e","change_type":"fix","summary":"Durcissement anti-silence du panneau Santé Prod + test E2E ciblé","reason":"Éviter un crash ErrorBoundary en mode web sans runtime Tauri; valider un état visible (données ou erreur) et action de refresh.","files_changed":["src/lib/security.ts","src/services/telemetry/useProductionHealthTelemetry.ts","src/features/production-health/ProductionHealthPanel.tsx","e2e/features/production-health.spec.ts"],"tests_run":["pnpm exec playwright test features/production-health.spec.ts --project=chromium (3 passed)","pnpm run test:architecture","pnpm run test:rust"],"proofs":["Erreur visible au lieu de silence/crash","E2E ciblé production-health: 3/3 PASS"],"risk_level":"low","rollback":"git restore -- src/lib/security.ts src/services/telemetry/useProductionHealthTelemetry.ts src/features/production-health/ProductionHealthPanel.tsx e2e/features/production-health.spec.ts registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 3 Services + Ring 4 UI/E2E","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:700:./proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:62:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:701:./proof_packs/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:63:./registry/ui-events.jsonl:67:{"id":"ui-042","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|no-silence|e2e","change_type":"fix","summary":"Durcissement anti-silence du panneau Santé Prod + test E2E ciblé","reason":"Éviter un crash ErrorBoundary en mode web sans runtime Tauri; valider un état visible (données ou erreur) et action de refresh.","files_changed":["src/lib/security.ts","src/services/telemetry/useProductionHealthTelemetry.ts","src/features/production-health/ProductionHealthPanel.tsx","e2e/features/production-health.spec.ts"],"tests_run":["pnpm exec playwright test features/production-health.spec.ts --project=chromium (3 passed)","pnpm run test:architecture","pnpm run test:rust"],"proofs":["Erreur visible au lieu de silence/crash","E2E ciblé production-health: 3/3 PASS"],"risk_level":"low","rollback":"git restore -- src/lib/security.ts src/services/telemetry/useProductionHealthTelemetry.ts src/features/production-health/ProductionHealthPanel.tsx e2e/features/production-health.spec.ts registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 3 Services + Ring 4 UI/E2E","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:2289:./src-tauri/src/devtools/telemetry.rs:33:        // - Storage: Append to ~/.titane/telemetry/events.jsonl (JSON Lines format)
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:2676:./docs/01_misc/8_6_feedback_collection.md:49:Data sent to: logs/telemetry/wave_[n]_metrics.jsonl (anonymized)
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:2763:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:7265:./titane_local_training/dataset.jsonl:20:{"prompt": "Crée un handler Tauri pour memory_debug_scan", "response": "```rust\n#[tauri::command]\nasync fn memory_debug_scan {\nlog::info!(\"Mock: memory_debug_scan called\");\n    let report = telemetry::scan_memory_directory();\n    Ok(serde_json::to_value(report).unwrap_or_else(|_| {\n        json!({\n            \"base_path\": \"memory\",\n            \"missing\": true,\n            \"total_size_bytes\": 0,\n            \"files\": []\n}\n```"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:3557:./docs/01_misc/05_SCANS_ALLOWLIST.md:1414:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:3576:./docs/01_misc/05_SCANS_ALLOWLIST.md:7715:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1400:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:4683:./docs/01_misc/SCANS_ALLOWLIST.md:1401:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:4715:./docs/01_misc/SCANS_ALLOWLIST.md:9880:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1414:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_registry_keywords.txt:4734:./docs/01_misc/SCANS_ALLOWLIST.md:16180:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7715:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1400:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/find_governance_like_files.txt:3171:./docs/adr/ADR-002-performance-guards-telemetry.md
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/find_governance_like_files.txt:9314:./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json
./docs/backup_20251218_122526/VALIDATION_FINALE_v26.2.md:264:- Opt-in telemetry
./docs/backup_20251218_122526/BUILD_VALIDATION_REPORT.md:67:- Modules dépréciés: `memory::telemetry` → migration vers `unified_memory_v2`
./docs/backup_20251218_122526/BUILD_VALIDATION_REPORT.md:250:   - Migrer `memory::telemetry` → `unified_memory_v2`
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src.txt:1220:src/services/telemetry/useProductionHealthTelemetry.ts
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src.txt:1557:src/types/telemetry.ts
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src.txt:1707:src/utils/telemetryEngine.ts
./docs/backup_20251218_122526/RESUME_VISUEL_v26.2.md:211:- Opt-in telemetry (privacy-first)
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_scripts.txt:101:scripts/core/lib/telemetry.sh
./docs/backup_20251218_122526/ANALYSE_COMPLETE_PRODUCTION_v24.2.0.md:373:✅ **Zero Trust**: Local-first, no telemetry, Tauri-only
./docs/SESSION_PHASE2_B_C_2026-01-07.md:120:devtools/telemetry.rs    50 LOC
./docs/SESSION_PHASE2_B_C_2026-01-07.md:133:└── telemetry/        (devtools/telemetry + NEW exports)
./docs/backup_20251218_122526/ANALYSE_SECURITE_PERFORMANCE_v24.2.0.md:81:   - ✅ No telemetry
./docs/backup_20251218_122526/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:479:- Zero remote telemetry (local-only)
./docs/backup_20251218_122526/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:661:- Remote telemetry opt-in
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src-tauri.txt:198:src-tauri/src/api/telemetry_api.rs
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src-tauri.txt:464:src-tauri/src/devtools/telemetry.rs
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src-tauri.txt:681:src-tauri/src/memory/telemetry.rs
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_src-tauri.txt:743:src-tauri/src/monitoring/telemetry/mod.rs
./docs/FINAL_SESSION_SUMMARY_2026-01-07.md:475:3. Advanced telemetry (distributed tracing)
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_reports.txt:1112:reports/e2e_memory_guard_validate/2026-02-12T00:52:33Z/rust_telemetry_tests.log
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/find_maxdepth3_dirs.txt:3575:./src/services/telemetry
./docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md:1647:2. **Disable telemetry** (if enabled)
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_validation_keywords.txt:2289:docs/adr/ADR-002-performance-guards-telemetry.md:195:- **rAF monitoring** : Utilise les idle callbacks du navigateur
./docs/DAY1_ACTIVATION_SUMMARY.md:180:- ✅ NEW: `src-tauri/src/api/telemetry_api.rs` (Rust command)
./docs/DAY1_ACTIVATION_SUMMARY.md:290:`/docs/_evidence/v27/v26_ui_telemetry_discovery/`
./docs/DAY1_ACTIVATION_SUMMARY.md:463:**Evidence Base:** `/docs/_evidence/v27/v26_ui_telemetry_discovery/`  
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:85:| `devtools/telemetry.rs` | 50 | Telemetry events (placeholder) |
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:105:- `devtools/telemetry.rs` - Generic telemetry (unused)
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:106:- **Result:** No unified telemetry export (OpenTelemetry, Prometheus)
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:116:│   └── pub fn export_telemetry() -> TelemetryData
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:162:└── telemetry/
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:164:    ├── events.rs                   // ← FROM devtools/telemetry.rs
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:182:    telemetry: TelemetryExporter,
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:216:pub mod telemetry;
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:493:- `devtools/` - 10 files with debugger, metrics, telemetry, logging
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:494:- But metrics/telemetry should be in `monitoring/` (see Consolidation 1)
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:650:- MOVE metrics/telemetry to monitoring/ (see Consolidation 1)
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:682:3. Week 3: Add telemetry export, tests, documentation
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:685:- ✅ `monitoring/` module with metrics, performance, health, telemetry
./docs/BACKEND_CONSOLIDATION_PROPOSAL.md:728:2. Week 9: Migrate `qa/`, integrate `devtools/` (except metrics/telemetry)
./docs/91_reports/AUDIT_CHAT_IA_COMPLET_v26.4.1.md:1122:**Action:** Ajouter telemetry cache  
./docs/91_reports/AUDIT_CHAT_IA_COMPLET_v26.4.1.md:1212:3. **P2: Ajouter telemetry cache hit rate** 📊
./docs/91_reports/PHASE_2_COMPLETE_PHASE_3_READY.md:25:- Monitor live telemetry vs Phase 2 baseline
./docs/04_guides/advanced/PERFORMANCE_OPTIMIZATION.md:905:- ⬜ Add telemetry for latency tracking
./docs/backup_20251218_122526/README_v19.5.2_OLD.md:716:- **`telemetry.rs`**: Télémétrie OS/Hardware
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/surface_docs.txt:3657:docs/adr/ADR-002-performance-guards-telemetry.md
./docs/00_core/README__runtime_dev_README.md.md:56:| **OMEGA Pipeline**    | ✅ Dev Mode | Verbose logging, telemetry           |
./docs/00_core/README__runtime_dev_README.md.md:256:- Telemetry sent to `localhost:3001/telemetry`
./_archive/proof_packs_2026-03-26/SEAL_READINESS_2026-03-07_1309_0af062e88/raw/find_core_surfaces.txt:3276:docs/adr/ADR-002-performance-guards-telemetry.md
./_archive/proof_packs_2026-03-26/SEAL_READINESS_2026-03-07_1309_0af062e88/raw/find_core_surfaces.txt:8285:reports/e2e_memory_guard_validate/2026-02-12T00:52:33Z/rust_telemetry_tests.log
./_archive/proof_packs_2026-03-26/SEAL_READINESS_2026-03-07_1309_0af062e88/raw/find_core_surfaces.txt:11534:scripts/core/lib/telemetry.sh
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_governance_file_tree.txt:3276:docs/adr/ADR-002-performance-guards-telemetry.md
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_governance_file_tree.txt:10030:reports/e2e_memory_guard_validate/2026-02-12T00:52:33Z/rust_telemetry_tests.log
./_archive/proof_packs_2026-03-26/TRUTH_HEAL_MAPS_2026-03-07_1249_0af062e88/raw/scan_governance_file_tree.txt:13279:scripts/core/lib/telemetry.sh
./docs/00_core/README_EN.md:177:✅ No telemetry
./docs/diagnostics/IPC_STABLE_UPGRADE_SEAL.md:238:- Collect Ollama behavior telemetry in production-like environment
./docs/diagnostics/IPC_STABLE_UPGRADE_SEAL.md:244:- Monitor IPC telemetry for anti-silence violations (should be zero)
./docs/RELEASE.md:375:- [ ] Logs: Review runtime logs (si telemetry opt-in implémenté)
./docs/00_core/README__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_README.md.md:15:- **Health-check** core UI scenarios (conversation_engine, telemetry, settings)
./docs/00_core/README__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_README.md.md:66:- Query runtime telemetry endpoint (mock)
./docs/00_core/README__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_README.md.md:68:- Export: `PROOF/telemetry_baseline.json`
./docs/00_core/README__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_README.md.md:103:├── telemetry_baseline.json        ← Runtime metrics
./docs/00_core/README__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_README.md.md:158:# 3-6. Conversation/UI/telemetry/anomaly scans
./docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:704:- Weekly assessment of Day 1-7 telemetry
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/02_SCOPE_FREEZE.md:10:| `src-tauri/src/api/telemetry_api.rs` | Ring 3 | Retourne faux Ok avec zéros au lieu de Err quand CSV absent |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/02_SCOPE_FREEZE.md:11:| `src/services/telemetry/useProductionHealthTelemetry.ts` | Ring 3 | Dépendance `data` dans useCallback + stale data sur erreur |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/02_SCOPE_FREEZE.md:17:- `src/types/telemetry.ts`
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/02_SCOPE_FREEZE.md:32:git restore -- src-tauri/src/api/telemetry_api.rs \
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/02_SCOPE_FREEZE.md:33:               src/services/telemetry/useProductionHealthTelemetry.ts \
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/09_PATCH_PLAN.md:7:| Fichier | `src-tauri/src/api/telemetry_api.rs` |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/09_PATCH_PLAN.md:14:| Rollback | `git restore -- src-tauri/src/api/telemetry_api.rs` |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/09_PATCH_PLAN.md:20:| Fichier | `src/services/telemetry/useProductionHealthTelemetry.ts` |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/09_PATCH_PLAN.md:27:| Rollback | `git restore -- src/services/telemetry/useProductionHealthTelemetry.ts` |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/05_ADMIN_CHAIN_MAP.md:13:                                └─ telemetry_api.rs :: read_production_week1_csv()
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/05_ADMIN_CHAIN_MAP.md:30:| Tauri command | `telemetry_api.rs` | `read_production_week1_csv` | — | `ProductionHealthSummary` | **retourne faux Ok si CSV absent** | BROKEN |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/05_ADMIN_CHAIN_MAP.md:31:| CSV lecture | `telemetry_api.rs` | `parse_and_summarize` | CSV bytes | `ProductionHealthSummary` | CSV absent → faux Ok | BROKEN |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/01_BOOTSTRAP.md:42:| `src/services/telemetry/useProductionHealthTelemetry.ts` | Hook Ring 3 — IPC + state |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/01_BOOTSTRAP.md:43:| `src/types/telemetry.ts` | Types Ring 1 |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/01_BOOTSTRAP.md:44:| `src-tauri/src/api/telemetry_api.rs` | Backend Ring 3 — lecture CSV + parsing |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/03_RUNTIME_TARGET_TRUTH.md:17:- **Source** : `src-tauri/src/api/telemetry_api.rs` ligne ~67 — `notes: Some("Waiting for observation data...".to_string())` injecté dans le champ `notes` du faux `Ok()` retourné quand le CSV est absent
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/03_RUNTIME_TARGET_TRUTH.md:45:| "Waiting for observation..." | `telemetry_api.rs` | ~67 | DIRECTE (via `data.notes`) |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/03_RUNTIME_TARGET_TRUTH.md:47:| samples = 0 | `telemetry_api.rs` `samples_collected: 0` | ~70 | DIRECTE |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/03_RUNTIME_TARGET_TRUTH.md:48:| métriques = 0 | `telemetry_api.rs` `initial_rss_mb: 0.0` etc. | ~55–70 | DIRECTE |
./docs/INDEX_DOCUMENTATION_v17.2.0.md:254:└── telemetry.rs
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/00_EXEC_SUMMARY.md:16:- Ring 1 : `src/types/telemetry.ts` (types — non modifié)
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/00_EXEC_SUMMARY.md:17:- Ring 3 : `src-tauri/src/api/telemetry_api.rs` (IPC / service — MODIFIÉ)
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/00_EXEC_SUMMARY.md:18:- Ring 3 : `src/services/telemetry/useProductionHealthTelemetry.ts` (service hook — MODIFIÉ)
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/00_EXEC_SUMMARY.md:40:git restore -- src-tauri/src/api/telemetry_api.rs \
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/00_EXEC_SUMMARY.md:41:               src/services/telemetry/useProductionHealthTelemetry.ts \
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/08_ROOT_CAUSE_ANALYSIS.md:6:**Preuve directe** : `src-tauri/src/api/telemetry_api.rs` lignes 52–75
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/08_ROOT_CAUSE_ANALYSIS.md:66:| 1 (primaire) | K — fake defaults | `telemetry_api.rs:52–75` | CRITIQUE |
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/07_SOURCE_OF_TRUTH_MATRIX.md:9:- **Preuve** : `telemetry_api.rs` lit ce chemin
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/07_SOURCE_OF_TRUTH_MATRIX.md:17:- **Preuve** : `telemetry_api.rs::parse_and_summarize()`
./docs/00_core/README_v27.0.0.md:274:- [ ] Enhanced telemetry
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/20_VERDICT.md:19:1. **Rust** `telemetry_api.rs` — `Err(SOURCE_UNAVAILABLE/SOURCE_EMPTY)` remplace le fake `Ok()` avec zéros
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/20_VERDICT.md:31:git restore -- src-tauri/src/api/telemetry_api.rs \
./_archive/proof_packs_2026-03-26/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/20_VERDICT.md:32:               src/services/telemetry/useProductionHealthTelemetry.ts \
./_archive/proof_packs_2026-03-26/TOTAL_SYSTEM_AUDIT_2026-03-20_1324_94b0cc401/DISCOVERY_BATCH_1_RAW.txt:591:| `telemetry/` | Telemetry collection |
./docs/ARCHITECTURE_RINGS.md:381:│   └── telemetry.ts
./docs/01_misc/VERDICT__runs_POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600_VERDICT.md.md:207:  "telemetry_status": "normal",
./docs/91_reports/AUDIT_SYNCHRONISATION_GLOBALE_2026-01-06.md:347:// src/utils/telemetryEngine.ts:1059: `Address ${criticalAlerts.length} critical alert(s)...`
./docs/91_reports/AUDIT_COHERENCE_FICHIERS_v26.4.0.md:75:- Visible dans: Logs backend, telemetry, crash reports
./docs/01_misc/FUSION_FRONTEND_INTEGRATION.md:44:  telemetry: false,
./docs/01_misc/FUSION_FRONTEND_INTEGRATION.md:55:await disableSubsystems(['telemetry', 'performance_guards']);
./docs/01_misc/FUSION_FRONTEND_INTEGRATION.md:91:| `telemetry`          | Telemetry collection          | enabled |
./docs/governance/POST_GOVERNANCE_REFOCUS.md:127:- [ ] Test coverage report (Rust modules: telemetry, security, IPC)
./docs/governance/POST_GOVERNANCE_REFOCUS.md:129:- [ ] Crash metrics (if production telemetry available, analyze patterns)
./docs/91_reports/PHASE_2_COMPLETE_EXECUTIVE_SUMMARY.md:200:- **Objective:** Setup telemetry collection
./_archive/proof_packs_2026-03-26/cross_platform_2026-03-05_0715_749530729/01_BOOTSTRAP.md:8071:./docs/adr/ADR-002-performance-guards-telemetry.md
./_archive/proof_packs_2026-03-26/cross_platform_2026-03-05_0715_749530729/01_BOOTSTRAP.md:8290:./src/types/telemetry.ts
./_archive/proof_packs_2026-03-26/cross_platform_2026-03-05_0715_749530729/01_BOOTSTRAP.md:8469:./src/utils/telemetryEngine.ts
./_archive/proof_packs_2026-03-26/cross_platform_2026-03-05_0715_749530729/01_BOOTSTRAP.md:8904:./src/services/telemetry
./docs/01_misc/PUBLICATION_v26.4.0_REPORT.md:183:- Télémétrie Rust (`telemetry.rs`)
./docs/baselines/V24_PHASE1_COMPLETE.md:33:- Track eviction counters for telemetry
./docs/baselines/LATENCY_MEASUREMENT_RESULTS_V23.md:74:### OMEGA Pipeline Breakdown (Reconstructed from IPC telemetry)
./docs/baselines/V24_ACTION_BOARD.md:84:./deploy/bin/titane-infinity --telemetry-dir /tmp/titane_measure_pre
./docs/baselines/V24_INTERIM_REPORT.md:16:- Tracking: Added eviction counters for telemetry
./docs/01_misc/RAPPORT_INFAILLIBILITE_v26.4.0.md:302:5. ✅ `docs/adr/ADR-002-performance-guards-telemetry.md` (285 lignes)
./docs/91_reports/REPORT_OPTIMIZATION.md:14:- `telemetryEngine.ts` - Utilisé
./docs/01_misc/VERIFICATION_FINALE_v26.2.3_2025-01-02.md:396:production:  90000ms  // Match supervision timeout
./docs/tests/TEST_MATRIX.md:61:- Coverage: telemetry, commands, services, utils
./_archive/proof_packs_2026-03-26/VISION_CHAT_SYSTEM_AUDIT_2026-03-15_1409_c59e9b5b3/01_BOOTSTRAP.md:320:telemetry
./docs/canon/CAPABILITY_REGISTRY_CANON.md:77:| CAP-TELE-001 | `read_production_week1_csv` | `api::telemetry_api` | PROVEN | CODE | |
./docs/01_misc/LOCK__deployment_latest_certification_phase8_2_P8_2_BETA_LAUNCH_20260217_230417_LOCK.md.md:146:- [ ] Review Day 1-7 telemetry
./docs/01_misc/P8_2_EXECUTION_COMPLETE.md:288:- [ ] Review Day 1-7 telemetry
./docs/ARCHITECTURE_IMPACT_ANALYSIS.md:94:| `/stats` | metrics/, monitoring/, telemetry/ | Phase 2? |
./docs/ARCHITECTURE_IMPACT_ANALYSIS.md:152:   - Fusionner: telemetry/, metrics/, monitoring/?
./docs/01_misc/VERIFICATION.md:27:| **telemetry-setting**  | disabled    | ✅ OK  |
./docs/proof/OLLAMA_PROXY_SEAL.md:372:- [ ] Metrics: track transport mode usage (telemetry)
./_archive/proof_packs_2026-03-26/ADMIN_TRUTH_AND_PROPAGATION_HEAL_2026-03-14_2256_8702edd39/01_SCOPE_AND_COLLISIONS.md:19:- `src/services/telemetry/useProductionHealthTelemetry.ts`
./_archive/proof_packs_2026-03-26/ADMIN_TRUTH_AND_PROPAGATION_HEAL_2026-03-14_2256_8702edd39/04_ADMIN_PROPAGATION_MATRIX.md:12:| P-08 | Production health refresh | telemetry hook | HEALTH_MONITORING | Refresh button -> hook.refresh -> csv command | KPI recharges | Oui (UI path + control visible) | PASS |
./docs/proof/OLLAMA_PROXY_ROLLBACK.md:237:   - Sentry/telemetry?
./docs/proof/OLLAMA_PROXY_ROLLBACK.md:243:- [ ] Implement telemetry in transport layer (track mode usage)
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:126:src-tauri/src/api/telemetry_api.rs:24:    pub provider_timeouts_per_hour: Option<f64>,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:127:src-tauri/src/api/telemetry_api.rs:48:#[tauri::command]
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:128:src-tauri/src/api/telemetry_api.rs:70:                provider_timeouts_per_hour: None,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:129:src-tauri/src/api/telemetry_api.rs:118:                provider_timeouts_per_hour: None,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:130:src-tauri/src/api/telemetry_api.rs:171:    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:131:src-tauri/src/api/telemetry_api.rs:184:        provider_timeouts_per_hour,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:145:src-tauri/src/api/memory_api.rs:8:    memory::telemetry,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:195:src-tauri/src/api/memory_api.rs:144:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:3682:src/types/telemetry.ts:27:  providerTimeoutsPerHour?: number;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:5473:src-tauri/src/mock_commands.rs:9:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:5505:src-tauri/src/mock_commands.rs:246:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:5681:src/core/singularity/SingularityFusionEngine.ts:396:      // new_state has: { memory_sync, logs_sync, dataset_sync, singularity_sync, performance_guards, auto_healing, crash_protection, telemetry }
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7376:src-tauri/src/devtools/telemetry.rs:34:        // - Batching: Buffer events in memory (Vec<TelemetryEvent>), flush every 100 events or 10s
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7377:src-tauri/src/devtools/telemetry.rs:36:        // - Indexing: Maintain in-memory index by event type for fast querying
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7378:src-tauri/src/devtools/telemetry.rs:40:        // - Export: Optional HTTP endpoint to stream events to external analytics
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7733:src-tauri/src/memory/telemetry.rs:11:/// Resolve the base directory storing persisted memory JSON files.
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7734:src-tauri/src/memory/telemetry.rs:12:pub fn resolve_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7735:src-tauri/src/memory/telemetry.rs:28:            log::info!("[E2E Guard] TITANE_E2E=1 -> memory dir: {}", resolved.display());
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7736:src-tauri/src/memory/telemetry.rs:41:    resolve_default_memory_dir()
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7737:src-tauri/src/memory/telemetry.rs:44:fn resolve_default_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7738:src-tauri/src/memory/telemetry.rs:45:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7739:src-tauri/src/memory/telemetry.rs:52:    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7740:src-tauri/src/memory/telemetry.rs:53:    // %LOCALAPPDATA%\titane-infinity\memory (Windows), etc.
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7741:src-tauri/src/memory/telemetry.rs:54:    fallback_memory_dir()
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7742:src-tauri/src/memory/telemetry.rs:57:fn candidate_cwd_memory_dir() -> Option<PathBuf> {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7743:src-tauri/src/memory/telemetry.rs:58:    env::current_dir().ok().map(|cwd| cwd.join("memory"))
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7744:src-tauri/src/memory/telemetry.rs:61:fn fallback_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7745:src-tauri/src/memory/telemetry.rs:63:    base.join("titane-infinity").join("memory")
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7746:src-tauri/src/memory/telemetry.rs:87:        .join("memory-e2e")
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7747:src-tauri/src/memory/telemetry.rs:91:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7748:src-tauri/src/memory/telemetry.rs:92:    let fallback = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7749:src-tauri/src/memory/telemetry.rs:101:/// Scan the memory directory and return lightweight telemetry for observability.
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7750:src-tauri/src/memory/telemetry.rs:102:pub fn scan_memory_directory() -> MemoryDirectoryReport {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7751:src-tauri/src/memory/telemetry.rs:103:    let base_path = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7752:src-tauri/src/memory/telemetry.rs:213:    fn test_resolve_memory_dir_default() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7753:src-tauri/src/memory/telemetry.rs:221:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7754:src-tauri/src/memory/telemetry.rs:222:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7755:src-tauri/src/memory/telemetry.rs:226:    fn test_resolve_memory_dir_custom() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7756:src-tauri/src/memory/telemetry.rs:230:        std::env::set_var("TITANE_MEMORY_DIR", "/custom/memory/path");
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7757:src-tauri/src/memory/telemetry.rs:232:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7758:src-tauri/src/memory/telemetry.rs:233:        assert_eq!(dir.to_string_lossy(), "/custom/memory/path");
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7759:src-tauri/src/memory/telemetry.rs:240:    fn test_resolve_memory_dir_empty_env() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7760:src-tauri/src/memory/telemetry.rs:246:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7761:src-tauri/src/memory/telemetry.rs:248:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7762:src-tauri/src/memory/telemetry.rs:255:    fn test_resolve_memory_dir_e2e_default() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7763:src-tauri/src/memory/telemetry.rs:262:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7764:src-tauri/src/memory/telemetry.rs:263:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7765:src-tauri/src/memory/telemetry.rs:269:    fn test_resolve_memory_dir_e2e_custom_override() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7766:src-tauri/src/memory/telemetry.rs:277:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7767:src-tauri/src/memory/telemetry.rs:285:    fn test_resolve_memory_dir_e2e_blocks_default_dir() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7768:src-tauri/src/memory/telemetry.rs:289:        let default_dir = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7769:src-tauri/src/memory/telemetry.rs:293:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7770:src-tauri/src/memory/telemetry.rs:294:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7771:src-tauri/src/memory/telemetry.rs:301:    fn test_scan_memory_directory_missing() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7772:src-tauri/src/memory/telemetry.rs:306:        let report = scan_memory_directory();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7773:src-tauri/src/memory/telemetry.rs:361:    fn test_memory_file_report_creation() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7774:src-tauri/src/memory/telemetry.rs:363:            name: "memory.json".to_string(),
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7775:src-tauri/src/memory/telemetry.rs:369:        assert_eq!(report.name, "memory.json");
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7776:src-tauri/src/memory/telemetry.rs:375:    fn test_memory_file_report_no_version() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7777:src-tauri/src/memory/telemetry.rs:387:    fn test_memory_directory_report_creation() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7778:src-tauri/src/memory/telemetry.rs:389:            base_path: "/path/to/memory".to_string(),
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7779:src-tauri/src/memory/telemetry.rs:395:        assert_eq!(report.base_path, "/path/to/memory");
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7780:src-tauri/src/memory/telemetry.rs:401:    fn test_memory_directory_report_with_files() {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:7781:src-tauri/src/memory/telemetry.rs:417:            base_path: "/memory".to_string(),
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:8958:src-tauri/src/core/legacy.rs:10:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:8961:src-tauri/src/core/legacy.rs:134:        let audit_report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:8969:src-tauri/src/core/legacy.rs:356:        let base_dir = telemetry::resolve_memory_dir();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:10760:src-tauri/src/types/memory.rs:34:/// File-level telemetry for the memory directory audit
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:12442:src/stores/memoryStore.ts:136:          const telemetry = await backendV17.memory.debugScan();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17661:src/utils/telemetryEngine.ts:218:          id: 'memory_usage',
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17662:src/utils/telemetryEngine.ts:220:          value: (performance as any).memory?.usedJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17663:src/utils/telemetryEngine.ts:227:            totalHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17664:src/utils/telemetryEngine.ts:228:            heapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17665:src/utils/telemetryEngine.ts:334:        metricId: 'memory_usage',
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17666:src/utils/telemetryEngine.ts:799:      'memory_usage',
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17667:src/utils/telemetryEngine.ts:829:        memory_usage: {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17668:src/utils/telemetryEngine.ts:830:          positive: ['Monitor memory leaks', 'Consider memory optimization'],
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_truth_scan.txt:17669:src/utils/telemetryEngine.ts:1031:      'memory_usage',
./_archive/proof_packs_2026-03-26/ADMIN_TRUTH_AND_PROPAGATION_HEAL_2026-03-14_2256_8702edd39/03_ADMIN_TRUTH_MATRIX.md:10:| T-06 | Production health load | src/services/telemetry/useProductionHealthTelemetry.ts | `loadData` + refresh | data/loading/error | `readProductionWeek1Csv` | Telemetry visible ou erreur | Oui (tab load E2E) | PASS | Non |
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/BACKEND_COMMAND_MAP.tsv:23:src-tauri/src/api/telemetry_api.rs	48	read_production_week1_csv	FOUND
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:158:src/stores/memoryStore.ts:136	keyword-hit	          const telemetry = await backendV17.memory.debugScan();	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3195:src/services/telemetry/useProductionHealthTelemetry.ts:3	keyword-hit	 * Manages IPC calls to read production CSV + error handling	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3196:src/services/telemetry/useProductionHealthTelemetry.ts:39	keyword-hit	  const [error, setError] = useState<string | null>(null);	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3197:src/services/telemetry/useProductionHealthTelemetry.ts:54	keyword-hit	          error?: { message?: string } | string;	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3198:src/services/telemetry/useProductionHealthTelemetry.ts:58	keyword-hit	            typeof envelope.error === 'string'	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3199:src/services/telemetry/useProductionHealthTelemetry.ts:59	keyword-hit	              ? envelope.error	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3200:src/services/telemetry/useProductionHealthTelemetry.ts:60	keyword-hit	              : envelope.error?.message || 'IPC error';	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3201:src/services/telemetry/useProductionHealthTelemetry.ts:72	keyword-hit	      const errorMsg = err instanceof Error ? err.message : String(err);	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3202:src/services/telemetry/useProductionHealthTelemetry.ts:73	keyword-hit	      setError(errorMsg);	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv:3203:src/services/telemetry/useProductionHealthTelemetry.ts:98	keyword-hit	    error,	PROVEN_STATIC_ONLY
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/tauri_commands_scan.txt:22:src-tauri/src/api/telemetry_api.rs:48:#[tauri::command]
./docs/01_misc/POST_LAUNCH_SUMMARY_v26.3.0.md:56:- **Auto-Updater:** No telemetry available; no failures
./docs/01_misc/POST_LAUNCH_SUMMARY_v26.3.0.md:79:| **Auto-Updater**              | Unknown (no telemetry) | ✅ Ready     |
./docs/01_misc/POST_LAUNCH_SUMMARY_v26.3.0.md:150:2. 🔵 **Telemetry:** No auto-updater analytics; consider optional telemetry
./docs/01_misc/POST_LAUNCH_SUMMARY_v26.3.0.md:170:   - Optional telemetry (privacy-first)
./docs/01_misc/POST_LAUNCH_SUMMARY_v26.3.0.md:236:- [ ] Implement telemetry system
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:1507:src/stores/memoryStore.ts:25:  telemetry: MemoryDirectoryReport | null;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:1579:src/stores/memoryStore.selectors.ts:18:export const useTelemetry = () => useMemoryStore(state => state.telemetry);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2642:src/utils/telemetryEngine.ts:11:import { titaneSelfHealing } from './selfHealingSystem';
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2643:src/utils/telemetryEngine.ts:166:      const healingState = titaneSelfHealing.getSystemState();
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2644:src/utils/telemetryEngine.ts:181:          name: 'System Health Score',
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2645:src/utils/telemetryEngine.ts:219:          name: 'Memory Usage',
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2646:src/utils/telemetryEngine.ts:452:    const metricHistory = this.metrics.get(metric.id);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2647:src/utils/telemetryEngine.ts:453:    if (!metricHistory) return;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2648:src/utils/telemetryEngine.ts:454:    metricHistory.unshift(metric);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2649:src/utils/telemetryEngine.ts:457:    if (metricHistory.length > 1000) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2650:src/utils/telemetryEngine.ts:458:      metricHistory.splice(1000);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2651:src/utils/telemetryEngine.ts:550:    for (const [metricId, metricHistory] of this.metrics.entries()) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2652:src/utils/telemetryEngine.ts:551:      if (metricHistory.length < 5) continue;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2653:src/utils/telemetryEngine.ts:553:      const recentMetrics = metricHistory.slice(0, 10);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2654:src/utils/telemetryEngine.ts:586:    for (const [metricId, metricHistory] of this.metrics.entries()) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2655:src/utils/telemetryEngine.ts:587:      if (metricHistory.length < 20) continue;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2656:src/utils/telemetryEngine.ts:589:      const values = metricHistory
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2657:src/utils/telemetryEngine.ts:610:          name: `${metricHistory[0].name} Anomaly`,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2658:src/utils/telemetryEngine.ts:660:    for (const [metricId, metricHistory] of this.metrics.entries()) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2659:src/utils/telemetryEngine.ts:661:      if (metricHistory.length < 50) continue;
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2660:src/utils/telemetryEngine.ts:663:      const values = metricHistory
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2661:src/utils/telemetryEngine.ts:678:          name: `${metricHistory[0].name} Cyclical Pattern`,
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2662:src/utils/telemetryEngine.ts:831:          negative: ['Memory usage improving', 'Continue current optimization'],
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2663:src/utils/telemetryEngine.ts:856:    for (const [metricId, metricHistory] of this.metrics.entries()) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2664:src/utils/telemetryEngine.ts:857:      const filteredHistory = metricHistory.filter(m => m.timestamp > cutoff);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2665:src/utils/telemetryEngine.ts:858:      this.metrics.set(metricId, filteredHistory);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2666:src/utils/telemetryEngine.ts:885:          for (const [metricId, metricHistory] of Object.entries(data.metrics)) {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2667:src/utils/telemetryEngine.ts:886:            this.metrics.set(metricId, metricHistory as TelemetryMetric[]);
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:2668:src/utils/telemetryEngine.ts:976:  public getMetricHistory(metricId: string, limit: number = 50): TelemetryMetric[] {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/chat_surface_scan.txt:8578:src/services/lazy.ts:14: * - Memory + telemetry
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/files_src_tauri_src.txt:4:src-tauri/src/api/telemetry_api.rs
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/files_src_tauri_src.txt:426:src-tauri/src/devtools/telemetry.rs
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/files_src_tauri_src.txt:669:src-tauri/src/monitoring/telemetry/mod.rs
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/files_src_tauri_src.txt:799:src-tauri/src/memory/telemetry.rs
./docs/01_misc/VERDICT__deployment_latest_certification_phase8_2_P8_2_BETA_LAUNCH_20260217_230417_VERDICT.md.md:96:- ✅ Aggregate 7-day telemetry
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:1187:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:1401:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:1979:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:3235:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:7476:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:9394:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:928:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:9880:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1414:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:10063:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1598:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:10064:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1599:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:10073:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1608:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2438:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:11479:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3014:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:11995:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3530:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:15642:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7177:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:862:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:16180:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7715:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1400:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:16391:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7926:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1611:./runs/current/SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:16392:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7927:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1612:./runs/current/SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:16401:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7936:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1621:./runs/current/SCANS_SECRETS.md:2437:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:17937:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9472:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3157:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:17950:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9485:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3170:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:21656:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13191:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:6877:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:23825:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:15360:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9047:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:29121:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:20656:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:30672:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:22208:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md:35352:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_functions_filtered.txt:2047:6013:src-tauri/src/memory/telemetry.rs:12:pub fn resolve_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_functions_filtered.txt:2048:6014:src-tauri/src/memory/telemetry.rs:102:pub fn scan_memory_directory() -> MemoryDirectoryReport {
./_archive/proof_packs_2026-03-26/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/backend_functions_filtered.txt:2049:6015:src-tauri/src/memory/telemetry.rs:161:pub fn detect_disk_mode(report: &MemoryDirectoryReport) -> DiskMode {
./docs/01_misc/OPTIMIZATION_SUMMARY_v29_FINAL.md:104:| MemoryGraph                | 100% memoryStore      | 15% state/logs/telemetry | **-85%**  |
./docs/01_misc/OPTIMIZATION_SUMMARY_v29_FINAL.md:276:✅ **memoryStore** — Memory system (snapshots, logs, timeline, telemetry)
./docs/01_misc/BETA_DISTRIBUTION_INVITATION.md:235:- ✅ No telemetry or external calls
./docs/01_misc/STRATEGIC_DEEP_ANALYSIS_v26.4.0.md:244:telemetry.track('app_launch', {
./docs/01_misc/STRATEGIC_DEEP_ANALYSIS_v26.4.0.md:248:telemetry.track('chat_message_sent', {
./docs/01_misc/MONITORING_LOOP.md:19:Since automated telemetry not discovered in repo:
./docs/01_misc/COMPLETION_SUMMARY.md:22:2. **src-tauri/src/memory/telemetry.rs** (+111 lines)
./docs/01_misc/CONSTITUTION_LOCK_v27.md:51:- **Ring 2 (Core)**: FusionEngine, telemetry, memory, metrics
./docs/ARCHITECTURE_MODULAIRE_v17.2.0_README.md:173:│   └── telemetry.rs        # Placeholder future (50 lignes)
./docs/ARCHITECTURE_MODULAIRE_v17.2.0_README.md:281:- ✅ **Pas de TODOs** (sauf telemetry.rs pour expansion future)
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/01_BOOTSTRAP.md:12:- src/services/telemetry/useProductionHealthTelemetry.ts ✓
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/01_BOOTSTRAP.md:16:- src-tauri/src/api/telemetry_api.rs ✓
./docs/backup_20251218_123316/RUST_DEPRECATION_MIGRATION_PLAN.md:25:- `memory::telemetry` → `unified_memory_v2::get_state()`
./docs/backup_20251218_123316/RUST_DEPRECATION_MIGRATION_PLAN.md:87:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/00_EXEC_SUMMARY.md:8:F) ROLLBACK: git restore -- src/utils/tauriProtector.ts src/services/telemetry/useProductionHealthTelemetry.ts src/features/production-health/ProductionHealthPanel.tsx src-tauri/src/api/telemetry_api.rs
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/00_EXEC_SUMMARY.md:28:4. throws new Error('Invalid telemetry payload') — contains 'Invalid'
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/00_EXEC_SUMMARY.md:39:- src/services/telemetry/useProductionHealthTelemetry.ts — extractErrorMessage(), SCHEMA_DRIFT kind, improved classifyError()
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/00_EXEC_SUMMARY.md:41:- src-tauri/src/api/telemetry_api.rs — BOM strip, semicolon detection, column fix, unit tests
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/00_EXEC_SUMMARY.md:44:- src/services/telemetry/__tests__/useProductionHealthTelemetry.test.ts — remove vi.useFakeTimers() (caused tests to hang)
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/15_ROLLBACK.md:4:git restore -- src/services/telemetry/useProductionHealthTelemetry.ts
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/15_ROLLBACK.md:6:git restore -- src-tauri/src/api/telemetry_api.rs
./_archive/proof_packs_2026-03-26/ADMIN_HEALTH_CSV_PARSER_2026-03-17_2349_92d9d0a21/15_ROLLBACK.md:7:git restore -- src/services/telemetry/__tests__/useProductionHealthTelemetry.test.ts
./docs/01_misc/FUSION_BACKEND_WEEK1.md:26:  - `telemetry` - Telemetry collection
./docs/01_misc/FUSION_BACKEND_WEEK1.md:39:    pub telemetry: Option<bool>,
./docs/01_misc/TRACK_2_WEEK_1_COMPLETION.md:37:8. `telemetry` - Telemetry collection
./docs/01_misc/TRACK_2_WEEK_1_COMPLETION.md:203:await disableSubsystems(['telemetry']);
./docs/01_misc/TRACK_2_WEEK_1_COMPLETION.md:394:- [ ] Implement telemetry tracking
./docs/01_misc/RELEASE_v27.0.0_FINAL_REPORT.md:183:- Track telemetry for performance baseline
./docs/01_misc/KNOWN_LIMITATIONS.md:157:- **Privé par défaut:** Zero telemetry externe
./docs/01_misc/P3_MONITORING_SETUP.md:43:Searching for telemetry modules...
./docs/01_misc/P3_MONITORING_SETUP.md:48:src-tauri/src/api/telemetry_api.rs:4: \* Parses metrics + applies thresholds
./docs/01_misc/P3_MONITORING_SETUP.md:49:src-tauri/src/api/mod.rs:15:pub mod telemetry_api;
./docs/01_misc/P3_MONITORING_SETUP.md:50:src-tauri/src/api/memory_api.rs:8: memory::telemetry,
./docs/01_misc/P3_MONITORING_SETUP.md:51:src-tauri/src/api/memory_api.rs:144: let report = telemetry::scan_memory_directory();
./docs/01_misc/P3_MONITORING_SETUP.md:85:Since automated telemetry not discovered in repo:
./docs/backup_20251218_123316/CHANGELOG.md:2687:- **`devtools/telemetry.rs`**: Télémétrie système
./docs/backup_20251218_123316/CHANGELOG.md:2776:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/backup_20251218_123316/CHANGELOG.md:2792:- ✅ Observabilité totale via DevTools (logs + metrics + telemetry)
./docs/01_misc/REFLEXION_APPROFONDIE_AUTO_AMELIORATION_v26.4.1.md:434:   - Advanced analytics + telemetry
./docs/01_misc/WEEK1_METRICS_SUMMARY.md:203:- Response time distribution (need telemetry)
./docs/01_misc/REFLEXION_APPROFONDIE_COMPLETE_v26.2.3.md:316:- Implémenter telemetry opt-in (privacy-respectful)
./docs/backup_20251218_123316/RUST_WARNINGS_FIXED.md:30:   - `memory::telemetry` → `unified_memory_v2`
./_archive/proof_packs_2026-03-26/AUDIO_VOICE_FORENSIC_2026-03-15_1408_c59e9b5/raw/diffs/main_rs_before.txt:448:    pub mod telemetry_api {
./_archive/proof_packs_2026-03-26/AUDIO_VOICE_FORENSIC_2026-03-15_1408_c59e9b5/raw/diffs/main_rs_before.txt:449:        include!("api/telemetry_api.rs");
./_archive/proof_packs_2026-03-26/AUDIO_VOICE_FORENSIC_2026-03-15_1408_c59e9b5/raw/diffs/main_rs_before.txt:1292:            api::telemetry_api::read_production_week1_csv,
./docs/backup_20251218_123316/SESSION_REPORT_v26.2_PREDICTIVE.md:734:- Opt-in telemetry (privacy-first)
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5586:src/utils/telemetryEngine.ts:376:          this.storeMetric(metric);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5587:src/utils/telemetryEngine.ts:447:  private storeMetric(metric: TelemetryMetric): void {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5588:src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5589:src/utils/telemetryEngine.ts:880:      if (stored) {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5590:src/utils/telemetryEngine.ts:881:        const data = JSON.parse(stored);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5591:src/utils/telemetryEngine.ts:905:  private async saveData(): Promise<void> {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5592:src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5593:src/utils/telemetryEngine.ts:917:      console.warn('📊 [TELEMETRY] Failed to save data:', error);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:5594:src/utils/telemetryEngine.ts:1102:        this.saveData();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:9574:src/stores/memoryStore.ts:136:          const telemetry = await backendV17.memory.debugScan();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:9776:src-tauri/src/api/memory_api.rs:8:    memory::telemetry,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:9811:src-tauri/src/api/memory_api.rs:144:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:10279:src/core/singularity/SingularityFusionEngine.ts:396:      // new_state has: { memory_sync, logs_sync, dataset_sync, singularity_sync, performance_guards, auto_healing, crash_protection, telemetry }
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:11515:src-tauri/src/core/legacy.rs:10:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:11521:src-tauri/src/core/legacy.rs:134:        let audit_report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:11531:src-tauri/src/core/legacy.rs:356:        let base_dir = telemetry::resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:12355:src-tauri/src/types/memory.rs:34:/// File-level telemetry for the memory directory audit
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13352:src/utils/telemetryEngine.ts:218:          id: 'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13353:src/utils/telemetryEngine.ts:220:          value: (performance as any).memory?.usedJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13354:src/utils/telemetryEngine.ts:227:            totalHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13355:src/utils/telemetryEngine.ts:228:            heapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13356:src/utils/telemetryEngine.ts:334:        metricId: 'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13357:src/utils/telemetryEngine.ts:799:      'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13358:src/utils/telemetryEngine.ts:829:        memory_usage: {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13359:src/utils/telemetryEngine.ts:830:          positive: ['Monitor memory leaks', 'Consider memory optimization'],
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13360:src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13361:src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13362:src/utils/telemetryEngine.ts:977:    const history = this.metrics.get(metricId);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13363:src/utils/telemetryEngine.ts:978:    return history ? history.slice(0, limit) : [];
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13364:src/utils/telemetryEngine.ts:1031:      'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:13365:src/utils/telemetryEngine.ts:1097:   * Démarrage automatique de la sauvegarde périodique
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:18058:src-tauri/src/mock_commands.rs:9:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:18070:src-tauri/src/mock_commands.rs:246:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:21459:src-tauri/src/devtools/telemetry.rs:21:    // - Storage: Time-series database (InfluxDB/Prometheus) for metrics
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:21460:src-tauri/src/devtools/telemetry.rs:32:        // Implementation: Persistent telemetry event storage and aggregation
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:21461:src-tauri/src/devtools/telemetry.rs:33:        // - Storage: Append to ~/.titane/telemetry/events.jsonl (JSON Lines format)
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:21462:src-tauri/src/devtools/telemetry.rs:34:        // - Batching: Buffer events in memory (Vec<TelemetryEvent>), flush every 100 events or 10s
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:21463:src-tauri/src/devtools/telemetry.rs:36:        // - Indexing: Maintain in-memory index by event type for fast querying
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22733:src-tauri/src/memory/telemetry.rs:11:/// Resolve the base directory storing persisted memory JSON files.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22734:src-tauri/src/memory/telemetry.rs:12:pub fn resolve_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22735:src-tauri/src/memory/telemetry.rs:28:            log::info!("[E2E Guard] TITANE_E2E=1 -> memory dir: {}", resolved.display());
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22736:src-tauri/src/memory/telemetry.rs:41:    resolve_default_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22737:src-tauri/src/memory/telemetry.rs:44:fn resolve_default_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22738:src-tauri/src/memory/telemetry.rs:45:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22739:src-tauri/src/memory/telemetry.rs:52:    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22740:src-tauri/src/memory/telemetry.rs:53:    // %LOCALAPPDATA%\titane-infinity\memory (Windows), etc.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22741:src-tauri/src/memory/telemetry.rs:54:    fallback_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22742:src-tauri/src/memory/telemetry.rs:57:fn candidate_cwd_memory_dir() -> Option<PathBuf> {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22743:src-tauri/src/memory/telemetry.rs:58:    env::current_dir().ok().map(|cwd| cwd.join("memory"))
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22744:src-tauri/src/memory/telemetry.rs:61:fn fallback_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22745:src-tauri/src/memory/telemetry.rs:63:    base.join("titane-infinity").join("memory")
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22746:src-tauri/src/memory/telemetry.rs:87:        .join("memory-e2e")
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22747:src-tauri/src/memory/telemetry.rs:91:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22748:src-tauri/src/memory/telemetry.rs:92:    let fallback = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22749:src-tauri/src/memory/telemetry.rs:101:/// Scan the memory directory and return lightweight telemetry for observability.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22750:src-tauri/src/memory/telemetry.rs:102:pub fn scan_memory_directory() -> MemoryDirectoryReport {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22751:src-tauri/src/memory/telemetry.rs:103:    let base_path = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22752:src-tauri/src/memory/telemetry.rs:213:    fn test_resolve_memory_dir_default() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22753:src-tauri/src/memory/telemetry.rs:221:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22754:src-tauri/src/memory/telemetry.rs:222:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22755:src-tauri/src/memory/telemetry.rs:226:    fn test_resolve_memory_dir_custom() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22756:src-tauri/src/memory/telemetry.rs:230:        std::env::set_var("TITANE_MEMORY_DIR", "/custom/memory/path");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22757:src-tauri/src/memory/telemetry.rs:232:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22758:src-tauri/src/memory/telemetry.rs:233:        assert_eq!(dir.to_string_lossy(), "/custom/memory/path");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22759:src-tauri/src/memory/telemetry.rs:240:    fn test_resolve_memory_dir_empty_env() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22760:src-tauri/src/memory/telemetry.rs:246:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22761:src-tauri/src/memory/telemetry.rs:248:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22762:src-tauri/src/memory/telemetry.rs:255:    fn test_resolve_memory_dir_e2e_default() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22763:src-tauri/src/memory/telemetry.rs:262:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22764:src-tauri/src/memory/telemetry.rs:263:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22765:src-tauri/src/memory/telemetry.rs:269:    fn test_resolve_memory_dir_e2e_custom_override() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22766:src-tauri/src/memory/telemetry.rs:277:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22767:src-tauri/src/memory/telemetry.rs:285:    fn test_resolve_memory_dir_e2e_blocks_default_dir() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22768:src-tauri/src/memory/telemetry.rs:289:        let default_dir = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22769:src-tauri/src/memory/telemetry.rs:293:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22770:src-tauri/src/memory/telemetry.rs:294:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22771:src-tauri/src/memory/telemetry.rs:301:    fn test_scan_memory_directory_missing() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22772:src-tauri/src/memory/telemetry.rs:306:        let report = scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22773:src-tauri/src/memory/telemetry.rs:361:    fn test_memory_file_report_creation() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22774:src-tauri/src/memory/telemetry.rs:363:            name: "memory.json".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22775:src-tauri/src/memory/telemetry.rs:369:        assert_eq!(report.name, "memory.json");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22776:src-tauri/src/memory/telemetry.rs:375:    fn test_memory_file_report_no_version() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22777:src-tauri/src/memory/telemetry.rs:387:    fn test_memory_directory_report_creation() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22778:src-tauri/src/memory/telemetry.rs:389:            base_path: "/path/to/memory".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22779:src-tauri/src/memory/telemetry.rs:395:        assert_eq!(report.base_path, "/path/to/memory");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22780:src-tauri/src/memory/telemetry.rs:401:    fn test_memory_directory_report_with_files() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:22781:src-tauri/src/memory/telemetry.rs:417:            base_path: "/memory".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:27818:src-tauri/src/core/legacy.rs:135:        let disk_mode = telemetry::detect_disk_mode(&audit_report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:29798:src/utils/telemetryEngine.ts:247:          id: 'ai_model_accuracy',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:29799:src/utils/telemetryEngine.ts:793:      'ai_model_accuracy',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31669:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31670:src-tauri/src/memory/telemetry.rs:161:pub fn detect_disk_mode(report: &MemoryDirectoryReport) -> DiskMode {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31671:src-tauri/src/memory/telemetry.rs:317:    fn test_detect_disk_mode_disabled() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31672:src-tauri/src/memory/telemetry.rs:325:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31673:src-tauri/src/memory/telemetry.rs:326:        assert!(matches!(mode, DiskMode::Disabled));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31674:src-tauri/src/memory/telemetry.rs:330:    fn test_detect_disk_mode_readonly() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31675:src-tauri/src/memory/telemetry.rs:338:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31676:src-tauri/src/memory/telemetry.rs:339:        assert!(matches!(mode, DiskMode::ReadOnly));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31677:src-tauri/src/memory/telemetry.rs:343:    fn test_detect_disk_mode_readwrite() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31678:src-tauri/src/memory/telemetry.rs:356:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:31679:src-tauri/src/memory/telemetry.rs:357:        assert!(matches!(mode, DiskMode::ReadWrite));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:37198:src-tauri/src/api/telemetry_api.rs:24:    pub provider_timeouts_per_hour: Option<f64>,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:37199:src-tauri/src/api/telemetry_api.rs:126:    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:37200:src-tauri/src/api/telemetry_api.rs:139:        provider_timeouts_per_hour,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:39204:src/types/telemetry.ts:27:  providerTimeoutsPerHour?: number;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40639:src-tauri/src/memory/telemetry.rs:52:    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40640:src-tauri/src/memory/telemetry.rs:54:    fallback_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40641:src-tauri/src/memory/telemetry.rs:61:fn fallback_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40642:src-tauri/src/memory/telemetry.rs:92:    let fallback = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40643:src-tauri/src/memory/telemetry.rs:98:    matches_cwd || fallback == path
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40644:src-tauri/src/memory/telemetry.rs:289:        let default_dir = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:40990:src/services/telemetry/useProductionHealthTelemetry.ts:94:      setData(null); // Always clear stale data on error — no silent fallback
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:43975:src-tauri/src/api/telemetry_api.rs:48:#[tauri::command]
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:46579:src/utils/telemetryEngine.ts:100:    this.registerMetricCollectors();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.clean.txt:46580:src/utils/telemetryEngine.ts:124:  private registerMetricCollectors(): void {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5586:src/utils/telemetryEngine.ts:376:          this.storeMetric(metric);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5587:src/utils/telemetryEngine.ts:447:  private storeMetric(metric: TelemetryMetric): void {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5588:src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5589:src/utils/telemetryEngine.ts:880:      if (stored) {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5590:src/utils/telemetryEngine.ts:881:        const data = JSON.parse(stored);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5591:src/utils/telemetryEngine.ts:905:  private async saveData(): Promise<void> {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5592:src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5593:src/utils/telemetryEngine.ts:917:      console.warn('📊 [TELEMETRY] Failed to save data:', error);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:5594:src/utils/telemetryEngine.ts:1102:        this.saveData();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:9574:src/stores/memoryStore.ts:136:          const telemetry = await backendV17.memory.debugScan();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:9776:src-tauri/src/api/memory_api.rs:8:    memory::telemetry,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:9811:src-tauri/src/api/memory_api.rs:144:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:10279:src/core/singularity/SingularityFusionEngine.ts:396:      // new_state has: { memory_sync, logs_sync, dataset_sync, singularity_sync, performance_guards, auto_healing, crash_protection, telemetry }
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:11515:src-tauri/src/core/legacy.rs:10:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:11521:src-tauri/src/core/legacy.rs:134:        let audit_report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:11531:src-tauri/src/core/legacy.rs:356:        let base_dir = telemetry::resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:12355:src-tauri/src/types/memory.rs:34:/// File-level telemetry for the memory directory audit
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13352:src/utils/telemetryEngine.ts:218:          id: 'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13353:src/utils/telemetryEngine.ts:220:          value: (performance as any).memory?.usedJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13354:src/utils/telemetryEngine.ts:227:            totalHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13355:src/utils/telemetryEngine.ts:228:            heapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13356:src/utils/telemetryEngine.ts:334:        metricId: 'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13357:src/utils/telemetryEngine.ts:799:      'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13358:src/utils/telemetryEngine.ts:829:        memory_usage: {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13359:src/utils/telemetryEngine.ts:830:          positive: ['Monitor memory leaks', 'Consider memory optimization'],
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13360:src/utils/telemetryEngine.ts:879:      const stored = localStorage.getItem('titane_telemetry_data');
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13361:src/utils/telemetryEngine.ts:915:      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13362:src/utils/telemetryEngine.ts:977:    const history = this.metrics.get(metricId);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13363:src/utils/telemetryEngine.ts:978:    return history ? history.slice(0, limit) : [];
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13364:src/utils/telemetryEngine.ts:1031:      'memory_usage',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:13365:src/utils/telemetryEngine.ts:1097:   * Démarrage automatique de la sauvegarde périodique
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:18058:src-tauri/src/mock_commands.rs:9:use crate::memory::telemetry;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:18070:src-tauri/src/mock_commands.rs:246:    let report = telemetry::scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:21459:src-tauri/src/devtools/telemetry.rs:21:    // - Storage: Time-series database (InfluxDB/Prometheus) for metrics
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:21460:src-tauri/src/devtools/telemetry.rs:32:        // Implementation: Persistent telemetry event storage and aggregation
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:21461:src-tauri/src/devtools/telemetry.rs:33:        // - Storage: Append to ~/.titane/telemetry/events.jsonl (JSON Lines format)
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:21462:src-tauri/src/devtools/telemetry.rs:34:        // - Batching: Buffer events in memory (Vec<TelemetryEvent>), flush every 100 events or 10s
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:21463:src-tauri/src/devtools/telemetry.rs:36:        // - Indexing: Maintain in-memory index by event type for fast querying
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22733:src-tauri/src/memory/telemetry.rs:11:/// Resolve the base directory storing persisted memory JSON files.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22734:src-tauri/src/memory/telemetry.rs:12:pub fn resolve_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22735:src-tauri/src/memory/telemetry.rs:28:            log::info!("[E2E Guard] TITANE_E2E=1 -> memory dir: {}", resolved.display());
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22736:src-tauri/src/memory/telemetry.rs:41:    resolve_default_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22737:src-tauri/src/memory/telemetry.rs:44:fn resolve_default_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22738:src-tauri/src/memory/telemetry.rs:45:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22739:src-tauri/src/memory/telemetry.rs:52:    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22740:src-tauri/src/memory/telemetry.rs:53:    // %LOCALAPPDATA%\titane-infinity\memory (Windows), etc.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22741:src-tauri/src/memory/telemetry.rs:54:    fallback_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22742:src-tauri/src/memory/telemetry.rs:57:fn candidate_cwd_memory_dir() -> Option<PathBuf> {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22743:src-tauri/src/memory/telemetry.rs:58:    env::current_dir().ok().map(|cwd| cwd.join("memory"))
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22744:src-tauri/src/memory/telemetry.rs:61:fn fallback_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22745:src-tauri/src/memory/telemetry.rs:63:    base.join("titane-infinity").join("memory")
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22746:src-tauri/src/memory/telemetry.rs:87:        .join("memory-e2e")
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22747:src-tauri/src/memory/telemetry.rs:91:    let cwd_candidate = candidate_cwd_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22748:src-tauri/src/memory/telemetry.rs:92:    let fallback = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22749:src-tauri/src/memory/telemetry.rs:101:/// Scan the memory directory and return lightweight telemetry for observability.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22750:src-tauri/src/memory/telemetry.rs:102:pub fn scan_memory_directory() -> MemoryDirectoryReport {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22751:src-tauri/src/memory/telemetry.rs:103:    let base_path = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22752:src-tauri/src/memory/telemetry.rs:213:    fn test_resolve_memory_dir_default() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22753:src-tauri/src/memory/telemetry.rs:221:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22754:src-tauri/src/memory/telemetry.rs:222:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22755:src-tauri/src/memory/telemetry.rs:226:    fn test_resolve_memory_dir_custom() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22756:src-tauri/src/memory/telemetry.rs:230:        std::env::set_var("TITANE_MEMORY_DIR", "/custom/memory/path");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22757:src-tauri/src/memory/telemetry.rs:232:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22758:src-tauri/src/memory/telemetry.rs:233:        assert_eq!(dir.to_string_lossy(), "/custom/memory/path");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22759:src-tauri/src/memory/telemetry.rs:240:    fn test_resolve_memory_dir_empty_env() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22760:src-tauri/src/memory/telemetry.rs:246:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22761:src-tauri/src/memory/telemetry.rs:248:        assert!(dir.to_string_lossy().contains("memory"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22762:src-tauri/src/memory/telemetry.rs:255:    fn test_resolve_memory_dir_e2e_default() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22763:src-tauri/src/memory/telemetry.rs:262:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22764:src-tauri/src/memory/telemetry.rs:263:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22765:src-tauri/src/memory/telemetry.rs:269:    fn test_resolve_memory_dir_e2e_custom_override() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22766:src-tauri/src/memory/telemetry.rs:277:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22767:src-tauri/src/memory/telemetry.rs:285:    fn test_resolve_memory_dir_e2e_blocks_default_dir() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22768:src-tauri/src/memory/telemetry.rs:289:        let default_dir = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22769:src-tauri/src/memory/telemetry.rs:293:        let dir = resolve_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22770:src-tauri/src/memory/telemetry.rs:294:        assert!(dir.to_string_lossy().ends_with("memory-e2e"));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22771:src-tauri/src/memory/telemetry.rs:301:    fn test_scan_memory_directory_missing() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22772:src-tauri/src/memory/telemetry.rs:306:        let report = scan_memory_directory();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22773:src-tauri/src/memory/telemetry.rs:361:    fn test_memory_file_report_creation() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22774:src-tauri/src/memory/telemetry.rs:363:            name: "memory.json".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22775:src-tauri/src/memory/telemetry.rs:369:        assert_eq!(report.name, "memory.json");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22776:src-tauri/src/memory/telemetry.rs:375:    fn test_memory_file_report_no_version() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22777:src-tauri/src/memory/telemetry.rs:387:    fn test_memory_directory_report_creation() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22778:src-tauri/src/memory/telemetry.rs:389:            base_path: "/path/to/memory".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22779:src-tauri/src/memory/telemetry.rs:395:        assert_eq!(report.base_path, "/path/to/memory");
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22780:src-tauri/src/memory/telemetry.rs:401:    fn test_memory_directory_report_with_files() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:22781:src-tauri/src/memory/telemetry.rs:417:            base_path: "/memory".to_string(),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:27818:src-tauri/src/core/legacy.rs:135:        let disk_mode = telemetry::detect_disk_mode(&audit_report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:29798:src/utils/telemetryEngine.ts:247:          id: 'ai_model_accuracy',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:29799:src/utils/telemetryEngine.ts:793:      'ai_model_accuracy',
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31669:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31670:src-tauri/src/memory/telemetry.rs:161:pub fn detect_disk_mode(report: &MemoryDirectoryReport) -> DiskMode {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31671:src-tauri/src/memory/telemetry.rs:317:    fn test_detect_disk_mode_disabled() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31672:src-tauri/src/memory/telemetry.rs:325:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31673:src-tauri/src/memory/telemetry.rs:326:        assert!(matches!(mode, DiskMode::Disabled));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31674:src-tauri/src/memory/telemetry.rs:330:    fn test_detect_disk_mode_readonly() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31675:src-tauri/src/memory/telemetry.rs:338:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31676:src-tauri/src/memory/telemetry.rs:339:        assert!(matches!(mode, DiskMode::ReadOnly));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31677:src-tauri/src/memory/telemetry.rs:343:    fn test_detect_disk_mode_readwrite() {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31678:src-tauri/src/memory/telemetry.rs:356:        let mode = detect_disk_mode(&report);
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:31679:src-tauri/src/memory/telemetry.rs:357:        assert!(matches!(mode, DiskMode::ReadWrite));
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:37198:src-tauri/src/api/telemetry_api.rs:24:    pub provider_timeouts_per_hour: Option<f64>,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:37199:src-tauri/src/api/telemetry_api.rs:126:    let provider_timeouts_per_hour = parts.get(9).and_then(|s| s.parse::<f64>().ok());
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:37200:src-tauri/src/api/telemetry_api.rs:139:        provider_timeouts_per_hour,
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:39204:src/types/telemetry.ts:27:  providerTimeoutsPerHour?: number;
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40639:src-tauri/src/memory/telemetry.rs:52:    // Writability-first fallback: ~/.local/share/titane-infinity/memory (Linux),
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40640:src-tauri/src/memory/telemetry.rs:54:    fallback_memory_dir()
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40641:src-tauri/src/memory/telemetry.rs:61:fn fallback_memory_dir() -> PathBuf {
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40642:src-tauri/src/memory/telemetry.rs:92:    let fallback = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40643:src-tauri/src/memory/telemetry.rs:98:    matches_cwd || fallback == path
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40644:src-tauri/src/memory/telemetry.rs:289:        let default_dir = fallback_memory_dir();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:40990:src/services/telemetry/useProductionHealthTelemetry.ts:94:      setData(null); // Always clear stale data on error — no silent fallback
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:43975:src-tauri/src/api/telemetry_api.rs:48:#[tauri::command]
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:46579:src/utils/telemetryEngine.ts:100:    this.registerMetricCollectors();
./_archive/proof_packs_2026-03-26/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/identification_capture.txt:46580:src/utils/telemetryEngine.ts:124:  private registerMetricCollectors(): void {
./_archive/proof_packs_2026-03-26/RELEASE_BINARY_REFRESH_V16_2026-03-11_0804_9b7283eb0/15_DIFF_FILES.md:30:/tmp/titane_v16_cargo_build.log   → build telemetry
./docs/01_misc/POST_PROD_OPS_PHASE3_PLAN.md:16:- **Track** telemetry drift (CPU, memory, event counts)
./docs/01_misc/POST_PROD_OPS_PHASE3_PLAN.md:77:- Export: `PROOF/telemetry_drift_analysis.json`
./docs/01_misc/POST_PROD_OPS_PHASE3_PLAN.md:145:├── telemetry_drift_analysis.json      ← CPU/memory/event trends
./_archive/proof_packs_2026-03-26/RELEASE_BINARY_REFRESH_V16_2026-03-11_0804_9b7283eb0/04_TAURI_BUNDLE_TRUTH.md:18:## Crates Observed Compiling (log telemetry)
./docs/backup_20251218_123316/OPTIMISATIONS_CONTINUES_v26.2_COMPLETE.md:550:- [ ] Opt-in telemetry (privacy-first avec anonymization)
./docs/01_misc/RAPPORT_SYNC_VERSIONS_v26.4.0.md:83:**Impact**: 🔴 CRITIQUE (Logs backend, telemetry, crash reports)
./docs/01_misc/RAPPORT_SYNC_VERSIONS_v26.4.0.md:617:- ❌ Logs/telemetry incohérents
./docs/01_misc/RAPPORT_SYNC_VERSIONS_v26.4.0.md:625:- ✅ Logs/telemetry cohérents
./docs/01_misc/POST_LAUNCH_MONITORING_v26.3.0.md:56:  - Auto-updater: no telemetry available; no failures observed
./docs/01_misc/POST_LAUNCH_MONITORING_v26.3.0.md:74:  - Auto-updater: no telemetry; no failures observed
./docs/01_misc/POST_LAUNCH_MONITORING_v26.3.0.md:233:- [ ] Review any telemetry or error logs
./docs/01_misc/architecture.md:280:- **No telemetry:** Aucune donnée envoyée sans consentement
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:85:**Evidence Base:** `/docs/_evidence/v27/v26_ui_telemetry_discovery/`
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:100:| `src/types/telemetry.ts` | 1 | CREATE | 🟡 Ready |
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:101:| `src/services/telemetry/useProductionHealthTelemetry.ts` | 3 | CREATE | 🟡 Ready |
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:104:| `src-tauri/src/api/telemetry_api.rs` | 3 | CREATE | 🟡 Ready |
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:115:- Create Ring 1 types (telemetry.ts)
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:117:- Create Rust command (telemetry_api.rs)
./docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md:153:c21b498f - chore: Day 1 activation - fixed observation script + v26 telemetry UI plan
./docs/backup_20251218_123316/AUDIT_FINAL_v26.2_COMPLETE.md:575:- ✅ Zero remote telemetry (local-only)
./docs/backup_20251218_123316/AUDIT_FINAL_v26.2_COMPLETE.md:750:- Opt-in telemetry (privacy-first)
./docs/01_misc/GUIDE_INSTALLATION_SETUP_v27.0.0.md:884:    telemetry: false
./docs/01_misc/VERDICT__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_VERDICT.md.md:20:| 2.5  | Telemetry Baseline        | ✅ PASS | `PROOF/telemetry_baseline.json`   |
./docs/01_misc/VERDICT__runs_POST_PROD_OPS_PHASE2_MONITORING_20260223_175200_VERDICT.md.md:135:- Monitor live telemetry drift vs baseline
./docs/01_misc/FINAL_SUMMARY_PHASES_1_4_COMPLETE.md:19:- **Evidence**: Boot test, provider status, conversation smoke, UI health, telemetry, anomaly detection clean
./docs/01_misc/NEXT_STEPS.md:10:- [x] Corrections Runtime (telemetry, cache)
./docs/01_misc/NEXT_STEPS.md:32:2. 3e09da50 - Fix telemetryReport undefined
./docs/01_misc/CORRECTIONS_SUMMARY.md:31:  - Lignes 338-353: Ajout nullish coalescing pour `telemetryReport.value`
./docs/01_misc/CORRECTIONS_SUMMARY.md:32:  - Pattern: `telemetryReport.status === 'fulfilled' && telemetryReport.value?.metrics`
./docs/01_misc/CORRECTIONS_SUMMARY.md:62:- `src/utils/telemetryEngine.ts`: titaneAI
./docs/01_misc/CORRECTIONS_SUMMARY.md:104:- Erreurs runtime: Récurrentes (telemetry)
./docs/01_misc/CORRECTIONS_SUMMARY.md:122:2. `3e09da50`: Fix telemetryReport undefined runtime
./docs/01_misc/REFLEXION_APPROFONDIE_CONTINUATION_EXECUTIVE_SUMMARY.md:272:- ✅ Real-world metrics (telemetry live)
./docs/01_misc/REFLEXION_APPROFONDIE_CONTINUATION_EXECUTIVE_SUMMARY.md:312:3. **Parallel Phase 3 setup** (telemetry integration)
./docs/01_misc/OPPORTUNITIES_RANKED.md:25:### 2️⃣ **Provider Fallback Prewarming** (No current telemetry yet)
./docs/01_misc/OPPORTUNITIES_RANKED.md:104:- **Evidence**: Phase 9 monitoring active. Opportunity: measure telemetry CPU cost, optimize.
./docs/01_misc/OPPORTUNITIES_RANKED.md:106:- **Risk**: L2 (telemetry logic, no external change)
./docs/01_misc/OPPORTUNITIES_RANKED.md:107:- **Effort**: M (profile telemetry sampling, add metrics)
./docs/01_misc/OPPORTUNITIES_RANKED.md:110:- **Implementation**: Add telemetry timing metrics, detect overhead, adjust sampling
./docs/01_misc/OPPORTUNITIES_RANKED.md:111:- **Rollback**: Disable telemetry if needed
./docs/01_misc/BUILD_SUCCESS_REPORT_v26.4.0.md:222:_Sous supervision TITANE∞ constraints_  
./docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md:26:2. **memoryStore** — Memory system state (snapshots, logs, timeline, telemetry)
./docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md:157:const { state, logs, telemetry, fetchState, fetchLogs, fetchTelemetry } =
./docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md:163:const telemetry = useTelemetry();
./docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md:300:- **Impact:** -75% rerenders (state/logs/telemetry changes isolés)
./docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md:513:  * Impact: -75% rerenders (state/logs/telemetry isolated)
./_archive/proof_packs_2026-03-26/CHAT_ULTIMATE_POLICY_2026-03-17_2144_3b3907080/01_BOOTSTRAP.md:25:9a6e803c1 fix(telemetry): test-fix vi.useFakeTimers() hang + proof pack
./_archive/proof_packs_2026-03-26/CHAT_ULTIMATE_POLICY_2026-03-17_2144_3b3907080/01_BOOTSTRAP.md:28:7a4621161 fix(telemetry+tts): CSV parser fixes, schema drift detection
./docs/01_misc/GO_HOLD_DECISION.md:134:- **Response Time Profile:** Not measured (need telemetry baseline)
./docs/01_misc/STATUS.md:18:| **telemetry**        | unset | **disabled** | 🔐 Privacy protégée       |
./docs/01_misc/STATUS.md:184:cline config get telemetry-setting       # Doit être: disabled
./docs/backup_20251218_123316/VALIDATION_FINALE_v26.2.md:264:- Opt-in telemetry
./docs/01_misc/NEXT_STEPS_v27.0.0.md:210:# Configure telemetry
./_archive/proof_packs_2026-03-26/patch-010/00-README.md:73:4. Collect live provider response telemetry
./docs/01_misc/ROADMAP_v26.4.0.md:17:3. 📈 Add optional telemetry (privacy-first)
./docs/01_misc/ROADMAP_v26.4.0.md:138:- Optional telemetry system (opt-in)
./docs/01_misc/ROADMAP_v26.4.0.md:153:1. Design telemetry schema (minimal data)
./docs/01_misc/ROADMAP_v26.4.0.md:155:3. Create local telemetry storage
./docs/01_misc/ROADMAP_v26.4.0.md:258:- ✅ Implement telemetry (opt-in)
./docs/01_misc/ROADMAP_v26.4.0.md:309:- **Privacy-first telemetry** — user trust is paramount
./docs/01_misc/ROADMAP_v26.4.0.md:321:6. **Week 3:** Implement telemetry + docs
./docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md:102:- [ ] Set up telemetry collection
./docs/01_misc/DEBUG_CHAT_IA_PHASE3_CRITICAL_LOGS.md:274:- Ajouter telemetry structurée
./docs/01_misc/CAMPAIGN_GO_ALL_EXTENDED_PLUS_COMPLETION_REPORT.md:188:- ✅ Automated feedback: In-app widget, crash reports, telemetry
./docs/01_misc/STATUS_FINAL.md:102:- `src/utils/telemetryEngine.ts` (19 erreurs)
./docs/01_misc/VALIDATION_REPORT_FINAL.md:166:- `window.__TITANE_BOOT_LOCK__.getState()` dans telemetry
./docs/01_misc/10_VSCODE_CRASH_DIAG.md:17:telemetry.log
./docs/01_misc/ipc-contract-seal-omega-infinity-v1.md:301:3. **Error Monitoring**: Add telemetry for IPC error classification patterns
./docs/01_misc/RELEASE_DISTRIBUTION_PACK.md:149:- ✅ No tracking/telemetry (Ollama localhost reference)
./docs/01_misc/8_6_feedback_collection.md:49:Data sent to: logs/telemetry/wave_[n]_metrics.jsonl (anonymized)
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:1285:    pub enable_telemetry: bool,
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:1293:            enable_telemetry: true,
./docs/development/GITHUB_COPILOT_SUPER_PROMPTS.md:1330:        // 5. Emit telemetry
./docs/01_misc/SCANS_ALLOWLIST.md:1187:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:1401:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/SCANS_ALLOWLIST.md:1979:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:3235:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:7476:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/SCANS_ALLOWLIST.md:9394:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:928:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:9880:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1414:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/SCANS_ALLOWLIST.md:10063:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1598:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:10064:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1599:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:10073:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1608:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2438:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:11479:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3014:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:11995:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3530:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:15642:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7177:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:862:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:16180:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7715:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1400:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/SCANS_ALLOWLIST.md:16391:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7926:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1611:./runs/current/SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:16392:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7927:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1612:./runs/current/SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:16401:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7936:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1621:./runs/current/SCANS_SECRETS.md:2437:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:17937:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9472:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3157:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:17950:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9485:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3170:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:21656:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13191:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:6877:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/SCANS_ALLOWLIST.md:23825:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:15360:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9047:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:29121:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:20656:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/SCANS_ALLOWLIST.md:30672:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:22208:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/SCANS_ALLOWLIST.md:35352:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/backup_20251218_123316/ANALYSE_SECURITE_PERFORMANCE_v24.2.0.md:81:   - ✅ No telemetry
./docs/backup_20251218_123316/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:479:- Zero remote telemetry (local-only)
./docs/backup_20251218_123316/ANALYSE_APPROFONDIE_v26.2_PREDICTIVE.md:661:- Remote telemetry opt-in
./docs/backup_20251218_123316/RESUME_VISUEL_v26.2.md:211:- Opt-in telemetry (privacy-first)
./docs/backup_20251218_123316/BUILD_VALIDATION_REPORT.md:67:- Modules dépréciés: `memory::telemetry` → migration vers `unified_memory_v2`
./docs/backup_20251218_123316/BUILD_VALIDATION_REPORT.md:250:   - Migrer `memory::telemetry` → `unified_memory_v2`
./docs/backup_20251218_123316/README_v19.5.2_OLD.md:716:- **`telemetry.rs`**: Télémétrie OS/Hardware
./docs/01_misc/05_SCANS_ALLOWLIST.md:928:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:1414:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/05_SCANS_ALLOWLIST.md:1598:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:1599:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:1608:./runs/p462_468/proof_pack/05_SCANS_SECRETS.md:2438:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:3014:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:3530:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:7177:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:862:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:7715:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1400:./registry/ui-events.jsonl:66:{"id":"ui-041","ts":"2026-02-23T00:00:00Z","category":"ui","scope":"admin|production-health|telemetry","change_type":"feature","summary":"Ajout de l’onglet Santé Prod avec lecture CSV locale via IPC Tauri canonique","reason":"Afficher les métriques Week 1 en temps réel sans réseau et sans appel invoke direct côté UI/service.","files_changed":["src/features/admin/types.ts","src/features/admin/AdminPage.tsx","src/features/production-health/ProductionHealthPanel.tsx","src/features/production-health/ProductionHealthPanel.css","src/services/telemetry/useProductionHealthTelemetry.ts","src/types/telemetry.ts","src/lib/tauriCommands.ts","src/lib/tauriClient.ts","src-tauri/src/api/telemetry_api.rs","src-tauri/src/main.rs","tauri.base.json"],"tests_run":["pnpm run test:architecture","pnpm run test:rust"],"proofs":["Commande read_production_week1_csv allowlistée + enregistrée dans invoke_handler","UI avec data-testid stables: production-health-panel, production-health-refresh"],"risk_level":"low","rollback":"git restore -- src/features/admin/types.ts src/features/admin/AdminPage.tsx src/features/production-health/ProductionHealthPanel.tsx src/features/production-health/ProductionHealthPanel.css src/services/telemetry/useProductionHealthTelemetry.ts src/types/telemetry.ts src/lib/tauriCommands.ts src/lib/tauriClient.ts src-tauri/src/api/telemetry_api.rs src-tauri/src/main.rs tauri.base.json registry/ui-events.jsonl","status":"qualified","ring_impacted":"Ring 1 Types + Ring 3 Services/API + Ring 4 UI/Tauri","maturity_status":"QUALIFIED"}
./docs/01_misc/05_SCANS_ALLOWLIST.md:7926:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1611:./runs/current/SCANS_SECRETS.md:347:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:7927:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1612:./runs/current/SCANS_SECRETS.md:502:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:7936:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:1621:./runs/current/SCANS_SECRETS.md:2437:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:9472:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3157:./deployment/latest/certification/p3/proof_packs/P3_3_INSTRUMENTATION_20260216_153653/10_COMMANDS_RUN.txt:687:src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:9485:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:3170:./src-tauri/src/memory/telemetry.rs:160:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:13191:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:6877:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/05_SCANS_ALLOWLIST.md:15360:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:9047:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/01_misc/05_SCANS_ALLOWLIST.md:20656:./src/services/telemetry/useProductionHealthTelemetry.ts:4: * Auto-refresh every 60s + manual refresh capability
./docs/01_misc/05_SCANS_ALLOWLIST.md:22208:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:10685:./src-tauri/src/memory/telemetry.rs:91:/// Heuristic disk-mode detection to surface read/write capability to the UI.
./docs/99_ARCHIVE/obsolete/SESSION_SUMMARY_18NOV2025.md:279:- Autonomic Evolution: supervision évolutive avec drift_risk
./docs/99_ARCHIVE/obsolete/AUDIT_360_RAPPORT_FINAL_v17.md:491:  apiUpdates: false,  // ❌ Pas de telemetry
./docs/99_ARCHIVE/obsolete/AUDIT_360_RAPPORT_FINAL_v17.md:492:  telemetry: false    // ❌ Pas de tracking
./docs/99_ARCHIVE/obsolete/CHANGELOG_v8.6.0.md:133:**Fonction** : Méta-orchestration, supervision trans-modulaire et harmonie systémique globale
./docs/99_ARCHIVE/obsolete/CHANGELOG_v8.6.0.md:294:- P119 (supervision avec modèle interne)
./docs/99_ARCHIVE/obsolete/MODULES_52_53_54_COMPLETE.md:250:- Permet supervision humaine et override manuel
./docs/99_ARCHIVE/sessions/MEMORY_CORE_STABILIZATION_PLAN_vOmega6.md:8:- There is no telemetry or watchdog path to flag failed writes, meaning the chat stack assumes persistence succeeded even though nothing is written.
./docs/99_ARCHIVE/sessions/MEMORY_CORE_STABILIZATION_PLAN_vOmega6.md:55:2. Publish structured telemetry events to the frontend (via `backendV17.watchdog.subscribe`) so the UI can show banners (“Memory running in read-only safe mode”).
./docs/99_ARCHIVE/sessions/MEMORY_CORE_STABILIZATION_PLAN_vOmega6.md:67:- Unified front/back contracts plus telemetry so operators immediately know when memory is degraded.
./docs/99_ARCHIVE/sessions/RAPPORT_OMEGA_FINALISATION_v16.2.2_COMPLETE.md:677:   - Erreurs user → backend telemetry
./docs/99_ARCHIVE/r05-omega/R05_OMEGA_OPTIMIZATION_PHASE2_COMPLETE.md:304:| `metadata`           | OMEGA `latency_ms`, `tokens`, `model`  | Complete telemetry                                                                                      |
./docs/99_ARCHIVE/obsolete/CHANGELOG_v8.3.0.md:571:- **P92** opère sous supervision sécurité de **P93**
./docs/99_ARCHIVE/guides/README_v19.5.2_OLD.md:716:- **`telemetry.rs`**: Télémétrie OS/Hardware
./docs/99_ARCHIVE/obsolete/VALIDATION_COMPLETE.md:336:│     └─ No telemetry                         │
./docs/99_ARCHIVE/sessions/DIAGNOSTIC_TOTAL_REPAIR_v∞.md:52:- ✅ Debug entries & telemetry
./docs/99_ARCHIVE/obsolete/MONITORING_LAYER_SUMMARY_FR.md:11:La **Couche de Monitoring** (Monitoring Layer) représente le niveau supérieur d'observabilité et de supervision du système cognitif TITANE∞. Elle fournit quatre capacités essentielles :
./docs/99_ARCHIVE/sessions/PRODUCTION_READY_ROADMAP.md:1268:- Optional telemetry (opt-in)
./docs/99_ARCHIVE/versions/v14/PHASE_2_BACKEND_LIBERATION_v14.7.md:138:- [ ] Implémenter spans + traces (telemetry.rs)
./docs/99_ARCHIVE/obsolete/MODULES_115_120_ULTIMATE_COMPLETION_LAYER.md:16:- ✅ **P119** — Méta-orchestration et supervision multi-système
./docs/99_ARCHIVE/obsolete/MODULES_115_120_ULTIMATE_COMPLETION_LAYER.md:796:- **P119** → Permet supervision intégrée avec vrai modèle interne
./docs/99_ARCHIVE/obsolete/RAPPORT_EXECUTIF_FINAL.md:186:- Avancement projets sans supervision
./docs/99_ARCHIVE/obsolete/ARCHITECTURE_COMPLETE_V13_V14.md:183:Agent autonome capable d'avancer plusieurs projets en arrière-plan sans supervision, avec sécurité maximale.
./docs/99_ARCHIVE/obsolete/OPTIMIZATION_REPORT_CPU_v24.md:153:"telemetry.telemetryLevel": "off",
./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:186:**File**: `src-tauri/src/devtools/telemetry.rs`
./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:190:// TODO: Implement full telemetry with spans, traces, etc.
./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:193:// TODO: Store telemetry events (e.g., in a circular buffer or send to observability backend)
./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:417:- **Fichier**: `src-tauri/src/devtools/telemetry.rs`
./docs/99_ARCHIVE/versions/v14/PHASE_1_AUDIT_GLOBAL_REPORT_v14.7.md:478:║ TODO Comments:            2 (telemetry.rs)                 ║
./docs/99_ARCHIVE/sessions/RAPPORT_FINAL_PHASE_6_v19.2.0.md:417:- [ ] **Métriques** - Latence, taux erreur, usage (telemetry)
./docs/99_ARCHIVE/obsolete/MODULES_96_110_ULTIMATE_PRE_ASCENSION_LAYER.md:380:- P98 adapté sous supervision P93
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:177:└── directive.rs    (18 lignes)  - Directive de supervision
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:193:### Directive de supervision
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:199:- Sinon: "Évolution progressive et sous supervision active."
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:213:- Alpha: **0.15** (stabilité pour supervision long terme)
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:290:- Permet supervision humaine
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:343:println!("Supervision: {}", aes_state.supervision_directive);
./docs/99_ARCHIVE/obsolete/MODULES_55_56_57_59_COMPLETE.md:385:2. Heatmap régulation/plasticité/supervision
./docs/99_ARCHIVE/obsolete/QUICK_RECAP_v8.6.0.md:15:- **P119** — Méta-orchestration, supervision multi-système, harmonie globale
./docs/99_ARCHIVE/sessions/RAPPORT_COMPLET_SESSION_v19.md:391:3. **v20.3.0** (Q3 2026): Streaming TTS + Métriques telemetry
./docs/99_ARCHIVE/merged/STATUS_v17.2.0_FINAL.md:14:- ✅ **DevTools** pour observabilité totale (logs, metrics, telemetry)
./docs/99_ARCHIVE/merged/STATUS_v17.2.0_FINAL.md:70:- `src-tauri/src/devtools/telemetry.rs` (200 lignes)
./docs/99_ARCHIVE/sessions/ORCHESTRATION_MANIFEST.md:183:6. **No telemetry** — Zero data collection
./docs/99_ARCHIVE/sessions/ORCHESTRATION_MANIFEST.md:227:- **No telemetry:** Zero external data transmission
./docs/99_ARCHIVE/sessions/TITANE_SINGULARITY_OS_V∞_REPORT.md:966:- **+30% cohérence conversationnelle** (supervision continue)
./docs/99_ARCHIVE/versions/v18/COMMIT_MESSAGE_v18.1.0_SINGULARITY_DEEP_SYNC.md:5:Intégrer META-COGNITION et DEEP SYNC dans SingularityState pour supervision cognitive complète du système. Ajouter self-tests automatiques pour validation de cohérence interne.
./docs/99_ARCHIVE/sessions/EXTENSIONS_QUICK_REFERENCE.md:326:  "telemetry.telemetryLevel": "off",
./docs/99_ARCHIVE/versions/v18/COMMIT_MESSAGE_v18.0.0_META_COGNITION_DEEP_SYNC.md:11:**Mission accomplie** : Implémentation complète du **META-COGNITION ENGINE** et du **DEEP SYNC ENGINE**, permettant l'auto-évaluation cognitive, la supervision de cohérence interne, et la synchronisation profonde entre 20+ moteurs.
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v16.2.2.md:273:3. **Monitoring** : Logs propres, telemetry ready
./docs/99_ARCHIVE/merged/IMPLEMENTATION_COMPLETE_FULL_DUPLEX_v∞.5.md:438:   - Collect telemetry
./docs/99_ARCHIVE/merged/MISE_A_JOUR_COMPLETE_v17.2.0.md:95:└── telemetry.rs         (200 lignes) - Télémétrie système
./docs/99_ARCHIVE/versions/v17/DEPLOYMENT_PRODUCTION_TAURI_v17.3.0.md:778:### 4. Update telemetry
./docs/99_ARCHIVE/merged/VALIDATION_FINALE_FULL_DUPLEX_v∞.5.md:188:- [ ] Add telemetry for barge-in events
./docs/99_ARCHIVE/merged/META_V18_COMPLETE_REPORT.md:453:| ❌ Pas de supervision cognitive | ✅ Évaluation continue 24/7 |
./docs/99_ARCHIVE/merged/ULTRA_PROMPT_2_FINAL_REPORT_v42.md:749:- ✅ **Traces**: En mémoire + export local (pas de telemetry externe)
./docs/99_ARCHIVE/merged/REFACTOR_FRONTEND_COMPLETE_v17.3.md:177:2. Implémenter error telemetry (Sentry / logs)
./docs/99_ARCHIVE/old_sessions/2025-12-10/COMMIT_MESSAGE_v17.2.0.txt:53:- DevTools: 30+ tests (logging, metrics, telemetry)
./docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_REPORT_v19.5.2_FINAL.md:243:- ✅ No telemetry (aucune collecte analytics)
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_VISUAL_SUMMARY.txt:183:    ❌ Pas de self-healing           ➜  ✅ Auto-supervision + restart
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_VISUAL_SUMMARY.txt:206:    ✅ Auto-supervision et self-healing
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_VISUAL_SUMMARY.txt:275:    - Auto-supervision et self-healing
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINAL_REPORT_SP15_SP19.md:205:2. ✅ **Agent System** (11 agents, messaging, supervision, collaboration)
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_SP15_SP19_COMPLET.md:20:**Organisme multicellulaire cognitif** : 11 agents spécialisés, messaging, supervision, collaboration
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_SP15_SP19_COMPLET.md:361:- ✅ Auto-supervision et self-healing
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_SP15_SP19_COMPLET.md:867:✅ Auto-supervision et self-healing
./docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_SP15_SP19_COMPLET.md:879:| **Auto-gestion**  | Manuelle   | Auto-supervision            | +100% |
./docs/99_ARCHIVE/old_sessions/2025-12-10/PHASE_2_COMPLETE_v1.0.md:582:   - Add telemetry for Unified Memory stats (tier distribution, promotion rate)

## Classification
- PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md: CONTEXT_ONLY
- frontend_supervision.patch (previous pack): NOT_RECOVERABLE (0 bytes)
- raw_diff_main.txt / src.diff / src-tauri.diff: NOT_RECOVERABLE for untracked content
