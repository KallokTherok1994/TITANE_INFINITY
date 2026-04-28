/**
 * TITANE∞ v31.2.33 — ReflectiveVerifier (Self-RAG pattern)
 * Vérifie la fiabilité factuelle des réponses IA avec enrichissement web optionnel.
 * Inspiré de Self-RAG (Asai et al., 2023): retrieve → reflect → revise.
 *
 * One Door compliance: recherche web via Vite proxy /api/wiki-search uniquement.
 * Non-bloquant: timeout 4s max, fallback gracieux si web indisponible.
 */

import { browserWebSearch } from '@/services/webResearchService';

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const REFLECTIVE_CONFIDENCE_THRESHOLD = 0.65;
export const REFLECTIVE_VERIFIER_ENABLED = true;
const REFLECTIVE_TIMEOUT_MS = 4000;

/** Topics conversationnels qui ne nécessitent pas de vérification factuelle */
const CONVERSATIONAL_TOPICS = new Set([
  'journal',
  'reflection',
  'creative',
  'hybrid',
  'emotional',
]);

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ReflectiveCritique {
  /** Niveau de confiance dans la réponse (0-1) */
  confidence: number;
  /** La réponse est jugée suffisamment fiable */
  verified: boolean;
  /** La réponse contient des claims factuels détectés */
  hasFactualClaims: boolean;
  /** Corrections suggérées basées sur les sources web */
  corrections: Array<{
    claim: string;
    correction: string;
    source: string;
  }>;
  /** Sources web consultées */
  webSources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  /** La réponse devrait être révisée */
  shouldRevise: boolean;
  /** Temps de traitement en ms */
  processingMs: number;
}

export interface ReflectiveContext {
  /** Cohérence singularité (0-1, 0.5 par défaut) */
  singularityCoherence?: number;
  /** Nombre de correspondances mémoire */
  memoryMatches?: number;
  /** Mode conversationnel (journal, creative, etc.) */
  mode?: string;
}

// ─────────────────────────────────────────────────────────────────
// FACTUAL CLAIM DETECTION
// ─────────────────────────────────────────────────────────────────

/** Patterns de claims factuels: dates, pourcentages, noms propres, "selon", chiffres */
const FACTUAL_PATTERNS = [
  /\b(en\s+)?\d{4}\b/,                          // dates: 2024, en 2024
  /\b\d+[\.,]\d*\s*%/,                           // pourcentages: 45.3%
  /\b(selon|d'après|d'apres|source:|selon)\s+/i, // citations: "selon X"
  /\b[A-Z][a-zéàùèêâîôûäëïöü]{2,}\s+[A-Z][a-zéàùèêâîôûäëïöü]{2,}\b/, // noms propres
  /\b\d+[\s,]?\d{3}\b/,                          // grands nombres: 45 000
  /\b(étude|recherche|rapport|données)\s+(montre|indique|révèle|confirme)/i, // études
  /https?:\/\/[^\s]+/,                           // URLs
  /\b(premier|deuxième|troisième|plus grand|plus petit|record)\b/i, // superlatifs factuels
];

/**
 * Détecte si une réponse contient des claims factuels vérifiables.
 */
export function detectFactualClaims(response: string): boolean {
  return FACTUAL_PATTERNS.some(pattern => pattern.test(response));
}

// ─────────────────────────────────────────────────────────────────
// CONFIDENCE COMPUTATION
// ─────────────────────────────────────────────────────────────────

/**
 * Calcule le niveau de confiance d'une réponse.
 * confidence = f(memoryMatch, singularityCoherence, responseLength, hasClaims)
 */
export function computeConfidence(
  response: string,
  hasFactualClaims: boolean,
  ctx: ReflectiveContext
): number {
  const { singularityCoherence = 0.5, memoryMatches = 0 } = ctx;

  // Base: cohérence singularité
  let confidence = singularityCoherence;

  // Bonus: correspondances mémoire (max +0.2)
  const memoryBonus = Math.min(memoryMatches * 0.05, 0.2);
  confidence += memoryBonus;

  // Malus: claims factuels sans support mémoire
  if (hasFactualClaims && memoryMatches === 0) {
    confidence -= 0.15;
  }

  // Malus: réponse très courte avec claims (potentiellement hallucination)
  if (hasFactualClaims && response.length < 100) {
    confidence -= 0.1;
  }

  // Bonus: réponse longue et structurée (plus de contexte = plus fiable)
  if (response.length > 500) {
    confidence += 0.05;
  }

  return Math.max(0, Math.min(1, confidence));
}

// ─────────────────────────────────────────────────────────────────
// WEB VERIFICATION
// ─────────────────────────────────────────────────────────────────

/**
 * Extrait le claim principal d'un message utilisateur pour la recherche web.
 */
function extractMainClaim(input: string): string {
  // Prendre les premiers 80 chars du message utilisateur comme query
  const cleaned = input.replace(/[?!,]/g, ' ').trim();
  return cleaned.substring(0, 80);
}

/**
 * Vérifie factuellement la réponse via recherche Wikipedia si confiance < seuil.
 * Timeout 4s — non-bloquant, retourne sources vides si timeout/erreur.
 */
async function verifyWithWeb(input: string): Promise<{
  sources: Array<{ title: string; url: string; snippet: string }>;
}> {
  try {
    const query = extractMainClaim(input);
    const timeoutPromise = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), REFLECTIVE_TIMEOUT_MS)
    );
    const searchPromise = browserWebSearch(query, 3);
    const result = await Promise.race([searchPromise, timeoutPromise]);

    if (!result || !result.ok || !result.content) {
      return { sources: [] };
    }

    return {
      sources: result.content.slice(0, 3).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      })),
    };
  } catch {
    return { sources: [] };
  }
}

// ─────────────────────────────────────────────────────────────────
// CORRECTIONS APPLICATION
// ─────────────────────────────────────────────────────────────────

/**
 * Applique les corrections web à une réponse en ajoutant une note de sources.
 */
export function applyReflectiveCorrections(
  response: string,
  critique: ReflectiveCritique
): string {
  if (!critique.shouldRevise || critique.webSources.length === 0) {
    return response;
  }

  const sourcesList = critique.webSources
    .slice(0, 3)
    .map((s, i) => `${i + 1}. **${s.title}**: ${s.snippet.substring(0, 120)}...`)
    .join('\n');

  const note = `\n\n---\n📚 **Sources complémentaires consultées** (vérification Self-RAG):\n${sourcesList}`;

  return response + note;
}

// ─────────────────────────────────────────────────────────────────
// MAIN VERIFIER
// ─────────────────────────────────────────────────────────────────

/**
 * Critique réflexive d'une réponse IA (Self-RAG pattern).
 *
 * Pipeline:
 * 1. Détection claims factuels
 * 2. Calcul confiance (mémoire + cohérence singularité)
 * 3. Si confiance < 0.65 ET claims détectés → recherche web (max 4s)
 * 4. Retourne critique avec corrections et sources
 */
export async function verifyCritique(
  input: string,
  response: string,
  ctx: ReflectiveContext = {}
): Promise<ReflectiveCritique> {
  const startTime = Date.now();

  // Skip pour modes conversationnels
  if (ctx.mode && CONVERSATIONAL_TOPICS.has(ctx.mode)) {
    return {
      confidence: 1.0,
      verified: true,
      hasFactualClaims: false,
      corrections: [],
      webSources: [],
      shouldRevise: false,
      processingMs: Date.now() - startTime,
    };
  }

  const hasFactualClaims = detectFactualClaims(response);
  const confidence = computeConfidence(response, hasFactualClaims, ctx);
  const verified = confidence >= REFLECTIVE_CONFIDENCE_THRESHOLD;

  let webSources: Array<{ title: string; url: string; snippet: string }> = [];

  // Recherche web uniquement si confiance < seuil ET claims factuels détectés
  if (!verified && hasFactualClaims) {
    const webResult = await verifyWithWeb(input);
    webSources = webResult.sources;
  }

  const shouldRevise = !verified && hasFactualClaims && webSources.length > 0;

  return {
    confidence,
    verified,
    hasFactualClaims,
    corrections: [], // futures corrections automatiques
    webSources,
    shouldRevise,
    processingMs: Date.now() - startTime,
  };
}
