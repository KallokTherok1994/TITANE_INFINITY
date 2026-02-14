# CHAT_RUNTIME_IPC_ARGS_FIX_REPORT

Date: 2026-02-14
Status: IN_PROGRESS
Ring impacted: Ring 3 (Services), Ring 4 (Tests/E2E harness)

## Objective

Align `conversation_generate` IPC payload shape with Rust/Tauri signature by enforcing `{ args: { ... } }` wrapper and validating the wrapper at the IPC contract layer.

## Evidence (Console)

- Pending Gate-3 UI smoke capture (expected: no "missing required key args" after patch)
- Will append logs from dev:tauri console and Rust logs after manual verification

## Rust Signature Evidence

- `src-tauri/src/conversation_engine/commands.rs` signature uses `args: ConversationGenerateArgs`
- Tauri expects root key `args` for IPC invocation

## Hypothesis

Frontend must send `{ args: payload }` to match Rust/Tauri IPC contract. Flat payloads should be rejected early by IPC validation.

## Patch Summary (Phase 3)

- Updated IPC contract schema to require wrapper key `args`
- Wrapped all production call sites for `conversation_generate`
- Updated tests and docs to enforce wrapper shape

## Gates

- GATE-1 `pnpm test`: PENDING (needs re-run after patch)
- GATE-2 `pnpm run guard:ipc-contract`: PENDING (needs re-run after patch)
- GATE-3 dev:tauri smoke: PENDING (manual UI verification required)

## Proof Pack

- reports/chat-runtime-ipc-args-fix/2026-02-14T15:38:30Z/
  - INVENTORY.md
  - PATCH_SUMMARY.md
  - VERDICT.md
  - ROLLBACK.md

---

Append-only log:
- 2026-02-14: Report created; Gates pending re-run after patch.
- 2026-02-14: Verification attempted; Gate-1 blocked (pnpm test not executed via tool). See reports/chat-ipc-args-verify/2026-02-14T16:05:00Z/.
