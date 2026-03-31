import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

const strategyService = {
    /**
     * Fetch available assets for a strategy
     */
    fetchAssets: async (market, assetType) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ASSETS(market, assetType));
            return response.data;
        } catch (error) {
            console.error('Error fetching assets:', error);
            throw error;
        }
    },

    /**
     * Fetch asset overview (universe options) for a strategy
     */
    fetchAssetsOverview: async (market, assetType) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.ASSETS_OVERVIEW(market, assetType));
            return response.data;
        } catch (error) {
            console.error('Error fetching assets overview:', error);
            throw error;
        }
    },

    /**
     * Fetch date range for given strategy and tickers
     */
    fetchDateRange: async (market, assetType, tickers) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.DATE_RANGE, {
                market: market,
                asset_type: assetType,
                tickers: tickers
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching date range:', error);
            throw error;
        }
    },

    /**
     * Run backtest for a strategy
     */
    runBacktest: async (payload, signal) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.RUN_BACKTEST, payload, { signal });
            console.log('[StrategyService] Backtest Response:', response.data);
            return response.data;
        } catch (error) {
            if (error.name === 'CanceledError' || error.message === 'canceled') {
                console.log('[StrategyService] Backtest request cancelled');
                return null;
            }
            console.error('[StrategyService] Error running backtest:', error);
            throw error;
        }
    },

    /**
     * Fetch cached transaction log
     */
    fetchCachedTransactionLog: async (strategyType) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CACHED_TRANSACTION_LOG(strategyType));
            return response.data;
        } catch (error) {
            console.error('Error fetching cached transaction log:', error);
            throw error;
        }
    },

    /**
     * Fetch cached costs breakdown
     */
    fetchCachedCostsBreakdown: async (strategyType) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CACHED_COSTS_BREAKDOWN(strategyType));
            return response.data;
        } catch (error) {
            console.error('Error fetching cached costs breakdown:', error);
            throw error;
        }
    },

    /**
     * Save a strategy
     */
    saveStrategy: async (payload) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.SAVE_STRATEGY, payload);
            return response.data;
        } catch (error) {
            console.error('Error saving strategy:', error);
            throw error;
        }
    },

    /**
     * Fetch saved strategy instances
     */
    getInstances: async (userId, strategyType) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_INSTANCES(userId, strategyType));
            return response.data;
        } catch (error) {
            console.error('Error fetching strategy instances:', error);
            throw error;
        }
    },

    /**
     * Restart a strategy (pause)
     */
    restartStrategy: async (runId) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.RESTART_STRATEGY(runId));
            return response.data;
        } catch (error) {
            console.error('Error restarting strategy:', error);
            throw error;
        }
    },

    /**
     * Stop a strategy (play)
     */
    stopStrategy: async (runId) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.STOP_STRATEGY(runId));
            return response.data;
        } catch (error) {
            console.error('Error stopping strategy:', error);
            throw error;
        }
    },

    /**
     * Delete a strategy
     */
    deleteStrategy: async (runId) => {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_STRATEGY(runId));
            return response.data;
        } catch (error) {
            console.error('Error deleting strategy:', error);
            throw error;
        }
    },

    /**
     * Delete specific clients from a strategy instance
     */
    deleteStrategyClients: async (runId, clients) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.DELETE_STRATEGY_CLIENT, {
                run_id: runId,
                clients: clients
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting strategy clients:', error);
            throw error;
        }
    }
};

export default strategyService;
