import React from 'react';
import { ArrowLeft, Mail, Phone, CheckCircle } from 'lucide-react';

const ContactInformationStep = ({ phoneNumber, onPhoneChange, onBack, onSubmit, loading }) => {
    const isValidPhone = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-4">
                <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Contact Information</h2>
                <p className="text-sm text-gray-600">
                    Provide your contact details to receive strategy updates and notifications
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Phone className="w-4 h-4" />
                    </div>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            onPhoneChange(value);
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        disabled={loading}
                    />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                    {phoneNumber.length > 0 && (
                        <span className={`text-xs font-medium ${isValidPhone ? 'text-green-600' : 'text-orange-600'}`}>
                            {isValidPhone ? '✓ Valid phone number' : `⚠ ${phoneNumber.length}/10 digits`}
                        </span>
                    )}
                </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 mb-4 border border-teal-200">
                <h3 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    What Happens Next?
                </h3>
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <p className="text-xs text-gray-700">Our team will review your strategy description and AI analysis</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <p className="text-xs text-gray-700">We'll contact you within 24-48 hours to discuss requirements and pricing</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <p className="text-xs text-gray-700">Once approved, development begins with regular progress updates</p>
                    </div>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="text-xs text-gray-600">
                    <span className="font-bold">🔒 Privacy:</span> Your contact information and strategy details are kept confidential and will only be used to communicate about your custom strategy development.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Analysis
                </button>

                <button
                    onClick={onSubmit}
                    disabled={!isValidPhone || loading}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${isValidPhone && !loading
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Submit Strategy
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContactInformationStep;
