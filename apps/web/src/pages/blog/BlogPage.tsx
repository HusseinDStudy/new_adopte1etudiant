import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp, FileText, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../../components/common/HeroSection';
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog';
import { useLocalizedDate } from '../../hooks/useLocalizedDate';

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
  const { formatDate } = useLocalizedDate();

  const getCategoryIcon = (iconName?: string) => {
    const icons: Record<string, JSX.Element> = {
      "BookOpen": <BookOpen className="h-5 w-5" />,
      "TrendingUp": <TrendingUp className="h-5 w-5" />,
      "FileText": <FileText className="h-5 w-5" />
    };
    return icons[iconName || "BookOpen"] || <BookOpen className="h-5 w-5" />;
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">{t('blog.loadingArticles')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="text-center">
          <p className="mb-4 text-red-600">{t('blog.loadingError')}</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('blog.title')}
        description={t('blog.description')}
        variant="large"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Posts Carousel */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                {featuredPosts.length > 1 ? t('blog.featuredArticles') : t('blog.featuredArticle')}
              </h2>
              <p className="text-gray-600">
                {t('blog.featuredDescription')}
              </p>
            </div>
            
            <div 
              className="relative overflow-hidden rounded-lg bg-white shadow-lg"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Link to={`/blog/${featuredPosts[featuredIndex].slug}`} className="block">
                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-200 md:aspect-square">
                    <img
                      src={featuredPosts[featuredIndex].image || "/api/placeholder/600/400"}
                      alt={featuredPosts[featuredIndex].title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>
                            {getCategoryIcon()}
                            <span className="ml-2">{displayCategory}</span>
                          </span>
                        );
                      })()}
                      <span className="text-sm text-gray-500">{t('blog.featuredBadge')}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600 md:text-3xl">
                      {featuredPosts[featuredIndex].title}
                    </h2>
                    <p className="leading-relaxed text-gray-600">
                      {featuredPosts[featuredIndex].excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredPosts[featuredIndex].publishedAt || featuredPosts[featuredIndex].createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPosts[featuredIndex].author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPosts[featuredIndex].readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-blue-600 hover:text-blue-700">
                      <span>{t('blog.readArticle')}</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Carousel controls - only show if more than 1 featured post */}
              {featuredPosts.length > 1 && (
                <>
                  <button
                    onClick={prevFeatured}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-all duration-200 hover:bg-white"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    onClick={nextFeatured}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-all duration-200 hover:bg-white"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  
                  {/* Carousel indicators */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setFeaturedIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all duration-200 ${
                          index === featuredIndex ? 'w-6 bg-blue-600' : 'bg-gray-300'
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
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('blog.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* All Posts Grid */}
        <div className="mb-8">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">{t('blog.allArticles')}</h2>
            <p className="text-gray-600">
              {t('blog.allArticlesDescription')}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-lg text-gray-500">{t('blog.noArticlesFound')}</p>
              <p className="text-gray-400">
                {t('blog.noArticlesFoundDescription')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-lg">
                  {post.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Category */}
                    {post.category && typeof post.category === 'object' && (
                      <div className="mb-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getCategoryColorClasses(post.category.color)}`}>
                          {getCategoryIcon(post.category.icon)}
                          <span className="ml-2">{post.category.name}</span>
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="mb-3 line-clamp-2 text-xl font-semibold text-gray-900">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="transition-colors hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="mb-4 line-clamp-3 text-gray-600">
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
                          <Clock className="mr-1 h-4 w-4" />
                          {post.readTime}
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {post.featured && (
                      <div className="mt-3">
                        <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
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
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('blog.previous')}
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
