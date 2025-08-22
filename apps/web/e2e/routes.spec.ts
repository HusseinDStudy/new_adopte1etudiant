import { test, expect } from '@playwright/test';

test('protected route redirects unauthenticated to login', async ({ page }) => {
  await page.route('**/auth/me', async (route) => {
    return route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
  });
  await page.goto('/dashboard-student');
  await expect(page).toHaveURL(/\/login/);
});


