import React from 'react';
import { X, TrendingUp, Calendar, DollarSign, Percent, Award } from 'lucide-react';

const BestCombinationsModal = ({ isOpen, onClose, combinations, onLoadCombination, strategyType, strategyConfig }) => {
    if (!isOpen) return null;

    const currencySymbol = strategyType === 'International_ETF_Rotation' ? '$' : '₹';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-white w-[98%] sm:w-full max-w-[95%] xl:max-w-6xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col h-[90vh] sm:max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-4 sm:px-5 py-3 sm:py-2 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-wealth-900 shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-wealth-800 flex items-center gap-1">
                            <Award className="text-teal-600 w-5 h-5 sm:w-6 sm:h-6" />
                            Best Combinations
                        </h2>
                        <p className="text-xs sm:text-[15px] text-gray-600 pl-[5px]">Select a pre-optimized strategy configuration</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 mt-1 sm:mt-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 sm:space-y-4 bg-gray-50/40">
                    {combinations.map((combo) => (
                        <div
                            key={combo.id}
                            className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="space-y-3 flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex flex-wrap items-center gap-2">
                                        {combo.name}
                                        <span className="bg-teal-100 text-teal-800 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                                    </h3>

                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {combo.tickers.map(ticker => (
                                            <span key={ticker} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] sm:text-xs font-bold border border-gray-200">
                                                {ticker}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
                                        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                                            <div className="flex flex-col rounded-md p-1 sm:p-2 bg-gray-50 sm:bg-transparent w-full sm:w-auto">
                                                <span className="text-[10px] sm:text-[12px] text-gray-400 uppercase font-medium tracking-tighter">Period</span>
                                                <span className="text-[11px] sm:text-[12px] text-gray-700 font-semibold">{combo.startDate} to {combo.endDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50/50 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                                            <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-medium tracking-tighter">Total Return</span>
                                                <span className="text-xs text-emerald-600 font-bold">{combo.metrics.totalReturn}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-blue-50/50 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                                            <TrendingUp size={14} className="text-blue-500 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-medium tracking-tighter">CAGR</span>
                                                <span className="text-xs text-blue-600 font-bold">{combo.metrics.cagr}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-rose-50/50 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                                            <Percent size={14} className="text-rose-500 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-medium tracking-tighter">Max DD</span>
                                                <span className="text-xs text-rose-600 font-bold">{combo.metrics.maxDrawdown}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-full lg:min-w-[250px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0">
                                        {Object.entries(combo.parameters).map(([key, value]) => {
                                            const paramDef = strategyConfig?.parameters?.find(p => p.id === key);
                                            if (!paramDef) return null;

                                            let displayVal = value.toLocaleString();
                                            const unit = paramDef.unit || (paramDef.label.includes('%') ? '%' : '');

                                            if (unit === '$' || unit === '₹') {
                                                displayVal = `${unit}${displayVal}`;
                                            } else if (unit) {
                                                displayVal = `${displayVal}${unit.startsWith(' ') ? unit : ' ' + unit}`;
                                            }

                                            let labelSymbol = paramDef.label;
                                            if (labelSymbol.includes('(')) labelSymbol = labelSymbol.split('(')[0].trim();
                                            if (labelSymbol.includes('$')) labelSymbol = labelSymbol.split('$')[0].trim();
                                            if (labelSymbol.includes('₹')) labelSymbol = labelSymbol.split('₹')[0].trim();

                                            return (
                                                <div key={key} className="flex flex-col sm:flex-row justify-between lg:items-center text-xs sm:text-[14px]">
                                                    <span className="text-gray-500">{labelSymbol}:</span>
                                                    <span className="text-gray-800 font-bold">{displayVal}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => onLoadCombination(combo)}
                                        className="mt-2 lg:mt-auto w-full py-2.5 sm:py-2 bg-wealth-700 hover:bg-wealth-800 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group active:scale-[0.98]"
                                    >
                                        Apply Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BestCombinationsModal;
