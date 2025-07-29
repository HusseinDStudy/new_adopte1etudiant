import { useState, useEffect } from 'react';
import {
  getBlogPosts,
  getBlogPost,
  getRelatedPosts,
  getBlogCategories,
  adminGetAllPosts,
  adminGetPostById,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminTogglePublished,
  adminToggleFeatured,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  generateSlug,
  BlogPost,
  BlogCategory,
  BlogFilters,
  AdminBlogFilters,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  CreateBlogCategoryInput,
  BlogPostsResponse,
} from '../services/blogService';

// Hook for fetching published blog posts (public)
export const useBlogPosts = (filters: BlogFilters = {}) => {
  const [data, setData] = useState<BlogPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBlogPosts(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    filters.search,
    filters.category,
    filters.featured,
    filters.page,
    filters.limit,
  ]);

  return {
    posts: data?.posts || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Hook for fetching a single blog post by slug
export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await getBlogPost(slug);
      setPost(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog post');
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
};

// Hook for fetching related posts
export const useRelatedPosts = (slug: string, limit: number = 3) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedPosts = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await getRelatedPosts(slug, limit);
      setPosts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch related posts');
      console.error('Error fetching related posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatedPosts();
  }, [slug, limit]);

  return {
    posts,
    loading,
    error,
    refetch: fetchRelatedPosts,
  };
};

// Hook for fetching blog categories
export const useBlogCategories = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBlogCategories();
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

// Admin hook for managing all blog posts
export const useAdminBlogPosts = (filters: AdminBlogFilters = {}) => {
  const [data, setData] = useState<BlogPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminGetAllPosts(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
      console.error('Error fetching admin blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    filters.search,
    filters.category,
    filters.status,
    filters.featured,
    filters.page,
    filters.limit,
  ]);

  return {
    posts: data?.posts || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Admin hook for managing a single blog post
export const useAdminBlogPost = (id: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await adminGetPostById(id);
      setPost(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog post');
      console.error('Error fetching admin blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
};

// Hook for blog post mutations (create, update, delete)
export const useBlogPostMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (postData: CreateBlogPostInput): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCreatePost(postData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      setError(errorMessage);
      console.error('Error creating blog post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, postData: UpdateBlogPostInput): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminUpdatePost(id, postData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post';
      setError(errorMessage);
      console.error('Error updating blog post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await adminDeletePost(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post';
      setError(errorMessage);
      console.error('Error deleting blog post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminTogglePublished(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle publish status';
      setError(errorMessage);
      console.error('Error toggling publish status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminToggleFeatured(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle featured status';
      setError(errorMessage);
      console.error('Error toggling featured status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    updatePost,
    deletePost,
    togglePublished,
    toggleFeatured,
    loading,
    error,
  };
};

// Hook for category mutations
export const useCategoryMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: CreateBlogCategoryInput): Promise<BlogCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCreateCategory(categoryData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      console.error('Error creating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<CreateBlogCategoryInput>): Promise<BlogCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminUpdateCategory(id, categoryData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      console.error('Error updating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await adminDeleteCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
    error,
  };
};

// Hook for generating slugs
export const useSlugGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlugFromTitle = async (title: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const slug = await generateSlug(title);
      return slug;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate slug';
      setError(errorMessage);
      console.error('Error generating slug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSlug: generateSlugFromTitle,
    loading,
    error,
  };
};
