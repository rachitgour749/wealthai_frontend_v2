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
    },

    /**
     * Upload Stockal KYC document
     * @param {FormData} formData - The multipart form data containing file and metadata
     */
    uploadDocument: async (formData) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_DOCUMENT_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    /**
     * Check Stockal EKYC status
     * @param {string} custId - The customer ID
     */
    getEkycStatus: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_EKYC_STATUS(custId));
            return response;
        } catch (error) {
            console.error('Error checking EKYC status:', error);
            throw error;
        }
    },

    /**
     * Get Digilocker KYC URL
     * @param {string} custId - The customer ID
     */
    getEkycUrl: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_EKYC_URL(custId));
            return response.data;
        } catch (error) {
            console.error('Error getting EKYC URL:', error);
            throw error;
        }
    },

    /**
     * Submit Stockal KYC for verification
     * @param {string} custId - The customer ID
     */
    submitKyc: async (custId) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_KYC_SUBMIT(custId));
            return response.data;
        } catch (error) {
            console.error('Error submitting KYC:', error);
            throw error;
        }
    },

    /**
     * Get Stockal account summary
     * @param {string} custId - The customer ID
     */
    getAccountSummary: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_ACCOUNT_SUMMARY(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching account summary:', error);
            throw error;
        }
    },

    /**
     * Get Stockal portfolio
     * @param {string} custId - The customer ID
     */
    getPortfolio: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_PORTFOLIO(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            throw error;
        }
    },

    /**
     * Get Stockal positions
     * @param {string} custId - The customer ID
     */
    getPositions: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_POSITIONS(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching positions:', error);
            throw error;
        }
    },

    /**
     * Get Stockal holdings and pending orders for a customer
     * @param {string} custId - The customer ID
     */
    getHoldings: async (custId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_HOLDINGS(custId));
            return response.data;
        } catch (error) {
            console.error('Error fetching holdings:', error);
            throw error;
        }
    },

    /**
     * Place a new Stockal order
     * @param {Object} payload - The order payload
     */
    placeOrder: async (payload) => {
        try {
            const response = await axiosInstance.post(`${API_ENDPOINTS.STOCKAL_ORDERS}/multi`, payload);
            return response.data;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    },

    /**
     * Get all Stockal orders for a customer
     * @param {string} custId - The customer ID
     */
    getOrders: async (custId) => {
        try {
            const response = await axiosInstance.get(`http://localhost:8001/api/v1/stockal/order_list/${custId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    /**
     * Get Stockal order status
     * @param {string} orderId - The order ID
     */
    getOrderStatus: async (orderId) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_ORDER_OPERATIONS(orderId));
            return response.data;
        } catch (error) {
            console.error('Error fetching order status:', error);
            throw error;
        }
    },

    /**
     * Cancel a Stockal order
     * @param {string} orderId - The order ID
     */
    cancelOrder: async (orderId) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_ORDER_CANCEL(orderId));
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    },

    /**
     * Get current market price for a symbol
     * @param {string} symbol - The ticker symbol
     */
    getMarketPrice: async (symbol) => {
        try {
            const response = await axiosInstance.get(`${API_ENDPOINTS.STOCKAL_MARKET_PRICE}?symbols=${symbol}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching market price:', error);
            throw error;
        }
    },

    /**
     * Get historical market prices for a symbol
     * @param {string} symbol - The ticker symbol
     */
    getMarketHistory: async (symbol) => {
        try {
            const response = await axiosInstance.get(`${API_ENDPOINTS.STOCKAL_MARKET_HISTORY}?symbols=${symbol}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching market history:', error);
            throw error;
        }
    },

    /**
     * Get available Stockal plans
     */
    getPlanList: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.STOCKAL_PLAN_LIST);
            return response.data;
        } catch (error) {
            console.error('Error fetching plan list:', error);
            throw error;
        }
    },

    /**
     * Activate a Stockal plan for a customer
     * @param {string} custId - The customer ID
     * @param {string} planId - The plan ID to activate
     */
    activatePlan: async (custId, planId) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOCKAL_PLAN_ADD(custId), { planId });
            return response.data;
        } catch (error) {
            console.error('Error activating plan:', error);
            throw error;
        }
    }
};

export default stockalService;
