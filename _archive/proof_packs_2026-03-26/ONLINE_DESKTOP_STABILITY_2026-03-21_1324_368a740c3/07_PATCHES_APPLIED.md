# PATCHES APPLIED
## Date: 2026-03-21

## Patch 1 — Ollama Pre-warm Preflight

### File
`scripts/e2e/run-online-chat-proof-ui.sh`

### Change
+30 lines — Ollama pre-warm preflight section added before tauri-driver launch.

### Cause
1 defect: `ONLINE_DESKTOP_STABILITY_GAP` → dominant sub-cause: `PREWARM_MISSING` + `PROVIDER_READINESS_GAP`

### Proof of minimal scope
- No product code changed (no Rust, no TypeScript, no IPC)
- No test files changed (no vitest, no WDIO test spec)
- Only harness orchestration script changed
- diff: +30 lines in one file

### Rollback
```bash
git restore -- scripts/e2e/run-online-chat-proof-ui.sh
```

## Patch 2 — AutoHeal entry

### File
`scripts/autoheal/autoheal_rules.jsonl`

### Change
+1 JSONL entry: `AH-2026-03-21-OLLAMA-COLD-START-PREWARM`

### Rollback
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Combined rollback
```bash
git restore -- scripts/e2e/run-online-chat-proof-ui.sh scripts/autoheal/autoheal_rules.jsonl
```
