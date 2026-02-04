import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Helper to check connection status from cookie
const checkConnection = () => {
    try {
        const sessionCookie = Cookies.get('broker_session');
        if (!sessionCookie) return { connected: false, broker: null };

        const session = JSON.parse(sessionCookie);

        // Check mandatory fields
        if (!session.token) return { connected: false, broker: null };

        // Check expiry
        // "Active means token is not expire"
        if (session.expire) {
            const now = new Date();
            const expireDate = new Date(session.expire);
            if (expireDate <= now) {
                return { connected: false, broker: session.broker_name }; // Expired
            }
        }

        return {
            connected: true,
            broker: session.broker_name
        };
    } catch (e) {
        console.error("Error parsing broker session:", e);
        return { connected: false, broker: null };
    }
};

const initialStatus = checkConnection();

const initialState = {
    isBrokerConnected: initialStatus.connected,
    activeBroker: initialStatus.broker,
};

const brokerSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {
        updateBrokerConnectionStatus: (state) => {
            const status = checkConnection();
            state.isBrokerConnected = status.connected;
            state.activeBroker = status.broker;
        },
        clearBrokerConnection: (state) => {
            state.isBrokerConnected = false;
            state.activeBroker = null;
            Cookies.remove('broker_session');
            localStorage.removeItem('active_broker_session');
        },
    },
});

export const { updateBrokerConnectionStatus, clearBrokerConnection } = brokerSlice.actions;

export const selectIsBrokerConnected = (state) => state.broker.isBrokerConnected;
export const selectActiveBroker = (state) => state.broker.activeBroker;

export default brokerSlice.reducer;
