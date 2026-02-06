/**
 * TITANE∞ — GStreamer Availability Check
 * Détecte si GStreamer est disponible sur le système
 */

import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';

let gstreamerStatus: 'available' | 'unavailable' | 'unknown' = 'unknown';
let checkPromise: Promise<boolean> | null = null;

/**
 * Vérifie la disponibilité de GStreamer en Tauri
 * En production, utilise un appel Tauri léger pour détecter les dépendances manquantes
 */
async function checkGStreamerAvailability(): Promise<boolean> {
  if (checkPromise) {
    return checkPromise;
  }

  const env = detectEnvironment();
  if (!env.isTauri) {
    // En browser, GStreamer n'est pas géré par WebKit
    gstreamerStatus = 'unknown';
    return false;
  }

  checkPromise = (async () => {
    try {
      // Appel léger pour vérifier backend health
      // Si backend est up mais audio échoue, c'est GStreamer
      const response = await secureInvoke<{ gstreamer_available?: boolean }>(
        'get_system_health',
        {}
      );

      if (
        response &&
        typeof response === 'object' &&
        'gstreamer_available' in response
      ) {
        gstreamerStatus = response.gstreamer_available ? 'available' : 'unavailable';
        return response.gstreamer_available === true;
      }

      // Fallback: assume unavailable si pas d'info
      gstreamerStatus = 'unavailable';
      return false;
    } catch (error) {
      console.warn('[GStreamerCheck] Failed to detect GStreamer:', error);
      gstreamerStatus = 'unavailable';
      return false;
    }
  })();

  return checkPromise;
}

/**
 * Récupère le statut sans blocage
 */
function getGStreamerStatus(): 'available' | 'unavailable' | 'unknown' {
  return gstreamerStatus;
}

/**
 * Marque GStreamer comme indisponible (appelé lors de GLib-GObject-CRITICAL)
 */
function markGStreamerUnavailable(): void {
  gstreamerStatus = 'unavailable';
  console.warn(
    '[GStreamerCheck] GStreamer marked unavailable due to runtime errors'
  );
}

export const gstreamerCheck = {
  checkGStreamerAvailability,
  getGStreamerStatus,
  markGStreamerUnavailable,
};
