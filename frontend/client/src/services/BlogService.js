import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const BlogService = {
  getAll: async (page = 1) => {
    const response = await axios.get(`${API_URL}/blogs?page=${page}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/blogs/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/blog-categories`);
    return response.data;
  },

  searchByCategory: async (categoryId, page = 1) => {
    const response = await axios.get(`${API_URL}/blogs?category_id=${categoryId}&page=${page}`);
    return response.data;
  },

  searchByTerm: async (term, page = 1) => {
    const response = await axios.get(`${API_URL}/blogs?search=${term}&page=${page}`);
    return response.data;
  }
};

export default BlogService;