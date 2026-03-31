// Allowed users for ChatAI access
export const ALLOWED_USERS = [
    'vipulkhandelwal25@gmail.com',
    'Moneycompoundinfo@gmail.com',
    'insurance.moneycompound@gmail.com',
    'rachit.gour749@gmail.com',
    'anjanr@gmail.com',
    'iamshourya007@gmail.com',
    'wealthwisersfinancialservices@gmail.com'
];

// Product code mapping
export const PRODUCT_CODES = {
    TRADEAI: 'TRADEAI',
    MARKETAI: 'MARKETAI',
    CHATAI: 'CHATAI',
    INVESTAI: 'INVESTAI',
};

// Product ID to code mapping (from products.js)
export const PRODUCT_ID_TO_CODE = {
    'tradeai1': 'TRADEAI',
    'marketsai1': 'MARKETAI',  // Fixed: was 'marketai1', should be 'marketsai1'
    'chatai1': 'CHATAI',
    'investai1': 'INVESTAI',
};

/**
 * Check if user has access to ChatAI
 * @param {string} userEmail - User's email
 * @returns {boolean}
 */
export const hasChatAIAccess = (userEmail) => {
    if (!userEmail) return false;
    return ALLOWED_USERS.includes(userEmail.toLowerCase());
};

/**
 * Get product access status based on subscription
 * @param {string} productId - Product ID (e.g., 'tradeai1')
 * @param {Array} subscriptions - Array of user subscriptions
 * @param {string} userEmail - User's email
 * @returns {Object} { hasAccess: boolean, status: string, subscription: object }
 */
export const getProductAccessStatus = (productId, subscriptions, userEmail) => {

    const productCode = PRODUCT_ID_TO_CODE[productId];


    if (!productCode) {
        return { hasAccess: false, status: 'coming_soon', subscription: null };
    }

    // Special handling for ChatAI - check allowed users
    if (productCode === PRODUCT_CODES.CHATAI && !hasChatAIAccess(userEmail)) {
        return { hasAccess: false, status: 'coming_soon', subscription: null };
    }

    // Special handling for InvestAI - always coming soon
    if (productCode === PRODUCT_CODES.INVESTAI) {
        return { hasAccess: false, status: 'coming_soon', subscription: null };
    }

    // Find active subscription for this product
    const productSubscriptions = subscriptions.filter(sub =>
        sub.product_code === productCode && sub.status === 'active'
    );

    if (!productSubscriptions || productSubscriptions.length === 0) {
        return { hasAccess: false, status: 'subscribe', subscription: null };
    }

    // Get the most recent subscription (by subscription_start_date)
    const subscription = productSubscriptions.sort((a, b) =>
        new Date(b.subscription_start_date) - new Date(a.subscription_start_date)
    )[0];

    const currentDate = new Date();
    const endDate = new Date(subscription.subscription_end_date);

    // Check if subscription is still valid
    if (currentDate > endDate) {
        // Subscription expired
        return { hasAccess: false, status: 'subscribe', subscription };
    }

    // Subscription is active
    if (subscription.subscription_type === 'trial') {
        return { hasAccess: true, status: 'trial', subscription };
    } else if (subscription.subscription_type === 'paid') {
        return { hasAccess: true, status: 'paid', subscription };
    }

    return { hasAccess: false, status: 'subscribe', subscription: null };
};

/**
 * Get display label for product status
 * @param {string} status - Status from getProductAccessStatus
 * @returns {string}
 */
export const getStatusLabel = (status) => {
    switch (status) {
        case 'trial':
            return 'Trial Active';
        case 'paid':
            return 'Paid';
        case 'subscribe':
            return 'Subscribe';
        case 'coming_soon':
            return 'Coming Soon';
        default:
            return 'Subscribe';
    }
};

/**
 * Check if product should be faded (coming soon)
 * @param {string} status - Status from getProductAccessStatus
 * @returns {boolean}
 */
export const isProductFaded = (status) => {
    return status === 'coming_soon';
};
