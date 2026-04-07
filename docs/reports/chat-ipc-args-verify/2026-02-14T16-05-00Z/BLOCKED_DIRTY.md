# BLOCKED — Dirty Git Tree

Date: 2026-02-14
Status: BLOCKED
Gate: PHASE 0 (Preflight)

## Reason

Git working tree is dirty. Stop-the-line per rules.

## Dirty Files

- docs/diagnostics/IPC_FINAL_MATRIX.md
- src/lib/ipcContract.ts
- src/services/ai/providers/tauriChat.ts
- src/services/api/chat.ts
- src/services/api/index.ts
- src/services/conversationEngine.test.ts
- src/services/conversationEngine.ts
- src/services/tauri/chatEngine.commands.ts
- src/services/tauriBridge.ts
- src/tests/e2e/titane_e2e.test.ts
- src/tests/regression/titane_regression.test.ts
- tests/contract/tauri-ipc-contract.test.ts
- docs/diagnostics/CHAT_RUNTIME_IPC_ARGS_FIX_REPORT.md (untracked)

## Action Required

Clean or commit changes, then re-run verification.

---

## Preflight Recheck (2026-02-14)

Status: BLOCKED

Dirty files detected:

- docs/diagnostics/CHAT_RUNTIME_IPC_ARGS_FIX_REPORT.md
