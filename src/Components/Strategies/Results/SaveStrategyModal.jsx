import React, { useState } from 'react';
import { X } from 'lucide-react';

const SaveStrategyModal = ({ isOpen, onClose, onSave, onDeployRequest, loading }) => {
    const [strategyName, setStrategyName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const validateName = (name) => {
        if (!name.trim()) {
            return 'Strategy name is required';
        }
        if (name.length > 25) {
            return 'Strategy name cannot exceed 25 characters';
        }
        return '';
    };

    const handleSave = async () => {
        const validationError = validateName(strategyName);
        if (validationError) {
            setError(validationError);
            return;
        }
        // Call onSave and if successful, trigger deploy request
        await onSave(strategyName);
        // After save is complete, ask if user wants to deploy
        if (onDeployRequest) {
            onDeployRequest(strategyName);
        }
    };

    const handleInputChange = (e) => {
        setStrategyName(e.target.value);
        if (error) setError('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-[scaleIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-teal-900 tracking-tight">Save Strategy</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="">
                        <label className="block text-[11px] font-bold text-teal-800 uppercase tracking-widest mb-2 ml-1">
                            Strategy Name
                        </label>
                        <input
                            type="text"
                            value={strategyName}
                            onChange={handleInputChange}
                            placeholder="e.g. My Monthly Alpha Rotation"
                            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 bg-red-50/10' : 'border-gray-200 focus:border-teal-500'} bg-white text-gray-800 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-[14px]`}
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-xs text-red-500 font-medium ml-1">
                                {error}
                            </p>
                        )}
                        <p className="mt-2 text-[10px] text-gray-400 font-medium ml-1">
                            {strategyName.length} / 25 characters
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-200 transition-all uppercase tracking-wider"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-8 py-2 rounded-xl text-[12px] font-bold text-white uppercase tracking-wider shadow-lg transition-all ${loading
                            ? 'bg-teal-700/50 cursor-not-allowed'
                            : 'bg-teal-800 hover:bg-teal-900 shadow-teal-900/10 hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </div>
                        ) : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveStrategyModal;
