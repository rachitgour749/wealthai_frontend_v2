import React from 'react';
import UserAvatar from './UserAvatar';

const UserMenu = ({ user, onSignOut }) => {
    return (
        <div className='absolute top-[60px] right-0 min-w-[240px] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden backdrop-blur-sm animate-[slideDown_0.2s_ease-out] z-50'>
            {/* User Profile Section */}
            <div className='relative flex flex-col items-center py-5 px-4 bg-gradient-to-br from-white via-gray-50 to-gray-100'>
                <UserAvatar user={user} size="large" />
                <div className='mt-3 text-center'>
                    <h3 className='text-base font-bold text-gray-900'>{user?.name}</h3>
                </div>
            </div>

            {/* Menu Items */}
            <div className='py-2 px-1'>
                {/* My Profile */}
                <div className='group flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_8px_rgba(59,130,246,0.15)] hover:scale-[1.02] active:scale-[0.98]'>
                    <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-blue-500 transition-all duration-200 shadow-sm group-hover:shadow-md'>
                        <svg className='w-4 h-4 text-gray-600 group-hover:text-white transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className='text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors'>My Profile</span>
                </div>

                {/* Subscription */}
                <div className='group flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_8px_rgba(34,197,94,0.15)] hover:scale-[1.02] active:scale-[0.98]'>
                    <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-green-500 transition-all duration-200 shadow-sm group-hover:shadow-md'>
                        <svg className='w-4 h-4 text-gray-600 group-hover:text-white transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <span className='text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors'>Subscription</span>
                </div>

                {/* Sign out */}
                <div
                    className='group flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_8px_rgba(239,68,68,0.15)] hover:scale-[1.02] active:scale-[0.98]'
                    onClick={onSignOut}
                >
                    <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-red-500 transition-all duration-200 shadow-sm group-hover:shadow-md'>
                        <svg className='w-4 h-4 text-gray-600 group-hover:text-white transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <span className='text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-colors'>Sign out</span>
                </div>
            </div>
        </div>
    );
};

export default UserMenu;
