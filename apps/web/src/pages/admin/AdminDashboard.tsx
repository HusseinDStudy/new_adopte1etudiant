import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Building2, Briefcase, TrendingUp, Eye, Plus, Edit } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useBlogPosts } from '../../hooks/useBlog';

const AdminDashboard: React.FC = () => {
  const { posts, loading } = useBlogPosts({ limit: 5 });

  const stats = [
    {
      name: 'Articles de blog',
      value: posts.length,
      icon: FileText,
      color: 'bg-blue-500',
      href: '/admin/blog/posts',
    },
    {
      name: 'Utilisateurs',
      value: '1,234',
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/users',
    },
    {
      name: 'Entreprises',
      value: '89',
      icon: Building2,
      color: 'bg-purple-500',
      href: '/admin/users/companies',
    },
    {
      name: 'Offres actives',
      value: '156',
      icon: Briefcase,
      color: 'bg-orange-500',
      href: '/admin/offers',
    },
  ];

  return (
    <AdminLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre plateforme Adopte1Etudiant"
    >
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Link
                to="/admin/blog/posts/new"
                className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3" />
                Créer un nouvel article
              </Link>
              <Link
                to="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Eye className="w-5 h-5 mr-3" />
                Voir le blog public
              </Link>
              <Link
                to="/admin/blog/categories"
                className="flex items-center p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Edit className="w-5 h-5 mr-3" />
                Gérer les catégories
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques récentes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Articles publiés ce mois</span>
                <span className="text-sm font-semibold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vues totales</span>
                <span className="text-sm font-semibold text-gray-900">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveaux utilisateurs</span>
                <span className="text-sm font-semibold text-gray-900">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux d'engagement</span>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Articles récents</h3>
            <Link
              to="/admin/blog/posts"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tous les articles
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement des articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun article trouvé</p>
              <Link
                to="/admin/blog/posts/new"
                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier article
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{post.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{post.excerpt.substring(0, 100)}...</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>Par {post.author}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          À la une
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/admin/blog/posts/${post.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
