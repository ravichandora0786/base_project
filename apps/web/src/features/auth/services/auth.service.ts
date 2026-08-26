import { apiClient } from '../../../lib/api/client';

export const authService = {
  async login(credentials: any) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: any) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
};
