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
 *   REUSED_EMBEDDED   — page file is reused by another mounted surface or
 *                        compatibility export, but is not routed directly
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
import { resolve, relative, basename, dirname } from 'node:path';
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
        if (entry.name === '__tests__' || entry.name === 'tabs') {
          continue;
        }
        stack.push(full);
      } else if (/\.(tsx|jsx)$/.test(entry.name)) {
        const rel = relative(PAGES_DIR, full).replace(/\\/g, '/');
        const segments = rel.split('/');
        const isTopLevelPage = segments.length === 1;
        const isNestedIndexEntry = entry.name === 'index.tsx' || entry.name === 'index.jsx';
        if (isTopLevelPage || isNestedIndexEntry) {
          out.push(full);
        }
      }
    }
  }
  return out;
}

function listSourceFiles() {
  const srcDir = resolve(ROOT, 'src');
  const out = [];
  const stack = [srcDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '__tests__') {
          continue;
        }
        stack.push(full);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          continue;
        }
        out.push(full);
      }
    }
  }
  return out;
}

function parseRoutes(src) {
  const routes = [];
  let cursor = 0;

  while (true) {
    const start = src.indexOf('<Route', cursor);
    if (start === -1) {
      break;
    }

    let i = start;
    let braceDepth = 0;
    let quote = null;
    while (i < src.length) {
      const char = src[i];
      const next = src[i + 1];

      if (quote) {
        if (char === quote && src[i - 1] !== '\\') {
          quote = null;
        }
        i += 1;
        continue;
      }

      if (char === '"' || char === '\'' || char === '`') {
        quote = char;
        i += 1;
        continue;
      }

      if (char === '{') {
        braceDepth += 1;
        i += 1;
        continue;
      }

      if (char === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        i += 1;
        continue;
      }

      if (char === '/' && next === '>' && braceDepth === 0) {
        i += 2;
        break;
      }

      i += 1;
    }

    const block = src.slice(start, i);
    cursor = i;

    const pathMatch = block.match(/path=(["'`])([^"'`]+)\1/);
    if (!pathMatch) {
      continue;
    }

    const path = pathMatch[2];
    const navMatch = block.match(/<Navigate\s+to=(["'`])([^"'`]+)\1/);
    if (navMatch) {
      routes.push({ path, kind: 'redirect', target: navMatch[2] });
      continue;
    }

    const wrapperComponents = new Set(['Route', 'ErrorBoundary', 'Suspense']);
    const tagMatches = [...block.matchAll(/<\s*([A-Z][A-Za-z0-9_]*)\b/g)]
      .map(match => match[1])
      .filter(component => !wrapperComponents.has(component));

    if (tagMatches.length > 0) {
      routes.push({ path, kind: 'element', component: tagMatches.at(-1) });
    } else {
      routes.push({ path, kind: 'unknown' });
    }
  }

  return routes;
}

function parsePageImports(src) {
  // Capture static imports and wrapped dynamic imports. Page matching happens later
  // against normalized file specs, so we can keep extraction generic here.
  const imports = new Map(); // component → import path
  const importRe =
    /import\s+(?:\{[^}]+\}|[A-Za-z0-9_*,\s]+)\s+from\s+["'`]([^"'`]+)["'`]/g;
  const exportRe =
    /export\s+(?:\{[^}]+\}|\*)\s+from\s+["'`]([^"'`]+)["'`]/g;
  let m;
  while ((m = importRe.exec(src))) {
    imports.set(m[1], m[1]);
  }
  while ((m = exportRe.exec(src))) {
    imports.set(m[1], m[1]);
  }

  // Support the repo's wrapped lazy loaders, e.g. lazyWithRetry/lazyWithTimeout.
  const wrappedDynamicImportRe =
    /[A-Za-z0-9_]+\s*\(\s*\(\)\s*=>\s*import\(\s*["'`]([^"'`]+)["'`]/g;
  while ((m = wrappedDynamicImportRe.exec(src))) {
    imports.set(m[1], m[1]);
  }
  return [...imports.keys()];
}

function normalizeImportSpec(spec, consumerFile) {
  if (!spec) {
    return null;
  }

  const trimmed = spec.replace(/\.(tsx|jsx|ts|js)$/, '');
  if (trimmed.startsWith('@/')) {
    return trimmed.slice(2);
  }

  if (trimmed.startsWith('.')) {
    return relative(resolve(ROOT, 'src'), resolve(dirname(consumerFile), trimmed)).replace(
      /\\/g,
      '/'
    );
  }

  return trimmed.replace(/^src\//, '').replace(/^\//, '');
}

function parseAppPageBindings(src) {
  const bindings = new Map();

  const addBinding = (componentName, importSpec) => {
    const normalizedSpec = normalizeImportSpec(importSpec, APP_TSX);
    if (!componentName || !normalizedSpec || !normalizedSpec.startsWith('pages/')) {
      return;
    }
    bindings.set(componentName, normalizedSpec);
  };

  const defaultImportRe = /import\s+([A-Za-z0-9_]+)\s+from\s+["'`]([^"'`]+)["'`]/g;
  const namedImportRe = /import\s+\{([^}]+)\}\s+from\s+["'`]([^"'`]+)["'`]/g;
  const lazyBindingRe =
    /const\s+([A-Za-z0-9_]+)\s*=\s*[A-Za-z0-9_]+\s*\(\s*\(\)\s*=>\s*import\(\s*["'`]([^"'`]+)["'`]/gs;

  let m;
  while ((m = defaultImportRe.exec(src))) {
    addBinding(m[1], m[2]);
  }

  while ((m = namedImportRe.exec(src))) {
    for (const rawPart of m[1].split(',')) {
      const part = rawPart.trim();
      if (!part) {
        continue;
      }
      const aliased = part.split(/\s+as\s+/i).map(token => token.trim());
      addBinding(aliased.at(-1), m[2]);
    }
  }

  while ((m = lazyBindingRe.exec(src))) {
    addBinding(m[1], m[2]);
  }

  return bindings;
}

function collectPageConsumers() {
  const consumers = new Map();
  const sourceFiles = listSourceFiles();

  for (const file of sourceFiles) {
    if (file === APP_TSX) {
      continue;
    }

    const src = readFileSync(file, 'utf-8');
    const importSpecs = parsePageImports(src);
    if (importSpecs.length === 0) {
      continue;
    }

    const consumer = relative(ROOT, file).replace(/\\/g, '/');
    for (const spec of importSpecs) {
      const normalizedSpec = normalizeImportSpec(spec, file);
      if (!normalizedSpec || !normalizedSpec.startsWith('pages/')) {
        continue;
      }

      const bucket = consumers.get(normalizedSpec) ?? new Set();
      bucket.add(consumer);
      consumers.set(normalizedSpec, bucket);
    }
  }

  return consumers;
}

function fileToImportSpecs(file) {
  const rel = relative(resolve(ROOT, 'src'), file).replace(/\\/g, '/');
  const noExt = rel.replace(/\.(tsx|jsx)$/, '');
  if (noExt.endsWith('/index')) {
    return [noExt, noExt.slice(0, -'/index'.length)];
  }
  return [noExt];
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function routeAliasesForPage(pageFile) {
  const base = basename(pageFile).replace(/\.(tsx|jsx)$/, '');
  const kebab = toKebabCase(base);
  const aliases = new Set([`/${kebab}`]);

  for (const suffix of ['-page', '-layout']) {
    if (kebab.endsWith(suffix)) {
      aliases.add(`/${kebab.slice(0, -suffix.length)}`);
    }
  }

  return [...aliases];
}

function countComponentTagUsage(src, componentName) {
  const pattern = new RegExp(`<\\s*${componentName}\\b`, 'g');
  return [...src.matchAll(pattern)].length;
}

function classify(pageFile, importedSpecs, embeddedConsumers, routes, appBindings, src) {
  const specs = fileToImportSpecs(pageFile);
  const matchingBindings = [...appBindings.entries()]
    .filter(([, spec]) => specs.includes(spec))
    .map(([component]) => component);
  const imported = importedSpecs.some(spec => specs.includes(spec));
  if (!imported) {
    const reusedBy = [...embeddedConsumers.entries()]
      .filter(([spec]) => specs.includes(spec))
      .flatMap(([, consumers]) => [...consumers]);

    if (reusedBy.length > 0) {
      return {
        category: 'REUSED_EMBEDDED',
        reason: `page file reused by ${reusedBy.sort().join(', ')}`,
      };
    }

    const redirectAliases = routeAliasesForPage(pageFile);
    const redirectRoute = routes.find(
      route => route.kind === 'redirect' && redirectAliases.includes(route.path)
    );
    if (redirectRoute) {
      return {
        category: 'LEGACY_REDIRECT',
        reason: `legacy route ${redirectRoute.path} redirects to ${redirectRoute.target}`,
      };
    }

    return { category: 'ORPHAN_DEAD', reason: 'page file never imported by App.tsx' };
  }
  // Determine if any element route uses this page (best-effort by base name match).
  const hasElement = routes.some(
    r => r.kind === 'element' && r.component && matchingBindings.includes(r.component)
  );
  if (hasElement) {
    return { category: 'MOUNTED_VISIBLE', reason: 'bound to an element route' };
  }

  const wrapperBindings = matchingBindings.filter(component => countComponentTagUsage(src, component) > 0);
  if (wrapperBindings.length > 0) {
    return {
      category: 'REUSED_EMBEDDED',
      reason: `page file reused by App.tsx via ${wrapperBindings.join(', ')}`,
    };
  }

  // Imported but no direct element binding by component name → hidden.
  return {
    category: 'MOUNTED_HIDDEN',
    reason: 'imported by App.tsx but no direct route element binding resolved',
  };
}

function main() {
  if (!existsSync(APP_TSX)) {
    console.error('[orphan-pages] App.tsx not found at', APP_TSX);
    process.exit(2);
  }
  const src = readAppTsx();
  const routes = parseRoutes(src);
  const appBindings = parseAppPageBindings(src);
  const importedPageSpecs = parsePageImports(src)
    .map(spec => normalizeImportSpec(spec, APP_TSX))
    .filter(Boolean);
  const embeddedConsumers = collectPageConsumers();
  const pageFiles = listPageFiles();

  const perPage = pageFiles.map(file => ({
    file: relative(ROOT, file),
    ...classify(file, importedPageSpecs, embeddedConsumers, routes, appBindings, src),
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
    '## REUSED_EMBEDDED pages',
    '',
    ...perPage
      .filter(p => p.category === 'REUSED_EMBEDDED')
      .map(p => `- \`${p.file}\` — ${p.reason}`),
    '',
    '## LEGACY_REDIRECT pages',
    '',
    ...perPage
      .filter(p => p.category === 'LEGACY_REDIRECT')
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
