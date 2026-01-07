// Token Manager - Centralized token storage and retrieval

const TOKEN_KEY = 'wealthwisers_auth_token';

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if token exists
 * @returns {boolean}
 */
export const hasToken = () => {
    return !!getToken();
};

/**
 * Check if token is valid (basic check)
 * @returns {boolean}
 */
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    try {
        // Basic JWT structure check
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        // Decode payload
        const payload = JSON.parse(atob(parts[1]));

        // Check expiration if present
        if (payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        }

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};
