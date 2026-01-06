/**
 * TITANE∞ v25 - Vitest Global Setup
 * Automatic test environment configuration
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi as _vi } from 'vitest';
import React from 'react';

// Cleanup after each test automatically
afterEach(() => {
  if (typeof cleanup === 'function') {
    cleanup();
  }
});

// ═══════════════════════════════════════════════════════════════════
// FIX: React hooks rendering context
// ═══════════════════════════════════════════════════════════════════

// Provide a default React context for all tests
// This prevents "Invalid hook call" errors
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const globalQueryClient = new QueryClient({
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
  // Note: logger was removed in React Query v5
});

// Global wrapper for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: globalQueryClient }, children);

TestWrapper.displayName = 'TestWrapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test utility globalThis typing
(globalThis as any).__TEST_WRAPPER__ = TestWrapper;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock class for test environment
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock class for test environment
} as any;
