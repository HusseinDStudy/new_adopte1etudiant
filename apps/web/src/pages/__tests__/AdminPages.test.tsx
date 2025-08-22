import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, mockAuth } from '../../test/test-utils';
import AdminDashboard from '../admin/AdminDashboard';
import AdminOffersPage from '../admin/AdminOffersPage';
import AdminUsersPage from '../admin/AdminUsersPage';
import AdminMessagesPage from '../admin/AdminMessagesPage';
import AdminAnalyticsPage from '../admin/AdminAnalyticsPage';
import * as adminHooks from '../../hooks/useAdmin';
import * as blogHooks from '../../hooks/useBlog';

describe('Admin pages smoke', () => {
  it('renders AdminDashboard with stats and recent posts', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'ADMIN' } });
    vi.spyOn(blogHooks, 'useAdminBlogPosts').mockReturnValue({ posts: [{ id: 'p1', title: 'Hello', excerpt: 'x', author: 'A', status: 'PUBLISHED', featured: false, createdAt: new Date().toISOString(), slug: 'hello' }], loading: false } as any);
    vi.spyOn(adminHooks, 'useAdminStats').mockReturnValue({ stats: { totalBlogPosts: 1, totalUsers: 10, totalCompanies: 2, totalOffers: 3, recentActivity: { newUsersToday: 1, newOffersToday: 1, newApplicationsToday: 1 }, totalAdoptionRequests: 0 }, loading: false } as any);

    renderWithProviders(
      <Routes><Route path="/admin" element={<AdminDashboard />} /></Routes>,
      { route: '/admin' }
    );
    expect(document.body.textContent).toMatch(/Admin/i);
    expect(document.body.textContent).toMatch(/Blog|Articles/i);
  });

  it('renders AdminOffersPage list', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'ADMIN' } });
    vi.spyOn(adminHooks, 'useAdminOffers').mockReturnValue({ offers: [{ id: 'o1', title: 'Offer', description: 'd', company: { companyName: 'ACME', email: 'hr@acme.tld' }, location: 'Paris', duration: '3m', isActive: true, _count: { applications: 0 }, createdAt: new Date().toISOString() }], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 }, loading: false, error: null, refetch: vi.fn() } as any);
    vi.spyOn(adminHooks, 'useAdminOfferMutations').mockReturnValue({ updateStatus: vi.fn(), deleteOffer: vi.fn() } as any);

    renderWithProviders(
      <Routes><Route path="/admin/offers" element={<AdminOffersPage />} /></Routes>,
      { route: '/admin/offers' }
    );
    expect(document.body.textContent).toMatch(/Offres|Offers/i);
    expect(document.body.textContent).toMatch(/ACME/);
  });

  it('renders AdminUsersPage table', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'ADMIN' } });
    vi.spyOn(adminHooks, 'useAdminUsers').mockReturnValue({ users: [{ id: 'u1', email: 'a@b.c', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString(), lastLoginAt: null, profile: { firstName: 'Jane', lastName: 'Doe' } }], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 }, loading: false, error: null, refetch: vi.fn() } as any);
    vi.spyOn(adminHooks, 'useAdminUserMutations').mockReturnValue({ updateStatus: vi.fn(), updateRole: vi.fn(), deleteUser: vi.fn() } as any);

    renderWithProviders(
      <Routes><Route path="/admin/users" element={<AdminUsersPage />} /></Routes>,
      { route: '/admin/users' }
    );
    expect(document.body.textContent).toMatch(/Utilisateurs|Users/i);
    expect(document.body.textContent).toMatch(/Jane/);
  });

  it('renders AdminMessagesPage tabs', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'ADMIN' } });
    vi.spyOn(adminHooks, 'useAdminMessaging').mockReturnValue({ sendMessage: vi.fn(), sendBroadcast: vi.fn(), loading: false } as any);
    vi.spyOn(adminHooks, 'useAdminUsers').mockReturnValue({ users: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }, loading: false } as any);
    vi.spyOn(adminHooks, 'useAdminConversations').mockReturnValue({ conversations: [], loading: false } as any);

    renderWithProviders(
      <Routes><Route path="/admin/messages" element={<AdminMessagesPage />} /></Routes>,
      { route: '/admin/messages' }
    );
    expect(document.body.textContent).toMatch(/Messages|Broadcast/i);
  });

  it('renders AdminAnalyticsPage stats', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'ADMIN' } });
    vi.spyOn(adminHooks, 'useAdminStats').mockReturnValue({ stats: { totalUsers: 10, totalStudents: 5, totalCompanies: 5, totalOffers: 2, totalApplications: 1, totalAdoptionRequests: 0, totalBlogPosts: 1, recentActivity: { newUsersToday: 1, newOffersToday: 1, newApplicationsToday: 1 }, usersByRole: { STUDENT: 5, COMPANY: 5, ADMIN: 0 }, offersByStatus: { ACTIVE: 2, INACTIVE: 0, DRAFT: 0 } }, loading: false, error: null, refetch: vi.fn() } as any);

    renderWithProviders(
      <Routes><Route path="/admin/analytics" element={<AdminAnalyticsPage />} /></Routes>,
      { route: '/admin/analytics' }
    );
    expect(document.body.textContent).toMatch(/Analyses|Analytics|Users/i);
  });
});


