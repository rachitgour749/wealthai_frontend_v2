import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/slices/userSlice';
import { showNotification } from '../../store/slices/uiSlice';
import webhookService from '../../api/services/webhookService';
import { Loader2 } from 'lucide-react';
import WebhookModal from './WebhookModal';
import WebhookHeader from './WebhookHeader';
import WebhookEmptyState from './WebhookEmptyState';
import WebhookTable from './WebhookTable';
import WebhookJson from './webhookjson';

const Webhook = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [visibleKeys, setVisibleKeys] = useState({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWebhookForJson, setSelectedWebhookForJson] = useState(null);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

    const userId = user?.email;

    const fetchWebhooks = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await webhookService.fetchWebhooks(userId);
            setWebhooks(data.webhooks || []);
        } catch (err) {
            console.error('Error fetching webhooks:', err);
            setError('Failed to load webhooks');
            dispatch(showNotification({
                message: 'Failed to fetch webhooks',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    }, [userId, dispatch]);

    useEffect(() => {
        fetchWebhooks();
    }, [fetchWebhooks]);

    const handleToggleStatus = async (runId, currentStatus) => {
        setActionLoading(runId);
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await webhookService.toggleStatus(runId, newStatus);
            fetchWebhooks(); // Re-fetch webhooks after status change
            dispatch(showNotification({ 
                message: `Webhook ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`, 
                type: 'success' 
            }));
        } catch (error) {
            dispatch(showNotification({ message: 'Failed to update status', type: 'error' }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (runId) => {
        if (window.confirm('Are you sure you want to delete this webhook?')) {
            setActionLoading(runId);
            try {
                await webhookService.deleteWebhook(runId);
                fetchWebhooks(); // Re-fetch webhooks after deletion
                dispatch(showNotification({ message: 'Webhook deleted successfully', type: 'success' }));
            } catch (error) {
                dispatch(showNotification({ message: 'Failed to delete webhook', type: 'error' }));
            } finally {
                setActionLoading(null);
            }
        }
    };

    const toggleKeyVisibility = (runId) => {
        setVisibleKeys(prev => ({
            ...prev,
            [runId]: !prev[runId]
        }));
    };

    const handleOpenJsonModal = (webhook) => {
        setSelectedWebhookForJson(webhook);
        setIsJsonModalOpen(true);
    };

    if (loading && webhooks.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4 py-20">
                <Loader2 size={40} className="text-wealth-800 animate-spin" />
                <p className="text-xs font-black text-wealth-800 uppercase tracking-widest animate-pulse">
                    Fetching Webhook Configurations...
                </p>
            </div>
        );
    }

    if (error && webhooks.length === 0) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 inline-block mx-auto">
                    <p className="text-red-700 font-bold mb-2">Error: {error}</p>
                    <button 
                        onClick={fetchWebhooks}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-4 max-w-[1600px] mx-auto">
            <WebhookHeader onOpenModal={() => setIsModalOpen(true)} />
            
            {webhooks.length === 0 && !loading ? (
                <WebhookEmptyState onOpenModal={() => setIsModalOpen(true)} />
            ) : (
                <WebhookTable
                    webhooks={webhooks}
                    visibleKeys={visibleKeys}
                    toggleKeyVisibility={toggleKeyVisibility}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    actionLoading={actionLoading}
                    onOpenJsonModal={handleOpenJsonModal}
                />
            )}

            <WebhookModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchWebhooks}
            />

            {isJsonModalOpen && (
                <WebhookJson 
                    data={selectedWebhookForJson}
                    onClose={() => setIsJsonModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Webhook;