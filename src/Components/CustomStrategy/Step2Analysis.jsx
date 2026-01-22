import React from 'react';
import { ArrowLeft, Edit2, ArrowRight } from 'lucide-react';

const AnalysisReviewStep = ({ analysisData, onBack, onEdit, onProceed, loading }) => {
    if (!analysisData) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <p className="text-gray-500">No analysis data available</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { complexity, estimated_development_time, key_features, technical_requirements, risk_factors } = analysisData;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">AI Strategy Analysis</h2>
                <p className="text-sm text-gray-600">
                    Review and edit the AI-generated analysis of your strategy
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <h3 className="text-base font-bold text-gray-800 mb-3">Strategy Complexity Rating</h3>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg font-bold text-sm ${complexity === 'Low' ? 'bg-green-100 text-green-700' :
                        complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {complexity || 'Medium'}
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-600">Estimated Development Time</div>
                        <div className="text-sm font-semibold text-gray-800">{estimated_development_time || '2-4 weeks'}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {/* Key Features */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">🎯 Key Features</h3>
                    <ul className="space-y-1.5">
                        {(key_features || []).map((feature, index) => (
                            <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                                <span className="text-teal-600 mt-0.5">•</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Technical Requirements */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">⚙️ Technical Requirements</h3>
                    <ul className="space-y-1.5">
                        {(technical_requirements || []).map((req, index) => (
                            <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Risk Factors */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">⚠️ Risk Factors</h3>
                    <ul className="space-y-1.5">
                        {(risk_factors || []).map((risk, index) => (
                            <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">•</span>
                                <span>{risk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Description
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={onEdit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-teal-700 bg-white border-2 border-teal-600 hover:bg-teal-50 transition-all flex items-center gap-1.5"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Description
                    </button>

                    <button
                        onClick={onProceed}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg font-semibold text-sm bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                        Proceed to Contact
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                    <span className="font-bold">Note:</span> This is an AI-generated analysis. Our team will review your strategy in detail and provide a comprehensive quote.
                </p>
            </div>
        </div>
    );
};

export default AnalysisReviewStep;
