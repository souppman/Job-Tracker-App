import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api/jobs';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions that mirror your backend endpoints
export const jobsApi = {
  // GET /api/jobs - Get all jobs
  getAllJobs: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch jobs');
    }
  },

  // GET /api/jobs/:id - Get specific job
  getJobById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch job');
    }
  },

  // GET /api/jobs/search?search=term&status=status - Search jobs with optional status filter
  searchJobs: async (searchTerm, status = null) => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (status) params.status = status;
      
      const response = await api.get('/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search jobs');
    }
  },

  // GET /api/jobs/status?status=applied - Filter jobs by status
  getJobsByStatus: async (status) => {
    try {
      const response = await api.get('/status', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to filter jobs');
    }
  },

  // POST /api/jobs - Create new job
  createJob: async (jobData) => {
    try {
      const response = await api.post('/', jobData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create job');
    }
  },

  // PUT /api/jobs/:id - Update job
  updateJob: async (id, jobData) => {
    try {
      const response = await api.put(`/${id}`, jobData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update job');
    }
  },

  // DELETE /api/jobs/:id - Delete job
  deleteJob: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete job');
    }
  }
};

export default jobsApi;