/**
 * Format date to "DD-MMM-YYYY" format (e.g., "12-Jan-2026")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'N/A';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
};

/**
 * Get subscription for a specific product
 * @param {Array} subscriptions - Array of user subscriptions
 * @param {string} productCode - Product code (e.g., 'MARKETAI')
 * @returns {Object|null} Subscription object or null
 */
export const getSubscriptionByProduct = (subscriptions, productCode) => {
    if (!subscriptions || !Array.isArray(subscriptions)) return null;

    const productSubscriptions = subscriptions.filter(sub =>
        sub.product_code === productCode && sub.status === 'active'
    );

    if (productSubscriptions.length === 0) return null;

    // Return the most recent subscription
    return productSubscriptions.sort((a, b) =>
        new Date(b.subscription_start_date) - new Date(a.subscription_start_date)
    )[0];
};
