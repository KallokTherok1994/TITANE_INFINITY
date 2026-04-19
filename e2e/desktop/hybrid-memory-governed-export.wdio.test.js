import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPORT_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR || './reports/e2e-desktop';
const REPORT_FILE = path.join(REPORT_DIR, 'hybrid-memory-governed-export-report.json');

const report = {
  suite: 'hybrid-memory-governed-export',
  timestamp: new Date().toISOString(),
  checks: [],
};

function recordCheck(name, ok, details = {}) {
  report.checks.push({
    name,
    ok,
    details,
    at: new Date().toISOString(),
  });
}

function saveReport() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

function getExpectedAppDataRoot() {
  const xdgDataHome = process.env.XDG_DATA_HOME;
  const home = process.env.HOME || process.cwd();
  const baseDir = xdgDataHome || path.join(home, '.local', 'share');
  return path.join(baseDir, 'com.titane.infinity');
}

async function ensureTauriPageLoaded() {
  const candidates = [
    process.env.TITANE_E2E_URL || 'tauri://localhost/#/titane?tab=memory',
    'tauri://localhost/titane?tab=memory',
    'tauri://localhost/#/titane?tab=memory',
    'tauri://localhost/#/titane',
    'tauri://localhost/titane',
    'tauri://localhost',
  ];

  for (const url of candidates) {
    await browser.url(url).catch(() => {});
    await browser.pause(1200);
    const loaded = await browser.execute(() => {
      const href = window.location.href || '';
      const ready =
        document.readyState === 'interactive' || document.readyState === 'complete';
      return ready && href.startsWith('tauri://localhost');
    });
    if (loaded) {
      return true;
    }
  }

  return false;
}

async function closeBootBeaconIfPresent() {
  const selectors = [
    '#titane-boot-beacon button',
    '//*[@id="titane-boot-beacon"]//button[contains(normalize-space(.),"Fermer diagnostic")]',
  ];

  for (const selector of selectors) {
    const element = selector.startsWith('//') ? await $(selector) : await $(selector);
    if (!(await element.isExisting().catch(() => false))) {
      continue;
    }
    if (!(await element.isDisplayed().catch(() => false))) {
      continue;
    }
    await element.click().catch(async () => {
      await browser.execute(el => el?.click?.(), element);
    });
    await browser.pause(300);
    return;
  }
}

async function openMemoryOverview() {
  const loaded = await ensureTauriPageLoaded();
  assert.equal(loaded, true, 'Tauri page should load on native runtime');

  await closeBootBeaconIfPresent();

  const memoryTab = await $('[data-testid="tab-memory"]');
  await memoryTab.waitForDisplayed({ timeout: 15000 });

  const selected = await memoryTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    await memoryTab.click().catch(async () => {
      await browser.execute(el => el?.click?.(), memoryTab);
    });
  }

  await browser.waitUntil(
    async () => {
      const root = await $('[data-testid="memory-section-root"]');
      return await root.isDisplayed().catch(() => false);
    },
    {
      timeout: 15000,
      interval: 250,
      timeoutMsg: 'memory-section-root not visible after activating memory tab',
    }
  );

  await browser.waitUntil(
    async () => {
      return await browser.execute(() => {
        const summary = document.querySelector(
          '[data-testid="memory-hybrid-overview-summary"]'
        );
        const exportButton = document.querySelector(
          '[data-testid="memory-hybrid-overview-export-report"]'
        );
        return Boolean(summary || exportButton);
      });
    },
    {
      timeout: 30000,
      interval: 500,
      timeoutMsg: 'memory hybrid overview did not hydrate on the native memory surface',
    }
  );

  const exportButton = await $('[data-testid="memory-hybrid-overview-export-report"]');
  await exportButton.waitForDisplayed({ timeout: 20000 });
  return exportButton;
}

describe('Hybrid memory governed export desktop proof', () => {
  after(() => {
    saveReport();
  });

  it('exports a governed hybrid memory report into sandboxed app data', async () => {
    const expectedAppDataRoot = getExpectedAppDataRoot();
    const expectedExportDir = path.join(expectedAppDataRoot, 'hybrid_memory', 'exports');

    fs.rmSync(expectedExportDir, { recursive: true, force: true });

    const exportButton = await openMemoryOverview();
    await exportButton.click().catch(async () => {
      await browser.execute(el => el?.click?.(), exportButton);
    });

    const status = await $('[data-testid="memory-hybrid-overview-export-status"]');
    await status.waitForDisplayed({ timeout: 10000 });
    await browser.waitUntil(
      async () => {
        const text = await status.getText().catch(() => '');
        return text.includes('Export gouverne:');
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'governed export status was not rendered',
      }
    );

    const statusText = await status.getText();
    recordCheck('ui-status', true, { statusText });

    const exportMatch = statusText.match(/Export gouverne:\s*(.+)$/);
    assert.ok(exportMatch, `Expected governed export path in status: ${statusText}`);
    const exportPath = exportMatch[1].trim();
    const metadataPath = exportPath.replace(/\.md$/i, '.json');

    assert.ok(
      exportPath.startsWith(expectedAppDataRoot),
      `Expected export path inside sandbox app data. got=${exportPath} expectedRoot=${expectedAppDataRoot}`
    );
    assert.ok(
      exportPath.includes(`${path.sep}hybrid_memory${path.sep}exports${path.sep}`),
      `Expected hybrid_memory export directory in path: ${exportPath}`
    );

    await browser.waitUntil(() => fs.existsSync(exportPath), {
      timeout: 10000,
      interval: 200,
      timeoutMsg: `Governed markdown export not found: ${exportPath}`,
    });
    await browser.waitUntil(() => fs.existsSync(metadataPath), {
      timeout: 10000,
      interval: 200,
      timeoutMsg: `Governed metadata export not found: ${metadataPath}`,
    });

    const markdown = fs.readFileSync(exportPath, 'utf8');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    assert.ok(markdown.includes('# TITANE Hybrid Memory Report'));
    assert.ok(markdown.includes('- Preset actif:'));
    assert.ok(markdown.includes('- Qualification:'));
    assert.equal(metadata.kind, 'hybrid-memory-governed-export');
    assert.equal(metadata.scope, 'tauri-app-data');
    assert.equal(typeof metadata.signature, 'string');
    assert.ok(metadata.signature.length > 10);
    assert.equal(metadata.markdownPath, exportPath);

    recordCheck('native-governed-export', true, {
      exportPath,
      metadataPath,
      expectedAppDataRoot,
      reportSize: markdown.length,
      metadataKind: metadata.kind,
      scope: metadata.scope,
    });
  });
});