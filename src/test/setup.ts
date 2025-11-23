/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — VITEST SETUP
 *   Configuration globale tests (mocks, matchers, cleanup)
 * ═══════════════════════════════════════════════════════════════════
 */

// @ts-nocheck
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup automatique après chaque test
afterEach(() => {
  cleanup();
});

// Mock Tauri API (évite erreurs "window.__TAURI__ undefined")
interface MockWindow extends Window {
  __TAURI__?: {
    invoke: ReturnType<typeof vi.fn>;
    event: {
      listen: ReturnType<typeof vi.fn>;
    };
  };
}

global.window = global.window || ({} as MockWindow);
(global.window as MockWindow).__TAURI__ = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    // @ts-expect-error - Test mock type
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
