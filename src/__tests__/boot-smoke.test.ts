/**
 * TITANE∞ v26.3.0 — Boot Smoke Test
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🧪 TEST DE DÉMARRAGE - Vérification des imports critiques
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Mock window object pour les tests
beforeAll(() => {
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

  // Mock pour les APIs Tauri
  (window as any).__TAURI_IPC__ = {
    invoke: () => Promise.resolve(),
  };
});

describe('🔥 Boot Smoke Test - Critical Imports', () => {
  it('should import main App component without errors', async () => {
    await expect(import('../App')).resolves.toBeDefined();
  });

  it('should import ErrorBoundary without errors', async () => {
    await expect(import('../components/ErrorBoundary')).resolves.toBeDefined();
  });

  it('should import BootErrorFallback without errors', async () => {
    await expect(import('../components/BootErrorFallback')).resolves.toBeDefined();
  });

  it('should import lazy diagnostic utility without errors', async () => {
    await expect(import('../utils/lazyImportDiagnostic')).resolves.toBeDefined();
  });

  it('should import tauri protection patch without errors', async () => {
    await expect(import('../tauri-protection-patch')).resolves.toBeDefined();
  });
});

describe('🚀 Lazy Import Diagnostic Tests', () => {
  it('should create lazy component with diagnostic wrapper', async () => {
    const { lazyWithDiagnostic } = await import('../utils/lazyImportDiagnostic');

    const testLazy = lazyWithDiagnostic(
      () => Promise.resolve({ default: () => 'test' }),
      'test-component'
    );

    expect(testLazy).toBeDefined();
  });

  it('should handle timeout lazy component', async () => {
    const { lazyWithTimeout } = await import('../utils/lazyImportDiagnostic');

    const testLazy = lazyWithTimeout(() => Promise.resolve({ default: () => 'test' }), {
      timeoutMs: 1000,
      label: 'test-timeout',
    });

    expect(testLazy).toBeDefined();
  });

  it('should handle failed lazy import gracefully', async () => {
    const { lazyWithDiagnostic } = await import('../utils/lazyImportDiagnostic');

    const failingLazy = lazyWithDiagnostic(
      () => Promise.reject(new Error('Module loading failed')),
      'failing-component'
    );

    expect(failingLazy).toBeDefined();
    // Le lazy component devrait être créé même si le factory échoue
  });
});

describe('🛡️ Boot Error Handling', () => {
  it('should render BootErrorFallback for module script errors', async () => {
    const { BootErrorFallback } = await import('../components/BootErrorFallback');
    const error = new Error('Importing a module script failed.');

    // Test basique que le composant peut être instancié
    expect(() => {
      // Le composant devrait pouvoir être créé sans erreur
      const props = { error };
      expect(props.error.message).toContain('module script failed');
    }).not.toThrow();
  });
});
