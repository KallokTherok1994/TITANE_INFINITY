/**
 * Cache services index
 * Export centralisé des services de cache pour les optimisations de performance
 */

export {
  responseCache,
  ResponseCache,
  type CacheKey,
  type CacheEntry,
} from './responseCache';
export { predictivePreloader, PredictivePreloader } from './predictivePreloader';
export { cachePersistence, CachePersistence } from './cachePersistence';
