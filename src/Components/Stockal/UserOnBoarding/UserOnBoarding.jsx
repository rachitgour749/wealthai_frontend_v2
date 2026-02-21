import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import UserForm from './UserForm';
import KYCCompletion from './KYCCompletion';
import Stepper from './Stepper';

const UserOnBoarding = ({ onCancel }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, label: 'PERSONAL DETAILS' },
        { id: 2, label: 'KYC & DOCUMENTS' },
        { id: 3, label: 'ACTIVATION' }
    ];

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const handleComplete = () => {
        // Final completion logic
        onCancel();
    };

    return (
        <div className="w-full max-w-8xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex relative justify-center items-center gap-4 mb-2 bg-wealth-800 rounded-[10px] px-6 py-3">
                <button
                    onClick={onCancel}
                    className="absolute left-4 py-1 px-4 flex items-center gap-1  bg-white/20 hover:bg-white/30 rounded-[10px] text-white transition-all"
                >
                    <ChevronLeft size={20} /> Back
                </button>
                <div>
                    <h1 className="text-[18px] text-white font-medium tracking-tight uppercase">
                        Welcome To Your OnBoarding
                    </h1>
                </div>
            </div>

            <div>
                {/* Stepper / Breadcrumb */}
                <Stepper steps={steps} currentStep={currentStep} />

                {/* Step Content */}
                <div className="border border-gray-300 mt-[-0.5px] p-3">
                    {currentStep === 1 && (
                        <UserForm onNext={handleNext} onCancel={onCancel} />
                    )}
                    {currentStep === 2 && (
                        <KYCCompletion onComplete={handleNext} onBack={handleBack} />
                    )}
                    {currentStep === 3 && (
                        <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-[#f0f9f6] rounded-3xl flex items-center justify-center mx-auto text-[#c5ae78]">
                                <Check size={40} className="stroke-[3]" />
                            </div>
                            <h2 className="text-2xl font-black text-wealth-900 uppercase tracking-tight">Almost Synchronized</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                Your application is being processed by our compliance team. You'll receive an email confirmation once your account is active for global trading.
                            </p>
                            <button
                                onClick={handleComplete}
                                className="px-10 py-4 bg-wealth-800 text-[#f6cd9e] text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-wealth-900 transition-all shadow-xl"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOnBoarding;
