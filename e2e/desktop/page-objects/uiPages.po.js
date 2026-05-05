export const uiPages = {
  titane: {
    id: 'titane',
    route: '/titane',
    navTestId: 'nav-titane',
    root: '[data-testid="page-titane"]',
    tabs: [
      '[data-testid="tab-conversation"]',
      '[data-testid="tab-overview"]',
      '[data-testid="tab-vision"]',
      '[data-testid="tab-memory"]',
      '[data-testid="tab-progression"]',
      '[data-testid="tab-transformation"]',
    ],
    memorySubTabs: [
      '[data-testid="memory-tab-overview"]',
      '[data-testid="memory-tab-dashboard"]',
      '[data-testid="memory-tab-tree"]',
      '[data-testid="memory-tab-search"]',
    ],
  },
  experience: {
    id: 'experience',
    route: '/experience',
    navTestId: 'nav-titane',
    root: '[data-testid="page-experience"]',
    tabs: [],
  },
  time: {
    id: 'time',
    route: '/time',
    navTestId: 'nav-time',
    root: '[data-testid="page-time"]',
    tabs: [
      '[data-testid="tab-time-now"]',
      '[data-testid="tab-time-agenda"]',
      '[data-testid="tab-time-timeline"]',
      '[data-testid="tab-time-snapshots"]',
      '[data-testid="tab-time-cognitive"]',
    ],
  },
  stats: {
    id: 'stats',
    route: '/dev',
    navTestId: 'nav-dev',
    root: '[data-testid="page-dev"]',
    tabs: [],
  },
  admin: {
    id: 'admin',
    route: '/admin',
    navTestId: 'nav-admin',
    root: '[data-testid="page-admin"]',
    tabs: [
      '[data-testid="tab-admin-system"]',
      '[data-testid="tab-admin-config"]',
      '[data-testid="tab-admin-audio"]',
      '[data-testid="tab-admin-design"]',
      '[data-testid="tab-admin-governance"]',
      '[data-testid="tab-admin-production-health"]',
    ],
  },
  dev: {
    id: 'dev',
    route: '/dev',
    navTestId: 'nav-dev',
    root: '[data-testid="page-dev"]',
    tabs: [
      '[data-testid="tab-dev-overview"]',
      '[data-testid="tab-dev-diagnostics"]',
      '[data-testid="tab-dev-operations"]',
      '[data-testid="tab-dev-validation"]',
      '[data-testid="tab-dev-security"]',
    ],
  },
  fusion: {
    id: 'fusion',
    route: '/fusion',
    navTestId: 'nav-fusion',
    root: '[data-testid="page-fusion"]',
    tabs: [],
  },
  cloud: {
    id: 'cloud',
    route: '/cloud',
    navTestId: 'nav-fusion',
    root: '[data-testid="page-cloud-center"]',
    tabs: [],
  },
  realityCenter: {
    id: 'reality-center',
    route: '/reality-center',
    navTestId: 'nav-fusion',
    root: '[data-testid="page-reality-center"]',
    tabs: [],
  },
  hyperCenter: {
    id: 'hyper-center',
    route: '/hyper-center',
    navTestId: 'nav-fusion',
    root: '[data-testid="page-hyper-center"]',
    tabs: [],
  },
  quantumCenter: {
    id: 'quantum-center',
    route: '/quantum-center',
    navTestId: 'nav-fusion',
    root: '[data-testid="page-quantum-center"]',
    tabs: [],
  },
  twins: {
    id: 'twins',
    route: '/twins',
    navTestId: 'nav-twins',
    root: '[data-testid="page-twins"]',
    tabs: [],
  },
  docCenter: {
    id: 'doc-center',
    route: '/doc-center',
    navTestId: null, // accès direct via URL, pas de nav item dédié v31.1.0
    root: '[data-testid="doc-center-page"]',
    tabs: [],
  },
  optimization: {
    id: 'optimization',
    route: '/optimization',
    navTestId: 'nav-optimization',
    root: '[data-testid="page-optimization"]',
    tabs: [],
  },
  totalDev: {
    id: 'total-dev',
    route: '/total-dev',
    navTestId: 'nav-total-dev',
    root: '[data-testid="page-total-dev"]',
    tabs: [],
  },
  orchestrationIntelligence: {
    id: 'orchestration-intelligence',
    route: '/orchestration-intelligence',
    navTestId: 'nav-dev',
    root: '[data-testid="page-orchestration-intelligence"]',
    tabs: [],
  },
  orchestrationCenter: {
    id: 'orchestration-center',
    route: '/orchestration-center',
    navTestId: 'nav-dev',
    root: '[data-testid="page-orchestration-meta-center"]',
    tabs: [],
  },
  singularity: {
    id: 'singularity',
    route: '/singularity',
    navTestId: 'nav-dev',
    root: '[data-testid="page-singularity-monitor"]',
    tabs: [],
  },
  sentinel: {
    id: 'sentinel',
    route: '/sentinel',
    navTestId: 'nav-dev',
    root: '[data-testid="page-sentinel"]',
    tabs: [],
  },
  watchdog: {
    id: 'watchdog',
    route: '/watchdog',
    navTestId: 'nav-dev',
    root: '[data-testid="page-watchdog"]',
    tabs: [],
  },
  selfheal: {
    id: 'selfheal',
    route: '/selfheal',
    navTestId: 'nav-dev',
    root: '[data-testid="page-selfheal"]',
    tabs: [],
  },
  adaptive: {
    id: 'adaptive',
    route: '/adaptive',
    navTestId: 'nav-dev',
    root: '[data-testid="page-adaptive-engine"]',
    tabs: [],
  },
  memory: {
    id: 'memory',
    route: '/memory',
    navTestId: 'nav-titane',
    root: '[data-testid="page-memory"]',
    tabs: [],
  },
  research: {
    id: 'research',
    route: '/research',
    navTestId: 'nav-titane',
    root: '[data-testid="research-page"]',
    tabs: [],
  },
  skills: {
    id: 'skills',
    route: '/skills',
    navTestId: 'nav-titane',
    root: '[data-testid="page-skills"]',
    tabs: [],
  },
  knowledge: {
    id: 'knowledge',
    route: '/knowledge',
    navTestId: 'nav-titane',
    root: '[data-testid="page-knowledge"]',
    tabs: [],
  },
  creation: {
    id: 'creation',
    route: '/creation',
    navTestId: 'nav-titane',
    root: '[data-testid="page-creation-studio"]',
    tabs: [],
  },
  evolution: {
    id: 'evolution',
    route: '/evolution',
    navTestId: 'nav-titane',
    root: '[data-testid="page-evolution-monitor"]',
    tabs: [],
  },
  performance: {
    id: 'performance',
    route: '/performance',
    navTestId: 'nav-optimization',
    root: '[data-testid="page-performance-test"]',
    tabs: [],
  },
};

export const topLevelPageOrder = [
  uiPages.titane,
  uiPages.time,
  uiPages.admin,
  uiPages.dev,
  uiPages.fusion,
  uiPages.optimization,
];

export const devEngineRoutePages = [
  uiPages.singularity,
  uiPages.sentinel,
  uiPages.watchdog,
  uiPages.selfheal,
  uiPages.adaptive,
];

export const titaneOwnedRoutePages = [
  uiPages.experience,
  uiPages.memory,
  uiPages.research,
  uiPages.skills,
  uiPages.knowledge,
  uiPages.creation,
  uiPages.evolution,
];

export const directRoutePages = [uiPages.docCenter];

export const devOwnedRoutePages = [
  uiPages.orchestrationIntelligence,
  uiPages.orchestrationCenter,
  ...devEngineRoutePages,
];

export const fusionOwnedRoutePages = [
  uiPages.cloud,
  uiPages.realityCenter,
  uiPages.hyperCenter,
  uiPages.quantumCenter,
];

export const moreMenuRoutePages = [
  uiPages.twins,
  uiPages.optimization,
  uiPages.totalDev,
  uiPages.performance,
];

export const canonicalRoutePages = [
  uiPages.titane,
  ...titaneOwnedRoutePages,
  ...directRoutePages,
  uiPages.time,
  uiPages.admin,
  uiPages.dev,
  ...devOwnedRoutePages,
  uiPages.fusion,
  ...fusionOwnedRoutePages,
  ...moreMenuRoutePages,
];
