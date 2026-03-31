import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

const stockalService = {
    /**
     * Get Stockal account information
     * @param {string} custId - The customer ID
     */
    getAccountInfo: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_ACCOUNT_INFO(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching Stockal account info:', error);
            throw error;
        }
    },

    /**
     * Update Stockal account information
     * @param {string} custId - The customer ID
     * @param {Object} payload - The user info payload
     */
    updateAccountInfo: async (custId, payload) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_USER_UPDATE(custId), payload);
            return response.data;
        } catch (error) {
            console.error('Error updating Stockal account info:', error);
            throw error;
        }
    },

    /**
     * Get Stockal beneficiaries
     * @param {string} custId - The customer ID
     */
    getBeneficiaries: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_BENEFICIARIES(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching Stockal beneficiaries:', error);
            throw error;
        }
    },

    /**
     * Create or update Stockal beneficiaries
     * @param {string} custId - The customer ID
     * @param {Object} payload - The beneficiaries payload
     */
    updateBeneficiaries: async (custId, payload) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_BENEFICIARIES(custId), payload);
            return response.data;
        } catch (error) {
            console.error('Error updating Stockal beneficiaries:', error);
            throw error;
        }
    },

     /**
     * Create a new Stockal user (onboarding)
     * @param {Object} payload - The user creation payload
     */
    createUser: async (payload) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_CREATE_USER, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating Stockal user:', error);
            throw error;
        }
    },

    /**
     * Validate Stockal user
     * @param {string} email - The user's email
     */
    validateUser: async (email) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.VALIDATE_STOCKAL_USER(email));
            return response;
        } catch (error) {
            console.error('Error validating Stockal user:', error);
            throw error;
        }
    },

    /**
     * Check Stockal username availability
     * @param {string} username - The username to check
     */
    checkUsername: async (username) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_USERNAME_CHECK(username));
            return response;
        } catch (error) {
            console.error('Error checking username availability:', error);
            throw error;
        }
    }
};

export default stockalService;
