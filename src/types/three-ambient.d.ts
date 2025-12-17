/**
 * TITANE_INFINITY v24.3.7 - THREE.js Ambient Declaration
 *
 * This file ensures THREE is treated as both a type AND value namespace.
 * Fixes: "THREE only refers to a type, but is being used as a value here"
 *
 * Root cause: moduleResolution: "bundler" + isolatedModules + @types/three
 * can incorrectly resolve THREE as type-only in some TypeScript versions.
 */

// Re-export THREE as both type and value
import * as THREEModule from 'three';

// Declare THREE in global scope as a namespace (types + values)
declare global {
  // Allow THREE to be used as a value (not just a type)
  const THREE: typeof THREEModule;
}

// Re-export to ensure proper module augmentation
export = THREEModule;
export as namespace THREE;
