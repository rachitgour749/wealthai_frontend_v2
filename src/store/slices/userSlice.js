import { createSlice } from '@reduxjs/toolkit';
import { removeToken } from '../../utils/tokenManager';

// Load user from localStorage if exists
const loadUserFromStorage = () => {
    try {
        const serializedUser = localStorage.getItem('wealthwisers_user');
        if (serializedUser === null) {
            return null;
        }
        return JSON.parse(serializedUser);
    } catch (err) {
        console.error('Error loading user from localStorage:', err);
        return null;
    }
};

// Save user to localStorage
const saveUserToStorage = (user) => {
    try {
        const serializedUser = JSON.stringify(user);
        localStorage.setItem('wealthwisers_user', serializedUser);
    } catch (err) {
        console.error('Error saving user to localStorage:', err);
    }
};

// Remove user from localStorage
const removeUserFromStorage = () => {
    try {
        localStorage.removeItem('wealthwisers_user');
    } catch (err) {
        console.error('Error removing user from localStorage:', err);
    }
};

const initialState = {
    isAuthenticated: false,
    user: loadUserFromStorage(),
};

// If user exists in localStorage, set isAuthenticated to true
if (initialState.user) {
    initialState.isAuthenticated = true;
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginUser: (state, action) => {
            state.isAuthenticated = true;
            state.user = {
                googleId: action.payload.googleId,
                email: action.payload.email,
                name: action.payload.name,
                picture: action.payload.picture,
                givenName: action.payload.givenName,
                familyName: action.payload.familyName,
                token: action.payload.token, // Add token to user state
                role: action.payload.role, // Add role to user state
            };
            saveUserToStorage(state.user);
        },
        logoutUser: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            removeUserFromStorage();
            removeToken(); // Clear token from localStorage
        },
        updateUserProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                saveUserToStorage(state.user);
            }
        },
    },
});

export const { loginUser, logoutUser, updateUserProfile } = userSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUser = (state) => state.user.user;
export const selectUserName = (state) => state.user.user?.name || '';
export const selectUserEmail = (state) => state.user.user?.email || '';
export const selectUserPicture = (state) => state.user.user?.picture || '';

export default userSlice.reducer;
