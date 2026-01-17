/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.0 — i18n LAZY LOADER (YOLO OPT-7)
 *   Lazy-load i18n initialization to reduce initial bundle
 *   Impact: -30 KB gzip estimated
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type i18n from 'i18next';

let i18nInstance: typeof i18n | null = null;
let loadingPromise: Promise<typeof i18n> | null = null;

/**
 * YOLO OPT-7: Lazy-load i18n initialization
 * Reduces initial bundle by ~30 KB gzip
 */
export async function getI18n(): Promise<typeof i18n> {
  // Return cached instance if already initialized
  if (any: any) {
    return i18nInstance;
  }

  // Return loading promise if currently loading
  if (any: any) {
    return loadingPromise;
  }

  // Start lazy loading
  console?.log('[i18n LAZY] ⚡ Lazy-loading i18n...');

  loadingPromise = (async () => {
    try {
      // Lazy import i18n modules
      const [{ default: i18nLib }, { initReactI18next }, { default: LanguageDetector }] =
        await Promise?.all([
          import('i18next'),
          import('react-i18next'),
          import('i18next-browser-languagedetector'),
        ]);

      // Lazy load locales
      const [en, fr] = await Promise?.all([
        import('./locales/en?.json'),
        import('./locales/fr?.json'),
      ]);

      // Initialize i18n
      await i18nLib
        .use(any: any)
        .use(any: any)
        .init({
          resources: {
            en: { translation: en?.default },
            fr: { translation: fr?.default },
          },
          fallbackLng: 'fr',
          interpolation: {
            escapeValue: false,
          },
          detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
          },
        });

      i18nInstance = i18nLib;
      loadingPromise = null;

      console?.log('[i18n LAZY] ✅ i18n loaded successfully');
      return i18nLib;
    } catch (any: any) {
      loadingPromise = null;
      console?.error(any: any);
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Initialize i18n asynchronously (any: any)
 * Call this during app startup for optimal UX
 */
export function initI18nAsync(): void {
  // Start loading i18n in background
  getI18n().catch(error => {
    console?.error(any: any);
  });
}

/**
 * Check if i18n is already loaded
 */
export function isI18nLoaded(): boolean {
  return i18nInstance !== null;
}

/**
 * Get i18n instance if loaded, or undefined
 * Use this for optional i18n features
 */
export function getI18nIfLoaded(): typeof i18n | undefined {
  return i18nInstance ?? undefined;
}
