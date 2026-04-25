// HTF Module — L'Humain à tout faire
// Définition du Skill OS : titane-skill-htf-estimateur

import type { TitaneSkillPackage } from '../skills/types';

export const HTF_SKILL_ID = 'titane-skill-htf-estimateur';

export const htfSkillDefinition: TitaneSkillPackage = {
  manifest: {
    id: HTF_SKILL_ID,
    name: "Estimateur HTF — L'Humain à tout faire",
    version: '1.0.0',
    description:
      "Compétence d'estimation et de génération de soumissions professionnelles pour les services d'aménagement extérieur de L'Humain à tout faire (Kevin Thibault, Saguenay).",
    category: 'custom',
    source: {
      type: 'manual',
      origin: 'htfSkillDefinition.ts',
    },
    installTimestamp: new Date().toISOString(),
    state: 'ACTIVE',
    author: "Kevin Thibault — L'Humain à tout faire",
    tags: ['htf', 'estimation', 'soumission', 'amenagement', 'saguenay'],
    portabilityMatrix: {
      totalElements: 5,
      portable: 5,
      needsTranslation: 0,
      needsIndexing: 0,
      externalDependency: 0,
      unsupported: 0,
      unknown: 0,
      assessments: [],
      overallRisk: 'LOW',
    },
  },
  behavior: {
    systemPrompt: `Tu es l'assistant estimateur de L'Humain à tout faire, entreprise d'aménagement extérieur de Kevin Thibault à Saguenay, Québec.

IDENTITÉ STRICTE :
- Entreprise : L'Humain à tout faire
- Fondateur et seul membre : Kevin Thibault
- Site : www.humainatoutfaire.com
- Zone de service : Saguenay-Lac-Saint-Jean (Zone 3)
- Tarifs 2025

MISSION :
Analyser les demandes de travaux et générer des soumissions professionnelles précises.

WORKFLOW SOUMISSION :
1. ANALYSER : Identifier le type de service, la superficie/dimensions, la complexité
2. CHARGER LA POS : Utiliser la Procédure Opératoire Standard correspondante
3. CALCULER LES MATÉRIAUX : Quantités exactes avec formules HTF
4. VALIDER LES PRIX : Référencer le catalogue HTF, rechercher en ligne si besoin
5. ESTIMER LA MAIN-D'ŒUVRE : Heures × niveau technicien (T1/T2/T3) × taux horaire
6. APPLIQUER LES MAJORATIONS : Urgence, accès difficile, fin de semaine, etc.
7. GÉNÉRER LE PLAN : Étapes numérotées avec durées
8. FORMATER LA SOUMISSION : Numéro S{AAAA}{MM}-{NNN}, toutes sections obligatoires, taxes
9. SAUVEGARDER : CRM clients + historique

RÈGLES ABSOLUES :
- Prix en dollars canadiens, taxes TPS 5% + TVQ 9.975%
- Soumission valide 30 jours
- Acompte 30% à la signature
- Ne jamais mentionner d'autres membres que Kevin Thibault
- Utiliser le style québécois professionnel et chaleureux`,
    responseStyle: {
      tone: 'professionnel et chaleureux, style québécois',
      format: 'soumission structurée avec tableaux et totaux clairs',
      depth: 'détaillé avec plan de mise en œuvre',
    },
    routingHints: [
      'soumission',
      'estimation',
      'devis',
      'humain à tout faire',
      'htf',
      'aménagement',
      'terrasse',
      'entrée',
      'pavé',
      'dalle',
      'gazon',
      'haie',
      'éclairage extérieur',
      'Kevin',
      'Saguenay',
    ],
    memoryPolicy: 'shared',
    allowedTools: ['web_search', 'knowledge_base', 'htf_estimation', 'htf_crm'],
    blockedTools: [],
    temperature: 0.3,
    maxTokens: 4096,
  },
  knowledge: {
    assets: [
      { id: 'htf_module_identity', name: 'Identité HTF', content: '', indexed: false, searchMode: 'hybrid', mimeType: 'application/json' },
      { id: 'htf_formation_manuel', name: 'Manuel formation T1/T2/T3', content: '', indexed: false, searchMode: 'hybrid', mimeType: 'application/json' },
      { id: 'htf_estimation_rules', name: 'Règles de tarification', content: '', indexed: false, searchMode: 'hybrid', mimeType: 'application/json' },
      { id: 'htf_services_catalogue', name: 'Catalogue services', content: '', indexed: false, searchMode: 'hybrid', mimeType: 'application/json' },
      { id: 'htf_soumission_template', name: 'Modèle soumission', content: '', indexed: false, searchMode: 'hybrid', mimeType: 'application/json' },
    ],
    searchMode: 'hybrid',
    totalSize: 0,
  },
  activation: {
    manualTrigger: true,
    autoRouteConditions: [
      'soumission',
      'estimation HTF',
      'devis aménagement',
      "humain à tout faire",
      'mode htf',
      'htf_soumission',
    ],
    priority: 90,
    conflictResolution: 'override',
  },
  proof: {
    installedCriteria: ['skill in registry', 'localStorage key titane_htf_clients accessible'],
    activatedCriteria: ['htf_soumission mode active', 'HTF skill selected in chat'],
    consumedCriteria: ['response contains soumission number S{AAAA}{MM}-{NNN}', 'response contains TPS/TVQ'],
  },
  rollback: {
    disablePath: `skillRegistry.updateSkillState(HTF_SKILL_ID, 'DISABLED')`,
    uninstallPath: `skillRegistry.uninstallSkill(HTF_SKILL_ID)`,
    revertPath: 'localStorage.removeItem("titane_htf_clients"); localStorage.removeItem("titane_htf_submissions")',
  },
};
