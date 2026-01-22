import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import navigationReducer from './slices/navigationSlice';
import strategyReducer from './slices/strategySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        subscription: subscriptionReducer,
        navigation: navigationReducer,
        strategy: strategyReducer,
        ui: uiReducer,
    },
});

export default store;
