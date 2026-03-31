import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebhookJson = ({ data, onClose }) => {
    const [copied, setCopied] = useState(false);

    const jsonPayload = {
        run_id: data?.run_id || 'RUN_ID',
        strategy_type: "EXTERNAL",
        symbol: "{symbol}",
        exchnge: "NSE",
        order_side: "{BUY/SELL}",
        authorized_email: data?.user_id || 'user_email',
    };

    const handleCopy = () => {
        const text = JSON.stringify(jsonPayload, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!data) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-wealth-800 to-wealth-900 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Webhook JSON</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                Use this JSON payload for external signal providers (e.g., TradingView). 
                                Replace <span className="text-blue-900 font-bold">{`{symbol}`}</span> and 
                                <span className="text-blue-900 font-bold">{`{BUY/SELL}`}</span> with actual values in your alert message.
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute right-3 top-3 z-10">
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all shadow-sm ${
                                        copied 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-white/90 text-wealth-800 hover:bg-white border border-gray-200'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle2 size={12} />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={12} />
                                            Copy JSON
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="bg-wealth-900/5 rounded-lg border border-gray-200 p-4 font-mono text-[12px] text-wealth-800 leading-relaxed overflow-x-auto">
                                <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(jsonPayload, null, 2)}
                                </pre>
                                
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WebhookJson;
