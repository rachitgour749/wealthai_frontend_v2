import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentPage } from '../../store/slices/navigationSlice';

const AnalyticsHeader = ({ runId, strategyName, clients, selectedClient, onClientChange }) => {
    const dispatch = useDispatch();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.client-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleSelect = (client) => {
        onClientChange(client);
        setIsDropdownOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dispatch(setCurrentPage('MarketsAi1'));
                    }}
                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800 transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                    title="Go Back"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Strategy Analysis</h1>
                    {strategyName && (
                        <p className="text-sm text-gray-500 font-medium truncate max-w-[300px] md:max-w-[500px]">
                            {strategyName}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Client Dropdown */}
            <div className="relative client-dropdown-container min-w-[200px]">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-teal-400 transition-colors group"
                >
                    <div className="flex flex-col items-start truncate">
                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Viewing As</span>
                        <span className="text-sm font-semibold text-gray-800 truncate block max-w-[180px]">
                            {selectedClient ? selectedClient : 'Reference Capital'}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 group-hover:text-teal-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[280px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                            <div className="px-3 py-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                Select Account
                            </div>

                            {/* Default: Reference Capital */}
                            <button
                                onClick={() => handleSelect(null)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${selectedClient === null ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span>Reference Capital</span>
                                {selectedClient === null && <Check size={14} className="text-teal-600" />}
                            </button>

                            <div className="my-1 border-t border-gray-100"></div>

                            {/* Client List */}
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                {clients && clients.length > 0 ? (
                                    clients.map((client, index) => (
                                        <button
                                            key={client.id || index} // Assuming client object or string
                                            onClick={() => handleSelect(client)} // Handle both object/string logic in parent
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${selectedClient === client ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className='truncate'>{client}</span>
                                            {selectedClient === client && <Check size={14} className="text-teal-600" />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center text-xs text-gray-400 italic">
                                        No clients found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AnalyticsHeader;
