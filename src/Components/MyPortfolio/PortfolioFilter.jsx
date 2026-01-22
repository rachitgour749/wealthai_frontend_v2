import React from 'react';

const PortfolioFilter = ({ filters, toggleFilter, availableTypes }) => {
    // Styles extracted from Strategies.jsx
    const buttonBaseClass = "px-3 py-[1px] rounded-[5px] text-[11px] font-medium transition-all duration-200";
    const activeClass = "bg-teal-600 text-white shadow-md";
    const inactiveClass = "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 shadow-sm";

    return (
        <div className="flex flex-wrap gap-2">
            {/* All Button */}
            <button
                onClick={() => toggleFilter('ALL')}
                className={`${buttonBaseClass} ${filters.length === 0 ? activeClass : inactiveClass
                    }`}
            >
                All
            </button>

            {/* Dynamic Type Buttons */}
            {availableTypes.map((type) => (
                <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={`${buttonBaseClass} ${filters.includes(type) ? activeClass : inactiveClass
                        }`}
                >
                    {type.replace(/_/g, ' ')}
                </button>
            ))}
        </div>
    );
};

export default PortfolioFilter;
