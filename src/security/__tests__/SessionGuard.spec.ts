/**
 * @module src/security/__tests__/SessionGuard.spec.ts
 * @description Session Guard tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionGuard } from '../SessionGuard';

describe('SessionGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    SessionGuard.initialize({ timeoutMs: 10000, warningMs: 2000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize session', () => {
    expect(SessionGuard.isSessionValid()).toBe(true);
  });

  it('should record activity and reset timeout', () => {
    vi.advanceTimersByTime(5000);
    SessionGuard.recordActivity();

    // Time remaining should be close to full timeout
    const remaining = SessionGuard.getTimeRemaining();
    expect(remaining).toBeGreaterThan(8000);
  });

  it('should show warning before timeout', () => {
    const events: any[] = [];
    SessionGuard.onSessionEvent(e => events.push(e));

    vi.advanceTimersByTime(8500); // Past warning time (10000 - 2000 = 8000)

    expect(events.some(e => e.message.includes('will expire'))).toBe(true);
  });

  it('should invalidate session after timeout', () => {
    vi.advanceTimersByTime(11000); // Past timeout

    expect(SessionGuard.isSessionValid()).toBe(false);
  });

  it('should track time remaining', () => {
    vi.advanceTimersByTime(5000);
    const remaining = SessionGuard.getTimeRemaining();

    expect(remaining).toBeGreaterThan(4000);
    expect(remaining).toBeLessThanOrEqual(5000);
  });

  it('should reset warning on new activity', () => {
    const events: any[] = [];
    SessionGuard.onSessionEvent(e => events.push(e));

    vi.advanceTimersByTime(8500); // Warning should trigger
    expect(events.length).toBeGreaterThan(0);

    // Reset events
    events.length = 0;

    // Record activity
    SessionGuard.recordActivity();

    // Advance again - warning should not duplicate
    vi.advanceTimersByTime(8500);
    const warningCount = events.filter(e => e.message.includes('will expire')).length;

    expect(warningCount).toBeLessThanOrEqual(1);
  });

  it('should support event listeners', () => {
    const callback = vi.fn();
    const unsubscribe = SessionGuard.onSessionEvent(callback);

    vi.advanceTimersByTime(8500);

    // Callback should be called
    expect(callback).toHaveBeenCalled();

    // Unsubscribe
    unsubscribe();
    const callCount = callback.mock.calls.length;

    vi.advanceTimersByTime(11000);

    // Should not be called again
    expect(callback.mock.calls.length).toBe(callCount);
  });

  it('should handle invalid invalidation', () => {
    SessionGuard.invalidateSession();
    SessionGuard.invalidateSession(); // Should not error on 2nd call

    expect(SessionGuard.isSessionValid()).toBe(false);
  });

  it('should clear timeouts on invalidation', () => {
    const timeoutSpy = vi.spyOn(global, 'clearTimeout');

    SessionGuard.invalidateSession();

    expect(timeoutSpy).toHaveBeenCalled();
    timeoutSpy.mockRestore();
  });
});
