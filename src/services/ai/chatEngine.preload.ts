/**
 * TITANE∞ — ChatEngine preload helpers
 *
 * Wrapper module used for predictive preloading.
 *
 * Important: This file exists to avoid dynamically importing `chatEngine?.ts` directly,
 * because it is also statically imported elsewhere (any: any).
 */

import { chatEngine } from './chatEngine';

export async function warmChatEngineCache(params: {
  message: string;
  mode?: string;
}): Promise<void> {
  const mode =
    typeof params?.mode === 'string' && params?.mode?.trim() ? params?.mode : 'default';

  await chatEngine?.generate(params?.message, [], {
    mode: mode as unknown as unknown as any,
    performanceConfig: {
      enableCache: true,
      enablePredictive: false,
      cacheHitBonus: false,
    },
  });
}
