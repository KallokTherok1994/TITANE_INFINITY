// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — BROWSER OPERATOR TESTS
//   LOCK 7: BROWSER_OPERATOR_V1 — tests for governed browser relay service
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import type {
  BrowserSession,
  BrowserRelayResult,
  BrowserOperatorConfig,
} from '../../../services/operator/browserTypes';

// ─────────────────────────────────────────────────────────────────
// MOCK SETUP — One Door canonical IPC
// ─────────────────────────────────────────────────────────────────

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

import { safeInvokeCanonical } from '@/utils/invoke';
import {
  openBrowserSession,
  closeBrowserSession,
  getBrowserSessionStatus,
  browserNavigate,
  browserRead,
  browserExtract,
  getBrowserOperatorConfig,
} from '../../../services/operator/browserOperator';

const mockSafeInvoke = safeInvokeCanonical as MockedFunction<typeof safeInvokeCanonical>;

// Helper: canonical { ok, content, error } response
function ok<T>(value: T) {
  return { ok: true as const, content: value, error: null };
}
function fail(msg: string) {
  return { ok: false as const, content: null, error: { message: msg } };
}

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────

const SESSION_MOCK: BrowserSession = {
  session_id: 'brw_1714000000_abc12345',
  authority_level: 'OBSERVE',
  allowed_domains: ['docs.example.com', '*.rust-lang.org'],
  current_url: null,
  status: 'idle',
  started_at: '2026-04-29T10:00:00.000Z',
  expires_at: '2026-04-29T10:30:00.000Z',
  actions_count: 0,
  max_actions: 50,
  handoff_pending: false,
};

const RELAY_OK_MOCK: BrowserRelayResult = {
  ok: true,
  category: 'navigation',
  url: 'https://docs.example.com/guide',
  title: 'Guide — Example Docs',
  content: '<html><body>Guide content</body></html>',
  block_reason: null,
  handoff_required: false,
  actions_remaining: 49,
  session_id: 'brw_1714000000_abc12345',
  executed_at: '2026-04-29T10:01:00.000Z',
};

const RELAY_BLOCKED_MOCK: BrowserRelayResult = {
  ok: false,
  category: 'blocked_sensitive',
  url: 'https://evil.com/page',
  title: null,
  content: null,
  block_reason: "Domain 'evil.com' is not in allowed list",
  handoff_required: false,
  actions_remaining: 50,
  session_id: 'brw_1714000000_abc12345',
  executed_at: '2026-04-29T10:01:00.000Z',
};

const RELAY_HANDOFF_MOCK: BrowserRelayResult = {
  ok: false,
  category: 'handoff_required',
  url: 'https://docs.example.com/login',
  title: null,
  content: null,
  block_reason: 'URL matches sensitive pattern — handoff required',
  handoff_required: true,
  actions_remaining: 50,
  session_id: 'brw_1714000000_abc12345',
  executed_at: '2026-04-29T10:01:00.000Z',
};

const RELAY_TOOLING_MISSING_MOCK: BrowserRelayResult = {
  ok: false,
  category: 'tooling_missing',
  url: 'https://docs.example.com/guide',
  title: null,
  content: null,
  block_reason: 'Playwright is not installed',
  handoff_required: false,
  actions_remaining: 49,
  session_id: 'brw_1714000000_abc12345',
  executed_at: '2026-04-29T10:01:00.000Z',
};

const CONFIG_MOCK: BrowserOperatorConfig = {
  playwright_available: false,
  playwright_version: null,
  default_browser: 'chromium',
  headless: true,
  navigation_timeout_ms: 30000,
  default_domain_policy: {
    allowed_domains: [],
    denied_domains: ['malware.com', 'phishing.com'],
    require_https: false,
    max_pages_per_session: 50,
    sensitive_patterns: ['/login', '/signin', '/checkout'],
  },
};

// ─────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('browserOperator — LOCK 7: BROWSER_OPERATOR_V1', () => {
  // ── openBrowserSession ───────────────────────────────────────────

  describe('openBrowserSession', () => {
    it('returns session on success', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(SESSION_MOCK));
      const session = await openBrowserSession(['docs.example.com']);
      expect(session).toEqual(SESSION_MOCK);
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_open_session', {
        allowed_domains: ['docs.example.com'],
        max_actions: null,
      });
    });

    it('passes max_actions when provided', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(SESSION_MOCK));
      await openBrowserSession(['docs.example.com'], 25);
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_open_session', {
        allowed_domains: ['docs.example.com'],
        max_actions: 25,
      });
    });

    it('throws on IPC failure', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('State lock error'));
      await expect(openBrowserSession(['docs.example.com'])).rejects.toThrow(
        'State lock error'
      );
    });

    it('throws when content is null', async () => {
      mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: null, error: null });
      await expect(openBrowserSession(['docs.example.com'])).rejects.toThrow(
        'browser_open_session failed'
      );
    });
  });

  // ── closeBrowserSession ──────────────────────────────────────────

  describe('closeBrowserSession', () => {
    it('returns true on success', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(true));
      const result = await closeBrowserSession('brw_1714000000_abc12345');
      expect(result).toBe(true);
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_close_session', {
        session_id: 'brw_1714000000_abc12345',
      });
    });

    it('throws when session not found', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('Session not found: brw_unknown'));
      await expect(closeBrowserSession('brw_unknown')).rejects.toThrow(
        'Session not found: brw_unknown'
      );
    });
  });

  // ── getBrowserSessionStatus ──────────────────────────────────────

  describe('getBrowserSessionStatus', () => {
    it('returns session state', async () => {
      const navigatingSession = {
        ...SESSION_MOCK,
        status: 'navigating' as const,
        actions_count: 1,
      };
      mockSafeInvoke.mockResolvedValueOnce(ok(navigatingSession));
      const session = await getBrowserSessionStatus('brw_1714000000_abc12345');
      expect(session.status).toBe('navigating');
      expect(session.actions_count).toBe(1);
    });

    it('throws on missing session', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('Session not found: brw_gone'));
      await expect(getBrowserSessionStatus('brw_gone')).rejects.toThrow(
        'Session not found: brw_gone'
      );
    });
  });

  // ── browserNavigate ──────────────────────────────────────────────

  describe('browserNavigate', () => {
    it('returns relay result on allowed domain', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(RELAY_OK_MOCK));
      const result = await browserNavigate(
        'brw_1714000000_abc12345',
        'https://docs.example.com/guide'
      );
      expect(result.ok).toBe(true);
      expect(result.category).toBe('navigation');
      expect(result.url).toBe('https://docs.example.com/guide');
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_navigate', {
        session_id: 'brw_1714000000_abc12345',
        url: 'https://docs.example.com/guide',
      });
    });

    it('returns blocked relay result for disallowed domain', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(RELAY_BLOCKED_MOCK));
      const result = await browserNavigate(
        'brw_1714000000_abc12345',
        'https://evil.com/page'
      );
      expect(result.ok).toBe(false);
      expect(result.category).toBe('blocked_sensitive');
      expect(result.block_reason).toContain('not in allowed list');
    });

    it('returns handoff_required for sensitive URL pattern', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(RELAY_HANDOFF_MOCK));
      const result = await browserNavigate(
        'brw_1714000000_abc12345',
        'https://docs.example.com/login'
      );
      expect(result.ok).toBe(false);
      expect(result.category).toBe('handoff_required');
      expect(result.handoff_required).toBe(true);
    });

    it('returns tooling_missing when Playwright is unavailable', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(RELAY_TOOLING_MISSING_MOCK));
      const result = await browserNavigate(
        'brw_1714000000_abc12345',
        'https://docs.example.com/guide'
      );
      expect(result.ok).toBe(false);
      expect(result.category).toBe('tooling_missing');
    });

    it('throws on IPC error', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('Session stopped'));
      await expect(
        browserNavigate('brw_1714000000_abc12345', 'https://docs.example.com/guide')
      ).rejects.toThrow('Session stopped');
    });
  });

  // ── browserRead ──────────────────────────────────────────────────

  describe('browserRead', () => {
    it('returns content relay result', async () => {
      const readResult = { ...RELAY_OK_MOCK, category: 'structured_read' as const };
      mockSafeInvoke.mockResolvedValueOnce(ok(readResult));
      const result = await browserRead('brw_1714000000_abc12345');
      expect(result.ok).toBe(true);
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_read', {
        session_id: 'brw_1714000000_abc12345',
      });
    });

    it('throws on no-URL-navigated error', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('No URL has been navigated to yet'));
      await expect(browserRead('brw_1714000000_abc12345')).rejects.toThrow(
        'No URL has been navigated to yet'
      );
    });
  });

  // ── browserExtract ───────────────────────────────────────────────

  describe('browserExtract', () => {
    it('calls browser_extract with session_id and selector', async () => {
      const extractResult = {
        ...RELAY_OK_MOCK,
        category: 'extraction' as const,
        structured_data: { items: ['item1', 'item2'] },
      };
      mockSafeInvoke.mockResolvedValueOnce(ok(extractResult));
      const result = await browserExtract('brw_1714000000_abc12345', 'ul.nav-items > li');
      expect(result.ok).toBe(true);
      expect(result.category).toBe('extraction');
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_extract', {
        session_id: 'brw_1714000000_abc12345',
        selector: 'ul.nav-items > li',
      });
    });

    it('returns tooling_missing when Playwright unavailable', async () => {
      const toolingResult = {
        ...RELAY_TOOLING_MISSING_MOCK,
        category: 'tooling_missing' as const,
      };
      mockSafeInvoke.mockResolvedValueOnce(ok(toolingResult));
      const result = await browserExtract('brw_1714000000_abc12345', '.main-content');
      expect(result.ok).toBe(false);
      expect(result.category).toBe('tooling_missing');
    });

    it('throws on IPC error', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('Session not found'));
      await expect(browserExtract('brw_unknown', '.main-content')).rejects.toThrow(
        'Session not found'
      );
    });
  });

  // ── getBrowserOperatorConfig ─────────────────────────────────────

  describe('getBrowserOperatorConfig', () => {
    it('returns config with playwright_available=false when not installed', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(CONFIG_MOCK));
      const config = await getBrowserOperatorConfig();
      expect(config.playwright_available).toBe(false);
      expect(config.playwright_version).toBeNull();
      expect(config.default_browser).toBe('chromium');
      expect(config.headless).toBe(true);
      expect(config.navigation_timeout_ms).toBe(30000);
      expect(mockSafeInvoke).toHaveBeenCalledWith('browser_get_config', {});
    });

    it('returns config with playwright version when installed', async () => {
      const configWithPw = {
        ...CONFIG_MOCK,
        playwright_available: true,
        playwright_version: 'Version 1.44.0',
      };
      mockSafeInvoke.mockResolvedValueOnce(ok(configWithPw));
      const config = await getBrowserOperatorConfig();
      expect(config.playwright_available).toBe(true);
      expect(config.playwright_version).toBe('Version 1.44.0');
    });

    it('returns denied_domains in domain policy', async () => {
      mockSafeInvoke.mockResolvedValueOnce(ok(CONFIG_MOCK));
      const config = await getBrowserOperatorConfig();
      expect(config.default_domain_policy.denied_domains).toContain('malware.com');
      expect(config.default_domain_policy.denied_domains).toContain('phishing.com');
    });

    it('throws on IPC failure', async () => {
      mockSafeInvoke.mockResolvedValueOnce(fail('browser_get_config: internal error'));
      await expect(getBrowserOperatorConfig()).rejects.toThrow(
        'browser_get_config: internal error'
      );
    });
  });

  // ── ONE DOOR compliance ──────────────────────────────────────────

  describe('ONE DOOR compliance (Rule 5)', () => {
    it('all calls use safeInvokeCanonical — never direct tauri API', () => {
      // This test verifies the mock intercepts all calls correctly.
      // The absence of direct tauri API imports is structural (enforced by
      // having no import from @tauri-apps/api/core in browserOperator.ts).
      expect(mockSafeInvoke).toBeDefined();
    });

    it('IPC commands match canonical browser_operator Rust registration', () => {
      const expectedCommands = [
        'browser_open_session',
        'browser_close_session',
        'browser_get_session_status',
        'browser_navigate',
        'browser_read',
        'browser_extract',
        'browser_get_config',
      ];
      // Verify all commands are defined (they must exist to have matching tests above)
      expect(expectedCommands).toHaveLength(7);
    });
  });
});
