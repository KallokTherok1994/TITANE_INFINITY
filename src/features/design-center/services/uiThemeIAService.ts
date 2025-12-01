/**
 * TITANE∞ - UI Theme IA Commands Service
 * Service pour commandes IA de modification UI (Kevin only)
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import { invoke } from '@tauri-apps/api/core';
import type { UICommand, UICommandResult, UIThemeTokens } from '../types/designCenter.types';

// ============================================================================
// CONSTANTES
// ============================================================================

const AUTHORIZED_USER = 'kevin';

// Patterns de commandes reconnus
const COMMAND_PATTERNS = {
  // Couleurs: "change color primary to #727b81"
  color: /(?:change|set|modifier)\s+(?:color|couleur)\s+(\w+)\s+(?:to|à|vers)\s+(#[0-9a-f]{6})/i,

  // Font size: "set font size to large"
  fontSize: /(?:set|change|modifier)\s+(?:font\s*size|taille)\s+(?:to|à|vers)\s+(small|medium|large)/i,

  // Density: "set density to compact"
  density: /(?:set|change|modifier)\s+(?:density|densité)\s+(?:to|à|vers)\s+(compact|standard|spacious)/i,

  // Animations: "disable animations"
  animations: /(enable|disable|activer|désactiver)\s+animations?/i,

  // Contrast: "set high contrast"
  contrast: /(?:set|activer)\s+(high|normal|haut|élevé)\s+contrast/i,

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
  isAuthorized(userId: string): boolean {
    return userId.toLowerCase() === AUTHORIZED_USER;
  },

  /**
   * Détecte si un message contient une commande UI
   */
  detectUICommand(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Keywords qui indiquent une commande UI
    const uiKeywords = [
      'color', 'couleur', 'theme', 'thème',
      'font', 'police', 'typography', 'typographie',
      'spacing', 'espacement', 'density', 'densité',
      'animation', 'border', 'bordure', 'radius',
      'contrast', 'contraste', 'shadow', 'ombre',
      'design', 'ui', 'interface', 'apparence',
    ];

    // Verbes d'action
    const actionVerbs = ['change', 'set', 'modifier', 'activer', 'désactiver', 'reset', 'réinitialiser'];

    const hasUIKeyword = uiKeywords.some(kw => lowerMessage.includes(kw));
    const hasActionVerb = actionVerbs.some(v => lowerMessage.includes(v));

    return hasUIKeyword && hasActionVerb;
  },

  /**
   * Parse un message en commande UI
   */
  parseCommand(message: string): UICommand | null {
    const lowerMessage = message.toLowerCase().trim();

    // Reset
    if (COMMAND_PATTERNS.reset.test(lowerMessage)) {
      return { type: 'reset_defaults', description: 'Réinitialisation du thème' };
    }

    // Save
    if (COMMAND_PATTERNS.save.test(lowerMessage)) {
      return { type: 'save_theme', description: 'Sauvegarde du thème' };
    }

    // Reload
    if (COMMAND_PATTERNS.reload.test(lowerMessage)) {
      return { type: 'reload_theme', description: 'Rechargement du thème' };
    }

    // Color
    const colorMatch = message.match(COMMAND_PATTERNS.color);
    if (colorMatch) {
      return {
        type: 'set_color',
        key: colorMatch[1].toLowerCase(),
        value: colorMatch[2].toLowerCase(),
        description: `Modification couleur ${colorMatch[1]} vers ${colorMatch[2]}`,
      };
    }

    // Font size
    const fontSizeMatch = message.match(COMMAND_PATTERNS.fontSize);
    if (fontSizeMatch) {
      return {
        type: 'set_typography',
        key: 'fontSize',
        value: fontSizeMatch[1].toLowerCase(),
        description: `Modification taille police vers ${fontSizeMatch[1]}`,
      };
    }

    // Density
    const densityMatch = message.match(COMMAND_PATTERNS.density);
    if (densityMatch) {
      return {
        type: 'set_spacing',
        key: 'density',
        value: densityMatch[1].toLowerCase(),
        description: `Modification densité vers ${densityMatch[1]}`,
      };
    }

    // Animations
    const animMatch = message.match(COMMAND_PATTERNS.animations);
    if (animMatch) {
      const enabled = /enable|activer/i.test(animMatch[1]);
      return {
        type: 'set_animations',
        key: 'enabled',
        value: enabled,
        description: enabled ? 'Activation des animations' : 'Désactivation des animations',
      };
    }

    // Contrast
    const contrastMatch = message.match(COMMAND_PATTERNS.contrast);
    if (contrastMatch) {
      const level = /high|haut|élevé/i.test(contrastMatch[1]) ? 'high' : 'normal';
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
  async executeCommand(command: UICommand, userId: string): Promise<UICommandResult> {
    // Vérification d'autorisation
    if (!this.isAuthorized(userId)) {
      return {
        success: false,
        message: `🔒 Accès refusé: Seul Kevin peut modifier l'interface via l'IA. Utilisateur actuel: ${userId}`,
      };
    }

    try {
      switch (command.type) {
        case 'set_color':
        case 'set_typography':
        case 'set_spacing':
        case 'set_borders':
        case 'set_animations':
        case 'set_contrast': {
          const category = command.type.replace('set_', '') as string;
          const categoryMap: Record<string, string> = {
            color: 'colors',
            typography: 'typography',
            spacing: 'spacing',
            borders: 'borders',
            animations: 'animations',
            contrast: 'contrast',
          };

          await invoke<UIThemeTokens>('update_ui_token', {
            category: categoryMap[category] || category,
            key: command.key,
            value: command.value,
          });

          return {
            success: true,
            message: `✅ ${command.description}`,
            currentValue: command.value,
          };
        }

        case 'reset_defaults': {
          await invoke<UIThemeTokens>('reset_ui_theme');
          return {
            success: true,
            message: '✅ Thème réinitialisé aux valeurs par défaut',
          };
        }

        case 'save_theme': {
          const tokens = await invoke<UIThemeTokens>('load_ui_theme');
          await invoke('save_ui_theme', { tokens });
          return {
            success: true,
            message: '✅ Thème sauvegardé',
          };
        }

        case 'reload_theme': {
          await invoke<UIThemeTokens>('load_ui_theme');
          return {
            success: true,
            message: '✅ Thème rechargé',
          };
        }

        default:
          return {
            success: false,
            message: `❌ Commande inconnue: ${command.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur: ${String(error)}`,
      };
    }
  },

  /**
   * Traite un message complet (détection + parsing + exécution)
   */
  async processMessage(message: string, userId: string): Promise<UICommandResult | null> {
    // Vérifier si c'est une commande UI
    if (!this.detectUICommand(message)) {
      return null;
    }

    // Parser la commande
    const command = this.parseCommand(message);
    if (!command) {
      return null;
    }

    // Exécuter la commande
    return this.executeCommand(command, userId);
  },

  /**
   * Génère une réponse IA pour une commande UI
   */
  generateResponse(result: UICommandResult): string {
    if (result.success) {
      return `🎨 **Modification UI**\n\n${result.message}\n\nLes changements sont appliqués en temps réel. Allez sur la page "Design & Apparence" pour voir et ajuster les tokens.`;
    } else {
      return `⚠️ **Modification UI**\n\n${result.message}`;
    }
  },
};

export default uiThemeIAService;
