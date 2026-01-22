import React from 'react';
import { Plus, Trash2, Settings, X, Menu } from 'lucide-react';
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
    isMobile,
    setIsAdmin
}) {
    const sortedConvs = Object.values(conversations).sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    const sidebarVariants = {
        open: {
            x: 0,
            width: "18rem", // w-72
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
                    className="absolute top-4 left-0 z-30 p-2 bg-teal-900 text-white dark:bg-gray-800/80 backdrop-blur-sm shadow-md rounded-r-lg hover:text-teal-600 dark:hover:text-teal-400 transition-all border border-gray-200 dark:border-gray-700"
                >
                    <Menu size={24} />
                </button>
            )}

            <AnimatePresence mode="wait">
                {(isOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? "closed" : false} // Don't animate initial load on desktop if open
                        animate={isOpen ? "open" : "closed"}
                        variants={sidebarVariants}
                        className={`
                            ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative h-full'}
                            bg-gradient-to-b from-teal-900 to-teal-950 border-r border-teal-800/50
                            flex flex-col shadow-xl overflow-hidden whitespace-nowrap
                        `}
                    >
                        <div className="p-5 flex justify-between items-center border-b border-teal-800/50 backdrop-blur-sm min-w-72">
                            <h2 className="text-white font-bold text-xl tracking-tight">Conversations</h2>
                            {/* Close/Toggle Button inside Sidebar */}
                            <button
                                className="text-teal-200 hover:text-white transition-colors p-1 hover:bg-teal-800 rounded-md"
                                onClick={toggleSidebar}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 min-w-72">
                            <button
                                onClick={onNewChat}
                                className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-gold-900/20 hover:shadow-gold-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>New Chat</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 space-y-1 min-w-72 scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-transparent">
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
                                                    ? 'bg-teal-800/50 border border-teal-700'
                                                    : 'hover:bg-teal-800/30 border border-transparent'}
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

                        {/* <div className="p-4 border-t border-teal-800 min-w-72">
                            <div className="flex items-center gap-2 p-2 text-teal-300 hover:text-teal-50 hover:bg-teal-800 rounded-lg transition-colors"
                                onClick={() => setIsAdmin(true)}
                            >
                                <Settings size={18} />
                                <span>Admin Panel</span>
                            </div>
                        </div> */}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
