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
