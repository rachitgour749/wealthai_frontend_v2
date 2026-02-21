import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockalAccountInfo } from '../../../store/slices/stockalSlice';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';

const AccountInfo = ({ custId }) => {
    const dispatch = useDispatch();
    const { accountInfo, loading, error } = useSelector((state) => state.stockal);

    useEffect(() => {
        if (custId && !accountInfo) {
            dispatch(fetchStockalAccountInfo(custId));
        }
    }, [dispatch, custId, accountInfo]);

    if (loading.accountInfo) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5ae78]"></div>
            </div>
        );
    }

    if (error.accountInfo) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error.accountInfo}
            </div>
        );
    }

    if (!accountInfo) return null;

    const InfoCard = ({ title, icon: Icon, children }) => (
        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2 border-b border-gray-50 pb-1.5">
                <div className="flex items-center gap-2">
                    <Icon size={18} className="text-wealth-800" />
                    <h3 className="text-[14px] font-bold text-wealth-900 uppercase tracking-tight">{title}</h3>
                </div>
            </div>
            <div className="space-y-[3px]">
                {children}
            </div>
        </div>
    );

    const InfoItem = ({ label, value }) => (
        <div className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
            <p className="text-[12px] text-gray-500 uppercase font-medium tracking-tighter">{label}</p>
            <p className="text-sm text-wealth-900 font-semibold">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Profile */}
                <InfoCard title="Personal Profile" icon={User}>
                    <InfoItem label="Full Name" value={accountInfo.fullName} />
                    <InfoItem label="Email" value={accountInfo.email} icon={Mail} />
                    <InfoItem label="Phone" value={accountInfo.phone} icon={Phone} />
                    <InfoItem label="Date of Birth" value={accountInfo.dob} icon={Calendar} />
                    <InfoItem label="Gender" value={accountInfo.gender} />
                </InfoCard>

                {/* Identity & Tax */}
                <InfoCard title="Identity & Tax" icon={FileText}>
                    <InfoItem label="Tax ID (PAN)" value={accountInfo.identity?.idNo} />
                    <InfoItem label="ID Type" value={accountInfo.identity?.idType} />
                    <InfoItem label="Citizenship" value={accountInfo.identity?.citizenship} />
                    <InfoItem label="US Tax Payer" value={accountInfo.usTaxPayer ? 'Yes' : 'No'} />
                </InfoCard>

                {/* Address */}
                <InfoCard title="Residential Address" icon={MapPin}>
                    <InfoItem label="Line 1" value={accountInfo.address?.line1} />
                    <InfoItem label="Line 2" value={accountInfo.address?.line2} />
                    <InfoItem label="City" value={accountInfo.address?.city} />
                    <InfoItem label="State/Province" value={accountInfo.address?.stateProvince} />
                    <InfoItem label="Country" value={accountInfo.address?.countryID} />
                    <InfoItem label="Zip/Postal Code" value={accountInfo.address?.zipPostalCode} />
                </InfoCard>

                {/* Employment */}
                <InfoCard title="Employment" icon={Briefcase}>
                    <InfoItem label="Company" value={accountInfo.employment?.company} />
                    <InfoItem label="Position" value={accountInfo.employment?.position} />
                    <InfoItem label="Status" value={accountInfo.employment?.status} />
                    <InfoItem label="Type" value={accountInfo.employment?.type} />
                </InfoCard>

                {/* Financial Profile */}
                <InfoCard title="Financial Profile" icon={CheckCircle}>
                    <InfoItem label="Investment Experience" value={accountInfo.financialProfile?.investmentExperience?.replace(/_/g, ' ')} />
                    <InfoItem label="Investment Objectives" value={accountInfo.financialProfile?.investmentObjectives?.replace(/_/g, ' ')} />
                    <InfoItem label="Annual Income" value={`$${accountInfo.financialProfile?.annualIncome}`} />
                    <InfoItem label="Risk Tolerance" value={accountInfo.financialProfile?.riskTolerance} />
                </InfoCard>

                {/* KYC Status */}
                <InfoCard title="KYC Status" icon={Clock}>
                    <div className="flex items-center justify-between mb-1 p-1.5 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${accountInfo.kycDetails?.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-[11px] font-bold text-wealth-900 uppercase tracking-widest">{accountInfo.kycDetails?.status}</span>
                        </div>
                    </div>
                    <InfoItem label="Reason" value={accountInfo.kycDetails?.reason} />
                    <InfoItem label="Approved" value={new Date(accountInfo.kycDetails?.approvedAt).toLocaleDateString()} />
                </InfoCard>
            </div>

            {/* Account Product Info */}
            {accountInfo.accounts?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm mt-3">
                    <h3 className="text-[14px] font-bold text-wealth-900 uppercase mb-2 border-b border-gray-50 pb-1.5">Investment Accounts</h3>
                    <div className="flex flex-wrap gap-2">
                        {accountInfo.accounts.map((acc, idx) => (
                            <div key={idx} className="flex-1 min-w-[200px] flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                <div>
                                    <p className="text-[12px] text-[#c0a86f] font-medium uppercase tracking-tighter">{acc.productName}</p>
                                    <p className="text-sm text-wealth-900 font-semibold">{acc.accountNo}</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-1.5 py-0.5 text-[10px] bg-green-500/10 text-green-600 border border-green-500/20 rounded-full font-bold uppercase">{acc.accountStatus}</span>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{new Date(acc.accountApprovedDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountInfo;
