import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, User, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showNotification } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/userSlice';
import { fetchAccountDetails } from '../../store/slices/brokerSlice';
import { setCurrentPage, setCurrentTab } from '../../store/slices/navigationSlice';
import webhookService from '../../api/services/webhookService';
import { formatDate } from '../../utils/formatUtils';

const WebhookModal = ({ isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accountDetails = useSelector(state => state.broker.accountDetails);

    const [sourceType, setSourceType] = useState('RA'); // 'RA' or 'INDIVIDUAL'
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'EQUITY', // 'EQUITY' or 'FNO'
        strategy_type: '',
        ra_code: '',
        client_capital: '' // This will be part of client_info as capital/lots
    });

    const [raList, setRaList] = useState([]);
    const [strategiesList, setStrategiesList] = useState([]);
    const [fetchingRas, setFetchingRas] = useState(false);
    const [fetchingStrategies, setFetchingStrategies] = useState(false);
    const [showRaDropdown, setShowRaDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    useEffect(() => {
        if (isOpen && user?.email) {
            dispatch(fetchAccountDetails(user.email));
        }
    }, [isOpen, user?.email, dispatch]);

    // Fetch RA List when RA Method is selected or modal opens
    useEffect(() => {
        const fetchRas = async () => {
            if (isOpen && sourceType === 'RA') {
                setFetchingRas(true);
                try {
                    const response = await webhookService.fetchRaCodes();
                    // console.log('RA List Response:', response);
                    if (response?.status_code === 200) {
                        setRaList(response.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch RAs:', error);
                } finally {
                    setFetchingRas(false);
                }
            }
        };
        fetchRas();
    }, [isOpen, sourceType]);

    // console.log('Modal State:', { showRaDropdown, raListLength: raList.length, filteredRasLength: filteredRas?.length });

    const brokerInfo = accountDetails?.data || accountDetails;
    const isBrokerConfigured = !!brokerInfo?.client_id;
    const creationDate = formatDate(new Date());

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'ra_code') {
            setShowRaDropdown(true);
        }
        if (name === 'strategy_type') {
            setShowTypeDropdown(true);
        }
    };

    const handleRaSelect = async (ra) => {
        setFormData(prev => ({ ...prev, ra_code: ra.ra_code, strategy_type: '' }));
        setStrategiesList([]);
        setShowRaDropdown(false);
        
        setFetchingStrategies(true);
        try {
            const response = await webhookService.fetchRaStrategies(ra.ra_code);
            if (response?.status_code === 200) {
                setStrategiesList(response.strategies || []);
            }
        } catch (error) {
            console.error('Failed to fetch strategies:', error);
        } finally {
            setFetchingStrategies(false);
        }
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, strategy_type: type }));
        setShowTypeDropdown(false);
    };

    const filteredRas = raList.filter(ra => 
        ra.ra_code.toLowerCase().includes(formData.ra_code.toLowerCase())
    );

    const filteredStrategies = strategiesList.filter(strategy => 
        strategy.toLowerCase().includes(formData.strategy_type.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.email) return;

        // Validation
        if (!formData.name) {
            dispatch(showNotification({ message: 'Webhook Name is required', type: 'error' }));
            return;
        }

        if (sourceType === 'RA') {
            if (!formData.ra_code || !formData.strategy_type) {
                dispatch(showNotification({ message: 'RA Code and Strategy Type are required for RA Source', type: 'error' }));
                return;
            }
        }

        if (formData.category === 'EQUITY' && !isBrokerConfigured) {
            dispatch(showNotification({ message: 'Please configure your broker account to use Equity category', type: 'error' }));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: user.email,
                name: formData.name,
                source: sourceType, // 'RA' or 'INDIVIDUAL'
                category: formData.category, // 'EQUITY' or 'FNO'
                strategy_type: sourceType === 'INDIVIDUAL' ? 'EXTERNAL' : formData.strategy_type,
                ra_code: sourceType === 'INDIVIDUAL' ? '' : formData.ra_code,
                client_info: {}
            };

            // If EQUITY or FNO, add client_id: capital/lots if broker configured
            if (brokerInfo?.client_id) {
                payload.client_info[brokerInfo.client_id] = formData.client_capital || '0';
            }

            await webhookService.createWebhook(payload);
            dispatch(showNotification({ message: 'Webhook created successfully', type: 'success' }));
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: '',
                category: 'EQUITY',
                strategy_type: '',
                ra_code: '',
                client_capital: ''
            });
        } catch (error) {
            dispatch(showNotification({ message: 'Failed to create webhook', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 px-6 py-1.5 flex items-center justify-between shadow-sm">
                        <h2 className="text-lg font-bold text-white tracking-tight">Configure Webhook</h2>
                        <div className="text-right">
                            <p className="text-white/90 text-[10px] font-medium opacity-80 uppercase tracking-widest">Email: {user?.email}</p>
                            <p className="text-white/90 text-[10px] mt-[1px]">Creation Date: {creationDate}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-3">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Left Section - Configuration */}
                            <div className="space-y-2.5">
                                {/* Source Type Selection */}
                                <div>
                                    <label className="block text-gray-600 text-[12px] font-medium mb-[1px]">
                                        Source
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSourceType('RA')}
                                            className={`h-6.5 w-24 flex items-center justify-center gap-2 p-1 rounded-[4px] border transition-all text-[10px] font-bold uppercase tracking-wider ${sourceType === 'RA'
                                                    ? 'bg-wealth-800 text-white border-wealth-800 shadow-sm'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            RA Method
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSourceType('INDIVIDUAL')}
                                            className={`h-6.5 w-24 flex items-center justify-center gap-2 p-1 rounded-[4px] border transition-all text-[10px] font-bold uppercase tracking-wider ${sourceType === 'INDIVIDUAL'
                                                    ? 'bg-wealth-800 text-white border-wealth-800 shadow-sm'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            Individual
                                        </button>
                                    </div>
                                </div>

                                {/* Webhook Name */}
                                <div>
                                    <label className="block text-gray-500 text-[10px] font-bold uppercase mb-[1px]">
                                        Webhook Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                        className="w-full px-2 py-[2px] border border-gray-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-wealth-500 text-[11px] font-medium"
                                    />
                                </div>

                                {/* Category Row */}
                                <div>
                                    <label className="block text-gray-500 text-[10px] font-bold uppercase mb-[1px]">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-[2px] border border-gray-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-wealth-500 text-[11px] font-medium"
                                    >
                                        <option value="EQUITY">EQUITY</option>
                                        <option value="FNO">FNO</option>
                                    </select>
                                </div>

                                {/* RA Specific Fields - Show only if Source is RA */}
                                {sourceType === 'RA' && (
                                    <div className="relative grid grid-cols-2 gap-2.5 animate-[slideDown_0.2s_ease-out]">
                                        {/* RA Code Input with Dropdown */}
                                        <div className="">
                                            <label className="block text-gray-500 text-[10px] font-bold uppercase mb-[1px]">
                                                RA Code
                                            </label>
                                            <input
                                                type="text"
                                                name="ra_code"
                                                required
                                                value={formData.ra_code}
                                                onChange={handleInputChange}
                                                onFocus={() => setShowRaDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowRaDropdown(false), 200)}
                                                placeholder="Search RA Code"
                                                className="w-full px-2 py-[2px] border border-gray-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-wealth-500 text-[11px] font-medium"
                                                autoComplete="off"
                                            />
                                            {showRaDropdown && (formData.ra_code || raList.length > 0) && (
                                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[100] max-h-40 overflow-y-auto">
                                                    {fetchingRas ? (
                                                        <div className="px-3 py-2 text-[10px] text-gray-400 italic">Loading...</div>
                                                    ) : filteredRas.length > 0 ? (
                                                        filteredRas.map((ra) => (
                                                            <button
                                                                key={ra.id}
                                                                type="button"
                                                                onClick={() => handleRaSelect(ra)}
                                                                className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                                                            >
                                                                <span className="font-bold text-wealth-800">{ra.ra_code}</span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-[10px] text-gray-400 italic">No RA codes found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Strategy Type Input with Dropdown */}
                                        <div className="relative">
                                            <label className="block text-gray-500 text-[10px] font-bold uppercase mb-[1px]">
                                                Type
                                            </label>
                                            <input
                                                type="text"
                                                name="strategy_type"
                                                required
                                                value={formData.strategy_type}
                                                onChange={handleInputChange}
                                                onFocus={() => setShowTypeDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)}
                                                placeholder={fetchingStrategies ? "Loading..." : "Select Type"}
                                                className="w-full px-2 py-[2px] border border-gray-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-wealth-500 text-[11px] font-medium"
                                                autoComplete="off"
                                                disabled={!formData.ra_code}
                                            />
                                            {showTypeDropdown && (formData.strategy_type || strategiesList.length > 0) && (
                                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-999 max-h-40 overflow-y-auto">
                                                    {fetchingStrategies ? (
                                                        <div className="px-3 py-2 text-[10px] text-gray-400 italic">Loading...</div>
                                                    ) : filteredStrategies.length > 0 ? (
                                                        filteredStrategies.map((type, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => handleTypeSelect(type)}
                                                                className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none font-medium text-gray-700"
                                                            >
                                                                {type}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-[10px] text-gray-400 italic">
                                                            {!formData.ra_code ? "Select RA Code first" : "No types found"}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Section - Broker & Execution */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-500 text-[10px] font-bold uppercase">
                                        Execution Details
                                    </label>
                                    {isBrokerConfigured ? (
                                        <span className="text-[8px] px-1.5 py-0.25 bg-green-50 text-green-700 border border-green-200 rounded font-black uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 size={8} /> Active
                                        </span>
                                    ) : (
                                        <span className="text-[8px] px-1.5 py-0.25 bg-amber-50 text-amber-700 border border-amber-200 rounded font-black uppercase tracking-widest flex items-center gap-1">
                                            <AlertTriangle size={8} /> Missing
                                        </span>
                                    )}
                                </div>

                                {isBrokerConfigured ? (
                                    <div className="border border-gray-300 rounded-[5px] overflow-hidden bg-gray-50/20">
                                        <table className="w-full text-[10px]">
                                            <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                                                <tr>
                                                    <th className="px-2 py-1 text-center font-bold uppercase tracking-wider">Broker</th>
                                                    <th className="px-2 py-1 text-center font-bold uppercase tracking-wider">Client ID</th>
                                                    <th className="px-2 py-1 text-center font-bold uppercase tracking-wider">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                <tr className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-2 py-1.5 text-gray-800 text-center font-bold">
                                                        {brokerInfo.broker_name}
                                                    </td>
                                                    <td className="px-2 py-1.5 text-gray-600 font-medium text-center">
                                                        {brokerInfo.client_id}
                                                    </td>
                                                    <td className="px-2 py-1.5 flex justify-center">
                                                        <input
                                                            type="text"
                                                            name="client_capital"
                                                            value={formData.client_capital}
                                                            onChange={handleInputChange}
                                                            placeholder="Amnt"
                                                            className="w-16 px-1.5 py-[1px] text-center font-bold text-green-600 border border-gray-300 rounded focus:ring-1 focus:ring-wealth-500 focus:outline-none text-[10.5px]"
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="p-1.5 bg-white border-t border-gray-50">
                                            <p className="text-[9px] text-gray-400 leading-tight text-center font-medium italic">
                                                Auto-execution linked. Verify capital before starting.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50/50 rounded-lg p-4 border border-dashed border-gray-200 text-center space-y-2">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">No broker linked</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                dispatch(setCurrentPage('MarketsAi1'));
                                                dispatch(setCurrentTab('AddBroker'));
                                            }}
                                            className="px-3 py-1 bg-wealth-800 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mx-auto transition-all active:scale-95"
                                        >
                                            <Smartphone size={12} /> Link Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-1 border border-gray-300 text-gray-700 rounded-[4px] hover:bg-gray-100 transition-colors font-bold text-[10.5px] uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`px-4 py-1 rounded-[4px] transition-all font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 ${loading
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-wealth-800 hover:bg-wealth-900 text-white'
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Initialize Service'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WebhookModal;
