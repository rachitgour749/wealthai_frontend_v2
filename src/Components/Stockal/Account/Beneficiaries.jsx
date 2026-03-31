import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockalBeneficiaries } from '../../../store/slices/stockalSlice';
import { Edit2, Users, User, Building2 } from 'lucide-react';

const Beneficiaries = ({ custId, onEdit }) => {
    const dispatch = useDispatch();
    const { beneficiaries, loading, error } = useSelector((state) => state.stockal);

    useEffect(() => {
        if (custId) {
            dispatch(fetchStockalBeneficiaries(custId));
        }
    }, [dispatch, custId]);

    if (loading.beneficiaries && beneficiaries.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5ae78]"></div>
            </div>
        );
    }

    return (
        <div className="p-0">
            {error.beneficiaries && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                    Error: {error.beneficiaries}
                </div>
            )}

            {beneficiaries.length === 0 && !loading.beneficiaries ? (
                <div className="flex flex-col items-center justify-center py-20 bg-wealth-800/10 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="p-4 bg-wealth-800/10 rounded-full mb-4">
                        <Users size={48} className="text-wealth-800" />
                    </div>
                    <p className="text-lg text-gray-500 font-medium">No beneficiaries added yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {beneficiaries.map((ben, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm group hover:shadow-md transition-all duration-300 relative overflow-hidden"
                        >
                            {ben.isPrimary && (
                                <div className="absolute top-0 right-0 px-2 py-0.5 bg-green-500/10 text-green-600 text-[12px] font-medium uppercase tracking-widest rounded-bl-md border-l border-b border-green-500/20">
                                    Primary
                                </div>
                            )}

                            <div className="flex relative justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-50 rounded text-wealth-800">
                                        {ben.beneficiaryType === 'PERSON' ? <User size={17} /> : <Building2 size={17} />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-wealth-900 leading-tight">{ben.beneficiaryName}</h3>
                                        <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">{ben.beneficiaryType}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onEdit(ben)}
                                    className="absolute top-[-6px] right-[75px] text-gray-400 hover:text-wealth-800 hover:bg-gray-50 rounded transition-all"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                                    <p className="text-[12px] text-gray-400 uppercase font-medium tracking-tighter">Benefit</p>
                                    <span className="text-sm text-wealth-900 font-semibold">{(ben.benefitPct * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                                    <p className="text-[12px] text-gray-400 uppercase font-medium tracking-tighter">Phone</p>
                                    <span className="text-xs text-wealth-900 font-semibold">{ben.beneficiaryPhone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 border-b border-gray-50 col-span-2">
                                    <p className="text-[12px] text-gray-400 uppercase font-medium tracking-tighter">Email</p>
                                    <span className="text-xs text-wealth-900 font-semibold truncate max-w-[170px]">{ben.beneficiaryEmail || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Beneficiaries;
