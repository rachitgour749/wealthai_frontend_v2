import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNotification, hideNotification } from '../../store/slices/uiSlice';

const AppPopup = () => {
    const dispatch = useDispatch();
    const { isVisible, message, type } = useSelector(selectNotification);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                dispatch(hideNotification());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, dispatch]);

    if (!isVisible) return null;

    const isError = type === 'error';
    const isWarning = type === 'warning';
    const isLoading = type === 'loading';
    const isInfo = type === 'info';

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-[slideIn_0.3s_ease-out]">
            <div className={`
                min-w-[300px] p-4 rounded-xl border-2 flex items-center gap-3
                ${isError
                    ? 'bg-red-50 border-red-200 text-red-800 shadow-[0_8px_20px_-5px_#feb2b2]'
                    : isWarning
                        ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-[0_8px_20px_-5px_#fbd38d]'
                        : isInfo
                            ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-[0_8px_20px_-5px_#bee3f8]'
                            : isLoading
                                ? 'bg-white border-gray-200 text-gray-800 shadow-xl'
                                : 'bg-[#e7fcf0] border-[#5bcb7f] text-wealth-800 shadow-[0_8px_20px_-5px_#9ae6b4]'
                }
                transform transition-all duration-300
                shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),inset_0_2px_4px_0_rgba(255,255,255,0.6)]
                active:scale-95 cursor-pointer
            `}
                onClick={() => dispatch(hideNotification())}
            >
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0
                    ${isError ? 'bg-red-100' : isWarning ? 'bg-amber-100' : isInfo ? 'bg-blue-100' : isLoading ? 'bg-gray-100' : 'bg-[#c6f6d5] shadow-inner'}
                `}>
                    {isError ? '⚠️' : isWarning ? '⚠️' : isInfo ? 'ℹ️' : isLoading ? (
                        <div className="w-5 h-5 border-2 border-wealth-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : '✅'}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm uppercase opacity-40 mb-0.5">
                        {isError ? 'Error Occurred' : isWarning ? 'Warning' : isInfo ? 'Information' : isLoading ? 'Loading...' : 'Success'}
                    </p>
                    <p className="font-medium text-sm leading-tight">{message}</p>
                </div>
                {!isLoading && (
                    <button className="text-current opacity-30 hover:opacity-100 text-xl font-bold ml-2">
                        &times;
                    </button>
                )}
            </div>

            <style dx-style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AppPopup;
