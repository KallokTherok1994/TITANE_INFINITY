/**
 * TITANE∞ v25.4.2 — Test Setup Configuration
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';

// Setup global test environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
