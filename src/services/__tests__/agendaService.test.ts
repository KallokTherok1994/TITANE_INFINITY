import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent } from '@/engines/time/types';

const secureInvokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

import { loadAllEvents } from '@/services/agendaService';

function makeEvent(id: string): AgendaEvent {
  return {
    id,
    title: `Event ${id}`,
    startDateTime: '2026-05-14T09:00:00.000Z',
    endDateTime: '2026-05-14T10:00:00.000Z',
    allDay: false,
    category: 'work',
    status: 'scheduled',
    priority: 'medium',
    tags: [],
    reminders: [],
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('agendaService.loadAllEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the raw events array when IPC already resolves a list', async () => {
    const events = [makeEvent('evt-1')];
    secureInvokeMock.mockResolvedValueOnce(events);

    await expect(loadAllEvents()).resolves.toEqual(events);
  });

  it('unwraps the canonical IPC envelope content when present', async () => {
    const events = [makeEvent('evt-2')];
    secureInvokeMock.mockResolvedValueOnce({
      ok: true,
      content: events,
      error: null,
    });

    await expect(loadAllEvents()).resolves.toEqual(events);
  });

  it('returns an empty array for failed IPC envelopes', async () => {
    secureInvokeMock.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { message: 'Tauri runtime unavailable' },
    });

    await expect(loadAllEvents()).resolves.toEqual([]);
  });

  it('returns an empty array for generic browser fallbacks', async () => {
    secureInvokeMock.mockResolvedValueOnce({
      success: false,
      fallback: true,
      error: 'Browser fallback',
    });

    await expect(loadAllEvents()).resolves.toEqual([]);
  });
});
