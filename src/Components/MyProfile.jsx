import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';
import { selectProducts } from '../store/slices/subscriptionSlice';
import UserAvatar from './Navbar/UserAvatar';
import { formatDate } from '../utils/formatUtils';

const MyProfilePopup = ({ isOpen, onClose }) => {
    const user = useSelector(selectUser);
    const subscriptionProducts = useSelector(selectProducts);

    // Get active subscriptions
    const activeSubscriptions = subscriptionProducts?.filter(sub =>
        sub.status === 'active' || sub.status === 'trial'
    ) || [];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="large" />
                            <div className="text-white">
                                <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                                <p className="text-teal-100 text-sm">{user?.email || 'No email'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Account Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Name */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                                    <p className="text-sm font-medium text-gray-800 mt-1">{user?.name || 'N/A'}</p>
                                </div>

                                {/* Email */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                                    <p className="text-sm font-medium text-gray-800 mt-1 break-all">{user?.email || 'N/A'}</p>
                                </div>

                                {/* Role */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                                    <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{user?.role || 'User'}</p>
                                </div>

                                {/* Account Status */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Account Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <p className="text-sm font-medium text-gray-800">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscriptions */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Active Subscriptions</h3>
                            {activeSubscriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {activeSubscriptions.map((subscription, index) => (
                                        <div key={index} className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-bold text-gray-800 mb-1">{subscription.plan_name}</h4>
                                                    <p className="text-sm text-gray-600 break-words">
                                                        <span className="font-semibold">Product:</span> {subscription.product_name || 'N/A'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subscription.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {subscription.status === 'trial' ? 'Trial' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Valid Till</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {formatDate(subscription.subscription_end_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-gray-500 font-medium text-sm">No active subscriptions</p>
                                    <p className="text-xs text-gray-400 mt-1">Subscribe to a plan to get started</p>
                                </div>
                            )}
                        </div>

                        {/* Help Section */}
                        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-blue-800">Need help?</p>
                                    <p className="text-xs text-blue-700 mt-1">Contact our support team at support@wealthwisers.in</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfilePopup;