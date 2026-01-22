import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPage: 'Home',           // Main page: Home, ChatAi1, InvestAi1, MarketsAi1
    currentTab: 'Strategies',      // Tab within MarketsAi1: Strategies, Optimization, Scanner
    currentStrategy: null,         // Strategy detail page: etf-strategy, RS-ETF-strategy, etc.
    navigationHistory: []          // Breadcrumb trail for back navigation
};

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
            state.currentStrategy = null; // Reset strategy when changing main page
            state.navigationHistory.push({
                type: 'page',
                value: action.payload,
                timestamp: Date.now()
            });
        },
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload;
            state.currentStrategy = null; // Reset strategy when changing tab
            state.navigationHistory.push({
                type: 'tab',
                value: action.payload,
                timestamp: Date.now()
            });
        },
        setCurrentStrategy: (state, action) => {
            state.currentStrategy = action.payload;
            state.navigationHistory.push({
                type: 'strategy',
                value: action.payload,
                timestamp: Date.now()
            });
        },
        goBack: (state) => {
            // Simple approach: just reset to strategies list
            state.currentStrategy = null;
        },
        resetNavigation: (state) => {
            state.currentPage = 'Home';
            state.currentTab = 'Strategies';
            state.currentStrategy = null;
            state.navigationHistory = [];
        }
    }
});

export const {
    setCurrentPage,
    setCurrentTab,
    setCurrentStrategy,
    goBack,
    resetNavigation
} = navigationSlice.actions;

// Selectors
export const selectCurrentPage = (state) => state.navigation.currentPage;
export const selectCurrentTab = (state) => state.navigation.currentTab;
export const selectCurrentStrategy = (state) => state.navigation.currentStrategy;
export const selectNavigationHistory = (state) => state.navigation.navigationHistory;

export default navigationSlice.reducer;
