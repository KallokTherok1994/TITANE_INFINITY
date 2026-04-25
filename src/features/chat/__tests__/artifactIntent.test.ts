import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildArtifactActionContract,
  buildFileGenerationPrompt,
  buildProfessionalDocumentManifest,
  buildSafeFilename,
  classifyArtifactIntent,
  extractFileContent,
  inferFileExtension,
  resolveArtifactRoute,
  validateNoFakeArtifactResponse,
  type ArtifactActionContract,
  type ArtifactIntent,
} from '../artifactIntent';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeContract(overrides: Partial<ArtifactActionContract> = {}): ArtifactActionContract {
  return {
    intent: 'CREATE_FILE',
    artifact_kind: 'code',
    target_format: 'text',
    open_editor: false,
    auto_save: false,
    professional_grade: 'WORKING_DRAFT',
    reason: 'test',
    ...overrides,
  };
}

// ─── classifyArtifactIntent ───────────────────────────────────────────────────

describe('classifyArtifactIntent', () => {
  describe('ANSWER_ONLY', () => {
    it('returns ANSWER_ONLY for empty string', () => {
      expect(classifyArtifactIntent('')).toBe('ANSWER_ONLY');
    });

    it('returns ANSWER_ONLY for plain question', () => {
      expect(classifyArtifactIntent('Quelle est la capitale de la France ?')).toBe('ANSWER_ONLY');
    });

    it('returns ANSWER_ONLY for capability description with export', () => {
      expect(classifyArtifactIntent("ce que l'IA permet d'exporter")).toBe('ANSWER_ONLY');
    });

    it('returns ANSWER_ONLY for mentioning code without generator verb', () => {
      expect(classifyArtifactIntent('explique-moi le code .py')).toBe('ANSWER_ONLY');
    });

    it('returns ANSWER_ONLY when only exporter is mentioned without target', () => {
      expect(classifyArtifactIntent("peut-on exporter quelque chose ?")).toBe('ANSWER_ONLY');
    });
  });

  describe('CREATE_FILE', () => {
    it('detects French "génère un fichier"', () => {
      expect(classifyArtifactIntent('génère un fichier python')).toBe('CREATE_FILE');
    });

    it('detects French "crée un script"', () => {
      expect(classifyArtifactIntent('crée un script bash')).toBe('CREATE_FILE');
    });

    it('detects French "écris un programme"', () => {
      expect(classifyArtifactIntent('écris un programme en Python')).toBe('CREATE_FILE');
    });

    it('detects English "create a file"', () => {
      expect(classifyArtifactIntent('create a python file')).toBe('CREATE_FILE');
    });

    it('detects English "write a script"', () => {
      expect(classifyArtifactIntent('write a shell script')).toBe('CREATE_FILE');
    });

    it('detects explicit .py extension with generator verb', () => {
      expect(classifyArtifactIntent('génère un fichier .py pour moi')).toBe('CREATE_FILE');
    });

    it('detects explicit .ts extension with generator verb', () => {
      expect(classifyArtifactIntent('écris un fichier .ts avec les types')).toBe('CREATE_FILE');
    });

    it('detects code extension via CODE_EXTENSIONS_RE + generator verb', () => {
      expect(classifyArtifactIntent('génère un .rs pour mon projet')).toBe('CREATE_FILE');
    });

    it('detects "fais un document"', () => {
      expect(classifyArtifactIntent('fais un document markdown')).toBe('CREATE_FILE');
    });

    it('detects "produis un rapport"', () => {
      expect(classifyArtifactIntent('produis un rapport csv')).toBe('CREATE_FILE');
    });

    it('detects "produce a json file"', () => {
      expect(classifyArtifactIntent('produce a json file with the data')).toBe('CREATE_FILE');
    });
  });

  describe('GENERATE_AND_SAVE', () => {
    it('detects save+file intent (French)', () => {
      expect(classifyArtifactIntent('génère et sauvegarde un fichier python')).toBe('GENERATE_AND_SAVE');
    });

    it('detects "enregistre" variant', () => {
      expect(classifyArtifactIntent('crée et enregistre un script bash')).toBe('GENERATE_AND_SAVE');
    });

    it('detects English save variant', () => {
      expect(classifyArtifactIntent('create and save a python file')).toBe('GENERATE_AND_SAVE');
    });
  });

  describe('OPEN_EDITOR', () => {
    it('detects "ouvre l\'éditeur"', () => {
      expect(classifyArtifactIntent("ouvre l'éditeur")).toBe('OPEN_EDITOR');
    });

    it('detects "open editor"', () => {
      expect(classifyArtifactIntent('open the editor')).toBe('OPEN_EDITOR');
    });

    it('detects "open canvas"', () => {
      expect(classifyArtifactIntent('open canvas')).toBe('OPEN_EDITOR');
    });
  });

  describe('GENERATE_AND_OPEN', () => {
    it('detects "ouvre l\'éditeur et génère un fichier"', () => {
      expect(classifyArtifactIntent("ouvre l'éditeur et génère un fichier python")).toBe(
        'GENERATE_AND_OPEN'
      );
    });

    it('detects "open editor and create a file"', () => {
      expect(classifyArtifactIntent('open the editor and create a python file')).toBe(
        'GENERATE_AND_OPEN'
      );
    });
  });

  describe('EXPORT_EXISTING_ARTIFACT', () => {
    it('detects "exporte la conversation en json"', () => {
      expect(classifyArtifactIntent('exporte la conversation en json')).toBe(
        'EXPORT_EXISTING_ARTIFACT'
      );
    });

    it('detects "export the chat as markdown"', () => {
      expect(classifyArtifactIntent('export the chat as markdown')).toBe(
        'EXPORT_EXISTING_ARTIFACT'
      );
    });

    it('detects "exporter le rapport"', () => {
      expect(classifyArtifactIntent('peux-tu exporter le rapport ?')).toBe(
        'EXPORT_EXISTING_ARTIFACT'
      );
    });

    it('does NOT classify export capability description as EXPORT', () => {
      const intent = classifyArtifactIntent('permet d\'exporter la conversation');
      expect(intent).toBe('ANSWER_ONLY');
    });
  });
});

// ─── buildArtifactActionContract ─────────────────────────────────────────────

describe('buildArtifactActionContract', () => {
  it('sets correct intent for plain question', () => {
    const c = buildArtifactActionContract('Bonjour, comment vas-tu ?');
    expect(c.intent).toBe('ANSWER_ONLY');
    expect(c.open_editor).toBe(false);
    expect(c.auto_save).toBe(false);
  });

  it('sets correct intent for file creation request', () => {
    const c = buildArtifactActionContract('génère un fichier python');
    expect(c.intent).toBe('CREATE_FILE');
  });

  it('sets artifact_kind to "code" for script request', () => {
    const c = buildArtifactActionContract('génère un script python');
    expect(c.artifact_kind).toBe('code');
  });

  it('sets artifact_kind to "report" for report request', () => {
    const c = buildArtifactActionContract('génère un rapport sur les ventes');
    expect(c.artifact_kind).toBe('report');
  });

  it('sets artifact_kind to "document" for lettre', () => {
    const c = buildArtifactActionContract('écris une lettre de motivation');
    expect(c.artifact_kind).toBe('document');
  });

  it('sets target_format to "json" when JSON mentioned', () => {
    const c = buildArtifactActionContract('génère un fichier json');
    expect(c.target_format).toBe('json');
  });

  it('sets target_format to "markdown" when .md mentioned', () => {
    const c = buildArtifactActionContract('génère un fichier .md');
    expect(c.target_format).toBe('markdown');
  });

  it('sets target_format to "text" for code requests', () => {
    const c = buildArtifactActionContract('génère un script .py');
    expect(c.target_format).toBe('text');
  });

  it('sets open_editor when OPEN_EDITOR intent', () => {
    const c = buildArtifactActionContract("ouvre l'éditeur");
    expect(c.open_editor).toBe(true);
    expect(c.auto_save).toBe(false);
  });

  it('sets auto_save when GENERATE_AND_SAVE intent', () => {
    const c = buildArtifactActionContract('génère et sauvegarde un fichier python');
    expect(c.auto_save).toBe(true);
  });

  it('sets professional_grade to NOTARY_GRADE_STYLE', () => {
    const c = buildArtifactActionContract('génère un acte notarial');
    expect(c.professional_grade).toBe('NOTARY_GRADE_STYLE');
  });

  it('sets professional_grade to FORMAL_OFFICIAL', () => {
    const c = buildArtifactActionContract('génère un document officiel');
    expect(c.professional_grade).toBe('FORMAL_OFFICIAL');
  });

  it('sets professional_grade to PROFESSIONAL_STANDARD', () => {
    const c = buildArtifactActionContract('génère un rapport professionnel');
    expect(c.professional_grade).toBe('PROFESSIONAL_STANDARD');
  });

  it('defaults professional_grade to WORKING_DRAFT', () => {
    const c = buildArtifactActionContract('génère un fichier python');
    expect(c.professional_grade).toBe('WORKING_DRAFT');
  });

  it('sets reason to "No file intent detected" for ANSWER_ONLY', () => {
    const c = buildArtifactActionContract('Bonjour');
    expect(c.reason).toBe('No file intent detected');
  });

  it('sets reason to "Artifact intent detected" for file intents', () => {
    const c = buildArtifactActionContract('génère un fichier python');
    expect(c.reason).toBe('Artifact intent detected');
  });
});

// ─── resolveArtifactRoute ─────────────────────────────────────────────────────

describe('resolveArtifactRoute', () => {
  it('returns ROUTED when no editor needed', () => {
    const contract = makeContract({ open_editor: false });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: false,
      codeEditorAvailable: false,
    });
    expect(result.status).toBe('ROUTED');
    expect(result.contract).toBe(contract);
  });

  it('returns BLOCKED when code editor needed but not available', () => {
    const contract = makeContract({ open_editor: true, artifact_kind: 'code' });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: true,
      codeEditorAvailable: false,
    });
    expect(result.status).toBe('BLOCKED');
    expect(result.contract.intent).toBe('UNSUPPORTED_OR_BLOCKED');
    expect(result.contract.blocked_reason).toBe('OPEN_FROM_CHAT_UNPROVEN');
  });

  it('returns BLOCKED when document editor needed but not available', () => {
    const contract = makeContract({ open_editor: true, artifact_kind: 'document' });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: false,
      codeEditorAvailable: true,
    });
    expect(result.status).toBe('BLOCKED');
    expect(result.contract.intent).toBe('UNSUPPORTED_OR_BLOCKED');
  });

  it('returns ROUTED when code editor needed and available', () => {
    const contract = makeContract({ open_editor: true, artifact_kind: 'code' });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: false,
      codeEditorAvailable: true,
    });
    expect(result.status).toBe('ROUTED');
    expect(result.contract).toBe(contract);
  });

  it('returns ROUTED when document editor needed and available', () => {
    const contract = makeContract({ open_editor: true, artifact_kind: 'document' });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: true,
      codeEditorAvailable: false,
    });
    expect(result.status).toBe('ROUTED');
  });

  it('preserves original contract properties when ROUTED', () => {
    const contract = makeContract({ intent: 'CREATE_FILE', artifact_kind: 'report' });
    const result = resolveArtifactRoute(contract, {
      documentEditorAvailable: true,
      codeEditorAvailable: true,
    });
    expect(result.contract.intent).toBe('CREATE_FILE');
    expect(result.contract.artifact_kind).toBe('report');
  });
});

// ─── buildFileGenerationPrompt ────────────────────────────────────────────────

describe('buildFileGenerationPrompt', () => {
  const baseContract = makeContract();

  it('always includes the original user request', () => {
    const prompt = buildFileGenerationPrompt('mon texte utilisateur', baseContract, 'py');
    expect(prompt).toContain('mon texte utilisateur');
  });

  it('always contains [GÉNÉRATION FICHIER] marker', () => {
    const prompt = buildFileGenerationPrompt('test', baseContract, 'ts');
    expect(prompt).toContain('[GÉNÉRATION FICHIER');
  });

  it('contains code block rule', () => {
    const prompt = buildFileGenerationPrompt('test', baseContract, 'py');
    expect(prompt).toContain('```py');
  });

  it('injects Python FORMAT_INSTRUCTIONS for .py', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'py');
    expect(prompt).toContain('Python 3.10+');
    expect(prompt).toContain('type hints');
  });

  it('injects Rust FORMAT_INSTRUCTIONS for .rs', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'rs');
    expect(prompt).toContain('Rust edition 2021');
    expect(prompt).toContain('Result/Option');
  });

  it('injects TypeScript FORMAT_INSTRUCTIONS for .ts', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'ts');
    expect(prompt).toContain('TypeScript 5+');
    expect(prompt).toContain('strict');
  });

  it('injects TSX FORMAT_INSTRUCTIONS for .tsx', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'tsx');
    expect(prompt).toContain('TypeScript React 18+');
    expect(prompt).toContain('Functional components');
  });

  it('injects Go FORMAT_INSTRUCTIONS for .go', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'go');
    expect(prompt).toContain('Go 1.21');
  });

  it('injects Java FORMAT_INSTRUCTIONS for .java', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'java');
    expect(prompt).toContain('Java 17+');
    expect(prompt).toContain('Javadoc');
  });

  it('injects Shell FORMAT_INSTRUCTIONS for .sh', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'sh');
    expect(prompt).toContain('#!/usr/bin/env bash');
    expect(prompt).toContain('set -euo pipefail');
  });

  it('injects SQL FORMAT_INSTRUCTIONS for .sql', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'sql');
    expect(prompt).toContain('SQL ANSI');
    expect(prompt).toContain('MAJUSCULES');
  });

  it('injects HTML FORMAT_INSTRUCTIONS for .html', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'html');
    expect(prompt).toContain('HTML5');
    expect(prompt).toContain('<!DOCTYPE html>');
  });

  it('injects CSS FORMAT_INSTRUCTIONS for .css', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'css');
    expect(prompt).toContain('CSS3');
    expect(prompt).toContain('Variables custom');
  });

  it('injects YAML FORMAT_INSTRUCTIONS for .yaml', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'yaml');
    expect(prompt).toContain('YAML 1.2');
    expect(prompt).toContain('2 espaces');
  });

  it('injects JSON FORMAT_INSTRUCTIONS for .json', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'json');
    expect(prompt).toContain('JSON RFC 8259');
    expect(prompt).toContain('trailing comma');
  });

  it('injects CSV FORMAT_INSTRUCTIONS for .csv', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'csv');
    expect(prompt).toContain('CSV RFC 4180');
    expect(prompt).toContain('en-têtes');
  });

  it('injects TOML FORMAT_INSTRUCTIONS for .toml', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'toml');
    expect(prompt).toContain('TOML 1.0');
  });

  it('injects XML FORMAT_INSTRUCTIONS for .xml', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'xml');
    expect(prompt).toContain('XML 1.0');
    expect(prompt).toContain('<?xml');
  });

  it('injects GraphQL FORMAT_INSTRUCTIONS for .graphql', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'graphql');
    expect(prompt).toContain('GraphQL SDL');
  });

  it('injects Protobuf FORMAT_INSTRUCTIONS for .proto', () => {
    const prompt = buildFileGenerationPrompt('génère', baseContract, 'proto');
    expect(prompt).toContain('Protocol Buffers 3');
    expect(prompt).toContain('proto3');
  });

  it('strips leading dot from extension', () => {
    const prompt = buildFileGenerationPrompt('test', baseContract, '.py');
    expect(prompt).toContain('Python 3.10+');
  });

  it('falls back to grade instructions for unknown extension', () => {
    const docContract = makeContract({
      artifact_kind: 'document',
      professional_grade: 'FORMAL_OFFICIAL',
    });
    const prompt = buildFileGenerationPrompt('génère', docContract, 'xyz');
    expect(prompt).toContain('Document officiel structuré');
  });

  it('falls back to grade instructions for empty extension', () => {
    const reportContract = makeContract({
      artifact_kind: 'report',
      professional_grade: 'PROFESSIONAL_PREMIUM',
    });
    const prompt = buildFileGenerationPrompt('génère', reportContract, '');
    expect(prompt).toContain('Rapport professionnel complet');
  });

  it('rule 2 prohibits placeholders and TODOs', () => {
    const prompt = buildFileGenerationPrompt('test', baseContract, 'ts');
    expect(prompt).toContain('aucun TODO');
    expect(prompt).toContain('aucun placeholder');
  });

  it('rule 3 prohibits introductions', () => {
    const prompt = buildFileGenerationPrompt('test', baseContract, 'ts');
    expect(prompt).toContain('aucune introduction');
  });
});

// ─── extractFileContent ───────────────────────────────────────────────────────

describe('extractFileContent', () => {
  it('extracts content from a single code block', () => {
    const response = '```python\nprint("hello")\n```';
    expect(extractFileContent(response, 'text')).toBe('print("hello")');
  });

  it('extracts content from a code block without language tag', () => {
    const response = '```\nconst x = 1;\n```';
    expect(extractFileContent(response, 'text')).toBe('const x = 1;');
  });

  it('returns the LARGEST code block when multiple exist', () => {
    const response = [
      '```py\nprint("short")\n```',
      'some text in between',
      '```py\n# This is a much longer block\nclass MyClass:\n    def __init__(self):\n        self.value = 42\n\n    def compute(self):\n        return self.value * 2\n```',
    ].join('\n');
    const result = extractFileContent(response, 'text');
    expect(result).toContain('class MyClass');
    expect(result).not.toContain('short');
  });

  it('returns raw JSON when it starts with { and ends with }', () => {
    const json = '{\n  "key": "value",\n  "num": 42\n}';
    expect(extractFileContent(json, 'json')).toBe(json);
  });

  it('returns raw JSON array when it starts with [ and ends with ]', () => {
    const json = '[{"id": 1}, {"id": 2}]';
    expect(extractFileContent(json, 'json')).toBe(json);
  });

  it('does not return invalid JSON as raw JSON', () => {
    const invalid = '{ invalid json: here }';
    const result = extractFileContent(invalid, 'json');
    expect(result).toBe(invalid.trim());
  });

  it('strips "Voici" intro lines', () => {
    const response = 'Voici le fichier :\nconst x = 1;\nconst y = 2;';
    const result = extractFileContent(response, 'text');
    expect(result).not.toMatch(/^Voici/);
    expect(result).toContain('const x = 1;');
  });

  it('strips "Here is" intro line', () => {
    const response = 'Here is the file:\nfunction main() { return 42; }';
    const result = extractFileContent(response, 'text');
    expect(result).not.toMatch(/^Here/);
    expect(result).toContain('function main()');
  });

  it('strips "Généré" intro line', () => {
    const response = 'Généré automatiquement :\nx = 1';
    const result = extractFileContent(response, 'text');
    expect(result).not.toMatch(/^Génér/i);
    expect(result).toContain('x = 1');
  });

  it('returns full text when no intro line and no code block', () => {
    const content = 'line 1\nline 2\nline 3';
    expect(extractFileContent(content, 'text')).toBe(content);
  });

  it('handles empty string gracefully', () => {
    const result = extractFileContent('', 'text');
    expect(result).toBe('');
  });

  it('handles response that is only whitespace', () => {
    const result = extractFileContent('   \n\n   ', 'text');
    expect(result).toBe('');
  });

  it('code block wins over intro stripping', () => {
    const response = 'Voici le script :\n```py\nprint("hello")\n```';
    expect(extractFileContent(response, 'text')).toBe('print("hello")');
  });
});

// ─── inferFileExtension ───────────────────────────────────────────────────────

describe('inferFileExtension', () => {
  const unknownContract = makeContract({ target_format: 'unknown', artifact_kind: 'unknown' });

  it('returns explicit .py extension', () => {
    expect(inferFileExtension(unknownContract, 'génère un fichier .py')).toBe('py');
  });

  it('returns explicit .rs extension', () => {
    expect(inferFileExtension(unknownContract, 'génère un fichier .rs')).toBe('rs');
  });

  it('returns explicit .ts extension', () => {
    expect(inferFileExtension(unknownContract, 'crée un fichier .ts')).toBe('ts');
  });

  it('returns explicit .tsx extension', () => {
    expect(inferFileExtension(unknownContract, 'crée un composant .tsx')).toBe('tsx');
  });

  it('returns explicit .html extension', () => {
    expect(inferFileExtension(unknownContract, 'génère un fichier .html')).toBe('html');
  });

  it('returns "py" for "python" in request', () => {
    expect(inferFileExtension(unknownContract, 'génère un script python')).toBe('py');
  });

  it('returns "rs" for "rust" in request', () => {
    expect(inferFileExtension(unknownContract, 'génère du code rust')).toBe('rs');
  });

  it('returns "tsx" for "typescript react"', () => {
    expect(inferFileExtension(unknownContract, 'composant typescript react')).toBe('tsx');
  });

  it('returns "ts" for "typescript" alone', () => {
    expect(inferFileExtension(unknownContract, 'module typescript')).toBe('ts');
  });

  it('returns "jsx" for "javascript react"', () => {
    expect(inferFileExtension(unknownContract, 'composant javascript react')).toBe('jsx');
  });

  it('returns "js" for "javascript" alone', () => {
    expect(inferFileExtension(unknownContract, 'module javascript')).toBe('js');
  });

  it('returns "go" for "golang"', () => {
    expect(inferFileExtension(unknownContract, 'service golang')).toBe('go');
  });

  it('returns "go" for standalone "go" word', () => {
    expect(inferFileExtension(unknownContract, 'write a go server')).toBe('go');
  });

  it('returns "java" for "java" (not javascript)', () => {
    expect(inferFileExtension(unknownContract, 'classe java avec interface')).toBe('java');
  });

  it('returns "sh" for "bash"', () => {
    expect(inferFileExtension(unknownContract, 'script bash de déploiement')).toBe('sh');
  });

  it('returns "sh" for "shell"', () => {
    expect(inferFileExtension(unknownContract, 'script shell')).toBe('sh');
  });

  it('returns "sql" for "sql" in request', () => {
    expect(inferFileExtension(unknownContract, 'requête sql complexe')).toBe('sql');
  });

  it('returns "css" for "css" without "scss"', () => {
    expect(inferFileExtension(unknownContract, 'styles css responsive')).toBe('css');
  });

  it('returns "scss" for "scss"', () => {
    expect(inferFileExtension(unknownContract, 'styles scss avec mixins')).toBe('scss');
  });

  it('returns "html" for "html" in request', () => {
    expect(inferFileExtension(unknownContract, 'page html complète')).toBe('html');
  });

  it('returns "yaml" for "yaml" in request', () => {
    expect(inferFileExtension(unknownContract, 'config yaml kubernetes')).toBe('yaml');
  });

  it('returns "yaml" for "yml" in request', () => {
    expect(inferFileExtension(unknownContract, 'fichier yml')).toBe('yaml');
  });

  it('returns "toml" for "toml" in request', () => {
    expect(inferFileExtension(unknownContract, 'config toml cargo')).toBe('toml');
  });

  it('returns "csv" for "csv" in request', () => {
    expect(inferFileExtension(unknownContract, 'export csv des données')).toBe('csv');
  });

  it('returns "xml" for "xml" in request', () => {
    expect(inferFileExtension(unknownContract, 'fichier xml de config')).toBe('xml');
  });

  it('falls back to "json" from contract.target_format', () => {
    const contract = makeContract({ target_format: 'json' });
    expect(inferFileExtension(contract, 'génère quelque chose')).toBe('json');
  });

  it('falls back to "txt" from contract.target_format text', () => {
    const contract = makeContract({ target_format: 'text', artifact_kind: 'unknown' });
    expect(inferFileExtension(contract, 'génère quelque chose')).toBe('txt');
  });

  it('falls back to "ts" when artifact_kind is code', () => {
    const contract = makeContract({ target_format: 'markdown', artifact_kind: 'code' });
    expect(inferFileExtension(contract, 'génère quelque chose')).toBe('ts');
  });

  it('defaults to "md" for unknown everything', () => {
    const contract = makeContract({ target_format: 'markdown', artifact_kind: 'unknown' });
    expect(inferFileExtension(contract, '')).toBe('md');
  });
});

// ─── buildSafeFilename ────────────────────────────────────────────────────────

describe('buildSafeFilename', () => {
  it('lowercases the filename', () => {
    expect(buildSafeFilename('HelloWorld')).toBe('helloworld');
  });

  it('replaces spaces with underscores', () => {
    expect(buildSafeFilename('mon fichier texte')).toBe('mon_fichier_texte');
  });

  it('removes accented characters', () => {
    expect(buildSafeFilename('café')).toBe('cafe');
    expect(buildSafeFilename('héros')).toBe('heros');
    expect(buildSafeFilename('naïf')).toBe('naif');
  });

  it('removes special characters', () => {
    expect(buildSafeFilename('mon fichier! (2025)')).toBe('mon_fichier_2025');
  });

  it('preserves hyphens and underscores', () => {
    expect(buildSafeFilename('mon-fichier_test')).toBe('mon-fichier_test');
  });

  it('preserves digits', () => {
    expect(buildSafeFilename('Rapport 2025')).toBe('rapport_2025');
  });

  it('truncates at 60 characters', () => {
    const long = 'a'.repeat(80);
    expect(buildSafeFilename(long)).toHaveLength(60);
  });

  it('collapses multiple spaces into single underscore', () => {
    expect(buildSafeFilename('hello   world')).toBe('hello_world');
  });

  it('returns "titane_generated" for empty string', () => {
    expect(buildSafeFilename('')).toBe('titane_generated');
  });

  it('returns "titane_generated" for string of only special chars', () => {
    expect(buildSafeFilename('!!! @@@')).toBe('titane_generated');
  });

  it('handles mixed accents and special chars', () => {
    const result = buildSafeFilename('Créé le 25/04/2025 — Résumé');
    expect(result).toMatch(/^[a-z0-9_-]+$/);
    expect(result).toContain('cree');
    expect(result).toContain('resume');
  });
});

// ─── buildProfessionalDocumentManifest ───────────────────────────────────────

describe('buildProfessionalDocumentManifest', () => {
  const contract = makeContract({
    intent: 'CREATE_FILE',
    artifact_kind: 'report',
    target_format: 'markdown',
    professional_grade: 'PROFESSIONAL_STANDARD',
  });

  it('generates an id starting with "artifact-"', () => {
    const m = buildProfessionalDocumentManifest('test request', contract);
    expect(m.id).toMatch(/^artifact-\d+$/);
  });

  it('uses the request as the title (collapsed & truncated)', () => {
    const m = buildProfessionalDocumentManifest('génère un rapport', contract);
    expect(m.title).toBe('génère un rapport');
  });

  it('collapses multiple spaces in title', () => {
    const m = buildProfessionalDocumentManifest('hello   world', contract);
    expect(m.title).toBe('hello world');
  });

  it('truncates title to 120 chars', () => {
    const long = 'a'.repeat(150);
    const m = buildProfessionalDocumentManifest(long, contract);
    expect(m.title.length).toBeLessThanOrEqual(120);
  });

  it('uses "Untitled artifact request" for empty request', () => {
    const m = buildProfessionalDocumentManifest('', contract);
    expect(m.title).toBe('Untitled artifact request');
  });

  it('copies artifact_kind from contract', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.artifact_kind).toBe('report');
  });

  it('copies professional_grade from contract', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.professional_grade).toBe('PROFESSIONAL_STANDARD');
  });

  it('sets source_trace.origin to "chat"', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.source_trace.origin).toBe('chat');
  });

  it('sets source_trace.intent from contract', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.source_trace.intent).toBe('CREATE_FILE');
  });

  it('has created_at as a recent timestamp', () => {
    const before = Date.now();
    const m = buildProfessionalDocumentManifest('test', contract);
    const after = Date.now();
    expect(m.source_trace.created_at).toBeGreaterThanOrEqual(before);
    expect(m.source_trace.created_at).toBeLessThanOrEqual(after);
  });

  it('has at least 2 sections', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.sections.length).toBeGreaterThanOrEqual(2);
  });

  it('has metadata.version "1.0"', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.metadata.version).toBe('1.0');
  });

  it('has metadata.editable true', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.metadata.editable).toBe(true);
  });

  it('has target_formats containing the contract format', () => {
    const m = buildProfessionalDocumentManifest('test', contract);
    expect(m.target_formats).toContain('markdown');
  });

  it('maps "unknown" target_format to "markdown" in target_formats', () => {
    const unknownFmtContract = makeContract({ target_format: 'unknown' });
    const m = buildProfessionalDocumentManifest('test', unknownFmtContract);
    expect(m.target_formats).toContain('markdown');
  });
});

// ─── validateNoFakeArtifactResponse ──────────────────────────────────────────

describe('validateNoFakeArtifactResponse', () => {
  const fileContract = makeContract({ intent: 'CREATE_FILE' });

  it('returns ok:true for ANSWER_ONLY request regardless of contract', () => {
    const result = validateNoFakeArtifactResponse('Bonjour', fileContract, null);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('flags when file request but contract stayed ANSWER_ONLY', () => {
    const badContract = makeContract({ intent: 'ANSWER_ONLY' });
    const manifest = buildProfessionalDocumentManifest('génère', badContract);
    const result = validateNoFakeArtifactResponse('génère un fichier python', badContract, manifest);
    expect(result.ok).toBe(false);
    expect(result.violations.some(v => v.includes('ANSWER_ONLY'))).toBe(true);
  });

  it('flags when file request but manifest is null', () => {
    const result = validateNoFakeArtifactResponse('génère un fichier python', fileContract, null);
    expect(result.ok).toBe(false);
    expect(result.violations.some(v => v.includes('manifest'))).toBe(true);
  });

  it('returns ok:true when file request, contract correct, manifest present', () => {
    const manifest = buildProfessionalDocumentManifest('génère un fichier python', fileContract);
    const result = validateNoFakeArtifactResponse('génère un fichier python', fileContract, manifest);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('accumulates multiple violations', () => {
    const badContract = makeContract({ intent: 'ANSWER_ONLY' });
    const result = validateNoFakeArtifactResponse('génère un fichier python', badContract, null);
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });
});
