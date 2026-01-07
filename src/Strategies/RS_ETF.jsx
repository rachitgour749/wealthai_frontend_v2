import React from 'react'

const RS_ETF = ({ onBack }) => {
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
                <h1 className='text-3xl font-bold text-wealth-900 mb-4'>RS ETF Strategy</h1>
                <p className='text-gray-600 mb-6'>Relative Strength based ETF trading strategy</p>

                <div className='space-y-4'>
                    <div className='p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200'>
                        <h2 className='text-xl font-bold text-wealth-800 mb-2'>Strategy Overview</h2>
                        <p className='text-gray-700'>
                            This strategy uses relative strength analysis to identify and invest in the strongest performing ETFs.
                            It follows momentum-based trend following principles for optimal market exposure.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='p-4 bg-white border-2 border-gray-200 rounded-lg'>
                            <h3 className='font-bold text-wealth-800 mb-2'>Key Features</h3>
                            <ul className='list-disc list-inside text-gray-700 space-y-1'>
                                <li>Relative strength ranking</li>
                                <li>Momentum-based selection</li>
                                <li>Trend following approach</li>
                                <li>Dynamic position sizing</li>
                            </ul>
                        </div>

                        <div className='p-4 bg-white border-2 border-gray-200 rounded-lg'>
                            <h3 className='font-bold text-wealth-800 mb-2'>Performance Metrics</h3>
                            <ul className='list-disc list-inside text-gray-700 space-y-1'>
                                <li>Sharpe Ratio: 2.1</li>
                                <li>Max Drawdown: -15%</li>
                                <li>Annual Return: 18%</li>
                                <li>Win Rate: 72%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RS_ETF