import React, { useState, useEffect } from 'react';
import NavIcons from './NavIcons';
import UserAvatar from './UserAvatar';
import { useDispatch } from 'react-redux';
import { setPaymentPopup } from '../../store/slices/subscriptionSlice';

const MobileMenu = ({ isOpen, onClose, user, isAuthenticated, setCurrentPage, onLoginClick, onSignOut }) => {
    const dispatch = useDispatch();
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Start rendering and trigger animation
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10); // Small delay for animation to trigger
        } else {
            // Trigger slide-out animation
            setIsAnimating(false);
            // Remove from DOM after animation completes
            setTimeout(() => setShouldRender(false), 300); // Match transition duration
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            ></div>

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 rounded-l-[20px] md:hidden transition-transform duration-300 ease-in-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User Section */}
                {isAuthenticated && user && (
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100">
                        <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="small" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">{user.name}</h3>
                                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Icons */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <NavIcons setCurrentPage={setCurrentPage} />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-4">
                    {isAuthenticated && (
                        <div className="space-y-2">
                            {/* My Profile */}
                            <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                    setCurrentPage('MyProfile');
                                    onClose();
                                }}
                            >
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">My Profile</span>
                            </div>

                            {/* Subscription */}
                            <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                                onClick={() => {
                                    dispatch(setPaymentPopup(true));
                                    onClose();
                                }}
                            >
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">Subscription</span>
                            </div>

                            {/* Sign Out */}
                            <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                                onClick={() => {
                                    onSignOut();
                                    onClose();
                                }}
                            >
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">Sign out</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
