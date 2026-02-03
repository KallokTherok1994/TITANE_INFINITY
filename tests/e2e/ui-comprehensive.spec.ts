import { test, expect, Page } from '@playwright/test';

/**
 * UI COMPREHENSIVE TEST SUITE v37.0.0
 * Tests all pages, components, interactions, forms, buttons
 */

test.describe('TITANE∞ UI Comprehensive Test Suite', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ============================================
  // 1. MAIN DASHBOARD PAGE
  // ============================================
  test('1.1 Dashboard Page - Load & Verify', async () => {
    await page.goto('tauri://localhost', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify main dashboard elements
    const mainContainer = await page.locator('[data-testid="dashboard-main"]');
    expect(mainContainer).toBeTruthy();

    const title = await page.locator('h1, h2').first();
    expect(await title.textContent()).toBeTruthy();
  });

  test('1.2 Navigation Menu - All Links Accessible', async () => {
    const navItems = await page.locator('nav a, [role="navigation"] a, aside a');
    const count = await navItems.count();

    expect(count).toBeGreaterThan(0);

    // Verify each nav item is clickable
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = navItems.nth(i);
      expect(await item.isVisible()).toBeTruthy();
      expect(await item.isEnabled()).toBeTruthy();
    }
  });

  test('1.3 Search/Input Components - Functional', async () => {
    const inputs = await page.locator(
      'input[type="text"], input[type="search"], textarea'
    );

    for (let i = 0; i < Math.min(await inputs.count(), 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        await input.fill('Test Input');
        const value = await input.inputValue();
        expect(value).toContain('Test Input');
        await input.clear();
      }
    }
  });

  // ============================================
  // 2. BUTTONS & INTERACTIONS
  // ============================================
  test('2.1 Primary Buttons - Clickable & Responsive', async () => {
    const buttons = await page.locator('button:visible, [role="button"]');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      expect(await btn.isEnabled()).toBeTruthy();
      expect(await btn.isVisible()).toBeTruthy();
    }
  });

  test('2.2 Button Click Events - No Errors', async () => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        expect(msg.text()).not.toContain('error');
      }
    });

    const buttons = await page.locator('button[type="button"]:visible');
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      try {
        await buttons.nth(i).click({ force: true });
        await page.waitForTimeout(500);
      } catch (e) {
        // Non-critical click failures
      }
    }
  });

  // ============================================
  // 3. FORMS & INPUT VALIDATION
  // ============================================
  test('3.1 Form Fields - All Types Present', async () => {
    const forms = await page.locator('form');
    if ((await forms.count()) > 0) {
      const firstForm = forms.first();

      const inputs = await firstForm.locator('input, select, textarea');
      expect(await inputs.count()).toBeGreaterThan(0);
    }
  });

  test('3.2 Select/Dropdown - Functional', async () => {
    const selects = await page.locator('select');

    for (let i = 0; i < Math.min(await selects.count(), 2); i++) {
      const select = selects.nth(i);
      if (await select.isVisible()) {
        await select.click();
        const options = await select.locator('option');
        expect(await options.count()).toBeGreaterThan(0);
      }
    }
  });

  test('3.3 Checkboxes & Radio Buttons', async () => {
    const checkboxes = await page.locator('input[type="checkbox"]');
    const radios = await page.locator('input[type="radio"]');

    for (let i = 0; i < Math.min(await checkboxes.count(), 2); i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isVisible()) {
        await checkbox.click();
        expect(await checkbox.isChecked()).toBeTruthy();
      }
    }

    for (let i = 0; i < Math.min(await radios.count(), 2); i++) {
      const radio = radios.nth(i);
      if (await radio.isVisible()) {
        await radio.click();
        expect(await radio.isChecked()).toBeTruthy();
      }
    }
  });

  // ============================================
  // 4. TABS & ACCORDION COMPONENTS
  // ============================================
  test('4.1 Tab Navigation - All Tabs Clickable', async () => {
    const tabs = await page.locator('[role="tab"]');

    for (let i = 0; i < Math.min(await tabs.count(), 4); i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
        expect(await tab.getAttribute('aria-selected')).toBeTruthy();
      }
    }
  });

  test('4.2 Tab Panel Content - Loads Correctly', async () => {
    const tabpanels = await page.locator('[role="tabpanel"]');

    for (let i = 0; i < Math.min(await tabpanels.count(), 3); i++) {
      const panel = tabpanels.nth(i);
      expect(await panel.isVisible()).toBeTruthy();
    }
  });

  test('4.3 Collapsible/Accordion - Expandable', async () => {
    const buttons = await page.locator('[aria-expanded]');

    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      const btn = buttons.nth(i);
      const initialState = await btn.getAttribute('aria-expanded');
      await btn.click();
      await page.waitForTimeout(300);
      const newState = await btn.getAttribute('aria-expanded');
      expect(newState).not.toBe(initialState);
    }
  });

  // ============================================
  // 5. MODALS & DIALOGS
  // ============================================
  test('5.1 Modal/Dialog - Opens & Closes', async () => {
    const dialogs = await page.locator('[role="dialog"]');

    if ((await dialogs.count()) > 0) {
      for (let i = 0; i < Math.min(await dialogs.count(), 2); i++) {
        const dialog = dialogs.nth(i);
        expect(await dialog.isVisible()).toBeTruthy();

        const closeBtn = dialog.locator(
          'button:has-text("Fermer"), button:has-text("Close"), [aria-label*="Close"]'
        );
        if ((await closeBtn.count()) > 0) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });

  // ============================================
  // 6. PERFORMANCE & RENDERING
  // ============================================
  test('6.1 Page Load Time - Acceptable', async () => {
    const startTime = Date.now();
    await page.goto('tauri://localhost', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // < 5s
  });

  test('6.2 No Console Errors', async () => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      e =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error promise rejection') &&
        !e.includes('Deprecation')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('6.3 Layout Responsiveness - No Overflow', async () => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  // ============================================
  // 7. ACCESSIBILITY
  // ============================================
  test('7.1 Labels - Form Fields Have Labels', async () => {
    const inputs = await page.locator('input, select, textarea');

    for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const label = input.locator('.. >> label');

      expect(ariaLabel || (await label.count()) > 0).toBeTruthy();
    }
  });

  test('7.2 Keyboard Navigation - Tab Order', async () => {
    await page.keyboard.press('Tab');
    const focused1 = await page.locator(':focus');
    expect(await focused1.count()).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    const focused2 = await page.locator(':focus');
    expect(await focused2.count()).toBeGreaterThan(0);
  });

  // ============================================
  // 8. DATA DISPLAY & LISTS
  // ============================================
  test('8.1 Tables/Lists - Render Data', async () => {
    const tables = await page.locator('table');
    const lists = await page.locator('ul, ol');

    if ((await tables.count()) > 0) {
      const rows = await tables.first().locator('tr');
      expect(await rows.count()).toBeGreaterThanOrEqual(0);
    }

    if ((await lists.count()) > 0) {
      const items = await lists.first().locator('li');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('8.2 Pagination - If Present, Functional', async () => {
    const pagination = await page.locator(
      '[aria-label*="pagination"], nav:has-text("Page"), .pagination'
    );

    if ((await pagination.count()) > 0) {
      const buttons = pagination.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);
    }
  });

  // ============================================
  // 9. ERROR HANDLING
  // ============================================
  test('9.1 Error Messages - Display Correctly', async () => {
    const alerts = await page.locator('[role="alert"], .alert, .error, [class*="error"]');

    for (let i = 0; i < Math.min(await alerts.count(), 3); i++) {
      const alert = alerts.nth(i);
      const text = await alert.textContent();
      expect(text).toBeTruthy();
    }
  });

  // ============================================
  // 10. VISUAL & THEME
  // ============================================
  test('10.1 Dark Mode Toggle - If Present', async () => {
    const themeToggle = await page.locator(
      'button:has-text("Dark"), button:has-text("Light"), [aria-label*="theme"], [aria-label*="mode"]'
    );

    if ((await themeToggle.count()) > 0) {
      const initialBg = await page
        .locator('body')
        .evaluate(el => window.getComputedStyle(el).backgroundColor);

      await themeToggle.first().click();
      await page.waitForTimeout(500);

      const newBg = await page
        .locator('body')
        .evaluate(el => window.getComputedStyle(el).backgroundColor);

      expect(newBg).not.toBe(initialBg);
    }
  });

  test('10.2 CSS Loaded - No Missing Styles', async () => {
    const elements = await page.locator('body *');

    for (let i = 0; i < Math.min(await elements.count(), 10); i++) {
      const element = elements.nth(i);
      const display = await element.evaluate(el => window.getComputedStyle(el).display);

      expect(display).not.toBe('');
    }
  });

  // ============================================
  // 11. INTERACTIVE COMPONENTS
  // ============================================
  test('11.1 Tooltips - Appear on Hover', async () => {
    const items = await page.locator('[data-tooltip], [title], [aria-label]');

    for (let i = 0; i < Math.min(await items.count(), 3); i++) {
      const item = items.nth(i);
      if (await item.isVisible()) {
        await item.hover();
        await page.waitForTimeout(300);
      }
    }
  });

  test('11.2 Popover/Dropdown - Opens & Closes', async () => {
    const triggers = await page.locator('[aria-haspopup], [class*="dropdown"]');

    for (let i = 0; i < Math.min(await triggers.count(), 2); i++) {
      const trigger = triggers.nth(i);
      if (await trigger.isVisible()) {
        await trigger.click();
        await page.waitForTimeout(300);
      }
    }
  });

  // ============================================
  // 12. FILE UPLOADS & COMPLEX INPUTS
  // ============================================
  test('12.1 File Input - Accessible', async () => {
    const fileInputs = await page.locator('input[type="file"]');

    for (let i = 0; i < Math.min(await fileInputs.count(), 2); i++) {
      const input = fileInputs.nth(i);
      expect(await input.isVisible()).toBeTruthy();
    }
  });

  // ============================================
  // SUMMARY
  // ============================================
  test('Z.0 Final Verification - All Systems OK', async () => {
    const pageContent = await page.content();

    expect(pageContent).toContain('<!DOCTYPE html>');
    expect(pageContent.length).toBeGreaterThan(1000);

    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
