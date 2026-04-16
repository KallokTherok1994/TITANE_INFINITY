import { describe, expect, it } from 'vitest';
import {
  buildArtifactActionContract,
  buildProfessionalDocumentManifest,
  classifyArtifactIntent,
  resolveArtifactRoute,
  validateNoFakeArtifactResponse,
} from '../../../features/chat/artifactIntent';

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
});
