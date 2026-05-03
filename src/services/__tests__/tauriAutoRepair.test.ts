/**
 * TITANE∞ — tauriAutoRepair unit tests (Rule 16 coverage)
 *
 * Validates: TauriAutoRepairEngine class instantiation, singleton export,
 * and interface shape without invoking real Tauri IPC.
 */
import { describe, it, expect, vi } from 'vitest';

// ── Mock all Tauri IPC dependencies ──────────────────────────────
vi.mock('@/utils/tauriCommandMapper', () => ({
  mappedInvoke: vi.fn(),
  scanAvailableCommands: vi
    .fn()
    .mockResolvedValue({ singularity: [], memory: [], helios: [], integrity: [] }),
  repairSingularityState: vi.fn().mockResolvedValue({}),
  calculateTitaneAlignment: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn().mockResolvedValue({ ok: true, content: null, error: null }),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// ── Import after mocks ────────────────────────────────────────────
import { TauriAutoRepairEngine, tauriAutoRepair } from '../tauriAutoRepair';

describe('TauriAutoRepairEngine', () => {
  it('should export TauriAutoRepairEngine class', () => {
    expect(TauriAutoRepairEngine).toBeDefined();
    expect(typeof TauriAutoRepairEngine).toBe('function');
  });

  it('should instantiate without throwing', () => {
    expect(() => new TauriAutoRepairEngine()).not.toThrow();
  });

  it('exports singleton tauriAutoRepair instance', () => {
    expect(tauriAutoRepair).toBeDefined();
    expect(tauriAutoRepair).toBeInstanceOf(TauriAutoRepairEngine);
  });

  it('singleton has phase1_diagnostic method', () => {
    expect(typeof tauriAutoRepair.phase1_diagnostic).toBe('function');
  });
});
