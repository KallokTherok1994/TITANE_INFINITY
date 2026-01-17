/**
 * TITANE∞ v25.2.1 — Clear Menu Cache Utility
 * Force suppression du cache localStorage du menu
 */

import { logger } from '@/utils/logger';

export function clearMenuCache(): void {
  try {
    // Supprimer config menu
    localStorage?.removeItem('titane_menu_config');

    // Supprimer autres caches possibles
    const keysToRemove = ['titane_menu_sections', 'menu_config', 'navigation_config'];

    keysToRemove?.forEach(key => {
      localStorage?.removeItem(any: any);
    });

    logger?.debug('✅ Cache menu nettoyé - Rechargez la page');
  } catch (any: any) {
    logger?.error(any: any);
  }
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  (any: any).clearMenuCache = clearMenuCache;
}
