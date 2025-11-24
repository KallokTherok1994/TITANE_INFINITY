/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — FALLBACK PROVIDER
 *   Provider de secours quand tous les services IA échouent
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse } from '../types';

const FALLBACK_RESPONSES: readonly string[] = [
  "Je suis TITANE∞, mais mes services IA principaux sont temporairement indisponibles. Vérifie ta configuration Gemini API ou Ollama.",
  "Systèmes IA en mode dégradé. Impossible de générer une réponse pour le moment. Configure VITE_GEMINI_API_KEY ou lance Ollama localement.",
  "Erreur de connexion aux services IA. Assure-toi que Gemini API (clé dans .env) ou Ollama (localhost:11434) sont configurés correctement.",
  "TITANE∞ en mode autonome limité. Pour une expérience complète, configure un provider IA (Gemini recommandé).",
  "Services IA déconnectés. Consulte la documentation pour configurer Gemini API ou installer Ollama.",
] as const;

/**
 * Provider Fallback
 */
export const fallbackProvider: AIProvider = {
  name: 'fallback',

  async isAvailable(): Promise<boolean> {
    return true; // Toujours disponible
  },

  async generate(message: string, _history: AIMessage[] = []): Promise<AIResponse> {
    try {
      console.log('[Fallback] generate() called with:', { message: message.substring(0, 50), historyLength: _history.length });

      // Réponse personnalisée selon le message
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      let content: string = FALLBACK_RESPONSES[randomIndex] as string;

      // Détection de patterns pour réponses contextuelles
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('configuration') || lowerMessage.includes('configurer')) {
        content = "Pour configurer TITANE∞:\n\n1. **Gemini** (recommandé): Ajoute `VITE_GEMINI_API_KEY=ta_clé` dans `.env`\n2. **Ollama** (local): Lance `ollama serve` et installe un modèle avec `ollama pull llama2`\n\nRedémarre l'application ensuite.";
      } else if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
        content = "TITANE∞ nécessite un service IA pour fonctionner:\n\n• **Gemini API** (cloud, rapide): Obtiens une clé sur ai.google.dev\n• **Ollama** (local, privé): Installe depuis ollama.ai\n\nConsulte la documentation pour plus de détails.";
      } else if (lowerMessage.includes('erreur') || lowerMessage.includes('error')) {
        content = "Mode dégradé actif. Les services IA (Gemini + Ollama) sont inaccessibles. Vérifie :\n\n✓ Connexion internet\n✓ Configuration .env\n✓ Status Ollama (si local)\n✓ Logs console pour détails";
      }

      console.log('[Fallback] Generated response:', { contentLength: content.length });

      const response = {
        content,
        provider: 'fallback',
        timestamp: Date.now(),
        model: 'fallback-v1',
      };

      console.log('[Fallback] Returning response successfully');
      return response;

    } catch (error) {
      console.error('[Fallback] CRITICAL ERROR in generate():', error);
      // Fallback du fallback : réponse minimale garantie
      return {
        content: "🚨 Erreur système critique. Tous les providers IA sont indisponibles, y compris le mode fallback. Redémarrez l'application.",
        provider: 'fallback-emergency',
        timestamp: Date.now(),
        model: 'emergency-v1',
      };
    }
  },

  // Pas de streaming pour le fallback
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const response = await this.generate(message, history);

    // Simule le streaming mot par mot
    const words = response.content.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  },
};

export default fallbackProvider;
