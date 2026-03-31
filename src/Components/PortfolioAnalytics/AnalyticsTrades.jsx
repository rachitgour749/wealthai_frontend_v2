import React, { useRef, useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { formatDate } from '../../utils/formatUtils';

const AnalyticsTrades = ({ trades, loading }) => {
    const [filters, setFilters] = useState({
        date: '',
        asset: '',
        type: '',
        qty: '',
        price: '',
        value: '',
        client: ''
    });

    const handleDownloadExcel = async () => {
        if (!filteredTrades || filteredTrades.length === 0) return;

        try {
            const XLSX = await import('xlsx');

            // Format data for Excel
            const excelData = filteredTrades.map(trade => {
                const isBuy = trade.side?.toLowerCase() === 'buy';
                const totalValue = (trade.quantity * trade.price) + (isBuy ? (trade.taxes + trade.brokerage) : -(trade.taxes + trade.brokerage));

                return {
                    'Date': formatDate(trade.trade_date),
                    'Asset': trade.symbol,
                    'Type': trade.side,
                    'Quantity': trade.quantity,
                    'Price': trade.price,
                    'Total Value': totalValue,
                    'Client': trade.client_code || '-'
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Trades");

            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `Trade_Transactions_${dateStr}.xlsx`);

        } catch (error) {
            console.error("Error exporting to Excel:", error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(value || 0);
    };


    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Filter Logic
    const filteredTrades = useMemo(() => {
        if (!trades) return [];
        return trades.filter(trade => {
            const isBuy = trade.side?.toLowerCase() === 'buy';
            const totalValue = (trade.quantity * trade.price) + (isBuy ? (trade.taxes + trade.brokerage) : -(trade.taxes + trade.brokerage));

            const matchesDate = formatDate(trade.trade_date).toLowerCase().includes(filters.date.toLowerCase());
            const matchesAsset = (trade.symbol || '').toLowerCase().includes(filters.asset.toLowerCase());
            const matchesType = (trade.side || '').toLowerCase().includes(filters.type.toLowerCase());
            const matchesQty = (trade.quantity || '').toString().includes(filters.qty);
            const matchesPrice = (trade.price || '').toString().includes(filters.price);
            const matchesValue = totalValue.toString().includes(filters.value); // Simple string match for value
            const matchesClient = (trade.client_code || '').toLowerCase().includes(filters.client.toLowerCase());

            return matchesDate && matchesAsset && matchesType && matchesQty && matchesPrice && matchesValue && matchesClient;
        });
    }, [trades, filters]);


    if (loading) {
        if (loading) {
            return (
                <div className="w-full bg-transparent p-6 min-h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            );
        }
    }

    const InputFilter = ({ placeholder, value, onChange, width = "w-full" }) => (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-2 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-teal-500 ${width}`}
        />
    );

    return (
        <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Trade Transactions</h3>
                    </div>

                    {/* Excel Download Button */}
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={handleDownloadExcel}
                            className="p-2 bg-gray-100 text-wealth-800 font-bold text-[15px] hover:bg-gray-200 rounded-lg transition-colors"
                            title="Download Excel"
                        >
                            <Download size={24} />
                        </button>
                        <div className="text-[14px] bg-gray-100 border border-gray-400 rounded-[10px] px-2 py-1 text-gray-600 font-medium uppercase tracking-widest mt-1">
                            ({filteredTrades.length}) Trade Found
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        {/* Heading Row */}
                        <tr className="bg-gray-100 border-y border-gray-300">
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[12%]">DATE</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[12%]">ASSET</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[10%]">TYPE</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[10%]">QTY</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[12%]">PRICE</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">VALUE</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">CLIENT</th>
                        </tr>
                        {/* Filter Row */}
                        <tr className="bg-white border-b border-gray-300">
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.date} onChange={(v) => handleFilterChange('date', v)} />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.asset} onChange={(v) => handleFilterChange('asset', v)} />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="B/S" value={filters.type} onChange={(v) => handleFilterChange('type', v)} width="w-16" />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.qty} onChange={(v) => handleFilterChange('qty', v)} />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.price} onChange={(v) => handleFilterChange('price', v)} />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.value} onChange={(v) => handleFilterChange('value', v)} />
                            </td>
                            <td className="px-2 py-2 text-center">
                                <InputFilter placeholder="Filter..." value={filters.client} onChange={(v) => handleFilterChange('client', v)} />
                            </td>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredTrades.length > 0 ? (
                            filteredTrades.map((trade, index) => {
                                const isBuy = trade.side?.toLowerCase() === 'buy';
                                const totalValue = (trade.quantity * trade.price) + (isBuy ? (trade.taxes + trade.brokerage) : -(trade.taxes + trade.brokerage));

                                return (
                                    <tr key={trade.id || index} className="hover:bg-blue-200/80 transition-colors bg-blue-100 text-sm">
                                        <td className="px-4 py-3 text-gray-600 font-medium text-center">
                                            {formatDate(trade.trade_date)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-800 text-center">
                                            {trade.symbol}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${isBuy
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-medium text-center">
                                            {trade.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 text-center">
                                            {formatCurrency(trade.price)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-900 text-center">
                                            {formatCurrency(totalValue)}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                            {trade.client_code || '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                                    No trades found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsTrades;
