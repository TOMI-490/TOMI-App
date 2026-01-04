
import axios, {AxiosInstance} from 'axios';
import { API_BASE_URL, HTTP_TIMEOUT } from './config/config';
import { getAccessToken } from './auth';

export const createHttpClient = (): AxiosInstance =>{

    // Create an Axios instance with base URL and timeout
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: HTTP_TIMEOUT,
        headers: {'Content-Type': 'application/json'}
    });

    console.log('[HTTP Client] Initialized with baseURL:', API_BASE_URL);

    // Add a request interceptor to include the access token in headers
    client.interceptors.request.use(
        async (config) => {
            console.log('[HTTP Client] Request:', config.method?.toUpperCase(), config.url);
            const token = await getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[HTTP Client] Token attached to request');
            } else {
                console.log('[HTTP Client] No auth token available');
            }
            return config;
        },
        (error) => {
            console.error('[HTTP Client] Request error:', error);
            return Promise.reject(error);
        }
    );

    // Add response interceptor for logging
    client.interceptors.response.use(
        (response) => {
            console.log('[HTTP Client] ✓ Response:', response.status, response.config.url);
            console.log('[HTTP Client] Data preview:', JSON.stringify(response.data).substring(0, 200) + '...');
            return response;
        },
        (error) => {
            if (error.response) {
                console.error('[HTTP Client] ✗ Response error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('[HTTP Client] ✗ Network error - no response received:', error.message);
            } else {
                console.error('[HTTP Client] ✗ Request setup error:', error.message);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// Export a singleton instance of the HTTP client
export const httpClient = createHttpClient();