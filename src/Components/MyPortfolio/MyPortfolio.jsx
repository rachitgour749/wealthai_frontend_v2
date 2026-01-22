import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/userSlice';
import PortfolioCard from './PortfolioCard';
import PortfolioFilter from './PortfolioFilter';
import ClientDropdown from './ClientDropdown';
import API_BASE_URL, { API_ENDPOINTS } from '../../api/config/apiConfig';

const MyPortfolio = () => {
    const user = useSelector(selectUser);
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [selectedStructureFilters, setSelectedStructureFilters] = useState([]); // Array for multi-select
    const [selectedClientFilter, setSelectedClientFilter] = useState(null); // String for single select

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                // Using centralized API config
                const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PORTFOLIO_USER(user.email)}`);
                setPortfolioData(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching portfolio data:", err);
                setError("Failed to load portfolio data.");
                // Fallback/Mock data could be added here if needed for testing without backend
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.email]);

    // Derived Data: Available Strategy Types
    const availableTypes = useMemo(() => {
        if (!portfolioData?.strategies) return [];
        const types = new Set(portfolioData.strategies.map(s => s.strategy_type));
        return Array.from(types);
    }, [portfolioData]);

    // Derived Data: Available Clients (Unique Owner Emails)
    // Only calculated if user has appropriate role to avoid unnecessary processing
    const availableClients = useMemo(() => {
        if (!portfolioData?.strategies) return [];
        const emails = new Set(portfolioData.strategies.map(s => s.owner_email).filter(Boolean));
        return Array.from(emails);
    }, [portfolioData]);

    // Toggle Strategy Type Filter
    const toggleStructureFilter = (type) => {
        if (type === 'ALL') {
            setSelectedStructureFilters([]);
            return;
        }

        setSelectedStructureFilters(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    // Filter Logic
    const filteredStrategies = useMemo(() => {
        if (!portfolioData?.strategies) return [];

        return portfolioData.strategies.filter(strategy => {
            // 1. Structure/Type Filter (Multi-select)
            const matchesStructure = selectedStructureFilters.length === 0 || selectedStructureFilters.includes(strategy.strategy_type);

            // 2. Client/Owner Filter
            const matchesClient = !selectedClientFilter || strategy.owner_email === selectedClientFilter;

            return matchesStructure && matchesClient;
        });
    }, [portfolioData, selectedStructureFilters, selectedClientFilter]);

    // Role Check
    const isBranchOrRM = user?.role === 'BRANCH' || user?.role === 'RM';
    // For testing purposes, you might want to uncomment this to force the view:
    // const isBranchOrRM = true; 

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full text-red-500 font-semibold">
                {error}
            </div>
        );
    }

    if (!portfolioData) return null;

    return (
        <div className="h-full flex flex-col px-6 py-4">

            {/* Header: Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                {/* Left: Strategy Type Filters */}
                <PortfolioFilter
                    filters={selectedStructureFilters}
                    toggleFilter={toggleStructureFilter}
                    availableTypes={availableTypes}
                />

                {/* Right: Client Dropdown (Role Based) */}
                {isBranchOrRM && (
                    <ClientDropdown
                        clients={availableClients}
                        selectedClient={selectedClientFilter}
                        onSelect={setSelectedClientFilter}
                    />
                )}
            </div>

            {/* Content: Strategy Cards Grid */}
            {filteredStrategies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filteredStrategies.map((strategy) => (
                        <div key={strategy.run_id} className="h-[9rem]">
                            {/* Shortened height as requested */}
                            <PortfolioCard
                                strategy={strategy}
                                showOwnerEmail={isBranchOrRM}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <p>No strategies found matching current filters.</p>
                </div>
            )}

        </div>
    );
};

export default MyPortfolio;