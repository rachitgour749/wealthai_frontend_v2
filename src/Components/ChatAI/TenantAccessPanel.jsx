import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/config/axiosInstance';
import { API_ENDPOINTS } from '../../api/config/apiConfig';
import { Users, Plus, Trash2, RefreshCw, X, ChevronDown, AlertTriangle, Check } from 'lucide-react';

const TenantAccessPanel = ({ isOpen, onClose, adminKey, onAuthError }) => {
    const [mappings, setMappings] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Form state
    const [formEmail, setFormEmail] = useState('');
    const [formName, setFormName] = useState('');
    const [formStore, setFormStore] = useState('');
    const [formStatus, setFormStatus] = useState('active');

    const headers = { 'x-admin-key': adminKey };

    // Helper to extract error message from axios interceptor's rewritten error
    const getErrorMsg = (err, fallback) => {
        return err?.data?.detail || err?.response?.data?.detail || err?.message || fallback;
    };

    const fetchMappings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ACCESS, { headers });
            setMappings(res.data.mappings || []);
        } catch (err) {
            if (err?.status === 401 && onAuthError) { onAuthError(); return; }
            setError(getErrorMsg(err, 'Failed to fetch mappings'));
        } finally {
            setLoading(false);
        }
    }, [adminKey]);

    const fetchStores = useCallback(async () => {
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_STORES, { headers });
            setStores(res.data.stores || []);
        } catch (err) {
            console.error('Failed to fetch stores:', err);
        }
    }, [adminKey]);

    useEffect(() => {
        if (isOpen && adminKey) {
            fetchMappings();
            fetchStores();
        }
    }, [isOpen, adminKey]);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    const handleGrant = async (e) => {
        e.preventDefault();
        if (!formEmail || !formName || !formStore) return;
        setError('');
        try {
            const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_ACCESS, {
                email: formEmail, name: formName, file_search_store: formStore, status: formStatus
            }, { headers });
            setSuccess(res.data.message);
            setShowAddForm(false);
            setFormEmail(''); setFormName(''); setFormStore(''); setFormStatus('active');
            fetchMappings();
        } catch (err) {
            setError(getErrorMsg(err, 'Failed to grant access'));
        }
    };

    const handleRevoke = async (email) => {
        setError('');
        try {
            const res = await axiosInstance.delete(API_ENDPOINTS.ADMIN_ACCESS_REVOKE(email), { headers });
            setSuccess(res.data.message);
            setDeleteConfirm(null);
            fetchMappings();
        } catch (err) {
            setError(getErrorMsg(err, 'Failed to revoke'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-[#0d2626] border-l border-[#1a4040] shadow-2xl flex flex-col h-full animate-slide-in-right">
                {/* Header */}
                <div className="p-4 border-b border-[#1a4040] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e6ae5b] to-[#c4912e] flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#0d2626]" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Tenant Access</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowAddForm(true)} className="px-3 py-1.5 bg-gradient-to-r from-[#e6ae5b] to-[#c4912e] text-[#0d2626] text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Grant
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Alerts */}
                <div className="px-4 pt-2 flex-shrink-0">
                    {error && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {error}
                            <button onClick={() => setError('')} className="ml-auto"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {success && (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 mb-2">
                            <Check className="w-3 h-3" /> {success}
                        </div>
                    )}
                </div>

                {/* Mappings List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {loading ? (
                        <div className="text-center text-gray-400 mt-12">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><span className="text-sm">Loading...</span>
                        </div>
                    ) : mappings.length === 0 ? (
                        <div className="text-center text-gray-500 mt-12 text-sm">No access mappings. Click "Grant" to add one.</div>
                    ) : (
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">{mappings.length} mappings</span>
                                <button onClick={fetchMappings} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Refresh
                                </button>
                            </div>
                            {mappings.map((m, i) => (
                                <div key={m.email || i} className="p-3 rounded-lg bg-[#0a1a1a]/60 border border-[#1a4040]/50 hover:border-[#2a5050] transition-colors group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white font-medium">{m.name}</span>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${m.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    m.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>{m.status}</span>
                                        </div>
                                        {deleteConfirm === m.email ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleRevoke(m.email)} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30">Revoke</button>
                                                <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-[10px]">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirm(m.email)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">{m.email}</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1 truncate" title={m.file_search_store}>{m.file_search_store || 'No store assigned'}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{m.docs_synced} docs synced</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grant Access Form */}
                {showAddForm && (
                    <div className="absolute inset-0 bg-[#0d2626]/95 z-10 flex flex-col">
                        <div className="p-4 border-b border-[#1a4040] flex items-center justify-between">
                            <h3 className="text-white font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-[#e6ae5b]" /> Grant Access</h3>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleGrant} className="p-4 space-y-4 flex-1">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Email</label>
                                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required placeholder="user@example.com"
                                    className="w-full px-3 py-2 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Name</label>
                                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="User Name"
                                    className="w-full px-3 py-2 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Store</label>
                                <div className="relative">
                                    <select value={formStore} onChange={(e) => setFormStore(e.target.value)} required
                                        className="w-full px-3 py-2 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm appearance-none focus:outline-none focus:border-[#e6ae5b]">
                                        <option value="">Select store...</option>
                                        {stores.map(s => <option key={s.name} value={s.name}>{s.display_name} ({s.doc_count} docs)</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Status</label>
                                <div className="flex gap-2">
                                    {['active', 'pending', 'inactive'].map(s => (
                                        <button key={s} type="button" onClick={() => setFormStatus(s)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formStatus === s ? 'bg-[#e6ae5b] text-[#0d2626]' : 'bg-[#1a3535] text-gray-400 hover:bg-[#1f4040]'}`}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 bg-[#1a3535] border border-[#2a5050] rounded-lg text-gray-300 text-sm hover:bg-[#1f4040]">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-[#e6ae5b] to-[#c4912e] text-[#0d2626] font-bold text-sm rounded-lg hover:opacity-90">Grant Access</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default TenantAccessPanel;
