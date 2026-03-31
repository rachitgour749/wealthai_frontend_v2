import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { strategies } from '../Data/Strategies'
import { setCurrentStrategy } from '../store/slices/navigationSlice'
import { Bot, Info, X } from 'lucide-react'

const StrategyCard = ({ strategy, onClick, onInfoClick }) => {
    const isActive = strategy.available && strategy.category === 'Active';
    const isInactive = strategy.category === 'Inactive';
    
    return (
        <div
            onClick={() => isActive ? onClick(strategy) : null}
            className={`
                relative rounded-[10px] overflow-hidden h-24 md:h-[110px]
                transition-all duration-300 ease-out transform-gpu
                ${isActive
                    ? `bg-white border-2 ${strategy.market == 'US' ? 'border-[#ac947b]' : 'border-wealth-800'} shadow-[0_4px_4px_0_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1.5 active:translate-y-0.5 active:shadow-none cursor-pointer`
                    : isInactive 
                        ? `bg-gray-100 border-2 border-gray-300 cursor-not-allowed grayscale opacity-70`
                        : `bg-white border-2 border-gray-300 cursor-not-allowed opacity-80`
                }
            `}
        >
            {/* Badge */}
            <div className={`px-1.5 md:px-2 py-1 md:py-1.5 flex justify-between items-center ${isActive ? `bg-gradient-to-br ${strategy.market == 'US' ? 'from-[#e9cdaa] to-[#90785b]' : 'from-wealth-700 to-wealth-900'}` : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                <span className={`text-[10px] md:text-[10px] font-semibold px-1 md:px-1.5 py-[0.5px] rounded shadow-sm bg-white ${isActive && strategy.market == 'US' ? 'text-[#8f7b66]' : 'text-wealth-800'}`}>
                    {strategy.category === 'Active' ? 'Active' : 'Coming Soon'}
                </span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onInfoClick(strategy);
                    }}
                    className={`text-white hover:scale-110 transition-transform p-0.5 rounded-full hover:bg-white/20`}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center px-2 md:px-4 py-1 md:py-2">
                <h3 className={`${isActive && strategy.market == 'US' ? 'text-[#ac947b]' : 'text-wealth-800'} font-semibold text-[12px] text-center mb-1`}>
                    {strategy.name}
                </h3>
                <p className="text-[8px] md:text-[10px] font-medium text-center text-gray-500 leading-tight line-clamp-2">
                    {strategy.description}
                </p>
            </div>
        </div>
    )
}

const DocumentationModal = ({ strategy, isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && strategy && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative z-10"
                    >
                        {/* Header */}
                        <div className="bg-[#1b3b36] text-white px-5 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-white/10 p-1 rounded-md text-teal-100 border border-white/10">
                                    <Info size={16} />
                                </div>
                                <h2 className="text-[15px] font-bold tracking-tight">Strategy Documentation</h2>
                            </div>
                            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 overflow-y-auto max-h-[70vh]">
                            {/* Featured Card */}
                            <div className="bg-[#1b5c54] rounded-xl p-5 mb-6 text-white shadow-lg">
                                <h1 className="text-xl font-bold mb-3">{strategy.name}</h1>
                                <p className="text-teal-50 text-[13px] leading-relaxed opacity-95">
                                    {strategy.longDescription || strategy.description}
                                </p>
                            </div>

                            {/* Executive Summary Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 border-l-4 border-[#1b5c54] pl-3 py-0.5">
                                    <h3 className="text-[16px] font-bold text-[#202b36]">Executive Summary</h3>
                                </div>
                                <p className="text-gray-600 text-[13px] leading-relaxed pl-4 italic">
                                    {strategy.executiveSummary || "Detailed executive summary is currently being finalized for this strategy. Please check back later for full documentation."}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#eafdf6] border-t border-teal-100/50 px-5 py-3 flex justify-end rounded-b-2xl">
                            <button 
                                onClick={onClose}
                                className="bg-white border border-[#1b5c54] text-[#1b5c54] font-bold px-6 py-1.5 rounded-lg shadow-sm hover:bg-teal-50/50 transition-colors text-[13px]"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

const Strategies = () => {
    const dispatch = useDispatch()
    const [selectedTags, setSelectedTags] = useState([])
    const [isDocModalOpen, setIsDocModalOpen] = useState(false)
    const [selectedStrategyForDoc, setSelectedStrategyForDoc] = useState(null)

    const allTags = [...new Set(strategies.flatMap(s => s.tags || []))]

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else {
            setSelectedTags([...selectedTags, tag])
        }
    }

    const handleStrategyClick = (strategy) => {
        if (strategy.available) {
            dispatch(setCurrentStrategy(strategy.id))
        }
    }

    const handleCustomStrategyClick = () => {
        dispatch(setCurrentStrategy('custom-strategy'))
    }

    const handleInfoClick = (strategy) => {
        setSelectedStrategyForDoc(strategy)
        setIsDocModalOpen(true)
    }

    // Filter logic: 
    // 1. Separate by market
    // 2. Apply tag filters if any selected
    const indianStrategies = strategies.filter(strategy => {
        const isIndia = strategy.market === 'India' || !strategy.market

        // Hide Coming Soon for India (optional, based on request)
        if (isIndia && !strategy.available) return false

        const matchesTags = selectedTags.length === 0 ||
            (strategy.tags && selectedTags.some(tag => strategy.tags.includes(tag)))

        return isIndia && matchesTags
    })

    const usStrategies = strategies.filter(strategy => {
        const isUS = strategy.market === 'US'

        const matchesTags = selectedTags.length === 0 ||
            (strategy.tags && selectedTags.some(tag => strategy.tags.includes(tag)))

        return isUS && matchesTags
    })

    return (
        <div className="h-full flex flex-col px-1 md:px-4 py-1 md:py-2 overflow-y-auto">
            {/* Header with Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3 max-w-7xl w-full">
                <div className="flex gap-1 justify-between items-center w-full">
                    <div className='flex gap-1 items-center border'>{allTags.map(tag => (
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
                    ))}</div>
                    <div className="flex flex-col items-center justify-center py-2 md:py-4 mt-auto">
                        <button
                            onClick={handleCustomStrategyClick}
                            className="bg-gradient-to-r from-wealth-700 to-wealth-900 hover:transform hover:scale-105 text-white font-semibold px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-md transition-all duration-300 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm"
                        >
                            <Bot size={16} />Custom Strategy
                        </button>
                    </div>

                </div>
            </div>

            {/* Indian Strategies Section */}
            {indianStrategies.length > 0 && (
                <div className="max-w-7xl mx-auto w-full mb-4 mt-[-7px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-wealth-800/30 to-wealth-800/30"></div>
                        <h2 className="text-[12px] md:text-[14px] font-bold text-wealth-800 uppercase tracking-[0.2em] whitespace-nowrap">
                            Indian Strategies
                        </h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-wealth-800/30 to-wealth-800/30"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                        {indianStrategies.map(strategy => (
                            <StrategyCard 
                                key={strategy.id} 
                                strategy={strategy} 
                                onClick={handleStrategyClick} 
                                onInfoClick={handleInfoClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* US Strategies Section */}
            {usStrategies.length > 0 && (
                <div className="max-w-7xl mx-auto w-full mb-6 md:mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#ac947b]/30 to-[#ac947b]/30"></div>
                        <h2 className="text-[12px] md:text-[14px] font-bold text-[#ac947b] uppercase tracking-[0.2em] whitespace-nowrap">
                            US Strategies
                        </h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#ac947b]/30 to-[#ac947b]/30"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                        {usStrategies.map(strategy => (
                            <StrategyCard 
                                key={strategy.id} 
                                strategy={strategy} 
                                onClick={handleStrategyClick} 
                                onInfoClick={handleInfoClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Create Custom Strategy Button */}

            {/* Strategy Documentation Modal */}
            <DocumentationModal 
                isOpen={isDocModalOpen}
                strategy={selectedStrategyForDoc}
                onClose={() => setIsDocModalOpen(false)}
            />
        </div>
    )
}

export default Strategies