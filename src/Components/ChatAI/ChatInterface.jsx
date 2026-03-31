import React, { useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from './Message';
import { VoiceInput } from './VoiceInput';

export function ChatInterface({
    messages,
    isLoading,
    onSend,
    activeClient,
    onShowCitations
}) {
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [animatingMsgId, setAnimatingMsgId] = React.useState(null);
    const prevMessagesLen = useRef(0);

    // Track new messages for animation
    useEffect(() => {
        if (messages.length === prevMessagesLen.current + 1) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.id) {
                setAnimatingMsgId(lastMsg.id);
            }
        } else if (messages.length !== prevMessagesLen.current) {
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
        <main className="flex-1 flex flex-col min-w-0 w-full h-full">
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
                            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-600">
                                Welcome back!
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                I'm your AI financial assistant. Can I help you with product details or client portfolios today?
                            </p>

                            <div className="flex flex-col items-center gap-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-teal-500" /> Suggested Queries
                                </h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {["What is HDFC Multi Asset Fund?", "What is ELSS?", "HDFC Top 100 Expense Ratio"].map((q, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-3 bg-white border border-gray-200 rounded-full text-gray-700 text-sm hover:border-teal-500 hover:shadow-md transition-all"
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
                                {messages.map((msg, idx) => {
                                    // Only show follow-ups on the last assistant message
                                    const isLastAssistant = msg.role === 'assistant' && 
                                        idx === messages.map((m, i) => m.role === 'assistant' ? i : -1).filter(i => i >= 0).pop();
                                    return (
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
                                            onFollowUpClick={onSend}
                                            isLastAssistant={isLastAssistant}
                                        />
                                    </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 p-4 bg-white rounded-2xl w-fit shadow-sm border border-gray-100"
                                >
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                                    </div>
                                    <span className="text-sm text-gray-500">Analyzing...</span>
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
                    <div className="relative group bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all">
                        <div className="p-4 pr-32">
                            <textarea
                                ref={textareaRef}
                                placeholder="Ask anything about finance..."
                                onKeyDown={handleKeyDown}
                                onInput={autoResize}
                                rows={1}
                                disabled={isLoading}
                                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none p-0 text-gray-900 placeholder-gray-400 resize-none max-h-40 scrollbar-hide"
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
                        <span className="text-xs text-gray-400">Powered by WealthWisers</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
