export type ArtifactIntent =
  | 'ANSWER_ONLY'
  | 'CREATE_FILE'
  | 'OPEN_EDITOR'
  | 'GENERATE_AND_OPEN'
  | 'GENERATE_AND_SAVE'
  | 'EXPORT_EXISTING_ARTIFACT'
  | 'UNSUPPORTED_OR_BLOCKED';

export type ProfessionalGrade =
  | 'WORKING_DRAFT'
  | 'PROFESSIONAL_STANDARD'
  | 'PROFESSIONAL_PREMIUM'
  | 'FORMAL_OFFICIAL'
  | 'NOTARY_GRADE_STYLE';

export interface ArtifactActionContract {
  intent: ArtifactIntent;
  artifact_kind: 'document' | 'code' | 'report' | 'unknown';
  target_format: 'markdown' | 'json' | 'text' | 'unknown';
  open_editor: boolean;
  auto_save: boolean;
  professional_grade: ProfessionalGrade;
  reason: string;
  blocked_reason?: string;
}

export interface ProfessionalDocumentManifest {
  id: string;
  title: string;
  artifact_kind: ArtifactActionContract['artifact_kind'];
  professional_grade: ProfessionalGrade;
  source_trace: {
    origin: 'chat';
    request_excerpt: string;
    intent: ArtifactIntent;
    created_at: number;
  };
  sections: Array<{ id: string; heading: string; content: string }>;
  metadata: {
    version: '1.0';
    editable: boolean;
  };
  target_formats: Array<'markdown' | 'json' | 'text'>;
}

export interface ArtifactRouteOutcome {
  status: 'ROUTED' | 'BLOCKED';
  contract: ArtifactActionContract;
}

export interface AntiLieCheckResult {
  ok: boolean;
  violations: string[];
}

function inferProfessionalGrade(request: string): ProfessionalGrade {
  const text = request.toLowerCase();
  if (text.includes('notaire') || text.includes('notarial')) return 'NOTARY_GRADE_STYLE';
  if (text.includes('officiel') || text.includes('official')) return 'FORMAL_OFFICIAL';
  if (text.includes('premium')) return 'PROFESSIONAL_PREMIUM';
  if (text.includes('professionnel') || text.includes('professional')) {
    return 'PROFESSIONAL_STANDARD';
  }
  return 'WORKING_DRAFT';
}

function inferFormat(request: string): ArtifactActionContract['target_format'] {
  const text = request.toLowerCase();
  if (text.includes('json')) return 'json';
  if (text.includes('markdown') || text.includes('.md')) return 'markdown';
  if (text.includes('txt') || text.includes('texte')) return 'text';
  return 'markdown';
}

function inferKind(request: string): ArtifactActionContract['artifact_kind'] {
  const text = request.toLowerCase();
  if (text.includes('code') || text.includes('config') || text.includes('yaml'))
    return 'code';
  if (text.includes('rapport') || text.includes('report')) return 'report';
  if (
    text.includes('lettre') ||
    text.includes('document') ||
    text.includes('contrat') ||
    text.includes('memo')
  ) {
    return 'document';
  }
  return 'unknown';
}

export function classifyArtifactIntent(request: string): ArtifactIntent {
  const text = request.toLowerCase();
  const asksFile =
    /(g[eé]n[ée]re|cr[eé]e|create|produce).*(fichier|file|document|rapport)/.test(text);
  const asksOpen = /(ouvre|open).*(editeur|editor|canvas|artifact)/.test(text);
  const asksSave = /(sauve|enregistre|save)/.test(text);
  const mentionsExport = /(exporte|export|exporter)/.test(text);
  const asksExportTarget =
    /(exporte|export|exporter).*(conversation|chat|rapport|report|document|fichier|file|artifact|artefact|json|markdown|texte|txt)/.test(
      text
    ) ||
    /(conversation|chat|rapport|report|document|fichier|file|artifact|artefact|json|markdown|texte|txt).*(exporte|export|exporter)/.test(
      text
    );
  const describesExportCapability =
    /(permet|possible|capable|autorise|allow|allows).*(exporte|export|exporter)/.test(
      text
    ) || /(ce que l['’]ui permet d['’]?exporter)/.test(text);
  const asksExport = mentionsExport && asksExportTarget && !describesExportCapability;

  if (asksOpen && asksFile) return 'GENERATE_AND_OPEN';
  if (asksFile && asksSave) return 'GENERATE_AND_SAVE';
  if (asksOpen) return 'OPEN_EDITOR';
  if (asksExport) return 'EXPORT_EXISTING_ARTIFACT';
  if (asksFile) return 'CREATE_FILE';
  return 'ANSWER_ONLY';
}

export function buildArtifactActionContract(request: string): ArtifactActionContract {
  const intent = classifyArtifactIntent(request);
  return {
    intent,
    artifact_kind: inferKind(request),
    target_format: inferFormat(request),
    open_editor: intent === 'OPEN_EDITOR' || intent === 'GENERATE_AND_OPEN',
    auto_save: intent === 'GENERATE_AND_SAVE',
    professional_grade: inferProfessionalGrade(request),
    reason:
      intent === 'ANSWER_ONLY' ? 'No file intent detected' : 'Artifact intent detected',
  };
}

export function resolveArtifactRoute(
  contract: ArtifactActionContract,
  capabilities: { documentEditorAvailable: boolean; codeEditorAvailable: boolean }
): ArtifactRouteOutcome {
  const needsEditor = contract.open_editor;
  const needsCodeEditor = contract.artifact_kind === 'code';
  const editorAvailable = needsCodeEditor
    ? capabilities.codeEditorAvailable
    : capabilities.documentEditorAvailable;

  if (needsEditor && !editorAvailable) {
    return {
      status: 'BLOCKED',
      contract: {
        ...contract,
        intent: 'UNSUPPORTED_OR_BLOCKED',
        blocked_reason: 'OPEN_FROM_CHAT_UNPROVEN',
        reason: 'Editor requested from chat but no runtime editor route is available.',
      },
    };
  }

  return { status: 'ROUTED', contract };
}

export function buildProfessionalDocumentManifest(
  request: string,
  contract: ArtifactActionContract
): ProfessionalDocumentManifest {
  const now = Date.now();
  const compact = request.trim().replace(/\s+/g, ' ').slice(0, 120);
  const title = compact.length > 0 ? compact : 'Untitled artifact request';

  return {
    id: `artifact-${now}`,
    title,
    artifact_kind: contract.artifact_kind,
    professional_grade: contract.professional_grade,
    source_trace: {
      origin: 'chat',
      request_excerpt: compact,
      intent: contract.intent,
      created_at: now,
    },
    sections: [
      { id: 's1', heading: 'Context', content: compact },
      {
        id: 's2',
        heading: 'Requested Output',
        content: `Kind=${contract.artifact_kind}, format=${contract.target_format}`,
      },
    ],
    metadata: {
      version: '1.0',
      editable: true,
    },
    target_formats: [
      contract.target_format === 'unknown' ? 'markdown' : contract.target_format,
    ],
  };
}

export function validateNoFakeArtifactResponse(
  request: string,
  contract: ArtifactActionContract,
  manifest: ProfessionalDocumentManifest | null
): AntiLieCheckResult {
  const intent = classifyArtifactIntent(request);
  if (intent === 'ANSWER_ONLY') {
    return { ok: true, violations: [] };
  }

  const violations: string[] = [];
  if (contract.intent === 'ANSWER_ONLY') {
    violations.push('File request detected but action contract stayed ANSWER_ONLY.');
  }
  if (!manifest) {
    violations.push('File request detected but no canonical manifest was created.');
  }

  return { ok: violations.length === 0, violations };
}
