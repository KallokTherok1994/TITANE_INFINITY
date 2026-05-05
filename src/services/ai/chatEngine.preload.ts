/**
 * TITANE∞ — ChatEngine preload helpers
 *
 * Wrapper module used for predictive preloading.
 *
 * Important: This file exists to avoid dynamically importing `chatEngine.ts` directly,
 * because it is also statically imported elsewhere (Vite/Rollup warning).
 */

import { chatEngine } from './chatEngine';
import type { ChatMode } from './chatTypes';

const VALID_CHAT_MODES = new Set<string>([
  'default',
  'reflection',
  'creation',
  'strategy',
  'emergency',
  'standard',
  'quick',
  'omega',
  'dev-senior',
  'dev',
  'nexus-guide',
  'sentinel-guardian',
  'artisan-creator',
  'visionary-philosopher',
  'omega-meta',
  'brainstorming',
  'synthesis',
]);

function toChatMode(raw: string): ChatMode {
  return VALID_CHAT_MODES.has(raw) ? (raw as ChatMode) : 'default';
}

export async function warmChatEngineCache(params: {
  message: string;
  mode?: string;
}): Promise<void> {
  const rawMode =
    typeof params.mode === 'string' && params.mode.trim() ? params.mode : 'default';

  await chatEngine.generate(params.message, [], {
    mode: toChatMode(rawMode),
    performanceConfig: {
      enableCache: true,
      enablePredictive: false,
      cacheHitBonus: false,
    },
  });
}
