import React, { useState, useEffect, useCallback } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .pp-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 18px; }

  /* ── Top bar ── */
  .pp-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .pp-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
  .pp-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9caea6; pointer-events: none; }
  .pp-search {
    width: 100%; height: 38px; padding: 0 12px 0 34px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 11px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    color: #0f1f17; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .pp-search:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .pp-search::placeholder { color: #9caea6; }

  .pp-add-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 38px; padding: 0 18px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff; border: none; border-radius: 11px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(13,110,77,0.28);
    transition: all 0.18s ease;
  }
  .pp-add-btn:hover { box-shadow: 0 5px 20px rgba(13,110,77,0.38); transform: translateY(-1px); }

  /* ── Summary pills ── */
  .pp-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .pp-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 12px;
    padding: 9px 16px;
    animation: pp-in 0.4s ease both;
  }
  .pp-pill:nth-child(1){ animation-delay:.05s } .pp-pill:nth-child(2){ animation-delay:.10s } .pp-pill:nth-child(3){ animation-delay:.15s }
  @keyframes pp-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .pp-pill-val { font-size: 17px; font-weight: 700; color: #0D6E4D; font-family: 'DM Mono', monospace; }
  .pp-pill-lbl { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

  /* ── Glass panel + table ── */
  .pp-panel {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(13,110,77,0.07);
    animation: pp-in 0.45s ease 0.15s both;
  }
  .pp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .pp-thead-row { border-bottom: 1px solid rgba(16,185,129,0.12); }
  .pp-th {
    padding: 12px 18px; font-size: 10px; font-weight: 700;
    letter-spacing: 0.9px; text-transform: uppercase; color: #6b7f74;
    background: rgba(16,185,129,0.04); white-space: nowrap;
  }
  .pp-tr { border-bottom: 1px solid rgba(16,185,129,0.07); transition: background 0.13s; }
  .pp-tr:last-child { border-bottom: none; }
  .pp-tr:hover { background: rgba(16,185,129,0.04); }
  .pp-td { padding: 13px 18px; color: #374151; vertical-align: middle; }

  /* Avatar */
  .pp-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* Name cell */
  .pp-name { font-weight: 600; color: #0f1f17; font-size: 13px; }
  .pp-gstin { font-family: 'DM Mono', monospace; font-size: 11px; color: #6b7f74; }

  /* GSTIN badge */
  .pp-gstin-badge {
    display: inline-block;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    background: rgba(16,185,129,0.08); color: #065f46;
    border-radius: 7px; padding: 2px 8px;
  }

  /* Action buttons */
  .pp-action-btn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .pp-edit-btn  { background: rgba(16,185,129,0.08); color: #0D6E4D; }
  .pp-edit-btn:hover  { background: rgba(16,185,129,0.18); }
  .pp-del-btn   { background: rgba(239,68,68,0.07);  color: #ef4444; }
  .pp-del-btn:hover   { background: rgba(239,68,68,0.15); }

  /* Skeleton */
  .pp-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; display: inline-block;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Empty */
  .pp-empty { padding: 60px 0; text-align: center; color: #6b7f74; }
  .pp-empty-icon { font-size: 36px; margin-bottom: 12px; }

  /* Footer */
  .pp-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; border-top: 1px solid rgba(16,185,129,0.09);
    background: rgba(16,185,129,0.025); font-size: 12px; color: #6b7f74;
  }

  /* ── Modal overlay ── */
  .pp-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: fade-in 0.18s ease;
  }
  @keyframes fade-in { from { opacity:0; } to { opacity:1; } }

  /* Modal card */
  .pp-modal {
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18);
    border-radius: 22px; width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    overflow: hidden;
    animation: modal-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes modal-in { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .pp-modal-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid rgba(16,185,129,0.1);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
  }
  .pp-modal-title { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .pp-modal-sub   { font-size: 12px; color: #6b7f74; margin-top: 2px; }

  .pp-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

  .pp-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px;
  }
  .pp-field-input, .pp-field-textarea {
    width: 100%; padding: 9px 12px;
    border: 1px solid rgba(16,185,129,0.2); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .pp-field-input:focus, .pp-field-textarea:focus {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .pp-field-textarea { resize: vertical; min-height: 72px; }

  .pp-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(16,185,129,0.1);
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .pp-cancel-btn {
    height: 36px; padding: 0 16px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .pp-cancel-btn:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .pp-save-btn {
    height: 36px; padding: 0 20px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.25);
    transition: all 0.18s;
  }
  .pp-save-btn:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.38); transform: translateY(-1px); }
`;

/* Icons */
const IcPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPhone  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;

/* Avatar color palette */
const AVATAR_COLORS = [
  { bg: 'rgba(13,110,77,0.12)',   color: '#0D6E4D' },
  { bg: 'rgba(14,116,144,0.12)',  color: '#0E7490' },
  { bg: 'rgba(99,102,241,0.12)',  color: '#4338CA' },
  { bg: 'rgba(245,158,11,0.12)',  color: '#B45309' },
  { bg: 'rgba(236,72,153,0.12)',  color: '#9D174D' },
  { bg: 'rgba(239,68,68,0.10)',   color: '#B91C1C' },
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials    = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

/* ── Modal ── */
const PartyModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', gstin: '' });

    useEffect(() => {
        if (item) {
            setFormData({ name: item.name, phone: item.phone || '', address: item.address || '', gstin: item.gstin || '' });
        } else {
            setFormData({ name: '', phone: '', address: '', gstin: '' });
        }
    }, [item, isOpen]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); if (!formData.name) return; onSave(formData); };

    if (!isOpen) return null;

    return (
        <div className="pp-overlay" onClick={onClose}>
            <div className="pp-modal" onClick={e => e.stopPropagation()}>
                <div className="pp-modal-header">
                    <div className="pp-modal-title">{item ? 'Edit Client' : 'Add New Client'}</div>
                    <div className="pp-modal-sub">{item ? `Editing ${item.name}` : 'Fill in the details below'}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="pp-modal-body">
                        {[
                            { label: 'Client Name *', name: 'name', type: 'text', required: true, placeholder: 'e.g. Apollo Pharmacy' },
                            { label: 'Phone Number',  name: 'phone', type: 'text', placeholder: '+91 98765 43210' },
                            { label: 'GSTIN',         name: 'gstin', type: 'text', placeholder: '27AAAPL1234C1ZV' },
                        ].map(f => (
                            <div key={f.name}>
                                <div className="pp-field-label">{f.label}</div>
                                <input
                                    type={f.type} name={f.name} value={formData[f.name]}
                                    onChange={handleChange} required={f.required}
                                    placeholder={f.placeholder} className="pp-field-input"
                                />
                            </div>
                        ))}
                        <div>
                            <div className="pp-field-label">Address</div>
                            <textarea name="address" value={formData.address} onChange={handleChange}
                                placeholder="Street, City, State" className="pp-field-textarea" />
                        </div>
                    </div>
                    <div className="pp-modal-footer">
                        <button type="button" className="pp-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="pp-save-btn">{item ? 'Update Client' : 'Save Client'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Main page ── */
const PartiesPage = () => {
    const [parties, setParties]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [selectedParty, setSelectedParty] = useState(null);
    const [search, setSearch]             = useState('');

    const fetchParties = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/parties');
            setParties(await response.json());
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchParties(); }, [fetchParties]);

    const handleOpenModal  = (party = null) => { setSelectedParty(party); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedParty(null); };

    const handleSave = async (partyData) => {
        try {
            const url    = selectedParty ? `/api/parties/${selectedParty.id}` : '/api/parties';
            const method = selectedParty ? 'PUT' : 'POST';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partyData) });
            fetchParties(); handleCloseModal();
        } catch (err) { console.error('Failed to save party:', err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try { await fetch(`/api/parties/${id}`, { method: 'DELETE' }); fetchParties(); }
            catch (err) { console.error('Failed to delete party:', err); }
        }
    };

    const filtered = parties.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) ||
        p.gstin?.toLowerCase().includes(search.toLowerCase())
    );

    const withGstin = parties.filter(p => p.gstin).length;

    return (
        <div className="pp-root">
            <style>{css}</style>

            {/* Top bar */}
            <div className="pp-topbar">
                <div className="pp-search-wrap">
                    <span className="pp-search-icon"><IcSearch /></span>
                    <input className="pp-search" placeholder="Search name, phone, GSTIN…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="pp-add-btn" onClick={() => handleOpenModal()}>
                    <IcPlus /> Add New Client
                </button>
            </div>

            {/* Summary pills */}
            {!loading && !error && (
                <div className="pp-pills">
                    <div className="pp-pill">
                        <span className="pp-pill-val">{parties.length}</span>
                        <span className="pp-pill-lbl">Total Clients</span>
                    </div>
                    <div className="pp-pill">
                        <span className="pp-pill-val">{withGstin}</span>
                        <span className="pp-pill-lbl">GST Registered</span>
                    </div>
                    <div className="pp-pill">
                        <span className="pp-pill-val">{parties.length - withGstin}</span>
                        <span className="pp-pill-lbl">Unregistered</span>
                    </div>
                </div>
            )}

            {/* Table panel */}
            <div className="pp-panel">
                {loading ? (
                    <table className="pp-table">
                        <thead>
                            <tr className="pp-thead-row">
                                {['Client', 'Phone', 'Address', 'GSTIN', ''].map(h => (
                                    <th key={h} className="pp-th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1,2,3,4,5].map(i => (
                                <tr key={i} className="pp-tr">
                                    <td className="pp-td" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="pp-skel" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
                                        <span className="pp-skel" style={{ width: 110, height: 12 }} />
                                    </td>
                                    {[80, 130, 90, 60].map((w, j) => (
                                        <td key={j} className="pp-td"><span className="pp-skel" style={{ width: w, height: 12 }} /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : error ? (
                    <div className="pp-empty"><div className="pp-empty-icon">⚠️</div><div style={{ color: '#ef4444' }}>{error}</div></div>
                ) : filtered.length === 0 ? (
                    <div className="pp-empty">
                        <div className="pp-empty-icon">👥</div>
                        <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>
                            {search ? 'No clients match your search' : 'No clients yet'}
                        </div>
                        <div style={{ fontSize: 13 }}>
                            {search ? 'Try a different search term' : 'Add your first client to get started'}
                        </div>
                    </div>
                ) : (
                    <>
                        <table className="pp-table">
                            <thead>
                                <tr className="pp-thead-row">
                                    <th className="pp-th" style={{ textAlign: 'left' }}>Client</th>
                                    <th className="pp-th" style={{ textAlign: 'left' }}>Phone</th>
                                    <th className="pp-th" style={{ textAlign: 'left' }}>Address</th>
                                    <th className="pp-th" style={{ textAlign: 'left' }}>GSTIN</th>
                                    <th className="pp-th" style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((party) => {
                                    const av = avatarColor(party.name);
                                    return (
                                        <tr key={party.id} className="pp-tr">
                                            {/* Name + avatar */}
                                            <td className="pp-td">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="pp-avatar" style={{ background: av.bg, color: av.color }}>
                                                        {initials(party.name)}
                                                    </div>
                                                    <div>
                                                        <div className="pp-name">{party.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Phone */}
                                            <td className="pp-td">
                                                {party.phone
                                                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 13 }}>
                                                        <IcPhone /> {party.phone}
                                                      </div>
                                                    : <span style={{ color: '#c4cfc8' }}>—</span>
                                                }
                                            </td>
                                            {/* Address */}
                                            <td className="pp-td" style={{ color: '#6b7f74', fontSize: 12, maxWidth: 200 }}>
                                                {party.address
                                                    ? <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{party.address}</div>
                                                    : <span style={{ color: '#c4cfc8' }}>—</span>
                                                }
                                            </td>
                                            {/* GSTIN */}
                                            <td className="pp-td">
                                                {party.gstin
                                                    ? <span className="pp-gstin-badge">{party.gstin}</span>
                                                    : <span style={{ color: '#c4cfc8', fontSize: 12 }}>—</span>
                                                }
                                            </td>
                                            {/* Actions */}
                                            <td className="pp-td" style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button className="pp-action-btn pp-edit-btn" onClick={() => handleOpenModal(party)} title="Edit">
                                                        <IcEdit />
                                                    </button>
                                                    <button className="pp-action-btn pp-del-btn" onClick={() => handleDelete(party.id)} title="Delete">
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
                        <div className="pp-footer">
                            <span>{filtered.length} of {parties.length} client{parties.length !== 1 ? 's' : ''}</span>
                            <span>{withGstin} GST registered</span>
                        </div>
                    </>
                )}
            </div>

            <PartyModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={selectedParty} />
        </div>
    );
};

export default PartiesPage;