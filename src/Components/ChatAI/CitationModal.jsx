import React from 'react';
import { X } from 'lucide-react';

export function CitationModal({ isOpen, onClose, citations }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
                    <h3 className="text-xl font-bold text-gray-800">Source Citations</h3>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
                    {citations.map((c, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                </span>
                                <span className="font-semibold text-gray-800">{c.title || 'Document'}</span>
                            </div>
                            {c.snippet && (
                                <div className="text-sm text-gray-600 italic ml-9 mb-2">
                                    "{c.snippet}"
                                </div>
                            )}
                            <div className="text-xs text-gray-500 ml-9 flex items-center gap-1">
                                <span>📄</span>
                                <span>{c.source || 'File Search'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
