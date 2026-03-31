import React from 'react';
import { X, TrendingUp, Calendar, DollarSign, Percent, Award } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/formatUtils';

const BestCombinationsModal = ({ isOpen, onClose, combinations, onLoadCombination, strategyType, strategyConfig }) => {
    const [selectedId, setSelectedId] = React.useState(null);

    React.useEffect(() => {
        if (isOpen && combinations && combinations.length > 0) {
            setSelectedId(combinations[0].id);
        }
    }, [isOpen, combinations]);

    if (!isOpen) return null;

    const currencySymbol = getCurrencySymbol(strategyType, strategyConfig?.name);
    const selectedCombo = combinations.find(c => c.id === selectedId) || combinations[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-gradient-to-tr from-[#d5f1ef] to-[#fcf6ee] w-full sm:w-full max-w-full sm:max-w-[95%] xl:max-w-[1400px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out] sm:animate-[scaleIn_0.2s_ease-out] flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex relative items-center justify-start px-5 py-4 sm:gap-2 shrink-0 bg-white/50 backdrop-blur-sm sm:bg-transparent">
                    <Award className="text-teal-600 w-9 h-9 bg-[#b0fcd7] p-2 rounded-lg sm:w-11 sm:h-11 sm:rounded-[5px] shrink-0" />
                    <div className="ml-3 sm:ml-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-wealth-800 flex items-center leading-tight">
                            Best Combinations
                        </h2>
                        <p className="text-xs sm:text-[15px] text-gray-600 truncate max-w-[200px] sm:max-w-none">Select a pre-optimized configuration</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 ml-auto sm:ml-0 sm:absolute sm:right-5 sm:top-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex flex-col h-full overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto px-5 py-3 gap-2 border-b border-gray-200/50 custom-scrollbar shrink-0 touch-pan-x">
                        {combinations.map((combo) => (
                            <button
                                key={combo.id}
                                onClick={() => setSelectedId(combo.id)}
                                className={`
                                    px-4 py-2 sm:py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border select-none
                                    ${selectedId === combo.id
                                        ? 'bg-wealth-800 text-white border-wealth-800 shadow-md scale-100 sm:transform sm:scale-105'
                                        : 'bg-white/80 text-gray-600 border-gray-200 hover:border-wealth-300 hover:text-wealth-700'
                                    }
                                `}
                            >
                                {combo.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white/30 sm:bg-transparent">
                        {selectedCombo && (
                            <div className="bg-white/80 sm:bg-white border border-gray-200 sm:border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="space-y-6 sm:space-y-5 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                                                {selectedCombo.name}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedCombo.tickers.map(ticker => (
                                                <span key={ticker} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-bold border border-gray-200 shadow-sm">
                                                    {ticker}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1 border-b sm:border-b-0 border-gray-200 pb-2 sm:pb-0">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold tracking-wider">Period</span>
                                                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {selectedCombo.startDate} <span className="text-gray-300 hidden sm:inline">|</span>
                                                    <span className="sm:hidden block w-full"></span>
                                                    {selectedCombo.endDate}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold tracking-wider">Total Return</span>
                                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                                                    <TrendingUp size={18} />
                                                    {selectedCombo.metrics.totalReturn}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold tracking-wider">CAGR</span>
                                                <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                                                    <TrendingUp size={18} />
                                                    {selectedCombo.metrics.cagr}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold tracking-wider">Max Drawdown</span>
                                                <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                                                    <Percent size={18} />
                                                    {selectedCombo.metrics.maxDrawdown}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 min-w-full lg:min-w-[300px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-8">
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 sm:mb-4">Configuration</h4>
                                            {Object.entries(selectedCombo.parameters).map(([key, value]) => {
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
                                                    <div key={key} className="flex items-center justify-between text-sm group/param hover:bg-gray-50 px-2 sm:px-2 rounded-lg transition-colors -mx-2 mb-[1px]">
                                                        <span className="text-gray-500 font-medium">{labelSymbol}</span>
                                                        <span className="text-gray-800 font-bold">{displayVal}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Sticky Apply Button for Mobile */}
                                        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm sm:static sm:bg-transparent pt-4 sm:pt-0 mt-2 sm:mt-auto -mb-2 sm:mb-auto pb-2 sm:pb-0">
                                            <button
                                                onClick={() => onLoadCombination(selectedCombo)}
                                                className="w-full py-3.5 sm:py-3 bg-wealth-800 hover:bg-wealth-900 text-white rounded-xl text-base font-bold transition-all shadow-lg shadow-wealth-700/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                            >
                                                Apply This Configuration
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BestCombinationsModal;
