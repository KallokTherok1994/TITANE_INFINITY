]633;E;{   echo "# BOOTSTRAP"\x3b   echo "DATE=$(date -Iseconds)"\x3b   echo\x3b   echo "## git status --porcelain=v1"\x3b   git status --porcelain=v1\x3b   echo\x3b   echo "## git rev-parse --short HEAD"\x3b   git rev-parse --short HEAD\x3b   echo\x3b   echo "## git log -20 --oneline"\x3b   git log -20 --oneline\x3b   echo\x3b   echo "## package scripts excerpt"\x3b   node -e "const p=require('./package.json')\x3b console.log(Object.keys(p.scripts).filter(k=>k.includes('e2e')||k.includes('verify')).sort().join('\\n'))"\x3b   echo\x3b   echo "## e2e config files"\x3b   ls -1 playwright.config.ts wdio.desktop.conf.cjs\x3b } > "$PACK_DIR/01_BOOTSTRAP.md";b362c643-1bdc-4404-baa1-2ca9e491a839]633;C# BOOTSTRAP
DATE=2026-03-03T20:56:51-05:00

## git status --porcelain=v1
 M package.json
 M runtime/dev/reports/DEV_BRIDGE_FINAL_VERDICT.md
 M runtime/dev/reports/DEV_BRIDGE_INVENTORY.md
 M src-tauri/reports/g3_ipc/run_1.json
 M src-tauri/reports/g3_ipc/run_2.json
 M src-tauri/reports/g3_ipc/run_3.json
 M src-tauri/src/ai/router.rs
 M src/components/config/ConfigFieldEditable.tsx
 M src/components/layout/TopNav.tsx
 M src/components/sections/ConversationSection.tsx
 M src/entry.ts
 M src/features/admin/AdminPage.tsx
 M src/features/audio-center/AudioCenterPage.tsx
 M src/features/chat/ChatProviderSelector.tsx
 M src/pages/ConfigurationHub.tsx
 M src/pages/DevPage.tsx
 M src/pages/Stats.tsx
 M src/pages/TimePage.tsx
 M src/pages/TitanePage.tsx
?? e2e/desktop/ui-connectivity-critical.wdio.test.js
?? proof_packs/UI_AUTOFIX_TESTIDS_AND_IPC_SYNC_2026-03-03_2056_98262da88/
?? scripts/run_e2e_tauri.sh
?? scripts/verify/allowlist-exceptions.txt
?? scripts/verify/verify-command-whitelist-sync.sh

## git rev-parse --short HEAD
98262da88

## git log -20 --oneline
98262da88 chore(governance): add remediation proof-pack and tauri e2e wrapper
843b00530 chore(reports): add remaining generated reports
71ed38daa chore(repo): cleanup artifacts and stabilize local tts runtime
443aa9610 Merge pull request #164 from KallokTherok1994/copilot/audit-repository-contents
b88039910 Merge branch 'MAIN' into copilot/audit-repository-contents
925e3af58 docs(proofs): add SCELLEMENT_06 continuity pack
bf85a5adf chore(seal): SCELLEMENT_05 auto-fix, x3 tests, real build x3, final verdict
25404d1e9 fix: add registry ui-043 entry, update VERDICT with CI analysis, Prettier verified PASS
7eb4096fa fix(memory): inject storage port and seal ORCH_PERFECTION proof pack
36a5f85d4 feat: Final Audit Master Fix Plan + minimal auto-fixes (data-testid, PROD guard, MANIFEST version)
925340186 docs(91_reports): finalize broken-link cleanup batch-3
a0a4eeb31 feat: UI Interactive Cartography Proof-Pack — Audit complet TITANE∞ v27.2.0
b2d273e45 docs(links): fix relative paths in 90_release deployment docs
a9067a46a docs(links): fix canonical index relative paths
d85e8dc4b docs(changelog): add 2026-03-03 maintenance sync entry
29ece191d docs(readme): align version/status and governance notes with v27.2.0
3895845c1 docs(proof): add ORCH mini changelog and update diff index
25740b5d0 fix(chat): resolve TS blockers and seal ORCH VΩ proof pack
e97177da4 fix: Chat IA audit — provider attribution, cache deduplication, health_check accuracy
0cdf39d39 docs(reports): add release note for chat seal sequence

## package scripts excerpt
build:prod-safe:verify
build:tauri:e2e
cline:verify
e2e:desktop
e2e:desktop:ensure
e2e:desktop:proof:online-chat
e2e:desktop:run
test:e2e
test:e2e:playwright
test:e2e:vitest
verify
verify:autopr-v2
verify:command-whitelist-sync
verify:docs:mermaid
verify:docs:mermaid:change
verify:docs:mermaid:diff
verify:docs:mermaid:status
verify:final100
verify:instructions
verify:invariants-governed
verify:lab-runner-v2
verify:network-guard
verify:online-first
verify:prod-boot
verify:proof-requirements-v2
verify:registry
verify:registry:integrity
verify:registry:quality
verify:registry:sync
verify:remediation-permissions
verify:scorecard-ci-gate-v2
verify:seal-post-certification
verify:staged-patch-v2
verify:tauri-bundle-type
verify:tauri-configs
verify:tauri-only

## e2e config files
playwright.config.ts
wdio.desktop.conf.cjs
