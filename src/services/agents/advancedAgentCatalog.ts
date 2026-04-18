export type AdvancedAgentReadiness = 'planned' | 'partial' | 'qualified';

export interface AdvancedAgentDetailItem {
  id: string;
  label: string;
  acknowledged?: boolean;
  correlationKey?: string;
  severity?: string;
  sessionId?: string;
}

export interface AdvancedAgentDetailSection {
  key: string;
  title: string;
  items: AdvancedAgentDetailItem[];
}

export interface AdvancedAgentStatus {
  id: 'monitoring' | 'diagnostic' | 'explainability' | 'orchestrator' | 'security_active';
  title: string;
  summary: string;
  testId: string;
  readiness: AdvancedAgentReadiness;
  readinessLabel: string;
  serviceState: string;
  evidence: string[];
  blockers: string[];
  nextStep: string;
  detailSections?: AdvancedAgentDetailSection[];
}

const ADVANCED_AGENT_STATUS: Record<AdvancedAgentStatus['id'], AdvancedAgentStatus> = {
  monitoring: {
    id: 'monitoring',
    title: 'Monitoring Agent',
    summary:
      'Surface de supervision qualifiée pour exposer l état courant du monitoring, les preuves disponibles et les lacunes runtime encore ouvertes.',
    testId: 'monitoring-dashboard',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: 'Monitoring lazy loader disponible',
    evidence: [
      'Exports lazy-loader disponibles pour captureClassifiedError, addBreadcrumb et setContext.',
      'Dashboard canonique visible via AgentDashboardsPanel avec selectors stables.',
      'Couverture E2E ciblée sur la présence, le statut et les preuves affichées.',
    ],
    blockers: [
      'Aucun flux temps réel unifié de métriques et alertes n alimente encore ce panneau.',
    ],
    nextStep:
      'Connecter les métriques runtime et les alertes croisées au dashboard monitoring canonique.',
  },
  diagnostic: {
    id: 'diagnostic',
    title: 'Auto-Diagnostic Agent',
    summary:
      'Panneau de qualification honnête pour les auto-tests, rapports d anomalies et preuve UI, sans prétendre qu un moteur runtime complet existe déjà.',
    testId: 'diagnostic-panel',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: 'Qualification UI et signaux runtime passifs disponibles',
    evidence: [
      'Service d entrée exposant un statut gouverné et relançable pour l agent.',
      'Surface canonique alignée sur le selector diagnostic-panel documenté dans la cartographie.',
      'Le dashboard explicite les écarts restants au lieu de masquer le manque de moteur runtime.',
    ],
    blockers: [
      'Le moteur auto-diagnostic et la génération de rapports d anomalie restent à implémenter.',
    ],
    nextStep:
      'Brancher un exécuteur de diagnostics réels et publier un rapport structuré depuis le service dédié.',
  },
  explainability: {
    id: 'explainability',
    title: 'Explainability Agent',
    summary:
      'Dashboard de traçabilité prêt à afficher le niveau de qualification actuel de l explicabilité et les preuves déjà disponibles.',
    testId: 'explainability-dashboard',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: 'Contrat de qualification prêt, signaux registre/runtime disponibles',
    evidence: [
      'La surface canonique expose un statut, une synthèse et les preuves UI/E2E déjà qualifiées.',
      'Le dashboard explicite la dépendance au futur rapport d explicabilité runtime.',
      'Les selectors stables sont alignés entre UI, tests et mapping.',
    ],
    blockers: [
      'Aucun pipeline de logs d inférences ni rapport d explicabilité n est encore branché.',
    ],
    nextStep:
      'Publier un flux de rapports d explicabilité et connecter les preuves d inférence réelles au panneau.',
  },
  orchestrator: {
    id: 'orchestrator',
    title: 'Dynamic Orchestrator Agent',
    summary:
      'Surface canonique de gouvernance pour la répartition de charge, les preuves d orchestration et les dépendances encore manquantes.',
    testId: 'orchestrator-dashboard',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: 'Contrat de surface prêt, signaux providers/registry disponibles',
    evidence: [
      'La surface UI active est unique et alignée sur orchestrator-dashboard.',
      'Le statut affiché décrit honnêtement la qualification actuelle de l orchestrateur.',
      'Les tests ciblés vérifient la présence du statut, des preuves et du prochain jalon.',
    ],
    blockers: [
      'Aucune télémétrie de charge ni routage dynamique des agents n alimente encore ce dashboard.',
    ],
    nextStep:
      'Connecter les métriques de charge et la répartition des tâches depuis le service orchestrator.',
  },
  security_active: {
    id: 'security_active',
    title: 'Active Security Agent',
    summary:
      'Panneau de qualification sécurité qui expose l état réel des alertes, du confinement et des intégrations encore absentes.',
    testId: 'security-dashboard',
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState:
      'Surface de qualification disponible, posture runtime partiellement qualifiée',
    evidence: [
      'Dashboard sécurité aligné sur le selector security-dashboard documenté.',
      'Les preuves affichées distinguent la qualification UI des capacités runtime restantes.',
      'Les tests ciblés valident le statut, les preuves et la prochaine action de sécurité.',
    ],
    blockers: [
      'Le pipeline de détection d anomalies réseau et de confinement automatique n est pas encore branché.',
    ],
    nextStep:
      'Brancher les événements de sécurité active et publier une preuve de confinement réelle.',
  },
};

export function listAdvancedAgentStatuses(): AdvancedAgentStatus[] {
  return Object.values(ADVANCED_AGENT_STATUS);
}

export function getAdvancedAgentStatus(
  agentId: AdvancedAgentStatus['id']
): AdvancedAgentStatus {
  return ADVANCED_AGENT_STATUS[agentId];
}
