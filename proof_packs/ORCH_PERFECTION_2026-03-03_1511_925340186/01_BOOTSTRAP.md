]633;E;{   echo "# 01_BOOTSTRAP"\x3b   echo "- Timestamp: $(date -Iseconds)"\x3b   echo "- Pack: $PACK_DIR"\x3b   echo\x3b   echo '```bash'\x3b   echo '$ git status'\x3b   git status\x3b   echo\x3b   echo '$ git rev-parse --short HEAD'\x3b   git rev-parse --short HEAD\x3b   echo\x3b   echo '$ git log -20 --oneline'\x3b   git log -20 --oneline\x3b   echo\x3b   echo '$ ls -la proof_packs || true'\x3b   ls -la proof_packs || true\x3b   echo\x3b   echo '$ find proof_packs -maxdepth 2 -type f -name "10_VERDICT*.md" -o -name "07_GATES_REPORT.md" -o -name "05_TESTS_X3.log" -o -name "06_BUILD_X3.log" | sort || true'\x3b   find proof_packs -maxdepth 2 -type f -name "10_VERDICT*.md" -o -name "07_GATES_REPORT.md" -o -name "05_TESTS_X3.log" -o -name "06_BUILD_X3.log" | sort || true\x3b   echo\x3b   echo '$ rg -n --hidden --glob "!.git" "fetch\\\\(|axios|WebSocket|ws://|http://|https://" src'\x3b   rg -n --hidden --glob '!.git' 'fetch\\(|axios|WebSocket|ws://|http://|https://' src || true\x3b   echo\x3b   echo '$ rg -n --hidden --glob "!.git" "invoke\\\\(|tauri\\\\.invoke|@tauri-apps/api" src'\x3b   rg -n --hidden --glob '!.git' 'invoke\\(|tauri\\.invoke|@tauri-apps/api' src || true\x3b   echo\x3b   echo '$ rg -n --hidden --glob "!.git" "MemoryStorage|save_conversation|flush|debounce|enforce_retention" src-tauri/src'\x3b   rg -n --hidden --glob '!.git' 'MemoryStorage|save_conversation|flush|debounce|enforce_retention' src-tauri/src || true\x3b   echo\x3b   echo '$ rg -n --hidden --glob "!.git" "from_utf8_lossy|as_bytes\\\\(\\\\)\\\\.chunks\\\\(" src-tauri/src'\x3b   rg -n --hidden --glob '!.git' 'from_utf8_lossy|as_bytes\\(\\)\\.chunks\\(' src-tauri/src || true\x3b   echo '```'\x3b } > "$PACK_DIR/01_BOOTSTRAP.md";f93deffa-e65f-4e82-b645-791c627998a8]633;C# 01_BOOTSTRAP
- Timestamp: 2026-03-03T15:11:33-05:00
- Pack: proof_packs/ORCH_PERFECTION_2026-03-03_1511_925340186

```bash
$ git status
Sur la branche MAIN
Votre branche est à jour avec 'origin/MAIN'.

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	proof_packs/ORCH_PERFECTION_2026-03-03_1511_925340186/

aucune modification ajoutée à la validation mais des fichiers non suivis sont présents (utilisez "git add" pour les suivre)

$ git rev-parse --short HEAD
925340186

$ git log -20 --oneline
925340186 docs(91_reports): finalize broken-link cleanup batch-3
b2d273e45 docs(links): fix relative paths in 90_release deployment docs
a9067a46a docs(links): fix canonical index relative paths
d85e8dc4b docs(changelog): add 2026-03-03 maintenance sync entry
29ece191d docs(readme): align version/status and governance notes with v27.2.0
3895845c1 docs(proof): add ORCH mini changelog and update diff index
25740b5d0 fix(chat): resolve TS blockers and seal ORCH VΩ proof pack
0cdf39d39 docs(reports): add release note for chat seal sequence
8a70d73f2 feat(chat): harden chat pipeline + governed full audit proof packs
c26514f05 docs(reports): seal refresh post-warning proof pack (append-only)
95eea7d69 Merge pull request #163 from KallokTherok1994/auto/exec-p0-p16-20260302-2034-cbc8f61
34046ca98 feat(hardline): add G0-G18 gate scripts for RC certification
53168e759 feat(hardline): add FINAL+++ runner and final audit orchestration
cbc8f617a docs(release): add GitHub release notes for v27.2.0-prod-release-20260302
76ea68401 release(prod): stabilize startup path and publish qualification proof packs
57e48984f docs(proof): seal online prod start x3 pass
5889560f3 docs(release): add short note for PROD_START_FIX_AUTH
6d4c8efc7 fix(boot): qualify PROD start and seal watchdog proof x3
4e17a79e8 docs(proof): finalize PROD isolation pack with strict x3 same-context closure
6c47b0253 test(e2e): harden Playwright webServer node path

$ ls -la proof_packs || true
total 212
drwxrwxr-x 44 titane-os titane-os  4096 mars   3 15:11 .
drwxrwxr-x 56 titane-os titane-os 36864 mars   3 15:10 ..
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_2035_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_203921_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_204111_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_205830_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_205857_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_210159_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_210222_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_211036_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 ABSOLUTE_EXEC_2026-03-02_211053_manual
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 08:32 BOOT_WATCHDOG_FIX_2026-03-02_0828_4e17a79e8
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 12:32 CHAT_FULL_POWER_2026-03-03_0808_95eea7d69
drwxrwxr-x  3 titane-os titane-os  4096 févr. 28 16:58 CLEANUP_AUDIT_2026-02-28_1658_21359b1eb
drwxrwxr-x  3 titane-os titane-os  4096 mars   1 20:44 CLEANUP_AUDIT_2026-02-28_1703_21359b1eb
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 12:38 FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 FULL_PLATFORM_2026-03-02_1944_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   1 15:32 OMEGA_AUDIT_2026-03-01_1435_6c47b0253
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 10:27 ONLINE_PROD_START_2026-03-02_0953_5889560f3
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-02_2124_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-02_2125_cbc8f617a_rerun
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-02_2128_cbc8f617a_rerun2
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-03_0702_cbc8f617a_rerun3
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-03_0703_cbc8f617a_rerun4
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-03_0706_cbc8f617a_rerun5
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 OPTIMAL_EXEC_2026-03-03_0708_cbc8f617a_rerun6
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 15:11 ORCH_PERFECTION_2026-03-03_1511_925340186
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 14:55 ORCH_VΩ_2026-03-03_1436_0cdf39d39
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 P0_P8_SUPERPACK_2026-03-02_1818_cbc8f61
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 P0_P8_SUPERPACK_2026-03-02_1838_cbc8f61
drwxrwxr-x  2 titane-os titane-os  4096 mars   1 12:28 PREP_BG_2026-02-28_1613_a8b70c2
drwxrwxr-x  2 titane-os titane-os  4096 mars   1 14:18 PROD_INFINITE_LOAD_2026-03-01_1411_6c47b0253
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 11:14 PROD_INFINITE_LOADING_FIX_2026-03-02_1109_57e48984f
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 11:31 PROD_INFINITE_LOADING_FIX_2026-03-02_1116_57e48984f
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 11:53 PROD_INFINITE_LOADING_FIX_2026-03-02_1127_57e48984f
drwxrwxr-x  2 titane-os titane-os  4096 mars   1 15:50 PROD_INFINITE_LOAD_VNEXT_2026-03-01_1536_6c47b0253
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 18:08 PROD_ISOLATION_2026-03-01_1557_6c47b0253
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 08:45 PROD_START_FIX_2026-03-02_0837_4e17a79e8
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 09:36 PROD_START_FIX_AUTH_2026-03-02_0847_4e17a79e8
drwxrwxr-x  2 titane-os titane-os  4096 mars   2 09:46 PROD_START_UNBLOCK_2026-03-02_0940_5889560f3
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 RC_FINAL_HARDLINE_2026-03-03_0733_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 RC_FINAL_HARDLINE_2026-03-03_0737_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   3 08:00 RC_FINAL_HARDLINE_2026-03-03_0740_cbc8f617a
drwxrwxr-x  2 titane-os titane-os  4096 mars   1 12:28 RC_SEAL_2026-02-28_1938_21359b1eb

$ find proof_packs -maxdepth 2 -type f -name "10_VERDICT*.md" -o -name "07_GATES_REPORT.md" -o -name "05_TESTS_X3.log" -o -name "06_BUILD_X3.log" | sort || true
proof_packs/BOOT_WATCHDOG_FIX_2026-03-02_0828_4e17a79e8/05_TESTS_X3.log
proof_packs/BOOT_WATCHDOG_FIX_2026-03-02_0828_4e17a79e8/06_BUILD_X3.log
proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/05_TESTS_X3.log
proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/06_BUILD_X3.log
proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/07_GATES_REPORT.md
proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/10_VERDICT.md
proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/05_TESTS_X3.log
proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/06_BUILD_X3.log
proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/07_GATES_REPORT.md
proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/10_VERDICT.md
proof_packs/ONLINE_PROD_START_2026-03-02_0953_5889560f3/05_TESTS_X3.log
proof_packs/ONLINE_PROD_START_2026-03-02_0953_5889560f3/06_BUILD_X3.log
proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39/05_TESTS_X3.log
proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39/06_BUILD_X3.log
proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39/07_GATES_REPORT.md
proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39/10_VERDICT.md
proof_packs/PROD_INFINITE_LOAD_2026-03-01_1411_6c47b0253/06_BUILD_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1109_57e48984f/05_TESTS_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1109_57e48984f/06_BUILD_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1116_57e48984f/05_TESTS_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1116_57e48984f/06_BUILD_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1127_57e48984f/05_TESTS_X3.log
proof_packs/PROD_INFINITE_LOADING_FIX_2026-03-02_1127_57e48984f/06_BUILD_X3.log
proof_packs/PROD_START_FIX_2026-03-02_0837_4e17a79e8/05_TESTS_X3.log
proof_packs/PROD_START_FIX_2026-03-02_0837_4e17a79e8/06_BUILD_X3.log
proof_packs/PROD_START_FIX_AUTH_2026-03-02_0847_4e17a79e8/05_TESTS_X3.log
proof_packs/PROD_START_FIX_AUTH_2026-03-02_0847_4e17a79e8/06_BUILD_X3.log
proof_packs/PROD_START_UNBLOCK_2026-03-02_0940_5889560f3/05_TESTS_X3.log
proof_packs/PROD_START_UNBLOCK_2026-03-02_0940_5889560f3/06_BUILD_X3.log

$ rg -n --hidden --glob "!.git" "fetch\\(|axios|WebSocket|ws://|http://|https://" src
src/__tests__/apps/devtools/__snapshots__/DevToolsApp.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Dashboard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Engines.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Logs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Errors.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Metrics.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Memory.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/OmegaPipeline.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/Settings/__snapshots__/Settings.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:24:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:83:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:118:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:159:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:21:      xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:104:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:133:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:161:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:204:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:266:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/TypingIndicator.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/VirtualMessageList.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:58:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:87:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:145:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:187:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:221:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:269:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:308:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:344:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:392:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:421:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatMessage.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/monitoring/__snapshots__/SystemHealthMonitor.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/voice/__snapshots__/VoiceControl.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/entry.ts:107:    const response = await fetch('./main-entry.json', { cache: 'no-store' });
src/__tests__/panels/__snapshots__/ChatPanel.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/architecture/engine-isolation.test.ts:109:      /axios\./,
src/__tests__/panels/__snapshots__/CommandPalette.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/types/aiModel.ts:67:    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
src/types/aiModel.ts:81:    endpoint: 'https://api.openai.com/v1/chat/completions',
src/types/aiModel.ts:110:    endpoint: 'https://api.anthropic.com/v1/messages',
src/modules/fusion/DatasetBuilder.ts:340:    echo "   curl -fsSL https://ollama.com/install.sh | sh"
src/__tests__/components/ui/__snapshots__/Toast.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Alert.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/core/holography/HOLOMESH_ENGINE.ts:215:    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="holomesh">`;
src/__tests__/components/devtools/__snapshots__/EventStream.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/EngineCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogLine.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogFilters.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricsDisplay.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/StatusPill.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/SectionHeader.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/modules/devSudo/devSudoHandler.ts:2633:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2686:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2871:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2910:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2971:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/__tests__/components/ui/__snapshots__/Badge.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Card.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Dialog.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Tabs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/modules/devSudo/devSudoBuiltins.ts:525:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:579:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:648:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:765:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:804:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:865:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/__tests__/components/ui/__snapshots__/Button.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Input.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/pages/ResearchPage.tsx:83:    `https://fr.wikipedia.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:84:    `https://fr.wikipedia.org/w/index.php?search=${query}`,
src/pages/ResearchPage.tsx:85:    `https://fr.wiktionary.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:86:    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
src/components/ui/LazyImage.tsx:47:  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
src/components/ui/button.tsx:77:          xmlns="http://www.w3.org/2000/svg"
src/lib/security/__tests__/policyFirewallV2.test.ts:11:    const result = evaluateAttackModelV2('send all data to https://evil.example/exfil');
src/lib/security/__tests__/policyFirewallV2.test.ts:18:    const decision = evaluatePolicyFirewallV2('please post to https://evil.example', {
src/__tests__/components/ui/__snapshots__/Switch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/CARTE_POINTS_CRITIQUES.ts:137: *     "devUrl": "http://localhost:5173",
src/CARTE_POINTS_CRITIQUES.ts:142: *   "devUrl": "http://localhost:1420"  ❌ (mode HTTP obsolète)
src/CARTE_POINTS_CRITIQUES.ts:240: *      → "devUrl": "http://localhost:5173" ✅ (dev server encapsulé par Tauri)
src/modules/dataCollector/DataCollectorEngine.ts:553:    echo "❌ Ollama not installed. Install: https://ollama.ai"
src/lib/accessibility.ts:119: * https://www.w3.org/WAI/GL/wiki/Relative_luminance
src/lib/accessibility.ts:132: * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
src/utils/__tests__/webVitals.test.ts:131:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:149:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:169:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:189:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:209:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:231:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:248:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:278:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:305:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:316:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:433:      url: 'http://localhost',
src/components/chat/ChatModeSelector.css:267:  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
src/hooks/useChat.ts:1775:   curl -fsSL https://ollama.com/install.sh | sh
src/components/chat/ConversationsButton.tsx:39:        xmlns="http://www.w3.org/2000/svg"
src/features/governance-center/components/APIProviderCard.tsx:28:    helpUrl: 'https://makersuite.google.com/app/apikey',
src/features/governance-center/components/APIProviderCard.tsx:36:    helpUrl: 'https://platform.openai.com/api-keys',
src/features/governance-center/components/APIProviderCard.tsx:44:    helpUrl: 'https://console.anthropic.com/settings/keys',
src/features/governance-center/components/APIProviderCard.tsx:52:    helpUrl: 'https://ollama.com/download',
src/features/governance-center/components/APIProviderCard.tsx:167:                  curl -fsSL https://ollama.com/install.sh | sh
src/features/governance-center/types.ts:135:      'GitHub Copilot / GitHub Models API (https://github.com/marketplace/models)',
src/components/sections/ConversationSection.tsx:227:    `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:228:    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:229:    `https://fr.wiktionary.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:230:    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:236:    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/features/governance-center/tabs/SecretsTab.tsx:588:              href="https://github.com/settings/tokens"
src/assets/titane-arc-emerald.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/config/offline-first.ts:34:  localLLM: 'http://localhost:8000',
src/config/offline-first.ts:37:  gemini: 'https://generativelanguage.googleapis.com/v1beta',
src/config/offline-first.ts:38:  openai: 'https://api.openai.com/v1',
src/config/offline-first.ts:77:    await httpClient.head('https://www.google.com/favicon.ico', {
src/assets/titane-reactor-awen.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/config/index.ts:26:      if (env.isBrowser && env.isDev) return 'http://localhost:1420';
src/stories/Page.stories.ts:9:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/stories/LazyImage.stories.tsx:144:      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%230A0A0A"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E',
src/stories/Header.stories.ts:12:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Header.stories.ts:15:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/stories/Button.stories.ts:9:// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
src/stories/Button.stories.ts:14:    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
src/stories/Button.stories.ts:17:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Button.stories.ts:19:  // More on argTypes: https://storybook.js.org/docs/api/argtypes
src/stories/Button.stories.ts:23:  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
src/stories/Button.stories.ts:30:// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
src/stories/Header.tsx:25:          xmlns="http://www.w3.org/2000/svg"
src/stories/Configure.mdx:54:        href="https://storybook.js.org/docs/configure/styling-and-css/?renderer=react&ref=configure"
src/stories/Configure.mdx:66:        href="https://storybook.js.org/docs/writing-stories/decorators/?renderer=react&ref=configure#context-for-mocking"
src/stories/Configure.mdx:78:          href="https://storybook.js.org/docs/configure/images-and-assets/?renderer=react&ref=configure"
src/stories/Configure.mdx:101:          href="https://storybook.js.org/docs/writing-docs/autodocs/?renderer=react&ref=configure"
src/stories/Configure.mdx:110:          href="https://storybook.js.org/docs/sharing/publish-storybook/?renderer=react&ref=configure#publish-storybook-with-chromatic"
src/stories/Configure.mdx:120:          href="https://storybook.js.org/docs/sharing/design-integrations/?renderer=react&ref=configure#embed-storybook-in-figma-with-the-plugin"
src/stories/Configure.mdx:130:          href="https://storybook.js.org/docs/writing-tests/?renderer=react&ref=configure"
src/stories/Configure.mdx:139:          href="https://storybook.js.org/docs/writing-tests/accessibility-testing/?renderer=react&ref=configure"
src/stories/Configure.mdx:148:          href="https://storybook.js.org/docs/configure/theming/?renderer=react&ref=configure"
src/stories/Configure.mdx:160:        href="https://storybook.js.org/addons/?ref=configure"
src/stories/Configure.mdx:175:        href="https://github.com/storybookjs/storybook"
src/stories/Configure.mdx:185:          href="https://discord.gg/storybook"
src/stories/Configure.mdx:196:          href="https://www.youtube.com/@chromaticui"
src/stories/Configure.mdx:206:          href="https://storybook.js.org/tutorials/?ref=configure"
src/stories/Page.tsx:26:          <a href="https://componentdriven.org" target="_blank" rel="noopener noreferrer">
src/stories/Page.tsx:49:            href="https://storybook.js.org/tutorials/"
src/stories/Page.tsx:57:            href="https://storybook.js.org/docs"
src/stories/Page.tsx:71:            xmlns="http://www.w3.org/2000/svg"
src/stories/assets/github.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#161614" d="M16.0001 0C7.16466 0 0 7.17472 0 16.0256C0 23.1061 4.58452 29.1131 10.9419 31.2322C11.7415 31.3805 12.0351 30.8845 12.0351 30.4613C12.0351 30.0791 12.0202 28.8167 12.0133 27.4776C7.56209 28.447 6.62283 25.5868 6.62283 25.5868C5.89499 23.7345 4.8463 23.2419 4.8463 23.2419C3.39461 22.2473 4.95573 22.2678 4.95573 22.2678C6.56242 22.3808 7.40842 23.9192 7.40842 23.9192C8.83547 26.3691 11.1514 25.6609 12.0645 25.2514C12.2081 24.2156 12.6227 23.5087 13.0803 23.1085C9.52648 22.7032 5.7906 21.3291 5.7906 15.1886C5.7906 13.4389 6.41563 12.0094 7.43916 10.8871C7.27303 10.4834 6.72537 8.85349 7.59415 6.64609C7.59415 6.64609 8.93774 6.21539 11.9953 8.28877C13.2716 7.9337 14.6404 7.75563 16.0001 7.74953C17.3599 7.75563 18.7297 7.9337 20.0084 8.28877C23.0623 6.21539 24.404 6.64609 24.404 6.64609C25.2749 8.85349 24.727 10.4834 24.5608 10.8871C25.5868 12.0094 26.2075 13.4389 26.2075 15.1886C26.2075 21.3437 22.4645 22.699 18.9017 23.0957C19.4756 23.593 19.9869 24.5683 19.9869 26.0634C19.9869 28.2077 19.9684 29.9334 19.9684 30.4613C19.9684 30.8877 20.2564 31.3874 21.0674 31.2301C27.4213 29.1086 32 23.1037 32 16.0256C32 7.17472 24.8364 0 16.0001 0ZM5.99257 22.8288C5.95733 22.9084 5.83227 22.9322 5.71834 22.8776C5.60229 22.8253 5.53711 22.7168 5.57474 22.6369C5.60918 22.5549 5.7345 22.5321 5.85029 22.587C5.9666 22.6393 6.03284 22.7489 5.99257 22.8288ZM6.7796 23.5321C6.70329 23.603 6.55412 23.5701 6.45291 23.4581C6.34825 23.3464 6.32864 23.197 6.40601 23.125C6.4847 23.0542 6.62937 23.0874 6.73429 23.1991C6.83895 23.3121 6.85935 23.4605 6.7796 23.5321ZM7.31953 24.4321C7.2215 24.5003 7.0612 24.4363 6.96211 24.2938C6.86407 24.1513 6.86407 23.9804 6.96422 23.9119C7.06358 23.8435 7.2215 23.905 7.32191 24.0465C7.41968 24.1914 7.41968 24.3623 7.31953 24.4321ZM8.23267 25.4743C8.14497 25.5712 7.95818 25.5452 7.82146 25.413C7.68156 25.2838 7.64261 25.1004 7.73058 25.0035C7.81934 24.9064 8.00719 24.9337 8.14497 25.0648C8.28381 25.1938 8.3262 25.3785 8.23267 25.4743ZM9.41281 25.8262C9.37413 25.9517 9.19423 26.0088 9.013 25.9554C8.83203 25.9005 8.7136 25.7535 8.75016 25.6266C8.78778 25.5003 8.96848 25.4408 9.15104 25.4979C9.33174 25.5526 9.45044 25.6985 9.41281 25.8262ZM10.7559 25.9754C10.7604 26.1076 10.6067 26.2172 10.4165 26.2196C10.2252 26.2238 10.0704 26.1169 10.0683 25.9868C10.0683 25.8534 10.2185 25.7448 10.4098 25.7416C10.6001 25.7379 10.7559 25.8441 10.7559 25.9754ZM12.0753 25.9248C12.0981 26.0537 11.9658 26.1862 11.7769 26.2215C11.5912 26.2554 11.4192 26.1758 11.3957 26.0479C11.3726 25.9157 11.5072 25.7833 11.6927 25.7491C11.8819 25.7162 12.0512 25.7937 12.0753 25.9248Z"/></svg>
src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/stories/assets/youtube.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#ED1D24" d="M31.3313 8.44657C30.9633 7.08998 29.8791 6.02172 28.5022 5.65916C26.0067 5.00026 16 5.00026 16 5.00026C16 5.00026 5.99333 5.00026 3.4978 5.65916C2.12102 6.02172 1.03665 7.08998 0.668678 8.44657C0 10.9053 0 16.0353 0 16.0353C0 16.0353 0 21.1652 0.668678 23.6242C1.03665 24.9806 2.12102 26.0489 3.4978 26.4116C5.99333 27.0703 16 27.0703 16 27.0703C16 27.0703 26.0067 27.0703 28.5022 26.4116C29.8791 26.0489 30.9633 24.9806 31.3313 23.6242C32 21.1652 32 16.0353 32 16.0353C32 16.0353 32 10.9053 31.3313 8.44657Z"/><path fill="#fff" d="M12.7266 20.6934L21.0902 16.036L12.7266 11.3781V20.6934Z"/></svg>
src/stories/assets/accessibility.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 48 48"><title>Accessibility</title><circle cx="24.334" cy="24" r="24" fill="#A849FF" fill-opacity=".3"/><path fill="#A470D5" fill-rule="evenodd" d="M27.8609 11.585C27.8609 9.59506 26.2497 7.99023 24.2519 7.99023C22.254 7.99023 20.6429 9.65925 20.6429 11.585C20.6429 13.575 22.254 15.1799 24.2519 15.1799C26.2497 15.1799 27.8609 13.575 27.8609 11.585ZM21.8922 22.6473C21.8467 23.9096 21.7901 25.4788 21.5897 26.2771C20.9853 29.0462 17.7348 36.3314 17.3325 37.2275C17.1891 37.4923 17.1077 37.7955 17.1077 38.1178C17.1077 39.1519 17.946 39.9902 18.9802 39.9902C19.6587 39.9902 20.253 39.6293 20.5814 39.0889L20.6429 38.9874L24.2841 31.22C24.2841 31.22 27.5529 37.9214 27.9238 38.6591C28.2948 39.3967 28.8709 39.9902 29.7168 39.9902C30.751 39.9902 31.5893 39.1519 31.5893 38.1178C31.5893 37.7951 31.3639 37.2265 31.3639 37.2265C30.9581 36.3258 27.698 29.0452 27.0938 26.2771C26.8975 25.4948 26.847 23.9722 26.8056 22.7236C26.7927 22.333 26.7806 21.9693 26.7653 21.6634C26.7008 21.214 27.0231 20.8289 27.4097 20.7005L35.3366 18.3253C36.3033 18.0685 36.8834 16.9773 36.6256 16.0144C36.3678 15.0515 35.2722 14.4737 34.3055 14.7305C34.3055 14.7305 26.8619 17.1057 24.2841 17.1057C21.7062 17.1057 14.456 14.7947 14.456 14.7947C13.4893 14.5379 12.3937 14.9873 12.0715 15.9502C11.7493 16.9131 12.3293 18.0044 13.3604 18.3253L21.2873 20.7005C21.674 20.8289 21.9318 21.214 21.9318 21.6634C21.9174 21.9493 21.9053 22.2857 21.8922 22.6473Z" clip-rule="evenodd"/></svg>
src/stories/assets/tutorials.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177597)"><path fill="#B7F0EF" fill-rule="evenodd" d="M17 7.87059C17 6.48214 17.9812 5.28722 19.3431 5.01709L29.5249 2.99755C31.3238 2.64076 33 4.01717 33 5.85105V22.1344C33 23.5229 32.0188 24.7178 30.6569 24.9879L20.4751 27.0074C18.6762 27.3642 17 25.9878 17 24.1539L17 7.87059Z" clip-rule="evenodd" opacity=".7"/><path fill="#87E6E5" fill-rule="evenodd" d="M1 5.85245C1 4.01857 2.67623 2.64215 4.47507 2.99895L14.6569 5.01848C16.0188 5.28861 17 6.48354 17 7.87198V24.1553C17 25.9892 15.3238 27.3656 13.5249 27.0088L3.34311 24.9893C1.98119 24.7192 1 23.5242 1 22.1358V5.85245Z" clip-rule="evenodd"/><path fill="#61C1FD" fill-rule="evenodd" d="M15.543 5.71289C15.543 5.71289 16.8157 5.96289 17.4002 6.57653C17.9847 7.19016 18.4521 9.03107 18.4521 9.03107C18.4521 9.03107 18.4521 25.1106 18.4521 26.9629C18.4521 28.8152 19.3775 31.4174 19.3775 31.4174L17.4002 28.8947L16.2575 31.4174C16.2575 31.4174 15.543 29.0765 15.543 27.122C15.543 25.1674 15.543 5.71289 15.543 5.71289Z" clip-rule="evenodd"/></g><defs><clipPath id="clip0_10031_177597"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/tests/security.test.ts:29:      expect(Sanitizer.validateUrl('https://example.com')).toBe(true);
src/tests/security.test.ts:30:      expect(Sanitizer.validateUrl('http://example.com')).toBe(true);
src/tests/e2e/titane_e2e.test.ts:359:        { title: 'Cognitive Architecture Overview', url: 'https://example.com/1' },
src/tests/e2e/titane_e2e.test.ts:360:        { title: 'TITANE Systems Design', url: 'https://example.com/2' },
src/tests/activeListeningIntegration.test.ts:125:    origin: 'http://localhost',
src/services/tts/hybridTTS.ts:236:      console.log(`📡 Mode: Local API (http://localhost:8765)`);
src/services/ai/providers/glm46v.ts:30:  baseUrl: 'http://127.0.0.1:8000/v1',
src/services/monitoring/sentry.ts:44:    // Obtenir à : https://sentry.io/settings/projects/

$ rg -n --hidden --glob "!.git" "invoke\\(|tauri\\.invoke|@tauri-apps/api" src
src/__tests__/omega-provider-tests.test.ts:22:import * as tauriCore from '@tauri-apps/api/core';
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:17:  it('invokeTauri() devrait appeler @tauri-apps/api/core.invoke', async () => {
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:20:    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:45:    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:64:    vi.doMock('@tauri-apps/api/core', () => ({ invoke: undefined }));
src/__tests__/singularity-fusion-mocked.test.ts:11:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/singularity-fusion-mocked.test.ts:82:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:83:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-mocked.test.ts:94:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:95:      const score = await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-mocked.test.ts:103:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:104:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-mocked.test.ts:113:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:114:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-mocked.test.ts:125:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:126:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-mocked.test.ts:139:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:140:      const warnings = await invoke('autofix_detect_rust_warnings');
src/__tests__/singularity-fusion-mocked.test.ts:148:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:149:      const modules = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-mocked.test.ts:157:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:158:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-mocked.test.ts:170:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:171:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-mocked.test.ts:179:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:182:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-mocked.test.ts:188:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-mocked.test.ts:195:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-mocked.test.ts:199:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-mocked.test.ts:204:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:206:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-mocked.test.ts:207:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-mocked.test.ts:208:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:11:import { invoke } from '@tauri-apps/api/core';
src/__tests__/singularity-fusion-integration.test.ts:16:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:24:      const score = await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:31:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:38:      const snapshotId = await invoke('singularity_create_snapshot', {
src/__tests__/singularity-fusion-integration.test.ts:46:      const metrics = await invoke('singularity_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:53:      const diagnostics = await invoke('singularity_get_diagnostics');
src/__tests__/singularity-fusion-integration.test.ts:62:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-integration.test.ts:71:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-integration.test.ts:81:      const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/singularity-fusion-integration.test.ts:90:      const stats = await invoke('pipeline_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:97:      const valid = await invoke('pipeline_validate');
src/__tests__/singularity-fusion-integration.test.ts:104:      const issues = await invoke('autofix_detect_rust_warnings');
src/__tests__/singularity-fusion-integration.test.ts:109:      const issues = await invoke('autofix_detect_typescript_errors');
src/__tests__/singularity-fusion-integration.test.ts:114:      const stats = await invoke('autofix_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:122:      const history = await invoke('autofix_get_history');
src/__tests__/singularity-fusion-integration.test.ts:129:      const modules = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-integration.test.ts:134:      const result = await invoke('autoheal_heal_cognitive_module');
src/__tests__/singularity-fusion-integration.test.ts:142:      const result = await invoke('autoheal_heal_avatar_module');
src/__tests__/singularity-fusion-integration.test.ts:148:      const history = await invoke('autoheal_get_history');
src/__tests__/singularity-fusion-integration.test.ts:155:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:164:      await expect(invoke('performance_throttle_cpu')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:168:      await expect(invoke('performance_optimize_gpu')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:172:      await expect(invoke('performance_compress_memory')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:178:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-integration.test.ts:183:      const threats = await invoke('crashguard_get_active_threats');
src/__tests__/singularity-fusion-integration.test.ts:188:      const stats = await invoke('crashguard_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:196:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-integration.test.ts:202:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-integration.test.ts:209:      const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/singularity-fusion-integration.test.ts:215:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:219:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:225:      const broken = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-integration.test.ts:229:      const healResult = await invoke('autoheal_heal_cognitive_module');
src/__tests__/singularity-fusion-integration.test.ts:233:      await invoke('autoheal_resync_state');
src/__tests__/singularity-fusion-integration.test.ts:236:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:243:        await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:244:        await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:245:        await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:249:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:258:      await invoke('singularity_reset');
src/__tests__/singularity-fusion-integration.test.ts:259:      await invoke('autofix_reset');
src/__tests__/singularity-fusion-integration.test.ts:260:      await invoke('autoheal_reset');
src/__tests__/singularity-fusion-integration.test.ts:261:      await invoke('performance_reset_optimizations');
src/__tests__/singularity-fusion-integration.test.ts:264:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:267:      const fixStats = await invoke('autofix_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:272:      const baselineState = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:274:      const snapshotId = await invoke('singularity_create_snapshot', {
src/__tests__/singularity-fusion-integration.test.ts:280:      await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:283:      await invoke('singularity_restore_snapshot', { snapshotId });
src/__tests__/singularity-fusion-integration.test.ts:286:      const state = await invoke('singularity_get_fusion_state');
src/os/bridge/TauriBridge.ts:7:import { listen, emit as tauriEmit, type UnlistenFn } from '@tauri-apps/api/event';
src/os/bridge/TauriBridge.ts:32:      await this.invoke('ping');
src/os/bridge/TauriBridge.ts:162:    return Promise.all(commands.map(cmd => this.invoke(cmd.name, cmd.args))) as Promise<
src/os/bridge/TauriBridge.ts:172:      await this.invoke('ping');
src/os/bridge/StateBridge.ts:84:      await this.bridge.invoke('set_state', { key, value });
src/os/bridge/StateBridge.ts:116:      await this.bridge.invoke('delete_state', { key });
src/os/bridge/StateBridge.ts:225:        await this.bridge.invoke('set_state', { key, value });
src/__tests__/integration/TauriIntegration.test.tsx:7:import { invoke } from '@tauri-apps/api/core';
src/__tests__/integration/TauriIntegration.test.tsx:8:import { Window } from '@tauri-apps/api/window';
src/__tests__/integration/TauriIntegration.test.tsx:11:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/integration/TauriIntegration.test.tsx:15:vi.mock('@tauri-apps/api/window', () => ({
src/__tests__/integration/TauriIntegration.test.tsx:33:      const result = await invoke('get_system_info');
src/__tests__/integration/TauriIntegration.test.tsx:42:      await invoke('save_settings', { theme: 'dark', language: 'fr' });
src/__tests__/integration/TauriIntegration.test.tsx:53:      await expect(invoke('invalid_command')).rejects.toThrow('Backend error');
src/__tests__/integration/TauriIntegration.test.tsx:144:      const result = await invoke('store_memory', {
src/__tests__/integration/TauriIntegration.test.tsx:158:      const memories = await invoke('get_memories', { tier: 'STM' });
src/__tests__/integration/TauriIntegration.test.tsx:166:      await invoke('delete_memory', { id: '123' });
src/__tests__/integration/TauriIntegration.test.tsx:180:      const metrics = await invoke('get_performance_metrics');
src/__tests__/integration/TauriIntegration.test.tsx:199:      const metrics1 = await invoke('get_performance_metrics');
src/__tests__/integration/TauriIntegration.test.tsx:200:      const metrics2 = await invoke('get_performance_metrics');
src/__tests__/services/ai/ollamaTransportAbort.test.ts:5:vi.mock('@tauri-apps/api/core', () => ({
src/test/integration.test.ts:20:import * as tauriCore from '@tauri-apps/api/core';
src/test/integration.test.ts:23:vi.mock('@tauri-apps/api/core');
src/__tests__/hooks/useSingularity.test.tsx:10:vi.mock('@tauri-apps/api/core', () => ({
src/test/setup.ts:649:// Mock @tauri-apps/api
src/test/setup.ts:650:vi.mock('@tauri-apps/api/core', () => ({
src/test/setup.ts:654:vi.mock('@tauri-apps/api/event', () => ({
src/__tests__/hooks/useChat.test.tsx:11:vi.mock('@tauri-apps/api/core', () => ({
src/components/__tests__/evolutionEngine.test.ts:48:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/hooks/useWindowControls.test.tsx:10:vi.mock('@tauri-apps/api/event', () => ({
src/__tests__/services/performanceEngine/performanceEngine.test.ts:541:    expect(snapshot.frontend.tauri.invokeLatency).toBeGreaterThanOrEqual(0);
src/__tests__/e2e-automated-validation.test.tsx:1770:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/e2e-automated-validation.test.tsx:1942:  const { invoke } = vi.mocked(await import('@tauri-apps/api/core'));
src/__tests__/e2e-automated-validation.test.tsx:1949:        const intention = (await invoke('pipeline_analyze_intention', {
src/__tests__/e2e-automated-validation.test.tsx:1953:        const response = (await invoke('pipeline_generate_cognitive_response', {
src/__tests__/e2e-automated-validation.test.tsx:1986:        const rustWarnings = await invoke('autofix_detect_rust_warnings');
src/__tests__/e2e-automated-validation.test.tsx:1987:        const tsErrors = await invoke('autofix_detect_typescript_errors');
src/__tests__/e2e-automated-validation.test.tsx:1988:        const brokenModules = await invoke('autoheal_detect_broken_modules');
src/__tests__/e2e-automated-validation.test.tsx:1995:          await invoke('autofix_fix_all');
src/__tests__/e2e-automated-validation.test.tsx:2000:            await invoke('autoheal_heal_cognitive_module', {
src/__tests__/e2e-automated-validation.test.tsx:2007:        const integrity = await invoke('singularity_check_integrity');
src/__tests__/e2e-automated-validation.test.tsx:2025:        const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/e2e-automated-validation.test.tsx:2029:        const animation = await invoke('pipeline_prepare_avatar_animation', {
src/__tests__/e2e-automated-validation.test.tsx:2049:        const state = await invoke('singularity_get_fusion_state');
src/__tests__/e2e-automated-validation.test.tsx:2050:        const metrics = await invoke('performance_get_metrics');
src/__tests__/e2e-automated-validation.test.tsx:2066:      const intention = (await invoke('pipeline_analyze_intention', {
src/__tests__/e2e-automated-validation.test.tsx:2070:      const response = (await invoke('pipeline_generate_cognitive_response', {
src/__tests__/e2e-automated-validation.test.tsx:2086:        const metrics = await invoke('performance_get_metrics');
src/__tests__/e2e-automated-validation.test.tsx:2102:            invoke('singularity_get_fusion_state'),
src/__tests__/e2e-automated-validation.test.tsx:2103:            invoke('performance_get_metrics'),
src/__tests__/e2e-automated-validation.test.tsx:2104:            invoke('pipeline_get_stats'),
src/__tests__/e2e-automated-validation.test.tsx:2127:        void (await invoke('crashguard_detect_threats'));
src/__tests__/e2e-automated-validation.test.tsx:2128:        const broken = await invoke('autoheal_detect_broken_modules');
src/__tests__/e2e-automated-validation.test.tsx:2132:          const healed = await invoke('autoheal_heal_cognitive_module', {
src/__tests__/e2e-automated-validation.test.tsx:2140:        const integrity = await invoke('singularity_check_integrity');
src/__tests__/e2e-automated-validation.test.tsx:2151:      const state = (await invoke('singularity_get_fusion_state')) as FusionStateResponse;
src/__tests__/e2e-automated-validation.test.tsx:2152:      const integrity = (await invoke('singularity_check_integrity')) as number;
src/__tests__/e2e-automated-validation.test.tsx:2153:      const metrics = (await invoke('performance_get_metrics')) as PerformanceMetrics;
src/__tests__/e2e-automated-validation.test.tsx:2154:      const stats = (await invoke('autofix_get_stats')) as AutoFixStats;
src/__tests__/e2e-automated-validation.test.tsx:2167:        const metrics = (await invoke('performance_get_metrics')) as {
src/__tests__/e2e-automated-validation.test.tsx:2183:      const fusionState = (await invoke(
src/__tests__/e2e-automated-validation.test.tsx:2189:      const pipelineStats = (await invoke('pipeline_get_stats')) as PipelineStats;
src/__tests__/e2e-automated-validation.test.tsx:2193:      const perfMetrics = (await invoke('performance_get_metrics')) as PerformanceMetrics;
src/__tests__/e2e-automated-validation.test.tsx:2197:      const threats = (await invoke('crashguard_detect_threats')) as unknown[];
src/__tests__/e2e-automated-validation.test.tsx:2201:      const autofixStats = (await invoke('autofix_get_stats')) as AutoFixStats;
src/apps/devtools/hooks/useDevToolsEvents.ts:8:import { listen, UnlistenFn } from '@tauri-apps/api/event';
src/config/offline-first.ts:29:  // Use invoke('ollama_generate') instead of direct HTTP
src/components/performance/MetricsGraph.tsx:601:      return snapshot.frontend.tauri.invokeLatency;
src/apps/devtools/utils/mockEvents.ts:8:import { emit } from '@tauri-apps/api/event';
src/__tests__/lib/security/secureInvokeAbort.test.ts:5:vi.mock('@tauri-apps/api/core', () => ({
src/components/ChatErrorBoundary.tsx:358:      // await invoke('report_chat_error', {
src/entry.ts:16:      await invoke('boot_marker_log', { marker });
src/utils/invoke.ts:11: * Wrapper universel pour invoke() avec gestion d'erreur automatique
src/utils/invoke.ts:36: * Wrapper pour invoke() avec retry automatique
src/utils/invoke.ts:78: * Wrapper pour invoke() avec timeout
src/ui/reading/UIReadingProvider.tsx:181:        const { getCurrentWindow } = await import('@tauri-apps/api/window');
src/utils/tauriFsAdapter.ts:27:let tauriPath: typeof import('@tauri-apps/api/path') | null = null;
src/utils/tauriFsAdapter.ts:39:      tauriPath = await import('@tauri-apps/api/path');
src/utils/tauriFsAdapter.ts:121: * Tauri: uses @tauri-apps/api/fs exists()
src/utils/tauriFsAdapter.ts:143: * Tauri: uses @tauri-apps/api/fs readTextFile()
src/utils/tauriFsAdapter.ts:165: * Tauri: uses @tauri-apps/api/fs writeTextFile()
src/utils/tauriFsAdapter.ts:228:   * Tauri: uses @tauri-apps/api/fs createDir()
src/utils/tauriFsAdapter.ts:252:   * Tauri: uses @tauri-apps/api/fs readDir()
src/utils/tauriFsAdapter.ts:331: * - ✅ Real Tauri filesystem APIs (@tauri-apps/api/fs)
src/utils/tauriProtector.ts:186:    invoke: typeof import('@tauri-apps/api/core').invoke;
src/utils/tauriProtector.ts:444:    invoke: typeof import('@tauri-apps/api/core').invoke;
src/utils/tauriProtector.ts:458:      const module = await import('@tauri-apps/api/core');
src/components/ErrorBoundary.tsx:85:    // 4. Tauri command: invoke('watchdog:report_ui_error', { errorReport })
src/context/TitanStateContext.tsx:25:import { listen } from '@tauri-apps/api/event';
src/core/commands/TAURI_COMMANDS.ts:222: * Helper pour invoke() avec validation et protection robuste
src/core/commands/TAURI_COMMANDS.ts:234:    const tauriCore = await import('@tauri-apps/api/core');
src/hooks/__tests__/fusion-hooks.test.ts:20:// Mock @tauri-apps/api avec invoke simplifié
src/hooks/__tests__/fusion-hooks.test.ts:21:vi.mock('@tauri-apps/api/core', () => ({
src/hooks/__tests__/fusion-hooks.test.ts:54:import { invoke } from '@tauri-apps/api/core';
src/hooks/useMultimodalPresence.ts:285:    // 1. Engine call: multimodalPresenceEngine.activateMirroring() or invoke('presence:activate_mirroring')
src/hooks/useMultimodalPresence.ts:296:    // 1. Engine call: multimodalPresenceEngine.deactivateMirroring() or invoke('presence:deactivate_mirroring')
src/hooks/useWhisperStream.ts:27:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/core/devops/LocalAgentEngine.ts:960:      // 1. Tauri: invoke('fs_exists', {path}) - requires Tauri command registration
src/core/devops/LocalAgentEngine.ts:972:      // 1. Tauri: invoke('read_json_file', {path}) - type-safe, sandboxed
src/core/devops/VisualDevOpsEngine.ts:816:    // 2. Tauri filesystem: Use invoke('fs:write_file', { path, content }) to save
src/modules/devSudo/talkHandlersStubs.ts:14:1. Update imports: Use @tauri-apps/plugin-fs instead of @tauri-apps/api/fs
src/core/identity/defaultIdentityMatrix.ts:286:    const { invoke } = await import('@tauri-apps/api/core');
src/main.tsx:180:  void import('@tauri-apps/api/event')
src/main.tsx:643:    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
src/hooks/useDevicePermissions.ts:266:  // - API: await invoke('plugin:screenshots|capture', {monitor: 0})
src/hooks/useWindowControls.ts:6:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/modules/devSudo/devSudoBackendHandlers.ts:125:   invoke('memory_scan') → #[tauri::command] memory_scan()
src/modules/devSudo/devSudoBackendHandlers.ts:126:   invoke('secure_store_key') → #[tauri::command] secure_store_key()
src/modules/devSudo/devSudoBackendHandlers.ts:127:   invoke('camera_start') → #[tauri::command] camera_start()
src/modules/devSudo/devSudoBackendHandlers.ts:298:   invoke('${handlerName}').then(console.log).catch(console.error)
src/modules/devSudo/devSudoSingularityHandlers.ts:948:  await invoke('command');
src/lib/logger.ts:285:      // await invoke('log_to_file', { entry: this.formatEntry(_entry) });
src/lib/security.ts:1901:      const tauriCore = await import('@tauri-apps/api/core');
src/services/tauri/chatEngine.commands.ts:14:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/api/index.ts:15: * Remplace les `invoke()` dispersés par une API cohérente + cache + validation.
src/services/api/index.ts:126: * Phase 2 (Semaine 2): Refactor tous les invoke() existants
src/services/api/index.ts:130: * grep -r "invoke(" src/ --include="*.ts" --include="*.tsx"
src/services/api/index.ts:136: *    `invoke('memory_get_active_projects')`
src/services/api/index.ts:140: *    `invoke('conversation_generate', { args: { message, conversationId, mode } })`
src/services/api/index.ts:144: *    `invoke('speak', { text })`
src/services/api/index.ts:148: *    `invoke('persona_get_multipliers')`
src/services/api/index.ts:152: *    `invoke('system_get_status')`
src/services/autoAuditEngine.ts:451:      //   import { writeTextFile } from '@tauri-apps/api/fs';
src/services/api/chat.ts:9:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/unified/__tests__/VectorStoreClient.test.ts:12:vi.mock('@tauri-apps/api/core', () => ({
src/lib/tauriClient.ts:5: * - `invoke()` autorisé uniquement dans ce fichier
src/lib/tauriClient.ts:53: * **RÈGLE CRITIQUE:** Aucun appel `invoke()` direct autorisé hors de ce fichier
src/lib/tauriClient.ts:108:    return await this.invoke(
src/lib/tauriClient.ts:115:    return await this.invoke(
src/lib/tauriClient.ts:122:    return await this.invoke(
src/lib/tauriClient.ts:129:    return await this.invoke(
src/lib/tauriClient.ts:136:    return await this.invoke(
src/lib/tauriClient.ts:143:    return await this.invoke(
src/lib/tauriClient.ts:150:    return await this.invoke(
src/lib/tauriClient.ts:157:    return await this.invoke(
src/lib/tauriClient.ts:164:    return await this.invoke(
src/lib/tauriClient.ts:171:    return await this.invoke(
src/lib/tauriClient.ts:178:    return await this.invoke(
src/lib/tauriClient.ts:185:    return await this.invoke(
src/lib/tauriClient.ts:192:    return await this.invoke(
src/lib/tauriClient.ts:199:    return await this.invoke(
src/lib/tauriClient.ts:206:    return await this.invoke(
src/lib/tauriClient.ts:213:    return await this.invoke(
src/lib/tauriClient.ts:220:    return await this.invoke(
src/lib/tauriClient.ts:227:    return await this.invoke(
src/lib/tauriClient.ts:234:    return await this.invoke(
src/lib/tauriClient.ts:241:    return await this.invoke(
src/lib/tauriClient.ts:248:    return await this.invoke(
src/lib/tauriClient.ts:255:    return await this.invoke(
src/lib/tauriClient.ts:262:    return await this.invoke(
src/lib/tauriClient.ts:269:    return await this.invoke(
src/lib/tauriClient.ts:276:    return await this.invoke(
src/lib/tauriClient.ts:283:    return await this.invoke(
src/lib/tauriClient.ts:290:    return await this.invoke(
src/lib/tauriClient.ts:297:    return await this.invoke(
src/lib/tauriClient.ts:304:    return await this.invoke(
src/lib/tauriClient.ts:311:    return await this.invoke(
src/lib/tauriClient.ts:318:    return await this.invoke(
src/lib/tauriClient.ts:325:    return await this.invoke(
src/lib/tauriClient.ts:332:    return await this.invoke(
src/lib/tauriClient.ts:339:    return await this.invoke(
src/lib/tauriClient.ts:346:    return await this.invoke(
src/lib/tauriClient.ts:353:    return await this.invoke(
src/lib/tauriClient.ts:360:    return await this.invoke(
src/lib/tauriClient.ts:367:    return await this.invoke(
src/lib/tauriClient.ts:374:    return await this.invoke(
src/lib/tauriClient.ts:381:    return await this.invoke(
src/lib/tauriClient.ts:388:    return await this.invoke(
src/lib/tauriClient.ts:395:    return await this.invoke(
src/lib/tauriClient.ts:402:    return await this.invoke(
src/lib/tauriClient.ts:409:    return await this.invoke(
src/lib/tauriClient.ts:416:    return await this.invoke(
src/lib/tauriClient.ts:423:    return await this.invoke(
src/lib/tauriClient.ts:430:    return await this.invoke(
src/lib/tauriClient.ts:439:    return await this.invoke(
src/lib/tauriClient.ts:446:    return await this.invoke(
src/lib/tauriClient.ts:453:    return await this.invoke(
src/lib/tauriClient.ts:460:    return await this.invoke(
src/lib/tauriClient.ts:467:    return await this.invoke(
src/lib/tauriClient.ts:474:    return await this.invoke(
src/lib/tauriClient.ts:481:    return await this.invoke(
src/lib/tauriClient.ts:488:    return await this.invoke(
src/lib/tauriClient.ts:495:    return await this.invoke(
src/lib/tauriClient.ts:502:    return await this.invoke(
src/lib/tauriClient.ts:509:    return await this.invoke(
src/lib/tauriClient.ts:516:    return await this.invoke(
src/lib/tauriClient.ts:523:    return await this.invoke(
src/lib/tauriClient.ts:530:    return await this.invoke(
src/lib/tauriClient.ts:537:    return await this.invoke(
src/lib/tauriClient.ts:544:    return await this.invoke(
src/lib/tauriClient.ts:551:    return await this.invoke(
src/lib/tauriClient.ts:558:    return await this.invoke(
src/lib/tauriClient.ts:565:    return await this.invoke(
src/lib/tauriClient.ts:572:    return await this.invoke(
src/lib/tauriClient.ts:579:    return await this.invoke(
src/lib/tauriClient.ts:586:    return await this.invoke(
src/lib/tauriClient.ts:593:    return await this.invoke(
src/lib/tauriClient.ts:600:    return await this.invoke(
src/lib/tauriClient.ts:607:    return await this.invoke(
src/lib/tauriClient.ts:614:    return await this.invoke(
src/lib/tauriClient.ts:621:    return await this.invoke(
src/lib/tauriClient.ts:628:    return await this.invoke(
src/lib/tauriClient.ts:635:    return await this.invoke(
src/lib/tauriClient.ts:642:    return await this.invoke(
src/lib/tauriClient.ts:649:    return await this.invoke(
src/lib/tauriClient.ts:656:    return await this.invoke(
src/lib/tauriClient.ts:663:    return await this.invoke(
src/lib/tauriClient.ts:670:    return await this.invoke(
src/lib/tauriClient.ts:677:    return await this.invoke(
src/lib/tauriClient.ts:684:    return await this.invoke(
src/lib/tauriClient.ts:691:    return await this.invoke(
src/lib/tauriClient.ts:698:    return await this.invoke(
src/lib/tauriClient.ts:705:    return await this.invoke(
src/lib/tauriClient.ts:712:    return await this.invoke(
src/lib/tauriClient.ts:719:    return await this.invoke(
src/lib/tauriClient.ts:726:    return await this.invoke(
src/lib/tauriClient.ts:733:    return await this.invoke(
src/lib/tauriClient.ts:740:    return await this.invoke(
src/lib/tauriClient.ts:747:    return await this.invoke(
src/lib/tauriClient.ts:754:    return await this.invoke(
src/lib/tauriClient.ts:761:    return await this.invoke(
src/lib/tauriClient.ts:768:    return await this.invoke(
src/lib/tauriClient.ts:775:    return await this.invoke(
src/lib/tauriClient.ts:782:    return await this.invoke(
src/lib/tauriClient.ts:789:    return await this.invoke(
src/lib/tauriClient.ts:796:    return await this.invoke(
src/lib/tauriClient.ts:803:    return await this.invoke(
src/lib/tauriClient.ts:810:    return await this.invoke(
src/lib/tauriClient.ts:817:    return await this.invoke(
src/lib/tauriClient.ts:824:    return await this.invoke(
src/lib/tauriClient.ts:831:    return await this.invoke(
src/lib/tauriClient.ts:838:    return await this.invoke(
src/lib/tauriClient.ts:845:    return await this.invoke(
src/lib/tauriClient.ts:852:    return await this.invoke(
src/lib/tauriClient.ts:859:    return await this.invoke(
src/lib/tauriClient.ts:866:    return await this.invoke(
src/lib/tauriClient.ts:873:    return await this.invoke(
src/lib/tauriClient.ts:880:    return await this.invoke(
src/lib/tauriClient.ts:887:    return await this.invoke(
src/lib/tauriClient.ts:894:    return await this.invoke(
src/lib/tauriClient.ts:901:    return await this.invoke(
src/lib/tauriClient.ts:908:    return await this.invoke(
src/lib/tauriClient.ts:915:    return await this.invoke(
src/lib/tauriClient.ts:922:    return await this.invoke(
src/lib/tauriClient.ts:929:    return await this.invoke(
src/lib/tauriClient.ts:936:    return await this.invoke(
src/lib/tauriClient.ts:943:    return await this.invoke(
src/lib/tauriClient.ts:950:    return await this.invoke(
src/lib/tauriClient.ts:957:    return await this.invoke(
src/lib/tauriClient.ts:964:    return await this.invoke(
src/lib/tauriClient.ts:971:    return await this.invoke(
src/lib/tauriClient.ts:978:    return await this.invoke(
src/lib/tauriClient.ts:985:    return await this.invoke(
src/lib/tauriClient.ts:992:    return await this.invoke(
src/lib/tauriClient.ts:999:    return await this.invoke(
src/lib/tauriClient.ts:1006:    return await this.invoke(
src/lib/tauriClient.ts:1013:    return await this.invoke(
src/lib/tauriClient.ts:1020:    return await this.invoke(
src/lib/tauriClient.ts:1027:    return await this.invoke(
src/lib/tauriClient.ts:1034:    return await this.invoke(
src/lib/tauriClient.ts:1041:    return await this.invoke(
src/lib/tauriClient.ts:1048:    return await this.invoke(
src/lib/tauriClient.ts:1055:    return await this.invoke(
src/lib/tauriClient.ts:1062:    return await this.invoke(
src/lib/tauriClient.ts:1069:    return await this.invoke(
src/lib/tauriClient.ts:1076:    return await this.invoke(
src/lib/tauriClient.ts:1083:    return await this.invoke(
src/lib/tauriClient.ts:1090:    return await this.invoke(
src/lib/tauriClient.ts:1097:    return await this.invoke(
src/lib/tauriClient.ts:1104:    return await this.invoke(
src/lib/tauriClient.ts:1111:    return await this.invoke(
src/lib/tauriClient.ts:1118:    return await this.invoke(
src/lib/tauriClient.ts:1125:    return await this.invoke(
src/lib/tauriClient.ts:1132:    return await this.invoke(
src/lib/tauriClient.ts:1139:    return await this.invoke(
src/lib/tauriClient.ts:1146:    return await this.invoke(
src/lib/tauriClient.ts:1153:    return await this.invoke(
src/lib/tauriClient.ts:1160:    return await this.invoke(
src/lib/tauriClient.ts:1167:    return await this.invoke(
src/lib/tauriClient.ts:1174:    return await this.invoke(
src/lib/tauriClient.ts:1181:    return await this.invoke(
src/lib/tauriClient.ts:1188:    return await this.invoke(
src/lib/tauriClient.ts:1195:    return await this.invoke(
src/lib/tauriClient.ts:1202:    return await this.invoke(
src/lib/tauriClient.ts:1209:    return await this.invoke(
src/lib/tauriClient.ts:1216:    return await this.invoke(
src/lib/tauriClient.ts:1223:    return await this.invoke(
src/lib/tauriClient.ts:1230:    return await this.invoke(
src/lib/tauriClient.ts:1237:    return await this.invoke(
src/lib/tauriClient.ts:1244:    return await this.invoke(
src/lib/tauriClient.ts:1251:    return await this.invoke(
src/lib/tauriClient.ts:1258:    return await this.invoke(
src/lib/tauriClient.ts:1265:    return await this.invoke(
src/lib/tauriClient.ts:1272:    return await this.invoke(
src/lib/tauriClient.ts:1279:    return await this.invoke(
src/lib/tauriClient.ts:1286:    return await this.invoke(
src/lib/tauriClient.ts:1293:    return await this.invoke(
src/lib/tauriClient.ts:1300:    return await this.invoke(
src/lib/tauriClient.ts:1307:    return await this.invoke(
src/lib/tauriClient.ts:1314:    return await this.invoke(
src/lib/tauriClient.ts:1321:    return await this.invoke(
src/lib/tauriClient.ts:1328:    return await this.invoke(
src/lib/tauriClient.ts:1335:    return await this.invoke(
src/lib/tauriClient.ts:1342:    return await this.invoke(
src/lib/tauriClient.ts:1349:    return await this.invoke(
src/lib/tauriClient.ts:1356:    return await this.invoke(
src/lib/tauriClient.ts:1363:    return await this.invoke(
src/lib/tauriClient.ts:1370:    return await this.invoke(
src/lib/tauriClient.ts:1377:    return await this.invoke(
src/lib/tauriClient.ts:1384:    return await this.invoke(
src/lib/tauriClient.ts:1391:    return await this.invoke(
src/lib/tauriClient.ts:1398:    return await this.invoke(
src/lib/tauriClient.ts:1405:    return await this.invoke(
src/lib/tauriClient.ts:1412:    return await this.invoke(
src/lib/tauriClient.ts:1419:    return await this.invoke(
src/lib/tauriClient.ts:1426:    return await this.invoke(
src/lib/tauriClient.ts:1433:    return await this.invoke(
src/lib/tauriClient.ts:1440:    return await this.invoke(
src/lib/tauriClient.ts:1447:    return await this.invoke(
src/lib/tauriClient.ts:1454:    return await this.invoke(
src/lib/tauriClient.ts:1461:    return await this.invoke(
src/lib/tauriClient.ts:1468:    return await this.invoke(
src/lib/tauriClient.ts:1475:    return await this.invoke(
src/lib/tauriClient.ts:1482:    return await this.invoke(
src/lib/tauriClient.ts:1489:    return await this.invoke(
src/lib/tauriClient.ts:1496:    return await this.invoke(
src/lib/tauriClient.ts:1503:    return await this.invoke(
src/lib/tauriClient.ts:1510:    return await this.invoke(
src/lib/tauriClient.ts:1517:    return await this.invoke(
src/lib/tauriClient.ts:1524:    return await this.invoke(
src/lib/tauriClient.ts:1531:    return await this.invoke(
src/lib/tauriClient.ts:1538:    return await this.invoke(
src/lib/tauriClient.ts:1545:    return await this.invoke(
src/lib/tauriClient.ts:1552:    return await this.invoke(
src/lib/tauriClient.ts:1559:    return await this.invoke(
src/lib/tauriClient.ts:1566:    return await this.invoke(
src/lib/tauriClient.ts:1573:    return await this.invoke(
src/lib/tauriClient.ts:1580:    return await this.invoke(
src/lib/tauriClient.ts:1587:    return await this.invoke(
src/lib/tauriClient.ts:1594:    return await this.invoke(
src/lib/tauriClient.ts:1601:    return await this.invoke(
src/lib/tauriClient.ts:1608:    return await this.invoke(
src/lib/tauriClient.ts:1615:    return await this.invoke(
src/lib/tauriClient.ts:1622:    return await this.invoke(
src/lib/tauriClient.ts:1629:    return await this.invoke(
src/lib/tauriClient.ts:1636:    return await this.invoke(
src/lib/tauriClient.ts:1643:    return await this.invoke(
src/lib/tauriClient.ts:1650:    return await this.invoke(
src/lib/tauriClient.ts:1657:    return await this.invoke(
src/lib/tauriClient.ts:1664:    return await this.invoke(
src/lib/tauriClient.ts:1671:    return await this.invoke(
src/lib/tauriClient.ts:1678:    return await this.invoke(
src/lib/tauriClient.ts:1685:    return await this.invoke(
src/lib/tauriClient.ts:1692:    return await this.invoke(
src/lib/tauriClient.ts:1699:    return await this.invoke(
src/lib/tauriClient.ts:1706:    return await this.invoke(
src/lib/tauriClient.ts:1713:    return await this.invoke(
src/lib/tauriClient.ts:1720:    return await this.invoke(
src/lib/tauriClient.ts:1727:    return await this.invoke(
src/lib/tauriClient.ts:1734:    return await this.invoke(
src/lib/tauriClient.ts:1741:    return await this.invoke(
src/lib/tauriClient.ts:1748:    return await this.invoke(
src/lib/tauriClient.ts:1755:    return await this.invoke(
src/lib/tauriClient.ts:1762:    return await this.invoke(
src/lib/tauriClient.ts:1769:    return await this.invoke(
src/lib/tauriClient.ts:1776:    return await this.invoke(
src/lib/tauriClient.ts:1783:    return await this.invoke(
src/lib/tauriClient.ts:1790:    return await this.invoke(
src/lib/tauriClient.ts:1797:    return await this.invoke(
src/lib/tauriClient.ts:1804:    return await this.invoke(
src/lib/tauriClient.ts:1811:    return await this.invoke(
src/lib/tauriClient.ts:1818:    return await this.invoke(
src/lib/tauriClient.ts:1825:    return await this.invoke(
src/lib/tauriClient.ts:1832:    return await this.invoke(
src/lib/tauriClient.ts:1839:    return await this.invoke(
src/lib/tauriClient.ts:1846:    return await this.invoke(
src/lib/tauriClient.ts:1853:    return await this.invoke(
src/lib/tauriClient.ts:1860:    return await this.invoke(
src/lib/tauriClient.ts:1867:    return await this.invoke(
src/lib/tauriClient.ts:1874:    return await this.invoke(
src/lib/tauriClient.ts:1881:    return await this.invoke(
src/lib/tauriClient.ts:1888:    return await this.invoke(
src/lib/tauriClient.ts:1895:    return await this.invoke(
src/lib/tauriClient.ts:1902:    return await this.invoke(
src/lib/tauriClient.ts:1909:    return await this.invoke(
src/lib/tauriClient.ts:1916:    return await this.invoke(
src/lib/tauriClient.ts:1923:    return await this.invoke(
src/lib/tauriClient.ts:1930:    return await this.invoke(
src/lib/tauriClient.ts:1937:    return await this.invoke(
src/lib/tauriClient.ts:1944:    return await this.invoke(
src/lib/tauriClient.ts:1951:    return await this.invoke(
src/lib/tauriClient.ts:1958:    return await this.invoke(
src/lib/tauriClient.ts:1965:    return await this.invoke(
src/lib/tauriClient.ts:1972:    return await this.invoke(
src/lib/tauriClient.ts:1979:    return await this.invoke(
src/lib/tauriClient.ts:1986:    return await this.invoke(
src/lib/tauriClient.ts:1993:    return await this.invoke(
src/lib/tauriClient.ts:2000:    return await this.invoke(
src/lib/tauriClient.ts:2007:    return await this.invoke(
src/lib/tauriClient.ts:2014:    return await this.invoke(
src/lib/tauriClient.ts:2021:    return await this.invoke(
src/lib/tauriClient.ts:2028:    return await this.invoke(
src/lib/tauriClient.ts:2035:    return await this.invoke(
src/lib/tauriClient.ts:2042:    return await this.invoke(
src/lib/tauriClient.ts:2049:    return await this.invoke(
src/lib/tauriClient.ts:2056:    return await this.invoke(
src/lib/tauriClient.ts:2063:    return await this.invoke(
src/lib/tauriClient.ts:2070:    return await this.invoke(
src/lib/tauriClient.ts:2077:    return await this.invoke(
src/lib/tauriClient.ts:2084:    return await this.invoke(
src/lib/tauriClient.ts:2091:    return await this.invoke(
src/lib/tauriClient.ts:2098:    return await this.invoke(
src/lib/tauriClient.ts:2105:    return await this.invoke(
src/lib/tauriClient.ts:2112:    return await this.invoke(
src/lib/tauriClient.ts:2119:    return await this.invoke(
src/lib/tauriClient.ts:2126:    return await this.invoke(
src/lib/tauriClient.ts:2133:    return await this.invoke(
src/lib/tauriClient.ts:2140:    return await this.invoke(
src/lib/tauriClient.ts:2147:    return await this.invoke(
src/lib/tauriClient.ts:2154:    return await this.invoke(
src/lib/tauriClient.ts:2161:    return await this.invoke(
src/lib/tauriClient.ts:2168:    return await this.invoke(
src/lib/tauriClient.ts:2175:    return await this.invoke(
src/lib/tauriClient.ts:2182:    return await this.invoke(
src/lib/tauriClient.ts:2189:    return await this.invoke(
src/lib/tauriClient.ts:2196:    return await this.invoke(
src/lib/tauriClient.ts:2203:    return await this.invoke(
src/lib/tauriClient.ts:2210:    return await this.invoke(
src/lib/tauriClient.ts:2217:    return await this.invoke(
src/lib/tauriClient.ts:2224:    return await this.invoke(
src/lib/tauriClient.ts:2231:    return await this.invoke(
src/lib/tauriClient.ts:2238:    return await this.invoke(
src/lib/tauriClient.ts:2245:    return await this.invoke(
src/lib/tauriClient.ts:2252:    return await this.invoke(
src/lib/tauriClient.ts:2259:    return await this.invoke(
src/lib/tauriClient.ts:2266:    return await this.invoke(
src/lib/tauriClient.ts:2273:    return await this.invoke(
src/lib/tauriClient.ts:2280:    return await this.invoke(
src/lib/tauriClient.ts:2287:    return await this.invoke(
src/lib/tauriClient.ts:2294:    return await this.invoke(
src/lib/tauriClient.ts:2301:    return await this.invoke(
src/lib/tauriClient.ts:2308:    return await this.invoke(
src/lib/tauriClient.ts:2315:    return await this.invoke(
src/lib/tauriClient.ts:2322:    return await this.invoke(
src/lib/tauriClient.ts:2329:    return await this.invoke(
src/lib/tauriClient.ts:2336:    return await this.invoke(
src/lib/tauriClient.ts:2343:    return await this.invoke(
src/lib/tauriClient.ts:2350:    return await this.invoke(
src/lib/tauriClient.ts:2357:    return await this.invoke(
src/lib/tauriClient.ts:2364:    return await this.invoke(
src/lib/tauriClient.ts:2371:    return await this.invoke(
src/lib/tauriClient.ts:2378:    return await this.invoke(
src/lib/tauriClient.ts:2385:    return await this.invoke(
src/lib/tauriClient.ts:2392:    return await this.invoke(
src/lib/tauriClient.ts:2399:    return await this.invoke(
src/lib/tauriClient.ts:2406:    return await this.invoke(
src/lib/tauriClient.ts:2413:    return await this.invoke(
src/lib/tauriClient.ts:2420:    return await this.invoke(
src/lib/tauriClient.ts:2427:    return await this.invoke(
src/lib/tauriClient.ts:2434:    return await this.invoke(
src/lib/tauriClient.ts:2441:    return await this.invoke(
src/lib/tauriClient.ts:2448:    return await this.invoke(
src/lib/tauriClient.ts:2455:    return await this.invoke(
src/lib/tauriClient.ts:2462:    return await this.invoke(
src/lib/tauriClient.ts:2469:    return await this.invoke(
src/lib/tauriClient.ts:2476:    return await this.invoke(
src/lib/tauriClient.ts:2483:    return await this.invoke(
src/lib/tauriClient.ts:2490:    return await this.invoke(
src/lib/tauriClient.ts:2497:    return await this.invoke(
src/lib/tauriClient.ts:2504:    return await this.invoke(
src/lib/tauriClient.ts:2511:    return await this.invoke(
src/lib/tauriClient.ts:2518:    return await this.invoke(
src/lib/tauriClient.ts:2525:    return await this.invoke(
src/lib/tauriClient.ts:2532:    return await this.invoke(
src/lib/tauriClient.ts:2539:    return await this.invoke(
src/lib/tauriClient.ts:2546:    return await this.invoke(
src/lib/tauriClient.ts:2553:    return await this.invoke(
src/lib/tauriClient.ts:2560:    return await this.invoke(
src/lib/tauriClient.ts:2567:    return await this.invoke(
src/lib/tauriClient.ts:2574:    return await this.invoke(
src/lib/tauriClient.ts:2581:    return await this.invoke(
src/lib/tauriClient.ts:2588:    return await this.invoke(
src/lib/tauriClient.ts:2595:    return await this.invoke(
src/lib/tauriClient.ts:2602:    return await this.invoke(
src/lib/tauriClient.ts:2609:    return await this.invoke(
src/lib/tauriClient.ts:2616:    return await this.invoke(
src/lib/tauriClient.ts:2623:    return await this.invoke(
src/lib/tauriClient.ts:2630:    return await this.invoke(
src/lib/tauriClient.ts:2637:    return await this.invoke(
src/lib/tauriClient.ts:2644:    return await this.invoke(
src/lib/tauriClient.ts:2651:    return await this.invoke(
src/lib/tauriClient.ts:2658:    return await this.invoke(
src/lib/tauriClient.ts:2665:    return await this.invoke(
src/lib/tauriClient.ts:2672:    return await this.invoke(
src/lib/tauriClient.ts:2679:    return await this.invoke(
src/lib/tauriClient.ts:2686:    return await this.invoke(
src/lib/tauriClient.ts:2694:    return await this.invoke(
src/lib/tauriClient.ts:2701:    return await this.invoke(
src/lib/tauriClient.ts:2708:    return await this.invoke(
src/lib/tauriClient.ts:2715:    return await this.invoke(
src/lib/tauriClient.ts:2722:    return await this.invoke(
src/lib/tauriClient.ts:2729:    return await this.invoke(
src/lib/tauriClient.ts:2736:    return await this.invoke(
src/lib/tauriClient.ts:2743:    return await this.invoke(
src/lib/tauriClient.ts:2750:    return await this.invoke(
src/lib/tauriClient.ts:2757:    return await this.invoke(
src/lib/tauriClient.ts:2764:    return await this.invoke(
src/lib/tauriClient.ts:2771:    return await this.invoke(
src/lib/tauriClient.ts:2778:    return await this.invoke(
src/lib/tauriClient.ts:2785:    return await this.invoke(
src/lib/tauriClient.ts:2792:    return await this.invoke(
src/lib/tauriClient.ts:2799:    return await this.invoke(
src/lib/tauriClient.ts:2806:    return await this.invoke(
src/lib/tauriClient.ts:2813:    return await this.invoke(
src/lib/tauriClient.ts:2820:    return await this.invoke(
src/lib/tauriClient.ts:2827:    return await this.invoke(
src/lib/tauriClient.ts:2834:    return await this.invoke(
src/lib/tauriClient.ts:2841:    return await this.invoke(
src/lib/tauriClient.ts:2848:    return await this.invoke(
src/lib/tauriClient.ts:2856:  //   return await this.invoke('start_recording', (params as Record<string, unknown>) || {});
src/lib/tauriClient.ts:2860:    return await this.invoke(
src/lib/tauriClient.ts:2867:    return await this.invoke(
src/lib/tauriClient.ts:2874:    return await this.invoke(
src/lib/tauriClient.ts:2881:    return await this.invoke(
src/lib/tauriClient.ts:2888:    return await this.invoke(
src/lib/tauriClient.ts:2895:    return await this.invoke(
src/lib/tauriClient.ts:2902:    return await this.invoke(
src/lib/tauriClient.ts:2909:    return await this.invoke(
src/lib/tauriClient.ts:2916:    return await this.invoke(
src/lib/tauriClient.ts:2923:    return await this.invoke(
src/lib/tauriClient.ts:2930:    return await this.invoke(
src/lib/tauriClient.ts:2937:    return await this.invoke(
src/lib/tauriClient.ts:2948:    return await this.invoke(
src/lib/tauriClient.ts:2955:    return await this.invoke(
src/lib/tauriClient.ts:2962:    return await this.invoke(
src/lib/tauriClient.ts:2969:    return await this.invoke(
src/lib/tauriClient.ts:2976:    return await this.invoke(
src/lib/tauriClient.ts:2983:    return await this.invoke(
src/lib/tauriClient.ts:2990:    return await this.invoke(
src/lib/tauriClient.ts:2997:    return await this.invoke(
src/lib/tauriClient.ts:3004:    return await this.invoke(
src/lib/tauriClient.ts:3011:    return await this.invoke(
src/lib/tauriClient.ts:3018:    return await this.invoke(
src/lib/tauriClient.ts:3025:    return await this.invoke(
src/lib/tauriClient.ts:3032:    return await this.invoke(
src/lib/tauriClient.ts:3039:    return await this.invoke(
src/lib/tauriClient.ts:3046:    return await this.invoke(
src/lib/tauriClient.ts:3053:    return await this.invoke(
src/lib/tauriClient.ts:3060:    return await this.invoke(
src/lib/tauriClient.ts:3071:    return await this.invoke(
src/lib/tauriClient.ts:3078:    return await this.invoke(
src/lib/tauriClient.ts:3085:    return await this.invoke(
src/lib/tauriClient.ts:3092:    return await this.invoke(
src/lib/tauriClient.ts:3099:    return await this.invoke(
src/lib/tauriClient.ts:3106:    return await this.invoke(
src/lib/tauriClient.ts:3113:    return await this.invoke(
src/lib/tauriClient.ts:3120:    return await this.invoke(
src/lib/tauriClient.ts:3127:    return await this.invoke(
src/lib/tauriClient.ts:3134:    return await this.invoke(
src/lib/tauriClient.ts:3141:    return await this.invoke(
src/lib/tauriClient.ts:3148:    return await this.invoke(
src/lib/tauriClient.ts:3155:    return await this.invoke(
src/lib/tauriClient.ts:3162:    return await this.invoke(
src/lib/tauriClient.ts:3169:    return await this.invoke(
src/lib/tauriClient.ts:3176:    return await this.invoke(
src/lib/tauriClient.ts:3183:    return await this.invoke(
src/lib/tauriClient.ts:3190:    return await this.invoke(
src/lib/tauriClient.ts:3197:    return await this.invoke(
src/lib/tauriClient.ts:3208:    return await this.invoke(
src/lib/tauriClient.ts:3215:    return await this.invoke(
src/lib/tauriClient.ts:3222:    return await this.invoke(
src/lib/tauriClient.ts:3229:    return await this.invoke(
src/lib/tauriClient.ts:3236:    return await this.invoke(
src/lib/tauriClient.ts:3243:    return await this.invoke(
src/lib/tauriClient.ts:3250:    return await this.invoke(
src/lib/tauriClient.ts:3257:    return await this.invoke(
src/lib/tauriClient.ts:3264:    return await this.invoke(
src/lib/tauriClient.ts:3271:    return await this.invoke(
src/lib/tauriClient.ts:3278:    return await this.invoke(
src/lib/tauriClient.ts:3289:    return await this.invoke(
src/lib/tauriClient.ts:3296:    return await this.invoke(
src/lib/tauriClient.ts:3303:    return await this.invoke(
src/lib/tauriClient.ts:3310:    return await this.invoke(
src/lib/tauriClient.ts:3317:    return await this.invoke(
src/lib/tauriClient.ts:3324:    return await this.invoke(
src/lib/tauriClient.ts:3331:    return await this.invoke(
src/lib/tauriClient.ts:3338:    return await this.invoke(
src/lib/tauriClient.ts:3345:    return await this.invoke(
src/lib/tauriClient.ts:3352:    return await this.invoke(
src/lib/tauriClient.ts:3359:    return await this.invoke(
src/lib/tauriClient.ts:3366:    return await this.invoke(
src/lib/tauriClient.ts:3373:    return await this.invoke(
src/lib/tauriClient.ts:3380:    return await this.invoke(
src/lib/tauriClient.ts:3387:    return await this.invoke(
src/lib/tauriClient.ts:3394:    return await this.invoke(
src/lib/tauriClient.ts:3405:    return await this.invoke(
src/lib/tauriClient.ts:3412:    return await this.invoke(TAURI_COMMANDS.READ_PRODUCTION_WEEK1_CSV, {});
src/modules/avatar/floating/appearanceFloatingIntegration.test.ts:31:vi.mock('@tauri-apps/api/core', () => ({
src/services/evolutionEngine/index.ts:254:      // await invoke('sync_evolution_state', { snapshot });
src/services/performanceEngine/reporter.ts:445:            tauriLatency: latestSnapshot.frontend.tauri.invokeLatency,
src/services/performanceEngine/reporter.ts:620:      snapshots.reduce((sum, s) => sum + s.frontend.tauri.invokeLatency, 0) /
src/services/performanceEngine/reporter.ts:623:      (sum, s) => sum + s.frontend.tauri.invokeCount,
src/services/performanceEngine/reporter.ts:627:      (sum, s) => sum + s.frontend.tauri.invokeErrors,
src/services/performanceEngine/metricsCollector.ts:914:      if (frontend.tauri.invokeLatency > 500) {
src/services/performanceEngine/analyzerEngine.ts:520:    if (frontend.tauri.invokeLatency >= thresholds.frontend.invokeLatencyWarning) {
src/services/performanceEngine/analyzerEngine.ts:525:          frontend.tauri.invokeLatency,
src/services/performanceEngine/analyzerEngine.ts:529:          `Latence Tauri: ${formatDuration(frontend.tauri.invokeLatency)}`
src/services/performanceEngine/analyzerEngine.ts:809:    if (frontend.tauri.invokeLatency < thresholds.frontend.invokeLatencyWarning * 0.5)
src/services/selfHealing/selfHealingObserver.ts:22:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/selfHealing/selfHealingObserver.ts:789:  const { invoke } = await import('@tauri-apps/api/core');
src/tests/e2e/titane_e2e.test.ts:116:      const health = await invoke('get_system_health');
src/tests/e2e/titane_e2e.test.ts:125:      const state = await invoke('singularity_get_full_state');
src/tests/e2e/titane_e2e.test.ts:134:      const response = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:154:      const result = await invoke('memory_save_chat_interaction', {
src/tests/e2e/titane_e2e.test.ts:168:      const stats = await invoke('memory_get_stats');
src/tests/e2e/titane_e2e.test.ts:177:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:191:      const coherence = await invoke('singularity_get_global_coherence');
src/tests/e2e/titane_e2e.test.ts:236:      const files = await invoke('secure_list_files');
src/tests/e2e/titane_e2e.test.ts:245:      const parsed = await invoke('parse_document', {
src/tests/e2e/titane_e2e.test.ts:257:      const analysis = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:276:      const result = await invoke('store_file', {
src/tests/e2e/titane_e2e.test.ts:290:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:304:      const files = await invoke('get_files_by_category', { category: 'legal' });
src/tests/e2e/titane_e2e.test.ts:369:      const synthesis = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:388:      const stored = await invoke('memory_store', {
src/tests/e2e/titane_e2e.test.ts:399:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:448:      const state = await invoke('meta_get_state');
src/tests/e2e/titane_e2e.test.ts:457:      const sync = await invoke('meta_trigger_sync');
src/tests/e2e/titane_e2e.test.ts:466:      const alignment = await invoke('meta_get_alignment');
src/tests/e2e/titane_e2e.test.ts:475:      const report = await invoke('meta_get_report');
src/tests/e2e/titane_e2e.test.ts:484:      const coherence = await invoke('singularity_check_coherence');
src/tests/e2e/titane_e2e.test.ts:493:      const selftest = await invoke('meta_selftest_all');
src/tests/e2e/titane_e2e.test.ts:502:      const metrics = await invoke('meta_get_monitoring_metrics');
src/tests/e2e/titane_e2e.test.ts:547:      const message = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:554:      await invoke('memory_save_chat_interaction', {
src/tests/e2e/titane_e2e.test.ts:567:      const projects = await invoke('memory_get_active_projects');
src/tests/e2e/titane_e2e.test.ts:576:      const parsed = await invoke('parse_document', {
src/tests/e2e/titane_e2e.test.ts:587:      const snapshot = await invoke('write_snapshot', {
src/tests/e2e/titane_e2e.test.ts:600:      const sync = await invoke('meta_trigger_sync');
src/tests/e2e/titane_e2e.test.ts:608:      const state = await invoke('singularity_get_full_state');
src/tests/e2e/titane_e2e.test.ts:617:      const coherence = await invoke('singularity_get_global_coherence');
src/services/selfHealing/selfHealingExecutor.ts:22:import { emit } from '@tauri-apps/api/event';
src/services/selfHealing/selfHealingSyncLayer.ts:22:import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/singularityBridge.ts:25:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/tests/regression/titane_regression.test.ts:67:          await invoke('memory_get_stats');
src/tests/regression/titane_regression.test.ts:69:          await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:71:          await invoke('cognitive_get_map');
src/tests/regression/titane_regression.test.ts:73:          await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:75:          await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:77:          await invoke('chat_get_providers_status');
src/tests/regression/titane_regression.test.ts:117:        await invoke(command, {}).catch(() => {
src/tests/regression/titane_regression.test.ts:150:      const stats = await invoke('memory_get_stats');
src/tests/regression/titane_regression.test.ts:179:      const timeline = await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:213:      const state = await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:251:      await invoke('parse_document', {
src/tests/regression/titane_regression.test.ts:281:      const timeline = await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:331:      const response = await invoke('conversation_generate', {
src/tests/regression/titane_regression.test.ts:382:      const status = await invoke('chat_get_providers_status');
src/tests/regression/titane_regression.test.ts:419:      const state = await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:420:      const coherence = await invoke('singularity_get_global_coherence');
src/tests/regression/titane_regression.test.ts:483:      const stateBefore = await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:484:      await invoke('meta_trigger_sync');
src/tests/regression/titane_regression.test.ts:485:      const stateAfter = await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:499:      const alignment = await invoke('meta_get_alignment');
src/services/ai/ConversationManager.ts:22:import { emit } from '@tauri-apps/api/event';
src/services/ai/__tests__/ConversationManager.test.ts:64:vi.mock('@tauri-apps/api/event', () => ({
src/services/ai/providers/tauriChat.ts:9: *   PHASE 4Ω: Protection invoke() • Timeout handling • Error isolation
src/services/tauriClient.ts:4: * Client centralisé pour tous les appels Tauri invoke()
src/services/tauriClient.ts:10:import { listen, type UnlistenFn } from '@tauri-apps/api/event';

$ rg -n --hidden --glob "!.git" "MemoryStorage|save_conversation|flush|debounce|enforce_retention" src-tauri/src
src-tauri/src/api/handlers_v14.rs:64:        // MEMORY v14 (MemoryStorage + Compactor)
src-tauri/src/api/system_api.rs:104:        recommendations.push("Memory flush recommended".to_string());
src-tauri/src/errors/app_error.rs:37:    MemoryStorage(String),
src-tauri/src/commands/tests_ai_chat.rs:126:        let storage_result = MemoryStorage::new(invalid_path, "test".to_string());
src-tauri/src/commands/tests_ai_chat.rs:130:            let fallback = MemoryStorage::new_in_memory("test".to_string());
src-tauri/src/commands/ai_chat.rs:14:use crate::memory::storage::MemoryStorage;
src-tauri/src/commands/ai_chat.rs:43:    /// MemoryStorage - keeping RwLock as single-writer pattern fits
src-tauri/src/commands/ai_chat.rs:44:    pub memory_storage: Arc<RwLock<MemoryStorage>>,
src-tauri/src/commands/ai_chat.rs:103:            MemoryStorage::new(storage_dir, "titane-infinity".to_string())
src-tauri/src/commands/ai_chat.rs:106:                    MemoryStorage::new_in_memory("titane-infinity".to_string())
src-tauri/src/commands/ai_chat.rs:231:            if let Err(e) = storage.save_conversation(conv) {
src-tauri/src/commands/ai_chat.rs:378:            if let Err(e) = storage.save_conversation(conv) {
src-tauri/src/commands/ai_chat.rs:535:        .save_conversation(&conversation)
src-tauri/src/commands/memory_commands.rs:71:    storage.save_conversation(&conversation)
src-tauri/src/streaming.rs:101:    last_flush: std::time::Instant,
src-tauri/src/streaming.rs:102:    flush_interval: std::time::Duration,
src-tauri/src/streaming.rs:106:    pub fn new(threshold: usize, flush_interval_ms: u64) -> Self {
src-tauri/src/streaming.rs:110:            last_flush: std::time::Instant::now(),
src-tauri/src/streaming.rs:111:            flush_interval: std::time::Duration::from_millis(flush_interval_ms),
src-tauri/src/streaming.rs:115:    /// Push token and return chunk if buffer should flush
src-tauri/src/streaming.rs:120:        if self.buffer.len() >= self.threshold || self.last_flush.elapsed() > self.flush_interval {
src-tauri/src/streaming.rs:123:            self.last_flush = std::time::Instant::now();
src-tauri/src/streaming.rs:130:    /// Force flush remaining buffer
src-tauri/src/streaming.rs:131:    pub fn flush(&mut self) -> Option<String> {
src-tauri/src/streaming.rs:174:    flush_interval_ms: u64,
src-tauri/src/streaming.rs:177:    let mut buffer = StreamBuffer::new(buffer_threshold, flush_interval_ms);
src-tauri/src/streaming.rs:200:        if let Some(chunk) = buffer.flush() {
src-tauri/src/streaming.rs:316:    fn test_stream_buffer_flush() {
src-tauri/src/streaming.rs:320:        let chunk = buffer.flush();
src-tauri/src/streaming.rs:323:            chunk.expect("flush should return buffered content"),
src-tauri/src/streaming.rs:327:        // Empty after flush
src-tauri/src/streaming.rs:328:        assert!(buffer.flush().is_none());
src-tauri/src/config/update.rs:96:    pub memory_flush_interval_ms: u64,
src-tauri/src/config/update.rs:124:            memory_flush_interval_ms: 750,
src-tauri/src/config/update.rs:146:                memory_flush_interval_ms: 1_000,
src-tauri/src/config/update.rs:163:                memory_flush_interval_ms: 1_500,
src-tauri/src/config/update.rs:232:    if dto.memory_flush_interval_ms < 50 || dto.memory_flush_interval_ms > 60_000 {
src-tauri/src/config/update.rs:233:        return Err("memory_flush_interval_ms doit être entre 50 et 60000".to_string());
src-tauri/src/devtools/telemetry.rs:34:        // - Batching: Buffer events in memory (Vec<TelemetryEvent>), flush every 100 events or 10s
src-tauri/src/conversation_engine/mod.rs:43:use crate::memory::storage::MemoryStorage;
src-tauri/src/conversation_engine/mod.rs:111:            MemoryStorage::new(storage_dir.join("conversations"), password)
src-tauri/src/conversation_engine/memory.rs:16:use crate::memory::storage::MemoryStorage;
src-tauri/src/conversation_engine/memory.rs:40:    storage: Arc<MemoryStorage>,
src-tauri/src/conversation_engine/memory.rs:45:    pub fn new(storage: Arc<MemoryStorage>) -> Self {
src-tauri/src/conversation_engine/memory.rs:67:                        .save_conversation(&conversation)
src-tauri/src/conversation_engine/memory.rs:77:                    .save_conversation(&conversation)
src-tauri/src/conversation_engine/memory.rs:169:            .save_conversation(&conversation)
src-tauri/src/memory_os/ltm.rs:379:    pub async fn flush(&self) -> Result<(), LTMError> {
src-tauri/src/memory_os/ltm.rs:413:    /// Sync to disk (alias for flush)
src-tauri/src/memory_os/ltm.rs:415:        self.flush().await
src-tauri/src/memory_os/ltm.rs:706:    async fn test_ltm_flush() {
src-tauri/src/memory_os/ltm.rs:713:        let result = ltm.flush().await;
src-tauri/src/main.rs:482:            fn flush(&mut self) -> std::io::Result<()> {
src-tauri/src/main.rs:484:                    let _ = f.flush();
src-tauri/src/main.rs:486:                let _ = std::io::stderr().flush();
src-tauri/src/chat_engine/mod.rs:292:        self.memory.flush_conversation_now(conversation_id).await?;
src-tauri/src/chat_engine/mod.rs:390:        config.memory_flush_interval,
src-tauri/src/chat_engine/config.rs:14:    /// Interval used to debounce memory flush operations to disk.
src-tauri/src/chat_engine/config.rs:15:    pub memory_flush_interval: Duration,
src-tauri/src/chat_engine/config.rs:29:            memory_flush_interval: Duration::from_millis(350),
src-tauri/src/chat_engine/config.rs:47:        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
src-tauri/src/chat_engine/config.rs:76:            memory_flush_interval: Duration::from_millis(500),
src-tauri/src/chat_engine/config.rs:95:    fn test_chat_engine_config_flush_interval_conversion() {
src-tauri/src/chat_engine/config.rs:97:        assert_eq!(config.memory_flush_interval.as_millis(), 350);
src-tauri/src/chat_engine/config.rs:114:            memory_flush_interval: Duration::from_millis(1),
src-tauri/src/chat_engine/config.rs:130:            memory_flush_interval: Duration::from_secs(10),
src-tauri/src/chat_engine/memory.rs:11:use crate::memory::storage::MemoryStorage;
src-tauri/src/chat_engine/memory.rs:18:    storage: Arc<MemoryStorage>,
src-tauri/src/chat_engine/memory.rs:21:    flush_interval: Duration,
src-tauri/src/chat_engine/memory.rs:22:    flush_tasks: Mutex<HashMap<String, JoinHandle<()>>>,
src-tauri/src/chat_engine/memory.rs:26:    pub fn new(storage: Arc<MemoryStorage>, retention_tokens: usize, flush_interval: Duration) -> Self {
src-tauri/src/chat_engine/memory.rs:31:            flush_interval,
src-tauri/src/chat_engine/memory.rs:32:            flush_tasks: Mutex::new(HashMap::new()),
src-tauri/src/chat_engine/memory.rs:36:    pub fn storage(&self) -> Arc<MemoryStorage> {
src-tauri/src/chat_engine/memory.rs:54:            .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:103:        self.enforce_retention(conversation);
src-tauri/src/chat_engine/memory.rs:106:        self.schedule_flush(conversation_id.to_string()).await;
src-tauri/src/chat_engine/memory.rs:110:    fn enforce_retention(&self, conversation: &mut Conversation) {
src-tauri/src/chat_engine/memory.rs:135:    async fn schedule_flush(&self, conversation_id: String) {
src-tauri/src/chat_engine/memory.rs:136:        let mut tasks = self.flush_tasks.lock().await;
src-tauri/src/chat_engine/memory.rs:139:                log::debug!("[Memory] flush coalesced: {}", conversation_id);
src-tauri/src/chat_engine/memory.rs:146:        let delay = self.flush_interval;
src-tauri/src/chat_engine/memory.rs:149:            log::debug!("[Memory] flush scheduled: {}", conversation_id_for_task);
src-tauri/src/chat_engine/memory.rs:158:                if let Err(err) = storage.save_conversation(&conversation) {
src-tauri/src/chat_engine/memory.rs:160:                        "[Memory] flush persist failed for {}: {}",
src-tauri/src/chat_engine/memory.rs:165:                    log::debug!("[Memory] flush persisted: {}", conversation_id_for_task);
src-tauri/src/chat_engine/memory.rs:173:    pub async fn flush_conversation_now(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
src-tauri/src/chat_engine/memory.rs:174:        if let Some(handle) = self.flush_tasks.lock().await.remove(conversation_id) {
src-tauri/src/chat_engine/memory.rs:185:                .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:187:            log::debug!("[Memory] flush persisted: {}", conversation_id);
src-tauri/src/chat_engine/memory.rs:193:    pub async fn flush_all_now(&self) -> Result<(), ChatEngineError> {
src-tauri/src/chat_engine/memory.rs:200:            self.flush_conversation_now(&conversation_id).await?;
src-tauri/src/chat_engine/memory.rs:239:            .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:265:            let mut tasks = self.flush_tasks.lock().await;
src-tauri/src/chat_engine/memory.rs:311:) -> Result<Arc<MemoryStorage>, ChatEngineError> {
src-tauri/src/chat_engine/memory.rs:312:    let storage = MemoryStorage::new(base_dir, password).map_err(ChatEngineError::from)?;
src-tauri/src/chat_engine/memory.rs:399:    fn test_enforce_retention_keeps_most_recent_entries() {
src-tauri/src/chat_engine/memory.rs:402:            MemoryStorage::new(temp_dir.path().to_path_buf(), "test-key".to_string())
src-tauri/src/chat_engine/memory.rs:413:        manager.enforce_retention(&mut conversation);
src-tauri/src/persistence/mod.rs:266:    /// Shutdown propre (flush final)
src-tauri/src/memory/tests_storage.rs:10:    use crate::memory::storage::MemoryStorage;
src-tauri/src/memory/tests_storage.rs:19:    /// Helper: Créer un MemoryStorage de test avec directory temporaire
src-tauri/src/memory/tests_storage.rs:20:    fn create_test_storage() -> Result<(MemoryStorage, TempDir), Box<dyn Error>> {
src-tauri/src/memory/tests_storage.rs:23:            MemoryStorage::new(temp_dir.path().to_path_buf(), "test_password".to_string())?;
src-tauri/src/memory/tests_storage.rs:57:        let _storage = MemoryStorage::new(storage_path.clone(), "password".to_string())?;
src-tauri/src/memory/tests_storage.rs:71:            MemoryStorage::new(temp_dir1.path().to_path_buf(), "password1".to_string())?;
src-tauri/src/memory/tests_storage.rs:74:            MemoryStorage::new(temp_dir2.path().to_path_buf(), "password2".to_string())?;
src-tauri/src/memory/tests_storage.rs:90:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:119:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:123:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:137:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:160:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:204:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:224:        storage.save_conversation(&conv1)?;
src-tauri/src/memory/tests_storage.rs:225:        storage.save_conversation(&conv2)?;
src-tauri/src/memory/tests_storage.rs:226:        storage.save_conversation(&conv3)?;
src-tauri/src/memory/tests_storage.rs:241:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:245:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:265:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:300:        storage.save_conversation(&conv1)?;
src-tauri/src/memory/tests_storage.rs:301:        storage.save_conversation(&conv2)?;
src-tauri/src/memory/tests_storage.rs:335:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:343:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:372:            storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:399:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:419:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:443:            storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:464:            storage.save_conversation(&conv)?;
src-tauri/src/memory/storage.rs:17:pub struct MemoryStorage {
src-tauri/src/memory/storage.rs:24:impl MemoryStorage {
src-tauri/src/memory/storage.rs:58:    pub fn save_conversation(&self, conversation: &Conversation) -> MemoryResult<()> {
src-tauri/src/memory/storage.rs:273:        let storage = MemoryStorage::new(temp_dir.path().to_path_buf(), "test".to_string());
src-tauri/src/memory/storage.rs:280:        let storage = MemoryStorage::new(temp_dir.path().to_path_buf(), "test".to_string())
src-tauri/src/memory/storage.rs:287:            .save_conversation(&conv)

$ rg -n --hidden --glob "!.git" "from_utf8_lossy|as_bytes\\(\\)\\.chunks\\(" src-tauri/src
src-tauri/src/commands/devops.rs:147:    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
src-tauri/src/commands/devops.rs:148:    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
src-tauri/src/commands/devops.rs:177:    let cpu_usage = String::from_utf8_lossy(&cpu_output.stdout)
src-tauri/src/commands/devops.rs:187:    let memory_usage = String::from_utf8_lossy(&mem_output.stdout)
src-tauri/src/commands/devops.rs:197:    let processes_count = String::from_utf8_lossy(&proc_output.stdout)
src-tauri/src/commands/devops.rs:208:    let uptime = String::from_utf8_lossy(&uptime_output.stdout)
src-tauri/src/commands/devops.rs:237:        let error_count = String::from_utf8_lossy(&npm_check.stdout)
src-tauri/src/audio/commands.rs:137:                let stderr = String::from_utf8_lossy(&piper_output.stderr);
src-tauri/src/audio/commands.rs:172:                let stderr = String::from_utf8_lossy(&play_output.stderr);
src-tauri/src/audio/commands.rs:173:                let stdout = String::from_utf8_lossy(&play_output.stdout);
src-tauri/src/audio/commands.rs:278:        let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:333:        let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:388:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:452:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:520:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:551:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:654:                let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/audio/commands.rs:790:        String::from_utf8_lossy(&output.stdout).trim().to_string()
src-tauri/src/audio/commands.rs:866:            String::from_utf8_lossy(&output.stderr)
src-tauri/src/audio/commands.rs:870:    let transcript = String::from_utf8_lossy(&output.stdout).trim().to_string();
src-tauri/src/tts/local_tts.rs:145:            let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/security/shell_guard.rs:44:            let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/security/shell_guard.rs:48:        Ok(String::from_utf8_lossy(&output.stdout).to_string())
src-tauri/src/overdrive/voice_engine.rs:265:            String::from_utf8_lossy(&output.stdout).trim().to_string()
src-tauri/src/persistence/backup.rs:493:                String::from_utf8_lossy(&decompressed[cursor..cursor + name_end]).to_string();
src-tauri/src/ai/ollama.rs:262:        buffer.push_str(&String::from_utf8_lossy(&chunk));
src-tauri/src/overdrive/chat_orchestrator.rs:1842:        let chunk_str = String::from_utf8_lossy(&chunk_bytes);
src-tauri/src/services/network_gateway.rs:219:        Ok(String::from_utf8_lossy(&body).to_string())
src-tauri/src/services/extract_service.rs:78:        let html = String::from_utf8_lossy(bytes);
src-tauri/src/services/robots_service.rs:83:                let text = String::from_utf8_lossy(&result.body).into_owned();
```
