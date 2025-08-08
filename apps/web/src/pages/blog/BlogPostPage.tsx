import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, BookOpen, TrendingUp, FileText } from 'lucide-react';
import { useBlogPost, useRelatedPosts, useBlogCategories } from '../../hooks/useBlog';
import { useTranslation } from 'react-i18next';
import { useLocalizedDate } from '../../hooks/useLocalizedDate';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = useBlogPost(slug || '');
  const { posts: relatedPosts } = useRelatedPosts(slug || '', 3);
  const { categories } = useBlogCategories();
  const { t } = useTranslation();
  const { formatDate } = useLocalizedDate();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('blog.loadingPost')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('blog.postNotFound')}</h1>
          <p className="text-gray-600 mb-4">{error || t('blog.postNotFoundDescription')}</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            {t('blog.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

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

  

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog')}
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              {(() => {
                const postCategory = typeof post.category === 'string' ? categories.find(cat => cat.name === post.category) : post.category;
                return (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColorClasses(postCategory?.color)}`}>
                    {getCategoryIcon(postCategory?.icon)}
                  <span className="ml-2">{postCategory?.name || t('blog.noCategory')}</span>
                  </span>
                );
              })()}
              {post.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ {t('blog.featuredBadge')}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 mb-8">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                {post.readTime && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {post.image && (
              <div className="mb-8">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
              {(() => {
                // Check if content looks like HTML (contains HTML tags)
                const looksLikeHTML = /<[^>]*>/.test(post.content);
                
                // Use HTML rendering if explicitly set to HTML or if content looks like HTML
                const shouldRenderAsHTML = post.contentFormat === 'HTML' || looksLikeHTML;
                
                if (shouldRenderAsHTML) {
                  return (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }} 
                    />
                  );
                } else {
                  return (
                    <div className="whitespace-pre-wrap prose prose-lg max-w-none">{post.content}</div>
                  );
                }
              })()}
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('blog.relatedArticles')}
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 mb-2">
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {relatedPost.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="text-xs text-gray-500">
                        {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('blog.shareThisArticle')}
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = post.title;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  {t('blog.twitter')}
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                >
                  {t('blog.linkedin')}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  {t('blog.copyLink')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
