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



        const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, {
            token: googleToken,
        });





        // Extract data from axios response
        // Backend returns: { success: true, data: { token, user_email, user_name, ... } }
        const responseData = response.data;

        if (!responseData || !responseData.data) {
            console.error('AuthService: No data in response');
            throw new Error('No data received from server');
        }

        const backendData = responseData.data;


        // Extract token
        const token = backendData.token;
        if (!token) {
            console.error('AuthService: No token in response');
            throw new Error('No authentication token received from server');
        }

        // Save token to localStorage
        saveToken(token);


        // Map backend user fields to our user object
        const user = {
            email: backendData.user_email,
            name: backendData.user_name,
            status: backendData.status,
            phone: backendData.phone_no,
            isNewUser: backendData.is_new_user,
            createdAt: backendData.created_at,
            updatedAt: backendData.updated_at,
            role: backendData.role, // Map role from backend
        };



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
