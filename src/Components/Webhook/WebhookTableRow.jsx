import React from 'react';
import { Trash2, Eye, EyeOff, Loader2, Copy, Key, FileBraces, PauseCircle, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WebhookTableRow = ({ 
    webhook, 
    visibleKeys, 
    toggleKeyVisibility, 
    onToggleStatus, 
    onDelete, 
    actionLoading,
    onOpenJsonModal 
}) => {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <motion.tr
            key={webhook.run_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group hover:bg-gray-50/50 transition-colors"
        >
            {/* Strategy Details */}
            <td className="px-6 py-1">
                <div className="flex flex-col text-center">
                    <span className="text-[12px] font-bold text-gray-700">
                        {webhook.name || 'Unnamed'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                        {webhook.strategy_type || 'Custom'}
                    </span>
                </div>
            </td>


            {/* Category */}
            <td className="px-6 py-1 text-center">
                <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {webhook.category || '-'}
                </span>
            </td>

            {/* Source */}
            <td className="px-6 py-1 text-center">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    webhook.source === 'RA' 
                    ? 'bg-blue-50 text-wealth-800 border-wealth-200' 
                    : 'bg-purple-50 text-wealth-800 border-wealth-200'
                }`}>
                    {webhook.source || '-'}
                </span>
            </td>

            {/* RA Code */}
            <td className="px-6 py-1 text-center">
                <span className="text-[11px] font-medium text-gray-600">
                    {webhook.source === 'RA' ? (webhook.ra_code || '-') : <span className="text-gray-300">N/A</span>}
                </span>
            </td>

            {/* Webhook URL */}
            <td className="px-6 py-1 text-center">
                {webhook.source === 'INDIVIDUAL' ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col max-w-[220px]">
                            <code className="text-[11px] font-mono text-wealth-800 truncate bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {visibleKeys[webhook.run_id] 
                                    ? `https://8sx9uc9pfy.ap-south-1.awsapprunner.com/api/webhook/trade_execute/${webhook.secret_key}` 
                                    : '••••••••••••••••••••••••••••••'}
                            </code>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => toggleKeyVisibility(webhook.run_id)}
                                className="p-1 text-gray-400 hover:text-wealth-800 transition-colors rounded-md hover:bg-wealth-800/10"
                                title={visibleKeys[webhook.run_id] ? "Hide URL" : "Show Full URL"}
                            >
                                {visibleKeys[webhook.run_id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                                onClick={() => handleCopy(`https://8sx9uc9pfy.ap-south-1.awsapprunner.com/api/webhook/trade_execute/${webhook.secret_key}`)}
                                className="p-1 text-gray-400 hover:text-wealth-800 transition-colors rounded-md hover:bg-wealth-800/10"
                                title="Copy Full URL"
                            >
                                <Copy size={13} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <span className="text-[11px] text-gray-300 font-medium">N/A</span>
                )}
            </td>

            {/* Webhook JSON Utility */}
            <td className="px-6 py-1 text-center">
                {webhook.source === 'INDIVIDUAL' ? (
                    <button
                        onClick={() => onOpenJsonModal(webhook)}
                        className="p-[4px] text-wealth-800 hover:text-white hover:bg-wealth-800 transition-all rounded-full border border-teal-300 bg-teal-50 shadow-sm active:scale-95"
                        title="View JSON Format"
                    >
                        <Eye size={16} />
                    </button>
                ) : (
                    <span className="text-[11px] text-gray-300 font-medium">N/A</span>
                )}
            </td>

            {/* Status */}
            <td className="px-6 py-1 text-center">
                <div className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    webhook.status === 'active'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                    {webhook.status}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-1 text-right">
                <div className="flex items-center justify-end gap-1">
                    <button
                        disabled={actionLoading === webhook.run_id}
                        onClick={() => onToggleStatus(webhook.run_id, webhook.status)}
                        className={`p-1.5 rounded-lg transition-all text-gray-300 ${
                            webhook.status === 'active'
                            ? 'hover:text-amber-500 hover:bg-amber-50'
                            : 'hover:text-green-500 hover:bg-green-50'
                        }`}
                        title={webhook.status === 'active' ? "Pause Webhook" : "Restart Webhook"}
                    >
                        {actionLoading === webhook.run_id ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            webhook.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />
                        )}
                    </button>
                    <button
                        disabled={actionLoading === webhook.run_id}
                        onClick={() => onDelete(webhook.run_id)}
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Webhook"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

export default WebhookTableRow;
