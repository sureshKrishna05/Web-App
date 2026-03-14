import React, { useState, useEffect, useCallback } from 'react';
import AddEmployeeModal from '../components/AddEmployeeModal.jsx';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .me-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 18px; }

  /* ── Top bar ── */
  .me-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .me-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
  .me-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9caea6; pointer-events: none; }
  .me-search {
    width: 100%; height: 38px; padding: 0 12px 0 34px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 11px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    color: #0f1f17; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .me-search:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .me-search::placeholder { color: #9caea6; }

  .me-add-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 38px; padding: 0 18px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff; border: none; border-radius: 11px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(13,110,77,0.28);
    transition: all 0.18s ease;
  }
  .me-add-btn:hover { box-shadow: 0 5px 20px rgba(13,110,77,0.38); transform: translateY(-1px); }

  /* ── Summary pills ── */
  .me-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .me-pill {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 12px;
    padding: 10px 16px; flex: 1; min-width: 130px;
    animation: me-in 0.4s ease both;
  }
  .me-pill:nth-child(1){animation-delay:.05s} .me-pill:nth-child(2){animation-delay:.10s} .me-pill:nth-child(3){animation-delay:.15s} .me-pill:nth-child(4){animation-delay:.20s}
  @keyframes me-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .me-pill-icon { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .me-pill-val  { font-size: 17px; font-weight: 700; color: #0f1f17; font-family: 'DM Mono', monospace; line-height: 1; }
  .me-pill-lbl  { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }

  /* ── Glass panel ── */
  .me-panel {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(13,110,77,0.07);
    animation: me-in 0.45s ease 0.15s both;
  }

  /* ── Table ── */
  .me-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .me-thead-row { border-bottom: 1px solid rgba(16,185,129,0.12); }
  .me-th {
    padding: 12px 18px; font-size: 10px; font-weight: 700;
    letter-spacing: 0.9px; text-transform: uppercase; color: #6b7f74;
    background: rgba(16,185,129,0.04); white-space: nowrap;
  }
  .me-tr { border-bottom: 1px solid rgba(16,185,129,0.07); transition: background 0.13s; }
  .me-tr:last-child { border-bottom: none; }
  .me-tr:hover { background: rgba(16,185,129,0.04); }
  .me-td { padding: 13px 18px; color: #374151; vertical-align: middle; }

  /* Avatar */
  .me-avatar {
    width: 36px; height: 36px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .me-name { font-weight: 600; color: #0f1f17; font-size: 13px; }
  .me-id   { font-size: 11px; color: #6b7f74; font-family: 'DM Mono', monospace; margin-top: 1px; }

  /* Type badge */
  .me-type-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; white-space: nowrap;
  }
  .me-type-rep     { background: rgba(16,185,129,0.10); color: #065f46; }
  .me-type-manager { background: rgba(99,102,241,0.10); color: #3730a3; }
  .me-type-default { background: rgba(107,127,116,0.10); color: #374151; }

  /* Tenure chip */
  .me-tenure {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; color: #6b7f74; font-weight: 500;
  }

  /* Contact */
  .me-contact { display: flex; align-items: center; gap: 5px; color: #374151; font-size: 13px; }

  /* Delete btn */
  .me-del-btn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    background: rgba(239,68,68,0.07); color: #ef4444;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .me-del-btn:hover { background: rgba(239,68,68,0.15); transform: scale(1.05); }

  /* Skeleton */
  .me-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; display: inline-block;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Empty */
  .me-empty { padding: 60px 0; text-align: center; color: #6b7f74; }
  .me-empty-icon { font-size: 36px; margin-bottom: 12px; }

  /* Footer */
  .me-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; border-top: 1px solid rgba(16,185,129,0.09);
    background: rgba(16,185,129,0.025); font-size: 12px; color: #6b7f74;
  }

  /* Joining date */
  .me-date { font-family: 'DM Mono', monospace; font-size: 12px; color: #6b7f74; }
`;

/* Icons */
const IcPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPhone  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IcUsers  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcBadge  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcClock  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

/* Avatar colors */
const AVATARS = [
  { bg: 'rgba(13,110,77,0.12)',  color: '#0D6E4D' },
  { bg: 'rgba(14,116,144,0.12)', color: '#0E7490' },
  { bg: 'rgba(99,102,241,0.12)', color: '#4338CA' },
  { bg: 'rgba(245,158,11,0.12)', color: '#B45309' },
  { bg: 'rgba(236,72,153,0.12)', color: '#9D174D' },
  { bg: 'rgba(239,68,68,0.10)',  color: '#B91C1C' },
];
const avatarColor = (name) => AVATARS[(name?.charCodeAt(0) || 0) % AVATARS.length];
const initials    = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

/* Employee type badge */
const TypeBadge = ({ type }) => {
    const t = (type || '').toLowerCase();
    let cls = 'me-type-default', label = type || 'Staff';
    if (t.includes('rep') || t.includes('sales'))    { cls = 'me-type-rep';     label = 'Sales Rep'; }
    if (t.includes('manager') || t.includes('mgr'))  { cls = 'me-type-manager'; label = 'Manager'; }
    return <span className={`me-type-badge ${cls}`}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />{label}</span>;
};

/* Tenure calculator */
const tenure = (dateStr) => {
    if (!dateStr) return null;
    const joined = new Date(dateStr);
    const now    = new Date();
    const months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
    if (months < 1)  return 'Just joined';
    if (months < 12) return `${months}m tenure`;
    const yrs = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${yrs}y ${rem}m` : `${yrs}y tenure`;
};

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Main Page ── */
const ManageEmployeesPage = () => {
    const [reps, setReps]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch]           = useState('');

    const fetchSalesReps = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sales-reps');
            setReps(await response.json());
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSalesReps(); }, [fetchSalesReps]);

    const handleSaveEmployee = async (employeeData) => {
        try {
            await fetch('/api/sales-reps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeData) });
            fetchSalesReps(); setIsModalOpen(false);
        } catch (err) { console.error('Failed to save employee:', err); setError(err.message); }
    };

    const handleDeleteRep = async (id) => {
        if (window.confirm(`Are you sure you want to delete employee ID ${id}?`)) {
            try { await fetch(`/api/sales-reps/${id}`, { method: 'DELETE' }); fetchSalesReps(); }
            catch (err) { setError(err.message); }
        }
    };

    const filtered = reps.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.contact_number?.includes(search) ||
        r.employee_type?.toLowerCase().includes(search.toLowerCase())
    );

    /* Summary stats */
    const typeCount = reps.reduce((acc, r) => {
        const t = (r.employee_type || 'Other');
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const topType   = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const newThisMonth = reps.filter(r => {
        if (!r.date_of_joining) return false;
        const d = new Date(r.date_of_joining);
        const n = new Date();
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;

    return (
        <div className="me-root">
            <style>{css}</style>

            {/* Top bar */}
            <div className="me-topbar">
                <div className="me-search-wrap">
                    <span className="me-search-icon"><IcSearch /></span>
                    <input className="me-search" placeholder="Search name, contact, type…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="me-add-btn" onClick={() => setIsModalOpen(true)}>
                    <IcPlus /> Add New Employee
                </button>
            </div>

            {/* Summary pills */}
            {!loading && !error && (
                <div className="me-pills">
                    <div className="me-pill">
                        <div className="me-pill-icon" style={{ background: 'rgba(13,110,77,0.10)', color: '#0D6E4D' }}><IcUsers /></div>
                        <div>
                            <div className="me-pill-val">{reps.length}</div>
                            <div className="me-pill-lbl">Total Staff</div>
                        </div>
                    </div>
                    <div className="me-pill">
                        <div className="me-pill-icon" style={{ background: 'rgba(99,102,241,0.10)', color: '#4338CA' }}><IcBadge /></div>
                        <div>
                            <div className="me-pill-val">{Object.keys(typeCount).length}</div>
                            <div className="me-pill-lbl">Roles</div>
                        </div>
                    </div>
                    <div className="me-pill">
                        <div className="me-pill-icon" style={{ background: 'rgba(16,185,129,0.10)', color: '#065f46' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                        </div>
                        <div>
                            <div className="me-pill-val" style={{ fontSize: 13, paddingTop: 2 }}>{topType}</div>
                            <div className="me-pill-lbl">Top Role</div>
                        </div>
                    </div>
                    <div className="me-pill">
                        <div className="me-pill-icon" style={{ background: 'rgba(245,158,11,0.10)', color: '#B45309' }}><IcClock /></div>
                        <div>
                            <div className="me-pill-val">{newThisMonth}</div>
                            <div className="me-pill-lbl">Joined This Month</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table panel */}
            <div className="me-panel">
                {loading ? (
                    <table className="me-table">
                        <thead>
                            <tr className="me-thead-row">
                                {['Employee', 'Contact', 'Type', 'Joined', ''].map(h => (
                                    <th key={h} className="me-th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1,2,3,4,5].map(i => (
                                <tr key={i} className="me-tr">
                                    <td className="me-td">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="me-skel" style={{ width: 36, height: 36, borderRadius: 11, display: 'block', flexShrink: 0 }} />
                                            <div>
                                                <span className="me-skel" style={{ width: 110, height: 12, display: 'block', marginBottom: 6 }} />
                                                <span className="me-skel" style={{ width: 60, height: 10, display: 'block' }} />
                                            </div>
                                        </div>
                                    </td>
                                    {[90, 80, 80, 40].map((w, j) => (
                                        <td key={j} className="me-td"><span className="me-skel" style={{ width: w, height: 12 }} /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : error ? (
                    <div className="me-empty"><div className="me-empty-icon">⚠️</div><div style={{ color: '#ef4444' }}>{error}</div></div>
                ) : filtered.length === 0 ? (
                    <div className="me-empty">
                        <div className="me-empty-icon">👥</div>
                        <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>
                            {search ? 'No employees match your search' : 'No employees yet'}
                        </div>
                        <div style={{ fontSize: 13 }}>
                            {search ? 'Try a different search term' : 'Add your first employee to get started'}
                        </div>
                    </div>
                ) : (
                    <>
                        <table className="me-table">
                            <thead>
                                <tr className="me-thead-row">
                                    <th className="me-th" style={{ textAlign: 'left' }}>Employee</th>
                                    <th className="me-th" style={{ textAlign: 'left' }}>Contact</th>
                                    <th className="me-th" style={{ textAlign: 'left' }}>Type</th>
                                    <th className="me-th" style={{ textAlign: 'left' }}>Joined</th>
                                    <th className="me-th" style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((rep, idx) => {
                                    const av  = avatarColor(rep.name);
                                    const ten = tenure(rep.date_of_joining);
                                    return (
                                        <tr key={rep.id} className="me-tr">
                                            {/* Name + avatar */}
                                            <td className="me-td">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="me-avatar" style={{ background: av.bg, color: av.color }}>
                                                        {initials(rep.name)}
                                                    </div>
                                                    <div>
                                                        <div className="me-name">{rep.name}</div>
                                                        <div className="me-id">#{String(rep.id).padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Contact */}
                                            <td className="me-td">
                                                {rep.contact_number
                                                    ? <div className="me-contact"><IcPhone /> {rep.contact_number}</div>
                                                    : <span style={{ color: '#c4cfc8' }}>—</span>
                                                }
                                            </td>
                                            {/* Type */}
                                            <td className="me-td">
                                                <TypeBadge type={rep.employee_type} />
                                            </td>
                                            {/* Joined */}
                                            <td className="me-td">
                                                <div className="me-date">{fmtDate(rep.date_of_joining)}</div>
                                                {ten && (
                                                    <div className="me-tenure" style={{ marginTop: 2 }}>
                                                        <IcClock /> {ten}
                                                    </div>
                                                )}
                                            </td>
                                            {/* Delete */}
                                            <td className="me-td" style={{ textAlign: 'right' }}>
                                                <button className="me-del-btn" onClick={() => handleDeleteRep(rep.id)} title="Delete employee">
                                                    <IcTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="me-footer">
                            <span>{filtered.length} of {reps.length} employee{reps.length !== 1 ? 's' : ''}</span>
                            <span style={{ display: 'flex', gap: 12 }}>
                                {Object.entries(typeCount).map(([type, count]) => (
                                    <span key={type}>{count} {type}</span>
                                ))}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEmployee} />
        </div>
    );
};

export default ManageEmployeesPage;