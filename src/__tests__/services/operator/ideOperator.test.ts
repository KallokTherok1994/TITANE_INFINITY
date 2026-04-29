// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — IDE OPERATOR TESTS
//   LOCK 6: IDE_OPERATOR_V1 — tests for governed IDE relay service
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import type { IDESession, IDERelayResult, IDEOperatorConfig } from '../../../services/operator/ideTypes';

// ─────────────────────────────────────────────────────────────────
// MOCK SETUP — One Door canonical IPC
// ─────────────────────────────────────────────────────────────────

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import {
  openIDESession,
  closeIDESession,
  getIDESessionStatus,
  ideRepoInventory,
  ideFileRead,
  ideGrepSearch,
  ideGitStatus,
  ideGitDiff,
  ideSafeCommand,
  getIDEOperatorConfig,
  isIDEOperatorAvailable,
} from '../../../services/operator/ideOperator';

const mockSafeInvoke = safeInvokeCanonical as MockedFunction<typeof safeInvokeCanonical>;

// Helper: canonical { ok, content, error } response
function ok<T>(value: T) {
  return { ok: true as const, content: value, error: null };
}
function fail(msg: string) {
  return { ok: false as const, content: null, error: { message: msg } };
}

const SESSION_MOCK: IDESession = {
  session_id: 'sess-ide-001',
  authority_level: 'USER',
  workspace_dir: '/workspace/titane',
  allowed_scopes: ['repo_read', 'file_read', 'grep_search', 'git_read', 'safe_command'],
  current_action: null,
  status: 'IDLE',
  started_at: '2026-04-29T10:00:00Z',
  expires_at: '2026-04-29T11:00:00Z',
  actions_count: 0,
  max_actions: 100,
  handoff_pending: false,
};

const RELAY_RESULT_MOCK: IDERelayResult = {
  ok: true,
  category: 'repo_inventory',
  scope_used: 'repo_read',
  action: 'repo_inventory',
  content: 'src/\nsrc-tauri/\ntests/',
  block_reason: null,
  handoff_required: false,
  actions_remaining: 99,
  session_id: 'sess-ide-001',
  executed_at: '2026-04-29T10:00:01Z',
};

const CONFIG_MOCK: IDEOperatorConfig = {
  max_actions_per_session: 100,
  session_timeout_secs: 3600,
  allowed_safe_commands: ['ls', 'cat', 'echo', 'pwd', 'find', 'rg'],
  allowed_scopes: ['repo_read', 'file_read', 'grep_search', 'git_read', 'safe_command'],
  forbidden_patterns: ['rm -rf', 'git commit', 'git push', 'sudo'],
  require_session_authority: true,
  handoff_on_sensitive: true,
};

beforeEach(() => {
  mockSafeInvoke.mockReset();
});

// ─────────────────────────────────────────────────────────────────
// SESSION LIFECYCLE
// ─────────────────────────────────────────────────────────────────

describe('IDE Operator — Session Lifecycle', () => {
  it('openIDESession: calls ide_open_session with workspace_dir + allowed_scopes', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(SESSION_MOCK));
    const session = await openIDESession('/workspace/titane');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_open_session', {
      workspace_dir: '/workspace/titane',
      allowed_scopes: [],
    });
    expect(session.session_id).toBe('sess-ide-001');
    expect(session.status).toBe('IDLE');
  });

  it('openIDESession: passes custom allowed_scopes when provided', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(SESSION_MOCK));
    await openIDESession('/workspace/titane', ['repo_read', 'file_read']);
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_open_session', {
      workspace_dir: '/workspace/titane',
      allowed_scopes: ['repo_read', 'file_read'],
    });
  });

  it('openIDESession: throws on IPC failure', async () => {
    mockSafeInvoke.mockResolvedValueOnce(fail('session_open_failed'));
    await expect(openIDESession('/workspace')).rejects.toThrow('session_open_failed');
  });

  it('closeIDESession: calls ide_close_session with session_id', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(true));
    const result = await closeIDESession('sess-ide-001');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_close_session', { session_id: 'sess-ide-001' });
    expect(result).toBe(true);
  });

  it('getIDESessionStatus: returns current session state', async () => {
    const inspecting = { ...SESSION_MOCK, status: 'INSPECTING' as const, actions_count: 5 };
    mockSafeInvoke.mockResolvedValueOnce(ok(inspecting));
    const session = await getIDESessionStatus('sess-ide-001');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_get_session_status', { session_id: 'sess-ide-001' });
    expect(session.status).toBe('INSPECTING');
    expect(session.actions_count).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────
// PERCEPTION STACK — READ-ONLY
// ─────────────────────────────────────────────────────────────────

describe('IDE Operator — Perception Stack (read-only)', () => {
  it('ideRepoInventory: calls ide_repo_inventory with session_id', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(RELAY_RESULT_MOCK));
    const result = await ideRepoInventory('sess-ide-001');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_repo_inventory', { session_id: 'sess-ide-001' });
    expect(result.ok).toBe(true);
    expect(result.category).toBe('repo_inventory');
    expect(result.scope_used).toBe('repo_read');
  });

  it('ideFileRead: calls ide_file_read with session_id + path', async () => {
    const fileResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      category: 'file_read',
      scope_used: 'file_read',
      action: 'file_read',
      content: 'const x = 1;',
    };
    mockSafeInvoke.mockResolvedValueOnce(ok(fileResult));
    const result = await ideFileRead('sess-ide-001', 'src/index.ts');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_file_read', {
      session_id: 'sess-ide-001',
      path: 'src/index.ts',
    });
    expect(result.category).toBe('file_read');
    expect(result.content).toBe('const x = 1;');
  });

  it('ideGrepSearch: calls ide_grep_search with session_id + pattern + path', async () => {
    const grepResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      category: 'grep_search',
      scope_used: 'grep_search',
      action: 'grep_search',
      content: 'src/main.ts:10: export default function',
    };
    mockSafeInvoke.mockResolvedValueOnce(ok(grepResult));
    const result = await ideGrepSearch('sess-ide-001', 'export default', 'src/');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_grep_search', {
      session_id: 'sess-ide-001',
      pattern: 'export default',
      path: 'src/',
    });
    expect(result.category).toBe('grep_search');
  });

  it('ideGrepSearch: sends null path when not provided', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, category: 'grep_search' }));
    await ideGrepSearch('sess-ide-001', 'safeInvokeCanonical');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_grep_search', {
      session_id: 'sess-ide-001',
      pattern: 'safeInvokeCanonical',
      path: null,
    });
  });

  it('ideGitStatus: calls ide_git_status with session_id', async () => {
    const gitResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      category: 'git_status',
      scope_used: 'git_read',
      action: 'git_status',
      content: 'M src/main.ts\n?? src/new.ts',
    };
    mockSafeInvoke.mockResolvedValueOnce(ok(gitResult));
    const result = await ideGitStatus('sess-ide-001');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_git_status', { session_id: 'sess-ide-001' });
    expect(result.scope_used).toBe('git_read');
  });

  it('ideGitDiff: calls ide_git_diff with session_id and target', async () => {
    const diffResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      category: 'git_diff',
      scope_used: 'git_read',
      action: 'git_diff',
      content: '+++ b/src/main.ts\n+const x = 2;',
    };
    mockSafeInvoke.mockResolvedValueOnce(ok(diffResult));
    const result = await ideGitDiff('sess-ide-001', 'src/main.ts');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_git_diff', {
      session_id: 'sess-ide-001',
      target: 'src/main.ts',
    });
    expect(result.category).toBe('git_diff');
  });

  it('ideGitDiff: sends null target when not provided', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, category: 'git_diff' }));
    await ideGitDiff('sess-ide-001');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_git_diff', {
      session_id: 'sess-ide-001',
      target: null,
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// EXECUTION STACK — BOUNDED COMMAND
// ─────────────────────────────────────────────────────────────────

describe('IDE Operator — Bounded Execution', () => {
  it('ideSafeCommand: calls ide_safe_command with session_id + command', async () => {
    const cmdResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      category: 'safe_command',
      scope_used: 'safe_command',
      action: 'safe_command',
      content: 'src/\nsrc-tauri/',
    };
    mockSafeInvoke.mockResolvedValueOnce(ok(cmdResult));
    const result = await ideSafeCommand('sess-ide-001', 'ls');
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_safe_command', {
      session_id: 'sess-ide-001',
      command: 'ls',
    });
    expect(result.scope_used).toBe('safe_command');
  });

  it('ideSafeCommand: throws on forbidden command (server returns error)', async () => {
    mockSafeInvoke.mockResolvedValueOnce(fail('forbidden_command: git commit'));
    await expect(ideSafeCommand('sess-ide-001', 'git commit')).rejects.toThrow(
      'forbidden_command: git commit'
    );
  });

  it('ideSafeCommand: block_reason is set when action is blocked', async () => {
    const blockedResult: IDERelayResult = {
      ...RELAY_RESULT_MOCK,
      ok: false,
      category: 'forbidden_sensitive',
      scope_used: 'forbidden',
      action: 'safe_command',
      content: null,
      block_reason: 'command_not_in_allowlist: rm -rf',
      handoff_required: true,
    };
    // Server returns ok: true but relay says ok: false (blocked relay)
    mockSafeInvoke.mockResolvedValueOnce(ok(blockedResult));
    const result = await ideSafeCommand('sess-ide-001', 'rm -rf /tmp');
    expect(result.ok).toBe(false);
    expect(result.block_reason).toBe('command_not_in_allowlist: rm -rf');
    expect(result.handoff_required).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────
// CONFIG & AVAILABILITY
// ─────────────────────────────────────────────────────────────────

describe('IDE Operator — Config & Availability', () => {
  it('getIDEOperatorConfig: calls ide_get_config and returns config', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(CONFIG_MOCK));
    const config = await getIDEOperatorConfig();
    expect(mockSafeInvoke).toHaveBeenCalledWith('ide_get_config');
    expect(config.max_actions_per_session).toBe(100);
    expect(config.require_session_authority).toBe(true);
    expect(config.forbidden_patterns).toContain('rm -rf');
  });

  it('isIDEOperatorAvailable: returns true when config call succeeds', async () => {
    mockSafeInvoke.mockResolvedValueOnce(ok(CONFIG_MOCK));
    const available = await isIDEOperatorAvailable();
    expect(available).toBe(true);
  });

  it('isIDEOperatorAvailable: returns false when config call fails', async () => {
    mockSafeInvoke.mockResolvedValueOnce(fail('ide_not_available'));
    const available = await isIDEOperatorAvailable();
    expect(available).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────
// X3 CRITICAL PATHS — Scope enforcement, session binding, forbidden blocking
// ─────────────────────────────────────────────────────────────────

describe('IDE Operator — X3 Critical Paths', () => {
  describe('[x3] Scope enforcement', () => {
    it('[x3-1] scope_used matches expected for repo_inventory', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, scope_used: 'repo_read' }));
      const r = await ideRepoInventory('s1');
      expect(r.scope_used).toBe('repo_read');
    });
    it('[x3-2] scope_used matches expected for file_read', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, category: 'file_read', scope_used: 'file_read' }));
      const r = await ideFileRead('s1', 'src/a.ts');
      expect(r.scope_used).toBe('file_read');
    });
    it('[x3-3] scope_used matches expected for safe_command', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, category: 'safe_command', scope_used: 'safe_command' }));
      const r = await ideSafeCommand('s1', 'ls');
      expect(r.scope_used).toBe('safe_command');
    });
  });

  describe('[x3] Session binding', () => {
    it('[x3-1] session_id is preserved in relay result', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, session_id: 'sess-bind-001' }));
      const r = await ideRepoInventory('sess-bind-001');
      expect(r.session_id).toBe('sess-bind-001');
    });
    it('[x3-2] session_id is passed to all relay commands', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({ ...RELAY_RESULT_MOCK, session_id: 'sess-bind-002' }));
      await ideGitStatus('sess-bind-002');
      expect(mockSafeInvoke).toHaveBeenCalledWith('ide_git_status', { session_id: 'sess-bind-002' });
    });
    it('[x3-3] wrong session_id causes IPC failure (server enforces)', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('session_not_found'));
      await expect(ideGitStatus('invalid-session')).rejects.toThrow('session_not_found');
    });
  });

  describe('[x3] Forbidden action blocking', () => {
    it('[x3-1] forbidden command returns error from IPC layer', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('forbidden_command: sudo'));
      await expect(ideSafeCommand('s1', 'sudo rm -rf /')).rejects.toThrow('forbidden_command: sudo');
    });
    it('[x3-2] blocked relay result has block_reason set', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({
        ...RELAY_RESULT_MOCK, ok: false, category: 'forbidden_sensitive', scope_used: 'forbidden',
        block_reason: 'forbidden_pattern_detected', handoff_required: true, content: null,
      }));
      const r = await ideSafeCommand('s1', 'git push');
      expect(r.ok).toBe(false);
      expect(r.block_reason).toBe('forbidden_pattern_detected');
    });
    it('[x3-3] handoff_required is true when sensitive boundary is hit', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok({
        ...RELAY_RESULT_MOCK, ok: false, category: 'handoff_required', scope_used: 'handoff_required',
        block_reason: 'sensitive_boundary', handoff_required: true, content: null,
      }));
      const r = await ideSafeCommand('s1', 'git commit -am "test"');
      expect(r.handoff_required).toBe(true);
    });
  });
});
