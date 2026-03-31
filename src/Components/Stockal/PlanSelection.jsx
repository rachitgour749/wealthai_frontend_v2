import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { fetchStockalPlanList, activateStockalPlan, fetchStockalAccountInfo } from '../../store/slices/stockalSlice';

const PlanSelection = ({ custId, onPlanActivated }) => {
    const dispatch = useDispatch();
    const { plans, loading } = useSelector((state) => state.stockal);

    useEffect(() => {
        dispatch(fetchStockalPlanList());
    }, [dispatch]);

    const handleActivatePlan = async (planId) => {
        const result = await dispatch(activateStockalPlan({ custId, planId }));
        if (activateStockalPlan.fulfilled.match(result)) {
            // Success! Refresh account info and notify parent
            await dispatch(fetchStockalAccountInfo(custId));
            if (onPlanActivated) {
                onPlanActivated();
            }
        }
    };

    if (loading.plans && plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 text-wealth-600 animate-spin" />
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Premium Plans...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center p-3 bg-wealth-100 rounded-2xl text-wealth-700 mb-2"
                >
                    <Sparkles size={24} />
                </motion.div>
                <h2 className="text-3xl font-black text-wealth-900 tracking-tight">Choose Your Global Strategy</h2>
                <p className="text-gray-500 font-medium uppercase tracking-wider text-xs max-w-md mx-auto leading-relaxed">
                    Select a plan to unlock international markets and start your global investment journey today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.planId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative group bg-white border-2 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-wealth-800/10 ${plan.isDefault ? 'border-wealth-800' : 'border-gray-100'}`}
                    >
                        {plan.isDefault && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-wealth-800 text-[#f6cd9e] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                Recommended
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-wealth-900">{plan.planName}</h3>
                                    <div className="flex items-center gap-2 text-wealth-600">
                                        <ShieldCheck size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Global Access</span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl ${plan.isDefault ? 'bg-wealth-100 text-wealth-800' : 'bg-gray-50 text-gray-400'}`}>
                                    <CreditCard size={20} />
                                </div>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    'Trade in US Equities & ETFs',
                                    'Real-time Market Data',
                                    'Advanced Analysis Tools',
                                    'Dividend Tracking'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-wealth-50 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-wealth-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            disabled={loading.activatingPlan}
                            onClick={() => handleActivatePlan(plan.planId)}
                            className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${plan.isDefault 
                                ? 'bg-wealth-800 text-[#f6cd9e] hover:bg-wealth-900 shadow-xl shadow-wealth-800/20' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {loading.activatingPlan ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    Activate {plan.planName}
                                    <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        →
                                    </motion.span>
                                </>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="pt-4 border-t border-gray-100 w-full flex justify-center grayscale opacity-40">
                <div className="flex gap-8 items-center">
                    <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Premium Support</span>
                    <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Zero Extra Fees</span>
                    <span className="text-[10px] font-bold text-wealth-800 uppercase tracking-widest">Instant Activation</span>
                </div>
            </div>
        </div>
    );
};

export default PlanSelection;
