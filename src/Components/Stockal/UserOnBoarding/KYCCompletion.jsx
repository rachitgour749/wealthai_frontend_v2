import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadStockalDocument, submitStockalKyc, fetchStockalEkycUrl, fetchEkycStatus } from '../../../store/slices/stockalSlice';
import {
    FileUp,
    FileCheck,
    X,
    ArrowRight,
    AlertCircle,
    UploadCloud,
    CheckCircle2,
    Scan,
    ShieldCheck,
    FileText,
    ExternalLink,
    ChevronLeft,
    MonitorSmartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const documentTypes = [
    // For Indian Residents
    { value: 'NATIONAL_ID_CARD', label: 'PAN Card', proofType: 'ID', residency: 'IND' },
    { value: 'NATIONAL_ID_CARD', label: 'Aadhaar Card', proofType: 'ID', residency: 'IND' },

    // For Non-Indian Residents
    { value: 'NATIONAL_ID_CARD', label: 'National ID', proofType: 'ID', residency: 'GLOBAL' },
    { value: 'RESIDENCE_PERMIT', label: 'Residence Permit', proofType: 'ID', residency: 'GLOBAL' },
    { value: 'DRIVER_LICENSE', label: 'Driver\'s License', proofType: 'ID', residency: 'GLOBAL' },
    { value: 'PASSPORT', label: 'Passport', proofType: 'ID', residency: 'GLOBAL' },
    { value: 'OTHER', label: 'Utility Bill', proofType: 'ADDRESS', residency: 'GLOBAL' },
    { value: 'OTHER', label: 'Bank / Society Statement', proofType: 'ADDRESS', residency: 'GLOBAL' },
];

const FileUploadArea = ({ label, file, onFileSelect, onRemove, isUploading, isUploaded }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="flex-1 px-3">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
                {label} <span className="text-red-500">*</span>
            </label>
            {!file ? (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-[#9cc5b4] bg-[#f8fdfb] hover:bg-[#f0f9f6] hover:border-wealth-800 transition-all rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer gap-3 min-h-[160px] group ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {isUploading ? (
                            <div className="w-6 h-6 border-2 border-wealth-800/30 border-t-wealth-800 rounded-full animate-spin"></div>
                        ) : (
                            <UploadCloud size={24} className="text-wealth-800" />
                        )}
                    </div>
                    <div className="text-center">
                        <span className="block text-[14px] font-bold text-wealth-800 uppercase tracking-tight">
                            {isUploading ? 'Uploading...' : 'Select File'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">PDF, JPG or PNG (Max 5MB)</span>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => onFileSelect(e.target.files[0])}
                        accept="image/jpeg,image/png,application/pdf"
                        disabled={isUploading}
                    />
                </div>
            ) : (
                <div className="border border-wealth-800/20 bg-wealth-800/[0.02] rounded-2xl p-5 flex items-center justify-between min-h-[160px] animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-wealth-800/10">
                            {isUploaded ? <ShieldCheck size={22} className="text-green-600" /> : <FileText size={22} className="text-wealth-800" />}
                        </div>
                        <div className="truncate max-w-[180px]">
                            <p className="text-sm font-bold text-wealth-900 truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                {isUploaded && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase bg-green-50 px-1.5 py-0.5 rounded">
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all border border-gray-100 shadow-sm"
                        disabled={isUploading}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

const MethodCard = ({ title, description, icon: Icon, onClick, badge, loading }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-white border-2 border-gray-200 hover:border-wealth-800/30 p-4 rounded-[20px] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full overflow-hidden relative"
    >
        {badge && (
            <div className="absolute top-0 right-0 mt-6 mr-6 h-6 px-3 bg-wealth-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-full flex items-center">
                {badge}
            </div>
        )}

        <div className="w-16 h-16 bg-wealth-800/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-wealth-800 transition-all duration-300">
            {loading ? (
                <div className="w-8 h-8 border-3 border-wealth-800/10 border-t-wealth-800 group-hover:border-t-white rounded-full animate-spin"></div>
            ) : (
                <Icon size={32} className="text-wealth-800 group-hover:text-white transition-colors" />
            )}
        </div>

        <div className="flex-1">
            <h3 className="text-xl font-bold text-wealth-900 mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="mt-8 flex items-center gap-2 font-bold text-[11px] text-wealth-800 uppercase tracking-widest group-hover:gap-3 transition-all">
            Proceed with {title.split(' ')[0]} <ArrowRight size={16} />
        </div>
    </motion.div>
);

const KYCCompletion = ({ onComplete, onBack }) => {
    const dispatch = useDispatch();
    const { loading, error, custId, kycStatus, kycStatusReason, accountInfo, ekycUrlData } = useSelector((state) => state.stockal);
    const country = accountInfo?.country;

    const [method, setMethod] = useState(null); // null, 'manual', 'digilocker'
    const [residencyToggle, setResidencyToggle] = useState(country === 'IND' ? 'IND' : 'US');

    const filteredDocTypes = documentTypes.filter(doc =>
        residencyToggle === 'IND' ? doc.residency === 'IND' : doc.residency === 'GLOBAL'
    );

    const [selectedDocType, setSelectedDocType] = useState(filteredDocTypes[0] || documentTypes[0]);

    // Reset selected doc type when toggle changes
    useEffect(() => {
        const newFiltered = documentTypes.filter(doc =>
            residencyToggle === 'IND' ? doc.residency === 'IND' : doc.residency === 'GLOBAL'
        );
        setSelectedDocType(newFiltered[0] || documentTypes[0]);
    }, [residencyToggle]);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontUploaded, setFrontUploaded] = useState(false);
    const [backUploaded, setBackUploaded] = useState(false);
    const [frontUploading, setFrontUploading] = useState(false);
    const [backUploading, setBackUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Pre-fetch Digilocker URL in the background if KYC is not initiated
    useEffect(() => {
        if (kycStatus === 'NOT_INITIATED' && custId && !ekycUrlData && !loading.ekycUrl) {
            dispatch(fetchStockalEkycUrl(custId));
        }
    }, [kycStatus, custId, ekycUrlData]);

    const handleDigilockerSelect = async () => {
        setMethod('digilocker');

        // If URL is already fetched, open it immediately
        if (ekycUrlData?.url) {
            window.open(ekycUrlData.url, '_blank', 'noreferrer');
            return;
        }

        const result = await dispatch(fetchStockalEkycUrl(custId));
        if (fetchStockalEkycUrl.fulfilled.match(result)) {
            const url = result.payload?.url;
            if (url) {
                window.open(url, '_blank', 'noreferrer');
            }
        }
    };

    const handleFileUpload = async (side, file) => {
        if (!file) return;
        if (!custId) {
            setUploadError('Session expired. Please re-verify your details.');
            return;
        }

        setUploadError('');
        const isFront = side === 'FRONT';
        if (isFront) {
            setFrontFile(file);
            setFrontUploading(true);
            setFrontUploaded(false);
        } else {
            setBackFile(file);
            setBackUploading(true);
            setBackUploaded(false);
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', selectedDocType.value);
            formData.append('proofType', selectedDocType.proofType);
            formData.append('side', side);
            formData.append('custId', custId);

            const result = await dispatch(uploadStockalDocument(formData));

            if (uploadStockalDocument.fulfilled.match(result)) {
                if (isFront) setFrontUploaded(true);
                else setBackUploaded(true);
            } else {
                const errorMessage = result.payload || '';
                if (errorMessage.toLowerCase().includes('already submitted')) {
                    if (isFront) setFrontUploaded(true);
                    else setBackUploaded(true);
                } else {
                    setUploadError(`Failed to upload ${side.toLowerCase()} side.`);
                    if (isFront) setFrontFile(null);
                    else setBackFile(null);
                }
            }
        } catch (err) {
            setUploadError(`An unexpected error occurred during upload.`);
            if (isFront) setFrontFile(null);
            else setBackFile(null);
        } finally {
            if (isFront) setFrontUploading(false);
            else setBackUploading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!frontUploaded || !backUploaded) return;
        const result = await dispatch(submitStockalKyc(custId));
        if (submitStockalKyc.fulfilled.match(result)) {
            onComplete();
        }
    };

    return (
        <div className="px-[60px] py-[10px] animate-in fade-in zoom-in-95 duration-500 mb-6">
            {/* Header Area */}
            <div className="flex items-center justify-between border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-wealth-800 text-white rounded-[8px] flex items-center justify-center shadow-lg shadow-wealth-800/20">
                        <ShieldCheck size={19} />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-wealth-900 uppercase tracking-tight">
                            {method === 'manual' ? 'Manual Documentation' : method === 'digilocker' ? 'Digilocker Verification' : 'Choose Your Method'}
                        </h1>
                        <p className="text-[14px] mt-[-2px] text-gray-400 font-medium">
                            {method === 'manual' ? 'Select document type and upload both sides' : 'Secure KYC Compliance Framework'}
                        </p>
                    </div>
                </div>

                {method && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMethod(null)}
                            className="flex items-center gap-2 text-[14px] font-bold text-gray-500 hover:text-wealth-800 border border-gray-400 px-3 py-1.5 rounded-[7px] transition-colors"
                        >
                            <ChevronLeft size={18} /> Change Method
                        </button>
                        {method === 'manual' && (
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading.kycSubmission || !frontUploaded || !backUploaded}
                                className="flex items-center gap-2 px-4 py-1.5 bg-wealth-900 text-white rounded-[8px] text-[15px] font-medium hover:shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-wealth-900/10"
                            >
                                {loading.kycSubmission ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Submit KYC <ArrowRight size={18} /></>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!method ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <MethodCard
                            title="Instant Digilocker"
                            description="Fastest way to verify. No documents to upload. Uses your government-issued credentials."
                            icon={MonitorSmartphone}
                            onClick={handleDigilockerSelect}
                            badge="Recommended"
                            loading={loading.ekycUrl}
                        />
                        <MethodCard
                            title="Manual Upload"
                            description="Traditional method. Upload pictures of your identity and address proof documents."
                            icon={FileUp}
                            onClick={() => setMethod('manual')}
                        />
                    </motion.div>
                ) : method === 'digilocker' ? (
                    <motion.div
                        key="digilocker"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-2 border-wealth-800/10 rounded-[40px] p-12 text-center space-y-8 shadow-xl"
                    >
                        <div className="w-24 h-24 bg-wealth-800/5 rounded-full flex items-center justify-center mx-auto">
                            <MonitorSmartphone size={48} className="text-wealth-800 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-wealth-900 uppercase">Redirecting to Digilocker</h2>
                            <p className="text-gray-400 text-sm max-w-[400px] mx-auto font-medium leading-relaxed">
                                We are opening a secure government verification portal in a new tab. Please complete the process there.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 pt-4">
                            <button
                                onClick={() => ekycUrlData?.url && window.open(ekycUrlData.url, '_blank')}
                                className="px-8 py-4 bg-wealth-800 text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3"
                            >
                                Re-open Link <ExternalLink size={18} />
                            </button>
                            <button
                                onClick={() => dispatch(fetchEkycStatus(custId))}
                                className="text-[10px] font-bold text-gray-400 hover:text-wealth-800 uppercase tracking-widest border-b border-transparent hover:border-wealth-800 pb-0.5 transition-all"
                            >
                                Already completed? Click here
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="manual"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-gray-100 rounded-[20px] p-1 md:p-5 shadow-sm mt-[-15px]"
                    >


                        {(uploadError || error?.upload || error?.kycSubmission) && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl animate-in shake-1 duration-500">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-wide leading-tight">
                                    {uploadError || error.upload || error.kycSubmission}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4 mt-[10px]">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[12px] font-medium text-gray-400">
                                        Identity Asset Selection <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center bg-gray-100 rounded-[8px] p-[3px]">
                                        <button
                                            onClick={() => setResidencyToggle('IND')}
                                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-[6px] transition-all ${
                                                residencyToggle === 'IND'
                                                    ? 'bg-wealth-800 text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            India
                                        </button>
                                        <button
                                            onClick={() => setResidencyToggle('US')}
                                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-[6px] transition-all ${
                                                residencyToggle === 'US'
                                                    ? 'bg-wealth-800 text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            US
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedDocType.label}
                                        onChange={(e) => {
                                            const doc = filteredDocTypes.find(d => d.label === e.target.value);
                                            if (doc) setSelectedDocType(doc);
                                        }}
                                        className="w-full h-11 bg-white border border-gray-200 text-wealth-900 rounded-[10px] px-4 outline-none focus:ring-2 focus:ring-wealth-800/10 focus:border-wealth-800 transition-all text-[13px] font-bold shadow-sm appearance-none cursor-pointer"
                                    >
                                        {filteredDocTypes.map(doc => (
                                            <option key={doc.label} value={doc.label}>
                                                {doc.label} ({doc.proofType} PROOF)
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ArrowRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 bg-gray-50/30 p-5 rounded-[24px] border border-gray-100">
                                <FileUploadArea
                                    label="Primary Face (Front)"
                                    file={frontFile}
                                    onFileSelect={(file) => handleFileUpload('FRONT', file)}
                                    onRemove={() => { setFrontFile(null); setFrontUploaded(false); }}
                                    isUploading={frontUploading}
                                    isUploaded={frontUploaded}
                                />
                                <div className="hidden md:block w-px bg-gray-200/60 my-2"></div>
                                <FileUploadArea
                                    label="Security Detail (Back)"
                                    file={backFile}
                                    onFileSelect={(file) => handleFileUpload('BACK', file)}
                                    onRemove={() => { setBackFile(null); setBackUploaded(false); }}
                                    isUploading={backUploading}
                                    isUploaded={backUploaded}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex md:hidden">
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading.kycSubmission || !frontUploaded || !backUploaded}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-wealth-900 text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest shadow-xl disabled:opacity-50"
                            >
                                {loading.kycSubmission ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Complete Verification"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KYCCompletion;
