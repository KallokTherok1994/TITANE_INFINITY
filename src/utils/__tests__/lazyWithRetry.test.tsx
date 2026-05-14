import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { lazyWithRetry, __resetLazyWithRetryCacheForTests } from '../lazyWithRetry';

function makeFactory(behaviour: ('ok' | 'fail')[]) {
  let call = 0;
  const Mock = () => <div data-testid="lazy-loaded">OK</div>;
  return vi.fn(async () => {
    const idx = call++;
    const op = behaviour[Math.min(idx, behaviour.length - 1)];
    if (op === 'fail') {
      throw new Error(`fail#${idx}`);
    }
    return { default: Mock as unknown as React.ComponentType };
  });
}

describe('lazyWithRetry', () => {
  beforeEach(() => {
    __resetLazyWithRetryCacheForTests();
  });

  it('resolves on first attempt when factory succeeds', async () => {
    const factory = makeFactory(['ok']);
    const Comp = lazyWithRetry(factory, undefined, 3, [1, 1, 1]);

    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <Comp />
      </Suspense>,
    );

    await waitFor(() => expect(screen.getByTestId('lazy-loaded')).toBeInTheDocument());
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('retries on rejection and eventually succeeds', async () => {
    const factory = makeFactory(['fail', 'fail', 'ok']);
    const Comp = lazyWithRetry(factory, undefined, 3, [1, 1, 1]);

    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <Comp />
      </Suspense>,
    );

    await waitFor(() => expect(screen.getByTestId('lazy-loaded')).toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('throws after retries exhausted', async () => {
    const factory = makeFactory(['fail', 'fail', 'fail']);
    const Comp = lazyWithRetry(factory, undefined, 3, [1, 1, 1]);

    class Boundary extends React.Component<
      { children: React.ReactNode },
      { err: Error | null }
    > {
      state = { err: null as Error | null };
      static getDerivedStateFromError(err: Error) {
        return { err };
      }
      render() {
        if (this.state.err) return <div data-testid="err">{this.state.err.message}</div>;
        return this.props.children;
      }
    }

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Boundary>
        <Suspense fallback={<div data-testid="fallback">loading</div>}>
          <Comp />
        </Suspense>
      </Boundary>,
    );

    await waitFor(() => expect(screen.getByTestId('err')).toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(factory).toHaveBeenCalledTimes(3);
    errSpy.mockRestore();
  });

  it('caches resolved module under cacheKey across multiple lazy instances', async () => {
    const factory = makeFactory(['ok']);
    const A = lazyWithRetry(factory, 'shared-key', 3, [1]);
    const B = lazyWithRetry(factory, 'shared-key', 3, [1]);

    const { unmount } = render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <A />
      </Suspense>,
    );
    await waitFor(() => expect(screen.getAllByTestId('lazy-loaded').length).toBeGreaterThan(0));
    unmount();

    render(
      <Suspense fallback={<div data-testid="fallback2">loading</div>}>
        <B />
      </Suspense>,
    );
    await waitFor(() => expect(screen.getAllByTestId('lazy-loaded').length).toBeGreaterThan(0));

    expect(factory).toHaveBeenCalledTimes(1);
  });
});
