import React, { useState, useEffect, useCallback } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .sp-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 18px; }

  /* ── Top bar ── */
  .sp-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .sp-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
  .sp-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9caea6; pointer-events: none; }
  .sp-search {
    width: 100%; height: 38px; padding: 0 12px 0 34px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 11px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    color: #0f1f17; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sp-search:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .sp-search::placeholder { color: #9caea6; }

  .sp-add-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 38px; padding: 0 18px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff; border: none; border-radius: 11px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(13,110,77,0.28);
    transition: all 0.18s ease;
  }
  .sp-add-btn:hover { box-shadow: 0 5px 20px rgba(13,110,77,0.38); transform: translateY(-1px); }

  /* ── Summary pills ── */
  .sp-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .sp-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 12px;
    padding: 9px 16px;
    animation: sp-in 0.4s ease both;
  }
  .sp-pill:nth-child(1){ animation-delay:.05s } .sp-pill:nth-child(2){ animation-delay:.10s } .sp-pill:nth-child(3){ animation-delay:.15s }
  @keyframes sp-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .sp-pill-val { font-size: 17px; font-weight: 700; color: #0D6E4D; font-family: 'DM Mono', monospace; }
  .sp-pill-lbl { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

  /* ── Glass panel ── */
  .sp-panel {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(13,110,77,0.07);
    animation: sp-in 0.45s ease 0.15s both;
  }

  /* ── Table ── */
  .sp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .sp-thead-row { border-bottom: 1px solid rgba(16,185,129,0.12); }
  .sp-th {
    padding: 12px 18px; font-size: 10px; font-weight: 700;
    letter-spacing: 0.9px; text-transform: uppercase; color: #6b7f74;
    background: rgba(16,185,129,0.04); white-space: nowrap;
  }
  .sp-tr { border-bottom: 1px solid rgba(16,185,129,0.07); transition: background 0.13s; }
  .sp-tr:last-child { border-bottom: none; }
  .sp-tr:hover { background: rgba(16,185,129,0.04); }
  .sp-td { padding: 13px 18px; color: #374151; vertical-align: middle; }

  /* Avatar */
  .sp-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }

  .sp-name { font-weight: 600; color: #0f1f17; font-size: 13px; }

  /* GSTIN badge */
  .sp-gstin-badge {
    display: inline-block;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    background: rgba(16,185,129,0.08); color: #065f46;
    border-radius: 7px; padding: 2px 8px;
  }

  /* Action buttons */
  .sp-action-btn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .sp-edit-btn { background: rgba(16,185,129,0.08); color: #0D6E4D; }
  .sp-edit-btn:hover { background: rgba(16,185,129,0.18); }
  .sp-del-btn  { background: rgba(239,68,68,0.07); color: #ef4444; }
  .sp-del-btn:hover  { background: rgba(239,68,68,0.15); }

  /* Skeleton */
  .sp-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; display: inline-block;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Empty */
  .sp-empty { padding: 60px 0; text-align: center; color: #6b7f74; }
  .sp-empty-icon { font-size: 36px; margin-bottom: 12px; }

  /* Footer */
  .sp-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; border-top: 1px solid rgba(16,185,129,0.09);
    background: rgba(16,185,129,0.025); font-size: 12px; color: #6b7f74;
  }

  /* ── Modal ── */
  .sp-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: fade-in 0.18s ease;
  }
  @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
  .sp-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 22px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden;
    animation: modal-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes modal-in { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
  .sp-modal-header {
    padding: 22px 24px 18px; border-bottom: 1px solid rgba(16,185,129,0.1);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
  }
  .sp-modal-title { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .sp-modal-sub   { font-size: 12px; color: #6b7f74; margin-top: 2px; }
  .sp-modal-body  { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
  .sp-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px;
  }
  .sp-field-input, .sp-field-textarea {
    width: 100%; padding: 9px 12px;
    border: 1px solid rgba(16,185,129,0.2); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sp-field-input:focus, .sp-field-textarea:focus {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .sp-field-textarea { resize: vertical; min-height: 72px; }
  .sp-modal-footer {
    padding: 16px 24px; border-top: 1px solid rgba(16,185,129,0.1);
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .sp-cancel-btn {
    height: 36px; padding: 0 16px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .sp-cancel-btn:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .sp-save-btn {
    height: 36px; padding: 0 20px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.25); transition: all 0.18s;
  }
  .sp-save-btn:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.38); transform: translateY(-1px); }
`;

/* Icons */
const IcPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPhone  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IcTruck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;

/* Avatar colors */
const AVATAR_COLORS = [
  { bg: 'rgba(99,102,241,0.12)',  color: '#4338CA' },
  { bg: 'rgba(14,116,144,0.12)',  color: '#0E7490' },
  { bg: 'rgba(13,110,77,0.12)',   color: '#0D6E4D' },
  { bg: 'rgba(245,158,11,0.12)',  color: '#B45309' },
  { bg: 'rgba(236,72,153,0.12)',  color: '#9D174D' },
  { bg: 'rgba(239,68,68,0.10)',   color: '#B91C1C' },
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials    = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

/* ── Modal ── */
const SupplierModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', gstin: '' });

    useEffect(() => {
        if (item) {
            setFormData({ name: item.name, phone: item.phone || '', address: item.address || '', gstin: item.gstin || '' });
        } else {
            setFormData({ name: '', phone: '', address: '', gstin: '' });
        }
    }, [item, isOpen]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); if (!formData.name) { alert('Supplier name is required.'); return; } onSave(formData); };

    if (!isOpen) return null;

    return (
        <div className="sp-overlay" onClick={onClose}>
            <div className="sp-modal" onClick={e => e.stopPropagation()}>
                <div className="sp-modal-header">
                    <div className="sp-modal-title">{item ? 'Edit Supplier' : 'Add New Supplier'}</div>
                    <div className="sp-modal-sub">{item ? `Editing ${item.name}` : 'Fill in the supplier details below'}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="sp-modal-body">
                        {[
                            { label: 'Supplier Name *', name: 'name',  type: 'text', required: true, placeholder: 'e.g. Sun Pharma Distributors' },
                            { label: 'Phone Number',    name: 'phone', type: 'text', placeholder: '+91 98765 43210' },
                            { label: 'GSTIN',           name: 'gstin', type: 'text', placeholder: '27AAAPL1234C1ZV' },
                        ].map(f => (
                            <div key={f.name}>
                                <div className="sp-field-label">{f.label}</div>
                                <input type={f.type} name={f.name} value={formData[f.name]}
                                    onChange={handleChange} required={f.required}
                                    placeholder={f.placeholder} className="sp-field-input" />
                            </div>
                        ))}
                        <div>
                            <div className="sp-field-label">Address</div>
                            <textarea name="address" value={formData.address} onChange={handleChange}
                                placeholder="Street, City, State" className="sp-field-textarea" />
                        </div>
                    </div>
                    <div className="sp-modal-footer">
                        <button type="button" className="sp-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="sp-save-btn">{item ? 'Update Supplier' : 'Save Supplier'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Main page ── */
const SuppliersPage = () => {
    const [suppliers, setSuppliers]           = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [search, setSearch]                 = useState('');

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/suppliers');
            if (!response.ok) throw new Error('Network response was not ok');
            setSuppliers(await response.json());
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

    const handleOpenModal  = (supplier = null) => { setSelectedSupplier(supplier); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedSupplier(null); };

    const handleSave = async (supplierData) => {
        try {
            const url    = selectedSupplier ? `/api/suppliers/${selectedSupplier.id}` : '/api/suppliers';
            const method = selectedSupplier ? 'PUT' : 'POST';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supplierData) });
            fetchSuppliers(); handleCloseModal();
        } catch (err) {
            console.error('Failed to save supplier:', err);
            setError('Failed to save supplier. A supplier with this name may already exist.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try { await fetch(`/api/suppliers/${id}`, { method: 'DELETE' }); fetchSuppliers(); }
            catch (err) { console.error('Failed to delete supplier:', err); setError('Failed to delete supplier.'); }
        }
    };

    const filtered = suppliers.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search) ||
        s.gstin?.toLowerCase().includes(search.toLowerCase())
    );

    const withGstin = suppliers.filter(s => s.gstin).length;

    return (
        <div className="sp-root">
            <style>{css}</style>

            {/* Top bar */}
            <div className="sp-topbar">
                <div className="sp-search-wrap">
                    <span className="sp-search-icon"><IcSearch /></span>
                    <input className="sp-search" placeholder="Search name, phone, GSTIN…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="sp-add-btn" onClick={() => handleOpenModal()}>
                    <IcPlus /> Add New Supplier
                </button>
            </div>

            {/* Summary pills */}
            {!loading && !error && (
                <div className="sp-pills">
                    <div className="sp-pill">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA' }}><IcTruck /></div>
                        <div>
                            <div className="sp-pill-val">{suppliers.length}</div>
                            <div className="sp-pill-lbl">Total Suppliers</div>
                        </div>
                    </div>
                    <div className="sp-pill">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D6E4D' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                        </div>
                        <div>
                            <div className="sp-pill-val">{withGstin}</div>
                            <div className="sp-pill-lbl">GST Registered</div>
                        </div>
                    </div>
                    <div className="sp-pill">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <div>
                            <div className="sp-pill-val">{suppliers.length - withGstin}</div>
                            <div className="sp-pill-lbl">Unregistered</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table panel */}
            <div className="sp-panel">
                {loading ? (
                    <table className="sp-table">
                        <thead>
                            <tr className="sp-thead-row">
                                {['Supplier', 'Phone', 'Address', 'GSTIN', ''].map(h => (
                                    <th key={h} className="sp-th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1,2,3,4,5].map(i => (
                                <tr key={i} className="sp-tr">
                                    <td className="sp-td">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="sp-skel" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'block' }} />
                                            <span className="sp-skel" style={{ width: 120, height: 12 }} />
                                        </div>
                                    </td>
                                    {[80, 130, 90, 60].map((w, j) => (
                                        <td key={j} className="sp-td"><span className="sp-skel" style={{ width: w, height: 12 }} /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : error ? (
                    <div className="sp-empty"><div className="sp-empty-icon">⚠️</div><div style={{ color: '#ef4444' }}>{error}</div></div>
                ) : filtered.length === 0 ? (
                    <div className="sp-empty">
                        <div className="sp-empty-icon">🚚</div>
                        <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>
                            {search ? 'No suppliers match your search' : 'No suppliers yet'}
                        </div>
                        <div style={{ fontSize: 13 }}>
                            {search ? 'Try a different search term' : 'Add your first supplier to get started'}
                        </div>
                    </div>
                ) : (
                    <>
                        <table className="sp-table">
                            <thead>
                                <tr className="sp-thead-row">
                                    <th className="sp-th" style={{ textAlign: 'left' }}>Supplier</th>
                                    <th className="sp-th" style={{ textAlign: 'left' }}>Phone</th>
                                    <th className="sp-th" style={{ textAlign: 'left' }}>Address</th>
                                    <th className="sp-th" style={{ textAlign: 'left' }}>GSTIN</th>
                                    <th className="sp-th" style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(supplier => {
                                    const av = avatarColor(supplier.name);
                                    return (
                                        <tr key={supplier.id} className="sp-tr">
                                            {/* Name + avatar */}
                                            <td className="sp-td">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="sp-avatar" style={{ background: av.bg, color: av.color }}>
                                                        {initials(supplier.name)}
                                                    </div>
                                                    <div className="sp-name">{supplier.name}</div>
                                                </div>
                                            </td>
                                            {/* Phone */}
                                            <td className="sp-td">
                                                {supplier.phone
                                                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 13 }}>
                                                        <IcPhone /> {supplier.phone}
                                                      </div>
                                                    : <span style={{ color: '#c4cfc8' }}>—</span>
                                                }
                                            </td>
                                            {/* Address */}
                                            <td className="sp-td" style={{ color: '#6b7f74', fontSize: 12 }}>
                                                {supplier.address
                                                    ? <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{supplier.address}</div>
                                                    : <span style={{ color: '#c4cfc8' }}>—</span>
                                                }
                                            </td>
                                            {/* GSTIN */}
                                            <td className="sp-td">
                                                {supplier.gstin
                                                    ? <span className="sp-gstin-badge">{supplier.gstin}</span>
                                                    : <span style={{ color: '#c4cfc8', fontSize: 12 }}>—</span>
                                                }
                                            </td>
                                            {/* Actions */}
                                            <td className="sp-td" style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button className="sp-action-btn sp-edit-btn" onClick={() => handleOpenModal(supplier)} title="Edit">
                                                        <IcEdit />
                                                    </button>
                                                    <button className="sp-action-btn sp-del-btn" onClick={() => handleDelete(supplier.id)} title="Delete">
                                                        <IcTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="sp-footer">
                            <span>{filtered.length} of {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</span>
                            <span>{withGstin} GST registered</span>
                        </div>
                    </>
                )}
            </div>

            <SupplierModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={selectedSupplier} />
        </div>
    );
};

export default SuppliersPage;