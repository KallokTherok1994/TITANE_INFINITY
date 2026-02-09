import { expect, Page } from '@playwright/test';

export async function openTitane(page: Page): Promise<void> {
  await page.goto('/');

  const mainNav = page.getByRole('navigation', {
    name: /Navigation principale|Main navigation/i,
  });
  await expect(mainNav).toBeVisible({ timeout: 30000 });

  const titaneButton = mainNav.getByRole('button', { name: /^TITANE$/i }).first();
  await expect(titaneButton).toBeVisible({ timeout: 15000 });
  await titaneButton.click({ force: true });

  await expect(page).toHaveURL(/\/titane(\?|$)/, { timeout: 15000 });
}

export async function openAdminTab(page: Page, tabName: RegExp): Promise<void> {
  await page.goto('/admin');

  await closeBootBeaconIfPresent(page);

  const adminHeading = page.getByRole('heading', { name: /^ADMIN$/i });
  await expect(adminHeading).toBeVisible({ timeout: 30000 });

  await closeBootBeaconIfPresent(page);

  const tabsNav = page.locator('nav.admin-tabs');
  await expect(tabsNav).toBeVisible({ timeout: 15000 });

  const tabButton = tabsNav.getByRole('button', { name: tabName }).first();
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
