/**
 * Type declarations for @testing-library/jest-dom with Vitest
 * Extends Vitest's Assertion interface with jest-dom matchers
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers {}
}

export {};
