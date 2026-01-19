/**
 * Tests unitaires pour advancedBootMonitor.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock des dépendances externes
vi.mock('../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../src/utils/bootRecoverySystem', () => ({
  titaneBootRecovery: {
    startIntelligentBoot: vi.fn(),
    getBootHistory: vi.fn(() => []),
    getBootStats: vi.fn(() => ({})),
  },
}));

describe('advancedBootMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export bootHealthMonitor instance', async () => {
    const { bootHealthMonitor } = await import('../../src/utils/advancedBootMonitor');
    expect(typeof bootHealthMonitor).toBe('object');
    expect(typeof bootHealthMonitor.startBootMonitoring).toBe('function');
    expect(typeof bootHealthMonitor.endBootMonitoring).toBe('function');
    expect(typeof bootHealthMonitor.recordLazyModuleFailure).toBe('function');
    expect(typeof bootHealthMonitor.recordLazyModuleSuccess).toBe('function');
  });

  it('should export integrateWithLazyDiagnostic function', async () => {
    const { integrateWithLazyDiagnostic } =
      await import('../../src/utils/advancedBootMonitor');
    expect(typeof integrateWithLazyDiagnostic).toBe('function');
  });
});
