#!/usr/bin/env bash
set -euo pipefail

PACKAGE="ollama-mcp"
VERSION="2.1.0"
SPEC="${PACKAGE}@${VERSION}"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OUT_DIR="reports/mcp-package-provenance"
JSON_OUT="$OUT_DIR/${PACKAGE}-${VERSION}.json"
MD_OUT="$OUT_DIR/${PACKAGE}-${VERSION}.md"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$OUT_DIR"

run_capture() {
  local key="$1"
  local cmd="$2"
  local out="$TMP_DIR/${key}.txt"

  if bash -lc "$cmd" >"$out" 2>&1; then
    echo "PASS" >"$TMP_DIR/${key}.status"
  else
    echo "FAIL" >"$TMP_DIR/${key}.status"
  fi
}

run_capture "npm_view_primary" "npm view $SPEC name version description license repository homepage dist.integrity dist.tarball time --json || true"
run_capture "npm_view_extra" "npm view $SPEC dependencies bin engines --json || true"
run_capture "npm_pack_dry_run" "npm pack $SPEC --dry-run || true"
run_capture "pnpm_view_primary" "pnpm view $SPEC name version license repository dist.integrity dist.tarball --json || true"

node - "$TMP_DIR" "$JSON_OUT" "$MD_OUT" "$PACKAGE" "$VERSION" "$STAMP" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const [tmpDir, jsonOut, mdOut, pkg, version, stamp] = process.argv.slice(2);

function readFile(name) {
  const file = path.join(tmpDir, `${name}.txt`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : '';
}

function readStatus(name) {
  const file = path.join(tmpDir, `${name}.status`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : 'FAIL';
}

function parseJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const candidate = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

const commands = {
  npm_view_primary: {
    command: `npm view ${pkg}@${version} name version description license repository homepage dist.integrity dist.tarball time --json || true`,
    status: readStatus('npm_view_primary'),
    output: readFile('npm_view_primary'),
  },
  npm_view_extra: {
    command: `npm view ${pkg}@${version} dependencies bin engines --json || true`,
    status: readStatus('npm_view_extra'),
    output: readFile('npm_view_extra'),
  },
  npm_pack_dry_run: {
    command: `npm pack ${pkg}@${version} --dry-run || true`,
    status: readStatus('npm_pack_dry_run'),
    output: readFile('npm_pack_dry_run'),
  },
  pnpm_view_primary: {
    command: `pnpm view ${pkg}@${version} name version license repository dist.integrity dist.tarball --json || true`,
    status: readStatus('pnpm_view_primary'),
    output: readFile('pnpm_view_primary'),
  },
};

const primary = parseJson(commands.npm_view_primary.output) || parseJson(commands.pnpm_view_primary.output) || {};
const extra = parseJson(commands.npm_view_extra.output) || {};
const pnpmPrimary = parseJson(commands.pnpm_view_primary.output) || {};
const integrity = primary['dist.integrity'] || pnpmPrimary['dist.integrity'] || null;
const tarball = primary['dist.tarball'] || pnpmPrimary['dist.tarball'] || null;
const repository = primary.repository || pnpmPrimary.repository || null;
const dependencies = extra.dependencies || null;
const bin = extra.bin || null;
const engines = extra.engines || null;

let verdict = 'PACKAGE_PROVENANCE_BLOCKED';
if (primary.name === pkg && primary.version === version) {
  verdict = integrity && tarball && repository ? 'PACKAGE_PROVENANCE_RECORDED' : 'PACKAGE_PROVENANCE_PARTIAL';
} else if (commands.npm_pack_dry_run.output.includes(`${pkg}-${version}.tgz`)) {
  verdict = 'PACKAGE_PROVENANCE_PARTIAL';
}

const report = {
  package: pkg,
  version,
  timestamp_utc: stamp,
  verdict,
  name: primary.name || null,
  description: primary.description || null,
  license: primary.license || null,
  homepage: primary.homepage || null,
  repository,
  integrity,
  tarball,
  time: primary.time || null,
  dependencies,
  bin,
  engines,
  commands,
};

fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);

const repositoryText =
  repository && typeof repository === 'object'
    ? [repository.type, repository.url].filter(Boolean).join(' ')
    : repository || 'n/a';
const depsText =
  dependencies && typeof dependencies === 'object'
    ? Object.entries(dependencies)
        .map(([name, depVersion]) => `- ${name}: ${depVersion}`)
        .join('\n')
    : '- none reported';
const binText =
  bin && typeof bin === 'object'
    ? Object.entries(bin)
        .map(([name, target]) => `- ${name}: ${target}`)
        .join('\n')
    : '- none reported';
const enginesText =
  engines && typeof engines === 'object'
    ? Object.entries(engines)
        .map(([name, value]) => `- ${name}: ${value}`)
        .join('\n')
    : '- none reported';

const md = `# MCP Package Provenance\n\n- package: ${pkg}\n- version: ${version}\n- timestamp_utc: ${stamp}\n- verdict: ${verdict}\n- license: ${primary.license || 'n/a'}\n- repository: ${repositoryText}\n- homepage: ${primary.homepage || 'n/a'}\n- dist_integrity: ${integrity || 'n/a'}\n- dist_tarball: ${tarball || 'n/a'}\n\n## Bin\n\n${binText}\n\n## Dependencies\n\n${depsText}\n\n## Engines\n\n${enginesText}\n\n## Command outputs\n\n### npm view primary\n\n\`\`\`json\n${commands.npm_view_primary.output || '{}'}\n\`\`\`\n\n### npm view extra\n\n\`\`\`json\n${commands.npm_view_extra.output || '{}'}\n\`\`\`\n\n### pnpm view primary\n\n\`\`\`json\n${commands.pnpm_view_primary.output || '{}'}\n\`\`\`\n\n### npm pack --dry-run\n\n\`\`\`text\n${commands.npm_pack_dry_run.output || ''}\n\`\`\`\n`;

fs.writeFileSync(mdOut, md);
NODE

VERDICT="$(node -e "const fs=require('node:fs');const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(r.verdict)" "$JSON_OUT")"
echo "$VERDICT report=$MD_OUT"
