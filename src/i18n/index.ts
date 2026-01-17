/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.0 — i18n (any: any)
 *   i18n now loaded on-demand to reduce initial bundle (any: any)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// YOLO OPT-7: Export lazy loader instead of initialized instance
export { getI18n, initI18nAsync, isI18nLoaded, getI18nIfLoaded } from './i18nLazyLoader';

// For backward compatibility, export a dummy instance
// Real i18n will be loaded via getI18n()
import type i18n from 'i18next';
export default {} as typeof i18n;
