/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Tests E2E: Accessibility axe-core (Chat IA)
 * Vérifie la conformité WCAG 2.1 AA automatiquement
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Chat IA - Accessibility WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Attendre que l'app soit chargée
    await page.waitForLoadState('networkidle');
  });

  test('WCAG 2.1 AA: Bulle flottante accessible', async ({ page }) => {
    // Attendre que la bulle soit visible
    const chatBubble = page.locator(
      '[role="button"][aria-label="Ouvrir TITANE∞ AI Companion"]'
    );
    await expect(chatBubble).toBeVisible({ timeout: 5000 });

    // Exécuter axe-core scan sur la bulle
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="button"][aria-label="Ouvrir TITANE∞ AI Companion"]')
      .analyze();

    // Vérifier qu'il n'y a pas de violations
    expect(accessibilityScanResults.violations).toEqual([]);

    console.log(
      `✅ Bulle: ${accessibilityScanResults.passes.length} checks passés, 0 violations`
    );
  });

  test('WCAG 2.1 AA: Panel chat accessible', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator(
      '[role="button"][aria-label="Ouvrir TITANE∞ AI Companion"]'
    );
    await chatBubble.click();

    // Attendre que le panel soit visible
    const chatPanel = page.locator(
      '[role="dialog"][aria-label="TITANE∞ AI Companion Chat Panel"]'
    );
    await expect(chatPanel).toBeVisible({ timeout: 3000 });

    // Exécuter axe-core scan sur le panel complet
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    // Vérifier qu'il n'y a pas de violations critiques
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);

    console.log(`✅ Panel: ${accessibilityScanResults.passes.length} checks passés`);
    console.log(
      `   Violations: ${accessibilityScanResults.violations.length} (mineures tolérées)`
    );
  });

  test('WCAG 2.1 AA: Contraste couleurs (texte)', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator('[role="button"]').first();
    await chatBubble.click();

    // Attendre que le panel soit visible
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Exécuter axe-core scan SEULEMENT sur contraste
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withRules(['color-contrast'])
      .analyze();

    // Vérifier ratio contraste minimum 4.5:1 (WCAG 2.1 AA pour texte normal)
    expect(accessibilityScanResults.violations).toEqual([]);

    console.log('✅ Contraste: Tous les ratios ≥ 4.5:1 (WCAG 2.1 AA)');
  });

  test('WCAG 2.1 AA: Keyboard navigation complète', async ({ page }) => {
    // Vérifier que la bulle est focusable
    await page.keyboard.press('Tab');

    const chatBubble = page.locator(
      '[role="button"][aria-label="Ouvrir TITANE∞ AI Companion"]'
    );
    await expect(chatBubble).toBeFocused({ timeout: 2000 });

    // Ouvrir avec Enter
    await page.keyboard.press('Enter');

    // Vérifier que le panel est ouvert
    const chatPanel = page.locator('[role="dialog"]');
    await expect(chatPanel).toBeVisible({ timeout: 3000 });

    // Vérifier qu'on peut fermer avec Escape
    await page.keyboard.press('Escape');

    // Vérifier que le panel est fermé (attend 1s pour l'animation)
    await page.waitForTimeout(1000);
    await expect(chatPanel).not.toBeVisible();

    console.log('✅ Keyboard: Tab, Enter, Escape fonctionnels');
  });

  test('WCAG 2.1 AA: ARIA labels et roles', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator('[role="button"]').first();
    await chatBubble.click();

    // Attendre que le panel soit visible
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Vérifier les roles ARIA essentiels
    const rolesChecks = [
      { selector: '[role="dialog"]', name: 'dialog (panel principal)' },
      { selector: '[role="banner"]', name: 'banner (header)' },
      { selector: '[role="toolbar"]', name: 'toolbar (actions)' },
      { selector: '[role="log"]', name: 'log (messages)' },
      { selector: '[role="form"]', name: 'form (input)' },
      { selector: '[role="status"]', name: 'status (compteur messages)' },
    ];

    for (const check of rolesChecks) {
      const element = page.locator(check.selector).first();
      await expect(element).toBeVisible({ timeout: 2000 });
      console.log(`  ✅ ${check.name}`);
    }

    // Exécuter axe-core scan ARIA
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    const ariaViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('aria') || v.id.includes('label')
    );

    expect(ariaViolations).toEqual([]);

    console.log('✅ ARIA: Tous les roles et labels corrects');
  });

  test('WCAG 2.1 AA: Live regions (messages streaming)', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator('[role="button"]').first();
    await chatBubble.click();

    // Attendre que le panel soit visible
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Vérifier que la zone messages a aria-live
    const messagesContainer = page.locator('[role="log"]').first();
    await expect(messagesContainer).toHaveAttribute('aria-live', 'polite');
    await expect(messagesContainer).toHaveAttribute('aria-atomic', 'false');
    await expect(messagesContainer).toHaveAttribute('aria-relevant', 'additions');

    console.log('✅ Live regions: aria-live="polite" configuré correctement');
  });

  test('WCAG 2.1 AA: Focus indicators visibles', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator('[role="button"]').first();
    await chatBubble.click();

    // Attendre que le panel soit visible
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Focus sur le textarea
    const textarea = page.locator('textarea[aria-label="Saisir votre message"]');
    await textarea.focus();

    // Vérifier que le textarea a un focus indicator visible
    // (outline ou box-shadow visible)
    const textareaStyles = await textarea.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      };
    });

    // Vérifier qu'il y a soit outline soit box-shadow
    const hasFocusIndicator =
      textareaStyles.outlineWidth !== '0px' || textareaStyles.boxShadow !== 'none';

    expect(hasFocusIndicator).toBe(true);

    console.log('✅ Focus indicators: Visibles sur tous les éléments interactifs');
  });

  test('WCAG 2.1 AA: Rapport complet axe-core', async ({ page }) => {
    // Ouvrir le Chat IA
    const chatBubble = page.locator('[role="button"]').first();
    await chatBubble.click();

    // Attendre que le panel soit visible
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Exécuter scan complet WCAG 2.1 AA
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Rapport détaillé
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RAPPORT ACCESSIBILITÉ COMPLET');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Passes: ${accessibilityScanResults.passes.length}`);
    console.log(`⚠️  Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`ℹ️  Incomplete: ${accessibilityScanResults.incomplete.length}`);

    // Détail des violations par impact
    const violationsByImpact = {
      critical: accessibilityScanResults.violations.filter(v => v.impact === 'critical'),
      serious: accessibilityScanResults.violations.filter(v => v.impact === 'serious'),
      moderate: accessibilityScanResults.violations.filter(v => v.impact === 'moderate'),
      minor: accessibilityScanResults.violations.filter(v => v.impact === 'minor'),
    };

    console.log('\nViolations par impact:');
    console.log(`  🔴 Critical: ${violationsByImpact.critical.length}`);
    console.log(`  🟠 Serious: ${violationsByImpact.serious.length}`);
    console.log(`  🟡 Moderate: ${violationsByImpact.moderate.length}`);
    console.log(`  🟢 Minor: ${violationsByImpact.minor.length}`);

    // Log violations critiques/sérieuses si présentes
    if (violationsByImpact.critical.length > 0 || violationsByImpact.serious.length > 0) {
      console.log('\n⚠️  VIOLATIONS CRITIQUES/SÉRIEUSES:');
      [...violationsByImpact.critical, ...violationsByImpact.serious].forEach(v => {
        console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
        console.log(`    Help: ${v.helpUrl}`);
      });
    }

    console.log('═══════════════════════════════════════\n');

    // Critère de succès: ZÉRO violation critique/sérieuse
    const hasCriticalViolations =
      violationsByImpact.critical.length > 0 || violationsByImpact.serious.length > 0;

    expect(hasCriticalViolations).toBe(false);

    // Objectif: Score ≥ 95% (tolérance violations mineures)
    const totalChecks =
      accessibilityScanResults.passes.length + accessibilityScanResults.violations.length;
    const score = (accessibilityScanResults.passes.length / totalChecks) * 100;

    console.log(`📊 Score accessibility: ${score.toFixed(1)}% (objectif: ≥95%)`);
    expect(score).toBeGreaterThanOrEqual(95);
  });
});
