import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
) as { scripts: Record<string, string> };
const wrapperRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/mcp/start-ollama-dev-mcp.sh'),
  'utf8'
);
const stackRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-stack.sh'),
  'utf8'
);
const provenanceScriptRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-package-provenance.sh'),
  'utf8'
);
const tuningScriptRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-tuning-matrix.sh'),
  'utf8'
);
const hardeningProofRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/proof/generate-ollama-dev-hardening-proof.sh'),
  'utf8'
);
const localProfileRaw = fs.readFileSync(
  path.join(rootDir, 'docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md'),
  'utf8'
);
const trustTemplateRaw = fs.readFileSync(
  path.join(rootDir, 'docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md'),
  'utf8'
);
const trustChecklistRaw = fs.readFileSync(
  path.join(rootDir, 'docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md'),
  'utf8'
);
const ollamaDefaultsRaw = fs.readFileSync(
  path.join(rootDir, 'src/config/ollamaDefaults.ts'),
  'utf8'
);
const championRegistryRaw = fs.readFileSync(
  path.join(rootDir, 'config/championChallenger.json'),
  'utf8'
);

describe('ollama dev hardening', () => {
  it('declares provenance, tuning, and hardening proof scripts in package.json', () => {
    expect(packageJson.scripts['verify:ollama:dev:provenance']).toBe(
      'bash scripts/verify/verify-ollama-dev-package-provenance.sh'
    );
    expect(packageJson.scripts['verify:ollama:dev:tuning']).toBe(
      'bash scripts/verify/verify-ollama-dev-tuning-matrix.sh'
    );
    expect(packageJson.scripts['proof:ollama:dev:hardening']).toBe(
      'bash scripts/proof/generate-ollama-dev-hardening-proof.sh'
    );
  });

  it('keeps provenance locked on ollama-mcp@2.1.0', () => {
    expect(provenanceScriptRaw).toContain('ollama-mcp');
    expect(provenanceScriptRaw).toContain('2.1.0');
    expect(provenanceScriptRaw).toContain('PACKAGE_PROVENANCE_RECORDED');
  });

  it('keeps the tuning matrix outside the blocking stack gate', () => {
    expect(tuningScriptRaw).toContain('LOCAL_TUNING_PROFILE_RECORDED');
    expect(tuningScriptRaw).toContain('TITANE_OLLAMA_DEV_MATRIX_EXTENDED');
    expect(stackRaw).not.toContain('verify:ollama:dev:tuning');
  });

  it('publishes local profile and manual trust record artifacts', () => {
    expect(localProfileRaw).toContain('Recommended environment exports');
    expect(localProfileRaw).toContain('Stable work profile');
    expect(trustTemplateRaw).toContain('MCP server:');
    expect(trustChecklistRaw).toContain('MCP: Reset Trust');
    expect(trustChecklistRaw).toContain('OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md');
  });

  it('preserves wrapper stdio hygiene and pinned package metadata', () => {
    expect(wrapperRaw).toContain('ollama-mcp@2.1.0');
    expect(wrapperRaw).toContain('api/version" >/dev/null');
    const echoLines = wrapperRaw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('echo '));
    expect(echoLines.every(line => line.includes('>&2'))).toBe(true);
  });

  it('keeps product boundary locked to gemma2:2b', () => {
    expect(ollamaDefaultsRaw).toContain("DEFAULT_OLLAMA_MODEL = 'gemma2:2b'");
    expect(ollamaDefaultsRaw).not.toContain('qwen3.5:9b');
    expect(championRegistryRaw).toContain('"model": "gemma2:2b"');
    expect(championRegistryRaw).not.toContain('qwen3.5:9b');
  });

  it('emits hardening proof vocabulary and artifact states', () => {
    expect(hardeningProofRaw).toContain('OLLAMA_DEV_HARDENING_CERTIFICATION');
    expect(hardeningProofRaw).toContain('HARDENING_VERDICT');
    expect(hardeningProofRaw).toContain('PACKAGE_PROVENANCE');
    expect(hardeningProofRaw).toContain('LOCAL_TUNING_PROFILE');
    expect(hardeningProofRaw).toContain('MANUAL_CERTIFICATION_READY');
  });
});
