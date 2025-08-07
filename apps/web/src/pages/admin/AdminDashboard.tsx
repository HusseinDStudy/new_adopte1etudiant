import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Building2, Briefcase, TrendingUp, Eye, Plus, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminBlogPosts } from '../../hooks/useBlog';
import { useAdminStats } from '../../hooks/useAdmin';

const AdminDashboard: React.FC = () => {
  const { posts, loading: postsLoading } = useAdminBlogPosts({ limit: 5 });
  const { stats, loading: statsLoading } = useAdminStats();
  const { t, i18n } = useTranslation();

  const dashboardStats = [
    {
      name: t('dashboard.stats.blogPosts'),
      value: stats?.totalBlogPosts || 0,
      icon: FileText,
      color: 'bg-blue-500',
      href: '/admin/blog/posts',
    },
    {
      name: t('dashboard.stats.users'),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/users',
    },
    {
      name: t('dashboard.stats.companies'),
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: 'bg-purple-500',
      href: '/admin/users',
    },
    {
      name: t('dashboard.stats.activeOffers'),
      value: stats?.totalOffers || 0,
      icon: Briefcase,
      color: 'bg-orange-500',
      href: '/admin/offers',
    },
  ];

  return (
    <AdminLayout
      title={t('admin.dashboard')}
      subtitle={t('admin.analyticsSubtitle')}
    >
      <div className="p-6">
        {/* Stats Grid */}
        {statsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading.loadingStatistics')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
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
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') : stat.value}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h3>
            <div className="space-y-3">
              <Link
                to="/admin/blog/posts/new"
                className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3" />
                {t('adminBlog.newPost')}
              </Link>
              <Link
                to="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Eye className="w-5 h-5 mr-3" />
                {t('blog.readArticle')}
              </Link>
              <Link
                to="/admin/blog/categories"
                className="flex items-center p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Edit className="w-5 h-5 mr-3" />
                {t('blog.categories')}
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h3>
            {statsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">{t('loading.loading')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.newUsersToday')}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.recentActivity.newUsersToday || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.newOffersToday')}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.recentActivity.newOffersToday || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.newApplicationsToday')}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.recentActivity.newApplicationsToday || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.totalAdoptionRequests')}</span>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-green-600">
                      {stats?.totalAdoptionRequests || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('blog.recentPosts')}</h3>
            <Link
              to="/admin/blog/posts"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('blog.allArticles')}
            </Link>
          </div>

          {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">{t('loading.loadingArticles')}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('blog.noArticlesFound')}</p>
              <Link
                to="/admin/blog/posts/new"
                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('blog.createPost')}
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
                        post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                          {post.status === 'PUBLISHED' ? t('forms.published') : t('forms.draft')}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {t('blog.featuredBadge')}
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
