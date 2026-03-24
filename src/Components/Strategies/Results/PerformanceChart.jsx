import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatDate } from '../../../utils/dateUtils';
import { formatCurrency, getCurrencySymbol } from '../../../utils/formatUtils';

const PerformanceChart = ({ performanceData, strategyName = 'Strategy', strategyType }) => {
    const [visibility, setVisibility] = useState({
        strategy: true,
        benchmark: true,
        investment: true
    });

    if (!performanceData || !performanceData.dates) {
        return <div className="h-[400px] flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">No backtest data available</div>;
    }

    const currencySymbol = getCurrencySymbol(strategyType, strategyName);
    const isUS = currencySymbol === '$';
    const benchmarkName = isUS ? 'S&P 500 Buy & Hold' : 'NIFTY50 Buy & Hold';

    // Transform data for Recharts
    console.log('[PerformanceChart] Rx Data:', performanceData);
    const data = performanceData.dates.map((date, index) => {
        const strategyVal = performanceData.strategy?.[index] || 0;
        const benchmarkVal = performanceData.benchmark_buyhold?.[index] || 0;
        const investmentVal = performanceData.cumulative_investment?.[index] || 0;

        // Outlier detection: if a value jumps more than 3x the previous non-zero value, it might be a spike
        // Note: For simplicity, we just use the raw values if they are the first ones
        let processedStrategy = strategyVal;
        if (index > 0) {
            const prevStrategy = performanceData.strategy?.[index - 1] || 0;
            if (prevStrategy > 0 && strategyVal > prevStrategy * 3) {
                processedStrategy = prevStrategy; // Cap at previous value to avoid chart flattening
            }
        }

        return {
            date: date.split(/[ T]/)[0],
            'Investment': investmentVal,
            'Benchmark': benchmarkVal,
            'Strategy': processedStrategy,
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg border-2 border-teal-800 shadow-[0_10px_20px_rgba(0,0,0,0.25)] backdrop-blur-md">
                    <p className="text-[#0f3d39] font-medium text-[11px] mb-2 border-b-2 border-gray-100 pb-1 uppercase tracking-tighter">{formatDate(label)}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-[11px] mb-1">
                            <span className="font-medium uppercase tracking-tighter" style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-medium text-[#0f3d39]">
                                {formatCurrency(entry.value, currencySymbol)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const toggleLine = (key) => {
        setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const CheckboxLabel = ({ label, color, checked, onChange }) => (
        <label className="flex items-center gap-2 cursor-pointer group select-none">
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={onChange}
                />
                <div className={`w-[13px] h-[13px] rounded-[3px] border-2 border-gray-600 transition-all ${checked ? 'shadow-inner' : 'bg-gray-100 border-gray-300 shadow-sm'}`}
                    style={{
                        backgroundColor: checked ? color : 'transparent',
                        borderColor: checked ? color : '#d1d5db'
                    }}>
                    {checked && (
                        <svg className="w-full h-full p-[1px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>
            <span className={`text-[11px] font-medium uppercase tracking-widest transition-colors ${checked ? 'text-wealth-800' : 'text-gray-400'}`} style={{ color: checked ? color : undefined }}>
                {label}
            </span>
        </label>
    );

    return (
        <div className="bg-white p-2 md:p-4 rounded-xl border border-gray-300 relative overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-5 gap-6 px-1 z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-wealth-900 leading-none">Performance Comparison</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-gray-500 uppercase font-medium tracking-[0.2em] opacity-80">
                            Equity Curve Analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 bg-gray-50/80 p-4 rounded-xl border-2 border-white shadow-inner">
                    <CheckboxLabel
                        label={benchmarkName}
                        color="#d62728"
                        checked={visibility.benchmark}
                        onChange={() => toggleLine('benchmark')}
                    />
                </div>
            </div>

            <div className="h-[300px] md:h-[350px] w-full mt-2 pr-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#cbd5e1" strokeOpacity={0.9} />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                            tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                            tick={{ fill: '#334155', fontSize: 9, fontWeight: 500 }}
                            interval="preserveStartEnd"
                            angle={-65}
                            textAnchor="end"
                            height={55}
                        />
                        <YAxis
                            axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                            tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                            tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }}
                            tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {visibility.investment && (
                            <Line
                                type="monotone"
                                dataKey="Investment"
                                stroke="#ff7f0e"
                                strokeWidth={2.5}
                                dot={false}
                                strokeDasharray="5 5"
                                name="Cumulative Investment"
                                animationDuration={1000}
                                connectNulls
                            />
                        )}
                        {visibility.benchmark && (
                            <Line
                                type="monotone"
                                dataKey="Benchmark"
                                stroke="#d62728"
                                strokeWidth={3}
                                dot={false}
                                name={benchmarkName}
                                animationDuration={1000}
                                connectNulls
                            />
                        )}
                        {visibility.strategy && (
                            <Line
                                type="monotone"
                                dataKey="Strategy"
                                stroke="#1f77b4"
                                strokeWidth={3}
                                dot={false}
                                animationDuration={2000}
                                name={strategyName}
                                connectNulls
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Legend styled as per image */}
            <div className="flex justify-center flex-wrap gap-10 pt-1 mt-[-30px] border-t-2 border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#ff7f0e] rounded-full"></div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-[#ff7f0e]">Cumulative</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#1f77b4] rounded-full"></div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-[#1f77b4]">Strategy</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#d62728] rounded-full"></div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-[#d62728]">Buy & Hold</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
