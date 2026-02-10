/**
 * TITANE∞ - useUIThemeCommands Hook
 * Commandes IA pour modification UI (Kevin only)
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import { useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { useUITheme } from '../providers/UIThemeProvider';
import type {
  UICommand,
  UICommandResult,
  UIThemeTokens,
} from '../types/designCenter.types';

/**
 * Hook pour les commandes IA de modification UI
 * Réservé à Kevin uniquement
 */
export function useUIThemeCommands() {
  const { tokens, reloadTokens } = useUITheme();

  /**
   * Vérifie si l'utilisateur est autorisé (Kevin)
   */
  const isAuthorized = useCallback((userId: string): boolean => {
    return userId.toLowerCase() === 'kevin';
  }, []);

  /**
   * Exécute une commande IA sur les tokens UI
   */
  const executeCommand = useCallback(
    async (command: UICommand, userId: string): Promise<UICommandResult> => {
      // Vérification d'autorisation
      if (!isAuthorized(userId)) {
        return {
          success: false,
          message: `Accès refusé: Seul Kevin peut modifier l'interface via l'IA. Utilisateur: ${userId}`,
        };
      }

      try {
        switch (command.type) {
          case 'set_color': {
            if (!command.key || !command.value) {
              return { success: false, message: 'Clé et valeur requises pour set_color' };
            }
            const previousValue =
              tokens.colors[command.key as keyof typeof tokens.colors];
            await tauriClient.updateUiToken({
              category: 'colors',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Couleur ${command.key} modifiée`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'set_typography': {
            if (!command.key || command.value === undefined) {
              return {
                success: false,
                message: 'Clé et valeur requises pour set_typography',
              };
            }
            const previousValue =
              tokens.typography[command.key as keyof typeof tokens.typography];
            await tauriClient.updateUiToken({
              category: 'typography',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Typographie ${command.key} modifiée`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'set_spacing': {
            if (!command.key || command.value === undefined) {
              return {
                success: false,
                message: 'Clé et valeur requises pour set_spacing',
              };
            }
            const previousValue =
              tokens.spacing[command.key as keyof typeof tokens.spacing];
            await tauriClient.updateUiToken({
              category: 'spacing',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Espacement ${command.key} modifié`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'set_borders': {
            if (!command.key || command.value === undefined) {
              return {
                success: false,
                message: 'Clé et valeur requises pour set_borders',
              };
            }
            const previousValue =
              tokens.borders[command.key as keyof typeof tokens.borders];
            await tauriClient.updateUiToken({
              category: 'borders',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Bordures ${command.key} modifiées`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'set_animations': {
            if (!command.key || command.value === undefined) {
              return {
                success: false,
                message: 'Clé et valeur requises pour set_animations',
              };
            }
            const previousValue =
              tokens.animations[command.key as keyof typeof tokens.animations];
            await tauriClient.updateUiToken({
              category: 'animations',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Animation ${command.key} modifiée`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'set_contrast': {
            if (!command.key || command.value === undefined) {
              return {
                success: false,
                message: 'Clé et valeur requises pour set_contrast',
              };
            }
            const previousValue =
              tokens.contrast[command.key as keyof typeof tokens.contrast];
            await tauriClient.updateUiToken({
              category: 'contrast',
              key: command.key,
              value: command.value,
            });
            await reloadTokens();
            return {
              success: true,
              message: `Contraste ${command.key} modifié`,
              previousValue,
              currentValue: command.value,
            };
          }

          case 'reset_defaults': {
            await tauriClient.resetUiTheme();
            await reloadTokens();
            return {
              success: true,
              message: 'Thème réinitialisé aux valeurs par défaut',
            };
          }

          case 'save_theme': {
            await tauriClient.saveUiTheme({ tokens });
            return {
              success: true,
              message: 'Thème sauvegardé',
            };
          }

          case 'reload_theme': {
            await reloadTokens();
            return {
              success: true,
              message: 'Thème rechargé',
            };
          }

          default:
            return {
              success: false,
              message: `Commande inconnue: ${command.type}`,
            };
        }
      } catch (error) {
        return {
          success: false,
          message: `Erreur: ${String(error)}`,
        };
      }
    },
    [tokens, reloadTokens, isAuthorized]
  );

  /**
   * Parse une commande texte en commande UI
   * Format: "change color primary to #ff0000"
   */
  const parseTextCommand = useCallback((text: string): UICommand | null => {
    const lowerText = text.toLowerCase().trim();

    // Reset
    if (lowerText.includes('reset') || lowerText.includes('réinitialiser')) {
      return { type: 'reset_defaults', description: 'Réinitialisation du thème' };
    }

    // Save
    if (lowerText.includes('save') || lowerText.includes('sauvegarder')) {
      return { type: 'save_theme', description: 'Sauvegarde du thème' };
    }

    // Reload
    if (lowerText.includes('reload') || lowerText.includes('recharger')) {
      return { type: 'reload_theme', description: 'Rechargement du thème' };
    }

    // Color change: "change color primary to #727b81"
    const colorMatch = lowerText.match(
      /(?:change|set|modifier)\s+(?:color|couleur)\s+(\w+)\s+(?:to|à|vers)\s+(#[0-9a-f]{6})/i
    );
    if (colorMatch) {
      return {
        type: 'set_color',
        key: colorMatch[1],
        value: colorMatch[2],
        description: `Modification couleur ${colorMatch[1]} vers ${colorMatch[2]}`,
      };
    }

    // Font size: "set font size to large"
    const fontSizeMatch = lowerText.match(
      /(?:set|change|modifier)\s+(?:font\s*size|taille)\s+(?:to|à|vers)\s+(small|medium|large)/i
    );
    if (fontSizeMatch) {
      return {
        type: 'set_typography',
        key: 'fontSize',
        value: fontSizeMatch[1],
        description: `Modification taille police vers ${fontSizeMatch[1]}`,
      };
    }

    // Density: "set density to compact"
    const densityMatch = lowerText.match(
      /(?:set|change|modifier)\s+(?:density|densité)\s+(?:to|à|vers)\s+(compact|standard|spacious)/i
    );
    if (densityMatch) {
      return {
        type: 'set_spacing',
        key: 'density',
        value: densityMatch[1],
        description: `Modification densité vers ${densityMatch[1]}`,
      };
    }

    // Animations: "disable animations" or "enable animations"
    const animMatch = lowerText.match(
      /(enable|disable|activer|désactiver)\s+animations?/i
    );
    if (animMatch) {
      const enabled = animMatch[1]?.match(/enable|activer/i) !== null;
      return {
        type: 'set_animations',
        key: 'enabled',
        value: enabled,
        description: enabled
          ? 'Activation des animations'
          : 'Désactivation des animations',
      };
    }

    // Contrast: "set high contrast" or "normal contrast"
    const contrastMatch = lowerText.match(
      /(?:set|activer)\s+(high|normal|haut|élevé)\s+contrast/i
    );
    if (contrastMatch) {
      const level = contrastMatch[1]?.match(/high|haut|élevé/i) ? 'high' : 'normal';
      return {
        type: 'set_contrast',
        key: 'level',
        value: level,
        description: `Modification contraste vers ${level}`,
      };
    }

    return null;
  }, []);

  return {
    executeCommand,
    parseTextCommand,
    isAuthorized,
  };
}

export default useUIThemeCommands;
