/**
 * TITANE∞ v26 - Test Utilities Type Declarations
 * Explicit type exports for TypeScript strict mode
 */

export * from './TestProviders';
export { renderHook, type RenderHookOptions } from './renderHook';

// Re-exports from @testing-library/react
export {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
  act,
  cleanup,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';

export { default as userEvent } from '@testing-library/user-event';
