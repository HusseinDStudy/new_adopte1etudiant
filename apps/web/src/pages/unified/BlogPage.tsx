import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp, FileText, Search, Pause } from 'lucide-react';
import {
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard,
  ResponsiveGrid
} from '../../components/unified/DesignSystem';
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog';

const BlogPage = () => {
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
          <p className="text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des articles</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Blog & Ressources"
        subtitle="Découvrez nos articles, conseils et guides pour vous accompagner dans votre recherche de stage et votre développement professionnel"
        variant="primary"
      />



      {/* Featured Posts Carousel */}
      {featuredPosts.length > 0 && (
        <ContentSection background="white">
          <SectionHeader
            title={featuredPosts.length > 1 ? "Articles à la Une" : "Article à la Une"}
            subtitle="Découvrez nos articles sélectionnés pour vous accompagner dans votre développement professionnel"
          />
          
          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <UnifiedCard className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <Link to={`/blog/${featuredPosts[featuredIndex].slug}`} className="block">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-video md:aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={featuredPosts[featuredIndex].image || "/api/placeholder/600/400"}
                      alt={featuredPosts[featuredIndex].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const categoryName = typeof featuredPosts[featuredIndex].category === 'string' 
                          ? featuredPosts[featuredIndex].category 
                          : featuredPosts[featuredIndex].category?.name;
                        const displayCategory = !categoryName || categoryName.trim() === '' ? 'Aucune catégorie' : categoryName;
                        const colorClass = !categoryName || categoryName.trim() === '' ? 'bg-red-100 text-red-800' : getCategoryColorClasses();
                        
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                            {getCategoryIcon()}
                            <span className="ml-2">{displayCategory}</span>
                          </span>
                        );
                      })()}
                      <span className="text-sm text-gray-500">Article vedette</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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
                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                      <span>Lire l'article</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </UnifiedCard>

            {/* Carousel controls - only show if more than 1 featured post */}
            {featuredPosts.length > 1 && (
              <>
                <button
                  onClick={prevFeatured}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 text-gray-700" />
                </button>
                <button
                  onClick={nextFeatured}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                >
                  <ArrowRight className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Carousel indicators */}
                <div className="flex justify-center items-center mt-4 space-x-2">
                  {featuredPosts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === featuredIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                  {isPaused && (
                    <div className="flex items-center ml-4 text-gray-500 text-sm">
                      <Pause className="w-4 h-4 mr-1" />
                      <span>Pausé</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ContentSection>
      )}

      {/* Filter Section for All Articles */}
      <ContentSection background="gray">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tous nos Articles</h2>
          <p className="text-xl text-gray-600 mb-6">Explorez notre collection d'articles pour enrichir vos connaissances</p>
          
          {/* Search bar for all articles */}
          <form onSubmit={handleSearch} className="mb-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Category filters for all articles */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous les articles
            </button>
            {!categoriesLoading && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}

          </div>
        </div>

        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun article trouvé.</p>
          </div>
        ) : (
          <>
            <ResponsiveGrid cols={3}>
              {posts.map((post) => (
                <UnifiedCard key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                  <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img
                        src={post.image || "/api/placeholder/600/400"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        {(() => {
                          const categoryName = typeof post.category === 'string' 
                            ? post.category 
                            : post.category?.name;
                          const displayCategory = !categoryName || categoryName.trim() === '' ? 'Aucune catégorie' : categoryName;
                          const colorClass = !categoryName || categoryName.trim() === '' ? 'bg-red-100 text-red-800' : getCategoryColorClasses();
                          
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                              {getCategoryIcon()}
                              <span className="ml-1">{displayCategory}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 pt-2">
                    <span>Lire plus</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
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
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </ContentSection>

      {/* Categories Section */}
      <ContentSection background="white">
        <SectionHeader
          title="Explorez par Catégorie"
          subtitle="Trouvez rapidement les articles qui vous intéressent"
        />
        
        <ResponsiveGrid cols={3}>
          {categoriesLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <UnifiedCard key={index} className="text-center animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </UnifiedCard>
            ))
          ) : categories.length > 0 ? (
            <>
              {/* Database categories */}
              {categories.map((category) => {
                const categoryCount = posts.filter(post => {
                  const postCategoryName = typeof post.category === 'string' ? post.category : post.category?.name;
                  return postCategoryName === category.name;
                }).length;
                return (
                  <div key={category.id} className="cursor-pointer" onClick={() => handleCategoryFilter(category.name)}>
                    <UnifiedCard className="text-center hover:shadow-lg transition-shadow duration-300 group">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        {getCategoryIcon(category.icon)}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 mb-4">{category.description || `Articles de la catégorie ${category.name}`}</p>
                    <div className="text-sm text-gray-500">
                      {categoryCount} article{categoryCount > 1 ? 's' : ''}
                    </div>
                  </UnifiedCard>
                  </div>
                );
              })}

            </>
          ) : (
            // Empty state
            <div className="col-span-3 text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune catégorie disponible</h3>
              <p className="text-gray-600">Les catégories d'articles seront bientôt disponibles.</p>
            </div>
          )}
        </ResponsiveGrid>
      </ContentSection>
    </div>
  );
};

export default BlogPage;
