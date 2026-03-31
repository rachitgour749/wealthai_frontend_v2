import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/config/axiosInstance';
import { API_ENDPOINTS } from '../../api/config/apiConfig';
import { Database, Upload, Trash2, RefreshCw, X, ChevronDown, FileText, AlertTriangle, Check } from 'lucide-react';

const FileManagerPanel = ({ isOpen, onClose, adminKey, onAuthError }) => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const headers = { 'x-admin-key': adminKey };

    // Helper to extract error message from axios interceptor's rewritten error
    const getErrorMsg = (err, fallback) => {
        return err?.data?.detail || err?.response?.data?.detail || err?.message || fallback;
    };

    const fetchStores = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_STORES, { headers });
            setStores(res.data.stores || []);
        } catch (err) {
            if (err?.status === 401 && onAuthError) { onAuthError(); return; }
            setError(getErrorMsg(err, 'Failed to load stores'));
        } finally {
            setLoading(false);
        }
    }, [adminKey]);

    const fetchDocuments = useCallback(async (storeId) => {
        if (!storeId) return;
        setDocsLoading(true);
        setError('');
        try {
            const id = storeId.replace('fileSearchStores/', '');
            const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_STORE_DOCS(id), { headers });
            setDocuments(res.data.documents || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load documents');
        } finally {
            setDocsLoading(false);
        }
    }, [adminKey]);

    useEffect(() => {
        if (isOpen && adminKey) fetchStores();
    }, [isOpen, adminKey]);

    useEffect(() => {
        if (selectedStore) fetchDocuments(selectedStore);
    }, [selectedStore]);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    const handleUpload = async (files) => {
        if (!selectedStore || !files?.length) return;
        const storeId = selectedStore.replace('fileSearchStores/', '');
        setUploading(true);
        setError('');

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('display_name', file.name);
                await axiosInstance.post(API_ENDPOINTS.ADMIN_STORE_UPLOAD(storeId), formData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
                    timeout: 120000
                });
                setSuccess(`Uploaded: ${file.name}`);
            } catch (err) {
                setError(`Failed to upload ${file.name}: ${err.response?.data?.detail || err.message}`);
            }
        }
        setUploading(false);
        fetchDocuments(selectedStore);
    };

    const handleDelete = async (docName) => {
        const storeId = selectedStore.replace('fileSearchStores/', '');
        const docId = docName.split('/documents/')[1];
        if (!docId) return;
        setError('');
        try {
            await axiosInstance.delete(API_ENDPOINTS.ADMIN_STORE_DOC_DELETE(storeId, docId), { headers });
            setSuccess('Document deleted');
            setDeleteConfirm(null);
            fetchDocuments(selectedStore);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-[#0d2626] border-l border-[#1a4040] shadow-2xl flex flex-col h-full animate-slide-in-right">
                {/* Header */}
                <div className="p-4 border-b border-[#1a4040] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5bc4e6] to-[#2a8ab0] flex items-center justify-center">
                            <Database className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-white">File Manager</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
                </div>

                {/* Store Selector */}
                <div className="p-4 border-b border-[#1a4040] flex-shrink-0">
                    <label className="block text-xs text-gray-400 mb-1">Select Store</label>
                    <div className="relative">
                        <select
                            value={selectedStore}
                            onChange={(e) => { setSelectedStore(e.target.value); setDocuments([]); }}
                            className="w-full px-3 py-2.5 bg-[#0a1a1a] border border-[#1a4040] rounded-lg text-white text-sm appearance-none focus:outline-none focus:border-[#5bc4e6] transition-colors"
                        >
                            <option value="">Choose a store...</option>
                            {stores.map(s => (
                                <option key={s.name} value={s.name}>{s.display_name} ({s.doc_count} docs)</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Alerts */}
                <div className="px-4 pt-2 flex-shrink-0">
                    {error && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {error}
                            <button onClick={() => setError('')} className="ml-auto"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {success && (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 mb-2">
                            <Check className="w-3 h-3" /> {success}
                        </div>
                    )}
                </div>

                {/* Upload Area */}
                {selectedStore && (
                    <div className="px-4 py-3 flex-shrink-0">
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
                ${dragActive ? 'border-[#5bc4e6] bg-[#5bc4e6]/10' : 'border-[#1a4040] hover:border-[#2a5050]'}`}
                            onClick={() => document.getElementById('file-upload-input').click()}
                        >
                            <input
                                id="file-upload-input"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files)}
                            />
                            {uploading ? (
                                <div className="flex items-center justify-center gap-2 text-[#5bc4e6]">
                                    <RefreshCw className="w-5 h-5 animate-spin" /> <span className="text-sm">Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Drop files here or click to upload</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {!selectedStore ? (
                        <div className="text-center text-gray-500 mt-12 text-sm">Select a store to manage files</div>
                    ) : docsLoading ? (
                        <div className="text-center text-gray-400 mt-12">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><span className="text-sm">Loading documents...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center text-gray-500 mt-12 text-sm">No documents in this store</div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">{documents.length} documents</span>
                                <button onClick={() => fetchDocuments(selectedStore)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Refresh
                                </button>
                            </div>
                            {documents.map((doc, i) => (
                                <div key={doc.name || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a1a1a]/60 border border-[#1a4040]/50 hover:border-[#2a5050] transition-colors group">
                                    <FileText className="w-4 h-4 text-[#5bc4e6] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{doc.display_name || doc.name.split('/').pop()}</p>
                                        <p className="text-[10px] text-gray-500">{doc.state} • {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : 'N/A'}</p>
                                    </div>
                                    {deleteConfirm === doc.name ? (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => handleDelete(doc.name)} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30">Delete</button>
                                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-[10px]">Cancel</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(doc.name)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default FileManagerPanel;
