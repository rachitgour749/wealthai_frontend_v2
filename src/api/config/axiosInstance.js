import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { getToken, removeToken } from '../../utils/tokenManager';
import store from '../../store/store';
import { logoutUser } from '../../store/slices/userSlice';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 120 seconds - ChatAI queries can take 30-60s with Google Search
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = getToken();

        // Add token to Authorization header if it exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Token expired or invalid
                    // Don't redirect for admin/MFD routes or Stockal service (they have their own auth)
                    {
                        const url = error.config?.url || '';
                        const isExempt = url.includes('/admin') || url.includes('/api/mfd') || url.includes('8001') || url.includes('stockal');
                        if (!isExempt) {
                            removeToken();
                            store.dispatch(logoutUser());
                            window.location.href = '/';
                        }
                    }
                    break;

                case 403:
                    // Forbidden - No permission
                    break;

                case 404:
                    // Not found
                    break;

                case 500:
                    // Server error
                    break;

                default:
                    break;
            }

            // Return formatted error
            return Promise.reject({
                status,
                message: data?.message || 'An error occurred',
                data: data,
            });
        } else if (error.request) {
            // Network error - No response received
            return Promise.reject({
                status: 0,
                message: 'Network error: Please check your internet connection',
            });
        } else {
            // Other errors
            return Promise.reject({
                status: 0,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

export default axiosInstance;
