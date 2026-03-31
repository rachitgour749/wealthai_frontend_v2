// API Base URL - Automatically uses localhost in dev mode, production URL in builds
const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev ? 'http://localhost:8000' : 'https://8sx9uc9pfy.ap-south-1.awsapprunner.com';

// API Endpoints Configuration
export const API_ENDPOINTS = {
    // Authentication
    GOOGLE_LOGIN: '/api/auth/google-login',

    // Subscription
    USER_SUBSCRIPTION: (email) => `/api/subscription/user/${email}`,
    ACTIVATE_TRIAL: '/api/subscription/activate-trial',
    PRODUCTS: (email) => `/api/subscription/products/${email}`,

    // Broker
    GET_DETAILS: (email) => `/api/get_details?user_email=${email}`,
    BROKER_LOGIN: '/api/broker/broker_login',
    BROKER_STATUS: '/api/broker/get_broker_status',
    BROKER_RECONNECT: '/api/broker/reconnect_broker',
    BROKER_RELOGIN: (email) => `/api/broker/relogin?user_email=${email}`,
    ACCOUNT_DETAILS: (email) => `/api/broker/account_details?user_email=${email}`,
    DELETE_ACCOUNT: (email, clientId) => `/api/broker/delete_account?user_email=${email}&client_id=${clientId}`,
    UPDATE_CREDENTIALS: '/api/broker/update_credentials',

    // Strategies
    ASSETS: (strategyType) => `/api/strategy/assets?strategy_type=${strategyType}`,
    ASSETS_OVERVIEW: (strategyType) => `/api/strategy/assets/overview?strategy_type=${strategyType}`,
    DATE_RANGE: '/api/strategy/date-range',
    RUN_BACKTEST: '/api/run_backtest',
    CACHED_TRANSACTION_LOG: (strategyType) => `/api/strategy/transaction-log?strategy_type=${strategyType}`,
    CACHED_COSTS_BREAKDOWN: (strategyType) => `/api/strategy/costs-breakdown?strategy_type=${strategyType}`,
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

    // Admin - Access Management
    ADMIN_ACCESS: '/admin/access',
    ADMIN_ACCESS_REVOKE: (email) => `/admin/access/${encodeURIComponent(email)}`,
    ADMIN_STORES: '/admin/stores',
    ADMIN_STORE_DOCS: (storeId) => `/admin/stores/${storeId}/documents`,
    ADMIN_STORE_UPLOAD: (storeId) => `/admin/stores/${storeId}/upload`,
    ADMIN_STORE_DOC_DELETE: (storeId, docId) => `/admin/stores/${storeId}/documents/${docId}`,

    // MFD Self-Service
    MFD_PROFILE: '/api/mfd/profile',
    MFD_STORE_CREATE: '/api/mfd/store/create',
    MFD_ZOHO_CONNECT: '/api/mfd/zoho/connect',
    MFD_ZOHO_AUTH_URL: '/api/mfd/zoho/auth-url',
    MFD_ZOHO_CALLBACK: '/api/mfd/zoho/callback',
    MFD_ZOHO_SYNC: '/api/mfd/zoho/sync',
    MFD_ZOHO_STATUS: '/api/mfd/zoho/status',

    // Stockal (uses separate service URL)
    STOCKAL_ACCOUNT_INFO: (custId) => `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/stockal/account-info/${custId}`,
    STOCKAL_BENEFICIARIES: (custId) => `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/stockal/beneficiaries/${custId}`,
    STOCKAL_USER_UPDATE: (custId) => `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/stockal/user-update/${custId}`,
    STOCKAL_CREATE_USER: `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/stockal/create-user`,
    VALIDATE_STOCKAL_USER: (email) => `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/validate-user/${email}`,
    STOCKAL_USERNAME_CHECK: (username) => `${isDev ? 'http://localhost:8001' : API_BASE_URL}/api/v1/stockal/username-check/${username}`,
};

export default API_BASE_URL;
