import React from 'react';
import { Plus, Trash2, X, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar({
    conversations,
    currentId,
    onSelect,
    onDelete,
    onNewChat,
    isOpen,
    toggleSidebar,
    isMobile
}) {
    const sortedConvs = Object.values(conversations).sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    const sidebarVariants = {
        open: {
            x: 0,
            width: "18rem",
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: isMobile ? "-100%" : 0,
            width: isMobile ? "18rem" : 0,
            opacity: isMobile ? 1 : 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Toggle Button when Closed */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 left-0 z-30 p-2 bg-wealth-800 text-white backdrop-blur-sm shadow-md rounded-r-lg hover:bg-wealth-700 transition-all border border-gray-200"
                >
                    <Menu size={24} />
                </button>
            )}

            <AnimatePresence mode="wait">
                {(isOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? "closed" : false}
                        animate={isOpen ? "open" : "closed"}
                        variants={sidebarVariants}
                        className={`
                            ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative h-full'}
                            bg-gradient-to-b from-wealth-800 to-wealth-900 border-r border-wealth-700/50
                            flex flex-col shadow-xl overflow-hidden whitespace-nowrap
                        `}
                    >
                        <div className="p-5 flex justify-between items-center border-b border-wealth-700/50 backdrop-blur-sm min-w-72">
                            <h2 className="text-white font-bold text-xl tracking-tight">Conversations</h2>
                            <button
                                className="text-teal-200 hover:text-white transition-colors p-1 hover:bg-wealth-700 rounded-md"
                                onClick={toggleSidebar}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 min-w-72">
                            <button
                                onClick={onNewChat}
                                className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>New Chat</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 space-y-1 min-w-72 scrollbar-thin scrollbar-thumb-wealth-700 scrollbar-track-transparent">
                            <AnimatePresence>
                                {sortedConvs.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center p-8 text-teal-200 text-sm"
                                    >
                                        No conversations yet.<br />Start a new chat!
                                    </motion.div>
                                ) : (
                                    sortedConvs.map(conv => (
                                        <motion.div
                                            key={conv.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onClick={() => onSelect(conv.id)}
                                            className={`
                                                group flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-colors
                                                ${conv.id === currentId
                                                    ? 'bg-wealth-700/50 border border-wealth-600'
                                                    : 'hover:bg-wealth-700/30 border border-transparent'}
                                            `}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className={`text-sm truncate font-medium ${conv.id === currentId ? 'text-teal-50' : 'text-teal-200 group-hover:text-teal-50'}`}>
                                                    {conv.title || 'New Chat'}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(conv.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-teal-400 hover:text-red-400 p-1 transition-opacity"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-teal-400">
                                                <span>
                                                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                                </span>
                                                <span>•</span>
                                                <span>{conv.messages.length} msgs</span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
