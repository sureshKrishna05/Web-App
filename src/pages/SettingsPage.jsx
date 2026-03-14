import React, { useState, useEffect, useCallback, useRef } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .st-root { font-family: 'DM Sans', sans-serif; display: flex; gap: 24px; align-items: flex-start; }

  /* ── Sidebar tabs ── */
  .st-sidebar {
    width: 220px; flex-shrink: 0;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(16px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 18px;
    padding: 10px; display: flex; flex-direction: column; gap: 2px;
    animation: st-in 0.35s ease both;
  }
  .st-tab {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px; border: none;
    background: transparent; cursor: pointer; text-align: left; width: 100%;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; transition: all 0.15s;
  }
  .st-tab:hover { background: rgba(16,185,129,0.07); color: #0D6E4D; }
  .st-tab.active {
    background: linear-gradient(135deg, rgba(13,110,77,0.12), rgba(16,185,129,0.10));
    color: #0D6E4D; font-weight: 600;
  }
  .st-tab-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: all 0.15s;
  }
  .st-tab.active .st-tab-icon { background: rgba(16,185,129,0.18); }
  .st-tab:not(.active) .st-tab-icon { background: rgba(107,127,116,0.08); }

  /* ── Main content ── */
  .st-content {
    flex: 1; display: flex; flex-direction: column; gap: 18px;
    animation: st-in 0.4s ease 0.05s both;
  }
  @keyframes st-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Glass panel ── */
  .st-panel {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(13,110,77,0.06);
  }
  .st-panel-header {
    padding: 16px 22px; border-bottom: 1px solid rgba(16,185,129,0.09);
    background: rgba(16,185,129,0.03);
    display: flex; align-items: center; gap: 10px;
  }
  .st-panel-header-icon {
    width: 30px; height: 30px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .st-panel-title { font-size: 13px; font-weight: 700; color: #0f1f17; }
  .st-panel-sub   { font-size: 11px; color: #6b7f74; margin-top: 1px; }
  .st-panel-body  { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }

  /* ── Fields ── */
  .st-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .st-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
  }
  .st-input, .st-textarea {
    width: 100%; padding: 9px 12px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .st-input:focus, .st-textarea:focus {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .st-input::placeholder, .st-textarea::placeholder { color: #9caea6; }
  .st-textarea { resize: vertical; min-height: 80px; }

  /* ── Save button ── */
  .st-save-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 38px; padding: 0 22px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); transition: all 0.18s;
  }
  .st-save-btn:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.40); transform: translateY(-1px); }

  /* ── Data management cards ── */
  .st-data-card {
    border-radius: 16px; padding: 18px 20px;
    border: 1px solid rgba(16,185,129,0.13);
    background: rgba(255,255,255,0.7);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  }
  .st-data-card.danger {
    background: rgba(254,242,242,0.8);
    border-color: rgba(239,68,68,0.2);
  }
  .st-data-card-icon {
    width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .st-data-card-title { font-size: 14px; font-weight: 700; color: #0f1f17; margin-bottom: 4px; }
  .st-data-card.danger .st-data-card-title { color: #991b1b; }
  .st-data-card-desc { font-size: 12px; color: #6b7f74; line-height: 1.6; }
  .st-data-card.danger .st-data-card-desc { color: #b91c1c; }

  .st-action-btn {
    height: 36px; padding: 0 18px; border-radius: 10px; border: none;
    font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    display: flex; align-items: center; gap: 6px; transition: all 0.18s;
  }
  .st-btn-green {
    background: linear-gradient(135deg, #0D6E4D, #10B981); color: #fff;
    box-shadow: 0 3px 10px rgba(13,110,77,0.25);
  }
  .st-btn-green:hover { box-shadow: 0 5px 16px rgba(13,110,77,0.38); transform: translateY(-1px); }
  .st-btn-red {
    background: linear-gradient(135deg, #b91c1c, #ef4444); color: #fff;
    box-shadow: 0 3px 10px rgba(185,28,28,0.25);
  }
  .st-btn-red:hover { box-shadow: 0 5px 16px rgba(185,28,28,0.38); transform: translateY(-1px); }

  /* ── Loading skeleton ── */
  .st-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* ── Toast notification ── */
  .st-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 14px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.16);
    animation: toast-in 0.28s cubic-bezier(.22,1,.36,1);
    max-width: 360px;
  }
  @keyframes toast-in { from{opacity:0;transform:translateY(12px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  .st-toast-success { background: #0D6E4D; color: #fff; }
  .st-toast-error   { background: #b91c1c; color: #fff; }
  .st-toast-info    { background: #0E7490; color: #fff; }
  .st-toast-close {
    background: rgba(255,255,255,0.2); border: none; color: #fff;
    width: 22px; height: 22px; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; flex-shrink: 0; margin-left: 4px;
    transition: background 0.15s;
  }
  .st-toast-close:hover { background: rgba(255,255,255,0.3); }
`;

/* Icons */
const IcProfile  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcData     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IcSave     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcBackup   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcRestore  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
const IcBuilding = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18M16 3v18M2 9h20M2 15h20"/></svg>;
const IcCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcWarn     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcInfo     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

/* ── Toast ── */
const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [message, onDismiss]);

    if (!message) return null;

    const icons = { success: <IcCheck />, error: <IcWarn />, info: <IcInfo /> };
    const cls   = { success: 'st-toast-success', error: 'st-toast-error', info: 'st-toast-info' };

    return (
        <div className={`st-toast ${cls[type] || cls.info}`}>
            {icons[type] || icons.info}
            <span style={{ flex: 1 }}>{message}</span>
            <button className="st-toast-close" onClick={onDismiss}>×</button>
        </div>
    );
};

const TABS = [
    { id: 'profile', label: 'Company Profile', icon: <IcProfile /> },
    { id: 'data',    label: 'Data Management', icon: <IcData /> },
];

const SettingsPage = ({ onSettingsUpdate }) => {
    const [activeTab, setActiveTab]     = useState('profile');
    const [settings, setSettings]       = useState({ company_name: '', address: '', phone: '', gstin: '', footer_text: '' });
    const [loading, setLoading]         = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            if (!response.ok) { const e = await response.json(); throw new Error(e.error || `HTTP error! status: ${response.status}`); }
            const data = await response.json();
            if (data) setSettings(data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            showNotification(`Failed to load settings: ${err.message}`, 'error');
        } finally { setLoading(false); }
    }, [showNotification]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleInputChange = (e) => { const { name, value } = e.target; setSettings(prev => ({ ...prev, [name]: value })); };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
            if (!response.ok) { const e = await response.json(); throw new Error(e.error || `HTTP error! status: ${response.status}`); }
            showNotification('Settings saved successfully!', 'success');
            if (onSettingsUpdate) onSettingsUpdate();
        } catch (err) { showNotification(`Failed to save settings: ${err.message}`, 'error'); }
    };

    const handleBackup = async () => {
        showNotification('Starting backup download...', 'info');
        try {
            const response = await fetch('/api/backup-db');
            if (!response.ok) { let e = `Backup failed: ${response.statusText}`; try { const d = await response.json(); e = d.error || e; } catch {} throw new Error(e); }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.style.display = 'none'; a.href = url;
            const cd = response.headers.get('content-disposition');
            let filename = 'pharmacy-backup.db';
            if (cd) { const m = cd.match(/filename="(.+)"/); if (m && m.length === 2) filename = m[1]; }
            a.download = filename; document.body.appendChild(a); a.click();
            window.URL.revokeObjectURL(url); a.remove();
            showNotification('Backup downloaded successfully!', 'success');
        } catch (err) { showNotification(`Backup failed: ${err.message}`, 'error'); }
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.db')) {
            showNotification('Invalid file type. Please select a .db backup file.', 'error');
            event.target.value = null; return;
        }
        if (window.confirm('Warning: Restoring will overwrite all current data. This cannot be undone. Are you sure?')) {
            showNotification('Restoring database... Please wait.', 'info');
            const formData = new FormData(); formData.append('dbfile', file);
            try {
                const response = await fetch('/api/restore-db', { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok) { showNotification(result.message || 'Database restored successfully!', 'success'); }
                else throw new Error(result.error || 'Restore failed on the server.');
            } catch (err) { showNotification(`Restore failed: ${err.message}`, 'error'); }
            finally { event.target.value = null; }
        } else { event.target.value = null; }
    };

    const handleRestoreClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };

    const SkeletonForm = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="st-grid-2">
                {[1,2].map(i => <div key={i}><div className="st-skel" style={{ height: 11, width: 80, marginBottom: 8 }} /><div className="st-skel" style={{ height: 38, width: '100%' }} /></div>)}
            </div>
            {[1,2,3].map(i => <div key={i}><div className="st-skel" style={{ height: 11, width: 80, marginBottom: 8 }} /><div className="st-skel" style={{ height: 38, width: '100%' }} /></div>)}
        </div>
    );

    const renderProfile = () => (
        <form onSubmit={handleSaveSettings}>
            <div className="st-panel-body">
                {loading ? <SkeletonForm /> : (
                    <>
                        <div className="st-grid-2">
                            <div>
                                <div className="st-field-label">Company Name</div>
                                <input type="text" name="company_name" value={settings.company_name || ''} onChange={handleInputChange} placeholder="e.g. MedPlus Pharmacy" className="st-input" />
                            </div>
                            <div>
                                <div className="st-field-label">Phone Number</div>
                                <input type="text" name="phone" value={settings.phone || ''} onChange={handleInputChange} placeholder="+91 98765 43210" className="st-input" />
                            </div>
                        </div>
                        <div>
                            <div className="st-field-label">GSTIN / Tax ID</div>
                            <input type="text" name="gstin" value={settings.gstin || ''} onChange={handleInputChange} placeholder="27AAAPL1234C1ZV" className="st-input" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }} />
                        </div>
                        <div>
                            <div className="st-field-label">Address</div>
                            <textarea name="address" value={settings.address || ''} onChange={handleInputChange} rows="3" placeholder="Street, City, State, PIN" className="st-textarea" />
                        </div>
                        <div>
                            <div className="st-field-label">Invoice Footer Text</div>
                            <input type="text" name="footer_text" value={settings.footer_text || ''} onChange={handleInputChange} placeholder="e.g. Terms & Conditions apply. Subject to jurisdiction." className="st-input" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="st-save-btn"><IcSave /> Save Settings</button>
                        </div>
                    </>
                )}
            </div>
        </form>
    );

    const renderData = () => (
        <div className="st-panel-body">
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".db" style={{ display: 'none' }} aria-hidden="true" />

            {/* Backup card */}
            <div className="st-data-card">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                    <div className="st-data-card-icon" style={{ background: 'rgba(16,185,129,0.10)', color: '#0D6E4D' }}><IcBackup /></div>
                    <div>
                        <div className="st-data-card-title">Backup All Application Data</div>
                        <div className="st-data-card-desc">Create a single backup file (.db) containing all items, clients, suppliers, and invoice history. Keep this file in a safe place.</div>
                    </div>
                </div>
                <button className="st-action-btn st-btn-green" onClick={handleBackup}>
                    <IcBackup /> Backup
                </button>
            </div>

            {/* Restore card */}
            <div className="st-data-card danger">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                    <div className="st-data-card-icon" style={{ background: 'rgba(239,68,68,0.10)', color: '#b91c1c' }}><IcWarn /></div>
                    <div>
                        <div className="st-data-card-title">Restore Data from Backup</div>
                        <div className="st-data-card-desc"><strong>Warning:</strong> This will overwrite all current data. This action cannot be undone.</div>
                    </div>
                </div>
                <button className="st-action-btn st-btn-red" onClick={handleRestoreClick}>
                    <IcRestore /> Restore
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{css}</style>
            <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />

            <div className="st-root">

                {/* ── Sidebar ── */}
                <div className="st-sidebar">
                    {TABS.map(tab => (
                        <button key={tab.id} className={`st-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            <div className="st-tab-icon">{tab.icon}</div>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Content ── */}
                <div className="st-content">
                    {activeTab === 'profile' && (
                        <div className="st-panel">
                            <div className="st-panel-header">
                                <div className="st-panel-header-icon" style={{ background: 'rgba(16,185,129,0.10)', color: '#0D6E4D' }}><IcBuilding /></div>
                                <div>
                                    <div className="st-panel-title">Company Profile</div>
                                    <div className="st-panel-sub">Your business details used on invoices and reports</div>
                                </div>
                            </div>
                            {renderProfile()}
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="st-panel">
                            <div className="st-panel-header">
                                <div className="st-panel-header-icon" style={{ background: 'rgba(14,116,144,0.10)', color: '#0E7490' }}><IcData /></div>
                                <div>
                                    <div className="st-panel-title">Data Management</div>
                                    <div className="st-panel-sub">Backup and restore your application database</div>
                                </div>
                            </div>
                            {renderData()}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SettingsPage;