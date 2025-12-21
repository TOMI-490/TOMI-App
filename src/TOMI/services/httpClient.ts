
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

    // Add a request interceptor to include the access token in headers
    client.interceptors.request.use(
        async (config) => {
            const token = await getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)

    );
    return client;
};

// Export a singleton instance of the HTTP client
export const httpClient = createHttpClient();