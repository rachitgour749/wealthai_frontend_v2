import React from 'react';

const BrokerHeader = ({ name, logo, onBack }) => {
    return (
        <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl flex justify-between items-center shadow-lg mb-4">
            <button
                onClick={onBack}
                className="flex items-center gap-1 md:gap-2 border border-white/20 bg-[#ffffff20] hover:bg-[#ffffff30] active:translate-y-0.5 active:shadow-inner px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium transition-all duration-200 shadow-lg"
            >
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Broker Selection</span>
                <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-3">
                {logo && (
                    <div className="w-7 h-7 md:w-10 md:h-9 bg-white/10 border border-gray-500 rounded-lg px-1.5 py-1 flex items-center justify-center">
                        <img src={logo} alt={name} className="w-full h-full object-contain" />
                    </div>
                )}
                <h1 className="text-sm md:text-xl font-bold">{name}</h1>
            </div>

            {/* Placeholder for right side to balance the flex or add actions */}
            <div className="w-[100px] md:w-[150px] flex justify-end">
                {/* Empty div to balance the back button width roughly, or can be removed if center is absolute */}
            </div>
        </div>
    );
};

export default BrokerHeader;
