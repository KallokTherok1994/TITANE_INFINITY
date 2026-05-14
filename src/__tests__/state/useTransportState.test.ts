/**
 * TITANE_INFINITY v34.1.0 — useTransportState tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useTransportState, getTransportSnapshot } from '../../state/useTransportState';

describe('useTransportState', () => {
  beforeEach(() => {
    useTransportState.setState({ transport: 'degraded', lastProbeAt: 0 });
  });

  it('starts in degraded state with zero probe timestamp', () => {
    const snap = getTransportSnapshot();
    expect(snap.transport).toBe('degraded');
    expect(snap.lastProbeAt).toBe(0);
  });

  it('setTransport updates value and timestamp', () => {
    useTransportState.getState().setTransport('tauri', 1234);
    const snap = getTransportSnapshot();
    expect(snap.transport).toBe('tauri');
    expect(snap.lastProbeAt).toBe(1234);
  });

  it('setTransport defaults probeAt to Date.now() when omitted', () => {
    const before = Date.now();
    useTransportState.getState().setTransport('remote');
    const snap = getTransportSnapshot();
    expect(snap.transport).toBe('remote');
    expect(snap.lastProbeAt).toBeGreaterThanOrEqual(before);
  });
});
