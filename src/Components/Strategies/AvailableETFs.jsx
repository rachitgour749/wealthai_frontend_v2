import React from 'react';

const AvailableETFs = ({ etfs, subName }) => {
    // Ensure etfs is an array
    const safeEtfs = Array.isArray(etfs) ? etfs : [];

    return (
        <div className="bg-white rounded-xl border border-gray-300 h-[250px] md:h-[300px] flex flex-col shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm md:text-[16px] font-medium text-[#0f3d39] mb-3 border-b bg-gray-200 rounded-t-[11px] border-gray-400 px-3 md:px-4 py-1.5 md:py-2 shadow-sm">Available {subName}</h2>
            <div className="overflow-x-auto flex-1 px-3 md:px-6 scrollbar-hide">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-left text-gray-500 text-[10px] md:text-[12px] font-medium uppercase tracking-widest border-b border-gray-50">
                            <th className="pb-2 px-1">Symbol</th>
                            <th className="pb-2 px-1">Sector</th>
                            <th className="pb-2 px-1 text-right">Years</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {safeEtfs.length > 0 ? (
                            safeEtfs.map((etf, index) => (
                                <tr key={`etf-${index}`} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-1.5 md:py-2 px-1 font-medium text-gray-600 text-[11px] md:text-[13px] group-hover:text-teal-600 transition-colors">
                                        {etf.symbol || etf.ticker || '-'}
                                    </td>
                                    <td className="py-1.5 md:py-2 px-1 text-gray-600 text-[11px] md:text-[13px]">
                                        {etf.sector || etf.industry || etf.group || '-'}
                                    </td>
                                    <td className="py-1.5 md:py-2 px-1 text-gray-600 text-[11px] md:text-[13px] font-medium text-right font-mono">
                                        {(() => {
                                            const val = etf.years !== undefined ? etf.years : etf.years_available;
                                            const num = Number(val);
                                            return !isNaN(num) && val !== null && val !== undefined && val !== ''
                                                ? num.toFixed(1)
                                                : (val || '-');
                                        })()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-12 text-center text-gray-400 text-sm">
                                    No ETF data available for this strategy.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AvailableETFs;
