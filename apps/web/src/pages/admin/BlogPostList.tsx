import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Eye, Trash2, Star, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminBlogPosts, useBlogPostMutations, useBlogCategories } from '../../hooks/useBlog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const BlogPostList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { posts, pagination, loading, error, refetch } = useAdminBlogPosts({
    search: searchTerm,
    category: categoryFilter,
    status: (statusFilter as 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED') || undefined,
    page: currentPage,
    limit: 10,
  });

  const { categories, loading: categoriesLoading } = useBlogCategories();
  const { togglePublished, toggleFeatured, deletePost } = useBlogPostMutations();

  const handleTogglePublished = async (id: string) => {
    try {
      await togglePublished(id);
      refetch();
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id);
      refetch();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);
  const handleDeletePost = async (id: string, title: string) => {
    setConfirm({ id, title });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout
      title={t('adminBlog.title')}
      subtitle={t('adminBlog.subtitle')}
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:min-w-[16rem] sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-0">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-48"
              >
                <option value="">{t('blog.allCategories')}</option>
                {!categoriesLoading && categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}

              </select>
            </div>

            {/* Status Filter */}
            <div className="relative min-w-0">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-40"
              >
                <option value="">{t('adminBlog.status.all')}</option>
                <option value="PUBLISHED">{t('adminBlog.status.published')}</option>
                <option value="DRAFT">{t('adminBlog.status.draft')}</option>
                <option value="SCHEDULED">{t('adminBlog.status.scheduled')}</option>
                <option value="ARCHIVED">{t('adminBlog.status.archived')}</option>
              </select>
            </div>
          </div>

          <Link
            to="/admin/blog/posts/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('adminBlog.newPost')}
          </Link>
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('loading.loadingArticles')}</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">{t('errors.loadingArticlesError')}</p>
            <button
              onClick={refetch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-600">{t('blog.noArticlesFound')}</p>
            <Link
              to="/admin/blog/posts/new"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('blog.createPost')}
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {/* Mobile stacked cards */}
              <div className="divide-y divide-gray-200 md:hidden">
                {posts.map((post) => (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="break-words text-base font-medium text-gray-900">{post.title}</h3>
                          {post.featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            !post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name)
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {!post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name) 
                              ? t('blog.noCategory') 
                              : (typeof post.category === 'string' ? post.category : post.category.name)}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : post.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : post.status === 'ARCHIVED'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status === 'PUBLISHED' ? t('adminBlog.status.published') : 
                             post.status === 'DRAFT' ? t('adminBlog.status.draft') :
                             post.status === 'SCHEDULED' ? t('adminBlog.status.scheduled') :
                             post.status === 'ARCHIVED' ? t('adminBlog.status.archived') : t('adminBlog.status.draft')}
                          </span>
                          <span className="text-gray-600">{formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublished(post.id)}
                            className={`rounded-lg p-2 transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? t('adminBlog.actions.unpublish') : t('adminBlog.actions.publish')}
                          >
                            <Globe className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(post.id)}
                            className={`rounded-lg p-2 transition-colors ${
                              post.featured
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={post.featured ? t('adminBlog.actions.unfeature') : t('adminBlog.actions.feature')}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/admin/blog/posts/${post.id}/edit`}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title={t('common.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                            title={t('common.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[900px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminBlog.table.article')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminBlog.table.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminBlog.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminBlog.table.date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t('adminBlog.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="mr-4 h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                          <div className="flex items-center">
                              <h3 className="break-words text-sm font-medium text-gray-900">{post.title}</h3>
                              {post.featured && (
                                <Star className="ml-2 h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          <p className="mt-1 text-sm text-gray-600">{t('blog.author')}: {post.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          !post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name)
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {!post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name) 
                            ? t('blog.noCategory') 
                            : (typeof post.category === 'string' ? post.category : post.category.name)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : post.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : post.status === 'ARCHIVED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'PUBLISHED' ? t('adminBlog.status.published') : 
                           post.status === 'DRAFT' ? t('adminBlog.status.draft') :
                           post.status === 'SCHEDULED' ? t('adminBlog.status.scheduled') :
                           post.status === 'ARCHIVED' ? t('adminBlog.status.archived') : t('adminBlog.status.draft')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTogglePublished(post.id)}
                            className={`rounded-lg p-2 transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? t('adminBlog.actions.unpublish') : t('adminBlog.actions.publish')}
                          >
                            <Globe className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(post.id)}
                            className={`rounded-lg p-2 transition-colors ${
                              post.featured
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={post.featured ? t('adminBlog.actions.unfeature') : t('adminBlog.actions.feature')}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/admin/blog/posts/${post.id}/edit`}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title={t('common.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                            title={t('common.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {confirm && (
              <Dialog open onOpenChange={(open) => !open && setConfirm(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('common.delete')}</DialogTitle>
                    <DialogDescription>{t('adminBlog.confirmDeletePost', { title: confirm.title })}</DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                      onClick={() => setConfirm(null)}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      onClick={async () => {
                        try {
                          await deletePost(confirm.id);
                          setConfirm(null);
                          refetch();
                        } catch (error) {
                          console.error('Error deleting post:', error);
                        }
                      }}
                    >
                      {t('common.confirm')}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('common.showingResults', {
                    start: ((currentPage - 1) * 10) + 1,
                    end: Math.min(currentPage * 10, pagination.total),
                    total: pagination.total,
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default BlogPostList;
