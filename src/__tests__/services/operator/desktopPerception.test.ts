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
const mockSafeInvokeCanonical = safeInvokeCanonical as ReturnType<typeof vi.fn>;

describe('Desktop Perception — Control Surfaces', () => {
  beforeEach(() => {
    mockSafeInvokeCanonical.mockClear();
  });

  it('should pause a desktop session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'paused',
      paused_at: '2026-04-02T22:00:00Z',
    };
    mockSafeInvokeCanonical.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await pauseDesktopSession('dsk_123456_abc');

    expect(mockSafeInvokeCanonical).toHaveBeenCalledWith('desktop_pause_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.ok).toBe(true);
    expect(result.content?.status).toBe('paused');
  });

  it('should resume a paused session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'perceiving',
    };
    mockSafeInvokeCanonical.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await resumeDesktopSession('dsk_123456_abc');

    expect(mockSafeInvokeCanonical).toHaveBeenCalledWith('desktop_resume_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.ok).toBe(true);
    expect(result.content?.status).toBe('perceiving');
  });

  it('should trigger handoff for a session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      handoff_pending: true,
    };
    mockSafeInvokeCanonical.mockResolvedValueOnce({ ok: true, content: mockSession, error: null });

    const result = await handoffDesktopSession('dsk_123456_abc', 'sensitive_content');

    expect(mockSafeInvokeCanonical).toHaveBeenCalledWith('desktop_handoff_session', {
      session_id: 'dsk_123456_abc',
      reason: 'sensitive_content',
    });
    expect(result.ok).toBe(true);
    expect(result.content?.handoff_pending).toBe(true);
  });

  it('should activate kill switch', async () => {
    mockSafeInvokeCanonical.mockResolvedValueOnce({ ok: true, content: true, error: null });

    const result = await killDesktopSession('dsk_123456_abc', 'user_requested');

    expect(mockSafeInvokeCanonical).toHaveBeenCalledWith('desktop_kill_switch', {
      session_id: 'dsk_123456_abc',
      reason: 'user_requested',
    });
    expect(result.ok).toBe(true);
    expect(result.content).toBe(true);
  });

  it('should get control status', async () => {
    const mockStatus = {
      can_pause: true,
      can_resume: false,
      can_handoff: true,
      can_kill: true,
      current_status: 'perceiving',
    };
    mockSafeInvokeCanonical.mockResolvedValueOnce({ ok: true, content: mockStatus, error: null });

    const result = await getDesktopControlStatus('dsk_123456_abc');

    expect(mockSafeInvokeCanonical).toHaveBeenCalledWith('desktop_get_control_status', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.ok).toBe(true);
    expect(result.content?.can_pause).toBe(true);
  });

  it('should return canonical error result on IPC failure', async () => {
    mockSafeInvokeCanonical.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { code: 'IPC_ERROR', message: 'backend unavailable' },
    });

    const result = await pauseDesktopSession('dsk_123456_abc');

    expect(result.ok).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error?.code).toBe('IPC_ERROR');
  });
});
