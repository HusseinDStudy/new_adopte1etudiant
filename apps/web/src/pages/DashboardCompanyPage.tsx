import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/layout/SidebarLayout';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import { useCompanyStats } from '../hooks/useCompanyStats';
import { useMyOffers } from '../hooks/useMyOffers';

const DashboardCompanyPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { stats, loading: statsLoading } = useCompanyStats();
  const { offers, loading: offersLoading } = useMyOffers();

  // Calculate metrics from real data
  const metrics = {
    totalOffers: stats?.totalOffers || 0,
    newApplications: stats?.applicationsByStatus?.NEW || 0,
    activeContracts: stats?.applicationsByStatus?.HIRED || 0,
  };

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboardCompany.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('dashboardCompany.welcome')} {user?.email}, {t('dashboardCompany.welcomeDescription')}
        </p>
      </div>

          {/* Dashboard Metrics */}
          {statsLoading ? (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-2 h-8 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardMetrics userRole="COMPANY" metrics={metrics} />
          )}

          {/* Main Content Sections */}
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Active Offers */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboardCompany.activeOffers')}</h3>
                <a href="/company/offers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {t('dashboardCompany.manage')} →
                </a>
              </div>
              <div className="space-y-4">
                {offersLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex-1">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 h-4 w-16 rounded bg-gray-200"></div>
                        <div className="h-3 w-12 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))
                ) : offers.length > 0 ? (
                  offers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{offer.title}</p>
                        <p className="text-sm text-gray-600">{offer._count.applications} {t('dashboardCompany.applications')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{t('dashboardCompany.createdOn')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>{t('dashboardCompany.noActiveOffers')}</p>
                    <a href="/company/offers/new" className="text-sm text-blue-600 hover:text-blue-700">
                      {t('dashboardCompany.createFirstOffer')} →
                    </a>
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('dashboardCompany.quickActions')}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <a
                href="/company/offers/new"
                className="flex items-center space-x-3 rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('dashboardCompany.createOffer')}</p>
                  <p className="text-sm text-gray-600">{t('dashboardCompany.createOfferDescription')}</p>
                </div>
              </a>

              <a
                href="/students"
                className="flex items-center space-x-3 rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('dashboardCompany.findStudents')}</p>
                  <p className="text-sm text-gray-600">{t('dashboardCompany.findStudentsDescription')}</p>
                </div>
              </a>

              <a
                href="/conversations"
                className="flex items-center space-x-3 rounded-lg bg-purple-50 p-4 transition-colors hover:bg-purple-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('dashboardCompany.messages')}</p>
                  <p className="text-sm text-gray-600">{t('dashboardCompany.messagesDescription')}</p>
                </div>
              </a>
            </div>
          </div>
    </SidebarLayout>
  );
};

export default DashboardCompanyPage;
