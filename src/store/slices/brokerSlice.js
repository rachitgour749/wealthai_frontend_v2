import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Helper to check connection status from cookie
const checkConnection = () => {
    try {
        const sessionCookie = Cookies.get('broker_session');
        console.log('🔍 Checking broker connection, cookie value:', sessionCookie);

        if (!sessionCookie) {
            console.log('❌ No broker_session cookie found');
            return { connected: false, broker: null, expired: false };
        }

        const session = JSON.parse(sessionCookie);
        console.log('📦 Parsed session:', session);

        // Check mandatory fields
        if (!session.token) {
            console.log('❌ No token in session');
            return { connected: false, broker: null, expired: false };
        }

        // Check expiry
        // "Active means token is not expire"
        if (session.expire) {
            const now = new Date();
            const expireDate = new Date(session.expire);
            if (expireDate <= now) {
                console.log('⏰ Session expired');
                return { connected: false, broker: session.broker_name, expired: true }; // Expired
            }
        }

        console.log('✅ Broker connected:', session.broker_name);
        return {
            connected: true,
            broker: session.broker_name,
            expired: false
        };
    } catch (e) {
        console.error("Error parsing broker session:", e);
        return { connected: false, broker: null, expired: false };
    }
};

const initialStatus = checkConnection();
const initialHasCreds = localStorage.getItem('wealthai_has_broker') === 'true' || !!initialStatus.broker;

const initialState = {
    isBrokerConnected: initialStatus.connected,
    activeBroker: initialStatus.broker,
    isExpired: initialStatus.expired,
    hasSavedCredentials: initialHasCreds,
};

const brokerSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {
        updateBrokerConnectionStatus: (state) => {
            const status = checkConnection();
            state.isBrokerConnected = status.connected;
            state.activeBroker = status.broker;
            state.isExpired = status.expired;
            if (status.broker) {
                state.hasSavedCredentials = true;
                localStorage.setItem('wealthai_has_broker', 'true');
            }
        },
        setSavedCredentials: (state, action) => {
            state.hasSavedCredentials = action.payload;
            if (action.payload) {
                localStorage.setItem('wealthai_has_broker', 'true');
            } else {
                localStorage.removeItem('wealthai_has_broker');
            }
        },
        clearBrokerConnection: (state) => {
            state.isBrokerConnected = false;
            state.activeBroker = null;
            state.isExpired = false;
            state.hasSavedCredentials = false;
            Cookies.remove('broker_session');
            localStorage.removeItem('active_broker_session');
            localStorage.removeItem('wealthai_has_broker');
        },
    },
});

export const { updateBrokerConnectionStatus, setSavedCredentials, clearBrokerConnection } = brokerSlice.actions;

export const selectIsBrokerConnected = (state) => state.broker.isBrokerConnected;
export const selectActiveBroker = (state) => state.broker.activeBroker;
export const selectIsExpired = (state) => state.broker.isExpired;
export const selectHasSavedCredentials = (state) => state.broker.hasSavedCredentials;

export default brokerSlice.reducer;
