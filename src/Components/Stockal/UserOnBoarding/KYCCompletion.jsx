import React from 'react';
import { FileUp, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const KYCCompletion = ({ onComplete, onBack }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-wealth-800/5 rounded-full -mr-32 -mt-32"></div>

                <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-wealth-800 rounded-2xl text-[#f6cd9e] shadow-lg shadow-wealth-800/20">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-wealth-900 uppercase tracking-tight">KYC Completion</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Verify your identity to activate global trading</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-[#f0f9f6] border border-[#d1e9e0] rounded-2xl text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <FileUp size={24} className="text-wealth-800" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-black text-wealth-800 uppercase tracking-widest">Upload Documents</h3>
                                <p className="text-[10px] text-wealth-800/60 font-bold uppercase tracking-wider max-w-xs mx-auto">
                                    Please upload your PAN Card and Address Proof (Aadhar/Voter ID) in PDF or Image format.
                                </p>
                            </div>
                            <button className="px-6 py-2 bg-wealth-800 text-[#f6cd9e] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-wealth-900 transition-all">
                                Select Files
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl">
                            <AlertCircle size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Verification may take 24-48 business hours.</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12">
                        <button
                            onClick={onBack}
                            className="flex-1 py-4 border-2 border-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl hover:border-gray-200 transition-all active:scale-95"
                        >
                            Back
                        </button>
                        <button
                            onClick={onComplete}
                            className="flex-[2] py-4 bg-wealth-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            Complete Verification
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCCompletion;
