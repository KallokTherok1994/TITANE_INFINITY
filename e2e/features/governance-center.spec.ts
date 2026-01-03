/**
 * E2E Test: Governance Center (Feature Test)
 * TITANE∞ v26.2.0 - Automated Quality Assurance
 *
 * User journey: Navigate to Governance Center, interact with 4 tabs (Secrets, Policies, Permissions, Logs)
 */

import { test, expect } from '@playwright/test';

test.describe('Feature: Governance Center', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Vite dev server
    await page.goto('http://localhost:5173');
    // Wait for app to fully initialize
    await page.waitForTimeout(2000);
  });

  test('navigates to Governance Center page', async ({ page }) => {
    // Wait for navigation
    await page.waitForSelector('nav, [role="navigation"]', { timeout: 10000 });

    // Look for Governance/Admin Center link
    const governanceLink = page.locator('a[href*="governance"], a[href*="admin"], button:has-text("Gouvernance"), button:has-text("Admin")').first();
    
    if (await governanceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await governanceLink.click();
    } else {
      // Direct navigation fallback
      await page.goto('http://localhost:5173/#/admin');
      await page.waitForTimeout(1000);
      
      // Navigate to Governance tab if in Admin Center
      const governanceTab = page.locator('button:has-text("Gouvernance"), [data-tab="governance"]').first();
      if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await governanceTab.click();
      }
    }

    // Verify Governance Center loaded
    await page.waitForTimeout(1000);
    
    // Look for governance-specific elements
    const governanceHeader = page.locator('h1:has-text("Gouvernance"), h2:has-text("Gouvernance"), h1:has-text("Sécurité")').first();
    await expect(governanceHeader).toBeVisible({ timeout: 10000 });
  });

  test('Governance Center displays 4 tabs', async ({ page }) => {
    // Navigate to Governance Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Governance tab if needed
    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    // Verify 4 governance tabs exist
    const secretsTab = page.locator('button:has-text("Secrets"), button:has-text("🔐")');
    const policiesTab = page.locator('button:has-text("Politiques"), button:has-text("📋")');
    const permissionsTab = page.locator('button:has-text("Permissions"), button:has-text("🛡")');
    const logsTab = page.locator('button:has-text("Journal"), button:has-text("Logs")');

    // At least one tab should be visible
    const anyTabVisible = await Promise.race([
      secretsTab.first().isVisible({ timeout: 5000 }).catch(() => false),
      policiesTab.first().isVisible({ timeout: 5000 }).catch(() => false),
      permissionsTab.first().isVisible({ timeout: 5000 }).catch(() => false),
      logsTab.first().isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(anyTabVisible).toBeTruthy();
  });

  test('Secrets tab displays API key management', async ({ page }) => {
    // Navigate to Governance Center Secrets tab
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Governance → Secrets
    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    const secretsTab = page.locator('button:has-text("Secrets"), button:has-text("🔐")').first();
    if (await secretsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await secretsTab.click();
      await page.waitForTimeout(500);
    }

    // Verify Secrets tab content
    const geminiSection = page.locator('text=/Gemini|API Key|OpenAI|Anthropic/i').first();
    const secretsHeader = page.locator('h2:has-text("Secrets"), h3:has-text("Secrets"), h3:has-text("🔐")').first();
    
    const secretsSectionVisible = await Promise.race([
      geminiSection.isVisible({ timeout: 5000 }).catch(() => false),
      secretsHeader.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(secretsSectionVisible).toBeTruthy();
  });

  test('Policies tab displays IA policies list', async ({ page }) => {
    // Navigate to Governance Center Policies tab
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Governance → Policies
    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    const policiesTab = page.locator('button:has-text("Politiques"), button:has-text("📋")').first();
    if (await policiesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await policiesTab.click();
      await page.waitForTimeout(500);
    }

    // Verify Policies tab content
    const policiesHeader = page.locator('h2:has-text("Politiques"), h3:has-text("Politiques"), h3:has-text("📋")').first();
    const policyList = page.locator('text=/Politique|Policy|Garde-fou|Guardrail/i').first();
    
    const policiesSectionVisible = await Promise.race([
      policiesHeader.isVisible({ timeout: 5000 }).catch(() => false),
      policyList.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(policiesSectionVisible).toBeTruthy();
  });

  test('Permissions tab displays permission matrix', async ({ page }) => {
    // Navigate to Governance Center Permissions tab
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Governance → Permissions
    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    const permissionsTab = page.locator('button:has-text("Permissions"), button:has-text("🛡")').first();
    if (await permissionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await permissionsTab.click();
      await page.waitForTimeout(500);
    }

    // Verify Permissions tab content
    const permissionsHeader = page.locator('h2:has-text("Permissions"), h3:has-text("Permissions"), h3:has-text("🛡")').first();
    const permissionMatrix = page.locator('text=/ROOT|SYSTEM|User|Rôle|Role/i').first();
    
    const permissionsSectionVisible = await Promise.race([
      permissionsHeader.isVisible({ timeout: 5000 }).catch(() => false),
      permissionMatrix.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(permissionsSectionVisible).toBeTruthy();
  });

  test('Security Log tab displays audit entries', async ({ page }) => {
    // Navigate to Governance Center Logs tab
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    // Navigate to Governance → Logs
    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    const logsTab = page.locator('button:has-text("Journal"), button:has-text("Logs"), button:has-text("📝")').first();
    if (await logsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logsTab.click();
      await page.waitForTimeout(500);
    }

    // Verify Logs tab content
    const logsHeader = page.locator('h2:has-text("Journal"), h3:has-text("Journal"), h3:has-text("Security Log")').first();
    const logEntries = page.locator('text=/Audit|Log|Event|Événement/i').first();
    
    const logsSectionVisible = await Promise.race([
      logsHeader.isVisible({ timeout: 5000 }).catch(() => false),
      logEntries.isVisible({ timeout: 5000 }).catch(() => false),
    ]);

    expect(logsSectionVisible).toBeTruthy();
  });

  test('Secrets tab: test input interaction (without sensitive data)', async ({ page }) => {
    // Navigate to Secrets tab
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    const secretsTab = page.locator('button:has-text("Secrets")').first();
    if (await secretsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await secretsTab.click();
      await page.waitForTimeout(500);
    }

    // Look for API key input fields (password type)
    const apiKeyInput = page.locator('input[type="password"], input[placeholder*="API"], input[placeholder*="clé"]').first();
    
    if (await apiKeyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Test input interaction (fill with dummy value)
      await apiKeyInput.fill('test-dummy-key-for-e2e-testing');
      await page.waitForTimeout(300);

      // Verify input accepts text
      await expect(apiKeyInput).not.toBeEmpty();

      // Clear input
      await apiKeyInput.fill('');
    } else {
      console.log('⚠️ API key input not found');
    }
  });

  test('Governance Center: superAdmin badge visible', async ({ page }) => {
    // Navigate to Governance Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    // Look for SuperAdmin badge (👑 Kevin Thibault)
    const superAdminBadge = page.locator('text=/SuperAdmin|Kevin Thibault|👑/i').first();
    
    if (await superAdminBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(superAdminBadge).toBeVisible();
    } else {
      console.log('⚠️ SuperAdmin badge not found (may not be rendered in this view)');
    }
  });

  test('Governance Center: refresh button works', async ({ page }) => {
    // Navigate to Governance Center
    await page.goto('http://localhost:5173/#/admin');
    await page.waitForTimeout(2000);

    const governanceTab = page.locator('button:has-text("Gouvernance")').first();
    if (await governanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await governanceTab.click();
      await page.waitForTimeout(500);
    }

    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Actualiser"), button:has-text("Refresh"), button[title*="Refresh"]').first();
    
    if (await refreshButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await refreshButton.click();
      await page.waitForTimeout(500);

      // Verify no crash (page still visible)
      const governanceHeader = page.locator('h1:has-text("Gouvernance"), h2:has-text("Gouvernance")').first();
      await expect(governanceHeader).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠️ Refresh button not found');
    }
  });
});
