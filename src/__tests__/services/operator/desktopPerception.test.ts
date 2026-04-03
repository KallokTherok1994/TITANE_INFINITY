import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  pauseDesktopSession,
  resumeDesktopSession,
  handoffDesktopSession,
  killDesktopSession,
  getDesktopControlStatus,
} from '../../services/operator/desktopPerception.ts';

// Mock the invoke function
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('Desktop Perception — Control Surfaces', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  it('should pause a desktop session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'paused',
      paused_at: '2026-04-02T22:00:00Z',
    };
    mockInvoke.mockResolvedValueOnce(mockSession);

    const result = await pauseDesktopSession('dsk_123456_abc');

    expect(mockInvoke).toHaveBeenCalledWith('desktop_pause_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.status).toBe('paused');
  });

  it('should resume a paused session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      status: 'perceiving',
    };
    mockInvoke.mockResolvedValueOnce(mockSession);

    const result = await resumeDesktopSession('dsk_123456_abc');

    expect(mockInvoke).toHaveBeenCalledWith('desktop_resume_session', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.status).toBe('perceiving');
  });

  it('should trigger handoff for a session', async () => {
    const mockSession = {
      session_id: 'dsk_123456_abc',
      handoff_pending: true,
    };
    mockInvoke.mockResolvedValueOnce(mockSession);

    const result = await handoffDesktopSession('dsk_123456_abc', 'sensitive_content');

    expect(mockInvoke).toHaveBeenCalledWith('desktop_handoff_session', {
      session_id: 'dsk_123456_abc',
      reason: 'sensitive_content',
    });
    expect(result.handoff_pending).toBe(true);
  });

  it('should activate kill switch', async () => {
    mockInvoke.mockResolvedValueOnce(true);

    const result = await killDesktopSession('dsk_123456_abc', 'user_requested');

    expect(mockInvoke).toHaveBeenCalledWith('desktop_kill_switch', {
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
    mockInvoke.mockResolvedValueOnce(mockStatus);

    const result = await getDesktopControlStatus('dsk_123456_abc');

    expect(mockInvoke).toHaveBeenCalledWith('desktop_get_control_status', {
      session_id: 'dsk_123456_abc',
    });
    expect(result.can_pause).toBe(true);
  });
});
