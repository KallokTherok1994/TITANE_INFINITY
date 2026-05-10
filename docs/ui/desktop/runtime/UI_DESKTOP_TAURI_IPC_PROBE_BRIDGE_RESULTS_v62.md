# UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_RESULTS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62 — FULL AUTONOMOUS EXECUTION  
**Status:** DONE  
**Date:** 2026-05-10  
**Version:** v33.0.12  

---

## Bridge Spec Results

| Test | Result |
|------|--------|
| Bridge registered | `IPC_BRIDGE_REGISTERED` ✅ |
| Bridge version | `v62` ✅ |
| Allowlist returned | 8 commands ✅ |
| `system_health` invoke | `IPC_RESPONSE_PROVEN` ✅ |

### Artifact: `v62-tauri-ipc-probe-bridge.jsonl` (3 lines)
```
proofLevel=IPC_BRIDGE_REGISTERED (×2)
proofLevel=IPC_RESPONSE_PROVEN   (×1 — system_health via health_check)
```

---

## Module IPC Results

| Module | commandId | Command | Proof Level | Verdict |
|--------|-----------|---------|-------------|---------|
| AGENT_CHAT | `health_check` | `health_check` | `IPC_RESPONSE_PROVEN` | ✅ PROVEN |
| EXPERIENCE | `experience_state` | `experience_get_state` | `IPC_RESPONSE_PROVEN` | ✅ PROVEN |
| RESEARCH | `web_research` | blocked | `PROOF_DEPTH_BLOCKED_BY_MISSING_SAFE_COMMAND` | ⚠️ BLOCKED |
| CLOUD | `cloud_status` | `cloud_get_status` | `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | ⚠️ BLOCKED |

### AGENT_CHAT (`health_check`)
Real IPC via `health_check` Tauri command. Bridge invoked successfully. Response shape confirmed. `ok=true`, `latencyMs<100`.

### EXPERIENCE (`experience_get_state`)
Real IPC via `experience_get_state` Tauri command. Bridge invoked successfully. Response shape confirmed. `ok=true`.

### RESEARCH
`web_research` performs uncontrolled external network calls — forbidden by One Door policy (Rule 5). No safe read-only status command exists. Correctly classified as `BLOCKED_BY_MISSING_SAFE_COMMAND`. Next action: implement `research_get_status` read-only Rust command.

### CLOUD (`cloud_get_status`)
IPC command `cloud_get_status` exists in Rust but requires Tauri managed state that is not initialized at app boot. Error: `"state not managed for field state on command cloud_get_status. You must call .manage() before using this command"`. Correctly classified as `PROOF_DEPTH_BLOCKED_BY_RUNTIME`. Next action: register CloudState with Tauri `.manage()`.

---

## Regression Gates

| Gate | Result |
|------|--------|
| `pnpm run check` | ✅ PASS |
| `pnpm run lint` | ✅ PASS |
| `pnpm run guard:ipc-contract` | ✅ 42/42 PASS |
| `pnpm run verify:backend-proof-depth` | ✅ PASS (12P|282W|0F) |

---

## Unit Tests

| Suite | Tests | Result |
|-------|-------|--------|
| `e2eIpcProbeAllowlist.test.ts` | 18 | ✅ PASS |
| `e2eIpcProbeBridge.test.ts` | 22 | ✅ PASS |
| **Total** | **40** | **✅ 40/40** |
