/**
 * TITANE∞ v19.1.0 - DiagnosticPanel Test
 * Test d'intégration du système de diagnostics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runAllTests,
  getSystemDiagnostic,
  exportTestResults,
  saveTestResults,
  loadLastTestResults,
  type ModuleSelfTestResult,
} from '../../services/selftest/systemSelfTest';

describe('DiagnosticPanel Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should run all tests successfully', async () => {
    const results = await runAllTests();

    // Verify structure
    expect(results).toBeDefined();
    expect(results.timestamp).toBeGreaterThan(0);
    expect(results.totalLatency_ms).toBeGreaterThanOrEqual(0);
    expect(results.modulesCount).toBe(3);
    expect(results.modules).toBeDefined();
    expect(results.summary).toBeDefined();

    // Verify modules
    expect(results.modules.tts).toBeDefined();
    expect(results.modules.fileImport).toBeDefined();
    expect(results.modules.xp).toBeDefined();

    // Verify summary counts
    const totalModules =
      results.summary.ok +
      results.summary.warn +
      results.summary.error +
      results.summary.skip;
    expect(totalModules).toBe(3);

    console.log('Test Results:', JSON.stringify(results, null, 2));
  }, 10000);

  it('should get quick system diagnostic', async () => {
    const diagnostic = await getSystemDiagnostic();

    expect(diagnostic).toBeDefined();
    expect(diagnostic.status).toMatch(/ok|warn|error/);
    expect(diagnostic.message).toBeDefined();
    expect(typeof diagnostic.message).toBe('string');

    console.log('Quick Diagnostic:', diagnostic);
  });

  it('should export test results as JSON', async () => {
    const results = await runAllTests();
    const json = exportTestResults(results);

    expect(json).toBeDefined();
    expect(typeof json).toBe('string');

    // Verify JSON is valid
    const parsed = JSON.parse(json);
    expect(parsed.timestamp).toBe(results.timestamp);
    expect(parsed.modulesCount).toBe(results.modulesCount);
  });

  it('should save and load test results from localStorage', async () => {
    const results = await runAllTests();

    // Save
    saveTestResults(results);

    // Verify saved in localStorage
    const saved = localStorage.getItem('titane_selftest_last_run');
    expect(saved).toBeDefined();

    // Load
    const loaded = loadLastTestResults();
    expect(loaded).toBeDefined();
    expect(loaded?.timestamp).toBe(results.timestamp);
    expect(loaded?.modulesCount).toBe(results.modulesCount);
  });

  it('should return null if no previous test results', () => {
    const loaded = loadLastTestResults();
    expect(loaded).toBeNull();
  });

  it('should validate module status types', async () => {
    const results = await runAllTests();

    for (const module of Object.values(results.modules) as ModuleSelfTestResult[]) {
      expect(['ok', 'warn', 'error', 'skip']).toContain(module.status);
      expect(typeof module.name).toBe('string');
      expect(typeof module.available).toBe('boolean');
      expect(typeof module.latency_ms).toBe('number');
      expect(module.latency_ms).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have reasonable latencies', async () => {
    const results = await runAllTests();

    // Total latency should be under 5 seconds
    expect(results.totalLatency_ms).toBeLessThan(5000);

    // Each module should be under 2 seconds
    for (const module of Object.values(results.modules) as ModuleSelfTestResult[]) {
      expect(module.latency_ms).toBeLessThan(2000);
    }
  });
});
