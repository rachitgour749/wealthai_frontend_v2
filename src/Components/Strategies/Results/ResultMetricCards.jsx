import React from 'react';
import { formatCurrency } from '../../../utils/formatUtils';

const ResultMetricCards = ({ metrics = {}, strategyType }) => {

    const isPayout = (strategyType || '').toLowerCase().includes('payout');

    // Handle both old and new API response structures
    // New structure: metrics.strategy
    // Old structure: metrics at top level
    const strategyMetrics = metrics.strategy || metrics;

    const findMetricValue = (baseKey) => {
        // Special override: Use 'Total Weeks' for 'total_trades' if available
        if (baseKey === 'total_trades' && strategyMetrics['Total Weeks'] !== undefined) {
            return strategyMetrics['Total Weeks'];
        }
        // Higher Priority: Exact mappings for human-readable keys seen in API logs
        const directMappings = {
            'total_return': 'Total Return',
            'total_return_pct': 'Total Return',
            'cagr_pct': 'CAGR',
            'cagr': 'CAGR',
            'xirr_pct': 'XIRR',
            'sharpe_ratio': 'Sharpe Ratio',
            'calmar_ratio': 'Calmar Ratio',
            'max_drawdown': 'Max Drawdown',
            'max_drawdown_pct': 'Max Drawdown',
            'total_trades': 'Total Trades',
            'total_withdraw_amount': 'Total Withdraw Amount'
        };

        const apiFieldName = directMappings[baseKey];
        if (apiFieldName && strategyMetrics[apiFieldName] !== undefined) {
            return strategyMetrics[apiFieldName];
        }

        // Fallback: Original key from the ordered list
        if (strategyMetrics[baseKey] !== undefined) return strategyMetrics[baseKey];

        // Fallback: Common variations
        const variations = [`${baseKey}_pct`, `${baseKey}_ratio`, baseKey.replace('_pct', ''), baseKey.replace('_ratio', '')];
        for (const variant of variations) {
            if (strategyMetrics[variant] !== undefined) return strategyMetrics[variant];
        }

        // Check top-level metrics as final fallback (where we might inject manual calculations)
        if (apiFieldName && metrics[apiFieldName] !== undefined) return metrics[apiFieldName];
        if (metrics[baseKey] !== undefined) return metrics[baseKey];

        return undefined;
    };

    const formatValue = (key, val) => {
        if (val === undefined || val === null || val === '-') return '-';

        const k = key.toLowerCase();

        // Handle withdraw amount (currency) - Check this FIRST to catch strings too
        if (k.includes('withdraw')) {
            const t = (strategyType || '').toLowerCase();
            const symbol = (t === 'etf_us' || t.includes('international')) ? '$' : '₹';
            return formatCurrency(val, symbol);
        }

        // If the value is already a string (like "61.10%"), just return it
        if (typeof val === 'string') {
            const t = (strategyType || '').toLowerCase();
            if (t === 'etf_us' || t.includes('international')) {
                return val.replace('₹', '$');
            }
            return val;
        }

        if (typeof val === 'number') {
            // Handle percentages (matches if key OR found value should be pct)
            if (k.includes('return') || k.includes('cagr') || k.includes('xirr') || k.includes('drawdown')) {
                return `${val.toFixed(2)}%`;
            }
            // Handle ratios
            if (k.includes('ratio')) {
                return val.toFixed(2);
            }
            // Handle integers (total trades)
            return Math.round(val).toLocaleString();
        }
        return val;
    };

    const orderedMetricsKeys = [
        'total_return',
        'cagr_pct',
        'sharpe_ratio',
        'calmar_ratio',
        'max_drawdown',
        'total_trades'
    ];

    if (isPayout) {
        orderedMetricsKeys.push('total_withdrawn');
    }

    const labelsMap = {
        'total_return': 'Total Return',
        'cagr_pct': 'CAGR',
        'xirr_pct': 'XIRR',
        'sharpe_ratio': 'Sharpe Ratio',
        'treynor_ratio': 'Treynor Ratio',
        'calmar_ratio': 'Calmar Ratio',
        'max_drawdown': 'Max Drawdown',
        'total_trades': 'Total Trades',
        'total_withdraw_amount': 'Total Withdraw Amount',
        'total_withdrawn': 'Total Withdraw Amount'
    };

    const displayMetrics = orderedMetricsKeys.map(key => {
        const rawValue = findMetricValue(key);
        return {
            label: labelsMap[key],
            value: formatValue(key, rawValue)
        };
    });

    const gridCols = isPayout ? 'lg:grid-cols-8' : 'lg:grid-cols-7';

    return (
        <div className={`grid grid-cols-2 ${gridCols} gap-4 mb-8 px-1`}>
            {displayMetrics.map((m, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between h-[90px] hover:shadow-md transition-shadow">
                    <h4 className="text-gray-500 text-[12px] uppercase font-bold tracking-wider">{m.label}</h4>
                    <p className="text-[20px] font-bold text-gray-900 tracking-tight leading-none">
                        {m.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ResultMetricCards;
