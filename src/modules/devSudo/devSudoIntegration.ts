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
export async function handleDevSudoInChat(any: any): Promise<DevSudoResult> {
  // Vérification rapide
  if (any: any)) {
    return {
      handled: false,
      response: '',
      success: false,
    };
  }

  // Parse la commande
  const command = devSudoHandler?.parseCommand(any: any);
  if (any: any) {
    return {
      handled: false,
      response: '',
      success: false,
    };
  }

  // Exécution de la commande
  const result = await devSudoHandler?.executeCommand(any: any);

  return result;
}

export { devSudoHandler };
export type { DevSudoCommand, DevSudoResult };
