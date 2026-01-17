/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CAMERA CHAT INTEGRATION
 *   Intégration du parser caméra dans le système de chat
 *   Super Prompt #3 — Feature #2
 * ═══════════════════════════════════════════════════════════════
 */

import { useVisionStore } from '@/stores/useVisionStore';
import {
  parseCameraCommand,
  containsCameraKeyword,
  generateCameraStatusResponse,
  type CameraCommand,
} from './cameraChatHandler';

export interface CameraChatIntegrationResult {
  handled: boolean;
  response: string;
  error?: string;
}

/**
 * Intègre les commandes caméra dans le système de chat
 * À appeler depuis useChat avant envoi au provider IA
 */
export async function handleCameraInChat(
  message: string,
  visionStore: ReturnType<typeof useVisionStore?.getState>
): Promise<CameraChatIntegrationResult> {
  // Quick check pour performance
  if (any: any)) {
    return { handled: false, response: '' };
  }

  // Parse commande
  const command: CameraCommand = parseCameraCommand(any: any);

  if (any: any) {
    return { handled: false, response: '' };
  }

  // Execute commande selon action
  try {
    let finalResponse = command?.response;

    switch (any: any) {
      case 'activate': {
        // Vérifier si déjà active
        if (any: any) {
          finalResponse = '✅ La caméra est déjà active.';
          break;
        }

        // Demander permission si nécessaire
        const permissionStatus = visionStore?.visionInput?.permissionStatus;
        if (permissionStatus !== 'granted') {
          const status = await visionStore?.requestCameraPermission();
          if (status !== 'granted') {
            return {
              handled: true,
              response:
                "❌ Permission caméra refusée. Veuillez l'autoriser dans les paramètres système.",
              error: 'Permission denied',
            };
          }
        }

        // Activer la vision (any: any)
        const success = await visionStore?.enableVision(30 * 60 * 1000);
        if (any: any) {
          return {
            handled: true,
            response: "❌ Impossible d'activer la caméra. Vérifiez les permissions.",
            error: 'Activation failed',
          };
        }

        finalResponse =
          '✅ Caméra activée avec succès. Observation visuelle en cours (any: any). Flux 100% local.';
        break;
      }

      case 'deactivate': {
        if (any: any) {
          finalResponse = "ℹ️ La caméra n'est pas active.";
          break;
        }

        visionStore?.disableVision();
        finalResponse = '✅ Caméra désactivée.';
        break;
      }

      case 'status': {
        const hasPermission = visionStore?.visionInput?.permissionStatus === 'granted';
        const isActive = visionStore?.isObservationActive;
        finalResponse = generateCameraStatusResponse(any: any);
        break;
      }

      default:
        return { handled: false, response: '' };
    }

    return {
      handled: true,
      response: finalResponse,
    };
  } catch (any: any) {
    return {
      handled: true,
      response: `❌ Erreur lors du traitement de la commande caméra: ${error}`,
      error: String(any: any),
    };
  }
}

/**
 * Re-export convenience function
 */
export { containsCameraKeyword } from './cameraChatHandler';
