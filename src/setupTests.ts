/**
 * TITANE∞ v25.4.2 — Test Setup Configuration
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// ─────────────────────────────────────────────────────────────────
// Polyfills (Node/JSDOM compat)
// ─────────────────────────────────────────────────────────────────
// Some DOM stacks (whatwg-url/webidl-conversions) expect these accessors to exist.
// When missing, they can throw during module import, causing Vitest "Unhandled Errors".
(() => {
  const defineGetter = (proto: object, key: string, getter: () => unknown) => {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc) {
      Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: false,
        get: getter,
      });
    }
  };

  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.prototype) {
    defineGetter(ArrayBuffer.prototype, 'resizable', () => false);
    defineGetter(ArrayBuffer.prototype, 'maxByteLength', function () {
      return (this as ArrayBuffer).byteLength;
    });
  }

  if (typeof SharedArrayBuffer !== 'undefined' && SharedArrayBuffer.prototype) {
    defineGetter(SharedArrayBuffer.prototype, 'growable', () => false);
    defineGetter(SharedArrayBuffer.prototype, 'maxByteLength', function () {
      return (this as SharedArrayBuffer).byteLength;
    });
  }
})();

// Extend Vitest matchers with jest-dom
expect.extend(matchers);

// Setup global test environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
