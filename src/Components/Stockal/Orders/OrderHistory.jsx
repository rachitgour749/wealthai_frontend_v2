import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, RefreshCcw, Search, Filter, Ban } from 'lucide-react';
import { fetchStockalOrders, cancelStockalOrder } from '../../../store/slices/stockalSlice';

const OrderHistory = () => {
    const dispatch = useDispatch();
    const { custId, orders, loading, error } = useSelector(state => state.stockal);

    useEffect(() => {
        if (custId) {
            dispatch(fetchStockalOrders(custId));
        }
    }, [custId, dispatch]);

    const handleCancel = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            const result = await dispatch(cancelStockalOrder(orderId));
            if (cancelStockalOrder.fulfilled.match(result)) {
                dispatch(fetchStockalOrders(custId));
            }
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toUpperCase()) {
            case 'FILLED':
                return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} /> };
            case 'CANCELLED':
            case 'REJECTED':
                return { bg: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle size={12} /> };
            case 'PENDING':
                return { bg: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={12} /> };
            default:
                return { bg: 'bg-gray-50 text-gray-500 border-gray-100', icon: <RefreshCcw size={12} /> };
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-wealth-900 tracking-tight">Order Record</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking your trade activity</p>
                </div>
                <button 
                    onClick={() => dispatch(fetchStockalOrders(custId))}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-wealth-800"
                >
                    <RefreshCcw size={18} className={loading.orders ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                            <Clock className="text-gray-200" size={32} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Yet</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Your trade history will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {orders.map((order, index) => {
                            const statusStyle = getStatusStyles(order.status);
                            const isCancellable = order.status?.toUpperCase() === 'PENDING';

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={order.orderId || index}
                                    className="p-5 hover:bg-gray-50/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-wealth-800 rounded-xl flex items-center justify-center text-[#f6cd9e] font-black text-xs overflow-hidden">
                                                {(order.icon || order.logoURL) ? (
                                                    <img src={order.icon || order.logoURL || order.icon} alt={order.symbol} className="w-full h-full object-contain" />
                                                ) : (
                                                    order.symbol?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-wealth-900 tracking-tight">{order.symbol}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${order.side === 'BUY' ? 'bg-wealth-800/10 text-wealth-800 border-wealth-800/20' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                        {order.side}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                                                    {order.type} • {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusStyle.bg}`}>
                                            {statusStyle.icon}
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Qty</p>
                                                <p className="text-xs font-black text-wealth-900 tracking-tight">{order.quantity || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Price</p>
                                                <p className="text-xs font-black text-wealth-900 tracking-tight">${order.price || order.averagePrice || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                                                <p className="text-xs font-black text-wealth-900 tracking-tight">${(order.amount || (parseFloat(order.quantity) * parseFloat(order.averagePrice))).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>

                                        {isCancellable && (
                                            <button
                                                onClick={() => handleCancel(order.orderId)}
                                                className="px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-1.5"
                                            >
                                                <Ban size={12} />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Footer Status */}
            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active connection to Stockal Broker</p>
                <div className="flex items-center gap-1.5 font-bold text-[8px] text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live System
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
