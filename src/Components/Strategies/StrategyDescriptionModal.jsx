import React, { useState, useEffect } from 'react';

const StrategyDescriptionModal = ({ isOpen, onClose, strategyId }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && strategyId) {
            fetchContent();
        }
    }, [isOpen, strategyId]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            // Map strategy IDs to their HTML files
            const fileMap = {
                'ETF': 'ETF.html',
                'RS_ETF': 'RS_ETF.html',
                'ETF_Payout': 'ETF_Payout.html',
                'International_ETF_Rotation': 'ETF_US.html',
                'ETF_Rotation': 'ETF.html' // Fallback for rotation if named differently
            };

            const fileName = fileMap[strategyId] || 'ETF.html';
            const response = await fetch(`/Descriptions/${fileName}`);
            if (response.ok) {
                const html = await response.text();
                setContent(html);
            } else {
                setContent('<div style="padding: 20px; text-align: center; color: #718096;">Documentation not found.</div>');
            }
        } catch (error) {
            console.error('Error fetching strategy description:', error);
            setContent('<div style="padding: 20px; text-align: center; color: #718096;">Error loading documentation.</div>');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-5xl h-[85vh] md:h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-bottom bg-wealth-900 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-wealth-100/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-wealth-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold">Strategy Documentation</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-[#f8fafc]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-wealth-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-wealth-600 font-medium animate-pulse">Loading Documentation...</span>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            title="Strategy Description"
                            srcDoc={content}
                            className="w-full h-full border-none"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-wealth-50 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg- wealth-900 border border-wealth-900 text-wealth-900 bg-transparent hover:bg-wealth-50 font-bold rounded-lg transition-all active:scale-95 text-sm"
                        style={{ borderColor: '#0f3d39', color: '#0f3d39' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StrategyDescriptionModal;
