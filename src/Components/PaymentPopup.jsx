import { useState, useEffect } from 'react'
import { useSubscription } from '../hooks/useSubscription'

const PaymentPopup = ({ isOpen, onClose, initialPlan = 'MarketAI' }) => {
    const { isProductActive, isProductInTrial, getProductDaysRemaining } = useSubscription()
    const [isLoading, setIsLoading] = useState(true)
    const [currentPlan, setCurrentPlan] = useState(initialPlan)

    useEffect(() => {
        setCurrentPlan(initialPlan)
    }, [initialPlan, isOpen])


    // Function to get the correct plan file based on selection
    const getPlanFile = (plan) => {
        switch (plan) {
            case 'ChatAI':
                return '/PaymentsPlan/ChatAi_Plan.html'
            case 'MarketAI':
                return '/PaymentsPlan/MarketAI_Plan.html'
            case 'AutomationAI':
                return '/PaymentsPlan/AutomationAI_Plan.html'
            case 'TradeAI':
                return '/PaymentsPlan/TradAI_Plan.html' // Image 2 shows TradAI_Plan.html
            case 'WealthAI_Combo':
                return '/PaymentsPlan/WealthAI_Plan.html'
            default:
                return '/PaymentsPlan/MarketAI_Plan.html' // Default to Market AI
        }
    }

    // Function to get the plan title
    const getPlanTitle = (plan) => {
        switch (plan) {
            case 'ChatAI':
                return 'Chat AI Payment Plans'
            case 'MarketAI':
                return 'Market AI Payment Plans'
            case 'AutomationAI':
                return 'Automation AI Payment Plans'
            case 'TradeAI':
                return 'Trade AI Payment Plans'
            case 'WealthAI_Combo':
                return 'WealthAI Combos Payment Plans'
            default:
                return 'AI Payment Plans'
        }
    }

    // Function to handle plan change
    const handlePlanChange = (plan) => {
        console.log('Changing plan to:', plan)

        // Simply switch to the selected plan without checking for trial
        setCurrentPlan(plan)
        setIsLoading(true)
        // Fallback timeout in case iframe doesn't load
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
    }

    // Function to handle iframe load
    const handleIframeLoad = () => {
        console.log('Iframe loaded successfully for plan:', currentPlan)
        setIsLoading(false)
    }

    // Function to handle iframe error
    const handleIframeError = () => {
        console.error('Iframe failed to load for plan:', currentPlan)
        setIsLoading(false)
    }


    useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            // Simulate loading time
            const timer = setTimeout(() => {
                setIsLoading(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // Prevent background page scroll while popup is open
    useEffect(() => {
        if (isOpen) {
            const previousOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = previousOverflow
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            {/* Modal */}
            <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-[900px] h-[550px] mt-[-50px] overflow-hidden animate-in zoom-in-95 duration-300" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#178d76b6] to-wealth-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-medium text-white mb-[7px]">Subscription <span className="text-white">Plans</span></h2>

                        </div>

                        <button
                            onClick={onClose}
                            className="text-[#ffffffb6] hover:text-gray-200 text-3xl font-medium transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between w-[330px] mt-[-2px]">
                        <button
                            onClick={() => handlePlanChange('TradeAI')}
                            className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300 ${currentPlan === 'TradeAI'
                                ? 'bg-wealth-900 text-[#fcf9dafd] shadow-lg'
                                : 'bg-wealth-800 text-[#fffeeffd] hover:bg-wealth-900'
                                }`}
                        >
                            TradeAI1
                        </button>
                        <button
                            onClick={() => handlePlanChange('MarketAI')}
                            className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300  ${currentPlan === 'MarketAI'
                                ? 'bg-wealth-900 text-[#fcf9dafd] shadow-lg'
                                : 'bg-wealth-800 text-[#fffeeffd] hover:bg-wealth-900'
                                }`}
                        >
                            MarketsAI1
                        </button>

                        <button
                            onClick={() => handlePlanChange('WealthAI_Combo')}
                            className={`text-[12px] font-semibold h-[25px] w-[100px] rounded-[5px] transition-all duration-300 ${currentPlan === 'WealthAI_Combo'
                                ? 'bg-wealth-900 text-[#fffeeffd] shadow-lg'
                                : 'bg-wealth-800 text-[#fffeeffd] hover:bg-wealth-900'
                                }`}
                        >
                            Combo
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="h-[470px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading payment options...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <iframe
                                src={getPlanFile(currentPlan)}
                                className="w-full h-full"
                                title={getPlanTitle(currentPlan)}
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentPopup
