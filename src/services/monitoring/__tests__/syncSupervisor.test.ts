import { beforeEach, describe, expect, it } from 'vitest';
import { chatMetrics } from '../chatMetrics';
import {
  getMonitoringSyncSnapshot,
  resetMonitoringSyncSupervisorForTests,
} from '../syncSupervisor';
import { useSystemStore } from '@/stores/systemStore';

describe('monitoring sync supervisor', () => {
  beforeEach(() => {
    localStorage.clear();
    useSystemStore.getState().reset();
    resetMonitoringSyncSupervisorForTests();
  });

  it('returns stale when backend and frontend timelines are not initialized', () => {
    const snapshot = getMonitoringSyncSnapshot();

    expect(snapshot.state).toBe('stale');
    expect(snapshot.label).toBe('STALE');
    expect(snapshot.desyncCount).toBe(0);
  });

  it('returns synced when backend and frontend are fresh and aligned', () => {
    useSystemStore.setState({ lastUpdate: Date.now() - 1000 });
    chatMetrics.startConversation('sync-supervisor-conv');
    chatMetrics.recordMessageSent('sync-supervisor-conv', 10);

    const snapshot = getMonitoringSyncSnapshot();

    expect(snapshot.state).toBe('synced');
    expect(snapshot.label).toBe('SYNCED');
    expect(snapshot.backendAgeMs).not.toBeNull();
    expect(snapshot.frontendAgeMs).not.toBeNull();
  });

  it('returns desync when drift is too high and keeps a desync counter', () => {
    const now = Date.now();
    useSystemStore.setState({ lastUpdate: now - 120_000 });
    chatMetrics.startConversation('sync-supervisor-drift-conv');
    chatMetrics.recordMessageSent('sync-supervisor-drift-conv', 10);

    const firstSnapshot = getMonitoringSyncSnapshot();
    const secondSnapshot = getMonitoringSyncSnapshot();

    expect(firstSnapshot.state).toBe('desync');
    expect(firstSnapshot.label).toBe('DESYNC');
    expect(firstSnapshot.desyncCount).toBe(1);
    expect(secondSnapshot.desyncCount).toBe(1);
  });
});
