import axios from 'axios';
import { getCurrentUserToken } from '@services/firebase';

const BACKEND = 'http://localhost:3001';

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach fresh Firebase token on every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getCurrentUserToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.warn('[api] Could not get auth token');
  }
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Request failed';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.data = error.response?.data;
    return Promise.reject(normalized);
  },
);

export async function get(url, config) {
  const res = await api.get(url, config);
  return res.data;
}

export async function post(url, data, config) {
  const res = await api.post(url, data, config);
  return res.data;
}

export async function put(url, data, config) {
  const res = await api.put(url, data, config);
  return res.data;
}

export async function del(url, config) {
  const res = await api.delete(url, config);
  return res.data;
}

export default api;