// API Base URL - Update this with your actual API URL

const dev = true;

const API_BASE_URL = dev ? 'http://localhost:8000' : 'https://8sx9uc9pfy.ap-south-1.awsapprunner.com';

// API Endpoints Configuration
export const API_ENDPOINTS = {
    // Authentication
    GOOGLE_LOGIN: '/api/auth/google-login',

    // Subscription
    USER_SUBSCRIPTION: (email) => `/api/subscription/user/${email}`,
    ACTIVATE_TRIAL: '/api/subscription/activate-trial',
    PRODUCTS: (email) => `/api/subscription/products/${email}`,

    // Strategies
    ASSETS: (strategyType) => `/api/assets?strategy_type=${strategyType}`,
    ASSETS_OVERVIEW: (strategyType) => `/api/assets/overview?strategy_type=${strategyType}`,
    DATE_RANGE: '/api/date-range',
    RUN_BACKTEST: '/api/run_backtest',
    CACHED_TRANSACTION_LOG: (strategyType) => `/api/cached-transaction-log?strategy_type=${strategyType}`,
    CACHED_COSTS_BREAKDOWN: (strategyType) => `/api/cached-costs-breakdown?strategy_type=${strategyType}`,
    SAVE_STRATEGY: '/api/save_strategies',
    GET_INSTANCES: (userId, strategyType) => `/api/get_instances?user_id=${userId}&strategy_type=${strategyType}`,
    RESTART_STRATEGY: (runId) => `/api/restart_strategy?run_id=${runId}`,
    STOP_STRATEGY: (runId) => `/api/stop_strategy?run_id=${runId}`,
    DELETE_STRATEGY: (runId) => `/api/delete_strategy?run_id=${runId}`,
    DELETE_STRATEGY_CLIENT: '/api/delete_strategy_client',

    // Custom Strategy
    CUSTOM_STRATEGY_ANALYZE: '/api/custom-strategy/analyze',
    CUSTOM_STRATEGY_SAVE: '/api/custom-strategy/save',

    // Portfolio
    PORTFOLIO_USER: (email) => `/api/portfolio/user/${email}`,
    PORTFOLIO_CLIENTS: (runId) => `/api/portfolio/clients/${runId}`,
    PORTFOLIO_EQUITY_CURVE: (runId) => `/api/portfolio/equity-curve/strategy/${runId}`,
    PORTFOLIO_TRADES: (runId) => `/api/portfolio/trades/${runId}`,
    PORTFOLIO_STRATEGY: (runId) => `/api/portfolio/strategy/${runId}`,

    // ChatAI
    CHAT_QUERY: '/api/query',
};

export default API_BASE_URL;
