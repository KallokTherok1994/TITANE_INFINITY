/**
 * TITANE∞ — AI Singleton Cleanup Helper
 *
 * Stops long-lived intervals started by AI singletons so Vitest fork workers
 * can exit cleanly on Windows. Add `afterAll(() => cleanupAiSingletons())`
 * in any test file that imports AI service modules.
 */

import { vi } from 'vitest';

export async function cleanupAiSingletons(): Promise<void> {
  // Modules may not be loaded in all test contexts — silently skip if absent
  await import('@/services/cache/responseCache')
    .then(m => { (m.responseCache as { destroy?: () => void }).destroy?.(); })
    .catch(() => undefined);

  await import('@/services/ai/orchestrator')
    .then(m => { (m.aiOrchestrator as { destroy?: () => void }).destroy?.(); })
    .catch(() => undefined);

  await import('@/services/ai/healthMonitor')
    .then(m => { (m.aiHealthMonitor as { stopMonitoring?: () => void }).stopMonitoring?.(); })
    .catch(() => undefined);

  vi.clearAllTimers();
  vi.useRealTimers();
}
