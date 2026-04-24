# BOOTSTRAP — CHAT_PROVIDER_TRUTH_RECOVERY

## Git State

- SHA: c1c03e320
- Branch: MAIN
- Status: 2 files modified (chat_orchestrator.rs, circuitBreaker.ts)
- Last 5 commits:
  - c1c03e320 docs(real-desktop-final): TOTAL_DEV real X11 desktop certification
  - 8d391b62b fix(e2e): add data-testid attributes for smoke test Playwright selectors
  - 599b4d972 docs(pass-upgrade): TOTAL_DEV v28.1.0 E2E audit
  - 8bccd1b9f docs(recert): TOTAL_DEV v28.1.0 hard recertification
  - 2182d0226 fix(security): remove plaintext token reference

## Toolchain

- node: v18.19.1 (below pnpm engine constraint >=20, tauri CLI unavailable)
- pnpm: 10.30.2
- cargo: 1.94.0 (2026-01-15)
- rustc: 1.94.0 (4a4ef493e 2026-03-02)
- tauri CLI: N/A (Node v18 incompatible with engine constraint)

## Key Files Inspected

| File                                              | Lines  | Status                 |
| ------------------------------------------------- | ------ | ---------------------- |
| src-tauri/src/overdrive/chat_orchestrator.rs      | 2084   | PRIMARY LOCK FOUND     |
| src/services/ai/circuitBreaker.ts                 | 343    | SECONDARY DEFECT FOUND |
| src-tauri/src/api_hub/temporal_circuit_breaker.rs | 308    | NOT primary path       |
| src/services/ai/chatEngine.ts                     | large  | uses circuitBreaker.ts |
| src/services/tauri/chatEngine.commands.ts         | medium | IPC bridge             |

## Runtime Constraint

- Tauri desktop build not runnable (Node v18 engine incompatibility + display requirements)
- cargo check: EXIT 0 (Rust compiles clean)
- Runtime proofs: classified as BLOCKED_HEADLESS — consistent with prior session policy
