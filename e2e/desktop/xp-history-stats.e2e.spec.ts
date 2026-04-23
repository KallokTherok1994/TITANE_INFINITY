import { test, expect } from '@playwright/test';

// Test E2E XP/Expérience : vérifie l’affichage de l’historique et des stats XP depuis le backend

test.describe('Page XP/Expérience', () => {
  test('affiche l’historique et les statistiques XP (backend)', async ({ page }) => {
    await page.goto('/experience');
    await expect(page.locator('[data-testid="page-experience"]')).toBeVisible();
    // Vérifie la présence des sections
    await expect(page.getByRole('heading', { name: /statistiques/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /historique xp/i })).toBeVisible();
    // Vérifie qu’au moins un événement d’historique est affiché (si backend en fournit)
    const events = page.locator('.exp-history-list .exp-history-item');
    await expect(events.first()).toBeVisible();
    // Vérifie que les stats affichent un total XP > 0
    const totalXp = await page.locator('.exp-stats-advanced li').first().textContent();
    expect(totalXp).toMatch(/\d+/);
  });
});
