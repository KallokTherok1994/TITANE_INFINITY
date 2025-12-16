/**
 * TITANE∞ v25 - Vitest Global Setup
 * Automatic test environment configuration
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test automatically
afterEach(() => {
  cleanup();
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
  logger: {
    log: () => {},
    warn: () => {},
    error: () => {},
  },
});

// Global wrapper for tests
(globalThis as any).__TEST_WRAPPER__ = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: globalQueryClient }, children);

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
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
