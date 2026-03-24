import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ArrowRight, Wallet, TrendingUp, X, CheckCircle2 } from 'lucide-react';
import { placeStockalOrder, fetchMarketPrice } from '../../../store/slices/stockalSlice';
import { showNotification } from '../../../store/slices/uiSlice';

const OrderForm = ({ selectedSymbols, onRemoveSymbol, onOrderSuccess }) => {
    const dispatch = useDispatch();
    const { custId, loading, error, marketData } = useSelector(state => state.stockal);

    const [side, setSide] = useState('BUY'); // BUY or SELL
    const [orderType, setOrderType] = useState('MARKET'); // MARKET, LIMIT, STOP
    const [inputMode, setInputMode] = useState('QUANTITY'); // QUANTITY or AMOUNT

    const [inputs, setInputs] = useState({});
    const [priceInputs, setPriceInputs] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pricesList = Array.isArray(marketData?.price) ? marketData.price : [];

    useEffect(() => {
        if (selectedSymbols && selectedSymbols.length > 0) {
            dispatch(fetchMarketPrice(selectedSymbols));
        }
    }, [selectedSymbols, dispatch]);

    const handleInput = (symbol, value) => {
        setInputs(prev => ({ ...prev, [symbol]: value }));
    };

    const handlePriceInput = (symbol, value) => {
        setPriceInputs(prev => ({ ...prev, [symbol]: value }));
    };

    const getBasketTotals = () => {
        let isAmount = orderType === 'MARKET' && inputMode === 'AMOUNT';
        let totalVal = 0;

        selectedSymbols?.forEach(sym => {
            totalVal += parseFloat(inputs[sym] || 0);
        });

        return {
            label: isAmount ? 'Total Amount' : 'Total Quantity',
            formattedValue: isAmount
                ? `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${totalVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })} Shares`
        };
    };

    const isFormValid = selectedSymbols.length > 0 && selectedSymbols.every(sym => {
        const hasBaseVal = parseFloat(inputs[sym]) > 0;
        if (orderType !== 'MARKET') {
            const hasPricVal = parseFloat(priceInputs[sym]) > 0;
            return hasBaseVal && hasPricVal;
        }
        return hasBaseVal;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSymbols || selectedSymbols.length === 0 || !custId) return;

        setIsSubmitting(true);

        try {
            const orders = selectedSymbols.map((symbol) => {
                const quantity = orderType === 'MARKET' ? (inputMode === 'QUANTITY' ? parseFloat(inputs[symbol] || 0) : null) : parseFloat(inputs[symbol] || 0);
                const amount = orderType === 'MARKET' ? (inputMode === 'AMOUNT' ? parseFloat(inputs[symbol] || 0) : null) : null;
                const price = orderType !== 'MARKET' ? parseFloat(priceInputs[symbol] || 0) : null;

                const hasInput = (quantity && quantity > 0) || (amount && amount > 0) || (price && price > 0);

                // For selling, if no quantity is provided, we can assume sell ALL
                if (hasInput || side === 'SELL') {
                    const orderItem = {
                        symbol: symbol,
                        type: orderType,
                        side: side,
                        category: 'EQUITY',
                        sellOption: 'ALL'
                    };

                    if (quantity && quantity > 0) orderItem.quantity = quantity;
                    if (amount && amount > 0) orderItem.amount = amount;
                    if (price && price > 0) orderItem.price = price;

                    return orderItem;
                }
                return null;
            }).filter(Boolean); // Remove nulls

            if (orders.length === 0) {
                dispatch(showNotification({ 
                    message: 'Please enter quantities/amounts or add symbols to sell.', 
                    type: 'error' 
                }));
                setIsSubmitting(false);
                return;
            }

            const payload = {
                customerId: custId,
                orders: orders
            };

            const resultAction = await dispatch(placeStockalOrder(payload));

            if (placeStockalOrder.fulfilled.match(resultAction)) {
                const results = resultAction.payload; // This is the array of responses
                
                if (Array.isArray(results)) {
                    const errors = results.filter(r => r.status === 400);
                    const successes = results.filter(r => r.status === 200);

                    if (errors.length > 0) {
                        const errorMsg = errors.map(e => `${e.symbol}: ${e.error}`).join(' | ');
                        dispatch(showNotification({ 
                            message: `Order errors: ${errorMsg}`, 
                            type: 'error' 
                        }));
                        
                        // If there were some successes, we still refresh but don't navigate
                        if (successes.length > 0) {
                            if (onOrderSuccess) onOrderSuccess();
                        }
                    } else {
                        dispatch(showNotification({ 
                            message: `Successfully placed ${successes.length} order(s)!`, 
                            type: 'success' 
                        }));
                        
                        // Full success - cleanup and navigate
                        setInputs({});
                        setPriceInputs({});
                        if (onOrderSuccess) onOrderSuccess();
                    }
                } else {
                    // Fallback for non-array response
                    dispatch(showNotification({ 
                        message: `Successfully placed order(s)!`, 
                        type: 'success' 
                    }));
                    if (onOrderSuccess) onOrderSuccess();
                }
            } else {
                dispatch(showNotification({ 
                    message: resultAction.payload || 'Failed to place orders.', 
                    type: 'error' 
                }));
            }
        } catch (err) {
            console.error(err);
            setStatusMessage({ type: 'error', text: `An unexpected error occurred.` });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedSymbols || selectedSymbols.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="text-gray-400" size={24} />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select a symbol to start trading</p>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">You can search and select multiple symbols for a basket order.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full absolute inset-0">
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">

                {/* Global Controls */}
                <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                    <div className="bg-gray-200/70 px-3  py-2 rounded-[5px]">
                        <div className='text-[12px] font-medium mb-1 ml-[1px]'>Order Side :</div>
                        <button
                            type="button"
                            onClick={() => setSide('BUY')}
                            className={`px-4 py-1 text-[12px] font-bold border border-green-600 uppercase tracking-widest rounded-[5px] transition-all ${side === 'BUY' ? 'bg-green-600 text-white shadow-md' : 'text-green-600'}`}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => setSide('SELL')}
                            className={`px-4 py-1 text-[13px] border border-red-600 ml-2 font-bold uppercase tracking-widest rounded-[5px] transition-all ${side === 'SELL' ? 'bg-red-500 text-white shadow-md' : 'text-red-600'}`}
                        >
                            Sell
                        </button>
                    </div>

                    <div className="bg-gray-200/70 px-3  py-2 rounded-[5px]">
                        <div className='text-[12px] font-medium mb-1 ml-[1px]'>Order Type :</div>
                        <div className='space-x-2'>
                            {['MARKET', 'LIMIT', 'STOP'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setOrderType(type)}
                                    className={`px-4 py-1 text-[12px] font-bold uppercase tracking-widest rounded-[5px] border transition-all ${orderType === type ? 'bg-[#a08460] text-white border-[#b3936a]' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-300 hover:text-gray-600'}`}
                                >
                                    {type}
                                </button>
                            ))}</div>
                    </div>

                    {orderType === 'MARKET' && (
                        <div className="bg-gray-200/70 px-3 py-2 rounded-[5px]">
                            <div className='text-[12px] font-medium mb-1 ml-[1px]'>Unit (for fractional buying) :</div>
                            <div className='space-y-1 flex gap-2 items-center h-7'>
                                <label className="flex items-center gap-2 cursor-pointer group pt-[5px]">
                                    <div
                                        onClick={() => setInputMode('QUANTITY')}
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${inputMode === 'QUANTITY' ? 'border-wealth-800' : 'border-gray-400 group-hover:border-gray-400'}`}
                                    >
                                        {inputMode === 'QUANTITY' && <div className="w-1.5 h-1.5 rounded-full bg-wealth-800" />}
                                    </div>
                                    <span className={`text-[12px] pt-[1px] font-bold uppercase tracking-widest ${inputMode === 'QUANTITY' ? 'text-wealth-900' : 'text-gray-400 group-hover:text-gray-600'}`}>Shares</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div
                                        onClick={() => setInputMode('AMOUNT')}
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${inputMode === 'AMOUNT' ? 'border-wealth-800' : 'border-gray-400 group-hover:border-gray-400'}`}
                                    >
                                        {inputMode === 'AMOUNT' && <div className="w-1.5 h-1.5 rounded-full bg-wealth-800" />}
                                    </div>
                                    <span className={`text-[12px] font-bold uppercase tracking-widest ${inputMode === 'AMOUNT' ? 'text-wealth-900' : 'text-gray-400 group-hover:text-gray-600'}`}>Amount ($)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>


                {/* Symbols Basket List */}
                <div className="mt-1 space-y-1">
                    <label className="text-[12px] font-medium text-gray-600 uppercase  flex items-center gap-1.5">
                        Selected Symbols ({selectedSymbols.length})
                    </label>

                    {selectedSymbols.map(symbol => {
                        const priceData = pricesList.find(p => p.symbol === symbol);
                        const livePrice = priceData ? parseFloat(priceData.lastTradePrice || 0) : 0;
                        const change = priceData ? parseFloat(priceData.priceChange || 0) : 0;

                        return (
                            <motion.div
                                key={symbol}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="px-4 py-2 rounded-[5px] border border-gray-300 bg-gray-50 flex items-center gap-4 hover:border-gray-200 transition-all group relative"
                            >
                                <button
                                    type="button"
                                    onClick={() => onRemoveSymbol(symbol)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>

                                <div className="w-[120px]">
                                    <h3 className="text-[15px] font-bold text-wealth-900 tracking-tighter">{symbol}</h3>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                                    {orderType === 'MARKET' ? (
                                        <div className="col-span-2 relative">
                                            <input
                                                type="number"
                                                step={inputMode === 'QUANTITY' ? '0.0001' : '0.01'}
                                                value={inputs[symbol] || ''}
                                                onChange={(e) => handleInput(symbol, e.target.value)}
                                                placeholder={`Enter ${inputMode.toLowerCase()}`}
                                                className="w-full px-4 py-1.5 bg-white border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-800/20 focus:border-wealth-800 transition-all text-sm font-bold text-wealth-900 placeholder:text-gray-300 placeholder:font-medium"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">
                                                {inputMode === 'QUANTITY' ? 'Shares' : 'USD'}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={inputs[symbol] || ''}
                                                    onChange={(e) => handleInput(symbol, e.target.value)}
                                                    placeholder="Shares"
                                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-800/20 focus:border-wealth-800 transition-all text-sm font-bold text-wealth-900 placeholder:text-gray-300 placeholder:font-medium"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Qty</div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={priceInputs[symbol] || ''}
                                                    onChange={(e) => handlePriceInput(symbol, e.target.value)}
                                                    placeholder="Target $"
                                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-800/20 focus:border-wealth-800 transition-all text-sm font-bold text-wealth-900 placeholder:text-gray-300 placeholder:font-medium"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">{orderType === 'LIMIT' ? 'LMT' : 'STP'}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Estimate */}

            </div>

            {/* Status Messages */}
            {/* Redux Notifications are handled by global AppPopup */}
            {error.orders && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-3 bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-widest border-t border-red-100 text-center">
                    {error.orders}
                </motion.div>
            )}

            {/* Submit Button */}
            <div className="px-4 py-1.5 flex justify-between bg-gray-200 border-t border-gray-100 z-10">
                {selectedSymbols.length > 0 && (
                    <div className="bg-wealth-800/5 rounded-[5px] border border-wealth-800/10 flex justify-center items-center gap-2 px-3">
                        <div className='text-[13px] font-medium'>{getBasketTotals().label}</div>

                        <div className="text-wealth-800 text-[15px] font-bold">
                            {getBasketTotals().formattedValue}
                        </div>
                    </div>
                )}

                <button
                    disabled={isSubmitting || !isFormValid}
                    className={`flex items-center h-9 justify-center gap-2 py-1 px-3 rounded-[5px] text-[14px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] ${side === 'BUY'
                        ? 'bg-wealth-800 text-[#f6cd9e] hover:bg-wealth-900 shadow-wealth-800/20'
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                        } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                >
                    {isSubmitting
                        ? 'Processing Basket...'
                        : `Place Order`
                    }
                    {!isSubmitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </button>
            </div>
        </form>
    );
};

export default OrderForm;
