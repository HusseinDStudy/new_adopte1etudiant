import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Heart,
  Calendar,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminStats } from '../../hooks/useAdmin';

const AdminAnalyticsPage: React.FC = () => {
  const { stats, loading, error, refetch } = useAdminStats();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <AdminLayout
        title="Statistiques et analyses"
        subtitle="Vue d'ensemble des performances de la plateforme"
      >
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Statistiques et analyses"
        subtitle="Vue d'ensemble des performances de la plateforme"
      >
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erreur lors du chargement des statistiques</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout
        title="Statistiques et analyses"
        subtitle="Vue d'ensemble des performances de la plateforme"
      >
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </AdminLayout>
    );
  }

  const mainStats = [
    {
      name: 'Utilisateurs totaux',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: getGrowthPercentage(stats.recentActivity.newUsersToday, 0),
    },
    {
      name: 'Étudiants',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
      change: null,
    },
    {
      name: 'Entreprises',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'bg-purple-500',
      change: null,
    },
    {
      name: 'Offres d\'emploi',
      value: stats.totalOffers,
      icon: Briefcase,
      color: 'bg-orange-500',
      change: getGrowthPercentage(stats.recentActivity.newOffersToday, 0),
    },
    {
      name: 'Candidatures',
      value: stats.totalApplications,
      icon: Target,
      color: 'bg-red-500',
      change: getGrowthPercentage(stats.recentActivity.newApplicationsToday, 0),
    },
    {
      name: 'Demandes d\'adoption',
      value: stats.totalAdoptionRequests,
      icon: Heart,
      color: 'bg-pink-500',
      change: null,
    },
    {
      name: 'Articles de blog',
      value: stats.totalBlogPosts,
      icon: FileText,
      color: 'bg-indigo-500',
      change: null,
    },
  ];

  const todayStats = [
    {
      name: 'Nouveaux utilisateurs',
      value: stats.recentActivity.newUsersToday,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      name: 'Nouvelles offres',
      value: stats.recentActivity.newOffersToday,
      icon: Briefcase,
      color: 'text-orange-600',
    },
    {
      name: 'Nouvelles candidatures',
      value: stats.recentActivity.newApplicationsToday,
      icon: Target,
      color: 'text-red-600',
    },
  ];

  return (
    <AdminLayout
      title="Statistiques et analyses"
      subtitle="Vue d'ensemble des performances de la plateforme"
    >
      <div className="p-6 space-y-8">
        {/* Main Statistics Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistiques générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stat.value)}
                      </p>
                      {stat.change !== null && stat.change > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{stat.change}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Activity */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité d'aujourd'hui</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {todayStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* User Distribution */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Répartition des utilisateurs</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(stats.usersByRole).map(([role, count]) => {
                const percentage = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                const getRoleInfo = (role: string) => {
                  switch (role) {
                    case 'STUDENT':
                      return { name: 'Étudiants', color: 'bg-green-500', icon: Users };
                    case 'COMPANY':
                      return { name: 'Entreprises', color: 'bg-blue-500', icon: Building2 };
                    case 'ADMIN':
                      return { name: 'Administrateurs', color: 'bg-red-500', icon: Users };
                    default:
                      return { name: role, color: 'bg-gray-500', icon: Users };
                  }
                };

                const roleInfo = getRoleInfo(role);

                return (
                  <div key={role} className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`${roleInfo.color} p-4 rounded-full`}>
                        <roleInfo.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{roleInfo.name}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatNumber(count)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{percentage}% du total</p>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${roleInfo.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Offers Status */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Statut des offres</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(stats.offersByStatus).map(([status, count]) => {
                const percentage = stats.totalOffers > 0 ? Math.round((count / stats.totalOffers) * 100) : 0;
                const getStatusInfo = (status: string) => {
                  switch (status) {
                    case 'ACTIVE':
                      return { name: 'Actives', color: 'bg-green-500' };
                    case 'INACTIVE':
                      return { name: 'Inactives', color: 'bg-red-500' };
                    case 'DRAFT':
                      return { name: 'Brouillons', color: 'bg-yellow-500' };
                    default:
                      return { name: status, color: 'bg-gray-500' };
                  }
                };

                const statusInfo = getStatusInfo(status);

                return (
                  <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${statusInfo.color} mr-3`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{statusInfo.name}</p>
                        <p className="text-sm text-gray-600">{percentage}% du total</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(count)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-900">Gérer les utilisateurs</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/offers'}
              className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Briefcase className="w-6 h-6 text-orange-600 mr-3" />
              <span className="font-medium text-orange-900">Gérer les offres</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/blog/posts'}
              className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText className="w-6 h-6 text-purple-600 mr-3" />
              <span className="font-medium text-purple-900">Gérer le blog</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/messages'}
              className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Envoyer un message</span>
            </button>
          </div>
        </section>

        {/* Last Updated */}
        <section className="text-center">
          <p className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage; 