import React, { useState, useEffect, useMemo } from 'react';
import { Button, Typography, message, Modal, Spin } from 'antd';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import ClientForm from './ClientForm';
import { brokerService, loginBroker, reconnectBroker, storeBrokerSession, saveLocalBrokerCredentials, getLocalBrokerCredentials } from '../../api/services/brokerService';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateBrokerConnectionStatus,
    selectIsBrokerConnected,
    selectIsExpired,
    selectHasSavedCredentials,
    selectActiveBroker,
    setSavedCredentials
} from '../../store/slices/brokerSlice';
import { selectUserEmail } from '../../store/slices/userSlice';
import { setCurrentTab } from '../../store/slices/navigationSlice';

const { Text, Title } = Typography;

const commonFields = [
    { label: "Client ID", field: "Client ID", placeHolder: "client id", value: "text" },
    { label: "Client Name", field: "ClientName", placeHolder: "client name", value: "text", isMandatory: false },
    { label: "Api Key", field: "apiKey", placeHolder: "api key", value: "text" },
];

const additionalCommonFields = [
    { label: "Proxy IP", field: "proxy_ip", placeHolder: "proxy ip", value: "text", isMandatory: false },
    { label: "Port", field: "port", placeHolder: "port", value: "text", isMandatory: false },
    { label: "Proxy Username", field: "proxy_username", placeHolder: "proxy username", value: "text", isMandatory: false },
    { label: "Proxy Password", field: "proxy_password", placeHolder: "proxy password", value: "text", isMandatory: false },
];

const lastCommonFields = [
    { label: "Email", field: "email", placeHolder: "email", value: "email", isMandatory: false },
];

const brokerSpecificFields = {
    ZERODHA: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    IIFL: [{ label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" }],
    SMCACE: [
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Password", field: "password", placeHolder: "password", value: "text" },
    ],
    SMC: [{ label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" }],
    MOSWAL: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "DOB", field: "dob", placeHolder: "DDMMYYYY", value: "text" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    FPAISA: [
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "App Name", field: "appName", placeHolder: "app name", value: "text" },
        { label: "App Source", field: "appSource", placeHolder: "app source", value: "text" },
        { label: "Pin", field: "pin", placeHolder: "pin", value: "text" },
        { label: "Encryption Key", field: "encKey", placeHolder: "encryption key", value: "text" },
    ],
    ANGELONE: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    SHAREKHAN: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "password" },
    ],
    ICICI: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret Key", value: "password" },
    ],
    KOTAK: [
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Consumer key", field: "consumerKey", placeHolder: "consumer key", value: "text" },
        { label: "Mobile No.", field: "mobileNumber", placeHolder: "mobile number", value: "tel" },
        { label: "UCC", field: "ucc", placeHolder: "ucc", value: "text" },
        { label: "MPIN", field: "mpin", placeHolder: "mpin", value: "password" },
    ],
    IIFLONT: [
        { label: "Password", field: "password", placeHolder: "password", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    "5 Paisa": [
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "App Name", field: "appName", placeHolder: "app name", value: "text" },
        { label: "App Source", field: "appSource", placeHolder: "app source", value: "text" },
        { label: "Pin", field: "pin", placeHolder: "pin", value: "text" },
        { label: "Encryption Key", field: "encKey", placeHolder: "encryption key", value: "text" },
    ],
};

const createBrokerFields = (broker) => {
    let fields = [...commonFields];
    if (broker === "KOTAK") {
        fields = fields.filter(item => item.field !== "apiKey" && item.field !== "Client ID");
    }
    return [
        ...fields,
        ...(brokerSpecificFields[broker] || []),
        ...lastCommonFields,
        ...additionalCommonFields,
    ];
};

const MenuItems = [
    { key: "ZERODHA", label: "ZERODHA", isComingSoon: false, iconColor: "#0d5d45", logo: "/zerodha_logo.png" },
    { key: "ANGELONE", label: "AngelOne", isComingSoon: false, iconColor: "#22c55e", logo: "/angel_one_logo.webp" },
];

const AddBroker = ({ isOpen, onClose, isInline = false }) => {
    const dispatch = useDispatch();
    const isConnected = useSelector(selectIsBrokerConnected);
    const isExpired = useSelector(selectIsExpired);
    // Use both Redux and LocalStorage for immediate UI sync
    const hasSavedCredentials = useSelector(selectHasSavedCredentials) || localStorage.getItem('wealthai_has_broker') === 'true';
    const activeBroker = useSelector(selectActiveBroker);
    const userEmail = useSelector(selectUserEmail);

    const [selected, setSelected] = useState("ZERODHA");
    const [loading, setLoading] = useState(false);
    const [fieldError, setFieldError] = useState("");
    const [formState, setFormState] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const effectiveIsOpen = isInline || isOpen;
    const fields = useMemo(() => createBrokerFields(selected), [selected]);

    const isComingSoon = useMemo(() => {
        const item = MenuItems.find(i => i.key === selected);
        return item?.isComingSoon || false;
    }, [selected]);

    useEffect(() => {
        if (effectiveIsOpen) {
            setSelected("ZERODHA");
        }
    }, [effectiveIsOpen]);

    useEffect(() => {
        // Pre-fill form with saved credentials if available
        const savedCreds = getLocalBrokerCredentials(selected, userEmail);

        const initialState = fields.reduce((acc, { field }) => {
            // Use saved credential if available, otherwise empty string
            acc[field] = (savedCreds && savedCreds[field]) || "";
            return acc;
        }, {});

        setFormState(initialState);
        setFieldError("");
        checkFormValidity(initialState);
    }, [selected, fields, isOpen, userEmail]);

    const checkFormValidity = (formData) => {
        const isMissingFields = fields
            .filter(f => f.isMandatory !== false)
            .some(f => !formData[f.field] || String(formData[f.field]).trim() === "");
        setIsFormValid(!isMissingFields);
    };

    const handleInputChange = (field, e) => {
        const newValue = e.target.value;
        setFormState(prev => {
            const newState = { ...prev, [field]: newValue };
            checkFormValidity(newState);
            return newState;
        });
    };

    const resetState = () => {
        const initialState = fields.reduce((acc, { field }) => {
            acc[field] = "";
            return acc;
        }, {});
        setFormState(initialState);
        setFieldError("");
        checkFormValidity(initialState);
    };

    const handleSubmit = async (submittedData) => {
        const isMissingFields = fields
            .filter(f => f.isMandatory !== false)
            .some(f => !submittedData[f.field] || String(submittedData[f.field]).trim() === "");

        if (isMissingFields) {
            setFieldError("Please fill in all mandatory fields.");
            message.error("Please fill in all mandatory fields.");
            return;
        }

        // Check if credentials already exist in localStorage
        const existingCreds = getLocalBrokerCredentials(selected, userEmail);
        const isAlreadySaved = existingCreds &&
            existingCreds['Client ID'] === submittedData['Client ID'] &&
            existingCreds['apiKey'] === submittedData['apiKey'];

        if (isAlreadySaved) {
            message.warning('Client already added');

            // Update broker status to show green dot
            dispatch(setSavedCredentials(true));
            dispatch(updateBrokerConnectionStatus());

            // Hide Add Broker tab and redirect to Strategies
            setTimeout(() => {
                dispatch(setCurrentTab('Strategies'));
            }, 1000);
            return;
        }

        // FULFILL USER REQUEST: Save details to cookies/localStorage even before submission
        // This ensures they are persisted even if the backend call fails
        saveLocalBrokerCredentials(selected, submittedData, userEmail);

        setLoading(true);
        try {
            // Transform data for backend if needed
            // Backend expects: user_email, broker_name, api_key, api_secret, username, password, totp_secret
            const payload = {
                user_email: userEmail,
                broker_name: selected.toLowerCase(),
                username: submittedData['Client ID'] || submittedData['username'],
                password: submittedData['password'],
                api_key: submittedData['apiKey'] || submittedData['api_key'],
                api_secret: submittedData['secretKey'] || submittedData['api_secret'],
                totp_secret: submittedData['totp'] || submittedData['totp_secret']
            };

            const response = await loginBroker(payload);

            if (response && response.status === "success") {
                // Save to localStorage
                localStorage.setItem('wealthai_has_broker', 'true');

                storeBrokerSession({
                    token: response.access_token,
                    expire: response.expire,
                    broker_name: response.broker_name,
                    client_id: response.client_id,
                    user_email: response.user_email,
                    credentials: submittedData
                });

                // Update Redux state silently
                dispatch(setSavedCredentials(true));
                dispatch(updateBrokerConnectionStatus());

                // Show success message
                message.success('Client added successfully');

                // Hide Add Broker tab and redirect to Strategies after 1 second
                setTimeout(() => {
                    dispatch(setCurrentTab('Strategies'));
                }, 1000);

            } else {
                // Handle different error scenarios
                const errorMessage = response?.message || "Failed to login. Please check your credentials.";

                // Check if it's a duplicate/already exists error
                if (errorMessage.toLowerCase().includes('already') ||
                    errorMessage.toLowerCase().includes('exists') ||
                    errorMessage.toLowerCase().includes('duplicate')) {
                    message.warning('Client already added');

                    // Hide Add Broker tab
                    setTimeout(() => {
                        dispatch(setCurrentTab('Strategies'));
                    }, 1000);
                } else {
                    message.error(errorMessage);
                }
            }
        } catch (error) {
            console.error("Submission failed:", error);

            // Extract error message from different possible locations
            let errorMsg = "An error occurred. Please try again.";

            if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            // Check if it's a duplicate/already exists error
            if (errorMsg.toLowerCase().includes('already') ||
                errorMsg.toLowerCase().includes('exists') ||
                errorMsg.toLowerCase().includes('duplicate')) {
                message.warning('Client already added');

                // Hide Add Broker tab
                setTimeout(() => {
                    dispatch(setCurrentTab('Strategies'));
                }, 1000);
            } else {
                message.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReconnect = async () => {
        setLoading(true);
        try {
            const response = await reconnectBroker(userEmail, activeBroker || selected.toLowerCase());
            if (response && response.status === "success") {
                message.success(`Reconnected to ${response.broker_name} successfully`);
                storeBrokerSession({
                    token: response.access_token,
                    expire: response.expire,
                    broker_name: response.broker_name,
                    client_id: response.client_id,
                    user_email: response.user_email
                });
                dispatch(updateBrokerConnectionStatus());
                dispatch(setSavedCredentials(true));
            } else {
                message.error("Re-connection failed. Please log in again.");
            }
        } catch (error) {
            console.error("Re-connection error:", error);
            message.error("Failed to reconnect. Please try manual login.");
        } finally {
            setLoading(false);
        }
    };

    const renderConnectionStatus = () => {
        const dotColor = isConnected ? '#22c55e' : (isExpired ? '#ef4444' : '#94a3b8');
        const statusText = isConnected ? 'Connected' : (isExpired ? 'Session Expired' : 'Not Connected');

        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-[#9fddd2]/30 shadow-sm">
                <div className="relative mb-6">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                        style={{ backgroundColor: `${dotColor}20`, border: `4px solid ${dotColor}` }}
                    >
                        {isConnected ? (
                            <CheckCircle2 size={48} color={dotColor} />
                        ) : (
                            <AlertCircle size={48} color={dotColor} />
                        )}
                    </div>
                </div>

                <Title level={3} style={{ color: '#0f3d39', marginBottom: '8px' }}>
                    {activeBroker?.toUpperCase()} Status
                </Title>

                <div className="flex items-center gap-2 mb-8">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dotColor }}></div>
                    <Text strong style={{ color: dotColor, fontSize: '16px' }}>{statusText}</Text>
                </div>

                {!isConnected && (
                    <div className="flex flex-col gap-4 w-full max-w-[300px]">
                        <Button
                            type="primary"
                            icon={<RefreshCw className={loading ? 'animate-spin' : ''} size={18} />}
                            onClick={handleReconnect}
                            loading={loading}
                            className="h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-wealth-700 hover:!bg-wealth-800 border-none shadow-lg shadow-wealth-700/20"
                        >
                            Reconnect Now
                        </Button>
                        <Button
                            onClick={() => dispatch(setSavedCredentials(false))}
                            className="h-12 rounded-xl font-semibold text-wealth-700 border-wealth-700 hover:!text-wealth-800 hover:!border-wealth-800"
                        >
                            Log in with different account
                        </Button>
                    </div>
                )}

                {isConnected && (
                    <Text italic className="text-gray-500">
                        You are all set! Your session is active and valid.
                    </Text>
                )}
            </div>
        );
    };

    const content = (
        <div className={`flex overflow-hidden ${isInline ? 'rounded-xl' : ''} p-4 gap-4`}>
            {/* Left Sidebar */}
            <div className="w-[240px] bg-[#defff3] flex-shrink-0 rounded-xl overflow-hidden border border-[#9fddd2] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                <h3 className="text-[#0f3d39] flex justify-start items-center mt-[12px] pl-[10px] text-[18px] font-bold mb-[5px]">Select Broker</h3>
                <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-1">
                        {MenuItems.map((item) => (
                            <div
                                key={item.key}
                                onClick={() => !item.isComingSoon && setSelected(item.key)}
                                className={`px-3 py-2 cursor-pointer transition-all duration-300 flex items-center gap-3 rounded-lg
                                    ${selected === item.key
                                        ? 'bg-wealth-700 text-white'
                                        : 'text-gray-600 hover:bg-white/50 border border-transparent hover:border-gray-200'}
                                    ${item.isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="flex-shrink-0 overflow-hidden rounded-lg w-8 h-8 flex items-center justify-center font-bold text-[12px] shadow-sm bg-white/20 border-2 border-white/60">
                                    {item.logo ? (
                                        <img src={item.logo} alt={item.label} className="w-full h-full object-contain p-1" />
                                    ) : item.key.charAt(0)}
                                </div>
                                <span className={`text-[14px] font-medium truncate ${selected === item.key ? 'text-white' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[400px]">
                <div className="flex-1 overflow-y-auto">
                    {isComingSoon ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <Title level={3} className="!mb-2 text-gray-300">Coming Soon...</Title>
                        </div>
                    ) : (
                        <ClientForm
                            fields={fields}
                            formState={formState}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                            loading={loading}
                            error={fieldError}
                        />
                    )}
                </div>

                {/* Footer Actions - only for new login */}
                {!hasSavedCredentials && !isComingSoon && (
                    <div className="px-8 py-6 flex justify-end gap-3 bg-transparent">
                        {!isInline && (
                            <Button
                                onClick={onClose}
                                disabled={loading}
                                className="h-10 px-8 border-[1.5px] border-wealth-700 text-wealth-800 font-semibold rounded-lg hover:!text-wealth-900 hover:!border-wealth-800 transition-all bg-white/50 backdrop-blur-sm"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            htmlType="submit"
                            form="broker-add-form"
                            loading={loading}
                            className="h-11 px-12 font-bold rounded-xl transition-all border bg-[#defff3] border-[#9fddd2] text-[#0f3d39] hover:!bg-teal-600 hover:!text-white hover:border-teal-700 shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5"
                        >
                            Submit
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    const customStyles = (
        <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
    );

    if (isInline) {
        return <div className="w-full">{content}{customStyles}</div>;
    }

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            closable={false}
            width={1100}
            centered
            bodyStyle={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
            {content}
            {customStyles}
        </Modal>
    );
};

export default AddBroker;
