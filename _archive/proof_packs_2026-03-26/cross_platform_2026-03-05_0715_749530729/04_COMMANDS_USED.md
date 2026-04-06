# 04_COMMANDS_USED
- 2026-03-05T12:15:52Z init proof-pack directory and files 00..11
- 2026-03-05T12:15:52Z bootstrap capture: git status, git rev-parse --short HEAD, git log -20 --oneline, tree/find maxdepth 3, workflow/config listings
- 2026-03-05T12:17:29Z gates scan with rg heuristics: ring integrity, frontend no web, one door network, unbounded loops/retries, IPC canon, version sync, paths per OS
- 2026-03-05T12:17:46Z tooling discovery: package scripts, tauri-cli version, rust targets, java/android SDK tools, mingw/wine indicators
- 2026-03-05T12:20:58Z bounded Windows build attempts x3: `timeout 15s pnpm exec tauri build --target x86_64-pc-windows-msvc --bundles nsis`
- 2026-03-05T12:20:58Z bounded Android build attempts x3: `timeout 15s pnpm exec tauri android build --debug`
- 2026-03-05T12:21:19Z corrected Windows target rerun started: `timeout 20s pnpm exec tauri build --target x86_64-pc-windows-msvc`
- 2026-03-05T12:21:19Z Android init precheck started: `timeout 20s pnpm exec tauri android init`
]633;E;{   echo\x3b   echo "## Process cleanup — $TS"\x3b   echo '```bash'\x3b   echo 'set +e'\x3b   echo 'date -Is'\x3b   date -Is\x3b   echo\x3b   echo 'pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true'\x3b   pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true\x3b   echo\x3b   echo 'pkill -f "pnpm exec tauri|tauri build|tauri android build" || true'\x3b   pkill -f "pnpm exec tauri|tauri build|tauri android build" || true\x3b   echo\x3b   echo 'pkill -f "cargo build|rustc" || true'\x3b   pkill -f "cargo build|rustc" || true\x3b   echo\x3b   echo 'sleep 1'\x3b   sleep 1\x3b   echo\x3b   echo 'pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true'\x3b   pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true\x3b   echo '```'\x3b } >> "$PACK/04_COMMANDS_USED.md";253de103-6670-4818-86a1-d3cc029bfa7b]633;C
## Process cleanup — 2026-03-05T07:33:13-05:00
```bash
set +e
date -Is
2026-03-05T07:33:13-05:00

pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true

pkill -f "pnpm exec tauri|tauri build|tauri android build" || true

pkill -f "cargo build|rustc" || true

sleep 1

pgrep -af "tauri build|pnpm exec tauri|cargo build|rustc|tauri android" || true
```
]633;E;{   echo "- $TS exact scans executed -> $SCAN_OUT"\x3b   echo "- commands: CMD_1..CMD_8"\x3b } >> "$PACK/04_COMMANDS_USED.md";253de103-6670-4818-86a1-d3cc029bfa7b]633;C- 2026-03-05T07:38:52-05:00 exact scans executed -> /tmp/cross_platform_repair_scans_20260305.txt
- commands: CMD_1..CMD_8

## SUPERSEDED/REBUILT (append-only) - 2026-03-05T07:56:53-05:00
- Correction note: previous rebuilt command block was deleted by mistake in an earlier cleanup attempt; this block restores strict command evidence append-only.

### Strict Invariant Commands Executed
1. `rg -n 'fetch\(|axios\(|XMLHttpRequest|WebSocket' src` -> `exit=1`, `lines=0`
2. `rg -n 'https?://' src` -> `exit=0`, `lines=162`
3. `rg -n 'invoke\(|tauri::command|generate_handler!' src-tauri` -> `exit=0`, `lines=1313`
4. `rg -n 'reqwest|ureq|hyper' src-tauri` -> `exit=0`, `lines=127`
5. `rg -n 'loop\s*\{|while\s*\(|retry|backoff' src src-tauri` -> `exit=0`, `lines=700`
6. `rg -n 'ok\s*:\s*true|content\s*:' src src-tauri` -> `exit=0`, `lines=1981`
7. `rg -n 'version' package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/dev/tauri.conf.json runtime/stable/tauri.conf.json` -> `exit=0`, `lines=19`
8. `rg -n '(/home/|C:\\|\\\\|/tmp/)' src src-tauri scripts e2e` -> `exit=0`, `lines=427`
9. `rg -n 'invoke\(' src` -> `exit=0`, `lines=661`
10. `rg -n 'invoke\(' src --glob '!**/__tests__/**' --glob '!**/*.test.*'` -> `exit=0`, `lines=503`

### Exact X3 Wrapper Commands Executed
1. `bash scripts/lib/run_x3.sh "proof_packs/cross_platform_2026-03-05_0715_749530729/06_BUILD_X3.log" timeout 900 pnpm -s install`
2. `bash scripts/lib/run_x3.sh "proof_packs/cross_platform_2026-03-05_0715_749530729/06_BUILD_X3.log" timeout 900 pnpm exec tauri build`
3. `bash scripts/lib/run_x3.sh "proof_packs/cross_platform_2026-03-05_0715_749530729/06_BUILD_X3.log" timeout 900 pnpm exec tauri build --target x86_64-pc-windows-msvc`
4. `bash scripts/lib/run_x3.sh "proof_packs/cross_platform_2026-03-05_0715_749530729/06_BUILD_X3.log" timeout 900 pnpm exec tauri android build --debug`

### X3 Execution Outcome Summary
- Install x3: `PASS 3/3` (`06_BUILD_X3.log` contains summary `PASS=3/3 FAIL=0/3`).
- Tauri default build x3: `BLOCKED_EXECUTION` (multiple attempts interrupted/terminated in this shell environment; recorded in `/tmp/x3_status.log` as `run_x3_tauri_build*_exit=143`).
- Windows target x3: `BLOCKED 0/3` (`x86_64-pc-windows-msvc` target missing; summary `PASS=0/3 FAIL=3/3`).
- Android build x3: `BLOCKED 0/3` (`src-tauri/gen/android` missing; summary `PASS=0/3 FAIL=3/3`).
