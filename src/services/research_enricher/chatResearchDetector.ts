/**
 * Chat Research Detector — identifies research intent in user messages
 * and extracts structured search information.
 * Ring 3 pure utility — no I/O, no side effects.
 */

export type ResearchIntent =
  | 'search'
  | 'analysis'
  | 'study'
  | 'comparison'
  | 'explanation'
  | 'list'
  | 'none';

export interface ResearchDetectionResult {
  isResearch: boolean;
  intent: ResearchIntent;
  confidence: number;
  extractedTerms: string[];
}

// French and English research trigger patterns with associated intent
const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  intent: ResearchIntent;
  weight: number;
}> = [
  {
    pattern: /\b(compare[zr]?|comparaison|diff[eé]rence entre|vs\.?|versus)\b/i,
    intent: 'comparison',
    weight: 0.9,
  },
  {
    pattern: /\b(analyse[zr]?|analyser?|[eé]tudier?|[eé]tudie[zr]?)\b/i,
    intent: 'analysis',
    weight: 0.85,
  },
  {
    pattern: /\b(recherche|rechercher?|cherche[zr]?|trouve[zr]?|trouver)\b/i,
    intent: 'search',
    weight: 0.8,
  },
  {
    pattern:
      /\b(explique[zr]?|expliquer|qu.?est.?ce que|c.?est quoi|d[eé]finis|d[eé]finition)\b/i,
    intent: 'explanation',
    weight: 0.85,
  },
  {
    pattern: /\b(liste[zr]?|lister|[eé]num[eè]re|quels? sont|quelles? sont)\b/i,
    intent: 'list',
    weight: 0.8,
  },
  {
    pattern:
      /\b(comment fonctionne|comment [a-z]+.?il|pourquoi|m[eé]canisme|principe)\b/i,
    intent: 'explanation',
    weight: 0.8,
  },
  {
    pattern:
      /\b([eé]tude|[eé]tudier?|recherche scientifique|[eé]vidence|preuve|donn[eé]es)\b/i,
    intent: 'study',
    weight: 0.75,
  },
  {
    pattern: /\b(qu.?est.?ce|c.?est quoi|d[eé]cris|d[eé]crire)\b/i,
    intent: 'explanation',
    weight: 0.7,
  },
  {
    pattern: /\b(search|find|look up|what is|how does|explain|describe|list)\b/i,
    intent: 'search',
    weight: 0.75,
  },
  {
    pattern: /\b(analyze|analyse|compare|study|research)\b/i,
    intent: 'analysis',
    weight: 0.75,
  },
];

const STOP_WORDS_FR = new Set([
  'le',
  'la',
  'les',
  'de',
  'du',
  'des',
  'un',
  'une',
  'et',
  'ou',
  'en',
  'à',
  'au',
  'aux',
  'ce',
  'qui',
  'que',
  'pour',
  'par',
  'sur',
  'avec',
  'dans',
  'est',
  'sont',
  'se',
  'si',
  'ne',
  'pas',
  'plus',
  'moi',
  'toi',
  'il',
  'elle',
  'ils',
  'elles',
  'nous',
  'vous',
  'je',
  'tu',
  'on',
]);

/**
 * Detects whether a chat message has research intent.
 */
export function isResearchQuery(message: string): boolean {
  return detectResearchIntent(message).isResearch;
}

/**
 * Returns detailed research intent analysis for a message.
 */
export function detectResearchIntent(message: string): ResearchDetectionResult {
  if (!message || message.trim().length < 5) {
    return { isResearch: false, intent: 'none', confidence: 0, extractedTerms: [] };
  }

  let maxWeight = 0;
  let detectedIntent: ResearchIntent = 'none';

  for (const { pattern, intent, weight } of INTENT_PATTERNS) {
    if (pattern.test(message)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        detectedIntent = intent;
      }
    }
  }

  const isResearch = maxWeight >= 0.7;
  const extractedTerms = isResearch ? extractSearchTerms(message) : [];

  return {
    isResearch,
    intent: detectedIntent,
    confidence: maxWeight,
    extractedTerms,
  };
}

/**
 * Extracts meaningful search terms from a user message,
 * removing stop words and common filler phrases.
 */
export function extractSearchTerms(message: string): string[] {
  // Remove question marks, punctuation noise
  const cleaned = message
    .replace(/[?!.,;:()[\]"']/g, ' ')
    .replace(/\b(est.?ce que?|qu.?est.?ce que?|c.?est quoi)\b/gi, ' ')
    .replace(/\b(recherche[zr]?|cherche[zr]?|explique[zr]?|liste[zr]?)\b/gi, ' ')
    .replace(/\b(comment|pourquoi|quand|où|combien)\b/gi, ' ')
    .trim();

  const terms = cleaned
    .split(/\s+/)
    .map(t => t.toLowerCase().trim())
    .filter(t => t.length > 2 && !STOP_WORDS_FR.has(t));

  // Deduplicate preserving order
  const seen = new Set<string>();
  return terms.filter(t => {
    if (seen.has(t)) {
      return false;
    }
    seen.add(t);
    return true;
  });
}

/**
 * Builds an enriched prompt for the LLM that includes KB context and optional web results.
 */
export function buildResearchPrompt(
  message: string,
  kbContext: string,
  webResults?: string
): string {
  const parts: string[] = [];

  if (kbContext) {
    parts.push(
      `--- Contexte base de connaissances TITANE ---\n${kbContext}\n--- Fin contexte KB ---`
    );
  }

  if (webResults) {
    parts.push(
      `--- Résultats de recherche web enrichis ---\n${webResults}\n--- Fin résultats web ---`
    );
  }

  if (parts.length > 0) {
    parts.push(`Question de l'utilisateur : ${message}`);
    return parts.join('\n\n');
  }

  return message;
}
