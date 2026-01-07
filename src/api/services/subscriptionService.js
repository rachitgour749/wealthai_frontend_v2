import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */

/**
 * Get user subscription details
 * @param {string} email - User email
 * @returns {Promise<object>} User subscription data
 */
export const getUserSubscription = async (email) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USER_SUBSCRIPTION(email));
        return response.data;
    } catch (error) {
        console.error('Get user subscription error:', error);
        throw error;
    }
};

/**
 * Get all products with subscription status
 * @param {string} email - User email
 * @returns {Promise<Array>} Array of product subscriptions
 */
export const getProducts = async (email) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS(email));
        return response.data;
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

/**
 * Activate free trial for user
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 * @returns {Promise<object>} Trial activation response
 */
export const activateTrial = async (userEmail, userName) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.ACTIVATE_TRIAL, {
            user_email: userEmail,
            user_name: userName,
            plan_code: 9, // Always 9 as per requirements
        });
        return response.data;
    } catch (error) {
        console.error('Activate trial error:', error);
        throw error;
    }
};

export default {
    getUserSubscription,
    getProducts,
    activateTrial,
};
