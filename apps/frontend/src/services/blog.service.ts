import { apiClient } from './api-client';
import { API_ENDPOINTS, buildQueryString } from '@/lib/api/endpoints';

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: 'draft' | 'published' | 'archived';
  author: BlogAuthor;
  tags: BlogTag[];
  viewCount: number;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // SEO fields
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
}

export interface BlogsQueryParams extends Record<string, unknown>{
  status?: 'draft' | 'published' | 'archived';
  authorId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: Blog[], 
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export const blogService = {
  /**
   * Get all blogs (with filters)
   */
  getBlogs: async (params: BlogsQueryParams = {}): Promise<PaginatedResponse<Blog>> => {
    const queryString = buildQueryString(params);
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Blog>>>(
      `${API_ENDPOINTS.BLOGS.LIST}${queryString}`
    );
    return data.data;
  },

  /**
   * Get published blogs only
   */
  getPublishedBlogs: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Blog>> => {
    const queryString = buildQueryString(params);
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Blog>>>(
      `${API_ENDPOINTS.BLOGS.PUBLISHED}${queryString}`
    );
    return data.data;
  },

  /**
   * Get blog by slug
   */
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const { data } = await apiClient.get<ApiResponse<Blog>>(
      API_ENDPOINTS.BLOGS.BY_SLUG(slug)
    );
    return data.data;
  },

  /**
   * Get blog by ID
   */
  getBlogById: async (id: string): Promise<Blog> => {
    const { data } = await apiClient.get<ApiResponse<Blog>>(
      API_ENDPOINTS.BLOGS.DETAIL(id)
    );
    return data.data;
  },

  /**
   * Increment blog view count
   */
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.BLOGS.INCREMENT_VIEW(id));
  },

  /**
   * Get blogs for stories (featured image + published)
   */
  getBlogsForStories: async (limit: number = 10): Promise<Blog[]> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Blog>>>(
      `${API_ENDPOINTS.BLOGS.PUBLISHED}?limit=${limit}`
    );
    return data.data.items.filter(blog => blog.featuredImage);
  },

  /**
   * Create a new blog post / story (Admin)
   */
  createBlog: async (payload: Partial<Blog>): Promise<Blog> => {
    const { data } = await apiClient.post<ApiResponse<Blog>>(
      API_ENDPOINTS.BLOGS.LIST,
      payload
    );
    return data.data;
  },

  /**
   * Update blog post / story (Admin)
   */
  updateBlog: async (id: string, payload: Partial<Blog>): Promise<Blog> => {
    const { data } = await apiClient.patch<ApiResponse<Blog>>(
      API_ENDPOINTS.BLOGS.DETAIL(id),
      payload
    );
    return data.data;
  },

  /**
   * Delete blog post / story (Admin)
   */
  deleteBlog: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BLOGS.DETAIL(id));
  },
};

