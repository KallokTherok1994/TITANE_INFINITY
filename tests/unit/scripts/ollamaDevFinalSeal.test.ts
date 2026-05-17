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
const mcpRaw = fs.readFileSync(path.join(rootDir, '.vscode/mcp.json'), 'utf8');
const liveRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-live.sh'),
  'utf8'
);
const perfRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-performance.sh'),
  'utf8'
);
const stackRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-dev-stack.sh'),
  'utf8'
);
const proofRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/proof/generate-ollama-dev-session-proof.sh'),
  'utf8'
);
const runbookRaw = fs.readFileSync(
  path.join(rootDir, 'docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md'),
  'utf8'
);
const trustChecklistRaw = fs.readFileSync(
  path.join(rootDir, 'docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md'),
  'utf8'
);
const securityPolicyRaw = fs.readFileSync(
  path.join(rootDir, 'docs/security/MCP_LOCAL_SECURITY_POLICY.md'),
  'utf8'
);

describe('ollama dev final seal', () => {
  it('declares a dedicated global awareness script in package.json', () => {
    expect(packageJson.scripts['verify:ollama:dev:global-awareness']).toBe(
      'bash scripts/verify/verify-ollama-dev-global-awareness.sh'
    );
  });

  it('keeps the scoped stack gate free of direct verify_instructions blocking', () => {
    expect(stackRaw).toContain('verify-ollama-dev-global-awareness.sh');
    expect(stackRaw).not.toContain('bash scripts/verify_instructions.sh');
    expect(stackRaw).toContain('PASS: OLLAMA_DEV_STACK_CERTIFIED');
  });

  it('writes wrapper diagnostics to stderr only before MCP stdio handoff', () => {
    const echoLines = wrapperRaw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('echo '));
    expect(echoLines.length).toBeGreaterThan(0);
    expect(echoLines.every(line => line.includes('>&2'))).toBe(true);
    expect(wrapperRaw).toContain('ollama-mcp@2.1.0');
    expect(wrapperRaw).not.toContain('@latest');
    expect(wrapperRaw).toContain('api/version" >/dev/null');
    expect(mcpRaw).not.toContain('@latest');
  });

  it('keeps think:false and compatibility retry in the live script', () => {
    expect(liveRaw).toContain('\\"think\\": false');
    expect(liveRaw).toContain('retrying compatibility probe without num_ctx');
    expect(liveRaw).toContain('BLOCKED_OLLAMA_SERVER');
    expect(liveRaw).toContain('BLOCKED_MODEL_MISSING');
    expect(liveRaw).toContain('TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC');
    expect(liveRaw).toContain('TITANE_OLLAMA_DEV_SMOKE_NUM_CTX');
  });

  it('captures timing fields and throughput in the performance script', () => {
    for (const needle of [
      'total_duration',
      'load_duration',
      'prompt_eval_count',
      'prompt_eval_duration',
      'eval_count',
      'eval_duration',
      'tokens_per_second',
      'load_profile',
      'compatibility_retry_used',
      'TITANE_OLLAMA_DEV_PERF_NUM_CTX',
      'TITANE_OLLAMA_DEV_PERF_NUM_PREDICT',
    ]) {
      expect(perfRaw).toContain(needle);
    }
  });

  it('emits dual verdict fields in the proof pack generator', () => {
    expect(proofRaw).toContain('## Ollama Dev scoped verdict');
    expect(proofRaw).toContain('## Global repo awareness');
    expect(proofRaw).toContain('## VS Code MCP trust');
    expect(proofRaw).toContain('GLOBAL_REPO_GATES_PARTIAL');
    expect(proofRaw).toContain('MANUAL_TRUST_REQUIRED');
    expect(proofRaw).toContain('TRUST_NOT_CLI_PROVABLE');
  });

  it('links the runbook to the VS Code trust checklist', () => {
    expect(runbookRaw).toContain('OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md');
    expect(trustChecklistRaw).toContain('Manual proof steps');
    expect(trustChecklistRaw).toContain('MCP: List Servers');
  });

  it('mentions no direct trust bypass in the security policy', () => {
    expect(securityPolicyRaw).toContain('No direct trust bypass');
  });
});
