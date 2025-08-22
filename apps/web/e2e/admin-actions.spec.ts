import { test, expect } from '@playwright/test';

test.describe('Admin offers/users actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', (route) => route.fulfill({ json: { id: 'admin1', email: 'admin@test.dev', role: 'ADMIN' } }));
  });

  test('admin toggles offer status and deletes offer', async ({ page }) => {
    page.on('request', request => {
      console.log('>>', request.method(), request.url());
    });

    // Specific DELETE route for offer
    await page.route('**/admin/offers/o1', (route) => {
      console.log('Intercepting DELETE request for /admin/offers/o1');
      return route.fulfill({ json: {} });
    });
    // Specific PATCH route for offer status
    await page.route('**/admin/offers/o1/status', (route) => {
      console.log('Intercepting PATCH request for /admin/offers/o1/status');
      return route.fulfill({ json: { id: 'o1', isActive: false } });
    });
    
    // General List offers GET route
    await page.route('**/admin/offers**', (route) => {
      const req = route.request();
      const url = req.url();
      const method = req.method();
      const rt = req.resourceType();
      
      // Do not intercept page navigation or other non-XHR/fetch requests
      if (rt !== 'xhr' && rt !== 'fetch') {
        console.log(`   Continuing non-XHR/fetch request: ${url}`);
        return route.continue();
      }
      
      // Only fulfill the list endpoint (GET requests)
      if (method === 'GET' && url.includes('/admin/offers')) {
        console.log('   Fulfilling GET request for /admin/offers list');
        return route.fulfill({ json: {
          data: [{ id: 'o1', title: 'Offer', description: 'd', company: { companyName: 'ACME', email: 'hr@acme.tld' }, location: 'Paris', duration: '3m', isActive: true, _count: { applications: 0 }, createdAt: new Date().toISOString() }],
          pagination: { page: 1, limit: 15, total: 1, totalPages: 1 }
        } });
      }
      
      // For any other unexpected requests to /admin/offers, let them go through
      console.log(`   Continuing unhandled /admin/offers request: ${method} ${url}`);
      return route.continue();
    });
    
    await page.addInitScript(() => (window as any).confirm = () => true);
    await page.goto('/admin/offers');
    await page.waitForLoadState('domcontentloaded');
    // Wait for list item to render using offer title
    await expect(page.getByText(/^Offer$/)).toBeVisible();
    const toggleBtn = page.locator('button[aria-label*="activ" i], button[title*="activ" i]').first();
    await toggleBtn.waitFor({ state: 'visible' });
    console.log('Clicking toggle button...');
    // Toggle status and wait for API
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/admin/offers/o1/status') && r.request().method() === 'PATCH', { timeout: 90000 }),
      toggleBtn.click(),
    ]);
    console.log('Toggle button clicked, waiting for delete button...');
    const deleteButton = page.locator('button[title*="delete" i], button[aria-label*="supprim" i]').first();
    await deleteButton.waitFor({ state: 'visible' });
    
    // Click delete button and wait for the confirmation dialog
    await deleteButton.click();
    console.log('Delete button clicked, waiting for dialog...');
    // Removed explicit confirm dialog wait, directly targeting confirm button
    const confirmDeleteButton = page.getByRole('button', { name: /Confirmer|Confirm/i });
    await confirmDeleteButton.waitFor({ state: 'visible' });
    console.log('Confirmation button visible, clicking confirm...');
    
    // Delete offer and wait for API
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/admin/offers/o1') && r.request().method() === 'DELETE', { timeout: 120000 }),
      confirmDeleteButton.click(),
    ]);
    console.log('Confirmation clicked, delete API response awaited.');
    await expect(page.getByRole('heading', { name: /Gestion des offres|Offer Management|Offres/i })).toBeVisible();
  }, { timeout: 180000 });

  test('admin updates user status and role', async ({ page }) => {
    // Users list
    await page.route('**/admin/users**', (route) => {
      const req = route.request();
      const url = req.url();
      const rt = req.resourceType();
      if (rt !== 'xhr' && rt !== 'fetch') return route.continue();
      if (url.includes('/admin/users/u1')) return route.continue();
      return route.fulfill({ json: { data: [
        { id: 'u1', email: 'a@b.c', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() }
      ], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 } } });
    });

    // Status
    await page.route('**/admin/users/u1/status', (route) => route.fulfill({ json: {} }));
    // Role
    await page.route('**/admin/users/u1/role', (route) => route.fulfill({ json: {} }));

    await page.addInitScript(() => (window as any).confirm = () => true);
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    const row = page.getByRole('row').filter({ hasText: /a@b.c/ }).first();
    await expect(row).toBeVisible();
    const userToggleBtn = row.locator('button[aria-label*="activ" i], button[title*="activ" i]').first();
    await userToggleBtn.waitFor({ state: 'visible' });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/admin/users/u1/status') && r.request().method() === 'PATCH', { timeout: 90000 }),
      userToggleBtn.click(),
    ]);
    // Open role menu via click and select Admin
    const roleMenuButton = row.locator('button[aria-label*="role" i], [aria-haspopup="menu"], [data-testid="role-menu-button-u1"]').first();
    await roleMenuButton.waitFor({ state: 'visible' });
    await roleMenuButton.click();

    const adminOption = page.getByRole('menuitem', { name: /Administrateur|Administrator|Admin/i }).first();
    await adminOption.waitFor({ state: 'visible' });
    await adminOption.click(); // Click to open the role menu

    // Directly find and click the Confirm button after the role change
    const confirmRoleChangeButton = page.getByRole('button', { name: /Confirmer|Confirm/i });
    await confirmRoleChangeButton.waitFor({ state: 'visible' });

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/admin/users/u1/role') && r.request().method() === 'PATCH', { timeout: 90000 }),
      confirmRoleChangeButton.click(),
    ]);
    await expect(page.getByRole('heading', { name: /Gestion des utilisateurs|User Management|Utilisateurs/i })).toBeVisible();
  }, { timeout: 180000 });
});


