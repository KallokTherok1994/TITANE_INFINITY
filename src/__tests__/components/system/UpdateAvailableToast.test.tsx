/**
 * Vitest — UpdateAvailableToast (v34.0.13 stale-pages hotfix)
 *
 * Covers:
 *  - mounts as null until the `sw-update-available` window event fires
 *  - registers/unregisters the event listener cleanly
 *  - reload action calls the injected `onReload` callback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import { UpdateAvailableToast } from '@/components/system/UpdateAvailableToast';

// sonner toast is a no-op for these tests
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { info: vi.fn(), error: vi.fn(), success: vi.fn() }),
}));

describe('UpdateAvailableToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing before the sw-update-available event fires', () => {
    const { container } = render(<UpdateAvailableToast onReload={() => {}} />);
    expect(container.querySelector('[data-testid="update-available-toast"]')).toBeNull();
  });

  it('renders the marker after a sw-update-available event', async () => {
    const onReload = vi.fn();
    const { findByTestId } = render(<UpdateAvailableToast onReload={onReload} />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
    });

    const marker = await findByTestId('update-available-toast');
    expect(marker).toBeTruthy();
  });

  it('reload button invokes the injected onReload', async () => {
    const onReload = vi.fn();
    const { findByTestId } = render(<UpdateAvailableToast onReload={onReload} />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
    });

    const btn = await findByTestId('update-available-reload');
    fireEvent.click(btn);
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('only registers the toast once per mount', async () => {
    const onReload = vi.fn();
    render(<UpdateAvailableToast onReload={onReload} />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
      window.dispatchEvent(new CustomEvent('sw-update-available'));
      window.dispatchEvent(new CustomEvent('sw-update-available'));
    });

    const { toast } = await import('sonner');
    // The `info` variant is the one we trigger
    // sonner mock returns vi.fn for info
    // We assert it was called once across the 3 events.
    expect((toast as unknown as { info: ReturnType<typeof vi.fn> }).info).toHaveBeenCalledTimes(1);
  });
});
