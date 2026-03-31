import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectIsBrokerConnected,
    selectIsExpired,
    selectActiveBroker,
    updateBrokerConnectionStatus,
    setSavedCredentials
} from '../../store/slices/brokerSlice';
import { selectUserEmail } from '../../store/slices/userSlice'; // ensure import is correct
import { setCurrentTab } from '../../store/slices/navigationSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { reconnectBroker, storeBrokerSession } from '../../api/services/brokerService';

const { Text, Title } = Typography;

const BrokerConnectionStatus = ({ selectedBrokerKey, onConnectNew }) => {
    const dispatch = useDispatch();
    const isConnected = useSelector(selectIsBrokerConnected);
    const isExpired = useSelector(selectIsExpired);
    const activeBroker = useSelector(selectActiveBroker);
    const userEmail = useSelector(selectUserEmail);
    const [loading, setLoading] = useState(false);

    const handleReconnect = async () => {
        setLoading(true);
        try {
            const brokerToReconnect = activeBroker || (selectedBrokerKey ? selectedBrokerKey.toLowerCase() : 'zerodha');
            const response = await reconnectBroker(userEmail, brokerToReconnect);

            if (response && response.status === "success") {
                dispatch(showNotification({ message: `Reconnected to ${response.broker_name} successfully`, type: 'success' }));
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
                dispatch(showNotification({ message: "Re-connection failed. Please log in again.", type: 'error' }));
            }
        } catch (error) {
            console.error("Re-connection error:", error);
            dispatch(showNotification({ message: "Failed to reconnect. Please try manual login.", type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const dotColor = isConnected ? '#22c55e' : (isExpired ? '#ef4444' : '#94a3b8');
    const statusText = isConnected ? 'Connected' : (isExpired ? 'Session Expired' : 'Not Connected');
    const displayBrokerName = (activeBroker || selectedBrokerKey || 'BROKER').toUpperCase();

    return (
        <div className="animate-[fadeIn_0.5s_ease-out] flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Broker Connection Status</h2>
                <p className="text-gray-500">Verify your connection and proceed to strategies</p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#9fddd2] rounded-xl shadow-sm max-w-2xl mx-auto">
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
                    {displayBrokerName} Status
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
                            onClick={() => {
                                dispatch(setSavedCredentials(false));
                                onConnectNew();
                            }}
                            className="h-12 rounded-xl font-semibold text-wealth-700 border-wealth-700 hover:!text-wealth-800 hover:!border-wealth-800"
                        >
                            Connect New Account
                        </Button>
                    </div>
                )}

                {isConnected && (
                    <div className="flex gap-4">
                        <Button
                            type="primary"
                            onClick={() => dispatch(setCurrentTab('Strategies'))}
                            className="h-12 px-8 rounded-xl font-bold text-lg bg-teal-600 hover:!bg-teal-700 shadow-lg shadow-teal-500/20 border-none"
                        >
                            Go to Strategies
                        </Button>
                        <Button
                            onClick={() => {
                                // Placeholder for future multi-account
                            }}
                            className="h-12 px-8 rounded-xl font-semibold text-gray-500 border-gray-300 cursor-not-allowed opacity-50"
                            title="Multi-account support coming soon"
                        >
                            Add Another (Soon)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrokerConnectionStatus;
