import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        subscription: subscriptionReducer,
        navigation: navigationReducer,
    },
});

export default store;
