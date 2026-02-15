/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — MEMORY SELF-HEAL ENGINE TESTS (Phase 9)
 *   Tests unitaires pour Memory Self-Heal Engine (Phase 5)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemorySelfHealEngine } from '@/services/memory/memorySelfHealEngine';
import type {
  MemoryCorruption as _MemoryCorruption,
  MemoryHealthReport as _MemoryHealthReport,
} from '@/services/memory/memorySelfHealEngine';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Memory Self-Heal Engine — Health Checks
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Memory Self-Heal Engine — Health Checks (Phase 9)', () => {
  let engine: MemorySelfHealEngine;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    engine = new MemorySelfHealEngine({
      autoRepairEnabled: false, // Disable auto-repair for manual testing
      backupBeforeRepair: true,
    });
  });

  afterEach(() => {
    engine.stopAutoMonitoring();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Health Check on Empty Storage
   * ─────────────────────────────────────────────────────────────────
   */
  it('should return healthy report on empty storage', async () => {
    const report = await engine.checkHealth();

    expect(report.healthy).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.corruptions).toHaveLength(0);
    expect(report.layers.localStorage.healthy).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Detect Valid TITANE Keys
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect valid TITANE keys in localStorage', async () => {
    localStorage.setItem('titane_chat_mode_default', JSON.stringify({ messages: [] }));
    localStorage.setItem('TITANE_settings', JSON.stringify({ theme: 'dark' }));
    localStorage.setItem('omega_state', JSON.stringify({ phase: 1 }));

    const report = await engine.checkHealth();

    expect(report.layers.localStorage.itemCount).toBe(3);
    expect(report.layers.localStorage.healthy).toBe(true);
    expect(report.corruptions).toHaveLength(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Detect Corrupted JSON
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect corrupted JSON in localStorage', async () => {
    localStorage.setItem('titane_chat_mode_default', '{broken json');

    const report = await engine.checkHealth();

    expect(report.healthy).toBe(false);
    expect(report.corruptions.length).toBeGreaterThan(0);
    const firstCorruption = report.corruptions[0];
    expect(firstCorruption).toBeDefined();
    expect(firstCorruption?.type).toBe('parse-error');
    expect(firstCorruption?.layer).toBe('localStorage');
    expect(firstCorruption?.severity).toBe('high');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Detect Invalid Format
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect invalid format in localStorage', async () => {
    localStorage.setItem('titane_chat_mode_default', JSON.stringify('not an object'));

    const report = await engine.checkHealth();

    expect(report.healthy).toBe(false);
    expect(report.corruptions.length).toBeGreaterThan(0);
    const firstCorruption = report.corruptions[0];
    expect(firstCorruption).toBeDefined();
    expect(firstCorruption?.type).toBe('invalid-format');
    expect(firstCorruption?.layer).toBe('localStorage');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: Detect Quota Issues
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect quota issues when storage is large', async () => {
    // Simulate large storage (>4 MB)
    const largeData = 'x'.repeat(5 * 1024 * 1024); // 5 MB
    localStorage.setItem('titane_large_data', largeData);

    const report = await engine.checkHealth();

    // Should detect quota warning
    expect(report.layers.localStorage.issues.length).toBeGreaterThan(0);
    const firstIssue = report.layers.localStorage.issues[0];
    expect(firstIssue).toBeDefined();
    expect(firstIssue).toContain('Storage size');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Health Score Calculation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should calculate health score correctly', async () => {
    // Add 1 corruption (should reduce score)
    localStorage.setItem('titane_corrupted', '{broken}');

    const report = await engine.checkHealth();

    expect(report.score).toBeLessThan(100);
    expect(report.score).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Compactor Health Check
   * ─────────────────────────────────────────────────────────────────
   */
  it('should check compactor health', async () => {
    // Simulate compactor data
    const compactorData = {
      messages: [
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi', timestamp: Date.now() },
      ],
    };
    localStorage.setItem('chat_memory_compactor_default', JSON.stringify(compactorData));

    const report = await engine.checkHealth();

    expect(report.layers.compactor.healthy).toBe(true);
    expect(report.layers.compactor.itemCount).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: Backend Health Check (Browser Mode)
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle backend health check in browser mode', async () => {
    const report = await engine.checkHealth();

    // Backend unavailable in browser mode is not an error
    expect(report.layers.backend.healthy).toBe(true);
    expect(report.layers.backend.itemCount).toBe(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 9: Multiple Corruptions Detection
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect multiple corruptions', async () => {
    localStorage.setItem('titane_corrupted1', '{broken1}');
    localStorage.setItem('titane_corrupted2', '{broken2}');
    localStorage.setItem('titane_corrupted3', JSON.stringify('invalid'));

    const report = await engine.checkHealth();

    expect(report.corruptions.length).toBeGreaterThanOrEqual(3);
    expect(report.healthy).toBe(false);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: Recommendations Generation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should generate recommendations based on health', async () => {
    const report = await engine.checkHealth();

    expect(report.recommendations).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Memory Self-Heal Engine — Repair
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Memory Self-Heal Engine — Repair (Phase 9)', () => {
  let engine: MemorySelfHealEngine;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    engine = new MemorySelfHealEngine({ autoRepairEnabled: false });
  });

  afterEach(() => {
    engine.stopAutoMonitoring();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 11: Repair Corrupted Keys
   * ─────────────────────────────────────────────────────────────────
   */
  it('should repair corrupted keys', async () => {
    localStorage.setItem('titane_corrupted', '{broken}');
    localStorage.setItem('titane_valid', JSON.stringify({ data: 'ok' }));

    const report = await engine.checkHealth();
    expect(report.corruptions.length).toBeGreaterThan(0);

    const results = await engine.repair();

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0];
    expect(firstResult).toBeDefined();
    expect(firstResult?.corruptionsFixed).toBeGreaterThan(0);
    expect(localStorage.getItem('titane_corrupted')).toBeNull();
    expect(localStorage.getItem('titane_valid')).not.toBeNull();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 12: Backup Before Repair
   * ─────────────────────────────────────────────────────────────────
   */
  it('should create backup before repair', async () => {
    localStorage.setItem('titane_data', JSON.stringify({ important: 'data' }));
    localStorage.setItem('titane_corrupted', '{broken}');

    await engine.repair();

    const backup = sessionStorage.getItem('__titane_memory_backup__');
    expect(backup).not.toBeNull();

    if (backup) {
      const backupData = JSON.parse(backup);
      expect(backupData.data['titane_data']).toBeDefined();
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 13: Cleanup Old Data
   * ─────────────────────────────────────────────────────────────────
   */
  it('should cleanup old data to free quota', async () => {
    // Create old data (>30 days)
    const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
    const oldData = { timestamp: oldTimestamp, data: 'old' };
    localStorage.setItem('titane_old', JSON.stringify(oldData));

    // Create recent data
    const recentData = { timestamp: Date.now(), data: 'recent' };
    localStorage.setItem('titane_recent', JSON.stringify(recentData));

    // Simulate quota issue
    localStorage.setItem('titane_large', 'x'.repeat(5 * 1024 * 1024));

    const report = await engine.checkHealth();
    const quotaCorruption = report.corruptions.find(c => c.type === 'quota-exceeded');

    if (quotaCorruption) {
      const results = await engine.repair();
      expect(
        results.some(r => r.actionsPerformed.some(a => a.includes('old entries')))
      ).toBe(true);
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 14: Repair Compactor Invalid Messages
   * ─────────────────────────────────────────────────────────────────
   */
  it('should repair compactor with invalid messages', async () => {
    const invalidCompactorData = {
      messages: [
        { role: 'user', content: 'Valid', timestamp: Date.now() },
        { role: 'assistant' }, // Missing content
        { content: 'Missing role', timestamp: Date.now() }, // Missing role
        { role: 'user', content: 'Valid 2', timestamp: Date.now() },
      ],
    };

    localStorage.setItem(
      'chat_memory_compactor_default',
      JSON.stringify(invalidCompactorData)
    );

    const report = await engine.checkHealth();
    const compactorCorruptions = report.corruptions.filter(c => c.layer === 'compactor');

    if (compactorCorruptions.length > 0) {
      const results = await engine.repair();
      expect(results.some(r => r.layer === 'compactor')).toBe(true);
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 15: Repair Result Structure
   * ─────────────────────────────────────────────────────────────────
   */
  it('should return correct repair result structure', async () => {
    localStorage.setItem('titane_corrupted', '{broken}');

    const results = await engine.repair();

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('success');
    expect(results[0]).toHaveProperty('layer');
    expect(results[0]).toHaveProperty('corruptionsFixed');
    expect(results[0]).toHaveProperty('actionsPerformed');
    expect(results[0]).toHaveProperty('dataLost');
    expect(results[0]).toHaveProperty('timestamp');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 16: Repair with No Corruptions
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle repair with no corruptions', async () => {
    localStorage.setItem('titane_valid', JSON.stringify({ data: 'ok' }));

    const results = await engine.repair();

    expect(results).toHaveLength(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 17: Repair Multiple Layers
   * ─────────────────────────────────────────────────────────────────
   */
  it('should repair multiple layers', async () => {
    // localStorage corruption
    localStorage.setItem('titane_corrupted', '{broken}');

    // compactor corruption
    const invalidCompactorData = {
      messages: [{ role: 'user' }], // Missing content
    };
    localStorage.setItem(
      'chat_memory_compactor_default',
      JSON.stringify(invalidCompactorData)
    );

    const results = await engine.repair();

    const layers = new Set(results.map(r => r.layer));
    expect(layers.size).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 18: Verify Health After Repair
   * ─────────────────────────────────────────────────────────────────
   */
  it('should have improved health after repair', async () => {
    localStorage.setItem('titane_corrupted', '{broken}');

    const beforeReport = await engine.checkHealth();
    expect(beforeReport.healthy).toBe(false);

    await engine.repair();

    const afterReport = await engine.checkHealth();
    expect(afterReport.score).toBeGreaterThan(beforeReport.score);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Memory Self-Heal Engine — Auto-Monitoring
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Memory Self-Heal Engine — Auto-Monitoring (Phase 9)', () => {
  let engine: MemorySelfHealEngine;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine?.stopAutoMonitoring();
    vi.restoreAllMocks();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 19: Start Auto-Monitoring
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start auto-monitoring', async () => {
    engine = new MemorySelfHealEngine({
      autoRepairEnabled: true,
      healthCheckInterval: 1000,
      autoRepairInterval: 2000,
    });

    const checkHealthSpy = vi.spyOn(engine, 'checkHealth');

    engine.startAutoMonitoring();

    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000);

    expect(checkHealthSpy).toHaveBeenCalled();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 20: Stop Auto-Monitoring
   * ─────────────────────────────────────────────────────────────────
   */
  it('should stop auto-monitoring', async () => {
    engine = new MemorySelfHealEngine({
      autoRepairEnabled: true,
      healthCheckInterval: 1000,
    });

    const checkHealthSpy = vi.spyOn(engine, 'checkHealth');

    engine.startAutoMonitoring();
    await vi.advanceTimersByTimeAsync(1000);
    expect(checkHealthSpy).toHaveBeenCalledTimes(1);

    engine.stopAutoMonitoring();

    // Advance timer again
    await vi.advanceTimersByTimeAsync(1000);

    // Should not be called again
    expect(checkHealthSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 21: Auto-Repair on Critical Corruption
   * ─────────────────────────────────────────────────────────────────
   */
  it('should auto-repair on critical corruption', async () => {
    engine = new MemorySelfHealEngine({
      autoRepairEnabled: true,
      healthCheckInterval: 1000,
      autoRepairInterval: 2000,
    });

    const repairSpy = vi.spyOn(engine, 'repair');

    // Add critical corruption
    localStorage.setItem('titane_corrupted', '{broken}');

    engine.startAutoMonitoring();

    // Advance to trigger auto-repair
    await vi.advanceTimersByTimeAsync(2000);

    expect(repairSpy).toHaveBeenCalled();
  });
});
