import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') return 'Request timed out. Is the server running?';
    if (!err.response) {
      return `Cannot connect to server. Run: cd server → npm run dev (API at ${baseURL})`;
    }
    const data = err.response.data as { error?: string | { message?: string }[] };
    if (typeof data?.error === 'string') return data.error;
    if (Array.isArray(data?.error)) {
      return data.error.map((e) => (typeof e === 'object' && e?.message ? e.message : String(e))).join(', ');
    }
    return fallback;
  }
  return fallback;
}

export default api;
