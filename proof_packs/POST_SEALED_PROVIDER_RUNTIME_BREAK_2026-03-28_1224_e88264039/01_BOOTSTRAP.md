# 01_BOOTSTRAP

## git status --porcelain=v1
 M .clinerules/05-truth-surface.md
 M docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
 M scripts/autoheal/autoheal_rules.jsonl
 M scripts/benchmark.sh
 M scripts/e2e/run-memory-chat-proof-ui.sh
 M scripts/e2e/run-online-chat-proof-ui.sh
 M scripts/fix-prod-v27.0.2.sh
 M scripts/install/install-e2e.sh
 M scripts/post-build.sh
 M scripts/prepare-ollama-bundle.sh
 M scripts/publish/publish-v27.2.0.sh
 M scripts/setup-dev.sh
 M scripts/test-all.sh
?? .claude/
?? .github/workflows/docs.yml
?? PLANS/
?? docs/90_release/PRODUCTION_RELEASE_v28.88.0.md
?? docs/governance/AUTHORITY_MATRIX.md
?? docs/governance/BASELINE_VERDICT.md
?? docs/governance/CAPABILITY_MATRIX_CANONICAL_v1.md
?? docs/governance/CORE_LABS_OPS_BOUNDARY.md
?? docs/governance/MEMORY_SEAL_SPEC.md
?? docs/governance/PROVIDER_FABRIC_CANON_v1.md
?? docs/governance/ROUTING_POLICY_CANON_v1.md
?? docs/governance/ROUTING_TRACE_CONTRACT_v1.md
?? docs/governance/SHELL_MINCE_DECISION.md
?? docs/governance/TARGET_OPERATING_MODEL_v1.md
?? docs/governance/UI_RUNTIME_TRUTH_SPEC.md
?? documentation/
?? evals/harness/
?? proof
?? proof_p
?? proof_packs/AUDIO_VOICE_RECERT_2026-03-17_1856_8af44abed/
?? proof_packs/CL
?? proof_packs/CLINE_AUTHORITY_CORE_CONVERGENCE_2026-03-26_2044_e88264039/
?? proof_packs/CLINE_CAN
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-2
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-26_2003_e88264039/
?? proof_packs/CLINE_EXEC
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882640
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e88264039/
?? proof_packs/FINAL_PROMOTION_GATEKEEPER_2026-03-27_0712_e88264039/
?? proof_packs/LOCK1_PROVIDER_FABRIC_STATUS_FIX_2026-03-27_e88264039/
?? proof_packs/LOCK_SURGEON_FALSE_MEMORY_CLAIM_2026-03-27_2219_e88264039/
?? proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/
?? proof_packs/PHASE0_AUTHORITY_FREEZE_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_ADAPTER_COMPAT_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_FABRIC_FREEZE_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_FABRIC_STATUS_2026-03-27_e88264039/
?? proof_packs/PHASE2_ROUTING_TRUTH_FREEZE_2026-03-27_e88264039/
?? proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/
?? proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/
?? proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/
?? proof_packs/POST_SEALED_ANTI_LIE_CANON_2026-03-28_1141_e88264039/
?? proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/
?? proof_packs/POST_SEALED_AUTHORITY_MATRIX_VERIFY_2026-03-28_1108_e88264039/
?? proof_packs/POST_SEALED_CORE_LABS_OPS_CANON_2026-03-28_1131_e88264039/
?? proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/
?? proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/
?? proof_packs/POST_SEALED_MEMORY_SEAL_CANON_2026-03-28_1149_e88264039/
?? proof_packs/POST_SEALED_PROVIDER_RUNTIME_BREAK_2026-03-28_1224_e88264039/
?? proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/
?? proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/
?? proof_packs/POST_SEALED_SHELL_MINCE_CANON_2026-03-28_1122_e88264039/
?? proof_packs/ROUTING_PROOF_UNBLOCK_2026-03-27_e88264039/
?? proof_packs/TERMINAL_CONVERGENCE_REFINER_2026-03-27_0747_e88264039/
?? proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/
?? proof_packs/ULTRA_MASTER_AUDIT_2026-03-16_2032_ce22c1f4f/
?? proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/
?? proof_packs/ZERO_REGRESSION_AUTO_MODE_2026-03-27_2147_e88264039/
?? scripts/cleanup-console-log.mjs
?? scripts/sync-docs.sh

## git rev-parse --short HEAD
e88264039

## git branch --show-current
MAIN

## git log -20 --oneline
e88264039 docs(audit): mise à jour audit chat IA — suite complète + cargo warnings
4ed5b6e49 fix(rust/tests): omega_meta manquant dans 9 struct literals de tests
3ad620c6c fix(misc): main.rs comment + audit doc wording mineures
1420ffea1 fix(cleanup): chatClient.ts suppression — orphelin prouvé (0 imports src/)
4d3a64771 fix(docs): hardening léger — statuts RESOLVED et classifications mises à jour
5845ad12f docs(ops): CLAUDE_CODE_NEXT_READINESS — évaluation automation post-consolidation
924056d33 docs(governance): EXECUTION_GUARDRAILS — garde-fous post-optimisation
5591b9825 docs(architecture): UNKNOWN_REDUCTION_PLAN — 4 UNKNOWN réduits/résolus
123619569 docs(architecture): VALIDATION_CERTIFICATION_BASELINE — hiérarchie honnête des preuves
4d31bd288 docs(architecture): CONSOLIDATED_AUTHORITY_STATE — état post-chantier principal
a36f71c59 fix(tests): MemorySearch — fake timers pour debounce 300ms (régression 5edd219df)
f570ec62a docs(audit): AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26 — PASS 53/53
3ff7cf8b4 fix(cleanup): TitanePage dead code + orchestrator version header
d1d88e24e docs(ops): main optimization execution log — Phase 10 STABLE
2ed09297d feat(shell): App.tsx phase 3b — extract useTopNavigation hook (-60 lines)
5e201c066 fix(memory): MemoryIntelligenceEngine — TODO marker P2 + MOVE_PLAN updated
1daf353f0 fix(rust): audio-capture opt-in — retire cpal du default set (P1 ALSA risk)
283abcaa7 docs(architecture): Phase 5+7+9 docs + recharts reclassification + proof_packs archive
cad543f47 fix(misc): XP_ENGINE sync experienceService + TimePage CSS fix + clinerules truth-surface
af5db04c7 style(ai): prettier formatting — omegaModeClassifier, championChallenger, conversationEngine

## git diff --stat
 .clinerules/05-truth-surface.md                | 60 +++++++++++++-------------
 docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md | 31 ++++++-------
 scripts/autoheal/autoheal_rules.jsonl          |  6 ++-
 scripts/benchmark.sh                           |  0
 scripts/e2e/run-memory-chat-proof-ui.sh        |  0
 scripts/e2e/run-online-chat-proof-ui.sh        |  0
 scripts/fix-prod-v27.0.2.sh                    |  0
 scripts/install/install-e2e.sh                 |  0
 scripts/post-build.sh                          |  0
 scripts/prepare-ollama-bundle.sh               |  0
 scripts/publish/publish-v27.2.0.sh             |  0
 scripts/setup-dev.sh                           |  0
 scripts/test-all.sh                            |  0
 13 files changed, 49 insertions(+), 48 deletions(-)

## git diff --name-only
.clinerules/05-truth-surface.md
docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
scripts/autoheal/autoheal_rules.jsonl
scripts/benchmark.sh
scripts/e2e/run-memory-chat-proof-ui.sh
scripts/e2e/run-online-chat-proof-ui.sh
scripts/fix-prod-v27.0.2.sh
scripts/install/install-e2e.sh
scripts/post-build.sh
scripts/prepare-ollama-bundle.sh
scripts/publish/publish-v27.2.0.sh
scripts/setup-dev.sh
scripts/test-all.sh

## git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json

## grep '"version"' package.json

## grep '^version' src-tauri/Cargo.toml
version      = "28.88.0"

## find ProviderDecisionMeta / provider truth / fabric / routing policy

## rg provider truth / degraded / HONEST_OFFLINE_DEGRADED
src/__tests__/online-availability.test.ts:8: *   2. internetReachable=true implies provider_used!=local_only (unless explicit policy)
src/__tests__/online-availability.test.ts:15:import { validateProviderDecisionMeta } from '@/types/providerDecisionMeta';
src/__tests__/online-availability.test.ts:16:import type { ProviderDecisionMeta, Mode, ReasonCode } from '@/types/providerMeta';
src/__tests__/online-availability.test.ts:22:function buildMeta(overrides: Partial<ProviderDecisionMeta>): ProviderDecisionMeta {
src/__tests__/online-availability.test.ts:24:    provider_used: 'gemini',
src/__tests__/online-availability.test.ts:45:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:50:    const error = validateProviderDecisionMeta(meta);
src/__tests__/online-availability.test.ts:59:      provider_used: 'ollama',
src/__tests__/online-availability.test.ts:63:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:70:      provider_used: 'offline',
src/__tests__/online-availability.test.ts:74:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:79:// G5.2 — internetReachable=true implies provider_used != local_only
src/__tests__/online-availability.test.ts:89:      provider_used: 'local_only',
src/__tests__/online-availability.test.ts:94:    const error = validateProviderDecisionMeta(meta);
src/__tests__/online-availability.test.ts:102:      provider_used: 'local_only',
src/__tests__/online-availability.test.ts:109:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:114:      provider_used: 'gemini',
src/__tests__/online-availability.test.ts:120:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:126:      provider_used: 'ollama',
src/__tests__/online-availability.test.ts:132:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:159:      provider_used: 'local_only',
src/__tests__/online-availability.test.ts:168:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:173:      provider_used: 'offline',
src/__tests__/online-availability.test.ts:180:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:192:      provider_used: 'gemini',
src/__tests__/online-availability.test.ts:197:    expect(meta.provider_used).not.toBe('local_only');
src/__tests__/online-availability.test.ts:204:      provider_used: 'local_only',
src/__tests__/online-availability.test.ts:212:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/online-availability.test.ts:219:      provider_used: 'offline',
src/__tests__/online-availability.test.ts:225:    expect(validateProviderDecisionMeta(meta)).toBeNull();
src/__tests__/hooks/useConversationEngine.test.ts:21:    provider_used: 'ollama',
src/__tests__/hooks/useConversationEngine.test.ts:28:    provider_used: 'ollama',
src/__tests__/hooks/useConversationEngine.test.ts:85:    expect(meta.provider_used).toBe('gemini');
src/__tests__/hooks/useConversationEngine.test.ts:99:    expect(meta.provider_used).toBe('ollama');
src-tauri/reports/g3_ipc/run_2.json:24:    "provider_used": "offline",
src-tauri/reports/g3_ipc/run_3.json:24:    "provider_used": "offline",
src-tauri/reports/g3_ipc/run_1.json:24:    "provider_used": "offline",
src/__tests__/provider-decision-invariants.test.ts:8: *   2. provider_used=local_only implies mode!=REMOTE
src/__tests__/provider-decision-invariants.test.ts:10: *   4. clampProviderDecisionMeta produces coherent state
src/__tests__/provider-decision-invariants.test.ts:16:  validateProviderDecisionMeta,
src/__tests__/provider-decision-invariants.test.ts:17:  clampProviderDecisionMeta,
src/__tests__/provider-decision-invariants.test.ts:19:import type { ProviderDecisionMeta } from '@/types/providerMeta';
src/__tests__/provider-decision-invariants.test.ts:21:const validRemoteMeta: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:22:  provider_used: 'gemini',
src/__tests__/provider-decision-invariants.test.ts:35:const validLocalMeta: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:36:  provider_used: 'local_only',
src/__tests__/provider-decision-invariants.test.ts:54:    const result = validateProviderDecisionMeta(validRemoteMeta);
src/__tests__/provider-decision-invariants.test.ts:59:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:63:    const result = validateProviderDecisionMeta(violating);
src/__tests__/provider-decision-invariants.test.ts:71:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:75:    const clamped = clampProviderDecisionMeta(violating);
src/__tests__/provider-decision-invariants.test.ts:87:    const result = validateProviderDecisionMeta(validLocalMeta);
src/__tests__/provider-decision-invariants.test.ts:92:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:96:    const result = validateProviderDecisionMeta(violating);
src/__tests__/provider-decision-invariants.test.ts:102:    const valid: ProviderDecisionMeta = { ...validLocalMeta, mode: 'LOCAL' };
src/__tests__/provider-decision-invariants.test.ts:103:    expect(validateProviderDecisionMeta(valid)).toBeNull();
src/__tests__/provider-decision-invariants.test.ts:107:    const valid: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:112:    expect(validateProviderDecisionMeta(valid)).toBeNull();
src/__tests__/provider-decision-invariants.test.ts:117:// Invariant 3: provider_used=local_only implies mode!=REMOTE
src/__tests__/provider-decision-invariants.test.ts:121:    const result = validateProviderDecisionMeta(validLocalMeta);
src/__tests__/provider-decision-invariants.test.ts:126:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:131:    const result = validateProviderDecisionMeta(violating);
src/__tests__/provider-decision-invariants.test.ts:138:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:143:    const clamped = clampProviderDecisionMeta(violating);
src/__tests__/provider-decision-invariants.test.ts:161:    expect(validateProviderDecisionMeta(validRemoteMeta)).toBeNull();
src/__tests__/provider-decision-invariants.test.ts:170:describe('clampProviderDecisionMeta — no-op on valid meta', () => {
src/__tests__/provider-decision-invariants.test.ts:172:    const clamped = clampProviderDecisionMeta(validRemoteMeta);
src/__tests__/provider-decision-invariants.test.ts:177:    const clamped = clampProviderDecisionMeta(validLocalMeta);
src/__tests__/provider-decision-invariants.test.ts:183:    const violating: ProviderDecisionMeta = {
src/__tests__/provider-decision-invariants.test.ts:187:    clampProviderDecisionMeta(violating);
src/__tests__/c5-observability.test.ts:48:      `fallback_used=false`;
src/__tests__/c5-observability.test.ts:178:    'fallback_used',
src/__tests__/c5-observability.test.ts:191:      `fallback_used=false`;
src/__tests__/c5-observability.test.ts:203:      `fallback_used=false`;
src/__tests__/c5-observability.test.ts:247:      { line: 'fallback_used=true', expected: 'true' },
src/__tests__/c5-observability.test.ts:248:      { line: 'fallback_used=false', expected: 'false' },
src/__tests__/c5-observability.test.ts:252:      const match = tc.line.match(/fallback_used=([^\s]+)/);
src/__tests__/e2e/ChatWorkflow.e2e.test.tsx:42:        provider_used: 'mock',
src/__tests__/e2e/ChatWorkflow.e2e.test.tsx:219:            provider_used: 'mock',
src-tauri/src/commands/ia_commands.rs:218:                "fallback_used": response.fallback_used,
src-tauri/tests/p3_provider_meta_gates.rs:11:    AIConfig, Mode, ProviderDecisionMeta, ProviderPreference, ReasonCode,
src-tauri/tests/p3_provider_meta_gates.rs:95:fn assert_meta(meta: &ProviderDecisionMeta) {
src-tauri/tests/p3_provider_meta_gates.rs:96:    assert!(!meta.provider_used.is_empty(), "provider_used empty");
src-tauri/tests/p3_provider_meta_gates.rs:254:            meta.provider_used.clone(),
src-tauri/tests/integration/agent_ia_workflow_test.rs:61:        fallback_used: false,
src-tauri/tests/integration/agent_ia_workflow_test.rs:198:                fallback_used: false,
src-tauri/tests/conversation_os_failure_simulations_test.rs:2:    Mode, ProviderAttemptMeta, ProviderClass, ProviderDecisionMeta, ReasonCode,
src-tauri/tests/conversation_os_failure_simulations_test.rs:23:    provider_used: &str,
src-tauri/tests/conversation_os_failure_simulations_test.rs:29:) -> ProviderDecisionMeta {
src-tauri/tests/conversation_os_failure_simulations_test.rs:30:    ProviderDecisionMeta {
src-tauri/tests/conversation_os_failure_simulations_test.rs:31:        provider_used: provider_used.to_string(),
src-tauri/tests/conversation_os_failure_simulations_test.rs:39:            provider_id: provider_used.to_string(),
src-tauri/tests/integration/fallback_chain_test.rs:101:            fallback_used: true, // ⭐ Fallback flag
src-tauri/tests/integration/fallback_chain_test.rs:120:            ctx.request_history[0].fallback_used,
src-tauri/tests/stress/metrics_stress_test.rs:43:            fallback_used: false,
src-tauri/tests/stress/metrics_stress_test.rs:176:            fallback_used: false,
src-tauri/tests/stress/concurrent_access_test.rs:38:                fallback_used: false,
src-tauri/tests/stress/concurrent_access_test.rs:156:                fallback_used: false,
src-tauri/src/omega/self_healing_hook.rs:189:    pub degraded_mode_active: bool,
src-tauri/src/omega/self_healing_hook.rs:439:                state.degraded_mode_active = true;
src-tauri/src/omega/self_healing_hook.rs:445:                state.degraded_mode_active = false;
src-tauri/src/omega/self_healing_hook.rs:518:            degraded_mode: state.degraded_mode_active,
src-tauri/src/omega/self_healing_hook.rs:766:    pub degraded_mode: bool,
src-tauri/src/commands/ia_context_commands.rs:325:            fallback_used: false,
src-tauri/src/singularity/ia_context.rs:128:    pub fallback_used: bool,
src-tauri/src/singularity/ia_context.rs:335:            fallback_used: false,
src-tauri/src/singularity/ia_context.rs:379:                fallback_used: false,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:484:+    pub degraded_mode: bool,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:494:+            degraded_mode: false,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:507:+    pub degraded_mode: bool,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:519:+            degraded_mode: false,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:598:+        if self.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:773:+        let degraded_mode =
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:780:+            degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:781:+            suggested_reasoning_depth: if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:812:+        let degraded_mode = self.saturation_state.degraded_mode;
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:814:+        let recommended_token_budget = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:821:+        let recommended_max_parallel_agents = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:830:+        } else if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:835:+        let recommended_invocation_interval_ms = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:842:+        if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:853:+        if !degraded_mode && self.predicted_load < 0.45 && sample.sources_consulted < 2 {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:856:+        if !degraded_mode && self.optimization_score > 0.8 {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:866:+            degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:877:+                + if self.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:4946:-fn ensure_provider_meta(metadata: &ConversationMetadata, latency_ms_total: u128) -> ProviderDecisionMeta {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:4950:+) -> ProviderDecisionMeta {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:4952:         if !meta.provider_used.is_empty() {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5000:-    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5002:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5003:+        provider_meta: ProviderDecisionMeta,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5777:+            provider_used: "system".to_string(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5846:                     provider_used: "unknown".to_string(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5955:     let (provider_used, provider_class, mode, network_used) = if network_available {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5978:         provider_used.clone(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6305:+            let effective_temperature = if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6403:+            &provider_used,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6420:+            "\n\n## ADAPTIVE_EXECUTION\nmode={}\npredicted_load={:.2}\nconfidence={:.2}\nstress={:.2}\nreasoning_depth={:.2}\ndegraded_mode={}\ninstruction={}",
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6426:+            adaptive_summary.saturation_state.degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6427:+            if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6442:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6473:+            pending_tasks: if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6488:+        if tag_count > 0 || provider_used.to_ascii_lowercase().contains("offline") {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6763:         let degraded_mode = matches!(ai_response.provider, crate::ai::AIProvider::Offline);
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6764:         log::info!("[INSTRUMENT] [RUST] responseCharCount: {} | responseShape: {} | clarificationTriggered: {} | degradedMode: {} | provider: {:?}", response_char_count, response_shape, clarification_triggered, degraded_mode, ai_response.provider);
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6800:             provider_used: provider_used.clone(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6802:-            fallback_used: false, // legacy pipeline = primary path, no fallback
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6803:+            fallback_used: false,       // legacy pipeline = primary path, no fallback
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6820:+            "\n\n## ADAPTIVE_EXECUTION\nmode={}\npredicted_load={:.2}\nconfidence={:.2}\nstress={:.2}\nreasoning_depth={:.2}\ndegraded_mode={}\nINSTRUCTION: {}",
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6826:+            adaptive_summary.saturation_state.degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6827:+            if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6878:+        let effective_temperature = if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6904:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6935:+            pending_tasks: if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6950:+        if tag_count > 0 || provider_used.eq_ignore_ascii_case("offline") {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:15998:     AIConfig, Mode, ProviderDecisionMeta, ProviderPreference, ReasonCode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:16051: fn assert_meta(meta: &ProviderDecisionMeta) {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:16052:     assert!(!meta.provider_used.is_empty(), "provider_used empty");
docs/api/OPENAPI_GUIDE_v27.0.0.md:191:  "provider_used": "ollama",
docs/api/OPENAPI_GUIDE_v27.0.0.md:216:    console.log('Provider:', response.provider_used);
src-tauri/src/api_hub/multimodal_router.rs:144:            providers_used: vec![response.provider_used],
src-tauri/src/api_hub/multimodal_router.rs:201:            providers_used.push(vision_response.provider_used);
src-tauri/src/api_hub/multimodal_router.rs:236:            providers_used.push(audio_response.provider_used);
src-tauri/src/api_hub/multimodal_router.rs:282:        providers_used.push(synthesis_response.provider_used);
src-tauri/src/api_hub/multimodal_router.rs:377:            providers_used.push(response.provider_used);
src-tauri/src/api_hub/mod.rs:130:    pub provider_used: Provider,
src-tauri/src/api_hub/mod.rs:314:            provider_used: decision.provider,
docs/api/openapi.v27.0.0.yaml:616:        provider_used:
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:210:+    pub degraded_mode: bool,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:220:+            degraded_mode: false,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:233:+    pub degraded_mode: bool,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:245:+            degraded_mode: false,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:324:+        if self.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:499:+        let degraded_mode =
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:506:+            degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:507:+            suggested_reasoning_depth: if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:538:+        let degraded_mode = self.saturation_state.degraded_mode;
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:540:+        let recommended_token_budget = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:547:+        let recommended_max_parallel_agents = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:556:+        } else if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:561:+        let recommended_invocation_interval_ms = if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:568:+        if degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:579:+        if !degraded_mode && self.predicted_load < 0.45 && sample.sources_consulted < 2 {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:582:+        if !degraded_mode && self.optimization_score > 0.8 {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:592:+            degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:603:+                + if self.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4672:-fn ensure_provider_meta(metadata: &ConversationMetadata, latency_ms_total: u128) -> ProviderDecisionMeta {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4676:+) -> ProviderDecisionMeta {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4678:         if !meta.provider_used.is_empty() {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4726:-    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4728:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4729:+        provider_meta: ProviderDecisionMeta,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5503:+            provider_used: "system".to_string(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5572:                     provider_used: "unknown".to_string(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5681:     let (provider_used, provider_class, mode, network_used) = if network_available {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5704:         provider_used.clone(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6031:+            let effective_temperature = if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6129:+            &provider_used,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6146:+            "\n\n## ADAPTIVE_EXECUTION\nmode={}\npredicted_load={:.2}\nconfidence={:.2}\nstress={:.2}\nreasoning_depth={:.2}\ndegraded_mode={}\ninstruction={}",
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6152:+            adaptive_summary.saturation_state.degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6153:+            if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6168:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6199:+            pending_tasks: if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6214:+        if tag_count > 0 || provider_used.to_ascii_lowercase().contains("offline") {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6489:         let degraded_mode = matches!(ai_response.provider, crate::ai::AIProvider::Offline);
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6490:         log::info!("[INSTRUMENT] [RUST] responseCharCount: {} | responseShape: {} | clarificationTriggered: {} | degradedMode: {} | provider: {:?}", response_char_count, response_shape, clarification_triggered, degraded_mode, ai_response.provider);
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6526:             provider_used: provider_used.clone(),
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6528:-            fallback_used: false, // legacy pipeline = primary path, no fallback
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6529:+            fallback_used: false,       // legacy pipeline = primary path, no fallback
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6546:+            "\n\n## ADAPTIVE_EXECUTION\nmode={}\npredicted_load={:.2}\nconfidence={:.2}\nstress={:.2}\nreasoning_depth={:.2}\ndegraded_mode={}\nINSTRUCTION: {}",
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6552:+            adaptive_summary.saturation_state.degraded_mode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6553:+            if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6604:+        let effective_temperature = if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6630:+        provider_used: &str,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6661:+            pending_tasks: if adaptive_summary.saturation_state.degraded_mode {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6676:+        if tag_count > 0 || provider_used.eq_ignore_ascii_case("offline") {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:15724:     AIConfig, Mode, ProviderDecisionMeta, ProviderPreference, ReasonCode,
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:15777: fn assert_meta(meta: &ProviderDecisionMeta) {
proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:15778:     assert!(!meta.provider_used.is_empty(), "provider_used empty");
docs/api/generate_endpoints_index.py:107:            'provider_used': 'String',
proof_packs/OLLAMA_FALLBACK_OFFLINE_TRUTH_2026-03-25_2048_b376fe900/05_PROVIDER_META_CHAIN.md:6:  "provider_used": "fallback",
proof_packs/OLLAMA_FALLBACK_OFFLINE_TRUTH_2026-03-25_2048_b376fe900/05_PROVIDER_META_CHAIN.md:18:  "provider_used": "titane-local",
docs/TITANE_OS/TITANE_OMEGA_PIPELINE.md:399:    pub provider_used: String,
src/hooks/useChat.ts:1945:        // Source of truth is finalResponse.metadata.provider_used (set by backend).
src/hooks/useChat.ts:1948:          (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
src-tauri/src/system/healing_executor.rs:52:    pub degraded_mode_active: bool,
src-tauri/src/system/healing_executor.rs:66:            degraded_mode_active: false,
src-tauri/src/system/healing_executor.rs:199:                state.degraded_mode_active = true;
src-tauri/src/system/healing_executor.rs:207:                state.degraded_mode_active = false;
src-tauri/src/system/healing_executor.rs:251:                state.degraded_mode_active = true;
src-tauri/src/system/healing_executor.rs:455:        assert!(state.degraded_mode_active);
src-tauri/src/conversation_engine/meta_accumulator.rs:1:use super::types::{Mode, ProviderAttemptMeta, ProviderClass, ProviderDecisionMeta, ReasonCode};
src-tauri/src/conversation_engine/meta_accumulator.rs:71:    provider_used: String,
src-tauri/src/conversation_engine/meta_accumulator.rs:80:) -> ProviderDecisionMeta {
src-tauri/src/conversation_engine/meta_accumulator.rs:81:    ProviderDecisionMeta {
src-tauri/src/conversation_engine/meta_accumulator.rs:82:        provider_used,
src-tauri/src/conversation_engine/meta_accumulator.rs:96:pub fn build_success_meta(provider_used: &str, latency_ms_total: u128) -> ProviderDecisionMeta {
src-tauri/src/conversation_engine/meta_accumulator.rs:97:    let provider_class = provider_class_from_id(provider_used);
src-tauri/src/conversation_engine/meta_accumulator.rs:101:    let mode = mode_from(provider_class.clone(), provider_used, reason_code.clone());
src-tauri/src/conversation_engine/meta_accumulator.rs:103:        provider_used.to_string(),
src-tauri/src/conversation_engine/meta_accumulator.rs:112:        provider_used.to_string(),
src-tauri/src/conversation_engine/meta_accumulator.rs:124:pub fn build_offline_meta(reason_code: ReasonCode, policy: &str) -> ProviderDecisionMeta {
src-tauri/src/conversation_engine/meta_accumulator.rs:125:    let provider_used = "offline".to_string();
src-tauri/src/conversation_engine/meta_accumulator.rs:129:        provider_used.clone(),
src-tauri/src/conversation_engine/meta_accumulator.rs:138:        provider_used,
src-tauri/src/conversation_engine/meta_accumulator.rs:150:pub fn build_timeout_meta(network_available: bool, timeout_ms: u64) -> ProviderDecisionMeta {
src-tauri/src/conversation_engine/meta_accumulator.rs:153:    let (provider_used, provider_class, mode, network_used) = if network_available {
src-tauri/src/conversation_engine/meta_accumulator.rs:163:        provider_used.clone(),
src-tauri/src/conversation_engine/meta_accumulator.rs:172:        provider_used,
src-tauri/src/conversation_engine/types.rs:76:    pub provider_used: String,
src-tauri/src/conversation_engine/types.rs:80:    pub fallback_used: bool,
src-tauri/src/conversation_engine/types.rs:468:    pub provider_used: String,
src-tauri/src/conversation_engine/types.rs:474:    pub provider_meta: Option<ProviderDecisionMeta>,
src-tauri/src/conversation_engine/types.rs:533:pub struct ProviderDecisionMeta {
src-tauri/src/conversation_engine/types.rs:534:    pub provider_used: String,
src-tauri/src/conversation_engine/types.rs:1190:            provider_used: "Gemini".to_string(),
src-tauri/src/conversation_engine/types.rs:1306:                provider_used: "Test".to_string(),
src-tauri/src/conversation_engine/commands.rs:845:                "provider_used": "none",
src-tauri/src/conversation_engine/commands.rs:879:                "provider_used": "none",
src-tauri/src/conversation_engine/commands.rs:1205:fn ensure_provider_meta(metadata: &ConversationMetadata, latency_ms_total: u128) -> ProviderDecisionMeta {
src-tauri/src/conversation_engine/commands.rs:1207:        if !meta.provider_used.is_empty() {
src-tauri/src/conversation_engine/commands.rs:1212:    let provider_used = if metadata.provider_used.is_empty() {
src-tauri/src/conversation_engine/commands.rs:1215:        metadata.provider_used.clone()
src-tauri/src/conversation_engine/commands.rs:1218:    let provider_class = provider_class_from_id(&provider_used);
src-tauri/src/conversation_engine/commands.rs:1220:    let mode = mode_from(provider_class.clone(), &provider_used, reason_code.clone());
src-tauri/src/conversation_engine/commands.rs:1224:        provider_used.clone(),
src-tauri/src/conversation_engine/commands.rs:1233:        provider_used,
src-tauri/src/conversation_engine/commands.rs:1251:    provider_meta: Option<&ProviderDecisionMeta>,
src-tauri/src/conversation_engine/commands.rs:1273:    provider_meta: Option<&ProviderDecisionMeta>,
src-tauri/src/conversation_engine/commands.rs:1335:            "provider_used": "none",
src-tauri/src/conversation_engine/commands.rs:1453:    provider_meta: Option<&ProviderDecisionMeta>,
src-tauri/src/conversation_engine/commands.rs:1520:            "provider_used": "none",
src-tauri/src/conversation_engine/commands.rs:1656:    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
src-tauri/src/conversation_engine/commands.rs:1667:                provider_used: provider_used.to_string(),
src-tauri/src/conversation_engine/commands.rs:1720:        assert!(meta.get("provider_used").is_some());
src-tauri/src/conversation_engine/commands.rs:1886:        assert_eq!(meta.provider_used, "offline");
src/hooks/useConversationEngine.ts:35:  ProviderDecisionMeta,
src/hooks/useConversationEngine.ts:86:): ProviderDecisionMeta {
src/hooks/useConversationEngine.ts:109:    provider_used: providerPreference ?? 'fallback',
src/hooks/useConversationEngine.ts:136:    providerMeta?: ProviderDecisionMeta;
src/hooks/useConversationEngine.ts:465:            provider: response.meta?.provider_used,
src/hooks/useConversationEngine.ts:479:                provider: response.meta?.provider_used,
src/hooks/useConversationEngine.ts:484:              provider: response.meta?.provider_used,
src/hooks/useConversationEngine.ts:515:          provider: response.metadata?.provider_used ?? 'unknown',
src-tauri/src/conversation_engine/omega_integration.rs:471:        let provider_used = format!("{} (OMEGA+Singularity)", real_provider_name);
src-tauri/src/conversation_engine/omega_integration.rs:474:            provider_used: provider_used.clone(),
src-tauri/src/conversation_engine/omega_integration.rs:479:            provider_meta: Some(build_success_meta(&provider_used, total_latency as u128)),
src-tauri/src/conversation_engine/mod.rs:236:                                "[CONV-TRACE] convert ok | elapsed={}ms | total={}ms | provider_used={}",
src-tauri/src/conversation_engine/mod.rs:239:                                response.metadata.provider_used
src-tauri/src/conversation_engine/mod.rs:290:                                    "[CONV-TRACE] legacy ok | elapsed={}ms | total={}ms | provider_used={}",
src-tauri/src/conversation_engine/mod.rs:293:                                    response.metadata.provider_used
src-tauri/src/conversation_engine/mod.rs:328:                            "[CONV-TRACE] legacy ok | elapsed={}ms | total={}ms | provider_used={}",
src-tauri/src/conversation_engine/mod.rs:331:                            response.metadata.provider_used
src-tauri/src/conversation_engine/mod.rs:365:                provider_used: "offline".to_string(),
src-tauri/src/conversation_engine/pipeline.rs:141:        let degraded_mode = matches!(ai_response.provider, crate::ai::AIProvider::Offline);
src-tauri/src/conversation_engine/pipeline.rs:142:        log::info!("[INSTRUMENT] [RUST] responseCharCount: {} | responseShape: {} | clarificationTriggered: {} | degradedMode: {} | provider: {:?}", response_char_count, response_shape, clarification_triggered, degraded_mode, ai_response.provider);
src-tauri/src/conversation_engine/pipeline.rs:275:        let provider_used = neutralized_response.provider.clone();
src-tauri/src/conversation_engine/pipeline.rs:284:            provider_used: provider_used.clone(),
src-tauri/src/conversation_engine/pipeline.rs:286:            fallback_used: false, // legacy pipeline = primary path, no fallback
src-tauri/src/conversation_engine/pipeline.rs:306:                provider_used: provider_used.clone(),
src-tauri/src/conversation_engine/pipeline.rs:311:                provider_meta: Some(build_success_meta(&provider_used, final_latency as u128)),
src-tauri/src/conversation_engine/memory.rs:34:    pub provider_used: String,
src-tauri/src/conversation_engine/memory.rs:139:            provider_used: provider.to_string(),
src-tauri/src/conversation_engine/memory.rs:232:                    provider_used: "unknown".to_string(),
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/10_LOG_EXCERPTS.md:58:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/10_LOG_EXCERPTS.md:79:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/10_LOG_EXCERPTS.md:85:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md:40:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md:46:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md:56:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md:61:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/11_TEST_RESULTS.md:67:[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/CHAT_IA_RUNTIME_REPAIR_2026-03-24_1651_028580016/07_GAP_MATRIX_CHAT_PROVIDER.md:11:| Garde faux-souvenir | unknown | RUNTIME_PROVEN | `FALSE_RECALL_VERDICT=NO_FALSE_MEMORY_BUT_UNPROVEN` + réponse `INCONNU` |
src-tauri/src/ia/unified_engine.rs:81:    pub fallback_used: bool,
src-tauri/src/ia/unified_engine.rs:169:                        fallback_used: is_fallback,
docs/PROVIDER_ORCHESTRATION_CONTRACT.md:22:- `provider_used` (string)
scripts/guard_ipc_provider_meta.cjs:67:    provider_used: meta.provider_used,
scripts/guard_ipc_provider_meta.cjs:75:    entry.provider_used === keys[0].provider_used &&
src/utils/quantumOrchestrator.ts:57:    fallback_used: boolean;
src/utils/quantumOrchestrator.ts:372:          fallback_used:
src/utils/quantumOrchestrator.ts:406:          fallback_used: false,
src/utils/tauriProtector.ts:592:            provider_used: 'fallback',
src/utils/tauriProtector.ts:646:          provider_used: 'fallback',
scripts/evals/run_challenger_eval.sh:134:# LOCK1: provider badge wired to meta.provider_used
scripts/evals/run_challenger_eval.sh:135:if grep -rn "provider_used\|providerUsed" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock"; then
scripts/evals/run_challenger_eval.sh:136:  score "lock1_provider" 1 "LOCK1: meta.provider_used reference present in src/"
scripts/evals/run_challenger_eval.sh:138:  score "lock1_provider" 0 "LOCK1 REGRESSION: provider_used not found in non-test src/"
scripts/evals/run_challenger_eval.sh:307:            "meta_provider_used_present":          sc("lock1_provider"),
scripts/evals/run_challenger_eval.sh:313:                "meta_provider_used_present",
proof_packs/POST_SEALED_ANTI_LIE_CANON_2026-03-28_1141_e88264039/03_ANTI_LIE_CONFLICTS.md:5:- Provider/mode truth: ALREADY_RESOLVED (contract sealed via ProviderDecisionMeta)
proof_packs/POST_SEALED_ANTI_LIE_CANON_2026-03-28_1141_e88264039/02_TRUTH_CHAIN_MAP.md:5:| Provider truth | Backend ProviderDecisionMeta.provider_used/mode/network_used/fallback_used | conversationEngine.ts, useChat.ts | MessageBubble provider badge | None proven | LOW | CANONICAL | Keep UI tied to backend meta |
proof_packs/POST_SEALED_ANTI_LIE_CANON_2026-03-28_1141_e88264039/02_TRUTH_CHAIN_MAP.md:7:| Mode truth | ProviderDecisionMeta.mode | conversationEngine.ts, useChat.ts | Mode indicators (if present) | Requested vs effective risk | MED | PARTIAL | Show effective mode only when from backend meta |
proof_packs/POST_SEALED_ANTI_LIE_CANON_2026-03-28_1141_e88264039/01_BOOTSTRAP.md:14:- rg -n "provider_used|provider_requested|fallback_used|degraded_mode|memory used|memory injected|mode effective|mode requested|mode shown|healed|improved|learned|promotion|anti-lie" src src-tauri docs proof_packs .clinerules scripts
docs/backup_20251218_122540/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
proof_packs/TERMINAL_CONVERGENCE_REFINER_2026-03-27_0747_e88264039/01_SYSTEM_MATURITY_STATUS.md:9:| Runtime truth contract | MATURE | TRUTH_CONTRACT_SEALER verdict = CONTRACT_SEALED. Provider label truth correctly implemented. Backend emits canonical ProviderDecisionMeta. Frontend correctly normalizes and propagates. |
docs/93_conversation/CHAT_MEM_PROOFS.md:227:  `fallback_used=${fallbackUsed}`
docs/93_conversation/CHAT_MEM_PATCH_PLAN.md:595:  `fallback_used=${fallbackUsed}`
docs/93_conversation/CHAT_MEM_PATCH_PLAN.md:641:      `fallback_used=false`;
docs/93_conversation/CHAT_MEM_PATCH_PLAN.md:654:      fallback_used: false,
docs/93_conversation/CHAT_MEM_TEST_RESULTS.md:337:            fallback_used=false
docs/93_conversation/CHAT_MEM_TEST_RESULTS.md:352:            fallback_used=false
src/ui/pages/SelfHealingDashboard.tsx:34:  degraded_mode_active: boolean;
src/ui/pages/SelfHealingDashboard.tsx:84:  degraded_mode_active: false,
src/ui/pages/SelfHealingDashboard.tsx:436:              className={`state-item ${healingState.degraded_mode_active ? 'active' : ''}`}
proof_packs/OMEGA_AUTO_ORCHESTRATION_LOCK1_2026-03-26_1257_b376fe900/00_PROOF_PACK.md:134:| G_FALLBACK_HONEST | PARTIAL | fallback_used in TraceMeta; full chain not E2E instrumented |
docs/93_conversation/CHAT_MEM_DISCOVERY.md:309:    pub provider_used: String,
docs/93_conversation/CHAT_MEM_DISCOVERY.md:310:    pub fallback_used: bool,
docs/93_conversation/CHAT_MEM_DISCOVERY.md:498:            fallback_used=false
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:7:The backend emits canonical `ProviderDecisionMeta` via `ensure_provider_meta()`:
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:10:fn ensure_provider_meta(metadata: &ConversationMetadata, latency_ms_total: u128) -> ProviderDecisionMeta {
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:12:        if !meta.provider_used.is_empty() {
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:17:    let provider_used = if metadata.provider_used.is_empty() {
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:20:        metadata.provider_used.clone()
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:23:    let provider_class = provider_class_from_id(&provider_used);
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:25:    let mode = mode_from(provider_class.clone(), &provider_used, reason_code.clone());
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:29:        provider_used.clone(),
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:38:        provider_used,
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:52:- Backend always produces a valid `ProviderDecisionMeta`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:53:- `provider_used` is always a non-empty string
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:54:- `provider_class` is correctly derived from `provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:20:### 4. Backend → ProviderDecisionMeta
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:23:- `provider_used`: actual provider used
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:33:- Extracts `raw.provider` → `normalizedMetadata.provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:39:- Extracts `backendMeta.provider_used` → `actualProviderUsed`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:55:- Backend → Frontend: `provider_used` (snake_case) correctly mapped to `providerUsed` (camelCase)
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:5:### Field: provider_used
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:6:- **Source of Truth**: Backend `ProviderDecisionMeta.provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:8:- **Consumer**: `conversationEngine.ts` → `normalizedMetadata.provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:14:- **Source of Truth**: Backend `ProviderDecisionMeta.provider_class`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:22:- **Source of Truth**: Backend `ProviderDecisionMeta.mode`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:30:- **Source of Truth**: Backend `ProviderDecisionMeta.reason_code`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:38:- **Source of Truth**: Backend `ProviderDecisionMeta.network_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:45:### Field: fallback_used
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:48:- **Consumer**: `conversationEngine.ts` → `omega_trace_meta.fallback_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:55:- **Producer**: `useChat.ts` → extracted from `backendMeta.provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:71:2. `provider_used === 'local_only'` → `mode !== 'REMOTE'`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:4:Backend `ProviderDecisionMeta` → Frontend `ConversationResponse.meta` → Hook `metadataPatch.providerUsed` → UI `metadata.providerUsed`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:12:  provider_used:
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:16:    (typeof metadata['provider_used'] === 'string'
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:17:      ? metadata['provider_used']
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:30:  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:56:- Backend truth (`provider_used`) correctly propagated to frontend
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:9:- Invariant 2: provider_used=local_only → mode≠REMOTE
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:16:- validateProviderDecisionMeta() correctly validates invariants
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:17:- clampProviderDecisionMeta() correctly corrects violations
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:23:- RP1: meta.provider_used used as truth when differs from legacy provider
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:24:- RP2: ollama propagated as actual provider when meta.provider_used=ollama
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:26:- RP4: preferred=ollama but backend used gemini → metadata.provider_used=gemini
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/16_FINAL_VERDICT.md:13:Provider Label Truth Contract (provider_used → providerUsed)
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/16_FINAL_VERDICT.md:39:- Backend emits canonical `ProviderDecisionMeta`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:10:1. **Backend emits correct meta**: `commands.rs` → `ensure_provider_meta()` produces canonical `ProviderDecisionMeta`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:11:2. **Frontend propagates correctly**: `conversationEngine.ts` → `normalizedMetadata.provider_used` correctly mapped
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:14:5. **Invariants codés**: `providerDecisionMeta.ts` → validates mode/network_used/provider_used consistency
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:26:- Verifies `providerUsed` matches backend `provider_used`
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/05_PRIMARY_RUPTURE_POINT.md:23:  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/05_PRIMARY_RUPTURE_POINT.md:32:- If backend returns meta with `provider_used`, that value is used
src/services/api/chat.test.ts:47:// Proves: backend meta.provider_used → ChatResponse.provider → metadata.provider_used
src/services/api/chat.test.ts:58:   * Backend returns meta.provider_used="gemini" with top-level provider="ollama" (legacy field).
src/services/api/chat.test.ts:61:  it('RP1: uses meta.provider_used as truth when it differs from legacy provider field', async () => {
src/services/api/chat.test.ts:68:      // REAL truth: meta.provider_used = gemini
src/services/api/chat.test.ts:70:        provider_used: 'gemini',
src/services/api/chat.test.ts:87:    // metadata.provider_used must also carry the truth
src/services/api/chat.test.ts:88:    expect((response.metadata as Record<string, unknown>).provider_used).toBe('gemini');
src/services/api/chat.test.ts:96:      )?.provider_used
src/services/api/chat.test.ts:102:   * Backend returns meta.provider_used="ollama" with no legacy provider field.
src/services/api/chat.test.ts:105:  it('RP2: propagates ollama as actual provider when meta.provider_used=ollama', async () => {
src/services/api/chat.test.ts:113:        provider_used: 'ollama',
src/services/api/chat.test.ts:127:    expect((response.metadata as Record<string, unknown>).provider_used).toBe('ollama');
src/services/api/chat.test.ts:150:    expect((response.metadata as Record<string, unknown>).provider_used).toBe(
src/services/api/chat.test.ts:162:   * Proves metadata.provider_used carries the real provider for badge display.
src/services/api/chat.test.ts:164:  it('RP4: CRITICAL — preferred=ollama but backend used gemini → metadata.provider_used=gemini', async () => {
src/services/api/chat.test.ts:172:        provider_used: 'gemini', // actual truth
src/services/api/chat.test.ts:191:    expect((response.metadata as Record<string, unknown>).provider_used).toBe('gemini');
docs/backup_20251218_122526/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
src/services/api/chat.ts:572:        // LOCK1-REPAIR: provider truth source = backendResponse.meta.provider_used
src/services/api/chat.ts:574:        // backendResponse.meta contains the real ProviderDecisionMeta from the backend
src/services/api/chat.ts:577:          (typeof metaObj?.provider_used === 'string' && metaObj.provider_used) ||
src/services/api/chat.ts:597:            provider_used: actualProvider,
src/services/conversationEngine.ts:20:  ProviderDecisionMeta,
src/services/conversationEngine.ts:131:  meta?: ProviderDecisionMeta;
src/services/conversationEngine.ts:139:  provider_used: string;
src/services/conversationEngine.ts:156:  provider_used: string;
src/services/conversationEngine.ts:157:  fallback_used: boolean;
src/services/conversationEngine.ts:169:  meta?: ProviderDecisionMeta;
src/services/conversationEngine.ts:173:function normalizeProviderMeta(raw: unknown): ProviderDecisionMeta | undefined {
src/services/conversationEngine.ts:178:  return raw as ProviderDecisionMeta;
src/services/conversationEngine.ts:184:): ProviderDecisionMeta {
src/services/conversationEngine.ts:242:  const provider_used =
src/services/conversationEngine.ts:243:    (typeof metadata['provider_used'] === 'string' && metadata['provider_used']) ||
src/services/conversationEngine.ts:265:    provider_used,
src/services/conversationEngine.ts:331:    provider_used: typeof m.provider_used === 'string' ? m.provider_used : 'fallback',
src/services/conversationEngine.ts:478:        provider_used: 'e2e-mock',
src/services/conversationEngine.ts:620:    provider_requested: provider,
src/services/conversationEngine.ts:692:          provider_used: orchestratorProvider,
src/services/conversationEngine.ts:696:          fallback_used: true,
src/services/conversationEngine.ts:778:          provider_used: orchestratorProvider,
src/services/conversationEngine.ts:782:          fallback_used: true,
src/services/conversationEngine.ts:854:    provider_used:
src/services/conversationEngine.ts:858:      (typeof metadata['provider_used'] === 'string'
src/services/conversationEngine.ts:859:        ? metadata['provider_used']
src/services/conversationEngine.ts:911:      provider_used: normalizedMetadata.provider_used,
src/services/conversationEngine.ts:912:      fallback_used: Boolean(metadata['fallback_used']),
src/services/conversationEngine.ts:920:    provider: response.metadata?.provider_used,
src/services/conversationEngine.ts:928:      provider_used: providerMeta.provider_used,
docs/architecture/CHAT_POLICY_BASELINE.md:75:- provider_used = 'fallback' si metadata manquante (conversationEngine.ts:242)
docs/architecture/SELF_HEALING_OVERVIEW.md:121:    pub degraded_mode_active: bool,
docs/backup_20251218_122526/DOCUMENTATION_EVOLUTION_REPORT.md:1119:   - **Healing States:** safe_mode_active, circuit_breaker_active, degraded_mode_active, isolated_engines
src/services/ai/orchestrator.ts:1186:            `[AI_SUMMARY] request_id=${requestId} latency_total=${totalResponseTime} latency_router=${routerLatencyMs} latency_provider=${providerLatency} attempt_count=${attempts} final_provider=${providerName} fallback_used=${fallbackUsed} error_code=none`
src/services/ai/orchestrator.ts:1290:        `[AI_SUMMARY] request_id=${requestId} latency_total=${responseTime} latency_router=${routerLatencyMs} latency_provider=${lastProviderLatencyMs} attempt_count=${attempts} final_provider=${finalProviderUsed ?? 'none'} fallback_used=true error_code=${lastError?.message || 'unknown'}`
src/services/ai/orchestrator.ts:1366:        `[AI_SUMMARY] request_id=${requestId} latency_total=${responseTime} latency_router=${routerLatencyMs} latency_provider=${lastProviderLatencyMs} attempt_count=${0} final_provider=${finalProviderUsed ?? 'none'} fallback_used=true error_code=${criticalError instanceof Error ? criticalError.message : String(criticalError)}`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:392:docs/PROVIDER_ORCHESTRATION_CONTRACT.md:22:- `provider_used` (string)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:393:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:7:The backend emits canonical `ProviderDecisionMeta` via `ensure_provider_meta()`:
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:394:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:12:        if !meta.provider_used.is_empty() {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:395:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:17:    let provider_used = if metadata.provider_used.is_empty() {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:396:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:20:        metadata.provider_used.clone()
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:397:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:23:    let provider_class = provider_class_from_id(&provider_used);
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:398:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:25:    let mode = mode_from(provider_class.clone(), &provider_used, reason_code.clone());
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:399:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:29:        provider_used.clone(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:400:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:38:        provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:401:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:53:- `provider_used` is always a non-empty string
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:402:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/08_BACKEND_TRUTH_PROOF.md:54:- `provider_class` is correctly derived from `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:405:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:23:- `provider_used`: actual provider used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:406:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:33:- Extracts `raw.provider` → `normalizedMetadata.provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:407:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:39:- Extracts `backendMeta.provider_used` → `actualProviderUsed`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:408:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/03_TRACE_META_CHAIN_MAP.md:55:- Backend → Frontend: `provider_used` (snake_case) correctly mapped to `providerUsed` (camelCase)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:410:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:5:### Field: provider_used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:411:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:6:- **Source of Truth**: Backend `ProviderDecisionMeta.provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:412:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:8:- **Consumer**: `conversationEngine.ts` → `normalizedMetadata.provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:413:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:55:- **Producer**: `useChat.ts` → extracted from `backendMeta.provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:414:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/02_CANONICAL_TRUTH_CONTRACT.md:71:2. `provider_used === 'local_only'` → `mode !== 'REMOTE'`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:417:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:12:  provider_used:
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:418:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:16:    (typeof metadata['provider_used'] === 'string'
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:419:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:17:      ? metadata['provider_used']
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:420:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:30:  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:421:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/09_TRACE_PROPAGATION_PROOF.md:56:- Backend truth (`provider_used`) correctly propagated to frontend
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:423:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:9:- Invariant 2: provider_used=local_only → mode≠REMOTE
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:424:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:23:- RP1: meta.provider_used used as truth when differs from legacy provider
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:425:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:24:- RP2: ollama propagated as actual provider when meta.provider_used=ollama
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:426:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/11_ANTI_LIE_RESULTS.md:26:- RP4: preferred=ollama but backend used gemini → metadata.provider_used=gemini
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:427:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/16_FINAL_VERDICT.md:13:Provider Label Truth Contract (provider_used → providerUsed)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:430:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/16_FINAL_VERDICT.md:39:- Backend emits canonical `ProviderDecisionMeta`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:431:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:10:1. **Backend emits correct meta**: `commands.rs` → `ensure_provider_meta()` produces canonical `ProviderDecisionMeta`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:432:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:11:2. **Frontend propagates correctly**: `conversationEngine.ts` → `normalizedMetadata.provider_used` correctly mapped
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:433:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:14:5. **Invariants codés**: `providerDecisionMeta.ts` → validates mode/network_used/provider_used consistency
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:435:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/06_PATCH_DECISION.md:26:- Verifies `providerUsed` matches backend `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:436:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/05_PRIMARY_RUPTURE_POINT.md:23:  (typeof backendMeta?.provider_used === 'string' && backendMeta.provider_used) ||
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:437:proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/05_PRIMARY_RUPTURE_POINT.md:32:- If backend returns meta with `provider_used`, that value is used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:483:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:4952:         if !meta.provider_used.is_empty() {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:484:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5000:-    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:485:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5002:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:489:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5777:+            provider_used: "system".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:490:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5846:                     provider_used: "unknown".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:491:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5955:     let (provider_used, provider_class, mode, network_used) = if network_available {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:492:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:5978:         provider_used.clone(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:494:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6403:+            &provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:495:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6442:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:496:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6488:+        if tag_count > 0 || provider_used.to_ascii_lowercase().contains("offline") {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:497:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6800:             provider_used: provider_used.clone(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:498:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6904:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:499:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:6950:+        if tag_count > 0 || provider_used.eq_ignore_ascii_case("offline") {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:500:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/raw_diff_main.txt:16052:     assert!(!meta.provider_used.is_empty(), "provider_used empty");
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:581:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4678:         if !meta.provider_used.is_empty() {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:582:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4726:-    fn sample_response(provider_used: &str, provider_meta: ProviderDecisionMeta) -> ConversationResponse {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:583:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:4728:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:587:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5503:+            provider_used: "system".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:588:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5572:                     provider_used: "unknown".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:589:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5681:     let (provider_used, provider_class, mode, network_used) = if network_available {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:590:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:5704:         provider_used.clone(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:592:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6129:+            &provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:593:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6168:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:594:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6214:+        if tag_count > 0 || provider_used.to_ascii_lowercase().contains("offline") {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:595:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6526:             provider_used: provider_used.clone(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:596:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6630:+        provider_used: &str,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:597:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:6676:+        if tag_count > 0 || provider_used.eq_ignore_ascii_case("offline") {
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:598:proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff:15778:     assert!(!meta.provider_used.is_empty(), "provider_used empty");
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:618:docs/api/OPENAPI_GUIDE_v27.0.0.md:191:  "provider_used": "ollama",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:619:docs/api/OPENAPI_GUIDE_v27.0.0.md:216:    console.log('Provider:', response.provider_used);
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:620:proof_packs/OLLAMA_FALLBACK_OFFLINE_TRUTH_2026-03-25_2048_b376fe900/05_PROVIDER_META_CHAIN.md:6:  "provider_used": "fallback",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:621:proof_packs/OLLAMA_FALLBACK_OFFLINE_TRUTH_2026-03-25_2048_b376fe900/05_PROVIDER_META_CHAIN.md:18:  "provider_used": "titane-local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:625:docs/api/openapi.v27.0.0.yaml:616:        provider_used:
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:633:docs/api/generate_endpoints_index.py:107:            'provider_used': 'String',
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:657:docs/TITANE_OS/TITANE_OMEGA_PIPELINE.md:399:    pub provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:683:docs/93_conversation/CHAT_MEM_DISCOVERY.md:309:    pub provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:715:scripts/evals/run_challenger_eval.sh:134:# LOCK1: provider badge wired to meta.provider_used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:716:scripts/evals/run_challenger_eval.sh:135:if grep -rn "provider_used\|providerUsed" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -qv "test\|spec\|mock"; then
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:717:scripts/evals/run_challenger_eval.sh:136:  score "lock1_provider" 1 "LOCK1: meta.provider_used reference present in src/"
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:718:scripts/evals/run_challenger_eval.sh:138:  score "lock1_provider" 0 "LOCK1 REGRESSION: provider_used not found in non-test src/"
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:723:scripts/evals/run_challenger_eval.sh:307:            "meta_provider_used_present":          sc("lock1_provider"),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:724:scripts/evals/run_challenger_eval.sh:313:                "meta_provider_used_present",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:806:docs/backup_20251218_122540/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:878:scripts/guard_ipc_provider_meta.cjs:67:    provider_used: meta.provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:879:scripts/guard_ipc_provider_meta.cjs:75:    entry.provider_used === keys[0].provider_used &&
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:906:proof_packs/TERMINAL_CONVERGENCE_REFINER_2026-03-27_0747_e88264039/01_SYSTEM_MATURITY_STATUS.md:9:| Runtime truth contract | MATURE | TRUTH_CONTRACT_SEALER verdict = CONTRACT_SEALED. Provider label truth correctly implemented. Backend emits canonical ProviderDecisionMeta. Frontend correctly normalizes and propagates. |
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:925:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/17_FINAL_VERDICT.md:41:- Provider correctly tracked via `provider_used` in meta
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:926:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/04_CRITICAL_CHAIN_MAP.md:34:**Role**: Returns `meta` with `provider_used`, `reason_code`, `mode`, `memoryRecallIds`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:927:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/04_CRITICAL_CHAIN_MAP.md:52:- Provider correctly tracked via `provider_used` in meta
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:931:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:26:- **Visible Label**: `provider_used: 'local'` in meta
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:932:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:43:- **Visible Label**: `provider_used` in meta shows actual provider
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:937:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/06_PATCH_DECISION.md:15:6. **Provider correctly tracked**: `provider_used` in meta shows actual provider
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:941:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:20:      provider_used: orchestratorProvider,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:942:proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:40:- Provider correctly tracked via `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1042:docs/backup_20251218_122526/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1114:docs/archive/v25/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1115:docs/00_core/README__scripts_tools_ipc_README.md.md:31:- JSONL summary (provider_used, mode, latency_ms, network_used)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1127:docs/governance/ROUTING_POLICY_CANON_v1.md:33:- `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1128:docs/governance/ROUTING_POLICY_CANON_v1.md:65:2. `provider_used=local_only` must not be surfaced as `REMOTE`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1141:docs/governance/ROUTING_TRACE_CONTRACT_v1.md:15:2. `chatService.sendMessage()` reads truth from `meta.provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1142:docs/governance/ROUTING_TRACE_CONTRACT_v1.md:17:4. `response.metadata.provider_used` preserves the same truth for downstream UI consumers
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1143:docs/governance/ROUTING_TRACE_CONTRACT_v1.md:30:- `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1144:docs/governance/ROUTING_TRACE_CONTRACT_v1.md:48:2. `provider_used=local_only` must not be surfaced as `REMOTE`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1145:docs/governance/ROUTING_TRACE_CONTRACT_v1.md:50:4. backend `meta.provider_used` outranks legacy provider fields for UI truth
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1173:docs/PROVIDER_REASON_CODES.md:46:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1208:docs/TERMINOLOGY_ALIGNMENT_FINAL.md:61:**Définition :** Invariants impossibles à violer entre `mode`, `network_used`, `provider_used`, `reason_code` :
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1209:docs/TERMINOLOGY_ALIGNMENT_FINAL.md:63:- `provider_used === "local_only" ⟹ mode !== "REMOTE"`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1250:docs/backup_20251218_123316/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1296:docs/architecture/CHAT_POLICY_BASELINE.md:75:- provider_used = 'fallback' si metadata manquante (conversationEngine.ts:242)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1359:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:14:- 6abe58bac — LOCK1: wire meta.provider_used → ChatResponse.metadata.provider_used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1360:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:18:[INVARIANT-1] meta.provider_used from backend response is the authoritative truth source.
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1361:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:19:When backendResponse.meta.provider_used is present, it MUST override any other field.
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1362:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:21:[INVARIANT-2] UI provider badge MUST display metadata.provider_used, not the preferred/requested provider.
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1363:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:25:[INVARIANT-4] Preferred=X but backend used Y → ChatResponse.metadata.provider_used=Y (not X).
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1364:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:28:- src/services/api/chat.ts — normalizeResponse reads meta.provider_used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1365:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:31:[INVARIANT-1] meta.provider_used is authoritative truth
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1366:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:32:- CASE RP1: `uses meta.provider_used as truth when it differs from legacy provider field` ✅
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1367:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:33:- CASE RP2: `propagates ollama as actual provider when meta.provider_used=ollama` ✅
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1368:docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:37:- CASE RP4: `CRITICAL — preferred=ollama but backend used gemini → metadata.provider_used=gemini` ✅
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1434:docs/99_ARCHIVE/implementations/OMEGA_SINGULARITY_INTEGRATION_COMPLETE.md:409:                provider_used: "OMEGA+Singularity".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1453:docs/01_misc/SECTION_1_AUDIT_VERITE.md:206:**Note critique**: La mention "provider_used: timeout-degraded" dans le prompt **ne peut pas être vérifiée** sans:
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1454:docs/01_misc/SECTION_1_AUDIT_VERITE.md:307:   - `mode / reason / provider_used` (metadata)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1459:docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:58:**Objective**: Implement and lock ProviderDecisionMeta canonical type in Rust.
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1460:docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:62:- All fields typed per contract (provider_used: String, mode: ProviderMode enum, etc.)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1461:docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:167:   - Signature fields: (provider_used, provider_class, mode, reason_code)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1465:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:20:    pub provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1466:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:58:Local    → provider_used in {"ollama", "offline"}
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1467:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:59:Remote   → provider_used in {"unified_ia", "gemini", "anthropic"}
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1468:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:111:**Statement**: When `OFFLINE_SIM=1` env var is set, repeated invocations with identical input produce identical meta signatures (provider_used, provider_class, mode, reason_code).  
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1469:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:168:      ✅ → Return + meta { provider_used="unified_ia", mode=Remote, network_used=true }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1470:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:173:      ✅ → Return + meta { provider_used="gemini", mode=Remote, network_used=true }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1471:docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:177:      ✅ → Return + meta { provider_used="ollama", mode=Local, network_used=false }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1479:docs/01_misc/PATCH.md:65:            provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1491:docs/01_misc/11_DETERMINISM.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1492:docs/01_misc/11_DETERMINISM.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1493:docs/01_misc/11_DETERMINISM.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1495:docs/01_misc/P3_CONTRACT_REFERENCE.md:20:    pub provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1496:docs/01_misc/P3_CONTRACT_REFERENCE.md:58:Local    → provider_used in {"ollama", "offline"}
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1497:docs/01_misc/P3_CONTRACT_REFERENCE.md:59:Remote   → provider_used in {"unified_ia", "gemini", "anthropic"}
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1498:docs/01_misc/P3_CONTRACT_REFERENCE.md:111:**Statement**: When `OFFLINE_SIM=1` env var is set, repeated invocations with identical input produce identical meta signatures (provider_used, provider_class, mode, reason_code).  
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1499:docs/01_misc/P3_CONTRACT_REFERENCE.md:168:      ✅ → Return + meta { provider_used="unified_ia", mode=Remote, network_used=true }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1500:docs/01_misc/P3_CONTRACT_REFERENCE.md:173:      ✅ → Return + meta { provider_used="gemini", mode=Remote, network_used=true }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1501:docs/01_misc/P3_CONTRACT_REFERENCE.md:177:      ✅ → Return + meta { provider_used="ollama", mode=Local, network_used=false }
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1508:docs/01_misc/10_DETERMINISM.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1509:docs/01_misc/10_DETERMINISM.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1510:docs/01_misc/10_DETERMINISM.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1517:docs/01_misc/RAPPORT_FINAL_SEAL.md:58:**Objective**: Implement and lock ProviderDecisionMeta canonical type in Rust.
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1518:docs/01_misc/RAPPORT_FINAL_SEAL.md:62:- All fields typed per contract (provider_used: String, mode: ProviderMode enum, etc.)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1519:docs/01_misc/RAPPORT_FINAL_SEAL.md:167:   - Signature fields: (provider_used, provider_class, mode, reason_code)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1525:docs/01_misc/03_META_UI_BEHAVIOR.md:17:	- provider_used
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1526:docs/01_misc/03_META_UI_BEHAVIOR.md:27:	"provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1527:docs/01_misc/07_DETERMINISM.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1528:docs/01_misc/07_DETERMINISM.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1529:docs/01_misc/07_DETERMINISM.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1537:docs/01_misc/SECTION_3_4_5_CHANGES.md:49:            "provider_used": "none",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1538:docs/01_misc/SECTION_3_4_5_CHANGES.md:279:- Response meta: `provider_used: "gemini"` (ou autre)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1546:docs/01_misc/10_GATES_SUMMARY.md:161:    provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1556:docs/01_misc/DEBUG_CHAT_IA_PHASE2_v26.4.1.md:90:  provider: raw.metadata?.provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1566:docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:108:                   provider_used: "unknown".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1567:docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:200:   - provider_used: "unknown"
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1568:docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:214:     "provider_used": "gpt-4",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1570:docs/01_misc/SECTION_2_DIAGNOSTIC_CAUSAL.md:216:      provider_used: 'local_only',
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1572:docs/01_misc/P4_VALIDATION.md:61:src-tauri/src/conversation_engine/meta_accumulator.rs:115: let provider_used = "offline".to_string();
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1573:docs/01_misc/P4_VALIDATION.md:62:src-tauri/src/conversation_engine/meta_accumulator.rs:141: let provider_used = "offline".to_string();
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1574:docs/01_misc/P4_VALIDATION.md:75:src-tauri/src/conversation_engine/mod.rs:252: provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1575:docs/01_misc/P4_VALIDATION.md:78:src-tauri/src/conversation_engine/mod.rs:280: provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1580:docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_v19.5.2_COMPLETE.txt:314:     - provider_used: "unknown"
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1581:docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:199:  ✅ provider_used: String (tracking)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1582:docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:532:       "provider_used": "gpt-4",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1584:docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:195:   - ✅ provider_used: String (gpt-4, claude, gemini, ollama, local)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1585:docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:228:     "provider_used": "gpt-4",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1599:docs/01_misc/FINAL_CERT_SUMMARY.md:76:| `test_p3_determinism_signature_x3` | Signature equality across runs (provider_used, mode, reason_code) | 3 runs | ✅ PASS | avg 0.31s |
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1601:docs/01_misc/FINAL_CERT_SUMMARY.md:98:  provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1602:docs/01_misc/FINAL_CERT_SUMMARY.md:125:- `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1603:docs/01_misc/FINAL_CERT_SUMMARY.md:179:1. ✅ P3 Provider Orchestration schema (ProviderDecisionMeta) is canonical in Ring 1
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1605:docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:76:| `test_p3_determinism_signature_x3` | Signature equality across runs (provider_used, mode, reason_code) | 3 runs | ✅ PASS | avg 0.31s |
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1607:docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:98:  provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1608:docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:125:- `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1609:docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:179:1. ✅ P3 Provider Orchestration schema (ProviderDecisionMeta) is canonical in Ring 1
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1621:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1622:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1623:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1630:docs/01_misc/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md:178:    provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1631:docs/01_misc/12_DETERMINISM.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1632:docs/01_misc/12_DETERMINISM.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1633:docs/01_misc/12_DETERMINISM.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1635:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:8:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1636:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:13:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1637:docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:18:    "provider_used": "local",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1644:docs/01_misc/08_TIMEOUT_BREAKER_PROOF.md:69:            provider_used: "offline".to_string(),
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1665:docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_QUICK_START.md:92:          <p>Provider: {lastResponse.metadata.provider_used}</p>
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1666:docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_QUICK_START.md:191:    provider_used: string;             // Gemini/Ollama
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1674:docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:103:    "provider_used": "gpt-4",
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1675:docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:310:    "provider_used": entry.metadata.provider_used,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1676:docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_v∞_RAPPORT_COMPLET.md:120:    pub provider_used: String,
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1686:docs/01_misc/PROOF_PACK_LINKS.md:79:- `latency_capture_demo.log` — Sample meta output (provider_used, latency_ms_total, etc.)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/01_BOOTSTRAP.md:1688:docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:79:- `latency_capture_demo.log` — Sample meta output (provider_used, latency_ms_total, etc.)
proof_packs/POST_SEALED_AUTHORITY_MATRIX_CANON_2026-03-28_1105_e88264039/02_AUTHORITY_MAP.md:34:- Competing: UI or docs claiming provider_used without proof
src/services/ia/ia.types.ts:72:  fallback_used: boolean;
src/services/chat/chatMemorySingleDoor.ts:8:import type { ProviderDecisionMeta } from '@/types/providerMeta';
src/services/chat/chatMemorySingleDoor.ts:94:  lastProviderMeta?: ProviderDecisionMeta;
src/services/chat/chatMemorySingleDoor.ts:267:    `provider_requested=${envelope.memorySingleDoor.providerRequested}`,
src/services/chat/chatMemorySingleDoor.ts:343:      lastProviderUsed: input.lastProviderMeta?.provider_used,
src/types/providerMeta.ts:35:export interface ProviderDecisionMeta {
src/types/providerMeta.ts:36:  provider_used: string;
src/types/index.ts:25:  ProviderDecisionMeta as ConversationOsProviderDecisionMeta,
src/types/conversation_os.ts:85:export interface ProviderDecisionMeta {
src/types/conversation_os.ts:160:  provider_meta: ProviderDecisionMeta;
src/types/providerDecisionMeta.ts:2: * TITANE∞ — Truth Contract: ProviderDecisionMeta invariants + guards
src/types/providerDecisionMeta.ts:8: *   2. provider_used === 'local_only'  =>  mode !== 'REMOTE'
src/types/providerDecisionMeta.ts:11:import type { ProviderDecisionMeta, Mode, ReasonCode } from './providerMeta';
src/types/providerDecisionMeta.ts:14: * Vérifie si un ProviderDecisionMeta respecte tous les invariants du Truth Contract.
src/types/providerDecisionMeta.ts:17:export function validateProviderDecisionMeta(meta: ProviderDecisionMeta): string | null {
src/types/providerDecisionMeta.ts:21:    return `NO_LYING_VIOLATION: mode=REMOTE requires network_used=true (provider=${meta.provider_used})`;
src/types/providerDecisionMeta.ts:24:  // Invariant 2: provider_used === 'local_only' => mode !== 'REMOTE'
src/types/providerDecisionMeta.ts:25:  if (meta.provider_used === 'local_only' && meta.mode === 'REMOTE') {
src/types/providerDecisionMeta.ts:26:    return `NO_LYING_VIOLATION: provider_used=local_only cannot have mode=REMOTE`;
src/types/providerDecisionMeta.ts:33: * Clamp un ProviderDecisionMeta vers un état cohérent si une violation est détectée.
src/types/providerDecisionMeta.ts:36:export function clampProviderDecisionMeta(
src/types/providerDecisionMeta.ts:37:  meta: ProviderDecisionMeta
src/types/providerDecisionMeta.ts:38:): ProviderDecisionMeta {
src/types/providerDecisionMeta.ts:39:  const violation = validateProviderDecisionMeta(meta);
src/types/providerDecisionMeta.ts:48:    !meta.network_used || meta.provider_used === 'local_only' ? 'LOCAL' : meta.mode;
docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:332:**Scope:** Ring 4 only. IPC response extended to include ProviderDecisionMeta as `meta`.  
docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md:423:3. `P3_CONTRACT_REFERENCE.md` — Canonical contract reference (ProviderDecisionMeta schema, AIRouter cascade, IPC contract)
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:13:- 0dd11f69e — LOCK1: display actual provider from ProviderDecisionMeta
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:14:- 6abe58bac — LOCK1: wire meta.provider_used → ChatResponse.metadata.provider_used
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:18:[INVARIANT-1] meta.provider_used from backend response is the authoritative truth source.
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:19:When backendResponse.meta.provider_used is present, it MUST override any other field.
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:21:[INVARIANT-2] UI provider badge MUST display metadata.provider_used, not the preferred/requested provider.
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:25:[INVARIANT-4] Preferred=X but backend used Y → ChatResponse.metadata.provider_used=Y (not X).
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/BASELINE.md:28:- src/services/api/chat.ts — normalizeResponse reads meta.provider_used
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:31:[INVARIANT-1] meta.provider_used is authoritative truth
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:32:- CASE RP1: `uses meta.provider_used as truth when it differs from legacy provider field` ✅
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:33:- CASE RP2: `propagates ollama as actual provider when meta.provider_used=ollama` ✅
docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_20260320_115049/STRUCTURAL_RUNS_SUMMARY.md:37:- CASE RP4: `CRITICAL — preferred=ollama but backend used gemini → metadata.provider_used=gemini` ✅
docs/00_core/README__scripts_tools_ipc_README.md.md:31:- JSONL summary (provider_used, mode, latency_ms, network_used)
src/services/conversationEngine.test.ts:37:    expect(response.metadata.provider_used).toBe('fallback');
src/services/conversationEngine.test.ts:54:          provider_used: 'local',
src/services/conversationEngine.test.ts:65:    expect(response.metadata.provider_used).toBe('local');
docs/governance/UI_RUNTIME_TRUTH_SPEC.md:16:| Provider truth | Backend ProviderDecisionMeta (provider_used, mode, network_used, fallback_used) | conversationEngine.ts, useChat.ts | MessageBubble provider badge | CANONICAL |
docs/governance/UI_RUNTIME_TRUTH_SPEC.md:18:| Mode truth | Backend ProviderDecisionMeta.mode | conversationEngine.ts, useChat.ts | UI mode indicators (if any) | PARTIAL |
docs/governance/UI_RUNTIME_TRUTH_SPEC.md:22:- Provider truth: `ProviderDecisionMeta` from backend; UI must show provider_used, not requested.
docs/governance/UI_RUNTIME_TRUTH_SPEC.md:24:- Mode truth: backend mode from ProviderDecisionMeta; requested mode is not effective mode.
docs/governance/UI_RUNTIME_TRUTH_SPEC.md:28:- provider_used and derived mode from canonical backend meta.
docs/governance/SHELL_MINCE_DECISION.md:47:- Backend canonical meta (ProviderDecisionMeta) surfaced via approved providers/hooks.
docs/governance/ROUTING_POLICY_CANON_v1.md:33:- `provider_used`
docs/governance/ROUTING_POLICY_CANON_v1.md:65:2. `provider_used=local_only` must not be surfaced as `REMOTE`
docs/governance/AUTHORITY_MATRIX.md:45:- Competing surfaces: UI or docs claiming provider_used without proof
docs/archive/v25/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
docs/governance/ROUTING_TRACE_CONTRACT_v1.md:15:2. `chatService.sendMessage()` reads truth from `meta.provider_used`
docs/governance/ROUTING_TRACE_CONTRACT_v1.md:17:4. `response.metadata.provider_used` preserves the same truth for downstream UI consumers
docs/governance/ROUTING_TRACE_CONTRACT_v1.md:30:- `provider_used`
docs/governance/ROUTING_TRACE_CONTRACT_v1.md:48:2. `provider_used=local_only` must not be surfaced as `REMOTE`
docs/governance/ROUTING_TRACE_CONTRACT_v1.md:50:4. backend `meta.provider_used` outranks legacy provider fields for UI truth
docs/PROVIDER_REASON_CODES.md:46:    "provider_used": "local",
docs/backup_20251218_123316/PLAN_TESTS_CONVERSATION_v25.3.0.md:70:- ✅ Metadata provider_used correcte
docs/TERMINOLOGY_ALIGNMENT_FINAL.md:61:**Définition :** Invariants impossibles à violer entre `mode`, `network_used`, `provider_used`, `reason_code` :
docs/TERMINOLOGY_ALIGNMENT_FINAL.md:63:- `provider_used === "local_only" ⟹ mode !== "REMOTE"`
src/components/sections/__tests__/ConversationSection.test.ts:30:        provider_used: 'Ollama (OMEGA+Singularity)',
src/components/sections/__tests__/ConversationSection.test.ts:61:        provider_used: 'Ollama (OMEGA+Singularity)',
docs/05_modules/backend/SELF_HEALING_ENGINE.md:540:        assert!(executor.state.degraded_mode_active);
src/components/sections/ConversationSection.tsx:43:import type { ProviderDecisionMeta, ReasonCode } from '@/types/providerMeta';
src/components/sections/ConversationSection.tsx:75:    providerMeta?: ProviderDecisionMeta;
src/components/sections/ConversationSection.tsx:85:  providerMeta?: ProviderDecisionMeta;
src/components/sections/ConversationSection.tsx:173:  const provider = latestAssistantRuntime.providerMeta?.provider_used ?? 'unknown';
src/components/sections/ConversationSection.tsx:213:    providerMeta?.provider_used &&
src/components/sections/ConversationSection.tsx:214:    requestedProviderLabel !== providerMeta.provider_used
src/components/sections/ConversationSection.tsx:217:    providerMeta?.provider_used,
src/components/sections/ConversationSection.tsx:250:  providerMeta?: ProviderDecisionMeta,
src/components/sections/ConversationSection.tsx:274:    providerMeta?.provider_used?.toLowerCase().includes('omega')
src/components/sections/ConversationSection.tsx:643:): ProviderDecisionMeta {
src/components/sections/ConversationSection.tsx:657:    provider_used: 'web_research',
src/components/sections/ConversationSection.tsx:691:function formatRuntimeThinkingSummary(meta: ProviderDecisionMeta): string {
src/components/sections/ConversationSection.tsx:705:    `provider=${meta.provider_used}`,
src/components/sections/ConversationSection.tsx:742:    const providerLabel = providerMeta?.provider_used;
src/components/sections/ConversationSection.tsx:1238:        latestAssistantProviderMeta?.provider_used ?? null
src/components/sections/ConversationSection.tsx:1240:    [latestAssistantProviderMeta?.provider_used, selectedProvider]
src/components/sections/ConversationSection.tsx:1275:      id: `provider-${latestAssistantProviderMeta.provider_used}`,
src/components/sections/ConversationSection.tsx:1276:      label: `provider:${latestAssistantProviderMeta.provider_used}`,
src/components/sections/ConversationSection.tsx:1537:              provider_used: 'web_research',
src/components/sections/ConversationSection.tsx:1569:        `provider=${response?.meta?.provider_used ?? 'unknown'};reason=${response?.meta?.reason_code ?? 'UNKNOWN'}`
src/components/sections/ConversationSection.tsx:1978:              latestAssistantRuntime.providerMeta?.provider_used ?? 'unknown'
docs/01_misc/TITANE_ABSOLUTE_FIXLOG.md:234:   - fallback_used flag accurate ✓
docs/01_misc/TITANE_ABSOLUTE_FIXLOG.md:384:  `fallback_used=${fallback}`,
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/17_FINAL_VERDICT.md:41:- Provider correctly tracked via `provider_used` in meta
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/04_CRITICAL_CHAIN_MAP.md:34:**Role**: Returns `meta` with `provider_used`, `reason_code`, `mode`, `memoryRecallIds`
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/04_CRITICAL_CHAIN_MAP.md:52:- Provider correctly tracked via `provider_used` in meta
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/10_VISIBLE_LABEL_TRUTH_PROOF.md:9:| Fallback indicator (fallback_used) | PROVEN_TRACE_ONLY | ✅ |
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:9:- **Visible Label**: `fallback_used: true` in metadata
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:18:- **Visible Label**: `fallback_used: true` in metadata
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:26:- **Visible Label**: `provider_used: 'local'` in meta
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/03_FALLBACK_POLICY_MAP.md:43:- **Visible Label**: `provider_used` in meta shows actual provider
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/06_PATCH_DECISION.md:14:5. **Fallback correctly handled**: orchestrator fallback with `fallback_used: true`
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/06_PATCH_DECISION.md:15:6. **Provider correctly tracked**: `provider_used` in meta shows actual provider
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:20:      provider_used: orchestratorProvider,
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:23:      fallback_used: true,
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:39:- `fallback_used: true` set in metadata
proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/09_FALLBACK_TRUTH_PROOF.md:40:- Provider correctly tracked via `provider_used`
proof_packs/POST_SEALED_AUTHORITY_MATRIX_VERIFY_2026-03-28_1108_e88264039/01_BOOTSTRAP.md:19:- rg -n "authority|source of truth|canon|canonical|single source|anti-lie|provider_used|memory used|mode affiché|mode réellement" docs proof_packs .clinerules scripts README.md docs/README.md
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:5:- MEMORY_PROOF_VERDICT: HONEST_OFFLINE_DEGRADED
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:6:- FALSE_RECALL_VERDICT: NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:10:- MEMORY_PROOF_VERDICT: HONEST_OFFLINE_DEGRADED
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:11:- FALSE_RECALL_VERDICT: NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:15:- MEMORY_PROOF_VERDICT: HONEST_OFFLINE_DEGRADED
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/08_X3_RUNS.md:16:- FALSE_RECALL_VERDICT: NO_FALSE_MEMORY_BUT_UNPROVEN
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/00_EXEC_SUMMARY.md:5:- All three runs reported `MEMORY_PROOF_VERDICT=HONEST_OFFLINE_DEGRADED`; false-recall guard passed.
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/05_BREAKPOINT_ANALYSIS.md:6:- MEMORY_PROOF_VERDICT = HONEST_OFFLINE_DEGRADED (runs 1/2/3)
proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/12_VERDICT.md:6:- All runs returned HONEST_OFFLINE_DEGRADED.
docs/01_misc/TITANE_FINAL_STATUS_v27.0.0.md:208:memory_inject_tokens=45 provider_ms=1200 final_provider=gemini fallback_used=false
docs/01_misc/TITANE_FINAL_STATUS_v27.0.0.md:223:- All 9 metrics present: request_id, latency_total, memory_load_ms, memory_compact_ms, memory_inject_chars, memory_inject_tokens, provider_ms, final_provider, fallback_used
docs/99_ARCHIVE/merged/PHASE_9_TESTS_E2E_STRESS_v19.3.0_COMPLETE.md:158:- ✅ `fallback_used = true`
docs/01_misc/SECTION_1_AUDIT_VERITE.md:206:**Note critique**: La mention "provider_used: timeout-degraded" dans le prompt **ne peut pas être vérifiée** sans:
docs/01_misc/SECTION_1_AUDIT_VERITE.md:307:   - `mode / reason / provider_used` (metadata)
docs/99_ARCHIVE/implementations/OMEGA_SINGULARITY_INTEGRATION_COMPLETE.md:409:                provider_used: "OMEGA+Singularity".to_string(),
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:49:- Established meta schema placeholder (ProviderDecisionMeta, awaiting Ring 1 lock in P3-2)
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:58:**Objective**: Implement and lock ProviderDecisionMeta canonical type in Rust.
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:61:- Defined `ProviderDecisionMeta` struct in `src-tauri/src/types.rs`
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:62:- All fields typed per contract (provider_used: String, mode: ProviderMode enum, etc.)
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:73:**Objective**: Hook ProviderDecisionMeta accumulation into AIRouter (Ring 3—Service layer).
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:88:**Objective**: Expose ProviderDecisionMeta through Tauri IPC endpoint (Ring 4—Modules/UI).
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:92:- Updated response schema to include `metadata: ProviderDecisionMeta`
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:103:**Objective**: Bind ProviderDecisionMeta to React components (Ring 4—UI).
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:167:   - Signature fields: (provider_used, provider_class, mode, reason_code)
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:317:| **1** | Types (ProviderDecisionMeta) | Yes | Locked post-P3-2; no changes in P3-6 | ✅ |
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:326:- ✅ **INV-1**: Meta presence (165+ messages, all with valid ProviderDecisionMeta)
docs/01_misc/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md:391:> TITANE∞ Provider Orchestration (P3) is certified for production deployment, subject to explicit authorization tokens. All proof packs are complete, sealed, and archived. ProviderDecisionMeta schema is locked (Ring 1), instrumentation validated (Ring 3), IPC exposure verified (Ring 4), and determinism confirmed (3 independent runs, signature equality). No unauthorized network reach detected. All invariants met. Stop-the-line incident (P3-6 initial Vite launch) was successfully resolved via engine-only test harness; evidence preserved for audit. 
docs/01_misc/C7_RELEASE_SEALING.md:51:- [x] All metrics included (request_id, latency_total, memory_*, provider_*, fallback_used)
docs/01_misc/PATCH.md:65:            provider_used: "offline".to_string(),
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:9:## Core Contract: ProviderDecisionMeta
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:18:pub struct ProviderDecisionMeta {
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:20:    pub provider_used: String,
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:58:Local    → provider_used in {"ollama", "offline"}
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:59:Remote   → provider_used in {"unified_ia", "gemini", "anthropic"}
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:97:**Statement**: Every ConversationResponse must contain a valid ProviderDecisionMeta.  
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:111:**Statement**: When `OFFLINE_SIM=1` env var is set, repeated invocations with identical input produce identical meta signatures (provider_used, provider_class, mode, reason_code).  
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:168:      ✅ → Return + meta { provider_used="unified_ia", mode=Remote, network_used=true }
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:173:      ✅ → Return + meta { provider_used="gemini", mode=Remote, network_used=true }
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:177:      ✅ → Return + meta { provider_used="ollama", mode=Local, network_used=false }
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:214:    metadata: ProviderDecisionMeta
docs/01_misc/P3_CONTRACT_REFERENCE__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_P3_CONTRACT_REFERENCE.md.md:221:- If `ok=true`, then `content.metadata` is always valid ProviderDecisionMeta
docs/99_ARCHIVE/merged/GPT_CLAUDE_FINAL_SUMMARY_v∞.md:254:console.log(response.data.fallback_used); // false
docs/99_ARCHIVE/sessions/README_v1.0.0.md:55:    fallback_used: false,
docs/01_misc/11_DETERMINISM.md:8:    "provider_used": "local",
docs/01_misc/11_DETERMINISM.md:13:    "provider_used": "local",
docs/01_misc/11_DETERMINISM.md:18:    "provider_used": "local",
docs/99_ARCHIVE/merged/PHASE_8_COMPLETION_REPORT_v19.3.0_FINAL.md:235:    // 7. Vérifier fallback_used: true
docs/01_misc/P3_CONTRACT_REFERENCE.md:9:## Core Contract: ProviderDecisionMeta
docs/01_misc/P3_CONTRACT_REFERENCE.md:18:pub struct ProviderDecisionMeta {
docs/01_misc/P3_CONTRACT_REFERENCE.md:20:    pub provider_used: String,
docs/01_misc/P3_CONTRACT_REFERENCE.md:58:Local    → provider_used in {"ollama", "offline"}
docs/01_misc/P3_CONTRACT_REFERENCE.md:59:Remote   → provider_used in {"unified_ia", "gemini", "anthropic"}
docs/01_misc/P3_CONTRACT_REFERENCE.md:97:**Statement**: Every ConversationResponse must contain a valid ProviderDecisionMeta.  
docs/01_misc/P3_CONTRACT_REFERENCE.md:111:**Statement**: When `OFFLINE_SIM=1` env var is set, repeated invocations with identical input produce identical meta signatures (provider_used, provider_class, mode, reason_code).  
docs/01_misc/P3_CONTRACT_REFERENCE.md:168:      ✅ → Return + meta { provider_used="unified_ia", mode=Remote, network_used=true }
docs/01_misc/P3_CONTRACT_REFERENCE.md:173:      ✅ → Return + meta { provider_used="gemini", mode=Remote, network_used=true }
docs/01_misc/P3_CONTRACT_REFERENCE.md:177:      ✅ → Return + meta { provider_used="ollama", mode=Local, network_used=false }
docs/01_misc/P3_CONTRACT_REFERENCE.md:214:    metadata: ProviderDecisionMeta
docs/01_misc/P3_CONTRACT_REFERENCE.md:221:- If `ok=true`, then `content.metadata` is always valid ProviderDecisionMeta
docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_QUICK_START.md:92:          <p>Provider: {lastResponse.metadata.provider_used}</p>
docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_QUICK_START.md:191:    provider_used: string;             // Gemini/Ollama
docs/01_misc/10_DETERMINISM.md:8:    "provider_used": "local",
docs/01_misc/10_DETERMINISM.md:13:    "provider_used": "local",
docs/01_misc/10_DETERMINISM.md:18:    "provider_used": "local",
docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:75://   fallback_used: false
docs/99_ARCHIVE/sessions/GPT_CLAUDE_TESTING_GUIDE_v∞.md:100://   fallback_used: false
docs/01_misc/RAPPORT_FINAL_SEAL.md:49:- Established meta schema placeholder (ProviderDecisionMeta, awaiting Ring 1 lock in P3-2)
docs/01_misc/RAPPORT_FINAL_SEAL.md:58:**Objective**: Implement and lock ProviderDecisionMeta canonical type in Rust.
docs/01_misc/RAPPORT_FINAL_SEAL.md:61:- Defined `ProviderDecisionMeta` struct in `src-tauri/src/types.rs`
docs/01_misc/RAPPORT_FINAL_SEAL.md:62:- All fields typed per contract (provider_used: String, mode: ProviderMode enum, etc.)
docs/01_misc/RAPPORT_FINAL_SEAL.md:73:**Objective**: Hook ProviderDecisionMeta accumulation into AIRouter (Ring 3—Service layer).
docs/01_misc/RAPPORT_FINAL_SEAL.md:88:**Objective**: Expose ProviderDecisionMeta through Tauri IPC endpoint (Ring 4—Modules/UI).
docs/01_misc/RAPPORT_FINAL_SEAL.md:92:- Updated response schema to include `metadata: ProviderDecisionMeta`
docs/01_misc/RAPPORT_FINAL_SEAL.md:103:**Objective**: Bind ProviderDecisionMeta to React components (Ring 4—UI).
docs/01_misc/RAPPORT_FINAL_SEAL.md:167:   - Signature fields: (provider_used, provider_class, mode, reason_code)
docs/01_misc/RAPPORT_FINAL_SEAL.md:317:| **1** | Types (ProviderDecisionMeta) | Yes | Locked post-P3-2; no changes in P3-6 | ✅ |
docs/01_misc/RAPPORT_FINAL_SEAL.md:326:- ✅ **INV-1**: Meta presence (165+ messages, all with valid ProviderDecisionMeta)
docs/01_misc/RAPPORT_FINAL_SEAL.md:391:> TITANE∞ Provider Orchestration (P3) is certified for production deployment, subject to explicit authorization tokens. All proof packs are complete, sealed, and archived. ProviderDecisionMeta schema is locked (Ring 1), instrumentation validated (Ring 3), IPC exposure verified (Ring 4), and determinism confirmed (3 independent runs, signature equality). No unauthorized network reach detected. All invariants met. Stop-the-line incident (P3-6 initial Vite launch) was successfully resolved via engine-only test harness; evidence preserved for audit. 
docs/01_misc/TITANE_GLOBAL_PROOFS.md:218:memory_inject_tokens=45 provider_ms=1200 final_provider=gemini fallback_used=false
docs/01_misc/TITANE_GLOBAL_PROOFS.md:254:9. fallback_used=${boolean}
docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:103:    "provider_used": "gpt-4",
docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_v19.5.2.md:310:    "provider_used": entry.metadata.provider_used,
docs/01_misc/TITANE_GLOBAL_PATCH_PLAN.md:240:    `fallback_used=${response.provider === 'fallback'}`;
docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:695:    pub fallback_used: bool,
docs/99_ARCHIVE/sessions/GPT_CLAUDE_INTEGRATION_ARCHITECTURE_v∞.md:768:                        fallback_used: is_fallback,
docs/01_misc/TITANE_GLOBAL_DISCOVERY.md:114:- All 9 metrics: request_id, latency_total, memory_load_ms, memory_compact_ms, memory_inject_chars, memory_inject_tokens, provider_ms, final_provider, fallback_used
docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:108:                   provider_used: "unknown".to_string(),
docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:200:   - provider_used: "unknown"
docs/99_ARCHIVE/legacy_reports/MEMORY_PERSISTENCE_FIX_v19.5.2.txt:214:     "provider_used": "gpt-4",
docs/01_misc/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md:294:**Scope:** Ring 4 only. IPC response extended to include ProviderDecisionMeta as `meta`.  
docs/01_misc/03_META_UI_BEHAVIOR.md:17:	- provider_used
docs/01_misc/03_META_UI_BEHAVIOR.md:27:	"provider_used": "local",
docs/01_misc/SECTION_3_4_5_CHANGES.md:49:            "provider_used": "none",
docs/01_misc/SECTION_3_4_5_CHANGES.md:279:- Response meta: `provider_used: "gemini"` (ou autre)
docs/01_misc/07_DETERMINISM.md:8:    "provider_used": "local",
docs/01_misc/07_DETERMINISM.md:13:    "provider_used": "local",
docs/01_misc/07_DETERMINISM.md:18:    "provider_used": "local",
docs/01_misc/00_TYPES_DEFINED.md:10:  - ProviderDecisionMeta
docs/01_misc/00_TYPES_DEFINED.md:19:  - ProviderDecisionMeta
docs/99_ARCHIVE/sessions/CONVERSATION_ENGINE_v∞_RAPPORT_COMPLET.md:120:    pub provider_used: String,
docs/01_misc/LOCK.md:91:| P3-2 (Types) | ~50 KB | ProviderDecisionMeta struct, serialization |
docs/01_misc/LOCK.md:106:| P3_CONTRACT_REFERENCE.md | Canonical ProviderDecisionMeta + AIRouter cascade + IPC contract |
docs/01_misc/10_GATES_SUMMARY.md:161:    provider_used: "offline".to_string(),
docs/01_misc/DEBUG_CHAT_IA_PHASE2_v26.4.1.md:90:  provider: raw.metadata?.provider_used,
docs/01_misc/SECTION_2_DIAGNOSTIC_CAUSAL.md:216:      provider_used: 'local_only',
docs/01_misc/SECTION_2_DIAGNOSTIC_CAUSAL.md:329:ProviderDecisionMeta {
docs/01_misc/TITANE_ABSOLUTE_ASSURANCE_REPORT.md:227:fallback_used=false
docs/01_misc/P4_VALIDATION.md:60:src-tauri/src/conversation_engine/meta_accumulator.rs:114:pub fn build_offline_meta(reason_code: ReasonCode, policy: &str) -> ProviderDecisionMeta {
docs/01_misc/P4_VALIDATION.md:61:src-tauri/src/conversation_engine/meta_accumulator.rs:115: let provider_used = "offline".to_string();
docs/01_misc/P4_VALIDATION.md:62:src-tauri/src/conversation_engine/meta_accumulator.rs:141: let provider_used = "offline".to_string();
docs/01_misc/P4_VALIDATION.md:75:src-tauri/src/conversation_engine/mod.rs:252: provider_used: "offline".to_string(),
docs/01_misc/P4_VALIDATION.md:78:src-tauri/src/conversation_engine/mod.rs:280: provider_used: "offline".to_string(),
docs/01_misc/FINAL_CERT_SUMMARY.md:14:1. **ProviderDecisionMeta schema** is always present in ConversationResponse across all provider paths
docs/01_misc/FINAL_CERT_SUMMARY.md:35:- **Tests**: ProviderDecisionMeta Rust struct, schema serialization, enum coverage  
docs/01_misc/FINAL_CERT_SUMMARY.md:76:| `test_p3_determinism_signature_x3` | Signature equality across runs (provider_used, mode, reason_code) | 3 runs | ✅ PASS | avg 0.31s |
docs/01_misc/FINAL_CERT_SUMMARY.md:92:## ProviderDecisionMeta Schema Validation
docs/01_misc/FINAL_CERT_SUMMARY.md:97:ProviderDecisionMeta {
docs/01_misc/FINAL_CERT_SUMMARY.md:98:  provider_used: String,
docs/01_misc/FINAL_CERT_SUMMARY.md:125:- `provider_used`
docs/01_misc/FINAL_CERT_SUMMARY.md:179:1. ✅ P3 Provider Orchestration schema (ProviderDecisionMeta) is canonical in Ring 1
docs/99_ARCHIVE/versions/v19/PHASE_8_IA_CONTEXT_SINGULARITY_v19.3.0.md:114:    pub fallback_used: bool,
docs/99_ARCHIVE/versions/v19/PHASE_8_IA_CONTEXT_SINGULARITY_v19.3.0.md:360:        fallback_used: engine !== context.active_engine,
docs/99_ARCHIVE/versions/v19/PHASE_8_IA_CONTEXT_SINGULARITY_v19.3.0.md:509:      fallback_used: false,
docs/99_ARCHIVE/versions/v19/PHASE_8_IA_CONTEXT_SINGULARITY_v19.3.0.md:523:      fallback_used: false,
docs/99_ARCHIVE/versions/v19/PHASE_8_IA_CONTEXT_SINGULARITY_v19.3.0.md:636:      fallback_used: result.fallback_used,
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:14:1. **ProviderDecisionMeta schema** is always present in ConversationResponse across all provider paths
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:35:- **Tests**: ProviderDecisionMeta Rust struct, schema serialization, enum coverage  
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:76:| `test_p3_determinism_signature_x3` | Signature equality across runs (provider_used, mode, reason_code) | 3 runs | ✅ PASS | avg 0.31s |
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:92:## ProviderDecisionMeta Schema Validation
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:97:ProviderDecisionMeta {
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:98:  provider_used: String,
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:125:- `provider_used`
docs/01_misc/FINAL_CERT_SUMMARY__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_FINAL_CERT_SUMMARY.md.md:179:1. ✅ P3 Provider Orchestration schema (ProviderDecisionMeta) is canonical in Ring 1
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:106:        fallback_used: false,
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:214:            fallback_used: true, // ⭐ Fallback activé
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:223:        assert_eq!(ctx.request_history[0].fallback_used, true);
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:232:- ✅ Enregistrement fallback_used: true
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:272:            fallback_used: false,
docs/99_ARCHIVE/versions/v19/PHASE_8_TO_9_TRANSITION_v19.3.0.md:349:                fallback_used: false,
docs/01_misc/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md:178:    provider_used: "offline".to_string(),
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:8:    "provider_used": "local",
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:13:    "provider_used": "local",
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_6_GATES_NO_SERVER_20260216_165207_07_DETERMINISM.md.md:18:    "provider_used": "local",
docs/01_misc/12_DETERMINISM.md:8:    "provider_used": "local",
docs/01_misc/12_DETERMINISM.md:13:    "provider_used": "local",
docs/01_misc/12_DETERMINISM.md:18:    "provider_used": "local",
docs/01_misc/TITANE_ABSOLUTE_PROOFS.md:275:   - fallback_used (boolean)
docs/01_misc/TITANE_ABSOLUTE_TEST_RESULTS.md:241:✅ fallback_used flag accurate  
docs/01_misc/FINAL_VERDICT__deployment_latest_certification_p3_proof_packs_P3_4_IPC_EXPOSE_20260216_155157_FINAL_VERDICT.md.md:6:- IPC response includes meta with ProviderDecisionMeta
docs/99_ARCHIVE/versions/v19/PHASES_7_8_CONSOLIDATION_v19.3.0.md:279:    fallback_used: false,
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:8:    "provider_used": "local",
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:13:    "provider_used": "local",
docs/01_misc/07_DETERMINISM__deployment_latest_certification_p3_proof_packs_P3_5_UI_META_TAGS_20260216_160414_07_DETERMINISM.md.md:18:    "provider_used": "local",
docs/01_misc/08_TIMEOUT_BREAKER_PROOF.md:69:            provider_used: "offline".to_string(),
docs/01_misc/TITANE_GLOBAL_AUDIT.md:130:  memory_inject_tokens=45 provider_ms=1200 final_provider=gemini fallback_used=false
docs/01_misc/TITANE_GLOBAL_AUDIT.md:144:  - provider_ms, final_provider, fallback_used
docs/01_misc/01_CODE_CHANGES.md:5:Ring 4 only. IPC response extended to include ProviderDecisionMeta under `meta`.
docs/99_ARCHIVE/old_sessions/2025-12-10/SESSION_FINALE_v19.5.2_COMPLETE.txt:314:     - provider_used: "unknown"
docs/01_misc/00_DISCOVERY__deployment_latest_certification_p3_proof_packs_P3_4_IPC_EXPOSE_20260216_155157_00_DISCOVERY.md.md:6:- ProviderDecisionMeta exists in types.rs (P3-2)
docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:199:  ✅ provider_used: String (tracking)
docs/99_ARCHIVE/old_sessions/2025-12-10/AUDIT_COMPLET_APPROFONDI_v19.5.2.txt:532:       "provider_used": "gpt-4",
docs/01_misc/00_DISCOVERY.md:13:- `ReasonCode` and `ProviderDecisionMeta` types are present in `types.rs` (P3-2).
docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:195:   - ✅ provider_used: String (gpt-4, claude, gemini, ollama, local)
docs/99_ARCHIVE/old_sessions/2025-12-10/COMPREHENSIVE_TESTING_COMPLETE_v19.5.2.txt:228:     "provider_used": "gpt-4",
docs/01_misc/PROOF_PACK_LINKS.md:15:| **P3-2** | `P3_2_TYPES_20260216_152400` | 2026-02-16 15:24:00 | ProviderDecisionMeta struct, Ring 1 lock | ✅ PASS |
docs/01_misc/PROOF_PACK_LINKS.md:63:- `TYPES_CANON_SNAPSHOT.md` — ProviderDecisionMeta struct & serialization
docs/01_misc/PROOF_PACK_LINKS.md:68:**Key Lock**: ProviderDecisionMeta struct becomes immutable post-P3-2; no schema changes allowed without new P-level phase.
docs/01_misc/PROOF_PACK_LINKS.md:79:- `latency_capture_demo.log` — Sample meta output (provider_used, latency_ms_total, etc.)
docs/01_misc/PROOF_PACK_LINKS.md:83:- AIRouter modified to accumulate ProviderDecisionMeta on each provider attempt
docs/01_misc/PROOF_PACK_LINKS.md:95:- `meta_in_response_validation.txt` — Confirms ProviderDecisionMeta always in successful response
docs/01_misc/PROOF_PACK_LINKS.md:98:**Key Evidence**: conversation_generate IPC command successfully returns ProviderDecisionMeta in response meta field.
docs/01_misc/PROOF_PACK_LINKS.md:168:- All 165+ message attempts return valid ProviderDecisionMeta
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:15:| **P3-2** | `P3_2_TYPES_20260216_152400` | 2026-02-16 15:24:00 | ProviderDecisionMeta struct, Ring 1 lock | ✅ PASS |
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:63:- `TYPES_CANON_SNAPSHOT.md` — ProviderDecisionMeta struct & serialization
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:68:**Key Lock**: ProviderDecisionMeta struct becomes immutable post-P3-2; no schema changes allowed without new P-level phase.
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:79:- `latency_capture_demo.log` — Sample meta output (provider_used, latency_ms_total, etc.)
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:83:- AIRouter modified to accumulate ProviderDecisionMeta on each provider attempt
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:95:- `meta_in_response_validation.txt` — Confirms ProviderDecisionMeta always in successful response
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:98:**Key Evidence**: conversation_generate IPC command successfully returns ProviderDecisionMeta in response meta field.
docs/01_misc/PROOF_PACK_LINKS__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_PROOF_PACK_LINKS.md.md:168:- All 165+ message attempts return valid ProviderDecisionMeta
