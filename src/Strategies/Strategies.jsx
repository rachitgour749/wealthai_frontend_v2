import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { strategies } from '../Data/Strategies'
import { setCurrentStrategy } from '../store/slices/navigationSlice'

const Strategies = () => {
    const dispatch = useDispatch()
    const [selectedTags, setSelectedTags] = useState([])
    const [showLiveOnly, setShowLiveOnly] = useState(true)

    // Extract unique tags from all strategies
    const allTags = [...new Set(strategies.flatMap(s => s.tags))]

    // Toggle tag selection (allow multiple)
    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else {
            setSelectedTags([...selectedTags, tag])
        }
    }

    // Handle strategy card click
    const handleStrategyClick = (strategy) => {
        if (strategy.available) {
            dispatch(setCurrentStrategy(strategy.id))
        }
    }

    // Filter strategies based on selected tags and Live/All toggle
    const filteredStrategies = strategies.filter(strategy => {
        // Filter by Live/All toggle
        const matchesLiveFilter = showLiveOnly ? strategy.available : true

        // Filter by selected tags (if any tags selected, strategy must have at least one)
        const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => strategy.tags.includes(tag))

        return matchesLiveFilter && matchesTags
    })

    return (
        <div className="h-full flex flex-col px-6 py-2">
            {/* Header with Filters and Toggle */}
            <div className="flex justify-between items-center mb-6">
                {/* Filter Tags */}
                <div className="flex gap-3 flex-wrap">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-5 py-[1px] rounded-[5px] text-[12px] font-medium transition-all duration-200 ${selectedTags.includes(tag)
                                ? 'bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.4)] hover:shadow-[0_6px_16px_rgba(13,148,136,0.5)]'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Live/All Toggle */}
                <div className="flex gap-2 bg-gray-50 rounded-full p-1 border border-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
                    <button
                        onClick={() => setShowLiveOnly(true)}
                        className={`px-3 py-[1px] rounded-full text-[12px] font-medium transition-all duration-200 ${showLiveOnly
                            ? 'bg-teal-600 text-white shadow-[0_3px_10px_rgba(13,148,136,0.4)]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                            }`}
                    >
                        LIVE
                    </button>
                    <button
                        onClick={() => setShowLiveOnly(false)}
                        className={`px-5 py-[1px] rounded-full text-[12px] font-medium transition-all duration-200 ${!showLiveOnly
                            ? 'bg-gray-600 text-white shadow-[0_3px_10px_rgba(75,85,99,0.4)]'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Strategy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                {filteredStrategies.map(strategy => (
                    <div
                        key={strategy.id}
                        onClick={() => handleStrategyClick(strategy)}
                        className={`
                      relative rounded-xl shadow-md overflow-hidden h-32
                      transition-all duration-300 ease-out transform-gpu
                      ${strategy.available
                                ? `bg-white border-2 ${strategy.borderColor} hover:shadow-xl hover:-translate-y-1 hover:scale-105 cursor-pointer`
                                : `bg-white border-2 border-gray-300 cursor-not-allowed ${!showLiveOnly ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-105' : ''}`
                            }
                    `}
                    >
                        {/* LIVE Badge */}
                        {strategy.available && (
                            <div className={`bg-gradient-to-br px-[10px] py-[5px] rounded-t-[10px] ${strategy.gradient}`}>
                                <span className="bg-white text-teal-600 text-xs font-semibold px-2 py-[1px] rounded-md shadow-sm">
                                    LIVE
                                </span>
                            </div>
                        )}

                        {/* COMING SOON Badge */}
                        {!strategy.available && (
                            <div className="bg-gradient-to-br from-gray-200 to-gray-300 px-[10px] py-[5px] rounded-t-[10px]">
                                <span className="bg-white text-gray-500 text-xs font-semibold px-2 py-[1px] rounded-md shadow-sm">
                                    COMING SOON
                                </span>
                            </div>
                        )}

                        {/* Strategy Content */}
                        <div className="flex flex-col items-center justify-center px-4">
                            <h3 className={`${strategy.available ? 'text-wealth-800' : 'text-gray-500'} mt-2 font-bold text-base mb-2 leading-tight`}>
                                {strategy.name}
                            </h3>
                            <p className="text-[12px] font-semibold text-center text-gray-500 leading-tight">
                                {strategy.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Custom Strategy Button */}
            <div className="flex flex-col items-center justify-center py-6 mt-auto">
                <button className="bg-gradient-to-r from-wealth-700 to-wealth-900 hover:transform hover:scale-105 text-white font-semibold px-8 py-3 rounded-full shadow-[0_6px_20px_rgba(13,148,136,0.4)] hover:shadow-[0_8px_28px_rgba(13,148,136,0.5)] transition-all duration-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Custom Strategy
                </button>
                <p className="text-gray-600 text-sm mt-3 text-center max-w-2xl">
                    Need a tailored solution? Our team can develop custom strategies for your specific requirements.
                </p>
            </div>
        </div>
    )
}

export default Strategies