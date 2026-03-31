import React from 'react';
import { AnimatePresence } from 'framer-motion';
import WebhookTableRow from './WebhookTableRow';

const WebhookTable = ({ 
    webhooks, 
    visibleKeys, 
    toggleKeyVisibility, 
    onToggleStatus, 
    onDelete, 
    actionLoading,
    onOpenJsonModal 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Strategy Details</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Category</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Source</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">RA Code</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Webhook URL</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Webhook JSON</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Status</th>
                            <th className="px-6 py-2 text-[11px] font-medium text-gray-500 uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        <AnimatePresence mode="popLayout">
                            {webhooks && webhooks.map((webhook) => (
                                <WebhookTableRow 
                                    key={webhook.run_id}
                                    webhook={webhook}
                                    visibleKeys={visibleKeys}
                                    toggleKeyVisibility={toggleKeyVisibility}
                                    onToggleStatus={onToggleStatus}
                                    onDelete={onDelete}
                                    actionLoading={actionLoading}
                                    onOpenJsonModal={onOpenJsonModal}
                                />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WebhookTable;
