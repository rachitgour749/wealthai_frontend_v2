import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notification: {
        isVisible: false,
        message: '',
        type: 'success', // 'success' | 'error' | 'loading' | 'info' | 'warning'
    },
    viewMode: 'config', // 'config' | 'results'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showNotification: (state, action) => {
            state.notification.isVisible = true;
            state.notification.message = action.payload.message;
            state.notification.type = action.payload.type || 'success';
        },
        hideNotification: (state) => {
            state.notification.isVisible = false;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload; // 'config' or 'results'
        },
    },
});

export const { showNotification, hideNotification, setViewMode } = uiSlice.actions;

export const selectNotification = (state) => state.ui.notification;
export const selectViewMode = (state) => state.ui.viewMode;

export default uiSlice.reducer;
