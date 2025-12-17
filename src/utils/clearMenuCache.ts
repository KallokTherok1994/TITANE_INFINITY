/**
 * TITANE∞ v25.2.1 — Clear Menu Cache Utility
 * Force suppression du cache localStorage du menu
 */

export function clearMenuCache(): void {
  try {
    // Supprimer config menu
    localStorage.removeItem('titane_menu_config');

    // Supprimer autres caches possibles
    const keysToRemove = ['titane_menu_sections', 'menu_config', 'navigation_config'];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ Cache menu nettoyé - Rechargez la page');
  } catch (error) {
    console.error('❌ Erreur nettoyage cache menu:', error);
  }
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  (window as any).clearMenuCache = clearMenuCache;
}
