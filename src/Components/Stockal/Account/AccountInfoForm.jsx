import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStockalAccountInfo, fetchStockalAccountInfo, clearStockalErrors } from '../../../store/slices/stockalSlice';
import { X, ChevronLeft, Save, AlertCircle, User, Briefcase, TrendingUp, Shield } from 'lucide-react';

const AccountInfoForm = ({ custId, initialData, onClose }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.stockal);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        password: '',
        username: '',
        phone: '',
        email: '',
        gender: '',
        country: '',
        idNo: '',
        idType: '',
        citizenship: '',
        usTaxPayer: false,
        dob: '',
        politicallyExposedNames: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        employmentStatus: '',
        employmentCompany: '',
        employmentPosition: '',
        employmentCountry: '',
        employmentType: '',
        isBroker: false,
        directorOf: '',
        investmentObjectives: '',
        investmentExperience: '',
        annualIncome: 0,
        networthLiquid: 0,
        networthTotal: 0,
        riskTolerance: '',
        termsOfUse: false,
        rule14b: false,
        customerAgreement: false,
        marketDataAgreement: false,
        privacyPolicy: false,
        dataSharing: false,
        stockalTermsOfUse: false,
        signedBy: '',
        partnerCode: '',
        userReferralCode: '',
        partnerToken: ''
    });

    useEffect(() => {
        if (initialData) {
            // Map initialData from API to formData structure
            setFormData(prev => ({
                ...prev,
                ...initialData,
                firstName: initialData.firstName || '',
                middleName: initialData.middleName || '',
                lastName: initialData.lastName || '',
                username: initialData.username || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                gender: initialData.gender || '',
                country: initialData.address?.countryID || initialData.country || 'IND',
                idNo: initialData.identity?.idNo || '',
                idType: initialData.identity?.idType || '',
                citizenship: initialData.identity?.citizenship || '',
                usTaxPayer: initialData.usTaxPayer || false,
                dob: initialData.dob || '',
                politicallyExposedNames: initialData.politicallyExposedNames || '',
                address1: initialData.address?.line1 || initialData.address1 || '',
                address2: initialData.address?.line2 || '',
                city: initialData.address?.city || initialData.city || '',
                state: initialData.address?.stateProvince || initialData.state || '',
                postalCode: initialData.address?.zipPostalCode || initialData.postalCode || '',
                employmentStatus: initialData.employment?.status || '',
                employmentCompany: initialData.employment?.company || '',
                employmentPosition: initialData.employment?.position || '',
                employmentCountry: initialData.employment?.countryID || '',
                employmentType: initialData.employment?.type || '',
                investmentObjectives: initialData.financialProfile?.investmentObjectives || '',
                investmentExperience: initialData.financialProfile?.investmentExperience || '',
                annualIncome: initialData.financialProfile?.annualIncome || 0,
                networthTotal: initialData.financialProfile?.networthTotal || 0,
                riskTolerance: initialData.financialProfile?.riskTolerance || '',
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateStockalAccountInfo({ custId, payload: formData }));

        if (updateStockalAccountInfo.fulfilled.match(result)) {
            dispatch(fetchStockalAccountInfo(custId));
            onClose();
        }
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-4 mt-2 pb-1 border-b border-gray-50">
            <Icon size={16} className="text-[#c5ae78]" />
            <h3 className="text-xs font-bold text-wealth-900 uppercase tracking-wider">{title}</h3>
        </div>
    );

    const FormInput = ({ label, name, type = "text", placeholder, required = false, colSpan = "", step }) => (
        <div className={`space-y-1 ${colSpan}`}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                placeholder={placeholder}
                step={step}
                className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
            />
        </div>
    );

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-300">
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
                        <h2 className="text-base font-bold text-wealth-900 uppercase tracking-tight">Update Profile Info</h2>
                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-tighter">Maintain accurate information for regulatory compliance</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error.updating && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
                        <AlertCircle size={16} />
                        <span className="text-xs font-semibold">{error.updating}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    {/* Identification & Personal */}
                    <div className="col-span-full">
                        <SectionHeader icon={User} title="Personal & Identification" />
                    </div>

                    <FormInput label="First Name" name="firstName" required />
                    <FormInput label="Middle Name" name="middleName" />
                    <FormInput label="Last Name" name="lastName" required />

                    <FormInput label="Username" name="username" />
                    <FormInput label="Email Address" name="email" type="email" required />
                    <FormInput label="Phone Number" name="phone" required />

                    <FormInput label="Date of Birth" name="dob" type="date" required />
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">US Tax Payer</label>
                        <div className="flex items-center gap-2 h-9 p-2">
                            <input
                                type="checkbox"
                                name="usTaxPayer"
                                checked={formData.usTaxPayer}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-wealth-800 focus:ring-wealth-800"
                            />
                            <span className="text-xs font-medium text-gray-600">Yes</span>
                        </div>
                    </div>

                    <FormInput label="ID Number (PAN/SSN)" name="idNo" required />
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">ID Type</label>
                        <select
                            name="idType"
                            value={formData.idType}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        >
                            <option value="PAN">PAN (Recommended for IND)</option>
                            <option value="SSN">SSN</option>
                            <option value="PASSPORT">Passport</option>
                        </select>
                    </div>
                    <FormInput label="Citizenship" name="citizenship" />

                    {/* Address */}
                    <div className="col-span-full">
                        <SectionHeader icon={Shield} title="Residential Address" />
                    </div>
                    <FormInput label="Address Line 1" name="address1" colSpan="md:col-span-2" required />
                    <FormInput label="Address Line 2" name="address2" />
                    <FormInput label="City" name="city" required />
                    <FormInput label="State" name="state" required />
                    <FormInput label="Postal Code" name="postalCode" required />

                    {/* Professional */}
                    <div className="col-span-full">
                        <SectionHeader icon={Briefcase} title="Professional Background" />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Employment Status</label>
                        <select
                            name="employmentStatus"
                            value={formData.employmentStatus}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        >
                            <option value="EMPLOYED">Employed</option>
                            <option value="SELF_EMPLOYED">Self-Employed</option>
                            <option value="RETIRED">Retired</option>
                            <option value="STUDENT">Student</option>
                            <option value="UNEMPLOYED">Unemployed</option>
                        </select>
                    </div>
                    <FormInput label="Company Name" name="employmentCompany" />
                    <FormInput label="Position" name="employmentPosition" />

                    {/* Investment */}
                    <div className="col-span-full">
                        <SectionHeader icon={TrendingUp} title="Investment Profile" />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Risk Tolerance</label>
                        <select
                            name="riskTolerance"
                            value={formData.riskTolerance}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 text-wealth-900 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-wealth-800/20 focus:border-wealth-800/30 transition-all text-xs font-semibold"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <FormInput label="Annual Income" name="annualIncome" type="number" step="any" />
                    <FormInput label="Net Worth Total" name="networthTotal" type="number" step="any" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-wealth-800 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading.updating}
                        className="flex items-center gap-2 px-8 py-2 bg-wealth-800 text-[#f6cd9e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-wealth-900 transition-all shadow-md shadow-wealth-800/20 disabled:opacity-50"
                    >
                        {loading.updating ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={14} />
                        )}
                        Sync Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountInfoForm;
