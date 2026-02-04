import React, { useState, useEffect, useMemo } from 'react';
import { Button, Typography, message, Modal } from 'antd';
import { X } from 'lucide-react';
import ClientForm from './ClientForm';
import { brokerService } from '../../services/brokerService';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateBrokerConnectionStatus } from '../../store/slices/brokerSlice';

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
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [selected, setSelected] = useState("ZERODHA");
    const [loading, setLoading] = useState(false);
    const [fieldError, setFieldError] = useState("");
    const [formState, setFormState] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    // If inline, always consider it "open"
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
        const initialState = fields.reduce((acc, { field }) => {
            acc[field] = "";
            return acc;
        }, {});
        setFormState(initialState);
        setFieldError("");
        checkFormValidity(initialState);
    }, [selected, fields, isOpen]);

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

    const validateForm = () => {
        const { email, ClientName, proxy_ip, port, proxy_username, proxy_password, ...rest } = formState;
        return Object.values(rest).every(value => String(value)?.trim() !== "");
    };

    const handleSubmit = async (submittedData) => {
        // Manual validation for mandatory fields from the submitted data
        const isMissingFields = fields
            .filter(f => f.isMandatory !== false)
            .some(f => !submittedData[f.field] || String(submittedData[f.field]).trim() === "");

        if (isMissingFields) {
            setFieldError("Please fill in all mandatory fields.");
            message.error("Please fill in all mandatory fields.");
            return;
        }

        setLoading(true);
        try {
            const success = await brokerService.loginWithBroker(selected, submittedData);

            if (success) {
                message.success(`${selected} client added successfully`);
                dispatch(updateBrokerConnectionStatus());
                resetState();
                onClose?.();
            } else {
                message.error("Failed to add client. Please check your credentials.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            message.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className={`flex overflow-hidden ${isInline ? 'rounded-xl' : ''} p-4 gap-4`}>
            {/* Left Sidebar - Select Broker Box */}
            <div className="w-[240px] bg-[#defff3] flex-shrink-0 rounded-xl overflow-hidden border border-[#9fddd2] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                {/* Box Header */}
                <h3 className="text-[#0f3d39] flex justify-start items-center mt-[12px] pl-[10px] text-[18px] font-bold mb-[5px]">Select Broker</h3>

                {/* Broker List - Light blue shade */}
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
                                <div className="flex-shrink-0">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shadow-sm overflow-hidden p-1"
                                        style={{
                                            backgroundColor: selected === item.key ? 'rgba(255, 255, 255, 0.2)' : `${item.iconColor}10`,
                                            border: selected === item.key ? '2px solid rgba(255, 255, 255, 0.6)' : `2px solid ${item.iconColor}90`
                                        }}
                                    >
                                        {item.logo ? (
                                            <img
                                                src={item.logo}
                                                alt={item.label}
                                                className="w-full h-full object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <span
                                            style={{
                                                display: item.logo ? 'none' : 'flex',
                                                color: selected === item.key ? 'white' : item.iconColor
                                            }}
                                        >
                                            {item.key.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-[14px] font-medium truncate ${selected === item.key ? 'text-white' : 'text-gray-600'}`}>
                                        {item.label}
                                    </span>
                                    {item.isComingSoon && (
                                        <span className="text-[9px] text-blue-500 font-medium whitespace-nowrap">
                                            Coming soon...
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
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

                {/* Footer Actions */}
                {!isComingSoon && (
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
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
            }
            /* Remove arrows from number inputs */
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type=number] {
                -moz-appearance: textfield;
            }
        `}</style>
    );

    // Inline mode: render directly without Modal
    if (isInline) {
        return (
            <div className="w-full">
                {content}
                {customStyles}
            </div>
        );
    }

    // Modal mode: render inside Modal
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

