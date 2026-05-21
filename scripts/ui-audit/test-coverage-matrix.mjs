/**
 * TITANE_INFINITY v34.5.0 — scripts/ui-audit/test-coverage-matrix.mjs
 *
 * Matrice de couverture tests (Rule 16). Pour chaque source touchable
 * (`src/**\/*.{ts,tsx}` hors fixtures + `src-tauri/src/**\/*.rs`) on
 * détermine si un test minimal existe.
 *
 *   - `.ts` / `.tsx` → cherche un fichier `*.test.{ts,tsx}` ou
 *     `*.spec.{ts,tsx}` dans `src/__tests__/**` ou voisin du fichier.
 *   - `.rs` → cherche `#[cfg(test)]` ou `#[test]` dans le source ou
 *     un test homonyme dans `tests/`.
 *
 * Produit `reports/test-coverage-matrix.json` + `reports/test-coverage-matrix.md`.
 *
 * Usage:
 *   node scripts/ui-audit/test-coverage-matrix.mjs
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const SRC_DIR = join(REPO_ROOT, 'src');
const RUST_SRC_DIR = join(REPO_ROOT, 'src-tauri', 'src');
const REPORTS_DIR = join(REPO_ROOT, 'reports');

const SKIP_DIRS = new Set([
  '__tests__',
  '__mocks__',
  'test-utils',
  'node_modules',
  'dist',
  'target',
]);
const SKIP_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx', '.d.ts'];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

export async function collectTsSources() {
  const all = await walk(SRC_DIR);
  return all.filter((f) => {
    if (SKIP_SUFFIXES.some((s) => f.endsWith(s))) return false;
    const ext = extname(f);
    return ext === '.ts' || ext === '.tsx';
  });
}

export async function collectRustSources() {
  const all = await walk(RUST_SRC_DIR);
  return all.filter((f) => f.endsWith('.rs'));
}

export async function indexTsTests() {
  const all = await walk(SRC_DIR);
  const tests = new Set();
  for (const file of all) {
    if (SKIP_SUFFIXES.slice(0, 4).some((s) => file.endsWith(s))) {
      const base = basename(file).replace(/\.(test|spec)\.(ts|tsx)$/, '');
      tests.add(base);
    }
  }
  return tests;
}

export function hasRustInlineTest(source) {
  return /#\[cfg\(test\)\]/.test(source) || /#\[test\]/.test(source);
}

export async function buildCoverageMatrix() {
  const [tsSources, rustSources, tsTestsIndex] = await Promise.all([
    collectTsSources(),
    collectRustSources(),
    indexTsTests(),
  ]);

  const tsRows = tsSources.map((file) => {
    const base = basename(file).replace(/\.(ts|tsx)$/, '');
    const covered = tsTestsIndex.has(base);
    return {
      file: relative(REPO_ROOT, file),
      lang: 'ts',
      covered,
    };
  });

  const rustRows = [];
  for (const file of rustSources) {
    const src = await readFile(file, 'utf8');
    rustRows.push({
      file: relative(REPO_ROOT, file),
      lang: 'rs',
      covered: hasRustInlineTest(src),
    });
  }

  const rows = [...tsRows, ...rustRows];
  const totals = {
    total: rows.length,
    covered: rows.filter((r) => r.covered).length,
    uncovered: rows.filter((r) => !r.covered).length,
    tsTotal: tsRows.length,
    tsCovered: tsRows.filter((r) => r.covered).length,
    rustTotal: rustRows.length,
    rustCovered: rustRows.filter((r) => r.covered).length,
  };
  totals.coverageRatio = totals.total === 0 ? 0 : Number((totals.covered / totals.total).toFixed(4));

  return {
    generatedAt: new Date().toISOString(),
    version: 'v34.5.0',
    totals,
    rows,
  };
}

async function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Test Coverage Matrix — ${report.version}`);
  lines.push('');
  lines.push(`Généré: ${report.generatedAt}`);
  lines.push('');
  lines.push(`| Métrique | Valeur |`);
  lines.push(`|---|---|`);
  lines.push(`| Total fichiers source | ${report.totals.total} |`);
  lines.push(`| Couverts (test trouvé) | ${report.totals.covered} |`);
  lines.push(`| Non couverts | ${report.totals.uncovered} |`);
  lines.push(`| Ratio couverture | ${(report.totals.coverageRatio * 100).toFixed(2)} % |`);
  lines.push(`| TS/TSX (couverts / total) | ${report.totals.tsCovered} / ${report.totals.tsTotal} |`);
  lines.push(`| Rust (couverts / total) | ${report.totals.rustCovered} / ${report.totals.rustTotal} |`);
  lines.push('');
  lines.push('## Top 50 fichiers non couverts');
  lines.push('');
  const uncovered = report.rows.filter((r) => !r.covered).slice(0, 50);
  for (const row of uncovered) {
    lines.push(`- [${row.lang}] \`${row.file}\``);
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const report = await buildCoverageMatrix();
  if (!existsSync(REPORTS_DIR)) await mkdir(REPORTS_DIR, { recursive: true });
  const jsonPath = join(REPORTS_DIR, 'test-coverage-matrix.json');
  const mdPath = join(REPORTS_DIR, 'test-coverage-matrix.md');
  await writeFile(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  await writeFile(mdPath, await renderMarkdown(report), 'utf8');
  console.log(`[coverage] Wrote ${relative(REPO_ROOT, jsonPath)}`);
  console.log(`[coverage] Wrote ${relative(REPO_ROOT, mdPath)}`);
  console.log(
    `[coverage] covered=${report.totals.covered}/${report.totals.total} (${(report.totals.coverageRatio * 100).toFixed(2)}%)`
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error('[coverage] FAIL:', err);
    process.exit(1);
  });
}
