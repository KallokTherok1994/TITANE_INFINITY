## Startup Audit v73
date: 2026-05-11T10:05:40-04:00

### git status --short
?? docs/ui/production/

### git status -sb
## MAIN...origin/MAIN [devant 1]
?? docs/ui/production/

### git rev-parse HEAD
69d416a5beb4fb26ba2ffed95d1d1867560c9efd

### git log --oneline -80
69d416a5b fix(ui): sync page inventory and deployment latest
761642f21 docs(release): RELEASE_SURFACE_INVENTORY — v33.0.15 snapshot appended (Rule 15)
9128eea9c build: v33.0.15 — E2E verified, release artifacts, checksums
a5854465e fix(e2e): zero deterministic failures — console.warn hook, viewport region, message restoration
3162cad0c fix(e2e): batch 4 - hash routing BrowserRouter incompatibility across 13 specs
63409321d fix(e2e): ai-verification focused-ops expectAny broadened for reformulation
d75465bf7 fix(e2e): dev-page-tabs static checks aligned to template literal pattern
0e0a82ba7 fix(e2e): correct relative browser.url in 7 more test files (batch 3)
600139727 fix(e2e): mic WebKitGTK guard, chat-mode-selector trigger fallback, T17/T18 panel toggle
51dce87b4 fix(e2e): correct URL format, testid mismatches, IPC command, and mic/checkbox guards
3e3088e78 build(release): v33.0.14 — BUILD ALL, bundles, deployment/latest, checksums, AutoHeal
5b32ccd72 docs(ui): seal v71 follow-up static-gates green verdict
8dc92afbe docs(ui): UI_DESKTOP_REMOTE_CI_GREEN_FINAL_CERTIFICATION_v71 — certify GitHub Actions green final release closure
b8ff1b79f fix(ci): patch v71 verify_instructions remote failure on vscode extensions source parity
7433a99f1 docs(ui): add v70 hard-repair certification with post-push CI pending verdict
7eebc018f fix(ci): UI_DESKTOP_CI_VERIFY_INSTRUCTIONS_HARD_REPAIR_v70 — wire preflight, expose subgate diagnostics, repair CI/local parity
61e197ecc docs(investigation): strategic post-v69 assessment with v70+ roadmap
4bde16d33 fix(ci): add CI environment diagnostic pre-flight for persistent validator failures
f215c318d docs(ui): UI_DESKTOP_FINAL_E2E_RELEASE_CLOSURE_v69 — transient remote CI recovered, finalize proof pack seal
7f57a4913 fix(ui): UI_DESKTOP_FINAL_E2E_RELEASE_CLOSURE_v69 — repair online-first CI, final UI proof pack, all surfaces audited, remote release closure
371d9b4c7 fix(ci): stabilize online-first gate matching for v69 remote finalization
38982d1c0 docs(ui): v68 post-push remote run status sync
fbf20a8a9 chore(ui): UI_DESKTOP_REMOTE_CI_PROOF_v68 — harden CI static gates, metadata drift, accepted-dirty baseline
cf77435ac chore(ui): UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67
5160e69df chore(ui): UI_DESKTOP_POST_SEAL_HYGIENE_v66 — proof pack consistency, pending audit, CI release readiness
df8dd4244 docs(ui): stabilize v65 sync metadata wording
000b5cfe0 docs(ui): finalize v65 certification remote metadata
2755cbb59 test(ui): UI_DESKTOP_V64_RUNTIME_RECONCILIATION_SEAL_v65 — execute v64 WDIO specs, fill artifact, replace pending gates with runtime proof
443cafdec test(ui): UI_DESKTOP_MAIN_MENU_RECONCILIATION_v64 — reconcile 8 menu surfaces, hidden routes, legacy redirects, proof pack seal
f73f493ab test(ui): UI_DESKTOP_TIER1_REAL_IPC_COMPLETION_v63 — research/cloud safe IPC status proof, 4/4 PROVEN, v33.0.13
ae4eaee07 test(ui): UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62 — safe E2E app-context IPC bridge, IPC_RESPONSE_PROVEN, v33.0.12
e7b5b6459 test(ui): UI_DESKTOP_TIER1_BLOCKER_REDUCTION_v61 — promote 4 Tier 1 blockers to DEGRADED/GUARDED_WITH_UI_PROOF
25f4b7b5d test(ui): UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60 — seal strict artifact, classify blockers, tier thresholds, CI readiness
95cd569d3 test(ui): TITANE_UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60 — strict artifact schema, tier thresholds, warning burn-down, CI readiness
e028eaed6 test(ui): UI_DESKTOP_IPC_RESPONSE_REFLECTION_v59 — prove IPC responses, UI reflection, proof-depth verifier, remote readiness
bd84043c5 test(ui): UI_DESKTOP_BACKEND_PROOF_DEPTH_v58 — certify backend proof depth, sandboxed flows, remote readiness
19be4f0cf test(ui): UI_DESKTOP_BACKEND_ACTIVATION_REDUCTION_v57 — reduce degraded states with safe frontend/backend proof
e9c40592f test(ui): UI_DESKTOP_FUNCTIONAL_SUITE_FINALIZATION_v56 — full functional desktop proof after Memory false-positive repair
298b1b542 fix(e2e): UI_DESKTOP_MEMORY_E2E_INIT_REPAIR_v55 — fix false-positive ErrorBoundary detection
46c0cde07 test(ui): UI_DESKTOP_FUNCTIONAL_MODULE_PROOF_v54 — prove safe frontend/backend flows module by module
d368f7957 test(ui): UI_DESKTOP_FULL_SUITE_FINALIZATION_v53 — 7/7 specs PASS 230 tests notFound=0
34b795eac test(ui): UI_DESKTOP_ROOT_CONTRACT_REPAIR_v52 — eliminate NOT_FOUND_UNEXPECTED root gaps, restore strict desktop route proof
3afa81f47 test(ui): UI_DESKTOP_FULL_RUN_AND_REPAIR_v51 — execute v50 desktop specs, repair 32 failures, classify all UI controls/actions, certify runtime
5d6c20aba feat(ui): UI_DESKTOP_FULL_COVERAGE_v50 — 29 routes/22 tabs/48 actions desktop suite
26ebe0194 feat(agent): UI_DESKTOP_AGENT_CHAT_UNIFICATION_v49 — agentUiContextBridge 15/15 PASS, browser E2E 13/13, desktop RUNNING
7c8956a43 test(ui): UI_BACKEND_RUNTIME_PROOF_EXECUTION_v48 — browser E2E 13/13 PASS, route/badge/action proof matrices, blockers, certification
20b982901 feat(ui): UI_BACKEND_RUNTIME_PROMOTION_v47 — docs generator, badge coverage (10 pages), verifier CHECK 9, SIMULATED disclosure flags, runtime proof plan, 60 tests PASS
12375ee97 feat(registry): UI_BACKEND_TRUTH_CERTIFICATION_v46 — registry, truth UI, parity gate, 53 tests, certification
c05498150 chore(release): update Cargo.lock for v33.0.11 build
24fadae8e chore(release): v33.0.11 — build artifacts + version bump + launcher refresh
e7668cfe1 chore(chat): seal runtime optimization v4
53c6e43cc chore(format): clear global prettier warnings and refresh autoheal
75cbe2e4e fix(chat): seal total-dev e2e and runtime safety contracts
0e28f98e2 release(v33.0.10): bump version, build release artifacts, update deployment/latest
d9a2b6c7e feat(time): harden temporal runtime publication and scheduler truth
1f1ea0799 feat(kb): add governed memory candidate metabolism
303d92de7 feat(kb): add governed knowledge selection runtime
1e99fa9e1 fix(chat): seal R9 temporal reasoning proofs and contract-aligned E2E
1771f27ef feat(total-dev,web-research): stabilize dev boundary and research fallback
c5ad3ecc4 docs(proof): close v33.0.9 system sudo gap
3d6a7c9c1 fix(chat): stabilize cognitive trace pipeline and e2e suite
a350b0e60 fix(memory): align chat single-door reads with namespaced storage
1c076fc88 test(memory): add desktop and agent namespace isolation proofs
fd703a02c fix(memory): isolate test conversation storage and clean stm
a0a8f23b6 docs(proof): record blocked sudo install attempts
ad5a79574 docs(proof): add system binary drift evidence
34deba7fc docs(proof): seal final release v33.0.9 mission
33b90e873 Reduce TIME context churn
86bc922b8 Guard stale TIME chat context
5371fac1e Sync TIME context into Titane chat
3de33237c test(cognitive-trace): add desktop expert seal lane and fail-boundary proof
0df269272 Certify TIME tab visibility
58a44830c fix(cognitive-trace): Desktop UI propagation with pure builder extraction
c00ac5fea Fix TIME desktop runtime truth
72684c41b feat(omega-trace): Production omega_trace_meta Smoke Certification
b5f6e6109 feat(metacognition): MetaCognitionGuard v2 Bounded Action Enforcement
00a27cd3c cert(metacognition): MetaCognitionGuard Runtime Certification Seal — Mission 6
219aa9a77 feat(cognitive-trace): MetaCognitionGuard v1 — trace-aware coherence gate
3004db7dc docs(cognitive-trace): proof pack + canonical cartography for Runtime Certification Seal
31287b3d2 seal(cognitive-trace): CognitiveRuntimeTrace v2 runtime certification — E2E PASS 5/5

### git branch --show-current
MAIN

### git branch -vv
* MAIN                                    69d416a5b [origin/MAIN: en avance de 1] fix(ui): sync page inventory and deployment latest
  backup/sync-main-2026-04-07             2d0636c79 fix(src-tauri): complete governed v29 backend unlock
  copilot/worktree-2026-03-18T00-11-41    b9a25e54a cert(audio): 18/18 gates PASS — tts-buffer + settings persistence x3
  copilot/worktree-2026-03-18T00-54-31    48d4eb9d0 chore(proof): seal XP runtime heal pack + desktop file update
  copilot/worktree-2026-03-18T14-18-00    05a0da815 feat(chat-default): enrich SYSTEM_PROMPTS.default with canonical TITANE policy
  copilot/worktree-2026-03-18T16-06-09    61a64ce63 docs(proof): audio TTS gate report addendum x3 runs PASS
  copilot/worktree-2026-03-18T16-17-21    61a64ce63 docs(proof): audio TTS gate report addendum x3 runs PASS
  copilot/worktree-2026-03-20T13-39-12    9bd7cb0b3 docs: mise à jour CHANGELOG + README pour rebuild v28.0.0 (2026-03-20)
  copilot/worktree-2026-03-22T19-02-32    4565577dc chore(release): v28.88.0 SEALED — PASS [tsc|vitest 3285/3399|cargo 4463|build exit 0|freshness PASS|instructions PASS=20|recurrence GUARD_PASS entries=565]
  copilot/worktree-2026-03-22T19-06-37    4565577dc chore(release): v28.88.0 SEALED — PASS [tsc|vitest 3285/3399|cargo 4463|build exit 0|freshness PASS|instructions PASS=20|recurrence GUARD_PASS entries=565]
  copilot/worktree-2026-03-22T19-07-31    4565577dc chore(release): v28.88.0 SEALED — PASS [tsc|vitest 3285/3399|cargo 4463|build exit 0|freshness PASS|instructions PASS=20|recurrence GUARD_PASS entries=565]
  copilot/worktree-2026-03-22T21-51-40    8c15f2c69 docs: 21_TIER1_COMPLETION_SUMMARY — Lock #1 SEALED with proof inventory and Tier 2 roadmap
  p2/bundle-phase2a-fastfs                66bf47460 feat(p2): split services-core boot vs lazy chunks
  safe/android-sync-pre-20260411-142131   ba40d7ee2 feat(twins): unify identity surface with chat context
+ safe/conflict-cleanup-2026-04-02        ec8bbe14a (/home/titane-os/Documents/GitHub/TITANE_INFINITY_SAFE_CONFLICT_CLEANUP_20260402) governance: clear textual conflicts in kernel changelog and readme
+ safe/conflict-cleanup-origin-2026-04-02 d7b1136f7 (/home/titane-os/Documents/GitHub/TITANE_INFINITY_SAFE_CONFLICT_CLEANUP_ORIGIN_20260402) [origin/safe/conflict-cleanup-origin-2026-04-02: disparue] governance: clear textual conflicts in kernel changelog and readme
  tauri-3-upgrade                         31a967f1e [origin/tauri-3-upgrade: disparue] fix(ci): restore formatting compliance
  trial/vite8-migration                   63f9b8360 feat(build): migrate to vite 8 + @vitejs/plugin-react 5.2.0

### git remote -v
fastfs	/home/titane-os/.cache/titane_fastfs/p2_bundle/repo (fetch)
fastfs	/home/titane-os/.cache/titane_fastfs/p2_bundle/repo (push)
origin	https://github.com/KallokTherok1994/TITANE_INFINITY.git (fetch)
origin	https://github.com/KallokTherok1994/TITANE_INFINITY.git (push)

### git rev-list --left-right --count @{u}...HEAD
0	1

### git log --oneline @{u}..HEAD
69d416a5b fix(ui): sync page inventory and deployment latest

### git log --oneline HEAD..@{u}

### git ls-remote --heads origin MAIN main

### Infrastructure checks
PRESENT src/registry/uiSurfaceRegistry.ts
PRESENT src/registry/uiSurfaceRegistry.schema.ts
PRESENT scripts/verify/verify-ui-surface-registry.mjs
PRESENT scripts/generate/generate-ui-surface-docs.mjs
PRESENT docs/ui/generated/UI_ROUTE_INVENTORY.md
PRESENT docs/ui/generated/UI_TAB_MATRIX.md
PRESENT docs/ui/generated/UI_ACTION_BACKEND_MATRIX.md
PRESENT docs/ui/generated/UI_PROOF_COVERAGE.md
PRESENT docs/ui/generated/UI_LEGACY_ALIAS_MAP.md
PRESENT artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
PRESENT artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl
PRESENT .github/workflows/titane-static-gates.yml

### Current package version
33.0.15

### Current Tauri version (Cargo.toml package)
3:version      = "33.0.15"

### App displayed version sources
index.html:184:    <meta name="version" content="33.0.9" />
package.json:2:  "name": "titane-infinity",
package.json:3:  "version": "33.0.15",
package.json:15:    "sync:versions": "node scripts/sync-versions.mjs",
package.json:16:    "bump:version": "node scripts/bump-version.mjs",
tauri.base.json:4:  "version": "33.0.15",
tauri.base.json:155:              "command": "memory_version"
src-tauri/tauri.conf.json:2:  "version": "33.0.15",
src-tauri/tauri.conf.json:154:              "command": "memory_version"
src-tauri/tauri.conf.json:2:  "version": "33.0.15",
src-tauri/tauri.conf.json:154:              "command": "memory_version"
src/vite-env.d.ts:13:// ✨ Rule 13 - Build-time version constant injected by vite.config.ts define
src/vite-env.d.ts:14:declare const __APP_VERSION__: string;
src/setupTests.ts:13:// Some DOM stacks (whatwg-url/webidl-conversions) expect these accessors to exist.
src/__tests__/automations.config.test.ts:24:  AUTOMATION_SYSTEM_VERSION,
src/__tests__/automations.config.test.ts:72:        expect(automation.version).toBeDefined();
src/__tests__/automations.config.test.ts:369:    it('AUTOMATION_SYSTEM_VERSION est un semver valide', () => {
src/__tests__/automations.config.test.ts:370:      expect(AUTOMATION_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
src/__tests__/features/memory/memoryTreeData.test.ts:71:    version: 1,
src/__tests__/features/memory/memoryTreeData.test.ts:72:    versionHistory: [],
src/__tests__/core/http/httpClientContract.test.ts:117:      const result = await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`);
src/__tests__/core/http/httpClientContract.test.ts:234:      await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`, {
src/__tests__/core/http/httpClientContract.test.ts:301:        body: JSON.stringify({ version: '0.6.5' }),
src/__tests__/core/http/httpClientContract.test.ts:305:      const response = await secureFetch(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`);
src/__tests__/core/http/httpClientContract.test.ts:308:      expect(data).toEqual({ version: '0.6.5' });
src-tauri/Cargo.toml:2:name         = "titane-infinity"
src-tauri/Cargo.toml:3:version      = "33.0.15"
src-tauri/Cargo.toml:9:rust-version = "1.74"
src-tauri/Cargo.toml:29:tauri-build = { version = "2.0", features = [] }
src-tauri/Cargo.toml:32:tauri                          = { version = "2.0", features = ["protocol-asset", "tray-icon"] }
src-tauri/Cargo.toml:36:serde                          = { version = "1.0", features = ["derive"] }
src-tauri/Cargo.toml:41:chrono                         = { version = "0.4", features = ["serde"] }
src-tauri/Cargo.toml:42:uuid                           = { version = "1.23", features = ["v4", "serde"] }
src-tauri/Cargo.toml:43:tokio                          = { version = "1.51", features = ["full"] }
src-tauri/Cargo.toml:49:aes-gcm          = { version = "0.10", features = ["aes"] }
src-tauri/Cargo.toml:52:reqwest          = { version = "0.12", default-features = false, features = ["json", "stream", "rustls-tls"] }
src-tauri/Cargo.toml:72:smallvec = { version = "1.13", features = ["serde"] } # Stack-allocated Vec for small arrays (<8 elements)
src-tauri/Cargo.toml:89:cpal  = { version = "0.15", optional = true }
src-tauri/Cargo.toml:91:rusqlite = { version = "0.37.0", features = ["bundled"] }
src-tauri/Cargo.toml:97:# faiss = { version = "0.12", optional = true }  # FAISS (Linux AVX only)
src-tauri/Cargo.toml:100:image = { version = "0.25", default-features = false, features = ["rayon", "bmp", "dds", "ff", "gif", "hdr", "ico", "jpeg", "png", "pnm", "qoi", "tga", "tiff", "webp"] }  # Standard image formats without avif to avoid ravif/paste audit baggage; ff = farbfeld (renamed from farbfeld in 0.25)
src-tauri/Cargo.toml:101:ort = { version = "2.0.0-rc.10", optional = true }  # ONNX Runtime (optional, requires system libs)
src-tauri/Cargo.toml:108:axum            = { version = "0.7", features = ["ws"] }
src-tauri/Cargo.toml:109:tower           = { version = "0.5", features = ["util"] }
src-tauri/Cargo.toml:110:tower-http      = { version = "0.6", features = ["cors", "fs", "trace", "set-header"] }
src-tauri/Cargo.toml:132:criterion = { version = "0.8", features = ["html_reports"] }  # P2-1: IPC Benchmarks
src-tauri/Cargo.toml:134:zip = { version = "2.2", default-features = false, features = ["deflate"] }
src/__tests__/xpExtended.config.test.ts:12:  XP_EXTENDED_VERSION,
src/__tests__/xpExtended.config.test.ts:59:    it('XP_EXTENDED_VERSION est un semver valide', () => {
src/__tests__/xpExtended.config.test.ts:60:      expect(XP_EXTENDED_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
src/data/rules.json:2:  "_schema_version": "1.0.0",
src/data/voice_profiles.json:2:  "_schema_version": "1.0.0",
src/data/identity_matrix.json:2:  "_schema_version": "1.0.0",
src/data/identity_matrix.json:7:    "version": "v∞",
src/data/memory_evolution_config.json:2:  "_schema_version": "1.0.0",
src/data/memory_patterns.json:2:  "_schema_version": "1.0.0",
src/__tests__/omega-singularity-unified-sync.test.ts:436:    expect(registry.version).toBeDefined();
src/data/memory_lt.json:2:  "_schema_version": "1.0.0",
src/data/memory_ct.json:2:  "_schema_version": "1.0.0",
src/data/personality.json:2:  "_schema_version": "1.0.0",
src/data/personality.json:8:    "version": "v∞",
src/data/personality.json:36:    "extraversion": {
src/__tests__/mocks/devtools.mocks.ts:86:  version: '1.0.0',
src/data/modes.json:2:  "_schema_version": "1.0.0",
src/data/tone_settings.json:2:  "_schema_version": "1.0.0",
src/data/memory_mt.json:2:  "_schema_version": "1.0.0",
src/__tests__/eval/evalHarnessContract.test.ts:52:  const requiredTopFields = ['scorecard_id', 'version'];
src/data/memory_clusters.json:2:  "_schema_version": "1.0.0",
src/__tests__/responsePolicy.unit.test.ts:430:  it('RESPONSE_POLICY_VERSION est défini et non vide', async () => {
src/__tests__/responsePolicy.unit.test.ts:431:    const { RESPONSE_POLICY_VERSION, RESPONSE_POLICY_DATE } =
src/__tests__/responsePolicy.unit.test.ts:433:    expect(RESPONSE_POLICY_VERSION).toBeTruthy();
src/__tests__/persistentMemory.test.ts:38:  MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:87:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:111:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:138:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:144:  version: 2,
src/__tests__/persistentMemory.test.ts:145:  versionHistory: ['v1'],
src/__tests__/persistentMemory.test.ts:255:    it('should have schema version', () => {
src/__tests__/persistentMemory.test.ts:256:      expect(MEMORY_SCHEMA_VERSION).toBe('1.0.0');
src/__tests__/ui/ui-navigation.test.ts:89:    vi.stubGlobal('__APP_VERSION__', 'test');
src/__tests__/ui/ui-navigation.test.ts:423:    vi.stubGlobal('__APP_VERSION__', 'test');
src/__tests__/unifiedMemory.test.ts:7: * @version 1.0.0
src/__tests__/ui/app-router-canonical-surfaces.test.tsx:116:    vi.stubGlobal('__APP_VERSION__', 'test');
src/__tests__/memoryComponents.test.tsx:112:  version: 1,
src/__tests__/memoryComponents.test.tsx:113:  versionHistory: [],
src/__tests__/singularity-fusion-integration.test.ts:7: * @version Ω (Omega - Final Fusion)
src/__tests__/constitution-integration.test.ts:195:    it('contient version correcte', () => {
src/__tests__/constitution-integration.test.ts:196:      expect(CONSTITUTIONAL_CONFIG.version).toBe('1.0');
src/__tests__/constitution-integration.test.ts:332:    expect(config.version).toBe('1.0');
src/__tests__/hooks/useConversationEngine.test.ts:980:          version: 'v2',
src/__tests__/hooks/useConversationEngine.test.ts:1018:    expect(assistantMsg?.metadata?.cognitiveTrace?.policy.version).toBe('v2');
src/__tests__/features/chat/ThinkingPanel.test.tsx:279:        version: 'v2',
src/__tests__/hooks/usePersistentMemory.test.tsx:232:            schema_version: '1.0.0',
src/os/TitaneOS.ts:260:    this.services.register({ id, name, version: this.config.version }, instance);
src/os/TitaneOS.ts:283:    this.log('info', `Installing plugin: ${plugin.name} v${plugin.version}`);
src/__tests__/hooks/useTwinEvolution.test.tsx:67:        version: '1',
src/os/types.ts:22:  version: string;
src/os/types.ts:37:  version: '20.0-Ω',
src/os/types.ts:62:  version: string;
src/os/types.ts:103:  version: string;
src/os/types.ts:205:  version: string;
src/stories/CodeBlock.stories.tsx:53:      { version: '31.2.37', engine: 'gemma2:2b', status: 'active' },
src/__tests__/hooks/useExperience.test.tsx:39:  version: '1.0.0',
src/hooks/__tests__/useChat.test.ts:391:      expect(parsed.version).toBe('omnis-v1.0');
src/hooks/__tests__/useChat.test.ts:408:        version: 'omnis-v1.0',
src/hooks/__tests__/useChat.test.ts:457:    it('should expose the v30 OMEGA engine version', () => {
src/hooks/__tests__/useChat.test.ts:497:      expect(result.current.uiIntegrity.version).toBeGreaterThan(0);
src/config/chatModes.config.ts:359:    version: mode.version,
src/hooks/useMemoryEngine.ts:172:// used directly. Instead, memoized versions are created in useMemoryEngine
src/__tests__/evolutionIA.config.test.ts:25:  EVOLUTION_SYSTEM_VERSION,
src/__tests__/evolutionIA.config.test.ts:423:    it('EVOLUTION_SYSTEM_VERSION est un semver valide', () => {
src/__tests__/evolutionIA.config.test.ts:424:      expect(EVOLUTION_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
src/hooks/useVoiceMode.ts:10: *   ⚠️ DEPRECATED: Ce hook est une ancienne version v15/v16.
src/__tests__/config/desktopLauncherScripts.test.ts:10:  it('discovers the latest deployment AppImage dynamically instead of hardcoding an old version', () => {
src/__tests__/config/desktopLauncherScripts.test.ts:23:    expect(desktopScript).toContain("dpkg-query -W -f='${Version}\\n' titane-infinity");
src/__tests__/config/desktopLauncherScripts.test.ts:25:      'APP_VERSION="$(extract_installed_package_version "$BINARY_PATH")"'
src/__tests__/config/desktopLauncherScripts.test.ts:32:      'SYSTEM_DESKTOP_FILE="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"'
src/__tests__/config/desktopLauncherScripts.test.ts:44:      'SYSTEM_DESKTOP_DST1="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"'
src/__tests__/config/desktopLauncherScripts.test.ts:52:      'SYSTEM_ICON_DST="$SYSTEM_ICON_DIR/titane-infinity.png"'
src/__tests__/config/desktopLauncherScripts.test.ts:66:      '"conflicts":["titane-infinity"]'

### CI discoverable quick state
WORKFLOW_FILE_PRESENT

### Infrastructure checks
PRESENT src/registry/uiSurfaceRegistry.ts
PRESENT src/registry/uiSurfaceRegistry.schema.ts
PRESENT scripts/verify/verify-ui-surface-registry.mjs
PRESENT scripts/generate/generate-ui-surface-docs.mjs
PRESENT docs/ui/generated/UI_ROUTE_INVENTORY.md
PRESENT docs/ui/generated/UI_TAB_MATRIX.md
PRESENT docs/ui/generated/UI_ACTION_BACKEND_MATRIX.md
PRESENT docs/ui/generated/UI_PROOF_COVERAGE.md
PRESENT docs/ui/generated/UI_LEGACY_ALIAS_MAP.md
PRESENT artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
PRESENT artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl
PRESENT .github/workflows/titane-static-gates.yml

### Current package version
33.0.15

### Current Tauri version (Cargo.toml package)
3:version      = "33.0.15"

### App displayed version sources
index.html:184:    <meta name="version" content="33.0.9" />
package.json:2:  "name": "titane-infinity",
package.json:3:  "version": "33.0.15",
package.json:15:    "sync:versions": "node scripts/sync-versions.mjs",
package.json:16:    "bump:version": "node scripts/bump-version.mjs",
tauri.base.json:4:  "version": "33.0.15",
tauri.base.json:155:              "command": "memory_version"
src-tauri/tauri.conf.json:2:  "version": "33.0.15",
src-tauri/tauri.conf.json:154:              "command": "memory_version"
src-tauri/tauri.conf.json:2:  "version": "33.0.15",
src-tauri/tauri.conf.json:154:              "command": "memory_version"
src/vite-env.d.ts:13:// ✨ Rule 13 - Build-time version constant injected by vite.config.ts define
src/vite-env.d.ts:14:declare const __APP_VERSION__: string;
src/setupTests.ts:13:// Some DOM stacks (whatwg-url/webidl-conversions) expect these accessors to exist.
src/__tests__/ai-orchestrator-neural-fixed.test.ts:4: * Tests P1 identifiés dans AUDIT_ORCHESTRATEURS_v26.3.1 (VERSION CORRIGÉE)
src/__tests__/automations.config.test.ts:24:  AUTOMATION_SYSTEM_VERSION,
src/__tests__/automations.config.test.ts:72:        expect(automation.version).toBeDefined();
src/__tests__/automations.config.test.ts:369:    it('AUTOMATION_SYSTEM_VERSION est un semver valide', () => {
src/__tests__/automations.config.test.ts:370:      expect(AUTOMATION_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
src/security/ApiKeyGuard.ts:39:    // Store only masked version
src/security/ApiKeyGuard.ts:68:   * Get masked version of a key (safe for logging)
src/os/TitaneOS.ts:260:    this.services.register({ id, name, version: this.config.version }, instance);
src/os/TitaneOS.ts:283:    this.log('info', `Installing plugin: ${plugin.name} v${plugin.version}`);
src/os/types.ts:22:  version: string;
src/os/types.ts:37:  version: '20.0-Ω',
src/os/types.ts:62:  version: string;
src/os/types.ts:103:  version: string;
src/os/types.ts:205:  version: string;
src/__tests__/features/memory/memoryTreeData.test.ts:71:    version: 1,
src/__tests__/features/memory/memoryTreeData.test.ts:72:    versionHistory: [],
src-tauri/audit.toml:28:    "RUSTSEC-2025-0098", # unic-ucd-version
src-tauri/tests/option1_db_offline_core.rs:45:    assert_eq!(snapshot["version"], 1);
src/__tests__/features/chat/ThinkingPanel.test.tsx:279:        version: 'v2',
src/config/chatModes.config.ts:359:    version: mode.version,
src/__tests__/responsePolicy.unit.test.ts:430:  it('RESPONSE_POLICY_VERSION est défini et non vide', async () => {
src/__tests__/responsePolicy.unit.test.ts:431:    const { RESPONSE_POLICY_VERSION, RESPONSE_POLICY_DATE } =
src/__tests__/responsePolicy.unit.test.ts:433:    expect(RESPONSE_POLICY_VERSION).toBeTruthy();
src/stories/CodeBlock.stories.tsx:53:      { version: '31.2.37', engine: 'gemma2:2b', status: 'active' },
src/__tests__/unifiedMemory.test.ts:7: * @version 1.0.0
src-tauri/tests/option1_migrations_idempotent.rs:29:            "SELECT COUNT(1) FROM schema_migrations WHERE version = '0001_base'",
src-tauri/tests/ltm_consumption_proof.rs:55:                "schema_version": "1.0.0"
src-tauri/tests/ltm_consumption_proof.rs:64:            "version": null,
src-tauri/tests/ltm_consumption_proof.rs:65:            "version_history": []
src-tauri/tests/omega_p2_performance_test.rs:1:// R05 P2: Performance validation test for OMEGA → ConversationResponse direct conversion
src-tauri/tests/omega_p2_performance_test.rs:53:        .expect("P2 conversion failed");
src-tauri/tests/omega_p2_performance_test.rs:117:        .expect("Conversion failed");
src-tauri/tests/omega_p2_performance_test.rs:119:    // In mock environment, verify P2 conversion structure is correct
src-tauri/tests/omega_p2_performance_test.rs:126:    // Verify P2 conversion created valid response structure
src-tauri/tests/omega_p2_performance_test.rs:177:            .expect("Conversion failed");
src-tauri/gen/android/app/src/main/res/xml/file_paths.xml:1:<?xml version="1.0" encoding="utf-8"?>
src/__tests__/config/desktopLauncherScripts.test.ts:10:  it('discovers the latest deployment AppImage dynamically instead of hardcoding an old version', () => {
src/__tests__/config/desktopLauncherScripts.test.ts:23:    expect(desktopScript).toContain("dpkg-query -W -f='${Version}\\n' titane-infinity");
src/__tests__/config/desktopLauncherScripts.test.ts:25:      'APP_VERSION="$(extract_installed_package_version "$BINARY_PATH")"'
src/__tests__/config/desktopLauncherScripts.test.ts:32:      'SYSTEM_DESKTOP_FILE="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"'
src/__tests__/config/desktopLauncherScripts.test.ts:44:      'SYSTEM_DESKTOP_DST1="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"'
src/__tests__/config/desktopLauncherScripts.test.ts:52:      'SYSTEM_ICON_DST="$SYSTEM_ICON_DIR/titane-infinity.png"'
src/__tests__/config/desktopLauncherScripts.test.ts:66:      '"conflicts":["titane-infinity"]'
src/__tests__/config/desktopLauncherScripts.test.ts:69:      '"replaces":["titane-infinity"]'
src/__tests__/config/desktopLauncherScripts.test.ts:72:      '"provides":["titane-infinity"]'
src/__tests__/config/desktopLauncherScripts.test.ts:80:      'CANONICAL_DESKTOP_NAME="titane-infinity.desktop"'
src/__tests__/config/desktopLauncherScripts.test.ts:82:    expect(stablePostInstallScript).toContain('Name=TITANE∞ v$package_version');
src/__tests__/config/desktopLauncherScripts.test.ts:83:    expect(stablePostInstallScript).toContain('Exec=/usr/bin/titane-infinity');
src-tauri/test-chat-quick.sh:4:[ -f src-tauri/target/release/titane-infinity ] && echo "✅ Binary" || echo "❌ Binary"
src-tauri/Cargo.toml:2:name         = "titane-infinity"
src-tauri/Cargo.toml:3:version      = "33.0.15"
src-tauri/Cargo.toml:9:rust-version = "1.74"
src-tauri/Cargo.toml:29:tauri-build = { version = "2.0", features = [] }
src-tauri/Cargo.toml:32:tauri                          = { version = "2.0", features = ["protocol-asset", "tray-icon"] }
src-tauri/Cargo.toml:36:serde                          = { version = "1.0", features = ["derive"] }
src-tauri/Cargo.toml:41:chrono                         = { version = "0.4", features = ["serde"] }
src-tauri/Cargo.toml:42:uuid                           = { version = "1.23", features = ["v4", "serde"] }
src-tauri/Cargo.toml:43:tokio                          = { version = "1.51", features = ["full"] }
src-tauri/Cargo.toml:49:aes-gcm          = { version = "0.10", features = ["aes"] }
src-tauri/Cargo.toml:52:reqwest          = { version = "0.12", default-features = false, features = ["json", "stream", "rustls-tls"] }
src-tauri/Cargo.toml:72:smallvec = { version = "1.13", features = ["serde"] } # Stack-allocated Vec for small arrays (<8 elements)
src-tauri/Cargo.toml:89:cpal  = { version = "0.15", optional = true }
src-tauri/Cargo.toml:91:rusqlite = { version = "0.37.0", features = ["bundled"] }
src-tauri/Cargo.toml:97:# faiss = { version = "0.12", optional = true }  # FAISS (Linux AVX only)
src-tauri/Cargo.toml:100:image = { version = "0.25", default-features = false, features = ["rayon", "bmp", "dds", "ff", "gif", "hdr", "ico", "jpeg", "png", "pnm", "qoi", "tga", "tiff", "webp"] }  # Standard image formats without avif to avoid ravif/paste audit baggage; ff = farbfeld (renamed from farbfeld in 0.25)
src-tauri/Cargo.toml:101:ort = { version = "2.0.0-rc.10", optional = true }  # ONNX Runtime (optional, requires system libs)
src-tauri/Cargo.toml:108:axum            = { version = "0.7", features = ["ws"] }
src-tauri/Cargo.toml:109:tower           = { version = "0.5", features = ["util"] }
src-tauri/Cargo.toml:110:tower-http      = { version = "0.6", features = ["cors", "fs", "trace", "set-header"] }
src-tauri/Cargo.toml:132:criterion = { version = "0.8", features = ["html_reports"] }  # P2-1: IPC Benchmarks
src-tauri/Cargo.toml:134:zip = { version = "2.2", default-features = false, features = ["deflate"] }
src/hooks/__tests__/useChat.test.ts:391:      expect(parsed.version).toBe('omnis-v1.0');
src/hooks/__tests__/useChat.test.ts:408:        version: 'omnis-v1.0',
src/hooks/__tests__/useChat.test.ts:457:    it('should expose the v30 OMEGA engine version', () => {
src/hooks/__tests__/useChat.test.ts:497:      expect(result.current.uiIntegrity.version).toBeGreaterThan(0);
src/__tests__/persistentMemory.test.ts:38:  MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:87:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:111:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:138:    schemaVersion: MEMORY_SCHEMA_VERSION,
src/__tests__/persistentMemory.test.ts:144:  version: 2,
src/__tests__/persistentMemory.test.ts:145:  versionHistory: ['v1'],
src/__tests__/persistentMemory.test.ts:255:    it('should have schema version', () => {
src/__tests__/persistentMemory.test.ts:256:      expect(MEMORY_SCHEMA_VERSION).toBe('1.0.0');
src-tauri/gen/android/app/src/main/res/drawable/ic_launcher_background.xml:1:<?xml version="1.0" encoding="utf-8"?>
src-tauri/gen/android/app/src/main/res/layout/activity_main.xml:1:<?xml version="1.0" encoding="utf-8"?>
src/hooks/useMemoryEngine.ts:172:// used directly. Instead, memoized versions are created in useMemoryEngine
src/__tests__/constitution-integration.test.ts:195:    it('contient version correcte', () => {
src/__tests__/constitution-integration.test.ts:196:      expect(CONSTITUTIONAL_CONFIG.version).toBe('1.0');
src/__tests__/constitution-integration.test.ts:332:    expect(config.version).toBe('1.0');
src/hooks/useVoiceMode.ts:10: *   ⚠️ DEPRECATED: Ce hook est une ancienne version v15/v16.
src/__tests__/singularity-fusion-integration.test.ts:7: * @version Ω (Omega - Final Fusion)
src-tauri/gen/android/app/src/main/res/values/colors.xml:1:<?xml version="1.0" encoding="utf-8"?>
src/__tests__/ui/ui-navigation.test.ts:89:    vi.stubGlobal('__APP_VERSION__', 'test');
src/__tests__/ui/ui-navigation.test.ts:423:    vi.stubGlobal('__APP_VERSION__', 'test');
src-tauri/gen/android/app/src/main/AndroidManifest.xml:1:<?xml version="1.0" encoding="utf-8"?>
src/__tests__/ui/app-router-canonical-surfaces.test.tsx:116:    vi.stubGlobal('__APP_VERSION__', 'test');
src/__tests__/memoryComponents.test.tsx:112:  version: 1,
src/__tests__/memoryComponents.test.tsx:113:  versionHistory: [],
src/hooks/useThrottle.ts:7: * @version 24.5.0
src/ui/Menu.tsx:145:    const MENU_VERSION = 'v30.0.0';
src/ui/Menu.tsx:146:    const storedVersion = localStorage.getItem('titane_menu_version');
src/ui/Menu.tsx:148:    // Only clear localStorage on version upgrade (not every mount)
src/ui/Menu.tsx:149:    if (storedVersion !== MENU_VERSION) {
src/ui/Menu.tsx:156:      localStorage.setItem('titane_menu_version', MENU_VERSION);
src/ui/Menu.tsx:299:                <span className="menu-brand-version">v30.0.0</span>
src-tauri/gen/android/app/build.gradle.kts:24:        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()

### CI discoverable quick state
WORKFLOW_FILE_PRESENT

## Structured Startup Summary
- branch: MAIN
- local HEAD: 69d416a5beb4fb26ba2ffed95d1d1867560c9efd
- remote HEAD: BLOCKED_REMOTE_500_GIT_LS_REMOTE
- ahead/behind: 0/1 before this mission start snapshot
- dirty worktree: yes (mission artifacts/docs pending)
- current package version: 33.0.15
- current Tauri version: 33.0.15
- app displayed version sources: index.html meta/title stale detected at mission start
- prior proof files present/missing: PRESENT (all requested startup infrastructure files)
- current CI state if discoverable: workflow file present; remote status polling blocked by GitHub 500 during startup
- startup blockers: REMOTE_HEAD_DISCOVERY_BLOCKED_500
