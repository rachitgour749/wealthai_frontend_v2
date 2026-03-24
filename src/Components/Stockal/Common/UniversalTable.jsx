import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, MoreHorizontal, Download, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UniversalTable = ({ 
    columns, 
    data, 
    isLoading, 
    emptyMessage = "No records found",
    onRowClick,
    actions,
    rowClassName
}) => {
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState(null);



    // Filter Logic
    const filteredData = useMemo(() => {
        let result = [...data];


        // Column Filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                result = result.filter(row => 
                    String(row[key] || '').toLowerCase().includes(filters[key].toLowerCase())
                );
            }
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, filters, sortConfig]);

    

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="w-full bg-white overflow-hidden flex flex-col p-2 h-[320px]">

            {/* Main Table */}
            <div className="overflow-x-auto h-full custom-scrollbar border border-gray-400 rounded-[8px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#dbdde2]">
                        {/* Title Row */}
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={col.key}
                                    className="px-4 pt-1 text-[11px] font-bold text-[#3a3d43] text-center border-x border-slate-400 first:border-l-0 last:border-r-0"
                                >
                                    <div 
                                        className="flex items-center justify-center cursor-pointer select-none"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        {col.header}
                                        <div className="flex flex-col">
                                            {sortConfig?.key === col.key ? (
                                                sortConfig.direction === 'asc' ? <ChevronUp size={10} className="text-wealth-800" /> : <ChevronDown size={10} className="text-wealth-800" />
                                            ) : (
                                                <ChevronUp size={10} className="text-slate-400 opacity-20" />
                                            )}
                                        </div>
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-4 py-1 border-x border-slate-300 last:border-r-0">Action</th>}
                        </tr>
                        
                        {/* Filter Row */}
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={`filter-${col.key}`}
                                    className="px-4 pb-[4px] border border-gray-400 first:border-l-0 last:border-r-0"
                                >
                                    <input
                                        type="text"
                                        placeholder="filter"
                                        value={filters[col.key] || ''}
                                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                        className="w-full px-2 bg-white border border-slate-300 rounded-[4px] text-[11px] font-normal focus:outline-none focus:ring-1 focus:ring-wealth-800/10"
                                    />
                                </th>
                            ))}
                            {actions && <th className="px-2 border-x pb-[4px] border-slate-300 last:border-r-0"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 border-4 border-wealth-800/10 border-t-wealth-800 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Retrieving Data Portfolio...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((row, idx) => {
                                const rowColorClass = typeof rowClassName === 'function' ? rowClassName(row) : (rowClassName || '');
                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        key={idx}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`hover:bg-[#aec9e6] bg-[#bbd5f0] transition-colors cursor-pointer group border-b border-gray-400 ${onRowClick ? 'cursor-pointer' : ''} ${rowColorClass}`}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="py-0 border-x text-center border-b border-gray-400 first:border-l-0 last:border-r-0">
                                                {col.render ? col.render(row[col.key], row) : (
                                                    <span className="text-[10px] font-medium text-[#181e27] leading-none">{row[col.key]}</span>
                                                )}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-1 text-right border-x border-slate-400/50 last:border-r-0">
                                                {actions(row)}
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-30">
                                        <List size={40} className="text-gray-200 mb-3" />
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UniversalTable;
