/**
 * TITANE∞ Skill OS — Portability Classifier (Layer 3)
 *
 * Classifies each source element into portability categories:
 * DIRECTLY_PORTABLE, PORTABLE_WITH_TRANSLATION, PORTABLE_WITH_INDEXING,
 * EXTERNAL_DEPENDENCY, UNSUPPORTED, UNKNOWN.
 */

import type {
  PortabilityAssessment,
  PortabilityMatrix,
  SourceAnalysisDossier,
} from '../types';

/** Known TITANE-native tools that are directly portable */
const TITANE_NATIVE_TOOLS = new Set([
  'get_time',
  'calculate',
  'web_search',
  'get_weather',
  'web_fetch',
]);

/** ChatGPT-only features that are unsupported in TITANE */
const UNSUPPORTED_FEATURES = new Set([
  'dall-e',
  'code_interpreter',
  'browsing',
  'plugins',
  'gpt_builder',
  'memory_persistence',
  'custom_actions',
  'knowledge_retrieval',
]);

/** Classify all elements in a dossier and produce a portability matrix */
export function classifyPortability(dossier: SourceAnalysisDossier): PortabilityMatrix {
  const assessments: PortabilityAssessment[] = [];

  // 1. Classify instructions
  assessments.push(classifyInstructions(dossier.instructions));

  // 2. Classify examples
  if (dossier.examples.length > 0) {
    assessments.push({
      element: 'conversation_starters',
      sourceType: 'examples',
      classification: 'DIRECTLY_PORTABLE',
      reason: 'Conversation starters are text-only and directly usable',
    });
  }

  // 3. Classify knowledge assets
  for (const asset of dossier.knowledgeAssets) {
    assessments.push(classifyKnowledgeAsset(asset.name));
  }

  // 4. Classify tools
  for (const tool of dossier.tools) {
    assessments.push({
      element: tool.name,
      sourceType: 'tool',
      classification: tool.portability,
      reason: getToolReason(tool),
      translationHint: tool.titaneEquivalent
        ? `Map to TITANE tool: ${tool.titaneEquivalent}`
        : undefined,
    });
  }

  // 5. Classify actions
  for (const action of dossier.actions) {
    assessments.push({
      element: action.name,
      sourceType: 'action',
      classification: action.titaneSupported
        ? 'DIRECTLY_PORTABLE'
        : action.authRequired
          ? 'EXTERNAL_DEPENDENCY'
          : 'PORTABLE_WITH_TRANSLATION',
      reason: action.titaneSupported
        ? 'Action is supported by TITANE runtime'
        : action.authRequired
          ? 'Action requires external authentication not available in TITANE'
          : 'Action could potentially be translated to TITANE IPC',
    });
  }

  // 6. Check for unsupported features in instructions
  const unsupportedChecks = checkUnsupportedFeatures(dossier.instructions);
  assessments.push(...unsupportedChecks);

  // Count classifications
  const counts = {
    totalElements: assessments.length,
    portable: 0,
    needsTranslation: 0,
    needsIndexing: 0,
    externalDependency: 0,
    unsupported: 0,
    unknown: 0,
  };

  for (const a of assessments) {
    switch (a.classification) {
      case 'DIRECTLY_PORTABLE':
        counts.portable++;
        break;
      case 'PORTABLE_WITH_TRANSLATION':
        counts.needsTranslation++;
        break;
      case 'PORTABLE_WITH_INDEXING':
        counts.needsIndexing++;
        break;
      case 'EXTERNAL_DEPENDENCY':
        counts.externalDependency++;
        break;
      case 'UNSUPPORTED':
        counts.unsupported++;
        break;
      default:
        counts.unknown++;
        break;
    }
  }

  const overallRisk = calculateOverallRisk(counts);

  return {
    ...counts,
    assessments,
    overallRisk,
  };
}

function classifyInstructions(instructions: string): PortabilityAssessment {
  if (!instructions || instructions.length < 10) {
    return {
      element: 'system_prompt',
      sourceType: 'instruction',
      classification: 'UNSUPPORTED',
      reason: 'Instructions are empty or too short to be useful',
    };
  }

  // Check for ChatGPT-specific references
  const chatgptRefs = instructions.match(
    /chatgpt|openai|gpt-4|gpt-3|dall-?e|code interpreter/gi
  );
  if (chatgptRefs && chatgptRefs.length > 2) {
    return {
      element: 'system_prompt',
      sourceType: 'instruction',
      classification: 'PORTABLE_WITH_TRANSLATION',
      reason: `Instructions reference ChatGPT-specific features (${chatgptRefs.join(', ')}). These will be removed during translation.`,
      translationHint: 'Remove ChatGPT/OpenAI references and adapt to TITANE context',
    };
  }

  return {
    element: 'system_prompt',
    sourceType: 'instruction',
    classification: 'DIRECTLY_PORTABLE',
    reason: 'Instructions are text-based and directly usable as TITANE system prompt',
  };
}

function classifyKnowledgeAsset(name: string): PortabilityAssessment {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  const textExtensions = new Set([
    'txt',
    'md',
    'json',
    'yaml',
    'yml',
    'csv',
    'xml',
    'html',
    'css',
    'js',
    'ts',
    'py',
    'rs',
  ]);
  const binaryExtensions = new Set([
    'pdf',
    'docx',
    'xlsx',
    'pptx',
    'png',
    'jpg',
    'gif',
    'svg',
  ]);

  if (textExtensions.has(ext)) {
    return {
      element: name,
      sourceType: 'knowledge',
      classification: 'PORTABLE_WITH_INDEXING',
      reason: 'Text-based knowledge file that can be indexed by TITANE',
    };
  }

  if (binaryExtensions.has(ext)) {
    return {
      element: name,
      sourceType: 'knowledge',
      classification: 'PORTABLE_WITH_INDEXING',
      reason: 'Binary file that can be stored but may have limited search capability',
    };
  }

  return {
    element: name,
    sourceType: 'knowledge',
    classification: 'PORTABLE_WITH_INDEXING',
    reason: 'Knowledge file will be indexed with default text extraction',
  };
}

function getToolReason(tool: {
  name: string;
  portability: string;
  titaneEquivalent?: string;
}): string {
  if (tool.titaneEquivalent) return `Direct equivalent exists: ${tool.titaneEquivalent}`;
  if (TITANE_NATIVE_TOOLS.has(tool.name)) return 'Native TITANE tool';
  switch (tool.portability) {
    case 'DIRECTLY_PORTABLE':
      return 'Tool is directly supported';
    case 'PORTABLE_WITH_TRANSLATION':
      return 'Tool needs translation to TITANE format';
    case 'EXTERNAL_DEPENDENCY':
      return 'Tool requires external service/authentication';
    case 'UNSUPPORTED':
      return 'Tool is not supported by TITANE runtime';
    default:
      return 'Tool portability unknown';
  }
}

function checkUnsupportedFeatures(instructions: string): PortabilityAssessment[] {
  const assessments: PortabilityAssessment[] = [];
  const lower = instructions.toLowerCase();

  for (const feature of UNSUPPORTED_FEATURES) {
    if (lower.includes(feature.replace(/_/g, ' ')) || lower.includes(feature)) {
      assessments.push({
        element: feature,
        sourceType: 'capability',
        classification: 'UNSUPPORTED',
        reason: `"${feature}" is a ChatGPT-only feature not available in TITANE`,
      });
    }
  }

  return assessments;
}

function calculateOverallRisk(counts: {
  unsupported: number;
  externalDependency: number;
  needsTranslation: number;
  totalElements: number;
}): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (counts.totalElements === 0) return 'CRITICAL';

  const unsupportedRatio = counts.unsupported / counts.totalElements;
  const externalRatio = counts.externalDependency / counts.totalElements;

  if (unsupportedRatio > 0.5) return 'CRITICAL';
  if (unsupportedRatio > 0.3 || externalRatio > 0.5) return 'HIGH';
  if (
    counts.unsupported > 0 ||
    counts.externalDependency > 0 ||
    counts.needsTranslation > 2
  )
    return 'MEDIUM';
  return 'LOW';
}
