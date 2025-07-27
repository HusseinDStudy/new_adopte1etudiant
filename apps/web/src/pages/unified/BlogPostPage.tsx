import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, BookOpen, TrendingUp, FileText } from 'lucide-react';
import {
  ContentSection,
  UnifiedCard,
  ResponsiveGrid
} from '../../components/unified/DesignSystem';
import { blogPosts } from '../../data/blog';

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === parseInt(id || '0'));

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ContentSection background="white" className="pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {getCategoryIcon(post.category)}
                <span className="ml-2">{post.category}</span>
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-8">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime} de lecture</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Article Content */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto">
          <UnifiedCard className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </UnifiedCard>
        </div>
      </ContentSection>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <ContentSection background="gray">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Articles Similaires</h2>
              <p className="text-gray-600">
                Découvrez d'autres articles de la catégorie "{post.category}"
              </p>
            </div>
            
            <ResponsiveGrid cols={relatedPosts.length === 1 ? 1 : relatedPosts.length === 2 ? 2 : 3}>
              {relatedPosts.map((relatedPost) => (
                <UnifiedCard key={relatedPost.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                  <Link to={`/blog/${relatedPost.id}`} className="flex flex-col h-full">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(relatedPost.category)}`}>
                          {getCategoryIcon(relatedPost.category)}
                          <span className="ml-1">{relatedPost.category}</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <span>{formatDate(relatedPost.date)}</span>
                          <span>{relatedPost.readTime}</span>
                        </div>
                        <span className="font-medium">{relatedPost.author}</span>
                      </div>
                      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 pt-2">
                        <span>Lire l'article</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </UnifiedCard>
              ))}
            </ResponsiveGrid>
          </div>
        </ContentSection>
      )}

      {/* Call to Action */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto text-center">
          <UnifiedCard className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vous avez aimé cet article ?
            </h3>
            <p className="text-gray-600 mb-6">
              Découvrez tous nos conseils et ressources pour réussir votre recherche de stage
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/blog"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Voir tous les articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </UnifiedCard>
        </div>
      </ContentSection>
    </div>
  );
};

export default BlogPostPage;
