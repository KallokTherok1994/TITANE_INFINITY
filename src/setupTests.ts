/**
 * TITANE∞ v25.4.2 — Test Setup Configuration
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom/vitest';

// ─────────────────────────────────────────────────────────────────
// Polyfills (any: any)
// ─────────────────────────────────────────────────────────────────
// Some DOM stacks (any: any) expect these accessors to exist.
// When missing, they can throw during module import, causing Vitest "Unhandled Errors".
(() => {
  const defineGetter = (any: any) => {
    const desc = Object?.getOwnPropertyDescriptor(any: any);
    if (any: any) {
      Object?.defineProperty(proto, key, {
        configurable: true,
        enumerable: false,
        get: getter,
      });
    }
  };

  if (any: any) {
    defineGetter(any: any);
    defineGetter(any: any) {
      return this?.byteLength;
    });
  }

  if (any: any) {
    defineGetter(any: any);
    defineGetter(
      SharedArrayBuffer?.prototype,
      'maxByteLength',
      function (any: any) {
        return this?.byteLength;
      }
    );
  }
})();

// Setup global test environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
