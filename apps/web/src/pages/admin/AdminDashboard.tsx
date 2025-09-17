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
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('loading.loadingStatistics')}</p>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Link
                key={stat.name}
                to={stat.href}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
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
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('dashboard.quickActions')}</h3>
            <div className="space-y-3">
              <Link
                to="/admin/blog/posts/new"
                className="flex items-center rounded-lg bg-blue-50 p-3 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Plus className="mr-3 h-5 w-5" />
                {t('adminBlog.newPost')}
              </Link>
              <Link
                to="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded-lg bg-green-50 p-3 text-green-600 transition-colors hover:bg-green-100"
              >
                <Eye className="mr-3 h-5 w-5" />
                {t('blog.readArticle')}
              </Link>
              <Link
                to="/admin/blog/categories"
                className="flex items-center rounded-lg bg-purple-50 p-3 text-purple-600 transition-colors hover:bg-purple-100"
              >
                <Edit className="mr-3 h-5 w-5" />
                {t('blog.categories')}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('dashboard.recentActivity')}</h3>
            {statsLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">{t('loading.loading')}</p>
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
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
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
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <h3 className="text-lg font-semibold text-gray-900">{t('blog.recentPosts')}</h3>
            <Link
              to="/admin/blog/posts"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t('blog.allArticles')}
            </Link>
          </div>

          {postsLoading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">{t('loading.loadingArticles')}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">{t('blog.noArticlesFound')}</p>
              <Link
                to="/admin/blog/posts/new"
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('blog.createPost')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col items-start justify-between gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="break-words font-medium text-gray-900">{post.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>Par {post.author}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span
                        className={`rounded-full px-2 py-1 ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : post.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : post.status === 'ARCHIVED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status === 'PUBLISHED' ? t('adminBlog.status.published') :
                         post.status === 'DRAFT' ? t('adminBlog.status.draft') :
                         post.status === 'SCHEDULED' ? t('adminBlog.status.scheduled') :
                         post.status === 'ARCHIVED' ? t('adminBlog.status.archived') : t('adminBlog.status.draft')}
                      </span>
                      {post.featured && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                          {t('blog.featuredBadge')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-0 mt-2 flex items-center space-x-2 sm:ml-4 sm:mt-0">
                    <Link
                      to={`/admin/blog/posts/${post.id}/edit`}
                      className="p-2 text-gray-400 transition-colors hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 transition-colors hover:text-green-600"
                    >
                      <Eye className="h-4 w-4" />
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
