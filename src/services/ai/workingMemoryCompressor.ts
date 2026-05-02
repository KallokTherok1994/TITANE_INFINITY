/**
 * TITANE∞ v31.2.33 — WorkingMemoryCompressor
 * Compresse l'historique de conversation long pour réduire le token budget.
 * Inspiré de Memory Survey (Wang et al., 2024): compression sélective par ancres.
 *
 * Design:
 * - Ancres préservées: messages[0..2] + messages[-2..-1] + messages avec marqueurs importants
 * - Corps: résumé condensé des messages intermédiaires
 * - Budget token estimé par compte de caractères (~4 chars/token)
 * - Non-bloquant: timeout 5s sur l'appel résumé Ollama, fallback: troncature directe
 * - One Door: résumé via /api/ollama uniquement
 */

import type { AIMessage } from '@/services/ai/types';

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const COMPRESSION_HISTORY_THRESHOLD = 20;
const DEFAULT_MAX_BUDGET = 4000; // tokens estimés (~16000 chars)
const CHARS_PER_TOKEN = 4;
const SUMMARY_TIMEOUT_MS = 5000;
const OLLAMA_ENDPOINT = '/api/ollama';

/** Marqueurs de messages importants à préserver comme ancres */
const ANCHOR_MARKERS = [
  /décision\s*:/i,
  /fait\s*:/i,
  /important\s*:/i,
  /à retenir\s*:/i,
  /conclusion\s*:/i,
  /résumé\s*:/i,
  /decision:/i,
  /remember:/i,
  /key point:/i,
];

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface CompressedContext {
  /** Messages après compression (ancres + résumé sous forme de message système) */
  messages: AIMessage[];
  /** Résumé des messages compressés */
  summary: string;
  /** Ratio de compression: messages.length / originalLength */
  compressionRatio: number;
  /** Longueur originale */
  originalLength: number;
  /** Budget token estimé après compression */
  estimatedTokens: number;
}

// ─────────────────────────────────────────────────────────────────
// ANCHOR DETECTION
// ─────────────────────────────────────────────────────────────────

/** Détecte si un message est une ancre à préserver */
export function isAnchorMessage(msg: AIMessage): boolean {
  return ANCHOR_MARKERS.some(pattern => pattern.test(msg.content));
}

/** Estime le nombre de tokens d'un texte */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ─────────────────────────────────────────────────────────────────
// SUMMARY GENERATION
// ─────────────────────────────────────────────────────────────────

/**
 * Génère un résumé condensé des messages intermédiaires via Ollama.
 * Timeout 5s — retourne null si indisponible.
 */
async function generateSummary(messages: AIMessage[]): Promise<string | null> {
  if (messages.length === 0) return null;

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'U' : 'A'}: ${m.content.substring(0, 200)}`)
    .join('\n');

  const prompt = `Résume en 3-5 phrases les points essentiels de cette conversation:\n${conversationText}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);

    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma2:2b',
        prompt,
        stream: false,
        options: { num_predict: 200, temperature: 0.1 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    return (data?.response as string) || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// COMPRESSOR
// ─────────────────────────────────────────────────────────────────

/**
 * Sélectionne les messages ancres à préserver obligatoirement.
 */
export function selectAnchors(messages: AIMessage[]): {
  anchors: AIMessage[];
  body: AIMessage[];
} {
  if (messages.length === 0) return { anchors: [], body: [] };

  const anchorSet = new Set<number>();

  // Premiers 3 messages (contexte initial)
  for (let i = 0; i < Math.min(3, messages.length); i++) {
    anchorSet.add(i);
  }

  // Derniers 2 messages (contexte récent)
  for (let i = Math.max(0, messages.length - 2); i < messages.length; i++) {
    anchorSet.add(i);
  }

  // Messages avec marqueurs importants
  messages.forEach((msg, i) => {
    if (isAnchorMessage(msg)) anchorSet.add(i);
  });

  const anchors: AIMessage[] = [];
  const body: AIMessage[] = [];

  messages.forEach((msg, i) => {
    if (anchorSet.has(i)) anchors.push(msg);
    else body.push(msg);
  });

  return { anchors, body };
}

/**
 * Compresse l'historique de conversation si au-dessus du seuil.
 *
 * Pipeline:
 * 1. Si messages.length <= threshold → retourner inchangé
 * 2. Sélectionner ancres (premiers/derniers + marqueurs importants)
 * 3. Résumé des messages intermédiaires via Ollama (timeout 5s)
 * 4. Injecter résumé comme message système entre ancres initiales et finales
 * 5. Retourner messages compressés + métadonnées
 */
export async function compress(
  messages: AIMessage[],
  maxBudget = DEFAULT_MAX_BUDGET
): Promise<CompressedContext> {
  const originalLength = messages.length;

  // Pas de compression nécessaire
  if (messages.length <= COMPRESSION_HISTORY_THRESHOLD) {
    return {
      messages,
      summary: '',
      compressionRatio: 1.0,
      originalLength,
      estimatedTokens: estimateTokens(messages.map(m => m.content).join(' ')),
    };
  }

  const { anchors, body } = selectAnchors(messages);

  // Séparer ancres initiales (idx < 3) et finales (idx >= messages.length - 2)
  const initialAnchors = messages.slice(0, Math.min(3, messages.length));
  const finalAnchors = messages.slice(Math.max(0, messages.length - 2));
  const midAnchors = anchors.filter(
    a => !initialAnchors.includes(a) && !finalAnchors.includes(a)
  );

  // Générer résumé des messages du corps
  const summary = (await generateSummary(body)) || buildFallbackSummary(body);

  // Créer message système de résumé
  const summaryMessage: AIMessage = {
    role: 'system',
    content: `[RÉSUMÉ CONVERSATION PRÉCÉDENTE]\n${summary}`,
    timestamp: Date.now(),
  };

  // Reconstruire: ancres initiales + résumé + ancres milieu + ancres finales
  const compressed: AIMessage[] = [
    ...initialAnchors,
    summaryMessage,
    ...midAnchors,
    ...finalAnchors,
  ];

  // Vérifier budget token et tronquer si dépassé
  const totalText = compressed.map(m => m.content).join(' ');
  const estimatedTokens = estimateTokens(totalText);

  let finalMessages = compressed;
  if (estimatedTokens > maxBudget) {
    // Fallback: garder seulement initialAnchors + résumé + finalAnchors
    finalMessages = [...initialAnchors, summaryMessage, ...finalAnchors];
  }

  return {
    messages: finalMessages,
    summary,
    compressionRatio: finalMessages.length / originalLength,
    originalLength,
    estimatedTokens: estimateTokens(finalMessages.map(m => m.content).join(' ')),
  };
}

/** Résumé de secours sans Ollama: concatène les débuts des messages */
function buildFallbackSummary(messages: AIMessage[]): string {
  if (messages.length === 0) return 'Conversation précédente.';
  return messages
    .slice(0, 5)
    .map(
      m =>
        `${m.role === 'user' ? 'Utilisateur' : 'TITANE'}: ${m.content.substring(0, 100)}`
    )
    .join(' | ');
}
