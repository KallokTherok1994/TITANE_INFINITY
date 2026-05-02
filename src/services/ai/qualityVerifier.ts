/**
 * TITANE∞ v31.2.38 — Quality Verifier
 *
 * Heuristic-only (no LLM call) post-generation quality check.
 * Complements reflectiveVerifier (fact-checking) by evaluating:
 *   - alignment:    does the response actually address the question?
 *   - completeness: are all sub-questions in the message covered?
 *   - depth match:  is the response depth consistent with the expected profile?
 *
 * All computations are synchronous and < 5 ms. The caller should wrap this in
 * a 200 ms timeout guard to remain non-blocking in the main pipeline.
 */

import type { ResponseProfileId } from './responsePolicy';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface QualityCritique {
  /** 0–1: response addresses the core question tokens. */
  alignmentScore: number;
  /** 0–1: sub-questions in message are covered (1.0 when no sub-questions). */
  completenessScore: number;
  /** 0–1: response length vs. minimum expected for the profile. */
  depthMatchScore: number;
  /** Weighted average of the three dimensions. */
  overallScore: number;
  /** true when overallScore < QUALITY_THRESHOLD. */
  shouldEnhance: boolean;
  /** Short, actionable hint to guide a potential enhancement pass. */
  enhancementHint: string;
}

// Threshold below which shouldEnhance is set to true.
export const QUALITY_THRESHOLD = 0.65;

// Minimum word count targets per profile (approximate prose words).
const PROFILE_MIN_WORDS: Record<ResponseProfileId, number> = {
  DIRECT: 40,
  BALANCED: 150,
  DEVELOPED: 350,
  DEEP: 600,
  ARCHITECT: 800,
  OMEGA: 1200,
};

// Weights for the overall score.
const WEIGHTS = { alignment: 0.45, completeness: 0.3, depth: 0.25 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Shared stop-words (FR + EN) — identical to chatEngine STOP_WORDS for consistency. */
const STOP_WORDS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'et',
  'ou',
  'de',
  'du',
  'au',
  'aux',
  'ce',
  'est',
  'sont',
  'je',
  'tu',
  'il',
  'elle',
  'nous',
  'vous',
  'ils',
  'elles',
  'que',
  'qui',
  'quoi',
  'dont',
  'comment',
  'pourquoi',
  'quand',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'this',
  'that',
  'these',
  'those',
  'with',
  'from',
  'for',
  'into',
  'and',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9\s'-]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Jaccard-like keyword coverage: what fraction of question keywords appear in the response.
 */
function computeAlignmentScore(question: string, response: string): number {
  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0) return 1.0;
  const rText = response.toLowerCase();
  let hits = 0;
  for (const token of qTokens) {
    if (rText.includes(token)) hits++;
  }
  return hits / qTokens.size;
}

/**
 * Split a question into sub-questions by '?' boundaries.
 * Returns 1 when there is only a single question (no splitting needed).
 */
function splitSubQuestions(question: string): string[] {
  const parts = question
    .split('?')
    .map(p => p.trim())
    .filter(p => p.length > 8);
  return parts.length > 1 ? parts : [question];
}

function computeCompletenessScore(question: string, response: string): number {
  const subQs = splitSubQuestions(question);
  if (subQs.length <= 1) return 1.0;
  const rText = response.toLowerCase();
  let covered = 0;
  for (const sub of subQs) {
    const subTokens = tokenize(sub);
    if (subTokens.length === 0) {
      covered++;
      continue;
    }
    const hits = subTokens.filter(t => rText.includes(t)).length;
    if (hits / subTokens.length >= 0.4) covered++;
  }
  return covered / subQs.length;
}

function computeDepthMatchScore(response: string, profileId: ResponseProfileId): number {
  const words = countWords(response);
  const minWords = PROFILE_MIN_WORDS[profileId] ?? 150;
  if (words >= minWords) return 1.0;
  return Math.max(0, words / minWords);
}

function buildEnhancementHint(
  alignment: number,
  completeness: number,
  depth: number,
  profileId: ResponseProfileId
): string {
  if (alignment < 0.4)
    return 'La réponse ne couvre pas suffisamment les termes-clés de la question.';
  if (completeness < 0.5)
    return 'Certaines sous-questions ne semblent pas traitées dans la réponse.';
  if (depth < 0.5) {
    const minWords = PROFILE_MIN_WORDS[profileId] ?? 150;
    return `La réponse est trop courte pour le profil ${profileId} (minimum ~${minWords} mots attendus).`;
  }
  return 'Qualité acceptable — aucun enrichissement prioritaire identifié.';
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate the quality of a generated response against the original question
 * and the expected response profile. Fully synchronous; no network call.
 *
 * @param question       The validated user message.
 * @param response       The final response text (after shaping/sanitization).
 * @param profileId      The ResponseProfileId used for this turn.
 */
export function evaluateResponseQuality(
  question: string,
  response: string,
  profileId: ResponseProfileId
): QualityCritique {
  const alignmentScore = computeAlignmentScore(question, response);
  const completenessScore = computeCompletenessScore(question, response);
  const depthMatchScore = computeDepthMatchScore(response, profileId);

  const overallScore =
    alignmentScore * WEIGHTS.alignment +
    completenessScore * WEIGHTS.completeness +
    depthMatchScore * WEIGHTS.depth;

  const shouldEnhance = overallScore < QUALITY_THRESHOLD;
  const enhancementHint = buildEnhancementHint(
    alignmentScore,
    completenessScore,
    depthMatchScore,
    profileId
  );

  return {
    alignmentScore,
    completenessScore,
    depthMatchScore,
    overallScore,
    shouldEnhance,
    enhancementHint,
  };
}
