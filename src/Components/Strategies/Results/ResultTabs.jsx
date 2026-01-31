import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/formatUtils';
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
        if (isCurrency) return formatCurrency(val, currencySymbol);

        if (typeof val === 'number') {
            if (isPct) return `${val.toFixed(2)}%`;
            return val.toFixed(2);
        }

        // Try parsing string percentages if needed, otherwise return as is
        return val;
    };

    // Handle both old and new API response structures
    // New structure: metrics.strategy and metrics.benchmark
    // Old structure: metrics at top level, benchmark_metrics separate
    const strategyMetrics = metrics.strategy || metrics;
    const benchmarkMetrics = metrics.benchmark || metrics.benchmark_metrics || {};

    console.log('[ResultTabs] Full metrics object:', metrics);
    console.log('[ResultTabs] Strategy metrics:', strategyMetrics);
    console.log('[ResultTabs] Benchmark metrics:', benchmarkMetrics);

    // Helper to format labels from keys (e.g., cagr_pct -> CAGR)
    const prettifyKey = (key) => {
        const labels = {
            'total_return': 'Total Return',
            'total_return_pct': 'Total Return',
            'cagr_pct': 'CAGR',
            'cagr': 'CAGR',
            'xirr_pct': 'XIRR',
            'sharpe_ratio': 'Sharpe Ratio',
            'max_drawdown': 'Max Drawdown',
            'max_drawdown_pct': 'Max Drawdown',
            'final_capital': 'Final Value',
            'final_value': 'Final Value',
            'total_trades': 'Total Trades',
            'sortino_ratio': 'Sortino Ratio',
            'calmar_ratio': 'Calmar Ratio',
        };
        if (labels[key.toLowerCase()]) return labels[key.toLowerCase()];
        return key.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Dynamically build comparison pairs based on fixed ordered list
    const getComparisonPairs = () => {
        const orderedRows = [
            { label: 'Total Investment', strategyKeys: ['total_investment'], benchmarkKeys: ['total_investment'], isCurrency: true },
            { label: 'Final Value', strategyKeys: ['final_value', 'final_capital'], benchmarkKeys: ['final_value', 'final_capital'], isCurrency: true },
            { label: 'Total Return', strategyKeys: ['total_return_pct', 'total_return'], benchmarkKeys: ['total_return_pct', 'total_return'], isPct: true },
            { label: 'CAGR', strategyKeys: ['cagr', 'cagr_pct'], benchmarkKeys: ['cagr', 'cagr_pct'], isPct: true },
            { label: 'Sharpe Ratio', strategyKeys: ['sharpe_ratio'], benchmarkKeys: ['sharpe_ratio'] },
            { label: 'Calmar Ratio', strategyKeys: ['calmar_ratio'], benchmarkKeys: ['calmar_ratio'] },
            { label: 'Max Drawdown', strategyKeys: ['max_drawdown_pct', 'max_drawdown'], benchmarkKeys: ['max_drawdown_pct', 'max_drawdown'], isPct: true }
        ];

        return orderedRows.map(row => {
            // Find the first available key in strategy metrics
            const strategyKey = row.strategyKeys.find(k => strategyMetrics[k] !== undefined);
            const strategyVal = strategyKey ? strategyMetrics[strategyKey] : undefined;

            // Find the first available key in benchmark metrics
            const benchmarkKey = row.benchmarkKeys.find(k => benchmarkMetrics[k] !== undefined);
            const benchVal = benchmarkKey ? benchmarkMetrics[benchmarkKey] : undefined;

            return {
                label: row.label,
                strategy: formatVal(strategyVal, row.isPct, row.isCurrency),
                benchmark: formatVal(benchVal, row.isPct, row.isCurrency)
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
                                        <th className=" py-4 text-[12px] uppercase text-gray-600 font-medium tracking-widest bg-gray-50/30">{results.benchmark_name || 'Benchmark'}</th>
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
                        <TradesTransactions
                            strategyType={strategyType || results.strategy_type}
                            transactions={results.transaction_log || []}
                        />
                    </div>
                )}

                {activeTab === 'costs' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <CostAnalysis
                            strategyType={strategyType || results.strategy_type}
                            costs={results.cost_breakdown || results.costs_breakdown || []}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultTabs;
