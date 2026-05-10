# UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_DESIGN_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Problem Statement

WDIO desktop suites in v60/v61 could only prove DOM-level evidence (UI reflects state) but could not prove that the UI's data came from real IPC responses. The root cause was that Tauri v2 does not expose `window.__TAURI__.invoke()` (Tauri v1 API) — WDIO scripts could not call IPC from outside the app context.

---

## Solution: In-App Context Bridge

The bridge registers a safe, read-only IPC proxy (`window.__TITANE_E2E_IPC_PROBE__`) from WITHIN the Tauri WebView app context during bootstrap — only when the E2E test flag is set.

```
WDIO test → browser.execute(() => window.__TITANE_E2E_IPC_PROBE__.invoke('health_check'))
                         ↓ (runs inside Tauri WebView context)
            window.__TITANE_E2E_IPC_PROBE__.invoke('health_check')
                         ↓
            dynamic import('@tauri-apps/api/core') → invoke('health_check')
                         ↓ (Tauri v2 IPC — real round-trip)
            Rust handler → { ok: true, content: {...} }
                         ↓
            ProbeResponse { proofLevel: 'IPC_RESPONSE_PROVEN', ... }
```

---

## Activation Gate (Production Safety)

Bridge ONLY activates when:
1. `localStorage.getItem('TITANE_E2E_PROBE') === '1'`  
2. `typeof window !== 'undefined'` (browser context)

In production (no flag set), `initE2EProbeBridge()` is a no-op — zero overhead, zero surface exposure.

---

## Security Guards

| Guard | Implementation |
|-------|----------------|
| Production gate | `isE2EProbeEnabled()` — requires localStorage flag |
| Allowlist gate | Only 8 pre-approved commandIds accepted |
| Destructive guard | 17 destructive patterns blocked (`delete`, `write`, `set_`, etc.) |
| Response redaction | Home paths, tokens, passwords redacted before returning to WDIO |
| Response shape only | Returns field names, never raw values |
| Single-write | `window.__TITANE_E2E_IPC_PROBE__` cannot be overwritten once set |

---

## File Architecture

```
src/e2e/desktop/
├── e2eIpcProbeAllowlist.ts      # Allowlist of 8 safe read-only commands
├── e2eIpcProbeBridge.ts         # Core bridge implementation
├── registerE2eProbeBridge.ts    # Thin init wrapper called from main.tsx
└── __tests__/
    ├── e2eIpcProbeAllowlist.test.ts   # 18 unit tests
    └── e2eIpcProbeBridge.test.ts      # 22 unit tests

src/main.tsx                     # Bridge init (patched)
src/lib/security.ts              # ALLOWED_COMMANDS (cloud_get_status added)

e2e/desktop/
├── ui-desktop-tauri-ipc-probe-bridge.wdio.test.js   # Bridge presence + invoke
├── ui-desktop-v62-real-ipc-agent-chat.wdio.test.js  # AGENT_CHAT: health_check
├── ui-desktop-v62-real-ipc-experience.wdio.test.js  # EXPERIENCE: experience_get_state
├── ui-desktop-v62-real-ipc-research.wdio.test.js    # RESEARCH: blocked (honest)
└── ui-desktop-v62-real-ipc-cloud.wdio.test.js       # CLOUD: cloud_get_status

artifacts/backend-proof-depth/
├── v62-tauri-ipc-probe-bridge.jsonl   # Bridge + system_health proof
└── v62-tauri-ipc-response.jsonl       # Module proof levels
```

---

## ProbeResponse Interface

```typescript
interface ProbeResponse {
  ok: boolean;
  commandId: string;
  command: string;
  attempted: boolean;
  available: boolean;
  responseShape: string[] | null;        // Field names only
  contentPreviewRedacted: string | null; // Redacted partial preview
  errorKind: ErrorKind | null;
  errorMessageRedacted: string | null;
  latencyMs: number;
  proofLevel: ProofLevel;               // 'IPC_RESPONSE_PROVEN' on success
  safeToPersist: boolean;               // Always true (redaction applied)
  redactionApplied: boolean;
  bridgeVersion: 'v62';
  source: 'APP_CONTEXT_TAURI_IPC_PROBE';
}
```
