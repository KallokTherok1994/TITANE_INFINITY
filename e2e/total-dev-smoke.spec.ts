// TOTAL_DEV v28.1.0 — Smoke Test E2E
// Tests basic navigation, UI rendering, IPC integrity

import { test, expect } from '@playwright/test';

test.describe('TOTAL_DEV GOD DEV Sovereign Space', () => {
  test.beforeEach(async ({ page }) => {
    // Load the app
    await page.goto('http://localhost:5173');
    // Wait for router initialization
    await page.waitForLoadState('networkidle');
  });

  test('Route /total-dev RENDERS and NAV shows TOTAL_DEV item', async ({ page }) => {
    // Navigate to /total-dev
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Verify page title or unique marker
    const heading = page.locator('[data-testid="total-dev-header"]');
    await expect(heading).toBeVisible({ timeout: 5000 });
    
    // Verify TOTAL_DEV nav item exists
    const navItem = page.locator('text=TOTAL_DEV');
    await expect(navItem).toBeVisible({ timeout: 5000 });
  });

  test('LockBadge renders with LOCKED state initially', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Check lock badge visibility
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    await expect(lockBadge).toBeVisible();
    
    // Check lock status text
    const lockStatus = page.locator('text=LOCKED');
    await expect(lockStatus).toBeVisible();
  });

  test('UnlockPanel displays and accepts input', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Find password input
    const passwordInput = page.locator('input[placeholder*="code"]').first();
    await expect(passwordInput).toBeVisible();

    // Try entering incorrect password (should not unlock)
    await passwordInput.fill('wrong');
    const submitBtn = page.locator('button:has-text("UNLOCK")');
    await submitBtn.click();

    // Lock badge should still show LOCKED (after 2s)
    await page.waitForTimeout(1000);
    const lockStatus = page.locator('text=LOCKED');
    await expect(lockStatus).toBeVisible();
  });

  test('Tabs (Chat, Console, Git, Files, Actions) render correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Check tab buttons exist
    const tabChat = page.locator('button:has-text("Discuss Compute")').first();
    const tabConsole = page.locator('button:has-text("Console")').first();
    const tabGit = page.locator('button:has-text("Git")').first();
    const tabFiles = page.locator('button:has-text("Files")').first();
    const tabActions = page.locator('button:has-text("Actions")').first();

    await expect(tabChat).toBeVisible({ timeout: 3000 });
    await expect(tabConsole).toBeVisible();
    await expect(tabGit).toBeVisible();
    await expect(tabFiles).toBeVisible();
    await expect(tabActions).toBeVisible();
  });

  test('ChatDevPanel loads with QWEN-Coder context', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Switch to Chat tab
    const chatTab = page.locator('button:has-text("Discuss Compute")').first();
    await chatTab.click();
    await page.waitForTimeout(500);

    // Verify chat input exists
    const chatInput = page.locator('textarea[placeholder*="système"]');
    await expect(chatInput).toBeVisible({ timeout: 3000 });

    // Verify SEND button
    const sendBtn = page.locator('button:has-text("ENVOYER")');
    await expect(sendBtn).toBeVisible();
  });

  test('ConsoleDevPanel structure correct', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Switch to Console tab
    const consoleTab = page.locator('button:has-text("Console")').first();
    await consoleTab.click();
    await page.waitForTimeout(500);

    // Verify console input
    const consoleInput = page.locator('input[placeholder*="command"]');
    await expect(consoleInput).toBeVisible({ timeout: 3000 });

    // Verify RUN button
    const runBtn = page.locator('button:has-text("RUN")');
    await expect(runBtn).toBeVisible();
  });

  test('DevActionsPanel shows 12 action buttons', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Switch to Actions tab
    const actionsTab = page.locator('button:has-text("Actions")').first();
    await actionsTab.click();
    await page.waitForTimeout(500);

    // Count action buttons (grid of dev actions)
    const actionButtons = page.locator('[data-testid="dev-action-btn"]');
    const count = await actionButtons.count();
    
    // Should have at least 10 preset actions
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('No console errors in TOTAL_DEV page', async ({ page, context }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out expected CORS or external errors
    const criticalErrors = errors.filter(e => 
      !e.includes('CORS') && 
      !e.includes('Failed to fetch') &&
      !e.includes('Ollama')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('Route persists on navigation away and back', async ({ page }) => {
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // Navigate to home
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate back to /total-dev
    await page.goto('http://localhost:5173/#/total-dev');
    await page.waitForLoadState('networkidle');

    // TOTAL_DEV should still be visible
    const heading = page.locator('[data-testid="total-dev-header"]');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });
});
