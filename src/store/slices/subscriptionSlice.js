import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subscriptionService from '../../api/services/subscriptionService';

// Async Thunks

/**
 * Fetch all products with subscription status
 */
export const fetchProducts = createAsyncThunk(
    'subscription/fetchProducts',
    async (email, { rejectWithValue }) => {
        try {
            const products = await subscriptionService.getProducts(email);
            return products;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

/**
 * Fetch user subscription details
 */
export const fetchUserSubscription = createAsyncThunk(
    'subscription/fetchUserSubscription',
    async (email, { rejectWithValue }) => {
        try {
            const subscription = await subscriptionService.getUserSubscription(email);
            return subscription;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subscription');
        }
    }
);

/**
 * Activate free trial
 */
export const activateTrial = createAsyncThunk(
    'subscription/activateTrial',
    async ({ email, name }, { rejectWithValue, dispatch }) => {
        try {
            const result = await subscriptionService.activateTrial(email, name);

            // Refresh products after trial activation
            await dispatch(fetchProducts(email));

            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to activate trial');
        }
    }
);

// Initial State
const initialState = {
    products: [],
    userSubscription: null,
    loading: false,
    error: null,
    trialActivating: false,
    shouldShowTrial: false,
};

// Subscription Slice
const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        // Set products manually
        setProducts: (state, action) => {
            state.products = action.payload;
        },

        // Set trial popup visibility
        setShouldShowTrial: (state, action) => {
            state.shouldShowTrial = action.payload;
        },

        // Clear subscription data (on logout)
        clearSubscriptionData: (state) => {
            state.products = [];
            state.userSubscription = null;
            state.error = null;
            state.shouldShowTrial = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Products
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;

                // Check if products array is empty to show trial popup
                if (Array.isArray(action.payload) && action.payload.length === 0) {
                    state.shouldShowTrial = true;
                } else {
                    state.shouldShowTrial = false;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch User Subscription
        builder
            .addCase(fetchUserSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.userSubscription = action.payload;
            })
            .addCase(fetchUserSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Activate Trial
        builder
            .addCase(activateTrial.pending, (state) => {
                state.trialActivating = true;
                state.error = null;
            })
            .addCase(activateTrial.fulfilled, (state) => {
                state.trialActivating = false;
                state.shouldShowTrial = false;
            })
            .addCase(activateTrial.rejected, (state, action) => {
                state.trialActivating = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const {
    setProducts,
    setShouldShowTrial,
    clearSubscriptionData,
    clearError,
} = subscriptionSlice.actions;

// Selectors
export const selectProducts = (state) => state.subscription.products;
export const selectUserSubscription = (state) => state.subscription.userSubscription;
export const selectSubscriptionLoading = (state) => state.subscription.loading;
export const selectSubscriptionError = (state) => state.subscription.error;
export const selectShouldShowTrial = (state) => state.subscription.shouldShowTrial;
export const selectTrialActivating = (state) => state.subscription.trialActivating;
export const selectHasActiveSubscription = (state) => {
    return state.subscription.products && state.subscription.products.length > 0;
};

export default subscriptionSlice.reducer;
