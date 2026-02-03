/**
 * TITANE∞ - TAURI INITIALIZATION FIX
 * Assure que Tauri est correctement injecté et disponible
 */

(function initTauriFixed() {
  // Force l'attente du chargement de Tauri avant le reste du code
  const maxWaitTime = 5000; // 5 secondes max
  const checkInterval = 100; // Vérifier toutes les 100ms
  const startTime = performance.now();

  function checkTauri() {
    const w = window as any;

    // Tauri v2 devrait injecter __TAURI__ globalement
    if (w.__TAURI__ && w.__TAURI__.core && w.__TAURI__.core.invoke) {
      console.log('✅ [TauriInit] Tauri detected and initialized');
      // ✅ SET INITIALIZATION FLAG for TauriProtector
      w.__TITANE_TAURI_INITIALIZED = true;
      window.dispatchEvent(new Event('tauri-ready'));
      return true;
    }

    // Vérifier aussi __TAURI_INTERNALS__
    if (w.__TAURI_INTERNALS__) {
      console.log('✅ [TauriInit] Tauri internals detected');
      // ✅ SET INITIALIZATION FLAG for TauriProtector
      w.__TITANE_TAURI_INITIALIZED = true;
      window.dispatchEvent(new Event('tauri-ready'));
      return true;
    }

    return false;
  }

  // 1. Vérifier si Tauri est déjà disponible
  if (checkTauri()) {
    return;
  }

  // 2. Attendre que Tauri soit injecté
  const waitForTauri = setInterval(() => {
    if (checkTauri()) {
      clearInterval(waitForTauri);
      return;
    }

    const elapsed = performance.now() - startTime;
    if (elapsed > maxWaitTime) {
      clearInterval(waitForTauri);
      console.warn('⚠️ [TauriInit] Tauri not initialized after 5 seconds');
      console.warn(
        'ℹ️ [TauriInit] Using fallback - make sure you are running in Tauri app'
      );
      window.dispatchEvent(new Event('tauri-not-available'));

      // Marquer que nous ne sommes probablement pas en Tauri
      const w = window as any;
      if (!w.__TITANE_NOT_TAURI__) {
        w.__TITANE_NOT_TAURI__ = true;
        console.info('💡 [TauriInit] Set __TITANE_NOT_TAURI__ flag');
      }
    }
  }, checkInterval);

  // 3. Émettre un événement au chargement
  console.log('🔄 [TauriInit] Waiting for Tauri initialization...');
  window.dispatchEvent(new Event('titane-init-check'));
})();
