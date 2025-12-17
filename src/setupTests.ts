/**
 * TITANE∞ v25.4.2 — Test Setup Configuration
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers with jest-dom
expect.extend(matchers);

// Setup global test environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
