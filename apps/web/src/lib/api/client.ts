import axios from 'axios';
import Cookies from 'js-cookie';
import { setAccessToken } from '@/features/auth/store/auth.slice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let storeRef: any = null;

export const injectStore = (store: any) => {
  storeRef = store;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Necessary for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      return Promise.reject(new Error('Network connection is lost. Request cancelled.'));
    }

    const token = storeRef?.getState()?.auth?.accessToken || Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token endpoint fails
    if (error.response?.status === 401 && originalRequest.url?.includes('auth/refresh')) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token (NestJS rotates cookies)
        const refreshToken = storeRef?.getState()?.auth?.refreshToken || Cookies.get('refresh_token');
        const response = await apiClient.post('/auth/refresh', {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        const newAccessToken = response.data?.accessToken;

        if (newAccessToken) {
          Cookies.set('access_token', newAccessToken, { expires: 1 });
          Cookies.set('logged_in', 'true', { expires: 7 });
          if (storeRef) {
            storeRef.dispatch(setAccessToken(newAccessToken));
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth cookies, store state and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('logged_in');
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        if (storeRef) {
          storeRef.dispatch({ type: 'auth/logoutSuccess' });
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
