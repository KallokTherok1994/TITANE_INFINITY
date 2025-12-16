/**
 * TITANE∞ v25 - Test Providers
 * React Test Wrapper with all necessary providers
 * Fixes: "Cannot read properties of null (reading 'useCallback')"
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ═══════════════════════════════════════════════════════════════════
// TEST QUERY CLIENT
// ═══════════════════════════════════════════════════════════════════

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

// ═══════════════════════════════════════════════════════════════════
// TEST PROVIDERS WRAPPER
// ═══════════════════════════════════════════════════════════════════

export interface TestProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

/**
 * Wraps components with all necessary providers for testing
 * Prevents React hook errors by providing proper context
 */
export function TestProviders({
  children,
  queryClient = createTestQueryClient(),
}: TestProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// ═══════════════════════════════════════════════════════════════════
// RENDER WITH PROVIDERS
// ═══════════════════════════════════════════════════════════════════

export interface RenderOptions {
  queryClient?: QueryClient;
}

/**
 * Custom render function that includes all providers
 * Use this instead of @testing-library/react's render
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient, ...options }: RenderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );

  return {
    wrapper: Wrapper,
    queryClient: queryClient || createTestQueryClient(),
    ...options,
  };
}

export default TestProviders;
