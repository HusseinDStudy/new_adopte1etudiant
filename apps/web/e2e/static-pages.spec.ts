import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('About page loads and displays content', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    // Assert against a stable, non-i18n element like the logo
    await expect(page.getByRole('link', { name: /Adopte un Étudiant/i })).toBeVisible();
  });

  test('Cookies policy page loads and displays content', async ({ page }) => {
    await page.goto('/cookies');
    await page.waitForLoadState('domcontentloaded');
    // Assert against a stable, non-i18n element like the logo
    await expect(page.getByRole('link', { name: /Adopte un Étudiant/i })).toBeVisible();
  });
});
