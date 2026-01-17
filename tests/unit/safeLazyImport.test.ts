/**
 * Tests unitaires pour safeLazyImport.ts
 */
import { describe, it, expect } from 'vitest';

describe('safeLazyImport', () => {
  it('should export safeLazyImport function', async () => {
    const { safeLazyImport } = await import('../../src/utils/safeLazyImport');
    expect(typeof safeLazyImport).toBe('function');
  });

  it('should export safeLazyImportWithRetry function', async () => {
    const { safeLazyImportWithRetry } = await import('../../src/utils/safeLazyImport');
    expect(typeof safeLazyImportWithRetry).toBe('function');
  });

  it('should export lazyImportDiagnostic object', async () => {
    const { lazyImportDiagnostic } = await import('../../src/utils/safeLazyImport');
    expect(typeof lazyImportDiagnostic).toBe('object');
    expect(typeof lazyImportDiagnostic.logStats).toBe('function');
  });
});
