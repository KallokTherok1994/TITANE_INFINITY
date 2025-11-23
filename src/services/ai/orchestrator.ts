/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — AI ORCHESTRATOR
 *   Orchestrateur intelligent avec cascade Gemini → Ollama → Fallback
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIResponse, AIConfig } from './types';
import { geminiProvider } from './providers/gemini';
import { ollamaProvider } from './providers/ollama';
import { fallbackProvider } from './providers/fallback';

/**
 * Sanitize et valide un message utilisateur
 */
function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .substring(0, 10000); // Max 10k caractères
}

/**
 * Orchestrateur principal
 */
class AIOrchestrator {
  private providers = [geminiProvider, ollamaProvider, fallbackProvider];

  /**
   * Génère une réponse en cascade
   */
  async generate(message: string, history: AIMessage[] = [], _config?: AIConfig): Promise<AIResponse> {
    const sanitized = sanitizeMessage(message);

    if (!sanitized) {
      throw new Error('Message vide ou invalide');
    }

    // Tente chaque provider dans l'ordre
    for (const provider of this.providers) {
      try {
        // Vérifie disponibilité
        const isAvailable = await provider.isAvailable();
        
        if (!isAvailable) {
          console.log(`⚠️ Provider ${provider.name} non disponible, suivant...`);
          continue;
        }

        console.log(`🌟 Tentative ${provider.name}...`);
        
        // Génère la réponse (config ignoré pour l'instant)
        const response = await provider.generate(sanitized, history);
        
        console.log(`✅ ${provider.name} OK`);
        return response;
        
      } catch (error) {
        console.warn(`⚠️ ${provider.name} échoué:`, error instanceof Error ? error.message : 'Unknown error');
        
        // Si c'est le dernier provider (fallback), on le laisse passer
        if (provider === fallbackProvider) {
          throw error;
        }
        
        // Sinon on continue avec le suivant
        continue;
      }
    }

    // Ceci ne devrait jamais arriver (fallback toujours disponible)
    throw new Error('Tous les providers IA ont échoué');
  }

  /**
   * Stream une réponse
   */
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const sanitized = sanitizeMessage(message);

    if (!sanitized) {
      throw new Error('Message vide ou invalide');
    }

    // Tente chaque provider dans l'ordre
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        
        if (!isAvailable) {
          continue;
        }

        if (!provider.stream) {
          // Si pas de streaming, utilise generate() et simule
          const response = await provider.generate(sanitized, history);
          
          for (let i = 0; i < response.content.length; i++) {
            const char = response.content[i];
            if (char !== undefined) {
              yield char;
            }
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
          return;
        }

        // Streaming natif
        yield* provider.stream(sanitized, history);
        return;
        
      } catch (error) {
        console.warn(`⚠️ ${provider.name} streaming échoué:`, error);
        
        if (provider === fallbackProvider) {
          throw error;
        }
        
        continue;
      }
    }

    throw new Error('Tous les providers IA ont échoué (streaming)');
  }

  /**
   * Retourne le statut des providers
   */
  async getProvidersStatus() {
    const status = await Promise.all(
      this.providers.map(async (provider) => ({
        name: provider.name,
        available: await provider.isAvailable().catch(() => false),
      }))
    );

    return status;
  }
}

// Export singleton
export const aiOrchestrator = new AIOrchestrator();

// Fonctions helper pour rétrocompatibilité
export async function askTitan(message: string, history: AIMessage[] = [], config?: AIConfig): Promise<AIResponse> {
  return aiOrchestrator.generate(message, history, config);
}

export async function* streamTitan(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
  yield* aiOrchestrator.stream(message, history);
}

export async function getAIStatus() {
  return aiOrchestrator.getProvidersStatus();
}

export default aiOrchestrator;
