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
import { fetchCredits, selectCredits } from '../../store/slices/subscriptionSlice';
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
    const credits = useSelector(selectCredits);
    const viewMode = useSelector(selectViewMode);

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

            const fetchInitialData = async () => {
                try {
                    setLoading(true);
                    console.log(`[StrategyTemplate] Fetching data for: ${strategy.strategy_type} (market=${strategy.market}, asset_type=${strategy.asset_type})`);

                    // Use market + asset_type from config (new API format)
                    const market = strategy.market || 'INDIA';
                    const assetType = strategy.asset_type || 'ETF';

                    let [assets, overview] = await Promise.all([
                        strategyService.fetchAssets(market, assetType),
                        strategyService.fetchAssetsOverview(market, assetType)
                    ]);

                    const findArray = (data, preferredKeys = []) => {
                        if (Array.isArray(data)) return data;
                        if (!data || typeof data !== 'object') return [];

                        for (const key of preferredKeys) {
                            if (Array.isArray(data[key])) return data[key];
                        }

                        const values = Object.values(data);
                        const looksLikeCollection = values.length > 0 && values.every(v =>
                            v && typeof v === 'object' && (v.symbol || v.ticker || v.name || v.label)
                        );
                        if (looksLikeCollection) return values;

                        if (Array.isArray(data[strategy.strategy_type])) return data[strategy.strategy_type];

                        for (const key in data) {
                            if (data[key] && typeof data[key] === 'object') {
                                if (Array.isArray(data[key])) return data[key];
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

                    const hasDetails = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].sector || arr[0].years_available || arr[0].years);
                    const hasYears = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].years_available !== undefined || arr[0].years !== undefined);
                    const hasSector = (arr) => arr.length > 0 && typeof arr[0] === 'object' && (arr[0].sector || arr[0].industry || arr[0].group);

                    let bestSourceForTable = rawAssets;
                    if (
                        (hasYears(rawOverview) && !hasYears(rawAssets)) ||
                        (hasSector(rawOverview) && !hasSector(rawAssets)) ||
                        (!hasDetails(rawAssets) && hasDetails(rawOverview))
                    ) {
                        bestSourceForTable = rawOverview;
                    }

                    const normalizedAssets = bestSourceForTable.map(item => {
                        if (typeof item === 'string') return { symbol: item, sector: '-', years: '-' };
                        return {
                            symbol: item.symbol || item.ticker || item.name || '-',
                            sector: item.sector || item.industry || item.group || '-',
                            years: item.years_available !== undefined ? item.years_available : (item.years || '-')
                        };
                    });

                    let normalizedOverview = rawOverview.map(item => getSymbol(item)).filter(s => s !== '');
                    if (normalizedOverview.length === 0 && normalizedAssets.length > 0) {
                        normalizedOverview = normalizedAssets.map(a => a.symbol).filter(s => s && s !== '-');
                    }
                    setAvailableETFs(normalizedAssets);
                    setUniverseOptions(normalizedOverview);
                } catch (error) {
                    setAvailableETFs(strategy.available_etfs || []);
                    setUniverseOptions(strategy.universe_selection.options || []);
                    setSelectedETFs([]);
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

    useEffect(() => {
        fetchInstances();
    }, [config, user?.email, dispatch]);

    useEffect(() => {
        if (config) {
            if (selectedETFs.length > 0) {
                const fetchDates = async () => {
                    try {
                        const market = config.market || 'INDIA';
                        const assetsType = config.asset_type || 'ETF';
                        const range = await strategyService.fetchDateRange(market, assetsType, selectedETFs);
                        setDateRange(range);
                    } catch (error) {
                        console.error('[StrategyTemplate] Error fetching date range:', error);
                        setDateRange(null);
                    }
                };
                fetchDates();
            } else {
                setDateRange(null);
            }
        }
    }, [config, selectedETFs]);

    const handleParamChange = (id, value) => {
        setParamValues(prev => {
            const next = { ...prev, [id]: value };
            if (config?.strategy_type === 'ETF_Payout') {
                if (id === 'withdrawAmountPerWeek' && Number(value) === 0) {
                    next.payoutStartWeek = 0;
                }
            }
            return next;
        });
        setBacktestStarted(false);
    };

    const handleETFChange = (newETFs) => {
        setSelectedETFs(newETFs);
        setBacktestStarted(false);
    };

    const handleBackToSetup = () => dispatch(setViewMode('config'));

    const handleNewBacktest = () => {
        dispatch(resetBacktest());
        dispatch(setViewMode('config'));
        setBacktestStarted(false);
        setBacktestPayload(null);
        setSelectedETFs([]);
        setUseCustomDate(false);
        setCustomDateRange({ start: '', end: '' });

        if (config && config.parameters) {
            const initialParams = {};
            config.parameters.forEach(p => { initialParams[p.id] = p.defaultValue; });
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
        setIsInstancesModalOpen(false);

        let tickers = instance.tickers || instance.symbols || instance.symbol;
        if (typeof tickers === 'string') {
            try { tickers = JSON.parse(tickers); }
            catch (e) { tickers = tickers.split(',').map(t => t.trim()); }
        }
        setSelectedETFs(Array.isArray(tickers) ? tickers : []);

        if (instance.start_date && instance.end_date) {
            setUseCustomDate(true);
            setCustomDateRange({
                start: instance.start_date.split('T')[0],
                end: instance.end_date.split('T')[0]
            });
        }

        if (instance.strategies_parameters) {
            const params = instance.strategies_parameters;
            const newParamValues = {};
            if (params.brokerage_percent !== undefined) newParamValues.brokerage = params.brokerage_percent;
            if (params.risk_free_rate !== undefined) newParamValues.riskFreeRate = params.risk_free_rate;
            if (params.risk_level !== undefined) newParamValues.riskFreeRate = params.risk_level;
            if (params.capital_per_week !== undefined) newParamValues.totalCapitalPerWeek = params.capital_per_week;
            if (params.accumulation_weeks !== undefined) newParamValues.accumulationWeeks = params.accumulation_weeks;
            if (params.withdraw_amount !== undefined) newParamValues.withdrawAmountPerWeek = params.withdraw_amount;
            if (params.payout_start_week !== undefined) newParamValues.payoutStartWeek = params.payout_start_week;
            if (params.no_of_positions !== undefined) newParamValues.noOfPositions = params.no_of_positions;
            if (params.total_capital !== undefined) newParamValues.totalCapital = params.total_capital;
            if (params.stop_loss !== undefined) newParamValues.stopLoss = params.stop_loss;
            if (params.buffer_capital !== undefined) newParamValues.bufferCapital = params.buffer_capital;
            if (params.compounding_threshold !== undefined) newParamValues.compoundingThreshold = params.compounding_threshold;
            if (params.compound_threshold !== undefined) newParamValues.compoundingThreshold = params.compound_threshold;
            if (params.initial_capital !== undefined) newParamValues.initial_capital = params.initial_capital;
            if (params.sma_lookback !== undefined) newParamValues.sma_lookback = params.sma_lookback;
            if (params.stop_loss_pct !== undefined) newParamValues.stop_loss_pct = params.stop_loss_pct;
            if (params.profit_threshold_pct !== undefined) newParamValues.profit_threshold_pct = params.profit_threshold_pct;
            if (params.number_of_slots !== undefined) newParamValues.number_of_slots = params.number_of_slots;
            if (params.atr_multiplier !== undefined) newParamValues.atr_multiplier = params.atr_multiplier;
            if (params.atr_period !== undefined) newParamValues.atr_period = params.atr_period;
            setParamValues(newParamValues);
        }

        setBacktestStarted(false);
        dispatch(resetBacktest());
        dispatch(setViewMode('config'));
        dispatch(showNotification({ message: `Loaded strategy: ${instance.strategy_name || 'Saved Instance'}`, type: 'success' }));
    };

    const handleLoadCombination = (combination) => {
        setIsBestCombinationsModalOpen(false);
        setSelectedETFs(combination.tickers);
        if (combination.startDate && combination.endDate) {
            setUseCustomDate(true);
            setCustomDateRange({ start: combination.startDate, end: combination.endDate });
        }
        if (combination.parameters) {
            const newValues = { ...paramValues };
            Object.keys(combination.parameters).forEach(key => { newValues[key] = combination.parameters[key]; });
            setParamValues(newValues);
        }
        setBacktestStarted(false);
        dispatch(resetBacktest());
        dispatch(showNotification({ message: `Applied combination: ${combination.name}`, type: 'success' }));
    };

    const handleRunBacktest = async () => {
        if (!config) return;

        if (selectedETFs.length < 5) {
            dispatch(showNotification({ message: 'It is mandatory to select at least 5 symbols to run a backtest.', type: 'warning' }));
            return;
        }

        const accWeeks = Number(paramValues.accumulationWeeks);
        if (['ETF_Rotation', 'International_ETF_Rotation', 'Stock_Rotation', 'ETF_Payout'].includes(config.strategy_type)) {
            if (accWeeks < 10) {
                dispatch(showNotification({ message: 'Accumulation Weeks cannot be less than 10.', type: 'warning' }));
                return;
            }
        }

        if (config.strategy_type === 'ETF_Payout') {
            const payoutWeek = Number(paramValues.payoutStartWeek);
            const withdrawAmount = Number(paramValues.withdrawAmountPerWeek);
            if (withdrawAmount > 0 && payoutWeek <= accWeeks) {
                dispatch(showNotification({ message: `Payout Start Week (${payoutWeek}) must be greater than Accumulation Weeks (${accWeeks}).`, type: 'warning' }));
                return;
            }
        }

        if (config.strategy_type === 'RS_ETF_Rotation') {
            const noOfPositions = Number(paramValues.noOfPositions);
            if (noOfPositions > selectedETFs.length) {
                dispatch(showNotification({ message: `No. of Positions (${noOfPositions}) cannot be greater than the number of selected ETFs (${selectedETFs.length}).`, type: 'warning' }));
                return;
            }
        }

        if (config.strategy_type === 'ETF_Swing_Strategy' || config.strategy_type === 'US_ETF_Swing_Strategy') {
            const smaLookback = Number(paramValues.sma_lookback);
            if (smaLookback > 250) {
                dispatch(showNotification({ message: `SMA Lookback should not be greater than 250.`, type: 'warning' }));
                return;
            }
            const slots = Number(paramValues.number_of_slots);
            if (slots > selectedETFs.length) {
                dispatch(showNotification({ message: `Number of Slots (${slots}) cannot be greater than the number of selected ETFs (${selectedETFs.length}).`, type: 'warning' }));
                return;
            }
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setBacktestStarted(true);
        dispatch(runBacktestRequest());

        try {
            const startStr = useCustomDate && customDateRange.start
                ? customDateRange.start
                : dateRange?.start_date?.split('T')[0];

            const endStr = useCustomDate && customDateRange.end
                ? customDateRange.end
                : dateRange?.end_date?.split('T')[0];

            let payload = {};

            if (config.strategy_type === 'SuperTrend') {
                payload = {
                    strategy_type: config.strategy_type,
                    start_date: startStr,
                    end_date: endStr,
                    tickers: selectedETFs,
                    initial_capital: Number(paramValues.initial_capital),
                    risk_free_rate: Number(paramValues.riskFreeRate),
                    parameters: {
                        market: config.market || 'INDIA',
                        asset_type: config.asset_type || 'ETF',
                        atr_multiplier: Number(paramValues.atr_multiplier),
                        atr_period: Number(paramValues.atr_period),
                        stop_loss_pct: Number(paramValues.stop_loss_pct),
                        number_of_slots: Number(paramValues.number_of_slots),
                        brokerage_percent: paramValues.brokerage !== undefined ? Number(paramValues.brokerage) : 0,
                    }
                };
            } else if (config.strategy_type === 'ETF_Swing_Strategy' || config.strategy_type === 'US_ETF_Swing_Strategy') {
                // Exact payload the backend expects — no extra fields
                payload = {
                    strategy_type: config.strategy_type,
                    start_date: startStr,
                    end_date: endStr,
                    tickers: selectedETFs,
                    initial_capital: Number(paramValues.initial_capital),
                    sma_lookback: Number(paramValues.sma_lookback),
                    stop_loss_pct: Number(paramValues.stop_loss_pct),
                    profit_threshold_pct: Number(paramValues.profit_threshold_pct),
                    number_of_slots: Number(paramValues.number_of_slots),
                    risk_free_rate: Number(paramValues.riskFreeRate),
                    brokerage_percent: paramValues.brokerage !== undefined ? Number(paramValues.brokerage) : 0,
                };
            } else {
                // Core payload for all other strategies
                payload = {
                    strategy_type: config.strategy_type,
                    start_date: startStr,
                    end_date: endStr,
                    tickers: selectedETFs,
                    brokerage_percent: paramValues.brokerage !== undefined ? Number(paramValues.brokerage) : 0,
                    risk_free_rate: paramValues.riskFreeRate !== undefined ? Number(paramValues.riskFreeRate) : 6.0,
                    compounding_enabled: false,
                };

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
            }

            console.log(`[StrategyTemplate] Triggering backtest for ${config.strategy_type}:`, payload);
            setBacktestPayload(payload);

            const results = await strategyService.runBacktest(payload, abortControllerRef.current.signal);

            if (results) {
                dispatch(runBacktestSuccess(results));
                dispatch(showNotification({ message: 'Backtest completed successfully!', type: 'success' }));

                // Refresh credits after successful backtest
                if (user?.email) {
                    dispatch(fetchCredits(user.email));
                }

                dispatch(setViewMode('results'));
                console.log('[StrategyTemplate] Backtest Results Received:', results);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log('[StrategyTemplate] Backtest aborted by user');
            } else {
                console.error('[StrategyTemplate] Backtest execution failed:', error);
                dispatch(runBacktestFailure(error.message || 'Backtest execution failed'));
                dispatch(showNotification({ message: `Backtest Failed: ${error.message || 'Server error'}`, type: 'error' }));
            }
        } finally {
            abortControllerRef.current = null;
        }
    };

    const isStep1Complete = true;
    const isStep2Complete = selectedETFs.length > 0;
    const isStep3Complete = backtestStarted;

    const handleCustomDateChange = (type, value) => {
        setCustomDateRange(prev => ({ ...prev, [type]: value }));
        setBacktestStarted(false);
    };

    const handleCustomDateBlur = (type, value) => {
        if (!dateRange || !value) return;
        const availableStart = dateRange.start_date?.split('T')[0];
        const availableEnd = dateRange.end_date?.split('T')[0];
        let validatedDate = value;
        if (value < availableStart) validatedDate = availableStart;
        else if (value > availableEnd) validatedDate = availableEnd;
        if (type === 'end' && customDateRange.start && validatedDate < customDateRange.start) validatedDate = customDateRange.start;
        if (type === 'start' && customDateRange.end && validatedDate > customDateRange.end) validatedDate = customDateRange.end;
        if (validatedDate !== value) setCustomDateRange(prev => ({ ...prev, [type]: validatedDate }));
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
                                isBacktestDisabled={selectedETFs.length < 5 || (credits && credits.remaining_credits <= 0)}
                                showCreditWarning={credits && credits.remaining_credits <= 0}
                                onUseCustomDateChange={(val) => { setUseCustomDate(val); setBacktestStarted(false); }}
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
