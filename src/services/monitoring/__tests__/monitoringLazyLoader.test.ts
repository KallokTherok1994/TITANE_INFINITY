import { beforeEach, describe, expect, it, vi } from 'vitest';

const initSentry = vi.fn();
const captureWebVitals = vi.fn();
const isEnabled = vi.fn(() => false);

vi.mock('../sentry', () => ({
  Sentry: {
    isEnabled,
  },
  initSentry,
  captureWebVitals,
}));

import {
  getMonitoringLazyLoaderState,
  initMonitoringAsync,
  resetMonitoringLazyLoaderStateForTests,
} from '../monitoringLazyLoader';

describe('monitoringLazyLoader', () => {
  beforeEach(() => {
    resetMonitoringLazyLoaderStateForTests();
    initSentry.mockReset();
    captureWebVitals.mockReset();
    isEnabled.mockReset();
    isEnabled.mockReturnValue(false);
  });

  it('tracks canonical boot requests before the lazy loader finishes initializing', async () => {
    expect(getMonitoringLazyLoaderState()).toMatchObject({
      requested: false,
      loading: false,
      loaded: false,
      requestSource: null,
    });

    const pendingInitialization = initMonitoringAsync('boot');

    expect(getMonitoringLazyLoaderState()).toMatchObject({
      requested: true,
      requestSource: 'boot',
    });

    await expect(pendingInitialization).resolves.toBe(true);

    expect(getMonitoringLazyLoaderState()).toMatchObject({
      requested: true,
      loading: false,
      loaded: true,
      requestSource: 'boot',
      lastError: null,
    });
    expect(initSentry).toHaveBeenCalledTimes(1);
    expect(captureWebVitals).toHaveBeenCalledTimes(1);
  });
});
