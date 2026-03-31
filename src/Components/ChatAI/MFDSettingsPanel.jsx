import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/config/axiosInstance';
import { API_ENDPOINTS } from '../../api/config/apiConfig';
import {
    X, Database, RefreshCw, Check, AlertTriangle, Link, Play,
    ChevronRight, ExternalLink, Plus, Loader2, Cloud, Settings
} from 'lucide-react';

const STEPS = {
    STORE: 0,
    ZOHO: 1,
    SYNC: 2,
};

const MFDSettingsPanel = ({ isOpen, onClose, userEmail }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(STEPS.STORE);

    // Store creation
    const [storeName, setStoreName] = useState('');
    const [creatingStore, setCreatingStore] = useState(false);

    // Zoho connection
    const [zohoClientId, setZohoClientId] = useState('');
    const [zohoClientSecret, setZohoClientSecret] = useState('');
    const [zohoDomain, setZohoDomain] = useState('https://accounts.zoho.in');
    const [zohoCode, setZohoCode] = useState('');
    const [connectingZoho, setConnectingZoho] = useState(false);
    const [exchangingCode, setExchangingCode] = useState(false);
    const [authUrl, setAuthUrl] = useState('');

    // Sync
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [pollId, setPollId] = useState(null);

    const headers = { 'x-user-email': userEmail };

    const fetchProfile = useCallback(async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.MFD_PROFILE, { headers });
            setProfile(res.data);
            // Auto-select the right step
            if (!res.data.store?.id) setActiveStep(STEPS.STORE);
            else if (!res.data.zoho?.connected) setActiveStep(STEPS.ZOHO);
            else setActiveStep(STEPS.SYNC);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        if (isOpen && userEmail) {
            fetchProfile();
            setError('');
            setSuccess('');
        }
    }, [isOpen, userEmail]);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 4000);
            return () => clearTimeout(t);
        }
    }, [success]);

    // Poll sync status
    useEffect(() => {
        return () => { if (pollId) clearInterval(pollId); };
    }, [pollId]);

    const handleCreateStore = async () => {
        if (!storeName.trim()) { setError('Enter a store name'); return; }
        setCreatingStore(true);
        setError('');
        try {
            const res = await axiosInstance.post(API_ENDPOINTS.MFD_STORE_CREATE,
                { display_name: storeName.trim() }, { headers });
            setSuccess(res.data.message);
            fetchProfile();
            setActiveStep(STEPS.ZOHO);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create store');
        } finally {
            setCreatingStore(false);
        }
    };

    const handleConnectZoho = async () => {
        if (!zohoClientId || !zohoClientSecret) {
            setError('Client ID and Client Secret are required');
            return;
        }
        setConnectingZoho(true);
        setError('');
        try {
            const res = await axiosInstance.post(API_ENDPOINTS.MFD_ZOHO_CONNECT, {
                client_id: zohoClientId,
                client_secret: zohoClientSecret,
                zoho_domain: zohoDomain,
                redirect_uri: `${window.location.origin}/zoho-callback`,
            }, { headers });
            setAuthUrl(res.data.auth_url);
            setSuccess('Credentials saved! Click "Authorize with Zoho" to continue.');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save Zoho credentials');
        } finally {
            setConnectingZoho(false);
        }
    };

    const handleExchangeCode = async () => {
        if (!zohoCode.trim()) { setError('Paste the authorization code'); return; }
        setExchangingCode(true);
        setError('');
        try {
            const res = await axiosInstance.post(API_ENDPOINTS.MFD_ZOHO_CALLBACK,
                { code: zohoCode.trim() }, { headers });
            setSuccess(res.data.message);
            setZohoCode('');
            setAuthUrl('');
            fetchProfile();
            setActiveStep(STEPS.SYNC);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to exchange code');
        } finally {
            setExchangingCode(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setError('');
        try {
            const res = await axiosInstance.post(API_ENDPOINTS.MFD_ZOHO_SYNC,
                { module: 'Contacts' }, { headers });
            setSuccess(res.data.message);

            // Start polling status
            const id = setInterval(async () => {
                try {
                    const statusRes = await axiosInstance.get(API_ENDPOINTS.MFD_ZOHO_STATUS, { headers });
                    setSyncStatus(statusRes.data);
                    if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
                        clearInterval(id);
                        setSyncing(false);
                        fetchProfile();
                        if (statusRes.data.status === 'completed') {
                            setSuccess(`Sync complete! ${statusRes.data.records_synced || 0} contacts synced.`);
                        } else {
                            setError(`Sync failed: ${statusRes.data.error || 'Unknown error'}`);
                        }
                    }
                } catch (e) { /* ignore poll errors */ }
            }, 3000);
            setPollId(id);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to start sync');
            setSyncing(false);
        }
    };

    if (!isOpen) return null;

    const storeExists = !!profile?.store?.id;
    const zohoConnected = !!profile?.zoho?.connected;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-[#0d2626] border-l border-[#1a4040] shadow-2xl flex flex-col h-full animate-slide-in-right">

                {/* Header */}
                <div className="p-4 border-b border-[#1a4040] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e6ae5b] to-[#c4863a] flex items-center justify-center">
                            <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Data & Integrations</h2>
                            <p className="text-[10px] text-gray-500">{userEmail}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
                </div>

                {/* Alerts */}
                <div className="px-4 pt-3 flex-shrink-0">
                    {error && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                            <button onClick={() => setError('')} className="ml-auto"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {success && (
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 mb-2">
                            <Check className="w-3.5 h-3.5" /> {success}
                        </div>
                    )}
                </div>

                {/* Stepper */}
                <div className="px-4 py-3 flex-shrink-0 border-b border-[#1a4040]">
                    <div className="flex items-center gap-1">
                        {[
                            { step: STEPS.STORE, label: 'Store', icon: Database, done: storeExists },
                            { step: STEPS.ZOHO, label: 'Zoho CRM', icon: Link, done: zohoConnected },
                            { step: STEPS.SYNC, label: 'Sync', icon: RefreshCw, done: !!profile?.last_sync },
                        ].map(({ step, label, icon: Icon, done }, i) => (
                            <React.Fragment key={step}>
                                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600 mx-1" />}
                                <button
                                    onClick={() => setActiveStep(step)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        ${activeStep === step
                                            ? 'bg-[#e6ae5b]/20 text-[#e6ae5b] border border-[#e6ae5b]/30'
                                            : done
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-[#0a1a1a] text-gray-500 border border-[#1a4040]'
                                        }`}
                                >
                                    {done && activeStep !== step ? (
                                        <Check className="w-3 h-3" />
                                    ) : (
                                        <Icon className="w-3 h-3" />
                                    )}
                                    {label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {loading ? (
                        <div className="text-center text-gray-400 mt-16">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <span className="text-sm">Loading profile...</span>
                        </div>
                    ) : (
                        <>
                            {/* STEP 1: Store */}
                            {activeStep === STEPS.STORE && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-1">File Search Store</h3>
                                        <p className="text-xs text-gray-400">
                                            Create a dedicated store to hold your client data. This store powers AI-driven queries about your clients.
                                        </p>
                                    </div>

                                    {storeExists ? (
                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Check className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-400">Store Active</span>
                                            </div>
                                            <div className="space-y-1.5 text-xs">
                                                <p className="text-gray-300"><span className="text-gray-500">Name:</span> {profile?.store?.display_name || 'Your Store'}</p>
                                                <p className="text-gray-300"><span className="text-gray-500">ID:</span> <code className="text-[10px] text-gray-500">{profile?.store?.id}</code></p>
                                                <p className="text-gray-300"><span className="text-gray-500">Documents:</span> {profile?.store?.doc_count || 0}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Store Display Name</label>
                                                <input
                                                    type="text"
                                                    value={storeName}
                                                    onChange={(e) => setStoreName(e.target.value)}
                                                    placeholder="e.g., Client Data - Your Company"
                                                    className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b] transition-colors"
                                                />
                                            </div>
                                            <button
                                                onClick={handleCreateStore}
                                                disabled={creatingStore}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#e6ae5b] to-[#c4863a] text-[#0d2626] font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {creatingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Create Store
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Zoho CRM */}
                            {activeStep === STEPS.ZOHO && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-1">Connect Zoho CRM</h3>
                                        <p className="text-xs text-gray-400">
                                            Link your Zoho CRM to sync contacts into your store. You need a Zoho API Client (Self Client or Server-based).
                                        </p>
                                    </div>

                                    {!storeExists && (
                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                                            Create a File Search Store first before connecting Zoho.
                                        </div>
                                    )}

                                    {zohoConnected ? (
                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Check className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-400">Zoho CRM Connected</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Your Zoho CRM is linked. You can sync contacts from the Sync tab.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Zoho Domain */}
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Zoho Domain</label>
                                                <select
                                                    value={zohoDomain}
                                                    onChange={(e) => setZohoDomain(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm appearance-none focus:outline-none focus:border-[#e6ae5b]"
                                                >
                                                    <option value="https://accounts.zoho.in">India (.in)</option>
                                                    <option value="https://accounts.zoho.com">US (.com)</option>
                                                    <option value="https://accounts.zoho.eu">EU (.eu)</option>
                                                    <option value="https://accounts.zoho.com.au">AU (.com.au)</option>
                                                </select>
                                            </div>

                                            {/* Client ID */}
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Client ID</label>
                                                <input
                                                    type="text"
                                                    value={zohoClientId}
                                                    onChange={(e) => setZohoClientId(e.target.value)}
                                                    placeholder="1000.XXXXXXXXXXXXXXX"
                                                    className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b] transition-colors"
                                                />
                                            </div>

                                            {/* Client Secret */}
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Client Secret</label>
                                                <input
                                                    type="password"
                                                    value={zohoClientSecret}
                                                    onChange={(e) => setZohoClientSecret(e.target.value)}
                                                    placeholder="xxxxxxxxxxxxxx"
                                                    className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b] transition-colors"
                                                />
                                            </div>

                                            <button
                                                onClick={handleConnectZoho}
                                                disabled={connectingZoho || !storeExists}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5bc4e6] to-[#2a8ab0] text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {connectingZoho ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                                                Save & Generate Auth URL
                                            </button>

                                            {/* Auth URL + Code Exchange */}
                                            {authUrl && (
                                                <div className="space-y-3 pt-2 border-t border-[#1a4040]">
                                                    <div className="p-3 rounded-lg bg-[#0a1a1a] border border-[#1a4040]">
                                                        <p className="text-xs text-gray-400 mb-2">
                                                            <strong className="text-white">Step 1:</strong> Click below to authorize with Zoho. After authorizing, you'll be redirected. Copy the <code className="text-[#e6ae5b]">code</code> parameter from the redirect URL.
                                                        </p>
                                                        <a
                                                            href={authUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e6ae5b]/20 text-[#e6ae5b] rounded-lg text-xs font-medium hover:bg-[#e6ae5b]/30 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Authorize with Zoho
                                                        </a>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">
                                                            <strong className="text-white">Step 2:</strong> Paste the authorization code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={zohoCode}
                                                            onChange={(e) => setZohoCode(e.target.value)}
                                                            placeholder="1000.xxxxxxx.xxxxxxx"
                                                            className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#e6ae5b] transition-colors"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleExchangeCode}
                                                        disabled={exchangingCode}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                                    >
                                                        {exchangingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                        Connect Zoho CRM
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Help Link */}
                                    <div className="pt-2">
                                        <a
                                            href="https://www.zoho.com/crm/developer/docs/api/v8/register-client.html"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-gray-500 hover:text-gray-400 flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> How to create a Zoho API Client
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Sync */}
                            {activeStep === STEPS.SYNC && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-1">Sync Contacts</h3>
                                        <p className="text-xs text-gray-400">
                                            Pull contacts from Zoho CRM and upload them into your File Search Store. After syncing, you can query your client data in the chat.
                                        </p>
                                    </div>

                                    {!storeExists && (
                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                                            Create a File Search Store first.
                                        </div>
                                    )}
                                    {storeExists && !zohoConnected && (
                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                                            Connect Zoho CRM first before syncing.
                                        </div>
                                    )}

                                    {storeExists && zohoConnected && (
                                        <>
                                            {/* Store Info */}
                                            <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4040]">
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-gray-500">Store</span>
                                                        <p className="text-white font-medium truncate">{profile?.store?.display_name || 'Your Store'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Documents</span>
                                                        <p className="text-white font-medium">{profile?.store?.doc_count || 0}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Last Sync</span>
                                                        <p className="text-white font-medium">
                                                            {profile?.last_sync
                                                                ? new Date(profile.last_sync).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                                : 'Never'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Zoho</span>
                                                        <p className="text-emerald-400 font-medium">Connected</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sync Button */}
                                            <button
                                                onClick={handleSync}
                                                disabled={syncing}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e6ae5b] to-[#c4863a] text-[#0d2626] font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {syncing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Syncing Contacts...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Sync Contacts from Zoho
                                                    </>
                                                )}
                                            </button>

                                            {/* Sync Progress */}
                                            {syncStatus && (syncing || syncStatus.status === 'completed' || syncStatus.status === 'failed') && (
                                                <div className={`p-3 rounded-xl border ${syncStatus.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                                        syncStatus.status === 'failed' ? 'bg-red-500/5 border-red-500/20' :
                                                            'bg-[#0a1a1a] border-[#1a4040]'
                                                    }`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {syncStatus.status === 'in_progress' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e6ae5b]" />}
                                                        {syncStatus.status === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                        {syncStatus.status === 'failed' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                                                        <span className={`text-xs font-medium ${syncStatus.status === 'completed' ? 'text-emerald-400' :
                                                                syncStatus.status === 'failed' ? 'text-red-400' :
                                                                    'text-[#e6ae5b]'
                                                            }`}>
                                                            {syncStatus.status === 'in_progress' ? 'Syncing...' :
                                                                syncStatus.status === 'completed' ? 'Sync Complete' : 'Sync Failed'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                                                        <div>
                                                            <span className="text-gray-500">Fetched</span>
                                                            <p className="text-white font-medium">{syncStatus.records_fetched || 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Synced</span>
                                                            <p className="text-emerald-400 font-medium">{syncStatus.records_synced || 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Failed</span>
                                                            <p className="text-red-400 font-medium">{syncStatus.records_failed || 0}</p>
                                                        </div>
                                                    </div>
                                                    {syncStatus.errors?.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-[#1a4040]">
                                                            <p className="text-[10px] text-gray-500 mb-1">Errors:</p>
                                                            {syncStatus.errors.slice(-3).map((e, i) => (
                                                                <p key={i} className="text-[10px] text-red-400/70 truncate">{e}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
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

export default MFDSettingsPanel;
