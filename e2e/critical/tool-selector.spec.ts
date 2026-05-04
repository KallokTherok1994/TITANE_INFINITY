/**
 * E2E Test: Tool Selector Panel (Critical Path)
 * TITANE∞ — Chat ⚡ Outils — 10-tool shortcut selector
 *
 * data-testids: tool-selector-btn, tool-selector-panel, tool-item-{id},
 *               tool-status-online, tool-status-deep
 *
 * Guard: TITANE_E2E_FULL=1 required for full run.
 * Skipped otherwise (unit tests cover logic).
 */

import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

// ── Helpers ──────────────────────────────────────────────────────────────────

const enableE2EChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as { __TITANE_E2E_CHAT_CONV_SEQ__?: number }).__TITANE_E2E_CHAT_CONV_SEQ__ = 0;
    (window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: unknown[] }).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = [];
    (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ = [];
    (window as { __TITANE_E2E_CHAT_SCENARIO__?: string }).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
    (window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }).__TITANE_E2E_WEB_RESEARCH_MOCK__ = false;
  });
};

const getChatInput = (page: Page) =>
  page
    .getByPlaceholder(/Tapez votre message/i)
    .or(page.locator('textarea.conversation-input'))
    .first();

const getToolSelectorBtn = (page: Page) => page.getByTestId('tool-selector-btn');
const getToolSelectorPanel = (page: Page) => page.getByTestId('tool-selector-panel');
const getToolItem = (page: Page, id: string) => page.getByTestId(`tool-item-${id}`);

// All 10 tool IDs from chatToolsRegistry.ts
const ALL_TOOL_IDS = [
  'generate_file',
  'generate_summary',
  'generate_report',
  'web_search',
  'deep_study',
  'analyze_site',
  'deep_reflection',
  'critical_analysis',
  'save_prefs',
  'quick_summary',
];

// autoSend=true tools
const AUTO_SEND_TOOL_IDS = ['generate_summary', 'generate_report', 'deep_reflection', 'quick_summary'];

// ── RUN 1 — Button visibility & panel toggle ──────────────────────────────────

test.describe('RUN1 — Tool selector button & panel toggle', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN1-T1 — ⚡ Outils button is visible in chat toolbar', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const btn = getToolSelectorBtn(page);
    await expect(btn).toBeVisible({ timeout: 10_000 });
    // Button contains the ⚡ icon (no text label — aria-hidden span only)
    await expect(btn).toHaveAttribute('title', /Sélectionner un outil/i);
  });

  test('RUN1-T2 — clicking button opens the panel', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const btn = getToolSelectorBtn(page);
    await btn.click();

    const panel = getToolSelectorPanel(page);
    await expect(panel).toBeVisible({ timeout: 5_000 });
  });

  test('RUN1-T3 — clicking button again closes the panel', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const btn = getToolSelectorBtn(page);
    await btn.click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    await btn.click();
    await expect(getToolSelectorPanel(page)).not.toBeVisible({ timeout: 3_000 });
  });
});

// ── RUN 2 — Panel content: 10 tools + categories + status ────────────────────

test.describe('RUN2 — Panel content (10 tools, categories, status)', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN2-T1 — all 10 tool cards are rendered', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    for (const id of ALL_TOOL_IDS) {
      await expect(getToolItem(page, id)).toBeVisible({ timeout: 3_000 });
    }
  });

  test('RUN2-T2 — 4 category labels are present', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    const panel = getToolSelectorPanel(page);
    await expect(panel.getByText(/Générer/i).first()).toBeVisible();
    await expect(panel.getByText(/Recherche/i).first()).toBeVisible();
    await expect(panel.getByText(/Réflexion/i).first()).toBeVisible();
    await expect(panel.getByText(/Configuration/i).first()).toBeVisible();
  });

  test('RUN2-T3 — status bar elements are present', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    // At least one status badge rendered (online or deep)
    const onlineBadge = page.getByTestId('tool-status-online');
    const deepBadge = page.getByTestId('tool-status-deep');
    const hasBadge = (await onlineBadge.count()) > 0 || (await deepBadge.count()) > 0;
    expect(hasBadge).toBe(true);
  });
});

// ── RUN 3 — Tool selection: template inject vs autoSend ───────────────────────

test.describe('RUN3 — Tool selection behaviour (template / autoSend)', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN3-T1 — inject-template tool pre-fills input without sending', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    // web_search: autoSend=false → should pre-fill input
    await getToolItem(page, 'web_search').click();

    // Panel should close
    await expect(getToolSelectorPanel(page)).not.toBeVisible({ timeout: 3_000 });

    // Input should contain template text
    const chatInput = getChatInput(page);
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toMatch(/recherche sur internet/i);
  });

  test('RUN3-T2 — analyze_site pre-fills with URL template', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    await getToolItem(page, 'analyze_site').click();

    const chatInput = getChatInput(page);
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toMatch(/https:\/\//i);
  });

  test('RUN3-T3 — autoSend tool (quick_summary) sends message automatically', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    await getToolItem(page, 'quick_summary').click();

    // Panel closes immediately
    await expect(getToolSelectorPanel(page)).not.toBeVisible({ timeout: 3_000 });

    // A user message should appear in chat (auto-sent)
    const userMsg = page.getByTestId('chat-message-user').last();
    await expect(userMsg).toBeVisible({ timeout: 8_000 });
    await expect(userMsg).toContainText(/résumé express/i);
  });
});

// ── RUN 4 — Slash-detection opens panel ──────────────────────────────────────

test.describe('RUN4 — Slash-detection (typing / opens panel)', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN4-T1 — typing "/" in input opens the panel and clears input', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const chatInput = getChatInput(page);
    // fill() triggers React onChange reliably in real browsers
    await chatInput.fill('/');

    // Panel should open
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    // Input should be cleared — React useEffect clears it synchronously after detecting '/'
    await expect(chatInput).toHaveValue('', { timeout: 5_000 });
  });
});

// ── RUN 5 — Close behaviours ─────────────────────────────────────────────────

test.describe('RUN5 — Panel close behaviours', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN5-T1 — clicking outside the panel closes it', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    // Click somewhere neutral (page header / top of page)
    await page.mouse.click(100, 50);

    await expect(getToolSelectorPanel(page)).not.toBeVisible({ timeout: 3_000 });
  });

  test('RUN5-T2 — Escape key closes the panel', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('Escape');

    await expect(getToolSelectorPanel(page)).not.toBeVisible({ timeout: 3_000 });
  });
});

// ── RUN 6 — Full flow: analyze_site → complete URL → send ────────────────────

test.describe('RUN6 — Full flow: analyze_site → type URL → send', () => {
  test.skip(!FULL_E2E_ENABLED, 'Requires TITANE_E2E_FULL=1');

  test('RUN6-T1 — full analyze_site flow produces user message in chat', async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    // Open panel and select analyze_site
    await getToolSelectorBtn(page).click();
    await expect(getToolSelectorPanel(page)).toBeVisible({ timeout: 5_000 });
    await getToolItem(page, 'analyze_site').click();

    // Input pre-filled with URL template
    const chatInput = getChatInput(page);
    await expect(chatInput).toBeFocused({ timeout: 3_000 });

    // Complete the URL
    await chatInput.type('example.com');

    // Send
    await page.keyboard.press('Enter');

    // User message visible
    const userMsg = page.getByTestId('chat-message-user').last();
    await expect(userMsg).toBeVisible({ timeout: 8_000 });
    await expect(userMsg).toContainText(/example\.com/i);
  });
});
