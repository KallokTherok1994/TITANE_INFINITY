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

const CODE_EXTENSIONS_RE =
  /\.(py|rs|ts|tsx|js|jsx|go|java|cpp|c|rb|sh|sql|css|scss|html|htm|yaml|yml|toml|ini|env|graphql|proto)\b/;
const CODE_LANGUAGES_RE =
  /\b(python|rust|typescript|javascript|golang|react|java|bash|shell|sql|css|html|yaml|toml)\b/;

function inferFormat(request: string): ArtifactActionContract['target_format'] {
  const text = request.toLowerCase();
  if (text.includes('json')) return 'json';
  if (text.includes('markdown') || text.includes('.md')) return 'markdown';
  if (
    text.includes('txt') ||
    text.includes('texte') ||
    text.includes('csv') ||
    text.includes('yaml') ||
    text.includes('html') ||
    text.includes('xml') ||
    CODE_EXTENSIONS_RE.test(text) ||
    CODE_LANGUAGES_RE.test(text)
  )
    return 'text';
  return 'markdown';
}

function inferKind(request: string): ArtifactActionContract['artifact_kind'] {
  const text = request.toLowerCase();
  if (
    text.includes('code') ||
    text.includes('config') ||
    text.includes('script') ||
    text.includes('programme') ||
    text.includes('program') ||
    text.includes('fonction') ||
    text.includes('function') ||
    text.includes('class') ||
    CODE_EXTENSIONS_RE.test(text) ||
    CODE_LANGUAGES_RE.test(text)
  )
    return 'code';
  if (text.includes('rapport') || text.includes('report')) return 'report';
  if (
    text.includes('lettre') ||
    text.includes('document') ||
    text.includes('contrat') ||
    text.includes('memo') ||
    text.includes('mail') ||
    text.includes('email')
  )
    return 'document';
  return 'unknown';
}

export function classifyArtifactIntent(request: string): ArtifactIntent {
  const text = request.toLowerCase();
  const asksFile =
    /(g[eé]n[eèé]re|cr[eé]e|create|produce|[eé]cris|write|produis|fais).*(fichier|file|document|rapport|script|programme|code|csv|html|yaml|json|xml|sql)/.test(
      text
    ) ||
    /(g[eé]n[eèé]re|cr[eé]e|create|produce|[eé]cris|write).*(\.py|\.rs|\.ts|\.js|\.go|\.java|\.cpp|\.rb|\.sh|\.css|\.md)/.test(
      text
    ) ||
    (CODE_EXTENSIONS_RE.test(text) &&
      /(g[eé]n[eèé]re|cr[eé]e|create|produce|[eé]cris|write|produis|fais)/.test(text));
  const asksOpen = /(ouvre|open).*([eé]diteur|editor|canvas|artifact)/.test(text);
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

// ─── Instructions spécifiques par extension ──────────────────────────────────

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  py: "Python 3.10+. Inclure : imports, type hints (PEP 484), docstrings (PEP 257), gestion d'erreurs, if __name__ == '__main__' si applicable. Code directement exécutable.",
  rs: "Rust edition 2021. Inclure : use statements, types explicites, Result/Option, doc comments ///, clippy-clean. Pas d'unwrap() sans justification.",
  ts: 'TypeScript 5+ strict. Imports ESM, interfaces/types explicites, aucun any, JSDoc sur les exports publics.',
  tsx: 'TypeScript React 18+. Functional components, props typées avec interface, React hooks si nécessaire, export named + default.',
  js: 'JavaScript ES2022. Modules ESM, async/await, const/let, aucun var.',
  jsx: 'React JSX ES2022. Props destructurées, hooks si besoin, export default.',
  go: 'Go 1.21 idiomatique. Package déclaré, imports groupés (stdlib/external), error handling explicite, godoc comments.',
  java: 'Java 17+ LTS. Imports complets, Javadoc, exceptions typées, conventions Oracle (camelCase/PascalCase).',
  cpp: 'C++17. Includes STL nécessaires, namespace, RAII, smart pointers préférés aux raw pointers.',
  c: 'C11. #include standard, prototypes avant usage, vérification NULL, pas de VLA.',
  rb: 'Ruby 3.x. Conventions (snake_case, ?/! pour prédicats), rescue/raise, rdoc si API.',
  sh: 'Bash 5+. #!/usr/bin/env bash en première ligne, set -euo pipefail, fonctions nommées, variables entre ${}.',
  sql: 'SQL ANSI (compatible PostgreSQL/MySQL). Mots-clés en MAJUSCULES, noms en snake_case, commentaires sur les jointures complexes.',
  css: 'CSS3. Variables custom (--nom), media queries mobile-first, flexbox/grid, commentaires de sections.',
  scss: 'SCSS 1.x. Variables $, mixins @mixin, nesting max 3 niveaux, @use au lieu de @import.',
  html: "HTML5 valide. <!DOCTYPE html>, <meta charset='UTF-8'>, lang='fr', viewport, structure sémantique (header/main/article/footer), styles inline minimaux.",
  yaml: 'YAML 1.2. Indentation 2 espaces, pas de tabulations, guillemets sur les valeurs ambiguës, commentaires # utiles.',
  yml: 'YAML 1.2. Indentation 2 espaces, pas de tabulations.',
  toml: 'TOML 1.0 valide. Sections [[array]] et [table], types stricts, commentaires # descriptifs.',
  ini: 'INI standard. Sections [section], clé=valeur sans espaces autour de =, commentaires ;.',
  json: 'JSON RFC 8259. Pas de trailing comma, pas de commentaires, pretty-print 2 espaces, encodage UTF-8.',
  csv: 'CSV RFC 4180. Première ligne = en-têtes descriptifs, valeurs contenant des virgules entre guillemets doubles, encodage UTF-8.',
  xml: "XML 1.0. Déclaration <?xml version='1.0' encoding='UTF-8'?>, indentation 2 espaces, DTD ou commentaire de structure si complexe.",
  graphql:
    'GraphQL SDL. Types, queries, mutations avec descriptions entre """, directives si utile.',
  proto:
    'Protocol Buffers 3. syntax = "proto3"; en tête, package, imports si besoin, types scalaires corrects.',
  md: '',
  txt: '',
};

function buildGradeInstructions(
  grade: ProfessionalGrade,
  kind: ArtifactActionContract['artifact_kind']
): string {
  if (kind === 'document') {
    switch (grade) {
      case 'NOTARY_GRADE_STYLE':
        return 'Document notarial complet : identification des parties (NOM Prénom, né(e) le, domicilié(e) à), objet précis, clauses numérotées avec références légales (Code civil, etc.), mentions obligatoires, espace signatures daté.';
      case 'FORMAL_OFFICIAL':
        return 'Document officiel structuré : en-tête (émetteur, destinataire, référence, date), objet, corps en paragraphes numérotés, formule de politesse, signature.';
      case 'PROFESSIONAL_PREMIUM':
        return 'Document professionnel premium : introduction contextuelle, développement structuré (sections et sous-sections), langage impeccable, conclusion avec synthèse, annexes si pertinent.';
      case 'PROFESSIONAL_STANDARD':
        return 'Document professionnel standard : structure claire (introduction, corps, conclusion), langage correct et direct.';
      default:
        return 'Document de travail : structure de base utilisable immédiatement.';
    }
  }
  if (kind === 'report') {
    const premium =
      grade === 'PROFESSIONAL_PREMIUM' ||
      grade === 'FORMAL_OFFICIAL' ||
      grade === 'NOTARY_GRADE_STYLE';
    return premium
      ? 'Rapport professionnel complet : résumé exécutif, contexte, méthodologie, analyse détaillée avec données, conclusion et recommandations concrètes.'
      : 'Rapport structuré : résumé, sections thématiques, conclusion.';
  }
  return "Contenu de qualité professionnelle, complet et prêt à l'emploi.";
}

/**
 * Construit un prompt enrichi pour que l'IA génère un fichier de qualité professionnelle.
 * @param userRequest  La demande originale de l'utilisateur
 * @param contract     Le contrat d'artefact (type, format, grade)
 * @param fileExt      L'extension de fichier inférée (py, rs, ts, md…)
 */
export function buildFileGenerationPrompt(
  userRequest: string,
  contract: ArtifactActionContract,
  fileExt = ''
): string {
  const ext = fileExt.toLowerCase().replace(/^\./, '');
  const formatSpec =
    FORMAT_INSTRUCTIONS[ext] ||
    buildGradeInstructions(contract.professional_grade, contract.artifact_kind);
  const extLabel = ext ? `.${ext}` : contract.target_format;

  return [
    userRequest,
    '',
    `[GÉNÉRATION FICHIER ${extLabel.toUpperCase()} — RÈGLES STRICTES]`,
    `1. Format : ${formatSpec || 'Contenu complet et professionnel.'}`,
    `2. Contenu 100 % complet et directement utilisable — aucun TODO, aucun placeholder, aucun "voir ci-dessus".`,
    `3. Réponse = uniquement le contenu du fichier. aucune introduction ("Voici le fichier"), aucune explication après.`,
    `4. Si du code : mettre dans un bloc \`\`\`${ext || ''} … \`\`\`.`,
    `5. Si un document texte/markdown : commencer directement par le contenu (titre H1 ou premier paragraphe).`,
    `]`,
  ].join('\n');
}

/**
 * Extrait le contenu de fichier depuis la réponse IA.
 * Prend le bloc de code le plus grand, ou le JSON brut, sinon la réponse entière nettoyée.
 */
export function extractFileContent(aiResponse: string, _format: string): string {
  const trimmed = aiResponse.trim();

  // 1. Prendre le plus grand bloc de code (``` ... ```), toutes langues
  const codeBlockRe = /```(?:[a-zA-Z0-9+\-_.]*)\n?([\s\S]*?)```/g;
  let largest = '';
  let match: RegExpExecArray | null;
  while ((match = codeBlockRe.exec(trimmed)) !== null) {
    const block = (match[1] ?? '').trim();
    if (block.length > largest.length) largest = block;
  }
  if (largest) return largest;

  // 2. JSON/YAML brut valide sans bloc de code
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      /* pas JSON valide */
    }
  }

  // 3. Supprimer les lignes narratives d'introduction (étendu à 5 lignes)
  const INTRO_RE =
    /^(voici|here|ci-dessous|contenu|fichier|output|result|génér|generat|below|above|following|voilà|voila|sure|bien s[uû]r|certainly|absolument|d[''']accord|okay|ok,|of course|bien sûr)/i;
  const lines = trimmed.split('\n');
  let startIdx = 0;
  while (
    startIdx < Math.min(5, lines.length - 1) &&
    (lines[startIdx] ?? '').trim().length < 200 &&
    INTRO_RE.test((lines[startIdx] ?? '').trim())
  ) {
    startIdx++;
  }

  // 4. Supprimer les lignes conclusives narratives (dernières ≤ 3 lignes courtes)
  let endIdx = lines.length;
  const OUTRO_RE =
    /^(j['']espère|hope|this should|ce fichier|ce script|n['']hésitez|feel free|let me know|dis-moi|si vous|if you|avez des|have any|any questions)/i;
  while (
    endIdx > startIdx + 1 &&
    (lines[endIdx - 1] ?? '').trim().length < 180 &&
    OUTRO_RE.test((lines[endIdx - 1] ?? '').trim())
  ) {
    endIdx--;
  }

  return lines.slice(startIdx, endIdx).join('\n').trim() || trimmed;
}

export function inferFileExtension(
  contract: ArtifactActionContract,
  originalRequest = ''
): string {
  const text = originalRequest.toLowerCase();

  // Extension explicitement mentionnée dans la requête
  const extMatch = text.match(
    /\.(py|rs|ts|tsx|js|jsx|go|java|cpp|c|rb|sh|sql|css|scss|html|htm|yaml|yml|toml|ini|graphql|proto|csv|xml|json|md|txt)\b/
  );
  if (extMatch?.[1]) return extMatch[1];

  // Langage mentionné
  if (text.includes('python')) return 'py';
  if (text.includes('rust')) return 'rs';
  if (text.includes('typescript') && text.includes('react')) return 'tsx';
  if (text.includes('typescript')) return 'ts';
  if (text.includes('javascript') && text.includes('react')) return 'jsx';
  if (text.includes('javascript')) return 'js';
  if (text.includes('golang') || /\bgo\b/.test(text)) return 'go';
  if (text.includes('java') && !text.includes('javascript')) return 'java';
  if (text.includes('bash') || text.includes('shell') || text.includes('script sh'))
    return 'sh';
  if (text.includes('sql')) return 'sql';
  if (text.includes('css') && !text.includes('scss')) return 'css';
  if (text.includes('scss')) return 'scss';
  if (text.includes('html')) return 'html';
  if (text.includes('yaml') || text.includes('yml')) return 'yaml';
  if (text.includes('toml')) return 'toml';
  if (text.includes('csv')) return 'csv';
  if (text.includes('xml')) return 'xml';

  // Fallback sur le contrat
  if (contract.target_format === 'json') return 'json';
  if (contract.target_format === 'text') return 'txt';
  if (contract.artifact_kind === 'code') return 'ts';
  return 'md';
}

export function buildSafeFilename(title: string): string {
  return (
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 60) || 'titane_generated'
  );
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
