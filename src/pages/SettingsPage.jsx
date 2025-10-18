import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate-fade-in-out';
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4000); // Auto-dismiss after 4 seconds
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {message}
        </div>
    );
};


const SettingsPage = ({ onSettingsUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        company_name: '',
        address: '',
        phone: '',
        gstin: '',
        footer_text: ''
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            showNotification("Failed to load settings.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            showNotification("Settings saved successfully!", "success");
            if (onSettingsUpdate) {
                onSettingsUpdate(); // Notify parent component to re-fetch settings
            }
        } catch (err) {
            console.error("Failed to save settings:", err);
            showNotification("Failed to save settings.", "error");
        }
    };
    
    const handleBackup = async () => {
        // This needs a backend implementation
        showNotification('Backup functionality is not available in the web version.', 'info');
    };
    
    const handleRestore = async () => {
        // This needs a backend implementation
        showNotification('Restore functionality is not available in the web version.', 'info');
    };

    const renderContent = () => {
        if (loading) return <p className="text-center p-8">Loading settings...</p>;
        
        switch(activeTab) {
            case 'profile':
                return (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input type="text" name="company_name" value={settings.company_name || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="text" name="phone" value={settings.phone || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GSTIN / Tax ID</label>
                            <input type="text" name="gstin" value={settings.gstin || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea name="address" value={settings.address || ''} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Invoice Footer Text</label>
                            <input type="text" name="footer_text" value={settings.footer_text || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Terms & Conditions, Subject to jurisdiction..." />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">
                                Save Settings
                            </button>
                        </div>
                    </form>
                );
            case 'data':
                return (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Backup All Application Data</h3>
                            <p className="text-sm text-gray-600 mt-1">Create a single backup file (.db) containing all your items, clients, suppliers, and invoice history. Keep this file in a safe place.</p>
                            <div className="text-right mt-4">
                                <button onClick={handleBackup} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700">
                                    Backup Data
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border border-red-400 bg-red-50 rounded-lg">
                             <h3 className="font-semibold text-lg text-red-800">Restore Data from Backup</h3>
                            <p className="text-sm text-red-700 mt-1"><span className="font-bold">Warning:</span> This will overwrite all current data in the application. This action cannot be undone.</p>
                             <div className="text-right mt-4">
                                <button onClick={handleRestore} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700">
                                    Restore Data
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div>
             <Notification 
                message={notification.message}
                type={notification.type}
                onDismiss={() => setNotification({ message: '', type: '' })}
            />
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Company Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'data' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Data Management
                    </button>
                </nav>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;