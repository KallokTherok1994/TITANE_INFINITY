// Copyright © 2025 TITANE∞ — Appearance Chat Detector v24.5
// License: Proprietary — TITANE OS
// Module: Chat Integration for Appearance Commands

import {
  isAppearanceCommand,
  isFusionCommand,
  parseAppearanceCommand,
  extractFusionStyles,
  detectInventedStyle,
} from './styleLanguageParser';
import {
  updateAppearance,
  applyStylePreset,
  mergeStyles,
  addArchetype,
} from './appearanceEngine';
import type { AppearanceUpdateRequest } from './appearanceState';

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export interface AppearanceCommandResult {
  handled: boolean;
  response: string;
  update?: AppearanceUpdateRequest;
  error?: string;
}

/**
 * Main handler for appearance commands in chat
 * @param message - User message from chat
 * @returns Result with response and whether command was handled
 */
export async function handleAppearanceCommand(
  message: string
): Promise<AppearanceCommandResult> {
  try {
    // Check if message contains appearance command
    if (!isAppearanceCommand(message)) {
      return { handled: false, response: '' };
    }

    // Handle style fusion (multiple styles)
    if (isFusionCommand(message)) {
      return await handleStyleFusion(message);
    }

    // Handle invented style creation
    const inventedStyle = detectInventedStyle(message);
    if (inventedStyle.name && inventedStyle.keywords) {
      return await handleInventedStyle(inventedStyle);
    }

    // Handle standard appearance update
    return await handleStandardUpdate(message);
  } catch (error) {
    return {
      handled: true,
      response: `Désolée, je n'ai pas pu modifier mon apparence : ${error}`,
      error: String(error),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STANDARD UPDATE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleStandardUpdate(message: string): Promise<AppearanceCommandResult> {
  const update = parseAppearanceCommand(message);

  // If preset detected, apply it
  if (update.mode_preset) {
    const description = await applyStylePreset(update.mode_preset);
    return {
      handled: true,
      response: `✅ ${description}`,
      update,
    };
  }

  // Otherwise apply partial update
  if (Object.keys(update).length > 0) {
    const description = await updateAppearance(update);
    return {
      handled: true,
      response: `✅ ${description}`,
      update,
    };
  }

  return {
    handled: false,
    response: "Je n'ai pas compris quelle modification d'apparence tu souhaites.",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE FUSION HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleStyleFusion(message: string): Promise<AppearanceCommandResult> {
  const styles = extractFusionStyles(message);

  if (styles.length < 2) {
    return {
      handled: true,
      response:
        "Pour une fusion de styles, j'ai besoin d'au moins deux styles à combiner.",
    };
  }

  try {
    const mergedStyleJson = await mergeStyles(styles);
    const mergedStyle = JSON.parse(mergedStyleJson);

    // Apply merged style to current appearance
    const update: AppearanceUpdateRequest = {
      style: {
        theme: mergedStyle.name,
        vibe: mergedStyle.vibe,
        color_palette: mergedStyle.default_palette,
      },
    };

    const description = await updateAppearance(update);

    return {
      handled: true,
      response: `✅ Fusion réussie : ${styles.join(' + ')}. ${description}`,
      update,
    };
  } catch (error) {
    return {
      handled: true,
      response: `Je n'ai pas pu fusionner ces styles : ${error}`,
      error: String(error),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INVENTED STYLE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleInventedStyle(inventedStyle: {
  name?: string;
  keywords?: string[];
}): Promise<AppearanceCommandResult> {
  if (!inventedStyle.name || !inventedStyle.keywords) {
    return {
      handled: true,
      response:
        "Pour créer un nouveau style, j'ai besoin d'un nom et de mots-clés descriptifs.",
    };
  }

  try {
    const response = await addArchetype(inventedStyle.name, inventedStyle.keywords);

    return {
      handled: true,
      response: `✨ ${response}. Je pourrai maintenant utiliser le style "${inventedStyle.name}".`,
    };
  } catch (error) {
    return {
      handled: true,
      response: `Je n'ai pas pu créer ce nouveau style : ${error}`,
      error: String(error),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE KEYWORDS FOR CHAT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

export const APPEARANCE_KEYWORDS = [
  'apparence',
  'tenue',
  'vetements',
  'coiffure',
  'style',
  'look',
  'chemise',
  'pantalon',
  'jupe',
  'robe',
  'chaussures',
  'lunettes',
  'bijoux',
  'cheveux',
  'maquillage',
  'bureau',
  'casual',
  'sport',
  'montagne',
  'professionnel',
  'decontracte',
];

/**
 * Quick check if message might contain appearance command
 * (for chat routing optimization)
 */
export function containsAppearanceKeyword(message: string): boolean {
  const msgLower = message.toLowerCase();
  return APPEARANCE_KEYWORDS.some(keyword => msgLower.includes(keyword));
}

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const APPEARANCE_RESPONSES = {
  success: [
    "✅ C'est fait ! J'ai modifié mon apparence.",
    '✅ Voilà, changement effectué.',
    '✅ Mon look est maintenant mis à jour.',
    '✅ Transformation réussie !',
  ],
  partial: [
    "⚠️ J'ai appliqué une partie des changements.",
    '⚠️ Certains éléments ont été modifiés.',
  ],
  error: [
    "❌ Je n'ai pas pu effectuer ce changement.",
    "❌ Cette modification n'est pas possible pour le moment.",
  ],
  clarification: [
    '🤔 Peux-tu préciser quel aspect de mon apparence tu veux modifier ?',
    '🤔 Je ne suis pas sûre de comprendre. Veux-tu modifier ma tenue, ma coiffure, ou mon style général ?',
  ],
};

/**
 * Get random response from category
 */
export function getAppearanceResponse(
  category: keyof typeof APPEARANCE_RESPONSES
): string {
  const responses = APPEARANCE_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
}
