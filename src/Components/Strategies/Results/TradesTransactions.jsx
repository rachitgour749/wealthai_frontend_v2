import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatUtils';
import strategyService from '../../../api/services/strategyService';

const TradesTransactions = ({ strategyType, transactions = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCurrencySymbol = (type) => {
        const t = (type || '').toLowerCase();
        if (t === 'etf_us' || t.includes('international')) return '$';
        return '₹';
    };

    const currencySymbol = getCurrencySymbol(strategyType);

    useEffect(() => {
        const processData = () => {
            try {
                setLoading(true);
                // Process the passed data into a display-friendly format
                const processed = transactions.map(row => {
                    const action = (row.action || '').toLowerCase();
                    const dateStr = row.execution_date || row.signal_date || row.date || '';
                    const dateObj = new Date(dateStr);
                    const dayName = isNaN(dateObj.getTime()) ? '-' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const formattedDate = formatDate(dateStr);

                    if (action === 'churn') {
                        const aggregatedSells = {};

                        // Group sells by ticker
                        (row.sell_transactions || []).forEach(t => {
                            const ticker = t.ticker || t.symbol;
                            if (!aggregatedSells[ticker]) {
                                aggregatedSells[ticker] = {
                                    type: 'S',
                                    symbol: ticker,
                                    units: 0,
                                    amount: 0,
                                    costs: 0,
                                    totalPrice: 0,
                                    count: 0,
                                    reason: t.reason || row.reason || ''
                                };
                            }
                            const item = aggregatedSells[ticker];
                            item.units += Number(t.units || t.qty || 0);
                            item.amount += Number(t.amount || 0);
                            item.costs += Number(t.costs?.total_costs || 0);
                            item.totalPrice += Number(t.price || 0);
                            item.count += 1;
                        });

                        const sellList = Object.values(aggregatedSells).map(item => ({
                            ...item,
                            price: item.units > 0 ? item.amount / item.units : (item.totalPrice / item.count)
                        }));

                        // Process Buy
                        const b = row.buy_transaction;
                        const buyList = b ? [{
                            type: 'B',
                            symbol: b.ticker || b.symbol,
                            units: Number(b.units || b.qty || 0),
                            price: Number(b.price || 0),
                            amount: Number(b.amount || 0),
                            costs: Number(b.costs?.total_costs || 0),
                            reason: b.reason || row.reason || ''
                        }] : [];

                        return {
                            week: row.week,
                            date: formattedDate,
                            day: dayName,
                            action: 'churn',
                            items: [...sellList, ...buyList],
                            portfolioValue: row.nav || row.cash_after || 0,
                            hasReason: [...sellList, ...buyList].some(item => item.reason)
                        };
                    } else {
                        // Accumulation or single buy/sell
                        const type = action === 'buy' ? 'B' : (action === 'sell' ? 'S' : '');
                        const item = {
                            type: type,
                            symbol: row.ticker || row.symbol || '-',
                            units: Number(row.units || row.qty || 0),
                            price: Number(row.price || 0),
                            amount: Number(row.amount || 0),
                            costs: Number(row.costs?.total_costs || row.costs?.total_transaction_costs || 0),
                            reason: row.reason || ''
                        };
                        return {
                            week: row.week || '-',
                            date: formattedDate,
                            day: dayName,
                            action: action,
                            items: [item],
                            portfolioValue: row.nav || row.cash_after || 0,
                            hasReason: !!item.reason
                        };
                    }
                });

                setData(processed || []);
            } catch (error) {
                console.error('Error processing transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (transactions && transactions.length > 0) {
            processData();
        } else {
            setData([]);
        }
    }, [transactions]);

    const downloadExcel = () => {
        if (!data.length) return;

        // Simple CSV export - flatter representation for Excel
        const csvRows = [];
        const headers = ['Week', 'Date', 'Day', 'Action', 'Type', 'Symbol', 'Units', 'Price', 'Amount', 'Costs', 'Portfolio Value'];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            row.items.forEach(item => {
                csvRows.push([
                    row.week,
                    row.date,
                    row.day,
                    row.action,
                    item.type,
                    item.symbol,
                    item.units,
                    item.price,
                    item.amount,
                    item.costs,
                    row.portfolioValue
                ].map(v => typeof v === 'string' ? `"${v}"` : v).join(','));
            });
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `trades_${strategyType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-teal-800 font-bold tracking-[0.2em] uppercase text-xs">Loading Real-time Transaction Log...</div>;

    if (!data.length) return (
        <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl m-4 bg-gray-50/30">
            <div className="text-3xl mb-2 opacity-50">📜</div>
            <p className="font-bold text-xs uppercase tracking-[0.2em] text-gray-500">No transaction data found for {strategyType}</p>
            <p className="text-[10px] mt-2 text-gray-400">If you believe this is an error, please check the browser console for logs.</p>
        </div>
    );

    // Calculate column visibility based on data content
    const hasWeek = data.some(row => row.week !== '-' && row.week !== 0 && row.week !== '0' && row.week !== null && row.week !== undefined);
    const hasCosts = data.some(row => row.items.some(item => Number(item.costs) > 0));
    const hasPortfolio = data.some(row => Number(row.portfolioValue) > 0);
    const hasReason = data.some(row => row.hasReason);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm m-1">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-widest">All Trade Transactions</h3>
                <button
                    onClick={downloadExcel}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 group active:scale-95"
                    title="Download Excel Report"
                >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-center border-collapse min-w-[1000px]">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            {hasWeek && <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Week</th>}
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Date</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Day</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Action</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Symbols</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Units/Qty</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Prices</th>
                            <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Amount</th>
                            {hasReason && (
                                <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Reason</th>
                            )}
                            {hasCosts && <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Transaction Costs</th>}
                            {hasPortfolio && <th className="py-2 px-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Portfolio Value</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, idx) => {
                            const isChurn = row.action === 'churn';

                            return (
                                <tr key={idx} className={`group border-b border-gray-100 bg-blue-100/70 transition-colors hover:bg-blue-100`}>
                                    {hasWeek && <td className="py-2 px-4 text-[12px] font-medium text-gray-600 text-center">{row.week}</td>}
                                    <td className="py-2 px-4 text-[12px] font-medium text-gray-600 text-center">{row.date}</td>
                                    <td className="py-2 px-4 text-center">
                                        <span className="bg-[#dbeaff] text-[#3160e1] px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-tight">{row.day}</span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-tight ${isChurn ? 'bg-[#facaca] text-[#bb0505]' :
                                            row.action === 'buy' ? 'bg-green-200 text-green-700' :
                                                row.action === 'sell' ? 'bg-red-200 text-red-700' :
                                                    'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                            {row.action}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="inline-flex flex-col items-start space-y-1 w-28">
                                            {row.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-bold ${item.type === 'S' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                                                        {item.type}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-gray-800 uppercase tracking-tight">{item.symbol}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            {row.items.map((item, i) => (
                                                <div key={i} className="text-[11px] font-medium text-gray-600">
                                                    {Math.round(item.units).toLocaleString()}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            {row.items.map((item, i) => (
                                                <div key={i} className="text-[12px] font-medium text-gray-600">
                                                    {formatCurrency(item.price, currencySymbol)}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            {row.items.map((item, i) => (
                                                <div key={i} className="text-[12px] font-bold text-gray-700">
                                                    {formatCurrency(item.amount, currencySymbol)}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    {hasReason && (
                                        <td className="py-2 px-4 text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                {row.items.map((item, i) => (
                                                    <div key={i} className="text-[11px] font-medium text-gray-500 italic">
                                                        {item.reason || '-'}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                    {hasCosts && (
                                        <td className="py-2 px-4 text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                {row.items.map((item, i) => (
                                                    <div key={i} className="text-[12px] font-medium text-gray-600">
                                                        {formatCurrency(item.costs, currencySymbol)}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                    {hasPortfolio && (
                                        <td className="py-2 px-4 text-center">
                                            <span className="text-[14px] font-medium text-wealth-900 tracking-tight">{formatCurrency(row.portfolioValue, currencySymbol)}</span>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradesTransactions;
