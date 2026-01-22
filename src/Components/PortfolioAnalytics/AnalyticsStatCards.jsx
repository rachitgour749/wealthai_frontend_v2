import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnalyticsStatCards = ({ data, loading }) => {


    if (loading) {
        if (loading) {
            return null; // User requested not to show boxes during loading
        }
    }

    if (!data) {
        console.log('AnalyticsStatCards: No Data');
        return null;
    }
    console.log('AnalyticsStatCards Render:', data);

    const isPositive = data.pnl >= 0;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const StatCard = ({ title, value, subValue, subValueTitle, colorClass }) => (
        <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-300 flex flex-col justify-center min-h-[120px]">
            <span className="text-[15px] uppercase tracking-widest text-gray-500 font-bold mb-2">{title}</span>
            <div className={`text-2xl font-bold ${colorClass || 'text-gray-900'}`}>
                {value}
            </div>
            {subValue && subValueTitle && (
                <div className="mt-1">
                    <span className="text-[15px] uppercase tracking-widest text-gray-500 font-medium mb-2">{subValueTitle}</span> : <span className="text-[15px] text-gray-700 font-medium">{subValue}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Total Invested */}
            <StatCard
                title="Total Invested"
                value={formatCurrency(data.total_invested)}
                subValueTitle="Cash"
                subValue={formatCurrency(data.cash_balance)}
                colorClass="text-gray-900"
            />

            {/* Portfolio Value */}
            <StatCard
                title="Portfolio Value"
                value={formatCurrency(data.market_value)}
                colorClass="text-teal-900" // Standard Tailwind color
            />

            {/* Net P&L */}
            <StatCard
                title="Net P&L"
                value={`${isPositive ? '+' : ''}${formatCurrency(data.pnl)}`}
                colorClass={isPositive ? 'text-emerald-600' : 'text-red-600'}
            />

            {/* Returns */}
            <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-gray-300 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Returns</span>
                <div className={`flex items-center gap-2 text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    <span>{data.return_pct}%</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsStatCards;
