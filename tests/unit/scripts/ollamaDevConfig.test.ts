/**
 * Ollama Dev Configuration Tests
 *
 * Valide la configuration complète de la surface Ollama Dev:
 *  - MCP server (.vscode/mcp.json): structure, command, args, env
 *  - VS Code settings: chat.mcp.enabled, chat.agent.maxRequests
 *  - Isolation produit: qwen3.5:9b absent des defaults runtime TITANE
 *  - Boundary agent: frontmatter, section MCP, capacités qwen, checklist de vérification
 *  - Validator scripts: présents, exécutables, contiennent les 6 PASS markers
 *  - OLLAMA_RUNTIME_MAP.md: documente la surface dev
 *  - Prompt de session Ollama Dev: préflight + invariant de frontière
 *  - No cross-contamination: modèle dev absent des surfaces produit
 *
 * Complète ollamaBoundaryDoctrine.test.ts sans dupliquer ses 5 cas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');

// ── Fichiers sources ──────────────────────────────────────────────────────────
const mcpConfig = JSON.parse(
  fs.readFileSync(path.join(rootDir, '.vscode/mcp.json'), 'utf8')
) as {
  servers: Record<
    string,
    {
      type: string;
      command: string;
      args: string[];
      env: Record<string, string>;
    }
  >;
};

const vscodeSettings = JSON.parse(
  fs.readFileSync(path.join(rootDir, '.vscode/settings.json'), 'utf8')
) as Record<string, unknown>;

const ollamaDefaultsRaw = fs.readFileSync(
  path.join(rootDir, 'src/config/ollamaDefaults.ts'),
  'utf8'
);

const championRegistryRaw = fs.readFileSync(
  path.join(rootDir, 'config/championChallenger.json'),
  'utf8'
);

const boundaryAgentRaw = fs.readFileSync(
  path.join(rootDir, '.github/agents/ollama-dev-chat-boundary.agent.md'),
  'utf8'
);

const boundaryValidatorRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-ollama-copilot-boundary.sh'),
  'utf8'
);

const vscodeWorkflowValidatorRaw = fs.readFileSync(
  path.join(rootDir, 'scripts/verify/verify-vscode-agent-workflow.sh'),
  'utf8'
);

const ollamaRuntimeMap = fs.readFileSync(
  path.join(rootDir, 'OLLAMA_RUNTIME_MAP.md'),
  'utf8'
);

const ollamaDevPromptRaw = fs.readFileSync(
  path.join(rootDir, '.github/prompts/ollama-dev-session.prompt.md'),
  'utf8'
);

// ── Rust runtime source files ────────────────────────────────────────────────
const rustSourceFiles = [
  'src-tauri/src/runtime_config.rs',
  'src-tauri/src/config/update.rs',
  'src-tauri/src/ollama.rs',
  'src-tauri/src/ai/ollama.rs',
  'src-tauri/src/ollama_provider_refactor.rs',
].map(p => ({
  path: p,
  content: fs.readFileSync(path.join(rootDir, p), 'utf8'),
}));

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — MCP server structure', () => {
  it('déclare un serveur nommé ollama-dev', () => {
    expect(Object.keys(mcpConfig.servers)).toContain('ollama-dev');
  });

  it('utilise le type "stdio"', () => {
    expect(mcpConfig.servers['ollama-dev'].type).toBe('stdio');
  });

  it('utilise pnpm comme commande', () => {
    const cmd = mcpConfig.servers['ollama-dev'].command;
    expect(cmd === 'pnpm' || cmd === '/usr/local/bin/pnpm' || cmd.endsWith('/pnpm')).toBe(true);
  });

  it('transmet les args dlx + package ollama mcp', () => {
    const { args } = mcpConfig.servers['ollama-dev'];
    expect(args).toContain('dlx');
    const argsStr = args.join(' ');
    expect(argsStr.includes('mcp-server-ollama') || argsStr.includes('ollama-mcp')).toBe(true);
  });

  it('expose OLLAMA_HOST=http://127.0.0.1:11434 dans env', () => {
    expect(mcpConfig.servers['ollama-dev'].env['OLLAMA_HOST']).toBe(
      'http://127.0.0.1:11434'
    );
  });

  it('expose OLLAMA_MODEL=qwen3.5:9b dans env', () => {
    expect(mcpConfig.servers['ollama-dev'].env['OLLAMA_MODEL']).toBe('qwen3.5:9b');
  });

  it('autorise plusieurs serveurs MCP mais avec une allowlist contrôlée', () => {
    const serverNames = Object.keys(mcpConfig.servers);
    const allowedServerNames = [
      'ollama-dev',
      'memory',
      'sequential-thinking',
      'filesystem',
      'playwright',
      'github',
    ];

    expect(serverNames.length).toBeGreaterThanOrEqual(1);
    expect(serverNames).toContain('ollama-dev');
    expect(serverNames.every(name => allowedServerNames.includes(name))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — VS Code settings', () => {
  it('active MCP (chat.mcp.enabled=true ou chat.mcp.access présent)', () => {
    const enabled = vscodeSettings['chat.mcp.enabled'];
    const access = vscodeSettings['chat.mcp.access'];
    expect(enabled === true || (typeof access === 'string' && access.length > 0)).toBe(true);
  });

  it('définit chat.agent.maxRequests à une valeur >= 1000', () => {
    const maxReq = vscodeSettings['chat.agent.maxRequests'];
    expect(typeof maxReq).toBe('number');
    expect(maxReq as number).toBeGreaterThanOrEqual(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — isolation produit (zéro contamination)', () => {
  it('qwen3.5:9b absent de src/config/ollamaDefaults.ts (surface produit)', () => {
    // Extraire le code hors blocs de commentaire
    const codeLines = ollamaDefaultsRaw
      .split('\n')
      .filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*'));
    expect(codeLines.join('\n')).not.toContain('qwen3.5:9b');
  });

  it('qwen3.5:9b absent de config/championChallenger.json', () => {
    // On cherche dans les valeurs JSON (model, challenger, champion)
    const parsed = JSON.parse(championRegistryRaw) as Record<string, unknown>;
    const stringified = JSON.stringify(parsed);
    expect(stringified).not.toContain('qwen3.5:9b');
  });

  it('qwen3.5:9b absent des fichiers runtime Rust (hors tests)', () => {
    for (const { path: filePath, content } of rustSourceFiles) {
      // Filtrer les blocs de tests Rust
      const nonTestContent = content
        .split('\n')
        .filter(l => !l.trim().startsWith('#[test]') && !l.includes('mod tests'))
        .join('\n');
      // Supprimer les blocs #[cfg(test)] (simpliste mais suffisant pour détecter les leaks non-test)
      const withoutTestBlocks = nonTestContent.replace(
        /#\[cfg\(test\)\][\s\S]*?(?=\n(?:pub |fn |impl |struct |use |mod ))/g,
        ''
      );
      expect(withoutTestBlocks).not.toContain('qwen3.5:9b');
    }
  });

  it('gemma2:2b est le modèle par défaut du frontend produit', () => {
    expect(ollamaDefaultsRaw).toContain("DEFAULT_OLLAMA_MODEL = 'gemma2:2b'");
  });

  it('gemma2:2b est le champion dans config/championChallenger.json', () => {
    expect(championRegistryRaw).toContain('"model": "gemma2:2b"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — boundary agent (.github/agents/ollama-dev-chat-boundary.agent.md)', () => {
  it('contient le frontmatter name: ollama-dev-chat-boundary', () => {
    expect(boundaryAgentRaw).toContain('name: ollama-dev-chat-boundary');
  });

  it('déclare un modèle dans le frontmatter', () => {
    expect(boundaryAgentRaw).toMatch(/^model:\s+\S+/m);
  });

  it('déclare une liste tools dans le frontmatter', () => {
    expect(boundaryAgentRaw).toMatch(/^tools:/m);
  });

  it('déclare read_file dans la liste tools du frontmatter', () => {
    expect(boundaryAgentRaw).toContain('read_file');
  });

  it('contient une section Configuration MCP VS Code', () => {
    expect(boundaryAgentRaw).toContain('Configuration MCP VS Code');
  });

  it('contient le bloc JSON du serveur ollama-dev', () => {
    expect(boundaryAgentRaw).toContain('"ollama-dev"');
    expect(boundaryAgentRaw).toContain('"mcp-server-ollama');
  });

  it('contient une section capacités qwen3.5:9b avec contexte long et tool-calling', () => {
    expect(boundaryAgentRaw).toContain('Capacités qwen3.5:9b');
    expect(boundaryAgentRaw).toContain('128K');
    expect(boundaryAgentRaw).toContain('Tool-calling');
  });

  it('contient une section Comportements interdits', () => {
    expect(boundaryAgentRaw).toContain('Comportements interdits');
    expect(boundaryAgentRaw).toContain('championChallenger.json');
    expect(boundaryAgentRaw).toContain('runtime produit');
  });

  it('documente la checklist de vérification Ollama Dev (6 étapes minimum)', () => {
    // Compter les lignes numérotées dans la checklist
    const checklistItems = (boundaryAgentRaw.match(/^\d+\. /gm) ?? []).length;
    expect(checklistItems).toBeGreaterThanOrEqual(6);
  });

  it('documente les gates obligatoires (verify:ollama:boundary)', () => {
    expect(boundaryAgentRaw).toContain('verify:ollama:boundary');
  });

  it('contient une section Rollback minimal avec git restore', () => {
    expect(boundaryAgentRaw).toContain('git restore');
    expect(boundaryAgentRaw).toContain('.vscode/mcp.json');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — boundary validator (verify-ollama-copilot-boundary.sh)', () => {
  it('le script existe à son chemin canonique', () => {
    expect(
      fs.existsSync(
        path.join(rootDir, 'scripts/verify/verify-ollama-copilot-boundary.sh')
      )
    ).toBe(true);
  });

  it('le script est exécutable', () => {
    const stat = fs.statSync(
      path.join(rootDir, 'scripts/verify/verify-ollama-copilot-boundary.sh')
    );
    // eslint-disable-next-line no-bitwise
    expect(stat.mode & 0o111).toBeGreaterThan(0);
  });

  it('vérifie la présence de .vscode/mcp.json', () => {
    expect(boundaryValidatorRaw).toContain('.vscode/mcp.json');
  });

  it('vérifie ollama-dev dans mcp.json', () => {
    expect(boundaryValidatorRaw).toContain('ollama-dev');
  });

  it('vérifie qwen3.5:9b dans la doctrine dev', () => {
    expect(boundaryValidatorRaw).toContain('qwen3\\.5:9b');
  });

  it('vérifie chat.mcp.enabled=true dans .vscode/settings.json', () => {
    expect(boundaryValidatorRaw).toContain('chat\\.mcp\\.enabled');
    expect(boundaryValidatorRaw).toContain('chat.mcp.enabled is not true');
  });

  it('vérifie OLLAMA_HOST et le transport stdio dans .vscode/mcp.json', () => {
    expect(boundaryValidatorRaw).toContain('OLLAMA_HOST');
    expect(boundaryValidatorRaw).toContain('stdio transport declaration');
  });

  it('vérifie gemma2:2b dans les defaults produit', () => {
    expect(boundaryValidatorRaw).toContain('gemma2:2b');
  });

  it('contient les 6 labels de PASS attendus', () => {
    const passLabels = [
      'product ollama runtime baseline aligned',
      'development ollama doctrine aligned',
      'boundary validator wired in package',
      'MCP Ollama Dev config present and aligned',
      'MCP runtime settings and transport wired correctly',
      'active cline workflow references removed',
    ];
    for (const label of passLabels) {
      expect(boundaryValidatorRaw).toContain(label);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — vscode-agent-workflow validator', () => {
  it('vérifie VSCODE_MCP_CONFIG_PRESENT (.vscode/mcp.json)', () => {
    expect(vscodeWorkflowValidatorRaw).toContain('VSCODE_MCP_CONFIG_PRESENT');
  });

  it('vérifie MCP_OLLAMA_DEV_WIRED (ollama-dev dans mcp.json)', () => {
    expect(vscodeWorkflowValidatorRaw).toContain('MCP_OLLAMA_DEV_WIRED');
  });

  it('vérifie MCP_MODEL_QWEN_PRESENT (qwen3.5:9b dans mcp.json)', () => {
    expect(vscodeWorkflowValidatorRaw).toContain('MCP_MODEL_QWEN_PRESENT');
  });

  it('vérifie MCP_ENABLED_IN_SETTINGS (chat.mcp.enabled dans settings)', () => {
    expect(vscodeWorkflowValidatorRaw).toContain('MCP_ENABLED_IN_SETTINGS');
  });

  it('vérifie la présence du prompt Ollama Dev session', () => {
    expect(vscodeWorkflowValidatorRaw).toContain('OLLAMA_DEV_SESSION_PROMPT_PRESENT');
    expect(vscodeWorkflowValidatorRaw).toContain(
      '.github/prompts/ollama-dev-session.prompt.md'
    );
  });

  it('vérifie la section capacités du boundary agent', () => {
    expect(vscodeWorkflowValidatorRaw).toContain(
      'OLLAMA_BOUNDARY_AGENT_CAPABILITIES_PRESENT'
    );
    expect(vscodeWorkflowValidatorRaw).toContain('Capacités qwen3.5:9b');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — session prompt', () => {
  it('contient un préflight check avec version Ollama + modèle qwen', () => {
    expect(ollamaDevPromptRaw).toContain('Pre-flight check');
    expect(ollamaDevPromptRaw).toContain('/api/version');
    expect(ollamaDevPromptRaw).toContain('qwen3.5:9b');
  });

  it('contient l’invariant de frontière (isolation Dev vs runtime produit)', () => {
    expect(ollamaDevPromptRaw).toContain('Boundary invariant');
    expect(ollamaDevPromptRaw).toContain('isolated from the TITANE product runtime');
    expect(ollamaDevPromptRaw).toContain('gemma2:2b');
  });

  it('contient un critère de sortie basé sur verify:ollama:boundary', () => {
    expect(ollamaDevPromptRaw).toContain('Exit criteria');
    expect(ollamaDevPromptRaw).toContain('verify:ollama:boundary');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — OLLAMA_RUNTIME_MAP.md', () => {
  it('documente qwen3.5:9b comme modèle de surface dev', () => {
    expect(ollamaRuntimeMap).toContain('qwen3.5:9b');
  });

  it('documente la séparation Ollama Dev / Ollama Chat', () => {
    expect(ollamaRuntimeMap).toContain('gemma2:2b');
  });

  it('référence la baseline produit gemma2:2b dans le contexte de boundary normalization', () => {
    expect(ollamaRuntimeMap).toContain('Boundary normalization');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Ollama Dev — cohérence package.json', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
  ) as { scripts: Record<string, string> };

  it('verify:ollama:boundary pointe vers le script canonique', () => {
    expect(packageJson.scripts['verify:ollama:boundary']).toBe(
      'bash scripts/verify/verify-ollama-copilot-boundary.sh'
    );
  });

  it("audit:agents:stack inclut le check boundary dans la chaîne d'audit", () => {
    expect(packageJson.scripts['audit:agents:stack']).toContain('verify:ollama:boundary');
  });

  it('verify:agents:workflow pointe vers le script vscode-agent-workflow', () => {
    expect(packageJson.scripts['verify:agents:workflow']).toContain(
      'verify-vscode-agent-workflow.sh'
    );
  });
});
