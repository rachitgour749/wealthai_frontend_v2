import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    backtestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    backtestResults: null,
    saveStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    instances: [],
    instancesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const strategySlice = createSlice({
    name: 'strategy',
    initialState,
    reducers: {
        runBacktestRequest: (state) => {
            state.backtestStatus = 'loading';
            state.error = null;
        },
        runBacktestSuccess: (state, action) => {
            state.backtestStatus = 'succeeded';
            state.backtestResults = action.payload;
            state.error = null;
        },
        runBacktestFailure: (state, action) => {
            state.backtestStatus = 'failed';
            state.error = action.payload;
        },
        resetBacktest: (state) => {
            state.backtestStatus = 'idle';
            state.backtestResults = null;
            state.error = null;
            state.saveStatus = 'idle';
        },
        saveStrategyRequest: (state) => {
            state.saveStatus = 'loading';
        },
        saveStrategySuccess: (state) => {
            state.saveStatus = 'succeeded';
        },
        saveStrategyFailure: (state, action) => {
            state.saveStatus = 'failed';
            state.error = action.payload;
        },
        resetSaveStatus: (state) => {
            state.saveStatus = 'idle';
        },
        fetchInstancesRequest: (state) => {
            state.instancesStatus = 'loading';
        },
        fetchInstancesSuccess: (state, action) => {
            state.instancesStatus = 'succeeded';
            // Backend might return { status: 'success', data: [...] } or just [...]
            state.instances = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
        },
        fetchInstancesFailure: (state, action) => {
            state.instancesStatus = 'failed';
            state.error = action.payload;
        },
    },
});

export const {
    runBacktestRequest,
    runBacktestSuccess,
    runBacktestFailure,
    resetBacktest,
    saveStrategyRequest,
    saveStrategySuccess,
    saveStrategyFailure,
    resetSaveStatus,
    fetchInstancesRequest,
    fetchInstancesSuccess,
    fetchInstancesFailure
} = strategySlice.actions;

export const selectBacktestStatus = (state) => state.strategy.backtestStatus;
export const selectBacktestResults = (state) => state.strategy.backtestResults;
export const selectBacktestError = (state) => state.strategy.error;
export const selectSaveStatus = (state) => state.strategy.saveStatus;
export const selectInstances = (state) => state.strategy.instances;
export const selectInstancesStatus = (state) => state.strategy.instancesStatus;
export const selectInstancesCount = (state) => state.strategy.instances.length;

export default strategySlice.reducer;
