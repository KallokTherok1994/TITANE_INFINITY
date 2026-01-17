/**
 * TITANE_INFINITY v24.3.8 - THREE?.js Ambient Declaration
 *
 * This file ensures THREE is treated as both a type AND value namespace.
 * Fixes: "THREE only refers to a type, but is being used as a value here"
 *
 * Root cause: moduleResolution: "bundler" + isolatedModules + @types/three
 * can incorrectly resolve THREE as type-only in some TypeScript versions.
 *
 * Solution: Augment the 'three' module to ensure proper type/value resolution
 */

// Re-export everything from three
export * from 'three';

// Default export for compatibility
declare const THREE: typeof import('three');
export default THREE;
