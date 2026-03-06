# 03_INVARIANTS_CHECK
Generated: 2026-03-05T12:17:29Z

## G_RING_INTEGRITY
- Command class: `rg` import-direction heuristics on `src/types`, `src/constants`, `src/engines`, `src/services`
- Result: FAIL (matches=9)
- Representative matches:
  - `src/services/systemCenter/SystemCenterAutoFix.ts:610:import { ErrorBoundary } from '@/components/ErrorBoundary';`
  - `src/services/voice/activeListening.ts:34:export { WakeWordIndicator, WakeWordBadge } from '@/components/voice/WakeWordIndicator';`

## G_FRONTEND_NO_WEB
- Command class: `rg -n "(fetch\(|axios|XMLHttpRequest|WebSocket|https?://)" src ...`
- Result: FAIL (matches=81)
- Representative matches:
  - `src/config/offline-first.ts:77:await httpClient.head('https://www.google.com/favicon.ico', ...)`
  - `src/components/sections/ConversationSection.tsx:248:` URL seeds `https://fr.wikipedia.org/...`

## G_NETWORK_ONE_DOOR
- Command class: network token scan outside gateway allowlist paths
- Result: FAIL (matches=345)
- Representative matches:
  - `src-tauri/tauri.conf.json:1085:https://generativelanguage.googleapis.com/**`
  - `src-tauri/src/ollama.rs:8:const OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";`

## G_NO_UNBOUNDED
- Command class: `rg -n "while(true)|for(;;)|setInterval\(|loop\{|retry\(" ...`
- Result: FAIL (matches=276)
- Note: heuristic scan; manual triage required to separate legitimate bounded usage from violations.

## G_IPC_CANON
- Command class: direct `invoke(` scan outside canonical client path filters
- Result: FAIL (direct invoke matches=31)
- Representative matches collected in prior scan output.

## G_VERSION_SYNC
- Result: FAIL
- Extracted values:
  - `package.json=27.2.0`
  - `src-tauri/Cargo.toml=MISSING` (parser did not retrieve package version)
  - `src-tauri/tauri.conf.json=27.2.0`
  - `deployment/latest/MANIFEST.json=27.2.0`
  - `deployment/latest/SHA256SUMS_v27.2.0.txt=present`
  - `deployment/latest/SIZES_v27.2.0.txt=present`

## G_PATHS_OK_PER_OS
- Command class: hardcoded path scan over `src`, `src-tauri`, `scripts`, `e2e`
- Result: FAIL (matches=311)
- Representative matches:
  - `scripts/test-chat-fallback-live.sh:18:LOG_FILE="/tmp/titane-chat-test-$(date +%s).log"`
  - `scripts/v24_auto_observer.sh:9:PROGRESS_SCRIPT="/home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/v24_check_progress.sh"`

## SUPERSEDED/REBUILT (append-only) - 2026-03-05T07:56:53-05:00
- Correction note: a previously rebuilt strict section was accidentally removed during cleanup in an earlier iteration. This block re-adds rebuilt evidence in append-only mode (no destructive rewrite).

### Strict Scan Rerun (authoritative artifact set)
- `CMD_1` `rg -n 'fetch\(|axios\(|XMLHttpRequest|WebSocket' src` -> `exit=1`, `lines=0`
- `CMD_2` `rg -n 'https?://' src` -> `exit=0`, `lines=162`
- `CMD_3` `rg -n 'invoke\(|tauri::command|generate_handler!' src-tauri` -> `exit=0`, `lines=1313`
- `CMD_4` `rg -n 'reqwest|ureq|hyper' src-tauri` -> `exit=0`, `lines=127`
- `CMD_5` `rg -n 'loop\s*\{|while\s*\(|retry|backoff' src src-tauri` -> `exit=0`, `lines=700`
- `CMD_6` `rg -n 'ok\s*:\s*true|content\s*:' src src-tauri` -> `exit=0`, `lines=1981`
- `CMD_7` `rg -n 'version' package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json runtime/dev/tauri.conf.json runtime/stable/tauri.conf.json` -> `exit=0`, `lines=19`
- `CMD_8` `rg -n '(/home/|C:\\|\\\\|/tmp/)' src src-tauri scripts e2e` -> `exit=0`, `lines=427`
- `CMD_9` `rg -n 'invoke\(' src` -> `exit=0`, `lines=661`
- `CMD_10` `rg -n 'invoke\(' src --glob '!**/__tests__/**' --glob '!**/*.test.*'` -> `exit=0`, `lines=503`

### Rebuilt Gate Snapshot (strict rerun)
- `G_RING_INTEGRITY`: `FAIL` (inherited from earlier ring-import evidence in same file; not resolved by this rerun)
- `G_FRONTEND_NO_WEB`: `FAIL` (`CMD_2` shows direct `http/https` endpoints in source and config paths)
- `G_NETWORK_ONE_DOOR`: `FAIL` (`CMD_4` confirms network libs/config footprint, including `reqwest` and gateway-related surface)
- `G_NO_UNBOUNDED`: `FAIL` (`CMD_5` shows loop/retry/backoff patterns requiring manual boundedness proof)
- `G_IPC_CANON`: `FAIL` (`CMD_10` finds 503 `invoke(` occurrences outside strict single-file canonical policy scope)
- `G_VERSION_SYNC`: `FAIL` (`CMD_7` shows mismatch: `package.json=27.2.0`, `src-tauri/Cargo.toml=27.2.0`, `src-tauri/tauri.conf.json=27.2.0`, `runtime/dev=26.2.0-dev`, `runtime/stable=27.0.5`)
- `G_PATHS_OK_PER_OS`: `FAIL` (`CMD_8` finds 427 path-pattern matches, including `/tmp` and `/home/...` references)
