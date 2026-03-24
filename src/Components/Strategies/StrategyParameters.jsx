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
    onCustomDateBlur,
    isBacktestDisabled,
    showCreditWarning
}) => {
    const isLoading = backtestStatus === 'loading';

    const handleStep = (id, direction) => {
        const param = parameters.find(p => p.id === id);
        const currentVal = Number(values[id] !== undefined ? values[id] : param?.defaultValue || 0);

        // Determine step size based on parameter type/unit
        let step = 1;
        // Stop loss used to be 0.1, now user wants complete number (1, 2, 3...)
        if (param.id === 'brokerage' || param.id === 'riskFreeRate' || param.id === 'bufferCapital' || param.id === 'compoundingThreshold') {
            step = direction === 'up' ? 0.1 : -0.1;
        } else {
            step = direction === 'up' ? 1 : -1;
        }

        const nextVal = (currentVal + step).toFixed(step % 1 === 0 ? 0 : 1);
        onChange(id, Number(nextVal));
    };

    return (
        <div className="bg-[#e1fbe9] p-4 rounded-xl border border-[#5bcb7f] h-full w-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1),inset_0_2px_4px_0_rgba(255,255,255,0.5)]">
            <div className="flex flex-col sm:flex-row justify-between mb-4 items-start sm:items-center gap-3">
                <div className='w-full'>
                    <div className='flex w-full justify-between items-center'>
                        <h2 className="text-sm md:text-lg font-bold text-wealth-800">Date Range</h2>
                        <button
                            onClick={isLoading ? onCancelBacktest : onRunBacktest}
                            disabled={!isLoading && isBacktestDisabled}
                            className={`${isLoading
                                ? "bg-red-600 hover:bg-red-700 shadow-[0_1px_2px_0_#4a0000]"
                                : (isBacktestDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-wealth-800 hover:bg-wealth-900 shadow-[0_1px_2px_0_#063b36]")
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
                    {showCreditWarning && (
                        <div className="mt-1 text-right">
                            <p className="text-red-500 text-[10px] md:text-xs font-semibold animate-pulse mr-1">
                                ⚠️ Your credit count is low, please refill
                            </p>
                        </div>
                    )}
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
                    {parameters.map((param) => {
                        const isCurrency = param.unit === '₹' || param.unit === '$';
                        const isNumber = param.type === 'number';
                        const currentValue = values[param.id] !== undefined ? values[param.id] : param.defaultValue;

                        // Fields where custom arrows should be hidden
                        const shouldHideArrows = param.id === 'totalCapitalPerWeek' ||
                            param.id === 'accumulationWeeks' ||
                            param.id === 'totalCapital' ||
                            param.id === 'withdrawAmountPerWeek'; // Including this just in case

                        // Payout logic: disable payoutStartWeek if withdrawAmountPerWeek is 0
                        const isDisabled = strategyType === 'ETF_Payout' &&
                            param.id === 'payoutStartWeek' &&
                            Number(values.withdrawAmountPerWeek) === 0;

                        const formatNumber = (val) => {
                            if (val === '' || val === undefined || val === null) return '';
                            const clean = String(val).replace(/,/g, '');
                            if (isNaN(clean)) return val;
                            const locale = param.unit === '₹' ? 'en-IN' : 'en-US';
                            const parts = clean.split('.');
                            const integerPart = Number(parts[0]).toLocaleString(locale);
                            if (parts.length > 1) {
                                return `${integerPart}.${parts[1]}`;
                            }
                            return integerPart;
                        };

                        const handleCurrencyChange = (e) => {
                            const val = e.target.value;
                            const cleanVal = val.replace(/,/g, '');
                            if (cleanVal === '' || /^\d*\.?\d*$/.test(cleanVal)) {
                                onChange(param.id, cleanVal);
                            }
                        };

                        return (
                            <div key={param.id} className={isDisabled ? 'opacity-50' : ''}>
                                <label className="block text-gray-600 ml-[4px] text-[12px] font-medium uppercase mb-1">
                                    {param.label} {param.unit && !isCurrency && `(${param.unit})`}
                                </label>
                                {param.type === 'select' ? (
                                    <select
                                        value={currentValue}
                                        disabled={isDisabled}
                                        onChange={(e) => onChange(param.id, e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-[#0f3d39] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner transition-all duration-200"
                                    >
                                        {param.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="relative">
                                        {isCurrency && (
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold z-10">
                                                {param.unit}
                                            </span>
                                        )}
                                        <div className={isNumber && !shouldHideArrows ? "custom-number-wrapper" : ""}>
                                            <input
                                                type={isCurrency ? "text" : param.type}
                                                value={isCurrency ? formatNumber(currentValue) : currentValue}
                                                disabled={isDisabled}
                                                onChange={isCurrency ? handleCurrencyChange : (e) => {
                                                    const val = e.target.value;
                                                    onChange(param.id, val);
                                                }}
                                                className={`w-full p-2.5 rounded-lg border border-gray-200 bg-white text-[#0f3d39] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#319795] shadow-inner transition-all duration-200 ${isCurrency ? 'pl-7' : ''} ${isNumber && !shouldHideArrows ? 'custom-number-input' : ''} ${isDisabled ? 'cursor-not-allowed' : ''}`}
                                            />
                                            {isNumber && !shouldHideArrows && (
                                                <div className="custom-number-controls">
                                                    <button
                                                        type="button"
                                                        className="custom-number-btn up"
                                                        onClick={() => handleStep(param.id, 'up')}
                                                        disabled={isDisabled}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="custom-number-btn down"
                                                        onClick={() => handleStep(param.id, 'down')}
                                                        disabled={isDisabled}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StrategyParameters;
