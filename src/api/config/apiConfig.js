// API Base URL - Update this with your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Endpoints Configuration
export const API_ENDPOINTS = {
    // Authentication
    GOOGLE_LOGIN: '/api/auth/google-login',

    // Subscription
    USER_SUBSCRIPTION: (email) => `/api/subscription/user/${email}`,
    ACTIVATE_TRIAL: '/api/subscription/activate-trial',
    PRODUCTS: (email) => `/api/subscription/products/${email}`,
};

export default API_BASE_URL;
