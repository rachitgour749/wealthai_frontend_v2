import React from 'react';

const Stepper = ({ currentStep, steps }) => {
    return (
        <div className="w-full border py-3 md:py-3 bg-gray-100 px-4 md:px-10 border-gray-300 rounded-t-[15px]">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <React.Fragment key={index}>
                            {/* Step Item */}
                            <div className="flex flex-col items-center gap-1 group">
                                <div
                                    className={`
                                        w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ease-in-out
                                        ${isCompleted ? 'border-wealth-900 bg-wealth-900 text-white  scale-110' :
                                            isActive ? 'border-gray-500 text-gray-500 bg-white ring-2 ring-gray-500/20 shadow-sm' :
                                                'border-gray-200 text-gray-400 bg-white shadow-inner'}
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4 animate-[scale-in_0.3s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={`
                                        text-[9px] md:text-[10px] font-medium uppercase tracking-wider transition-colors duration-300
                                        hidden md:block
                                        ${isCompleted ? 'text-wealth-900' : isActive ? 'text-wealth-800' : 'text-gray-400'}
                                    `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-[2px] mx-2 md:mx-6 bg-gray-200 rounded-full overflow-hidden mb-0 md:mb-4 self-center md:self-auto mt-[-15px] md:mt-0">
                                    <div
                                        className={`h-full transition-all duration-700 ease-in-out ${currentStep > step.id ? 'w-full bg-wealth-900' : 'w-0 bg-gray-300'}`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
