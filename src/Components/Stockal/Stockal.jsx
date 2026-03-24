import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, Heart, TrendingUp, Bell, CircleDollarSign, ArrowRight, XCircle } from 'lucide-react';
import Home from './Home';
import Orders from './Orders';
import Account from './Account';
import UserOnBoarding from './UserOnBoarding/UserOnBoarding';
import PendingVerification from './UserOnBoarding/PendingVerification';
import { setCurrentTab } from '../../store/slices/navigationSlice';
import { validateStockalUser, fetchEkycStatus, fetchStockalAccountInfo } from '../../store/slices/stockalSlice';
import { Loader2 } from 'lucide-react';

const Stockal = () => {

    const tabs = [
        { label: 'Home', value: 'Home', icon: <LayoutDashboard /> },
        { label: 'Orders', value: 'Orders', icon: <Package /> },
        { label: 'Watchlist', value: 'Watchlist', icon: <Heart /> },
        { label: 'Portfolio', value: 'Portfolio', icon: <TrendingUp /> },
        { label: 'Alerts', value: 'Alerts', icon: <Bell /> },
        { label: 'Transactions', value: 'Transactions', icon: <CircleDollarSign /> },
    ];

    const [activeTab, setActiveTab] = useState('Home');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const dispatch = useDispatch();

    const { isUserValidated, custId, kycStatus, kycStatusReason, mainKycStatus, mainKycStatusReason, isInitializing } = useSelector((state) => state.stockal);
    const { user } = useSelector((state) => state.user);
    const userEmail = user?.email;

    useEffect(() => {
        if (userEmail) {
            dispatch(validateStockalUser(userEmail));
        }
    }, [userEmail, dispatch]);

    useEffect(() => {
        if (isUserValidated && custId) {
            dispatch(fetchEkycStatus(custId));
            dispatch(fetchStockalAccountInfo(custId));
        }
    }, [isUserValidated, custId, dispatch]);

    useEffect(() => {
        if (isUserValidated && (kycStatus === 'APPROVED' || mainKycStatus === 'APPROVED')) {
            setActiveTab('Home');
        } else if (!isUserValidated) {
            setActiveTab('Account');
        }
    }, [isUserValidated, kycStatus, mainKycStatus]);

    const handleTabChange = (tab) => {
        if (!isUserValidated && tab !== 'Account') {
            return;
        }
        setActiveTab(tab);
    };

    const handleOnboardingStart = () => {
        // The logic for determining the step is now handled by currentOnboardingStep
        setShowOnboarding(true);
    };

    const handleCancel = () => {
        dispatch(setCurrentTab('Strategies'));
    };

    const shouldShowOnboarding = showOnboarding || (isUserValidated && (
        kycStatus === 'NOT_INITIATED' || kycStatus === 'EXPIRED' || kycStatus === 'REJECTED' ||
        mainKycStatus === 'REJECTED' || mainKycStatus === 'EXPIRED'
    ));
    const currentOnboardingStep = (isUserValidated && (kycStatus === 'NOT_INITIATED' || kycStatus === 'EXPIRED' || kycStatus === 'REJECTED' || mainKycStatus === 'REJECTED' || mainKycStatus === 'EXPIRED')) ? 2 : onboardingStep;

    const renderTab = () => {
        switch (activeTab) {
            case 'Home':
                return <Home />
            case 'Orders':
                return (<Orders onTabChange={handleTabChange} />)
            case 'Watchlist':
                return (<>Watchlist</>)
            case 'Portfolio':
                return (<>Portfolio</>)
            case 'Alerts':
                return (<>Alerts</>)
            case 'Account':
                return (<Account />)
            default:
                return null
        }
    };

    const renderContent = () => {
        // Robust check for statuses
        const currentKycStatus = kycStatus?.toUpperCase() || '';
        const currentMainKycStatus = mainKycStatus?.toUpperCase() || '';
        
        const isPending = currentKycStatus === 'PENDING' || currentMainKycStatus === 'PENDING';
        const isApproved = currentKycStatus === 'APPROVED' || currentMainKycStatus === 'APPROVED';

        console.log('Stockal Render Logic:', { 
            kycStatus: currentKycStatus, 
            mainKycStatus: currentMainKycStatus, 
            isPending, 
            isApproved, 
            isInitializing 
        });

        if (isInitializing) {
            return (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="text-wealth-800 animate-spin" />
                    <p className="text-[10px] font-black text-wealth-800 uppercase tracking-widest animate-pulse">Initializing Portal...</p>
                </div>
            );
        }

        if (isPending) {
            const status = currentMainKycStatus === 'PENDING' ? mainKycStatus : kycStatus;
            const reason = currentMainKycStatus === 'PENDING' ? mainKycStatusReason : kycStatusReason;
            return <PendingVerification status={status} reason={reason} />;
        }

        if (isApproved) {
            return renderTab();
        }

        if (shouldShowOnboarding) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full p-4 overflow-y-auto custom-scrollbar"
                >
                    <UserOnBoarding
                        onCancel={() => setShowOnboarding(false)}
                        initialStep={currentOnboardingStep}
                    />
                </motion.div>
            );
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full w-full flex flex-col items-center justify-center text-center p-6 space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 3 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="w-14 h-14 bg-wealth-800 rounded-2xl flex items-center justify-center shadow-xl shadow-wealth-800/20 transform transition-transform hover:rotate-0 cursor-default"
                    >
                        <CircleDollarSign size={28} className="text-[#f6cd9e]" />
                    </motion.div>

                    <div className="space-y-3 max-w-xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl md:text-4xl font-black text-wealth-900 tracking-tight"
                        >
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-wealth-800 to-[#c5ae78]">Stockal</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-base text-gray-500 font-medium leading-relaxed uppercase tracking-wider"
                        >
                            {kycStatus === 'REJECTED' || kycStatus === 'EXPIRED'
                                ? `Your KYC status is ${kycStatus.toLowerCase()}. Please update your documents to continue trading in international markets.`
                                : 'Your gateway to global investment opportunities. Complete your onboarding to start trading in international markets.'
                            }
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-3 w-full max-sm mb-4"
                    >
                        <button
                            onClick={handleOnboardingStart}
                            className="flex-1 group flex items-center justify-center gap-2 px-6 py-3 bg-wealth-800 text-[#f6cd9e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-wealth-900 transition-all shadow-[0_8px_16px_-4px_rgba(15,61,57,0.3)] active:scale-[0.98]"
                        >
                            {isUserValidated ? 'Continue KYC' : 'Onboarding'}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-red-100 hover:text-red-500 transition-all active:scale-[0.98]"
                        >
                            <XCircle size={16} />
                            Cancel
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1 }}
                        className="pt-8 border-t border-gray-100 w-full max-w-lg"
                    >
                        <div className="flex justify-around items-center grayscale">
                            <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Global Access</span>
                            <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Safe & Secure</span>
                            <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Easy Transfers</span>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    const showSidebar = isUserValidated && (
        (kycStatus?.toUpperCase() === 'APPROVED' || mainKycStatus?.toUpperCase() === 'APPROVED') &&
        (kycStatus?.toUpperCase() !== 'PENDING' && mainKycStatus?.toUpperCase() !== 'PENDING')
    );

    return (
        <div className='h-full w-full flex'>
            {showSidebar && (
                <div className='border border-wealth-800 relative bg-wealth-900 flex flex-col justify-start items-center gap-[11px] text-white w-16 h-full rounded-l-[10px] p-1 pt-4 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)]'>
                    {tabs.map((tab) => (
                        <div
                            key={tab.value}
                            className={`group relative border-2 p-[6px] rounded-full flex items-center justify-center h-8 w-8 cursor-pointer ${activeTab === tab.value ? 'bg-[#c5ae78]/20 border-[#c5ae78] text-[#c5ae78] transition-all duration-300 scale-110' : 'bg-white/10'}`}
                            onClick={() => handleTabChange(tab.value)}
                        >
                            {tab.icon ? tab.icon : tab.label}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {tab.label}
                            </div>
                        </div>
                    ))}
                    <div className={`group border-2 absolute bottom-4 rounded-full flex items-center justify-center h-10 w-10 cursor-pointer ${activeTab === "Account" ? 'bg-[#c5ae78]/20 border-[#c5ae78] text-[#c5ae78] transition-all duration-200 scale-110' : 'bg-[#0f3d39]/10'}`}
                        onClick={() => handleTabChange("Account")}
                    >
                        A
                        <div className="absolute left-full ml-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            Account
                        </div>
                    </div>
                </div>
            )}
            <div className={`border border-gray-300 w-full h-full p-1 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] ${showSidebar ? 'rounded-r-[10px]' : 'rounded-[10px]'}`}>
                {renderContent()}
            </div>
        </div>
    )
}

export default Stockal