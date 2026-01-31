import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Trash2 } from 'lucide-react';
import { getToken } from '../../utils/tokenManager';
import API_BASE_URL from '../../api/config/apiConfig';
import { showNotification } from '../../store/slices/uiSlice';

const DeploymentModal = ({ isOpen, onClose, strategyName, strategyType, userEmail, accumulationWeeks, runId, onDeploy }) => {
    const dispatch = useDispatch();
    const [webhook, setWebhook] = useState('');
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

    const isInternational = strategyType === 'ETF_US' || strategyType === 'International_ETF_Rotation' || strategyType?.includes('International');

    // Fetch webhooks and clients when modal opens
    useEffect(() => {
        if (isOpen && userEmail && !isInternational) {
            fetchWebhooksAndClients();
        }
    }, [isOpen, userEmail, strategyType, isInternational]);

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
                        finalCapital: `₹${formatIndianNumber(capitalPerWeek * 1)}`
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

    const deploymentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-');

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

    const currencySymbol = isInternational ? '$' : '₹';

    // Handle Reference Capital change with formatting
    const handleReferenceCapitalChange = (e) => {
        const value = e.target.value.replace(/,/g, ''); // Remove existing commas
        if (value === '' || !isNaN(value)) {
            setReferenceCapital(value);
            setDisplayReferenceCapital(value ? formatIndianNumber(value) : '');

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

        if (clients.length === 0) {
            dispatch(showNotification({ message: 'Please add at least one client before deploying.', type: 'error' }));
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
                            {isInternational ? (
                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                    <h3 className="text-blue-900 text-sm font-bold uppercase tracking-wider mb-2">Auto-Deployment Coming Soon</h3>
                                    <p className="text-blue-800/80 text-[12px] leading-relaxed">
                                        We are integrating with <strong>Stockal</strong> broker for seamless, one-click trading in the US market. Stay tuned for real-time order execution!
                                    </p>
                                </div>
                            ) : (
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
                            )}

                            {/* Reference Capital */}
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

                            {/* Notification Settings */}
                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-[2px]">
                                    Notification Settings
                                </label>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={telegramNotification}
                                            onChange={(e) => setTelegramNotification(e.target.checked)}
                                            className="w-4 h-4 text-wealth-600 border-gray-300 rounded focus:ring-wealth-500"
                                        />
                                        <span className="text-sm text-gray-700">Telegram Notification</span>
                                    </label>
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
                            <label className="text-gray-600 text-sm font-medium">
                                Client ID
                            </label>
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

                            {/* Client Table */}
                            <div className="border border-gray-300 rounded-[5px] overflow-hidden mt-2">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 border-b border-gray-300">
                                        <tr>
                                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">S.NO.</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">CLIENT ID</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">MULTIPLE</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">FINAL CAPITAL</th>
                                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-700 uppercase">DELETE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-300 bg-white">
                                        {clients.map((client, index) => (
                                            <tr key={client.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-1.5 text-gray-700 text-center">{index + 1}</td>
                                                <td className="px-4 py-1.5 text-gray-700 font-medium text-center">{client.clientId}</td>
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
                                                <td className="px-4 py-1.5 text-green-600 font-semibold text-center">{client.finalCapital}</td>
                                                <td className="px-4 py-1.5 text-center">
                                                    <button
                                                        onClick={() => handleRemoveClient(client.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                        disabled={loading || clients.length === 0}
                        className={`px-5 py-1 rounded-[5px] transition-colors font-medium text-[13px] flex items-center gap-2 ${loading || clients.length === 0
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
            </div>
        </div>
    );
};

export default DeploymentModal;
