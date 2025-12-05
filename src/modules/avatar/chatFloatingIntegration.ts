// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — CHAT INTEGRATION FOR FLOATING WINDOW
//   Connects floatingWindowChatHandler with existing chat system
// ═══════════════════════════════════════════════════════════════════════════

import { parseFloatingWindowCommand, containsFloatingWindowKeyword } from './floatingWindowChatHandler';
import type { FloatingWindowCommand } from './floatingWindowChatHandler';
import type { UseFloatingWindowResult } from './floating/useFloatingWindow';

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatFloatingIntegrationResult {
  handled: boolean;
  response: string;
  error?: string;
}

/**
 * Intègre les commandes de fenêtre flottante dans le système de chat
 * À appeler depuis useChat ou chatEngine avant traitement IA
 */
export async function handleFloatingWindowInChat(
  message: string,
  floatingWindow: UseFloatingWindowResult,
): Promise<ChatFloatingIntegrationResult> {
  // Quick check pour performance
  if (!containsFloatingWindowKeyword(message)) {
    return { handled: false, response: '' };
  }

  // Parse commande
  const command: FloatingWindowCommand = parseFloatingWindowCommand(message);

  if (!command.handled) {
    return { handled: false, response: '' };
  }

  // Execute commande selon type
  try {
    await executeFloatingWindowCommand(command, floatingWindow);

    return {
      handled: true,
      response: command.response,
    };
  } catch (error) {
    return {
      handled: true,
      response: `❌ Je n'ai pas pu effectuer cette action : ${error}`,
      error: String(error),
    };
  }
}

/**
 * Execute la commande parsée avec le hook useFloatingWindow
 */
async function executeFloatingWindowCommand(
  command: FloatingWindowCommand,
  floatingWindow: UseFloatingWindowResult,
): Promise<void> {
  switch (command.type) {
    case 'scale':
      if (typeof command.value === 'number') {
        await floatingWindow.setScale(clamp(command.value, 0.1, 2.0));
      }
      break;

    case 'opacity':
      if (typeof command.value === 'number') {
        await floatingWindow.setOpacity(clamp(command.value, 0.0, 1.0));
      }
      break;

    case 'anchor':
      if (typeof command.value === 'string') {
        await floatingWindow.setAnchorByName(command.value);
      }
      break;

    case 'screen':
      if (typeof command.value === 'number') {
        const screenIndex = Math.max(0, Math.min(command.value, floatingWindow.screens.length - 1));
        await floatingWindow.moveToScreen(screenIndex);
      }
      break;

    case 'mode':
      if (command.value === 'floating') {
        await floatingWindow.setModeFloating();
      } else if (command.value === 'embed') {
        await floatingWindow.setModeEmbed();
      } else if (command.value === 'hidden') {
        await floatingWindow.setModeHidden();
      }
      break;

    case 'toggle_locked':
      if (typeof command.value === 'boolean') {
        if (command.value !== floatingWindow.displayState.locked) {
          await floatingWindow.toggleLocked();
        }
      }
      break;

    case 'toggle_always_on_top':
      if (typeof command.value === 'boolean') {
        if (command.value !== floatingWindow.displayState.always_on_top) {
          await floatingWindow.toggleAlwaysOnTop();
        }
      }
      break;

    case 'toggle_mirror':
      if (typeof command.value === 'boolean') {
        if (command.value !== floatingWindow.displayState.mirror_mode) {
          await floatingWindow.toggleMirrorMode();
        }
      }
      break;

    case 'toggle_click_through':
      if (typeof command.value === 'boolean') {
        if (command.value !== floatingWindow.displayState.click_through) {
          await floatingWindow.toggleClickThrough();
        }
      }
      break;

    case 'none':
    default:
      // No-op
      break;
  }
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT CONVENIENCE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convenience function pour détecter rapidement si message contient commande window
 */
export { containsFloatingWindowKeyword } from './floatingWindowChatHandler';

/**
 * Re-export types
 */
export type { FloatingWindowCommand } from './floatingWindowChatHandler';
