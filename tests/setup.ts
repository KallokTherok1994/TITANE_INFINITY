/**
 * TITANE∞ OS - Configuration Jest Setup
 * Initialisation de l'environnement de test
 */

import '@testing-library/jest-dom';

// Mock Tauri API globalement
global.window.__TAURI__ = {
  invoke: jest.fn(),
  event: {
    listen: jest.fn(),
    emit: jest.fn(),
  },
  tauri: {
    invoke: jest.fn(),
  },
} as any;

// Mock console methods pour tests propres
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
