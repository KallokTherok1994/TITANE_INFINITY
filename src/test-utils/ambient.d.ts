/**
 * TITANE∞ v26 - Test Utilities Ambient Module Declaration
 * Resolves TypeScript strict mode re-export detection issues
 */

declare module '@/test-utils' {
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

  // Custom exports
  export { renderHook, type RenderHookOptions } from '@/test-utils/renderHook';
  export { default as userEvent } from '@testing-library/user-event';
  export * from '@/test-utils/TestProviders';
}
