import { test, expect } from '@playwright/test';

test('student can edit profile form fields and submit', async ({ page }) => {
  // Logged-in student
  await page.route('**/auth/me', (route) => route.fulfill({ json: { id: 's1', email: 's@test.dev', role: 'STUDENT', linkedProviders: [], hasPassword: true } }));
  // Stub profile GET/POST to prevent rerenders mid-interaction
  await page.route('**/profile', (route) => {
    const rt = route.request().resourceType();
    if (!(rt === 'xhr' || rt === 'fetch')) return route.continue();
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { email: 's@test.dev', role: 'STUDENT', linkedProviders: [], hasPassword: true } });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({ json: { email: 's@test.dev', role: 'STUDENT', linkedProviders: [], hasPassword: true, firstName: 'Jane', lastName: 'Doe' } });
    }
    return route.continue();
  });
  // ensure only one handler exists for /auth/me (first route above already handles it)

  // Prime auth context
  await page.goto('/dashboard-student');
  await page.waitForLoadState('domcontentloaded');
  await page.goto('/profile');
  await page.waitForLoadState('domcontentloaded');
  // Ensure form field is present instead of waiting for network
  // Sidebar layout may hide the header; ensure student form renders by checking a field label
  await expect(page.getByLabel(/Prénom|First name/i).first()).toBeVisible();
  // Ensure the form has loaded (heading present)
  await expect(page.getByRole('heading', { name: /Profil Étudiant|Student Profile/i })).toBeVisible();
  // Fill by labels; button text is translated via i18n keys
  await page.getByLabel(/Prénom|First name/i).first().click();
  await page.getByLabel(/Prénom|First name/i).first().fill('Jane');
  await page.getByLabel(/Nom|Last name/i).first().click();
  await page.getByLabel(/Nom|Last name/i).first().fill('Doe');
  const [saveRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/profile') && r.request().method() === 'POST' && r.ok()),
    page.getByRole('button', { name: /Enregistrer|Save/i }).click(),
  ]);
  await expect(page).toHaveURL(/profile/);
});


