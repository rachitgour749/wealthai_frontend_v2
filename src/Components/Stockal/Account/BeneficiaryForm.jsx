import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStockalBeneficiaries, fetchStockalBeneficiaries, clearStockalErrors } from '../../../store/slices/stockalSlice';
import { X, ChevronLeft, Save, AlertCircle } from 'lucide-react';

const BeneficiaryForm = ({ custId, beneficiary, onClose, existingBeneficiaries }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.stockal);

    const [formData, setFormData] = useState({
        isPrimary: false,
        beneficiaryType: 'PERSON', // Initialize with a default value to ensure it's in the state
        beneficiaryName: '',
        benefitPct: 0,
        beneficiaryPhone: '',
        beneficiaryEmail: '',
        beneficiaryDob: '',
        formationDt: '',
        primaryContact: ''
    });

    useEffect(() => {
        if (beneficiary) {
            setFormData({
                isPrimary: beneficiary.isPrimary,
                beneficiaryType: beneficiary.beneficiaryType || 'PERSON',
                beneficiaryName: beneficiary.beneficiaryName,
                benefitPct: beneficiary.benefitPct * 100, // Convert to percentage for UI (e.g., 1 -> 100)
                beneficiaryPhone: beneficiary.beneficiaryPhone || '',
                beneficiaryEmail: beneficiary.beneficiaryEmail || '',
                beneficiaryDob: beneficiary.beneficiaryDob || '',
                formationDt: beneficiary.formationDt || '',
                primaryContact: beneficiary.primaryContact || ''
            });
        }
    }, [beneficiary]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const calculateTotalPercentage = (currentVal) => {
        const val = Number(currentVal) || 0;
        let total = 0;

        if (beneficiary) {
            // Updating existing: sum others + current input
            const others = existingBeneficiaries.filter(b => b.stoBeneficiaryId !== beneficiary.stoBeneficiaryId);
            total = others.reduce((sum, b) => sum + (b.benefitPct * 100), 0) + val;
        } else {
            // Adding new: sum existing + current input
            total = existingBeneficiaries.reduce((sum, b) => sum + (b.benefitPct * 100), 0) + val;
        }
        return total;
    };

    const totalPercentage = calculateTotalPercentage(formData.benefitPct);
    const isValidPercentage = totalPercentage === 100;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidPercentage) {
            // Local fallback validation (button should be disabled anyway)
            return;
        }

        // Prepare payload according to user's expected format
        const payloadBen = {
            isPrimary: formData.isPrimary,
            beneficiaryType: formData.beneficiaryType,
            beneficiaryName: formData.beneficiaryName,
            benefitPct: Number(formData.benefitPct) / 100, // Convert 100 to 1 for 100%
            beneficiaryPhone: formData.beneficiaryPhone,
            beneficiaryEmail: formData.beneficiaryEmail,
        };

        // Add conditional fields
        if (formData.beneficiaryType === 'PERSON') {
            payloadBen.beneficiaryDob = formData.beneficiaryDob;
        }

        let updatedBeneficiaries;
        if (beneficiary) {
            // Update existing in the list
            updatedBeneficiaries = existingBeneficiaries.map(b =>
                b.stoBeneficiaryId === beneficiary.stoBeneficiaryId ? { ...b, ...payloadBen } : b
            );
        } else {
            // Add new to the list
            updatedBeneficiaries = [...existingBeneficiaries, payloadBen];
        }

        const result = await dispatch(updateStockalBeneficiaries({ custId, beneficiaries: updatedBeneficiaries }));

        if (updateStockalBeneficiaries.fulfilled.match(result)) {
            dispatch(fetchStockalBeneficiaries(custId));
            onClose();
        }
    };

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-300 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-wealth-800 transition-all border border-transparent hover:border-gray-100"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-base font-bold text-wealth-900 uppercase tracking-tight">
                            {beneficiary ? 'Update Beneficiary' : 'New Beneficiary'}
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-tighter">Enter legal details for asset transition</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error.updating && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
                        <AlertCircle size={16} />
                        <span className="text-xs font-semibold">{error.updating}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Primary Status Toggle */}
                    <div className="col-span-full flex items-center justify-between p-3 bg-wealth-800/5 rounded-lg border border-wealth-800/10">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id="isPrimary-toggle"
                                    type="checkbox"
                                    name="isPrimary"
                                    checked={formData.isPrimary}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-wealth-800"></div>
                            </label>
                            <label htmlFor="isPrimary-toggle">
                                <span className="text-xs font-bold text-wealth-900">Primary Beneficiary</span>
                                <p className="text-[10px] text-gray-400 font-medium">Recipient of 100% assets if not specified otherwise</p>
                            </label>
                        </div>
                    </div>

                    {/* Type Select */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Type</label>
                        <select
                            name="beneficiaryType"
                            value={formData.beneficiaryType}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        >
                            <option value="PERSON">Individual Account</option>
                            <option value="ENTITY">Corporate / Entity</option>
                        </select>
                    </div>

                    {/* Benefit Pct */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Benefit Percentage</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="benefitPct"
                                value={formData.benefitPct}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="any"
                                required
                                className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold pr-8"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-[10px] font-bold">
                                %
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-full space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                            {formData.beneficiaryType === 'PERSON' ? 'Legal Full Name' : 'Company / Entity Name'}
                        </label>
                        <input
                            type="text"
                            name="beneficiaryName"
                            value={formData.beneficiaryName}
                            onChange={handleChange}
                            required
                            placeholder={formData.beneficiaryType === 'PERSON' ? 'Ex: John Doe' : 'Ex: WealthAI Corp Ltd'}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <input
                            type="tel"
                            name="beneficiaryPhone"
                            value={formData.beneficiaryPhone}
                            onChange={handleChange}
                            placeholder="+1 234 567 8900"
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            name="beneficiaryEmail"
                            value={formData.beneficiaryEmail}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        />
                    </div>

                    {/* Dates */}
                    {formData.beneficiaryType === 'PERSON' ? (
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                            <input
                                type="date"
                                name="beneficiaryDob"
                                value={formData.beneficiaryDob}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Formation Date</label>
                                <input
                                    type="date"
                                    name="formationDt"
                                    value={formData.formationDt}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Primary Contact Name</label>
                                <input
                                    type="text"
                                    name="primaryContact"
                                    value={formData.primaryContact}
                                    onChange={handleChange}
                                    placeholder="Authorized contact person"
                                    className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                                />
                            </div>
                        </>
                    )}
                </div>

                {!isValidPercentage && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">
                        <AlertCircle size={16} />
                        <div className="text-xs font-semibold">
                            Total benefit percentage must be exactly 100%. Current total: <span className="font-black underline">{totalPercentage}%</span>
                            <p className="font-medium text-[10px] mt-0.5 opacity-80">Please adjust percentages across all beneficiaries to meet regulatory requirements.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-wealth-800 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading.updating || !isValidPercentage}
                        className="flex items-center gap-2 px-6 py-2 bg-wealth-800 text-[#f6cd9e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-wealth-900 transition-all shadow-md shadow-wealth-800/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading.updating ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={14} />
                        )}
                        {beneficiary ? 'Apply Changes' : 'Register Beneficiary'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BeneficiaryForm;
