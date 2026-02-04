import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';
import Cookies from 'js-cookie';


/**
 * Perform broker login
 * @param {object} credentials - Login credentials (user_email, broker_name, etc.)
 * @returns {Promise<object>}
 */
export const loginBroker = async (credentials) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.BROKER_LOGIN, credentials);
        return response.data;
    } catch (error) {
        console.error('Error performing broker login:', error);
        throw error;
    }
};

/**
 * Get broker status for a user
 * @param {string} userEmail 
 * @returns {Promise<object>}
 */
export const getBrokerStatus = async (userEmail) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.BROKER_STATUS, {
            params: { user_email: userEmail }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching broker status:', error);
        throw error;
    }
};

/**
 * Reconnect broker using saved credentials
 * @param {string} userEmail 
 * @param {string} brokerName 
 * @returns {Promise<object>}
 */
export const reconnectBroker = async (userEmail, brokerName) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.BROKER_RECONNECT, null, {
            params: { user_email: userEmail, broker_name: brokerName }
        });
        return response.data;
    } catch (error) {
        console.error('Error reconnecting broker:', error);
        throw error;
    }
};

/**
 * Store broker session details in cookies and localStorage
 * @param {object} session - Session details
 */
export const storeBrokerSession = (session) => {
    const token = session.token || session.access_token;
    const { expire, broker_name, client_id, user_email } = session;

    console.log('💾 Storing broker session:', { token, expire, broker_name, client_id, user_email });

    if (!token) {
        console.error("Attempted to store broker session without a token");
        return;
    }

    // Cookie options
    const options = {
        expires: 1, // 1 day
        secure: window.location.protocol === 'https:',
        sameSite: 'lax',
        path: '/'
    };

    // Store in cookies for backend and shared state
    Cookies.set('wealthai_broker_token', token, options);
    Cookies.set('wealthai_broker_name', broker_name, options);
    Cookies.set('wealthai_broker_client_id', client_id, options);
    Cookies.set('wealthai_broker_expiry', expire, options);

    // CRITICAL: Store the combined session cookie that brokerSlice.js expects
    const sessionData = {
        token,
        expire,
        broker_name,
        client_id,
        user_email,
        credentials: session.credentials || null // Persist raw credentials if provided
    };

    console.log('📦 Session data to store:', sessionData);
    Cookies.set('broker_session', JSON.stringify(sessionData), options);

    // Verify cookie was set
    const verifySet = Cookies.get('broker_session');
    console.log('✅ Verified broker_session cookie:', verifySet ? 'SET' : 'NOT SET');

    // Store in localStorage for frontend quick access (user-specific)
    localStorage.setItem(`wealthai_has_broker_${user_email}`, 'true');
    localStorage.setItem(`wealthai_active_broker_${user_email}`, broker_name);
    localStorage.setItem('wealthai_client_id', client_id);
    localStorage.setItem('broker_session', JSON.stringify(sessionData));

    console.log(`✅ Stored user-specific flags for ${user_email}`);

    // Also save raw credentials separately for form pre-filling if available
    if (session.credentials && user_email) {
        saveLocalBrokerCredentials(broker_name, session.credentials, user_email);
        console.log('✅ Saved credentials for pre-filling');
    }
};

/**
 * Save raw broker credentials locally for pre-filling (user-specific)
 * @param {string} brokerName 
 * @param {object} credentials 
 * @param {string} userEmail - User's email to make storage user-specific
 */
export const saveLocalBrokerCredentials = (brokerName, credentials, userEmail) => {
    try {
        if (!userEmail) {
            console.error("Cannot save credentials without user email");
            return;
        }

        // Store credentials per user email
        const storageKey = `wealthai_creds_${userEmail}`;
        const allCreds = JSON.parse(localStorage.getItem(storageKey) || '{}');
        allCreds[brokerName.toLowerCase()] = credentials;
        localStorage.setItem(storageKey, JSON.stringify(allCreds));
        localStorage.setItem(`wealthai_has_broker_${userEmail}`, 'true');
        localStorage.setItem(`wealthai_active_broker_${userEmail}`, brokerName.toLowerCase());
    } catch (e) {
        console.error("Error saving local credentials:", e);
    }
};

/**
 * Get raw broker credentials for a specific broker (user-specific)
 * @param {string} brokerName 
 * @param {string} userEmail - User's email to retrieve user-specific credentials
 * @returns {object|null}
 */
export const getLocalBrokerCredentials = (brokerName, userEmail) => {
    try {
        if (!userEmail) {
            console.error("Cannot get credentials without user email");
            return null;
        }

        const storageKey = `wealthai_creds_${userEmail}`;
        const allCreds = JSON.parse(localStorage.getItem(storageKey) || '{}');
        return allCreds[brokerName.toLowerCase()] || null;
    } catch (e) {
        console.error("Error reading local credentials:", e);
        return null;
    }
};

/**
 * Get stored broker session
 * @returns {object|null}
 */
export const getStoredBrokerSession = () => {
    const session = localStorage.getItem('broker_session');
    return session ? JSON.parse(session) : null;
};

/**
 * Clear broker session
 */
export const clearBrokerSession = () => {
    Cookies.remove('wealthai_broker_token');
    Cookies.remove('wealthai_broker_name');
    Cookies.remove('wealthai_broker_client_id');
    Cookies.remove('wealthai_broker_expiry');
    localStorage.removeItem('wealthai_has_broker');
    localStorage.removeItem('wealthai_active_broker');
    localStorage.removeItem('wealthai_client_id');
    localStorage.removeItem('broker_session');
};

export const brokerService = {
    loginBroker,
    getBrokerStatus,
    reconnectBroker,
    storeBrokerSession,
    getStoredBrokerSession,
    saveLocalBrokerCredentials,
    getLocalBrokerCredentials,
    clearBrokerSession
};

export default brokerService;

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
