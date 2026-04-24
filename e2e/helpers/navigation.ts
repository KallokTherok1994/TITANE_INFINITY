import { expect, Page } from '@playwright/test';

async function gotoWithRetry(page: Page, path: string, attempts = 3): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(path, { waitUntil: 'load', timeout: 30000 });
      return;
    } catch (error) {
      const message = String(error);
      const transient =
        message.includes('ERR_CONNECTION_REFUSED') ||
        message.includes('ERR_CONNECTION_RESET');
      if (!transient || i === attempts - 1) {
        throw error;
      }
      await page.waitForTimeout(1000 * (i + 1));
    }
  }
}

export async function openTitane(page: Page): Promise<void> {
  await gotoWithRetry(page, '/');

  const mainNav = page.getByRole('navigation', {
    name: /Navigation principale|Main navigation/i,
  });
  await expect(mainNav).toBeVisible({ timeout: 30000 });

  const titaneButton = mainNav.getByRole('button', { name: /^TITANE$/i }).first();
  await expect(titaneButton).toBeVisible({ timeout: 15000 });
  await titaneButton.click({ force: true });

  await expect(page).toHaveURL(/\/titane(\?|$)/, { timeout: 15000 });
}

const ADMIN_TAB_IDS = new Set([
  'system',
  'config',
  'audio',
  'design',
  'governance',
  'anti-regression',
  'production-health',
]);

const isAdminTabId = (value: string): boolean => ADMIN_TAB_IDS.has(value);

export async function openAdminTab(page: Page, tabTarget: string | RegExp): Promise<void> {
  await gotoWithRetry(page, '/admin');

  await closeBootBeaconIfPresent(page);

  const adminHeading = page.getByRole('heading', { name: /^ADMIN$/i });
  await expect(adminHeading).toBeVisible({ timeout: 30000 });

  await closeBootBeaconIfPresent(page);

  const tabsNav = page.locator('nav.admin-tabs');
  await expect(tabsNav).toBeVisible({ timeout: 15000 });

  let tabButton;

  if (typeof tabTarget === 'string') {
    const normalizedTarget = tabTarget.trim().toLowerCase();
    if (isAdminTabId(normalizedTarget)) {
      tabButton = tabsNav.getByTestId(`tab-admin-${normalizedTarget}`).first();
    } else {
      tabButton = tabsNav.getByRole('button', { name: new RegExp(normalizedTarget, 'i') }).first();
    }
  } else {
    tabButton = tabsNav.getByRole('button', { name: tabTarget }).first();
  }

  await expect(tabButton).toBeVisible({ timeout: 15000 });
  await tabButton.scrollIntoViewIfNeeded();
  await tabButton.evaluate(el => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await expect(tabButton).toHaveClass(/admin-tab--active/, { timeout: 15000 });
}

export async function closeBootBeaconIfPresent(page: Page): Promise<void> {
  const beacon = page.locator('#titane-boot-beacon');
  if (!(await beacon.isVisible({ timeout: 250 }).catch(() => false))) {
    return;
  }

  const closeButton = beacon.getByRole('button', { name: /Fermer diagnostic/i }).first();
  if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeButton.click({ force: true }).catch(() => undefined);
  }

  await expect(beacon)
    .toHaveCount(0, { timeout: 2000 })
    .catch(() => undefined);
}
