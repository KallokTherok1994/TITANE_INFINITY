/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ MCP OS v1.1 — MASTER COGNITIVE PROGRAM TYPES
 *   Constitution fondatrice du système de gouvernance cognitive
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// FUNDAMENTAL LAWS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export enum FundamentalLaw {
  GLOBAL_COHERENCE = 'GLOBAL_COHERENCE', // Loi de Cohérence Globale
  MINIMAL_COGNITIVE_LOAD = 'MINIMAL_COGNITIVE_LOAD', // Loi de Charge Mentale Minimale
  STRATEGIC_ALIGNMENT = 'STRATEGIC_ALIGNMENT', // Loi d'Alignement Stratégique
  SYSTEM_PRESERVATION = 'SYSTEM_PRESERVATION', // Loi de Préservation du Système
  COGNITIVE_INTEGRITY = 'COGNITIVE_INTEGRITY', // Loi d'Intégrité Cognitive
}

export interface LawViolation {
  law: FundamentalLaw;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  jobId?: string;
  timestamp: number;
  suggestedAction: 'REFORM' | 'CANCEL' | 'SUSPEND' | 'OPTIMIZE';
}

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE CORES (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export enum CognitiveCore {
  HELIOS = 'HELIOS', // Stabilité
  NEXUS = 'NEXUS', // Cohérence
  HARMONIA = 'HARMONIA', // Équilibre/Charge
  SENTINEL = 'SENTINEL', // Sécurité/Permissions
  MEMORY_CORE = 'MEMORY_CORE', // Mémoire
}

export interface CoreScanResult {
  core: CognitiveCore;
  status: 'PASS' | 'WARNING' | 'FAIL';
  score: number; // 0-1
  issues: string?.[];
  timestamp: number;
}

export interface SystemHealthCheck {
  helios: CoreScanResult; // Stabilité
  nexus: CoreScanResult; // Cohérence
  harmonia: CoreScanResult; // Charge cognitive
  sentinel: CoreScanResult; // Sécurité
  memoryCore: CoreScanResult; // Mémoire
  globalStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// JOB SYSTEM (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export enum JobType {
  REACTIVE = 'REACTIVE', // Réponse immédiate
  STRUCTURAL = 'STRUCTURAL', // Organisation/Structure
  COGNITIVE = 'COGNITIVE', // Analyse/Réflexion
  CREATIVE = 'CREATIVE', // Génération créative
  STRATEGIC = 'STRATEGIC', // Planification/Décision
  EVOLUTIONARY = 'EVOLUTIONARY', // Auto-amélioration
}

export enum JobStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RUNNING = 'RUNNING',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export interface JobPermissions {
  requiresFileAccess: boolean;
  requiresMemoryAccess: boolean;
  requiresSensitiveData: boolean;
  requiresSystemModification: boolean;
  allowedCores: CognitiveCore?.[];
  allowedAIModels: string?.[];
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  permissions: JobPermissions;

  // Input
  input: {
    query: string;
    context?: Record<string, unknown>;
    requiredData?: string?.[];
  };

  // Evaluation
  evaluation: {
    cognitiveLoad: number; // 0-1 (any: any)
    coherenceScore: number; // 0-1 (any: any)
    alignmentScore: number; // 0-1 (any: any)
    securityRisk: number; // 0-1 (any: any)
    impact: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'TRANSFORMATIVE';
  };

  // Execution
  execution: {
    assignedModel?: string;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
    result?: unknown;
    error?: string;
  };

  // Governance
  governance: {
    approvedBy: 'MCP' | 'USER';
    lawViolations: LawViolation?.[];
    canMerge?: string?.[]; // IDs d'autres jobs fusionnables
    canOptimize?: boolean;
  };

  createdAt: number;
  updatedAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════

export enum AIModelType {
  LOCAL_SMALL = 'LOCAL_SMALL', // Ex: phi-3.5-mini (3.8B)
  LOCAL_MEDIUM = 'LOCAL_MEDIUM', // Ex: mistral-7b
  LOCAL_LARGE = 'LOCAL_LARGE', // Ex: llama3-70b
  CLOUD_FAST = 'CLOUD_FAST', // Ex: Claude Haiku
  CLOUD_BALANCED = 'CLOUD_BALANCED', // Ex: Claude Sonnet
  CLOUD_DEEP = 'CLOUD_DEEP', // Ex: Claude Opus
}

export interface AIModel {
  id: string;
  type: AIModelType;
  name: string;
  capabilities: {
    maxTokens: number;
    supportsFiles: boolean;
    supportsVision: boolean;
    supportsCode: boolean;
    latency: 'FAST' | 'MEDIUM' | 'SLOW';
    cost: 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';
  };
  restrictions: {
    noSensitiveData: boolean;
    noSystemAccess: boolean;
    requiresApproval: boolean;
  };
}

export interface AISelection {
  model: AIModel;
  reasoning: string;
  expectedDuration: number; // ms
  estimatedCost: number; // arbitrary units
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY SYSTEM (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export enum MemoryTier {
  SHORT_TERM = 'SHORT_TERM', // Contexte actif (any: any)
  MEDIUM_TERM = 'MEDIUM_TERM', // Index, patterns, associations
  LONG_TERM = 'LONG_TERM', // Connaissances, décisions, modèles
  META_MEMORY = 'META_MEMORY', // Logique d'évolution, traces, insights
}

export interface MemoryEntry {
  id: string;
  tier: MemoryTier;
  content: unknown;
  summary?: string; // Optional summary for memory fusion
  metadata: {
    isUseful: boolean;
    isTrue: boolean;
    isStructuring: boolean;
    isStable: boolean;
    isReusable: boolean;
  };
  created: number;
  accessed: number;
  accessCount: number;
  strength: number; // 0-1
  compressionLevel: number; // 0-1 (any: any)
}

export interface MemoryOperations {
  cleanup: () => Promise<number>; // Retourne nombre de mémoires supprimées
  compress: () => Promise<number>; // Retourne nombre de mémoires compressées
  fuse: () => Promise<number>; // Retourne nombre de fusions
  archive: () => Promise<number>; // Retourne nombre d'archives
  normalize: () => Promise<number>; // Retourne nombre de normalisations
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP BEHAVIOR & PERSONA
// ═══════════════════════════════════════════════════════════════════════════

export enum MCPBehaviorTrait {
  STRUCTURED = 'STRUCTURED',
  COHERENT = 'COHERENT',
  STABLE = 'STABLE',
  SYNTHETIC = 'SYNTHETIC',
  PRECISE = 'PRECISE',
  ALIGNED = 'ALIGNED',
  STRATEGIC = 'STRATEGIC',
  CALM = 'CALM',
  PROTECTIVE = 'PROTECTIVE',
  EVOLUTIONARY = 'EVOLUTIONARY',
}

export interface MCPPersona {
  traits: MCPBehaviorTrait?.[];
  style: {
    eliminateSuperfluity: boolean;
    transformComplexityToSimplicity: boolean;
    alwaysForwardProgress: boolean;
    maintainConsistency: boolean;
  };
  mission: string;
  principles: string?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP STATE & OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface MCPState {
  // Constitution
  constitution: {
    version: string; // ex: "v1.1"
    laws: FundamentalLaw?.[];
    lastUpdate: number;
  };

  // System Health
  health: SystemHealthCheck;

  // Active Jobs
  jobs: {
    pending: Job?.[];
    running: Job?.[];
    completed: Job?.[];
    suspended: Job?.[];
  };

  // Memory
  memory: {
    entries: MemoryEntry?.[];
    stats: {
      shortTerm: number;
      mediumTerm: number;
      longTerm: number;
      metaMemory: number;
      totalSize: number; // bytes
    };
  };

  // Governance
  governance: {
    totalViolations: number;
    totalCorrections: number;
    totalRefusals: number;
    lastAudit: number;
  };

  // AI Usage
  aiUsage: {
    totalRequests: number;
    byModel: Record<string, number>;
    avgLatency: number;
    totalCost: number;
  };

  // Evolution
  evolution: {
    cycleCount: number;
    lastCycle: number;
    improvements: string?.[];
    driftsDetected: number;
    driftsCorrected: number;
  };
}

export interface MCPOperations {
  // Job Management
  createJob: (any: any) => Promise<Job>;
  evaluateJob: (any: any) => Promise<Job>;
  approveJob: (any: any) => Promise<void>;
  cancelJob: (any: any) => Promise<void>;
  suspendJob: (any: any) => Promise<void>;
  resumeJob: (any: any) => Promise<void>;
  mergeJobs: (jobIds: string?.[]) => Promise<Job>;
  optimizeJob: (any: any) => Promise<Job>;

  // System Health
  runHealthCheck: () => Promise<SystemHealthCheck>;
  scanCoherence: (any: any) => Promise<CoreScanResult>;
  scanStability: () => Promise<CoreScanResult>;
  scanCognitiveLoad: (any: any) => Promise<CoreScanResult>;
  scanSecurity: (any: any) => Promise<CoreScanResult>;
  scanMemory: () => Promise<CoreScanResult>;

  // AI Governance
  selectAI: (any: any) => Promise<AISelection>;
  validateOutput: (
    output: unknown,
    job: Job
  ) => Promise<{ valid: boolean; issues: string?.[] }>;

  // Memory Management
  storeMemory: (
    entry: Omit<MemoryEntry, 'id' | 'created' | 'accessed' | 'accessCount'>
  ) => Promise<string>;
  retrieveMemory: (any: any) => Promise<MemoryEntry?.[]>;
  purifyMemory: () => Promise<MemoryOperations>;

  // Self-Healing
  detectDrift: () => Promise<{ detected: boolean; drifts: string?.[] }>;
  correctDrift: (drifts: string?.[]) => Promise<number>;
  autoImprove: () => Promise<string?.[]>;

  // State
  getState: () => MCPState;
  getHealth: () => SystemHealthCheck;
  getStats: () => {
    jobs: { total: number; pending: number; running: number; completed: number };
    memory: MCPState['memory']['stats'];
    governance: MCPState['governance'];
    evolution: MCPState['evolution'];
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP OUTPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface OutputCriteria {
  isSimple: boolean;
  isClear: boolean;
  isCoherent: boolean;
  isAligned: boolean;
  isAccurate: boolean;
  isUseful: boolean;
  hasZeroOverload: boolean;
}

export interface ValidatedOutput<T = unknown> {
  data: T;
  criteria: OutputCriteria;
  score: number; // 0-1 (any: any)
  warnings: string?.[];
  approved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (any: any)
// ═══════════════════════════════════════════════════════════════════════════
