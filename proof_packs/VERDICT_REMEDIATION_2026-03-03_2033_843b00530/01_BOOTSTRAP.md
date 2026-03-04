]633;E;{   echo "# 01_BOOTSTRAP"\x3b   echo "DATE=$(date -Iseconds)"\x3b   echo ""\x3b   echo "## git status --porcelain=v1"\x3b   git status --porcelain=v1\x3b   echo ""\x3b   echo "## git rev-parse --short HEAD"\x3b   git rev-parse --short HEAD\x3b   echo ""\x3b   echo "## git log -20 --oneline"\x3b   git log -20 --oneline\x3b   echo ""\x3b   echo "## branch and commit checks"\x3b   echo "CURRENT_BRANCH=$(git branch --show-current)"\x3b   echo "MAIN_HAS_7eb4096f=$(git cat-file -t 7eb4096f 2>/dev/null || echo MISSING)"\x3b   echo "AUDIT_BRANCH_MATCHES:"\x3b   git branch --all | grep -F 'copilot/audit-repository-contents' || echo "(none found locally/remotely)"\x3b } > "$PACK_DIR/01_BOOTSTRAP.md";3964078c-1b96-4570-9555-d533912fa601]633;C# 01_BOOTSTRAP
DATE=2026-03-03T20:33:25-05:00

## git status --porcelain=v1
 M runtime/dev/reports/DEV_BRIDGE_FINAL_VERDICT.md
 M runtime/dev/reports/DEV_BRIDGE_INVENTORY.md
 M src-tauri/reports/g3_ipc/run_1.json
 M src-tauri/reports/g3_ipc/run_2.json
 M src-tauri/reports/g3_ipc/run_3.json
 M src-tauri/src/ai/router.rs
?? proof_packs/VERDICT_REMEDIATION_2026-03-03_2033_843b00530/

## git rev-parse --short HEAD
843b00530

## git log -20 --oneline
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
8a70d73f2 feat(chat): harden chat pipeline + governed full audit proof packs

## branch and commit checks
CURRENT_BRANCH=MAIN
MAIN_HAS_7eb4096f=commit
AUDIT_BRANCH_MATCHES:
(none found locally/remotely)
