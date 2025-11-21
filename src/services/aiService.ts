/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — AI SERVICE ENGINE (OFFLINE FIRST)
 *   Mode: Local > Cloud (APIs on-demand only)
 * ═══════════════════════════════════════════════════════════════════
 */

import { getAIConfig, isOnlineModeEnabled } from '../config/offline-first';
import { confirmCloudAPIUsage } from '../utils/cloudAPIConfirmation';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
  provider: 'gemini' | 'ollama' | 'fallback';
  timestamp: number;
}

/**
 * Nettoie et valide un message utilisateur
 */
function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 10000); // Max 10k caractères
}

/**
 * Appelle l'API Gemini
 */
async function callGemini(message: string, history: AIMessage[] = []): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Tu es TITANE∞, une IA avancée intégrée dans un système d'auto-évolution cognitive. Contexte: ${history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUtilisateur: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content: string = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse vide';

    return {
      content,
      provider: 'gemini',
      timestamp: Date.now(),
    };
  } catch (error) {
    clearTimeout(timeout);
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Appelle Ollama en local
 */
async function callOllama(message: string, history: AIMessage[] = []): Promise<AIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const contextPrompt = history.length > 0
      ? `Contexte précédent:\n${history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
      : '';

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `${contextPrompt}Tu es TITANE∞, une IA cognitive avancée. Réponds en français.\n\nUtilisateur: ${message}\n\nTITANE∞:`,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const content: string = data.response || 'Réponse vide';

    return {
      content,
      provider: 'ollama',
      timestamp: Date.now(),
    };
  } catch (error) {
    clearTimeout(timeout);
    console.error('Ollama API error:', error);
    throw error;
  }
}

/**
 * Réponse de fallback quand tout échoue
 */
function getFallbackResponse(): AIResponse {
  const responses: string[] = [
    "Je suis TITANE∞, mais mes services IA sont temporairement indisponibles. Vérifie ta connexion et tes clés API.",
    "Systèmes IA en mode dégradé. Impossible de générer une réponse pour le moment.",
    "Erreur de connexion aux services IA. Assure-toi que Gemini API ou Ollama sont configurés.",
  ];

  return {
    content: responses[Math.floor(Math.random() * responses.length)] as string,
    provider: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Point d'entrée principal : OFFLINE FIRST
 * Local (Ollama) > Cloud (Gemini si activé) > Fallback
 */
export async function askTitan(
  message: string,
  history: AIMessage[] = []
): Promise<AIResponse> {
  const sanitized = sanitizeMessage(message);

  if (!sanitized) {
    throw new Error('Message vide ou invalide');
  }

  const config = getAIConfig();
  const onlineEnabled = isOnlineModeEnabled();

  // ═══════════════════════════════════════════════════════════
  // PRIORITÉ 1 : LOCAL FIRST (Ollama)
  // ═══════════════════════════════════════════════════════════
  
  if (config.localFirst || !onlineEnabled) {
    try {
      console.log('🤖 [LOCAL FIRST] Tentative Ollama...');
      const response = await callOllama(sanitized, history);
      console.log('✅ Ollama OK');
      return response;
    } catch (error) {
      console.warn('⚠️ Ollama non disponible');
      
      // Si mode local strict, pas de fallback cloud
      if (!onlineEnabled) {
        console.log('🏠 Mode Local strict - Fallback local');
        return getFallbackResponse();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PRIORITÉ 2 : CLOUD (Gemini) - SI ACTIVÉ UNIQUEMENT
  // ═══════════════════════════════════════════════════════════
  
  if (onlineEnabled && GEMINI_API_KEY) {
    // Demander confirmation utilisateur
    const confirmed = await confirmCloudAPIUsage(
      'Gemini AI',
      'Ollama local non disponible'
    );
    
    if (confirmed) {
      try {
        console.log('🌐 [CLOUD MODE] Tentative Gemini API...');
        const response = await callGemini(sanitized, history);
        console.log('✅ Gemini OK');
        return response;
      } catch (error) {
        console.warn('⚠️ Gemini échoué');
      }
    } else {
      console.log('❌ Accès cloud refusé par l\'utilisateur');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FALLBACK : Réponses locales
  // ═══════════════════════════════════════════════════════════
  
  console.log('⚠️ Fallback local activé');
  return getFallbackResponse();
}

/**
 * Stream une réponse (si supporté par le provider)
 */
export async function* streamTitanResponse(
  message: string,
  history: AIMessage[] = []
): AsyncGenerator<string> {
  // Pour l'instant, on simule le streaming avec la réponse complète
  // TODO: Implémenter vrai streaming Gemini/Ollama
  const response = await askTitan(message, history);
  
  // Simule le streaming caractère par caractère
  for (let i = 0; i < response.content.length; i++) {
    yield response.content[i] as string;
    await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay
  }
}

export default {
  askTitan,
  streamTitanResponse,
};
