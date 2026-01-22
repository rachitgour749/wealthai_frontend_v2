import React from 'react';
import { formatDate } from '../../utils/dateUtils';

const StrategyParameters = ({
    parameters,
    values,
    onChange,
    strategyType,
    dateRange,
    onRunBacktest,
    onCancelBacktest,
    backtestStatus,
    useCustomDate,
    onUseCustomDateChange,
    customDateRange,
    onCustomDateChange,
    onCustomDateBlur
}) => {
    const isLoading = backtestStatus === 'loading';

    return (
        <div className="bg-[#e1fbe9] p-4 rounded-xl border border-[#5bcb7f] h-full w-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1),inset_0_2px_4px_0_rgba(255,255,255,0.5)]">
            <div className="flex flex-col sm:flex-row justify-between mb-4 items-start sm:items-center gap-3">
                <div className='w-full'>
                    <div className='flex w-full justify-between items-center'>
                        <h2 className="text-sm md:text-lg font-bold text-wealth-800">Date Range</h2>
                        <button
                            onClick={isLoading ? onCancelBacktest : onRunBacktest}
                            className={`${isLoading
                                ? "bg-red-600 hover:bg-red-700 shadow-[0_1px_2px_0_#4a0000]"
                                : "bg-wealth-800 hover:bg-wealth-900 shadow-[0_1px_2px_0_#063b36]"
                                } text-white px-2 md:px-4 py-1 md:py-1.5 rounded-lg font-medium text-[12px] md:text-sm flex items-center gap-1 md:gap-2 transition-all duration-200`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm md:text-base">🚀</span> Run Backtest
                                </>
                            )}
                        </button>
                    </div>
                    <div className="bg-white p-2 md:p-3 rounded-lg border border-[#c6f6d5] mt-2 grid grid-cols-2 gap-2 md:gap-4 min-w-0 sm:min-w-[280px]">
                        <div>
                            <p className="text-gray-400 text-[9px] md:text-[11px] uppercase font-medium">Available Period:</p>
                            <p className="text-[#0f3d39] font-medium text-[11px] md:text-sm">
                                {dateRange ? `${formatDate(dateRange.start_date)} to ${formatDate(dateRange.end_date)}` : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[9px] md:text-[11px] uppercase font-medium">Max Duration:</p>
                            <p className="text-wealth-700 font-bold text-[11px] md:text-sm">{dateRange ? `${Number(dateRange.years).toFixed(1)} years` : '0 years'}</p>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="customizeDate"
                            checked={useCustomDate}
                            onChange={(e) => onUseCustomDateChange(e.target.checked)}
                            className="w-[12px] md:w-[14px] h-[12px] md:h-[14px] ml-[3px] rounded border-gray-300 text-[#319795] focus:ring-[#319795]"
                        />
                        <label htmlFor="customizeDate" className="text-[12px] md:text-[15px] text-gray-600">Customize date range</label>
                    </div>

                    {useCustomDate && (
                        <div className="mt-3 grid grid-cols-2 gap-3 animate-[fadeIn_0.3s_ease-out]">
                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase font-bold mb-1 ml-1">From:</label>
                                <input
                                    type="date"
                                    value={customDateRange.start}
                                    onChange={(e) => onCustomDateChange('start', e.target.value)}
                                    onBlur={(e) => onCustomDateBlur && onCustomDateBlur('start', e.target.value)}
                                    min={dateRange?.start_date?.split('T')[0]}
                                    max={customDateRange.end || dateRange?.end_date?.split('T')[0]}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f3d39] font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase font-bold mb-1 ml-1">To:</label>
                                <input
                                    type="date"
                                    value={customDateRange.end}
                                    onChange={(e) => onCustomDateChange('end', e.target.value)}
                                    onBlur={(e) => onCustomDateBlur && onCustomDateBlur('end', e.target.value)}
                                    min={customDateRange.start || dateRange?.start_date?.split('T')[0]}
                                    max={dateRange?.end_date?.split('T')[0]}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-[#0f3d39] font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 md:mt-4">
                <h2 className="text-sm md:text-lg font-bold text-[#0f3d39] mb-3">Strategy Parameters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {parameters.map((param) => (
                        <div key={param.id}>
                            <label className="block text-gray-600 ml-[4px] text-[12px] font-medium uppercase mb-1">
                                {param.label} {param.unit && `(${param.unit})`}
                            </label>
                            {param.type === 'select' ? (
                                <select
                                    value={values[param.id] !== undefined ? values[param.id] : param.defaultValue}
                                    onChange={(e) => onChange(param.id, e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-[#0f3d39] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner transition-all duration-200"
                                >
                                    {param.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={param.type}
                                    value={values[param.id] !== undefined ? values[param.id] : param.defaultValue}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty string for numeric inputs during typing
                                        onChange(param.id, val);
                                    }}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-[#0f3d39] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner transition-all duration-200"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StrategyParameters;
