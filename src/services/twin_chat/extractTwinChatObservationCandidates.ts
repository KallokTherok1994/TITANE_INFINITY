import type {
  TwinChatExtractionInput,
  TwinChatObservationCandidate,
  TwinChatObservationKind,
  TwinChatObservationRisk,
} from './types';

const VALUE_PATTERNS = [
  {
    matcher: /(authenticit[eé]|authentique)/i,
    contentCompact: 'authenticite',
  },
  {
    matcher: /(clart[eé]|clair)/i,
    contentCompact: 'clarte',
  },
  {
    matcher: /(alignement|align[eé])/i,
    contentCompact: 'alignement',
  },
  {
    matcher: /(libert[eé]|autonomie)/i,
    contentCompact: 'autonomie',
  },
  {
    matcher: /(simplicit[eé]|simple)/i,
    contentCompact: 'simplicite',
  },
] as const;

const COGNITIVE_PATTERNS = [
  {
    matcher: /(pas [àa] pas|step by step|[ée]tape par [ée]tape)/i,
    contentCompact: 'reasoning_stepwise',
  },
  {
    matcher: /(structure|structur[eé]|cadre|framework)/i,
    contentCompact: 'reasoning_structured',
  },
  {
    matcher: /(synth[eè]se|vue d[' ]ensemble|big picture)/i,
    contentCompact: 'reasoning_synthesis',
  },
  {
    matcher: /(analyse|analyser|diagnostic)/i,
    contentCompact: 'reasoning_analytical',
  },
] as const;

const STYLE_PATTERNS = [
  {
    matcher: /(direct|franc|sans fluff|sans bla bla)/i,
    contentCompact: 'style_direct',
  },
  {
    matcher: /(concis|court|bref|va [àa] l[' ]essentiel)/i,
    contentCompact: 'style_concis',
  },
  {
    matcher: /(d[eé]taill[eé]|approfondi|complet)/i,
    contentCompact: 'style_detaille',
  },
  {
    matcher: /(structur[eé]|bullet|liste|tableau)/i,
    contentCompact: 'style_structure',
  },
] as const;

const EMOTIONAL_PATTERNS = [
  {
    matcher: /(fatigu[eé]|[ée]puis[eé])/i,
    contentCompact: 'emotion_fatigue',
  },
  {
    matcher: /(stress[eé]?|anxieux|anxieuse|angoiss[eé])/i,
    contentCompact: 'emotion_anxiete',
  },
  {
    matcher: /(calme|apais[eé]|serein)/i,
    contentCompact: 'emotion_apaisement',
  },
  {
    matcher: /(frustr[eé]|agac[eé]|en col[eè]re)/i,
    contentCompact: 'emotion_frustration',
  },
] as const;

function normalizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, ' ');
}

function buildContext(input: TwinChatExtractionInput): string {
  const parts = [input.moduleId ?? null, input.route ?? null].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  );

  return parts.join(':') || 'conversation';
}

function buildCandidate(params: {
  kind: TwinChatObservationKind;
  contentCompact: string;
  confidence: number;
  risk: TwinChatObservationRisk;
  input: TwinChatExtractionInput;
}): TwinChatObservationCandidate {
  const { kind, contentCompact, confidence, risk, input } = params;
  const safeSlug = contentCompact.replace(/[^a-z0-9_]+/gi, '_').toLowerCase();

  return {
    id: `${kind}:${safeSlug}`,
    kind,
    contentCompact,
    context: buildContext(input),
    confidence,
    evidenceSource: 'chat_turn',
    consentRisk: risk,
    status: 'shadow',
    canWriteTwin: false,
    route: input.route ?? null,
    moduleId: input.moduleId ?? null,
  };
}

function collectMatches(
  input: TwinChatExtractionInput,
  patterns: ReadonlyArray<{ matcher: RegExp; contentCompact: string }>,
  kind: TwinChatObservationKind,
  confidence: number,
  risk: TwinChatObservationRisk
): TwinChatObservationCandidate[] {
  return patterns
    .filter(pattern => pattern.matcher.test(input.message))
    .map(pattern =>
      buildCandidate({
        kind,
        contentCompact: pattern.contentCompact,
        confidence,
        risk,
        input,
      })
    );
}

function dedupeCandidates(
  candidates: TwinChatObservationCandidate[]
): TwinChatObservationCandidate[] {
  const seen = new Set<string>();

  return candidates.filter(candidate => {
    const key = `${candidate.kind}:${candidate.contentCompact}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function extractTwinChatObservationCandidates(
  input: TwinChatExtractionInput
): TwinChatObservationCandidate[] {
  const normalizedMessage = normalizeMessage(input.message);
  if (normalizedMessage.length === 0) {
    return [];
  }

  const normalizedInput: TwinChatExtractionInput = {
    ...input,
    message: normalizedMessage,
  };

  const candidates = [
    ...collectMatches(normalizedInput, VALUE_PATTERNS, 'value', 0.72, 'medium'),
    ...collectMatches(
      normalizedInput,
      COGNITIVE_PATTERNS,
      'cognitive',
      0.74,
      'low'
    ),
    ...collectMatches(normalizedInput, STYLE_PATTERNS, 'style', 0.76, 'low'),
    ...collectMatches(
      normalizedInput,
      EMOTIONAL_PATTERNS,
      'emotional',
      0.7,
      'identity_sensitive'
    ),
  ];

  return dedupeCandidates(candidates);
}