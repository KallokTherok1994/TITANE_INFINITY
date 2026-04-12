/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.1.0 — PROFESSIONAL DOCUMENT GENERATION SERVICE
 *   Templates, formatting, and document structure for professional outputs
 *
 *   Ce service fournit :
 *   - Templates de documents professionnels (rapport, lettre, plan, CV, etc.)
 *   - Instructions de formatage pour le LLM
 *   - Métadonnées de document (en-tête, pied de page, sections)
 *   - Classification automatique du type de document demandé
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('ProfessionalDocumentService');

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Types de documents professionnels supportés */
export type DocumentType =
  | 'report' // Rapport professionnel structuré
  | 'executive_summary' // Résumé exécutif
  | 'letter' // Lettre formelle / courrier
  | 'email' // Courriel professionnel
  | 'action_plan' // Plan d'action
  | 'meeting_notes' // Compte-rendu de réunion
  | 'business_plan' // Plan d'affaires
  | 'proposal' // Proposition commerciale / projet
  | 'cv' // Curriculum Vitae
  | 'cover_letter' // Lettre de motivation
  | 'specification' // Cahier des charges
  | 'analysis' // Note d'analyse
  | 'memo' // Note de service / mémo
  | 'presentation' // Plan de présentation
  | 'tutorial' // Guide / tutoriel
  | 'generic'; // Document générique professionnel

/** Métadonnées de document */
export interface DocumentMetadata {
  type: DocumentType;
  title: string;
  author: string;
  date: string;
  recipient?: string;
  organization?: string;
  version?: string;
  confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
}

/** Template de document */
export interface DocumentTemplate {
  type: DocumentType;
  label: string;
  description: string;
  sections: string[];
  formatInstructions: string;
  toneGuidance: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL PATTERNS — Document type detection from user message
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENT_SIGNALS: Record<DocumentType, RegExp[]> = {
  report: [
    /\b(rapport|rapport professionnel|rapport d'activité|bilan)\b/i,
    /\b(report|progress report|status report)\b/i,
  ],
  executive_summary: [
    /\b(résumé exécutif|executive summary|synthèse pour|en résumé pour)\b/i,
  ],
  letter: [
    /\b(lettre|courrier|correspondance|lettre formelle)\b/i,
    /\b(formal letter|business letter)\b/i,
  ],
  email: [
    /\b(courriel|email|mail professionnel|e-mail)\b/i,
    /\b(professional email|business email)\b/i,
  ],
  action_plan: [
    /\b(plan d'action|plan stratégique|feuille de route|roadmap)\b/i,
    /\b(action plan|strategic plan)\b/i,
  ],
  meeting_notes: [
    /\b(compte[- ]rendu|procès[- ]verbal|pv|notes de réunion|minutes)\b/i,
    /\b(meeting notes|meeting minutes)\b/i,
  ],
  business_plan: [
    /\b(business plan|plan d'affaires|modèle économique|business model)\b/i,
  ],
  proposal: [
    /\b(proposition|proposition commerciale|devis|offre|soumission)\b/i,
    /\b(proposal|quotation|bid)\b/i,
  ],
  cv: [/\b(cv|curriculum|curriculum vitae|résumé professionnel)\b/i],
  cover_letter: [/\b(lettre de motivation|lettre de candidature|cover letter)\b/i],
  specification: [/\b(cahier des charges|spécification|spec|requirements)\b/i],
  analysis: [
    /\b(note d'analyse|analyse détaillée|étude|diagnostic écrit)\b/i,
    /\b(analysis report|detailed analysis)\b/i,
  ],
  memo: [/\b(mémo|note de service|note interne|memorandum)\b/i],
  presentation: [/\b(présentation|pitch|pitch deck|slides|diapo)\b/i],
  tutorial: [/\b(tutoriel|guide|manuel|documentation|mode d'emploi|how-to)\b/i],
  generic: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplate> = {
  report: {
    type: 'report',
    label: 'Rapport Professionnel',
    description: 'Rapport structuré avec analyse, conclusions et recommandations',
    sections: [
      'En-tête (titre, auteur, date, version)',
      'Résumé exécutif (3-5 lignes)',
      'Contexte et objectifs',
      'Méthodologie / Approche',
      'Analyse et résultats',
      'Conclusions',
      'Recommandations',
      'Annexes (si nécessaire)',
    ],
    formatInstructions: `FORMAT RAPPORT PROFESSIONNEL :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 [TITRE DU RAPPORT]
Auteur : [Nom] | Date : [Date] | Version : [X.X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 RÉSUMÉ EXÉCUTIF
[3-5 lignes résumant l'essentiel]

1. CONTEXTE ET OBJECTIFS
[Description du contexte et des objectifs]

2. MÉTHODOLOGIE
[Approche utilisée]

3. ANALYSE ET RÉSULTATS
[Résultats détaillés avec données]

4. CONCLUSIONS
[Conclusions principales]

5. RECOMMANDATIONS
[Actions recommandées, priorisées]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fin du rapport`,
    toneGuidance:
      'Professionnel, factuel, objectif. Éviter le jargon non-nécessaire. Privilégier la clarté et la concision. Chaque section doit apporter de la valeur.',
  },

  executive_summary: {
    type: 'executive_summary',
    label: 'Résumé Exécutif',
    description: 'Synthèse concise pour décideurs',
    sections: [
      'Titre et contexte (1 ligne)',
      'Situation actuelle (2-3 lignes)',
      'Enjeux clés (3-5 points)',
      'Recommandation principale',
      'Prochaines étapes',
    ],
    formatInstructions: `FORMAT RÉSUMÉ EXÉCUTIF :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RÉSUMÉ EXÉCUTIF — [SUJET]
Date : [Date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ SITUATION : [état actuel en 2-3 lignes]
▸ ENJEUX CLÉS :
  1. [enjeu principal]
  2. [enjeu secondaire]
  3. [enjeu tertiaire]
▸ RECOMMANDATION : [action recommandée]
▸ PROCHAINES ÉTAPES : [1-3 actions immédiates]
▸ RISQUES : [risques principaux si non-action]`,
    toneGuidance:
      'Ultra-concis, orienté décision. Chaque mot compte. Pas de détail superflu. Destiné à un décideur pressé.',
  },

  letter: {
    type: 'letter',
    label: 'Lettre Formelle',
    description: 'Correspondance professionnelle formelle',
    sections: [
      'Coordonnées expéditeur',
      'Coordonnées destinataire',
      'Lieu et date',
      'Objet',
      "Formule d'appel",
      'Corps de la lettre (introduction, développement, conclusion)',
      'Formule de politesse',
      'Signature',
    ],
    formatInstructions: `FORMAT LETTRE FORMELLE :

[Prénom Nom]
[Adresse]
[Code postal, Ville]
[Téléphone / Email]

                                    [Destinataire]
                                    [Titre / Fonction]
                                    [Organisation]
                                    [Adresse]

[Ville], le [date]

Objet : [objet de la lettre]

[Formule d'appel — Madame, Monsieur / Cher Monsieur X],

[Introduction — contexte et raison de la lettre]

[Développement — arguments, détails, propositions]

[Conclusion — action attendue ou résumé]

[Formule de politesse — "Je vous prie d'agréer..." / "Veuillez agréer..."]

[Signature]
[Prénom Nom]`,
    toneGuidance:
      'Formel, courtois, professionnel. Adapter le niveau de formalité au destinataire. Phrases claires et bien construites.',
  },

  email: {
    type: 'email',
    label: 'Courriel Professionnel',
    description: 'Email structuré et professionnel',
    sections: [
      'Objet (clair et concis)',
      'Salutation',
      'Corps (contexte, contenu, demande)',
      "Conclusion et appel à l'action",
      'Formule de fin',
      'Signature',
    ],
    formatInstructions: `FORMAT EMAIL PROFESSIONNEL :

Objet : [Objet clair et concis — max 10 mots]

[Salutation],

[1er paragraphe : contexte/raison de l'email]

[2e paragraphe : contenu principal / information]

[3e paragraphe : demande claire / action attendue avec date]

[Formule de fin — Cordialement / Bien à vous],
[Prénom Nom]
[Titre / Fonction]
[Contact]`,
    toneGuidance:
      'Professionnel mais accessible. Direct sans être brusque. Un email = un sujet principal. Action attendue clairement identifiée.',
  },

  action_plan: {
    type: 'action_plan',
    label: "Plan d'Action",
    description: 'Plan structuré avec étapes, responsables et échéances',
    sections: [
      'Titre et objectif',
      'Contexte et enjeux',
      'Actions détaillées (qui, quoi, quand, comment)',
      'Jalons et indicateurs de suivi',
      'Risques et mitigation',
      'Budget / Ressources',
    ],
    formatInstructions: `FORMAT PLAN D'ACTION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PLAN D'ACTION — [TITRE]
Objectif : [résultat attendu]
Période : [début → fin]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 : [Nom] — [Période]
  ☐ Action 1.1 : [description] | Responsable : [qui] | Échéance : [quand]
  ☐ Action 1.2 : [description] | Responsable : [qui] | Échéance : [quand]
  ✓ Jalon : [critère de validation]

PHASE 2 : [Nom] — [Période]
  ☐ Action 2.1 : ...
  ☐ Action 2.2 : ...
  ✓ Jalon : [critère de validation]

RISQUES IDENTIFIÉS :
  🔴 [risque critique] → Mitigation : [action]
  🟡 [risque modéré] → Mitigation : [action]

INDICATEURS DE SUIVI :
  • [KPI 1] : [cible]
  • [KPI 2] : [cible]`,
    toneGuidance:
      'Pragmatique, concret, orienté exécution. Chaque action doit être mesurable et assignable.',
  },

  meeting_notes: {
    type: 'meeting_notes',
    label: 'Compte-Rendu de Réunion',
    description: 'PV de réunion structuré avec décisions et actions',
    sections: [
      'Informations de réunion (date, participants, durée)',
      'Ordre du jour',
      'Points discutés',
      'Décisions prises',
      'Actions à suivre (qui, quoi, quand)',
      'Prochaine réunion',
    ],
    formatInstructions: `FORMAT COMPTE-RENDU :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 COMPTE-RENDU DE RÉUNION
Date : [date] | Durée : [durée]
Participants : [liste]
Rédacteur : [nom]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDRE DU JOUR :
1. [point 1]
2. [point 2]

POINTS DISCUTÉS :
▸ [Point 1] : [résumé de la discussion]
▸ [Point 2] : [résumé de la discussion]

DÉCISIONS PRISES :
✅ [Décision 1]
✅ [Décision 2]

ACTIONS À SUIVRE :
☐ [Action] — Responsable : [qui] — Échéance : [quand]
☐ [Action] — Responsable : [qui] — Échéance : [quand]

PROCHAINE RÉUNION : [date et heure prévues]`,
    toneGuidance:
      "Factuel, concis, objectif. Distinguer clairement discussion, décision et action. Pas d'interprétation personnelle.",
  },

  business_plan: {
    type: 'business_plan',
    label: "Plan d'Affaires",
    description: 'Business plan structuré pour projet ou entreprise',
    sections: [
      'Résumé exécutif',
      'Vision et mission',
      'Analyse de marché',
      'Proposition de valeur',
      'Modèle économique',
      'Stratégie marketing',
      'Plan opérationnel',
      'Projections financières',
      'Équipe',
      'Risques et mitigation',
    ],
    formatInstructions: `FORMAT BUSINESS PLAN :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 BUSINESS PLAN — [NOM DU PROJET]
Version : [X.X] | Date : [date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Structure sections numérotées avec données chiffrées]`,
    toneGuidance:
      'Professionnel, convaincant, factuel. Données chiffrées obligatoires. Équilibre ambition et réalisme.',
  },

  proposal: {
    type: 'proposal',
    label: 'Proposition',
    description: 'Proposition commerciale ou de projet',
    sections: [
      'Page de couverture',
      'Contexte et compréhension du besoin',
      'Solution proposée',
      'Méthodologie',
      'Livrables',
      'Planning',
      'Budget / Tarification',
      'Conditions',
    ],
    formatInstructions: `FORMAT PROPOSITION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 PROPOSITION — [TITRE]
Pour : [destinataire] | Par : [auteur] | Date : [date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Sections numérotées avec focus sur la valeur apportée]`,
    toneGuidance:
      'Professionnel, orienté bénéfices client. Mettre en avant la valeur, pas juste les caractéristiques.',
  },

  cv: {
    type: 'cv',
    label: 'Curriculum Vitae',
    description: 'CV professionnel structuré',
    sections: [
      'Informations personnelles',
      'Résumé professionnel',
      'Expériences professionnelles',
      'Formation',
      'Compétences',
      'Langues',
      'Certifications / Projets',
    ],
    formatInstructions: `FORMAT CV :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[PRÉNOM NOM]
[Titre professionnel]
[Contact : téléphone | email | lieu]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROFIL
[2-3 lignes de résumé professionnel percutant]

EXPÉRIENCE PROFESSIONNELLE
▸ [Poste] — [Entreprise] | [Dates]
  • [Réalisation clé avec résultat mesurable]
  • [Réalisation clé avec résultat mesurable]

FORMATION
▸ [Diplôme] — [Établissement] | [Année]

COMPÉTENCES
[Compétences organisées par catégorie]

LANGUES
[Langue : niveau]`,
    toneGuidance:
      'Concis, orienté résultats. Chaque point doit montrer un impact mesurable. Action verbs + résultats quantifiés.',
  },

  cover_letter: {
    type: 'cover_letter',
    label: 'Lettre de Motivation',
    description: 'Lettre de candidature professionnelle',
    sections: [
      'En-tête avec coordonnées',
      'Accroche (pourquoi ce poste)',
      'Parcours pertinent (valeur ajoutée)',
      'Motivation et adéquation',
      'Conclusion et disponibilité',
    ],
    formatInstructions: `FORMAT LETTRE DE MOTIVATION :
[Structure formelle d'une lettre avec focus sur l'adéquation poste/profil]`,
    toneGuidance:
      "Authentique, motivé, professionnel. Montrer l'adéquation concrète entre le profil et le poste. Éviter les formules génériques.",
  },

  specification: {
    type: 'specification',
    label: 'Cahier des Charges',
    description: 'Document de spécification technique ou fonctionnelle',
    sections: [
      'Contexte et objectifs',
      'Périmètre',
      'Exigences fonctionnelles',
      'Exigences techniques',
      'Contraintes',
      "Critères d'acceptation",
      'Planning prévisionnel',
      'Budget estimé',
    ],
    formatInstructions: `FORMAT CAHIER DES CHARGES :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CAHIER DES CHARGES — [PROJET]
Version : [X.X] | Date : [date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Sections numérotées avec exigences numérotées EX-001, EX-002...]`,
    toneGuidance:
      'Précis, technique, non-ambigu. Chaque exigence doit être testable et mesurable.',
  },

  analysis: {
    type: 'analysis',
    label: "Note d'Analyse",
    description: "Document d'analyse approfondie sur un sujet",
    sections: [
      "Objet de l'analyse",
      'Méthodologie',
      'Données et constats',
      'Analyse et interprétation',
      'Conclusions',
      'Recommandations',
    ],
    formatInstructions: `FORMAT NOTE D'ANALYSE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 NOTE D'ANALYSE — [SUJET]
Date : [date] | Auteur : [nom]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Analyse structurée avec distinction faits/interprétations]`,
    toneGuidance:
      'Analytique, objectif, rigoureux. Distinguer clairement faits vérifiés, inférences et hypothèses.',
  },

  memo: {
    type: 'memo',
    label: 'Note de Service',
    description: 'Communication interne structurée',
    sections: [
      'De / À / Date / Objet',
      'Contexte',
      'Message principal',
      'Actions requises',
    ],
    formatInstructions: `FORMAT MÉMO :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 NOTE DE SERVICE
De : [expéditeur] | À : [destinataire(s)]
Date : [date] | Objet : [objet]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Court, direct, actionnable]`,
    toneGuidance:
      'Direct, factuel, court. Une note = un sujet. Action attendue en gras ou en fin.',
  },

  presentation: {
    type: 'presentation',
    label: 'Plan de Présentation',
    description: 'Structure de présentation avec contenu par slide',
    sections: [
      'Slide titre',
      'Agenda / Plan',
      'Slides de contenu (3-10)',
      'Slide récapitulatif',
      'Slide Q&A / Contact',
    ],
    formatInstructions: `FORMAT PRÉSENTATION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎤 PRÉSENTATION — [TITRE]
Durée : [X min] | Audience : [description]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 1 : [Titre]
• [Point clé 1]
• [Point clé 2]
📊 [Visual suggéré]
💡 Note présentateur : [ce qu'il faut dire]`,
    toneGuidance:
      'Impactant, visuel, concis. 1 idée par slide. Message clé en premier. Visuals > texte.',
  },

  tutorial: {
    type: 'tutorial',
    label: 'Guide / Tutoriel',
    description: 'Documentation pédagogique pas-à-pas',
    sections: [
      "Titre et objectif d'apprentissage",
      'Prérequis',
      'Étapes détaillées',
      'Exemples pratiques',
      "Points d'attention / Erreurs courantes",
      'Résumé et prochaines étapes',
    ],
    formatInstructions: `FORMAT TUTORIEL :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 GUIDE — [TITRE]
Niveau : [débutant/intermédiaire/avancé]
Durée estimée : [X min]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OBJECTIF : À la fin de ce guide, tu sauras [résultat]

📋 PRÉREQUIS :
• [prérequis 1]

ÉTAPE 1 : [Titre]
[Instructions détaillées pas-à-pas]
💡 Conseil : [astuce pratique]
⚠️ Attention : [piège à éviter]`,
    toneGuidance:
      'Pédagogique, progressif, encourageant. Instructions claires et vérifiables. Un débutant doit pouvoir suivre.',
  },

  generic: {
    type: 'generic',
    label: 'Document Professionnel',
    description: 'Document professionnel générique formaté',
    sections: [
      'Titre et métadonnées',
      'Introduction / Contexte',
      'Corps du document',
      'Conclusion / Recommandations',
    ],
    formatInstructions: `FORMAT DOCUMENT PROFESSIONNEL :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 [TITRE]
Date : [date] | Auteur : [nom]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Structure professionnelle avec sections claires]`,
    toneGuidance:
      'Professionnel, clair, bien structuré. Adapté au contexte et au destinataire.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DETECTION — Classify document type from user message
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect the type of professional document requested from user message.
 * Returns null if no document intent is detected.
 */
export function detectDocumentType(message: string): {
  type: DocumentType;
  confidence: number;
} | null {
  const msgLower = message.toLowerCase();
  let bestType: DocumentType = 'generic';
  let bestScore = 0;

  for (const [type, patterns] of Object.entries(DOCUMENT_SIGNALS)) {
    if (type === 'generic') continue;

    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(msgLower)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestType = type as DocumentType;
    }
  }

  if (bestScore === 0) {
    return null;
  }

  return {
    type: bestType,
    confidence: Math.min(1.0, bestScore / 2),
  };
}

/**
 * Get the document template for a given type.
 */
export function getDocumentTemplate(type: DocumentType): DocumentTemplate {
  return DOCUMENT_TEMPLATES[type] || DOCUMENT_TEMPLATES.generic;
}

/**
 * Build document formatting instructions for system prompt injection.
 * Called when a professional document intent is detected.
 */
export function buildDocumentInstructions(type: DocumentType): string {
  const template = getDocumentTemplate(type);

  logger.info('Building document instructions', {
    type,
    label: template.label,
    sectionCount: template.sections.length,
  });

  return `
═══ INSTRUCTIONS DE GÉNÉRATION DE DOCUMENT PROFESSIONNEL ═══
Type : ${template.label}
Description : ${template.description}

SECTIONS ATTENDUES :
${template.sections.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

${template.formatInstructions}

DIRECTIVES DE TON :
${template.toneGuidance}

RÈGLES DE QUALITÉ DOCUMENTAIRE :
• Le document doit être PRÊT À L'EMPLOI — directement utilisable tel quel
• Formatage professionnel cohérent (titres, sections, espacement)
• Aucune instruction méta ("voici votre document") — produire le document directement
• Adapter le niveau de détail au type de document
• Inclure toutes les sections pertinentes au contexte
═══ FIN INSTRUCTIONS DOCUMENT ═══`;
}

/**
 * Get all available document types with labels for UI display.
 */
export function getAvailableDocumentTypes(): Array<{
  type: DocumentType;
  label: string;
  description: string;
}> {
  return Object.values(DOCUMENT_TEMPLATES).map(t => ({
    type: t.type,
    label: t.label,
    description: t.description,
  }));
}

export const professionalDocumentService = {
  detectDocumentType,
  getDocumentTemplate,
  buildDocumentInstructions,
  getAvailableDocumentTypes,
  DOCUMENT_TEMPLATES,
};

export default professionalDocumentService;
