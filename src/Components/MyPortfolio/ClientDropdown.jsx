import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ClientDropdown = ({ clients, selectedClient, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.client-dropdown-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative client-dropdown-container border w-[260px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 bg-teal-800 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-md hover:bg-teal-900 transition-colors"
            >
                <span className="truncate max-w-[200px]">
                    {selectedClient ? selectedClient : 'Select Client'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onSelect(null);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-teal-50 transition-colors ${!selectedClient ? 'text-teal-700 font-bold bg-teal-50' : 'text-gray-700'
                                }`}
                        >
                            All Clients
                        </button>
                        {clients.map((clientEmail) => (
                            <button
                                key={clientEmail}
                                onClick={() => {
                                    onSelect(clientEmail);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-teal-50 transition-colors truncate ${selectedClient === clientEmail ? 'text-teal-700 font-bold bg-teal-50' : 'text-gray-700'
                                    }`}
                                title={clientEmail}
                            >
                                {clientEmail}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDropdown;
