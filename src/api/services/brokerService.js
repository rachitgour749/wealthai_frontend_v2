import axios from 'axios';
import API_BASE_URL, { API_ENDPOINTS } from '../config/apiConfig';
import Cookies from 'js-cookie';

/**
 * Fetch broker details for a user
 * @param {string} email 
 * @returns {Promise<object>}
 */
export const getBrokerDetails = async (email) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_DETAILS(email)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching broker details:', error);
        throw error;
    }
};

/**
 * Store broker session details in cookies
 * @param {object} data - Broker data 
 */
export const storeBrokerSession = (data) => {
    if (!data) return;

    // Cookie options
    const options = {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'lax'
    };

    // Store individual fields as requested or a JSON object
    // Storing as a JSON object 'broker_session' for easier management
    // and also individual fields if needed by backend/other apps
    Cookies.set('broker_session', JSON.stringify({
        broker_name: data.broker_name,
        token: data.token,
        client_id: data.client_id,
        user_email: data.user_email,
        expire: data.expire
    }), options);

    // Also syncing with localStorage for existing redux slice compatibility if needed
    // But we will update redux slice to read from cookies primarily or sync here
    localStorage.setItem('active_broker_session', JSON.stringify({
        broker_name: data.broker_name,
        token: data.token,
        // ... other fields if needed by existing code
    }));
};

/**
 * Check if broker token is active
 * @param {string} expireDateString 
 * @returns {boolean}
 */
export const isTokenActive = (expireDateString) => {
    if (!expireDateString) return false;

    const expireDate = new Date(expireDateString);
    const now = new Date();

    return expireDate > now;
};
