import React from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import DashboardMetrics from '../components/DashboardMetrics';
import { useStudentStats } from '../hooks/useStudentStats';
import { useApplications } from '../hooks/useApplications';

const DashboardStudentPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useStudentStats();
  const { applications, loading: applicationsLoading } = useApplications();

  // Calculate metrics from real data
  const metrics = {
    myApplications: stats?.totalApplications || 0,
    adoptionRequests: stats?.adoptionRequestsReceived || 0,
    profileViews: 0, // This would need to be tracked separately
  };

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord Étudiant
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue {user?.email}, suivez vos candidatures et découvrez de nouvelles opportunités
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
            <DashboardMetrics userRole="STUDENT" metrics={metrics} />
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Candidatures récentes</h3>
                <a href="/my-applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Voir tout →
                </a>
              </div>
              <div className="space-y-4">
                {applicationsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : applications.length > 0 ? (
                  applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{app.offer.title}</p>
                        <p className="text-sm text-gray-600">{app.offer.company.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          app.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'INTERVIEW' ? 'bg-green-100 text-green-800' :
                          app.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 'NEW' ? 'Nouveau' :
                           app.status === 'REVIEWED' ? 'En cours' :
                           app.status === 'INTERVIEW' ? 'Entretien' :
                           app.status === 'HIRED' ? 'Embauché' :
                           'Refusé'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune candidature récente</p>
                    <a href="/offers" className="text-blue-600 hover:text-blue-700 text-sm">
                      Découvrir des offres →
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
                href="/offers"
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Parcourir les offres</p>
                  <p className="text-sm text-gray-600">Découvrir de nouvelles opportunités</p>
                </div>
              </a>

              <a
                href="/profile"
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mettre à jour le profil</p>
                  <p className="text-sm text-gray-600">Améliorer votre visibilité</p>
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
                  <p className="text-sm text-gray-600">Communiquer avec les entreprises</p>
                </div>
              </a>
            </div>
          </div>
    </SidebarLayout>
  );
};

export default DashboardStudentPage;
