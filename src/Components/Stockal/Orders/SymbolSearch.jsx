import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Clock, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {symbolName} from '../../../Data/stockalSymbols'

const SymbolSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    
    // Mock suggestions - in a real app, these would come from an API
    const suggestions = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 1.25, type: 'EQUITY' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -2.4, type: 'EQUITY' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: 0.85, type: 'EQUITY' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 3.12, type: 'EQUITY' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 148.20, change: -0.45, type: 'EQUITY' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.10, change: 1.10, type: 'EQUITY' },
    ];

    const filteredSuggestions = (query 
        ? symbolName.filter(s => s.symbol.includes(query.toUpperCase()) || (s.company && s.company.toLowerCase().includes(query.toLowerCase())))
        : symbolName).slice(0, 50);

    return (
        <div className="relative w-full">
            <div className={`relative flex items-center bg-gray-100 border-2 border-gray-300 rounded-[8px] transition-all duration-300 ${isFocused ? 'border-wealth-800 bg-white ring-4 ring-wealth-800/5' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="pl-4 text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Search by ticker or company name..."
                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-sm font-bold text-wealth-900 placeholder:text-gray-400 placeholder:font-medium placeholder:uppercase placeholder:tracking-widest"
                />
                {query && (
                    <button 
                        onClick={() => setQuery('')}
                        className="pr-4 text-gray-400 hover:text-wealth-800"
                    >
                        <Info size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-[60] py-2"
                    >   
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                            {filteredSuggestions.length > 0 ? (
                                filteredSuggestions.map((item) => (
                                    <button
                                        key={item.symbol}
                                        onClick={() => {
                                            onSelect(item.symbol);
                                            setQuery('');
                                        }}
                                        className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            
                                                {item.logoURL ? (
                                                    <img src={item.logoURL} alt={item.symbol} className="w-9 h-9 object-contain p-1 border rounded-full border-gray-400" />
                                                ) : (
                                                    <span className="text-xs font-bold text-wealth-800 group-hover:text-[#f6cd9e] uppercase">{item.symbol.substring(0, 2)}</span>
                                                )}
                                     
                                            <div className="text-left w-full">
                                                <div className="font-bold text-wealth-900 tracking-tight flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {item.symbol}
                                                        <span className="px-1.5 py-0.5 bg-gray-100 text-[8px] rounded uppercase flex-shrink-0 opacity-60">{item.type}</span>
                                                    </div>
                                                    {item.status && (
                                                        <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold tracking-widest ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">{item.company}</p>
                                            </div>
                                        </div>
                                        {/* <div className="text-right">
                                            <div className="font-bold text-sm text-wealth-900">${item.price.toFixed(2)}</div>
                                            <div className={`flex items-center justify-end gap-1 text-[9px] font-black uppercase tracking-tight ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {item.change >= 0 ? '+' : ''}{item.change}%
                                            </div>
                                        </div> */}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Search className="text-gray-300" size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No results for "{query}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SymbolSearch;
