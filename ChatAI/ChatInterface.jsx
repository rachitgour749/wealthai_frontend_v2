import React, { useRef, useEffect } from 'react';
import { Send, Menu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from './Message';
import { ThemeToggle } from './ThemeToggle';
import { VoiceInput } from './VoiceInput';

export function ChatInterface({
    messages,
    isLoading,
    onSend,
    activeClient,
    onShowCitations,
    toggleSidebar
}) {
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [animatingMsgId, setAnimatingMsgId] = React.useState(null);
    const prevMessagesLen = useRef(0);

    // Track new messages for animation
    useEffect(() => {
        // If length increased by 1, it's a new message
        if (messages.length === prevMessagesLen.current + 1) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.id) {
                setAnimatingMsgId(lastMsg.id);
            }
        }
        // If length changed drastically (history load) or 0
        else if (messages.length !== prevMessagesLen.current) {
            setAnimatingMsgId(null);
        }

        prevMessagesLen.current = messages.length;
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        const val = textareaRef.current.value.trim();
        if (val) {
            onSend(val);
            textareaRef.current.value = '';
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleVoiceInput = (text) => {
        if (textareaRef.current) {
            const currentVal = textareaRef.current.value;
            // Append with space if needed
            textareaRef.current.value = currentVal ? `${currentVal} ${text}` : text;
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    };

    const autoResize = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 w-full h-full transition-colors duration-300">
            {/* Theme Toggle & Client Info */}
            {/* <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                {activeClient && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-full border border-teal-100 dark:border-teal-800/50 backdrop-blur-sm">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Client:</span>
                        <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">{activeClient}</span>
                    </div>
                )}
                <ThemeToggle />
            </div> */}

            {/* Chat Container */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 px-4 max-w-2xl mx-auto"
                        >
                            <div className="text-6xl mb-6 animate-bounce">👋</div>
                            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-600 dark:from-teal-200 dark:to-teal-400">
                                Welcome back!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                                I'm your AI financial assistant. Can I help you with product details or client portfolios today?
                            </p>

                            <div className="flex flex-col items-center gap-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-gold-500" /> Suggested Queries
                                </h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {["What is HDFC Multi Asset Fund?", "What is ELSS?", "HDFC Top 100 Expense Ratio"].map((q, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 text-sm hover:border-gold-500 dark:hover:border-gold-500 hover:shadow-md transition-all"
                                            onClick={() => onSend(q)}
                                        >
                                            {q}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-6 pb-4">
                            <AnimatePresence>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Message
                                            {...msg}
                                            onShowCitations={onShowCitations}
                                            shouldAnimate={msg.id === animatingMsgId}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl w-fit shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Analyzing...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="backdrop-blur-sm p-4 pb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all">
                        <div className="p-4 pr-32"> {/* Right padding for buttons */}
                            <textarea
                                ref={textareaRef}
                                placeholder="Ask anything about finance..."
                                onKeyDown={handleKeyDown}
                                onInput={autoResize}
                                rows={1}
                                disabled={isLoading}
                                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none max-h-40 scrollbar-hide"
                                style={{ minHeight: '24px' }}
                            />
                        </div>

                        <div className="absolute right-2 bottom-2 flex items-center gap-2">
                            <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
                            <button
                                className="p-2.5 bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                onClick={handleSend}
                                disabled={isLoading}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 px-2">
                        {/* <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded">
                            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].meta?.intent
                                ? `Intent: ${messages[messages.length - 1].meta.intent}`
                                : 'Ready to help'}
                        </span> */}
                        <span className="text-xs text-gray-400 dark:text-gray-600">Powered by WealthWisers</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
