]633;E;if [ "$VERDICT" = "PASS" ]\x3b then   REG_FILE='CERTIFICATION_REGISTRY_APPEND_ONLY.md'\x3b   if [ -f "$REG_FILE" ]\x3b then     echo "- $UTC_NOW | $WINDOW | PASS x3 + autoheal-repair | proof: $PACK_DIR" >> "$REG_FILE"\x3b   fi\x3b   git add runs/current "$PACK_ROOT" "$REG_FILE" 2>/dev/null || git add runs/current "$PACK_ROOT"\x3b   git commit -m "${SLUG}: PASS x3 + proof pack + seal (repair)"\x3b   TAG_NAME="${SLUG}-pass-${UTC_COMPACT}"\x3b   git tag "$TAG_NAME"\x3b   git push origin MAIN --follow-tags\x3b   echo "RESULT VERDICT=PASS TAG=$TAG_NAME"\x3b else   git add runs/current "$PACK_ROOT"\x3b   git commit -m "${SLUG}: ${VERDICT} proof pack (no seal, repair)"\x3b   git push origin MAIN\x3b   echo "RESULT VERDICT=$VERDICT TAG="\x3b fi;e99512ee-eb41-47ad-ba70-e987d0e9646e]633;C# PROGRAM END DISCOVERY
## rg results
./CHANGELOG.md:2523:- `BACKEND_PHASE1_SUCCESS_v14.md` (500 lignes)
./CHANGELOG.md:2524:- `BACKEND_PHASE1_BANNER_v14.txt` (500 lignes)
./CHANGELOG.md:2525:- `BACKEND_PHASES_2-3_SUCCESS_v14.md` (500 lignes)
./CHANGELOG.md:2526:- `BACKEND_PHASES_1-3_BANNER_v14.txt` (1500 lignes)
./CHANGELOG.md:2527:- `BACKEND_PHASES_4-6_SUCCESS_v14.txt` (1500 lignes)
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:1565:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2331:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2450:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2451:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1_SUCCESS_v14.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2452:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:2453:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:3397:./docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:4628:./docs/FRONTEND_PERFORMANCE_AUDIT_v19.3.md
./runs/DOCS_UPGRADE_20260223_203132/PROOF/all_markdown_files.txt:5614:./reports/chat_orchestrator_absfix/2026-02-11T01-15-12Z/05_PROXY_BACKEND_PROOF.md
./runs/v39/proof_pack/04_RUNS_LOGS/RUN_1.txt:22632:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./src-tauri/src/core/legacy.rs:95:            static LAST_PERSIST: AtomicI64 = AtomicI64::new(0);
./src-tauri/src/core/legacy.rs:97:            let last = LAST_PERSIST.load(Ordering::Relaxed);
./src-tauri/src/core/legacy.rs:102:            LAST_PERSIST.store(now, Ordering::Relaxed);
./src-tauri/src/commands/security.rs:555:    const MAX_PARAM_SIZE: usize = 1024 * 1024; // 1 MB
./src-tauri/src/commands/security.rs:556:    if json_str.len() > MAX_PARAM_SIZE {
./src/__tests__/chat-ia-critical-fixes.test.ts:51:  it('should force flush when MAX_PENDING_SAVES reached', async () => {
./src/__tests__/chat-ia-critical-fixes.test.ts:88:    // Trigger force flush by hitting MAX_PENDING_SAVES
./src-tauri/src/ai/security.rs:53:    const MAX_PROMPT_SIZE: usize = 100_000; // 100 KB
./src-tauri/src/ai/security.rs:54:    if prompt.len() > MAX_PROMPT_SIZE {
./src-tauri/src/services/seed_pack_service.rs:28:pub const SEED_PACK_MAX_PACKS: usize = 10;
./src-tauri/src/services/discovery_service.rs:15:pub const DISCOVERY_MAX_PAGES_HARD_CAP: usize = 20;
./src-tauri/src/services/discovery_service.rs:51:/// - max_pages budget enforced (capped at DISCOVERY_MAX_PAGES_HARD_CAP)
./src-tauri/src/services/discovery_service.rs:72:        let cap = max_pages.min(DISCOVERY_MAX_PAGES_HARD_CAP).max(1);
./src-tauri/src/services/discovery_service.rs:346:    let cap = max_urls.min(DISCOVERY_MAX_PAGES_HARD_CAP);
./src-tauri/src/services/discovery_service.rs:526:            result.urls.len() <= DISCOVERY_MAX_PAGES_HARD_CAP,
./src-tauri/src/services/discovery_service.rs:529:            DISCOVERY_MAX_PAGES_HARD_CAP
./deployment/latest/certification/p3/proof_packs/P3_1_CONTRACT_20260216_151524/COMMANDS_RUN.txt:56:-rw-rw-r--  1 titane-os titane-os    4498 déc.   9 10:57 BACKEND_PERFORMANCE_AUDIT_v19.3.md
./deployment/latest/certification/p3/proof_packs/P3_1_CONTRACT_20260216_151524/COMMANDS_RUN.txt:133:-rw-rw-r--  1 titane-os titane-os    3230 déc.   9 10:57 FRONTEND_PERFORMANCE_AUDIT_v19.3.md
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13336:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7022:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13337:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7023:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16328:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10015:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16329:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10016:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19849:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19850:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23176:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23177:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./scripts/deployment/tauri-full-deploy.sh:49:TARGET_PLATFORM="current"
./scripts/deployment/tauri-full-deploy.sh:157:                TARGET_PLATFORM="$2"
./scripts/deployment/tauri-full-deploy.sh:308:    info "Target: $TARGET_PLATFORM"
./docs/SUPER_PROMPT_AUDIT_REPORT_v19.3.md:55:| `docs/FRONTEND_PERFORMANCE_AUDIT_v19.3.md` | Score 8/10 |
./docs/SUPER_PROMPT_AUDIT_REPORT_v19.3.md:56:| `docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md` | Score 7.5/10 |
./docs/SUPER_PROMPT_AUDIT_REPORT_v19.3.md:183:| `docs/FRONTEND_PERFORMANCE_AUDIT_v19.3.md` | NOUVEAU |
./docs/SUPER_PROMPT_AUDIT_REPORT_v19.3.md:184:| `docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md` | NOUVEAU |
./docs/backup_20251218_122540/CHANGELOG.md:1905:- `BACKEND_PHASE1_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_122540/CHANGELOG.md:1906:- `BACKEND_PHASE1_BANNER_v14.txt` (500 lignes)
./docs/backup_20251218_122540/CHANGELOG.md:1907:- `BACKEND_PHASES_2-3_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_122540/CHANGELOG.md:1908:- `BACKEND_PHASES_1-3_BANNER_v14.txt` (1500 lignes)
./docs/backup_20251218_122540/CHANGELOG.md:1909:- `BACKEND_PHASES_4-6_SUCCESS_v14.txt` (1500 lignes)
./docs/super-prompts/frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md:452:- [FRONTEND_PERFORMANCE_AUDIT_v19.3.md](../../FRONTEND_PERFORMANCE_AUDIT_v19.3.md)
./docs/super-prompts/INDEX.md:197:- [FRONTEND_PERFORMANCE_AUDIT_v19.3.md](../FRONTEND_PERFORMANCE_AUDIT_v19.3.md)
./docs/backup_20251218_122526/CHANGELOG.md:1905:- `BACKEND_PHASE1_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_122526/CHANGELOG.md:1906:- `BACKEND_PHASE1_BANNER_v14.txt` (500 lignes)
./docs/backup_20251218_122526/CHANGELOG.md:1907:- `BACKEND_PHASES_2-3_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_122526/CHANGELOG.md:1908:- `BACKEND_PHASES_1-3_BANNER_v14.txt` (1500 lignes)
./docs/backup_20251218_122526/CHANGELOG.md:1909:- `BACKEND_PHASES_4-6_SUCCESS_v14.txt` (1500 lignes)
./docs/SYSTEM_CENTER_AUTOFIX_ENGINE_v21.md:387:### 4. FRONTEND_PATCH
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_2.txt:22615:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_2.txt:22615:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./runs/current/SCANS_ALLOWLIST.md:6515:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:6516:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/current/SCANS_ALLOWLIST.md:21801:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13336:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7022:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:21802:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13337:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7023:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/current/SCANS_ALLOWLIST.md:24793:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16328:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10015:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:24794:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16329:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10016:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/current/SCANS_ALLOWLIST.md:28314:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19849:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:28315:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19850:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/current/SCANS_ALLOWLIST.md:31640:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23176:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:31641:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23177:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/current/SCANS_ALLOWLIST.md:36320:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/current/SCANS_ALLOWLIST.md:36321:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:6515:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:6516:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:21801:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13336:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7022:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:21802:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:13337:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:7023:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:24793:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16328:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10015:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:24794:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:16329:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:10016:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:28314:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19849:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:28315:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:19850:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:31640:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23176:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:31641:./runs/p462_468/proof_pack/05_SCANS_ALLOWLIST.md:23177:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:36320:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./runs/p469_475/proof_pack/05_SCANS_ALLOWLIST.md:36321:./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_3.txt:22616:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./docs/99_ARCHIVE/versions/v14/COMMIT_MESSAGE_v14_PHASES_1-3.md:89:- `BACKEND_PHASE1-3_SUCCESS_v14.md`
./docs/99_ARCHIVE/versions/v14/COMMIT_MESSAGE_v14_PHASES_1-3.md:90:- `BACKEND_PHASES4-9_ROADMAP_v14.md`
./docs/backup_20251218_123316/CHANGELOG.md:1905:- `BACKEND_PHASE1_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_123316/CHANGELOG.md:1906:- `BACKEND_PHASE1_BANNER_v14.txt` (500 lignes)
./docs/backup_20251218_123316/CHANGELOG.md:1907:- `BACKEND_PHASES_2-3_SUCCESS_v14.md` (500 lignes)
./docs/backup_20251218_123316/CHANGELOG.md:1908:- `BACKEND_PHASES_1-3_BANNER_v14.txt` (1500 lignes)
./docs/backup_20251218_123316/CHANGELOG.md:1909:- `BACKEND_PHASES_4-6_SUCCESS_v14.txt` (1500 lignes)
./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1_SUCCESS_v14.md:247:- ✅ `BACKEND_PHASE1_SUCCESS_v14.md` (ce fichier)
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_3.txt:22770:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./docs/99_ARCHIVE/legacy_reports/MISSION_COMPLETE_v19.2.2.txt:244:   ├─ BACKEND_PHASE1_SUCCESS_v14.md (500L)
./docs/99_ARCHIVE/legacy_reports/MISSION_COMPLETE_v19.2.2.txt:245:   ├─ BACKEND_PHASE1_BANNER_v14.txt (500L)
./docs/99_ARCHIVE/legacy_reports/MISSION_COMPLETE_v19.2.2.txt:246:   ├─ BACKEND_PHASES_2-3_SUCCESS_v14.md (500L)
./docs/99_ARCHIVE/legacy_reports/MISSION_COMPLETE_v19.2.2.txt:247:   ├─ BACKEND_PHASES_1-3_BANNER_v14.txt (1500L)
./docs/99_ARCHIVE/legacy_reports/MISSION_COMPLETE_v19.2.2.txt:248:   ├─ BACKEND_PHASES_4-6_SUCCESS_v14.txt (1500L)
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_011116/05_UNIT_RUN_1.txt:39307:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./deployment/latest/certification/phase10/P10_E2E_DESKTOP_FULL_CERT_20260218_012110/05_UNIT_RUN_1.txt:22615:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./docs/99_ARCHIVE/rapports/SYSTEM_CENTER_AUTOFIX_v21_COMPLETE.md:89:4. **FRONTEND_PATCH** — Code React/TS correctif
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v19.2.2.md:161:3. **BACKEND_PHASE1_SUCCESS_v14.md** (500 lignes)
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v19.2.2.md:166:4. **BACKEND_PHASE1_BANNER_v14.txt** (500 lignes)
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v19.2.2.md:170:5. **BACKEND_PHASES_2-3_SUCCESS_v14.md** (500 lignes)
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v19.2.2.md:175:6. **BACKEND_PHASES_1-3_BANNER_v14.txt** (1500 lignes)
./docs/99_ARCHIVE/merged/VERIFICATION_FINALE_v19.2.2.md:179:7. **BACKEND_PHASES_4-6_SUCCESS_v14.txt** (1500 lignes)
./docs/99_ARCHIVE/versions/v16/RECAPITULATIF_COMPLET_v16.2.2.md:147:2. **`TESTS_BACKEND_PHASE2.md`** (backup):
./docs/99_ARCHIVE/versions/v16/RECAPITULATIF_COMPLET_v16.2.2.md:257:TESTS_BACKEND_PHASE2.md             ← Tests détaillés
./docs/99_ARCHIVE/merged/PHASES_2-7_EXECUTION_COMPLETE.md:19:  - `TESTS_BACKEND_PHASE2.md` (tests directs)
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/12_UNIT_RUN_ATTEMPT_2.txt:22616:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./src/services/systemCenter/SystemCenterAutoFix.ts:394:    // 4. FRONTEND_PATCH — Code React/TS correctif
./docs/CRITICAL_FIXES_v26.2.1.md:114:**Pattern:** MAX_PENDING_SAVES with force flush
./docs/CRITICAL_FIXES_v26.2.1.md:120:private static readonly MAX_PENDING_SAVES = 100;
./docs/CRITICAL_FIXES_v26.2.1.md:124:  if (this.pendingSaves.size >= ChatMemoryCompactor.MAX_PENDING_SAVES) {
./docs/CRITICAL_FIXES_v26.2.1.md:128:      maxAllowed: ChatMemoryCompactor.MAX_PENDING_SAVES,
./docs/CRITICAL_FIXES_v26.2.1.md:273:- `src/services/chatMemoryCompactor.ts` - MAX_PENDING_SAVES + export class (L79-94)
./docs/AUDIT_FINAL_v26.2.1.md:123:- `MAX_PENDING_SAVES = 100` 🔒 v26.2.1
./docs/AUDIT_FINAL_v26.2.1.md:292:- **Solution:** MAX_PENDING_SAVES = 100 + force flush
./deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/13_UNIT_RUN_ATTEMPT_3.txt:22616:[90mstdout[2m | src/__tests__/chat-ia-critical-fixes.test.ts[2m > [22m[2mH2: ChatMemoryCompactor - Memory Leak Protection[2m > [22m[2mshould force flush when MAX_PENDING_SAVES reached
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASE1_BANNER_v14.txt:190:✅ BACKEND_PHASE1_SUCCESS_v14.md (500+ lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASE1_BANNER_v14.txt:197:✅ BACKEND_PHASE1_BANNER_v14.txt (CE FICHIER)
./src/services/cache/responseCache.ts:296:  private static readonly MAX_PATTERNS = 500;
./src/services/cache/responseCache.ts:309:      this.commonPatterns.size >= ResponseCache.MAX_PATTERNS
./docs/99_ARCHIVE/old_sessions/2025-12-10/VERIFICATION_FINALE_SUCCESS_v19.2.2.txt:288:   ✓ BACKEND_PHASE1_SUCCESS_v14.md (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/VERIFICATION_FINALE_SUCCESS_v19.2.2.txt:289:   ✓ BACKEND_PHASE1_BANNER_v14.txt (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/VERIFICATION_FINALE_SUCCESS_v19.2.2.txt:290:   ✓ BACKEND_PHASES_2-3_SUCCESS_v14.md (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/VERIFICATION_FINALE_SUCCESS_v19.2.2.txt:291:   ✓ BACKEND_PHASES_1-3_BANNER_v14.txt (1500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/VERIFICATION_FINALE_SUCCESS_v19.2.2.txt:292:   ✓ BACKEND_PHASES_4-6_SUCCESS_v14.txt (1500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_MIGRATION_COMPLETE_v14.txt:194:  ✅ BACKEND_PHASE1_SUCCESS_v14.md (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_MIGRATION_COMPLETE_v14.txt:195:  ✅ BACKEND_PHASE1_BANNER_v14.txt (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_MIGRATION_COMPLETE_v14.txt:196:  ✅ BACKEND_PHASES_2-3_SUCCESS_v14.md (500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_MIGRATION_COMPLETE_v14.txt:197:  ✅ BACKEND_PHASES_1-3_BANNER_v14.txt (1500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_MIGRATION_COMPLETE_v14.txt:198:  ✅ BACKEND_PHASES_4-6_SUCCESS_v14.txt (1500 lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:72:  ✅ BACKEND_PHASE1_SUCCESS_v14.md (500+ lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:318:✅ BACKEND_PHASE1_SUCCESS_v14.md (500+ lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:324:✅ BACKEND_PHASE1_BANNER_v14.txt (500+ lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:329:✅ BACKEND_PHASES_2-3_SUCCESS_v14.md (500+ lignes)
./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:335:✅ BACKEND_PHASES_1-3_BANNER_v14.txt (CE FICHIER)
./src/services/chatMemoryCompactor.ts:104:  private static readonly MAX_PENDING_SAVES = 100;
./src/services/chatMemoryCompactor.ts:109:   * 🔒 v26.2.1: Added MAX_PENDING_SAVES protection against memory leak
./src/services/chatMemoryCompactor.ts:113:    if (this.pendingSaves.size >= ChatMemoryCompactor.MAX_PENDING_SAVES) {
./src/services/chatMemoryCompactor.ts:117:        maxAllowed: ChatMemoryCompactor.MAX_PENDING_SAVES,
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:1344:./docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md:165:1. Réduire clones dans hot paths (chat_orchestrator, audio)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4363:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:15:- **Architecture technique**: ✅ **8/10** (Tauri v2, React hooks, path aliases)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4364:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:244:#### `vite.config.ts`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4365:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:247:  alias: {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4366:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:258:✅ Path aliases configurés correctement
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4367:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:260:#### `tsconfig.json`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4368:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:270:    // Path aliases synchronisés avec Vite
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4369:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:271:    "paths": {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4370:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:272:      "@/*": ["./core/frontend/*"],
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4371:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:397:- ✅ `strict: true` activé dans tsconfig.json
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4372:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:448:- [x] Vérification path aliases Vite/TSConfig
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4373:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:550:- Analyse vite.config.ts
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4374:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:611:- ✅ Configuration technique solide (Vite + TSConfig + aliases)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:4607:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:196:   - 📝 TODO: Créer alias ou renommer frontend
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:12535:./docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md:4:## Scope: src-tauri/src/ (~109,000 lignes de code Rust)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:12536:./docs/BACKEND_PERFORMANCE_AUDIT_v19.3.md:110:grep -rn "unwrap()" src-tauri/src --include="*.rs" | grep -v test
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14890:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:230:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14891:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:235:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14892:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:240:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14893:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:328:      tauri::generate_handler![
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14894:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:377:      #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:14895:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:387:              tauri_only: true,
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:18031:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:272:    • main.rs (invoke_handler)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25102:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:90:**Backend actuel**: `v10.4.0` (main.rs, Cargo.toml, tauri.conf.json, package.json)  
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25103:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:285:import { invoke } from '@tauri-apps/api/core'; // ✅ Tauri v2 correct import
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25104:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:288:  const status = await invoke<SystemStatus>('get_system_status');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25105:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:293:  const metrics = await invoke<string>('helios_get_metrics');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25106:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:297:✅ Import Tauri v2 correct (`@tauri-apps/api/core`)  
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25107:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:298:✅ Typage generics sur `invoke<T>()` présent  
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25108:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:303:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25109:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:388:- **4 commandes détectées backend** (grep #[tauri::command]):
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25110:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:524:- Vérification invoke() type-safety
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25111:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:555:- Validation invoke() exhaustive
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25112:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:582:Backend:  v10.4.0 ✅ (main.rs, Cargo.toml, tauri.conf.json, package.json)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25113:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:591:    "@tauri-apps/api": "^2.0.0",              // ✅ Tauri v2
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25114:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:592:    "@tauri-apps/plugin-shell": "^2.0.0",     // ✅ Tauri v2
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25115:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:598:    "@tauri-apps/cli": "^2.0.0",              // ✅ Tauri v2
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:25116:./docs/99_ARCHIVE/obsolete/AUDIT_FRONTEND_PHASE_1_STRUCTURE.md:612:- ✅ Tauri v2 integration correcte (imports `@tauri-apps/api/core`)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30080:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:4:**Status**: ✅ App lancée (pnpm run tauri:dev)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30081:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:24:const status = await window.__TAURI__.invoke('chat_get_providers_status');
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30082:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:51:const response = await window.__TAURI__.invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30083:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:111:const response2 = await window.__TAURI__.invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30084:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:146:- Terminal où tourne `pnpm run tauri:dev`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30085:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:200:**Action**: Lire src-tauri/src/overdrive/chat_orchestrator.rs ligne 203+
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30086:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:215:await window.__TAURI__.invoke('chat_get_providers_status')
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30087:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:218:await window.__TAURI__.invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30088:./docs/99_ARCHIVE/sessions/TESTS_BACKEND_PHASE2.md:227:await window.__TAURI__.invoke('chat_send_message', {
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30548:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:60:Centraliser tous les appels Tauri dans `tauriClient.ts` et vérifier que toutes
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30549:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:69:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30550:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:81:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30551:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:88:   - 📝 TODO: Implémenter streaming avec tauri::emit!
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30552:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:92:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30553:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:102:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30554:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:117:   #[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30555:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:127:| Frontend Call (tauriClient.ts)       | Backend Command (Rust)            | Status |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30556:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:134:| `invoke('chat_set_gemini_key')`      | `chat_set_gemini_key`             | ✅     |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30557:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:135:| `invoke('chat_get_providers_status')`| `chat_get_providers_status`       | ✅     |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30558:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:136:| `invoke('chat_check_providers')`     | `chat_check_providers`            | ✅     |
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30559:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:181:- [x] Circuit breaker implémenté dans tauriClient.ts
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30560:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:188:   - 📝 TODO: Implémenter avec tauri::emit! et listen frontend
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30561:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:213:- [ ] Implémenter `chat_stream_message` avec tauri::emit!
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:30562:./docs/99_ARCHIVE/legacy_reports/INTEGRATION_BACKEND_FRONTEND_PROGRESS_v14.txt:260:║   Phase 2: Tauri invoke() cohérent, 6 commandes ajoutées                    ║
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33311:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:137:- `src-tauri/src/handlers.rs` (macro generate_titane_handlers)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33312:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:138:- `src-tauri/src/shared/titane_core.rs` (TitaneCore bridge)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33313:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:141:- `src-tauri/src/lib.rs` (restructuration complète)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33314:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:142:- `src-tauri/src/main.rs` (nettoyage, 112 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33315:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:143:- `src-tauri/src/core/legacy.rs` (ajout méthodes complètes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33316:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:144:- `src-tauri/src/compat/plugin_system.rs` (CoreCollection)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33317:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:145:- `src-tauri/src/audio/mod.rs` (AudioError::Internal)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33318:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:146:- `src-tauri/src/system/adaptive_engine/mod.rs` (imports)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33319:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:147:- `src-tauri/src/system/self_heal/mod.rs` (imports)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33320:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:148:- `src-tauri/src/system/watchdog/mod.rs` (imports)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33944:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:25:**Fichiers**: `src-tauri/src/memory/*`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33945:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:40:- `src-tauri/src/overdrive/*` (désactivé si mock)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33946:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:41:- `src-tauri/src/engine/*`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33947:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:42:- `src-tauri/src/evolution/*`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33948:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:58:**Fichiers**: `src-tauri/src/api/*`, `commands/mod.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33949:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:93:**Créer**: `src-tauri/src/commands/diagnostic.rs::backend_self_check`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:33950:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:96:#[tauri::command]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34113:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:32:   Fichier: `src-tauri/src/core/engine.rs` (+28 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34114:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:86:   Fichier créé: `src-tauri/src/compat/core_collection.rs` (135 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34115:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:121:   Fichier modifié: `src-tauri/src/compat/mod.rs`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34116:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:183:1. `src-tauri/src/core/engine.rs` (+28 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34117:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:187:2. `src-tauri/src/compat/mod.rs` (+2 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34118:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:191:1. `src-tauri/src/compat/core_collection.rs` (135 lignes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34147:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1_SUCCESS_v14.md:19:$ cd src-tauri && cargo check
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:34148:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1_SUCCESS_v14.md:35:custom-protocol = ["tauri/custom-protocol"]
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137755:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:26:⚠️  99 warnings (imports inutilisés, dead_code, deprecated)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137756:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:37:- ✅ `core/legacy.rs` — Adaptateurs v12 avec toutes méthodes requises
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137757:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:65:- ✅ **CoreCollection** : Bridge v12 → v14 avec tous cores legacy
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137758:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:72:// Accès aux cores legacy pour compatibilité
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137759:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1-3_SUCCESS_v14.md:143:- `src-tauri/src/core/legacy.rs` (ajout méthodes complètes)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137851:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:63:3. Déprécier anciennes APIs legacy si nécessaire
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137852:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:74:- ~30 `deprecated` (shared::types::ModuleHealth)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137853:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:81:3. Remplacer `ModuleHealth` deprecated par `ModuleHealthInfo`
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137854:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:150:- [ ] Déprécier legacy APIs
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137855:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES4-9_ROADMAP_v14.md:154:- [ ] Remplacer ModuleHealth deprecated
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137904:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:81:Adapter modules legacy v12 pour utiliser architecture v14 (SingularityEngine + modules).
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137905:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:94:       // v12 legacy adapters (lightweight wrappers)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137906:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:105:   **Méthodes legacy v12**:
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137907:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:114:   - `sync_to_engine()` → Sync legacy → unified state
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137908:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASES_2-3_SUCCESS_v14.md:208:- [x] API legacy 5 adapters
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137914:./docs/99_ARCHIVE/versions/v14/BACKEND_PHASE1_SUCCESS_v14.md:193:- **dead_code** (15): Fonctions/structs non utilisées modules legacy
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137942:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASE1_BANNER_v14.txt:106:  │ Modules legacy actifs  │ 20     │ 0      │ Désactivés (full) │
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137943:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASE1_BANNER_v14.txt:112:  📌 dead_code: 15 (modules legacy en transition)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137944:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASE1_BANNER_v14.txt:156:     - modules/ (v12 Helios, Nexus → use core::legacy adapters)
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137951:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:127:         // v12 legacy adapters
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137952:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_1-3_BANNER_v14.txt:169:  ✅ API legacy: 5 adapters
./docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt:137958:./docs/99_ARCHIVE/old_sessions/2025-12-10/BACKEND_PHASES_4-6_SUCCESS_v14.txt:340:          // Legacy deprecated
./src/lib/security.ts:1240:const MAX_PAYLOAD_SIZE =
./src/lib/security.ts:1241:  readViteEnvNumber('VITE_TITANE_SECURITY_MAX_PAYLOAD_MB', 50) * 1024 * 1024;
./src/lib/security.ts:1449:  if (sizeBytes > MAX_PAYLOAD_SIZE) {
./src/lib/security.ts:1450:    errors.push(`Payload too large: ${sizeBytes} bytes (max: ${MAX_PAYLOAD_SIZE} bytes)`);
./src/lib/security.ts:1974:    max_payload_size_bytes: MAX_PAYLOAD_SIZE,
