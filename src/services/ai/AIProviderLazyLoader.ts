/**
 * TITANE∞ v37.0.0 — Proprietary License
 * © 2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * ═══════════════════════════════════════════════════════════════════
 *   AI PROVIDER LAZY LOADER
 *   Dynamic imports for cloud AI providers (OpenAI, Claude, Gemini, Copilot)
 *   Impact: -100 KB bundle, FCP -80-120ms
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider } from './types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AIProviderLazyLoader');

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type LazyProviderName = 'openai' | 'claude' | 'gemini' | 'copilot';

interface ProviderModule {
  default?: AIProvider;
  openaiProvider?: AIProvider;
  claudeProvider?: AIProvider;
  geminiProvider?: AIProvider;
  copilotProvider?: AIProvider;
}

// ═══════════════════════════════════════════════════════════════════
// LAZY LOADERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Load OpenAI provider dynamically
 * Size: ~25 KB gzip
 */
export const loadOpenAIProvider = async (): Promise<AIProvider> => {
  logger.debug('Loading OpenAI provider...');
  const start = performance.now();
  
  try {
    const module = await import('./providers/openai') as ProviderModule;
    const provider = module.openaiProvider || module.default;
    
    if (!provider) {
      throw new Error('OpenAI provider not found in module');
    }
    
    const duration = performance.now() - start;
    logger.info(`OpenAI provider loaded in ${duration.toFixed(2)}ms`);
    
    return provider;
  } catch (error) {
    logger.error('Failed to load OpenAI provider:', error);
    throw error;
  }
};

/**
 * Load Claude provider dynamically
 * Size: ~23 KB gzip
 */
export const loadClaudeProvider = async (): Promise<AIProvider> => {
  logger.debug('Loading Claude provider...');
  const start = performance.now();
  
  try {
    const module = await import('./providers/claude') as ProviderModule;
    const provider = module.claudeProvider || module.default;
    
    if (!provider) {
      throw new Error('Claude provider not found in module');
    }
    
    const duration = performance.now() - start;
    logger.info(`Claude provider loaded in ${duration.toFixed(2)}ms`);
    
    return provider;
  } catch (error) {
    logger.error('Failed to load Claude provider:', error);
    throw error;
  }
};

/**
 * Load Gemini provider dynamically
 * Size: ~28 KB gzip
 */
export const loadGeminiProvider = async (): Promise<AIProvider> => {
  logger.debug('Loading Gemini provider...');
  const start = performance.now();
  
  try {
    const module = await import('./providers/gemini') as ProviderModule;
    const provider = module.geminiProvider || module.default;
    
    if (!provider) {
      throw new Error('Gemini provider not found in module');
    }
    
    const duration = performance.now() - start;
    logger.info(`Gemini provider loaded in ${duration.toFixed(2)}ms`);
    
    return provider;
  } catch (error) {
    logger.error('Failed to load Gemini provider:', error);
    throw error;
  }
};

/**
 * Load Copilot provider dynamically
 * Size: ~24 KB gzip
 */
export const loadCopilotProvider = async (): Promise<AIProvider> => {
  logger.debug('Loading Copilot provider...');
  const start = performance.now();
  
  try {
    const module = await import('./providers/copilot') as ProviderModule;
    const provider = module.copilotProvider || module.default;
    
    if (!provider) {
      throw new Error('Copilot provider not found in module');
    }
    
    const duration = performance.now() - start;
    logger.info(`Copilot provider loaded in ${duration.toFixed(2)}ms`);
    
    return provider;
  } catch (error) {
    logger.error('Failed to load Copilot provider:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// PROVIDER LOADER MAP
// ═══════════════════════════════════════════════════════════════════

/**
 * Centralized map of provider loaders
 * Used by orchestrator for dynamic loading
 */
export const PROVIDER_LOADERS: Record<LazyProviderName, () => Promise<AIProvider>> = {
  openai: loadOpenAIProvider,
  claude: loadClaudeProvider,
  gemini: loadGeminiProvider,
  copilot: loadCopilotProvider,
};

// ═══════════════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Cached provider instances (singleton pattern)
 * Prevents re-loading same provider multiple times
 */
const providerCache = new Map<LazyProviderName, AIProvider>();

/**
 * Get or load provider with caching
 * Returns cached instance if available, loads otherwise
 */
export const getOrLoadProvider = async (name: LazyProviderName): Promise<AIProvider> => {
  // Check cache first
  const cached = providerCache.get(name);
  if (cached) {
    logger.debug(`Using cached ${name} provider`);
    return cached;
  }
  
  // Load and cache
  const loader = PROVIDER_LOADERS[name];
  if (!loader) {
    throw new Error(`Unknown provider: ${name}`);
  }
  
  const provider = await loader();
  providerCache.set(name, provider);
  
  return provider;
};

/**
 * Preload provider (for anticipation/hover optimization)
 * Non-blocking, returns void
 */
export const preloadProvider = (name: LazyProviderName): void => {
  // Check if already cached
  if (providerCache.has(name)) {
    logger.debug(`Provider ${name} already preloaded`);
    return;
  }
  
  // Start async load (non-blocking)
  getOrLoadProvider(name).catch((error) => {
    logger.warn(`Failed to preload ${name} provider:`, error);
  });
};

/**
 * Clear provider cache (for testing/debugging)
 */
export const clearProviderCache = (): void => {
  providerCache.clear();
  logger.info('Provider cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: providerCache.size,
    providers: Array.from(providerCache.keys()),
  };
};
