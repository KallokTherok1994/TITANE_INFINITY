# BOOTSTRAP — OMEGA TIMEOUT RECERT

## Repo Truth
- HEAD: 56e4a0150 (MAIN)
- Version: 28.0.0
- Timeout patch: 4ede39ac8 (ollama 8→45s, providerAttemptMs 8→50s, maxAttempts 3→2)
- ChatProfile patch: 0cf3dbdff (FAST/BALANCED/DEEP, stage timeouts Rust)

## Runtime Target Truth — CRITICAL FINDINGS

| Process | PID | Binary | Version | Contains Patches? |
|---------|-----|--------|---------|-----------------|
| AppImage | 1315738/1315748 | /tmp/.mount_TITANEIHdNEG/usr/bin/titane-infinity | v27.2.0 | NO — pre-patch (built 2026-03-14) |
| Debug stale | 1387360/1413564 | target/debug/titane-infinity (DELETED) | unknown | DEAD |
| Debug current | 1516658 | target/debug/titane-infinity | compiled 11:39:22 | NO — binary compiled 6 min before patches |
| Vite dev | 1339482 | Vite 4000 | serves TS | aiTimeouts.config.ts FIX: YES (TS files) |

## G_FIX_ACTIVE_IN_RUNTIME — FAIL at bootstrap
The running AppImage v27.2.0 contains NEITHER patch.
The debug binary was compiled at 11:39:22 — 6 minutes before timeout commit (4ede39ac8 at 11:45).
Action: `cargo build` initiated to produce patched binary.

## Config Truth (source file — post-patch)
- PROVIDER_TIMEOUTS.ollama: 45_000 ✓
- PROVIDER_TIMEOUTS.tauri-backend: 50_000 ✓
- REQUEST_BUDGETS.providerAttemptMs: 50_000 ✓
- REQUEST_BUDGETS.maxAttempts: 2 ✓
- REQUEST_BUDGETS.globalRequestMs: 52_000 ✓
- STREAM_CONFIG.totalTimeoutMs: 52_000 ✓
- UI_TIMEOUTS.ollamaProvider: short=20000, long=45000 ✓

## Ollama Truth
- Status: RUNNING (PID 2444, port 39525)
- Models: llama3:latest, gemma2:2b, qwen2.5:latest, codellama:latest, deepseek-coder-v2:latest, gemma2:latest, llama3.2:1b, llama3.2:latest, llama3.1:latest, phi3.5:latest
- Provider available: YES
