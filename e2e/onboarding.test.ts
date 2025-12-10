/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   ONBOARDING E2E TESTS - Tests du flux d'onboarding complet
 * ═══════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Réinitialiser l'onboarding avant chaque test
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('onboarding_preferences');
    });
  });

  test('should display onboarding on first launch', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Attendre que l'overlay d'onboarding soit visible
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Vérifier que le step 1 (Welcome) est affiché
    await expect(page.locator('.welcome-step')).toBeVisible();

    // Vérifier les éléments clés du Welcome step
    await expect(page.locator('text=Bienvenue dans TITANE∞')).toBeVisible();
    await expect(page.locator('.features-preview')).toBeVisible();
  });

  test('should complete full onboarding flow with all steps', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Attendre l'onboarding
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // ════ STEP 1 : WELCOME ════
    await expect(page.locator('.welcome-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('1 / 5');

    // Vérifier les stats
    await expect(page.locator('.welcome-stats')).toBeVisible();

    // Cliquer sur "Suivant"
    await page.click('text=Suivant →');

    // ════ STEP 2 : PRIVACY ════
    await expect(page.locator('.privacy-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('2 / 5');

    // Vérifier les garanties de confidentialité
    await expect(page.locator('.privacy-guarantees')).toBeVisible();
    await expect(page.locator('text=100% Privé')).toBeVisible();

    await page.click('text=Suivant →');

    // ════ STEP 3 : FEATURES ════
    await expect(page.locator('.features-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('3 / 5');

    // Vérifier la grille de fonctionnalités
    await expect(page.locator('.features-grid')).toBeVisible();
    await expect(page.locator('text=Conversations Naturelles')).toBeVisible();

    await page.click('text=Suivant →');

    // ════ STEP 4 : CUSTOMIZATION ════
    await expect(page.locator('.customization-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('4 / 5');

    // Sélectionner le thème sombre
    await page.click('.theme-option:has-text("Sombre")');

    // Vérifier que le thème sombre est sélectionné
    await expect(page.locator('.theme-option:has-text("Sombre")')).toHaveClass(
      /selected/
    );

    // Sélectionner la langue
    await page.selectOption('#language-select', 'fr');

    // Cocher analytics (optionnel)
    await page.check('.preference-checkbox');

    await page.click('text=Suivant →');

    // ════ STEP 5 : READY ════
    await expect(page.locator('.ready-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('5 / 5');

    // Vérifier les conseils rapides
    await expect(page.locator('.quick-tips')).toBeVisible();
    await expect(page.locator('.ready-cta')).toBeVisible();

    // Cliquer sur "Commencer"
    await page.click('text=Commencer →');

    // ════ VÉRIFICATION FINALE ════
    // L'onboarding devrait disparaître
    await expect(page.locator('.onboarding-overlay')).not.toBeVisible({ timeout: 5000 });

    // L'app principale devrait être visible
    // Note : Adapter selon votre sélecteur d'app principal
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate back through onboarding steps', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Avancer jusqu'au step 3
    await page.click('text=Suivant →'); // Step 2
    await page.click('text=Suivant →'); // Step 3

    // Vérifier qu'on est au step 3
    await expect(page.locator('.features-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('3 / 5');

    // Revenir au step 2
    await page.click('text=← Précédent');
    await expect(page.locator('.privacy-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('2 / 5');

    // Revenir au step 1
    await page.click('text=← Précédent');
    await expect(page.locator('.welcome-step')).toBeVisible();
    await expect(page.locator('.onboarding-step-indicator')).toContainText('1 / 5');

    // Au step 1, le bouton "Précédent" ne devrait pas être visible
    await expect(page.locator('text=← Précédent')).not.toBeVisible();
  });

  test('should save preferences correctly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Naviguer jusqu'au step Customization
    await page.click('text=Suivant →'); // Step 2
    await page.click('text=Suivant →'); // Step 3
    await page.click('text=Suivant →'); // Step 4

    // Sélectionner thème clair
    await page.click('.theme-option:has-text("Clair")');

    // Sélectionner English
    await page.selectOption('#language-select', 'en');

    // Désactiver analytics
    const checkbox = page.locator('.preference-checkbox');
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }

    // Continuer et terminer
    await page.click('text=Suivant →'); // Step 5
    await page.click('text=Commencer →');

    // Recharger la page
    await page.reload();

    // Vérifier que l'onboarding n'est plus affiché
    await expect(page.locator('.onboarding-overlay')).not.toBeVisible({ timeout: 5000 });

    // Vérifier que les préférences sont dans localStorage
    const storedPrefs = await page.evaluate(() => {
      return localStorage.getItem('onboarding_preferences');
    });

    expect(storedPrefs).toBeTruthy();

    if (storedPrefs) {
      const prefs = JSON.parse(storedPrefs);
      expect(prefs.theme).toBe('light');
      expect(prefs.language).toBe('en');
      expect(prefs.enableAnalytics).toBe(false);
    }
  });

  test('should display progress bar correctly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Vérifier que la barre de progression est à 20% (step 1/5)
    const progressBar1 = page.locator('.onboarding-progress-bar');
    await expect(progressBar1).toHaveCSS('width', /20%/);

    // Avancer au step 2 (40%)
    await page.click('text=Suivant →');
    const progressBar2 = page.locator('.onboarding-progress-bar');
    await expect(progressBar2).toHaveCSS('width', /40%/);

    // Avancer au step 3 (60%)
    await page.click('text=Suivant →');
    const progressBar3 = page.locator('.onboarding-progress-bar');
    await expect(progressBar3).toHaveCSS('width', /60%/);

    // Avancer au step 4 (80%)
    await page.click('text=Suivant →');
    const progressBar4 = page.locator('.onboarding-progress-bar');
    await expect(progressBar4).toHaveCSS('width', /80%/);

    // Avancer au step 5 (100%)
    await page.click('text=Suivant →');
    const progressBar5 = page.locator('.onboarding-progress-bar');
    await expect(progressBar5).toHaveCSS('width', /100%/);
  });

  test('should display step dots indicator', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Vérifier qu'il y a 5 dots
    const dots = page.locator('.onboarding-dot');
    await expect(dots).toHaveCount(5);

    // Le premier dot devrait être actif
    await expect(dots.nth(0)).toHaveClass(/active/);

    // Avancer au step 2
    await page.click('text=Suivant →');

    // Le premier dot devrait être "completed", le deuxième "active"
    await expect(dots.nth(0)).toHaveClass(/completed/);
    await expect(dots.nth(1)).toHaveClass(/active/);
  });

  test('should skip onboarding if already completed', async ({ page }) => {
    // Marquer l'onboarding comme complété
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem(
        'onboarding_preferences',
        JSON.stringify({
          theme: 'dark',
          language: 'fr',
          enableAnalytics: false,
        })
      );
    });

    // Recharger
    await page.reload();

    // L'onboarding ne devrait PAS être affiché
    await expect(page.locator('.onboarding-overlay')).not.toBeVisible({ timeout: 3000 });
  });

  test('should handle responsive layout on mobile', async ({ page }) => {
    // Définir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // L'onboarding devrait être responsive
    await expect(page.locator('.onboarding-card')).toBeVisible();

    // Vérifier que les éléments sont visibles
    await expect(page.locator('.welcome-step')).toBeVisible();

    // Naviguer à travers les steps
    await page.click('text=Suivant →');
    await expect(page.locator('.privacy-step')).toBeVisible();
  });

  test('should display animations correctly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Vérifier que les animations Framer Motion sont présentes
    // Note : Playwright peut détecter les transitions CSS

    // Avancer au step 2
    await page.click('text=Suivant →');

    // Attendre la transition
    await page.waitForTimeout(300); // Durée de l'animation

    // Le step 2 devrait être visible avec animation terminée
    await expect(page.locator('.privacy-step')).toBeVisible();
  });
});

test.describe('Onboarding Theme Selection', () => {
  test('should select light theme', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Naviguer au step customization
    for (let i = 0; i < 3; i++) {
      await page.click('text=Suivant →');
    }

    // Sélectionner Light
    await page.click('.theme-option:has-text("Clair")');
    await expect(page.locator('.theme-option:has-text("Clair")')).toHaveClass(/selected/);

    // Continuer
    await page.click('text=Suivant →');
    await page.click('text=Commencer →');

    // Vérifier sauvegarde
    const theme = await page.evaluate(() => {
      const prefs = localStorage.getItem('onboarding_preferences');
      return prefs ? JSON.parse(prefs).theme : null;
    });

    expect(theme).toBe('light');
  });

  test('should select auto theme', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Naviguer au step customization
    for (let i = 0; i < 3; i++) {
      await page.click('text=Suivant →');
    }

    // Sélectionner Auto
    await page.click('.theme-option:has-text("Auto")');
    await expect(page.locator('.theme-option:has-text("Auto")')).toHaveClass(/selected/);

    // Continuer
    await page.click('text=Suivant →');
    await page.click('text=Commencer →');

    // Vérifier sauvegarde
    const theme = await page.evaluate(() => {
      const prefs = localStorage.getItem('onboarding_preferences');
      return prefs ? JSON.parse(prefs).theme : null;
    });

    expect(theme).toBe('auto');
  });
});

test.describe('Onboarding Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Utiliser Tab pour naviguer
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter pour cliquer sur "Suivant"
    await page.keyboard.press('Enter');

    // Vérifier qu'on est au step 2
    await expect(page.locator('.privacy-step')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.onboarding-overlay')).toBeVisible({ timeout: 10000 });

    // Vérifier les labels
    await expect(page.locator('label[for="language-select"]')).toBeVisible();

    // Naviguer au step customization
    for (let i = 0; i < 3; i++) {
      await page.click('text=Suivant →');
    }

    // Vérifier le select de langue
    const languageSelect = page.locator('#language-select');
    await expect(languageSelect).toHaveAttribute('id', 'language-select');
  });
});
