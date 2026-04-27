/**
 * TITANE∞ — RemoteKeyAgent unit tests
 *
 * Rule 16: every new service ships with unit tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoteKeyAgent } from '@/services/remoteKeyManager/RemoteKeyAgent';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/services/remoteKeyManager/index', () => ({
  remoteKeyCreate: vi.fn(),
  remoteKeyList: vi.fn(),
  remoteKeyRevoke: vi.fn(),
  remoteKeyRotate: vi.fn(),
}));

import {
  remoteKeyCreate,
  remoteKeyList,
  remoteKeyRevoke,
  remoteKeyRotate,
} from '@/services/remoteKeyManager/index';

const mockCreate = vi.mocked(remoteKeyCreate);
const mockList = vi.mocked(remoteKeyList);
const mockRevoke = vi.mocked(remoteKeyRevoke);
const mockRotate = vi.mocked(remoteKeyRotate);

const MOCK_ENTRY = {
  key_id: 'tk_abc123',
  label: 'TITANE-Default',
  scopes: ['Admin', 'Chat', 'Memory', 'System'],
  created_at: 1714220000,
  last_used: null,
  enabled: true,
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('RemoteKeyAgent', () => {
  let agent: RemoteKeyAgent;

  beforeEach(() => {
    agent = new RemoteKeyAgent();
    vi.resetAllMocks();
  });

  describe('init()', () => {
    it('auto-creates a default key when no keys exist', async () => {
      mockList.mockResolvedValueOnce({ ok: true, keys: [] });
      mockCreate.mockResolvedValueOnce({
        ok: true,
        key_id: 'tk_new',
        secret_once: 'secret-abc',
      });
      mockList.mockResolvedValueOnce({ ok: true, keys: [MOCK_ENTRY] });

      const events: string[] = [];
      agent.onEvent(e => events.push(e.type));
      await agent.init();

      expect(mockCreate).toHaveBeenCalledWith('TITANE-Default', [
        'Admin',
        'Chat',
        'Memory',
        'System',
      ]);
      expect(events).toContain('onCreate');
      expect(events).toContain('onReady');
    });

    it('loads existing keys without auto-creating', async () => {
      mockList.mockResolvedValueOnce({ ok: true, keys: [MOCK_ENTRY] });

      await agent.init();

      expect(mockCreate).not.toHaveBeenCalled();
      expect(agent.state.status).toBe('ready');
      expect(agent.state.keys).toHaveLength(1);
    });

    it('transitions to error on list failure', async () => {
      mockList.mockResolvedValueOnce({ ok: false, error: 'IPC error' });

      const errors: string[] = [];
      agent.onEvent(e => {
        if (e.type === 'onError') errors.push(e.message);
      });
      await agent.init();

      expect(agent.state.status).toBe('error');
      expect(agent.state.error).toBe('IPC error');
    });

    it('is idempotent — second init call is a no-op', async () => {
      mockList.mockResolvedValue({ ok: true, keys: [MOCK_ENTRY] });

      await agent.init();
      await agent.init();

      expect(mockList).toHaveBeenCalledTimes(1);
    });
  });

  describe('createKey()', () => {
    it('returns the secret_once and refreshes list', async () => {
      mockCreate.mockResolvedValueOnce({
        ok: true,
        key_id: 'tk_xyz',
        secret_once: 'my-secret-plain',
      });
      mockList.mockResolvedValueOnce({ ok: true, keys: [MOCK_ENTRY] });

      const secret = await agent.createKey('CI/CD', ['Chat']);

      expect(secret).toBe('my-secret-plain');
      expect(agent.state.lastSecretOnce).toBe('my-secret-plain');
      expect(agent.state.lastKeyIdOnce).toBe('tk_xyz');
    });

    it('returns null and sets error on failure', async () => {
      mockCreate.mockResolvedValueOnce({ ok: false, error: 'label too long' });

      const secret = await agent.createKey('x'.repeat(200));
      expect(secret).toBeNull();
      expect(agent.state.status).toBe('error');
    });
  });

  describe('revokeKey()', () => {
    it('emits onRevoke and refreshes list', async () => {
      mockRevoke.mockResolvedValueOnce({ ok: true });
      mockList.mockResolvedValueOnce({ ok: true, keys: [] });

      const events: string[] = [];
      agent.onEvent(e => events.push(e.type));
      const ok = await agent.revokeKey('tk_abc123');

      expect(ok).toBe(true);
      expect(events).toContain('onRevoke');
      expect(agent.state.keys).toHaveLength(0);
    });

    it('returns false on revoke failure', async () => {
      mockRevoke.mockResolvedValueOnce({ ok: false, error: 'not found' });

      const ok = await agent.revokeKey('tk_missing');
      expect(ok).toBe(false);
    });
  });

  describe('rotateKey()', () => {
    it('returns new secret and emits onRotate', async () => {
      mockRotate.mockResolvedValueOnce({
        ok: true,
        new_key_id: 'tk_rotated',
        new_secret_once: 'new-secret-abc',
      });
      mockList.mockResolvedValueOnce({ ok: true, keys: [MOCK_ENTRY] });

      const events: ReturnType<
        typeof agent.onEvent extends (l: infer L) => void ? never : never
      >[] = [];
      const receivedEvents: string[] = [];
      agent.onEvent(e => receivedEvents.push(e.type));

      const secret = await agent.rotateKey('tk_abc123');
      expect(secret).toBe('new-secret-abc');
      expect(receivedEvents).toContain('onRotate');
      expect(agent.state.lastSecretOnce).toBe('new-secret-abc');
      expect(agent.state.lastKeyIdOnce).toBe('tk_rotated');
    });
  });

  describe('clearSecret()', () => {
    it('clears lastSecretOnce and lastKeyIdOnce from state', async () => {
      mockCreate.mockResolvedValueOnce({
        ok: true,
        key_id: 'tk_s',
        secret_once: 'secret',
      });
      mockList.mockResolvedValueOnce({ ok: true, keys: [] });
      await agent.createKey('Test');

      agent.clearSecret();
      expect(agent.state.lastSecretOnce).toBeNull();
      expect(agent.state.lastKeyIdOnce).toBeNull();
    });
  });

  describe('onStateChange()', () => {
    it('immediately delivers current state to new subscriber', () => {
      const received: string[] = [];
      agent.onStateChange(s => received.push(s.status));
      expect(received).toHaveLength(1);
      expect(received[0]).toBe('idle');
    });

    it('returns an unsubscribe function', async () => {
      const received: string[] = [];
      const unsub = agent.onStateChange(s => received.push(s.status));
      unsub();
      mockList.mockResolvedValueOnce({ ok: true, keys: [MOCK_ENTRY] });
      await agent.init();
      // Only the initial delivery — no further calls
      expect(received).toHaveLength(1);
    });
  });
});
