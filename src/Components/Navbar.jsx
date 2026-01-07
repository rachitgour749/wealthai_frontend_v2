import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/userSlice';
import { handleLogout } from '../handlers/authHandler';
import { Assets } from '../assets/Assets';
import LoginPopup from './LoginPopup';
import UserAvatar from './Navbar/UserAvatar';
import UserMenu from './Navbar/UserMenu';
import NavIcons from './Navbar/NavIcons';
import MobileMenu from './Navbar/MobileMenu';

const Navbar = ({ setCurrentPage }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const [menu, setMenu] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const handleSignOut = () => {
        handleLogout(dispatch);
        setMenu(false);
    };

    const handleLoginClick = () => {
        setShowLoginPopup(true);
    };

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
                <div className='text-xl md:text-3xl lg:text-4xl font-bold'>
                    <span className='text-wealth-900'>Wealth</span>
                    <span className='text-gold-300'>Wisers</span>
                </div>
                <p className='text-xs md:text-sm lg:text-md font-semibold text-gold-300 mt-[-3px] md:mt-[-5px]'>Product Portal</p>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className='hidden md:flex relative items-center gap-4'>
                <NavIcons setCurrentPage={setCurrentPage} />

                {isAuthenticated && (
                    <div className='relative'>
                        <div
                            className='ml-[10px] w-[55px] h-[32px] flex justify-center items-center gap-[5px] rounded-full pr-[7px] transition-all duration-300 cursor-pointer bg-white/70 hover:bg-white/90'
                            onClick={() => setMenu(!menu)}
                        >
                            <UserAvatar user={user} size="small" />
                            <div>
                                <img src={Assets.downArrow} className='w-[12px] h-[12px] transition-all duration-300' alt="" />
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        {menu && <UserMenu user={user} onSignOut={handleSignOut} />}
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