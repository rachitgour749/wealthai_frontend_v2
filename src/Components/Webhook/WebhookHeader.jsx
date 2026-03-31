import React from 'react';
import { Plus } from 'lucide-react';

const WebhookHeader = ({ onOpenModal }) => {
    return (
        <header className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-medium text-wealth-900">Webhook Management</h1>
            </div>
            <button 
                onClick={onOpenModal}
                className="flex items-center gap-3 px-5 py-1 bg-gradient-to-r from-wealth-800 to-wealth-900 text-white shadow-sm rounded-[6px] hover:shadow-lg transition-all active:scale-95"
            >
                <Plus size={16} />
                Create Webhook
            </button>
        </header>
    );
};

export default WebhookHeader;
