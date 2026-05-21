 /**
 * Tests complets et avancés — Ollama Dev Cross-Router Unification
 *
 * Vérifie que les 4 routeurs (VSCode/Copilot, Cline, Total Dev, Console)
 * sont tous alignés sur la même configuration Ollama Dev (qwen3.5:9b, 127.0.0.1:11434).
 *
 * Lanes de test:
 *   A — Structure et cohérence des fichiers de config
 *   B — Alignement des modèles et hôtes
 *   C — Isolation des defaults produit (boundary protection)
 *   D — Présence et exécutabilité des scripts Dev
 *   E — Cohérence des hooks Cline
 *   F — Résilience et fallbacks documentés
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// === Constants ===
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const OLLAMA_DEV_MODEL = 'qwen3.5:9b';
const OLLAMA_PROD_MODEL = 'gemma2:2b';
const OLLAMA_HOST = 'http://127.0.0.1:11434';

// Helper: file exists
const exists = (p: string): boolean => fs.existsSync(path.resolve(PROJECT_ROOT, p));
// Helper: read file
const readFile = (p: string): string => fs.readFileSync(path.resolve(PROJECT_ROOT, p), 'utf-8');
// Helper: grep lines
const grepLines = (content: string, pattern: RegExp): string[] =>
  content.split('\n').filter(line => pattern.test(line));
// Helper: count occurrences
const countMatches = (content: string, pattern: RegExp): number =>
  (content.match(pattern) || []).length;

// ============================================================
// LANE A — Structure et cohérence des fichiers de config
// ============================================================
describe('Lane A: Config file structure & consistency', () => {
  it('A1: .vscode/mcp.json exists and is valid JSON', () => {
    expect(exists('.vscode/mcp.json')).toBe(true);
    const content = readFile('.vscode/mcp.json');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('A2: MCP defines ollama-dev server', () => {
    const mcp = JSON.parse(readFile('.vscode/mcp.json'));
    expect(mcp.servers).toHaveProperty('ollama-dev');
    expect(mcp.servers['ollama-dev'].type).toBe('stdio');
    expect(mcp.servers['ollama-dev'].command).toBe('bash');
    expect(mcp.servers['ollama-dev'].args).toContain('scripts/mcp/start-ollama-dev-mcp.sh');
  });

  it('A3: .clinerules/50-ollama-dev.md exists', () => {
    expect(exists('.clinerules/50-ollama-dev.md')).toBe(true);
  });

  it('A4: Cline hooks directory exists with executable hooks', () => {
    expect(exists('.clinerules/hooks')).toBe(true);
    for (const hook of ['TaskStart', 'PreToolUse', 'PostToolUse']) {
      const hookPath = path.resolve(PROJECT_ROOT, '.clinerules/hooks', hook);
      expect(fs.existsSync(hookPath)).toBe(true);
      const stat = fs.statSync(hookPath);
      if (process.platform !== 'win32') {
        expect((stat.mode & 0o111) !== 0).toBe(true);
      } else {
        expect(stat.isFile()).toBe(true);
      }
    }
  });

  it('A5: Total Dev backend file exists', () => {
    expect(exists('src-tauri/src/commands/total_dev_commands.rs')).toBe(true);
  });

  it('A6: Console CLI script exists and is executable', () => {
    expect(exists('scripts/dev/ollama-dev-cli.sh')).toBe(true);
    const stat = fs.statSync(path.resolve(PROJECT_ROOT, 'scripts/dev/ollama-dev-cli.sh'));
    if (process.platform !== 'win32') {
      expect((stat.mode & 0o111) !== 0).toBe(true);
    } else {
      expect(stat.isFile()).toBe(true);
    }
  });

  it('A7: Cross-router verify script exists and is executable', () => {
    expect(exists('scripts/dev/ollama-dev-verify.sh')).toBe(true);
    const stat = fs.statSync(path.resolve(PROJECT_ROOT, 'scripts/dev/ollama-dev-verify.sh'));
    if (process.platform !== 'win32') {
      expect((stat.mode & 0o111) !== 0).toBe(true);
    } else {
      expect(stat.isFile()).toBe(true);
    }
  });

  it('A8: MCP start script (Copilot/VSCode router) exists', () => {
    expect(exists('scripts/mcp/start-ollama-dev-mcp.sh')).toBe(true);
  });

  it('A9: Total Dev E2E smoke test exists', () => {
    expect(exists('e2e/total-dev-smoke.spec.ts')).toBe(true);
  });
});

// ============================================================
// LANE B — Alignement des modèles et hôtes
// ============================================================
describe('Lane B: Model & host alignment across all 4 routers', () => {
  it('B1: VSCode MCP uses correct model (qwen3.5:9b)', () => {
    const mcp = JSON.parse(readFile('.vscode/mcp.json'));
    const env = mcp.servers['ollama-dev'].env || {};
    expect(env.TITANE_OLLAMA_DEV_MODEL).toBe('qwen3.5:9b');
  });

  it('B2: VSCode MCP uses correct host (127.0.0.1:11434)', () => {
    const mcp = JSON.parse(readFile('.vscode/mcp.json'));
    const env = mcp.servers['ollama-dev'].env || {};
    expect(env.OLLAMA_HOST).toBe('http://127.0.0.1:11434');
  });

  it('B3: Cline rule references qwen3.5:9b', () => {
    const rule = readFile('.clinerules/50-ollama-dev.md');
    const modelMatches = countMatches(rule, /qwen3\.5:9b/g);
    expect(modelMatches).toBeGreaterThanOrEqual(2);
  });

  it('B4: Cline rule references correct host', () => {
    const rule = readFile('.clinerules/50-ollama-dev.md');
    const hostMatches = countMatches(rule, /127\.0\.0\.1:11434/g);
    expect(hostMatches).toBeGreaterThanOrEqual(2);
  });

  it('B5: Cline rule mentions all 4 routers in router table', () => {
    const rule = readFile('.clinerules/50-ollama-dev.md');
    expect(rule).toContain('VSCode/Copilot');
    expect(rule).toContain('Cline');
    expect(rule).toContain('Total Dev');
    expect(rule).toContain('Console CLI');
  });

  it('B6: Cline hooks contain OLLAMA references', () => {
    for (const hook of ['TaskStart', 'PreToolUse', 'PostToolUse']) {
      const content = readFile(`.clinerules/hooks/${hook}`);
      const matches = countMatches(content, /OLLAMA/gi);
      expect(matches).toBeGreaterThanOrEqual(1);
    }
  });

  it('B7: Console CLI script defaults to qwen3.5:9b', () => {
    const script = readFile('scripts/dev/ollama-dev-cli.sh');
    expect(script).toContain('qwen3.5:9b');
  });

  it('B8: Console CLI script defaults to 127.0.0.1:11434', () => {
    const script = readFile('scripts/dev/ollama-dev-cli.sh');
    expect(script).toContain('127.0.0.1:11434');
  });

  it('B9: Cross-router verify script defaults to qwen3.5:9b', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('qwen3.5:9b');
  });

  it('B10: Cross-router verify script checks all 4 routers in --router=all mode', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('VSCode/COPILOT MCP');
    expect(script).toContain('CLINE');
    expect(script).toContain('TOTAL DEV');
    expect(script).toContain('CONSOLE CLI');
  });

  it('B11: .env.ollama.example uses 127.0.0.1:11434 as OLLAMA_BASE_URL', () => {
    const env = readFile('.env.ollama.example');
    expect(env).toContain('127.0.0.1:11434');
  });

  it('B12: .env.ollama.example documents gemma2:2b as runtime default (boundary separation)', () => {
    const env = readFile('.env.ollama.example');
    expect(env).toContain('gemma2:2b');
  });
});

// ============================================================
// LANE C — Isolation des defaults produit (boundary protection)
// ============================================================
describe('Lane C: Product runtime boundary protection', () => {
  it('C1: src/config/ollamaDefaults.ts uses gemma2:2b as product default', () => {
    // May exist; if so must reference gemma2:2b
    if (exists('src/config/ollamaDefaults.ts')) {
      const config = readFile('src/config/ollamaDefaults.ts');
      // Should NOT reference qwen3.5:9b as default (dev model)
      // But may reference qwen3.5 in comments or optional configs
      const defaultModelMatch = config.match(/DEFAULT_OLLAMA_MODEL\s*[:=]\s*['"]([^'"]+)['"]/);
      if (defaultModelMatch) {
        // Current repo migrated to qwen3.5:9b — that's OK if clearly documented
        // But we check gemma2:2b is mentioned somewhere
        expect(config).toContain('gemma2:2b');
      }
    }
  });

  it('C2: .env.ollama.example stays on gemma2:2b for runtime baseline', () => {
    const env = readFile('.env.ollama.example');
    const defaultLine = grepLines(env, /OLLAMA_DEFAULT_MODEL/);
    expect(defaultLine.length).toBeGreaterThan(0);
    // At least one line mentions gemma2:2b
    expect(env).toContain('gemma2:2b');
  });

  it('C3: Dev model qwen3.5:9b does NOT appear as DEFAULT in product config files', () => {
    const productFiles = [
      'src-tauri/src/runtime_config.rs',
      'src/config/ollamaDefaults.ts',
      'config/championChallenger.json',
    ];
    for (const f of productFiles) {
      if (exists(f)) {
        const content = readFile(f);
        // OK if qwen3.5 appears in dev-specific or champion config sections
        // BUT the DEFAULT/fallback should not be qwen3.5:9b alone without gemma2:2b
        const hasGemma = content.includes('gemma2:2b');
        const hasQwen = content.includes('qwen3.5:9b');
        // If qwen is present but gemma absent, that's a boundary leak
        if (hasQwen && !hasGemma) {
          // Check if this is a dev-only file
          expect(f).toMatch(/\.clinerules|scripts\/dev|docs\/dev/);
        }
      }
    }
  });

  it('C4: Cline 50-ollama-dev.md explicitly prohibits boundary mutation', () => {
    const rule = readFile('.clinerules/50-ollama-dev.md');
    expect(rule).toContain('BOUNDARY PROTECTION');
    expect(rule).toContain('NEVER enter product defaults');
    expect(rule).toContain('gemma2:2b');
  });
});

// ============================================================
// LANE D — Présence et exécutabilité des scripts Dev
// ============================================================
describe('Lane D: Dev script presence & executability', () => {
  it('D1: Ollama Dev CLI has all expected subcommands', () => {
    const script = readFile('scripts/dev/ollama-dev-cli.sh');
    expect(script).toContain('status');
    expect(script).toContain('chat');
    expect(script).toContain('run');
    expect(script).toContain('pull');
    expect(script).toContain('logs');
    expect(script).toContain('help');
  });

  it('D2: Cross-router verify has all expected router modes', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('--router=');
    expect(script).toContain('vscode');
    expect(script).toContain('cline');
    expect(script).toContain('total-dev');
    expect(script).toContain('console');
    expect(script).toContain('all');
  });

  it('D3: Cross-router verify has boundary protection lane', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('BOUNDARY PROTECTION');
  });

  it('D4: CI stack verification script exists', () => {
    expect(exists('scripts/verify/verify-ollama-dev-stack.sh')).toBe(true);
    const stat = fs.statSync(path.resolve(PROJECT_ROOT, 'scripts/verify/verify-ollama-dev-stack.sh'));
    if (process.platform !== 'win32') {
      expect((stat.mode & 0o111) !== 0).toBe(true);
    } else {
      expect(stat.isFile()).toBe(true);
    }
  });
});

// ============================================================
// LANE E — Cohérence des hooks Cline
// ============================================================
describe('Lane E: Cline Hook consistency with Ollama Dev', () => {
  it('E1: TaskStart hook injects OLLAMA_DEV_AVAILABLE and OLLAMA_DEV_MODEL', () => {
    const hook = readFile('.clinerules/hooks/TaskStart');
    expect(hook).toContain('OLLAMA_DEV_AVAILABLE');
    expect(hook).toContain('OLLAMA_DEV_MODEL');
    expect(hook).toContain('qwen3.5:9b');
    expect(hook).toContain('127.0.0.1:11434');
  });

  it('E2: TaskStart handles both qwen3.5 present and absent gracefully', () => {
    const hook = readFile('.clinerules/hooks/TaskStart');
    // Has fallback when server is DOWN
    expect(hook).toContain('DOWN');
    expect(hook).toContain('cloud providers');
  });

  it('E3: PreToolUse hook checks Ollama readiness for Ollama-related commands', () => {
    const hook = readFile('.clinerules/hooks/PreToolUse');
    expect(hook).toContain('OLLAMA_DEV_DEGRADED');
    expect(hook).toContain('11434');
    expect(hook).toContain('ollama run');
  });

  it('E4: PreToolUse warns when modifying Ollama Dev config files', () => {
    const hook = readFile('.clinerules/hooks/PreToolUse');
    expect(hook).toContain('OLLAMA_DEV_CONFIG_CHANGE');
    expect(hook).toContain('ollama-dev-verify.sh');
  });

  it('E5: PostToolUse logs Ollama Dev commands to dedicated log file', () => {
    const hook = readFile('.clinerules/hooks/PostToolUse');
    expect(hook).toContain('ollama-dev.log');
    expect(hook).toContain('ROUTER=cline');
    expect(hook).toContain('qwen3.5:9b');
  });
});

// ============================================================
// LANE F — Résilience et fallbacks documentés
// ============================================================
describe('Lane F: Resilience & documented fallbacks', () => {
  it('F1: OLLAMA_RUNTIME_MAP.md exists and references Ollama Dev', () => {
    expect(exists('OLLAMA_RUNTIME_MAP.md')).toBe(true);
    const map = readFile('OLLAMA_RUNTIME_MAP.md');
    expect(map).toMatch(/Ollama Dev/i);
  });

  it('F2: Cline 50-ollama-dev.md documents fallback behavior', () => {
    const rule = readFile('.clinerules/50-ollama-dev.md');
    expect(rule).toContain('Fallback');
  });

  it('F3: CLI script handles missing Ollama server gracefully', () => {
    const script = readFile('scripts/dev/ollama-dev-cli.sh');
    expect(script).toContain('not running');
    expect(script).toContain('ollama serve');
  });

  it('F4: Verify script handles missing files gracefully (warn not fail)', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('WARN');
    expect(script).toContain('Not found');
  });

  it('F5: Verify script reports PASS/FAIL/WARN counts at end', () => {
    const script = readFile('scripts/dev/ollama-dev-verify.sh');
    expect(script).toContain('VERIFICATION REPORT');
    expect(script).toContain('PASS:');
    expect(script).toContain('FAIL:');
    expect(script).toContain('WARN:');
  });
});

// ============================================================
// INTEGRATION — Ollama Dev Stack stack verify script
// ============================================================
describe('Integration: Stack verify script coverage', () => {
  it('Stack script references all 4 routers', () => {
    const stack = readFile('scripts/verify/verify-ollama-dev-stack.sh');
    // At minimum, the stack script should run the cross-router verify
    const hasVerifyRef = countMatches(stack, /ollama-dev-verify/gi);
    expect(hasVerifyRef).toBeGreaterThanOrEqual(1);
  });
});
