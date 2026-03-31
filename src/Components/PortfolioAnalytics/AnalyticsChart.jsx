import React, { useState } from 'react';
import { formatDate } from '../../utils/formatUtils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const AnalyticsChart = ({ data, loading, strategyName }) => {
    // State for toggling Nifty 50 Benchmark line
    const [showBenchmark, setShowBenchmark] = useState(true);

    if (loading) {
        return (
            <div className="h-[250px] md:h-[300px] w-full bg-transparent flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full bg-white rounded-xl flex justify-center items-center shadow-sm border border-gray-100">
                <p className="text-gray-400">No performance data available</p>
            </div>
        );
    }

    const formatCurrency = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`; // Changed to 1 decimal for tens of thousands
        return `₹${value}`;
    };


    // calculate min and max for Y axis scaling
    const allValues = data.flatMap(d => [
        d.portfolio_value,
        showBenchmark ? d.benchmark_value : null
    ].filter(v => v !== null && v !== undefined));

    const minValue = Math.min(...allValues) * 0.95;
    const maxValue = Math.max(...allValues) * 1.05;


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-wealth-800 min-w-[200px]">
                    <p className="text-sm font-extrabold text-gray-900 mb-3 text-center border-b border-gray-100 pb-2">
                        {formatDate(label)}
                    </p>
                    <div className="space-y-3">
                        {payload.map((entry, index) => {
                            const isBenchmark = entry.dataKey === 'benchmark_value';
                            const strategyTitle = strategyName || 'STRATEGY';
                            const truncatedStrategyName = strategyTitle.length > 15 ? `${strategyTitle.substring(0, 15)}...` : strategyTitle;
                            const name = isBenchmark ? 'NIFTY 50 BUY & HOLD' : truncatedStrategyName;
                            const colorClass = isBenchmark ? 'text-[#DC2626]' : 'text-[#0066cc]';

                            // Reordering: Strategy first or Benchmark first? 
                            // Recharts renders in order of Lines. Default Lines: Benchmark (cond), Strategy.
                            // So Benchmark comes first if active.

                            return (
                                <div key={index} className="flex items-center gap-1">
                                    <span className={`text-[14px] font-bold uppercase tracking-wider ${colorClass}`}>
                                        {name}
                                    </span>
                                    <span className={`text-sm font-bold ${colorClass}`}>:</span>
                                    <span className={`text-base font-bold ${colorClass}`}>
                                        {formatCurrency(entry.value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Performance Comparison</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Equity Curve Analysis</p>
                </div>

                {/* Custom Legend / Toggles */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-wide">
                    {/* Strategy Line (Checkbox style, Checked) */}
                    <div className="flex items-center gap-1.5 cursor-pointer bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors hover:bg-blue-50">
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-[#0066cc] flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[#0066cc]">{strategyName}</span>
                    </div>

                    {/* Toggle for Nifty 50 */}
                    <div
                        className={`
                            flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border transition-all duration-200
                            ${showBenchmark ? 'bg-red-50/50 border-red-100 hover:bg-red-50' : 'bg-white border-gray-200 hover:border-red-200'}
                        `}
                        onClick={() => setShowBenchmark(!showBenchmark)}
                    >
                        <div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center border transition-colors ${showBenchmark ? 'bg-[#DC2626] border-[#DC2626]' : 'bg-white border-gray-300'}`}>
                            {showBenchmark && (
                                <svg className="w-2.5 h-2.5 text-white stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                        </div>
                        <span className={`${showBenchmark ? 'text-[#DC2626]' : 'text-gray-400'}`}>NIFTY50 BUY & HOLD</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                        {/* Distinct Gridlines */}
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />

                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} // Darker slate-400
                            tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }} // Visible ticks
                            dy={10}
                            angle={-45} // Diagonal dates
                            textAnchor="end"
                            height={60} // Extra height for rotation
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />

                        <YAxis
                            tickFormatter={formatCurrency}
                            domain={[minValue, maxValue]}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                            axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }} // Darker slate-400
                            tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }} // Visible ticks
                            dx={-10}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />

                        {/* Benchmark Line (Red) - Conditional */}
                        {showBenchmark && (
                            <Line
                                type="monotone"
                                dataKey="benchmark_value"
                                name="NIFTY 50 Buy & Hold"
                                stroke="#DC2626"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#DC2626', stroke: 'white', strokeWidth: 2 }}
                            />
                        )}

                        {/* Strategy Line (Blue) */}
                        <Line
                            type="monotone"
                            dataKey="portfolio_value"
                            name="Strategy Value"
                            stroke="#0066cc"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#0066cc', stroke: 'white', strokeWidth: 2 }}
                        />

                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsChart;
