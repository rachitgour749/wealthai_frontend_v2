import React from 'react';
import { MenuItems } from '../../Data/brokerConfig';
import { useSelector } from 'react-redux';
import { selectIsBrokerConnected, selectActiveBroker } from '../../store/slices/brokerSlice';

const BrokerSelection = ({ onSelect }) => {
    const isConnected = useSelector(selectIsBrokerConnected);
    const activeBroker = useSelector(selectActiveBroker);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-6 max-w-7xl mx-auto w-full">
            {MenuItems.map((item) => {
                const isActive = isConnected && activeBroker && activeBroker.toLowerCase() === item.key.toLowerCase();
                const isDisabled = item.isComingSoon || (isConnected && !isActive);

                return (
                    <div
                        key={item.key}
                        onClick={() => !isDisabled && onSelect(item.key)}
                        className={`
                        relative rounded-xl overflow-hidden h-24 md:h-28
                        transition-all duration-300 ease-out transform-gpu
                        ${!isDisabled
                                ? `bg-white border-2 ${item.borderColor} shadow-[0_4px_4px_0_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1.5 active:translate-y-0.5 active:shadow-none cursor-pointer`
                                : `bg-white border-2 border-gray-300 cursor-not-allowed opacity-60`
                            }
                    `}
                    >
                        {/* LIVE Badge (Show ONLY if this is the active broker) */}
                        {isActive && (
                            <div className={`bg-gradient-to-br px-1.5 md:px-2 py-0.5 md:py-1 ${item.gradient}`}>
                                <span className="bg-white text-green-700 text-[7px] md:text-[10px] font-bold px-2 md:px-1.5 py-[2px] rounded shadow-sm">
                                    Active
                                </span>
                            </div>
                        )}

                        {/* Coming Soon Badge */}
                        {item.isComingSoon && (
                            <div className="bg-gradient-to-br from-gray-200 to-gray-300 px-1.5 md:px-2 py-0.5 md:py-1">
                                <span className="bg-white text-gray-500 text-[7px] md:text-[10px] font-bold px-1 md:px-1.5 py-[2px] rounded shadow-sm">
                                    COMING SOON
                                </span>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center px-2 md:px-4 py-1 md:py-2 h-full">
                            <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center ${isActive ? 'mt-[-36px]' : ''}`}>
                                {item.logo ? (
                                    <img src={item.logo} alt={item.label} className="w-[35px] h-[35px] object-contain" />
                                ) : (
                                    <span className={`text-xl font-bold text-gray-400 ${isActive ? '' : 'mt-[-60px]'}`}>{item.key.charAt(0)}</span>
                                )}
                            </div>
                            <h3 className={`text-wealth-800 font-bold text-[10px] md:text-sm leading-tight text-center ${item.isComingSoon ? 'mt-[-35px]' : ''}`}>
                                {item.label}
                            </h3>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default BrokerSelection;
