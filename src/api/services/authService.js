import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import { saveToken } from '../../utils/tokenManager';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Login with Google OAuth token
 * @param {string} googleToken - Token received from Google OAuth
 * @returns {Promise<{token: string, user: object}>}
 */
export const googleLogin = async (googleToken) => {
    try {
        console.log('AuthService: Sending request to backend...');
        console.log('Payload:', { token: googleToken });

        const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, {
            token: googleToken,
        });

        console.log('AuthService: Full axios response:', response);
        console.log('AuthService: Response data:', response.data);
        console.log('AuthService: Response status:', response.status);

        // Extract data from axios response
        // Backend returns: { success: true, data: { token, user_email, user_name, ... } }
        const responseData = response.data;

        if (!responseData || !responseData.data) {
            console.error('AuthService: No data in response');
            throw new Error('No data received from server');
        }

        const backendData = responseData.data;
        console.log('AuthService: Backend data:', backendData);

        // Extract token
        const token = backendData.token;
        if (!token) {
            console.error('AuthService: No token in response');
            throw new Error('No authentication token received from server');
        }

        // Save token to localStorage
        saveToken(token);
        console.log('AuthService: Token saved to localStorage');

        // Map backend user fields to our user object
        const user = {
            email: backendData.user_email,
            name: backendData.user_name,
            status: backendData.status,
            phone: backendData.phone_no,
            isNewUser: backendData.is_new_user,
            createdAt: backendData.created_at,
            updatedAt: backendData.updated_at,
        };

        console.log('AuthService: Mapped user data:', user);

        return { token, user };
    } catch (error) {
        console.error('AuthService: Google login error:', error);
        console.error('AuthService: Error response:', error.response);
        throw error;
    }
};

/**
 * Logout user
 * Clears token from localStorage
 */
export const logout = () => {
    // Token removal is handled by tokenManager
    // Additional logout logic can be added here if needed
};

export default {
    googleLogin,
    logout,
};
