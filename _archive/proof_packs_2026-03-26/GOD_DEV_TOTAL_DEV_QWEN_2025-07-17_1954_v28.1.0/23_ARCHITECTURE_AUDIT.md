# ARCHITECTURE AUDIT — TOTAL_DEV v28.1.0 Integration

## 4-Ring Invariant Preservation

### Ring 0 (Tauri Runtime / Rust Backend)
**New component**: `src-tauri/src/commands/total_dev_commands.rs`

**Design**:
- Module `total_dev_commands` declared in `main.rs:165-166`
- 6 public async commands (tagged `#[tauri::command]`)
- All commands require unlock gate before shell/git/fs execution
- Session state via `AtomicU64` (thread-safe, no DB dependency)

**Security**:
- Unlock hash `TOTAL_DEV_UNLOCK_HASH` is a constants.rs private value (line 22)
- Token compared via SHA-256 (sha2 = 0.10, already in Cargo.toml)
- No plaintext passwords stored or logged
- File read blocklist: `.env`, `.pem`, `.key`, `.secret`
- File read max size: 200KB
- Shell command allowlist: git, pnpm, cargo, node, ls, cat (src/* only)
- Git operation allowlist: status, diff, log, add, restore, commit, push, branch, stash, show, rev-parse, fetch, pull

**4-Ring compliance**: ✅
- No Ring2/Ring3 imports (only std::, tauri::, serde, sha2, process)
- No UI-facing secrets or tokens
- No fallback to stub behavior (errors propagated correctly)

### Ring 1 (IPC / Tauri invoke_handler)
**New registrations**: In `main.rs` lines 2846-2851

```rust
total_dev_commands::total_dev_unlock,
total_dev_commands::total_dev_session_status,
total_dev_commands::total_dev_revoke,
total_dev_commands::total_dev_git_op,
total_dev_commands::total_dev_run_command,
total_dev_commands::total_dev_read_file,
```

**Contract compliance**: ✅
- Return type: `Result<..., String>` → `{ ok: ..., error: "..." }` via Tauri serde
- No silent failures
- All commands include origin verification via capability `total_dev.json`

**Capability declaration** (`src-tauri/capabilities/total_dev.json`):
- Window: `["main"]`
- Allows 6 commands
- Scope enforcement at Tauri runtime level

### Ring 2 (Services / TypeScript manifests)
**New entry**: In `src/core/commands/TAURI_COMMANDS.ts` lines 211-216

```typescript
TOTAL_DEV_UNLOCK: 'total_dev_unlock',
TOTAL_DEV_SESSION_STATUS: 'total_dev_session_status',
TOTAL_DEV_REVOKE: 'total_dev_revoke',
TOTAL_DEV_GIT_OP: 'total_dev_git_op',
TOTAL_DEV_RUN_COMMAND: 'total_dev_run_command',
TOTAL_DEV_READ_FILE: 'total_dev_read_file',
```

**IPC invocation pattern**: Via `secureInvoke(TAURI_COMMANDS.TOTAL_DEV_*, payload)`
- Defined in service layer (not shown, pre-existing pattern)
- Error handling via try-catch + toast notifications
- No direct Network calls from TotalDevPage

### Ring 3 (UI / React Components)
**New component**: `src/pages/TotalDevPage.tsx` (1069 lines)

**Sub-components**:
1. `LockBadge` — state display, polling for expiry
2. `UnlockPanel` — password input → `secureInvoke(TOTAL_DEV_UNLOCK)`
3. `ChatDevPanel` — Ollama provider integration, QWEN system prompt
4. `ConsoleDevPanel` → `secureInvoke(TOTAL_DEV_RUN_COMMAND)`
5. `GitPanel` → `secureInvoke(TOTAL_DEV_GIT_OP)`
6. `FileInspectorPanel` → `secureInvoke(TOTAL_DEV_READ_FILE)`
7. `DevActionsPanel` — preset action buttons

**4-Ring compliance**: ✅
- All IPC via `secureInvoke()` wrapper
- No direct import of Ring0/Ring1 (no `../src-tauri` imports)
- Lazy-loaded to prevent early coupling
- Styled via dedicated CSS (no inline Ring0 references)

**Integration into App.tsx**:
- Lazy import (line 179-181)
- Route `/total-dev` (line 1193-1200)
- Nav item in `topNavSections` (line 903-907)

## One Door Network Governance

**Allowed request path**:
```
UI (ChatDevPanel)
  ↓ CHAT_GENERATE IPC
  ↓ secureInvoke()
  ↓ Tauri invoke_handler
  ↓ Ring2 chat service
  ↓ Ollama HTTP (localhost:11434)
  ↓ QWEN-Coder model
```

**No inverse**: ✅
- No WebSocket from UI to external services
- No axios/fetch from TotalDevPage (except via CHAT_GENERATE, which is routed through services)

## IPC Contract Validation

**Sample call**:
```typescript
// UI
const result = await secureInvoke(TAURI_COMMANDS.TOTAL_DEV_UNLOCK, { token: "..." });

// Rust returns
{ ok: true, content: { unlocked: true, expiry: 7200 }, error: null }
// or
{ ok: false, content: null, error: "Invalid token" }
```

✅ Contract respected: `{ ok, content, error }`

## Threat Model Mitigation

| Threat | Mitigation |
|--------|-----------|
| Unlock bypass | SHA-256 Rust-only, no hint in frontend |
| Session hijack | AtomicU64 expiry, revoke via TOTAL_DEV_REVOKE |
| File exfiltration | 200KB limit, .env/.pem blocklist, workspace-scoped |
| Shell injection | Allowlist + argument validation (future: add proper escaping) |
| QWEN prompt injection | System prompt hardcoded, user input in role="user" (not system) |
| Capability escalation | Tauri enforces window scope (["main"]) |

## Verdict: ARCHITECTURE AUDIT

**Status**: ✅ **PASS**

All 4-Ring invariants preserved. One Door governance enforced. IPC contract satisfied. Security mitigation baseline met.

**Recommended follow-up**:
- [ ] Add shell argument escaping in Ring0 (future hardening)
- [ ] Monitor Ollama model stability in deployment
- [ ] Document TOTAL_DEV in admin/ops runbook
