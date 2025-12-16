/**
 * TITANE∞ v25 - Hook Test Utilities
 * Wrapper for testing React hooks with proper context
 */

import { renderHook as rtlRenderHook } from '@testing-library/react';
import { TestProviders, createTestQueryClient } from './TestProviders';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface RenderHookOptions {
  queryClient?: QueryClient;
}

/**
 * Renders a React hook with all necessary providers
 * Fixes: "Invalid hook call" errors
 */
export function renderHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions & { initialProps?: TProps } = {}
) {
  const {
    queryClient = createTestQueryClient(),
    initialProps,
    ...renderOptions
  } = options;

  // Use global wrapper if available (from setup.ts)
  const wrapper =
    (globalThis as any).__TEST_WRAPPER__ ||
    (({ children }: { children: ReactNode }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ));

  return rtlRenderHook(hook, {
    wrapper,
    initialProps,
    ...renderOptions,
  });
}
