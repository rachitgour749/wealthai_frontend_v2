import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import StrategyStepper from '../Strategies/StrategyStepper';
import { useSelector } from 'react-redux';
import {
    selectIsBrokerConnected,
    selectHasSavedCredentials,
} from '../../store/slices/brokerSlice';
import BrokerHeader from './BrokerHeader';
import { MenuItems } from '../../Data/brokerConfig';
import BrokerSelection from './BrokerSelection';
import BrokerLoginForm from './BrokerLoginForm';
import BrokerConnectionStatus from './BrokerConnectionStatus';

const AddBroker = ({ isOpen, onClose, isInline = false }) => {
    const isConnected = useSelector(selectIsBrokerConnected);
    const hasSavedCredentials = useSelector(selectHasSavedCredentials);

    const [selected, setSelected] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: Select, 1: Configure, 2: Success

    const effectiveIsOpen = isInline || isOpen;

    // Initial check
    useEffect(() => {
        if (effectiveIsOpen) {
            // Always start at Broker Selection (0) for the dashboard view
            if (isInline) {
                setCurrentStep(0);
                setSelected(null);
            } else if (hasSavedCredentials || isConnected) {
                // For the popup modal, jump straight to status if configured
                setCurrentStep(2);
            } else {
                setCurrentStep(0);
                setSelected(null);
            }
        }
    }, [effectiveIsOpen, hasSavedCredentials, isConnected, isInline]);

    const handleBrokerSelect = (brokerKey) => {
        setSelected(brokerKey);
        // If this broker is already the active one and has credentials, go to status page (Step 2)
        const activeBroker = localStorage.getItem('wealthai_active_broker') || ''; // Better to use state but since we might refresh
        const isAlreadyConfigured = hasSavedCredentials && (selected === brokerKey);

        // Use a more reliable check: if hasSavedCredentials is true, we should check which one.
        // Actually, the redux state 'activeBroker' is the most reliable.
        if (hasSavedCredentials && brokerKey.toLowerCase() === (localStorage.getItem('wealthai_active_broker') || '').toLowerCase()) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            setCurrentStep(0);
            setSelected(null);
        }
    };

    const handleConnectNew = () => {
        setCurrentStep(0);
        setSelected(null);
    };

    const steps = [
        { label: 'Select Broker', isComplete: currentStep > 0 },
        { label: 'Configure Credentials', isComplete: currentStep > 1 },
        { label: 'Broker Added', isComplete: currentStep >= 2 }
    ];

    const selectedBrokerData = MenuItems.find(i => i.key === selected);

    const content = (
        <div className="flex flex-col w-full h-full min-h-[500px]">
            {/* Header and Stepper - ONLY SHOW IF STEP > 0 */}
            {currentStep > 0 && (
                <div className="px-4 md:px-8 mt-4">
                    <BrokerHeader
                        name={selectedBrokerData?.label || selected}
                        logo={selectedBrokerData?.logo}
                        onBack={handleBack}
                    />
                    <StrategyStepper currentStep={currentStep} steps={steps} />
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 overflow-y-auto px-4 md:px-8 ${currentStep === 0 ? '' : ''}`}>

                {currentStep === 0 && (
                    <div className="animate-[fadeIn_0.5s_ease-out] p-7">
                        <BrokerSelection onSelect={handleBrokerSelect} />
                    </div>
                )}

                {currentStep === 1 && (
                    <BrokerLoginForm
                        selectedBrokerKey={selected}
                        onBack={handleBack}
                        onSuccess={() => {
                            if (isInline) {
                                setCurrentStep(0);
                                setSelected(null);
                            } else {
                                setCurrentStep(2);
                            }
                        }}
                        onClose={onClose}
                    />
                )}

                {currentStep === 2 && (
                    <BrokerConnectionStatus
                        selectedBrokerKey={selected}
                        onConnectNew={handleConnectNew}
                    />
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
        return <div className="w-full h-full flex flex-col">{content}{customStyles}</div>;
    }

    return (

        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            closable={false}
            width={1100}
            centered
            bodyStyle={{ padding: 0, borderRadius: '20px', overflow: 'hidden', height: '80vh' }}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
            {content}
            {customStyles}
        </Modal>
    );
};

export default AddBroker;


