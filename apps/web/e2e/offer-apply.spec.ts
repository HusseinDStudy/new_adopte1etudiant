import { test, expect } from '@playwright/test';

test('student can apply to offer from details page', async ({ page }) => {
  // Logged-in student
  await page.route('**/auth/me', (route) => {
    const rt = route.request().resourceType();
    if (rt === 'xhr' || rt === 'fetch') {
      return route.fulfill({ json: { id: 's1', email: 's@test.dev', role: 'STUDENT' } });
    }
    return route.continue();
  });
  // Offer details
  await page.route('**/offers/o1', (route) => {
    const rt = route.request().resourceType();
    if ((rt === 'xhr' || rt === 'fetch') && route.request().method() === 'GET') {
      return route.fulfill({ json: { id: 'o1', title: 'Frontend Intern', description: 'Desc', location: 'Paris', duration: '3 months', company: { name: 'ACME' }, skills: ['React'] } });
    }
    return route.continue();
  });
  // Applied ids check -> none
  await page.route('**/applications/my-applications', (route) => {
    const rt = route.request().resourceType();
    if (rt === 'xhr' || rt === 'fetch') {
      return route.fulfill({ json: { applications: [] } });
    }
    return route.continue();
  });
  // Apply endpoint
  await page.route('**/applications', (route) => {
    const rt = route.request().resourceType();
    if ((rt === 'xhr' || rt === 'fetch') && route.request().method() === 'POST') {
      return route.fulfill({ json: { ok: true } });
    }
    return route.continue();
  });

  // Prime auth context on a protected route to ensure isAuthenticated=true before visiting public details
  await page.goto('/dashboard-student');
  await page.waitForLoadState('domcontentloaded');
  // Now visit offer details
  await page.goto('/offers/o1');
  await page.waitForLoadState('domcontentloaded');
  // Ensure details loaded by title
  await expect(page.getByText('Frontend Intern')).toBeVisible();
  // Button uses t('offerDetails.applyNow'); if aria-label fails, match by text
  const applyButton = page.locator('button[aria-label*="Apply" i], button[aria-label*="Postuler" i], button:has-text("Apply Now"), button:has-text("Postuler")').first();
  await expect(applyButton).toBeVisible();
  const [applyRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/applications') && r.request().method() === 'POST'),
    applyButton.click(),
  ]);
  await expect(page.getByText(/submitted|envoyée/i)).toBeVisible();
});


