import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockalService from '../../api/services/stockalService';

export const fetchStockalAccountInfo = createAsyncThunk(
    'stockal/fetchAccountInfo',
    async (custId, { rejectWithValue }) => {
        try {
            const response = await stockalService.getAccountInfo(custId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch account info');
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
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch beneficiaries');
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
            return rejectWithValue(error.response?.data?.message || 'Failed to update account info');
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
            return rejectWithValue(error.response?.data?.message || 'Failed to update beneficiaries');
        }
    }
);

export const validateStockalUser = createAsyncThunk(
    'stockal/validateUser',
    async (email, { rejectWithValue }) => {
        try {
            const response = await stockalService.validateUser(email);
            return response.status === 200;
        } catch (error) {
            if (error.status === 404) {
                return rejectWithValue('USER_NOT_FOUND');
            }
            return rejectWithValue(error.message || 'Validation failed');
        }
    }
);

const initialState = {
    accountInfo: null,
    beneficiaries: [],
    isUserValidated: false,
    loading: {
        accountInfo: false,
        beneficiaries: false,
        updating: false,
        validation: false,
    },
    error: {
        accountInfo: null,
        beneficiaries: null,
        updating: null,
        validation: null,
    },
};

const stockalSlice = createSlice({
    name: 'stockal',
    initialState,
    reducers: {
        clearStockalErrors: (state) => {
            state.error = initialState.error;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Account Info
            .addCase(fetchStockalAccountInfo.pending, (state) => {
                state.loading.accountInfo = true;
                state.error.accountInfo = null;
            })
            .addCase(fetchStockalAccountInfo.fulfilled, (state, action) => {
                state.loading.accountInfo = false;
                state.accountInfo = action.payload;
            })
            .addCase(fetchStockalAccountInfo.rejected, (state, action) => {
                state.loading.accountInfo = false;
                state.error.accountInfo = action.payload;
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

            // Validate User
            .addCase(validateStockalUser.pending, (state) => {
                state.loading.validation = true;
                state.error.validation = null;
            })
            .addCase(validateStockalUser.fulfilled, (state, action) => {
                state.loading.validation = false;
                state.isUserValidated = action.payload;
            })
            .addCase(validateStockalUser.rejected, (state, action) => {
                state.loading.validation = false;
                state.isUserValidated = false;
                state.error.validation = action.payload;
            });
    },
});

export const { clearStockalErrors } = stockalSlice.actions;
export default stockalSlice.reducer;
