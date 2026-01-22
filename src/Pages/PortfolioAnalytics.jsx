import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentStrategy } from '../store/slices/navigationSlice';
import axiosInstance from '../api/config/axiosInstance';
import { API_ENDPOINTS } from '../api/config/apiConfig';
import AnalyticsHeader from '../Components/PortfolioAnalytics/AnalyticsHeader';
import AnalyticsChart from '../Components/PortfolioAnalytics/AnalyticsChart';
import AnalyticsTrades from '../Components/PortfolioAnalytics/AnalyticsTrades';
import AnalyticsStatCards from '../Components/PortfolioAnalytics/AnalyticsStatCards';

const PortfolioAnalytics = () => {
    const runId = useSelector(selectCurrentStrategy);

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [strategyData, setStrategyData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [tradesData, setTradesData] = useState([]);
    const [clientsList, setClientsList] = useState([]);

    const [selectedClient, setSelectedClient] = useState(null); // null means 'Reference Capital' (default)

    // Fetch Data
    useEffect(() => {
        const fetchAnalyticsData = async () => {
            if (!runId) return;

            setLoading(true);
            setError(null);

            try {
                console.log("Fetching analytics for runId:", runId);

                // We can fetch initial data in parallel
                // Note: If client selection API logic changes, we might need to refetch specific parts when selectedClient changes.
                // For now, assuming standard endpoints return 'master' data or list.
                // If specific client data is needed, we would append query params like ?client_code=${selectedClient}

                // Construct URLs (add client param if selected)
                // However, user prompt implied simple endpoints. We'll start basic.
                // IF logic requires client specific data, we will add query param.
                // Assuming endpoints accept ?client_code=... if selectedClient is not null.

                const clientQuery = selectedClient ? `?client_code=${encodeURIComponent(selectedClient)}` : '';

                const [strategyRes, chartRes, tradesRes, clientsRes] = await Promise.all([
                    axiosInstance.get(`${API_ENDPOINTS.PORTFOLIO_STRATEGY(runId)}${clientQuery}`),
                    axiosInstance.get(`${API_ENDPOINTS.PORTFOLIO_EQUITY_CURVE(runId)}${clientQuery}`),
                    axiosInstance.get(`${API_ENDPOINTS.PORTFOLIO_TRADES(runId)}${clientQuery}`),
                    axiosInstance.get(API_ENDPOINTS.PORTFOLIO_CLIENTS(runId)) // Always fetch full client list
                ]);

                // Parse Responses
                // Strategy Detail
                if (strategyRes.data) {
                    setStrategyData(strategyRes.data); // Assuming direct object based on user sample
                }

                // Equity Curve
                if (chartRes.data && chartRes.data.success) {
                    setChartData(chartRes.data.data);
                } else if (Array.isArray(chartRes.data)) {
                    setChartData(chartRes.data);
                }

                // Trades
                if (tradesRes.data && tradesRes.data.trades) {
                    setTradesData(tradesRes.data.trades);
                } else if (Array.isArray(tradesRes.data)) {
                    setTradesData(tradesRes.data);
                }

                // Clients List
                if (clientsRes.data && clientsRes.data.clients) {
                    setClientsList(clientsRes.data.clients);
                }

            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load strategy details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [runId, selectedClient]); // Re-fetch when runId or selectedClient changes

    const handleClientChange = (client) => {
        // client is the string/id from the list
        setSelectedClient(client);
    };

    // Derive display data based on selected client
    const displayData = React.useMemo(() => {
        if (!strategyData) return null;

        if (selectedClient && strategyData.clients && Array.isArray(strategyData.clients)) {
            const clientSpecificData = strategyData.clients.find(c => c.client_code === selectedClient);
            if (clientSpecificData) {
                // Map client specific fields to generic fields expected by StatCards
                return {
                    ...strategyData, // Keep generic info like strategy_name
                    total_invested: clientSpecificData.invested_amount || 0,
                    market_value: clientSpecificData.market_value || 0,
                    pnl: clientSpecificData.pnl || 0,
                    return_pct: clientSpecificData.return_pct || 0,
                    cash_balance: clientSpecificData.cash_balance || 0,
                };
            }
        }
        return strategyData;
    }, [strategyData, selectedClient]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-500">
                <p className="mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="animate-spin rounded-full h-12 w-12 border-y-2 border-teal-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <AnalyticsHeader
                    runId={runId}
                    strategyName={strategyData?.strategy_name}
                    clients={clientsList}
                    selectedClient={selectedClient}
                    onClientChange={handleClientChange}
                />



                {/* Equity Curve Chart */}
                <AnalyticsChart
                    data={chartData}
                    strategyName={strategyData?.strategy_name}
                    loading={false}
                />


                {/* Financial Metrics Cards (Below Graph) */}
                <AnalyticsStatCards
                    data={displayData}
                    loading={false}
                />

                {/* Trades Table */}
                <AnalyticsTrades
                    trades={tradesData}
                    loading={false}
                />

            </div>
        </div>
    );
};

export default PortfolioAnalytics;
