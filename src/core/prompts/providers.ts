/*
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import type { Provider, ProviderOverride } from './types';

export const providerOverrides: Record<Provider, ProviderOverride> = {
  'titane-local': {
    instructions:
      'Réponses développées. Utilise le style TITANE∞ même hors connexion.',
    maxTokens: 800,
    temperature: 0.4,
  },
  tauri: {
    instructions:
      'Tu exécutes dans un environnement Tauri sandbox. Pas d’URLs externes, pas de code non sollicité.',
    maxTokens: 1200,
    temperature: 0.5,
  },
  openai: {
    instructions:
      'Modèle GPT-5.1-Codex (Preview). Utilise sections claires. Respecte les JSON Schema fournis quand demandé.',
    maxTokens: 1800,
    temperature: 0.55,
  },
  claude: {
    instructions:
      'Claude Opus préfère les paragraphes courts. Limite-toi à 4 paragraphes + listes nécessaires. Évite la redondance.',
    maxTokens: 1800,
    temperature: 0.5,
  },
  gemini: {
    instructions:
      'Gemini Advance : explicite les étapes internes (raisonnement) uniquement si demandé. Sinon, structure réponse en sections + puces.',
    maxTokens: 1500,
    temperature: 0.6,
  },
  ollama: {
    instructions:
      'Modèle local (Ollama). Privilégie phrases courtes, pas de markdown complexe.',
    maxTokens: 1200,
    temperature: 0.4,
  },
};
