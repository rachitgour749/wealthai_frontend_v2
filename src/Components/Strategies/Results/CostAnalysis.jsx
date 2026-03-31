import React, { useState, useEffect } from 'react';
import { formatCurrency, getCurrencySymbol } from '../../../utils/formatUtils';
import strategyService from '../../../api/services/strategyService';

const CostAnalysis = ({ strategyType, strategyName, costs = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const currencySymbol = getCurrencySymbol(strategyType, strategyName);

    useEffect(() => {
        const processData = () => {
            try {
                setLoading(true);
                let rawData = costs;

                // If it's an object where keys are years (e.g., { "2021": {...}, ... })
                if (typeof rawData === 'object' && !Array.isArray(rawData)) {
                    rawData = Object.entries(rawData).map(([year, values]) => ({
                        year,
                        ...values
                    }));
                }

                // Sort by year
                const sortedResults = (rawData || []).sort((a, b) => parseInt(a.year) - parseInt(b.year));

                setData(sortedResults);
            } catch (error) {
                console.error('Error processing costs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (costs) {
            processData();
        } else {
            setData([]);
        }
    }, [costs]);

    const downloadExcel = () => {
        if (!data.length) return;

        const headers = ["Year", "Government Taxes", "Brokerage", "Total Costs", "Transactions"].join(',');
        const rows = data.map(row => [
            row.year || row.Year,
            row.capital_gains_tax || row.transaction_costs || row.government_taxes || row.GovtTaxes || 0,
            row.total_brokerage || row.brokerage || row.Brokerage || 0,
            row.total_costs || row.TotalCosts || 0,
            row.transactions || row.Transactions || 0
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `costs_${strategyType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading cost analysis...</div>;

    if (!data.length) return (
        <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl m-4 bg-gray-50/30">
            <div className="text-3xl mb-2 opacity-50">≡ƒÆ░</div>
            <p className="font-bold text-xs uppercase tracking-[0.2em] text-gray-500">No cost data found for {strategyType}</p>
            <p className="text-[10px] mt-2 text-gray-400">Please check the browser console for logs if this is unexpected.</p>
        </div>
    );

    // Calculate totals using mapped keys
    const totals = data.reduce((acc, row) => ({
        taxes: acc.taxes + (Number(row.capital_gains_tax || row.transaction_costs || row.government_taxes || row.GovtTaxes || 0)),
        brokerage: acc.brokerage + (Number(row.total_brokerage || row.brokerage || row.Brokerage || 0)),
        costs: acc.costs + (Number(row.total_costs || row.TotalCosts || 0)),
        transactions: acc.transactions + (Number(row.transactions || row.Transactions || 0))
    }), { taxes: 0, brokerage: 0, costs: 0, transactions: 0 });

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm m-1">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white">
                <h3 className="text-[14px] font-bold text-gray-800 tracking-tight">Costs Breakdown by Year</h3>
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

            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-[#ffffff] border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Year</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Government Taxes</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Brokerage</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Total Costs</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Transactions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-teal-50/10 transition-colors">
                                <td className="py-2 px-6 text-[12px] font-medium text-gray-600 text-center">{row.year || row.Year}</td>
                                <td className="py-2 px-4 text-[12px] font-medium text-gray-600 text-center">{formatCurrency(row.capital_gains_tax || row.transaction_costs || row.GovtTaxes || 0, currencySymbol)}</td>
                                <td className="py-2 px-4 text-[12px] font-medium text-gray-600 text-center">{formatCurrency(row.total_brokerage || row.brokerage || row.Brokerage || 0, currencySymbol)}</td>
                                <td className="py-2 px-4 text-[12px] font-medium text-gray-600 text-center">{formatCurrency(row.total_costs || row.TotalCosts || 0, currencySymbol)}</td>
                                <td className="py-2 px-6 text-[12px] font-medium text-gray-600 text-center">{row.transactions || row.Transactions}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50/50">
                        <tr className="border-t-2 border-gray-100">
                            <td className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center uppercase tracking-tight">Total</td>
                            <td className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">{formatCurrency(totals.taxes, currencySymbol)}</td>
                            <td className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">{formatCurrency(totals.brokerage, currencySymbol)}</td>
                            <td className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">{formatCurrency(totals.costs, currencySymbol)}</td>
                            <td className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">{totals.transactions}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default CostAnalysis;
