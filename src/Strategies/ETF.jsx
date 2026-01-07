import React from 'react'

const ETF = ({ onBack }) => {
    return (
        <div className='h-full flex flex-col'>
            {/* Back Button */}
            <button
                onClick={onBack}
                className='mb-4 flex items-center gap-2 text-wealth-800 hover:text-wealth-900 font-semibold transition-colors'
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Strategies
            </button>

            {/* Page Content */}
            <div className='flex-1 bg-white rounded-lg shadow-md p-6'>
                <h1 className='text-3xl font-bold text-wealth-900 mb-4'>ETF Rotation Strategy</h1>
                <p className='text-gray-600 mb-6'>Mean Reversion & Low Volatility ETFs rotation strategy</p>

                <div className='space-y-4'>
                    <div className='p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-400'>
                        <h2 className='text-xl font-bold text-wealth-800 mb-2'>Strategy Overview</h2>
                        <p className='text-gray-700'>
                            This strategy focuses on rotating between ETFs based on mean reversion and low volatility principles.
                            It aims to capture market inefficiencies while maintaining a stable risk profile.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='p-4 bg-white border-2 border-gray-200 rounded-lg'>
                            <h3 className='font-bold text-wealth-800 mb-2'>Key Features</h3>
                            <ul className='list-disc list-inside text-gray-700 space-y-1'>
                                <li>Mean reversion based selection</li>
                                <li>Low volatility focus</li>
                                <li>Automated rebalancing</li>
                                <li>Risk-adjusted returns</li>
                            </ul>
                        </div>

                        <div className='p-4 bg-white border-2 border-gray-200 rounded-lg'>
                            <h3 className='font-bold text-wealth-800 mb-2'>Performance Metrics</h3>
                            <ul className='list-disc list-inside text-gray-700 space-y-1'>
                                <li>Sharpe Ratio: 1.8</li>
                                <li>Max Drawdown: -12%</li>
                                <li>Annual Return: 15%</li>
                                <li>Win Rate: 68%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ETF