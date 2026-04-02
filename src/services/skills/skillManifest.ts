/**
 * TITANE∞ Skill OS — Manifest Builder & Validator
 *
 * Builds, validates, and manages TITANE-native skill manifests.
 */

import type {
  TitaneSkillManifest,
  TitaneSkillPackage,
  SkillLifecycleState,
  SkillCategory,
  SkillSourceType,
  PortabilityMatrix,
  SkillBehaviorContract,
  SkillKnowledgeBundle,
  SkillActivationContract,
  SkillProofContract,
  SkillRollbackContract,
  CanonicalImportEnvelope,
  SourceAnalysisDossier,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a stable skill ID from name + source */
export function generateSkillId(name: string, source: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const hash = simpleHash(source).toString(16).slice(0, 8);
  return `titane-skill-${slug}-${hash}`;
}

/** Simple non-cryptographic hash for ID generation */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// MANIFEST BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build a manifest from an analysis dossier */
export function buildManifest(
  dossier: SourceAnalysisDossier,
  portabilityMatrix: PortabilityMatrix,
  sourceType: SkillSourceType,
  origin: string
): TitaneSkillManifest {
  const state = determineInitialState(portabilityMatrix);

  return {
    id: dossier.skillId,
    name: dossier.skillName,
    version: dossier.version,
    description: dossier.purpose,
    category: mapToCategory(dossier),
    source: { type: sourceType, origin },
    installTimestamp: new Date().toISOString(),
    state,
    author: dossier.author,
    tags: deriveTags(dossier),
    portabilityMatrix,
  };
}

/** Determine initial lifecycle state based on portability */
function determineInitialState(matrix: PortabilityMatrix): SkillLifecycleState {
  if (matrix.overallRisk === 'CRITICAL') return 'FAILED';
  if (matrix.externalDependency > 0 || matrix.unsupported > 0) return 'DEGRADED';
  return 'INSTALLED';
}

/** Map dossier to a TITANE skill category */
function mapToCategory(dossier: SourceAnalysisDossier): SkillCategory {
  const name = dossier.skillName.toLowerCase();
  const purpose = dossier.purpose.toLowerCase();
  const combined = `${name} ${purpose}`;

  if (combined.match(/creative|art|story|write|design|brainstorm/)) return 'creative';
  if (combined.match(/code|dev|program|technical|api|debug/)) return 'technical';
  if (combined.match(/strateg|plan|decision|business/)) return 'strategic';
  if (combined.match(/custom|special|niche/)) return 'custom';
  return 'general';
}

/** Derive tags from dossier content */
function deriveTags(dossier: SourceAnalysisDossier): string[] {
  const tags = new Set<string>();

  // From behaviors
  dossier.targetBehaviors.forEach(b => {
    const words = b
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);
    words.forEach(w => tags.add(w));
  });

  // From category hint
  if (dossier.instructions.match(/code|program/i)) tags.add('coding');
  if (dossier.instructions.match(/write|story|creative/i)) tags.add('writing');
  if (dossier.instructions.match(/analyz|data|research/i)) tags.add('analysis');
  if (dossier.instructions.match(/teach|explain|educat/i)) tags.add('education');

  return Array.from(tags).slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIOR CONTRACT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build behavior contract from dossier */
export function buildBehaviorContract(
  dossier: SourceAnalysisDossier
): SkillBehaviorContract {
  return {
    systemPrompt: dossier.instructions,
    responseStyle: {
      tone: detectTone(dossier.instructions),
      format: 'markdown',
      depth: detectDepth(dossier.instructions),
    },
    routingHints: extractRoutingHints(dossier),
    memoryPolicy: 'shared',
    allowedTools: dossier.tools
      .filter(
        t =>
          t.portability === 'DIRECTLY_PORTABLE' ||
          t.portability === 'PORTABLE_WITH_TRANSLATION'
      )
      .map(t => t.titaneEquivalent || t.name),
    blockedTools: dossier.tools
      .filter(
        t => t.portability === 'UNSUPPORTED' || t.portability === 'EXTERNAL_DEPENDENCY'
      )
      .map(t => t.name),
    temperature: 0.7,
    maxTokens: 2048,
  };
}

/** Detect communication tone from instructions */
function detectTone(instructions: string): string {
  const lower = instructions.toLowerCase();
  if (lower.match(/formal|professional|business/)) return 'professional';
  if (lower.match(/friendly|casual|warm/)) return 'empathetic';
  if (lower.match(/technical|precise|exact/)) return 'technical';
  if (lower.match(/motivat|inspir|encourage/)) return 'motivational';
  if (lower.match(/analyz|critic|evaluat/)) return 'analytical';
  return 'neutral';
}

/** Detect response depth preference */
function detectDepth(instructions: string): string {
  const lower = instructions.toLowerCase();
  if (lower.match(/concise|brief|short/)) return 'concise';
  if (lower.match(/detailed|thorough|comprehensive/)) return 'detailed';
  if (lower.match(/exhaustive|complete|in-depth/)) return 'exhaustive';
  return 'moderate';
}

/** Extract routing hints from dossier */
function extractRoutingHints(dossier: SourceAnalysisDossier): string[] {
  const hints = new Set<string>();

  // From skill name
  hints.add(dossier.skillName.toLowerCase());

  // From behaviors
  dossier.targetBehaviors.forEach(b => hints.add(b.toLowerCase()));

  // From purpose keywords
  const purposeWords = dossier.purpose
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4);
  purposeWords.slice(0, 5).forEach(w => hints.add(w));

  return Array.from(hints).slice(0, 15);
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BUNDLE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build knowledge bundle from dossier */
export function buildKnowledgeBundle(
  dossier: SourceAnalysisDossier
): SkillKnowledgeBundle {
  const totalSize = dossier.knowledgeAssets.reduce((sum, a) => sum + a.content.length, 0);

  return {
    assets: dossier.knowledgeAssets,
    searchMode: totalSize > 50000 ? 'semantic' : 'keyword',
    totalSize,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATION CONTRACT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build activation contract from dossier */
export function buildActivationContract(
  dossier: SourceAnalysisDossier
): SkillActivationContract {
  return {
    manualTrigger: true,
    autoRouteConditions: extractRoutingHints(dossier),
    priority: 50, // Default middle priority
    conflictResolution: 'override',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROOF CONTRACT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build proof contract */
export function buildProofContract(
  skillId: string,
  dossier: SourceAnalysisDossier
): SkillProofContract {
  const hasKnowledge = dossier.knowledgeAssets.length > 0;
  const hasTools = dossier.tools.length > 0;

  return {
    installedCriteria: [
      `Skill ${skillId} appears in registry`,
      `Manifest state is INSTALLED or DEGRADED`,
      `System prompt is non-empty`,
    ],
    activatedCriteria: [
      `Skill ${skillId} is selected in chat mode`,
      `System prompt injected into chat engine`,
      `Chat journal logs skill activation event`,
    ],
    consumedCriteria: [
      `Chat response reflects skill's system prompt content`,
      `Journal shows skill-influenced generation`,
      ...(hasKnowledge ? ['Knowledge retrieval from skill assets detected'] : []),
      ...(hasTools ? ['Skill tools invoked during conversation'] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLLBACK CONTRACT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build rollback contract */
export function buildRollbackContract(skillId: string): SkillRollbackContract {
  return {
    disablePath: `Set skill ${skillId} state to DISABLED. Remove from active routing. Preserve in registry.`,
    uninstallPath: `Remove skill ${skillId} from registry. Clean up knowledge index. Revert chat mode if this skill was active.`,
    revertPath: `Restore previous chat mode configuration. Clear skill-specific system prompt injection. Remove skill from routing table.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL PACKAGE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Build a complete TitaneSkillPackage from an analysis dossier */
export function buildSkillPackage(
  dossier: SourceAnalysisDossier,
  portabilityMatrix: PortabilityMatrix,
  sourceType: SkillSourceType,
  origin: string
): TitaneSkillPackage {
  const manifest = buildManifest(dossier, portabilityMatrix, sourceType, origin);

  return {
    manifest,
    behavior: buildBehaviorContract(dossier),
    knowledge: buildKnowledgeBundle(dossier),
    activation: buildActivationContract(dossier),
    proof: buildProofContract(manifest.id, dossier),
    rollback: buildRollbackContract(manifest.id),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/** Validate a skill package */
export function validateSkillPackage(pkg: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pkg || typeof pkg !== 'object') {
    return { valid: false, errors: ['Package must be an object'] };
  }

  const p = pkg as Partial<TitaneSkillPackage>;

  // Manifest checks
  if (!p.manifest) errors.push('Missing manifest');
  else {
    if (!p.manifest.id?.startsWith('titane-skill-'))
      errors.push('Invalid skill ID format');
    if (!p.manifest.name) errors.push('Missing skill name');
    if (!p.manifest.version) errors.push('Missing version');
    if (!p.manifest.state) errors.push('Missing lifecycle state');
  }

  // Behavior checks
  if (!p.behavior) errors.push('Missing behavior contract');
  else {
    if (!p.behavior.systemPrompt) errors.push('Missing system prompt');
    if (
      typeof p.behavior.temperature !== 'number' ||
      p.behavior.temperature < 0 ||
      p.behavior.temperature > 1
    ) {
      errors.push('Invalid temperature (must be 0-1)');
    }
  }

  // Knowledge checks
  if (!p.knowledge) errors.push('Missing knowledge bundle');

  // Activation checks
  if (!p.activation) errors.push('Missing activation contract');

  // Proof checks
  if (!p.proof) errors.push('Missing proof contract');
  else {
    if (!p.proof.installedCriteria?.length) errors.push('No installed criteria defined');
    if (!p.proof.activatedCriteria?.length) errors.push('No activated criteria defined');
  }

  // Rollback checks
  if (!p.rollback) errors.push('Missing rollback contract');

  return { valid: errors.length === 0, errors };
}

/** Validate a manifest alone */
export function validateManifest(manifest: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'] };
  }

  const m = manifest as Partial<TitaneSkillManifest>;

  if (!m.id) errors.push('Missing id');
  if (!m.name) errors.push('Missing name');
  if (!m.version) errors.push('Missing version');
  if (!m.state) errors.push('Missing state');
  if (!m.source?.type) errors.push('Missing source type');
  if (!m.installTimestamp) errors.push('Missing install timestamp');

  const validStates: SkillLifecycleState[] = [
    'DISCOVERED',
    'ANALYZED',
    'TRANSLATED',
    'INSTALLED',
    'ACTIVE',
    'DEGRADED',
    'DISABLED',
    'FAILED',
    'ARCHIVED',
  ];
  if (m.state && !validStates.includes(m.state)) {
    errors.push(`Invalid state: ${m.state}`);
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGE: Convert to ChatModeConfigExtended-compatible shape
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a skill package to a shape compatible with existing ChatModeConfigExtended */
export function toChatModeCompatible(pkg: TitaneSkillPackage): {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  responseStyle: string;
  tone: string;
  permissionLevel: number;
  memoryScope: string;
  profileId: string;
  tags: string[];
} {
  return {
    id: pkg.manifest.id,
    label: pkg.manifest.name,
    description: pkg.manifest.description,
    category: pkg.manifest.category,
    icon: '🧩', // Default skill icon
    systemPrompt: pkg.behavior.systemPrompt,
    temperature: pkg.behavior.temperature,
    maxTokens: pkg.behavior.maxTokens,
    responseStyle: pkg.behavior.responseStyle.depth,
    tone: pkg.behavior.responseStyle.tone,
    permissionLevel: 2, // Default user-level
    memoryScope:
      pkg.behavior.memoryPolicy === 'isolated'
        ? 'session'
        : pkg.behavior.memoryPolicy === 'readonly'
          ? 'session'
          : 'project',
    profileId: pkg.manifest.id,
    tags: pkg.manifest.tags,
  };
}
