import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, ExternalLink, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './Message.css';

export function Message({ role, content, meta, onShowCitations, shouldAnimate = false, onFollowUpClick, isLastAssistant = false }) {
    const isUser = role === 'user';

    // Function to clean up numbers - remove .0 from whole numbers
    const cleanContent = (text) => {
        return text.replace(/\b(\d+)\.0\b/g, '$1');
    };

    const cleanedContent = cleanContent(content);

    // Disable animation for tables or very long content
    const hasTable = cleanedContent.includes('|') && cleanedContent.includes('\n');
    const isLongContent = cleanedContent.length > 500;
    const shouldDisableAnimation = hasTable || isLongContent;

    const [displayedContent, setDisplayedContent] = useState((!isUser && shouldAnimate && !shouldDisableAnimation) ? '' : cleanedContent);
    const [isTyping, setIsTyping] = useState(!isUser && shouldAnimate && !shouldDisableAnimation);

    React.useEffect(() => {
        if (isUser || !shouldAnimate || shouldDisableAnimation) {
            setDisplayedContent(cleanedContent);
            setIsTyping(false);
            return;
        }

        if (cleanedContent.length < 5) {
            setDisplayedContent(cleanedContent);
            setIsTyping(false);
            return;
        }

        const targetDuration = 2500;
        const typingSpeed = Math.max(5, Math.floor(targetDuration / cleanedContent.length));
        const charsPerTick = typingSpeed < 10 ? Math.ceil(10 / typingSpeed) : 1;
        const tickRate = typingSpeed < 10 ? 10 : typingSpeed;

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex >= cleanedContent.length) {
                setDisplayedContent(cleanedContent);
                setIsTyping(false);
                clearInterval(intervalId);
                return;
            }
            const nextIndex = Math.min(currentIndex + charsPerTick, cleanedContent.length);
            setDisplayedContent(cleanedContent.substring(0, nextIndex));
            currentIndex = nextIndex;
        }, tickRate);

        return () => clearInterval(intervalId);
    }, [cleanedContent, isUser, shouldAnimate, shouldDisableAnimation]);

    const followUps = meta?.follow_ups || [];
    const showFollowUps = !isUser && isLastAssistant && !isTyping && followUps.length > 0 && onFollowUpClick;

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
            >
                <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                    ${isUser
                        ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white'
                        : 'bg-white border border-gray-200 text-teal-600'}
                `}>
                    {isUser ? <User size={20} /> : <Bot size={20} />}
                </div>

                <div className={`
                    relative px-5 py-4 max-w-[98%] md:max-w-[90%] rounded-2xl shadow-sm text-sm leading-relaxed
                    ${isUser
                        ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}
                `}>
                    <div className="prose prose-sm max-w-none break-words min-h-[20px] overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
                        {!isUser && isTyping && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-teal-500 animate-pulse align-middle" />
                        )}
                    </div>

                    {!isUser && !isTyping && meta?.intent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2"
                        >
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium uppercase tracking-wide">
                                {getIntentEmoji(meta.intent)} {meta.intent}
                            </span>

                            {meta.citations?.length > 0 && (
                                <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors"
                                    onClick={() => onShowCitations(meta.citations)}
                                >
                                    <ExternalLink size={12} />
                                    View {meta.citations.length} source{meta.citations.length !== 1 ? 's' : ''}
                                </button>
                            )}

                            {meta.is_fallback && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                                    ⚠️ Fallback
                                </span>
                            )}

                            {meta.citations?.length > 0 && (
                                <div className="w-full mt-2 flex flex-wrap gap-2">
                                    {meta.citations.slice(0, 3).map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onShowCitations(meta.citations)}
                                            className="group flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md hover:border-teal-400 transition-colors text-left max-w-[200px]"
                                        >
                                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                                                {i + 1}
                                            </span>
                                            <span className="text-xs text-gray-600 truncate group-hover:text-teal-600">
                                                {c.title || 'Source'}
                                            </span>
                                        </button>
                                    ))}
                                    {meta.citations.length > 3 && (
                                        <button
                                            onClick={() => onShowCitations(meta.citations)}
                                            className="text-xs text-gray-400 hover:text-teal-500 transition-colors px-1"
                                        >
                                            +{meta.citations.length - 3} more
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Follow-up Questions — Perplexity-style bubbles */}
            {showFollowUps && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="ml-14 mt-4"
                >
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <ArrowUpRight size={12} className="text-teal-500" />
                        Follow-ups
                    </p>
                    <div className="flex flex-col gap-2">
                        {followUps.map((q, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                onClick={() => onFollowUpClick(q)}
                                className="group flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left text-sm text-gray-700 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-700 transition-all duration-200 shadow-sm hover:shadow-md w-fit max-w-[90%]"
                            >
                                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-teal-500 flex-shrink-0 transition-colors" />
                                <span>{q}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function getIntentEmoji(intent) {
    const map = {
        'product': '📊',
        'client': '👤',
        'general': '📚',
        'education': '📖',
        'complex': '🔀',
        'error': '❌'
    };
    return map[intent?.toLowerCase()] || '💬';
}
