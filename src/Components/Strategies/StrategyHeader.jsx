import React from 'react';

const StrategyHeader = ({ name, onBack, instancesCount = 0, onInstancesClick }) => {
    return (
        <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl flex justify-between items-center shadow-lg">

            <button
                onClick={onBack}
                className="flex items-center gap-1 md:gap-2 border border-white/20 bg-[#ffffff20] hover:bg-[#ffffff30] active:translate-y-0.5 active:shadow-inner px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium transition-all duration-200 shadow-lg"
            >
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Strategies</span>
                <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-1 md:gap-2">
                <h1 className="text-sm md:text-xl font-bold">{name}</h1>
                <button className="text-white/70 hover:text-white">
                    <svg className="w-3.5 md:w-4 h-3.5 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <button
                onClick={onInstancesClick}
                data-instances-button
                className="bg-[#ffffff20] border border-white/20 hover:bg-[#ffffff30] active:translate-y-0.5 active:shadow-inner px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium flex items-center gap-1 md:gap-2 transition-all duration-200 shadow-lg relative"
            >
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Strategy Instances</span>
                <span className="sm:hidden">Instances</span>

                {instancesCount > 0 && (
                    <div className="bg-red-500 text-white text-[13px] font-medium min-w-[18px] h-[18px] px-[1px] rounded-full flex items-center justify-center shadow-md pr-[2px] pt-[2px] ml-1">
                        {instancesCount}
                    </div>
                )}
            </button>
        </div>
    );
};

export default StrategyHeader;
