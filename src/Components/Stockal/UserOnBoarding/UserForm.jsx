import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStockalUser, checkStockalUsername } from '../../../store/slices/stockalSlice';
import { ChevronLeft, Save, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const countries = [
    { value: 'IND', label: 'India' },
    { value: 'USA', label: 'United States' },
    { value: 'GBR', label: 'United Kingdom' },
    { value: 'CAN', label: 'Canada' },
    { value: 'AUS', label: 'Australia' },
    { value: 'SGP', label: 'Singapore' },
    { value: 'ARE', label: 'United Arab Emirates' },
    { value: 'DEU', label: 'Germany' },
    { value: 'FRA', label: 'France' },
    { value: 'JPN', label: 'Japan' },
];

const FormInput = ({ label, name, value, onChange, type = "text", placeholder, required = false, options = null }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full bg-white border border-gray-200 text-wealth-900 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-wealth-800/10 focus:border-wealth-800 transition-all text-xs font-semibold"
            >
                <option value="" disabled>Select {label}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 text-wealth-900 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-wealth-800/10 focus:border-wealth-800 transition-all text-xs font-semibold"
            />
        )}
    </div>
);

const CheckboxInput = ({ label, name, checked, onChange, required = false }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-gray-100/50">
        <div className="relative flex items-center">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                required={required}
                className="peer w-4 h-4 rounded border-gray-300 text-wealth-800 focus:ring-wealth-800/20 transition-all cursor-pointer"
            />
        </div>
        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider cursor-pointer">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
    </div>
);

const UserForm = ({ onNext, onCancel }) => {
    const dispatch = useDispatch();
    const { loading, error, usernameAvailable } = useSelector((state) => state.stockal);

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
        annualIncome: '',
        networthLiquid: '',
        networthTotal: '',
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

    // Handle debounced username check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.username && formData.username.length >= 3) {
                dispatch(checkStockalUsername(formData.username));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username, dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission if username is not available
        if (usernameAvailable === false) return;

        const payload = { ...formData };
        if (!payload.signedBy) payload.signedBy = payload.firstName;

        const result = await dispatch(createStockalUser(payload));

        if (createStockalUser.fulfilled.match(result)) {
            onNext();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error?.updating && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl shadow-sm">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">{error.updating}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Required Fields */}
                <div className="space-y-6">
                    <div className="bg-[#f0f9f6] border border-[#d1e9e0] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d1e9e0]/20 rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-2 mb-6 border-b border-[#c2e2d5] pb-3 relative">
                            <div className="p-1.5 bg-wealth-800 rounded-lg text-[#f6cd9e] shadow-lg shadow-wealth-800/20">
                                <CheckCircle2 size={16} />
                            </div>
                            <h2 className="text-sm font-black text-wealth-800 uppercase tracking-widest">Required Fields</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                            <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
                            <FormInput label="Password" name="password" value={formData.password} onChange={handleChange} type="password" required />
                            <div className="space-y-1">
                                <FormInput label="Username" name="username" value={formData.username} onChange={handleChange} required />
                                {usernameAvailable === true && formData.username.length >= 3 && (
                                    <p className="text-[10px] text-green-500 ml-1">Username available</p>
                                )}
                                {usernameAvailable === false && formData.username.length >= 3 && (
                                    <p className="text-[10px] text-red-500 ml-1">Please use different username</p>
                                )}
                            </div>
                            <FormInput label="Date of Birth (YYYY-MM-DD)" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
                            <FormInput label="ID Number" name="idNo" value={formData.idNo} onChange={handleChange} required />
                            <FormInput label="ID Type" name="idType" value={formData.idType} onChange={handleChange} required options={[
                                { value: 'PAN', label: 'PAN Card' },
                                { value: 'SSN', label: 'SSN' },
                                { value: 'TIN', label: 'TIN' },
                                { value: 'other', label: 'Other' }
                            ]} />
                            <FormInput label="Country" name="country" value={formData.country} onChange={handleChange} required options={countries} />
                            <FormInput label="Citizenship" name="citizenship" value={formData.citizenship} onChange={handleChange} required options={countries} />
                            <FormInput label="Address 1" name="address1" value={formData.address1} onChange={handleChange} required />
                            <FormInput label="City" name="city" value={formData.city} onChange={handleChange} required />
                            <FormInput label="State" name="state" value={formData.state} onChange={handleChange} required />
                            <FormInput label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                            <FormInput label="Employment Status" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required options={[
                                { value: 'EMPLOYED', label: 'Employed' },
                                { value: 'SELF_EMPLOYED', label: 'Self Employed' },
                                { value: 'RETIRED', label: 'Retired' },
                                { value: 'STUDENT', label: 'Student' },
                                { value: 'UNEMPLOYED', label: 'Unemployed' }
                            ]} />
                            <FormInput label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} required options={[
                                { value: 'PROFESSIONAL', label: 'Professional' },
                                { value: 'AGRICULTURE', label: 'Agriculture' },
                                { value: 'HOUSEWIFE', label: 'Housewife' },
                                { value: 'OTHER', label: 'Other' }
                            ]} />
                            <FormInput label="Risk Tolerance" name="riskTolerance" value={formData.riskTolerance} onChange={handleChange} required options={[
                                { value: 'Low', label: 'Low' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'High', label: 'High' }
                            ]} />
                            <FormInput label="Investment Exp" name="investmentExperience" value={formData.investmentExperience} onChange={handleChange} required options={[
                                { value: 'YRS_1_3', label: '1-3 Years' },
                                { value: 'YRS_3_5', label: '3-5 Years' },
                                { value: 'YRS_5_10', label: '5-10 Years' },
                                { value: 'YRS_MORE_10', label: '> 10 Years' }
                            ]} />
                            <FormInput label="Annual Income ($)" name="annualIncome" value={formData.annualIncome} onChange={handleChange} type="number" required />
                            <FormInput label="Liquid Networth ($)" name="networthLiquid" value={formData.networthLiquid} onChange={handleChange} type="number" required />
                            <FormInput label="Total Networth ($)" name="networthTotal" value={formData.networthTotal} onChange={handleChange} type="number" required />
                        </div>
                    </div>
                </div>

                {/* Right Column: Additional Fields */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3 relative">
                            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500 shadow-sm">
                                <Info size={16} />
                            </div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Additional Fields (Optional)</h2>
                            <button
                                type="submit"
                                disabled={loading.updating || loading.usernameCheck || usernameAvailable === false}
                                className="py-3 px-5 absolute right-0 bg-wealth-800 text-white text-xs font-bold uppercase tracking-[0.1em] rounded-[10px] hover:bg-wealth-900 transition-all shadow-xl shadow-[#c5ae78]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading.updating ? (
                                    <div className="w-4 h-4 border-2 border-wealth-900/30 border-t-wealth-900 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save & Continue
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            <FormInput label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                            <FormInput label="Address 2" name="address2" value={formData.address2} onChange={handleChange} />
                            <FormInput label="Employment Company" name="employmentCompany" value={formData.employmentCompany} onChange={handleChange} />
                            <FormInput label="Employment Position" name="employmentPosition" value={formData.employmentPosition} onChange={handleChange} />
                            <FormInput label="Employment Country" name="employmentCountry" value={formData.employmentCountry} onChange={handleChange} options={countries} />
                            <FormInput label="Investment Objectives" name="investmentObjectives" value={formData.investmentObjectives} onChange={handleChange} />
                            <FormInput label="Partner Code" name="partnerCode" value={formData.partnerCode} onChange={handleChange} />
                            <FormInput label="Referral Code" name="userReferralCode" value={formData.userReferralCode} onChange={handleChange} />
                            <FormInput label="Partner Token" name="partnerToken" value={formData.partnerToken} onChange={handleChange} />
                            <FormInput label="Director Of (Company)" name="directorOf" value={formData.directorOf} onChange={handleChange} />
                            <FormInput label="Politically Exposed Names" name="politicallyExposedNames" value={formData.politicallyExposedNames} onChange={handleChange} />
                            <FormInput label="Signed By" name="signedBy" value={formData.signedBy} onChange={handleChange} />
                        </div>

                        <div className="mt-4 relative space-y-3 bg-[#f2fffa] p-4 rounded-xl border border-[#c2e2d5] overflow-auto h-[310px]">
                            <CheckboxInput label="I am a US Tax Payer" name="usTaxPayer" checked={formData.usTaxPayer} onChange={handleChange} />
                            <CheckboxInput label="I am not a Broker/Dealer" name="isBroker" checked={formData.isBroker} onChange={handleChange} />
                            <CheckboxInput label="Accept Terms of Use" name="termsOfUse" checked={formData.termsOfUse} onChange={handleChange} required />
                            <CheckboxInput label="Accept Rule 14b" name="rule14b" checked={formData.rule14b} onChange={handleChange} required />
                            <CheckboxInput label="Accept Customer Agreement" name="customerAgreement" checked={formData.customerAgreement} onChange={handleChange} required />
                            <CheckboxInput label="Accept Market Data Agreement" name="marketDataAgreement" checked={formData.marketDataAgreement} onChange={handleChange} required />
                            <CheckboxInput label="Accept Privacy Policy" name="privacyPolicy" checked={formData.privacyPolicy} onChange={handleChange} required />
                            <CheckboxInput label="Accept Data Sharing" name="dataSharing" checked={formData.dataSharing} onChange={handleChange} required />
                            <CheckboxInput label="Accept Stockal Terms" name="stockalTermsOfUse" checked={formData.stockalTermsOfUse} onChange={handleChange} required />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default UserForm;
