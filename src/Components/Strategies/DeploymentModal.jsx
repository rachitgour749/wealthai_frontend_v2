import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { getToken } from '../../utils/tokenManager';
import API_BASE_URL from '../../api/config/apiConfig';
import { showNotification } from '../../store/slices/uiSlice';
import { formatDate } from '../../utils/formatUtils';
import { selectUser } from '../../store/slices/userSlice';
import { fetchAccountDetails } from '../../store/slices/brokerSlice';
import { setCurrentPage, setCurrentTab } from '../../store/slices/navigationSlice';
import { Assets } from '../../assets/Assets';

const DeploymentModal = ({ isOpen, onClose, strategyName, strategyType, userEmail, accumulationWeeks, runId, onDeploy }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const accountDetails = useSelector(state => state.broker.accountDetails);

    // Check if user is a client
    const isClient = user?.role === 'CLIENT';

    const [webhook, setWebhook] = useState(isClient ? 'marketai' : '');
    const [webhooksList, setWebhooksList] = useState([]);
    const [referenceCapital, setReferenceCapital] = useState('100000');
    const [displayReferenceCapital, setDisplayReferenceCapital] = useState('1,00,000');
    const [telegramNotification, setTelegramNotification] = useState(true);
    const [emailNotification, setEmailNotification] = useState(true);
    const [clientInput, setClientInput] = useState('');
    const [clients, setClients] = useState([]);
    const [userCode, setUserCode] = useState('');
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const isInternational = strategyType === 'ETF_US' || strategyType === 'International_ETF_Rotation' || strategyType === 'US_ETF_Swing_Strategy' || strategyType?.includes('International');
    const currencySymbol = isInternational ? '$' : '₹';

    // Format number with Indian comma notation or standard notation
    const formatNumber = (num) => {
        if (!num) return '';
        const number = parseFloat(num);
        if (isNaN(number)) return '';

        if (isInternational) {
            return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
        return number.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    // Fetch webhooks and clients when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('DeploymentModal Open | isClient:', isClient, 'userEmail:', userEmail);
            console.log('Current accountDetails:', accountDetails);

            if (isClient) {
                // Client Logic: Hardcode webhook and use connected broker
                setWebhook('marketai');

                // If account details are missing, fetch them
                if (!accountDetails && userEmail) {
                    console.log('Dispatching fetchAccountDetails for:', userEmail);
                    dispatch(fetchAccountDetails(userEmail));
                }

                // Check for nested data structure (e.g. { status: 'success', data: { ... } })
                const details = accountDetails?.data || accountDetails;

                // Identification of Indian brokers
                const isIndianBroker = ['angelone', 'zerodha', 'kotak', 'dhan', 'aliceblue'].includes(details?.broker_name?.toLowerCase());

                if (details && details.client_id && !(isInternational && isIndianBroker)) {
                    console.log('Setting clients from details:', details);
                    const weeks = parseFloat(accumulationWeeks) || 1;
                    const baseCapital = parseFloat(referenceCapital) || 0;
                    const capitalPerWeek = baseCapital / weeks;

                    setClients([{
                        id: 1,
                        clientId: details.client_id,
                        clientName: details.client_name || 'My Account',
                        broker: details.broker_name,
                        multiple: 1,
                        finalCapital: `${currencySymbol}${formatNumber(capitalPerWeek * 1)}`
                    }]);
                } else {
                    console.warn('accountDetails missing, incomplete, or incompatible (Indian broker for US strategy):', accountDetails);
                    setClients([]);
                }
            } else if (userEmail && !isInternational) {
                // Admin/Broker Logic: Fetch from API
                fetchWebhooksAndClients();
            }
        }
    }, [isOpen, userEmail, strategyType, isInternational, isClient, JSON.stringify(accountDetails), referenceCapital, dispatch]); // Deep dependency on accountDetails

    const fetchWebhooksAndClients = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://tradebe.wealthai1.in/api/tradeai1/webhooks/lookup/${userEmail}/`);
            const data = await response.json();

            console.log('Webhook lookup API response:', data);

            if (data.status === 'success') {
                // Set user_code - try multiple possible field names
                const userCodeValue = data.user_code || data.userCode || data.user_id || data.userId;
                if (userCodeValue) {
                    setUserCode(userCodeValue);
                    console.log('User code set:', userCodeValue);
                } else {
                    console.warn('No user_code found in API response. Available fields:', Object.keys(data));
                }

                // Set webhooks list
                setWebhooksList(data.webhooks || []);

                // Set first webhook as default if available
                if (data.webhooks && data.webhooks.length > 0) {
                    setWebhook(data.webhooks[0].webhook_url);
                }

                // Populate clients table with fetched clients
                if (data.clients && data.clients.length > 0) {
                    const weeks = parseFloat(accumulationWeeks) || 1;
                    const baseCapital = parseFloat(referenceCapital) || 0;
                    const capitalPerWeek = baseCapital / weeks;

                    const fetchedClients = data.clients.map((client, index) => ({
                        id: index + 1,
                        clientId: client.client_id,
                        clientName: client.client_name,
                        broker: client.broker,
                        multiple: 1,
                        finalCapital: `₹${formatNumber(capitalPerWeek * 1)}`
                    }));

                    setClients(fetchedClients);
                }
            }
        } catch (error) {
            console.error('Error fetching webhooks and clients:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const deploymentDate = formatDate(new Date());

    // Handle Reference Capital change with formatting
    const handleReferenceCapitalChange = (e) => {
        const value = e.target.value.replace(/,/g, ''); // Remove existing commas
        if (value === '' || !isNaN(value)) {
            setReferenceCapital(value);
            setDisplayReferenceCapital(value ? formatNumber(value) : '');

            // Recalculate all clients' final capital
            if (clients.length > 0) {
                const weeks = parseFloat(accumulationWeeks) || 1;
                const baseCapital = parseFloat(value) || 0;
                const capitalPerWeek = baseCapital / weeks;

                setClients(clients.map(client => ({
                    ...client,
                    finalCapital: `${currencySymbol}${formatNumber(capitalPerWeek * (client.multiple || 1))}`
                })));
            }
        }
    };

    const handleAddClient = () => {
        if (!clientInput.trim()) return;

        // Check for duplicate client ID
        const isDuplicate = clients.some(
            client => client.clientId.toUpperCase() === clientInput.toUpperCase()
        );

        if (isDuplicate) {
            alert('This client ID already exists in the table!');
            return;
        }

        const weeks = parseFloat(accumulationWeeks) || 1;
        const baseCapital = parseFloat(referenceCapital) || 0;
        const capitalPerWeek = baseCapital / weeks;
        const finalCapital = capitalPerWeek * 1; // multiple = 1 for new client

        const newClient = {
            id: clients.length + 1,
            clientId: clientInput.toUpperCase(),
            multiple: 1,
            finalCapital: `${currencySymbol}${formatNumber(finalCapital)}`
        };

        setClients([...clients, newClient]);
        setClientInput('');
    };

    const handleRemoveClient = (id) => {
        setClients(clients.filter(client => client.id !== id));
    };

    const handleMultipleChange = (id, value) => {
        setClients(clients.map(client => {
            if (client.id === id) {
                // Allow empty string for editing, but use 0 for calculation
                const multiple = value === '' ? 0 : (parseFloat(value) || 0);
                const weeks = parseFloat(accumulationWeeks) || 1;
                const baseCapital = parseFloat(referenceCapital) || 0;
                const capitalPerWeek = baseCapital / weeks;
                const finalCapital = capitalPerWeek * multiple;
                return {
                    ...client,
                    multiple: value === '' ? '' : multiple,
                    finalCapital: `${currencySymbol}${formatNumber(finalCapital)}`
                };
            }
            return client;
        }));
    };

    const handleClientInputChange = (e) => {
        setClientInput(e.target.value.toUpperCase());
    };

    const handleClientFinalCapitalChange = (id, value) => {
        // Remove existing commas and symbols to get raw number
        const rawValue = value.replace(/[^0-9.]/g, '');

        setClients(clients.map(client => {
            if (client.id === id) {
                return {
                    ...client,
                    finalCapital: value // Keep user input as is for display, valid numbers extracted during deploy
                };
            }
            return client;
        }));
    };

    const handleDeploy = async () => {
        // Validation
        if (!runId) {
            dispatch(showNotification({ message: 'Error: Strategy run ID is missing. Please try again.', type: 'error' }));
            return;
        }

        if (!webhook && !isInternational) {
            dispatch(showNotification({ message: 'Please select a webhook before deploying.', type: 'error' }));
            return;
        }

        if (!isInternational && clients.length === 0) {
            dispatch(showNotification({ message: 'Please add at least one client before deploying.', type: 'error' }));
            return;
        }

        if (isInternational && !telegramNotification && !emailNotification) {
            dispatch(showNotification({ message: 'Please enable at least one notification channel (Email or Telegram).', type: 'error' }));
            return;
        }

        setLoading(true);

        try {
            // Transform clients array to client_info object
            // Format: { "SRKH1512": "19230", "SRSH1515": "16230" }
            const clientInfo = {};
            clients.forEach(client => {
                // Remove currency symbol and commas from finalCapital
                const capitalValue = client.finalCapital.replace(/[₹$,]/g, '').trim();
                clientInfo[client.clientId] = capitalValue;
            });

            // Build API payload
            const payload = {
                run_id: runId,
                client_info: clientInfo,
                webhook_url: webhook,
                reference_capital: parseFloat(referenceCapital) || 0,
                email_notification: emailNotification,
                telegram_notification: telegramNotification
            };

            // Add user_code only if available
            if (userCode) {
                payload.user_code = userCode;
            }

            console.log('Deployment payload:', payload);

            // Get authentication token
            const token = getToken();

            // Call deployment API
            const response = await fetch(`${API_BASE_URL}/api/deploy_strategy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', response.headers.get('content-type'));

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response received:', textResponse);
                throw new Error(`Server returned non-JSON response (Status: ${response.status}). Please check the API endpoint.`);
            }

            const data = await response.json();
            console.log('API Response Data:', data);

            // Check if deployment was successful
            if (data.success === true) {
                dispatch(showNotification({ message: 'Strategy deployed successfully!', type: 'success' }));
                // Close modal and trigger refresh
                onDeploy({ success: true, data });
                onClose();
            } else {
                // Deployment failed
                const errorMessage = data.message || data.error || 'Deployment failed. Please try again.';
                dispatch(showNotification({ message: errorMessage, type: 'error' }));
            }
        } catch (error) {
            console.error('Deployment error:', error);
            dispatch(showNotification({ message: `Deployment failed: ${error.message}`, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleExcelImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                // Dynamic import of XLSX
                const XLSX = await import('xlsx');

                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                const weeks = parseFloat(accumulationWeeks) || 1;
                const baseCapital = parseFloat(referenceCapital) || 0;
                const capitalPerWeek = baseCapital / weeks;

                const newClients = [];
                const duplicates = [];
                const existingClientIds = clients.map(c => c.clientId.toUpperCase());

                jsonData.forEach((row) => {
                    const clientId = (row['Client ID'] || row['client_id'] || row['CLIENT_ID'] || '').toString().trim().toUpperCase();
                    const multiple = parseFloat(row['Multiple'] || row['multiple'] || 1) || 1;

                    if (clientId) {
                        // Check if client ID already exists in current table or in the new batch
                        if (existingClientIds.includes(clientId) || newClients.some(c => c.clientId === clientId)) {
                            duplicates.push(clientId);
                        } else {
                            const finalCapital = capitalPerWeek * multiple;
                            newClients.push({
                                id: clients.length + newClients.length + 1,
                                clientId: clientId,
                                multiple: multiple,
                                finalCapital: `${currencySymbol}${formatNumber(finalCapital)}`
                            });
                        }
                    }
                });

                if (duplicates.length > 0) {
                    alert(`The following client IDs already exist and were skipped:\n${duplicates.join(', ')}`);
                }

                if (newClients.length > 0) {
                    setClients([...clients, ...newClients]);
                }

                // Reset file input
                e.target.value = '';
            } catch (error) {
                console.error('Error reading Excel file:', error);
                alert('Error reading Excel file. Please ensure it has columns: "Client ID" and "Multiple"');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 px-6 py-3 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-white">{strategyName || 'New ETF TEST'}</h2>
                    <div className="text-right">
                        <p className="text-white/90 text-xs">Email: {userEmail}</p>
                        <p className="text-white/90 text-xs">Deployment Date: {deploymentDate}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Section */}
                        <div className="space-y-4">
                            {/* Webhook or Coming Soon */}
                            {!isInternational && !isClient ? (
                                <div>
                                    <label className="block text-gray-600 text-sm font-medium mb-[2px]">
                                        Webhook
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list="webhook-options"
                                            value={webhook}
                                            onChange={(e) => setWebhook(e.target.value)}
                                            placeholder={loading ? 'Loading webhooks...' : 'Select or Enter Webhook URL'}
                                            className="w-full px-3 py-1 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-500 text-sm"
                                            disabled={loading}
                                        />
                                        <datalist id="webhook-options">
                                            {webhooksList.map((wh, index) => (
                                                <option key={index} value={wh.webhook_url} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                            ) : null}

                            {/* Reference Capital - Hide for Client */}
                            {!isClient && (
                                <div>
                                    <label className="block text-gray-600 text-sm font-medium mb-[2px]">
                                        Reference Capital
                                    </label>
                                    <input
                                        type="text"
                                        value={displayReferenceCapital}
                                        onChange={handleReferenceCapitalChange}
                                        placeholder={`${currencySymbol}100,000`}
                                        className="w-full px-3 py-1 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-500 text-sm"
                                    />
                                </div>
                            )}

                            {/* Notification Settings */}
                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-[2px]">
                                    Notification Settings
                                </label>
                                <div className="space-y-1.5">
                                    {/* <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={telegramNotification}
                                            onChange={(e) => setTelegramNotification(e.target.checked)}
                                            className="w-4 h-4 text-wealth-600 border-gray-300 rounded focus:ring-wealth-500"
                                        />
                                        <span className="text-sm text-gray-700">Telegram Notification</span>
                                    </label> */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailNotification}
                                            onChange={(e) => setEmailNotification(e.target.checked)}
                                            className="w-4 h-4 text-wealth-600 border-gray-300 rounded focus:ring-wealth-500"
                                        />
                                        <span className="text-sm text-gray-700">Email Notification</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Client ID Management */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-gray-600 text-sm font-medium">
                                    {isClient ? 'Connected Broker Account' : 'Client ID'}
                                </label>
                                {isClient && (
                                    <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">
                                        Active
                                    </span>
                                )}
                            </div>

                            {!isClient && (
                                <div className="flex items-center justify-between mb-3 mt-[-3px]">
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            value={clientInput}
                                            onChange={handleClientInputChange}
                                            placeholder="ENTER CLIENT ID"
                                            className="w-full h-7 px-3 py-1 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-500 text-[12px]"
                                        />
                                        <button
                                            onClick={handleAddClient}
                                            className="h-7 w-7 bg-green-600 hover:bg-green-700 text-white p-1 rounded-[5px] transition-colors"
                                            title="Add Client"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        {!isInternational && (
                                            <>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-[5px] transition-colors"
                                                    title="Import"
                                                >
                                                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </button>
                                                {/* Hidden file input for Excel import */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={handleExcelImport}
                                                    style={{ display: 'none' }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show Configure Broker button if client has no broker account */}
                            {isClient && clients.length === 0 ? (
                                <div className="border border-gray-300 rounded-[5px] overflow-hidden mt-2 bg-gray-50 p-2">
                                    {isInternational ? (
                                        <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                            {/* Header */}
                                            <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    <span className="text-white text-[11px] font-semibold tracking-wide">SIGNAL MODE</span>
                                                </div>
                                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Active</span>
                                            </div>
                                            {/* Body */}
                                            <div className="bg-white px-4 py-3 flex items-center gap-4">
                                                <p className="text-[11px] text-slate-500 leading-relaxed flex-1">
                                                    Live trade signals will be sent to your registered channels instantly whenever market conditions are triggered.
                                                </p>
                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 min-w-[110px]">
                                                        <svg className="w-3 h-3 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        <span className="text-[10.5px] font-medium text-slate-700 flex-1">Email</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 min-w-[110px]">
                                                        <svg className="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.03 9.568c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.893.653z" /></svg>
                                                        <span className="text-[10.5px] font-medium text-slate-700 flex-1">Telegram</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Footer */}
                                            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center gap-1.5">
                                                <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-[10px] text-slate-400">Auto-execution via <strong className="text-slate-500">Stockal</strong> broker is coming soon — one-click order placement in your US brokerage account.</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="text-center">
                                                <p className="text-gray-600 text-sm mb-2">No broker account configured</p>
                                                <p className="text-gray-500 text-xs">Please configure your broker account to deploy strategies</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    dispatch(setCurrentPage('MarketsAi1'));
                                                    dispatch(setCurrentTab('AddBroker'));
                                                }}
                                                className="px-6 py-2 bg-wealth-800 hover:bg-wealth-900 text-white rounded-[5px] transition-colors font-medium text-sm flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Configure Broker Account
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-gray-300 rounded-[5px] overflow-hidden mt-2">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-300">
                                            <tr>
                                                {/* Broker Icon Header - Client Only */}
                                                {isClient && (
                                                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">
                                                        BROKER ICON
                                                    </th>
                                                )}

                                                {/* S.NO / BROKER NAME Header */}
                                                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">
                                                    {isClient ? 'BROKER NAME' : 'S.NO.'}
                                                </th>

                                                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">CLIENT ID</th>
                                                {!isClient && <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">MULTIPLE</th>}

                                                {/* Capital Header */}
                                                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">
                                                    {isClient
                                                        ? (['ETF_Rotation', 'International_ETF_Rotation', 'Stock_Rotation', 'ETF_Payout'].includes(strategyType)
                                                            ? 'CAPITAL PER WEEK'
                                                            : 'TOTAL CAPITAL')
                                                        : 'FINAL CAPITAL'}
                                                </th>

                                                {!isClient && <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">DELETE</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300 bg-white">
                                            {clients.map((client, index) => (
                                                <tr key={client.id} className="hover:bg-gray-50">
                                                    {/* Broker Icon Column - Client Only */}
                                                    {isClient && (
                                                        <td className="px-4 py-1.5 text-center">
                                                            <div className="flex items-center justify-center">
                                                                {client.broker?.toLowerCase().includes('angel') ? (
                                                                    <img src={Assets.angelone} alt="AngelOne" className="h-6 w-6 object-contain" />
                                                                ) : client.broker?.toLowerCase().includes('zerodha') ? (
                                                                    <img src={Assets.zerodha} alt="Zerodha" className="h-8 w-8 border border-gray-300 rounded-[8px] bg-slate-200/30 p-1 object-contain" />
                                                                ) : client.broker?.toLowerCase().includes('kotak') ? (
                                                                    <img src={Assets.kotak} alt="Kotak" className="h-6 w-6 object-contain" />
                                                                ) : client.broker?.toLowerCase().includes('dhan') ? (
                                                                    <img src={Assets.dhan} alt="Dhan" className="h-6 w-6 object-contain" />
                                                                ) : (
                                                                    <span className="text-xs font-bold text-gray-600">-</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}

                                                    {/* S.NO / Broker Name Column */}
                                                    <td className="px-4 py-1.5 text-gray-700 text-center">
                                                        {isClient ? (
                                                            <span className="font-medium text-gray-800">{client.broker || 'Unknown'}</span>
                                                        ) : (
                                                            index + 1
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-1.5 text-gray-700 font-medium text-center">{client.clientId}</td>

                                                    {/* Multiple Column - Admin Only */}
                                                    {!isClient && (
                                                        <td className="px-4 py-1.5">
                                                            <div className="flex justify-center items-center">
                                                                <input
                                                                    type="number"
                                                                    value={client.multiple}
                                                                    onChange={(e) => handleMultipleChange(client.id, e.target.value)}
                                                                    className="w-16 flex justify-center items-center px-1 py-[1px] border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-wealth-500 text-center text-sm"
                                                                    step="0.1"
                                                                />
                                                            </div>
                                                        </td>
                                                    )}

                                                    {/* Final Capital / Capital Per Week - Editable for Client */}
                                                    <td className="px-4 py-1.5 text-center">
                                                        {isClient ? (
                                                            <input
                                                                type="text"
                                                                value={client.finalCapital}
                                                                onChange={(e) => handleClientFinalCapitalChange(client.id, e.target.value)}
                                                                className="w-28 px-2 py-1 text-center font-semibold text-green-600 border border-gray-300 rounded focus:ring-wealth-500 focus:border-wealth-500"
                                                            />
                                                        ) : (
                                                            <span className="text-green-600 font-semibold">{client.finalCapital}</span>
                                                        )}
                                                    </td>

                                                    {/* Delete Column - Admin Only */}
                                                    {!isClient && (
                                                        <td className="px-4 py-1.5 text-center">
                                                            <button
                                                                onClick={() => handleRemoveClient(client.id)}
                                                                className={`transition-colors text-red-500 hover:text-red-700`}
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-1 border border-gray-300 text-gray-700 rounded-[5px] hover:bg-gray-100 transition-colors font-medium text-[13px]"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDeploy}
                        disabled={loading || (isInternational ? !(telegramNotification || emailNotification) : clients.length === 0)}
                        className={`px-5 py-1 rounded-[5px] transition-colors font-medium text-[13px] flex items-center gap-2 ${loading || (isInternational ? !(telegramNotification || emailNotification) : clients.length === 0)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-wealth-800 hover:bg-wealth-900'
                            } text-white`}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Deploying...' : 'Save Deployment'}
                    </button>
                </div>
            </div >
        </div >
    );
};

export default DeploymentModal;
