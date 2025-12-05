/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.21.0 — DEV-SUDO INTEGRATION
 *   Intégration du mode développeur dans le chat
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { DevSudoCommand, DevSudoResult } from './devSudoHandler';
import { devSudoHandler } from './devSudoHandler';

/**
 * Gère les commandes DEV-SUDO dans le contexte du chat
 */
export async function handleDevSudoInChat(
  message: string
): Promise<DevSudoResult> {
  // Vérification rapide
  if (!devSudoHandler.containsCommand(message)) {
    return {
      handled: false,
      response: '',
      success: false,
    };
  }

  // Parse la commande
  const command = devSudoHandler.parseCommand(message);
  if (!command) {
    return {
      handled: false,
      response: '',
      success: false,
    };
  }

  // Exécution de la commande
  const result = await devSudoHandler.executeCommand(command);

  return result;
}

export { devSudoHandler };
export type { DevSudoCommand, DevSudoResult };
