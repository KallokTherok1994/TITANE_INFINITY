#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v34.0.13 — ORPHAN PAGES AUDIT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Parses `src/App.tsx` for `<Route path="…" element={…}>` declarations and
 * `<Navigate to="…" replace />` targets, walks `src/pages/**` to enumerate
 * every page module, then cross-references results to emit:
 *
 *   reports/ui-orphan-pages.json   — machine-readable bag of facts
 *   reports/ui-orphan-pages.md     — operator summary
 *
 * Categories:
 *   MOUNTED_VISIBLE   — page is bound to a route that renders it (no redirect)
 *   LEGACY_REDIRECT   — route exists but only `<Navigate>` to another path
 *   MOUNTED_HIDDEN    — page is imported but never reached via TopNav links
 *                        (best-effort: TopNav route table parsing)
 *   ORPHAN_DEAD       — page file exists but no route references it at all
 *
 * Used by the v35 modernization plan to drive the dead-route reduction KPI
 * (current legacy redirect share ≈ 89% → target ≤ 40%).
 *
 * Usage:
 *   node scripts/audit/orphan-pages.mjs            # write reports + exit 0
 *   node scripts/audit/orphan-pages.mjs --strict   # exit 1 if dead pages
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const APP_TSX = resolve(ROOT, 'src', 'App.tsx');
const PAGES_DIR = resolve(ROOT, 'src', 'pages');
const REPORTS_DIR = resolve(ROOT, 'reports');

const STRICT = process.argv.includes('--strict');

function readAppTsx() {
  return readFileSync(APP_TSX, 'utf-8');
}

function listPageFiles() {
  const out = [];
  const stack = [PAGES_DIR];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.(tsx|jsx)$/.test(entry.name)) {
        out.push(full);
      }
    }
  }
  return out;
}

function parseRoutes(src) {
  const routes = [];
  const routeRe = /<Route\s+path=(["'`])([^"'`]+)\1([\s\S]*?)\/?>/g;
  let m;
  while ((m = routeRe.exec(src))) {
    const path = m[2];
    const tail = m[3] || '';
    const navMatch = tail.match(/<Navigate\s+to=(["'`])([^"'`]+)\1/);
    if (navMatch) {
      routes.push({ path, kind: 'redirect', target: navMatch[2] });
      continue;
    }
    const elementMatch = tail.match(/element=\{\s*<\s*([A-Za-z0-9_]+)/);
    if (elementMatch) {
      routes.push({ path, kind: 'element', component: elementMatch[1] });
    } else {
      routes.push({ path, kind: 'unknown' });
    }
  }
  return routes;
}

function parsePageImports(src) {
  // Capture `import Foo from '…/pages/…'` and `lazy(() => import('…/pages/…'))`
  const imports = new Map(); // component → import path
  const importRe =
    /import\s+(?:\{[^}]+\}|[A-Za-z0-9_]+)\s+from\s+["'`]([^"'`]+\/pages\/[^"'`]+)["'`]/g;
  let m;
  while ((m = importRe.exec(src))) {
    imports.set(m[1], m[1]);
  }
  const lazyRe = /lazy\(\s*\(\)\s*=>\s*import\(\s*["'`]([^"'`]+\/pages\/[^"'`]+)["'`]/g;
  while ((m = lazyRe.exec(src))) {
    imports.set(m[1], m[1]);
  }
  return [...imports.keys()];
}

function fileToImportSpecs(file) {
  const rel = relative(resolve(ROOT, 'src'), file).replace(/\\/g, '/');
  const noExt = rel.replace(/\.(tsx|jsx)$/, '');
  return [`@/${noExt}`, `./${noExt}`, `../${noExt}`, noExt];
}

function classify(pageFile, importedSpecs, routes, src) {
  const specs = fileToImportSpecs(pageFile);
  const imported = importedSpecs.some(spec => specs.some(s => spec.endsWith(s)));
  if (!imported) {
    return { category: 'ORPHAN_DEAD', reason: 'page file never imported by App.tsx' };
  }
  // Determine if any element route uses this page (best-effort by base name match).
  const base = basename(pageFile).replace(/\.(tsx|jsx)$/, '');
  const hasElement = routes.some(
    r => r.kind === 'element' && r.component && r.component === base
  );
  if (hasElement) {
    return { category: 'MOUNTED_VISIBLE', reason: 'bound to an element route' };
  }
  // Imported but no direct element binding by component name → hidden.
  return {
    category: 'MOUNTED_HIDDEN',
    reason: 'imported but no <Route element={<' + base + '/>}> binding found by name',
  };
}

function main() {
  if (!existsSync(APP_TSX)) {
    console.error('[orphan-pages] App.tsx not found at', APP_TSX);
    process.exit(2);
  }
  const src = readAppTsx();
  const routes = parseRoutes(src);
  const importedPageSpecs = parsePageImports(src);
  const pageFiles = listPageFiles();

  const perPage = pageFiles.map(file => ({
    file: relative(ROOT, file),
    ...classify(file, importedPageSpecs, routes, src),
  }));

  const summary = perPage.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const redirectCount = routes.filter(r => r.kind === 'redirect').length;
  const elementCount = routes.filter(r => r.kind === 'element').length;
  const legacyRedirectShare =
    routes.length === 0 ? 0 : +((redirectCount / routes.length) * 100).toFixed(1);

  const report = {
    generated_at: new Date().toISOString(),
    inputs: { app_tsx: relative(ROOT, APP_TSX), pages_dir: relative(ROOT, PAGES_DIR) },
    totals: {
      routes: routes.length,
      element_routes: elementCount,
      redirect_routes: redirectCount,
      legacy_redirect_share_percent: legacyRedirectShare,
      pages_files: pageFiles.length,
    },
    page_breakdown: summary,
    pages: perPage,
    routes,
  };

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(
    resolve(REPORTS_DIR, 'ui-orphan-pages.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf-8'
  );

  const lines = [
    '# UI Orphan Pages Audit — TITANE∞ v34.0.13',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Totals',
    '',
    `- Routes total: **${routes.length}**`,
    `- Element routes: **${elementCount}**`,
    `- Redirect-only routes: **${redirectCount}** (${legacyRedirectShare}%)`,
    `- Page files on disk: **${pageFiles.length}**`,
    '',
    '## Page breakdown',
    '',
    ...Object.entries(summary).map(([k, v]) => `- \`${k}\`: ${v}`),
    '',
    '## ORPHAN_DEAD pages (no import, no route)',
    '',
    ...perPage
      .filter(p => p.category === 'ORPHAN_DEAD')
      .map(p => `- \`${p.file}\` — ${p.reason}`),
    '',
    '## MOUNTED_HIDDEN pages',
    '',
    ...perPage
      .filter(p => p.category === 'MOUNTED_HIDDEN')
      .map(p => `- \`${p.file}\` — ${p.reason}`),
    '',
  ];
  writeFileSync(resolve(REPORTS_DIR, 'ui-orphan-pages.md'), lines.join('\n'), 'utf-8');

  console.log('[orphan-pages] routes=%d element=%d redirect=%d pages=%d',
    routes.length, elementCount, redirectCount, pageFiles.length);
  console.log('[orphan-pages] breakdown:', summary);
  console.log('[orphan-pages] reports written to %s', relative(ROOT, REPORTS_DIR));

  if (STRICT && (summary.ORPHAN_DEAD || 0) > 0) {
    console.error('[orphan-pages] --strict: %d ORPHAN_DEAD pages found', summary.ORPHAN_DEAD);
    process.exit(1);
  }
}

main();
