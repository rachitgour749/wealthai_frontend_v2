import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, History, Info } from 'lucide-react';
import OrderForm from './Orders/OrderForm';
import OrderHistory from './Orders/OrderHistory';
import SymbolSearch from './Orders/SymbolSearch';
import MarketOverview from './Orders/MarketOverview';
import { 
    fetchStockalHoldings, 
    fetchStockalAccountSummary, 
    fetchStockalPortfolio 
} from '../../store/slices/stockalSlice';

const Orders = ({ onTabChange }) => {
    const dispatch = useDispatch();
    const { custId } = useSelector(state => state.stockal);
    const [selectedSymbols, setSelectedSymbols] = useState([]);

    const handleSelectSymbol = (symbol) => {
        if (!selectedSymbols.includes(symbol)) {
            setSelectedSymbols([...selectedSymbols, symbol]);
        }
    };

    const handleRemoveSymbol = (symbolToRemove) => {
        setSelectedSymbols(selectedSymbols.filter(s => s !== symbolToRemove));
    };

    const handleOrderSuccess = () => {
        setSelectedSymbols([]);
        if (custId) {
            // Refresh ALL key data points
            dispatch(fetchStockalHoldings(custId));
            dispatch(fetchStockalAccountSummary(custId));
            dispatch(fetchStockalPortfolio(custId));
            dispatch(fetchStockalOrders(custId));
        }
        if (onTabChange) {
            onTabChange('Home');
        }
    };

    return (
        <div className="h-full w-full bg-gray-50/30 flex p-2 flex-col overflow-hidden">
            {/* Top Bar / Search bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="">
                    <h1 className="text-2xl font-medium text-wealth-900 tracking-tighter flex items-center gap-3">
                        Orders
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-4 h-[435px]">

                {/* Left: Market Overview */}
                <div className="w-[420px] shrink-0">
                    <MarketOverview selectedSymbols={selectedSymbols} />
                </div>

                {/* Right: History & Market Info */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0 border w-full bg-white border-gray-200 rounded-[10px] p-2">
                    <div className="flex items-center justify-between">
                        <div className="text-[18px] ml-2 font-bold text-wealth-900 flex items-center gap-3">
                            Order Configuration
                        </div>
                        <div className="w-full md:max-w-md z-50">
                            <SymbolSearch onSelect={handleSelectSymbol} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <OrderForm
                            selectedSymbols={selectedSymbols}
                            onRemoveSymbol={handleRemoveSymbol}
                            onOrderSuccess={handleOrderSuccess}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Orders;