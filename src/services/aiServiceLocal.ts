/**
 * TITANE∞ v19.2.0 - AI Service (Tauri-Only Mode)
 * ═══════════════════════════════════════════════
 *
 * 🔒 100% LOCAL BY DEFAULT
 * External APIs disabled unless explicitly enabled in featureFlags.ts
 */

import { FEATURE_FLAGS, isAIProviderEnabled } from '../config/featureFlags';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
  provider: 'ollama' | 'builtin' | 'disabled';
  timestamp: number;
}

/**
 * ═══════════════════════════════════════════════
 * BUILT-IN RESPONSES (Always Available - No Network)
 * ═══════════════════════════════════════════════
 */
const BUILTIN_RESPONSES = {
  greeting: [
    "Bonjour ! Je suis TITANE∞, votre assistant cognitif local. Comment puis-je vous aider ?",
    "Salut ! TITANE∞ ici, prêt à vous assister. Que souhaitez-vous savoir ?",
  ],
  help: [
    "Je peux vous aider avec : l'analyse du système, la gestion de la mémoire, les commandes Tauri, et bien plus.",
    "TITANE∞ dispose de nombreuses capacités : monitoring système, auto-vérification, gestion de la mémoire cognitive.",
  ],
  status: [
    "Tous les systèmes TITANE∞ sont opérationnels. Mode: 100% local.",
    "✅ Statut: STABLE | Mode: LOCAL | Moteurs: ACTIFS",
  ],
  default: [
    "Je traite votre demande en mode local. Pour des réponses plus avancées, activez Ollama (localhost:11434).",
    "Requête reçue. TITANE∞ fonctionne en mode local. Utilisez les commandes Tauri pour des actions spécifiques.",
  ],
};

/**
 * ═══════════════════════════════════════════════
 * INTELLIGENT FALLBACK (No Network Required)
 * ═══════════════════════════════════════════════
 */
function generateBuiltinResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Pattern matching pour réponses contextuelles
  if (lowerMessage.match(/bonjour|salut|hello|hi/)) {
    return BUILTIN_RESPONSES.greeting[Math.floor(Math.random() * BUILTIN_RESPONSES.greeting.length)];
  }

  if (lowerMessage.match(/aide|help|comment/)) {
    return BUILTIN_RESPONSES.help[Math.floor(Math.random() * BUILTIN_RESPONSES.help.length)];
  }

  if (lowerMessage.match(/statut|status|état/)) {
    return BUILTIN_RESPONSES.status[Math.floor(Math.random() * BUILTIN_RESPONSES.status.length)];
  }

  // Détection de commandes TITANE∞
  if (lowerMessage.match(/mémoire|memory|singularité/)) {
    return "🧠 Système de mémoire TITANE∞ : Utilisez le panneau Singularity Monitor pour visualiser l'état cognitif.";
  }

  if (lowerMessage.match(/helios|system|système/)) {
    return "🔆 Moteur Helios : Monitoring système actif. Consultez le Control Panel pour les métriques détaillées.";
  }

  // Réponse par défaut
  return BUILTIN_RESPONSES.default[Math.floor(Math.random() * BUILTIN_RESPONSES.default.length)];
}

/**
 * ═══════════════════════════════════════════════
 * OLLAMA LOCAL (Optional - Localhost Only)
 * ═══════════════════════════════════════════════
 */
async function callOllamaLocal(message: string, history: AIMessage[] = []): Promise<AIResponse> {
  if (!isAIProviderEnabled('ollama')) {
    throw new Error('Ollama provider is disabled in featureFlags.ts');
  }

  const OLLAMA_URL = 'http://localhost:11434/api/generate';

  try {
    // Test de disponibilité rapide (200ms timeout)
    const testController = new AbortController();
    const testTimeout = setTimeout(() => testController.abort(), 200);

    await fetch('http://localhost:11434/api/tags', {
      signal: testController.signal,
    });
    clearTimeout(testTimeout);

    // Ollama disponible, envoi de la requête
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Tu es TITANE∞. ${message}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.response || generateBuiltinResponse(message),
      provider: 'ollama',
      timestamp: Date.now(),
    };

  } catch (error) {
    // Ollama non disponible, fallback sur built-in
    console.log('Ollama not available, using built-in responses');
    return {
      content: generateBuiltinResponse(message),
      provider: 'builtin',
      timestamp: Date.now(),
    };
  }
}

/**
 * ═══════════════════════════════════════════════
 * MAIN AI SERVICE (100% Local)
 * ═══════════════════════════════════════════════
 */
export async function sendMessage(
  message: string,
  history: AIMessage[] = []
): Promise<AIResponse> {
  // Validation input
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  const sanitizedMessage = message.trim().substring(0, 10000);

  // Ordre de priorité: Ollama (local) > Built-in
  if (isAIProviderEnabled('ollama')) {
    try {
      return await callOllamaLocal(sanitizedMessage, history);
    } catch (error) {
      console.warn('Ollama failed, falling back to built-in:', error);
    }
  }

  // Fallback: Built-in responses (toujours disponible)
  return {
    content: generateBuiltinResponse(sanitizedMessage),
    provider: 'builtin',
    timestamp: Date.now(),
  };
}

/**
 * ═══════════════════════════════════════════════
 * SYSTEM STATUS
 * ═══════════════════════════════════════════════
 */
export function getAIStatus(): {
  mode: string;
  providers: string[];
  networkRequired: boolean;
} {
  return {
    mode: '100% LOCAL',
    providers: ['builtin', ...(isAIProviderEnabled('ollama') ? ['ollama (optional)'] : [])],
    networkRequired: false,
  };
}

/**
 * ═══════════════════════════════════════════════
 * VALIDATION (Tauri-Only Mode Check)
 * ═══════════════════════════════════════════════
 */
export function validateTauriOnlyCompliance(): boolean {
  // Vérifie qu'aucune API externe n'est activée
  const violations = [
    FEATURE_FLAGS.ENABLE_EXTERNAL_AI && 'External AI enabled',
    FEATURE_FLAGS.AI_PROVIDERS.gemini && 'Gemini API enabled',
    FEATURE_FLAGS.AI_PROVIDERS.openai && 'OpenAI API enabled',
  ].filter(Boolean);

  if (violations.length > 0) {
    console.error('❌ Tauri-Only Mode Violations:', violations);
    return false;
  }

  console.log('✅ AI Service: Tauri-Only Mode COMPLIANT');
  return true;
}

// Auto-validation en mode dev
if (FEATURE_FLAGS.DEV_MODE) {
  validateTauriOnlyCompliance();
}
