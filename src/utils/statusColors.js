/**
 * Utility to get background color classes based on order status
 * @param {string} status - The order status
 * @returns {string} Tailwind background classes
 */
export const getOrderStatusColor = (status) => {
    if (!status) return 'bg-white';
    
    const normalizedStatus = status.toString().toUpperCase();
    
    switch (normalizedStatus) {
        case 'FILLED':
        case 'COMPLETED':
        case 'SUCCESS':
            return 'bg-[#dcfce7]'; // Slightly more saturated light green
        case 'PARTIAL_FILL':
        case 'PARTIALLY_FILLED':
        case 'PARTIAL':
            return 'bg-[#ffedd5]'; // Slightly more saturated light orange
        case 'REJECTED':
        case 'REJECT':
        case 'CANCELLED':
        case 'CANCEL':
        case 'FAILED':
        case 'ERROR':
            return 'bg-[#fee2e2]'; // Slightly more saturated light red
        case 'NEW':
        case 'PENDING':
        case 'OPEN':
        case 'SUBMITTED':
            return 'bg-[#fef9c3]'; // Slightly more saturated light yellow
        default:
            return 'bg-white';
    }
};
