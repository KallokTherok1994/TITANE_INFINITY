/**
 * Knowledge Organizer — thematic clustering, relevance scoring, gap detection.
 * Ring 3 utility — no I/O, no side effects, pure functions.
 */

export interface KBEntry {
  category: string;
  description?: string;
  retrieval_triggers?: string[];
}

export type KnowledgeTheme =
  | 'medicine_clinique'
  | 'psychologie_bien_etre'
  | 'neurosciences'
  | 'nutrition_sante'
  | 'technologie_innovation'
  | 'spiritualite_philosophie'
  | 'competences_professionnelles'
  | 'relations_sociales'
  | 'formation_apprentissage'
  | 'urgences_securite'
  | 'autre';

const THEME_PATTERNS: Record<KnowledgeTheme, RegExp> = {
  medicine_clinique:
    /cardio|immuno|pharma|gastro|hepato|neurologie|clinique|pathologie|diagnostic|traitement|chirurgie|oncologie|infectieux|traumato/i,
  psychologie_bien_etre:
    /psychologie|bien.?etre|bonheur|motivation|resilience|emotions|anxiete|depression|therapie|cognitif|comportement/i,
  neurosciences:
    /neuroscience|cerveau|neuroanatomie|cognition|memoire|plasticite|synapses|dopamine|serotonine|biais/i,
  nutrition_sante:
    /nutrition|alimentation|regime|vitamines|mineraux|microbiote|metabolisme|obesite|diabete|lipides/i,
  technologie_innovation:
    /technologie|innovation|intelligence.artificielle|IA|logiciel|numerique|algorithme|robotique|cybersecurite|blockchain/i,
  spiritualite_philosophie:
    /spiritualite|philosophie|sens|existentiel|meditation|mindfulness|bouddhisme|stoicisme|valeurs/i,
  competences_professionnelles:
    /leadership|management|communication|negociation|productivite|organisation|projet|strategie|HTF|formation|estimation/i,
  relations_sociales:
    /relations|couples|attachment|famille|groupes|sociaux|empathie|conflit|assertivite|communication.interpersonnelle/i,
  formation_apprentissage:
    /apprentissage|creativite|pedagogie|cerveau.apprenant|memoire|cognition.sociale|education/i,
  urgences_securite:
    /urgence|antidote|intoxication|securite|protection|confinement|alerte|risque|danger/i,
  autre: /.*/,
};

/**
 * Clusters KB entries by thematic domain.
 */
export function clusterByTheme(entries: KBEntry[]): Record<KnowledgeTheme, KBEntry[]> {
  const result = {} as Record<KnowledgeTheme, KBEntry[]>;
  const themes = Object.keys(THEME_PATTERNS) as KnowledgeTheme[];
  themes.forEach(t => {
    result[t] = [];
  });

  for (const entry of entries) {
    let assigned = false;
    const searchStr = [
      entry.category,
      entry.description ?? '',
      (entry.retrieval_triggers ?? []).join(' '),
    ].join(' ');

    for (const theme of themes.filter(t => t !== 'autre')) {
      if (THEME_PATTERNS[theme].test(searchStr)) {
        result[theme].push(entry);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      result['autre'].push(entry);
    }
  }

  return result;
}

/**
 * Scores the relevance of an entry against a query using simple TF-based matching.
 * Returns a score in [0, 1].
 */
export function scoreRelevance(query: string, entry: KBEntry): number {
  if (!query.trim()) {
    return 0;
  }

  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (queryTerms.length === 0) {
    return 0;
  }

  const haystack = [
    entry.category,
    entry.description ?? '',
    (entry.retrieval_triggers ?? []).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (haystack.includes(term)) {
      matches++;
    }
  }

  return matches / queryTerms.length;
}

const IDEAL_DOMAINS = [
  'medicine_clinique',
  'pharmacologie',
  'gastroenterologie',
  'cardiovasculaire',
  'immunologie',
  'neurosciences',
  'psychologie_bien_etre',
  'nutrition_sante',
  'technologie_innovation',
  'spiritualite_philosophie',
  'competences_professionnelles',
  'relations_sociales',
  'urgences_securite',
];

/**
 * Detects knowledge gaps by comparing loaded categories against ideal domains.
 */
export function detectKnowledgeGaps(entries: KBEntry[]): string[] {
  const loadedCategories = new Set(entries.map(e => e.category.toLowerCase()));
  const gaps: string[] = [];

  for (const domain of IDEAL_DOMAINS) {
    const covered = Array.from(loadedCategories).some(cat => cat.includes(domain));
    if (!covered) {
      gaps.push(domain);
    }
  }

  return gaps;
}

export interface EnrichedIndexEntry {
  category: string;
  theme: KnowledgeTheme;
  triggerCount: number;
  description: string;
}

/**
 * Builds an enriched index with thematic metadata for all entries.
 */
export function buildEnrichedIndex(entries: KBEntry[]): EnrichedIndexEntry[] {
  const themes = Object.keys(THEME_PATTERNS) as KnowledgeTheme[];

  return entries.map(entry => {
    const searchStr = [
      entry.category,
      entry.description ?? '',
      (entry.retrieval_triggers ?? []).join(' '),
    ].join(' ');

    let assignedTheme: KnowledgeTheme = 'autre';
    for (const theme of themes.filter(t => t !== 'autre')) {
      if (THEME_PATTERNS[theme].test(searchStr)) {
        assignedTheme = theme;
        break;
      }
    }

    return {
      category: entry.category,
      theme: assignedTheme,
      triggerCount: entry.retrieval_triggers?.length ?? 0,
      description: entry.description ?? '',
    };
  });
}

export interface KBStats {
  totalEntries: number;
  categoriesCount: number;
  themeCoverage: Record<KnowledgeTheme, number>;
  avgTriggersPerEntry: number;
  topTriggers: string[];
}

/**
 * Returns aggregate statistics on the knowledge base.
 */
export function getKBStats(entries: KBEntry[]): KBStats {
  const clustered = clusterByTheme(entries);
  const themeCoverage = {} as Record<KnowledgeTheme, number>;
  (Object.keys(clustered) as KnowledgeTheme[]).forEach(theme => {
    themeCoverage[theme] = clustered[theme].length;
  });

  const allTriggers: string[] = entries.flatMap(e => e.retrieval_triggers ?? []);
  const triggerFreq = new Map<string, number>();
  for (const t of allTriggers) {
    triggerFreq.set(t, (triggerFreq.get(t) ?? 0) + 1);
  }
  const topTriggers = Array.from(triggerFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  return {
    totalEntries: entries.length,
    categoriesCount: new Set(entries.map(e => e.category)).size,
    themeCoverage,
    avgTriggersPerEntry: entries.length > 0 ? allTriggers.length / entries.length : 0,
    topTriggers,
  };
}
