import React from 'react';
import { AlertCircle } from 'lucide-react';

const WebhookEmptyState = ({ onOpenModal }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-[6px] border border-gray-300 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <AlertCircle size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-700">No Webhooks Found</h3>
                <p className="text-gray-500 text-sm">You haven't configured any webhooks yet.</p>
                <button 
                    onClick={onOpenModal}
                    className="mt-4 text-wealth-800 font-bold hover:underline"
                >
                    Create your first webhook
                </button>
            </div>
        </div>
    );
};

export default WebhookEmptyState;
