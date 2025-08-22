import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'jest-axe'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React from 'react';

// Mock apiClient globally
vi.mock('../services/apiClient', () => {
  const mockApiClient = {
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  };
  return { default: mockApiClient };
});

// Mock services that use apiClient
vi.mock('../services/skillService', () => ({
  getAllSkills: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../services/studentService', () => ({
  listAvailableStudents: vi.fn(() => Promise.resolve([])),
  getStudentProfile: vi.fn(() => Promise.resolve({})),
}));

vi.mock('i18next', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    t: (key: string) => {
      if (key === 'offers.others') return 'others';
      return key;
    },
  };
});

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers)
expect.extend(toHaveNoViolations)
expect.extend({ ...matchers } as any)

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    debug: false,
    resources: {
      en: {
        translation: { /* Your English translations */
          'contact.pageTitle': 'Contact Us',
          'dashboardStudent.recentApplications': 'Recent Applications',
          'dashboardStudent.offers': 'Offers',
          'dashboardStudent.noApplications': 'No applications yet.',
          'dashboardStudent.noOffers': 'No offers yet.',
          'dashboardStudent.title': 'Dashboard',
          'offers.others': 'others',
        },
      },
      fr: {
        translation: { /* Your French translations */
          'contact.pageTitle': 'Nous Contacter',
          'dashboardStudent.recentApplications': 'Candidatures Récentes',
          'dashboardStudent.offers': 'Offres',
          'dashboardStudent.noApplications': 'Pas encore de candidatures.',
          'dashboardStudent.noOffers': 'Pas encore d\'offres.',
          'dashboardStudent.title': 'Tableau de Bord',
          'offers.others': 'autres',
        },
      },
    },
  });

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Polyfill matchMedia for components using responsive listeners
if (!(window as any).matchMedia) {
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
