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
  visionStore: ReturnType<typeof useVisionStore.getState>,
): Promise<CameraChatIntegrationResult> {
  // Quick check pour performance
  if (!containsCameraKeyword(message)) {
    return { handled: false, response: '' };
  }

  // Parse commande
  const command: CameraCommand = parseCameraCommand(message);

  if (!command.handled) {
    return { handled: false, response: '' };
  }

  // Execute commande selon action
  try {
    let finalResponse = command.response;

    switch (command.action) {
      case 'activate': {
        // Vérifier si déjà active
        if (visionStore.isObservationActive) {
          finalResponse = '✅ La caméra est déjà active.';
          break;
        }

        // Demander permission si nécessaire
        const permissionStatus = visionStore.visionInput.permissionStatus;
        if (permissionStatus !== 'granted') {
          const status = await visionStore.requestCameraPermission();
          if (status !== 'granted') {
            return {
              handled: true,
              response: '❌ Permission caméra refusée. Veuillez l\'autoriser dans les paramètres système.',
              error: 'Permission denied',
            };
          }
        }

        // Activer la vision (30 minutes max par défaut)
        const success = await visionStore.enableVision(30 * 60 * 1000);
        if (!success) {
          return {
            handled: true,
            response: '❌ Impossible d\'activer la caméra. Vérifiez les permissions.',
            error: 'Activation failed',
          };
        }

        finalResponse = '✅ Caméra activée avec succès. Observation visuelle en cours (30 min max). Flux 100% local.';
        break;
      }

      case 'deactivate': {
        if (!visionStore.isObservationActive) {
          finalResponse = 'ℹ️ La caméra n\'est pas active.';
          break;
        }

        visionStore.disableVision();
        finalResponse = '✅ Caméra désactivée.';
        break;
      }

      case 'status': {
        const hasPermission = visionStore.visionInput.permissionStatus === 'granted';
        const isActive = visionStore.isObservationActive;
        finalResponse = generateCameraStatusResponse(isActive, hasPermission);
        break;
      }

      default:
        return { handled: false, response: '' };
    }

    return {
      handled: true,
      response: finalResponse,
    };
  } catch (error) {
    return {
      handled: true,
      response: `❌ Erreur lors du traitement de la commande caméra: ${error}`,
      error: String(error),
    };
  }
}

/**
 * Re-export convenience function
 */
export { containsCameraKeyword } from './cameraChatHandler';
