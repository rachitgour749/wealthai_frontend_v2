/**
 * Returns the currency symbol for a given strategy type or name.
 * US-market strategies return '$'; all others return '₹'.
 *
 * @param {string} strategyType - e.g. 'US_ETF_Swing_Strategy', 'ETF_Rotation', 'SuperTrend'
 * @param {string} [strategyName] - e.g. 'US Super Trend', 'ETF Rotation US'
 * @returns {'$'|'₹'}
 */
export const getCurrencySymbol = (strategyType, strategyName = '') => {
    const t = (strategyType || '').toLowerCase();
    const n = (strategyName || '').toLowerCase();

    if (
        t === 'etf_us' ||
        t.includes('international') ||
        t.includes('us_etf') ||
        t.includes('us_swing') ||
        t.endsWith('-us') || // Generic IDs with -us suffix
        n.includes('us ') ||
        n.includes(' us') ||
        n.includes('international') ||
        n.includes('global')
    ) return '$';

    return '₹';
};

/**
 * Formats a number as currency based on the provided symbol.
 * Rule: If value >= 1000, round off (0 decimals). Else, show 2 decimals.
 *
 * @param {number|string} value - The value to format
 * @param {string} currencySymbol - The currency symbol (e.g., '₹', '$')
 * @returns {string} Formatted string
 */
export const formatCurrency = (value, currencySymbol = '₹') => {
    if (value === undefined || value === null) return '-';

    // Handle strings that might have commas or currency symbols
    let cleanValue = value;
    if (typeof value === 'string') {
        cleanValue = value.replace(/,/g, '').replace(/[₹$]/g, '');
    }

    const num = Number(cleanValue);
    if (isNaN(num)) return value;

    // Determine locale based on currency symbol
    // 'en-IN' is best for Rupees (lakhs/crores formatting), 'en-US' for Dollars
    const locale = currencySymbol === '₹' ? 'en-IN' : 'en-US';

    if (Math.abs(num) >= 1000) {
        return `${currencySymbol}${Math.round(num).toLocaleString(locale)}`;
    }

    return `${currencySymbol}${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formats a number with the same rules but without the currency symbol.
 */
export const formatNumber = (value, currencySymbol = '₹') => {
    if (value === undefined || value === null) return '-';

    // Handle strings that might have commas or currency symbols
    let cleanValue = value;
    if (typeof value === 'string') {
        cleanValue = value.replace(/,/g, '').replace(/[₹$]/g, '');
    }

    const num = Number(cleanValue);
    if (isNaN(num)) return value;

    const locale = currencySymbol === '₹' ? 'en-IN' : 'en-US';

    if (Math.abs(num) >= 1000) {
        return Math.round(num).toLocaleString(locale);
    }

    return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Formats a quantity (shares/units).
 * US strategies ($ symbol) show fractional shares up to 4 decimal places.
 * INR strategies round to whole numbers.
 *
 * @param {number} value - The quantity to format
 * @param {string} currencySymbol - '$' for US, '₹' for India
 * @returns {string}
 */
export const formatQty = (value, currencySymbol = '₹') => {
    const num = Number(value);
    if (isNaN(num)) return '-';
    if (currencySymbol === '$') {
        // Fractional shares: show up to 4 decimal places, strip trailing zeros
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Math.round(num).toLocaleString('en-IN');
};

/**
 * Formats a date string or object as DD-Mon-YYYY (e.g., 24-Nov-2026).
 * Ensures the first letter of the month is capitalized.
 * 
 * @param {Date|string} dateInput - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return dateInput;

        // Use a consistent locale and options
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    } catch (e) {
        return dateInput;
    }
};
