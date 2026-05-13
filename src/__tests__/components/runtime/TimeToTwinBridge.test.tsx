/**
 * TITANE∞ — TimeToTwinBridge runtime bootstrap tests.
 *
 * Vérifie le câblage Single Door au mount/unmount:
 *   - registerTemporalChatTools appelé sur le singleton ToolCaller (1x)
 *   - observer.start() appelé au mount, observer.stop() au unmount
 *   - prop disabled neutralise le pont
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const observerMocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pulseOnce: vi.fn(),
  isRunning: vi.fn(() => false),
}));

const temporalMocks = vi.hoisted(() => ({
  getRuntimeTimeToTwinObserver: vi.fn(),
  resetRuntimeTimeToTwinObserverForTests: vi.fn(),
  registerTemporalChatTools: vi.fn(),
}));

vi.mock('@/services/temporal', () => ({
  getRuntimeTimeToTwinObserver: temporalMocks.getRuntimeTimeToTwinObserver,
  resetRuntimeTimeToTwinObserverForTests:
    temporalMocks.resetRuntimeTimeToTwinObserverForTests,
  registerTemporalChatTools: temporalMocks.registerTemporalChatTools,
}));

const toolCallerStub = { registerTool: vi.fn() };
vi.mock('@/services/chat/toolCaller', () => ({
  getToolCaller: vi.fn(() => toolCallerStub),
}));

import {
  TimeToTwinBridge,
  resetTimeToTwinBridgeForTests,
} from '@/components/runtime/TimeToTwinBridge';

describe('TimeToTwinBridge (runtime bootstrap)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    temporalMocks.getRuntimeTimeToTwinObserver.mockReturnValue({
      start: observerMocks.start,
      stop: observerMocks.stop,
      pulseOnce: observerMocks.pulseOnce,
      isRunning: observerMocks.isRunning,
    });
    resetTimeToTwinBridgeForTests();
  });

  afterEach(() => cleanup());

  it('démarre observer + enregistre chat tools au mount', () => {
    render(<TimeToTwinBridge />);
    expect(temporalMocks.registerTemporalChatTools).toHaveBeenCalledTimes(1);
    expect(temporalMocks.registerTemporalChatTools).toHaveBeenCalledWith(
      toolCallerStub
    );
    expect(temporalMocks.getRuntimeTimeToTwinObserver).toHaveBeenCalledWith({
      intervalMs: 60000,
    });
    expect(observerMocks.start).toHaveBeenCalledTimes(1);
    expect(observerMocks.stop).not.toHaveBeenCalled();
  });

  it('arrête observer au unmount', () => {
    const { unmount } = render(<TimeToTwinBridge />);
    unmount();
    expect(observerMocks.stop).toHaveBeenCalledTimes(1);
  });

  it('ne ré-enregistre pas les chat tools sur double mount', () => {
    const { unmount } = render(<TimeToTwinBridge />);
    unmount();
    render(<TimeToTwinBridge />);
    expect(temporalMocks.registerTemporalChatTools).toHaveBeenCalledTimes(1);
    expect(observerMocks.start).toHaveBeenCalledTimes(2);
  });

  it('disabled=true neutralise tout effet runtime', () => {
    render(<TimeToTwinBridge disabled />);
    expect(temporalMocks.registerTemporalChatTools).not.toHaveBeenCalled();
    expect(temporalMocks.getRuntimeTimeToTwinObserver).not.toHaveBeenCalled();
    expect(observerMocks.start).not.toHaveBeenCalled();
  });

  it('propage intervalMs custom à l’observer', () => {
    render(<TimeToTwinBridge intervalMs={5000} />);
    expect(temporalMocks.getRuntimeTimeToTwinObserver).toHaveBeenCalledWith({
      intervalMs: 5000,
    });
  });
});
