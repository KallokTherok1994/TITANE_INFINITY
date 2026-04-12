/**
 * TITANE_INFINITY P2_BUNDLE_OPTIMIZATION_CERT — Lazy Service Loaders
 *
 * Ring 3 (Services) lazy-loading module for on-demand service imports.
 * Reduces boot-time bundle by deferring non-critical services.
 *
 * Boot-critical services (imported directly in App.tsx):
 * - initializeOllama (ai/providers/ollama)
 * - consoleMonitor (monitoring/consoleMonitor)
 *
 * Lazy-loaded services (this module):
 * - Chat engine + orchestrator
 * - Voice services
 * - Memory + telemetry
 * - All others
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('LazyServices');

/**
 * @type Cache for loaded service modules (prevent re-imports)
 */
const moduleCache = new Map<string, unknown>();

/**
 * Load chat engine services (ai/chatEngine, orchestrator)
 * Chunk: services-ai (~500KB)
 * Called: On first chat input or ChatContext mount
 */
export async function getChatEngineServices() {
  if (moduleCache.has('chatEngine')) {
    return moduleCache.get('chatEngine');
  }
  // Dynamic import deferred until needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = await import('./ai/chatEngine');
  moduleCache.set('chatEngine', module);
  return module;
}

/**
 * Load AI orchestrator (handles multi-step reasoning)
 * Chunk: services-ai (~500KB)
 * Called: On first orchestration request
 */
export async function getAIOrchestrator() {
  if (moduleCache.has('orchestrator')) {
    return moduleCache.get('orchestrator');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = await import('./ai/orchestrator');
  moduleCache.set('orchestrator', module);
  return module;
}

/**
 * Load voice services (speech recognition + synthesis)
 * Chunk: services-voice (~350KB)
 * Called: On voice button toggle or voice context mount
 */
export async function getVoiceServices() {
  if (moduleCache.has('voice')) {
    return moduleCache.get('voice');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = await import('./voice/voiceRouter');
  moduleCache.set('voice', module);
  return module;
}

/**
 * Load memory management services (chat memory compactor, context mgmt)
 * Chunk: services-memory (~120KB)
 * Called: On admin panel or memory optimization trigger
 */
export async function getMemoryServices() {
  if (moduleCache.has('memory')) {
    return moduleCache.get('memory');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = await import('./chatMemoryCompactor');
  moduleCache.set('memory', module);
  return module;
}

/**
 * Load telemetry + metrics services (performance engine, reporters)
 * Chunk: services-telemetry (~150KB)
 * Called: On performance dashboard or telemetry panel
 */
export async function getTelemetryServices() {
  if (moduleCache.has('telemetry')) {
    return moduleCache.get('telemetry');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = await import('./performanceEngine');
  moduleCache.set('telemetry', module);
  return module;
}

/**
 * Preload hint for requestIdleCallback
 * Silently preload heavy services during idle time
 * Usage: useEffect(() => { preloadLazyServices(); }, []);
 */
export function preloadLazyServices() {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => {
        // Fire all preloads in parallel, log but tolerate errors
        Promise.all([
          getChatEngineServices().catch((err: unknown) => {
            logger.debug('Chat engine preload skipped', { error: String(err) });
          }),
          getAIOrchestrator().catch((err: unknown) => {
            logger.debug('AI orchestrator preload skipped', { error: String(err) });
          }),
        ]).catch((err: unknown) => {
          logger.debug('Lazy service preload batch failed', { error: String(err) });
        });
      },
      { timeout: 5000 }
    );
  }
}
