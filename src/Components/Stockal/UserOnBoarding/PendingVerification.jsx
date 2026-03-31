import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const PendingVerification = ({ status, reason }) => {
    const isRejected = status === 'REJECTED';

    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 transition-transform hover:rotate-0 ${isRejected ? 'bg-red-50 text-red-500 shadow-red-500/10' : 'bg-wealth-800/10 text-wealth-800 shadow-wealth-800/10'}`}>
                {isRejected ? <AlertCircle size={48} /> : <Clock size={48} className="animate-pulse" />}
            </div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-3xl font-black text-wealth-900 tracking-tight uppercase">
                    {isRejected ? 'Application Rejected' : 'Verification Pending'}
                </h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    {reason || (isRejected
                        ? 'Your application was rejected by the compliance team. Please contact support for more details.'
                        : 'Your KYC application is currently under review by our compliance team. This typically takes 24-48 business hours.')
                    }
                </p>
                <div className="pt-4 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f9f6] text-wealth-800 text-[10px] font-black uppercase tracking-widest rounded-full border border-[#add4c4]">
                        <CheckCircle2 size={14} />
                        Documents Uploaded
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 w-full max-w-sm">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    We will notify you via email at your registered address once the status is updated.
                </p>
            </div>
        </div>
    );
};

export default PendingVerification;
