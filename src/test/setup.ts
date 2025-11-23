/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — VITEST SETUP
 *   Configuration globale tests (mocks, matchers, cleanup)
 * ═══════════════════════════════════════════════════════════════════
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup automatique après chaque test
afterEach(() => {
  cleanup();
});

// Mock Tauri API (évite erreurs "window.__TAURI__ undefined")
global.window = global.window || ({} as any);
(global.window as any).__TAURI__ = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
  tauri: {
    invoke: vi.fn(),
  },
};

// Mock @tauri-apps/api
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
  emit: vi.fn(),
}));
