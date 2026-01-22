import React, { useState } from 'react';
import TradesTransactions from './TradesTransactions';
import CostAnalysis from './CostAnalysis';

const ResultTabs = ({ metrics = {}, strategyName = 'Strategy', results = {}, strategyType }) => {
    const [activeTab, setActiveTab] = useState('metrics');

    const tabs = [
        { id: 'metrics', label: 'Metrics' },
        { id: 'trades', label: 'Trades' },
        { id: 'costs', label: 'Costs' },
    ];

    const getCurrencySymbol = (type) => {
        const t = (type || '').toLowerCase();
        // Match both exact IDs and international strategy types
        if (t === 'etf_us' || t.includes('international')) return '$';
        return '₹';
    };

    const currencySymbol = getCurrencySymbol(strategyType);

    const formatVal = (val, isPct = false, isCurrency = false) => {
        if (val === undefined || val === null) return '-';
        if (typeof val === 'number') {
            if (isPct) return `${val.toFixed(2)}%`;
            if (isCurrency) return `${currencySymbol}${Math.round(val).toLocaleString()}`;
            return val.toFixed(2);
        }
        return val;
    };

    const benchmark = metrics.benchmark_metrics || {};
    console.log('[ResultTabs] Full metrics object:', metrics);
    console.log('[ResultTabs] Benchmark metrics:', benchmark);
    console.log('[ResultTabs] Benchmark keys:', Object.keys(benchmark));

    // Helper to format labels from keys (e.g., cagr_pct -> CAGR)
    const prettifyKey = (key) => {
        const labels = {
            'total_return': 'Total Return',
            'total_return_pct': 'Total Return',
            'cagr_pct': 'CAGR',
            'xirr_pct': 'XIRR',
            'sharpe_ratio': 'Sharpe Ratio',
            'max_drawdown': 'Max Drawdown',
            'max_drawdown_pct': 'Max Drawdown',
            'final_capital': 'Final Value',
            'final_value': 'Final Value',
            'total_trades': 'Total Trades',
            'sortino_ratio': 'Sortino Ratio',
        };
        if (labels[key.toLowerCase()]) return labels[key.toLowerCase()];
        return key.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Dynamically build comparison pairs from whatever keys the API provides
    const getComparisonPairs = () => {
        const excludedMetrics = [
            'volatility',
            'beta',
            'total_weeks',
            'total_week',
            'totalweeks',
            'win_rate',
            'win_rate_pct',
            'treynor_ratio',
            'total_trades',
            'total_trade'
        ];

        const keys = Object.keys(metrics).filter(k => {
            if (typeof metrics[k] === 'object' || k === 'benchmark_metrics') return false;

            // Normalize key for comparison (lowercase and replace spaces with underscores)
            const normalizedKey = k.toLowerCase().replace(/ /g, '_');
            return !excludedMetrics.includes(normalizedKey);
        });

        if (keys.length === 0) return [];

        return keys.map(key => {
            const label = prettifyKey(key);
            const strategyVal = metrics[key];

            // Create a comprehensive mapping from strategy keys to benchmark keys
            // Handle both snake_case and human-readable formats
            const strategyToBenchmarkMap = {
                // Human-readable keys (from API)
                'Total Return': 'total_return_pct',
                'CAGR': 'cagr_pct',
                'XIRR': 'xirr_pct',
                'Max Drawdown': 'max_drawdown_pct',
                'Sharpe Ratio': 'sharpe_ratio',
                'Final Value': 'final_value',
                'Sortino Ratio': 'sortino_ratio',
                'Calmar Ratio': 'calmar_ratio',
                'Volatility': 'volatility_pct',
                'Total Investment': 'total_investment',
                'Total Trades': 'total_trades',

                // Snake_case keys (fallback)
                'total_return': 'total_return_pct',
                'total_return_pct': 'total_return_pct',
                'cagr': 'cagr_pct',
                'cagr_pct': 'cagr_pct',
                'xirr': 'xirr_pct',
                'xirr_pct': 'xirr_pct',
                'max_drawdown': 'max_drawdown_pct',
                'max_drawdown_pct': 'max_drawdown_pct',
                'sharpe_ratio': 'sharpe_ratio',
                'final_capital': 'final_value',
                'final_value': 'final_value',
                'sortino_ratio': 'sortino_ratio',
                'calmar_ratio': 'calmar_ratio',
                'volatility': 'volatility_pct',
                'volatility_pct': 'volatility_pct'
            };

            // Try to find the benchmark key using the mapping
            const benchmarkKey = strategyToBenchmarkMap[key] || key;
            const benchVal = benchmark[benchmarkKey];

            console.log(`[ResultTabs] Mapping "${key}" -> "${benchmarkKey}" = ${benchVal}`);

            const isPct = key.toLowerCase().includes('pct') ||
                key.toLowerCase().includes('return') ||
                key.toLowerCase().includes('drawdown') ||
                key.toLowerCase().includes('rate') ||
                benchmarkKey.includes('pct');

            const isCurrency = key.toLowerCase().includes('capital') ||
                key.toLowerCase().includes('value') ||
                key.toLowerCase().includes('amount');

            return {
                label,
                strategy: formatVal(strategyVal, isPct, isCurrency),
                benchmark: formatVal(benchVal, isPct, isCurrency)
            };
        });
    };

    const comparisonPairs = getComparisonPairs();

    const trades = results.transaction_log || [];

    return (
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden mb-10">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-gray-50/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-4 text-[11px] uppercase tracking-[0.02em] transition-all duration-300 relative ${activeTab === tab.id
                            ? 'text-teal-800 bg-white font-bold'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/30 font-medium'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full rounded-full h-1 bg-teal-800 animate-[scaleIn_0.2s_ease-out]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4">
                {activeTab === 'metrics' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-wealth-900 text-[12px] font-medium uppercase tracking-[0.15em]">
                                Performance Parameters
                            </h4>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className=" py-4 text-[12px] uppercase text-gray-600 font-medium tracking-widest">Parameter</th>
                                        <th className=" py-4 text-[12px] uppercase text-gray-600 font-medium tracking-widest bg-gray-50/30">{strategyName}</th>
                                        <th className=" py-4 text-[12px] uppercase text-gray-600 font-medium tracking-widest bg-gray-50/30">Benchmark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonPairs.map((pair, idx) => (
                                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 border-b-gray-200">
                                            <td className=" py-3 text-[12px] font-medium text-gray-600 group-hover:text-gray-900">{pair.label}</td>
                                            <td className=" py-3 text-[13px] font-medium text-gray-500 bg-gray-50/10 group-hover:bg-gray-50/20">{pair.strategy || '-'}</td>
                                            <td className=" py-3 text-[12px] font-medium text-gray-500 bg-gray-50/10 group-hover:bg-gray-50/20">{pair.benchmark}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'trades' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <TradesTransactions strategyType={strategyType || results.strategy_type} />
                    </div>
                )}

                {activeTab === 'costs' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <CostAnalysis strategyType={strategyType || results.strategy_type} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultTabs;
