import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp, FileText } from 'lucide-react';
import {
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard,
  ResponsiveGrid
} from '../../components/unified/DesignSystem';
import { blogPosts } from '../../data/blog';

const BlogPage = () => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      "Conseils": <BookOpen className="w-5 h-5" />,
      "Tendances": <TrendingUp className="w-5 h-5" />,
      "CV & Lettre": <FileText className="w-5 h-5" />
    };
    return icons[category] || <BookOpen className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Conseils": "bg-blue-100 text-blue-800",
      "Tendances": "bg-purple-100 text-purple-800",
      "CV & Lettre": "bg-green-100 text-green-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Get the first post as featured post
  const featuredPost = blogPosts[0];
  // Get the rest of the posts
  const regularPosts = blogPosts.slice(1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Blog & Ressources"
        subtitle="Découvrez nos articles, conseils et guides pour vous accompagner dans votre recherche de stage et votre développement professionnel"
        variant="primary"
      />

      {/* Featured Post */}
      <ContentSection background="white">
        <SectionHeader
          title="Article à la Une"
          subtitle="Notre dernier article pour vous aider dans votre parcours professionnel"
        />
        
        <UnifiedCard className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <Link to={`/blog/${featuredPost.id}`} className="block">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video md:aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.category)}`}>
                    {getCategoryIcon(featuredPost.category)}
                    <span className="ml-2">{featuredPost.category}</span>
                  </span>
                  <span className="text-sm text-gray-500">Article vedette</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(featuredPost.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
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
      </ContentSection>

      {/* Regular Posts */}
      <ContentSection background="gray">
        <SectionHeader
          title="Tous nos Articles"
          subtitle="Explorez notre collection d'articles pour enrichir vos connaissances"
        />
        
        <ResponsiveGrid cols={3}>
          {regularPosts.map((post) => (
            <UnifiedCard key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
              <Link to={`/blog/${post.id}`} className="flex flex-col h-full">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {getCategoryIcon(post.category)}
                      <span className="ml-1">{post.category}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span>{formatDate(post.date)}</span>
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
      </ContentSection>

      {/* Categories Section */}
      <ContentSection background="white">
        <SectionHeader
          title="Explorez par Catégorie"
          subtitle="Trouvez rapidement les articles qui vous intéressent"
        />
        
        <ResponsiveGrid cols={3}>
          {[
            {
              category: "Conseils",
              description: "Astuces et conseils pratiques pour réussir votre recherche de stage",
              count: blogPosts.filter(post => post.category === "Conseils").length,
              icon: <BookOpen className="w-8 h-8 text-blue-600" />
            },
            {
              category: "Tendances",
              description: "Les dernières tendances du marché du travail et des compétences",
              count: blogPosts.filter(post => post.category === "Tendances").length,
              icon: <TrendingUp className="w-8 h-8 text-purple-600" />
            },
            {
              category: "CV & Lettre",
              description: "Guides pour optimiser votre CV et vos lettres de motivation",
              count: blogPosts.filter(post => post.category === "CV & Lettre").length,
              icon: <FileText className="w-8 h-8 text-green-600" />
            }
          ].map((category) => (
            <UnifiedCard key={category.category} className="text-center hover:shadow-lg transition-shadow duration-300 group">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.category}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                {category.count} article{category.count > 1 ? 's' : ''}
              </div>
              <Link 
                to={`/blog/category/${category.category.toLowerCase().replace(' & ', '-')}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tous les articles
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>
    </div>
  );
};

export default BlogPage;
