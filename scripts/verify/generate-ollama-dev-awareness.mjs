#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT_DIR = process.env.TITANE_OLLAMA_DEV_AWARENESS_OUT_DIR
  ? path.resolve(process.env.TITANE_OLLAMA_DEV_AWARENESS_OUT_DIR)
  : path.join(ROOT, 'reports/ollama-dev-awareness');
const JSON_OUT = path.join(OUT_DIR, 'latest.json');
const MD_OUT = path.join(OUT_DIR, 'latest.md');
const DEV_MODEL = 'qwen3.5:9b';
const PRODUCT_MODEL = 'gemma2:2b';

const REQUIRED_SOURCES = [
  { id: 'root-agents', path: 'AGENTS.md', kind: 'instructions' },
  { id: 'copilot-kernel', path: '.github/copilot-instructions.md', kind: 'instructions' },
  { id: 'frontend-instructions', path: '.github/instructions/frontend.instructions.md', kind: 'instructions' },
  { id: 'ollama-boundary-agent', path: '.github/agents/ollama-dev-chat-boundary.agent.md', kind: 'instructions' },
  { id: 'ollama-dev-prompt', path: '.github/prompts/ollama-dev-session.prompt.md', kind: 'instructions' },
  { id: 'runtime-map', path: 'OLLAMA_RUNTIME_MAP.md', kind: 'cartography' },
  { id: 'architecture', path: 'ARCHITECTURE.md', kind: 'cartography' },
  { id: 'ui-surface-map', path: 'UI_SURFACE_MAP.md', kind: 'cartography' },
  { id: 'cartography-complete', path: 'docs/CARTOGRAPHY_COMPLETE.md', kind: 'cartography' },
  { id: 'ipc-catalog', path: 'docs/IPC_CATALOG.md', kind: 'cartography' },
  { id: 'dev-runbook', path: 'docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md', kind: 'runbook' },
  { id: 'dev-policy', path: 'docs/dev/OLLAMA_DEV_MODEL_POLICY.md', kind: 'runbook' },
  { id: 'local-profile', path: 'docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md', kind: 'runbook' },
  { id: 'mcp-config', path: '.vscode/mcp.json', kind: 'config' },
  { id: 'mcp-wrapper', path: 'scripts/mcp/start-ollama-dev-mcp.sh', kind: 'config' },
  { id: 'dev-stack-gate', path: 'scripts/verify/verify-ollama-dev-stack.sh', kind: 'gate' },
  { id: 'dev-live-gate', path: 'scripts/verify/verify-ollama-dev-live.sh', kind: 'gate' },
  { id: 'dev-performance-gate', path: 'scripts/verify/verify-ollama-dev-performance.sh', kind: 'gate' },
  { id: 'dev-global-awareness-gate', path: 'scripts/verify/verify-ollama-dev-global-awareness.sh', kind: 'gate' },
  { id: 'total-dev-page', path: 'src/pages/TotalDevPage.tsx', kind: 'frontend' },
  { id: 'total-dev-style', path: 'src/pages/TotalDevPage.css', kind: 'frontend' },
  { id: 'total-dev-backend', path: 'src-tauri/src/commands/total_dev_commands.rs', kind: 'backend' },
  { id: 'total-dev-capability', path: 'src-tauri/capabilities/total_dev.json', kind: 'backend' },
  { id: 'total-dev-e2e-desktop', path: 'e2e/desktop/total-dev.wdio.test.js', kind: 'e2e' },
  { id: 'total-dev-e2e-browser', path: 'e2e/total-dev-smoke.spec.ts', kind: 'e2e' },
  { id: 'package-scripts', path: 'package.json', kind: 'config' },
  { id: 'memory-state', path: 'memory/memory_core_state.json', kind: 'memory' },
];

const INVENTORY_ROOTS = [
  { id: 'frontend', path: 'src', exts: ['.ts', '.tsx', '.css', '.json'], maxFiles: 220 },
  { id: 'backend-tauri', path: 'src-tauri', exts: ['.rs', '.json', '.toml'], maxFiles: 220 },
  { id: 'tests', path: 'tests', exts: ['.ts', '.tsx', '.js', '.cjs', '.mjs'], maxFiles: 160 },
  { id: 'e2e', path: 'e2e', exts: ['.ts', '.js', '.cjs'], maxFiles: 160 },
  { id: 'scripts', path: 'scripts', exts: ['.sh', '.js', '.mjs', '.cjs'], maxFiles: 220 },
  { id: 'docs', path: 'docs', exts: ['.md', '.json'], maxFiles: 220 },
  { id: 'github', path: '.github', exts: ['.md', '.yml', '.yaml', '.json'], maxFiles: 180 },
  { id: 'memory', path: 'memory', exts: ['.json', '.md'], maxFiles: 80, metadataOnly: true },
  { id: 'logs', path: 'logs', exts: ['.log', '.jsonl', '.json'], maxFiles: 80, metadataOnly: true },
  { id: 'proof-reports', path: 'reports', exts: ['.md', '.json', '.jsonl', '.log'], maxFiles: 120, metadataOnly: true },
];

const PROTECTED_PRODUCT_DEFAULTS = [
  'src/config/ollamaDefaults.ts',
  'config/championChallenger.json',
  'src-tauri/src/runtime_config.rs',
  'src-tauri/src/config/update.rs',
];

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'target',
  'dist',
  '.cache',
  '.vite',
  '.claude',
  'proof_packs',
  'artifacts',
]);

const SENSITIVE_PATH_RE = /(^|\/)(\.env($|[./])|.*\.(pem|key|secret)$)/i;

function rel(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function hashFile(relPath) {
  const absolute = path.join(ROOT, relPath);
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(absolute));
  return hash.digest('hex');
}

function fileMeta(source) {
  const absolute = path.join(ROOT, source.path);
  if (!fs.existsSync(absolute)) {
    return {
      ...source,
      exists: false,
      sha256: null,
      bytes: 0,
      lines: 0,
    };
  }

  const stat = fs.statSync(absolute);
  const text = fs.readFileSync(absolute, 'utf8');
  return {
    ...source,
    exists: true,
    sha256: hashFile(source.path),
    bytes: stat.size,
    lines: text.split(/\r?\n/).length,
  };
}

function scanRoot(rootSpec) {
  const start = path.join(ROOT, rootSpec.path);
  const files = [];
  let totalFiles = 0;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      const relative = rel(absolute);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (SENSITIVE_PATH_RE.test(relative)) continue;
      if (!rootSpec.exts.includes(path.extname(entry.name))) continue;
      totalFiles += 1;
      if (files.length < rootSpec.maxFiles) {
        const stat = fs.statSync(absolute);
        files.push({
          path: relative,
          bytes: stat.size,
          sha256: rootSpec.metadataOnly ? null : hashFile(relative),
        });
      }
    }
  }

  walk(start);
  return {
    id: rootSpec.id,
    root: rootSpec.path,
    exists: fs.existsSync(start),
    total_files: totalFiles,
    listed_files: files.length,
    metadata_only: Boolean(rootSpec.metadataOnly),
    files,
  };
}

function findProofArtifacts() {
  const candidates = [
    'reports/ollama-dev-performance/latest.json',
    'reports/ollama-dev-performance/latest.md',
    'reports/ollama-dev-tuning/latest.jsonl',
    'reports/ollama-dev-tuning/latest.md',
    'reports/mcp-package-provenance/ollama-mcp-2.1.0.json',
    'reports/mcp-package-provenance/ollama-mcp-2.1.0.md',
    'reports/frontend-runtime-prebuild/latest.json',
  ];

  return candidates
    .filter(exists)
    .map(pathName => {
      const stat = fs.statSync(path.join(ROOT, pathName));
      return {
        path: pathName,
        bytes: stat.size,
        sha256: hashFile(pathName),
      };
    });
}

function productBoundary() {
  const protectedFiles = PROTECTED_PRODUCT_DEFAULTS.map(pathName => {
    const present = exists(pathName);
    const text = present ? readText(pathName) : '';
    return {
      path: pathName,
      exists: present,
      contains_product_model: text.includes(PRODUCT_MODEL),
      contains_dev_model: text.includes(DEV_MODEL),
      sha256: present ? hashFile(pathName) : null,
    };
  });

  const mcpConfig = exists('.vscode/mcp.json') ? readText('.vscode/mcp.json') : '';
  const totalDevPage = exists('src/pages/TotalDevPage.tsx') ? readText('src/pages/TotalDevPage.tsx') : '';
  return {
    product_model: PRODUCT_MODEL,
    dev_model: DEV_MODEL,
    protected_product_defaults: protectedFiles,
    mcp_declares_dev_model: mcpConfig.includes(DEV_MODEL),
    total_dev_declares_dev_model: totalDevPage.includes(DEV_MODEL),
    product_default_dev_model_contamination: protectedFiles.some(file => file.contains_dev_model),
  };
}

function buildManifest() {
  const sources = REQUIRED_SOURCES.map(fileMeta);
  const inventory = INVENTORY_ROOTS.map(scanRoot);
  const indexedPaths = [
    ...sources.map(source => source.path),
    ...inventory.flatMap(root => root.files.map(file => file.path)),
  ];
  const sensitiveIndexedPaths = indexedPaths.filter(pathName => SENSITIVE_PATH_RE.test(pathName));

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: ROOT,
    surface: 'OLLAMA_DEV_GLOBAL_AWARENESS',
    models: {
      product_chat: PRODUCT_MODEL,
      ollama_dev: DEV_MODEL,
    },
    canonical_summary: {
      mcp_server: 'ollama-dev via .vscode/mcp.json stdio wrapper',
      mcp_wrapper: 'scripts/mcp/start-ollama-dev-mcp.sh',
      product_boundary_gate: 'pnpm run verify:ollama:boundary',
      visible_ui_surface: '/total-dev',
      certification_ipc: 'total_dev_run_certification_profile',
      no_secret_policy: 'Manifest indexes metadata/hashes only and excludes .env/key/pem/secret paths.',
    },
    sources,
    inventory,
    proof_artifacts: findProofArtifacts(),
    product_boundary: productBoundary(),
    safety: {
      sensitive_indexed_paths: sensitiveIndexedPaths,
      env_files_indexed: sensitiveIndexedPaths.filter(pathName => /(^|\/)\.env($|[./])/i.test(pathName)),
      raw_memory_dump_included: false,
      raw_log_dump_included: false,
    },
  };
}

function writeMarkdown(manifest) {
  const lines = [
    '# Ollama DEV Global Awareness Manifest',
    '',
    `- generated_at: ${manifest.generated_at}`,
    `- product_chat: ${manifest.models.product_chat}`,
    `- ollama_dev: ${manifest.models.ollama_dev}`,
    `- mcp_server: ${manifest.canonical_summary.mcp_server}`,
    `- visible_ui_surface: ${manifest.canonical_summary.visible_ui_surface}`,
    `- required_sources: ${manifest.sources.filter(source => source.exists).length}/${manifest.sources.length}`,
    `- indexed_roots: ${manifest.inventory.length}`,
    `- proof_artifacts: ${manifest.proof_artifacts.length}`,
    `- sensitive_indexed_paths: ${manifest.safety.sensitive_indexed_paths.length}`,
    '',
    '## Verdict',
    '',
    manifest.product_boundary.product_default_dev_model_contamination
      ? 'FAIL: OLLAMA_DEV_AWARENESS_PRODUCT_BOUNDARY'
      : 'PASS: OLLAMA_DEV_AWARENESS_MANIFEST',
    '',
    '## Canonical Sources',
    '',
    ...manifest.sources.map(source => `- ${source.exists ? 'PASS' : 'FAIL'} ${source.kind}: ${source.path}`),
  ];
  fs.writeFileSync(MD_OUT, `${lines.join('\n')}\n`);
}

function validateManifest(manifest) {
  const errors = [];
  for (const source of manifest.sources) {
    if (!source.exists) errors.push(`required_source_missing:${source.path}`);
  }
  if (manifest.safety.sensitive_indexed_paths.length > 0) {
    errors.push(`sensitive_paths_indexed:${manifest.safety.sensitive_indexed_paths.join(',')}`);
  }
  if (manifest.product_boundary.product_default_dev_model_contamination) {
    errors.push('product_defaults_contain_dev_model');
  }
  if (!manifest.product_boundary.mcp_declares_dev_model) {
    errors.push('mcp_config_missing_dev_model');
  }
  if (!manifest.product_boundary.total_dev_declares_dev_model) {
    errors.push('total_dev_missing_dev_model');
  }
  return errors;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const manifest = buildManifest();
fs.writeFileSync(JSON_OUT, `${JSON.stringify(manifest, null, 2)}\n`);
writeMarkdown(manifest);

const errors = validateManifest(manifest);
if (errors.length > 0) {
  console.error(`FAIL: OLLAMA_DEV_AWARENESS_MANIFEST ${errors.join(' ')}`);
  console.error(`INFO: manifest=${JSON_OUT}`);
  process.exit(1);
}

console.log(`PASS: OLLAMA_DEV_AWARENESS_MANIFEST manifest=${JSON_OUT} report=${MD_OUT}`);
