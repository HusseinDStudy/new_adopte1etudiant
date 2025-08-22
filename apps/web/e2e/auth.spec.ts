import { test, expect } from '@playwright/test';

test('login > 2FA flow via mocked API', async ({ page }) => {
  let loggedIn = false;
  await page.route('**/auth/login', (route) => route.fulfill({ json: { twoFactorRequired: true } }));
  await page.route('**/auth/login/verify-2fa', (route) => { loggedIn = true; return route.fulfill({ json: { ok: true } }); });
  await page.route('**/auth/me', (route) => {
    if (loggedIn) return route.fulfill({ json: { id: 'u1', email: 'user@test.dev', role: 'STUDENT' } });
    return route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
  });

  await page.goto('/login');
  // robust selectors tolerant to locale
  await page.getByPlaceholder(/Enter your email|Saisissez votre adresse email/i).fill('user@test.dev');
  await page.getByPlaceholder(/Enter your password|Saisissez votre mot de passe/i).fill('secret');
  await page.getByRole('button', { name: /Sign in|Se connecter/i }).click();
  await expect(page.getByText(/Two-Factor Authentication|Authentification à deux facteurs/i)).toBeVisible();
  await page.getByLabel(/Verification code|Code de vérification/i).fill('123456');
  await page.getByRole('button', { name: /Verify|Vérifier/i }).click();
  await expect(page).toHaveURL(/\/?$/);
});


