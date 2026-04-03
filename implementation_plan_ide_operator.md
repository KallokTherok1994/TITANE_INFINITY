# Implementation Plan — LOCK 3: IDE_OPERATOR_V1

## [Overview]

Implement LOCK 3 — IDE_OPERATOR_V1: the first governed IDE/dev relay for TITANE∞, binding existing RUNTIME_PROVEN capabilities (governed_console, governed_git_ops, governed_file_read) to a unified IDE operator session with session_authority.

**Active Sub-Lock**: SESSION_BINDING — The underlying tools exist but are not unified as an "IDE operator" with session binding, scope truth, or honest classification.

**Actionability**: local_actionable — All prerequisites exist locally.

## [Types]

Single sentence: Define IDE operator types for session binding, relay results, scope classification, and command boundary.

```typescript
// src/services/operator/ideTypes.ts

type IDESessionStatus = 'IDLE' | 'INSPECTING' | 'EXECUTING' | 'BLOCKED' | 'STOPPED';

type IDERelayCategory =
  | 'repo_inventory'     // List repo structure
  | 'file_read'          // Read file content
  | 'grep_search'        // Search patterns
  | 'git_status'         // Git status
  | 'git_diff'           // Git diff
  | 'safe_command'       // Bounded command execution
  | 'patch_prepare'      // Prepare patch (read-only)
  | 'handoff_required'   // Sensitive boundary
  | 'forbidden_sensitive'// Action forbidden
  | 'tooling_missing';   // Required tool not available

type IDEScopeCategory =
  | 'repo_read'          // Read repo structure
  | 'file_read'          // Read file content
  | 'grep_search'        // Search patterns
  | 'git_read'           // Git status/diff/log
  | 'safe_command'       // Bounded shell execution
  | 'patch_prepare'      // Patch suggestion (no apply)
  | 'handoff_required'   // Sensitive boundary
  | 'forbidden';         // Never allowed

interface IDESession {
  session_id: string;
  authority_level: AuthorityLevel;
  workspace_dir: string;
  allowed_scopes: IDEScopeCategory[];
  current_action: string | null;
  status: IDESessionStatus;
  started_at: string;
  expires_at: string;
  actions_count: number;
  max_actions: number;
  handoff_pending: boolean;
}

interface IDERelayResult {
  ok: boolean;
  category: IDERelayCategory;
  scope_used: IDEScopeCategory;
  action: string;
  content: string | null;
  structured_data?: Record<string, unknown>;
  block_reason: string | null;
  handoff_required: boolean;
  actions_remaining: number;
  session_id: string;
  executed_at: string;
}

interface IDERelayRequest {
  action: 'repo_inventory' | 'file_read' | 'grep_search' | 'git_status' | 'git_diff' | 'safe_command';
  target?: string;        // file path, search pattern, command
  scope?: IDEScopeCategory;
}

interface IDECommandBoundary {
  action: string;
  boundary: 'READ_ONLY' | 'SAFE_BOUNDED_EXEC' | 'WRITE_PREP_ONLY' | 'HUMAN_APPROVAL_REQUIRED' | 'FORBIDDEN';
  requires_session: boolean;
  requires_unlocked: boolean;
}
```

## [Files]

Single sentence: Create IDE operator service, Rust IPC commands, and update capability registry classification.

**New files to create:**
- `src/services/operator/ideTypes.ts` — TypeScript types for IDE operator
- `src/services/operator/ideOperator.ts` — Frontend service for IDE relay
- `src-tauri/src/commands/ide_operator.rs` — Rust IPC commands (ide_open_session, ide_repo_inventory, ide_file_read, ide_grep_search, ide_git_status, ide_git_diff, ide_safe_command, ide_close_session, ide_get_config)
- `src/__tests__/services/operator/ideOperator.test.ts` — Tests for IDE operator

**Existing files to modify:**
- `src-tauri/src/main.rs` — Add ide_operator module declaration and command registrations
- `src/services/operator/types.ts` — Update ide_operator from ABSENT to CONFIGURED
- `src-tauri/src/commands/capability_commands.rs` — Update ide_operator classification

## [Functions]

Single sentence: Implement IDE session management, repo inspection, file reading, grep search, git status/diff, and bounded command execution via IPC.

**New functions (Rust - `src-tauri/src/commands/ide_operator.rs`):**
- `ide_open_session(workspace_dir: String, allowed_scopes: Vec<String>) -> Result<IDESession, String>` — Opens governed IDE session
- `ide_repo_inventory(session_id: String) -> Result<IDERelayResult, String>` — Lists repo structure
- `ide_file_read(session_id: String, path: String) -> Result<IDERelayResult, String>` — Reads file content (reuses total_dev_read_file logic)
- `ide_grep_search(session_id: String, pattern: String, path: Option<String>) -> Result<IDERelayResult, String>` — Searches patterns in files
- `ide_git_status(session_id: String) -> Result<IDERelayResult, String>` — Git status (reuses total_dev_git_op)
- `ide_git_diff(session_id: String, target: Option<String>) -> Result<IDERelayResult, String>` — Git diff (reuses total_dev_git_op)
- `ide_safe_command(session_id: String, command: String) -> Result<IDERelayResult, String>` — Bounded command execution (reuses total_dev_run_command logic)
- `ide_close_session(session_id: String) -> Result<bool, String>` — Closes IDE session
- `ide_get_session_status(session_id: String) -> Result<IDESession, String>` — Returns current session state
- `ide_get_config() -> Result<IDEOperatorConfig, String>` — Returns IDE operator configuration

**New functions (TypeScript - `src/services/operator/ideOperator.ts`):**
- `openIDESession(workspaceDir: string, allowedScopes?: string[]): Promise<IDESession>` — IPC call to open session
- `closeIDESession(sessionId: string): Promise<boolean>` — IPC call to close session
- `getIDESessionStatus(sessionId: string): Promise<IDESession>` — IPC call for status
- `ideRepoInventory(sessionId: string): Promise<IDERelayResult>` — List repo structure
- `ideFileRead(sessionId: string, path: string): Promise<IDERelayResult>` — Read file
- `ideGrepSearch(sessionId: string, pattern: string, path?: string): Promise<IDERelayResult>` — Search patterns
- `ideGitStatus(sessionId: string): Promise<IDERelayResult>` — Git status
- `ideGitDiff(sessionId: string, target?: string): Promise<IDERelayResult>` — Git diff
- `ideSafeCommand(sessionId: string, command: string): Promise<IDERelayResult>` — Bounded command
- `getIDEOperatorConfig(): Promise<IDEOperatorConfig>` — Config + tooling check

**Modified functions:**
- `src/services/operator/types.ts` — Update `ide_operator` from ABSENT to CONFIGURED with reason_code reflecting session binding and existing capabilities
- `src-tauri/src/commands/capability_commands.rs` — Update `ide_operator` status in `build_static_registry()` to CONFIGURED

## [Classes]

Single sentence: No new classes needed; IDE operator uses functional approach with stateless IPC commands and singleton session management.

The IDE operator uses a session map (HashMap<String, IDESession>) in Rust for session state management, following the same pattern as `browser_operator.rs`. No OOP classes are introduced.

## [Dependencies]

Single sentence: No new dependencies required; IDE operator reuses existing `total_dev_commands` functions and `git`/`grep`/`ls` system commands.

**Existing dependencies leveraged:**
- `total_dev_run_command` (already in total_dev_commands.rs) — Shell execution with allowlist
- `total_dev_git_op` (already in total_dev_commands.rs) — Git operations with allowlist
- `total_dev_read_file` (already in total_dev_commands.rs) — File reading with path traversal protection
- `total_dev_unlock/revoke/status` (already in total_dev_commands.rs) — Session authority
- System `git`, `grep`, `ls` commands — Already available on the system

**No new dependencies to add.**

## [Testing]

Single sentence: Create unit tests for IDE operator types and integration tests for IPC commands.

**Test file: `src/__tests__/services/operator/ideOperator.test.ts`**
- Test IDE session lifecycle (open → inspect → execute → close)
- Test scope enforcement (allowed scope succeeds, forbidden scope blocks)
- Test session binding to session_authority
- Test file_read reuses total_dev_read_file logic
- Test git_status reuses total_dev_git_op logic
- Test safe_command reuses total_dev_run_command logic
- Test handoff_required on sensitive boundaries
- Test block_reason classification is honest
- x3 for critical paths: scope enforcement, session binding, forbidden action blocking

## [Implementation Order]

Single sentence: Implement types first, then Rust IPC, then frontend service, then registry update, then tests.

1. **Create `src/services/operator/ideTypes.ts`** — Define all IDE operator types
2. **Create `src-tauri/src/commands/ide_operator.rs`** — Implement Rust IPC commands with session management, scope policy, reusing existing total_dev_commands functions
3. **Update `src-tauri/src/main.rs`** — Add module declaration and command registrations
4. **Create `src/services/operator/ideOperator.ts`** — Frontend service for IPC calls
5. **Update `src/services/operator/types.ts`** — Update ide_operator from ABSENT to CONFIGURED
6. **Update `src-tauri/src/commands/capability_commands.rs`** — Update Rust registry classification
7. **Create `src/__tests__/services/operator/ideOperator.test.ts`** — Tests for IDE operator
8. **Run tests** — Validate all tests pass
9. **Create proof pack** — Generate proof pack with all required files