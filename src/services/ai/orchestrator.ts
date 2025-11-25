/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v18.0 — AI ORCHESTRATOR
 *   Orchestrateur hybride : Backend Rust → Gemini → Ollama → Local
 *   Priorise le backend Tauri (cascade automatique) si disponible
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIResponse, AIConfig } from './types';
import { tauriChatProvider } from './providers/tauriChat'; // ← NOUVEAU: Backend Rust
import { titaneLocalProvider } from './providers/titaneLocal';
import { geminiProvider } from './providers/gemini';
import { ollamaProvider } from './providers/ollama';
import { fallbackProvider } from './providers/fallback'; // Legacy wrapper

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
  // v18.0: Backend Rust d'abord (gère sa propre cascade), puis providers frontend
  // Ordre de priorité:
  // 1. tauriChatProvider (Backend Rust: gemini → ollama → local)
  // 2. geminiProvider (Frontend API direct)
  // 3. ollamaProvider (Frontend local direct)
  // 4. titaneLocalProvider (Frontend autonome, toujours disponible)
  private providers = [
    tauriChatProvider,   // ← NOUVEAU: Backend Rust (mock cascade)
    geminiProvider,      // Frontend API
    ollamaProvider,      // Frontend local
    titaneLocalProvider  // Frontend autonomous safety net
  ];

  /**
   * Génère une réponse en cascade
   */
  async generate(message: string, history: AIMessage[] = [], _config?: AIConfig): Promise<AIResponse> {
    const sanitized = sanitizeMessage(message);

    if (!sanitized) {
      throw new Error('Message vide ou invalide');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 ORCHESTRATOR: Début cascade AI providers');
    console.log(`📝 Message: "${sanitized.substring(0, 50)}${sanitized.length > 50 ? '...' : ''}"`);
    console.log(`📚 Historique: ${history.length} messages`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Tente chaque provider dans l'ordre
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      if (!provider) continue;

      console.log(`\n🔍 [${i + 1}/${this.providers.length}] Testing ${provider.name}...`);

      try {
        // Vérifie disponibilité
        console.log(`   ⏳ Checking availability...`);
        const isAvailable = await provider.isAvailable();
        console.log(`   ${isAvailable ? '✅' : '❌'} Available: ${isAvailable}`);

        if (!isAvailable) {
          console.log(`   ⏭️  Skipping to next provider...\n`);
          continue;
        }

        console.log(`   🌟 Generating response...`);
        const startTime = Date.now();

        // Génère la réponse (config ignoré pour l'instant)
        const response = await provider.generate(sanitized, history);

        const duration = Date.now() - startTime;
        console.log(`   ✅ Success in ${duration}ms`);
        console.log(`   📦 Response length: ${response.content.length} chars`);
        console.log(`   🏷️  Provider: ${response.provider}, Model: ${response.model || 'N/A'}`);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ORCHESTRATOR: Response generated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return response;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Error: ${errorMsg}`);

        // Si c'est le dernier provider (fallback), on renvoie quand même une réponse
        if (provider === fallbackProvider) {
          console.error('\n🚨 CRITICAL: Fallback provider failed!');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('Error details:', error);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

          // NOUVEAU: Réponse d'urgence garantie (jamais throw)
          return {
            content: "🚨 **Erreur système critique**: Tous les services IA sont indisponibles, y compris le mode fallback. Contactez le support technique.\n\n**Détails**: " + errorMsg,
            provider: 'emergency-fallback' as const,
            timestamp: Date.now(),
            model: 'emergency-v1',
          };
        }

        console.log(`   ⏭️  Trying next provider...\n`);
        continue;
      }
    }

    // ✅ SAFETY NET ULTIME: Si tous échouent (impossible en théorie), garantir réponse
    console.error('\n🚨 ORCHESTRATOR: All providers exhausted - RETURNING ULTIMATE FALLBACK!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      content: "⚠️ **TITANE∞ en mode dégradé**: Tous les systèmes IA principaux sont indisponibles.\n\n**Actions recommandées:**\n• Configure ta clé Gemini API dans .env\n• Lance Ollama local: `ollama serve`\n• Vérifie ta connexion internet\n\nJe reste disponible pour les fonctions système (Helios, Memory, Progression).",
      provider: 'ultimate-fallback',
      timestamp: Date.now(),
      model: 'emergency-v2',
    };
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
