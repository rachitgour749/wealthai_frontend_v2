import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { getAccountDetails } from '../../api/services/brokerService';

// Async thunk to fetch account details from API
export const fetchAccountDetails = createAsyncThunk(
    'broker/fetchAccountDetails',
    async (userEmail, { rejectWithValue }) => {
        try {
            const data = await getAccountDetails(userEmail);
            // Store results in localStorage for the slice to pick up on page load
            if (data && data.broker_name) {
                const session = {
                    broker_name: data.broker_name,
                    client_id: data.client_id,
                    user_email: userEmail,
                    token: Cookies.get('wealthai_broker_token') || localStorage.getItem('wealthai_broker_token'),
                    expire: Cookies.get('wealthai_broker_expiry') || localStorage.getItem('wealthai_broker_expiry'),
                    credentials: data.credentials
                };
                localStorage.setItem('broker_session', JSON.stringify(session));
                localStorage.setItem('wealthai_has_broker', 'true');
            }
            return data;
        } catch (error) {
            // Handle 404 as "No broker connected"
            if (error.response && error.response.status === 404) {
                localStorage.removeItem('broker_session');
                localStorage.removeItem('wealthai_has_broker');
                return rejectWithValue({ type: 'NOT_FOUND' });
            }
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to delete account
export const deleteBrokerAccount = createAsyncThunk(
    'broker/deleteBrokerAccount',
    async ({ userEmail, clientId }, { dispatch, getState, rejectWithValue }) => {
        try {
            const { deleteAccount } = await import('../../api/services/brokerService');
            const state = getState();
            const activeBroker = state.broker.activeBroker;

            const data = await deleteAccount(userEmail, clientId);
            if (data.status === 'success') {
                dispatch(clearBrokerConnection({ userEmail, brokerName: activeBroker }));
                return data;
            }
            return rejectWithValue(data.message || 'Failed to delete account');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to update credentials
export const updateBrokerCredentialsThunk = createAsyncThunk(
    'broker/updateBrokerCredentials',
    async (params, { dispatch, rejectWithValue }) => {
        try {
            const { updateBrokerCredentials } = await import('../../api/services/brokerService');
            const data = await updateBrokerCredentials(params);
            if (data.status === 'success') {
                // Refresh details after successful update
                dispatch(fetchAccountDetails(params.user_email));
                return data;
            }
            return rejectWithValue(data.message || 'Failed to update credentials');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Helper to check connection status from localStorage (synchronous) and cookie (fallback)
const checkConnection = () => {
    try {
        // First try localStorage (synchronous, immediate)
        const localSession = localStorage.getItem('broker_session');
        if (localSession) {
            try {
                const session = JSON.parse(localSession);
                if (session.token) {
                    if (session.expire) {
                        const now = new Date();
                        const expireDate = new Date(session.expire);
                        if (expireDate <= now) {
                            return { connected: false, broker: session.broker_name, expired: true };
                        }
                    }
                    return { connected: true, broker: session.broker_name, expired: false };
                }
            } catch (parseError) {
                console.error('Error parsing localStorage session:', parseError);
            }
        }

        const sessionCookie = Cookies.get('broker_session');
        if (sessionCookie) {
            const session = JSON.parse(sessionCookie);
            if (session.token) {
                if (session.expire) {
                    const now = new Date();
                    const expireDate = new Date(session.expire);
                    if (expireDate <= now) {
                        return { connected: false, broker: session.broker_name, expired: true };
                    }
                }
                return { connected: true, broker: session.broker_name, expired: false };
            }
        }
        return { connected: false, broker: null, expired: false };
    } catch (e) {
        console.error("Error parsing broker session:", e);
        return { connected: false, broker: null, expired: false };
    }
};

const initialStatus = checkConnection();

const initialState = {
    isBrokerConnected: initialStatus.connected,
    activeBroker: initialStatus.broker,
    isExpired: initialStatus.expired,
    hasSavedCredentials: localStorage.getItem('wealthai_has_broker') === 'true' || !!initialStatus.broker,
    loading: false,
    error: null,
    accountDetails: null
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
        clearBrokerConnection: (state, action) => {
            const { userEmail, brokerName } = action.payload || {};

            state.isBrokerConnected = false;
            state.activeBroker = null;
            state.isExpired = false;
            state.hasSavedCredentials = false;
            state.accountDetails = null;

            // Clear basic cookies
            Cookies.remove('broker_session');
            Cookies.remove('wealthai_broker_token');
            Cookies.remove('wealthai_broker_name');
            Cookies.remove('wealthai_broker_client_id');
            Cookies.remove('wealthai_broker_expiry');

            // Clear legacy/generic localStorage
            localStorage.removeItem('active_broker_session');
            localStorage.removeItem('wealthai_has_broker');
            localStorage.removeItem('broker_session');
            localStorage.removeItem('wealthai_client_id');

            // Clear user-specific localStorage keys if email is provided
            if (userEmail) {
                localStorage.removeItem(`wealthai_has_broker_${userEmail}`);
                localStorage.removeItem(`wealthai_active_broker_${userEmail}`);
                localStorage.removeItem(`wealthai_creds_${userEmail}`);

                // If we know which broker was active, we could be more specific, 
                // but usually we want to clear ALL cached credentials for that user
                // on this specific device if they "remove" the account.
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccountDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.accountDetails = action.payload;
                // Update basic status flags from API data
                if (action.payload && action.payload.broker_name) {
                    state.activeBroker = action.payload.broker_name;
                    state.isBrokerConnected = true; // If we found details, assume it's the connected broker
                    state.hasSavedCredentials = true;
                    localStorage.setItem('wealthai_has_broker', 'true');
                }
            })
            .addCase(fetchAccountDetails.rejected, (state, action) => {
                state.loading = false;
                state.accountDetails = null;
                if (action.payload && action.payload.type === 'NOT_FOUND') {
                    // This is the expected 404: No broker added
                    state.isBrokerConnected = false;
                    state.activeBroker = null;
                    state.hasSavedCredentials = false;
                    localStorage.removeItem('wealthai_has_broker');
                } else {
                    state.error = action.payload;
                }
            })
            // Delete Account Cases
            .addCase(deleteBrokerAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBrokerAccount.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteBrokerAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Credentials Cases
            .addCase(updateBrokerCredentialsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrokerCredentialsThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateBrokerCredentialsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { updateBrokerConnectionStatus, setSavedCredentials, clearBrokerConnection } = brokerSlice.actions;

export const selectIsBrokerConnected = (state) => state.broker.isBrokerConnected;
export const selectActiveBroker = (state) => state.broker.activeBroker;
export const selectIsExpired = (state) => state.broker.isExpired;
export const selectHasSavedCredentials = (state) => state.broker.hasSavedCredentials;

export default brokerSlice.reducer;
