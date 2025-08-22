import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/me', (route) => route.fulfill({ status: 401, json: { message: 'Unauthorized' } }));
});

test('home page loads and can navigate to offers', async ({ page }) => {
  await page.goto('/');
  // Assert stable hero heading or nav landmark to avoid brittle title checks
  await expect(page.getByRole('heading', { name: /Campus|Entreprise|Adopte|Étudiant/i })).toBeVisible();
  await page.getByRole('link', { name: /Offers|Offres/i }).first().click();
  await expect(page).toHaveURL(/.*\/offers/);
});

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /Sign in|Se connecter/i })).toBeVisible();
});


