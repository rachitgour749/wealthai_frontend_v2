import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockalService from '../../api/services/stockalService';

export const fetchStockalAccountInfo = createAsyncThunk(
    'stockal/fetchAccountInfo',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getAccountInfo(custId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch account info');
        }
    }
);

export const fetchStockalBeneficiaries = createAsyncThunk(
    'stockal/fetchBeneficiaries',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getBeneficiaries(custId);
            return response.doc;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch beneficiaries');
        }
    }
);

export const updateStockalAccountInfo = createAsyncThunk(
    'stockal/updateAccountInfo',
    async ({ custId, payload }, { rejectWithValue }) => {
        try {
            const response = await stockalService.updateAccountInfo(custId, payload);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update account info');
        }
    }
);

export const updateStockalBeneficiaries = createAsyncThunk(
    'stockal/updateBeneficiaries',
    async ({ custId, beneficiaries }, { rejectWithValue }) => {
        try {
            const response = await stockalService.updateBeneficiaries(custId, { beneficiaries });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update beneficiaries');
        }
    }
);

export const createStockalUser = createAsyncThunk(
    'stockal/createUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await stockalService.createUser(payload);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create Stockal user');
        }
    }
);

export const validateStockalUser = createAsyncThunk(
    'stockal/validateUser',
    async (email, { rejectWithValue }) => {
        try {
            const response = await stockalService.validateUser(email);
            if (response.status === 200 && response.data?.data?.custId) {
                const custId = response.data.data.custId;
                localStorage.setItem('stockal_custId', custId);
                return { isValidated: true, custId };
            }
            return { isValidated: false, custId: null };
        } catch (error) {
            // axiosInstance reformats errors into { status, message, data }
            const message = error.message || '';
            if (message.toLowerCase().includes('kyc not initiated')) {
                // If KYC is not initiated, user is "validated" but needs to complete onboarding
                return { isValidated: true, kycNotInitiated: true };
            }
            if (error.status === 400 || error.status === 404) {
                return rejectWithValue('USER_NOT_FOUND');
            }
            return rejectWithValue(message || 'Validation failed');
        }
    }
);

export const fetchEkycStatus = createAsyncThunk(
    'stockal/fetchEkycStatus',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getEkycStatus(custId);
            return response.data;
        } catch (error) {
            // axiosInstance reformats errors into { status, message, data }
            const message = error.message || '';
            if (error.status === 400 || message.toLowerCase().includes('kyc not initiated')) {
                return rejectWithValue('KYC_NOT_INITIATED');
            }
            return rejectWithValue(message || 'Failed to fetch KYC status');
        }
    }
);

export const checkStockalUsername = createAsyncThunk(
    'stockal/checkUsername',
    async (username, { rejectWithValue }) => {
        try {
            const response = await stockalService.checkUsername(username);
            return response.status === 200;
        } catch (error) {
            if (error.status === 400) {
                return rejectWithValue('USERNAME_EXISTS');
            }
            return rejectWithValue(error.message || 'Username check failed');
        }
    }
);

export const uploadStockalDocument = createAsyncThunk(
    'stockal/uploadDocument',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await stockalService.uploadDocument(formData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Document upload failed');
        }
    }
);

export const submitStockalKyc = createAsyncThunk(
    'stockal/submitKyc',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.submitKyc(custId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'KYC submission failed');
        }
    }
);

export const fetchStockalEkycUrl = createAsyncThunk(
    'stockal/fetchEkycUrl',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getEkycUrl(custId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch EKYC URL');
        }
    }
);

export const fetchStockalAccountSummary = createAsyncThunk(
    'stockal/fetchAccountSummary',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getAccountSummary(custId);
            return response.doc;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch account summary');
        }
    }
);

export const fetchStockalPortfolio = createAsyncThunk(
    'stockal/fetchPortfolio',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getPortfolio(custId);
            return response.doc;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch portfolio');
        }
    }
);

export const fetchStockalPositions = createAsyncThunk(
    'stockal/fetchPositions',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getPositions(custId);
            return response.doc;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch positions');
        }
    }
);

export const fetchStockalHoldings = createAsyncThunk(
    'stockal/fetchHoldings',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getHoldings(custId);
            return response.doc;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch holdings');
        }
    }
);

export const placeStockalOrder = createAsyncThunk(
    'stockal/placeOrder',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await stockalService.placeOrder(payload);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Order placement failed');
        }
    }
);

export const fetchStockalOrderStatus = createAsyncThunk(
    'stockal/fetchOrderStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getOrderStatus(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch order status');
        }
    }
);

export const fetchStockalOrders = createAsyncThunk(
    'stockal/fetchOrders',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getOrders(custId);
            // New API returns an array of objects like { status: 200, doc: { ... }, ... }
            if (Array.isArray(response)) {
                return response.map(item => item.doc).filter(Boolean);
            }
            return response.doc || response || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch orders');
        }
    }
);

export const cancelStockalOrder = createAsyncThunk(
    'stockal/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await stockalService.cancelOrder(orderId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Order cancellation failed');
        }
    }
);

export const fetchMarketPrice = createAsyncThunk(
    'stockal/fetchMarketPrice',
    async (symbols, { rejectWithValue }) => {
        try {
            const symList = Array.isArray(symbols) ? symbols.join(',') : symbols;
            const response = await stockalService.getMarketPrice(symList);
            return response.doc?.currentPrice || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch market price');
        }
    }
);

export const fetchMarketHistory = createAsyncThunk(
    'stockal/fetchMarketHistory',
    async (symbol, { rejectWithValue }) => {
        try {
            const response = await stockalService.getMarketHistory(symbol);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch market history');
        }
    }
);

const initialState = {
    accountInfo: null,
    beneficiaries: [],
    isUserValidated: false,
    usernameAvailable: null, // null = not checked, true = available, false = taken
    accountSummary: null,
    portfolio: null,
    positions: [],
    holdingsData: {
        holdings: [],
        pendingOrders: []
    },
    orders: [],
    currentOrder: null,
    marketData: {
        price: null,
        history: [],
        symbol: null,
    },
    loading: {
        accountInfo: false,
        beneficiaries: false,
        updating: false,
        validation: false,
        usernameCheck: false,
        upload: false,
        kycSubmission: false,
        accountSummary: false,
        portfolio: false,
        positions: false,
        orders: false,
        market: false,
        placingOrder: false,
        holdings: false,
    },
    error: {
        accountInfo: null,
        beneficiaries: null,
        updating: null,
        validation: null,
        usernameCheck: null,
        upload: null,
        kyc: null,
        kycSubmission: null,
        accountSummary: null,
        portfolio: null,
        positions: null,
        ekycUrl: false,
        orders: null,
        market: null,
        holdings: null,
    },
    custId: localStorage.getItem('stockal_custId') || null,
    ekycUrlData: null,
    kycStatus: null, // PENDING, APPROVED, EXPIRED, REJECTED, NOT_INITIATED
    kycStatusReason: null,
    mainKycStatus: null, // APPROVED, PENDING, REJECTED, etc.
    mainKycStatusReason: null,
    isInitializing: true,
};

const stockalSlice = createSlice({
    name: 'stockal',
    initialState,
    reducers: {
        clearStockalErrors: (state) => {
            state.error = initialState.error;
            state.usernameAvailable = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Username Check
            .addCase(checkStockalUsername.pending, (state) => {
                state.loading.usernameCheck = true;
                state.error.usernameCheck = null;
                state.usernameAvailable = null;
            })
            .addCase(checkStockalUsername.fulfilled, (state, action) => {
                state.loading.usernameCheck = false;
                state.usernameAvailable = action.payload;
            })
            .addCase(checkStockalUsername.rejected, (state, action) => {
                state.loading.usernameCheck = false;
                state.usernameAvailable = false;
                state.error.usernameCheck = action.payload;
            })

            // Fetch Account Info
            .addCase(fetchStockalAccountInfo.pending, (state) => {
                state.loading.accountInfo = true;
                state.error.accountInfo = null;
            })
            .addCase(fetchStockalAccountInfo.fulfilled, (state, action) => {
                state.loading.accountInfo = false;
                state.accountInfo = action.payload;
                state.isUserValidated = true; // Auto-validate if account info is found
                
                // Update Main KYC status if available
                if (action.payload?.kycDetails) {
                    state.mainKycStatus = action.payload.kycDetails.status || null;
                    state.mainKycStatusReason = action.payload.kycDetails.reason || null;
                }
                if (!state.loading.kyc) {
                    state.isInitializing = false;
                }
            })
            .addCase(fetchStockalAccountInfo.rejected, (state, action) => {
                state.loading.accountInfo = false;
                state.error.accountInfo = action.payload;
                if (!state.loading.kyc) {
                    state.isInitializing = false;
                }
            })

            // Fetch Beneficiaries
            .addCase(fetchStockalBeneficiaries.pending, (state) => {
                state.loading.beneficiaries = true;
                state.error.beneficiaries = null;
            })
            .addCase(fetchStockalBeneficiaries.fulfilled, (state, action) => {
                state.loading.beneficiaries = false;
                state.beneficiaries = action.payload || [];
            })
            .addCase(fetchStockalBeneficiaries.rejected, (state, action) => {
                state.loading.beneficiaries = false;
                state.error.beneficiaries = action.payload;
            })

            // Update Account Info
            .addCase(updateStockalAccountInfo.pending, (state) => {
                state.loading.updating = true;
                state.error.updating = null;
            })
            .addCase(updateStockalAccountInfo.fulfilled, (state) => {
                state.loading.updating = false;
            })
            .addCase(updateStockalAccountInfo.rejected, (state, action) => {
                state.loading.updating = false;
                state.error.updating = action.payload;
            })

            // Update Beneficiaries
            .addCase(updateStockalBeneficiaries.pending, (state) => {
                state.loading.updating = true;
                state.error.updating = null;
            })
            .addCase(updateStockalBeneficiaries.fulfilled, (state) => {
                state.loading.updating = false;
            })
            .addCase(updateStockalBeneficiaries.rejected, (state, action) => {
                state.loading.updating = false;
                state.error.updating = action.payload;
            })

            // Create Stockal User
            .addCase(createStockalUser.pending, (state) => {
                state.loading.updating = true;
                state.error.updating = null;
            })
            .addCase(createStockalUser.fulfilled, (state, action) => {
                state.loading.updating = false;
                state.isUserValidated = true; // Set validated after creation
                const newCustId = action.payload?.custId || action.payload?.data?.custId;
                if (newCustId) {
                    state.custId = newCustId;
                    console.log("CustId from createStockalUser", newCustId)
                    localStorage.setItem('stockal_custId', newCustId);
                }
            })
            .addCase(createStockalUser.rejected, (state, action) => {
                state.loading.updating = false;
                state.error.updating = action.payload;
            })

            // Validate User
            .addCase(validateStockalUser.pending, (state) => {
                state.loading.validation = true;
                state.error.validation = null;
            })
            .addCase(validateStockalUser.fulfilled, (state, action) => {
                state.loading.validation = false;
                state.isUserValidated = action.payload.isValidated;
                if (action.payload.custId) {
                    state.custId = action.payload.custId;
                } else if (!action.payload.isValidated) {
                    // Clear stale custId if user is not validated
                    state.custId = null;
                    localStorage.removeItem('stockal_custId');
                }
                if (action.payload.kycNotInitiated) {
                    state.kycStatus = 'NOT_INITIATED';
                }
                // If validated or specifically marked as needing KYC, we can finish initializing
                // but only after we attempt to fetch KYC status if we have a custId
                if (!action.payload.isValidated || action.payload.kycNotInitiated || !action.payload.custId) {
                    state.isInitializing = false;
                }
            })
            .addCase(validateStockalUser.rejected, (state, action) => {
                state.loading.validation = false;
                state.isUserValidated = false;
                state.custId = null;
                localStorage.removeItem('stockal_custId');
                state.error.validation = action.payload;
                state.isInitializing = false;
            })

            // EKYC Status
            .addCase(fetchEkycStatus.pending, (state) => {
                state.loading.kyc = true;
                state.error.kyc = null;
            })
            .addCase(fetchEkycStatus.fulfilled, (state, action) => {
                state.loading.kyc = false;
                const data = action.payload?.data;

                // Treat PENDING with NO REASON as NOT_INITIATED as per user request
                if (data?.status === 'PENDING' && !data?.statusReason) {
                    state.kycStatus = 'NOT_INITIATED';
                } else {
                    state.kycStatus = data?.status || 'NOT_INITIATED';
                }

                state.kycStatusReason = data?.statusReason || null;
                if (!state.loading.accountInfo) {
                    state.isInitializing = false;
                }
            })
            .addCase(fetchEkycStatus.rejected, (state, action) => {
                state.loading.kyc = false;
                if (action.payload === 'KYC_NOT_INITIATED') {
                    state.kycStatus = 'NOT_INITIATED';
                } else {
                    state.error.kyc = action.payload;
                }
                if (!state.loading.accountInfo) {
                    state.isInitializing = false;
                }
            })

            // Document Upload
            .addCase(uploadStockalDocument.pending, (state) => {
                state.loading.upload = true;
                state.error.upload = null;
            })
            .addCase(uploadStockalDocument.fulfilled, (state) => {
                state.loading.upload = false;
            })
            .addCase(uploadStockalDocument.rejected, (state, action) => {
                state.loading.upload = false;
                state.error.upload = action.payload;
            })

            // KYC Submission
            .addCase(submitStockalKyc.pending, (state) => {
                state.loading.kycSubmission = true;
                state.error.kycSubmission = null;
            })
            .addCase(submitStockalKyc.fulfilled, (state) => {
                state.loading.kycSubmission = false;
            })
            .addCase(submitStockalKyc.rejected, (state, action) => {
                state.loading.kycSubmission = false;
                state.error.kycSubmission = action.payload;
            })

            // Account Summary
            .addCase(fetchStockalAccountSummary.pending, (state) => {
                state.loading.accountSummary = true;
                state.error.accountSummary = null;
            })
            .addCase(fetchStockalAccountSummary.fulfilled, (state, action) => {
                state.loading.accountSummary = false;
                state.accountSummary = action.payload;
            })
            .addCase(fetchStockalAccountSummary.rejected, (state, action) => {
                state.loading.accountSummary = false;
                state.error.accountSummary = action.payload;
            })

            // Portfolio
            .addCase(fetchStockalPortfolio.pending, (state) => {
                state.loading.portfolio = true;
                state.error.portfolio = null;
            })
            .addCase(fetchStockalPortfolio.fulfilled, (state, action) => {
                state.loading.portfolio = false;
                state.portfolio = action.payload;
            })
            .addCase(fetchStockalPortfolio.rejected, (state, action) => {
                state.loading.portfolio = false;
                state.error.portfolio = action.payload;
            })

            // Positions
            .addCase(fetchStockalPositions.pending, (state) => {
                state.loading.positions = true;
                state.error.positions = null;
            })
            .addCase(fetchStockalPositions.fulfilled, (state, action) => {
                state.loading.positions = false;
                state.positions = Array.isArray(action.payload) ? action.payload : [action.payload];
            })
            .addCase(fetchStockalPositions.rejected, (state, action) => {
                state.loading.positions = false;
                state.error.positions = action.payload;
            })

            // EKYC URL
            .addCase(fetchStockalEkycUrl.pending, (state) => {
                state.loading.ekycUrl = true;
                state.error.kyc = null;
            })
            .addCase(fetchStockalEkycUrl.fulfilled, (state, action) => {
                state.loading.ekycUrl = false;
                state.ekycUrlData = action.payload;
            })
            .addCase(fetchStockalEkycUrl.rejected, (state, action) => {
                state.loading.ekycUrl = false;
                state.error.kyc = action.payload;
            })

            // Holdings
            .addCase(fetchStockalHoldings.pending, (state) => {
                state.loading.holdings = true;
                state.error.holdings = null;
            })
            .addCase(fetchStockalHoldings.fulfilled, (state, action) => {
                state.loading.holdings = false;
                state.holdingsData = {
                    holdings: action.payload?.holdings || [],
                    pendingOrders: action.payload?.pendingOrders || []
                };
            })
            .addCase(fetchStockalHoldings.rejected, (state, action) => {
                state.loading.holdings = false;
                state.error.holdings = action.payload;
            })

            // Orders
            .addCase(placeStockalOrder.pending, (state) => {
                state.loading.placingOrder = true;
                state.error.orders = null;
            })
            .addCase(placeStockalOrder.fulfilled, (state, action) => {
                state.loading.placingOrder = false;
                // Optionally add the new order to the orders list if the response includes it
            })
            .addCase(placeStockalOrder.rejected, (state, action) => {
                state.loading.placingOrder = false;
                state.error.orders = action.payload;
            })

            .addCase(fetchStockalOrders.pending, (state) => {
                state.loading.orders = true;
                state.error.orders = null;
            })
            .addCase(fetchStockalOrders.fulfilled, (state, action) => {
                state.loading.orders = false;
                state.orders = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchStockalOrders.rejected, (state, action) => {
                state.loading.orders = false;
                state.error.orders = action.payload;
            })

            .addCase(cancelStockalOrder.pending, (state) => {
                state.loading.orders = true;
            })
            .addCase(cancelStockalOrder.fulfilled, (state, action) => {
                state.loading.orders = false;
                // Update order status in state if needed
            })
            .addCase(cancelStockalOrder.rejected, (state, action) => {
                state.loading.orders = false;
                state.error.orders = action.payload;
            })

            .addCase(fetchStockalOrderStatus.fulfilled, (state, action) => {
                state.currentOrder = action.payload;
            })

            // Market Data
            .addCase(fetchMarketPrice.pending, (state) => {
                state.loading.market = true;
            })
            .addCase(fetchMarketPrice.fulfilled, (state, action) => {
                state.loading.market = false;
                state.marketData.price = action.payload;
            })
            .addCase(fetchMarketPrice.rejected, (state, action) => {
                state.loading.market = false;
                state.error.market = action.payload;
            })

            .addCase(fetchMarketHistory.fulfilled, (state, action) => {
                state.marketData.history = action.payload;
            });
    },
});

export const { clearStockalErrors } = stockalSlice.actions;
export default stockalSlice.reducer;
