import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectProducts } from '../store/slices/subscriptionSlice'
import { selectUserEmail } from '../store/slices/userSlice'
import { selectCurrentTab, selectCurrentStrategy, setCurrentTab, setCurrentStrategy } from '../store/slices/navigationSlice'
import { formatDate, getSubscriptionByProduct } from '../utils/dateUtils'
import Optimization from '../Components/Optimization'
import Scanner from '../Components/Scanner'
import Strategies from '../Strategies/Strategies'
import ETF from '../Strategies/ETF'
import RS_ETF from '../Strategies/RS_ETF'
import ETF_Payout from '../Strategies/ETF_Payout'
import ETF_US from '../Strategies/ETF_US'
import MyPortfolio from '../Components/MyPortfolio/MyPortfolio'
import CustomStrategies from '../Components/CustomStrategies'

const MarketsAi1 = () => {
  const dispatch = useDispatch()
  const currentTab = useSelector(selectCurrentTab)
  const currentStrategy = useSelector(selectCurrentStrategy)
  const subscriptionProducts = useSelector(selectProducts)
  const userEmail = useSelector(selectUserEmail)

  // Get MARKETAI subscription
  const subscription = getSubscriptionByProduct(subscriptionProducts, 'MARKETAI')
  const planName = subscription?.plan_name || 'N/A'
  const validTill = subscription?.subscription_end_date ? formatDate(subscription.subscription_end_date) : 'N/A'

  const handleTabChange = (tab) => {
    dispatch(setCurrentTab(tab))
  }

  const handleBackToStrategies = () => {
    dispatch(setCurrentStrategy(null))
  }

  const renderStrategyDetail = () => {
    switch (currentStrategy) {
      case 'etf-strategy':
        return <ETF onBack={handleBackToStrategies} />
      case 'RS-ETF-strategy':
        return <RS_ETF onBack={handleBackToStrategies} />
      case 'etf-strategy-payout':
        return <ETF_Payout onBack={handleBackToStrategies} />
      case 'etf-strategy-us':
        return <ETF_US onBack={handleBackToStrategies} />
      case 'custom-strategy':
        return <CustomStrategies onBack={handleBackToStrategies} />
      default:
        return null
    }
  }

  const renderTab = () => {
    // If a strategy is selected, show strategy detail
    if (currentStrategy) {
      return renderStrategyDetail()
    }

    // Otherwise show the tab content
    switch (currentTab) {
      case 'MyPortfolio':
        return <MyPortfolio />
      default:
        return <Strategies />
    }
  }

  const tabs = [
    { label: 'Strategies', value: 'Strategies' },
    { label: 'My Portfolio', value: 'MyPortfolio' },
  ]


  return (
    <div className='p-1 md:p-4'>
      <div className='relative h-[32px] md:h-[35px] flex mb-0'>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={`px-2 md:px-4 py-[2px] cursor-pointer flex justify-center items-center text-[12px] md:text-[16px] transition-all duration-300 ${currentTab === tab.value
                ? 'bg-slate-300 text-wealth-800 font-bold rounded-t-[10px] shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(0,0,0,0.05)] border-t border-x border-slate-400 border-b-0 relative z-10'
                : 'text-gray-500 hover:text-gray-700 font-semibold hover:-translate-y-0.5'
                }`}
              style={currentTab === tab.value ? {
                animation: 'tabActive 0.6s ease-out',
                marginBottom: '-1px'
              } : {}}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Desktop Info Display */}
        <div className="absolute px-2 py-[3px] right-0 top-0 hidden md:flex gap-2 bg-slate-300 rounded-t-[10px] border-slate-400 border border-b-0 z-10 h-full items-center" style={{ marginBottom: '-1px' }}>
          <div className='flex gap-1 items-center'>
            <h1 className='font-bold text-gray-700 text-[15px]'>PlanName :</h1>
            <span className='text-wealth-800 text-[15px] font-bold'>{planName}</span>
          </div>
          <span className='text-slate-600 text-[15px]'>|</span>
          <div className='flex gap-1 items-center'>
            <h1 className='font-bold text-gray-700 text-[15px]'>Valid Till :</h1>
            <span className='text-wealth-800 text-[15px] font-bold'>{validTill}</span>
          </div>
        </div>

        {/* Mobile Info Display */}
        <div className="md:hidden ml-auto flex flex-col items-center justify-center gap-0.5 px-2 py-1 bg-slate-300 rounded-t-[10px] border-t border-x border-slate-400 border-b-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(0,0,0,0.05)] min-w-0 shrink-0" style={{ marginBottom: '-1px' }}>
          <span className="text-wealth-800 text-[10px] sm:text-[11px] font-bold whitespace-nowrap">{planName}</span>
          <span className="text-gray-600 text-[8px] sm:text-[9px] font-medium whitespace-nowrap">Till: {validTill}</span>
        </div>

      </div>
      <div className={`h-[calc(100vh-135px)] md:h-[calc(100vh-140px)] p-1 md:p-4 overflow-y-auto shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] border border-slate-400 ${currentTab === 'Strategies' ? 'rounded-b-[10px]' : 'rounded-tl-[10px] rounded-b-[10px]'}`}>
        {renderTab()}
      </div>

      {/* Tab Button Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes tabActive {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `
      }} />
    </div>
  )
}

export default MarketsAi1
