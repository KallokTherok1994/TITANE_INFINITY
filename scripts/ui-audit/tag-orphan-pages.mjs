#!/usr/bin/env node
/**
 * TITANE_INFINITY v34.5.0 — scripts/ui-audit/tag-orphan-pages.mjs
 *
 * Audit des pages `src/pages/*.tsx` croisé avec les routes actives
 * déclarées dans `src/App.tsx`. Produit `reports/ui-orphan-pages.json`
 * et `reports/ui-orphan-pages.md`.
 *
 * Catégories:
 *   - LIVE         : importée + rendue comme `element={<XxxPage />}`
 *   - ALIAS        : importée mais uniquement utilisée comme cible Navigate
 *   - ORPHAN_DEAD  : non importée par App.tsx (candidat suppression)
 *
 * Drapeau `--apply` : ajoute en-tête `@deprecated /* UI_DEAD v34.5 *\/`
 * aux fichiers ORPHAN_DEAD (mode dry-run par défaut, n'écrit rien).
 *
 * Usage:
 *   node scripts/ui-audit/tag-orphan-pages.mjs
 *   node scripts/ui-audit/tag-orphan-pages.mjs --apply
 *
 * Mapping (Rule 15): UI_SURFACE_MAP.md + docs/CARTOGRAPHY_COMPLETE.md.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const PAGES_DIR = join(REPO_ROOT, 'src', 'pages');
const APP_TSX = join(REPO_ROOT, 'src', 'App.tsx');
const REPORTS_DIR = join(REPO_ROOT, 'reports');

export async function listPageFiles(pagesDir = PAGES_DIR) {
  const entries = await readdir(pagesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.tsx'))
    .map((e) => join(pagesDir, e.name));
}

export function extractImports(appSource) {
  const imports = new Map();
  const addEntry = (specifier, ident) => {
    const segs = specifier.split('/');
    const filename = segs[segs.length - 1].replace(/\.(tsx?)$/, '') + '.tsx';
    const list = imports.get(filename) || [];
    if (ident && !list.includes(ident)) list.push(ident);
    imports.set(filename, list);
  };

  // Pattern 1: static `import X from './pages/X'` / `import { X } from './pages/X'`
  const staticRe = /import\s+([^'";]+?)\s+from\s+['"]((?:\.\/|@\/)(?:pages|ui\/pages)\/[^'"]+)['"]/g;
  let m;
  while ((m = staticRe.exec(appSource)) !== null) {
    const lhs = m[1].trim();
    const spec = m[2];
    const idents = [];
    if (lhs.startsWith('{')) {
      lhs.slice(1, -1).split(',').forEach((n) => {
        const cleaned = n.trim().split(/\s+as\s+/).pop().trim();
        if (cleaned) idents.push(cleaned);
      });
    } else if (lhs.startsWith('* as ')) {
      idents.push(lhs.replace('* as ', '').trim());
    } else {
      const parts = lhs.split(',').map((s) => s.trim());
      idents.push(parts[0]);
      if (parts[1] && parts[1].startsWith('{')) {
        parts[1].slice(1, -1).split(',').forEach((n) => idents.push(n.trim()));
      }
    }
    for (const id of idents) addEntry(spec, id);
  }

  // Pattern 2a: `const X = <anyFn>(() => import('./pages/X')...)` covers lazy / lazyWithTimeout / lazyWithRetry / React.lazy.
  const lazyAssignRe = /const\s+(\w+)\s*=\s*(?:[\w$.]+\s*\(\s*)+\(\)\s*=>\s*import\(\s*['"]((?:\.\/|@\/)(?:pages|ui\/pages)\/[^'"]+)['"]/g;
  while ((m = lazyAssignRe.exec(appSource)) !== null) {
    addEntry(m[2], m[1].trim());
  }

  // Pattern 2b: catch-all dynamic `import('./pages/X')` to ensure file is registered even without const binding.
  const dynRe = /import\(\s*['"]((?:\.\/|@\/)(?:pages|ui\/pages)\/[^'"]+)['"]/g;
  while ((m = dynRe.exec(appSource)) !== null) {
    addEntry(m[1], '');
  }

  return imports;
}

export function classifyIdentifiers(appSource, identifiers) {
  const result = { live: new Set(), aliasOnly: new Set() };
  for (const ident of identifiers) {
    // LIVE if used as JSX tag anywhere (covers <X />, <X ...>, <X></X>, even wrapped in Suspense/ErrorBoundary).
    const jsxRe = new RegExp(`<${ident}(?:\\s|/|>)`);
    if (jsxRe.test(appSource)) {
      result.live.add(ident);
    } else if (appSource.includes(ident)) {
      result.aliasOnly.add(ident);
    }
  }
  return result;
}

export async function buildAuditReport({ pagesDir = PAGES_DIR, appTsxPath = APP_TSX } = {}) {
  const [pageFiles, appSource] = await Promise.all([
    listPageFiles(pagesDir),
    readFile(appTsxPath, 'utf8'),
  ]);
  const imports = extractImports(appSource);
  const allIdentifiers = Array.from(imports.values()).flat();
  const { live, aliasOnly } = classifyIdentifiers(appSource, allIdentifiers);

  const pages = pageFiles.map((file) => {
    const filename = basename(file);
    const idents = imports.get(filename) || null;
    const baseName = filename.replace(/\.tsx$/, '');
    let category = 'ORPHAN_DEAD';
    if (idents !== null) {
      const candidates = idents.length > 0 ? idents : [baseName];
      const jsxRe = new RegExp(`<${baseName}(?:\\s|/|>)`);
      if (candidates.some((id) => live.has(id)) || jsxRe.test(appSource)) {
        category = 'LIVE';
      } else {
        category = 'ALIAS';
      }
    }
    return {
      file: relative(REPO_ROOT, file),
      identifiers: idents || [],
      category,
    };
  });

  const summary = pages.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    { LIVE: 0, ALIAS: 0, ORPHAN_DEAD: 0 }
  );

  return {
    generatedAt: new Date().toISOString(),
    version: 'v34.5.0',
    totals: { ...summary, total: pages.length },
    pages,
  };
}

async function tagOrphanFile(filePath) {
  const src = await readFile(filePath, 'utf8');
  if (src.includes('@deprecated') && src.includes('UI_DEAD')) return false;
  const header = `/**\n * @deprecated UI_DEAD v34.5 — page orpheline détectée par scripts/ui-audit/tag-orphan-pages.mjs.\n * Suppression différée (>30j observation). Voir reports/ui-orphan-pages.md.\n */\n`;
  await writeFile(filePath, header + src, 'utf8');
  return true;
}

async function renderMarkdown(report) {
  const lines = [];
  lines.push(`# UI Orphan Pages Report — ${report.version}`);
  lines.push('');
  lines.push(`Généré: ${report.generatedAt}`);
  lines.push('');
  lines.push(`| Catégorie | Total |`);
  lines.push(`|---|---|`);
  lines.push(`| LIVE | ${report.totals.LIVE} |`);
  lines.push(`| ALIAS | ${report.totals.ALIAS} |`);
  lines.push(`| ORPHAN_DEAD | ${report.totals.ORPHAN_DEAD} |`);
  lines.push(`| **TOTAL** | **${report.totals.total}** |`);
  lines.push('');
  for (const cat of ['ORPHAN_DEAD', 'ALIAS', 'LIVE']) {
    const rows = report.pages.filter((p) => p.category === cat);
    if (rows.length === 0) continue;
    lines.push(`## ${cat} (${rows.length})`);
    lines.push('');
    for (const row of rows) {
      const ids = row.identifiers.length ? row.identifiers.join(', ') : '—';
      lines.push(`- \`${row.file}\` (exports: ${ids})`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const apply = process.argv.includes('--apply');
  const report = await buildAuditReport();

  if (!existsSync(REPORTS_DIR)) await mkdir(REPORTS_DIR, { recursive: true });
  const jsonPath = join(REPORTS_DIR, 'ui-orphan-pages.json');
  const mdPath = join(REPORTS_DIR, 'ui-orphan-pages.md');
  await writeFile(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  await writeFile(mdPath, await renderMarkdown(report), 'utf8');

  console.log(`[ui-audit] Wrote ${relative(REPO_ROOT, jsonPath)}`);
  console.log(`[ui-audit] Wrote ${relative(REPO_ROOT, mdPath)}`);
  console.log(`[ui-audit] LIVE=${report.totals.LIVE} ALIAS=${report.totals.ALIAS} ORPHAN_DEAD=${report.totals.ORPHAN_DEAD}`);

  if (apply) {
    let tagged = 0;
    for (const page of report.pages) {
      if (page.category !== 'ORPHAN_DEAD') continue;
      const abs = join(REPO_ROOT, page.file);
      if (await tagOrphanFile(abs)) tagged += 1;
    }
    console.log(`[ui-audit] Tagged ${tagged} ORPHAN_DEAD file(s) with @deprecated header.`);
  } else {
    console.log('[ui-audit] Dry-run (no files mutated). Use --apply to tag ORPHAN_DEAD pages.');
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error('[ui-audit] FAIL:', err);
    process.exit(1);
  });
}
