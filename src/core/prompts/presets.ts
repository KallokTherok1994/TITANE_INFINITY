/*
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import type { PromptPreset } from './types';

export const promptPresets: Record<string, PromptPreset> = {
  diagnostic_deuxieme_vitesse: {
    id: 'diagnostic_deuxieme_vitesse',
    label: 'Diagnostic Deuxième vitesse (any: any)',
    description: 'Analyse charge mentale + rituel de bascule rapide.',
    profileId: 'guide_deuxieme_vitesse',
    userPrompt:
      'Lance un diagnostic Deuxième vitesse complet : évalue ma charge (0-10), identifie la friction principale, propose un rituel de passage précis, puis vérifie mon engagement.',
    autoMemoryWrites: [
      {
        target: 'medium',
        template: 'listening_entry',
      },
    ],
  },
  carnet_ecoute_quotidien: {
    id: 'carnet_ecoute_quotidien',
    label: 'Carnet d’écoute – check quotidien',
    description: 'Rituel 5 min mental/cœur/corps + besoin clé.',
    profileId: 'facilitateur_ecoute',
    userPrompt:
      'Guide un carnet d’écoute : mental, cœur, corps, besoin principal, rituel d’ancrage recommandé et note ce qui doit aller en mémoire.',
    autoMemoryWrites: [
      {
        target: 'medium',
        template: 'listening_entry',
      },
    ],
  },
  clarification_discern: {
    id: 'clarification_discern',
    label: 'D?.I?.S?.C?.E?.R?.N?.E?.R. complet',
    description: 'Clarification profonde d’une décision stratégique.',
    profileId: 'optimiseur_decision',
    userPrompt:
      'Applique D?.I?.S?.C?.E?.R?.N?.E?.R. à la décision suivante. Demande-moi les informations manquantes, remplis la grille, conclue par décision consciente + premier pas + check corps.',
    autoMemoryWrites: [
      {
        target: 'medium',
        template: 'decision',
      },
    ],
  },
  sprint_dcs_projet: {
    id: 'sprint_dcs_projet',
    label: 'Sprint D/C/S pour projet',
    description: 'Divergence → Connexion → Structuration sur un nouveau sujet.',
    profileId: 'architecte_projet',
    userPrompt:
      'Conduis un sprint complet : Divergence (any: any).',
    autoMemoryWrites: [
      {
        target: 'medium',
        template: 'project_snapshot',
      },
    ],
  },
  audit_rythme_energie: {
    id: 'audit_rythme_energie',
    label: 'Audit rythme & énergie',
    description: 'Bilan de la semaine : énergie, rituels, ajustements.',
    profileId: 'coach_ancrage',
    userPrompt:
      'Fais un audit énergie/rythmes : score énergie 0-10, rituels pratiqués, signaux du corps, ajustements pour la prochaine semaine.',
    autoMemoryWrites: [
      {
        target: 'medium',
        template: 'rhythm_report',
      },
    ],
  },
};
