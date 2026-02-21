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

    // Handle custom strategy button click
    const handleCustomStrategyClick = () => {
        dispatch(setCurrentStrategy('custom-strategy'))
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
        <div className="h-full flex flex-col px-1 md:px-4 py-1 md:py-2">
            {/* Header with Filters and Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3 mb-2 md:mb-4 max-w-7xl mx-auto w-full">
                {/* Filter Tags */}
                <div className="flex gap-1 md:gap-2 flex-wrap">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-1.5 md:px-3 py-[1px] rounded-[5px] text-[8px] md:text-[11px] font-medium transition-all duration-200 ${selectedTags.includes(tag)
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 shadow-sm'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Live/All Toggle */}
                <div className="flex gap-1 md:gap-1.5 bg-gray-50 rounded-full p-0.5 md:p-1 border border-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
                    <button
                        onClick={() => setShowLiveOnly(true)}
                        className={`px-2 md:px-3 py-[1px] rounded-full text-[8px] md:text-[11px] font-medium transition-all duration-200 ${showLiveOnly
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        LIVE
                    </button>
                    <button
                        onClick={() => setShowLiveOnly(false)}
                        className={`px-2 md:px-3 py-[1px] rounded-full text-[8px] md:text-[11px] font-medium transition-all duration-200 ${!showLiveOnly
                            ? 'bg-gray-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Strategy Cards Grid - 1→2→3→5→6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-6 max-w-7xl mx-auto w-full">
                {filteredStrategies.map(strategy => (
                    <div
                        key={strategy.id}
                        onClick={() => handleStrategyClick(strategy)}
                        className={`
                      relative rounded-xl overflow-hidden h-24 md:h-28
                      transition-all duration-300 ease-out transform-gpu
                      ${strategy.available
                                ? `bg-white border-2 ${strategy.borderColor} shadow-[0_4px_4px_0_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1.5 active:translate-y-0.5 active:shadow-none cursor-pointer`
                                : `bg-white border-2 border-gray-300 cursor-not-allowed opacity-80`
                            }
                    `}
                    >
                        {/* LIVE Badge */}
                        {strategy.available && (
                            <div className={`bg-gradient-to-br px-1.5 md:px-2 py-0.5 md:py-1 ${strategy.gradient}`}>
                                <span className="bg-white text-teal-600 text-[7px] md:text-[9px] font-bold px-1 md:px-1.5 py-[0.5px] rounded shadow-sm">
                                    LIVE
                                </span>
                            </div>
                        )}

                        {/* COMING SOON Badge */}
                        {!strategy.available && (
                            <div className="bg-gradient-to-br from-gray-200 to-gray-300 px-1.5 md:px-2 py-0.5 md:py-1">
                                <span className="bg-white text-gray-500 text-[7px] md:text-[9px] font-bold px-1 md:px-1.5 py-[0.5px] rounded shadow-sm">
                                    COMING SOON
                                </span>
                            </div>
                        )}

                        {/* Strategy Content */}
                        <div className="flex flex-col items-center justify-center px-2 md:px-4 py-1 md:py-2">
                            <h3 className={`${strategy.available ? 'text-wealth-800' : 'text-gray-500'} font-bold text-[10px] md:text-sm mb-0.5 md:mb-1 leading-tight text-center`}>
                                {strategy.name}
                            </h3>
                            <p className="text-[8px] md:text-[10px] font-medium text-center text-gray-500 leading-tight line-clamp-2">
                                {strategy.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Custom Strategy Button */}
            <div className="flex flex-col items-center justify-center py-2 md:py-4 mt-auto">
                <button
                    onClick={handleCustomStrategyClick}
                    className="bg-gradient-to-r from-wealth-700 to-wealth-900 hover:transform hover:scale-105 text-white font-semibold px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-md transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm"
                >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Custom Strategy
                </button>
                <p className="text-gray-600 text-[8px] md:text-[11px] mt-1 md:mt-2 text-center max-w-xl px-2">
                    Need a tailored solution? Our team can develop custom strategies for your specific requirements.
                </p>
            </div>
        </div>
    )
}

export default Strategies