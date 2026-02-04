import Cookies from 'js-cookie';

const DUMMY_ZERODHA = {
    user_email: "rachit.gour749@gmail.com",
    broker_name: "ZERODHA",
    apiKey: "wo9retjw4aptss4j",
    api_secret: "b6yjaof105oqhdt9rq5zpnv6c3d3w6vd",
    "Client ID": "CTU900",
    password: "Rohit@1122",
    DOB: "1999-01-01",
    totp: "EMV43CYUM5BGAQDSDOHTQ3KFWRG45PNA"
};

/**
 * Service to handle broker transitions and session management
 */
export const brokerService = {
    /**
     * Save broker session data to local storage and cookies
     * @param {Object} sessionData - The session data to save
     */
    saveSession: (sessionData) => {
        try {
            const brokerName = sessionData.broker_name;

            // Generate token and expiry (1 hour)
            const token = "active_token_" + Math.random().toString(36).substring(7);
            const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            const sessionInfo = {
                ...sessionData,
                client_id: sessionData.client_id || sessionData["Client ID"] || "WAI_CLIENT",
                token,
                expire: expireTime.toISOString(),
                saved_at: new Date().toISOString()
            };

            // Save to localStorage for historical data/credentials
            const sessions = JSON.parse(localStorage.getItem('broker_sessions') || '{}');
            sessions[brokerName] = sessionInfo;
            localStorage.setItem('broker_sessions', JSON.stringify(sessions));

            // Save specifically for individual broker credentials if not exists
            const credentials = JSON.parse(localStorage.getItem('broker_credentials') || '{}');
            if (!credentials[brokerName]) {
                credentials[brokerName] = { ...sessionData };
                localStorage.setItem('broker_credentials', JSON.stringify(credentials));
            }

            // Save to Cookies for active session check (used by brokerSlice)
            Cookies.set('broker_session', JSON.stringify(sessionInfo), { expires: 1 / 24 }); // 1 hour

            // Also save the "active" session for backward compatibility
            localStorage.setItem('active_broker_session', JSON.stringify(sessionInfo));

            console.log(`Session saved for ${brokerName}. Expire at: ${expireTime}`);
            return true;
        } catch (error) {
            console.error('Error saving broker session:', error);
            return false;
        }
    },

    /**
     * Get saved credentials for a specific broker
     */
    getSavedCredentials: (brokerName) => {
        try {
            // Check dummy first
            if (brokerName === "ZERODHA") {
                return DUMMY_ZERODHA;
            }
            const credentials = JSON.parse(localStorage.getItem('broker_credentials') || '{}');
            return credentials[brokerName] || null;
        } catch (error) {
            console.error('Error getting saved credentials:', error);
            return null;
        }
    },

    /**
     * Handle login logic for a broker
     */
    loginWithBroker: async (brokerName, formData) => {
        try {
            // In the future, this will call an API
            // For now, we simulate success and save/update credentials

            console.log(`Logging in with ${brokerName}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const sessionData = {
                ...formData,
                broker_name: brokerName,
                success: true
            };

            return brokerService.saveSession(sessionData);
        } catch (error) {
            console.error('Broker login failed:', error);
            return false;
        }
    },

    /**
     * Get saved session for a specific broker
     * @param {string} brokerName - Name of the broker
     */
    getSession: (brokerName) => {
        try {
            const sessions = JSON.parse(localStorage.getItem('broker_sessions') || '{}');
            return sessions[brokerName] || null;
        } catch (error) {
            console.error('Error getting broker session:', error);
            return null;
        }
    },

    /**
     * Remove session for a specific broker
     * @param {string} brokerName - Name of the broker
     */
    removeSession: (brokerName) => {
        try {
            const sessions = JSON.parse(localStorage.getItem('broker_sessions') || '{}');
            if (sessions[brokerName]) {
                delete sessions[brokerName];
                localStorage.setItem('broker_sessions', JSON.stringify(sessions));
                Cookies.remove('broker_session');
                localStorage.removeItem('active_broker_session');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing broker session:', error);
            return false;
        }
    }
};
