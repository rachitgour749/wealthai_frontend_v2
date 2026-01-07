import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';
import { activateTrial, selectTrialActivating, selectSubscriptionError } from '../store/slices/subscriptionSlice';

const Trial = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isActivating = useSelector(selectTrialActivating);
    const error = useSelector(selectSubscriptionError);

    const handleActivateTrial = async () => {
        if (!user || !user.email || !user.name) {
            alert('User information not available. Please login again.');
            return;
        }

        try {
            await dispatch(activateTrial({
                email: user.email,
                name: user.name,
            })).unwrap();

            // Trial popup will close automatically via Redux state
            console.log('Trial activated successfully');
        } catch (err) {
            console.error('Trial activation failed:', err);
            alert('Failed to activate trial: ' + (err || 'Please try again'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]'>
            <div className='relative w-[90%] max-w-[480px] bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),0_10px_20px_-5px_rgba(0,0,0,0.3)] overflow-hidden animate-[slideUp_0.3s_ease-out] transform hover:scale-[1.01] transition-transform duration-300'>
                {/* Teal Header Section */}
                <div className='relative bg-gradient-to-br from-[#1a8f7f] via-[#17826f] to-[#16756a] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_16px_rgba(0,0,0,0.2)]'>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className='absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.3)]'
                    >
                        <svg
                            className='w-5 h-5 text-white'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>

                    {/* Checkmark Circle */}
                    <div className='flex justify-center mb-4'>
                        <div className='w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]'>
                            <svg
                                className='w-10 h-10 text-white'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className='text-3xl font-bold text-white mb-2 drop-shadow-lg'>
                        Start Your Free Trial
                    </h2>
                    <p className='text-base text-white/90 drop-shadow-md'>
                        Experience all premium features for 7 days
                    </p>
                </div>

                {/* White Content Section */}
                <div className='px-6 py-6 bg-gradient-to-b from-white to-gray-50'>
                    {/* What You Get Header */}
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                        WHAT YOU GET
                    </h3>

                    {/* Features List */}
                    <div className='space-y-3 mb-6'>
                        {/* Full Platform Access */}
                        <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]'>
                                <svg className='w-6 h-6 text-cyan-600' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='text-base font-bold text-gray-900'>Full Platform Access</h4>
                                <p className='text-xs text-gray-600'>MarketsAI, ChatAI, TradeAI & InvestAI</p>
                            </div>
                        </div>

                        {/* 7 Days Free */}
                        <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(168,85,247,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]'>
                                <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='text-base font-bold text-gray-900'>7 Days Free</h4>
                                <p className='text-xs text-gray-600'>No payment required during trial</p>
                            </div>
                        </div>

                        {/* No Commitment */}
                        <div className='flex items-start gap-3'>
                            <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]'>
                                <svg className='w-6 h-6 text-amber-600' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='text-base font-bold text-gray-900'>No Commitment</h4>
                                <p className='text-xs text-gray-600'>Cancel anytime, no questions asked</p>
                            </div>
                        </div>
                    </div>

                    {/* Activate Button */}
                    <button
                        onClick={handleActivateTrial}
                        disabled={isActivating}
                        className={`w-full py-3 bg-gradient-to-r from-[#1a8f7f] to-[#16756a] hover:from-[#16756a] hover:to-[#135c52] text-white font-bold text-base rounded-xl transition-all duration-300 shadow-[0_6px_20px_rgba(22,117,106,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_8px_24px_rgba(22,117,106,0.5)] hover:translate-y-[-2px] flex items-center justify-center gap-2 mb-3 ${isActivating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isActivating ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Activating...
                            </>
                        ) : (
                            <>
                                Activate Free Trial
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                </svg>
                            </>
                        )}
                    </button>

                    {/* Maybe Later Button */}
                    <button
                        onClick={onClose}
                        className='w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
                    >
                        Maybe Later
                    </button>

                    {/* Secure Note */}
                    <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
                        <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
                        </svg>
                        <span>Secure • No credit card required</span>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Trial;