import { API_CONFIG } from '@app/api/config';
import axios from 'axios';
import { PaginatedResponse } from '../BaseApi';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category_id: number;
  category_name: string;
  status: 'published' | 'draft';
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  pushlish_date: string;
}

const BlogService = {
  getAll: async (page: number = 1): Promise<PaginatedResponse<BlogPost>> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/v1/blogs?page=${page}`);
    return response.data;
  },

  create: async (data: FormData): Promise<BlogPost> => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/v1/blogs`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, data: FormData): Promise<BlogPost> => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/v1/blogs/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_CONFIG.BASE_URL}/api/v1/blogs/${id}`);
  },
};

export default BlogService;