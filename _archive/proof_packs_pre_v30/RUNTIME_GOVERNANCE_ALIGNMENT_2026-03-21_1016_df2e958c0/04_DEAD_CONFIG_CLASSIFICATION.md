# Phase 3 — Dead Config Classification

| Config | Classification | Action |
|---|---|---|
| `TITANE_CONVERSATION_TIMEOUT_SECS` env | DEAD_CODE | Removed from active export. Labelled [DEAD] in run script. Removed from wdio.desktop.conf.cjs passthrough. |
| `src-tauri/src/ollama.rs` (root) | DEAD_CODE | Orphaned file NOT in module tree. `#![allow(dead_code)]` annotation. No action (not misleading since not reachable). |
| `DEFAULT_TIMEOUT_MS = 0` in security.ts | DEAD_CODE / LEGACY | Retained for security stats schema. No runtime effect. Documented. |
| `OFFLINE_SIM` env | LIVE_AUTHORITY | Harness only. Correct. |
| `OLLAMA_DEFAULT_MODEL` env | LIVE_AUTHORITY | Harness + product. Correct. |
| `OLLAMA_BASE_URL` / `OLLAMA_URL` | LIVE_AUTHORITY | Read in ai/ollama.rs. Correct. |
| `OLLAMA_REQUEST_TIMEOUT_SECS` | LIVE_AUTHORITY (NEW) | Wired to ai/ollama.rs HTTP client. Governed. |

## Proof: TITANE_CONVERSATION_TIMEOUT_SECS is dead
```
grep -rn "TITANE_CONVERSATION_TIMEOUT_SECS" src-tauri/src/ --include="*.rs"
# → 0 results
```

## G_DEAD_CONFIG_CLASSIFIED: PASS
