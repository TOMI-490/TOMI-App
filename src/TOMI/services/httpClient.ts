import axios, { AxiosInstance, isAxiosError } from 'axios';
import { API_BASE_URL, HTTP_TIMEOUT } from './config/config';
import { getAccessToken } from './auth';

function previewResponseData(data: unknown): string {
  if (data === undefined || data === null) return String(data);
  try {
    const s = JSON.stringify(data);
    return s.length > 200 ? `${s.slice(0, 200)}…` : s;
  } catch {
    return '[unserializable]';
  }
}

export const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: HTTP_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  });

  if (__DEV__) {
    console.log('[HTTP Client] Initialized with baseURL:', API_BASE_URL);
  }

  client.interceptors.request.use(
    async (config) => {
      if (__DEV__) {
        console.log('[HTTP Client] Request:', config.method?.toUpperCase(), config.url);
      }
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (__DEV__) {
        console.log('[HTTP Client] No auth token available');
      }
      return config;
    },
    (error) => {
      console.error('[HTTP Client] Request error:', error);
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log('[HTTP Client] ✓ Response:', response.status, response.config.url);
        console.log('[HTTP Client] Data preview:', previewResponseData(response.data));
      }
      return response;
    },
    (error: unknown) => {
      if (isAxiosError(error)) {
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();
        const status = error.response?.status;
        const msg = error.message ?? 'Unknown error';
        const isTimeout =
          error.code === 'ECONNABORTED' ||
          msg.toLowerCase().includes('timeout');

        if (status != null && error.response) {
          console.error('[HTTP Client] ✗ HTTP', status, method, url, previewResponseData(error.response.data));
        } else if (isTimeout) {
          if (__DEV__) {
            console.warn('[HTTP Client] ⚠ Timeout:', method, url, `(${HTTP_TIMEOUT}ms)`);
          }
        } else if (error.request) {
          if (__DEV__) {
            console.warn('[HTTP Client] ⚠ No response:', msg, method, url);
          }
        } else {
          console.error('[HTTP Client] ✗ Setup error:', msg);
        }
      } else {
        console.error('[HTTP Client] ✗', error);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const httpClient = createHttpClient();
