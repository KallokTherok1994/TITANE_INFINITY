import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
) as { scripts: Record<string, string> };
const copilotInstructions = fs.readFileSync(
  path.join(rootDir, '.github/copilot-instructions.md'),
  'utf8'
);
const titaneInstructions = fs.readFileSync(
  path.join(rootDir, '.github/instructions/titane.instructions.md'),
  'utf8'
);
const rootAgents = fs.readFileSync(path.join(rootDir, 'AGENTS.md'), 'utf8');
const boundaryAgent = fs.readFileSync(
  path.join(rootDir, '.github/agents/ollama-dev-chat-boundary.agent.md'),
  'utf8'
);
const boundaryValidator = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-copilot-boundary.sh'),
  'utf8'
);
const ollamaDefaults = fs.readFileSync(
  path.join(rootDir, 'src/config/ollamaDefaults.ts'),
  'utf8'
);
const championRegistry = fs.readFileSync(
  path.join(rootDir, 'config/championChallenger.json'),
  'utf8'
);
const mcpConfig = fs.readFileSync(
  path.join(rootDir, '.vscode/mcp.json'),
  'utf8'
);
const vscodeSettings = fs.readFileSync(
  path.join(rootDir, '.vscode/settings.json'),
  'utf8'
);
const ollamaDevPrompt = fs.readFileSync(
  path.join(rootDir, '.github/prompts/ollama-dev-session.prompt.md'),
  'utf8'
);

describe('ollama dev/chat boundary doctrine', () => {
  const retiredScriptPrefix = ['c', 'line:'].join('');
  const retiredDoctrineLabel = ['Ollama', 'Cline'].join('/');

  it('keeps the active package workflow on the boundary validator and removes active legacy scripts', () => {
    expect(packageJson.scripts['verify:ollama:boundary']).toBe(
      'bash scripts/verify/verify-ollama-copilot-boundary.sh'
    );
    expect(packageJson.scripts['audit:agents:stack']).toContain('verify:ollama:boundary');
    expect(Object.keys(packageJson.scripts).some(key => key.startsWith(retiredScriptPrefix))).toBe(false);
  });

  it('documents qwen for Ollama Dev and gemma for Ollama Chat across repo-owned doctrine surfaces', () => {
    for (const source of [copilotInstructions, titaneInstructions, rootAgents, boundaryAgent]) {
      expect(source).toContain('qwen3.5:9b');
      expect(source).toContain('gemma2:2b');
      expect(source).toContain('Ollama Dev');
      expect(source).toContain('Ollama Chat');
      expect(source).not.toContain(retiredDoctrineLabel);
    }
  });

  it('keeps the product runtime defaults on gemma2:2b while the validator guards the dev qwen profile', () => {
    expect(ollamaDefaults).toContain("DEFAULT_OLLAMA_MODEL = 'gemma2:2b'");
    expect(championRegistry).toContain('"model": "gemma2:2b"');
    expect(boundaryValidator).toContain("rg -q 'gemma2:2b' src/config/ollamaDefaults.ts");
    expect(boundaryValidator).toContain("rg -q 'qwen3\\.5:9b' .github/copilot-instructions.md");
    expect(boundaryValidator).toContain('active cline workflow references removed');
  });

  it('has a .vscode/mcp.json config file wiring the ollama-dev MCP server', () => {
    const mcpConfigPath = path.join(rootDir, '.vscode/mcp.json');
    expect(fs.existsSync(mcpConfigPath)).toBe(true);
    const parsed = JSON.parse(mcpConfig) as { servers: Record<string, unknown> };
    expect(Object.keys(parsed.servers)).toContain('ollama-dev');
  });

  it('declares qwen3.5:9b and ollama-dev server in .vscode/mcp.json', () => {
    expect(mcpConfig).toContain('ollama-dev');
    expect(mcpConfig).toContain('qwen3.5:9b');
    expect(mcpConfig).toContain('http://127.0.0.1:11434');
  });

  it('keeps MCP runtime settings aligned with chat.mcp.enabled and stdio transport checks', () => {
    expect(vscodeSettings).toContain('"chat.mcp.enabled": true');
    expect(boundaryValidator).toContain('chat\\.mcp\\.enabled');
    expect(boundaryValidator).toContain('chat.mcp.enabled is not true');
    expect(boundaryValidator).toContain('OLLAMA_HOST');
    expect(boundaryValidator).toContain('stdio transport declaration');
    expect(boundaryValidator).toContain('MCP runtime settings and transport wired correctly');
  });

  it('keeps a dedicated ollama dev session prompt with boundary-safe preflight checks', () => {
    expect(ollamaDevPrompt).toContain('Prompt: Ollama Dev Session');
    expect(ollamaDevPrompt).toContain('Pre-flight check');
    expect(ollamaDevPrompt).toContain('verify:ollama:boundary');
    expect(ollamaDevPrompt).toContain('Boundary invariant');
    expect(ollamaDevPrompt).toContain('gemma2:2b');
  });
});
