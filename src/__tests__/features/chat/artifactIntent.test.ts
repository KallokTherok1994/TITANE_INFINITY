import { describe, expect, it } from 'vitest';
import {
  buildArtifactActionContract,
  buildFileGenerationPrompt,
  buildProfessionalDocumentManifest,
  classifyArtifactIntent,
  extractFileContent,
  extractSuggestedFilename,
  inferFileExtension,
  resolveArtifactRoute,
  validateNoFakeArtifactResponse,
} from '@/features/chat/artifactIntent';

describe('artifactIntent', () => {
  it('classifies plain chat as ANSWER_ONLY', () => {
    const intent = classifyArtifactIntent('Salut, comment vas-tu ?');
    expect(intent).toBe('ANSWER_ONLY');
  });

  it('classifies file creation intent', () => {
    const intent = classifyArtifactIntent('Genere un fichier de rapport professionnel');
    expect(intent).toBe('CREATE_FILE');
  });

  it('normalizes open editor intent with blocked route when editor unavailable', () => {
    const action = buildArtifactActionContract(
      'Genere un fichier et ouvre l editeur pour que je le modifie'
    );
    const routed = resolveArtifactRoute(action, {
      documentEditorAvailable: false,
      codeEditorAvailable: false,
    });

    expect(routed.status).toBe('BLOCKED');
    expect(routed.contract.intent).toBe('UNSUPPORTED_OR_BLOCKED');
    expect(routed.contract.blocked_reason).toBe('OPEN_FROM_CHAT_UNPROVEN');
  });

  it('routes open editor intent when document editor is available', () => {
    const action = buildArtifactActionContract('Genere un fichier et ouvre l editeur');
    const routed = resolveArtifactRoute(action, {
      documentEditorAvailable: true,
      codeEditorAvailable: false,
    });

    expect(routed.status).toBe('ROUTED');
    expect(routed.contract.intent).toBe('GENERATE_AND_OPEN');
    expect(routed.contract.blocked_reason).toBeUndefined();
  });

  it('builds canonical manifest for file requests', () => {
    const action = buildArtifactActionContract('Cree un document officiel en markdown');
    const manifest = buildProfessionalDocumentManifest(
      'Cree un document officiel en markdown',
      action
    );

    expect(manifest.id).toMatch(/^artifact-/);
    expect(manifest.source_trace.intent).toBe(action.intent);
    expect(manifest.sections.length).toBeGreaterThan(0);
    expect(manifest.target_formats.length).toBeGreaterThan(0);
  });

  it('anti-lie validator fails when file intent has no manifest', () => {
    const action = buildArtifactActionContract('Cree un fichier de contrat');
    const check = validateNoFakeArtifactResponse(
      'Cree un fichier de contrat',
      action,
      null
    );

    expect(check.ok).toBe(false);
    expect(check.violations.length).toBeGreaterThan(0);
  });

  it('keeps descriptive export transparency prompts in answer-only mode', () => {
    const intent = classifyArtifactIntent(
      "Sans inventer, reponds en 3 points: provider reel utilise, si le reseau a ete utilise, et ce que l'UI permet d'exporter."
    );

    expect(intent).toBe('ANSWER_ONLY');
  });

  // ── Expanded vocabulary — classifyArtifactIntent ──────────────────────────
  it('classifies "développe un composant React" as CREATE_FILE', () => {
    expect(classifyArtifactIntent('développe un composant React')).toBe('CREATE_FILE');
  });

  it('classifies "implémente un service TypeScript" as CREATE_FILE', () => {
    expect(classifyArtifactIntent('implémente un service TypeScript')).toBe('CREATE_FILE');
  });

  it('classifies "build a python module" as CREATE_FILE', () => {
    expect(classifyArtifactIntent('build a python module')).toBe('CREATE_FILE');
  });

  it('classifies "construis une api nodejs" as CREATE_FILE', () => {
    expect(classifyArtifactIntent('construis une api nodejs')).toBe('CREATE_FILE');
  });

  // ── inferFileExtension ────────────────────────────────────────────────────
  it('infers kt for kotlin data class', () => {
    const contract = buildArtifactActionContract('kotlin data class');
    expect(inferFileExtension(contract, 'kotlin data class')).toBe('kt');
  });

  it('infers vue for vue component', () => {
    const contract = buildArtifactActionContract('vue component');
    expect(inferFileExtension(contract, 'vue component')).toBe('vue');
  });

  it('infers swift for swift struct', () => {
    const contract = buildArtifactActionContract('swift struct');
    expect(inferFileExtension(contract, 'swift struct')).toBe('swift');
  });

  it('infers tsx for composant react typescript', () => {
    const contract = buildArtifactActionContract('composant react typescript');
    expect(inferFileExtension(contract, 'composant react typescript')).toBe('tsx');
  });

  // ── extractSuggestedFilename ──────────────────────────────────────────────
  it('extracts valid filename from FILENAME hint', () => {
    expect(extractSuggestedFilename('## FILENAME: auth_service.ts\nconst x = 1;')).toBe(
      'auth_service.ts'
    );
  });

  it('returns null for FILENAME with spaces', () => {
    expect(extractSuggestedFilename('## FILENAME: bad name with spaces.ts')).toBeNull();
  });

  it('returns null when no FILENAME hint', () => {
    expect(extractSuggestedFilename('pas de filename ici')).toBeNull();
  });

  // ── buildFileGenerationPrompt includes rule 6 ─────────────────────────────
  it('buildFileGenerationPrompt output includes FILENAME rule', () => {
    const req = 'génère un fichier typescript';
    const contract = buildArtifactActionContract(req);
    const manifest = buildProfessionalDocumentManifest(req, contract);
    if (!manifest) throw new Error('manifest should not be null');
    const prompt = buildFileGenerationPrompt(req, contract, 'ts');
    expect(prompt).toContain('## FILENAME:');
  });

  // ── extractFileContent strips FILENAME line ───────────────────────────────
  it('extractFileContent strips the FILENAME header line', () => {
    const raw = '## FILENAME: foo.ts\nconst x = 1;';
    const extracted = extractFileContent(raw, 'text');
    expect(extracted).toBe('const x = 1;');
    expect(extracted).not.toContain('FILENAME');
  });
});
