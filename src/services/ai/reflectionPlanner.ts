export type ReflectionType =
  | 'personal'
  | 'strategic'
  | 'technical'
  | 'architectural'
  | 'decision'
  | 'integration';

export type ReflectionMemoryDepth = 'none' | 'recent' | 'targeted' | 'full';

export type ReflectionOutputShape =
  | 'mirror'
  | 'diagnostic'
  | 'roadmap'
  | 'decision_memo'
  | 'integration_note';

export interface ReflectionPlan {
  type: ReflectionType;
  lenses: string[];
  mustAnswer: string[];
  mustAvoid: string[];
  memoryDepth: ReflectionMemoryDepth;
  outputShape: ReflectionOutputShape;
  nextLock?: string;
  stoplines: string[];
  reasonCode: string;
}

function bounded(items: string[], limit = 4): string[] {
  return items.slice(0, limit);
}

export function buildReflectionPlan(input: {
  type: ReflectionType;
  subject?: string;
  continuationRequested?: boolean;
}): ReflectionPlan {
  const subject = input.subject?.trim() || 'sujet courant';
  const continuationRequested = Boolean(input.continuationRequested);

  switch (input.type) {
    case 'personal':
      return {
        type: 'personal',
        lenses: bounded(['ressenti', 'besoin', 'limite', 'prochaine petite action']),
        mustAnswer: bounded([
          `Qu'est-ce qui compte maintenant pour ${subject} ?`,
          'Quel besoin réel est exprimé ?',
          'Quelle réponse serait utile sans sur-interpréter ?',
        ]),
        mustAvoid: bounded([
          'sur-pathologiser',
          'forcer une mémoire durable',
          'monopoliser la parole',
        ]),
        memoryDepth: 'none',
        outputShape: 'mirror',
        stoplines: bounded([
          'pas de mémoire durable par défaut',
          'une réponse courte suffit',
        ]),
        reasonCode: 'personal_conservative',
      };
    case 'strategic':
      return {
        type: 'strategic',
        lenses: bounded(['priorité', 'tradeoffs', 'séquence', 'risque']),
        mustAnswer: bounded([
          'Quelle est la priorité principale ?',
          'Quels compromis sont acceptables ?',
          'Quelle séquence minimise le risque ?',
          'Quelle est la prochaine action utile ?',
        ]),
        mustAvoid: bounded([
          'diluer les priorités',
          'ouvrir trop de chantiers',
          'confondre analyse et plan d action',
        ]),
        memoryDepth: 'recent',
        outputShape: 'roadmap',
        stoplines: bounded([
          'se limiter à un plan exécutable',
          'arrêter après une prochaine action',
        ]),
        reasonCode: 'strategic_bounded',
      };
    case 'technical':
      return {
        type: 'technical',
        lenses: bounded(['surfaces touchées', 'invariants', 'risques', 'tests']),
        mustAnswer: bounded([
          'Quelles surfaces sont affectées ?',
          'Quels invariants doivent rester vrais ?',
          'Quels risques sont les plus probables ?',
          'Quels tests prouvent le changement ?',
        ]),
        mustAvoid: bounded([
          'broad refactor',
          'coût de conception inutile',
          'raisonnement non vérifié',
        ]),
        memoryDepth: 'targeted',
        outputShape: 'diagnostic',
        nextLock: continuationRequested
          ? 'one focused validation step only'
          : 'smallest safe delta',
        stoplines: bounded([
          'arrêt après un verrou de prochaine action',
          'pas de dérive hors des surfaces listées',
        ]),
        reasonCode: 'technical_bounded',
      };
    case 'architectural':
      return {
        type: 'architectural',
        lenses: bounded(['autorité', 'flux', 'contrat', 'preuve']),
        mustAnswer: bounded([
          'Où se situe l autorité canonique ?',
          'Quel flux contrôle la vérité runtime ?',
          'Quel contrat est observable ?',
          'Quelle preuve bloque la dérive ?',
        ]),
        mustAvoid: bounded([
          'inventer une nouvelle souveraineté',
          'court-circuiter les couches existantes',
        ]),
        memoryDepth: 'targeted',
        outputShape: 'decision_memo',
        nextLock: 'one governed contract at a time',
        stoplines: bounded([
          'ne pas ouvrir de second système de décision',
          'arrêt après une cartographie utile',
        ]),
        reasonCode: 'architectural_governed',
      };
    case 'decision':
      return {
        type: 'decision',
        lenses: bounded(['options', 'impact', 'preuve', 'limite']),
        mustAnswer: bounded([
          'Quelle option est la moins risquée ?',
          'Quelle preuve la rend valide ?',
          'Quelle limite doit être dite explicitement ?',
        ]),
        mustAvoid: bounded(['promettre au-delà de la preuve', 'gonfler la sortie']),
        memoryDepth: 'recent',
        outputShape: 'decision_memo',
        stoplines: bounded(['réponse concise et vérifiable']),
        reasonCode: 'decision_bounded',
      };
    case 'integration':
      return {
        type: 'integration',
        lenses: bounded(['synthèse', 'interfaces', 'points de friction', 'next action']),
        mustAnswer: bounded([
          'Comment les morceaux s assemblent-ils ?',
          'Quel est le point de friction principal ?',
          'Quelle prochaine action est la plus utile ?',
        ]),
        mustAvoid: bounded(['répéter toute l architecture', 'perdre le fil pratique']),
        memoryDepth: 'targeted',
        outputShape: 'integration_note',
        nextLock: 'one useful next action',
        stoplines: bounded(['stop after synthesis plus next action']),
        reasonCode: 'integration_synthesis',
      };
    default:
      return {
        type: 'integration',
        lenses: bounded(['synthèse', 'interfaces', 'next action']),
        mustAnswer: bounded(['Quelle est la prochaine action utile ?']),
        mustAvoid: bounded(['allonger la réponse sans nécessité']),
        memoryDepth: 'targeted',
        outputShape: 'integration_note',
        stoplines: bounded(['réponse bornée']),
        reasonCode: 'integration_synthesis',
      };
  }
}
