import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCredits } from '../../store/slices/subscriptionSlice';
import { selectIsAuthenticated } from '../../store/slices/userSlice';

const DraggableClockCredits = () => {
    const credits = useSelector(selectCredits);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [position, setPosition] = useState(() => {
        const savedPos = localStorage.getItem('creditClockPosition');
        return savedPos ? JSON.parse(savedPos) : { x: window.innerWidth - 100, y: 100 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const lastPosition = useRef(position);
    const dragOffset = useRef({ x: 0, y: 0 });
    const clockRef = useRef(null);

    useEffect(() => {
        lastPosition.current = position;
    }, [position]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.current.x;
                const newY = e.clientY - dragOffset.current.y;

                // Constrain to viewport
                const constrainedX = Math.min(Math.max(0, newX), window.innerWidth - 70);
                const constrainedY = Math.min(Math.max(0, newY), window.innerHeight - 70);

                setPosition({ x: constrainedX, y: constrainedY });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                localStorage.setItem('creditClockPosition', JSON.stringify(lastPosition.current));
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]); // Removed 'position' dependency to prevent listener re-binding

    // Don't render if not authenticated or no credits data
    if (!isAuthenticated || !credits) return null;

    const remaining = credits.remaining_credits ?? (credits.total_credits - credits.used_credits);
    const total = credits.total_credits || 1; // Avoid division by zero
    const percentage = Math.min(Math.max((remaining / total) * 100, 0), 100);
    const isZero = remaining <= 0;

    // SVG Constants for the refined 3D design - 100px Scale
    const size = 100;
    const center = size / 2;
    const outerRingRadius = 45;
    const progressRadius = 35;
    const innerFaceRadius = 31;
    const circumference = 2 * Math.PI * progressRadius;
    const offset = circumference - (percentage / 100) * circumference;

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    // Generate 120 ticks
    const ticks = Array.from({ length: 120 }).map((_, i) => {
        const angle = (i * 360) / 120;
        const isMajor = i % 10 === 0;
        const length = isMajor ? 6 : 4;
        return (
            <line
                key={i}
                x1={center + (outerRingRadius - length) * Math.cos((angle * Math.PI) / 180)}
                y1={center + (outerRingRadius - length) * Math.sin((angle * Math.PI) / 180)}
                x2={center + outerRingRadius * Math.cos((angle * Math.PI) / 180)}
                y2={center + outerRingRadius * Math.sin((angle * Math.PI) / 180)}
                stroke="#666"
                strokeWidth="0.9"
            />
        );
    });

    return (
        <div
            ref={clockRef}
            onMouseDown={handleMouseDown}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                width: `${size}px`,
                height: `${size}px`,
                zIndex: 9999,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            className={`group animate-in fade-in zoom-in duration-700 ${isZero ? 'animate-pulse' : ''}`}
        >
            <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ffffff] to-[#f0f0f0] rounded-full border transition-all duration-500 ${isZero
                    ? 'shadow-[0_0_30px_rgba(239,68,68,0.4),inset_0_-3px_8px_rgba(239,68,68,0.1),inset_0_3px_8px_rgba(255,255,255,0.9)] border-red-300'
                    : 'shadow-[0_12px_30px_rgba(0,0,0,0.2),inset_0_-3px_8px_rgba(0,0,0,0.05),inset_0_3px_8px_rgba(255,255,255,0.9)] border-gray-200'
                }`}>
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
                            <feOffset dx="0" dy="3" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer Ticks */}
                    {ticks}

                    {/* Progress Track (Light Grey or Light Red if Zero) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={progressRadius}
                        fill="none"
                        stroke={isZero ? "#fee2e2" : "#e5e7eb"}
                        strokeWidth="5"
                    />

                    {/* Colored Progress Arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={progressRadius}
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${center} ${center}) scale(1, -1) translate(0, -${size})`}
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Inner Face with intensified Shadow for 3D depth */}
                    <circle
                        cx={center}
                        cy={center}
                        r={innerFaceRadius}
                        fill="white"
                        filter="url(#shadow3d)"
                    />
                </svg>

                {/* Central Content */}
                <div className="relative flex flex-col items-center justify-center mt-[10px] ml-[1px] pointer-events-none text-center">
                    <span className="text-[8px] uppercase font-bold text-red-500 mb-[-2px] tracking-[0.1em] drop-shadow-sm">Credits</span>
                    <div className="flex items-baseline">
                        <span className={`text-[20px] font-semibold leading-none mb-[-1px] drop-shadow-sm transition-colors duration-500 ${isZero ? 'text-red-600' : 'text-wealth-800'}`}>{remaining}</span>
                    </div>
                    <div className={`border-b w-8 shadow-sm transition-colors duration-500 ${isZero ? 'border-red-400' : 'border-gray-300'}`}></div>
                    <div className={`text-[12px] font-semibold mt-[-2px] tracking-widest transition-colors duration-500 ${isZero ? 'text-red-400' : 'text-gray-400'}`}>{total}</div>
                </div>
            </div>

            {/* Premium Tooltip */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-white border border-gray-100 text-gray-600 text-[10px] px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                Remaining <span className="font-bold text-orange-500 mx-1">{remaining}</span> of {total}
            </div>
        </div>
    );
};

export default DraggableClockCredits;
