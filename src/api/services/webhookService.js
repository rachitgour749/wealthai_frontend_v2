import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

const webhookService = {
    /**
     * Fetch all webhooks for a user
     */
    fetchWebhooks: async (userId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_WEBHOOKS(userId));
            return response.data;
        } catch (error) {
            console.error('Error fetching webhooks:', error);
            throw error;
        }
    },

    /**
     * Toggle webhook status (active/inactive)
     */
    toggleStatus: async (runId, status) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.TOGGLE_WEBHOOK_STATUS(runId, status));
            return response.data;
        } catch (error) {
            console.error('Error toggling webhook status:', error);
            throw error;
        }
    },

    /**
     * Delete a webhook
     */
    deleteWebhook: async (runId) => {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_WEBHOOK(runId));
            return response.data;
        } catch (error) {
            console.error('Error deleting webhook:', error);
            throw error;
        }
    },

    /**
     * Fetch all registered RA codes
     */
    fetchRaCodes: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.RA_CODES);
            return response.data;
        } catch (error) {
            console.error('Error fetching RA codes:', error);
            throw error;
        }
    },
    
    /**
     * Fetch all strategies for a given RA code
     */
    fetchRaStrategies: async (raCode) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.RA_STRATEGIES(raCode));
            return response.data;
        } catch (error) {
            console.error('Error fetching RA strategies:', error);
            throw error;
        }
    }
};

export default webhookService;
