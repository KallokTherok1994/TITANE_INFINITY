# EXEC SUMMARY — WEBKIT_BOOT_OLLAMA_AUTOHEAL
Date: 2026-03-16T21:31:00Z
SHA: ea50a6493
Classification: MIXED_CAUSE (4 root causes)

## Root Causes
| # | ID | Sev | Cause | Evidence |
|---|----|----|-------|----------|
| 1 | UI_BOOT_DUPLICATION | P0 | avatar-floating loads full App bundle | tauri.conf.json:47-63 |
| 2 | OLLAMA_PROBE_STORM | P0 | 4 concurrent Ollama probes at boot | main.rs:952+976, App.tsx:456 |
| 3 | BREAKER_FALSE_OFFLINE | P1 | endpointHealthy=false 45s during warmup | ollama.ts:156-165 |
| 4 | WEBKIT_RUNTIME_CRASH | P1 | transparent+no-decoration hidden window | tauri.conf.json:57-58 |

## Fixes Applied
- FIX-1: src/main.tsx — Non-main window guard (minimal stub mount)
- FIX-2: src/services/ai/providers/ollama.ts — Singleton initializeOllama()
- FIX-3: src/services/ai/providers/ollama.ts — Warmup grace period 30s/5s retry
- FIX-4: scripts/autoheal/autoheal_rules.jsonl — 2 new AutoHeal rules

## Verdict: QUALIFIED
Build: PASS. Tests: 3 pre-existing failures (unrelated to fixes). E2E: BLOCKED_E2E.
