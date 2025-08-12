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
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">{t('blog.loadingPost')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{t('blog.postNotFound')}</h1>
          <p className="mb-4 text-gray-600">{error || t('blog.postNotFoundDescription')}</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            {t('blog.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

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

  

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.backToBlog')}
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center space-x-3">
              {(() => {
                const postCategory = typeof post.category === 'string' ? categories.find(cat => cat.name === post.category) : post.category;
                return (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColorClasses(postCategory?.color)}`}>
                    {getCategoryIcon(postCategory?.icon)}
                  <span className="ml-2">{postCategory?.name || t('blog.noCategory')}</span>
                  </span>
                );
              })()}
              {post.featured && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                ⭐ {t('blog.featuredBadge')}
                </span>
              )}
            </div>

            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              {post.title}
            </h1>

            <div className="mb-8 flex flex-col text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 flex items-center space-x-4 sm:mb-0">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                {post.readTime && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {post.image && (
              <div className="mb-8">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-64 w-full rounded-lg object-cover sm:h-80"
                />
              </div>
            )}

            {/* Content */}
            <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-li:text-gray-700">
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
                    <div className="prose prose-lg max-w-none whitespace-pre-wrap">{post.content}</div>
                  );
                }
              })()}
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {t('blog.relatedArticles')}
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="mb-2 font-medium text-gray-900">
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="line-clamp-2 transition-colors hover:text-blue-600"
                        >
                          {relatedPost.title}
                        </Link>
                      </h4>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">
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
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t('blog.shareThisArticle')}
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = post.title;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  {t('blog.twitter')}
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="flex-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                >
                  {t('blog.linkedin')}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }}
                  className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
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
