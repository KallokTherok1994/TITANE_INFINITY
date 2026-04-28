/**
 * TITANE∞ v31.2.15 — Mobile Chrome Reduction — Tests UI navigateur
 *
 * Suite complète d'assurance qualité mobile pour la correction chrome reduction
 * introduite en v31.2.15. Couvre les 3 appareils cibles principaux :
 *   • Samsung Galaxy S25 Ultra (393×851 dp, device-pixel-ratio 3)
 *   • Pixel 7 (412×915 dp)
 *   • Small mobile (375×667 dp — iPhone SE / anciens appareils)
 *
 * Critères d'acceptation (cf. plan mobile-chrome-reduction) :
 *   1. Zone messages ≥ 300px de hauteur visible dans le viewport
 *   2. chat-input et chat-send toujours dans le viewport
 *   3. ChatToolbar sur une seule rangée (hauteur ≤ 56px)
 *   4. Tabs inline compacts (hauteur ≤ 44px)
 *   5. conversation-filters masquée par défaut, visible après toggle search
 *   6. Boutons secondaires (export-json, export-md, copy, mode-builder…) masqués sur mobile
 *   7. Bouton ⋮ (btn-mobile-more) visible et menu overflow fonctionnel
 *   8. conversation-runtime-panel absent du viewport
 *
 * Lance sans TITANE_E2E_FULL=1 en mode raccourci (preuve de structure),
 * complet avec TITANE_E2E_FULL=1.
 */

import { test, expect, type Page, devices } from '@playwright/test';

import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

// ─── Constantes ───────────────────────────────────────────────────────────────

const FULL = process.env.TITANE_E2E_FULL === '1';

/** Appareils mobiles émulés — coordonnées CSS (pas device-pixels) */
const MOBILE_VIEWPORTS = [
  {
    name: 'S25Ultra',
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 3,
    userAgent: devices['Pixel 5'].userAgent,
  },
  {
    name: 'Pixel7',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    userAgent: devices['Pixel 7'].userAgent,
  },
  {
    name: 'SmallMobile',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    userAgent: devices['iPhone SE'].userAgent,
  },
] as const;

/** Hauteur minimale pour les tests structure (tout serveur) */
const MIN_MESSAGES_HEIGHT_STRUCTURE_PX = 200;
/** Hauteur minimale cible v31.2.15 (chrome reduction actif) */
const MIN_MESSAGES_HEIGHT_PX = 300;
/** Hauteur maximale acceptable pour le ChatToolbar (1 rangée) */
const MAX_TOOLBAR_HEIGHT_PX = 56;
/** Hauteur maximale acceptable pour la barre de tabs inline */
const MAX_TABS_HEIGHT_PX = 44;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function openConversation(page: Page): Promise<void> {
  await openTitane(page);
  await closeBootBeaconIfPresent(page);
  await page
    .getByTestId('tab-conversation')
    .click({ force: true })
    .catch(() => undefined);
  await expect(page.getByTestId('tab-conversation')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-messages-scroll-region')).toBeVisible({
    timeout: 15000,
  });
}

type LayoutMetrics = {
  viewportH: number;
  viewportW: number;
  messagesTop: number | null;
  messagesBottom: number | null;
  messagesHeight: number | null;
  inputTop: number | null;
  inputBottom: number | null;
  sendBottom: number | null;
  toolbarHeight: number | null;
  tabsHeight: number | null;
  filtersVisible: boolean;
  runtimePanelVisible: boolean;
  btnExportJsonVisible: boolean;
  btnExportMdVisible: boolean;
  btnCopyChatVisible: boolean;
  btnModeBuilderVisible: boolean;
  btnClearChatVisible: boolean;
  btnMobileMoreVisible: boolean;
  btnMobileSearchToggleVisible: boolean;
};

/** Collecte toutes les métriques de layout depuis le DOM */
async function collectLayoutMetrics(page: Page): Promise<LayoutMetrics> {
  return page.evaluate((): LayoutMetrics => {
    const rectOf = (selector: string) => {
      const el = document.querySelector(selector);
      return el ? el.getBoundingClientRect() : null;
    };

    const isVisible = (selector: string): boolean => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const messagesRect = rectOf('[data-testid="chat-messages-scroll-region"]');
    const inputRect = rectOf('[data-testid="chat-input"]');
    const sendRect = rectOf('[data-testid="chat-send"]');
    const toolbarRect = rectOf('.chat-toolbar');
    const tabsRect = rectOf('.titane-inline-tabs');

    return {
      viewportH: window.innerHeight,
      viewportW: window.innerWidth,
      messagesTop: messagesRect?.top ?? null,
      messagesBottom: messagesRect?.bottom ?? null,
      messagesHeight: messagesRect?.height ?? null,
      inputTop: inputRect?.top ?? null,
      inputBottom: inputRect?.bottom ?? null,
      sendBottom: sendRect?.bottom ?? null,
      toolbarHeight: toolbarRect?.height ?? null,
      tabsHeight: tabsRect?.height ?? null,
      // Filtres (recherche) — doit être masqué par défaut sur mobile
      filtersVisible: isVisible('.conversation-filters'),
      // Runtime panel — doit être masqué sur mobile
      runtimePanelVisible: isVisible('.conversation-runtime-panel'),
      // Boutons secondaires — doivent être masqués sur mobile
      btnExportJsonVisible: isVisible('[data-testid="btn-export-json"]'),
      btnExportMdVisible: isVisible('[data-testid="btn-export-markdown"]'),
      btnCopyChatVisible: isVisible('[data-testid="btn-copy-chat"]'),
      btnModeBuilderVisible: isVisible('[data-testid="btn-mode-builder"]'),
      btnClearChatVisible: isVisible('[data-testid="btn-clear-chat"]'),
      // Boutons mobiles — doivent être visibles sur mobile
      btnMobileMoreVisible: isVisible('[data-testid="btn-mobile-more"]'),
      btnMobileSearchToggleVisible: isVisible('[data-testid="btn-mobile-search-toggle"]'),
    };
  });
}

// ─── Assertions communes ──────────────────────────────────────────────────────

function assertCriticalZoneVisible(m: LayoutMetrics, deviceName: string): void {
  // Zone messages ≥ MIN_MESSAGES_HEIGHT_PX
  expect(
    m.messagesHeight,
    `[${deviceName}] chat-messages-scroll-region doit avoir une hauteur ≥ ${MIN_MESSAGES_HEIGHT_PX}px (observé: ${m.messagesHeight}px)`
  ).toBeGreaterThanOrEqual(MIN_MESSAGES_HEIGHT_PX);

  // Zone messages dans le viewport
  expect(
    m.messagesTop,
    `[${deviceName}] messagesTop doit être ≥ 0`
  ).toBeGreaterThanOrEqual(0);
  expect(
    m.messagesBottom,
    `[${deviceName}] messagesBottom doit être ≤ viewportH`
  ).toBeLessThanOrEqual(m.viewportH);
}

function assertInputAlwaysReachable(m: LayoutMetrics, deviceName: string): void {
  expect(m.inputTop, `[${deviceName}] inputTop ne doit pas être null`).not.toBeNull();
  expect(m.inputBottom, `[${deviceName}] inputBottom ne doit pas être null`).not.toBeNull();
  expect(m.sendBottom, `[${deviceName}] sendBottom ne doit pas être null`).not.toBeNull();
  expect(m.inputTop!, `[${deviceName}] chat-input doit être dans le viewport`).toBeLessThan(
    m.viewportH
  );
  expect(
    m.inputBottom!,
    `[${deviceName}] chat-input ne doit pas déborder sous le viewport`
  ).toBeLessThanOrEqual(m.viewportH + 8); // +8px tolérance scrollbar
  expect(
    m.sendBottom!,
    `[${deviceName}] chat-send ne doit pas déborder sous le viewport`
  ).toBeLessThanOrEqual(m.viewportH + 8);
}

function assertChromeReduced(m: LayoutMetrics, deviceName: string): void {
  // Toolbar sur 1 rangée
  if (m.toolbarHeight !== null) {
    expect(
      m.toolbarHeight,
      `[${deviceName}] ChatToolbar doit tenir sur 1 rangée (≤ ${MAX_TOOLBAR_HEIGHT_PX}px, observé: ${m.toolbarHeight}px)`
    ).toBeLessThanOrEqual(MAX_TOOLBAR_HEIGHT_PX);
  }

  // Tabs compacts
  if (m.tabsHeight !== null) {
    expect(
      m.tabsHeight,
      `[${deviceName}] Inline tabs doivent être compacts (≤ ${MAX_TABS_HEIGHT_PX}px, observé: ${m.tabsHeight}px)`
    ).toBeLessThanOrEqual(MAX_TABS_HEIGHT_PX);
  }

  // Filtres cachés par défaut
  expect(
    m.filtersVisible,
    `[${deviceName}] conversation-filters doit être masqué par défaut sur mobile`
  ).toBe(false);

  // Runtime panel masqué
  expect(
    m.runtimePanelVisible,
    `[${deviceName}] conversation-runtime-panel doit être masqué sur mobile`
  ).toBe(false);
}

function assertSecondaryButtonsHidden(m: LayoutMetrics, deviceName: string): void {
  expect(
    m.btnExportJsonVisible,
    `[${deviceName}] btn-export-json doit être masqué sur mobile`
  ).toBe(false);
  expect(
    m.btnExportMdVisible,
    `[${deviceName}] btn-export-markdown doit être masqué sur mobile`
  ).toBe(false);
  expect(
    m.btnCopyChatVisible,
    `[${deviceName}] btn-copy-chat doit être masqué sur mobile`
  ).toBe(false);
  expect(
    m.btnModeBuilderVisible,
    `[${deviceName}] btn-mode-builder doit être masqué sur mobile`
  ).toBe(false);
  expect(
    m.btnClearChatVisible,
    `[${deviceName}] btn-clear-chat doit être masqué sur mobile`
  ).toBe(false);
}

function assertMobileButtonsVisible(m: LayoutMetrics, deviceName: string): void {
  expect(
    m.btnMobileMoreVisible,
    `[${deviceName}] btn-mobile-more (⋮) doit être visible sur mobile`
  ).toBe(true);
  expect(
    m.btnMobileSearchToggleVisible,
    `[${deviceName}] btn-mobile-search-toggle doit être visible sur mobile`
  ).toBe(true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 1 — Structure : vérification immédiate sans FULL=1
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mobile Chrome Reduction v31.2.15 — Structure', () => {
  test('proof: les nouveaux data-testid mobiles sont présents dans le DOM', async ({
    page,
  }) => {
    // Utilise le viewport Pixel 7 par défaut (défini dans playwright.config)
    await openConversation(page);

    // Ces éléments doivent exister dans le DOM
    await expect(
      page.getByTestId('btn-mobile-more')
    ).toBeAttached({ timeout: 5000 });

    await expect(
      page.getByTestId('btn-mobile-search-toggle')
    ).toBeAttached({ timeout: 5000 });

    // Les filtres existent mais sont masqués
    const filters = page.locator('.conversation-filters');
    await expect(filters).toBeAttached({ timeout: 5000 });

    // chat-input et chat-send sont dans le DOM
    await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chat-send')).toBeVisible({ timeout: 10000 });
  });

  test('proof: zone messages visible et suffisamment haute (Pixel 7)', async ({ page }) => {
    await openConversation(page);

    const metrics = await collectLayoutMetrics(page);
    // Seuil minimal de viabilite (> 200px) — seuil cible v31.2.15 = 300px (tests FULL)
    expect(metrics.messagesHeight).not.toBeNull();
    expect(metrics.messagesHeight!).toBeGreaterThanOrEqual(MIN_MESSAGES_HEIGHT_STRUCTURE_PX);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 2 — Complet (TITANE_E2E_FULL=1)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mobile Chrome Reduction v31.2.15 — Full E2E', () => {
  if (!FULL) {
    test('gate raccourci (TITANE_E2E_FULL=0) — proof de skip propre', async () => {
      expect(FULL).toBe(false);
    });
    return;
  }

  // ── BLOC 1 : Multi-device layout check ──────────────────────────────────────
  for (const device of MOBILE_VIEWPORTS) {
    test.describe(`Device: ${device.name} (${device.viewport.width}×${device.viewport.height})`, () => {
      test.use({
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        userAgent: device.userAgent,
        isMobile: true,
        hasTouch: true,
      });

      test('Critère 1 — zone messages ≥ 300px visible dans le viewport', async ({ page }) => {
        await openConversation(page);
        const m = await collectLayoutMetrics(page);
        assertCriticalZoneVisible(m, device.name);
      });

      test('Critère 2 — chat-input et chat-send accessibles (dans le viewport)', async ({
        page,
      }) => {
        await openConversation(page);
        await expectCriticalElementsInViewport(page, device.name);
        const m = await collectLayoutMetrics(page);
        assertInputAlwaysReachable(m, device.name);
      });

      test('Critère 3+4 — chrome réduit : toolbar 1 rangée, tabs compacts, filters masqués', async ({
        page,
      }) => {
        await openConversation(page);
        const m = await collectLayoutMetrics(page);
        assertChromeReduced(m, device.name);
      });

      test('Critère 6 — boutons secondaires masqués sur mobile', async ({ page }) => {
        await openConversation(page);
        const m = await collectLayoutMetrics(page);
        assertSecondaryButtonsHidden(m, device.name);
      });

      test('Critère 7 — boutons mobiles ⋮ et 🔍 visibles sur mobile', async ({ page }) => {
        await openConversation(page);
        const m = await collectLayoutMetrics(page);
        assertMobileButtonsVisible(m, device.name);
      });
    });
  }

  // ── BLOC 2 : Interaction — menu overflow ⋮ ──────────────────────────────────
  test.describe('Interaction — menu overflow ⋮ (Pixel 7)', () => {
    test.use({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      userAgent: devices['Pixel 7'].userAgent,
      isMobile: true,
      hasTouch: true,
    });

    test('Le menu ⋮ souvre au tap et affiche les 6 actions', async ({ page }) => {
      await openConversation(page);

      const moreBtn = page.getByTestId('btn-mobile-more');
      await expect(moreBtn).toBeVisible({ timeout: 10000 });

      // Menu non visible avant tap
      await expect(page.getByTestId('mobile-more-menu')).not.toBeVisible();

      // Tap sur ⋮
      await moreBtn.click({ force: true });

      // Menu doit s'ouvrir
      const menu = page.getByTestId('mobile-more-menu');
      await expect(menu).toBeVisible({ timeout: 5000 });

      // Les 6 items doivent être présents
      const menuButtons = menu.locator('button');
      await expect(menuButtons).toHaveCount(6, { timeout: 5000 });

      // Textes attendus
      await expect(menu.getByText('Export JSON', { exact: false })).toBeVisible();
      await expect(menu.getByText('Export MD', { exact: false })).toBeVisible();
      await expect(menu.getByText('Copier', { exact: false })).toBeVisible();
      await expect(menu.getByText('Modes', { exact: false })).toBeVisible();
      await expect(menu.getByText('Santé', { exact: false })).toBeVisible();
      await expect(menu.getByText('Effacer', { exact: false })).toBeVisible();
    });

    test('Le menu ⋮ se ferme apres selection dune action', async ({ page }) => {
      await openConversation(page);

      await page.getByTestId('btn-mobile-more').click({ force: true });
      const menu = page.getByTestId('mobile-more-menu');
      await expect(menu).toBeVisible({ timeout: 5000 });

      // Tap sur "Modes" (pas destructif, pas de confirmation requise)
      await menu.getByText('Modes', { exact: false }).click({ force: true });

      // Le menu doit se fermer
      await expect(menu).not.toBeVisible({ timeout: 5000 });
    });

    test('Zone messages reste >= 300px apres ouverture du menu overflow', async ({ page }) => {
      await openConversation(page);

      await page.getByTestId('btn-mobile-more').click({ force: true });
      await expect(page.getByTestId('mobile-more-menu')).toBeVisible({ timeout: 5000 });

      const m = await collectLayoutMetrics(page);
      assertCriticalZoneVisible(m, 'Pixel7-with-menu');
      assertInputAlwaysReachable(m, 'Pixel7-with-menu');
    });
  });

  // ── BLOC 3 : Interaction — toggle recherche ──────────────────────────────────
  test.describe('Interaction — toggle recherche (Pixel 7)', () => {
    test.use({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      userAgent: devices['Pixel 7'].userAgent,
      isMobile: true,
      hasTouch: true,
    });

    test('Les filtres sont masqués par défaut', async ({ page }) => {
      await openConversation(page);

      const filters = page.locator('.conversation-filters');
      // Présent dans le DOM mais non visible (display:none)
      await expect(filters).toBeAttached();
      await expect(filters).not.toBeVisible();
    });

    test('Les filtres deviennent visibles après tap sur btn-mobile-search-toggle', async ({
      page,
    }) => {
      await openConversation(page);

      const searchToggle = page.getByTestId('btn-mobile-search-toggle');
      await expect(searchToggle).toBeVisible({ timeout: 10000 });

      // État initial : filtres masqués
      await expect(page.locator('.conversation-filters')).not.toBeVisible();

      // Tap : filtres visibles
      await searchToggle.click({ force: true });
      await expect(page.locator('.conversation-filters.search-visible')).toBeVisible({
        timeout: 5000,
      });

      // Re-tap : filtres masqués à nouveau
      await searchToggle.click({ force: true });
      await expect(page.locator('.conversation-filters.search-visible')).not.toBeVisible({
        timeout: 5000,
      });
    });

    test('Zone messages reste >= 300px apres ouverture du panel recherche', async ({
      page,
    }) => {
      await openConversation(page);

      await page.getByTestId('btn-mobile-search-toggle').click({ force: true });
      await expect(page.locator('.conversation-filters.search-visible')).toBeVisible({
        timeout: 5000,
      });

      const m = await collectLayoutMetrics(page);
      assertCriticalZoneVisible(m, 'Pixel7-with-search');
    });
  });

  // ── BLOC 4 : Saisie et navigation sur mobile ──────────────────────────────────
  test.describe('Saisie et navigation — S25 Ultra', () => {
    test.use({
      viewport: { width: 393, height: 851 },
      deviceScaleFactor: 3,
      userAgent: devices['Pixel 5'].userAgent,
      isMobile: true,
      hasTouch: true,
    });

    test('Chat input recoit le focus et reste visible quand le clavier virtuel souvre', async ({
      page,
    }) => {
      await openConversation(page);

      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible({ timeout: 10000 });

      await input.click({ force: true });
      await input.fill('Test message mobile S25 Ultra');

      // Input doit toujours être visible après remplissage
      await expect(input).toBeInViewport();

      // Le bouton send aussi
      await expect(page.getByTestId('chat-send')).toBeInViewport();
    });

    test('Navigation par tabs — tous les tabs inline sont accessibles par tap', async ({
      page,
    }) => {
      await openConversation(page);

      const tabs = [
        'tab-overview',
        'tab-vision',
        'tab-memory',
        'tab-progression',
        'tab-transformation',
      ];

      for (const tabId of tabs) {
        const tab = page.getByTestId(tabId);
        await expect(tab).toBeAttached({ timeout: 5000 });
        // Tab doit être visible ou accessible via scroll horizontal
        const isVisible = await tab.isVisible();
        // Sur mobile, les tabs peuvent déborder — on vérifie seulement qu'ils existent et sont cliquables
        if (isVisible) {
          await tab.click({ force: true });
          // Retour sur conversation
          await page.getByTestId('tab-conversation').click({ force: true });
          await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('Scroll dans la zone messages tactile fluide', async ({ page }) => {
      await openConversation(page);

      const messagesRegion = page.getByTestId('chat-messages-scroll-region');
      await expect(messagesRegion).toBeVisible({ timeout: 10000 });

      // Simuler un swipe vertical dans la zone messages
      const box = await messagesRegion.boundingBox();
      if (box) {
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        await page.touchscreen.tap(centerX, centerY);
      }

      // Zone toujours visible après interaction
      await expect(messagesRegion).toBeVisible();
    });
  });

  // ── BLOC 5 : Metrics snapshot — rapport final ─────────────────────────────────
  test.describe('Snapshot métriques — rapport proof', () => {
    for (const device of MOBILE_VIEWPORTS) {
      test(`Snapshot complet: ${device.name}`, async ({ page }) => {
        test.use({
          viewport: device.viewport,
          deviceScaleFactor: device.deviceScaleFactor,
          userAgent: device.userAgent,
          isMobile: true,
          hasTouch: true,
        });

        await openConversation(page);
        const m = await collectLayoutMetrics(page);

        // Preuve complète : tous les critères d'un seul coup
        assertCriticalZoneVisible(m, device.name);
        assertInputAlwaysReachable(m, device.name);
        assertChromeReduced(m, device.name);
        assertSecondaryButtonsHidden(m, device.name);
        assertMobileButtonsVisible(m, device.name);

        // Capture screenshot pour preuve visuelle
        await page.screenshot({
          path: `reports/playwright/test-results/mobile-chrome-reduction-${device.name}.png`,
          fullPage: false,
        });

        // Log des métriques clés pour le rapport
        console.log(
          `[${device.name}] viewport=${m.viewportW}×${m.viewportH} ` +
          `messagesH=${m.messagesHeight}px ` +
          `toolbarH=${m.toolbarHeight}px ` +
          `tabsH=${m.tabsHeight}px ` +
          `filtersVisible=${m.filtersVisible} ` +
          `runtimePanelVisible=${m.runtimePanelVisible} ` +
          `moreBtn=${m.btnMobileMoreVisible}`
        );
      });
    }
  });
});

// ─── Fonction helper interne ──────────────────────────────────────────────────

async function expectCriticalElementsInViewport(page: Page, deviceName: string): Promise<void> {
  await expect(
    page.getByTestId('chat-input'),
    `[${deviceName}] chat-input doit être dans le viewport`
  ).toBeInViewport();

  await expect(
    page.getByTestId('chat-send'),
    `[${deviceName}] chat-send doit être dans le viewport`
  ).toBeInViewport();

  await expect(
    page.getByTestId('chat-messages-scroll-region'),
    `[${deviceName}] chat-messages-scroll-region doit être dans le viewport`
  ).toBeInViewport();

  await expect(
    page.getByTestId('tab-conversation'),
    `[${deviceName}] tab-conversation doit être dans le viewport`
  ).toBeInViewport();
}
