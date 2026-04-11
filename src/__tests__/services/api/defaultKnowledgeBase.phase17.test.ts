/**
 * TITANE∞ v30.0.0 — Tests Phase 17: defaultKnowledgeBase
 *
 * Validates:
 *   1. getCompactIndex() prepends [LANGUE: Réponds TOUJOURS en français] header
 *   2. All category lines start with '•' (no header line mixed in)
 *   3. Bullet-line count == entry count (not entry count + 1 header line)
 *   4. synchronisation_orchestration category is present in bundled fallback path
 *   5. resetCache() clears the language-header compact index
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeWithRetry } from '@/lib/serviceInvoker';
import {
  getAllEntries,
  getCompactIndex,
  resetCache,
} from '@/services/api/defaultKnowledgeBase';

vi.mock('@/lib/serviceInvoker', () => ({
  invokeWithRetry: vi.fn(),
  FAST_COMMAND_OPTIONS: {},
}));

const MOCK_TWO_ENTRIES = JSON.stringify({
  system_architecture: {
    id: 'system_architecture',
    category: 'system_architecture',
    version: 'v30.0.0',
    description: 'Architecture cœur TITANE∞ avec 4 rings et gouvernance One Door.',
    content: { architecture: { rings: 4 } },
  },
  synchronisation_orchestration: {
    id: 'synchronisation_orchestration',
    category: 'synchronisation_orchestration',
    version: 'v30.0.0',
    description:
      'Pipeline OMEGA, sélection provider, sync KB Rust/TS, mémoire STM/MTM/LTM, session, IPC One Door.',
    content: { pipeline: 'OMEGA 10 étapes', memory: ['STM', 'MTM', 'LTM'] },
  },
});

describe('defaultKnowledgeBase — Phase 17 French enforcement & bullet-line format', () => {
  const mockedInvokeWithRetry = vi.mocked(invokeWithRetry);

  beforeEach(() => {
    resetCache();
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Language header
  // ─────────────────────────────────────────────────────────────────────────

  it('getCompactIndex() starts with the [LANGUE] French enforcement header', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const index = await getCompactIndex();

    expect(index.startsWith('[LANGUE: Réponds TOUJOURS en français]')).toBe(true);
  });

  it('getCompactIndex() contains "français" in the language header (case check)', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const index = await getCompactIndex();
    const firstLine = index.split('\n')[0];

    expect(firstLine).toContain('français');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Bullet-line format: every category line starts with '•'
  // ─────────────────────────────────────────────────────────────────────────

  it('all non-header lines in the compact index start with "•"', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const index = await getCompactIndex();
    const lines = index.split('\n');
    const header = lines[0];
    const categoryLines = lines.slice(1).filter(l => l.length > 0);

    expect(header).toMatch(/^\[LANGUE:/);
    categoryLines.forEach(line => {
      expect(line.startsWith('•')).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Bullet-line count == entry count (header does NOT inflate the count)
  // ─────────────────────────────────────────────────────────────────────────

  it('bullet-line count equals the number of entries (not entries + 1 for the header)', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const [entries, index] = await Promise.all([getAllEntries(), getCompactIndex()]);
    const bulletLines = index.split('\n').filter(l => l.startsWith('•'));

    expect(bulletLines.length).toBe(entries.length);
    // Ensure the total line count (with header) is entries.length + 1
    const nonEmptyLines = index.split('\n').filter(l => l.length > 0);
    expect(nonEmptyLines.length).toBe(entries.length + 1);
  });

  it('split(newline).length is entries.length + 1, but bullet filter gives exactly entries.length', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const [entries, index] = await Promise.all([getAllEntries(), getCompactIndex()]);
    const splitTotal = index.split('\n').filter(l => l.length > 0).length;
    const bulletCount = index.split('\n').filter(l => l.startsWith('•')).length;

    // This is the core regression guard for the AH-105 fix:
    // Before fix: split('\n').length would return entries.length + 1 (overcounting the header)
    expect(splitTotal).toBe(entries.length + 1); // header + N category lines
    expect(bulletCount).toBe(entries.length); // N category lines only
    expect(bulletCount).toBe(splitTotal - 1); // regression-proof assertion
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. synchronisation_orchestration present in fallback (IPC failure path)
  // ─────────────────────────────────────────────────────────────────────────

  it('synchronisation_orchestration appears in the compact index when returned by IPC', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);

    const index = await getCompactIndex();

    expect(index).toContain('synchronisation_orchestration');
  });

  it('bundled fallback entries include system_architecture and memory_system_deep when IPC fails', async () => {
    mockedInvokeWithRetry.mockRejectedValueOnce(new Error('ipc unavailable'));

    const entries = await getAllEntries();
    const categories = entries.map(e => e.category);

    expect(categories).toContain('system_architecture');
    expect(categories).toContain('memory_system_deep');
    expect(entries.length).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. resetCache() resets the compact index (including the language header)
  // ─────────────────────────────────────────────────────────────────────────

  it('resetCache() causes the next getCompactIndex() call to re-fetch and re-prepend the header', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(MOCK_TWO_ENTRIES);
    const firstIndex = await getCompactIndex();
    expect(firstIndex.startsWith('[LANGUE:')).toBe(true);

    resetCache();

    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        memory_system_deep: {
          id: 'memory_system_deep',
          category: 'memory_system_deep',
          version: 'v30.0.0',
          description: 'Architecture mémoire STM/MTM/LTM.',
          content: { layers: ['session', 'intermediate', 'long_term'] },
        },
      })
    );
    const secondIndex = await getCompactIndex();

    expect(secondIndex.startsWith('[LANGUE:')).toBe(true);
    expect(secondIndex).not.toBe(firstIndex);
    expect(secondIndex).toContain('memory_system_deep');
    expect(secondIndex).not.toContain('synchronisation_orchestration');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. IPC returns empty object → entries empty → compact index is empty string
  // (no orphan [LANGUE] header without bullet content)
  // ─────────────────────────────────────────────────────────────────────────

  it('returns an empty string when IPC returns empty entries (no orphan [LANGUE] header)', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(JSON.stringify({}));

    const index = await getCompactIndex();

    // IPC succeeded but with empty result: entries = [] → compact index = ''
    expect(index).toBe('');
  });
});
