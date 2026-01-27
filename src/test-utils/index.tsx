/**
 * TITANE∞ v25 - Test Utilities
 * Central export for all test utilities
 */

export * from './TestProviders';
export { renderHook } from './renderHook';
export type { RenderHookOptions } from './renderHook';

// Explicit re-exports from @testing-library/react for better TypeScript compatibility
export {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
  act,
  cleanup,
  renderHook as rtlRenderHook,
} from '@testing-library/react';

export { default as userEvent } from '@testing-library/user-event';
