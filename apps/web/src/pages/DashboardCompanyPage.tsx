import React from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/layout/SidebarLayout';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import { useCompanyStats } from '../hooks/useCompanyStats';
import { useMyOffers } from '../hooks/useMyOffers';

const DashboardCompanyPage: React.FC = () => {
  const { user } = useAuth();
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
          Tableau de bord Entreprise
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue {user?.email}, gérez vos offres et trouvez les meilleurs talents
        </p>
      </div>

          {/* Dashboard Metrics */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardMetrics userRole="COMPANY" metrics={metrics} />
          )}

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Active Offers */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Offres actives</h3>
                <a href="/company/offers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Gérer →
                </a>
              </div>
              <div className="space-y-4">
                {offersLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))
                ) : offers.length > 0 ? (
                  offers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{offer.title}</p>
                        <p className="text-sm text-gray-600">{offer._count.applications} candidature(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-500">Créée le</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune offre active</p>
                    <a href="/company/offers/new" className="text-blue-600 hover:text-blue-700 text-sm">
                      Créer votre première offre →
                    </a>
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/company/offers/new"
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Créer une offre</p>
                  <p className="text-sm text-gray-600">Publier une nouvelle opportunité</p>
                </div>
              </a>

              <a
                href="/students"
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Trouver des étudiants</p>
                  <p className="text-sm text-gray-600">Découvrir de nouveaux talents</p>
                </div>
              </a>

              <a
                href="/conversations"
                className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Messages</p>
                  <p className="text-sm text-gray-600">Communiquer avec les candidats</p>
                </div>
              </a>
            </div>
          </div>
    </SidebarLayout>
  );
};

export default DashboardCompanyPage;
