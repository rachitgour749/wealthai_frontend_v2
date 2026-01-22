import React from 'react';
import { Rocket, X } from 'lucide-react';

const DeployConfirmationModal = ({ isOpen, onClose, onDeploy, strategyName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-wealth-800 to-wealth-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Rocket size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Deploy Strategy</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        Your strategy <span className="font-semibold text-wealth-800">"{strategyName}"</span> has been saved successfully!
                    </p>
                    <p className="text-gray-600 text-sm mt-3">
                        Would you like to deploy this strategy now?
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDeploy}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-wealth-800 hover:bg-wealth-900 transition-colors shadow-lg"
                    >
                        Deploy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeployConfirmationModal;
