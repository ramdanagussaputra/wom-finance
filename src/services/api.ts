import axios from 'axios';
import { API_BASE_URL } from '@env';
import { tokenStorage } from './storage';

export const api = axios.create({
  baseURL: API_BASE_URL || 'https://dummyjson.com',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async config => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[api]', err?.config?.url, err?.message);
    }
    return Promise.reject(err);
  },
);
