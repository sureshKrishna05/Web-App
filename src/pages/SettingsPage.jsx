import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate-fade-in-out z-50'; // Added z-index
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
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
            {message}
             <button onClick={onDismiss} className="ml-4 font-bold text-lg leading-none">&times;</button>
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
    const fileInputRef = useRef(null); // Ref for file input

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
    }, []); // Memoize showNotification

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            showNotification(`Failed to load settings: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    }, [showNotification]); // Add showNotification dependency

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
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            showNotification("Settings saved successfully!", "success");
            if (onSettingsUpdate) {
                onSettingsUpdate(); // Notify parent component to re-fetch settings
            }
        } catch (err) {
            console.error("Failed to save settings:", err);
            showNotification(`Failed to save settings: ${err.message}`, "error");
        }
    };

    const handleBackup = async () => {
        showNotification('Starting backup download...', 'info');
        try {
            const response = await fetch('/api/backup-db'); // Make GET request
            if (!response.ok) {
                 // Try parsing error message from JSON response
                 let errorMsg = `Backup failed: ${response.statusText}`;
                 try {
                     const errorData = await response.json();
                     errorMsg = errorData.error || errorMsg;
                 } catch (parseError) {
                     // Ignore if response is not JSON
                 }
                throw new Error(errorMsg);
            }

            // Trigger browser download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'pharmacy-backup.db'; // Default filename
             if (contentDisposition) {
                 const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                 if (filenameMatch && filenameMatch.length === 2) {
                     filename = filenameMatch[1];
                 }
             }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showNotification('Backup downloaded successfully!', 'success');

        } catch (err) {
            console.error("Failed to download backup:", err);
            showNotification(`Backup failed: ${err.message}`, "error");
        }
    };

    // Triggered when the hidden file input changes
    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        if (!file.name.toLowerCase().endsWith('.db')) {
             showNotification('Invalid file type. Please select a .db backup file.', 'error');
             event.target.value = null; // Reset file input
             return;
        }


        if (window.confirm('Warning: Restoring will overwrite all current data. This cannot be undone. Are you sure you want to proceed?')) {
            showNotification('Restoring database... Please wait.', 'info');
            const formData = new FormData();
            formData.append('dbfile', file); // 'dbfile' must match upload.single('dbfile') in main.js

            try {
                const response = await fetch('/api/restore-db', {
                    method: 'POST',
                    body: formData, // Send FormData
                    // Don't set Content-Type header manually for FormData, browser does it
                });

                const result = await response.json(); // Always expect JSON response

                if (response.ok) {
                    showNotification(result.message || 'Database restored successfully! Reloading the page might be required to see changes.', 'success');
                    // Consider prompting user to reload or doing it automatically
                    // if (window.confirm("Restore successful. Reload the application now to apply changes?")) {
                    //    window.location.reload();
                    // }
                } else {
                    throw new Error(result.error || 'Restore failed on the server.');
                }
            } catch (err) {
                console.error("Failed to restore database:", err);
                showNotification(`Restore failed: ${err.message}`, "error");
            } finally {
                 // Reset file input value so the same file can be selected again if needed
                 event.target.value = null;
            }
        } else {
             event.target.value = null; // Reset file input if user cancels confirm dialog
        }
    };

    // This function now just triggers the hidden file input
    const handleRestoreClick = () => {
         if (fileInputRef.current) {
            fileInputRef.current.click();
         }
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
                        {/* --- Hidden File Input for Restore --- */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelected}
                            accept=".db" // Accept only .db files
                            style={{ display: 'none' }}
                            aria-hidden="true" // For accessibility
                        />
                         {/* --- Backup Section --- */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Backup All Application Data</h3>
                            <p className="text-sm text-gray-600 mt-1">Create a single backup file (.db) containing all your items, clients, suppliers, and invoice history. Keep this file in a safe place.</p>
                            <div className="text-right mt-4">
                                <button onClick={handleBackup} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700">
                                    Backup Data
                                </button>
                            </div>
                        </div>
                         {/* --- Restore Section --- */}
                        <div className="p-4 border border-red-400 bg-red-50 rounded-lg">
                             <h3 className="font-semibold text-lg text-red-800">Restore Data from Backup</h3>
                            <p className="text-sm text-red-700 mt-1"><span className="font-bold">Warning:</span> This will overwrite all current data in the application. This action cannot be undone.</p>
                             <div className="text-right mt-4">
                                 {/* This button now triggers the hidden input */}
                                <button onClick={handleRestoreClick} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700">
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
                <nav className="-mb-px flex space-x-6" aria-label="Settings Tabs">
                    <button
                        onClick={() => setActiveTab('profile')}
                        role="tab"
                        aria-selected={activeTab === 'profile'}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Company Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        role="tab"
                        aria-selected={activeTab === 'data'}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'data' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Data Management
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div role="tabpanel" className="bg-white p-6 rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;