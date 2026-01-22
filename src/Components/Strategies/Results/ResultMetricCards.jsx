import React from 'react';

const ResultMetricCards = ({ metrics = {}, strategyType }) => {

    const findMetricValue = (baseKey) => {
        // Higher Priority: Exact mappings for human-readable keys seen in API logs
        const directMappings = {
            'total_return': 'Total Return',
            'cagr_pct': 'CAGR',
            'xirr_pct': 'XIRR',
            'sharpe_ratio': 'Sharpe Ratio',
            'treynor_ratio': 'Treynor Ratio',
            'calmar_ratio': 'Calmar Ratio',
            'max_drawdown': 'Max Drawdown',
            'total_trades': 'Total Trades'
        };

        const apiFieldName = directMappings[baseKey];
        if (apiFieldName && metrics[apiFieldName] !== undefined) {
            return metrics[apiFieldName];
        }

        // Fallback: Original key from the ordered list
        if (metrics[baseKey] !== undefined) return metrics[baseKey];

        // Fallback: Common variations
        const variations = [`${baseKey}_pct`, `${baseKey}_ratio`, baseKey.replace('_pct', ''), baseKey.replace('_ratio', '')];
        for (const variant of variations) {
            if (metrics[variant] !== undefined) return metrics[variant];
        }

        return undefined;
    };

    const formatValue = (key, val) => {
        if (val === undefined || val === null || val === '-') return '-';

        // If the value is already a string (like "61.10%"), just return it
        if (typeof val === 'string') {
            const t = (strategyType || '').toLowerCase();
            if (t === 'etf_us' || t.includes('international')) {
                return val.replace('₹', '$');
            }
            return val;
        }

        if (typeof val === 'number') {
            const k = key.toLowerCase();
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
        'xirr_pct',
        'sharpe_ratio',
        'treynor_ratio',
        'calmar_ratio',
        'max_drawdown',
        'total_trades'
    ];

    const labelsMap = {
        'total_return': 'Total Return',
        'cagr_pct': 'CAGR',
        'xirr_pct': 'XIRR',
        'sharpe_ratio': 'Sharpe Ratio',
        'treynor_ratio': 'Treynor Ratio',
        'calmar_ratio': 'Calmar Ratio',
        'max_drawdown': 'Max Drawdown',
        'total_trades': 'Total Trades'
    };

    const displayMetrics = orderedMetricsKeys.map(key => {
        const rawValue = findMetricValue(key);
        return {
            label: labelsMap[key],
            value: formatValue(key, rawValue)
        };
    });

    return (
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 mb-8 px-1">
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
