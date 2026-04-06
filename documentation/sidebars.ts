/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — Sidebars Configuration
 * ═══════════════════════════════════════════════════════════════
 */

import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  architectureSidebar: [
    {
      type: 'doc',
      id: 'architecture/ARCHITECTURE',
      label: "Vue d'ensemble",
    },
    {
      type: 'doc',
      id: 'architecture/ARCHITECTURE_RINGS',
      label: 'Architecture 4-Rings',
    },
    {
      type: 'doc',
      id: 'architecture/ARCHITECTURE_SIMPLIFIED',
      label: 'Architecture simplifiée',
    },
    {
      type: 'category',
      label: 'Système',
      items: ['system/SYSTEME'],
    },
  ],

  modulesSidebar: [
    {
      type: 'doc',
      id: 'modules/memory',
      label: 'Mémoire unifiée (STM/MTM/LTM)',
    },
    {
      type: 'doc',
      id: 'modules/security',
      label: 'Sécurité (Sentinel)',
    },
    {
      type: 'doc',
      id: 'modules/conversation-engine',
      label: 'Moteur de conversation',
    },
    {
      type: 'doc',
      id: 'modules/singularity',
      label: 'Singularity',
    },
    {
      type: 'doc',
      id: 'modules/harmonia',
      label: 'Harmonia',
    },
  ],

  apiSidebar: [
    {
      type: 'doc',
      id: 'api/API_SURFACE',
      label: 'Surface API',
    },
    {
      type: 'doc',
      id: 'api/API_REFERENCE',
      label: 'Référence API',
    },
  ],

  guidesSidebar: [
    {
      type: 'doc',
      id: 'guides/QUICKSTART',
      label: 'Démarrage rapide',
    },
    {
      type: 'doc',
      id: 'guides/CONTRIBUTING',
      label: 'Contribuer',
    },
    {
      type: 'doc',
      id: 'guides/DEPLOYMENT',
      label: 'Déploiement',
    },
  ],
};

export default sidebars;
