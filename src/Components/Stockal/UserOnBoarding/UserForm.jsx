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
                className="w-full bg-white border border-gray-200 text-wealth-800 rounded-[7px] px-3 py-2 outline-none focus:ring-2 focus:ring-wealth-800/10 focus:border-wealth-800 transition-all text-xs font-semibold"
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
                className="w-full bg-white border border-gray-200 text-wealth-800 rounded-[7px] px-3 py-2 outline-none focus:ring-2 focus:ring-wealth-800/10 focus:border-wealth-800 transition-all text-xs font-semibold"
            />
        )}
    </div>
);

const CheckboxInput = ({ label, name, checked, onChange, required = false }) => (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
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
        politicallyExposedNames: null,
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
        partnerCode: 'Wealthwisers',
        userReferralCode: '',
        partnerToken: ''
    });

    const [isPEP, setIsPEP] = useState('No');

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

    const handlePEPChange = (e) => {
        const value = e.target.value;
        setIsPEP(value);
        setFormData(prev => ({
            ...prev,
            politicallyExposedNames: value === 'Yes' ? '' : null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission if username is not available
        if (usernameAvailable === false) return;

        const payload = { ...formData };
        if (!payload.signedBy) payload.signedBy = payload.firstName;

        // Convert numeric fields from string to number
        if (payload.annualIncome) payload.annualIncome = Number(payload.annualIncome);
        if (payload.networthLiquid) payload.networthLiquid = Number(payload.networthLiquid);
        if (payload.networthTotal) payload.networthTotal = Number(payload.networthTotal);

        // Handle politically exposed names (must be null if No)
        if (isPEP === 'No') {
            payload.politicallyExposedNames = null;
        }

        // Backend expects user_email
        payload.user_email = payload.email;

        // Handle employment fields
        const isEmployed = ['EMPLOYED', 'SELF_EMPLOYED'].includes(payload.employmentStatus);
        if (!isEmployed) {
            payload.employmentPosition = null;
            payload.employmentCompany = null;
            payload.employmentCountry = null;
        }

        // Clean up empty optional fields by deleting them, EXCEPT politicallyExposedNames and employment fields which need explicit nulls
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' && key !== 'politicallyExposedNames' && key !== 'employmentPosition' && key !== 'employmentCompany' && key !== 'employmentCountry') {
                delete payload[key];
            }
        });

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

            <div className="grid grid-cols-1">
                {/* Left Column: Required Fields */}
                <div className="space-y-3 w-full">
                    <div className="bg-[#f0f9f6] border border-[#d1e9e0] rounded-xl  shadow-sm relative overflow-hidden">
                        <div className="flex items-center h-14 gap-2 border-b px-4 border-[#add4c4] justify-between relative">
                            <h2 className="text-sm font-bold text-wealth-800">PERSONAL DETAILS</h2>
                            <button
                                type="submit"
                                disabled={loading.updating || loading.usernameCheck || usernameAvailable === false}
                                className="py-2 px-5 bg-wealth-800 text-white text-[12px] font-medium uppercase rounded-[7px] hover:bg-wealth-900 transition-all shadow-xl shadow-[#c5ae78]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading.updating ? (
                                    <div className="w-4 h-4 border-2 border-wealth-900/30 border-t-wealth-900 rounded-[7px] animate-spin"></div>
                                ) : (
                                    <>
                                        Save & Continue
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative p-4">
                            <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <FormInput label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                            <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            <FormInput label="GENDER" name="gender" value={formData.gender} onChange={handleChange} options={[
                                { value: 'OTHER', label: 'Other' },
                                { value: 'MALE', label: 'Male' },
                                { value: 'FEMALE', label: 'Female' },
                            ]} />
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
                            <FormInput label="Address 2" name="address2" value={formData.address2} onChange={handleChange} />
                            <FormInput label="City" name="city" value={formData.city} onChange={handleChange} required />
                            <FormInput label="State" name="state" value={formData.state} onChange={handleChange} required />
                            <FormInput label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                            <FormInput label="Employment Status" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required options={[
                                { value: 'EMPLOYED', label: 'Employed' },
                                { value: 'RETIRED', label: 'Retired' },
                                { value: 'STUDENT', label: 'Student' },
                                { value: 'UNEMPLOYED', label: 'Not Employed' },
                                { value: 'SELF_EMPLOYED', label: 'Self Employed / Business Owner' }
                            ]} />
                            <FormInput label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} required options={[
                                { value: 'AGRICULTURE', label: 'Agriculture, Forestry, Fishing and Hunting' },
                                { value: 'MINING', label: 'Mining, Quarrying, and Oil and Gas Extraction' },
                                { value: 'UTILITIES', label: 'Utilities' },
                                { value: 'CONSTRUCTION', label: 'Construction' },
                                { value: 'MANUFACTURING', label: 'Manufacturing' },
                                { value: 'WHOLESALE', label: 'Wholesale Trade' },
                                { value: 'RETAIL', label: 'Retail Trade' },
                                { value: 'TRANSPORT', label: 'Transportation and Warehousing' },
                                { value: 'INFORMATION', label: 'Information' },
                                { value: 'FINANCE', label: 'Finance and Insurance' },
                                { value: 'REAL_ESTATE', label: 'Real Estate and Rental and Leasing' },
                                { value: 'PROFESSIONAL', label: 'Professional, Scientific, and Technical Services' },
                                { value: 'MANAGEMENT', label: 'Management of Companies and Enterprises' },
                                { value: 'EDUCATION', label: 'Educational Services' },
                                { value: 'HEALTH', label: 'Health Care and Social Assistance' },
                                { value: 'ART', label: 'Arts, Entertainment, and Recreation' },
                                { value: 'FOOD', label: 'Accommodation and Food Services' },
                                { value: 'PUBLIC', label: 'Public Administration' },
                                { value: 'WASTE', label: 'Administrative and Support and Waste Management and Remediation Services' }
                            ]} />
                            <FormInput label="Employment Company" name="employmentCompany" value={formData.employmentCompany} onChange={handleChange} />
                            <FormInput label="Employment Position" name="employmentPosition" value={formData.employmentPosition} onChange={handleChange} options={[
                                { value: 'ACCOUNTANT', label: 'Accountant/CPA/Bookkeeper/Controller' },
                                { value: 'ACTUARY', label: 'Actuary' },
                                { value: 'ADJUSTER', label: 'Adjuster' },
                                { value: 'ADMINISTRATOR', label: 'Administrator' },
                                { value: 'ADVERTISER', label: 'Advertiser/Marketer/PR Professional' },
                                { value: 'AGENT', label: 'Agent' },
                                { value: 'ATC', label: 'Air Traffic Controller' },
                                { value: 'AMBASSADOR', label: 'Ambassador/Consulate Professional' },
                                { value: 'ANALYST', label: 'Analyst' },
                                { value: 'APPRAISER', label: 'Appraiser' },
                                { value: 'ARCHITECT', label: 'Architect/Designer' },
                                { value: 'ARTIST', label: 'Artist/Performer/Actor/Dancer' },
                                { value: 'ASSISTANT', label: 'Assistant' },
                                { value: 'ATHLETE', label: 'Athlete' },
                                { value: 'ATTENDANT', label: 'Attendant' },
                                { value: 'ATTORNEY', label: 'Attorney/Judge/Legal Professional' },
                                { value: 'AUCTIONEER', label: 'Auctioneer' },
                                { value: 'AUDITOR', label: 'Auditor' },
                                { value: 'BARBER', label: 'Barber/Beautician/Hairstylist' },
                                { value: 'BROKER', label: 'Broker' },
                                { value: 'BUSINESS_EXEC', label: 'Business Executive (VP, Director, etc.)' },
                                { value: 'BUSINESS_OWNER', label: 'Business Owner' },
                                { value: 'CAREGIVER', label: 'Caregiver' },
                                { value: 'CARPENTER', label: 'Carpenter/Construction Worker' },
                                { value: 'CASHIER', label: 'Cashier' },
                                { value: 'CHEF', label: 'Chef/Cook' },
                                { value: 'CHIROPRACTOR', label: 'Chiropractor' },
                                { value: 'CIVIL', label: 'Civil Servant' },
                                { value: 'CLERGY', label: 'Clergy' },
                                { value: 'CLERK', label: 'Clerk' },
                                { value: 'COMPLIANCE', label: 'Compliance/Regulatory Professional' },
                                { value: 'CONSULTANT', label: 'Consultant' },
                                { value: 'CONTRACTOR', label: 'Contractor' },
                                { value: 'COUNSELOR', label: 'Counselor/Therapist' },
                                { value: 'CUSTOMER_SERVICE', label: 'Customer Service Representative' },
                                { value: 'DEALER', label: 'Dealer' },
                                { value: 'DEVELOPER', label: 'Developer' },
                                { value: 'DISTRIBUTOR', label: 'Distributor' },
                                { value: 'DOCTOR', label: 'Doctor/Dentist/Veterinarian/Surgeon' },
                                { value: 'DRIVER', label: 'Driver' },
                                { value: 'ENGINEER', label: 'Engineer' },
                                { value: 'EXAMINER', label: 'Examiner' },
                                { value: 'EXTERMINATOR', label: 'Exterminator' },
                                { value: 'FACTORY', label: 'Factory/Warehouse Worker' },
                                { value: 'FARMER', label: 'Farmer/Rancher' },
                                { value: 'FINANCIAL', label: 'Financial Planner' },
                                { value: 'FISHERMAN', label: 'Fisherman' },
                                { value: 'FLIGHT', label: 'Flight Attendant' },
                                { value: 'HR', label: 'Human Resources Professional' },
                                { value: 'IMPEX', label: 'Importer/Exporter' },
                                { value: 'INSPECTOR', label: 'Inspector/Investigator' },
                                { value: 'INTERN', label: 'Intern' },
                                { value: 'INVESTMENT', label: 'Investment Advisor/Investment Manager' },
                                { value: 'INVESTOR', label: 'Investor' },
                                { value: 'IT', label: 'IT Professional/IT Associate' },
                                { value: 'JANITOR', label: 'Janitor' },
                                { value: 'JEWELER', label: 'Jeweler' },
                                { value: 'LABORER', label: 'Laborer' },
                                { value: 'LANDSCAPER', label: 'Landscaper' },
                                { value: 'LENDING', label: 'Lending Professional' },
                                { value: 'MANAGER', label: 'Manager' },
                                { value: 'MECHANIC', label: 'MechanIC' },
                                { value: 'MILITARY', label: 'Military, Officer or Associated' },
                                { value: 'MORTICIAN', label: 'Mortician/Funeral Director' },
                                { value: 'NURSE', label: 'Nurse' },
                                { value: 'NUTRITIONIST', label: 'Nutritionist' },
                                { value: 'OFFICE', label: 'Office Associate' },
                                { value: 'PHARMACIST', label: 'Pharmacist' },
                                { value: 'PHYSICAL', label: 'Physical Therapist' },
                                { value: 'PILOT', label: 'Pilot' },
                                { value: 'POLICE', label: 'Police Officer/Firefighter/Law Enforcement Professional' },
                                { value: 'POLITICIAN', label: 'Politician' },
                                { value: 'PM', label: 'Project Manager' },
                                { value: 'REP', label: 'Registered Rep' },
                                { value: 'RESEARCHER', label: 'Researcher' },
                                { value: 'SAILOR', label: 'Sailor/Seaman' },
                                { value: 'SALES', label: 'Salesperson' },
                                { value: 'SCIENTIST', label: 'Scientist' },
                                { value: 'SEAMSTRESS', label: 'Seamstress/Tailor' },
                                { value: 'SECURITY', label: 'Security Guard' },
                                { value: 'SOCIAL', label: 'Social Worker' },
                                { value: 'TEACHER', label: 'Teacher/Professor' },
                                { value: 'TECHNICIAN', label: 'Technician' },
                                { value: 'TELLER', label: 'Teller' },
                                { value: 'TRADESPERSON', label: 'Tradesperson/Craftsperson' },
                                { value: 'TRAINER', label: 'Trainer/Instructor' },
                                { value: 'TRANSPORTER', label: 'Transporter' },
                                { value: 'UNDERWRITER', label: 'Underwriter' },
                                { value: 'WRITER', label: 'Writer/Journalist/Editor' }
                            ]} />
                            <FormInput label="Employment Country" name="employmentCountry" value={formData.employmentCountry} onChange={handleChange} options={countries} />
                            <FormInput label="Risk Tolerance" name="riskTolerance" value={formData.riskTolerance} onChange={handleChange} required options={[
                                { value: 'LOW', label: 'Low Risk' },
                                { value: 'MODERATE', label: 'Moderate Risk' },
                                { value: 'SPECULATION', label: 'Speculative Risk' },
                                { value: 'HIGH', label: 'High Risk' }
                            ]} />
                            <FormInput label="Investment Exp" name="investmentExperience" value={formData.investmentExperience} onChange={handleChange} required options={[
                                { value: 'NONE', label: 'None' },
                                { value: 'YRS_1_2', label: '1-2 years' },
                                { value: 'YRS_3_5', label: '3-5 years' },
                                { value: 'YRS_5_10', label: '5-10 years' },
                                { value: 'YRS_10_', label: '10+ years' }
                            ]} />
                            <FormInput label="Annual Income ($)" name="annualIncome" value={formData.annualIncome} onChange={handleChange} type="number" required />
                            <FormInput label="Liquid Networth ($)" name="networthLiquid" value={formData.networthLiquid} onChange={handleChange} type="number" required />
                            <FormInput label="Total Networth ($)" name="networthTotal" value={formData.networthTotal} onChange={handleChange} type="number" required />
                            <FormInput label="Investment Objectives" name="investmentObjectives" value={formData.investmentObjectives} onChange={handleChange} required options={[
                                { value: 'LONG_TERM', label: 'Long-term buy & hold investing' },
                                { value: 'INFREQUENT', label: 'Trading infrequently when I see an opportunity' },
                                { value: 'FREQUENT', label: 'Frequent trader, depending on the market' },
                                { value: 'ACTIVE_DAILY', label: 'Active trader, daily trader' },
                                { value: 'NEW', label: 'New to investing' }
                            ]} />
                            <FormInput label="Referral Code" name="userReferralCode" value={formData.userReferralCode} onChange={handleChange} />
                            <FormInput label="Director Of (Company)" name="directorOf" value={formData.directorOf} onChange={handleChange} required />
                            <FormInput
                                label="Politically Exposed"
                                name="isPEP"
                                value={isPEP}
                                onChange={handlePEPChange}
                                required
                                options={[
                                    { value: 'No', label: 'No' },
                                    { value: 'Yes', label: 'Yes' }
                                ]}
                            />

                            {isPEP === 'Yes' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <FormInput
                                        label="Official & Family Member Names"
                                        name="politicallyExposedNames"
                                        value={formData.politicallyExposedNames || ''}
                                        onChange={handleChange}
                                        placeholder="Provide the names of that official and official's immediate family members (including former spouses)"
                                        required
                                    />
                                </div>
                            )}
                            <FormInput label="Signed By" name="signedBy" value={formData.signedBy} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="relative bg-[#f2fffa] p-4 rounded-xl border border-[#c2e2d5] overflow-auto h-[300px]">
                        <CheckboxInput label="I am a US Tax Payer" name="usTaxPayer" checked={formData.usTaxPayer} onChange={handleChange} />
                        <CheckboxInput label="I am a Broker/Dealer" name="isBroker" checked={formData.isBroker} onChange={handleChange} />
                        <CheckboxInput label="Accept Terms of Use" name="termsOfUse" checked={formData.termsOfUse} onChange={handleChange} required />
                        <CheckboxInput label="Accept Rule 14b" name="rule14b" checked={formData.rule14b} onChange={handleChange} required />
                        <CheckboxInput label="Accept Customer Agreement" name="customerAgreement" checked={formData.customerAgreement} onChange={handleChange} required />
                        <CheckboxInput label="Accept Market Data Agreement" name="marketDataAgreement" checked={formData.marketDataAgreement} onChange={handleChange} required />
                        <CheckboxInput label="Accept Privacy Policy" name="privacyPolicy" checked={formData.privacyPolicy} onChange={handleChange} required />
                        <CheckboxInput label="Accept Data Sharing" name="dataSharing" checked={formData.dataSharing} onChange={handleChange} required />
                        <CheckboxInput label="Accept Stockal Terms of Use" name="stockalTermsOfUse" checked={formData.stockalTermsOfUse} onChange={handleChange} required />
                    </div>

                </div>
            </div>
        </form>
    );
};

export default UserForm;
