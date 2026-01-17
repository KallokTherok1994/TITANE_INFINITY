/*
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

export type MemoryWriteTarget = 'short' | 'medium' | 'long';

export type MemoryTemplateId =
  | 'decision'
  | 'listening_entry'
  | 'project_snapshot'
  | 'rhythm_report'
  | 'season_summary';

export interface MemoryTemplate {
  id: MemoryTemplateId;
  label: string;
  description: string;
  expectedFields: string[];
  prompt: string;
  example: Record<string, unknown>;
}

export interface StructuredMemoryEntry {
  id?: string;
  templateId: MemoryTemplateId;
  target: MemoryWriteTarget;
  timestamp?: string;
  data: Record<string, unknown>;
  tags?: string[];
  source?: string;
}

const memoryTemplates: Record<MemoryTemplateId, MemoryTemplate> = {
  decision: {
    id: 'decision',
    label: 'Décision (D.I.S.C.E.R.N.E.R.)',
    description:
      'Capture les décisions structurées avec critères Impact/Alignement/Innovation et vote mental/cœur/corps.',
    expectedFields: [
      'title',
      'context',
      'criteria',
      'choice',
      'body_vote',
      'next_step',
      'tags',
    ],
    prompt: `Tu es le SYNTHÉTISEUR COGNITIF TITANE∞.
Analyse l'échange fourni et produis UNIQUEMENT un JSON respectant exactement le schéma suivant :
{
  "type": "decision",
  "title": string,
  "context": string,
  "criteria": {
    "impact_long_terme": string,
    "alignement": string,
    "innovation": string
  },
  "choice": string,
  "body_vote": {
    "mental": string,
    "coeur": string,
    "corps": string
  },
  "next_step": string,
  "tags": string[]
}

Rappels:
- Résume en 1-2 phrases par champ.
- Utilise le vocabulaire TITANE∞ (Deuxième vitesse, D.I.S.C.E.R.N.E.R., Être/Faire/Avoir) si pertinent.
- PAS de texte hors JSON.`,
    example: {
      type: 'decision',
      title: 'Positionner le lancement Atlas Q2',
      context: 'Choix de timing pour le programme Atlas vs charge actuelle',
      criteria: {
        impact_long_terme: 'Renforce la mission en stabilisant le socle pour 24 mois',
        alignement: 'Accord avec saison intérieure « Ancrage + Transmission »',
        innovation: 'Permet un module expérimental sur la mémoire active',
      },
      choice: 'Décaler de 3 semaines avec phase de calibration énergétique',
      body_vote: {
        mental: 'Clarté retrouvée',
        coeur: 'Soulagé',
        corps: 'Besoin de pauses prévues',
      },
      next_step: 'Calibrer le sprint D/C/S le 12 avril + informer l’équipe',
      tags: ['decision', 'atlas', 'discern'],
    },
  },
  listening_entry: {
    id: 'listening_entry',
    label: 'Carnet d’écoute',
    description: 'Entrée courte mental/cœur/corps + besoin + rituel proposé.',
    expectedFields: ['mental', 'coeur', 'corps', 'besoin', 'rituel', 'follow_up'],
    prompt: `Synthétise ce check-in en JSON strict:
{
  "type": "listening_entry",
  "timestamp": string,
  "mental": string,
  "coeur": string,
  "corps": string,
  "need": string,
  "ritual": string,
  "follow_up": string
}
Pas d'introduction, pas de conseils additionnels.`,
    example: {
      type: 'listening_entry',
      timestamp: '2025-11-28T08:30:00.000Z',
      mental: 'Trop de fils ouverts',
      coeur: 'Besoin d’être rassuré',
      corps: 'Tension épaules 6/10',
      need: 'Réduire à 2 priorités et demander soutien',
      ritual: 'Respiration 4-7-8 + marche 10 min',
      follow_up: 'Revenir sur le carnet ce soir',
    },
  },
  project_snapshot: {
    id: 'project_snapshot',
    label: 'Snapshot projet D/C/S',
    description: 'Capture Divergence/Connexion/Structuration d’un sprint.',
    expectedFields: [
      'project',
      'phase',
      'divergence',
      'connexion',
      'structuration',
      'next_milestone',
    ],
    prompt: `Retourne uniquement un JSON:
{
  "type": "project_snapshot",
  "project": string,
  "phase": "D|C|S",
  "divergence": string[],
  "connexion": string[],
  "structuration": [
    {
      "step": string,
      "owner": string,
      "eta": string
    }
  ],
  "next_milestone": string
}
Si certaines sections ne sont pas mentionnées, déduis-les honnêtement sans inventer de détails inexistants.`,
    example: {
      type: 'project_snapshot',
      project: 'Programme Helios',
      phase: 'S',
      divergence: ['Offre audio-guidée', 'Mode sprint 10j'],
      connexion: ['Besoin de repos avant relance', 'Alignement mission : régulation'],
      structuration: [
        { step: 'Valider rituel d’ouverture', owner: 'Kevin', eta: '2025-12-02' },
        { step: 'Former cercle pilote', owner: 'Équipe Rituels', eta: '2025-12-05' },
      ],
      next_milestone: 'Sprint pilote 12 décembre',
    },
  },
  rhythm_report: {
    id: 'rhythm_report',
    label: 'Audit rythme & énergie',
    description: 'Bilan hebdo énergie/rituels + ajustements.',
    expectedFields: ['energy_score', 'signals', 'rituals', 'adjustments', 'focus'],
    prompt: `Compile en JSON:
{
  "type": "rhythm_report",
  "week": string,
  "energy_score": number,
  "signals": string[],
  "rituals": {
    "completed": string[],
    "missed": string[]
  },
  "adjustments": string[],
  "focus_next_week": string
}
Score 0-10. Liste maximum 5 éléments par tableau. Aucun texte externe.`,
    example: {
      type: 'rhythm_report',
      week: '2025-W48',
      energy_score: 6,
      signals: ['Surchauffe le mardi', 'Sommeil instable'],
      rituals: {
        completed: ['Respiration matin', 'Marche sunset'],
        missed: ['Ancrage midi'],
      },
      adjustments: ['Bloquer 2 micro-pauses', 'Couper écran 22h'],
      focus_next_week: 'Stabiliser soir + préparer phase Divergence',
    },
  },
  season_summary: {
    id: 'season_summary',
    label: 'Synthèse saison / long terme',
    description: 'Résumé longue portée : saisons de vie, leçons, lignes rouges.',
    expectedFields: [
      'season',
      'period',
      'themes',
      'lessons',
      'guardrails',
      'next_season_intent',
    ],
    prompt: `Produit un JSON longue portée :
{
  "type": "season_summary",
  "season": string,
  "period": string,
  "themes": string[],
  "lessons": string[],
  "guardrails": string[],
  "next_season_intent": string
}
Pas de commentaire en dehors du JSON.`,
    example: {
      type: 'season_summary',
      season: 'Deuxième vitesse — Stabiliser pour rayonner',
      period: 'Sept-Nov 2025',
      themes: ['Ancrage corporel', 'Transmission méthodo', 'Protection du temps sacré'],
      lessons: ['Saturation = alarme à écouter', 'Le corps donne la cadence réelle'],
      guardrails: [
        'Pas plus de 2 grands projets simultanés',
        'Rituels matin/soir non négociables',
      ],
      next_season_intent: 'Décembre-janvier = ralentir + écrire le blueprint v14',
    },
  },
};

export function getMemoryTemplate(id: MemoryTemplateId): MemoryTemplate {
  return memoryTemplates[id];
}

export function listMemoryTemplates(): MemoryTemplate[] {
  return Object.values(memoryTemplates);
}

export function buildMemoryPrompt(templateId: MemoryTemplateId): string {
  return (
    memoryTemplates[templateId]?.prompt ||
    'Tu es le Synthétiseur Cognitif TITANE∞. Retourne uniquement un JSON valide.'
  );
}
