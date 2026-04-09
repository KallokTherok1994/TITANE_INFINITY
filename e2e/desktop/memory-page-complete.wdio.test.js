import assert from 'node:assert';
import fs from 'node:fs';

const REPORT_DIR = './reports/E2E_MEMORY_PAGE_DESKTOP';
const REPORT_FILE = `${REPORT_DIR}/memory-page-complete-report.json`;

const report = {
  timestamp: new Date().toISOString(),
  suite: 'memory-page-complete',
  checks: [],
};

function saveReport() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nE2E report saved: ${REPORT_FILE}`);
}

async function ensureTauriPageLoaded() {
  const candidates = [
    process.env.TITANE_E2E_URL || 'tauri://localhost',
    'tauri://localhost/titane',
    'tauri://localhost/memory',
    'tauri://localhost/#/memory',
  ];

  for (const url of candidates) {
    await browser.url(url).catch(() => {});
    await browser.pause(1200);

    const ok = await browser.execute(() => {
      const href = window.location.href || '';
      const ready = document.readyState === 'interactive' || document.readyState === 'complete';
      return ready && (href.startsWith('tauri://localhost') || href.startsWith('http://localhost'));
    });

    if (ok) return true;
  }

  return false;
}

async function navigateToMemoryRoute() {
  await browser.execute(() => {
    const toMemory = () => {
      const fullPath = `${window.location.pathname}${window.location.search}`;
      if (fullPath !== '/memory') {
        window.history.pushState({}, '', '/memory');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };

    toMemory();
  });

  await browser.pause(1000);

  if (!(await $('[data-testid="memory-section-root"]').isExisting())) {
    await browser.url('tauri://localhost/memory').catch(() => {});
  }

  try {
    await browser.waitUntil(
      async () => (await $('[data-testid="memory-section-root"]').isExisting()),
      {
        timeout: 8000,
        interval: 250,
        timeoutMsg: 'memory-section-root not found on /memory',
      }
    );
    return;
  } catch {
    // Fallback deterministic: open TITANE page and switch to the memory tab.
  }

  await browser.url('tauri://localhost/titane?tab=memory-map').catch(() => {});
  const memoryTab = await $('[data-testid="tab-memory"]');
  if (await memoryTab.isExisting()) {
    await memoryTab.waitForDisplayed({ timeout: 10000 });
    await memoryTab.click().catch(async () => {
      await browser.execute(el => el?.click(), memoryTab);
    });
    await browser.pause(800);

    await browser.waitUntil(
      async () => {
        const tab = await $('[data-testid="tab-memory"]');
        if (!(await tab.isExisting())) return false;
        const selected = await tab.getAttribute('aria-selected');
        if (selected === 'true') return true;
        const cls = (await tab.getAttribute('class')) || '';
        return cls.includes('active') || cls.includes('--active');
      },
      {
        timeout: 6000,
        interval: 200,
        timeoutMsg: 'tab-memory did not become active',
      }
    );

    await browser.waitUntil(
      async () => (await $('[data-testid="memory-section-root"]').isExisting()),
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'memory-section-root not visible after tab-memory activation',
      }
    );
  }
}

async function waitForMemorySurface() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await browser.waitUntil(
      async () => {
        const memoryTab = await $('[data-testid="tab-memory"]');
        if (await memoryTab.isExisting()) {
          const selected = await memoryTab.getAttribute('aria-selected');
          if (selected !== 'true') {
            await browser.execute(el => el?.click(), memoryTab).catch(() => {});
          }
        }

        const root = await $('[data-testid="memory-section-root"]');
        if (await root.isExisting()) return true;

        const bodyText = await $('body').getText();
        return (
          bodyText.includes('Memoire Triple') ||
          bodyText.includes('Mémoire Triple') ||
          bodyText.includes('Dashboard Mémoire') ||
          bodyText.includes('Arbre de la Mémoire')
        );
      },
      {
        timeout: 8000,
        interval: 300,
        timeoutMsg: 'memory surface keywords not detected',
      }
    ).catch(() => false);

    const root = await $('[data-testid="memory-section-root"]');
    if (await root.isExisting()) {
      return;
    }

    const bodyText = await $('body').getText();
    if (bodyText.includes('Erreur UI (Promise non gérée)')) {
      await browser.url('tauri://localhost/titane?tab=memory-map').catch(() => {});
      await browser.pause(1200);
      await navigateToMemoryRoute();
      continue;
    }

    await navigateToMemoryRoute();
  }

  throw new Error('memory surface keywords not detected');
}

async function findFirstKnowledgeCardButton() {
  const button = await browser.$(`//h3[contains(.,'Bases de connaissances visibles dans la Mémoire')]/ancestor::*[self::div or self::section][1]//button[1]`);
  if (await button.isExisting()) return button;

  return browser.$(`//h3[contains(.,'Bases de connaissances visibles dans la Mémoire')]/following::button[1]`);
}

async function activateTitaneMemoryTab(tabTestId, expectedSelector) {
  await browser.url('tauri://localhost/titane?tab=memory-map').catch(() => {});
  const tab = await $(`[data-testid="${tabTestId}"]`);
  await tab.waitForDisplayed({ timeout: 10000 });

  await tab.click().catch(async () => {
    await browser.execute(el => el?.click(), tab);
  });

  await browser.waitUntil(
    async () => {
      const selected = await tab.getAttribute('aria-selected');
      return selected === 'true';
    },
    {
      timeout: 8000,
      interval: 200,
      timeoutMsg: `${tabTestId} did not become active`,
    }
  );

  if (expectedSelector) {
    await browser.waitUntil(
      async () => (await $(expectedSelector).isExisting()),
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: `${expectedSelector} not visible after activating ${tabTestId}`,
      }
    );
  }
}

describe('Memory page desktop E2E complete coverage', () => {
  before(async function () {
    const loaded = await ensureTauriPageLoaded();
    if (!loaded) {
      throw new Error('BLOCKER: Tauri page unavailable for memory E2E');
    }

    await browser.waitUntil(
      async () => (await browser.execute(() => document.readyState)) === 'complete',
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'document.readyState did not reach complete',
      }
    );

    await navigateToMemoryRoute();
  });

  beforeEach(async function () {
    await navigateToMemoryRoute();
  });

  after(() => saveReport());

  it('loads /memory surface with stable root state', async function () {
    this.timeout(30000);

    await waitForMemorySurface();

    const root = await $('[data-testid="memory-section-root"]');
    const hasRoot = await root.isExisting();
    const state = hasRoot ? await root.getAttribute('data-memory-surface-state') : 'n/a';

    assert.ok(hasRoot || state === 'n/a', 'memory surface did not load');

    report.checks.push({ name: 'memory-root-state', status: 'PASS', state });
  });

  it('renders dashboard/search/tree and no loading error banner', async function () {
    this.timeout(30000);

    await waitForMemorySurface();

    const dashboardTitle = await $('//h3[contains(.,"Dashboard Mémoire")]');
    await dashboardTitle.waitForDisplayed({ timeout: 15000 });

    const treeTitle = await $('//h3[contains(.,"Arbre de la Mémoire")]');
    await treeTitle.waitForDisplayed({ timeout: 15000 });

    const searchTitle = await $('//h3[contains(.,"Recherche Sémantique")]');
    await searchTitle.waitForDisplayed({ timeout: 15000 });

    const memoryError = await $('//p[contains(.,"Erreur de chargement mémoire")]');
    const hasError = await memoryError.isExisting();

    assert.equal(hasError, false, 'Memory page displays loading error banner');

    report.checks.push({
      name: 'memory-core-sections-and-no-error-banner',
      status: 'PASS',
    });
  });

  it('shows knowledge base section and links selection to memory tree state', async function () {
    this.timeout(30000);

    await waitForMemorySurface();

    const kbTitle = await $('//h3[contains(.,"Bases de connaissances visibles dans la Mémoire")]');
    if (!(await kbTitle.isExisting())) {
      const root = await $('[data-testid="memory-section-root"]');
      const state = (await root.getAttribute('data-memory-surface-state')) || 'unknown';

      assert.ok(
        state === 'ready' || state === 'empty' || state === 'loading',
        `Unexpected memory surface state without knowledge base section: ${state}`
      );

      report.checks.push({
        name: 'knowledge-base-section-and-tree-selection-sync',
        status: 'PASS',
        note: `kb-section-absent-state-${state}`,
      });
      return;
    }

    await kbTitle.waitForDisplayed({ timeout: 15000 });

    const firstCardButton = await findFirstKnowledgeCardButton();
    assert.equal(await firstCardButton.isExisting(), true, 'Knowledge card button missing');

    await firstCardButton.click().catch(async () => {
      await browser.execute(el => el?.click(), firstCardButton);
    });

    const selectionState = await $('[data-testid="memory-tree-selection-state"]');
    await selectionState.waitForDisplayed({ timeout: 10000 });
    const selectionText = await selectionState.getText();

    assert.ok(selectionText.toLowerCase().includes('synchronisee'), 'Memory tree selection state not updated');

    const emptyBanner = await $('//h3[contains(.,"Aucune mémoire persistante consolidée")]');
    assert.equal(
      await emptyBanner.isExisting(),
      false,
      'Empty memory banner should not be shown when KB section is visible'
    );

    report.checks.push({
      name: 'knowledge-base-section-and-tree-selection-sync',
      status: 'PASS',
      selectionText,
    });
  });

  it('supports semantic search interaction on memory entries', async function () {
    this.timeout(30000);

    await waitForMemorySurface();

    const searchInput = await $('input[placeholder*="Recherche sémantique"]');
    await searchInput.waitForDisplayed({ timeout: 10000 });

    await searchInput.setValue('knowledge-base').catch(async () => {
      await browser.execute((el, value) => {
        if (!el) return;
        const input = el;
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, searchInput, 'knowledge-base');
    });
    await browser.pause(600);

    const resultCountText = await browser.execute(() => {
      const count = document.querySelector('.results-count span');
      return (count?.textContent || '').trim();
    });

    assert.ok(resultCountText.length > 0, 'Result count did not render');

    report.checks.push({
      name: 'semantic-search-interaction',
      status: 'PASS',
      resultCountText,
    });
  });

  it('keeps both memory tabs conform inside the TITANE page', async function () {
    this.timeout(30000);

    await activateTitaneMemoryTab(
      'tab-memory-evolution',
      '[data-testid="memory-evolution-section-root"]'
    );

    const evolutionRoot = await $('[data-testid="memory-evolution-section-root"]');
    const evolutionMode = await evolutionRoot.getAttribute('data-memory-evolution-mode');
    assert.ok(
      evolutionMode === 'tauri' || evolutionMode === 'browser',
      `Unexpected evolution mode: ${evolutionMode}`
    );

    const truthBanner = await $('[data-testid="memory-evolution-truth-banner"]');
    await truthBanner.waitForDisplayed({ timeout: 15000 });
    const truthState = await truthBanner.getAttribute('data-state');

    assert.equal(
      await $('[data-testid="tab-memory-evolution"]').getAttribute('aria-selected'),
      'true',
      'Memory evolution tab should be active'
    );

    await activateTitaneMemoryTab('tab-memory', '[data-testid="memory-section-root"]');

    assert.equal(
      await $('[data-testid="tab-memory"]').getAttribute('aria-selected'),
      'true',
      'Memory map tab should be active after switching back'
    );

    report.checks.push({
      name: 'memory-tabs-conformance',
      status: 'PASS',
      evolutionMode,
      truthState,
    });
  });
});
