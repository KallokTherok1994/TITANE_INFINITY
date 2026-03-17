/**
 * Tests for useProductionHealthTelemetry hook
 * Coverage: error classification, fallback detection, TauriError message extraction
 *
 * Targeted tests for the PARSER_ERROR → SOURCE_UNAVAILABLE misclassification fix.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock tauriClient
vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    readProductionWeek1Csv: vi.fn(),
  },
}));

import { useProductionHealthTelemetry } from '../useProductionHealthTelemetry';
import { tauriClient } from '@/lib/tauriClient';

const mockReadCsv = vi.mocked(tauriClient.readProductionWeek1Csv);

const VALID_SUMMARY = {
  status: 'GREEN',
  windowStartIso: '2026-01-01T00:00:00Z',
  windowEndIso: '2026-01-07T00:00:00Z',
  initialRssMb: 180,
  growthMb: 12,
  growthPercent: 6.7,
  samplesCollected: 5,
  lastSample: {
    timestamp: '2026-01-07T12:00:00Z',
    rssInitialMb: 180,
    rssCurrentMb: 192,
  },
};

describe('useProductionHealthTelemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ────────────────────────────────────────────────────────────
  // SUCCESS PATH
  // ────────────────────────────────────────────────────────────
  it('sets data on valid ProductionHealthSummary response', async () => {
    mockReadCsv.mockResolvedValueOnce(VALID_SUMMARY);

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(VALID_SUMMARY);
    expect(result.current.error).toBeNull();
    expect(result.current.errorKind).toBeNull();
  });

  // ────────────────────────────────────────────────────────────
  // FALLBACK DETECTION (primary fix: was PARSER_ERROR, must be SOURCE_UNAVAILABLE)
  // ────────────────────────────────────────────────────────────
  it('classifies tauriProtector fallback {ok:false} envelope as SOURCE_UNAVAILABLE (not PARSER_ERROR)', async () => {
    mockReadCsv.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: {
        message:
          'SOURCE_UNAVAILABLE: Tauri runtime non disponible — Tauri not available (cached)',
      },
      fallback: true,
    });

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.errorKind).toBe('SOURCE_UNAVAILABLE');
    // Must NOT be PARSER_ERROR
    expect(result.current.errorKind).not.toBe('PARSER_ERROR');
  });

  // ────────────────────────────────────────────────────────────
  // PLAIN TAURIERROR OBJECT (was "[object Object]" → UNKNOWN_ERROR)
  // ────────────────────────────────────────────────────────────
  it('extracts message from plain TauriError object (not instanceof Error)', async () => {
    // TauriClient.normalizeError throws a plain object, not an Error instance
    const tauriError = {
      code: 'TAURI_ERROR',
      message: 'SOURCE_UNAVAILABLE: /tmp/titane_production_week1.csv absent',
      command: 'read_production_week1_csv',
      timestamp: Date.now(),
    };
    mockReadCsv.mockRejectedValueOnce(tauriError);

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.errorKind).toBe('SOURCE_UNAVAILABLE');
    // Message must NOT be "[object Object]"
    expect(result.current.error).not.toBe('[object Object]');
  });

  // ────────────────────────────────────────────────────────────
  // SOURCE_EMPTY
  // ────────────────────────────────────────────────────────────
  it('classifies SOURCE_EMPTY error correctly', async () => {
    mockReadCsv.mockRejectedValueOnce(
      new Error('SOURCE_EMPTY: CSV sans données — en attente de collecte')
    );

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.errorKind).toBe('SOURCE_EMPTY');
  });

  // ────────────────────────────────────────────────────────────
  // PARSER_ERROR (real CSV parse failure)
  // ────────────────────────────────────────────────────────────
  it('classifies real CSV parse failure as PARSER_ERROR', async () => {
    mockReadCsv.mockRejectedValueOnce(
      new Error('PARSER_ERROR: colonne rss_initial_mb non numérique')
    );

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.errorKind).toBe('PARSER_ERROR');
  });

  // ────────────────────────────────────────────────────────────
  // SCHEMA_DRIFT
  // ────────────────────────────────────────────────────────────
  it('classifies SCHEMA_DRIFT delimiter mismatch error', async () => {
    mockReadCsv.mockRejectedValueOnce(
      new Error("SCHEMA_DRIFT: délimiteur inattendu ';' détecté dans l'en-tête CSV")
    );

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.errorKind).toBe('SCHEMA_DRIFT');
  });

  // ────────────────────────────────────────────────────────────
  // NO FAKE HEALTH: invalid payload must NOT produce data
  // ────────────────────────────────────────────────────────────
  it('does NOT set data when response is a fallback generic object (no ok envelope)', async () => {
    // Old behavior: { success: false, fallback: true } — must not leak as healthy data
    mockReadCsv.mockResolvedValueOnce({
      success: false,
      fallback: true,
      error: 'Tauri not available',
      timestamp: Date.now(),
    });

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.isHealthy).toBe(false);
  });

  // ────────────────────────────────────────────────────────────
  // RETRY ACTION: refresh clears stale error state then reloads
  // ────────────────────────────────────────────────────────────
  it('retry clears error then sets new data on success', async () => {
    mockReadCsv
      .mockRejectedValueOnce(new Error('SOURCE_UNAVAILABLE: absent'))
      .mockResolvedValueOnce(VALID_SUMMARY);

    const { result } = renderHook(() =>
      useProductionHealthTelemetry({ autoRefresh: false })
    );

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errorKind).toBe('SOURCE_UNAVAILABLE');

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(VALID_SUMMARY);
    expect(result.current.errorKind).toBeNull();
  });
});
