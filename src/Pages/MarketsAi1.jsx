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
      case 'Optimization':
        return <Optimization />
      case 'Scanner':
        return <Scanner />
      default:
        return <Strategies />
    }
  }

  const tabs = [
    { label: 'Strategies', value: 'Strategies' },
    { label: 'Optimization', value: 'Optimization' },
    { label: 'Scanner', value: 'Scanner' },
  ]


  return (
    <div className='p-6'>
      <div className='relative h-[33px] flex'>
        <div className="absolute flex">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={`px-5 py-[2px] cursor-pointer flex justify-center items-center text-[18px] transition-all duration-300 ${currentTab === tab.value ? 'bg-slate-300 text-wealth-800 font-bold rounded-t-[10px]' : 'text-gray-500 hover:text-gray-700 font-semibold'
                }`}
              style={currentTab === tab.value ? {
                animation: 'tabActive 0.6s ease-out'
              } : {}}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="absolute px-4 py-[2px] right-0 flex gap-2 bg-slate-300 rounded-t-[10px]">
          <div className='flex gap-1'>
            <h1 className='font-bold text-gray-700 text-[18px]'>PlanName :</h1>
            <span className='text-wealth-800 text-[18px] font-bold'>{planName}</span>
          </div>
          <span className='text-slate-600 text-[18px]'>|</span>
          <div className='flex gap-1'>
            <h1 className='font-bold text-gray-700 text-[18px]'>Valid Till :</h1>
            <span className='text-wealth-800 text-[18px] font-bold'>{validTill}</span>
          </div>
        </div>

      </div>
      <div className={`h-[calc(100vh-162px)] mt-[-3px] p-4 shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] border border-slate-300 ${currentTab === 'Strategies' ? 'rounded-b-[10px]' : 'rounded-tl-[10px] rounded-b-[10px]'}`}>
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
