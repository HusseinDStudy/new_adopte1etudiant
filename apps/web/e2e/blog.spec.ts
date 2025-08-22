import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', (route) => route.fulfill({ status: 401, json: { message: 'Unauthorized' } }));
  });

  test('blog list renders with featured and posts', async ({ page }) => {
    await page.route('**/blog/categories', (route) => route.fulfill({ json: [{ id: 'c1', name: 'General' }] }));
    await page.route('**/blog/posts?featured=true**', (route) => route.fulfill({ json: { posts: [{ id: 'p1', title: 'Featured Post', slug: 'featured-post', excerpt: 'E', author: 'A', createdAt: new Date().toISOString(), status: 'PUBLISHED', featured: true, readTimeMinutes: 4 }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }));
    await page.route('**/blog/posts**', (route) => route.fulfill({ json: { posts: [{ id: 'p2', title: 'First Post', slug: 'first-post', excerpt: 'X', author: 'A', createdAt: new Date().toISOString(), status: 'PUBLISHED', featured: false, readTimeMinutes: 5 }], pagination: { page: 1, limit: 9, total: 1, totalPages: 1 } } }));

    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /Featured Article|Article mis en avant/i })).toBeVisible();
    // Disambiguate: main grid link with exact name
    await expect(page.getByRole('link', { name: /^First Post$/ })).toBeVisible();
  });

  test('blog post details renders with related posts', async ({ page }) => {
    await page.route('**/blog/posts/hello-world', (route) => route.fulfill({ json: { id: 'p3', title: 'Hello World', slug: 'hello-world', excerpt: 'E', content: '<p>Content</p>', contentFormat: 'HTML', author: 'A', createdAt: new Date().toISOString(), status: 'PUBLISHED', featured: false, readTimeMinutes: 3 } }));
    await page.route('**/blog/posts/hello-world/related**', (route) => route.fulfill({ json: [{ id: 'p4', title: 'Another', slug: 'another', excerpt: 'Y', createdAt: new Date().toISOString(), status: 'PUBLISHED' }] }));
    await page.route('**/blog/categories', (route) => route.fulfill({ json: [{ id: 'c1', name: 'General' }] }));

    await page.goto('/blog/hello-world');
    await expect(page.getByRole('heading', { name: /Hello World/i })).toBeVisible();
    await expect(page.locator('article').getByText(/Content/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Another/i })).toBeVisible();
  });
});


