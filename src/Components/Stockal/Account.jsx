import React, { useState } from 'react';
import { User, Users, ShieldCheck, ChevronRight, Edit3, Plus } from 'lucide-react';
import AccountInfo from './Account/AccountInfo';
import Beneficiaries from './Account/Beneficiaries';
import AccountInfoForm from './Account/AccountInfoForm';
import BeneficiaryForm from './Account/BeneficiaryForm';
import { CustId } from './customerId';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStockalAccountInfo } from '../../store/slices/stockalSlice';
import { useEffect } from 'react';

const Account = () => {
    const dispatch = useDispatch();
    const { isUserValidated, beneficiaries } = useSelector((state) => state.stockal);
    const [activeTab, setActiveTab] = useState('account-info');
    const [showForm, setShowForm] = useState(!isUserValidated);
    const [showBenForm, setShowBenForm] = useState(false);
    const [editingBeneficiary, setEditingBeneficiary] = useState(null);

    // Using the exported CustId for testing
    const custId = CustId;

    useEffect(() => {
        if (custId && !isUserValidated) {
            dispatch(fetchStockalAccountInfo(custId));
        }
    }, [dispatch, custId, isUserValidated]);

    useEffect(() => {
        if (isUserValidated) {
            setShowForm(false);
        }
    }, [isUserValidated]);

    const tabs = [
        { id: 'account-info', label: 'My Profile', icon: User },
        { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    ];

    const handleAddBeneficiary = () => {
        setEditingBeneficiary(null);
        setShowBenForm(true);
    };

    const handleEditBeneficiary = (ben) => {
        setEditingBeneficiary(ben);
        setShowBenForm(true);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-4 border-b border-gray-300 flex items-center w-full">
                <div className="flex items-center gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== 'account-info') setShowForm(false);
                                if (tab.id !== 'beneficiaries') setShowBenForm(false);
                            }}
                            className={`group relative flex items-center gap-2 px-4 py-[5px] rounded-full transition-all duration-300 border text-sm font-semibold tracking-wide uppercase ${activeTab === tab.id
                                ? 'bg-wealth-800 border-wealth-900 text-[#f6cd9e] shadow-md shadow-wealth-800/20'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-wealth-800/30 hover:text-wealth-800'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    {activeTab === 'account-info' && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-[6px] bg-wealth-800 text-[#f6cd9e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-wealth-900 transition-all shadow-md shadow-wealth-800/20 active:scale-95 whitespace-nowrap"
                        >
                            <Edit3 size={14} />
                            Edit Profile
                        </button>
                    )}
                    {activeTab === 'beneficiaries' && !showBenForm && (
                        <button
                            onClick={handleAddBeneficiary}
                            className="flex items-center gap-2 px-3 py-[6px] bg-wealth-800 text-[#f6cd9e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-wealth-900 transition-all shadow-md shadow-wealth-800/20 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={14} />
                            Add New
                        </button>
                    )}
                </div>
            </div>

            {/* Content section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'account-info' && (
                        showForm ? (
                            <AccountInfoForm
                                custId={custId}
                                initialData={null}
                                onClose={() => setShowForm(false)}
                            />
                        ) : (
                            <AccountInfo custId={custId} />
                        )
                    )}
                    {activeTab === 'beneficiaries' && (
                        showBenForm ? (
                            <BeneficiaryForm
                                custId={custId}
                                beneficiary={editingBeneficiary}
                                existingBeneficiaries={beneficiaries}
                                onClose={() => setShowBenForm(false)}
                            />
                        ) : (
                            <Beneficiaries
                                custId={custId}
                                onEdit={handleEditBeneficiary}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;
