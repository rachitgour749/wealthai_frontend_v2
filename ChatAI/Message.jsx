import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, ChevronDown, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import './Message.css';

function ThinkingProcess({ content, meta }) {
    const [isOpen, setIsOpen] = useState(false);

    // Extract tool code and thought
    const toolMatch = content.match(/tool_code\n([\s\S]*?)(?=\n\n|\n$)/);
    const thoughtMatch = content.match(/thought\n([\s\S]*?)(?=\n\n|\n$)/);

    // Extract unique folders from citations
    const uniqueFolders = new Set();
    if (meta?.citations) {
        meta.citations.forEach(c => {
            if (c.uri) {
                const parts = c.uri.split('/');
                if (parts.length > 2) uniqueFolders.add(parts[parts.length - 2]);
            }
        });
    }
    const folderList = Array.from(uniqueFolders).join(', ');

    const hasContent = toolMatch || thoughtMatch || folderList;
    if (!hasContent) return null;

    const toolCode = toolMatch ? toolMatch[1] : '';
    const thoughtText = thoughtMatch ? thoughtMatch[1] : 'Processing query...';

    return (
        <div className="mb-4">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 cursor-pointer py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-fit select-none"
            >
                <Settings size={14} className="text-gray-500 animate-[spin_10s_linear_infinite]" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Thinking Process
                </span>
                {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </div>

            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-2 ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 text-sm space-y-3 overflow-hidden"
                >
                    {toolCode && (
                        <div className="bg-gray-900 rounded-md p-3 overflow-x-auto text-xs font-mono text-gray-300">
                            <div className="text-gray-500 mb-1 font-semibold uppercase tracking-wider text-[10px]">Tool Used</div>
                            <pre>{toolCode}</pre>
                        </div>
                    )}
                    {thoughtText && (
                        <div className="text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                            <span className="not-italic font-semibold text-teal-600 dark:text-teal-400 text-xs block mb-1">REASONING</span>
                            {thoughtText}
                        </div>
                    )}
                    {folderList && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📂 Searched in:</span>
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{folderList}</span>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

export function Message({ role, content, meta, onShowCitations, shouldAnimate = false }) {
    // Clean content by removing thought/tool blocks
    const cleanContent = content
        .replace(/tool_code\n[\s\S]*?(?=\n\n|\n$)/g, '')
        .replace(/thought\n[\s\S]*?(?=\n\n|\n$)/g, '')
        .trim();

    const isUser = role === 'user';
    const [displayedContent, setDisplayedContent] = useState((!isUser && shouldAnimate) ? '' : cleanContent);
    const [isTyping, setIsTyping] = useState(!isUser && shouldAnimate);

    React.useEffect(() => {
        if (isUser || !shouldAnimate) {
            setDisplayedContent(cleanContent);
            setIsTyping(false);
            return;
        }

        // If content is very short, just show it
        if (cleanContent.length < 5) {
            setDisplayedContent(cleanContent);
            setIsTyping(false);
            return;
        }

        // Target duration: 2-3 seconds total
        // Calculate typing speed based on length
        // e.g. 500 chars / 2500ms = 0.2 chars/ms = 5ms/char
        const targetDuration = 2500; // 2.5 seconds
        const typingSpeed = Math.max(5, Math.floor(targetDuration / cleanContent.length));

        // Chunk size to ensure we finish in time if text is very long
        // If speed is < 5ms (browser tick limit), we need to add multiple chars per tick
        const charsPerTick = typingSpeed < 10 ? Math.ceil(10 / typingSpeed) : 1;
        const tickRate = typingSpeed < 10 ? 10 : typingSpeed;

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex >= cleanContent.length) {
                setDisplayedContent(cleanContent);
                setIsTyping(false);
                clearInterval(intervalId);
                return;
            }

            // Add chunk
            const nextIndex = Math.min(currentIndex + charsPerTick, cleanContent.length);
            setDisplayedContent(cleanContent.substring(0, nextIndex));
            currentIndex = nextIndex;
        }, tickRate);

        return () => clearInterval(intervalId);
    }, [cleanContent, isUser, shouldAnimate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                ${isUser
                    ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-teal-600 dark:text-teal-400'}
            `}>
                {isUser ? <User size={20} /> : <Bot size={20} />}
            </div>

            <div className={`
                relative px-5 py-4 max-w-[95%] rounded-2xl shadow-sm text-sm leading-relaxed
                ${isUser
                    ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}
            `}>
                {!isUser && <ThinkingProcess content={content} meta={meta} />}

                <div className="prose prose-sm dark:prose-invert max-w-none break-words min-h-[20px]">
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
                        className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center gap-2"
                    >
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-medium uppercase tracking-wide">
                            {getIntentEmoji(meta.intent)} {meta.intent}
                        </span>

                        {meta.citations?.length > 0 && (
                            <button
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => onShowCitations(meta.citations)}
                            >
                                <ExternalLink size={12} />
                                View {meta.citations.length} source{meta.citations.length !== 1 ? 's' : ''}
                            </button>
                        )}

                        {meta.isFallback && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                ⚠️ Fallback
                            </span>
                        )}

                        {meta.citations?.length > 0 && (
                            <div className="w-full mt-2 flex flex-wrap gap-2">
                                {meta.citations.slice(0, 3).map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onShowCitations(meta.citations)}
                                        className="group flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md hover:border-teal-400 transition-colors text-left max-w-[200px]"
                                    >
                                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
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
    );
}

function getIntentEmoji(intent) {
    const map = {
        'product': '📊',
        'client': '👤',
        'general': '📚',
        'complex': '🔀',
        'error': '❌'
    };
    return map[intent?.toLowerCase()] || '💬';
}
