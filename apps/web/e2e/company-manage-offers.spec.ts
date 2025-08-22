import { test, expect } from '@playwright/test';

const mockCompanyUser = {
  id: 'c1',
  email: 'company@test.dev',
  role: 'COMPANY',
};

const mockMyOffers = [
  {
    id: 'cmem0wr0e0019mic2w83rbsys',
    title: 'Software Engineer Internship',
    description: 'A great opportunity for software engineering students.',
    location: 'Paris',
    duration: '6 months',
    skills: [
      'React',
      'Node.js',
      'TypeScript'
    ],
    _count: {
      applications: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cmem0wr0b0017mic2rlu8gn18',
    title: 'Product Manager Apprentice',
    description: 'Work on exciting product features.',
    location: 'Remote',
    duration: '12 months',
    skills: [
      'Product Management',
      'Agile'
    ],
    _count: {
      applications: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];
const mockOffers = [
  {
    id: 'cmem0wr0e0019mic2w83rbsys',
    title: 'Software Engineer Internship',
    description: 'A great opportunity for software engineering students.',
    location: 'Paris',
    duration: '6 months',
    skills: ['React', 'Node.js', 'TypeScript'],
    company: {
      id: 'cmem0wqsv000kmic2vgzsnsa2',
      name: 'Test Company A',
      sector: 'Tech',
      contactEmail: 'contact@testco.dev',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    matchScore: 0,
  },
  {
    id: 'cmem0wr0b0017mic2rlu8gn18',
    title: 'Product Manager Apprentice',
    description: 'Work on exciting product features.',
    location: 'Remote',
    duration: '12 months',
    skills: ['Product Management', 'Agile'],
    company: {
      id: 'cmem0wqsv000kmic2vg4cnsa2',
      name: 'Test Company A',
      sector: 'Tech',
      contactEmail: 'contact@testco.dev',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    matchScore: 0,
  },
];
test.describe('Company Offer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log all console messages from the page
    page.on('console', (msg) => console.log(`[Browser Console]: ${msg.text()}`));
    // Log all network requests
    page.on('request', (request) => console.log(`[Browser Request]: ${request.method()} ${request.url()}`));

    // --- API Mocks (ensure these are at the top) ---

    // Mock authenticated Company user
    await page.route('**/auth/me', (route) => route.fulfill({ json: mockCompanyUser }));

    // Add mock for /companies/stats
    await page.route('**/api/companies/stats', (route) => route.fulfill({
      json: {
        totalOffers: 2,
        totalApplications: 0,
        applicationsByStatus: {},
        adoptionRequestsSent: 0,
      },
    }));

    // Mock listMyOffers API call for when we land on the /company/offers page
    await page.route('**/api/offers/my-offers', (route) => {
      route.fulfill({
        json: mockMyOffers,
      });
    });
    
    // Mock getOfferApplications API call for when we land on the /company/offers page
    const firstOffer = mockMyOffers[0];
    await page.route(`**/api/offers/${firstOffer.id}/applications`, (route) => {
      route.fulfill({
        json: { applications: [] },
      });
    });

    // Mock getOfferById API call for when we land on the /company/offers page
    await page.route(`**/api/offers/${firstOffer.id}`, (route) => {
      const offerId = firstOffer.id;
      const offer = mockOffers.find(o => o.id === offerId);
      route.fulfill({
        json: offer,
      });
    });

    // --- End API Mocks ---

    await page.goto('/'); // Start from home page
    await page.waitForLoadState('networkidle');

    // Click on Dashboard link in Header
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await page.waitForURL('**/dashboard-company'); // Wait for redirection to company dashboard

    // Click on Gestion des offres link in Sidebar
    await page.getByRole('link', { name: /Gestion des offres|Manage Offers/i }).click();
    await page.waitForURL('**/company/offers'); // Wait for navigation to manage offers page

  });

  test('company can view their offers', async ({ page }) => {
    // Assert the page title
    await expect(page.getByRole('heading', { name: /Manage Your Offers|Gestion de vos offres/i })).toBeVisible();
    
    // Assert that mocked offers are displayed
    await expect(page.getByRole('heading', { name: 'Software Engineer Internship' })).toBeVisible();
    await expect(page.getByText('A great opportunity for')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Manager Apprentice' })).toBeVisible();
    await expect(page.getByText('Work on exciting product features.')).toBeVisible();

    // Assert that the number of applications for each offer is visible
    await expect(page.locator('div').filter({ hasText: /^0 Applications$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^0 Applications$/ }).nth(1)).toBeVisible();

    // Assert that action buttons (Edit, Delete, View Applicants) are visible for the first offer
    await expect(page.getByRole('link', { name: /Edit|Modifier/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete|Supprimer/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View Applicants|Voir les candidatures/i }).first()).toBeVisible();
  });

  test('company can view a single offer details', async ({ page }) => {
    const firstOffer = mockMyOffers[0];
    // Verify offer details
    await expect(page.locator('.p-6').first().getByRole('heading', { name: firstOffer.title })).toBeVisible();
    await expect(page.locator('.p-6').first().getByText(`📍 ${firstOffer.location}`)).toBeVisible();
    await expect(page.locator('.p-6').first().getByText(`⏰ ${firstOffer.duration}`)).toBeVisible();
    for (const skill of firstOffer.skills) {
      await expect(page.locator('.p-6').first().getByText(skill)).toBeVisible();
    }
    await expect(page.locator('.p-6').first().getByText(firstOffer.description.split('\n')[0])).toBeVisible(); // Check first paragraph of description
  });

  test('company can view the applications of an offer', async ({ page }) => {
    const firstOffer = mockMyOffers[0];
    await page.getByRole('link', { name: /View Applicants|Voir les candidatures/i }).first().click();
    await page.waitForURL(`**/offers/${firstOffer.id}/applications`);
    await expect(page.getByRole('heading', { name: 'Applicants for Software Engineer Internship' })).toBeVisible();
    await expect(page.getByText('No applications yet')).toBeVisible();
    await expect(page.getByText('When students apply to this offer, they will appear here.')).toBeVisible();
  });
});
