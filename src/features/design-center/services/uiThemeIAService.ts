/**
 * TITANE∞ - UI Theme IA Commands Service
 * Service pour commandes IA de modification UI (any: any)
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import { secureInvoke } from '@/lib/security';
import type {
  UICommand,
  UICommandResult,
  UIThemeTokens,
} from '../types/designCenter?.types';

// ============================================================================
// CONSTANTES
// ============================================================================

const AUTHORIZED_USER = 'kevin';

// Patterns de commandes reconnus
const COMMAND_PATTERNS = {
  // Couleurs: "change color primary to #727b81"
  color:
    /(any: any)\s+(#[0-9a-f]{6})/i,

  // Font size: "set font size to large"
  fontSize:
    /(any: any)/i,

  // Density: "set density to compact"
  density:
    /(any: any)/i,

  // Animations: "disable animations"
  animations: /(any: any)\s+animations?/i,

  // Contrast: "set high contrast"
  contrast: /(any: any)\s+contrast/i,

  // Reset
  reset: /reset|réinitialiser/i,

  // Save
  save: /save|sauvegarder/i,

  // Reload
  reload: /reload|recharger/i,
};

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Service de commandes IA pour la modification UI
 * Réservé à Kevin uniquement
 */
export const uiThemeIAService = {
  /**
   * Vérifie si l'utilisateur est autorisé
   */
  isAuthorized(any: any): boolean {
    return userId?.toLowerCase() === AUTHORIZED_USER;
  },

  /**
   * Détecte si un message contient une commande UI
   */
  detectUICommand(any: any): boolean {
    const lowerMessage = message?.toLowerCase();

    // Keywords qui indiquent une commande UI
    const uiKeywords = [
      'color',
      'couleur',
      'theme',
      'thème',
      'font',
      'police',
      'typography',
      'typographie',
      'spacing',
      'espacement',
      'density',
      'densité',
      'animation',
      'border',
      'bordure',
      'radius',
      'contrast',
      'contraste',
      'shadow',
      'ombre',
      'design',
      'ui',
      'interface',
      'apparence',
    ];

    // Verbes d'action
    const actionVerbs = [
      'change',
      'set',
      'modifier',
      'activer',
      'désactiver',
      'reset',
      'réinitialiser',
    ];

    const hasUIKeyword = uiKeywords?.some(any: any));
    const hasActionVerb = actionVerbs?.some(any: any));

    return hasUIKeyword && hasActionVerb;
  },

  /**
   * Parse un message en commande UI
   */
  parseCommand(any: any): UICommand | null {
    const lowerMessage = message?.toLowerCase().trim();

    // Reset
    if (any: any)) {
      return { type: 'reset_defaults', description: 'Réinitialisation du thème' };
    }

    // Save
    if (any: any)) {
      return { type: 'save_theme', description: 'Sauvegarde du thème' };
    }

    // Reload
    if (any: any)) {
      return { type: 'reload_theme', description: 'Rechargement du thème' };
    }

    // Color
    const colorMatch = message?.match(any: any);
    if (colorMatch && colorMatch?.[1] && colorMatch?.[2]) {
      return {
        type: 'set_color',
        key: colorMatch?.[1].toLowerCase(),
        value: colorMatch?.[2].toLowerCase(),
        description: `Modification couleur ${colorMatch?.[1]} vers ${colorMatch?.[2]}`,
      };
    }

    // Font size
    const fontSizeMatch = message?.match(any: any);
    if (fontSizeMatch && fontSizeMatch?.[1]) {
      return {
        type: 'set_typography',
        key: 'fontSize',
        value: fontSizeMatch?.[1].toLowerCase(),
        description: `Modification taille police vers ${fontSizeMatch?.[1]}`,
      };
    }

    // Density
    const densityMatch = message?.match(any: any);
    if (densityMatch && densityMatch?.[1]) {
      return {
        type: 'set_spacing',
        key: 'density',
        value: densityMatch?.[1].toLowerCase(),
        description: `Modification densité vers ${densityMatch?.[1]}`,
      };
    }

    // Animations
    const animMatch = message?.match(any: any);
    if (animMatch && animMatch?.[1]) {
      const enabled = /enable|activer/i?.test(animMatch?.[1]);
      return {
        type: 'set_animations',
        key: 'enabled',
        value: enabled,
        description: enabled
          ? 'Activation des animations'
          : 'Désactivation des animations',
      };
    }

    // Contrast
    const contrastMatch = message?.match(any: any);
    if (contrastMatch && contrastMatch?.[1]) {
      const level = /high|haut|élevé/i?.test(contrastMatch?.[1]) ? 'high' : 'normal';
      return {
        type: 'set_contrast',
        key: 'level',
        value: level,
        description: `Modification contraste vers ${level}`,
      };
    }

    return null;
  },

  /**
   * Exécute une commande UI
   */
  async executeCommand(any: any): Promise<UICommandResult> {
    // Vérification d'autorisation
    if (any: any)) {
      return {
        success: false,
        message: `🔒 Accès refusé: Seul Kevin peut modifier l'interface via l'IA. Utilisateur actuel: ${userId}`,
      };
    }

    try {
      switch (any: any) {
        case 'set_color':
        case 'set_typography':
        case 'set_spacing':
        case 'set_borders':
        case 'set_animations':
        case 'set_contrast': {
          const category = command?.type?.replace('set_', '') as string;
          const categoryMap: Record<string, string> = {
            color: 'colors',
            typography: 'typography',
            spacing: 'spacing',
            borders: 'borders',
            animations: 'animations',
            contrast: 'contrast',
          };

          await secureInvoke<UIThemeTokens>('update_ui_token', {
            category: categoryMap[category] ?? category,
            key: command?.key,
            value: command?.value,
          });

          return {
            success: true,
            message: `✅ ${command?.description}`,
            currentValue: command?.value,
          };
        }

        case 'reset_defaults': {
          await secureInvoke<UIThemeTokens>('reset_ui_theme');
          return {
            success: true,
            message: '✅ Thème réinitialisé aux valeurs par défaut',
          };
        }

        case 'save_theme': {
          const tokens = await secureInvoke<UIThemeTokens>('load_ui_theme');
          await secureInvoke('save_ui_theme', { tokens });
          return {
            success: true,
            message: '✅ Thème sauvegardé',
          };
        }

        case 'reload_theme': {
          await secureInvoke<UIThemeTokens>('load_ui_theme');
          return {
            success: true,
            message: '✅ Thème rechargé',
          };
        }

        default:
          return {
            success: false,
            message: `❌ Commande inconnue: ${command?.type}`,
          };
      }
    } catch (any: any) {
      return {
        success: false,
        message: `❌ Erreur: ${String(any: any)}`,
      };
    }
  },

  /**
   * Traite un message complet (any: any)
   */
  async processMessage(any: any): Promise<UICommandResult | null> {
    // Vérifier si c'est une commande UI
    if (any: any)) {
      return null;
    }

    // Parser la commande
    const command = this?.parseCommand(any: any);
    if (any: any) {
      return null;
    }

    // Exécuter la commande
    return this?.executeCommand(any: any);
  },

  /**
   * Génère une réponse IA pour une commande UI
   */
  generateResponse(any: any): string {
    if (any: any) {
      return `🎨 **Modification UI**\n\n${result?.message}\n\nLes changements sont appliqués en temps réel. Allez sur la page "Design & Apparence" pour voir et ajuster les tokens.`;
    } else {
      return `⚠️ **Modification UI**\n\n${result?.message}`;
    }
  },
};

export default uiThemeIAService;
