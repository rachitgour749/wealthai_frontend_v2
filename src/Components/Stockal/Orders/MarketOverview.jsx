import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Activity, ArrowUpCircle, ArrowDownCircle, Target, ActivitySquare } from 'lucide-react';
import { useSelector } from 'react-redux';

const MarketOverview = ({ selectedSymbols }) => {
    const { marketData, loading } = useSelector(state => state.stockal);
    const pricesList = Array.isArray(marketData?.price) ? marketData.price : [];

    // Filter to only show details for currently selected symbols
    const activeDetails = pricesList.filter(p => selectedSymbols.includes(p.symbol));

    if (!selectedSymbols || selectedSymbols.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-200 rounded-[15px]">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                    <ActivitySquare className="text-gray-300" size={32} />
                </div>
                <h2 className="text-xl font-black text-gray-300 tracking-tighter uppercase">Market Overview</h2>
                <p className="text-sm font-bold text-gray-400 mt-2 max-w-[250px]">Select symbols from the basket to view in-depth market details here.</p>
            </div>
        );
    }

    if (loading.market && activeDetails.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-[15px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wealth-800"></div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white border border-gray-300 rounded-[10px] flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-300 bg-gray-100 flex items-center justify-between">
                <h2 className="text-[14px] font-medium text-wealth-900 flex items-center gap-2">
                    <Activity size={16} className="text-wealth-800" />
                    Symbols Details
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                <AnimatePresence>
                    {activeDetails.map(data => {
                        const price = parseFloat(data.lastTradePrice || 0);
                        const change = parseFloat(data.priceChange || 0);
                        const percentChange = price > 0 ? (change / (price - change)) * 100 : 0;
                        const isPositive = change >= 0;

                        return (
                            <motion.div
                                key={data.symbol}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="border border-gray-300 rounded-[6px] p-2 shadow-sm hover:shadow-md transition-all bg-white"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-[16px] font-bold text-wealth-900 tracking-tighter">{data.symbol}</h3>
                                    </div>
                                    <div className="text-right flex gap-1">
                                        <div className="text-[16px] font-black text-wealth-800">$ {price.toFixed(2)}</div>
                                        <div className={`flex items-center justify-end gap-1.5 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 justify-between">
                                    <div className="px-2 py-1  bg-gray-50 rounded-[5px] border border-gray-300">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Open</span>
                                        <span className="text-sm font-bold text-wealth-900">${parseFloat(data.openPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="px-2 py-1 bg-gray-50 rounded-[5px] border border-gray-300">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase block ">Prior Close</span>
                                        <span className="text-sm font-bold text-wealth-900">${parseFloat(data.priorClosePrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="px-2 py-1 bg-emerald-50 rounded-[5px] border border-emerald-300 flex items-center justify-between">
                                        <div>
                                            <div className='flex items-center gap-1'><span className="text-[10px] font-bold text-emerald-600 uppercase block">Day High</span> <ArrowUpCircle className="text-emerald-600" size={14} /></div>
                                            <span className="text-sm font-bold text-emerald-700">${parseFloat(data.highPrice || 0).toFixed(2)}</span>
                                        </div>
                                        
                                    </div>
                                    <div className="px-2 py-1 bg-red-50 rounded-[5px] border border-red-300 flex items-center justify-between">
                                        <div>
                                            <div className='flex items-center gap-1'><span className="text-[10px] font-bold text-red-600 uppercase block">Day Low</span><ArrowDownCircle className="text-red-600" size={15} /></div>
                                            <span className="text-sm font-bold text-red-700">${parseFloat(data.lowPrice || 0).toFixed(2)}</span>
                                        </div>
                                        
                                    </div>
                                </div>

                                {/* <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Volume</span>
                                        <span className="text-xs font-bold text-gray-600">{Number(data.cumulativeVolume || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="text-center border-x border-gray-100">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">52W High</span>
                                        <span className="text-xs font-bold text-gray-600">${parseFloat(data.highPrice52Week || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">52W Low</span>
                                        <span className="text-xs font-bold text-gray-600">${parseFloat(data.lowPrice52Week || 0).toFixed(2)}</span>
                                    </div>
                                </div> */}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketOverview;
