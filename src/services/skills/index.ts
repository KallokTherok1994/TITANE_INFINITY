/**
 * TITANE∞ Skill OS — Public API
 *
 * Single entry point for all skill operations.
 */

// Types
export type {
  SkillLifecycleState,
  SkillSourceType,
  SkillCategory,
  PortabilityClass,
  PortabilityAssessment,
  PortabilityMatrix,
  CanonicalImportEnvelope,
  KnowledgeFile,
  RawToolDefinition,
  SourceAnalysisDossier,
  KnowledgeAsset,
  AnalyzedTool,
  AnalyzedAction,
  AuthRequirement,
  TitaneSkillPackage,
  TitaneSkillManifest,
  SkillBehaviorContract,
  SkillKnowledgeBundle,
  SkillActivationContract,
  SkillProofContract,
  SkillRollbackContract,
  SkillRegistryEntry,
  SkillLifecycleResult,
  SkillImportInput,
} from './types';

// Manifest builder
export {
  generateSkillId,
  buildManifest,
  buildBehaviorContract,
  buildKnowledgeBundle,
  buildActivationContract,
  buildProofContract,
  buildRollbackContract,
  buildSkillPackage,
  validateSkillPackage,
  validateManifest,
  toChatModeCompatible,
} from './skillManifest';

// Ingestion
export { ingestSource, ingestPrompt, ingestManifest } from './ingestion/sourceParser';

// Classification
export { classifyPortability } from './classification/portabilityClassifier';

// Translation
export { translateToNativePackage } from './translation/skillTranslator';

// Registry
export {
  getSkillRegistry,
  getSkillById,
  installSkill,
  uninstallSkill,
  updateSkillState,
} from './registry/skillRegistry';

// Activation
export {
  activateSkill,
  deactivateSkill,
  getActiveSkill,
  getActiveSkillId,
  getSystemPromptForSkill,
  isSkillActive,
} from './activation/skillActivator';

// Lifecycle
export {
  fullInstallPipeline,
  fullUninstall,
  disableSkill,
  archiveSkill,
  reinstallSkill,
} from './lifecycle/skillLifecycle';
