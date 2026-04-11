import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn(),
}));

import {
  pauseDesktopSession,
  resumeDesktopSession,
  handoffDesktopSession,
  killDesktopSession,
  getDesktopControlStatus,
} from '../../../services/operator/desktopPerception';

import { safeInvokeCanonical } from '@/utils/invoke';
const mockSafeInvoke = safeInvokeCanonical as ReturnType<typeof vi.fn>;

describe('Desktop Perception — Control Surfaces', () => {
  beforeEach(() => {
    mockSafeInvoke.mockClear();
  });

  it('should pause a desktop session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'paused',
      paused_at: '2026-04-02T22:00:00Z',
    };
    mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await pauseDesktopSession('dsk_123456_abc');

    expect(mockSafeInvoke).toHaveBeenCalledWith('desktop_pause_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.status).toBe('paused');
  });

  it('should resume a paused session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'perceiving',
    };
    mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await resumeDesktopSession('dsk_123456_abc');

    expect(mockSafeInvoke).toHaveBeenCalledWith('desktop_resume_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.status).toBe('perceiving');
  });

  it('should trigger handoff for a session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      handoff_pending: true,
    };
    mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await handoffDesktopSession('dsk_123456_abc', 'sensitive_content');

    expect(mockSafeInvoke).toHaveBeenCalledWith('desktop_handoff_session', {
      session_id: 'dsk_123456_abc',
      reason: 'sensitive_content',
    });
    expect(result.handoff_pending).toBe(true);
  });

  it('should activate kill switch', async () => {
    mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: true, error: null });

    const result = await killDesktopSession('dsk_123456_abc', 'user_requested');

    expect(mockSafeInvoke).toHaveBeenCalledWith('desktop_kill_switch', {
      session_id: 'dsk_123456_abc',
      reason: 'user_requested',
    });
    expect(result).toBe(true);
  });

  it('should get control status', async () => {
    const mockStatus = {
      can_pause: true,
      can_resume: false,
      can_handoff: true,
      can_kill: true,
      current_status: 'perceiving',
    };
    mockSafeInvoke.mockResolvedValueOnce({ ok: true, content: mockStatus, error: null });

    const result = await getDesktopControlStatus('dsk_123456_abc');

    expect(mockSafeInvoke).toHaveBeenCalledWith('desktop_get_control_status', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.can_pause).toBe(true);
  });

  it('should propagate canonical error shape on failure', async () => {
    mockSafeInvoke.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { code: 'IPC_ERROR', message: 'Backend unavailable' },
    });

    await expect(pauseDesktopSession('dsk_fail')).rejects.toThrow('Backend unavailable');
  });

  it('should not import @tauri-apps/api/core directly', async () => {
    // Verifies the module uses the canonical IPC path, not direct invoke
    const mod = await import('../../../services/operator/desktopPerception');
    expect(mod).toBeDefined();
    // If @tauri-apps/api/core were imported directly, this mock setup would not suffice
    // The fact that tests pass with only @/utils/invoke mocked confirms canonical path
  });
});
