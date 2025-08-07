import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminBlogPost, useBlogPostMutations, useSlugGenerator, useBlogCategories } from '../../hooks/useBlog';
import { CreateBlogPostInput, UpdateBlogPostInput } from '../../services/blogService';

const BlogPostForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { t } = useTranslation();

  const { post, loading: postLoading } = useAdminBlogPost(id || '');
  const { createPost, updatePost, loading: mutationLoading } = useBlogPostMutations();
  const { generateSlug } = useSlugGenerator();
  const { categories } = useBlogCategories();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    categoryId: '', // No default category - force user to select one
    author: 'Admin', // Default author
    readTime: '5 min', // Default value to prevent undefined
    published: false,
    featured: false,
    metaTitle: '',
    metaDescription: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        image: post.image || '',
        categoryId: post.categoryId || '',
        author: post.author || 'Admin',
        readTime: post.readTime || '5 min', // Default value to prevent empty string
        status: post.status || 'DRAFT',
        featured: post.featured || false,
        published: post.status === 'PUBLISHED',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
      });
    }
  }, [isEditing, post]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value || ''), // Ensure value is never undefined
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerateSlug = async () => {
    if (formData.title) {
      const slug = await generateSlug(formData.title);
      if (slug) {
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation minimale pour les brouillons - le titre et la catégorie sont requis
    if (!formData.title?.trim()) newErrors.title = t('forms.required');
    if (!formData.categoryId?.trim()) newErrors.categoryId = t('forms.required');

    // Validate slug format if provided
    if (formData.slug?.trim()) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(formData.slug.trim())) {
        newErrors.slug = 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure required fields have default values
    const cleanedFormData = {
      ...formData,
      readTime: formData.readTime?.trim() || '5 min',
      categoryId: formData.categoryId?.trim() || '',
      author: formData.author?.trim() || 'Admin'
    };

    // Auto-generate and clean slug for new posts if empty
    if (!isEditing && !cleanedFormData.slug?.trim() && cleanedFormData.title?.trim()) {
      const generatedSlug = await generateSlug(cleanedFormData.title);
      if (generatedSlug) {
        cleanedFormData.slug = generatedSlug;
      }
    }

    // Ensure slug follows the pattern ^[a-z0-9-]+$
    if (cleanedFormData.slug) {
      cleanedFormData.slug = cleanedFormData.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    setFormData(cleanedFormData);

    // Validation de base (toujours requise)
    if (!validateForm()) return;

    // Validation stricte pour publication uniquement
    if (cleanedFormData.status === 'PUBLISHED') {
      if (!cleanedFormData.title?.trim()) {
        alert(t('blog.postTitleRequired'));
        return;
      }
      if (!cleanedFormData.excerpt?.trim()) {
        alert(t('blog.postExcerptRequired'));
        return;
      }
      if (!cleanedFormData.content?.trim()) {
        alert(t('blog.postContentRequired'));
        return;
      }
    }

    try {
      if (isEditing) {
        const updateData: any = { 
          title: cleanedFormData.title,
          slug: cleanedFormData.slug,
          excerpt: cleanedFormData.excerpt,
          content: cleanedFormData.content,
          categoryId: cleanedFormData.categoryId,
          author: cleanedFormData.author,
          readTime: cleanedFormData.readTime,
          status: cleanedFormData.status,
          featured: cleanedFormData.featured,
        };
        // Only include optional fields if they have values
        if (cleanedFormData.image?.trim()) updateData.image = cleanedFormData.image.trim();
        if (cleanedFormData.metaTitle?.trim()) updateData.metaTitle = cleanedFormData.metaTitle.trim();
        if (cleanedFormData.metaDescription?.trim()) updateData.metaDescription = cleanedFormData.metaDescription.trim();
        
        await updatePost(id!, updateData as UpdateBlogPostInput);
      } else {
        // Ensure all required fields are present
        const createData: any = { 
          title: cleanedFormData.title,
          slug: cleanedFormData.slug || cleanedFormData.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''),
          excerpt: cleanedFormData.excerpt,
          content: cleanedFormData.content,
          categoryId: cleanedFormData.categoryId,
          author: cleanedFormData.author,
          readTime: cleanedFormData.readTime,
          status: cleanedFormData.status,
          featured: cleanedFormData.featured,
        };
        // Only include optional fields if they have values
        if (cleanedFormData.image?.trim()) createData.image = cleanedFormData.image.trim();
        if (cleanedFormData.metaTitle?.trim()) createData.metaTitle = cleanedFormData.metaTitle.trim();
        if (cleanedFormData.metaDescription?.trim()) createData.metaDescription = cleanedFormData.metaDescription.trim();
        
        await createPost(createData as CreateBlogPostInput);
      }
      navigate('/admin/blog/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      // Extract more detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
              console.error('Response data:', axiosError.response?.data);
      console.error('Response status:', axiosError.response?.status);
      }
    }
  };

  const handleSaveDraft = async () => {
    // Ensure required fields have default values
    const cleanedFormData = {
      ...formData,
      readTime: formData.readTime?.trim() || '5 min',
      categoryId: formData.categoryId?.trim() || '',
      author: formData.author?.trim() || 'Admin'
    };

    let slug = cleanedFormData.slug?.trim();
    if (!slug && cleanedFormData.title?.trim()) {
      slug = await generateSlug(cleanedFormData.title) || cleanedFormData.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Ensure slug follows the pattern ^[a-z0-9-]+$
    if (slug) {
      slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const draftData = { 
      ...cleanedFormData, 
      status: 'DRAFT' as const,
      slug: slug || cleanedFormData.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''),
      // Ensure these fields are strings, not undefined
      image: cleanedFormData.image?.trim() || '',
      metaTitle: cleanedFormData.metaTitle?.trim() || '',
      metaDescription: cleanedFormData.metaDescription?.trim() || '',
    };
    setFormData(draftData);
    
    try {
      if (isEditing) {
        const updateData: any = { 
          title: draftData.title,
          slug: draftData.slug,
          excerpt: draftData.excerpt,
          content: draftData.content,
          categoryId: draftData.categoryId,
          author: draftData.author,
          readTime: draftData.readTime,
          status: draftData.status,
          featured: draftData.featured,
        };
        // Only include optional fields if they have values
        if (draftData.image?.trim()) updateData.image = draftData.image.trim();
        if (draftData.metaTitle?.trim()) updateData.metaTitle = draftData.metaTitle.trim();
        if (draftData.metaDescription?.trim()) updateData.metaDescription = draftData.metaDescription.trim();
        
        await updatePost(id!, updateData);
      } else {
        const createData: any = { 
          title: draftData.title,
          slug: draftData.slug,
          excerpt: draftData.excerpt,
          content: draftData.content,
          categoryId: draftData.categoryId,
          author: draftData.author,
          readTime: draftData.readTime,
          published: draftData.published,
          featured: draftData.featured,
        };
        // Only include optional fields if they have values
        if (draftData.image?.trim()) createData.image = draftData.image.trim();
        if (draftData.metaTitle?.trim()) createData.metaTitle = draftData.metaTitle.trim();
        if (draftData.metaDescription?.trim()) createData.metaDescription = draftData.metaDescription.trim();
        
        await createPost(createData);
      }
      navigate('/admin/blog/posts');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  if (isEditing && postLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? t('blog.editPost') : t('adminBlog.newPost')}
      subtitle={isEditing ? t('blog.editPost') : t('adminBlog.newPost')}
    >
      <form onSubmit={handleSubmit} className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
            <button
            type="button"
            onClick={() => navigate('/admin/blog/posts')}
            className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={mutationLoading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t('forms.draft')}
            </button>
            <button
              type="submit"
              disabled={mutationLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? t('common.update') : t('forms.publish')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('forms.title')}
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="slug-de-larticle"
                />
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                >
                  Générer
                </button>
              </div>
              {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.excerpt')} *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.excerpt ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('forms.excerpt')}
              />
              {errors.excerpt && <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.content')} *
              </label>
              <textarea
                id="content"
                name="content"
                rows={15}
                value={formData.content}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('forms.content')}
              />
              {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t('forms.status') || 'Status'}</h3>
              <div className="space-y-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('forms.publish')}
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">{t('forms.draft')}</option>
                  <option value="PUBLISHED">{t('forms.published')}</option>
                  <option value="SCHEDULED">{t('adminBlog.status.scheduled')}</option>
                  <option value="ARCHIVED">{t('adminBlog.status.archived')}</option>
                </select>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('blog.featuredBadge')}</span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.category')} *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">{t('blog.categories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>}
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.author')} *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.author ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('blog.author')}
              />
              {errors.author && <p className="text-red-600 text-sm mt-1">{errors.author}</p>}
            </div>

            {/* Read Time */}
            <div>
              <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.readTime') || 'Read time'} *
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.readTime ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="5 min"
              />
              {errors.readTime && <p className="text-red-600 text-sm mt-1">{errors.readTime}</p>}
            </div>

            {/* Featured Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.featuredImage') || 'Featured image'}
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* SEO */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="metaTitle" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('blog.seoTitle') || 'SEO Title'}
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('blog.seoTitle') || 'SEO Title'}
                  />
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('blog.seoDescription') || 'SEO Description'}
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows={2}
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('blog.seoDescription') || 'SEO Description'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default BlogPostForm;

