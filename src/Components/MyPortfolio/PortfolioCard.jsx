import { useDispatch } from 'react-redux';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { setCurrentPage, setCurrentStrategy } from '../../store/slices/navigationSlice';

const PortfolioCard = ({ strategy, showOwnerEmail }) => {
    const dispatch = useDispatch();
    const isPositive = strategy.pnl >= 0;

    const handleCardClick = () => {
        dispatch(setCurrentPage('PortfolioAnalytics'));
        dispatch(setCurrentStrategy(strategy.run_id));
    };

    // Helper: Determine style based on strategy name/type
    const getStyle = (name) => {
        const lowerName = name?.toLowerCase() || '';

        if (lowerName.includes('payout')) {
            return {
                gradient: 'from-orange-200 to-orange-300',
                borderColor: 'border-orange-200',
                badgeColor: 'text-orange-700',
                backGradient: 'from-orange-400 to-orange-600'
            };
        }
        if (lowerName.includes('us')) {
            return {
                gradient: 'from-cyan-200 to-cyan-300',
                borderColor: 'border-cyan-200',
                badgeColor: 'text-cyan-700',
                backGradient: 'from-cyan-400 to-cyan-600'
            };
        }
        if (lowerName.includes('rs')) {
            return {
                gradient: 'from-purple-200 to-purple-300',
                borderColor: 'border-purple-200',
                badgeColor: 'text-purple-700',
                backGradient: 'from-purple-400 to-purple-600'
            };
        }
        // Default
        return {
            gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
            borderColor: 'border-emerald-400',
            badgeColor: 'text-teal-700',
            backGradient: 'from-emerald-400 to-teal-600'
        };
    };

    const style = getStyle(strategy.strategy_name);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Inline styles for 3D flip to avoid dependency on global CSS classes not present
    const styles = {
        perspective: { perspective: '1000px' },
        transformStyle: { transformStyle: 'preserve-3d' },
        backfaceInvisible: { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' },
        rotateY180: { transform: 'rotateY(180deg)' },
        rotateY0: { transform: 'rotateY(0deg)' }
    };

    return (
        <div
            className="group h-full cursor-pointer"
            style={styles.perspective}
            onClick={handleCardClick}
        >
            <div className={`
                relative w-full h-full transition-all duration-700
                rounded-xl shadow-[0_4px_4px_0_rgba(0,0,0,0.05)]
            `}
                style={styles.transformStyle}
            >
                {/* We use a CSS class for hover to cleaner syntax, but wrap the transform in inline style if needed, 
                    or rely on Tailwind group-hover if project has it configured. 
                    Given standard Tailwind 'group-hover:rotate-y-180' might not exist, 
                    we'll add a simple style injection or use a more robust way. 
                    
                    Simpler approach: Just put the transform logic in the className assuming standard tailwind setup 
                    doesn't include rotate-y-180 by default usually (unless plugin).
                    
                    We'll use a style block for the specific hover behavior to be safe.
                */}
                <style>{`
                    .flip-card-inner {
                        transition: transform 0.7s;
                        transform-style: preserve-3d;
                    }
                    .group:hover .flip-card-inner {
                        transform: rotateY(180deg);
                    }
                    /* Custom Scrollbar for Clients List */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.5);
                    }
                `}</style>

                <div className="flip-card-inner w-full h-full relative">

                    {/* --- FRONT SIDE --- */}
                    <div className={`
                        absolute top-0 left-0 w-full h-full 
                        flex flex-col bg-white overflow-hidden rounded-xl border-2 ${style.borderColor}
                    `}
                        style={styles.backfaceInvisible}
                    >
                        {/* Header Strip with Gradient */}
                        <div className={`mr-[-1px] bg-gradient-to-br px-3 py-2 flex justify-center items-center ${style.gradient}`}>
                            <div className="text-center text-white text-sm leading-tight">
                                <div className='font-medium'>{strategy.strategy_name}</div>
                                {showOwnerEmail ? <div className='text-[11.5px]'>{strategy.owner_email}</div> : <></>}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 flex flex-col flex-grow justify-between bg-white">
                            {/* Metrics Grid */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[14px] border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Invested Value</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(strategy.total_invested)}</span>
                                </div>

                                <div className="flex justify-between items-center text-[14px] border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Market Value</span>
                                    <span className="text-wealth-800 font-bold">{formatCurrency(strategy.market_value)}</span>
                                </div>

                                <div className="flex justify-between items-center text-[14px]">
                                    <span className="text-gray-500 font-medium">Total Returns</span>
                                    <div className={`flex items-center gap-1 font-extrabold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        <span>{strategy.return_pct}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- BACK SIDE --- */}
                    <div className={`
                        absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden p-2 text-white
                        bg-gradient-to-br ${style.backGradient}
                        flex flex-col border border-white/20
                    `}
                        style={{ ...styles.backfaceInvisible, transform: 'rotateY(180deg)' }}
                    >
                        {/* Status */}
                        <div className="flex justify-between items-center mb-[2px]">
                            <span className="text-[10px] uppercase tracking-wider opacity-90">STATUS</span>
                            <span className={`px-2 py-[2px] h-[18px] flex justify-center items-center mt-[-4px] rounded-full text-[10px] font-medium border lowercase ${(strategy.running_status || 'running').toLowerCase() === 'running'
                                ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-sm'
                                : (strategy.running_status || '').toLowerCase().includes('deploy')
                                    ? 'bg-gray-500/90 border-gray-400 text-white shadow-sm'
                                    : (strategy.running_status || '').toLowerCase().includes('stop') || (strategy.running_status || '').toLowerCase().includes('stope')
                                        ? 'bg-red-500/90 border-red-400 text-white shadow-sm'
                                        : 'bg-white/20 border-white/30'
                                }`}>
                                {strategy.running_status || 'running'}
                            </span>
                        </div>

                        {/* Owner */}
                        <div className="mb-1 flex justify-between items-center gap-3">
                            <span className="text-[10px] uppercase tracking-wider opacity-80">OWNER</span>
                            <div className="font-medium text-sm leading-tight truncate">
                                {strategy.owner_name || 'Wealthwisers Financial Services'}
                            </div>
                        </div>

                        {/* Clients Box */}
                        <div className="flex-grow flex flex-col min-h-0">
                            <span className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
                                CLIENTS ({strategy.clients?.length || 0})
                            </span>

                            <div className="bg-white/10 rounded-lg border border-white/20 flex-grow overflow-hidden flex flex-col">
                                <div className="overflow-y-auto px-1 custom-scrollbar">
                                    {strategy.clients && strategy.clients.length > 0 ? (
                                        <div className="space-y-1.5 pt-1 pb-1">
                                            {strategy.clients.map((client, index) => (
                                                <div key={index} className="bg-white/10 rounded px-2 py-1 flex justify-between items-center text-[12px] border border-white/10">
                                                    <span className="font-medium tracking-wide">{client.client_code}</span>
                                                    <span className="opacity-90">Cap: {formatCurrency(client.capital)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[10px] opacity-70 italic">
                                            No clients
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PortfolioCard;
