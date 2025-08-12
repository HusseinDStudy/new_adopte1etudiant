import apiClient from './apiClient';

// Types for blog data
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat?: 'MARKDOWN' | 'HTML' | 'MDX' | 'JSON';
  image?: string;
  categoryId?: string;
  category?: BlogCategory | string; // Can be string (name) from API response
  author: string;
  readTimeMinutes?: number;
  readTime?: string; // Computed field for display
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface BlogFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminBlogFilters extends BlogFilters {
  status?: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  contentFormat?: 'MARKDOWN' | 'HTML' | 'MDX' | 'JSON';
  image?: string;
  categoryId: string;
  author: string;
  readTimeMinutes?: number;
  readTime?: string; // For backwards compatibility
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  contentFormat?: 'MARKDOWN' | 'HTML' | 'MDX' | 'JSON';
  image?: string;
  categoryId?: string;
  author?: string;
  readTimeMinutes?: number;
  readTime?: string; // For backwards compatibility
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface CreateBlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function to transform backend blog post data
const transformBlogPost = (post: any): BlogPost => {
  return {
    ...post,
    // Handle category - can be string (name) or object
    category: typeof post.category === 'string' ? post.category : post.category,
    // Transform readTimeMinutes to readTime for display
    readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min` : post.readTime || '5 min',
    readTimeMinutes: post.readTimeMinutes,
    // Ensure status is set
    status: post.status || 'DRAFT',
    // Ensure contentFormat is set (default to HTML if not specified)
    contentFormat: post.contentFormat || 'HTML',
  };
};

// Public blog services (for frontend display)
export const getBlogPosts = async (filters: BlogFilters = {}): Promise<BlogPostsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const { data } = await apiClient.get('/blog/posts', { params });
  
  // Transform the posts to match frontend expectations
  return {
    ...data,
    posts: data.posts.map(transformBlogPost)
  };
};

export const getBlogPost = async (slug: string): Promise<BlogPost> => {
  const { data } = await apiClient.get(`/blog/posts/${slug}`);
  return transformBlogPost(data);
};

export const getRelatedPosts = async (slug: string, limit: number = 3): Promise<BlogPost[]> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const { data } = await apiClient.get(`/blog/posts/${slug}/related`, { params });
  return data.map(transformBlogPost);
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  const { data } = await apiClient.get('/blog/categories');
  return data;
};

// Admin blog services (for admin management)
export const adminGetAllPosts = async (filters: AdminBlogFilters = {}): Promise<BlogPostsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const { data } = await apiClient.get('/blog/admin/posts', { params });
  return data;
};

export const adminGetPostById = async (id: string): Promise<BlogPost> => {
  const { data } = await apiClient.get(`/blog/admin/posts/${id}`);
  return data;
};

export const adminCreatePost = async (postData: CreateBlogPostInput): Promise<BlogPost> => {
  const { data } = await apiClient.post('/blog/admin/posts', postData);
  return data;
};

export const adminUpdatePost = async (id: string, postData: UpdateBlogPostInput): Promise<BlogPost> => {
  const { data } = await apiClient.put(`/blog/admin/posts/${id}`, postData);
  return data;
};

export const adminDeletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`/blog/admin/posts/${id}`);
};

export const adminTogglePublished = async (id: string): Promise<BlogPost> => {
  const { data } = await apiClient.patch(`/blog/admin/posts/${id}/publish`);
  return data;
};

export const adminToggleFeatured = async (id: string): Promise<BlogPost> => {
  const { data } = await apiClient.patch(`/blog/admin/posts/${id}/feature`);
  return data;
};

// Category management services
export const adminCreateCategory = async (categoryData: CreateBlogCategoryInput): Promise<BlogCategory> => {
  const { data } = await apiClient.post('/blog/admin/categories', categoryData);
  return data;
};

export const adminUpdateCategory = async (id: string, categoryData: Partial<CreateBlogCategoryInput>): Promise<BlogCategory> => {
  const { data } = await apiClient.put(`/blog/admin/categories/${id}`, categoryData);
  return data;
};

export const adminDeleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/blog/admin/categories/${id}`);
};

// Utility services
export const generateSlug = async (title: string): Promise<string> => {
  const { data } = await apiClient.post('/blog/admin/generate-slug', { title });
  return data.slug;
};

// Helper function to convert old mock data format to new API format
export const convertMockDataToApiFormat = (mockPost: any): BlogPost => {
  return {
    id: mockPost.id.toString(),
    title: mockPost.title,
    slug: mockPost.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    excerpt: mockPost.excerpt,
    content: mockPost.content,
    image: mockPost.image,
    category: mockPost.category,
    author: mockPost.author,
    readTime: mockPost.readTime,
    status: 'PUBLISHED',
    featured: mockPost.id === 1, // Make first post featured
    createdAt: mockPost.date,
    updatedAt: mockPost.date,
    publishedAt: mockPost.date,
  };
};
