import React, { useState, useEffect, useRef } from 'react';

const ETFUniverseSelection = ({ title, subtitle, options, selectedOptions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);

    // Helper to get string value from any input (handles strings or objects)
    const getOptionValue = (opt) => {
        if (!opt) return '';
        if (typeof opt === 'string') return opt;
        if (typeof opt === 'object') {
            return opt.symbol || opt.ticker || opt.name || opt.label || String(opt);
        }
        return String(opt);
    };

    // Ensure options and selectedOptions are arrays of strings (symbols)
    const safeOptions = Array.isArray(options) ? options.map(opt => getOptionValue(opt)).filter(s => s !== '') : [];
    const safeSelected = Array.isArray(selectedOptions) ? selectedOptions.map(opt => getOptionValue(opt)).filter(s => s !== '') : [];

    // Filter logic: only options not in safeSelected and match search term
    const filteredOptions = safeOptions.filter(opt =>
        !safeSelected.includes(opt) &&
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Auto-highlight first item when filtered options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions.length, searchTerm]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (dropdownRef.current && highlightedIndex >= 0) {
            const highlightedElement = dropdownRef.current.children[highlightedIndex];
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [highlightedIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (!safeSelected.includes(val)) {
            onChange([...safeSelected, val]);
        }
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleRemove = (val) => {
        onChange(safeSelected.filter(item => item !== val));
    };

    return (
        <div className="bg-[#defff3] p-4 rounded-xl border border-[#9fddd2] min-h-[120px] md:min-h-[140px] flex flex-col shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)]" ref={wrapperRef}>
            <h2 className="text-sm md:text-lg font-bold text-wealth-800 mb-0.5">ETF Universe Selection</h2>
            <p className="text-gray-500 text-[10px] md:text-[12px] mb-2">{subtitle}</p>

            <div className="relative flex flex-col">
                {/* Search Container - grows with content */}
                <div
                    className="w-full p-1.5 pr-10 rounded-lg border-2 border-wealth-700 bg-white text-gray-700 min-h-[44px] cursor-text flex flex-wrap gap-1.5 items-center shadow-inner transition-all duration-200 focus-within:ring-2 focus-within:ring-wealth-600/20"
                    onClick={() => setIsOpen(true)}
                >
                    {/* Selected Tags inside the search area */}
                    {safeSelected.map(opt => (
                        <div key={`tag-${opt}`} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md text-sm font-medium border border-gray-300 flex items-center gap-1 shadow-sm hover:shadow-md transition-all duration-200">
                            {opt}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(opt);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <input
                        type="text"
                        placeholder={safeSelected.length > 0 ? "" : "Select ETFs..."}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={(e) => {
                            // Handle Backspace to remove last selected item when search is empty
                            if (e.key === 'Backspace' && searchTerm === '' && safeSelected.length > 0) {
                                e.preventDefault();
                                const newSelected = [...safeSelected];
                                newSelected.pop(); // Remove last item
                                onChange(newSelected);
                                return;
                            }

                            if (!isOpen) {
                                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                                    setIsOpen(true);
                                    e.preventDefault();
                                }
                                return;
                            }

                            switch (e.key) {
                                case 'ArrowDown':
                                    e.preventDefault();
                                    setHighlightedIndex(prev =>
                                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                                    );
                                    break;
                                case 'ArrowUp':
                                    e.preventDefault();
                                    setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                                    break;
                                case 'Enter':
                                    e.preventDefault();
                                    if (filteredOptions.length > 0 && highlightedIndex >= 0) {
                                        handleSelect(filteredOptions[highlightedIndex]);
                                    }
                                    break;
                                case 'Escape':
                                    e.preventDefault();
                                    setIsOpen(false);
                                    setSearchTerm('');
                                    break;
                                default:
                                    break;
                            }
                        }}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-[#0f3d39] p-1"
                    />

                    <div
                        className="absolute right-3 top-4 text-gray-500 border-l-2 border-gray-400 pl-2 cursor-pointer z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                    >
                        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full top-full bg-white border border-gray-300 rounded-[10px] shadow-xl max-h-60 overflow-y-auto"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((val, index) => (
                                <div
                                    key={`opt-${val}`}
                                    onClick={() => handleSelect(val)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`px-4 py-2 cursor-pointer text-gray-600 transition-colors ${index === highlightedIndex
                                        ? 'bg-[#9dd9cd] font-medium'
                                        : 'hover:bg-[#9dd9cd]/50'
                                        }`}
                                >
                                    {val}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-400 text-sm">
                                {searchTerm ? "No matching ETFs found" : "No more options available"}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ETFUniverseSelection;
