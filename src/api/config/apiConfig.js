// API Base URL - Update this with your actual API URL

const dev = false;

const API_BASE_URL = dev ? 'http://localhost:8000' : 'https://8sx9uc9pfy.ap-south-1.awsapprunner.com';

// API Endpoints Configuration
export const API_ENDPOINTS = {
    // Authentication
    GOOGLE_LOGIN: '/api/auth/google-login',

    // Subscription
    USER_SUBSCRIPTION: (email) => `/api/subscription/user/${email}`,
    ACTIVATE_TRIAL: '/api/subscription/activate-trial',
    PRODUCTS: (email) => `/api/subscription/products/${email}`,
    FETCH_CREDITS: (email) => `/api/subscription/credits/${email}`,

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
    ASSETS: (market, assetType) => `/api/strategy/assets?market=${market}&asset_type=${assetType}`,
    ASSETS_OVERVIEW: (market, assetType) => `/api/strategy/assets/overview?market=${market}&asset_type=${assetType}`,
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

    // Stockal
    STOCKAL_ACCOUNT_INFO: (custId) => `http://localhost:8001/api/v1/stockal/account-info/${custId}`,
    STOCKAL_BENEFICIARIES: (custId) => `http://localhost:8001/api/v1/stockal/beneficiaries/${custId}`,
    STOCKAL_USER_UPDATE: (custId) => `http://localhost:8001/api/v1/stockal/user-update/${custId}`,
    STOCKAL_CREATE_USER: 'http://localhost:8001/api/v1/stockal/create-user',
    VALIDATE_STOCKAL_USER: (email) => `http://localhost:8001/api/v1/validate-user?user_email=${email}`,
    STOCKAL_USERNAME_CHECK: (username) => `http://localhost:8001/api/v1/stockal/username-check/${username}`,
    STOCKAL_DOCUMENT_UPLOAD: `http://localhost:8001/api/v1/stockal/document-upload`,
    STOCKAL_EKYC_STATUS: (custId) => `http://localhost:8001/api/v1/stockal/ekyc-status/${custId}`,
    STOCKAL_EKYC_URL: (custId) => `http://localhost:8001/api/v1/stockal/ekyc-url/${custId}`,
    STOCKAL_KYC_SUBMIT: (custId) => `http://localhost:8001/api/v1/stockal/kyc-submit/${custId}`,
    STOCKAL_ACCOUNT_SUMMARY: (custId) => `http://localhost:8001/api/v1/stockal/account-summary/${custId}`,
    STOCKAL_PORTFOLIO: (custId) => `http://localhost:8001/api/v1/stockal/portfolio/${custId}`,
    STOCKAL_POSITIONS: (custId) => `http://localhost:8001/api/v1/stockal/positions/${custId}`,
    STOCKAL_HOLDINGS: (custId) => `http://localhost:8001/api/v1/stockal/holdings/${custId}`,
    STOCKAL_ORDERS: `http://localhost:8001/api/v1/stockal/orders`,
    STOCKAL_ORDER_OPERATIONS: (orderId) => `http://localhost:8001/api/v1/stockal/orders/${orderId}`,
    STOCKAL_ORDER_CANCEL: (orderId) => `http://localhost:8001/api/v1/stockal/orders/cancel/${orderId}`,
    STOCKAL_MARKET_PRICE: `http://localhost:8001/api/v1/stockal/market/current-price`,
    STOCKAL_MARKET_HISTORY: `http://localhost:8001/api/v1/stockal/market/historical-prices`,
    STOCKAL_PLAN_LIST: `http://localhost:8001/api/v1/stockal/plan-list`,
    STOCKAL_PLAN_ADD: (custId) => `http://localhost:8001/api/v1/stockal/plan-add/${custId}`,

    // Webhook
    GET_WEBHOOKS: (userId) => `/api/webhook/user/${userId}`,
    TOGGLE_WEBHOOK_STATUS: (runId, status) => `/api/webhook/status/${runId}/${status}`,
    DELETE_WEBHOOK: (runId) => `/api/webhook/delete/${runId}`,
    CREATE_WEBHOOK: '/api/webhook/create',
    RA_CODES: '/api/webhook/ra',
    RA_STRATEGIES: (raCode) => `/api/webhook/ra/${raCode}/strategies`,
};

export default API_BASE_URL;
