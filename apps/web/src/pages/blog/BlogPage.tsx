import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp, FileText, Search, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../../components/common/HeroSection';
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog';

const BlogPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch featured posts separately
  const { posts: featuredPosts, loading: featuredLoading } = useBlogPosts({
    featured: true,
    limit: 10, // Get up to 10 featured posts for carousel
  });

  // Fetch all posts for the main listing
  const { posts, pagination, loading, error } = useBlogPosts({
    search: searchTerm,
    category: selectedCategory,
    page: currentPage,
    limit: 9,
  });

  const { categories, loading: categoriesLoading } = useBlogCategories();

  const getCategoryIcon = (iconName?: string) => {
    const icons: Record<string, JSX.Element> = {
      "BookOpen": <BookOpen className="w-5 h-5" />,
      "TrendingUp": <TrendingUp className="w-5 h-5" />,
      "FileText": <FileText className="w-5 h-5" />
    };
    return icons[iconName || "BookOpen"] || <BookOpen className="w-5 h-5" />;
  };

  const getCategoryColorClasses = (color?: string) => {
    if (!color) return "bg-gray-100 text-gray-800";

    // Convert hex color to Tailwind classes
    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100 text-blue-800",
      "#8B5CF6": "bg-purple-100 text-purple-800",
      "#10B981": "bg-green-100 text-green-800"
    };

    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  // Featured carousel navigation
  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  // Auto-slide featured carousel every 5 seconds if there are multiple posts
  useEffect(() => {
    if (featuredPosts.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredPosts.length, isPaused]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  if ((loading && posts.length === 0) || (featuredLoading && featuredPosts.length === 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('blog.loadingArticles')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('blog.loadingError')}</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('blog.title')}
        description={t('blog.description')}
        variant="large"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts Carousel */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {featuredPosts.length > 1 ? t('blog.featuredArticles') : t('blog.featuredArticle')}
              </h2>
              <p className="text-gray-600">
                {t('blog.featuredDescription')}
              </p>
            </div>
            
            <div 
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Link to={`/blog/${featuredPosts[featuredIndex].slug}`} className="block">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div className="aspect-video md:aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={featuredPosts[featuredIndex].image || "/api/placeholder/600/400"}
                      alt={featuredPosts[featuredIndex].title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const categoryName = typeof featuredPosts[featuredIndex].category === 'string' 
                          ? featuredPosts[featuredIndex].category 
                          : featuredPosts[featuredIndex].category?.name;
                        const displayCategory = !categoryName || categoryName.trim() === '' ? t('blog.noCategory') : categoryName;
                        const colorClass = !categoryName || categoryName.trim() === '' ? 'bg-red-100 text-red-800' : getCategoryColorClasses();
                        
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                            {getCategoryIcon()}
                            <span className="ml-2">{displayCategory}</span>
                          </span>
                        );
                      })()}
                      <span className="text-sm text-gray-500">{t('blog.featuredBadge')}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {featuredPosts[featuredIndex].title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {featuredPosts[featuredIndex].excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredPosts[featuredIndex].publishedAt || featuredPosts[featuredIndex].createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{featuredPosts[featuredIndex].author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPosts[featuredIndex].readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 font-medium hover:text-blue-700">
                      <span>{t('blog.readArticle')}</span>
                      <ArrowRight className="w-4 h-4 ml-2 hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Carousel controls - only show if more than 1 featured post */}
              {featuredPosts.length > 1 && (
                <>
                  <button
                    onClick={prevFeatured}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={nextFeatured}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  {/* Carousel indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setFeaturedIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === featuredIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('blog.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('blog.search')}
            </button>
          </form>
        </div>

        {/* All Posts Grid */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('blog.allArticles')}</h2>
            <p className="text-gray-600">
              {t('blog.allArticlesDescription')}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">{t('blog.noArticlesFound')}</p>
              <p className="text-gray-400">
                {t('blog.noArticlesFoundDescription')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                  {post.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Category */}
                    {post.category && typeof post.category === 'object' && (
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getCategoryColorClasses(post.category.color)}`}>
                          {getCategoryIcon(post.category.icon)}
                          <span className="ml-2">{post.category.name}</span>
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      {post.readTime && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {post.featured && (
                      <div className="mt-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                          ⭐ {t('blog.featuredBadge')}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('blog.previous')}
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('blog.next')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
