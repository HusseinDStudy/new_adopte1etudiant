import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Eye, Trash2, Star, Globe } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminBlogPosts, useBlogPostMutations, useBlogCategories } from '../../hooks/useBlog';

const BlogPostList: React.FC = () => {
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

  const handleDeletePost = async (id: string, title: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${title}" ?`)) {
      try {
        await deletePost(id);
        refetch();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
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
      title="Articles de blog"
      subtitle="Gérez tous vos articles de blog"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 appearance-none"
              >
                <option value="">Toutes les catégories</option>
                {!categoriesLoading && categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}

              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40 appearance-none"
              >
                <option value="">Tous les statuts</option>
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
                <option value="SCHEDULED">Programmé</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>

          <Link
            to="/admin/blog/posts/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Link>
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Erreur lors du chargement des articles</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Aucun article trouvé</p>
            <Link
              to="/admin/blog/posts/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier article
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                              {post.featured && (
                                <Star className="w-4 h-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Par {post.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          !post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name)
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {!post.category || (typeof post.category === 'string' ? post.category.trim() === '' : !post.category.name) 
                            ? 'Aucune catégorie' 
                            : (typeof post.category === 'string' ? post.category : post.category.name)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                          {post.status === 'PUBLISHED' ? 'Publié' : 
                           post.status === 'DRAFT' ? 'Brouillon' :
                           post.status === 'SCHEDULED' ? 'Programmé' :
                           post.status === 'ARCHIVED' ? 'Archivé' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTogglePublished(post.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(post.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.featured
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={post.featured ? 'Retirer de la une' : 'Mettre à la une'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/blog/posts/${post.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, pagination.total)} sur {pagination.total} articles
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
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
