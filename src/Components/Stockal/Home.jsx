import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStockalAccountSummary,
    fetchStockalPortfolio,
    fetchStockalHoldings,
    fetchStockalOrders,
    cancelStockalOrder
} from '../../store/slices/stockalSlice';
import { showNotification } from '../../store/slices/uiSlice';
import {
    Wallet,
    TrendingUp,
    Briefcase,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    LayoutDashboard,
    PieChart,
    RefreshCcw,
    Target,
    Activity,
    Clock,
    ShoppingCart,
    Loader2,
    Download,
    X,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalTable from './Common/UniversalTable';

const SummaryCard = ({ title, value, subValue, icon: Icon, colorClass, pnlValue, pnlPercent }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[6px] px-3 py-1 border border-gray-200 shadow-sm flex items-center gap-4 hover:border-wealth-800/30 transition-all group"
    >
        <div className="flex-1">
            <p className="text-[14px] font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline gap-2 mt-[-2px]">
                <h3 className="text-[15px] font-[500] text-wealth-900">
                    $ {value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                {pnlPercent !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${pnlPercent >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

const Home = () => {
    const dispatch = useDispatch();
    const {
        custId,
        accountSummary,
        portfolio,
        holdingsData,
        orders,
        loading
    } = useSelector((state) => state.stockal);

    const [activeTab, setActiveTab] = useState('Holdings');
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (custId) {
            dispatch(fetchStockalAccountSummary(custId));
            dispatch(fetchStockalPortfolio(custId));
            dispatch(fetchStockalHoldings(custId));
            // Always fetch basic account data
        }
    }, [custId, dispatch]);

    useEffect(() => {
        if (custId && activeTab === 'Orders') {
            dispatch(fetchStockalOrders(custId));
        }
    }, [custId, activeTab, dispatch]);

    const handleCancelOrder = async () => {
        if (!cancellingOrder || !custId) return;
        
        setIsCancelling(true);
        try {
            const resultAction = await dispatch(cancelStockalOrder(cancellingOrder.orderId));
            
            if (cancelStockalOrder.fulfilled.match(resultAction)) {
                dispatch(showNotification({
                    message: `Order for ${cancellingOrder.symbol} cancelled successfully`,
                    type: 'success'
                }));
                // Refresh data
                dispatch(fetchStockalOrders(custId));
                dispatch(fetchStockalAccountSummary(custId));
            } else {
                dispatch(showNotification({
                    message: typeof resultAction.payload === 'string' ? resultAction.payload : 'Failed to cancel order',
                    type: 'error'
                }));
            }
        } catch (error) {
            dispatch(showNotification({
                message: 'An error occurred while cancelling the order',
                type: 'error'
            }));
        } finally {
            setIsCancelling(false);
            setCancellingOrder(null);
        }
    };

    const totalAllocation = (accountSummary?.portfolioSummary?.stockPortfolio?.currentValue || 0) +
        (accountSummary?.portfolioSummary?.stackPortfolio?.currentValue || 0) +
        (accountSummary?.portfolioSummary?.etfPortfolio?.currentValue || 0);

    const isInitialLoading = (loading.accountSummary && !accountSummary) ||
        (loading.holdings && !holdingsData.holdings.length && !holdingsData.pendingOrders.length);

    // Columns for Holdings Table
    const holdingsColumns = [
        {
            header: 'Icon',
            key: 'icon',
            render: (val, row) => (
                <div className="flex justify-center py-0">
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 shadow-sm">
                        {(row.icon || row.logoURL) ? (
                            <img src={row.icon || row.logoURL} alt={row.symbol} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-[7px] font-black text-wealth-800">
                                {row.symbol ? row.symbol.charAt(0) : 'S'}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: 'Symbols', 
            key: 'symbol',
            render: (val) => (
                <span className="text-[10px] font-medium text-[#1e293b]">{val}</span>
            )
        },
        {
            header: 'Category',
            key: 'category',
            render: (val) => (
                <span className="text-[10px] font-medium text-slate-500">{val}</span>
            )
        },
        {   
            header: 'Investment', 
            key: 'investment',
            render: (val) => <span className="text-[10px] font-medium text-[#1e293b]">${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        },
        { 
            header: 'Quantity', 
            key: 'quantity',
            render: (val) => {
                if (val === null || val === undefined) return '-';
                const n = parseFloat(val);
                return <span className="text-[10px] font-medium text-[#1e293b]">{n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}</span>;
            }
        },
        { 
            header: 'Avg Price', 
            key: 'avgPrice',
            render: (_, row) => {
                const avg = row.quantity > 0 ? (row.investment / row.quantity) : 0;
                return <span className="text-[10px] font-medium text-[#1e293b]">${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
            }
        }
    ];

    // Columns for Orders Table
    const orderColumns = [
        {
            header: 'Icon',
            key: 'icon',
            render: (val, row) => (
                <div className="flex justify-center py-0">
                    <div className={`w-3 h-3 rounded-full overflow-hidden border flex items-center justify-center shadow-sm ${row.side === 'BUY' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        {(row.icon || row.logoURL) ? (
                            <img src={row.icon || row.logoURL} alt={row.symbol} className="w-full h-full object-contain" />
                        ) : (
                            <span className={`text-[6px] font-black ${row.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                {row.symbol ? row.symbol.charAt(0) : 'S'}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: 'Symbols', 
            key: 'symbol',
            render: (val) => (
                <span className="text-[10px] font-medium text-[#1e293b]">{val}</span>
            )
        },
        { 
            header: 'Type', 
            key: 'type',
            render: (val) => (
                <span className="text-[10px] font-bold text-slate-500">{val}</span>
            )
        },
        { 
            header: 'Action', 
            key: 'side',
            render: (val) => (
                <span className={`px-1.5 py-[2px] text-[9px] font-bold rounded-[3px] inline-block ${val === 'BUY' ? 'bg-[#e7f9ed] text-[#22c55e]' : 'bg-red-50 text-red-500'}`}>
                    {val}
                </span>
            )
        },
        { 
            header: 'Quantity', 
            key: 'quantity',
            render: (val) => (
                <span className="text-[10px] font-medium text-[#1e293b]">{val}</span>
            )
        },
        { 
            header: 'Price', 
            key: 'averagePrice',
            render: (val) => <span className="text-[10px] font-medium text-[#1e293b]">${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        },
        { 
            header: 'Investment', 
            key: 'totalInvestment',
            render: (val) => <span className="text-[10px] font-medium text-[#1e293b]">${val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        },
        { 
            header: 'Status', 
            key: 'status',
            render: (val) => {
                let label = val;
                if (val === 'NEW') label = 'Pending';
                if (val === 'FILLED') label = 'Executed';
                if (val === 'PARTIAL_FILL') label = 'Partial Fill';
                if (val === 'REJECT' || val === 'CANCEL') label = val === 'REJECT' ? 'Rejected' : 'Cancelled';
                
                return <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            }
        },
        {
            header: 'Action',
            key: 'action',
            render: (_, row) => {
                const isCancellable = row.status === 'NEW' || row.status === 'PARTIAL_FILL';
                if (!isCancellable) return <span className="text-[10px] text-gray-300 font-medium">None</span>;
                
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCancellingOrder(row);
                        }}
                        className="px-1.5 py-[1px] text-red-600 text-[10px] font-medium transition-colors leading-none"
                    >
                        Cancel
                    </button>
                );
            }
        }
    ];

    const getOrderRowClassName = (row) => {
        const status = row.status;
        if (status === 'NEW') return '!bg-yellow-100/80 hover:!bg-yellow-200/80 text-yellow-900';
        if (status === 'FILLED') return '!bg-green-100/80 hover:!bg-green-200/80 text-green-900';
        if (status === 'PARTIAL_FILL') return '!bg-orange-100/80 hover:!bg-orange-200/80 text-orange-900';
        if (status === 'REJECT' || status === 'CANCEL') return '!bg-red-100/80 hover:!bg-red-200/80 text-red-900';
        return '';
    };

    if (isInitialLoading) {
        return (
            <div className="h-[600px] w-full flex flex-col items-center justify-center space-y-4">
                <Loader2 size={40} className="text-wealth-800 animate-spin" />
                <p className="text-[10px] font-black text-wealth-800 uppercase tracking-widest animate-pulse">Syncing Portfolio Assets...</p>
            </div>
        );
    }

    return (
        <div className="px-2">
            <div className="mb-2">
                <h1 className="text-xl font-bold text-wealth-900">Dashboard</h1>
            </div>

            <div className="flex gap-3 mb-2">
                <SummaryCard
                    title="Available Cash"
                    value={accountSummary?.accountSummary?.cashAvailableForTrade || 0}
                    icon={Wallet}
                />
                <SummaryCard
                    title="Cash Balance"
                    value={accountSummary?.accountSummary?.cashBalance || 0}
                    icon={Wallet}
                />
                <SummaryCard
                    title="Withdrawal Limit"
                    value={accountSummary?.accountSummary?.cashAvailableForWithdrawal || 0}
                    icon={Wallet}
                />
            </div>

            <div className="flex w-full gap-4">
                <div className="w-[80%] overflow-y-auto border border-gray-300 rounded-[10px] bg-white">
                    {/* Tab Navigation */}
                    <div className="flex items-center justify-between border-b border-gray-300 p-3">
                        <div className="flex items-center gap-2">
                            {[
                                { id: 'Holdings', icon: <Briefcase size={14} /> },
                                { id: 'Orders', icon: <Clock size={14} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-1 rounded-[6px] text-[14px] font-medium transition-all ${activeTab === tab.id ? 'bg-[#f6cd9e] text-wealth-900 shadow-lg' : 'text-wealth-900 bg-gray-200 hover:text-gray-600'}`}
                                >
                                    {tab.id}
                                </button>
                            ))}
                        </div>

                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:border-gray-300 transition-all">
                            <Download size={13} />
                            Export CSV
                        </button>
                    </div>

                    {/* Table View */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'Holdings' ? (
                                <UniversalTable
                                    columns={holdingsColumns}
                                    data={holdingsData.holdings}
                                    isLoading={loading.holdings}
                                    emptyMessage="No holdings found"
                                />
                            ) : (
                                <UniversalTable
                                    columns={orderColumns}
                                    data={orders}
                                    isLoading={loading.orders}
                                    emptyMessage="No orders found"
                                    rowClassName={getOrderRowClassName}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="space-y-4 w-[20%]">
                    <div className="bg-wealth-900 rounded-2xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-5">
                            <PieChart size={14} className="text-wealth-800" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Allocation</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Stocks', value: accountSummary?.portfolioSummary?.stockPortfolio?.currentValue || 0, color: 'bg-green-400' },
                                { label: 'Stacks', value: accountSummary?.portfolioSummary?.stackPortfolio?.currentValue || 0, color: 'bg-blue-400' },
                                { label: 'ETFs', value: accountSummary?.portfolioSummary?.etfPortfolio?.currentValue || 0, color: 'bg-purple-400' },
                            ].map((item) => {
                                const perc = totalAllocation > 0 ? (item.value / totalAllocation) * 100 : 0;
                                return (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-[9px] font-bold uppercase">
                                            <span className="flex items-center gap-1.5 opacity-80">
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                                                {item.label}
                                            </span>
                                            <span>{perc.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} className={`h-full ${item.color}`}></motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={14} className="text-wealth-800" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Market Detail</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Unsettled (T+1)</p>
                                <p className="text-sm font-bold text-wealth-900">${accountSummary?.unsettledAmount?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="p-3 bg-wealth-900/5 rounded-xl">
                                <p className="text-[8px] font-bold text-wealth-900 uppercase tracking-widest mb-0.5">Purchasing Power</p>
                                <p className="text-sm font-bold text-wealth-900">${accountSummary?.accountSummary?.cashAvailableForTrade?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {cancellingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                        <AlertCircle size={22} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Cancel Order?</h3>
                                </div>
                                
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    Are you sure you want to cancel your <span className="font-bold text-gray-900">{cancellingOrder.side}</span> order for 
                                    <span className="font-bold text-gray-900"> {cancellingOrder.quantity} {cancellingOrder.symbol}</span>? 
                                    This action cannot be undone.
                                </p>
                                
                                <div className="flex gap-3">
                                    <button
                                        disabled={isCancelling}
                                        onClick={() => setCancellingOrder(null)}
                                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        disabled={isCancelling}
                                        onClick={handleCancelOrder}
                                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Yes, Cancel Order'
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setCancellingOrder(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
