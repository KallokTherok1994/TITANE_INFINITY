/**
 * TITANE_INFINITY v34.5.0 — scripts/ui-audit/tag-orphan-pages.test.ts
 *
 * Couverture Vitest pour le script d'audit des pages orphelines.
 * Rule 16 — tests obligatoires pour tout nouveau script source.
 */
import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  extractImports,
  classifyIdentifiers,
  listPageFiles,
  buildAuditReport,
} from '../../../scripts/ui-audit/tag-orphan-pages.mjs';

describe('tag-orphan-pages — extractImports', () => {
  it('détecte les imports statiques classiques', () => {
    const source = `import { Foo } from './pages/Foo';\nimport Bar from './pages/Bar';`;
    const imports = extractImports(source);
    expect(imports.get('Foo.tsx')).toEqual(['Foo']);
    expect(imports.get('Bar.tsx')).toEqual(['Bar']);
  });

  it('détecte les lazy / lazyWithTimeout avec wrapper multiligne', () => {
    const source = [
      'const TitanePage = lazyWithTimeout(',
      "  () => import('./pages/TitanePage').then(m => ({ default: m.TitanePage })),",
      '  { ms: 8000 }',
      ');',
      "const DevPage = lazy(() => import('./pages/DevPage').then(m => ({ default: m.DevPage })));",
    ].join('\n');
    const imports = extractImports(source);
    expect(imports.get('TitanePage.tsx')).toContain('TitanePage');
    expect(imports.get('DevPage.tsx')).toContain('DevPage');
  });

  it('ignore les imports hors pages/', () => {
    const source = `import { Foo } from './components/Foo';\nimport { Bar } from '@/lib/Bar';`;
    const imports = extractImports(source);
    expect(imports.size).toBe(0);
  });
});

describe('tag-orphan-pages — classifyIdentifiers', () => {
  it('classe LIVE quand le JSX <X /> est présent même via wrapper', () => {
    const source = `<ErrorBoundary><Suspense><TitanePage /></Suspense></ErrorBoundary>`;
    const { live } = classifyIdentifiers(source, ['TitanePage', 'GhostPage']);
    expect(live.has('TitanePage')).toBe(true);
    expect(live.has('GhostPage')).toBe(false);
  });

  it('classe ALIAS quand identifiant cité mais sans tag JSX', () => {
    const source = `// label: 'TitanePage'`;
    const { live, aliasOnly } = classifyIdentifiers(source, ['TitanePage']);
    expect(live.has('TitanePage')).toBe(false);
    expect(aliasOnly.has('TitanePage')).toBe(true);
  });
});

describe('tag-orphan-pages — buildAuditReport sur fixture isolée', () => {
  it('produit un rapport cohérent LIVE / ORPHAN_DEAD', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'titane-ui-audit-'));
    try {
      const pagesDir = join(dir, 'pages');
      await mkdir(pagesDir, { recursive: true });
      await writeFile(
        join(pagesDir, 'AlphaPage.tsx'),
        'export const AlphaPage = () => null;'
      );
      await writeFile(
        join(pagesDir, 'OrphanPage.tsx'),
        'export const OrphanPage = () => null;'
      );
      const appPath = join(dir, 'App.tsx');
      await writeFile(
        appPath,
        `const AlphaPage = lazy(() => import('./pages/AlphaPage'));\n<AlphaPage />`
      );
      const report = await buildAuditReport({ pagesDir, appTsxPath: appPath });
      const alpha = report.pages.find(p => p.file.endsWith('AlphaPage.tsx'));
      const orphan = report.pages.find(p => p.file.endsWith('OrphanPage.tsx'));
      expect(alpha?.category).toBe('LIVE');
      expect(orphan?.category).toBe('ORPHAN_DEAD');
      expect(report.totals.total).toBe(2);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('tag-orphan-pages — listPageFiles sur fixture', () => {
  it('liste uniquement les .tsx', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'titane-ui-audit-list-'));
    try {
      await writeFile(join(dir, 'Page.tsx'), '');
      await writeFile(join(dir, 'helper.ts'), '');
      await writeFile(join(dir, 'README.md'), '');
      const files = await listPageFiles(dir);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/Page\.tsx$/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
