import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    runBacktestRequest,
    runBacktestSuccess,
    runBacktestFailure,
    resetBacktest,
    selectBacktestStatus,
    selectBacktestResults
} from '../../store/slices/strategySlice';
import {
    showNotification,
    setViewMode,
    selectViewMode
} from '../../store/slices/uiSlice';
import {
    fetchInstancesRequest,
    fetchInstancesSuccess,
    fetchInstancesFailure,
    selectInstances,
    selectInstancesStatus,
    selectInstancesCount
} from '../../store/slices/strategySlice';
import { selectUser } from '../../store/slices/userSlice';
import strategyConfig from '../../Strategies/Strategies.config.json';
import StrategyHeader from './StrategyHeader';
import StrategyStepper from './StrategyStepper';
import ETFUniverseSelection from './ETFUniverseSelection';
import AvailableETFs from './AvailableETFs';
import StrategyParameters from './StrategyParameters';
import BacktestResults from './Results/BacktestResults';
import SavedInstancesModal from './SavedInstancesModal';
import BestCombinationsModal from './BestCombinationsModal';
import StrategyDescriptionModal from './StrategyDescriptionModal';
import strategyService from '../../api/services/strategyService';
import { bestCombinations } from '../../Data/bestCombinations';

const StrategyTemplate = ({ strategyId, onBack }) => {
    const [config, setConfig] = useState(null);
    const [selectedETFs, setSelectedETFs] = useState([]);
    const [paramValues, setParamValues] = useState({});
    const [availableETFs, setAvailableETFs] = useState([]);
    const [universeOptions, setUniverseOptions] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backtestPayload, setBacktestPayload] = useState(null);
    const [isInstancesModalOpen, setIsInstancesModalOpen] = useState(false);
    const [isBestCombinationsModalOpen, setIsBestCombinationsModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [backtestStarted, setBacktestStarted] = useState(false);
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    const dispatch = useDispatch();
    const abortControllerRef = useRef(null);

    const user = useSelector(selectUser);
    const instances = useSelector(selectInstances);
    const instancesStatus = useSelector(selectInstancesStatus);
    const instancesCount = useSelector(selectInstancesCount);
    const backtestStatus = useSelector(selectBacktestStatus);
    const backtestResults = useSelector(selectBacktestResults);
    const viewMode = useSelector(selectViewMode);

    // Helper to get string value from an ETF option (handles strings or objects)
    const getSymbol = (opt) => {
        if (!opt) return '';
        if (typeof opt === 'string') return opt;
        return opt.symbol || opt.ticker || opt.name || opt.label || '';
    };

    useEffect(() => {
        const strategy = strategyConfig.strategies.find(s => s.id === strategyId);
        if (strategy) {
            setConfig(strategy);

            const initialParams = {};
            strategy.parameters.forEach(p => {
                initialParams[p.id] = p.defaultValue;
            });
            setParamValues(initialParams);

            // Fetch dynamic data from API
            const fetchInitialData = async () => {
                try {
                    setLoading(true);
                    console.log(`[StrategyTemplate] Fetching data for: ${strategy.strategy_type}`);

                    let [assets, overview] = await Promise.all([
                        strategyService.fetchAssets(strategy.strategy_type),
                        strategyService.fetchAssetsOverview(strategy.strategy_type)
                    ]);

                    const findArray = (data, preferredKeys = []) => {
                        if (Array.isArray(data)) return data;
                        if (!data || typeof data !== 'object') return [];

                        // 1. Check preferred keys
                        for (const key of preferredKeys) {
                            if (Array.isArray(data[key])) return data[key];
                        }

                        // 2. Check if the object itself is a dictionary-style array (e.g., {"0": {...}, "1": {...}})
                        const values = Object.values(data);
                        const looksLikeCollection = values.length > 0 && values.every(v =>
                            v && typeof v === 'object' && (v.symbol || v.ticker || v.name || v.label)
                        );
                        if (looksLikeCollection) {
                            console.log('[StrategyTemplate] Found dictionary-style collection');
                            return values;
                        }

                        // 3. Strategy specific key
                        if (Array.isArray(data[strategy.strategy_type])) return data[strategy.strategy_type];

                        // 4. Look deeper
                        for (const key in data) {
                            if (data[key] && typeof data[key] === 'object') {
                                if (Array.isArray(data[key])) return data[key];

                                // Check if nested object is a collection
                                const nestedValues = Object.values(data[key]);
                                if (nestedValues.length > 0 && nestedValues.every(v => v && typeof v === 'object' && (v.symbol || v.ticker))) {
                                    return nestedValues;
                                }
                                if (Array.isArray(data[key][strategy.strategy_type])) return data[key][strategy.strategy_type];
                            }
                        }

                        const firstArray = Object.values(data).find(val => Array.isArray(val));
                        return firstArray || [];
                    };

                    let rawAssets = findArray(assets, ['assets', 'data', 'tickers', 'overview', 'items']);
                    let rawOverview = findArray(overview, ['options', 'overview', 'data', 'tickers', 'assets', 'items']);

                    // Fallback logic for RS_ETF_Rotation if data is missing
                    if (strategy.strategy_type === 'RS_ETF_Rotation' && rawAssets.length === 0 && rawOverview.length === 0) {
                        console.log('[StrategyTemplate] RS_ETF_Rotation returned no data, falling back to ETF_Rotation');
                        const [fallbackAssets, fallbackOverview] = await Promise.all([
                            strategyService.fetchAssets('ETF_Rotation'),
                            strategyService.fetchAssetsOverview('ETF_Rotation')
                        ]);
                        assets = fallbackAssets;
                        overview = fallbackOverview;
                        rawAssets = findArray(assets, ['assets', 'data', 'tickers', 'overview']);
                        rawOverview = findArray(overview, ['options', 'overview', 'data', 'tickers', 'assets']);
                    }

                    // Decide which one has details (sector, years)
                    // Decide which one has details (sector, years)
                    const hasDetails = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].sector || arr[0].years_available || arr[0].years);
                    const hasYears = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].years_available !== undefined || arr[0].years !== undefined);
                    const hasSector = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].sector || arr[0].industry || arr[0].group);

                    let bestSourceForTable = rawAssets;
                    // Prefer overview if it has better data (years or sector) than assets
                    if (
                        (hasYears(rawOverview) && !hasYears(rawAssets)) ||
                        (hasSector(rawOverview) && !hasSector(rawAssets)) ||
                        (!hasDetails(rawAssets) && hasDetails(rawOverview))
                    ) {
                        bestSourceForTable = rawOverview;
                    }

                    // Normalize assets for the Available ETFs table
                    const normalizedAssets = bestSourceForTable.map(item => {
                        if (typeof item === 'string') return { symbol: item, sector: '-', years: '-' };
                        return {
                            symbol: item.symbol || item.ticker || item.name || '-',
                            sector: item.sector || item.industry || item.group || '-',
                            years: item.years_available !== undefined ? item.years_available : (item.years || '-')
                        };
                    });

                    // Normalize overview for the dropdown selection
                    // If rawOverview is empty, fallback to rawAssets symbols
                    let normalizedOverview = rawOverview.map(item => getSymbol(item)).filter(s => s !== '');
                    if (normalizedOverview.length === 0 && normalizedAssets.length > 0) {
                        normalizedOverview = normalizedAssets.map(a => a.symbol).filter(s => s && s !== '-');
                    }
                    setAvailableETFs(normalizedAssets);
                    setUniverseOptions(normalizedOverview);
                } catch (error) {
                    setAvailableETFs(strategy.available_etfs || []);
                    setUniverseOptions(strategy.universe_selection.options || []);
                    setSelectedETFs([]); // Initialize with empty selection instead of slice(0, 2)
                } finally {
                    setLoading(false);
                }
            };

            fetchInitialData();
        }
    }, [strategyId]);

    const fetchInstances = async () => {
        if (!config || !user?.email) return;
        dispatch(fetchInstancesRequest());
        try {
            const data = await strategyService.getInstances(user.email, config.strategy_type);
            dispatch(fetchInstancesSuccess(data));
        } catch (error) {
            console.error('[StrategyTemplate] Error fetching instances:', error);
            dispatch(fetchInstancesFailure(error.message));
        }
    };

    // Fetch instances whenever strategy or user changes
    useEffect(() => {
        fetchInstances();
    }, [config, user?.email, dispatch]);

    // Fetch date range whenever selection changes
    useEffect(() => {
        if (config) {
            if (selectedETFs.length > 0) {
                const fetchDates = async () => {
                    try {
                        const range = await strategyService.fetchDateRange(config.strategy_type, selectedETFs);
                        setDateRange(range);
                    } catch (error) {
                        console.error('[StrategyTemplate] Error fetching date range:', error);
                        setDateRange(null);
                    }
                };
                fetchDates();
            } else {
                // Reset date range when no ETFs are selected
                setDateRange(null);
            }
        }
    }, [config, selectedETFs]);

    const handleParamChange = (id, value) => {
        setParamValues(prev => {
            const next = { ...prev, [id]: value };

            // Special logic for ETF_Payout: If withdrawAmountPerWeek is 0, payoutStartWeek should be 0
            if (config?.strategy_type === 'ETF_Payout') {
                if (id === 'withdrawAmountPerWeek' && Number(value) === 0) {
                    next.payoutStartWeek = 0;
                }
            }

            return next;
        });
        setBacktestStarted(false); // Reset backtest state on change
    };

    const handleETFChange = (newETFs) => {
        setSelectedETFs(newETFs);
        setBacktestStarted(false); // Reset backtest state on change
    };

    const handleBackToSetup = () => {
        dispatch(setViewMode('config'));
    };

    const handleNewBacktest = () => {
        dispatch(resetBacktest());
        dispatch(setViewMode('config'));
        setBacktestStarted(false);
        setBacktestPayload(null);

        // Reset inputs
        setSelectedETFs([]);
        setUseCustomDate(false);
        setCustomDateRange({ start: '', end: '' });

        // Reset parameters to defaults
        if (config && config.parameters) {
            const initialParams = {};
            config.parameters.forEach(p => {
                initialParams[p.id] = p.defaultValue;
            });
            setParamValues(initialParams);
        }
    };

    const handleCancelBacktest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        dispatch(resetBacktest());
    };

    const handleLoadInstance = (instance) => {
        // Close the modal first
        setIsInstancesModalOpen(false);

        // Parse tickers if they're in string format
        let tickers = instance.tickers;
        if (typeof tickers === 'string') {
            try {
                tickers = JSON.parse(tickers);
            } catch (e) {
                tickers = tickers.split(',').map(t => t.trim());
            }
        }

        // Set the selected ETFs
        setSelectedETFs(Array.isArray(tickers) ? tickers : []);

        // Set custom date range if available
        if (instance.start_date && instance.end_date) {
            setUseCustomDate(true);
            setCustomDateRange({
                start: instance.start_date.split('T')[0],
                end: instance.end_date.split('T')[0]
            });
        }

        // Populate strategy parameters from strategies_parameters
        if (instance.strategies_parameters) {
            const params = instance.strategies_parameters;
            const newParamValues = {};

            // Map the saved parameters to the form fields
            // Common parameters
            if (params.brokerage_percent !== undefined) newParamValues.brokerage = params.brokerage_percent;
            if (params.risk_free_rate !== undefined) newParamValues.riskFreeRate = params.risk_free_rate;

            // Strategy-specific parameters
            if (params.capital_per_week !== undefined) newParamValues.totalCapitalPerWeek = params.capital_per_week;
            if (params.accumulation_weeks !== undefined) newParamValues.accumulationWeeks = params.accumulation_weeks;
            if (params.withdraw_amount !== undefined) newParamValues.withdrawAmountPerWeek = params.withdraw_amount;
            if (params.payout_start_week !== undefined) newParamValues.payoutStartWeek = params.payout_start_week;
            if (params.no_of_positions !== undefined) newParamValues.noOfPositions = params.no_of_positions;
            if (params.total_capital !== undefined) newParamValues.totalCapital = params.total_capital;
            if (params.stop_loss !== undefined) newParamValues.stopLoss = params.stop_loss;
            if (params.buffer_capital !== undefined) newParamValues.bufferCapital = params.buffer_capital;
            if (params.compounding_threshold !== undefined) newParamValues.compoundingThreshold = params.compounding_threshold;

            setParamValues(newParamValues);
        }

        // Reset backtest state
        setBacktestStarted(false);
        dispatch(resetBacktest());
        dispatch(setViewMode('config'));

        // Show success notification
        dispatch(showNotification({
            message: `Loaded strategy: ${instance.strategy_name || 'Saved Instance'}`,
            type: 'success'
        }));
    };

    const handleLoadCombination = (combination) => {
        // Close modal
        setIsBestCombinationsModalOpen(false);

        // Set tickers
        setSelectedETFs(combination.tickers);

        // Set date range
        if (combination.startDate && combination.endDate) {
            setUseCustomDate(true);
            setCustomDateRange({
                start: combination.startDate,
                end: combination.endDate
            });
        }

        // Set parameters
        if (combination.parameters) {
            const newValues = { ...paramValues };
            Object.keys(combination.parameters).forEach(key => {
                newValues[key] = combination.parameters[key];
            });
            setParamValues(newValues);
        }

        // Reset backtest state
        setBacktestStarted(false);
        dispatch(resetBacktest());

        // Show success notification
        dispatch(showNotification({
            message: `Applied combination: ${combination.name}`,
            type: 'success'
        }));
    };

    const handleRunBacktest = async () => {
        if (!config) return;

        // Validations
        // 1. Minimum 5 ETFs requirement
        if (selectedETFs.length < 5) {
            dispatch(showNotification({
                message: 'It is mandatory to select at least 5 symbols to run a backtest.',
                type: 'warning'
            }));
            return;
        }

        // 2. Strategy specific validations
        const accWeeks = Number(paramValues.accumulationWeeks);
        if (['ETF_Rotation', 'International_ETF_Rotation', 'Stock_Rotation', 'ETF_Payout'].includes(config.strategy_type)) {
            if (accWeeks < 10) {
                dispatch(showNotification({
                    message: 'Accumulation Weeks cannot be less than 10.',
                    type: 'warning'
                }));
                return;
            }
        }

        if (config.strategy_type === 'ETF_Payout') {
            const payoutWeek = Number(paramValues.payoutStartWeek);
            const withdrawAmount = Number(paramValues.withdrawAmountPerWeek);
            if (withdrawAmount > 0 && payoutWeek <= accWeeks) {
                dispatch(showNotification({
                    message: `Payout Start Week (${payoutWeek}) must be greater than Accumulation Weeks (${accWeeks}).`,
                    type: 'warning'
                }));
                return;
            }
        }

        if (config.strategy_type === 'RS_ETF_Rotation') {
            const noOfPositions = Number(paramValues.noOfPositions);
            if (noOfPositions > selectedETFs.length) {
                dispatch(showNotification({
                    message: `No. of Positions (${noOfPositions}) cannot be greater than the number of selected ETFs (${selectedETFs.length}).`,
                    type: 'warning'
                }));
                return;
            }
        }

        // Cleanup any existing controller
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setBacktestStarted(true);
        dispatch(runBacktestRequest());

        try {
            // Determine date range: Use custom if selected, else use default available period
            const startStr = useCustomDate && customDateRange.start
                ? customDateRange.start
                : dateRange?.start_date?.split('T')[0];

            const endStr = useCustomDate && customDateRange.end
                ? customDateRange.end
                : dateRange?.end_date?.split('T')[0];

            // Core Payload (Common)
            const payload = {
                strategy_type: config.strategy_type,
                start_date: startStr,
                end_date: endStr,
                tickers: selectedETFs,
                brokerage_percent: paramValues.brokerage !== undefined ? Number(paramValues.brokerage) : 0,
                risk_free_rate: paramValues.riskFreeRate !== undefined ? Number(paramValues.riskFreeRate) : 6.0,
                compounding_enabled: false,
            };

            // Strategy-Specific Mappings
            if (config.strategy_type === 'ETF_Rotation' || config.strategy_type === 'International_ETF_Rotation' || config.strategy_type === 'Stock_Rotation') {
                payload.capital_per_week = Number(paramValues.totalCapitalPerWeek);
                payload.accumulation_weeks = Number(paramValues.accumulationWeeks);
            } else if (config.strategy_type === 'ETF_Payout') {
                payload.capital_per_week = Number(paramValues.totalCapitalPerWeek);
                payload.accumulation_weeks = Number(paramValues.accumulationWeeks);
                payload.withdraw_amount = Number(paramValues.withdrawAmountPerWeek);
                payload.payout_start_week = Number(paramValues.payoutStartWeek);
            } else if (config.strategy_type === 'RS_ETF_Rotation') {
                payload.no_of_positions = Number(paramValues.noOfPositions);
                payload.total_capital = Number(paramValues.totalCapital);
                payload.stop_loss = Number(paramValues.stopLoss);
                payload.buffer_capital = Number(paramValues.bufferCapital);
                payload.compounding_threshold = Number(paramValues.compoundingThreshold);
            }

            console.log(`[StrategyTemplate] Triggering backtest for ${config.strategy_type}:`, payload);
            setBacktestPayload(payload);

            const results = await strategyService.runBacktest(payload, abortControllerRef.current.signal);

            if (results) {
                dispatch(runBacktestSuccess(results));
                dispatch(showNotification({ message: 'Backtest completed successfully!', type: 'success' }));
                dispatch(setViewMode('results'));
                console.log('[StrategyTemplate] Backtest Results Received:', results);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log('[StrategyTemplate] Backtest aborted by user');
            } else {
                console.error('[StrategyTemplate] Backtest execution failed:', error);
                dispatch(runBacktestFailure(error.message || 'Backtest execution failed'));
                dispatch(showNotification({
                    message: `Backtest Failed: ${error.message || 'Server error'}`,
                    type: 'error'
                }));
            }
        } finally {
            abortControllerRef.current = null;
        }
    };

    const isStep1Complete = true; // Strategy opened
    const isStep2Complete = selectedETFs.length > 0;
    const isStep3Complete = backtestStarted;

    // Handle date input changes - allow free editing
    const handleCustomDateChange = (type, value) => {
        setCustomDateRange(prev => ({ ...prev, [type]: value }));
        setBacktestStarted(false);
    };

    // Validate date when user leaves the input field
    const handleCustomDateBlur = (type, value) => {
        if (!dateRange || !value) return;

        // Get the available date range boundaries
        const availableStart = dateRange.start_date?.split('T')[0];
        const availableEnd = dateRange.end_date?.split('T')[0];

        // Validate and clamp the input date
        let validatedDate = value;

        if (value < availableStart) {
            // If entered date is before available start, use available start
            validatedDate = availableStart;
        } else if (value > availableEnd) {
            // If entered date is after available end, use available end
            validatedDate = availableEnd;
        }

        // Additional validation for "end" date to ensure it's not before "start" date
        if (type === 'end' && customDateRange.start && validatedDate < customDateRange.start) {
            validatedDate = customDateRange.start;
        }

        // Additional validation for "start" date to ensure it's not after "end" date
        if (type === 'start' && customDateRange.end && validatedDate > customDateRange.end) {
            validatedDate = customDateRange.end;
        }

        // Only update if the date changed after validation
        if (validatedDate !== value) {
            setCustomDateRange(prev => ({ ...prev, [type]: validatedDate }));
        }
    };

    if (!config || loading) return (
        <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading strategy configuration...</p>
        </div>
    );

    return (
        <div className="h-full flex flex-col overflow-hidden px-2 md:px-4">
            {viewMode !== 'results' && (
                <StrategyHeader
                    name={config.name}
                    onBack={onBack}
                    instancesCount={instancesCount}
                    onInstancesClick={() => setIsInstancesModalOpen(true)}
                    onInfoClick={() => setIsDescriptionModalOpen(true)}
                />
            )}

            <div className="flex-1 overflow-y-auto mt-2 md:mt-4 px-1">
                {viewMode !== 'results' && (
                    <StrategyStepper
                        steps={[
                            { label: 'Strategy Selection', isComplete: isStep1Complete },
                            { label: 'Strategy Configuration', isComplete: isStep2Complete },
                            { label: 'Execution', isComplete: isStep3Complete },
                        ]}
                    />
                )}

                {viewMode === 'results' ? (
                    <BacktestResults
                        results={backtestResults}
                        onBackToSetup={handleBackToSetup}
                        onNewBacktest={handleNewBacktest}
                        strategyTitle={config.name}
                        backtestPayload={backtestPayload}
                        useCustomDate={useCustomDate}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-[-1px] p-4 md:p-[20px] border border-gray-300">
                        {/* Left Column (8 units) */}
                        <div className="lg:col-span-6 flex flex-col gap-6 h-full">
                            <ETFUniverseSelection
                                {...config.universe_selection}
                                options={universeOptions}
                                selectedOptions={selectedETFs}
                                onChange={handleETFChange}
                                placeholder={config.universe_selection.placeholder}
                                onBestCombinationsClick={() => setIsBestCombinationsModalOpen(true)}
                            />
                            <AvailableETFs
                                etfs={availableETFs}
                                subName={config.universe_selection.subName}
                            />
                        </div>

                        {/* Right Column (4 units) */}
                        <div className="lg:col-span-6 h-full">
                            <StrategyParameters
                                parameters={config.parameters}
                                values={paramValues}
                                onChange={handleParamChange}
                                strategyType={config.strategy_type}
                                dateRange={dateRange}
                                onRunBacktest={handleRunBacktest}
                                onCancelBacktest={handleCancelBacktest}
                                backtestStatus={backtestStatus}
                                useCustomDate={useCustomDate}
                                isBacktestDisabled={selectedETFs.length < 5}
                                onUseCustomDateChange={(val) => {
                                    setUseCustomDate(val);
                                    setBacktestStarted(false);
                                }}
                                customDateRange={customDateRange}
                                onCustomDateChange={handleCustomDateChange}
                                onCustomDateBlur={handleCustomDateBlur}
                            />
                        </div>
                    </div>
                )}
            </div>

            <SavedInstancesModal
                isOpen={isInstancesModalOpen}
                onClose={() => setIsInstancesModalOpen(false)}
                instances={instances}
                loading={instancesStatus === 'loading'}
                onRefresh={fetchInstances}
                onLoadInstance={handleLoadInstance}
            />

            <BestCombinationsModal
                isOpen={isBestCombinationsModalOpen}
                onClose={() => setIsBestCombinationsModalOpen(false)}
                combinations={bestCombinations.filter(c => c.strategy_type === config.strategy_type)}
                onLoadCombination={handleLoadCombination}
                strategyType={config.strategy_type}
                strategyConfig={config}
            />

            <StrategyDescriptionModal
                isOpen={isDescriptionModalOpen}
                onClose={() => setIsDescriptionModalOpen(false)}
                strategyId={strategyId}
            />
        </div>
    );
};

export default StrategyTemplate;
