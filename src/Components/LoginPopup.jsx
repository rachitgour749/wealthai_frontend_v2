import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { handleGoogleLoginSuccess, handleGoogleLoginError } from '../handlers/authHandler';
import { selectIsAuthenticated } from '../store/slices/userSlice';
import { Assets } from '../assets/Assets';

const LoginPopup = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Close popup automatically after successful login
    useEffect(() => {
        if (isAuthenticated && isOpen) {
            // Small delay to show success before closing
            const timer = setTimeout(() => {
                onClose();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-[90%] max-w-[420px] bg-white rounded-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden animate-[slideUp_0.3s_ease-out]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 group z-10"
                >
                    <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="flex flex-col items-center px-8 py-10">
                    {/* Logo */}
                    <div className="mb-6">
                        <img
                            src={Assets.Logo1}
                            alt="WealthWisers Logo"
                            className="h-16 w-auto"
                        />
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                        Welcome to <span className="text-wealth-900">Wealth</span><span className="text-[#b17c4b]">Wisers</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
                        Sign in to access your AI-powered trading strategies
                    </p>

                    {/* Google Sign-In Button with 3D Effects */}
                    <div className='mt-6 w-full max-w-sm'>
                        <div className='relative'>
                            {/* Button Container with 3D Effects */}
                            <div className='relative bg-white rounded-lg overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] transform hover:-translate-y-1 transition-all duration-300'>
                                <GoogleLogin
                                    onSuccess={handleGoogleLoginSuccess}
                                    onError={handleGoogleLoginError}
                                    useOneTap
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="rectangular"
                                    logo_alignment="left"
                                    width="100%"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Terms and Privacy */}
                    <p className="text-xs text-gray-500 mt-6 text-center max-w-sm">
                        By signing in, you agree to our{' '}
                        <a
                            href="#"
                            className="text-wealth-900 hover:text-wealth-800 font-medium transition-colors"
                        >
                            Terms of Service
                        </a>
                        {' '}and{' '}
                        <a
                            href="#"
                            className="text-wealth-900 hover:text-wealth-800 font-medium transition-colors"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>

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

export default LoginPopup;
