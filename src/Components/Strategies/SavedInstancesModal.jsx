import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { X, RefreshCw, FolderOpen, Eye, CirclePause, Trash2, CirclePlay, CloudUpload } from 'lucide-react';
import strategyService from '../../api/services/strategyService';
import DeploymentModal from './DeploymentModal';
import InstanceDetailsModal from './InstanceDetailsModal';
import { selectUser } from '../../store/slices/userSlice';

const SavedInstancesModal = ({ isOpen, onClose, instances, loading, onRefresh, onLoadInstance }) => {
    const user = useSelector(selectUser);
    const [actionLoading, setActionLoading] = useState({});
    const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);

    // Keep selectedInstance in sync with instances array when instances are refreshed
    useEffect(() => {
        if (selectedInstance && instances.length > 0) {
            const updated = instances.find(inst =>
                (inst.run_id || inst.id) === (selectedInstance.run_id || selectedInstance.id)
            );
            if (updated) {
                setSelectedInstance(updated);
            }
        }
    }, [instances, selectedInstance?.run_id, selectedInstance?.id]);

    if (!isOpen) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');
        } catch (e) {
            return dateStr;
        }
    };

    const parseTickers = (tickers) => {
        if (Array.isArray(tickers)) return tickers;
        if (typeof tickers === 'string') {
            try {
                const parsed = JSON.parse(tickers);
                return Array.isArray(parsed) ? parsed : [tickers];
            } catch (e) {
                return tickers.split(',').map(t => t.trim());
            }
        }
        return [];
    };


    const handleAction = async (action, instance) => {
        const runId = instance.run_id || instance.id;
        if (!runId) {
            console.error('No run_id found for instance:', instance);
            return;
        }

        setActionLoading(prev => ({ ...prev, [runId]: action }));

        try {
            if (action === 'pause') {
                await strategyService.stopStrategy(runId);
            } else if (action === 'play') {
                await strategyService.restartStrategy(runId);
            } else if (action === 'deploy') {
                // Open deployment modal instead of calling API directly
                setSelectedInstance(instance);
                setIsDeploymentModalOpen(true);
                setActionLoading(prev => ({ ...prev, [runId]: null }));
                return;
            } else if (action === 'delete') {
                await strategyService.deleteStrategy(runId);
            }

            // Refresh the instances list after action
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error(`Error performing ${action} action:`, error);
        } finally {
            setActionLoading(prev => ({ ...prev, [runId]: null }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-white w-full max-w-[95%] xl:max-w-7xl rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh] border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-wealth-800">Saved Strategy Instances</h2>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-[16px] font-medium"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-x-auto p-6 scrollbar-hide bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap rounded-tl-xl">Strategy Name</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Created Date</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Selected Assets</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Last Exec..</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Next Exec..</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-center rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-gray-400 text-sm font-medium">Loading instances...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : instances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <p className="text-gray-400 text-sm font-medium">No saved strategy instances found.</p>
                                    </td>
                                </tr>
                            ) : (
                                instances.map((instance, index) => {
                                    const tickersArr = parseTickers(instance.tickers);
                                    const getStatus = (inst) => {
                                        const apiStatus = inst.status?.toLowerCase();
                                        if (apiStatus === 'running') return 'Running';
                                        if (apiStatus === 'stop' || apiStatus === 'stopped') return 'Stopped';

                                        if (inst.is_running) return 'Running';
                                        if (inst.is_deployed) return 'Stopped';
                                        return 'Not Deployed';
                                    };
                                    const status = getStatus(instance);

                                    return (
                                        <tr key={instance.id || index} className="group hover:bg-gray-50/50 transition-colors">
                                            {/* Strategy Name */}
                                            <td className="px-6 py-3">
                                                <span className="text-[#4a5568] font-semibold text-[14px]">
                                                    {instance.strategy_name || 'Untitled Strategy'}
                                                </span>
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-6 py-3">
                                                <span className="text-gray-500 text-[14px] font-semibold">
                                                    {formatDate(instance.created_at || instance.start_date || instance.created_date)}
                                                </span>
                                            </td>

                                            {/* Selected Assets */}
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col gap-1 items-start min-w-[120px]">
                                                    {tickersArr.slice(0, 3).map((ticker, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-[#ebf8ff] text-[#4299e1] rounded text-[12px] font-medium uppercase tracking-wider">
                                                            {ticker}
                                                        </span>
                                                    ))}
                                                    {tickersArr.length > 3 && (
                                                        <span className="px-2 py-0.5 text-gray-400 text-[13px] font-medium ml-1">
                                                            +{tickersArr.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`px-5 py-1 rounded-full text-[13px] font-medium whitespace-nowrap ${status.toLowerCase() === 'running'
                                                        ? 'bg-green-100 text-green-700'
                                                        : status.toLowerCase() === 'stop' || status.toLowerCase() === 'stopped'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Last Exec */}
                                            <td className="px-6 py-3 text-center text-gray-400 text-[14px] font-medium italic">
                                                {instance.last_execution_date ? formatDate(instance.last_execution_date) : (status.toLowerCase() === 'running' ? 'N/A' : '-')}
                                            </td>

                                            {/* Next Exec */}
                                            <td className="px-6 py-3 text-center text-[13px] font-bold text-[#4a5568]">
                                                {instance.next_execution_date ? formatDate(instance.next_execution_date) : (status.toLowerCase() === 'running' ? '19-Jan-2026' : '-')}
                                            </td>

                                            {/* Multi-Icon Actions */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-between px-4 py-[2px] gap-1 border border-gray-300 rounded-full">
                                                    <button
                                                        onClick={() => onLoadInstance && onLoadInstance(instance)}
                                                        className="text-[#f59e0b] hover:text-[#d97706] transition-all hover:scale-110 p-1"
                                                        title="Load Strategy"
                                                    >
                                                        <FolderOpen size={19} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInstance(instance);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                        className="text-[#4299e1] hover:text-[#2b6cb0] transition-all hover:scale-110 p-1"
                                                        title="View Details"
                                                    >
                                                        <Eye size={19} />
                                                    </button>


                                                    {/* Conditional rendering based on status */}
                                                    {status.toLowerCase().includes('not deploy') ? (
                                                        <button
                                                            onClick={() => handleAction('deploy', instance)}
                                                            disabled={actionLoading[instance.run_id || instance.id] === 'deploy'}
                                                            className="text-[#38a169] hover:opacity-75 transition-all hover:scale-110 p-1 disabled:opacity-50"
                                                            title="Deploy Strategy"
                                                        >
                                                            {actionLoading[instance.run_id || instance.id] === 'deploy' ? (
                                                                <div className="w-[19px] h-[19px] border-2 border-[#38a169] border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <CloudUpload size={19} />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {status.toLowerCase() === 'running' ? (
                                                                <button
                                                                    onClick={() => handleAction('pause', instance)}
                                                                    disabled={actionLoading[instance.run_id || instance.id] === 'pause'}
                                                                    className="text-[#e53e3e] hover:opacity-75 transition-all hover:scale-110 p-1 disabled:opacity-50"
                                                                    title="Pause Strategy"
                                                                >
                                                                    {actionLoading[instance.run_id || instance.id] === 'pause' ? (
                                                                        <div className="w-[19px] h-[19px] border-2 border-[#e53e3e] border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <CirclePause size={19} />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAction('play', instance)}
                                                                    disabled={actionLoading[instance.run_id || instance.id] === 'play'}
                                                                    className="text-[#38a169] hover:opacity-75 transition-all hover:scale-110 p-1 disabled:opacity-50"
                                                                    title="Resume Strategy"
                                                                >
                                                                    {actionLoading[instance.run_id || instance.id] === 'play' ? (
                                                                        <div className="w-[19px] h-[19px] border-2 border-[#38a169] border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <CirclePlay size={19} />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handleAction('delete', instance)}
                                                        disabled={actionLoading[instance.run_id || instance.id] === 'delete'}
                                                        className="text-[#e53e3e] hover:text-[#a02c2c] transition-all hover:scale-110 p-1 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {actionLoading[instance.run_id || instance.id] === 'delete' ? (
                                                            <div className="w-[19px] h-[19px] border-2 border-[#e53e3e] border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Trash2 size={19} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deployment Modal */}
            <DeploymentModal
                isOpen={isDeploymentModalOpen}
                onClose={() => {
                    setIsDeploymentModalOpen(false);
                    setSelectedInstance(null);
                }}
                strategyName={selectedInstance?.strategy_name}
                strategyType={selectedInstance?.strategy_type}
                userEmail={user?.email || ''}
                runId={selectedInstance?.run_id || selectedInstance?.id}
                accumulationWeeks={
                    Array.isArray(selectedInstance?.strategies_parameters)
                        ? selectedInstance.strategies_parameters.find(p => p.parameter_name === 'accumulation_weeks')?.parameter_value
                        : selectedInstance?.strategies_parameters?.accumulation_weeks || 1
                }
                onDeploy={async (result) => {
                    try {
                        if (result.success) {
                            console.log('Deployment successful:', result.data);
                            setIsDeploymentModalOpen(false);
                            setSelectedInstance(null);
                            // Refresh instances list to show updated status
                            if (onRefresh) {
                                await onRefresh();
                            }
                        }
                    } catch (error) {
                        console.error('Error handling deployment result:', error);
                    }
                }}
            />

            <InstanceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                instance={selectedInstance}
                onRefresh={onRefresh}
            />
        </div>
    );
};

export default SavedInstancesModal;
