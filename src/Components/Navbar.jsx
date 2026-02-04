import React, { useState } from 'react';
import Lottie from 'lottie-react';
import reconnectAnimation from '../assets/animations/reconnect.json';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/userSlice';
import { selectCurrentPage } from '../store/slices/navigationSlice';
import { handleLogout } from '../handlers/authHandler';
import { Assets } from '../assets/Assets';
import { selectIsBrokerConnected, updateBrokerConnectionStatus } from '../store/slices/brokerSlice';
import { selectCurrentTab, setCurrentTab } from '../store/slices/navigationSlice';
import LoginPopup from './LoginPopup';
import UserAvatar from './Navbar/UserAvatar';
import UserMenu from './Navbar/UserMenu';
import NavIcons from './Navbar/NavIcons';
import MobileMenu from './Navbar/MobileMenu';
import { useEffect } from 'react';

const Navbar = ({ setCurrentPage }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isBrokerConnected = useSelector(selectIsBrokerConnected);
    const user = useSelector(selectUser);
    const currentPage = useSelector(selectCurrentPage);
    const [menu, setMenu] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    // Refresh broker connection status on mount and periodically
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(updateBrokerConnectionStatus());

            // Check every minute for expiration
            const interval = setInterval(() => {
                dispatch(updateBrokerConnectionStatus());
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, dispatch]);

    const handleReconnect = () => {
        // Don't open Add Broker popup - just attempt reconnection
        if (isBrokerConnected) {
            // Already connected - do nothing or show status
            console.log('Broker already connected');
        } else {
            // Attempt to reconnect using saved credentials
            console.log('Attempting broker reconnection...');
            // TODO: Add actual reconnection logic here
        }
    };

    const handleSignOut = () => {
        handleLogout(dispatch);
        setMenu(false);
    };

    const handleLoginClick = () => {
        setShowLoginPopup(true);
    };

    const handleProfileClick = () => {
        setCurrentPage('MyProfile');
        setMenu(false);
    };

    // Determine what to display based on current page
    const getNavbarTitle = () => {
        switch (currentPage) {
            case 'MarketsAi1':
                return 'MarketsAi1';
            case 'ChatAi1':
                return 'ChatAi1';
            case 'InvestAi1':
                return 'InvestAi1';
            case 'PortfolioAnalytics':
                return 'MarketsAi1'; // Portfolio Analytics is part of MarketsAi1
            case 'Home':
            default:
                return 'Wealth Wisers'; // Default for Home and TradeAi1
        }
    };

    const navbarTitle = getNavbarTitle();
    const showAsProductName = currentPage !== 'Home' && currentPage !== 'TradeAi1';

    return (
        <div className='fixed flex justify-between items-center w-full h-[60px] md:h-[70px] px-4 md:px-8 lg:px-16 bg-gradient-to-r from-wealth-50 from-15% via-wealth-100 from-25% via-wealth-800 via-65% to-wealth-900 z-40'>
            {/* Logo */}
            <img
                src={Assets.Logo1}
                alt="WealthWisers Logo"
                onClick={() => window.open('https://wealthwisers.in', '_blank')}
                className='w-[80px] h-[40px] md:w-[100px] md:h-[50px] cursor-pointer'
            />

            {/* Center Title - Responsive */}
            <div className='flex flex-1 md:w-[290px] h-full justify-center items-center flex-col'>
                {showAsProductName ? (
                    <div className='text-xl md:text-3xl lg:text-4xl font-bold'>
                        <span className='text-wealth-900'>{navbarTitle.replace('Ai1', '')}</span>
                        <span className='text-gold-300'>Ai1</span>
                    </div>
                ) : (
                    <>
                        <div className='text-xl md:text-3xl lg:text-4xl font-bold'>
                            <span className='text-wealth-900'>Wealth</span>
                            <span className='text-gold-300'>Wisers</span>
                        </div>
                        <p className='text-xs md:text-sm lg:text-md font-semibold text-gold-300 mt-[-3px] md:mt-[-5px]'>Product Portal</p>
                    </>
                )}
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className='hidden md:flex relative items-center gap-4'>
                <NavIcons setCurrentPage={setCurrentPage} />

                {isAuthenticated && (
                    <div
                        onClick={handleReconnect}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ml-2 relative group"
                        title={isBrokerConnected ? 'Broker Connected' : 'Broker Disconnected - Click to Connect'}
                    >
                        <div className={`w-[38px] h-[38px] flex items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-2 ${isBrokerConnected
                            ? 'bg-gradient-to-br from-emerald-400/20 to-emerald-600/30 border-emerald-400/50 hover:border-emerald-400/80'
                            : 'bg-gradient-to-br from-red-400/20 to-red-600/30 border-red-400/50 hover:border-red-400/80'
                            }`}>
                            {/* Reconnect SVG Icon - Two circular arrows */}
                            <svg
                                className={`w-[22px] h-[22px] ${isBrokerConnected ? 'text-emerald-500' : 'text-red-500'} ${!isBrokerConnected ? 'animate-spin' : ''}`}
                                style={{ animationDuration: '3s' }}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {/* Top arrow */}
                                <path d="M21 2v6h-6" />
                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                {/* Bottom arrow */}
                                <path d="M3 22v-6h6" />
                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                            </svg>
                        </div>
                        {/* Status Indicator Dot */}
                        <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${isBrokerConnected
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                            }`} />
                    </div>
                )}

                {isAuthenticated && (
                    <div className='relative'>
                        <div
                            className='w-[55px] h-[32px] flex justify-center items-center gap-[5px] rounded-full pr-[7px] transition-all duration-300 cursor-pointer bg-white/70 hover:bg-white/90'
                            onClick={() => setMenu(!menu)}
                        >
                            <UserAvatar user={user} size="small" />
                            <div>
                                <img src={Assets.downArrow} className='w-[12px] h-[12px] transition-all duration-300' alt="" />
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        {menu && <UserMenu user={user} onSignOut={handleSignOut} onCloseMenu={() => setMenu(false)} onProfileClick={handleProfileClick} />}
                    </div>
                )}
            </div>


            {/* Mobile Navigation - Visible only on mobile */}
            <div className='md:hidden flex items-center gap-3'>
                <NavIcons setCurrentPage={setCurrentPage} />
                <button
                    onClick={() => setMobileMenu(true)}
                    className='w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10'
                >
                    <svg className='w-6 h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Component */}
            <MobileMenu
                isOpen={mobileMenu}
                onClose={() => setMobileMenu(false)}
                user={user}
                isAuthenticated={isAuthenticated}
                setCurrentPage={setCurrentPage}
                onLoginClick={handleLoginClick}
                onSignOut={handleSignOut}
            />

            {/* Login Popup */}
            <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        </div>
    );
};

export default Navbar;