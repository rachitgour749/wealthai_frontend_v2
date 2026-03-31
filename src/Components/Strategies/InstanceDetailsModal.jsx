import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Info, Settings, Users, Link, Trash2, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import strategyService from '../../api/services/strategyService';
import { showNotification } from '../../store/slices/uiSlice';
import { formatDate } from '../../utils/formatUtils';

const InstanceDetailsModal = ({ isOpen, onClose, instance, onRefresh }) => {
    const dispatch = useDispatch();
    const [selectedClients, setSelectedClients] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isOpen || !instance) return null;


    const getStatus = (instance) => {
        const apiStatus = instance.status?.toLowerCase();
        if (apiStatus === 'running') return 'Running';
        if (apiStatus === 'stop' || apiStatus === 'stopped') return 'Stopped';

        if (instance.is_running) return 'Running';
        if (instance.is_deployed) return 'Stopped';
        return 'Not Deployed';
    };

    const status = getStatus(instance);

    // Parse client info
    const getClientInfo = () => {
        const info = instance.client_info;
        if (!info) return [];

        try {
            const parsed = typeof info === 'string' ? JSON.parse(info) : info;
            return Object.entries(parsed).map(([clientId, capital]) => ({
                clientId,
                capital
            }));
        } catch (e) {
            console.error('Error parsing client info:', e);
            return [];
        }
    };

    const clients = getClientInfo();

    const getCurrencySymbol = () => instance.strategy_type === 'ETF_US' ? '$' : '₹';
    const currencySymbol = getCurrencySymbol();

    // Map parameters to human readable names
    const paramLabels = {
        capital_per_week: 'Capital per Week',
        accumulation_weeks: 'Accumulation Weeks',
        withdraw_amount: 'Withdraw Amount',
        payout_start_week: 'Payout Start Week',
        no_of_positions: 'No. of Positions',
        total_capital: 'Total Capital',
        stop_loss: 'Stop Loss (%)',
        buffer_capital: 'Buffer Capital',
        compounding_threshold: 'Compounding Threshold'
    };

    const toggleClientSelection = (clientId) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const toggleAllSelection = () => {
        if (selectedClients.length === clients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(clients.map(c => c.clientId));
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await strategyService.deleteStrategyClients(
                instance.run_id || instance.id,
                selectedClients
            );

            if (result.success) {
                dispatch(showNotification({
                    message: `${selectedClients.length} client(s) deleted successfully`,
                    type: 'success'
                }));
                setSelectedClients([]);
                setShowDeleteConfirm(false);
                if (onRefresh) await onRefresh();
            } else {
                dispatch(showNotification({
                    message: result.message || 'Failed to delete clients',
                    type: 'error'
                }));
            }
        } catch (error) {
            console.error('Error deleting clients:', error);
            dispatch(showNotification({
                message: 'An error occurred while deleting clients',
                type: 'error'
            }));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-[15px] shadow-2xl w-full max-w-3xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
                {/* Header */}
                <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 px-6 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Info className="text-white w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-white leading-tight">Instance Details</h2>
                            <p className="text-white/70 text-[11px] font-medium uppercase tracking-wider">
                                {instance.strategy_name} • {instance.strategy_type?.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-4 md:px-5 py-2 overflow-y-auto max-h-[85vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Status & General Info */}
                        <div className="space-y-4 md:space-y-5">
                            <section>
                                <div className="flex items-center gap-2 mb-1">
                                    <Settings size={18} className="text-wealth-600" />
                                    <h3 className="font-bold text-gray-800">General Information</h3>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase ${status === 'Running' ? 'bg-green-100 text-green-700' :
                                            status === 'Stopped' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Created At</span>
                                        <span className="text-gray-800 font-medium">{formatDate(instance.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Last Execution</span>
                                        <span className="text-gray-800 font-medium italic">{instance.last_execution_date ? formatDate(instance.last_execution_date) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Next Execution</span>
                                        <span className="font-bold text-wealth-700">{instance.next_execution_date ? formatDate(instance.next_execution_date) : (status === 'Running' ? '19-Jan-2026' : '-')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1">
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Link size={14} /> Webhook URL
                                        </span>
                                        <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono text-gray-600 break-all">
                                            {instance.webhook_url || 'Not configured'}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-1 mt-[-10px]">
                                    <Settings size={18} className="text-wealth-600" />
                                    <h3 className="font-bold text-gray-800">Strategy Parameters</h3>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2">
                                    {Array.isArray(instance.strategies_parameters) ? (
                                        instance.strategies_parameters.map((param, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <span className="text-gray-500 text-[11px] uppercase font-bold tracking-tight">
                                                    {paramLabels[param.parameter_name] || param.parameter_name?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-gray-800 font-semibold">{param.parameter_value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        Object.entries(instance.strategies_parameters || {}).map(([key, value]) => (
                                            <div key={key} className="flex flex-col">
                                                <span className="text-gray-500 text-[11px] uppercase font-bold tracking-tight">
                                                    {paramLabels[key] || key?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-gray-800 font-semibold">{value}</span>
                                            </div>
                                        ))
                                    )}
                                    {(!instance.strategies_parameters || (Array.isArray(instance.strategies_parameters) && instance.strategies_parameters.length === 0) || (!Array.isArray(instance.strategies_parameters) && Object.keys(instance.strategies_parameters).length === 0)) && (
                                        <p className="col-span-2 text-gray-400 text-sm italic">No parameters found</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Client Info Table */}
                        <div className="space-y-4 md:space-y-5">
                            <section>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-wealth-600" />
                                        <h3 className="font-bold text-gray-800">Client Information</h3>
                                    </div>
                                    {selectedClients.length > 0 && (
                                        <button
                                            onClick={handleDeleteClick}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200 animate-in fade-in slide-in-from-right-2"
                                        >
                                            <Trash2 size={13} />
                                            Delete ({selectedClients.length})
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-fit">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                                                <th className="px-3 py-3 w-10 text-center">
                                                    <button
                                                        onClick={toggleAllSelection}
                                                        className="text-gray-400 hover:text-wealth-600 transition-colors"
                                                    >
                                                        {selectedClients.length === clients.length && clients.length > 0 ? (
                                                            <CheckSquare size={16} className="text-wealth-600" />
                                                        ) : (
                                                            <Square size={16} />
                                                        )}
                                                    </button>
                                                </th>
                                                <th className="px-2 py-3">Client ID</th>
                                                <th className="px-4 py-3 text-right">Capital</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {clients.map((client, idx) => (
                                                <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${selectedClients.includes(client.clientId) ? 'bg-wealth-50/30' : ''}`}>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => toggleClientSelection(client.clientId)}
                                                            className="text-gray-400 hover:text-wealth-600 transition-colors"
                                                        >
                                                            {selectedClients.includes(client.clientId) ? (
                                                                <CheckSquare size={16} className="text-wealth-600" />
                                                            ) : (
                                                                <Square size={16} />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-2 py-2 text-sm font-bold text-wealth-800">{client.clientId}</td>
                                                    <td className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">
                                                        {currencySymbol}{Number(client.capital).toLocaleString(instance.strategy_type === 'ETF_US' ? 'en-US' : 'en-IN')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {clients.length === 0 && (
                                                <tr>
                                                    <td colSpan="2" className="px-4 py-6 text-center text-gray-400 text-sm italic">
                                                        No clients deployed
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-[scaleIn_0.2s_ease-out]">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="text-red-500 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Clients?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete <strong>{selectedClients.length}</strong> selected client(s)? This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Yes, Delete Clients'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstanceDetailsModal;
