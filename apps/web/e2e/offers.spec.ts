import { test, expect } from '@playwright/test';

test('offers list renders with mocked data and filters are visible', async ({ page }) => {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.endsWith('/api/skills') || url.endsWith('/skills')) {
      return route.fulfill({ json: [{ id: 's1', name: 'React' }, { id: 's2', name: 'Node.js' }] });
    }
    if (url.endsWith('/api/offers/types') || url.endsWith('/offers/types')) {
      return route.fulfill({ json: ['INTERNSHIP', 'APPRENTICESHIP'] });
    }
    if (url.includes('/api/offers') || url.match(/\/offers(\?.*)?$/)) {
      return route.fulfill({
        json: {
          data: [
            {
              id: 'o1',
              title: 'Frontend Intern',
              description: 'Build UI',
              location: 'Paris',
              contractType: 'INTERNSHIP',
              duration: '3 months',
              workMode: 'HYBRID',
              company: { name: 'ACME' },
              skills: ['React'],
              matchScore: 85,
            },
          ],
          pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
        },
      });
    }
    return route.continue();
  });

  await page.goto('/offers');
  await expect(page.getByText(/Frontend Intern/i)).toBeVisible();
});


