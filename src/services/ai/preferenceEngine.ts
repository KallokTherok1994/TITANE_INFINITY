/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   PREFERENCE ENGINE — Durable preference extraction, noise filtering,
 *   durability scoring, and preference-aware response shaping
 *
 *   PRIMARY REAL LOCK RESOLVED:
 *   "No durable preference learning and no preference-aware response shaping"
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('PreferenceEngine');

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/** Preference categories that TITANE can learn */
export type PreferenceCategory =
  | 'structure' // lists, headers, sections, formatting
  | 'depth' // short, standard, developed, deep
  | 'tone' // direct, reflective, formal, casual
  | 'format' // code blocks, tables, steps, prose
  | 'terminology' // repeated project-specific terms
  | 'action_bias' // "act without asking" contexts
  | 'mode_context'; // "always deep for architecture", "always short for greetings"

/** A single durable preference */
export interface DurablePreference {
  id: string;
  category: PreferenceCategory;
  value: string;
  durability: number; // 0.0-1.0: how stable/confirmed this preference is
  confidence: number; // 0.0-1.0: how confident we are in extraction
  lastSeen: number; // timestamp
  firstSeen: number; // timestamp
  source: 'explicit' | 'implicit' | 'pattern';
  timesConfirmed: number; // how many times this preference was reinforced
  metadata?: Record<string, unknown>;
}

/** Result of preference extraction from a message */
export interface PreferenceExtractionResult {
  preferences: DurablePreference[];
  isNoise: boolean;
  noiseReason?: string;
  signals: string[];
}

/** Configuration for preference extraction */
export interface PreferenceEngineConfig {
  minConfidence: number; // minimum confidence to store (default: 0.6)
  durabilityDecayDays: number; // days before durability starts decaying (default: 30)
  maxPreferences: number; // max stored preferences (default: 100)
  noiseStrictness: 'low' | 'medium' | 'high';
}

// ─────────────────────────────────────────────────────────────────
// NOISE DETECTION — Reject dev/test/debug artifacts
// ─────────────────────────────────────────────────────────────────

/** Patterns that indicate dev/test noise — NEVER store as preference */
const NOISE_PATTERNS: RegExp[] = [
  /\[MOCK\]/i,
  /\[DEBUG\]/i,
  /\[TEST\]/i,
  /\[STUB\]/i,
  /\[PLACEHOLDER\]/i,
  /test output:/i,
  /debug output:/i,
  /console\.log/i,
  /printf?\(/i,
  /TODO:/i,
  /FIXME:/i,
  /HACK:/i,
  /workaround/i,
  /temporary/i,
  /dummy/i,
  /mock response/i,
  /fake data/i,
  /sample output/i,
  /placeholder response/i,
  /^test\s*$/i,
  /^debug\s*$/i,
  /^lorem ipsum/i,
  /^hello world$/i,
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // raw timestamps
  /^\s*\{.*"timestamp".*\}\s*$/, // raw JSON logs
  /^error:/i,
  /^exception:/i,
  /^trace:/i,
  /^stack:/i,
  /^warn:/i,
  /^info:/i,
  // LLM generic noise — phrases that indicate the user is pasting LLM output
  /^en tant qu[''e]/i,
  /^as an ai/i,
  /^i am an ai/i,
  /^i don't have/i,
  /^je n'ai pas d'opinion/i,
  /^en tant que modèle/i,
  /^comme intelligence artificielle/i,
  /^voici une réponse générique/i,
  /^here is a generic/i,
  /^certainement! voici/i,
  /^sure! here is/i,
  /^absolutely! here/i,
  /^of course! here/i,
  /^bien sûr! voici/i,
  /^c'est une excellente question/i,
  /^that's a great question/i,
  /^let me think about that/i,
  /^laissez-moi réfléchir/i,
  /^réponse générée par/i,
  /^generated response/i,
  /^output from/i,
  /^résultat de/i,
];

/**
 * Detect if a message is dev/test noise
 * Returns { isNoise: boolean, reason?: string }
 */
export function detectNoise(message: string): { isNoise: boolean; reason?: string } {
  const trimmed = message.trim();

  // Very short messages that are just punctuation or numbers
  if (trimmed.length < 3 && !trimmed.match(/[a-zA-ZàâéèêëîïôùûüçœæÀÂÉÈÊËÎÏÔÙÛÜÇŒÆ]/)) {
    return { isNoise: true, reason: 'too-short-non-verbal' };
  }

  // Check against noise patterns
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isNoise: true,
        reason: `pattern-match:${pattern.source.substring(0, 30)}`,
      };
    }
  }

  // Heuristic: messages that are mostly code/JSON without natural language
  const codeCharRatio =
    (trimmed.match(/[{}[\]()<>+=;:,]/g) || []).length / Math.max(trimmed.length, 1);
  if (codeCharRatio > 0.4 && trimmed.length > 20) {
    return { isNoise: true, reason: 'high-code-char-ratio' };
  }

  // Heuristic: messages that are just error traces
  if (
    trimmed.includes('at ') &&
    trimmed.includes('(') &&
    trimmed.includes(')') &&
    trimmed.includes(':')
  ) {
    const lineCount = trimmed.split('\n').length;
    if (lineCount > 3) {
      return { isNoise: true, reason: 'error-trace-suspected' };
    }
  }

  return { isNoise: false };
}

// ─────────────────────────────────────────────────────────────────
// PREFERENCE EXTRACTION — Detect durable signals from user messages
// ─────────────────────────────────────────────────────────────────

/** Extraction rules: pattern → category + value + confidence */
interface ExtractionRule {
  patterns: RegExp[];
  category: PreferenceCategory;
  valueExtractor: (match: RegExpMatchArray, message: string) => string;
  baseConfidence: number;
  signals: string[];
}

const EXTRACTION_RULES: ExtractionRule[] = [
  // STRUCTURE preferences
  {
    patterns: [
      /je préfère\s+(?:les\s+)?(?:réponses?\s+)?(?:avec\s+)?(?:des\s+)?(listes?|étapes?|sections?|titres?|numérot|à puces|structur)/i,
      /préfère\s+(?:les\s+)?(listes?|étapes?|sections?|titres?|structur)/i,
      /j'aime\s+(?:bien\s+)?(?:quand\s+)?(?:les\s+)?(?:réponses?\s+)?sont\s+(structur|organis|avec\s+des\s+(?:listes?|étapes?))/i,
      /(?:always|toujours)\s+(?:use|utilise|avec)\s+(listes?|bullets?|steps?|headers?)/i,
      /fais\s+(?:des?\s+)?(listes?|étapes?|points?|sections?)/i,
      /organise\s+(?:en|avec|par)\s+(listes?|étapes?|sections?|points?)/i,
    ],
    category: 'structure',
    valueExtractor: (_match, message) => {
      if (/listes?|puces|bullets?/i.test(message)) return 'lists';
      if (/étapes?|steps?|numérot/i.test(message)) return 'numbered-steps';
      if (/sections?|titres?|headers?/i.test(message)) return 'sections';
      return 'structured';
    },
    baseConfidence: 0.85,
    signals: ['preference-signal', 'structure'],
  },

  // DEPTH preferences
  {
    patterns: [
      /je préfère\s+(?:les\s+)?(?:réponses?\s+)?(courtes?|concises?|rapides?|brèves?|succinctes?)/i,
      /je préfère\s+(?:les\s+)?(?:réponses?\s+)?(détaillées?|développées?|approfondies?|longues?|complètes?)/i,
      /fais\s+(?:moi\s+)?(?:des?\s+)?(réponses?\s+)?(courtes?|concises?|rapides?|brèves?)/i,
      /fais\s+(?:moi\s+)?(?:des?\s+)?(réponses?\s+)?(détaillées?|développées?|longues?|complètes?)/i,
      /sois\s+(concis|bref|court|rapide)/i,
      /sois\s+(détaillé|complet|approfondi|exhaustif)/i,
      /pas\s+besoin\s+de\s+(?:faire\s+)?(?:des?\s+)?(longues?\s+)?réponses?/i,
      /aller\s+à\s+l'essentiel/i,
      /vas\s+au\s+plus\s+important/i,
    ],
    category: 'depth',
    valueExtractor: (_match, message) => {
      if (/courte?|concis|rapide|bref|succinct|essentiel|plus\s+important/i.test(message))
        return 'short';
      if (/détaillé|développé|approfondi|long|complet|exhaustif/i.test(message))
        return 'deep';
      return 'standard';
    },
    baseConfidence: 0.9,
    signals: ['preference-signal', 'depth'],
  },

  // TONE preferences
  {
    patterns: [
      /je préfère\s+(?:un\s+)?(?:ton\s+)?(direct|formel|décontracté|professionnel|amical|technique)/i,
      /parle[- ]moi\s+(?:de\s+)?(?:façon|d'une\s+manière)\s+(directe?|formelle?|décontractée?|amical)/i,
      /sois\s+(plus\s+)?(direct|formel|décontracté|professionnel|amical|technique)/i,
      /reste\s+(direct|formel|professionnel)/i,
    ],
    category: 'tone',
    valueExtractor: (_match, message) => {
      if (/direct/i.test(message)) return 'direct';
      if (/formel|professionnel/i.test(message)) return 'formal';
      if (/décontracté|amical/i.test(message)) return 'casual';
      if (/technique/i.test(message)) return 'technical';
      return 'balanced';
    },
    baseConfidence: 0.8,
    signals: ['preference-signal', 'tone'],
  },

  // FORMAT preferences
  {
    patterns: [
      /je préfère\s+(?:les\s+)?(?:réponses?\s+)?(?:avec\s+)?(?:des\s+)?(blocs?\s+de\s+code|tableaux?|exemples?\s+de\s+code)/i,
      /utilise\s+(?:des?\s+)?(blocs?\s+de\s+code|tableaux?|exemples?\s+de\s+code)/i,
      /avec\s+(?:des?\s+)?(exemples?|code|tableaux?)/i,
      /montre[- ]moi\s+(?:du\s+)?code/i,
      /donne[- ]moi\s+(?:des?\s+)?exemples?/i,
    ],
    category: 'format',
    valueExtractor: (_match, message) => {
      if (/code/i.test(message)) return 'code-blocks';
      if (/tableau/i.test(message)) return 'tables';
      if (/exemple/i.test(message)) return 'examples';
      return 'mixed';
    },
    baseConfidence: 0.75,
    signals: ['preference-signal', 'format'],
  },

  // ACTION_BIAS preferences
  {
    patterns: [
      /(?:ne\s+)?demande\s+(?:pas|jamais)\s+(?:de\s+)?confirmation/i,
      /fais[- ]le\s+(?:directement|tout\s+de\s+suite|sans\s+demander)/i,
      /exécute\s+(?:directement|sans\s+confirmation)/i,
      /pas\s+besoin\s+de\s+(?:me\s+)?(?:demander|confirmer)/i,
      /quand\s+c'est\s+(?:clair|évident|obvious)\s*,?\s*(?:fais|exécute|lance)/i,
      /j'ai\s+confiance/i,
      /fais\s+moi\s+confiance/i,
    ],
    category: 'action_bias',
    valueExtractor: (_match, message) => {
      if (/pas\s+(?:de\s+)?confirmation|sans\s+(?:demander|confirmer)/i.test(message))
        return 'no-confirmation';
      if (/directement|tout\s+de\s+suite/i.test(message)) return 'immediate';
      if (/confiance/i.test(message)) return 'trust-based';
      return 'action-first';
    },
    baseConfidence: 0.85,
    signals: ['preference-signal', 'action-bias'],
  },
];

/**
 * Extract durable preferences from a user message
 * Returns extraction result with preferences and noise detection
 */
export function extractPreferences(message: string): PreferenceExtractionResult {
  // Step 1: Noise detection
  const noiseCheck = detectNoise(message);
  if (noiseCheck.isNoise) {
    logger.debug('Noise detected — skipping preference extraction', {
      reason: noiseCheck.reason,
    });
    return {
      preferences: [],
      isNoise: true,
      noiseReason: noiseCheck.reason,
      signals: [],
    };
  }

  const preferences: DurablePreference[] = [];
  const allSignals: string[] = [];
  const now = Date.now();

  // Step 2: Apply extraction rules
  for (const rule of EXTRACTION_RULES) {
    for (const pattern of rule.patterns) {
      const match = message.match(pattern);
      if (match) {
        const value = rule.valueExtractor(match, message);
        const prefId = `${rule.category}:${value}`;

        preferences.push({
          id: prefId,
          category: rule.category,
          value,
          durability: rule.baseConfidence * 0.8, // initial durability slightly below confidence
          confidence: rule.baseConfidence,
          lastSeen: now,
          firstSeen: now,
          source: 'explicit',
          timesConfirmed: 1,
          metadata: {
            matchedPattern: pattern.source.substring(0, 50),
            originalMessage: message.substring(0, 100),
          },
        });

        allSignals.push(...rule.signals);
        break; // one match per rule is enough
      }
    }
  }

  // Step 3: Implicit preference detection (softer signals)
  const implicitPrefs = detectImplicitPreferences(message, now);
  preferences.push(...implicitPrefs);

  if (preferences.length > 0) {
    logger.debug('Preferences extracted', {
      count: preferences.length,
      categories: [...new Set(preferences.map(p => p.category))],
      noise: false,
    });
  }

  return {
    preferences,
    isNoise: false,
    signals: [...new Set(allSignals)],
  };
}

/**
 * Detect softer implicit preferences from message patterns
 */
function detectImplicitPreferences(message: string, now: number): DurablePreference[] {
  const prefs: DurablePreference[] = [];
  const msgLower = message.toLowerCase();

  // Implicit: user consistently asks for short answers
  if (
    /^(fais court|court|bref|concis|en bref|résume|tl;dr|tldr)$/i.test(msgLower.trim())
  ) {
    prefs.push({
      id: 'depth:short-implicit',
      category: 'depth',
      value: 'short',
      durability: 0.5,
      confidence: 0.6,
      lastSeen: now,
      firstSeen: now,
      source: 'implicit',
      timesConfirmed: 1,
    });
  }

  // Implicit: user asks for deep analysis repeatedly
  if (
    /\b(analyse|approfondi|développe|détaille|explique\s+en\s+détail|complet)\b/i.test(
      msgLower
    )
  ) {
    prefs.push({
      id: 'depth:deep-implicit',
      category: 'depth',
      value: 'deep',
      durability: 0.4,
      confidence: 0.5,
      lastSeen: now,
      firstSeen: now,
      source: 'implicit',
      timesConfirmed: 1,
    });
  }

  return prefs;
}

// ─────────────────────────────────────────────────────────────────
// PREFERENCE MERGING — Update existing preferences with new signals
// ─────────────────────────────────────────────────────────────────

/**
 * Merge new preferences into existing ones.
 * Increases durability and confidence for confirmed preferences.
 * Creates new entries for new preferences.
 */
export function mergePreferences(
  existing: DurablePreference[],
  incoming: DurablePreference[]
): DurablePreference[] {
  const merged = new Map<string, DurablePreference>();

  // Index existing preferences
  for (const pref of existing) {
    merged.set(pref.id, { ...pref });
  }

  // Merge incoming
  for (const incomingPref of incoming) {
    const existingPref = merged.get(incomingPref.id);

    if (existingPref) {
      // Reinforce existing preference
      existingPref.timesConfirmed++;
      existingPref.confidence = Math.min(1.0, existingPref.confidence + 0.05);
      existingPref.durability = Math.min(1.0, existingPref.durability + 0.08);
      existingPref.lastSeen = incomingPref.lastSeen;

      // Upgrade source if explicit confirmation of implicit preference
      if (existingPref.source === 'implicit' && incomingPref.source === 'explicit') {
        existingPref.source = 'explicit';
        existingPref.durability = Math.min(1.0, existingPref.durability + 0.15);
      }

      logger.debug('Preference reinforced', {
        id: existingPref.id,
        timesConfirmed: existingPref.timesConfirmed,
        durability: existingPref.durability.toFixed(2),
      });
    } else {
      // New preference
      merged.set(incomingPref.id, { ...incomingPref });
      logger.debug('New preference stored', {
        id: incomingPref.id,
        category: incomingPref.category,
      });
    }
  }

  return Array.from(merged.values());
}

// ─────────────────────────────────────────────────────────────────
// PREFERENCE FILTERING — Remove low-quality or stale preferences
// ─────────────────────────────────────────────────────────────────

/**
 * Filter preferences to keep only durable, high-quality ones
 * v30.3.0: Exponential decay replaces linear decay for smoother temporal weighting
 */
export function filterPreferences(
  preferences: DurablePreference[],
  config?: Partial<PreferenceEngineConfig>
): DurablePreference[] {
  const minConfidence = config?.minConfidence ?? 0.6;
  const now = Date.now();
  // v30.3.0: Half-life based decay — preferences at halfLife age retain 50% durability
  const halfLifeMs = (config?.durabilityDecayDays ?? 30) * 24 * 60 * 60 * 1000;

  return preferences
    .filter(pref => {
      // Drop low confidence
      if (pref.confidence < minConfidence) return false;

      // v30.3.0: Exponential decay (matching SemanticMemoryEngine pattern)
      const age = now - pref.lastSeen;
      const decayFactor = Math.exp((-Math.LN2 * age) / halfLifeMs);
      pref.durability *= Math.max(0.05, decayFactor);

      // v30.3.0: Reinforcement bonus for frequently confirmed preferences
      if (pref.timesConfirmed >= 5) {
        pref.durability = Math.min(1.0, pref.durability * 1.15);
      } else if (pref.timesConfirmed >= 3) {
        pref.durability = Math.min(1.0, pref.durability * 1.08);
      }

      // Drop if durability too low
      if (pref.durability < 0.15) return false;

      return true;
    })
    .sort((a, b) => b.durability - a.durability); // highest durability first
}

// ─────────────────────────────────────────────────────────────────
// PREFERENCE-TO-RESPONSE SHAPING — Apply preferences to response
// ─────────────────────────────────────────────────────────────────

/**
 * Shape a response based on stored preferences.
 * This is applied AFTER the LLM generates the response.
 */
export function shapeResponse(
  response: string,
  preferences: DurablePreference[]
): string {
  if (preferences.length === 0) return response;

  let shaped = response;

  for (const pref of preferences) {
    if (pref.durability < 0.4) continue; // skip weak preferences

    switch (pref.category) {
      case 'structure':
        shaped = applyStructurePreference(shaped, pref.value);
        break;
      case 'depth':
        // depth is applied BEFORE LLM call (affects maxTokens), not after
        break;
      case 'format':
        shaped = applyFormatPreference(shaped, pref.value);
        break;
      // tone and action_bias are applied in system prompt, not post-processed
    }
  }

  return shaped;
}

/**
 * Apply structure preference to response text
 */
function applyStructurePreference(text: string, structureType: string): string {
  // Only apply if response doesn't already have the structure
  switch (structureType) {
    case 'lists':
      if (!text.includes('•') && !text.includes('- ') && !text.includes('* ')) {
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        if (sentences.length > 2) {
          return sentences.map(s => `• ${s.trim()}`).join('\n');
        }
      }
      break;
    case 'numbered-steps':
      if (!text.match(/\d+\.\s/)) {
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        if (sentences.length > 2) {
          return sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
        }
      }
      break;
    case 'sections':
      if (!text.includes('##') && !text.includes('###')) {
        // Don't force sections if response is short
        if (text.length > 300) {
          // Let the response stand as-is; sections are better applied by LLM
        }
      }
      break;
  }
  return text;
}

/**
 * Apply format preference to response text
 */
function applyFormatPreference(text: string, formatType: string): string {
  switch (formatType) {
    case 'code-blocks':
      // Don't modify — code blocks are best generated by LLM
      break;
    case 'tables':
      // Don't modify — tables are best generated by LLM
      break;
    case 'examples':
      // Don't modify — examples are best generated by LLM
      break;
  }
  return text;
}

// ─────────────────────────────────────────────────────────────────
// PREFERENCE SUMMARY — Get human-readable summary of learned prefs
// ─────────────────────────────────────────────────────────────────

/**
 * Get a summary of all active preferences for system prompt injection
 */
export function getPreferenceSummary(preferences: DurablePreference[]): string {
  if (preferences.length === 0) return '';

  const strongPrefs = preferences.filter(p => p.durability >= 0.5);
  if (strongPrefs.length === 0) return '';

  const lines: string[] = ['Préférences utilisateur détectées :'];

  for (const pref of strongPrefs) {
    const strength =
      pref.durability >= 0.8 ? 'forte' : pref.durability >= 0.6 ? 'moyenne' : 'légère';
    lines.push(
      `  • ${pref.category}: ${pref.value} (${strength}, confirmée ${pref.timesConfirmed}x)`
    );
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────
// PRE-LLM PREFERENCE INJECTION — Build system prompt instructions
// v30.3.0: Inject preferences BEFORE LLM call, not just after
// ─────────────────────────────────────────────────────────────────

/**
 * v30.3.0: Build a system prompt block that tells the LLM about user preferences
 * before generating the response. This is proactive (pre-LLM) vs reactive (post-LLM).
 * Returns empty string if no strong preferences exist.
 */
export function buildPreferencePrompt(preferences: DurablePreference[]): string {
  if (preferences.length === 0) return '';

  const strongPrefs = preferences.filter(p => p.durability >= 0.4 && p.confidence >= 0.5);
  if (strongPrefs.length === 0) return '';

  const instructions: string[] = [];

  // Group by category
  const depthPrefs = strongPrefs.filter(p => p.category === 'depth');
  const structurePrefs = strongPrefs.filter(p => p.category === 'structure');
  const tonePrefs = strongPrefs.filter(p => p.category === 'tone');
  const formatPrefs = strongPrefs.filter(p => p.category === 'format');
  const actionPrefs = strongPrefs.filter(p => p.category === 'action_bias');

  if (depthPrefs.length > 0) {
    const best = depthPrefs[0]!;
    const depthMap: Record<string, string> = {
      short: 'courtes et directes',
      standard: 'équilibrées, ni trop courtes ni trop longues',
      developed: 'développées avec explication et contexte',
      deep: 'profondes avec analyse multi-perspective',
    };
    instructions.push(
      `- Profondeur préférée: Réponses ${depthMap[best.value] || best.value}`
    );
  }

  if (structurePrefs.length > 0) {
    const structTypes = structurePrefs.map(p => p.value).join(', ');
    instructions.push(`- Structure préférée: ${structTypes}`);
  }

  if (tonePrefs.length > 0) {
    instructions.push(`- Ton préféré: ${tonePrefs[0]!.value}`);
  }

  if (formatPrefs.length > 0) {
    const fmtTypes = formatPrefs.map(p => p.value).join(', ');
    instructions.push(`- Format préféré: ${fmtTypes}`);
  }

  if (actionPrefs.length > 0) {
    instructions.push(
      `- Biais d'action: Agir directement sans demander confirmation quand possible`
    );
  }

  if (instructions.length === 0) return '';

  return [
    '═══ PRÉFÉRENCES UTILISATEUR APPRISES ═══',
    "L'utilisateur a des préférences durables détectées. Adapte ta réponse en conséquence :",
    ...instructions,
    '═══════════════════════════════════════════',
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

export const PREFERENCE_ENGINE_VERSION = '2.0.0';
export const PREFERENCE_ENGINE_DATE = '2026-04-12';

export default {
  extractPreferences,
  detectNoise,
  mergePreferences,
  filterPreferences,
  shapeResponse,
  getPreferenceSummary,
  buildPreferencePrompt,
  VERSION: PREFERENCE_ENGINE_VERSION,
};
