/**
 * TITANE∞ Skill OS — Core Type Definitions
 *
 * Defines the canonical TITANE-native skill package format.
 * Imported external artifacts (GPT-like, prompts, manifests) are
 * translated into this format before installation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SKILL LIFECYCLE STATES
// ─────────────────────────────────────────────────────────────────────────────

/** All possible lifecycle states for an installed skill */
export type SkillLifecycleState =
  | 'DISCOVERED' // Source ingested, not yet analyzed
  | 'ANALYZED' // Components extracted and classified
  | 'TRANSLATED' // Converted to TITANE-native package
  | 'INSTALLED' // Persisted in registry
  | 'ACTIVE' // Currently routable/selected in chat
  | 'DEGRADED' // Installed but some features unsupported
  | 'DISABLED' // Installed but deactivated
  | 'FAILED' // Installation or activation failed
  | 'ARCHIVED'; // Retained for history, not usable

/** Source types for skill ingestion */
export type SkillSourceType =
  | 'prompt' // Raw text prompt/instructions
  | 'manifest' // JSON/YAML manifest file
  | 'gpt-import' // GPT-like metadata export
  | 'openapi' // OpenAPI action bundle
  | 'zip-package' // Packaged ZIP skill
  | 'manual'; // Created manually in TITANE

/** Skill categories (matches existing ChatModeCategory) */
export type SkillCategory = 'general' | 'creative' | 'technical' | 'strategic' | 'custom';

// ─────────────────────────────────────────────────────────────────────────────
// PORTABILITY CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/** How portable a source element is to TITANE */
export type PortabilityClass =
  | 'DIRECTLY_PORTABLE' // Can be used as-is
  | 'PORTABLE_WITH_TRANSLATION' // Needs conversion
  | 'PORTABLE_WITH_INDEXING' // Needs knowledge indexing
  | 'EXTERNAL_DEPENDENCY' // Requires external auth/service
  | 'UNSUPPORTED' // Not supported by TITANE runtime
  | 'UNKNOWN'; // Cannot determine

/** A single portability assessment */
export interface PortabilityAssessment {
  element: string; // Name/description of the element
  sourceType: string; // What type of element (instruction, tool, action, etc.)
  classification: PortabilityClass;
  reason: string; // Why this classification
  translationHint?: string; // How to translate if PORTABLE_WITH_TRANSLATION
}

/** Full portability matrix for a skill source */
export interface PortabilityMatrix {
  totalElements: number;
  portable: number;
  needsTranslation: number;
  needsIndexing: number;
  externalDependency: number;
  unsupported: number;
  unknown: number;
  assessments: PortabilityAssessment[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL IMPORT ENVELOPE (Layer 1 output)
// ─────────────────────────────────────────────────────────────────────────────

/** Raw ingested source before classification */
export interface CanonicalImportEnvelope {
  id: string; // Unique import ID
  sourceType: SkillSourceType;
  rawName: string; // Extracted or user-provided name
  rawDescription: string;
  rawInstructions: string; // Main system prompt / instructions
  rawExamples: string[]; // Conversation starters / examples
  rawKnowledgeFiles: KnowledgeFile[]; // Attached files/docs
  rawTools: RawToolDefinition[]; // Detected tools/actions
  rawMetadata: Record<string, unknown>; // Anything else detected
  ingestedAt: string; // ISO timestamp
}

/** A knowledge file from the source */
export interface KnowledgeFile {
  name: string;
  content: string;
  mimeType: string;
  size: number;
}

/** A raw tool/action definition from source */
export interface RawToolDefinition {
  name: string;
  description: string;
  schema?: Record<string, unknown>; // OpenAI function schema or OpenAPI fragment
  authRequired: boolean;
  endpoint?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE ANALYSIS DOSSIER (Layer 2 output)
// ─────────────────────────────────────────────────────────────────────────────

/** Extracted analysis from a source */
export interface SourceAnalysisDossier {
  skillName: string;
  skillId: string; // Generated titane-skill-<hash>
  version: string;
  author: string;
  purpose: string;
  targetBehaviors: string[];
  instructions: string; // Cleaned/normalized instructions
  examples: string[];
  knowledgeAssets: KnowledgeAsset[];
  tools: AnalyzedTool[];
  actions: AnalyzedAction[];
  dependencies: string[];
  authRequirements: AuthRequirement[];
  confidenceNotes: string[]; // Risk/confidence observations
}

/** Indexed knowledge asset */
export interface KnowledgeAsset {
  id: string;
  name: string;
  content: string;
  indexed: boolean;
  searchMode: 'semantic' | 'keyword' | 'hybrid';
  mimeType: string;
}

/** Analyzed tool definition */
export interface AnalyzedTool {
  name: string;
  description: string;
  portability: PortabilityClass;
  schema?: Record<string, unknown>;
  titaneEquivalent?: string; // If TITANE already has this tool
}

/** Analyzed action/API definition */
export interface AnalyzedAction {
  name: string;
  endpoint: string;
  method: string;
  portability: PortabilityClass;
  authRequired: boolean;
  titaneSupported: boolean;
}

/** Auth requirement from source */
export interface AuthRequirement {
  type: 'api_key' | 'oauth' | 'bearer' | 'basic' | 'unknown';
  service: string;
  description: string;
  supported: boolean; // Whether TITANE can handle this
}

// ─────────────────────────────────────────────────────────────────────────────
// TITANE NATIVE SKILL PACKAGE (Layer 4 — the canonical format)
// ─────────────────────────────────────────────────────────────────────────────

/** The complete TITANE-native skill package */
export interface TitaneSkillPackage {
  manifest: TitaneSkillManifest;
  behavior: SkillBehaviorContract;
  knowledge: SkillKnowledgeBundle;
  activation: SkillActivationContract;
  proof: SkillProofContract;
  rollback: SkillRollbackContract;
}

/** Skill manifest — identity and metadata */
export interface TitaneSkillManifest {
  id: string; // titane-skill-<uuid>
  name: string;
  version: string;
  description: string;
  category: SkillCategory;
  source: {
    type: SkillSourceType;
    origin: string; // URL, filename, or "manual"
  };
  installTimestamp: string; // ISO 8601
  state: SkillLifecycleState;
  author: string;
  tags: string[];
  portabilityMatrix: PortabilityMatrix; // Honesty record
}

/** Behavior contract — how the skill influences chat */
export interface SkillBehaviorContract {
  systemPrompt: string;
  responseStyle: {
    tone: string;
    format: string;
    depth: string;
  };
  routingHints: string[]; // Keywords/patterns for auto-routing
  memoryPolicy: 'isolated' | 'shared' | 'readonly';
  allowedTools: string[]; // Tool names the skill may use
  blockedTools: string[]; // Explicitly blocked tools
  temperature: number;
  maxTokens: number;
}

/** Knowledge bundle — indexed docs/files */
export interface SkillKnowledgeBundle {
  assets: KnowledgeAsset[];
  searchMode: 'semantic' | 'keyword' | 'hybrid';
  totalSize: number; // Bytes
}

/** Activation contract — how the skill gets selected */
export interface SkillActivationContract {
  manualTrigger: boolean; // Can user manually select?
  autoRouteConditions: string[]; // Patterns that auto-activate
  priority: number; // Higher = preferred
  conflictResolution: 'override' | 'merge' | 'block';
}

/** Proof contract — what proves the skill is working */
export interface SkillProofContract {
  installedCriteria: string[]; // What proves installed
  activatedCriteria: string[]; // What proves activated
  consumedCriteria: string[]; // What proves chat used it
}

/** Rollback contract — how to undo */
export interface SkillRollbackContract {
  disablePath: string; // How to deactivate
  uninstallPath: string; // How to remove
  revertPath: string; // How to restore prior state
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL REGISTRY ENTRY
// ─────────────────────────────────────────────────────────────────────────────

/** What the registry tracks for each installed skill */
export interface SkillRegistryEntry {
  id: string;
  name: string;
  version: string;
  state: SkillLifecycleState;
  installSource: SkillSourceType;
  installTimestamp: string;
  lastActivation: string | null;
  lastFailure: string | null;
  healthStatus: 'healthy' | 'degraded' | 'failed';
  knowledgeIndexStatus: 'indexed' | 'pending' | 'failed' | 'none';
  dependencies: string[];
  rollbackAvailable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL LIFECYCLE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Result of a lifecycle operation */
export interface SkillLifecycleResult {
  success: boolean;
  previousState: SkillLifecycleState;
  newState: SkillLifecycleState;
  message: string;
  warnings: string[];
  errors: string[];
}

/** Input for skill import */
export interface SkillImportInput {
  source: string; // The raw content (prompt text, JSON, URL, etc.)
  sourceType: SkillSourceType;
  name?: string; // Optional user-provided name
  category?: SkillCategory;
  tags?: string[];
}
