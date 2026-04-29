// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — IDE OPERATOR TYPES
//   LOCK 6: IDE_OPERATOR_V1 — governed IDE/dev relay for repo inspection
//
//   HONESTY CONTRACT:
//   - IDE operator is a governed relay, not a free coding agent
//   - Scope truth is mandatory (repo_read, file_read, git_read, safe_command)
//   - Session binding to session_authority via total_dev commands
//   - Forbidden actions remain forbidden (no auto-commit, no prod build)
//   - Classification reflects real capability, not aspiration
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// STATUS ENUMS
// ─────────────────────────────────────────────────────────────────

export type IDESessionStatus =
  | 'IDLE'
  | 'INSPECTING'
  | 'EXECUTING'
  | 'BLOCKED'
  | 'STOPPED';

export type IDERelayCategory =
  | 'repo_inventory'
  | 'file_read'
  | 'grep_search'
  | 'git_status'
  | 'git_diff'
  | 'safe_command'
  | 'patch_prepare'
  | 'handoff_required'
  | 'forbidden_sensitive'
  | 'tooling_missing';

export type IDEScopeCategory =
  | 'repo_read'
  | 'file_read'
  | 'grep_search'
  | 'git_read'
  | 'safe_command'
  | 'patch_prepare'
  | 'handoff_required'
  | 'forbidden';

// ─────────────────────────────────────────────────────────────────
// SESSION & RELAY TYPES
// ─────────────────────────────────────────────────────────────────

export interface IDESession {
  session_id: string;
  authority_level: string;
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

export interface IDERelayResult {
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

export interface IDERelayRequest {
  action:
    | 'repo_inventory'
    | 'file_read'
    | 'grep_search'
    | 'git_status'
    | 'git_diff'
    | 'safe_command';
  target?: string;
  scope?: IDEScopeCategory;
}

export interface IDECommandBoundary {
  action: string;
  boundary:
    | 'READ_ONLY'
    | 'SAFE_BOUNDED_EXEC'
    | 'WRITE_PREP_ONLY'
    | 'HUMAN_APPROVAL_REQUIRED'
    | 'FORBIDDEN';
  requires_session: boolean;
  requires_unlocked: boolean;
}

export interface IDEOperatorConfig {
  max_actions_per_session: number;
  session_timeout_secs: number;
  allowed_safe_commands: string[];
  allowed_scopes: IDEScopeCategory[];
  forbidden_patterns: string[];
  require_session_authority: boolean;
  handoff_on_sensitive: boolean;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const IDE_FORBIDDEN_ACTIONS: string[] = [
  'git commit',
  'git push',
  'git reset --hard',
  'git clean',
  'rm -rf',
  'pnpm run tauri build',
  'cargo build --release',
  'sudo',
  'chmod',
  'chown',
  'dd',
  'mkfs',
];

export const IDE_DEFAULT_ALLOWED_SCOPES: IDEScopeCategory[] = [
  'repo_read',
  'file_read',
  'grep_search',
  'git_read',
  'safe_command',
];

export const IDE_COMMAND_BOUNDARIES: IDECommandBoundary[] = [
  { action: 'repo_inventory', boundary: 'READ_ONLY', requires_session: true, requires_unlocked: false },
  { action: 'file_read', boundary: 'READ_ONLY', requires_session: true, requires_unlocked: false },
  { action: 'grep_search', boundary: 'READ_ONLY', requires_session: true, requires_unlocked: false },
  { action: 'git_status', boundary: 'READ_ONLY', requires_session: true, requires_unlocked: false },
  { action: 'git_diff', boundary: 'READ_ONLY', requires_session: true, requires_unlocked: false },
  { action: 'safe_command', boundary: 'SAFE_BOUNDED_EXEC', requires_session: true, requires_unlocked: true },
  { action: 'patch_prepare', boundary: 'WRITE_PREP_ONLY', requires_session: true, requires_unlocked: true },
  { action: 'git_commit', boundary: 'HUMAN_APPROVAL_REQUIRED', requires_session: true, requires_unlocked: true },
  { action: 'git_push', boundary: 'FORBIDDEN', requires_session: false, requires_unlocked: false },
  { action: 'rm_rf', boundary: 'FORBIDDEN', requires_session: false, requires_unlocked: false },
];
