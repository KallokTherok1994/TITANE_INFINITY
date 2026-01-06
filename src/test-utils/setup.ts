/**
 * TITANE∞ v26.3.1 - Vitest Global Setup
 * Automatic test environment configuration
 * ✅ v26.3.1: Enhanced memory cleanup to prevent heap overflow
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, afterAll, vi } from 'vitest';
import React from 'react';

// ✅ v26.3.1: Track active intervals/timeouts for cleanup
const activeIntervals = new Set<ReturnType<typeof setInterval>>();
const activeTimeouts = new Set<ReturnType<typeof setTimeout>>();

// ✅ v26.3.1: Patch global timers to track them
const originalSetInterval = globalThis.setInterval;
const originalSetTimeout = globalThis.setTimeout;
const originalClearInterval = globalThis.clearInterval;
const originalClearTimeout = globalThis.clearTimeout;

globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
  const id = originalSetInterval(...args);
  activeIntervals.add(id);
  return id;
}) as typeof setInterval;

globalThis.setTimeout = ((...args: Parameters<typeof setTimeout>) => {
  const id = originalSetTimeout(...args);
  activeTimeouts.add(id);
  return id;
}) as typeof setTimeout;

globalThis.clearInterval = ((id: ReturnType<typeof setInterval>) => {
  activeIntervals.delete(id);
  return originalClearInterval(id);
}) as typeof clearInterval;

globalThis.clearTimeout = ((id: ReturnType<typeof setTimeout>) => {
  activeTimeouts.delete(id);
  return originalClearTimeout(id);
}) as typeof clearTimeout;

// ✅ v26.3.1: Clear all timers and mocks between tests to prevent memory leaks
beforeEach(() => {
  vi.clearAllTimers();
});

// Cleanup after each test automatically
afterEach(() => {
  // ✅ v26.3.1: Enhanced cleanup sequence
  if (typeof cleanup === 'function') {
    cleanup();
  }

  // ✅ v26.3.1: Clear all mocks, timers, and localStorage
  vi.clearAllMocks();
  vi.clearAllTimers();

  // ✅ v26.3.1: Clear any remaining intervals/timeouts
  activeIntervals.forEach(id => originalClearInterval(id));
  activeTimeouts.forEach(id => originalClearTimeout(id));
  activeIntervals.clear();
  activeTimeouts.clear();

  // Clear localStorage to prevent state leakage between tests
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }

  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
});

// ✅ v26.3.1: Final cleanup after all tests
afterAll(() => {
  activeIntervals.forEach(id => originalClearInterval(id));
  activeTimeouts.forEach(id => originalClearTimeout(id));
  activeIntervals.clear();
  activeTimeouts.clear();
});

// ═══════════════════════════════════════════════════════════════════
// FIX: React hooks rendering context
// ═══════════════════════════════════════════════════════════════════

// Provide a default React context for all tests
// This prevents "Invalid hook call" errors
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ v26.3.1: Function to create fresh QueryClient for each test
const createQueryClient = () => new QueryClient({
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
});

// Global QueryClient (will be cleared between tests)
const globalQueryClient = createQueryClient();

// ✅ v26.3.1: Reset QueryClient between tests to prevent cache accumulation
afterEach(() => {
  globalQueryClient.clear();
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
