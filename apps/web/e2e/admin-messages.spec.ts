import { test, expect } from '@playwright/test';

test.describe('Admin messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate logged-in admin for admin routes
    await page.route('**/auth/me', (route) => route.fulfill({ json: { id: 'admin1', email: 'admin@test.dev', role: 'ADMIN' } }));
  });

  test('send broadcast and list conversations', async ({ page }) => {
    // Users list for recipient dropdown
    await page.route('**/admin/conversations**', (route) => route.fulfill({ json: { data: [{ id: 'c1', topic: 'Welcome', isReadOnly: false, isBroadcast: true, updatedAt: new Date().toISOString(), participants: [], lastMessage: { content: 'Hello' } }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } }));

    // Hooks call user list via admin endpoints (mock a minimal response)
    await page.route('**/admin/users**', (route) => route.fulfill({ json: { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } } }));

    // Sending broadcast
    await page.route('**/admin/messages/broadcast**', (route) => route.fulfill({ json: { conversationId: 'c-bc', sentTo: 10 } }));

    await page.goto('/admin/messages');

    // Go to broadcast tab
    await page.getByRole('button', { name: /Broadcast/i }).click();
    await page.getByLabel(/Subject|Objet/i).fill('Hello all');
    await page.locator('#broadcastContent').fill('Welcome to the platform');
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/admin/messages/broadcast') && r.ok()),
      page.getByRole('button', { name: /^Broadcast$/i }).click(),
    ]);
    await expect(page.locator('#broadcastSubject')).toHaveValue('');
    await expect(page.locator('#broadcastContent')).toHaveValue('');

    // Go to conversations tab and see list
    await page.getByRole('button', { name: /Conversations/i }).click();
    await expect(page.getByRole('link', { name: /Welcome/i })).toBeVisible();
  });
});


