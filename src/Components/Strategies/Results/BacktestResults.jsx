import React, { useState, useEffect } from 'react';
import PerformanceChart from './PerformanceChart';
import ResultMetricCards from './ResultMetricCards';
import ResultTabs from './ResultTabs';
import strategyService from '../../../api/services/strategyService';
import SaveStrategyModal from './SaveStrategyModal';
import DeployConfirmationModal from './DeployConfirmationModal';
import DeploymentModal from '../DeploymentModal';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/userSlice';
import {
    saveStrategyRequest,
    saveStrategySuccess,
    saveStrategyFailure,
    selectSaveStatus,
    resetSaveStatus,
    fetchInstancesRequest,
    fetchInstancesSuccess,
    fetchInstancesFailure
} from '../../../store/slices/strategySlice';
import { showNotification } from '../../../store/slices/uiSlice';

const BacktestResults = ({ results, onBackToSetup, onNewBacktest, strategyTitle, backtestPayload, useCustomDate }) => {
    const [calculatedTotalTrades, setCalculatedTotalTrades] = useState(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isDeployConfirmOpen, setIsDeployConfirmOpen] = useState(false);
    const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
    const [savedStrategyName, setSavedStrategyName] = useState('');
    const [savedRunId, setSavedRunId] = useState(null);

    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const saveStatus = useSelector(selectSaveStatus);

    useEffect(() => {
        const calculateTrades = () => {
            try {
                const log = results.transaction_log || [];
                if (Array.isArray(log)) {
                    const count = log.reduce((acc, row) => {
                        const action = (row.action || '').toLowerCase();
                        if (action === 'churn') {
                            return acc + (row.sell_transactions?.length || 0) + (row.buy_transaction ? 1 : 0);
                        }
                        return acc + 1;
                    }, 0);
                    setCalculatedTotalTrades(count);
                }
            } catch (err) {
                console.error('Error calculating total trades:', err);
            }
        };
        if (results) calculateTrades();
    }, [results]);

    if (!results) return null;

    const { metrics, performance_data, strategy_type } = results;

    // Inject calculated total trades into metrics if it's missing or use it for the card
    const totalTrades = calculatedTotalTrades !== null ? calculatedTotalTrades : (metrics['Total Trades'] || metrics['total_trades'] || (metrics.strategy && (metrics.strategy['Total Trades'] || metrics.strategy['total_trades'])));

    const enrichedMetrics = {
        ...metrics,
        'Total Trades': totalTrades
    };

    if (enrichedMetrics.strategy) {
        enrichedMetrics.strategy = {
            ...enrichedMetrics.strategy,
            'Total Trades': totalTrades
        };
    }

    const handleSaveStrategy = async (strategyName) => {
        if (!user) {
            dispatch(showNotification({ message: 'Please login to save strategies', type: 'error' }));
            return;
        }

        if (!backtestPayload) {
            dispatch(showNotification({ message: 'No backtest data found to save', type: 'error' }));
            return;
        }

        dispatch(saveStrategyRequest());

        try {
            // Reconstruct the payload as per requirements
            const { strategy_type, tickers, start_date, end_date, ...otherParams } = backtestPayload;

            const savePayload = {
                user_id: user.email, // Using email as user_id as per authService mapping
                strategy_type: strategy_type,
                tickers: tickers,
                start_date: start_date,
                end_date: end_date,
                use_custom_date: useCustomDate || false,
                strategy_name: strategyName,
                // Put everything else into strategies_parameters
                strategies_parameters: {
                    ...otherParams,
                    strategy_name: strategyName
                }
            };

            const response = await strategyService.saveStrategy(savePayload);

            if (response) {
                // Store run_id for deployment
                if (response.run_id) {
                    setSavedRunId(response.run_id);
                }

                dispatch(saveStrategySuccess());
                dispatch(showNotification({ message: 'Strategy saved successfully!', type: 'success' }));
                setIsSaveModalOpen(false);
                dispatch(resetSaveStatus());

                // Real-time refresh of instances count
                dispatch(fetchInstancesRequest());
                try {
                    const data = await strategyService.getInstances(user.email, backtestPayload.strategy_type);
                    dispatch(fetchInstancesSuccess(data));
                } catch (error) {
                    console.error('Error refreshing instances:', error);
                    dispatch(fetchInstancesFailure(error.message));
                }
            }
        } catch (error) {
            console.error('Save Strategy Error:', error);
            dispatch(saveStrategyFailure(error.message));
            dispatch(showNotification({ message: `Failed to save strategy: ${error.message}`, type: 'error' }));
        }
    };

    const handleDeployRequest = (strategyName) => {
        setSavedStrategyName(strategyName);
        setIsSaveModalOpen(false);
        setIsDeployConfirmOpen(true);
    };

    const handleDeployNow = () => {
        setIsDeployConfirmOpen(false);
        setIsDeploymentModalOpen(true);
    };

    const handleDeploymentComplete = async (result) => {
        try {
            if (result.success) {
                console.log('Deployment successful:', result.data);
                dispatch(showNotification({ message: 'Strategy deployed successfully!', type: 'success' }));
                setIsDeploymentModalOpen(false);

                // Navigate back to strategy configuration page
                onBackToSetup();

                // Fetch fresh instances data
                dispatch(fetchInstancesRequest());
                try {
                    const data = await strategyService.getInstances(user.email, backtestPayload.strategy_type);
                    dispatch(fetchInstancesSuccess(data));
                } catch (error) {
                    console.error('Error refreshing instances:', error);
                    dispatch(fetchInstancesFailure(error.message));
                }

                // Small delay to ensure page transition and data fetch, then trigger saved instances modal
                setTimeout(() => {
                    // Trigger the saved instances button click programmatically
                    const instancesButton = document.querySelector('[data-instances-button]');
                    if (instancesButton) {
                        instancesButton.click();
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error handling deployment result:', error);
            dispatch(showNotification({ message: `Failed to deploy strategy: ${error.message}`, type: 'error' }));
        }
    };

    return (
        <div className="animate-[fadeIn_0.5s_ease-out] max-w-[1600px] mx-auto pb-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4 px-2">
                <div>
                    <h1 className="text-xl font-bold text-wealth-800 leading-none">Backtest Results</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest opacity-70">
                            {strategyTitle} Strategy Analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 h-[40px]">
                    <button
                        onClick={() => setIsSaveModalOpen(true)}
                        className="bg-teal-800 h-[30px] px-6  hover:bg-teal-900 text-white rounded-[8px] text-[10px] font-medium uppercase shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    >
                        Save Strategy
                    </button>
                    <button
                        onClick={onBackToSetup}
                        className="bg-teal-800 h-[30px] px-6  hover:bg-teal-900 text-white rounded-[8px] text-[10px] font-medium uppercase shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    >
                        Modify Parameters
                    </button>
                    <button
                        onClick={onNewBacktest}
                        className="bg-teal-800 h-[30px] px-6  hover:bg-teal-900 text-white rounded-[8px] text-[10px] font-medium uppercase shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    >
                        New Backtest
                    </button>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-10">
                <PerformanceChart
                    performanceData={performance_data}
                    strategyName={strategyTitle}
                    strategyType={strategy_type}
                />
            </div>

            {/* Metric Summary Cards */}
            <ResultMetricCards metrics={enrichedMetrics} strategyType={strategy_type} />

            {/* Detailed Tabs */}
            <ResultTabs
                metrics={enrichedMetrics}
                strategyName={strategyTitle}
                results={results}
                strategyType={strategy_type}
            />

            <SaveStrategyModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSaveStrategy}
                onDeployRequest={handleDeployRequest}
                loading={saveStatus === 'loading'}
            />

            <DeployConfirmationModal
                isOpen={isDeployConfirmOpen}
                onClose={() => setIsDeployConfirmOpen(false)}
                onDeploy={handleDeployNow}
                strategyName={savedStrategyName}
            />

            <DeploymentModal
                isOpen={isDeploymentModalOpen}
                onClose={() => setIsDeploymentModalOpen(false)}
                strategyName={savedStrategyName}
                strategyType={strategy_type}
                userEmail={user?.email || ''}
                runId={savedRunId}
                accumulationWeeks={backtestPayload?.accumulation_weeks || 1}
                onDeploy={handleDeploymentComplete}
            />
        </div>
    );
};

export default BacktestResults;
