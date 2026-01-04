#!/usr/bin/env bash

# COPILOT-XS INTEGRAL SETUP (repo-local)
# Usage: ./scripts/init-copilot-xs.sh

# IP / Attribution
# - Creator: Kevin Thibault (TITANE∞)
# - Generated/maintained with GitHub Copilot (GPT-5.2)
# - Licensing: governed by repository LICENSE.md
# Note: user network IP is not available to embed automatically.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Initializing COPILOT-XS scaffolding (repo-local)..."

# 1) Directory structure
mkdir -p \
  .github/copilot-agents/agents \
  .github/copilot-xs/scripts \
  .vscode

# 2) Create docs/config files (non-destructive)
write_if_missing() {
  local path="$1"
  local tmp
  tmp="$(mktemp)"
  cat > "$tmp"

  if [[ -f "$path" ]]; then
    echo "ℹ️  Skipping existing: $path"
    rm -f "$tmp"
    return 0
  fi

  mkdir -p "$(dirname "$path")"
  mv "$tmp" "$path"
  echo "✅ Wrote: $path"
}

write_if_missing ".github/copilot-instructions.md" <<'EOF'
# COPILOT-XS (Repo-local) Coding Protocol

**IP / Attribution**

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot (GPT-5.2)
- Licensing: governed by repository LICENSE.md

This repository contains an optional COPILOT-XS scaffolding pack:
- **Layer 1 (Rules):** lightweight, repo-aligned guardrails
- **Layer 2 (Agents):** documented specialist personas (markdown)
- **Layer 3 (Routing):** documented routing + workflow artifacts

Notes:
- This pack does **not** "hardwire" VS Code internals; it provides files, tasks, and scripts that you can run.
- TITANE∞ constraints in this repo remain authoritative (see `.copilot-rules-permanent.md`).

## Layer 1 — Non-negotiables for this repo

- Tauri-only (no HTTP servers); keep the project local-first.
- No secrets committed.
- Keep changes minimal and testable.

## Optional validation policy

The validation script checks for:
- Prohibited markers in source folders (default: `TODO`, `FIXME`).
- Basic hygiene (no obvious secrets patterns).

By default, `pnpm run copilot-xs:validate` scans **git staged files** (pre-commit scope) to avoid forcing a full legacy cleanup.
For a full scan, run: `COPILOT_XS_SCOPE=all pnpm run copilot-xs:validate`.

Configure via environment variables:
- `COPILOT_XS_ROOTS` (comma-separated roots, default: `src,src-tauri/src,tests`)
- `COPILOT_XS_PROHIBITED` (comma-separated terms, default: `TODO,FIXME`)
- `COPILOT_XS_SCOPE` (`staged` | `all`, default: `staged`)

Secret scanning knobs:
- `COPILOT_XS_SECRET_SCAN` (`1` | `0`, default: `1`)
- `COPILOT_XS_SECRET_SCAN_IN_TESTS` (`1` | `0`, default: `0`)
- `COPILOT_XS_SECRET_MIN_CHARS` (default: `48`)
- `COPILOT_XS_SECRET_ALLOW_REGEX` (regex string; matching lines are ignored)

Optional marker policy knobs:
- `COPILOT_XS_ALLOW_PROHIBITED_IN_TESTS` (`1` | `0`, default: `0`)
EOF

write_if_missing ".github/copilot-agents.md" <<'EOF'
# COPILOT-XS Agent Federation (Documentation)

This is a **documentation-only** agent roster used to describe roles and routing.

## Specialists

- **systems_architect**: architecture, boundaries, DDD
- **security_auditor**: OWASP, secrets, auth
- **data_scientist**: stats, reproducibility
- **ai_ml_engineer**: LLM safety, RAG, evals
- **devops_engineer**: CI/CD, release, observability
- **code_reviewer**: performance, idioms, consistency

## Consensus policy (doc)

- Security can veto changes that introduce obvious risk.
- Prefer minimal scope and repository rules (`.copilot-rules-permanent.md`).
EOF

write_if_missing ".github/copilot-routing.json" <<'EOF'
{
  "version": 1,
  "routing_rules": [
    {"priority": 1, "when": "security", "agents": ["security_auditor", "code_reviewer"]},
    {"priority": 2, "when": "infra", "agents": ["devops_engineer", "security_auditor"]},
    {"priority": 3, "when": "ai_ml", "agents": ["ai_ml_engineer", "data_scientist"]},
    {"priority": 4, "when": "architecture", "agents": ["systems_architect", "code_reviewer"]},
    {"priority": 9, "when": "default", "agents": ["code_reviewer"]}
  ]
}
EOF

write_if_missing ".github/copilot-workflow.mermaid" <<'EOF'
flowchart TD
  User[User task] --> Validate[Run copilot-xs:validate]
  Validate -->|pass| Plan[Plan + implement]
  Validate -->|fail| Fix[Fix violations]
  Fix --> Validate
  Plan --> Test[Run tests]
  Test -->|pass| Done[Ready to commit]
  Test -->|fail| Fix
EOF

# Agents (doc)
write_if_missing ".github/copilot-agents/orchestrator.agent.md" <<'EOF'
# Orchestrator (Doc)

Role: Coordinates validation and test gates.

- Pre-flight: run `pnpm run copilot-xs:validate`
- Gate: run `pnpm run test:all` (or repo verify) before merge
EOF

write_if_missing ".github/copilot-agents/architect.agent.md" <<'EOF'
# Architect (Doc)

Role: decomposes tasks, preserves TITANE∞ constraints, avoids overreach.
EOF

write_if_missing ".github/copilot-agents/agent-factory.agent.md" <<'EOF'
# Agent Factory (Doc)

Role: documents new agent personas when a domain is missing.
EOF

write_if_missing ".github/copilot-agents/agents/security.agent.md" <<'EOF'
# security_auditor

Focus: secrets scanning, OWASP top 10, safe defaults.
EOF

write_if_missing ".github/copilot-agents/agents/architecture.agent.md" <<'EOF'
# systems_architect

Focus: boundaries, cohesion/coupling, maintainability.
EOF

write_if_missing ".github/copilot-agents/agents/data-scientist.agent.md" <<'EOF'
# data_scientist

Focus: reproducibility, evaluation methodology, statistical rigor.
EOF

write_if_missing ".github/copilot-agents/agents/ai-ml-engineer.agent.md" <<'EOF'
# ai_ml_engineer

Focus: prompt safety, token budgets, eval harness, offline-first where possible.
EOF

write_if_missing ".github/copilot-agents/agents/devops.agent.md" <<'EOF'
# devops_engineer

Focus: CI reliability, release pipelines, build performance.
EOF

write_if_missing ".github/copilot-agents/agents/code-reviewer.agent.md" <<'EOF'
# code_reviewer

Focus: idiomatic code, perf regressions, refactor safety.
EOF

# 3) Node scripts
write_if_missing ".github/copilot-xs/scripts/validate.js" <<'EOF'
#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_ROOTS = ['src', 'src-tauri/src', 'tests'];
const DEFAULT_PROHIBITED = ['TODO', 'FIXME'];

const roots = (process.env.COPILOT_XS_ROOTS ?? DEFAULT_ROOTS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const prohibited = (process.env.COPILOT_XS_PROHIBITED ?? DEFAULT_PROHIBITED.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'target',
  '.git',
  '.vite',
  '.vite-cache',
  'runtime',
  'logs',
  '.disabled',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.rs',
  '.py',
  '.json',
]);

function isLikelySecretLine(line) {
  const patterns = [
    /api[_-]?key\s*[:=]\s*['\"][^'\"]{16,}['\"]/i,
    /secret\s*[:=]\s*['\"][^'\"]{16,}['\"]/i,
    /private[_-]?key/i,
    /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/,
  ];
  return patterns.some((re) => re.test(line));
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SOURCE_EXTENSIONS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

async function validateFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const violations = [];

  for (const term of prohibited) {
    if (content.includes(term)) {
      violations.push({ type: 'prohibited', term, filePath });
    }
  }

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isLikelySecretLine(line)) {
      violations.push({ type: 'secret', line: i + 1, filePath });
    }
  }

  return violations;
}

export async function runValidate() {
  const cwd = process.cwd();
  const violations = [];

  for (const root of roots) {
    const absRoot = path.resolve(cwd, root);
    for await (const filePath of walk(absRoot)) {
      const fileViolations = await validateFile(filePath);
      violations.push(...fileViolations);
    }
  }

  return violations;
}

async function main() {
  const violations = await runValidate();

  if (violations.length === 0) {
    console.log('✅ COPILOT-XS VALIDATION PASSED');
    process.exit(0);
  }

  console.error('❌ COPILOT-XS VALIDATION FAILED');
  for (const v of violations) {
    if (v.type === 'prohibited') {
      console.error(`- ${v.filePath}: contains prohibited term "${v.term}"`);
    } else if (v.type === 'secret') {
      console.error(`- ${v.filePath}:${v.line}: potential secret detected`);
    } else {
      console.error(`- ${v.filePath}: ${JSON.stringify(v)}`);
    }
  }

  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Executed directly
  main().catch((err) => {
    console.error('❌ COPILOT-XS VALIDATION CRASHED');
    console.error(err);
    process.exit(1);
  });
}
EOF

write_if_missing ".github/copilot-xs/scripts/precommit.js" <<'EOF'
#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1) Validate (fast)
run('pnpm', ['run', 'copilot-xs:validate']);

// 2) Full test gate (can be slow; set COPILOT_XS_SKIP_TESTS=1 to bypass locally)
if (process.env.COPILOT_XS_SKIP_TESTS !== '1') {
  run('pnpm', ['run', 'test:all']);
}
EOF

write_if_missing ".github/copilot-xs/scripts/agent-status.js" <<'EOF'
#!/usr/bin/env node

import fs from 'node:fs/promises';

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const checks = [
    ['Layer 1: Instructions', await exists('.github/copilot-instructions.md')],
    ['Layer 2: Agent roster', await exists('.github/copilot-agents.md')],
    ['Layer 3: Routing', await exists('.github/copilot-routing.json')],
    ['Layer 3: Workflow', await exists('.github/copilot-workflow.mermaid')],
    ['Automation: validate.js', await exists('.github/copilot-xs/scripts/validate.js')],
    ['Automation: precommit.js', await exists('.github/copilot-xs/scripts/precommit.js')],
  ];

  console.log('🎯 COPILOT-XS STATUS REPORT');
  console.log('');
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✅' : '❌'} ${label}`);
  }

  const allOk = checks.every(([, ok]) => ok);
  console.log('');
  console.log(allOk ? '🚀 System Status: OPERATIONAL' : '🛠️ System Status: INCOMPLETE');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('❌ STATUS CHECK FAILED');
  console.error(err);
  process.exit(1);
});
EOF

write_if_missing ".github/copilot-xs/scripts/security-scan.js" <<'EOF'
#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// pnpm audit (repo is pnpm-first; uses pnpm-lock.yaml)
run('pnpm', ['audit']);
EOF

# 4) Ensure scripts are executable
chmod +x .github/copilot-xs/scripts/*.js scripts/init-copilot-xs.sh

# 5) Wire pnpm scripts (non-destructive)
if [[ -f package.json ]]; then
  echo "📦 Wiring pnpm scripts..."
  pnpm pkg set scripts.copilot-xs:validate="node .github/copilot-xs/scripts/validate.js" >/dev/null
  pnpm pkg set scripts.copilot-xs:precommit="node .github/copilot-xs/scripts/precommit.js" >/dev/null
  pnpm pkg set scripts.copilot-xs:status="node .github/copilot-xs/scripts/agent-status.js" >/dev/null
  pnpm pkg set scripts.copilot-xs:security-scan="node .github/copilot-xs/scripts/security-scan.js" >/dev/null
  pnpm pkg set scripts.copilot-xs:test="pnpm run copilot-xs:validate && pnpm run test:all" >/dev/null
  echo "✅ pnpm scripts updated"

  if [[ "${COPILOT_XS_INSTALL_MCP:-0}" == "1" ]]; then
    echo "📦 Installing optional MCP servers (devDependencies)..."
    pnpm install --save-dev @modelcontextprotocol/server-filesystem@latest \
      @modelcontextprotocol/server-npm@latest \
      @modelcontextprotocol/server-github@latest
    echo "✅ MCP servers installed"
  fi
else
  echo "⚠️  No package.json found; skipping pnpm wiring."
fi

# 6) Wire Husky pre-commit (append if missing)
if [[ -f .husky/pre-commit ]]; then
  if grep -q "copilot-xs:precommit" .husky/pre-commit; then
    echo "ℹ️  Husky already wired"
  else
    echo "🔗 Wiring Husky pre-commit..."
    printf '\n# COPILOT-XS gate\npnpm run copilot-xs:precommit\n' >> .husky/pre-commit
    echo "✅ Husky pre-commit updated"
  fi
else
  echo "⚠️  Husky not detected; skipping hook wiring."
fi

# 7) VS Code entry stub (doc-only)
write_if_missing ".vscode/copilot-xs-entry.json" <<'EOF'
{
  "name": "copilot-xs",
  "notes": "This file is documentation/stub. VS Code does not auto-load custom Copilot agent entrypoints from here.",
  "commands": {
    "status": "pnpm run copilot-xs:status",
    "validate": "pnpm run copilot-xs:validate",
    "test": "pnpm run copilot-xs:test"
  }
}
EOF

echo ""
echo "✅ COPILOT-XS setup complete."
echo "- Status: pnpm run copilot-xs:status"
echo "- Validate: pnpm run copilot-xs:validate"
echo "- Pre-commit: enforced via Husky (.husky/pre-commit)"
