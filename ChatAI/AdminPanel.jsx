import React, { useState, useEffect } from 'react';
import {
    Users, FileText, RefreshCw, Plus, Trash2, Upload,
    CheckCircle, AlertCircle, Clock, X, ArrowLeft
} from 'lucide-react';
import { apiClient } from '../../services/ChatAI/apiClient';
import { API_BASE_URL } from '../../config/ChatAI/api';

const ADMIN_HEADERS = { 'x-admin-key': 'test123' };

const AdminPanel = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('customers');
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        totalDocs: 0,
        totalCategories: 0
    });
    const [customers, setCustomers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [syncStatus, setSyncStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modals
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadCustomers(), loadDocuments(), loadSyncStatus()]);
        setLoading(false);
    };

    const showToastMessage = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadCustomers = async () => {
        try {
            const res = await apiClient.get('/admin/customers', ADMIN_HEADERS);
            const data = await res.json();
            setCustomers(data);
            setStats(prev => ({
                ...prev,
                totalCustomers: data.length,
                activeCustomers: data.filter(c => c.status === 'active').length
            }));
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const loadDocuments = async () => {
        try {
            const res = await apiClient.get('/admin/documents', ADMIN_HEADERS);
            const data = await res.json();
            setDocuments(data);
            const categories = new Set(data.map(d => d.category));
            setStats(prev => ({
                ...prev,
                totalDocs: data.length,
                totalCategories: categories.size
            }));
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const loadSyncStatus = async () => {
        try {
            const res = await apiClient.get('/admin/customers', ADMIN_HEADERS);
            const customersList = await res.json();

            const statusPromises = customersList.map(async c => {
                try {
                    const sRes = await apiClient.get(`/admin/sync/status/${c.id}`, ADMIN_HEADERS);
                    const status = await sRes.json();
                    return { ...status, customerName: c.name };
                } catch {
                    return { customerName: c.name, status: 'unknown' };
                }
            });

            const statuses = await Promise.all(statusPromises);
            setSyncStatus(statuses);
        } catch (error) {
            console.error('Error loading sync status:', error);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Convert empty strings to null for optional fields
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        try {
            const res = await apiClient.post('/admin/customers', data, ADMIN_HEADERS);
            if (res.ok) {
                showToastMessage('Customer added successfully');
                setShowAddCustomerModal(false);
                loadCustomers();
                e.target.reset();
            } else {
                const err = await res.json();
                console.error('Add Customer Error:', err);
                alert(`Error adding customer: ${err.detail || JSON.stringify(err)}`);
                showToastMessage(err.detail || 'Error adding customer', 'error');
            }
        } catch (error) {
            console.error('Add Customer Network Error:', error);
            alert(`Network/Server Error: ${error.message}`);
            showToastMessage('Error adding customer', 'error');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await apiClient.request(`/admin/customers/${id}`, { method: 'DELETE', headers: ADMIN_HEADERS });
            showToastMessage('Customer deleted');
            loadCustomers();
        } catch (error) {
            showToastMessage('Error deleting customer', 'error');
        }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const res = await apiClient.post('/admin/documents/upload', formData, ADMIN_HEADERS);
            if (res.ok) {
                showToastMessage('Document uploaded successfully');
                setShowUploadModal(false);
                loadDocuments();
                e.target.reset();
            } else {
                showToastMessage('Error uploading document', 'error');
            }
        } catch (error) {
            showToastMessage('Error uploading document', 'error');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await apiClient.request(`/admin/documents/${encodeURIComponent(id)}`, { method: 'DELETE', headers: ADMIN_HEADERS });
            showToastMessage('Document deleted');
            loadDocuments();
        } catch (error) {
            showToastMessage('Error deleting document', 'error');
        }
    };

    const handleSyncCustomer = async (id) => {
        try {
            const res = await apiClient.post(`/admin/sync/customer/${id}`, {}, ADMIN_HEADERS);
            if (res.ok) {
                showToastMessage('Sync started!');
                loadSyncStatus();
            }
        } catch (error) {
            showToastMessage('Error starting sync', 'error');
        }
    };

    const handleSyncAll = async () => {
        try {
            const res = await apiClient.post('/admin/sync/all', {}, ADMIN_HEADERS);
            if (res.ok) {
                const data = await res.json();
                showToastMessage(`Sync started for ${data.customer_count} customers!`);
                loadSyncStatus();
            }
        } catch (error) {
            showToastMessage('Error starting sync', 'error');
        }
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Admin Dashboard
                        </h1>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Customers" value={stats.totalCustomers} icon={<Users size={20} />} />
                    <StatCard title="Active Customers" value={stats.activeCustomers} icon={<CheckCircle size={20} />} color="text-green-600" />
                    <StatCard title="Total Documents" value={stats.totalDocs} icon={<FileText size={20} />} />
                    <StatCard title="Categories" value={stats.totalCategories} icon={<RefreshCw size={20} />} />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <TabButton active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users size={16} />} label="Customers" />
                    <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={16} />} label="Documents" />
                    <TabButton active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<RefreshCw size={16} />} label="Sync" />
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {activeTab === 'customers' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customers</h2>
                                <button onClick={() => setShowAddCustomerModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                                    <Plus size={18} /> Add Customer
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Docs</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Last Sync</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {customers.length === 0 ? (
                                            <tr><td colSpan="6" className="py-8 text-center text-gray-500">No customers found</td></tr>
                                        ) : customers.map(c => (
                                            <tr key={c.id} className="group hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{c.email}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{c.status}</span>
                                                </td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{c.docs_synced || 0}</td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{c.last_sync ? new Date(c.last_sync).toLocaleDateString() : '-'}</td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleSyncCustomer(c.id)} className="p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded" title="Sync"><RefreshCw size={16} /></button>
                                                        <button onClick={() => handleDeleteCustomer(c.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Delete"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Documents</h2>
                                <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                                    <Upload size={18} /> Upload Document
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Filename</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {documents.length === 0 ? (
                                            <tr><td colSpan="5" className="py-8 text-center text-gray-500">No documents found</td></tr>
                                        ) : documents.map(d => (
                                            <tr key={d.id} className="group hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2"><FileText size={16} className="text-gray-400" /> {d.filename}</td>
                                                <td className="py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">{d.category}</span></td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{formatBytes(d.size_bytes)}</td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{new Date(d.uploaded_at).toLocaleDateString()}</td>
                                                <td className="py-4 text-right">
                                                    <button onClick={() => handleDeleteDocument(d.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Delete"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sync' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sync Operations</h2>
                                <button onClick={handleSyncAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                    <RefreshCw size={18} /> Sync All Customers
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Push all product documents to customer File Search stores.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Completed At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {syncStatus.length === 0 ? (
                                            <tr><td colSpan="4" className="py-8 text-center text-gray-500">No sync activity</td></tr>
                                        ) : syncStatus.map((s, i) => (
                                            <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-4 font-medium text-gray-900 dark:text-white">{s.customerName}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        s.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>{s.status || 'Pending'}</span>
                                                </td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{s.docs_synced || 0} / {s.total_docs || '-'}</td>
                                                <td className="py-4 text-gray-600 dark:text-gray-300">{s.completed_at ? new Date(s.completed_at).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddCustomerModal && (
                <Modal title="Add New Customer" onClose={() => setShowAddCustomerModal(false)}>
                    <form onSubmit={handleAddCustomer} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                                <input type="text" name="name" required placeholder="ABC Financial Services" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" name="email" required placeholder="admin@abc.com" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gemini API Key</label>
                            <input type="password" name="api_key" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoho Organization ID (Optional)</label>
                            <input type="text" name="zoho_org_id" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoho Client ID</label>
                                <input type="text" name="zoho_client_id" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoho Client Secret</label>
                                <input type="password" name="zoho_client_secret" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium">Add Customer</button>
                    </form>
                </Modal>
            )}

            {showUploadModal && (
                <Modal title="Upload Document" onClose={() => setShowUploadModal(false)}>
                    <form onSubmit={handleUploadDocument} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select name="category" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="Health Insurance">Health Insurance</option>
                                <option value="Life Insurance">Life Insurance</option>
                                <option value="Motor Insurance">Motor Insurance</option>
                                <option value="Mutual Funds">Mutual Funds</option>
                                <option value="Stocks">Stocks</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document File</label>
                            <input type="file" name="file" accept=".pdf,.md,.txt" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <p className="text-xs text-gray-500 mt-1">PDF, MD, TXT supported</p>
                        </div>
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium">Upload Document</button>
                    </form>
                </Modal>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} animate-fade-in-up z-50`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon, color = 'text-teal-600' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg ${color} dark:text-gray-300`}>{icon}</div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${active ? 'border-teal-600 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
    >
        {icon} {label}
    </button>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
            </div>
            {children}
        </div>
    </div>
);

export default AdminPanel;
