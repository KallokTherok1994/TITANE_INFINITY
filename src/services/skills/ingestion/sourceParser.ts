/**
 * TITANE∞ Skill OS — Source Ingestion Layer (Layer 1)
 *
 * Normalizes different skill sources into a CanonicalImportEnvelope.
 * Supports: raw prompts, JSON manifests, GPT-like metadata, OpenAPI.
 */

import type {
  CanonicalImportEnvelope,
  SkillSourceType,
  KnowledgeFile,
  RawToolDefinition,
  SourceAnalysisDossier,
  KnowledgeAsset,
  AnalyzedTool,
  AnalyzedAction,
  AuthRequirement,
} from '../types';
import { generateSkillId } from '../skillManifest';

// ─────────────────────────────────────────────────────────────────────────────
// TYPED JSON SHAPE INTERFACES (for parsed manifest content)
// ─────────────────────────────────────────────────────────────────────────────
interface ParsedJsonTool {
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  function?: { name?: string; description?: string; parameters?: Record<string, unknown> };
}
interface ParsedJsonAction {
  name?: string;
  description?: string;
  schema?: Record<string, unknown>;
  authRequired?: boolean;
  security?: boolean;
  url?: string;
  endpoint?: string;
}
interface ParsedJsonKnowledgeFile {
  name?: string;
  content?: string;
  type?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/** Ingest any source and produce a CanonicalImportEnvelope + SourceAnalysisDossier */
export function ingestSource(
  source: string,
  sourceType: SkillSourceType,
  name?: string
): { envelope: CanonicalImportEnvelope; dossier: SourceAnalysisDossier } {
  const envelope = createEnvelope(source, sourceType, name);
  const dossier = analyzeEnvelope(envelope);
  return { envelope, dossier };
}

/** Ingest a raw prompt text */
export function ingestPrompt(
  prompt: string,
  name?: string
): { envelope: CanonicalImportEnvelope; dossier: SourceAnalysisDossier } {
  return ingestSource(prompt, 'prompt', name);
}

/** Ingest a JSON manifest */
export function ingestManifest(
  manifestJson: string,
  name?: string
): { envelope: CanonicalImportEnvelope; dossier: SourceAnalysisDossier } {
  return ingestSource(manifestJson, 'manifest', name);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVELOPE CREATION
// ─────────────────────────────────────────────────────────────────────────────

function createEnvelope(
  source: string,
  sourceType: SkillSourceType,
  name?: string
): CanonicalImportEnvelope {
  const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  switch (sourceType) {
    case 'prompt':
      return parsePromptSource(source, id, name);
    case 'manifest':
      return parseManifestSource(source, id, name);
    case 'gpt-import':
      return parseGptSource(source, id, name);
    case 'openapi':
      return parseOpenApiSource(source, id, name);
    default:
      return parsePromptSource(source, id, name);
  }
}

/** Parse a raw prompt text into an envelope */
function parsePromptSource(
  source: string,
  id: string,
  name?: string
): CanonicalImportEnvelope {
  // Extract name from first line if it looks like a title
  const lines = source.trim().split('\n');
  let extractedName = name || 'Unnamed Skill';
  let instructions = source;

  if (lines[0] && lines[0].length < 100 && !lines[0].includes('.')) {
    extractedName = name || lines[0].replace(/^#+\s*/, '').trim();
    if (lines.length > 1) {
      instructions = lines.slice(1).join('\n').trim();
    }
  }

  return {
    id,
    sourceType: 'prompt',
    rawName: extractedName,
    rawDescription: `Imported from prompt text`,
    rawInstructions: instructions,
    rawExamples: extractConversationStarters(source),
    rawKnowledgeFiles: [],
    rawTools: [],
    rawMetadata: { originalLength: source.length },
    ingestedAt: new Date().toISOString(),
  };
}

/** Parse a JSON manifest into an envelope */
function parseManifestSource(
  source: string,
  id: string,
  name?: string
): CanonicalImportEnvelope {
  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(source);
  } catch {
    // If JSON is invalid, treat as prompt
    return parsePromptSource(source, id, name);
  }

  const instructions = String(
    parsed.instructions ||
      parsed.systemPrompt ||
      parsed.prompt ||
      parsed.description ||
      ''
  );

  const tools: RawToolDefinition[] = [];
  if (Array.isArray(parsed.tools)) {
    for (const t of parsed.tools as ParsedJsonTool[]) {
      tools.push({
        name: String(t.name || t.function?.name || 'unknown'),
        description: String(t.description || t.function?.description || ''),
        schema: (t.parameters || t.function?.parameters) as
          | Record<string, unknown>
          | undefined,
        authRequired: false,
      });
    }
  }
  if (Array.isArray(parsed.actions)) {
    for (const a of parsed.actions as ParsedJsonAction[]) {
      tools.push({
        name: String(a.name || 'unknown_action'),
        description: String(a.description || ''),
        schema: a.schema,
        authRequired: Boolean(a.authRequired || a.security),
        endpoint: String(a.url || a.endpoint || ''),
      });
    }
  }

  const knowledgeFiles: KnowledgeFile[] = [];
  if (Array.isArray(parsed.knowledge_files)) {
    for (const f of parsed.knowledge_files as ParsedJsonKnowledgeFile[]) {
      knowledgeFiles.push({
        name: String(f.name || 'unknown'),
        content: String(f.content || ''),
        mimeType: String(f.type || 'text/plain'),
        size: String(f.content || '').length,
      });
    }
  }

  return {
    id,
    sourceType: 'manifest',
    rawName: name || String(parsed.name || parsed.title || 'Unnamed Skill'),
    rawDescription: String(parsed.description || ''),
    rawInstructions: instructions,
    rawExamples: Array.isArray(parsed.conversation_starters)
      ? parsed.conversation_starters.map(String)
      : Array.isArray(parsed.examples)
        ? parsed.examples.map(String)
        : [],
    rawKnowledgeFiles: knowledgeFiles,
    rawTools: tools,
    rawMetadata: parsed,
    ingestedAt: new Date().toISOString(),
  };
}

/** Parse GPT-like metadata into an envelope */
function parseGptSource(
  source: string,
  id: string,
  name?: string
): CanonicalImportEnvelope {
  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(source);
  } catch {
    return parsePromptSource(source, id, name);
  }

  // GPT format detection
  const gpt = (
    parsed.gpt && typeof parsed.gpt === 'object' ? parsed.gpt : parsed
  ) as Record<string, unknown>;
  const instructions = String(gpt.instructions || gpt.prompt || gpt.system_prompt || '');

  const tools: RawToolDefinition[] = [];
  if (Array.isArray(gpt.capabilities)) {
    for (const cap of gpt.capabilities as Record<string, unknown>[]) {
      tools.push({
        name: String(cap.name || cap.type || 'unknown_capability'),
        description: String(cap.description || ''),
        authRequired: cap.type === 'actions',
      });
    }
  }

  const gptStarters = gpt.conversation_starters;
  const starters = Array.isArray(gptStarters) ? gptStarters.map(String) : [];

  return {
    id,
    sourceType: 'gpt-import',
    rawName: name || String(gpt.name || 'Imported GPT'),
    rawDescription: String(gpt.description || ''),
    rawInstructions: instructions,
    rawExamples: starters,
    rawKnowledgeFiles: [],
    rawTools: tools,
    rawMetadata: { gptFormat: true, originalFields: Object.keys(parsed) },
    ingestedAt: new Date().toISOString(),
  };
}

/** Parse OpenAPI schema into an envelope */
function parseOpenApiSource(
  source: string,
  id: string,
  name?: string
): CanonicalImportEnvelope {
  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(source);
  } catch {
    return parsePromptSource(source, id, name);
  }

  const tools: RawToolDefinition[] = [];
  if (parsed.paths && typeof parsed.paths === 'object') {
    const paths = parsed.paths as Record<string, Record<string, unknown>>;
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (typeof details === 'object' && details !== null) {
          const d = details as Record<string, unknown>;
          tools.push({
            name: String(d.operationId || `${method}_${path.replace(/\//g, '_')}`),
            description: String(d.summary || d.description || ''),
            authRequired: Array.isArray(d.security) && d.security.length > 0,
            endpoint: path,
          });
        }
      }
    }
  }

  const info = (parsed.info || {}) as Record<string, unknown>;

  return {
    id,
    sourceType: 'openapi',
    rawName: name || String(info.title || 'OpenAPI Skill'),
    rawDescription: String(info.description || ''),
    rawInstructions: `API Skill: ${String(info.title || 'Unknown')}. ${String(info.description || '')}`,
    rawExamples: [],
    rawKnowledgeFiles: [],
    rawTools: tools,
    rawMetadata: { openApiVersion: parsed.openapi || parsed.swagger },
    ingestedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS (Envelope → Dossier)
// ─────────────────────────────────────────────────────────────────────────────

function analyzeEnvelope(envelope: CanonicalImportEnvelope): SourceAnalysisDossier {
  const skillId = generateSkillId(envelope.rawName, envelope.rawInstructions);

  const knowledgeAssets: KnowledgeAsset[] = envelope.rawKnowledgeFiles.map((f, i) => ({
    id: `${skillId}-kb-${i}`,
    name: f.name,
    content: f.content,
    indexed: false,
    searchMode: 'keyword' as const,
    mimeType: f.mimeType,
  }));

  const tools: AnalyzedTool[] = envelope.rawTools.map(t => ({
    name: t.name,
    description: t.description,
    portability: classifyToolPortability(t),
    schema: t.schema,
    titaneEquivalent: findTitaneEquivalent(t.name),
  }));

  const actions: AnalyzedAction[] = envelope.rawTools
    .filter((t): t is RawToolDefinition & { endpoint: string } => Boolean(t.endpoint))
    .map(t => ({
      name: t.name,
      endpoint: t.endpoint,
      method: 'POST',
      portability: t.authRequired
        ? ('EXTERNAL_DEPENDENCY' as const)
        : ('PORTABLE_WITH_TRANSLATION' as const),
      authRequired: t.authRequired,
      titaneSupported: false,
    }));

  const authRequirements: AuthRequirement[] = envelope.rawTools
    .filter(t => t.authRequired)
    .map(t => ({
      type: 'api_key' as const,
      service: t.name,
      description: `${t.name} requires authentication`,
      supported: false,
    }));

  const targetBehaviors = extractBehaviors(envelope.rawInstructions);

  return {
    skillName: envelope.rawName,
    skillId,
    version: '1.0.0',
    author: 'external-import',
    purpose: envelope.rawDescription || extractPurpose(envelope.rawInstructions),
    targetBehaviors,
    instructions: envelope.rawInstructions,
    examples: envelope.rawExamples,
    knowledgeAssets,
    tools,
    actions,
    dependencies: [],
    authRequirements,
    confidenceNotes: generateConfidenceNotes(envelope, tools, actions),
  };
}

/** Classify a tool's portability */
function classifyToolPortability(
  tool: RawToolDefinition
): import('../types').PortabilityClass {
  // Known TITANE tools
  const knownTools = ['get_time', 'calculate', 'web_search', 'get_weather', 'web_fetch'];
  if (knownTools.includes(tool.name)) return 'DIRECTLY_PORTABLE';

  if (tool.authRequired) return 'EXTERNAL_DEPENDENCY';
  if (tool.endpoint) return 'PORTABLE_WITH_TRANSLATION';
  return 'PORTABLE_WITH_TRANSLATION';
}

/** Find TITANE equivalent for a known tool */
function findTitaneEquivalent(toolName: string): string | undefined {
  const equivalents: Record<string, string> = {
    get_time: 'get_time',
    calculate: 'calculate',
    web_search: 'web_search',
    get_weather: 'get_weather',
    web_fetch: 'web_fetch',
    search: 'web_search',
    calculator: 'calculate',
    time: 'get_time',
    weather: 'get_weather',
  };
  return equivalents[toolName.toLowerCase()];
}

/** Extract purpose from instructions */
function extractPurpose(instructions: string): string {
  const firstSentence = instructions.split(/[.!?\n]/)[0];
  return firstSentence?.slice(0, 200) || 'Imported skill';
}

/** Extract target behaviors from instructions */
function extractBehaviors(instructions: string): string[] {
  const behaviors: string[] = [];
  const lower = instructions.toLowerCase();

  if (lower.match(/answer|respond|reply/)) behaviors.push('question-answering');
  if (lower.match(/explain|teach|educat/)) behaviors.push('explanation');
  if (lower.match(/write|create|generat/)) behaviors.push('content-generation');
  if (lower.match(/analyz|review|evaluat/)) behaviors.push('analysis');
  if (lower.match(/help|assist|support/)) behaviors.push('assistance');
  if (lower.match(/code|program|debug/)) behaviors.push('coding');
  if (lower.match(/translate|convert/)) behaviors.push('translation');
  if (lower.match(/summariz|brief/)) behaviors.push('summarization');

  return behaviors.length > 0 ? behaviors : ['general-assistance'];
}

/** Generate confidence notes */
function generateConfidenceNotes(
  envelope: CanonicalImportEnvelope,
  tools: AnalyzedTool[],
  actions: AnalyzedAction[]
): string[] {
  const notes: string[] = [];

  if (!envelope.rawInstructions || envelope.rawInstructions.length < 10) {
    notes.push('WARNING: Very short or empty instructions');
  }

  const externalTools = tools.filter(t => t.portability === 'EXTERNAL_DEPENDENCY');
  if (externalTools.length > 0) {
    notes.push(`CAUTION: ${externalTools.length} tool(s) require external dependencies`);
  }

  const externalActions = actions.filter(a => !a.titaneSupported);
  if (externalActions.length > 0) {
    notes.push(
      `CAUTION: ${externalActions.length} action(s) not supported by TITANE runtime`
    );
  }

  if (envelope.rawKnowledgeFiles.length > 0) {
    notes.push(
      `INFO: ${envelope.rawKnowledgeFiles.length} knowledge file(s) will need indexing`
    );
  }

  return notes;
}

/** Extract conversation starters from text */
function extractConversationStarters(text: string): string[] {
  const starters: string[] = [];

  // Look for "Example:" or "Try:" patterns
  const examplePatterns = [
    /(?:example|try|ask|say|start with)[:\s]+"([^"]+)"/gi,
    /(?:example|try|ask|say|start with)[:\s]+'([^']+)'/gi,
    /^\s*[-*]\s+(.{10,80})$/gm,
  ];

  for (const pattern of examplePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) starters.push(match[1].trim());
    }
  }

  return starters.slice(0, 5);
}
