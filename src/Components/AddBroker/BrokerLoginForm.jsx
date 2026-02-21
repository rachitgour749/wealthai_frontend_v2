import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createBrokerFields, MenuItems } from '../../Data/brokerConfig';
import { loginBroker, storeBrokerSession } from '../../api/services/brokerService';
import { selectUserEmail } from '../../store/slices/userSlice';
import { showNotification } from '../../store/slices/uiSlice';
import {
    setSavedCredentials,
    updateBrokerConnectionStatus,
    clearBrokerConnection,
    fetchAccountDetails,
    deleteBrokerAccount,
    updateBrokerCredentialsThunk
} from '../../store/slices/brokerSlice';

const FieldBox = ({ title, fields: boxFields, isAdditional, formState, handleInputChange, loading }) => (
    <div className={`flex-1 rounded-xl overflow-hidden border shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] min-w-0 ${isAdditional ? 'bg-[#e1fbe9] border-[#5bcb7f]' : 'bg-[#defff3] border-[#9fddd2]'
        }`}>
        {/* Box Header */}
        <h3 className="text-[#0f3d39] flex justify-start items-center mt-[12px] pl-[10px] text-[18px] font-bold mb-[5px]">{title}</h3>

        {/* Box Content - Transparent */}
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {boxFields.map((field) => (
                    <div key={field.field} className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-[12px] font-medium text-gray-600 uppercase ml-[4px]">
                                {field.label}
                            </label>
                            {field.isMandatory !== false && (
                                <span className="text-red-500 font-bold text-[12px]">*</span>
                            )}
                        </div>
                        <Input
                            key={field.field}
                            name={field.field}
                            type={field.value || 'text'}
                            placeholder={field.placeHolder}
                            value={formState[field.field] || ''}
                            onChange={(e) => handleInputChange(field.field, e)}
                            required={field.isMandatory !== false}
                            disabled={loading}
                            className={`h-10 rounded-lg hover:border-wealth-500 focus:border-wealth-600 text-sm font-medium text-[#0f3d39] bg-white dark-placeholder ${isAdditional ? 'border-[#5bcb7f]' : 'border-[#9fddd2]'
                                }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ClientForm = ({ fields, formState, handleSubmit, handleInputChange, loading, error }) => {
    // Separate fields into required and additional
    const requiredFields = fields.filter(field => field.isMandatory !== false);
    const additionalFields = fields.filter(field => field.isMandatory === false);

    const onFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {};
        formData.forEach((value, key) => {
            if (value) data[key] = value.toString();
        });
        handleSubmit?.(data);
    };

    return (
        <form id="broker-add-form" onSubmit={onFormSubmit} className="p-4 h-full">
            {/* Custom styles for light gray placeholder */}
            <style>{`
                .dark-placeholder::placeholder {
                    color: #9ca3af !important; /* light gray */
                    opacity: 1 !important;
                    font-weight: 400;
                    font-size: 14px !important;
                }
                .dark-placeholder input::placeholder {
                    color: #9ca3af !important;
                    opacity: 1 !important;
                    font-weight: 400;
                    font-size: 14px !important;
                }
                .ant-input::placeholder {
                    color: #9ca3af !important;
                    opacity: 1 !important;
                    font-weight: 400;
                    font-size: 14px !important;
                }
            `}</style>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="rounded-lg mb-3 text-[13px]"
                />
            )}

            {/* Horizontal layout - Two columns side by side */}
            <div className="flex flex-col md:flex-row gap-8 h-full overflow-y-auto pr-2 custom-scrollbar">
                {requiredFields.length > 0 && (
                    <FieldBox
                        title="Required Fields"
                        fields={requiredFields}
                        formState={formState}
                        handleInputChange={handleInputChange}
                        loading={loading}
                    />
                )}

                {additionalFields.length > 0 && (
                    <FieldBox
                        title="Additional Fields"
                        fields={additionalFields}
                        isAdditional={true}
                        formState={formState}
                        handleInputChange={handleInputChange}
                        loading={loading}
                    />
                )}
            </div>
            {/* Hidden submit button to allow Enter key to submit */}
            <button type="submit" className="hidden" />
        </form>
    );
};

const BrokerLoginForm = ({ selectedBrokerKey, onBack, onSuccess, onClose }) => {
    const dispatch = useDispatch();
    const userEmail = useSelector(selectUserEmail);
    const accountDetails = useSelector(state => state.broker.accountDetails);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [fieldError, setFieldError] = useState("");
    const [formState, setFormState] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    // Combined loading for sub-components if needed
    const loading = submitLoading || removeLoading;

    // Check if the selected broker is the one currently connected
    const isBrokerActive = useMemo(() => {
        // 1. Check Redux state (API source of truth)
        if (accountDetails &&
            accountDetails.broker_name &&
            selectedBrokerKey &&
            accountDetails.broker_name.toLowerCase() === selectedBrokerKey.toLowerCase()) {
            return true;
        }

        // 2. Fallback: Check localStorage session (useful before API fetch completes)
        try {
            const session = JSON.parse(localStorage.getItem('broker_session') || '{}');
            if (session.broker_name &&
                selectedBrokerKey &&
                session.broker_name.toLowerCase() === selectedBrokerKey.toLowerCase()) {
                return true;
            }
        } catch (e) {
            console.error("Error checking session in isBrokerActive:", e);
        }

        return false;
    }, [accountDetails, selectedBrokerKey]);

    // Derived state for fields
    const fields = useMemo(() => selectedBrokerKey ? createBrokerFields(selectedBrokerKey) : [], [selectedBrokerKey]);

    // Reset form when broker changes or accountDetails loaded
    useEffect(() => {
        if (!selectedBrokerKey) return;

        // Source of truth: API accountDetails from Redux
        // Fallback to localStorage if accountDetails is still loading but we know it's the active broker
        let savedCreds = null;
        if (isBrokerActive && accountDetails && accountDetails.credentials) {
            savedCreds = accountDetails.credentials;
        } else {
            // Check localStorage session for credentials if API details haven't arrived yet
            const session = JSON.parse(localStorage.getItem('broker_session') || '{}');
            if (session.broker_name && session.broker_name.toLowerCase() === selectedBrokerKey.toLowerCase()) {
                savedCreds = session.credentials;
            }
        }

        const initialState = fields.reduce((acc, { field }) => {
            acc[field] = (savedCreds && savedCreds[field]) || "";
            return acc;
        }, {});

        setFormState(initialState);
        setFieldError("");
    }, [selectedBrokerKey, fields, isBrokerActive, accountDetails]);

    // Fetch account details if missing but we think we're connected
    useEffect(() => {
        if (userEmail && !accountDetails && !loading) {
            const hasBroker = localStorage.getItem('wealthai_has_broker') === 'true';
            if (hasBroker) {
                dispatch(fetchAccountDetails(userEmail));
            }
        }
    }, [userEmail, accountDetails, loading, dispatch]);

    // Validation Effect
    useEffect(() => {
        const isMissingFields = fields
            .filter(f => f.isMandatory !== false)
            .some(f => !formState[f.field] || String(formState[f.field]).trim() === "");
        setIsFormValid(!isMissingFields);
    }, [fields, formState]);


    const handleInputChange = (field, e) => {
        let newValue = e.target.value;

        // Auto-add country code for mobile number fields
        if ((field === 'mobileNumber' || field === 'mobile_number') && newValue) {
            // Remove any existing + or spaces
            newValue = newValue.replace(/[\s+]/g, '');

            // If user is typing and doesn't have country code, add +91
            if (!newValue.startsWith('91') && newValue.length > 0) {
                // If they're typing a number, prepend +91
                if (/^\d/.test(newValue)) {
                    newValue = '+91' + newValue;
                }
            } else if (newValue.startsWith('91') && !newValue.startsWith('+91')) {
                // If they typed 91 without +, add the +
                newValue = '+' + newValue;
            }
        }

        setFormState(prev => ({ ...prev, [field]: newValue }));
    };

    const handleSubmit = async (submittedData) => {
        const isMissingFields = fields
            .filter(f => f.isMandatory !== false)
            .some(f => !submittedData[f.field] || String(submittedData[f.field]).trim() === "");

        if (isMissingFields) {
            const errorMsg = "Please fill in all mandatory fields.";
            setFieldError(errorMsg);
            dispatch(showNotification({ message: errorMsg, type: 'error' }));
            return;
        }

        setSubmitLoading(true);
        try {
            const isUpdate = isBrokerActive;

            const payload = {
                user_email: userEmail,
                broker_name: selectedBrokerKey.toLowerCase(),
                ...submittedData, // Spread all fields
                // Map common fields for backward compatibility
                username: submittedData['Client ID'] || submittedData['username'] || submittedData['ucc'] || submittedData['client_id'],
                password: submittedData['password'] || submittedData['mpin'],
                api_key: submittedData['apiKey'] || submittedData['api_key'] || submittedData['api_key'] || submittedData['access_token'],
                api_secret: submittedData['secretKey'] || submittedData['api_secret'],
                totp_secret: submittedData['totp'] || submittedData['totp_secret'],
                credentials: submittedData // Store full credentials object
            };

            if (isUpdate) {
                const resultAction = await dispatch(updateBrokerCredentialsThunk(payload));
                if (updateBrokerCredentialsThunk.fulfilled.match(resultAction)) {
                    dispatch(showNotification({ message: 'Credentials updated successfully', type: 'success' }));
                    onSuccess();
                } else {
                    const errorMsg = resultAction.payload || "Failed to update account";
                    dispatch(showNotification({ message: errorMsg, type: 'error' }));
                }
            } else {
                // For login/addition, keep existing direct call or use a thunk if available
                // Based on existing code, loginBroker is called directly
                const response = await loginBroker(payload);
                if (response && response.status === "success") {
                    localStorage.setItem('wealthai_has_broker', 'true');
                    storeBrokerSession({
                        token: response.access_token,
                        expire: response.expire,
                        broker_name: response.broker_name,
                        client_id: response.client_id,
                        user_email: response.user_email,
                        credentials: submittedData
                    });

                    // Refresh state from API
                    dispatch(fetchAccountDetails(userEmail));
                    dispatch(setSavedCredentials(true));
                    setTimeout(() => {
                        dispatch(updateBrokerConnectionStatus());
                    }, 100);

                    dispatch(showNotification({ message: 'Account added successfully', type: 'success' }));
                    onSuccess();
                } else {
                    const errorMessage = response?.message || "Failed to login. Please check your credentials.";
                    dispatch(showNotification({ message: errorMessage, type: 'error' }));
                }
            }
        } catch (error) {
            console.error("Submission failed:", error);
            let errorMsg = "An error occurred. Please try again.";
            if (error.response?.data?.detail) errorMsg = error.response.data.detail;
            else if (error.response?.data?.message) errorMsg = error.response.data.message;
            else if (error.message) errorMsg = error.message;
            dispatch(showNotification({ message: errorMsg, type: 'error' }));
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRemoveAccount = async () => {
        if (!accountDetails || !accountDetails.client_id) {
            // Fallback: check localStorage session if Redux state is null
            const session = JSON.parse(localStorage.getItem('broker_session') || '{}');
            if (!session.client_id) return;

            setRemoveLoading(true);
            try {
                const resultAction = await dispatch(deleteBrokerAccount({
                    userEmail,
                    clientId: session.client_id
                }));

                if (deleteBrokerAccount.fulfilled.match(resultAction)) {
                    dispatch(showNotification({ message: 'Account removed successfully', type: 'success' }));
                    dispatch(fetchAccountDetails(userEmail));
                    onBack();
                } else {
                    dispatch(showNotification({ message: resultAction.payload || 'Failed to remove account', type: 'error' }));
                }
            } catch (err) {
                dispatch(showNotification({ message: 'Error removing account', type: 'error' }));
            } finally {
                setRemoveLoading(false);
            }
            return;
        }

        setRemoveLoading(true);
        try {
            const resultAction = await dispatch(deleteBrokerAccount({
                userEmail,
                clientId: accountDetails.client_id
            }));

            if (deleteBrokerAccount.fulfilled.match(resultAction)) {
                dispatch(showNotification({ message: 'Account removed successfully', type: 'success' }));
                // Refresh API state to reflect NO account
                dispatch(fetchAccountDetails(userEmail));
                onBack();
            } else {
                const errorMsg = resultAction.payload || 'Failed to remove account';
                dispatch(showNotification({ message: errorMsg, type: 'error' }));
            }
        } catch (error) {
            console.error("Removal failed:", error);
            dispatch(showNotification({ message: 'Error removing account', type: 'error' }));
        } finally {
            setRemoveLoading(false);
        }
    };

    // Simplified check for the template
    const isBrokerConnected = isBrokerActive;

    return (
        <div className="animate-[fadeIn_0.5s_ease-out] px-4 py-4 bg-white shadow-sm border border-gray-300 mt-[-1px] rounded-b-xl w-full">
            <ClientForm
                fields={fields}
                formState={formState}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                loading={loading}
                error={fieldError}
                hideSubmit={true} // We will render our own submit buttons
            />

            {/* Form Footer Actions - Matching previous design manually */}
            <div className="flex justify-between gap-3 px-6">
                {/* Remove Account Button - Only show if credentials exist in API state or localStorage */}
                {isBrokerActive ? (
                    <button
                        onClick={handleRemoveAccount}
                        disabled={loading}
                        className="h-10 px-6 rounded-lg font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        type="button"
                    >
                        {removeLoading && (
                            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        Remove Account
                    </button>
                ) : (
                    <div></div> /* Spacer if no remove button */
                )}

                <button
                    onClick={isFormValid && !loading ? () => handleSubmit(formState) : null}
                    disabled={loading || !isFormValid}
                    className={`h-10 px-8 rounded-lg font-bold flex items-center justify-center gap-2 ${isFormValid && !loading ? 'bg-wealth-800 hover:bg-wealth-900 text-white' : 'cursor-not-allowed bg-gray-200 text-gray-400'}`}
                >
                    {submitLoading && (
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isBrokerActive ? 'Update Credentials' : 'Connect Broker'}
                </button>
            </div>
        </div>
    );
};

export default BrokerLoginForm;
