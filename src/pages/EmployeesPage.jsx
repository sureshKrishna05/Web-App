import React, { useState, useEffect, useCallback } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .ep-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 20px; }

  /* ── Top bar ── */
  .ep-topbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
  }
  .ep-month-wrap {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 11px;
    padding: 0 14px; height: 38px;
  }
  .ep-month-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; white-space: nowrap;
  }
  .ep-month-input {
    border: none; background: transparent; outline: none;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    height: 100%; cursor: pointer;
  }

  /* ── Summary pills ── */
  .ep-pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .ep-pill {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 12px;
    padding: 10px 16px; flex: 1; min-width: 140px;
    animation: ep-in 0.4s ease both;
  }
  .ep-pill:nth-child(1){animation-delay:.05s} .ep-pill:nth-child(2){animation-delay:.10s} .ep-pill:nth-child(3){animation-delay:.15s}
  @keyframes ep-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .ep-pill-icon { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ep-pill-val  { font-size: 17px; font-weight: 700; color: #0f1f17; font-family: 'DM Mono', monospace; line-height: 1; }
  .ep-pill-lbl  { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }

  /* ── Cards grid ── */
  .ep-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
  }

  /* ── Rep card ── */
  .ep-card {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    display: flex; flex-direction: column;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
    animation: ep-in 0.4s ease both;
  }
  .ep-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(13,110,77,0.10); }

  /* Card header */
  .ep-card-header {
    padding: 18px 18px 14px;
    display: flex; align-items: center; gap: 14px;
    border-bottom: 1px solid rgba(16,185,129,0.08);
  }
  .ep-avatar {
    width: 42px; height: 42px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; flex-shrink: 0;
  }
  .ep-rep-name  { font-size: 15px; font-weight: 600; color: #0f1f17; }
  .ep-rep-role  { font-size: 11px; color: #6b7f74; margin-top: 2px; font-weight: 500; }

  /* Ring section */
  .ep-ring-section {
    display: flex; align-items: center; gap: 18px;
    padding: 18px 20px 14px;
  }
  .ep-ring-wrap { position: relative; flex-shrink: 0; }
  .ep-ring-pct {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
  }
  .ep-ring-num  { font-size: 16px; font-weight: 700; color: #0f1f17; font-family: 'DM Mono', monospace; line-height: 1; }
  .ep-ring-sub  { font-size: 9px; color: #6b7f74; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Stats rows */
  .ep-stats { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .ep-stat-row { display: flex; justify-content: space-between; align-items: center; }
  .ep-stat-key { font-size: 11px; color: #6b7f74; font-weight: 500; }
  .ep-stat-val { font-size: 13px; font-weight: 600; color: #0f1f17; font-family: 'DM Mono', monospace; }

  /* Progress bar */
  .ep-bar-wrap { width: 100%; height: 5px; background: rgba(16,185,129,0.1); border-radius: 5px; overflow: hidden; margin-top: 4px; }
  .ep-bar      { height: 100%; border-radius: 5px; transition: width 0.8s cubic-bezier(.22,1,.36,1); }

  /* Card footer */
  .ep-card-footer {
    padding: 12px 18px;
    border-top: 1px solid rgba(16,185,129,0.08);
    background: rgba(16,185,129,0.02);
  }
  .ep-target-btn {
    width: 100%; height: 34px; border-radius: 10px; border: none;
    background: rgba(16,185,129,0.10); color: #0D6E4D;
    font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .ep-target-btn:hover { background: rgba(16,185,129,0.20); }

  /* Skeleton */
  .ep-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Empty */
  .ep-empty { grid-column: 1/-1; padding: 60px 0; text-align: center; color: #6b7f74; }
  .ep-empty-icon { font-size: 38px; margin-bottom: 12px; }

  /* ── Modal ── */
  .ep-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: fade-in 0.18s ease;
  }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  .ep-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 22px;
    width: 100%; max-width: 380px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden;
    animation: modal-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes modal-in { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .ep-modal-header {
    padding: 22px 24px 18px; border-bottom: 1px solid rgba(16,185,129,0.1);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
  }
  .ep-modal-title { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .ep-modal-sub   { font-size: 12px; color: #6b7f74; margin-top: 3px; }
  .ep-modal-body  { padding: 22px 24px; }
  .ep-modal-label { font-size: 11px; font-weight: 700; color: #6b7f74; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; }
  .ep-modal-prefix-wrap {
    display: flex; align-items: center;
    border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; overflow: hidden;
    transition: box-shadow 0.15s;
  }
  .ep-modal-prefix-wrap:focus-within { box-shadow: 0 0 0 3px rgba(16,185,129,0.12); border-color: #10b981; }
  .ep-modal-prefix {
    padding: 10px 12px; background: rgba(16,185,129,0.06);
    font-size: 13px; font-weight: 600; color: #0D6E4D;
    border-right: 1px solid rgba(16,185,129,0.15);
  }
  .ep-modal-input {
    flex: 1; padding: 10px 12px; border: none; outline: none;
    font-size: 15px; font-family: 'DM Mono', monospace; color: #0f1f17;
    background: transparent; font-weight: 500;
  }
  .ep-modal-footer {
    padding: 16px 24px; border-top: 1px solid rgba(16,185,129,0.1);
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .ep-cancel-btn {
    height: 36px; padding: 0 16px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .ep-cancel-btn:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .ep-save-btn {
    height: 36px; padding: 0 20px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.25); transition: all 0.18s;
  }
  .ep-save-btn:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.38); transform: translateY(-1px); }
`;

/* Icons */
const IcTarget  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcTrophy  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;
const IcUsers   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcCal     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcEdit    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

/* Avatar colors */
const AVATARS = [
  { bg: 'rgba(13,110,77,0.12)',  color: '#0D6E4D' },
  { bg: 'rgba(14,116,144,0.12)', color: '#0E7490' },
  { bg: 'rgba(99,102,241,0.12)', color: '#4338CA' },
  { bg: 'rgba(245,158,11,0.12)', color: '#B45309' },
  { bg: 'rgba(236,72,153,0.12)', color: '#9D174D' },
];
const avatarColor = (name) => AVATARS[(name?.charCodeAt(0) || 0) % AVATARS.length];
const initials    = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

/* ── Progress ring SVG ── */
const Ring = ({ pct, color, size = 80 }) => {
    const r   = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const fill = Math.min(pct, 100) / 100;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="6" />
            <circle
                cx={size/2} cy={size/2} r={r} fill="none"
                stroke={color} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - fill)}
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1)' }}
            />
        </svg>
    );
};

/* ── Target Modal ── */
const TargetModal = ({ isOpen, onClose, onSave, repName, currentTarget }) => {
    const [target, setTarget] = useState(currentTarget || '');
    useEffect(() => { setTarget(currentTarget || ''); }, [currentTarget, isOpen]);
    if (!isOpen) return null;
    return (
        <div className="ep-overlay" onClick={onClose}>
            <div className="ep-modal" onClick={e => e.stopPropagation()}>
                <div className="ep-modal-header">
                    <div className="ep-modal-title">Set Monthly Target</div>
                    <div className="ep-modal-sub">for {repName}</div>
                </div>
                <div className="ep-modal-body">
                    <div className="ep-modal-label">Target Amount (₹)</div>
                    <div className="ep-modal-prefix-wrap">
                        <div className="ep-modal-prefix">₹</div>
                        <input
                            type="number"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            placeholder="0.00"
                            className="ep-modal-input"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="ep-modal-footer">
                    <button className="ep-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="ep-save-btn" onClick={() => onSave(target)}>Save Target</button>
                </div>
            </div>
        </div>
    );
};

/* ── Skeleton card ── */
const SkelCard = () => (
    <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.1)' }}>
        <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
            <div className="ep-skel" style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div className="ep-skel" style={{ height: 13, width: 110, marginBottom: 8 }} />
                <div className="ep-skel" style={{ height: 10, width: 70 }} />
            </div>
        </div>
        <div style={{ padding: '18px 20px 14px', display: 'flex', gap: 18, alignItems: 'center' }}>
            <div className="ep-skel" style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div className="ep-skel" style={{ height: 10, width: '100%', marginBottom: 10 }} />
                <div className="ep-skel" style={{ height: 10, width: '80%', marginBottom: 10 }} />
                <div className="ep-skel" style={{ height: 5, width: '100%', borderRadius: 5 }} />
            </div>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(16,185,129,0.08)' }}>
            <div className="ep-skel" style={{ height: 34, width: '100%', borderRadius: 10 }} />
        </div>
    </div>
);

/* ── Main Page ── */
const EmployeesPage = () => {
    const [reps, setReps]               = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [loading, setLoading]         = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRep, setSelectedRep] = useState(null);

    const fetchData = useCallback(async (month) => {
        try {
            setLoading(true);
            const repsResponse = await fetch('/api/sales-reps');
            const salesReps = await repsResponse.json();
            setReps(salesReps);
            const performance = {};
            for (const rep of salesReps) {
                performance[rep.id] = { target: 0, achieved: 0 };
            }
            setPerformanceData(performance);
        } catch (error) {
            console.error('Failed to fetch employee data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(selectedMonth); }, [selectedMonth, fetchData]);

    const handleMonthChange = (e) => { setSelectedMonth(e.target.value); };
    const handleOpenModal   = (rep) => { setSelectedRep(rep); setIsModalOpen(true); };
    const handleSaveTarget = async (targetAmount) => {
        if (!selectedRep || !targetAmount) return;
        const parsed = parseFloat(targetAmount);
        if (isNaN(parsed) || parsed < 0) return;
        setPerformanceData(prev => ({
            ...prev,
            [selectedRep.id]: {
                ...prev[selectedRep.id],
                target: parsed,
            }
        }));
        setIsModalOpen(false);
        setSelectedRep(null);
    };

    const fmtMoney = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    /* Summary stats */
    const totalTarget   = Object.values(performanceData).reduce((s, p) => s + p.target, 0);
    const totalAchieved = Object.values(performanceData).reduce((s, p) => s + p.achieved, 0);
    const onTarget      = Object.values(performanceData).filter(p => p.target > 0 && (p.achieved / p.target) >= 0.8).length;

    /* Ring color by percentage */
    const ringColor = (pct) => {
        if (pct >= 100) return '#10b981';
        if (pct >= 70)  return '#3b82f6';
        if (pct >= 40)  return '#f59e0b';
        return '#ef4444';
    };

    const fmtMonth = (m) => {
        const [y, mo] = m.split('-');
        return new Date(y, mo - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="ep-root">
            <style>{css}</style>

            {/* ── Top bar ── */}
            <div className="ep-topbar">
                <div style={{ fontSize: 13, color: '#6b7f74', fontWeight: 500 }}>
                    Showing performance for <span style={{ color: '#0D6E4D', fontWeight: 600 }}>{fmtMonth(selectedMonth)}</span>
                </div>
                <div className="ep-month-wrap">
                    <span className="ep-month-label"><IcCal /> Month</span>
                    <input type="month" className="ep-month-input"
                        value={selectedMonth} onChange={handleMonthChange} />
                </div>
            </div>

            {/* ── Summary pills ── */}
            {!loading && (
                <div className="ep-pills">
                    <div className="ep-pill">
                        <div className="ep-pill-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#0D6E4D' }}><IcUsers /></div>
                        <div>
                            <div className="ep-pill-val">{reps.length}</div>
                            <div className="ep-pill-lbl">Sales Reps</div>
                        </div>
                    </div>
                    <div className="ep-pill">
                        <div className="ep-pill-icon" style={{ background: 'rgba(14,116,144,0.1)', color: '#0E7490' }}><IcTarget /></div>
                        <div>
                            <div className="ep-pill-val">₹{fmtMoney(totalTarget)}</div>
                            <div className="ep-pill-lbl">Total Target</div>
                        </div>
                    </div>
                    <div className="ep-pill">
                        <div className="ep-pill-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#B45309' }}><IcTrophy /></div>
                        <div>
                            <div className="ep-pill-val">{onTarget}</div>
                            <div className="ep-pill-lbl">On Track (≥80%)</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cards grid ── */}
            <div className="ep-grid">
                {loading
                    ? [1,2,3,4,5,6].map(i => <SkelCard key={i} />)
                    : reps.length === 0
                        ? <div className="ep-empty">
                            <div className="ep-empty-icon">👨‍💼</div>
                            <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>No sales reps found</div>
                            <div style={{ fontSize: 13 }}>Add employees from the Employee management page</div>
                          </div>
                        : reps.map((rep, idx) => {
                            const perf   = performanceData[rep.id] || { target: 0, achieved: 0 };
                            const pct    = perf.target > 0 ? (perf.achieved / perf.target) * 100 : 0;
                            const color  = ringColor(pct);
                            const av     = avatarColor(rep.name);

                            return (
                                <div key={rep.id} className="ep-card" style={{ animationDelay: `${idx * 0.05}s` }}>

                                    {/* Header */}
                                    <div className="ep-card-header">
                                        <div className="ep-avatar" style={{ background: av.bg, color: av.color }}>
                                            {initials(rep.name)}
                                        </div>
                                        <div>
                                            <div className="ep-rep-name">{rep.name}</div>
                                            <div className="ep-rep-role">Sales Representative</div>
                                        </div>
                                    </div>

                                    {/* Ring + stats */}
                                    <div className="ep-ring-section">
                                        <div className="ep-ring-wrap">
                                            <Ring pct={pct} color={color} size={84} />
                                            <div className="ep-ring-pct">
                                                <div className="ep-ring-num" style={{ color }}>{Math.round(pct)}%</div>
                                                <div className="ep-ring-sub">done</div>
                                            </div>
                                        </div>

                                        <div className="ep-stats">
                                            <div className="ep-stat-row">
                                                <span className="ep-stat-key">Target</span>
                                                <span className="ep-stat-val">₹{fmtMoney(perf.target)}</span>
                                            </div>
                                            <div className="ep-stat-row">
                                                <span className="ep-stat-key">Achieved</span>
                                                <span className="ep-stat-val" style={{ color: '#0D6E4D' }}>₹{fmtMoney(perf.achieved)}</span>
                                            </div>
                                            <div className="ep-stat-row">
                                                <span className="ep-stat-key">Remaining</span>
                                                <span className="ep-stat-val" style={{ color: '#6b7f74' }}>
                                                    ₹{fmtMoney(Math.max(perf.target - perf.achieved, 0))}
                                                </span>
                                            </div>
                                            <div className="ep-bar-wrap">
                                                <div className="ep-bar" style={{
                                                    width: `${Math.min(pct, 100)}%`,
                                                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="ep-card-footer">
                                        <button className="ep-target-btn" onClick={() => handleOpenModal(rep)}>
                                            <IcEdit /> Set Target
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                }
            </div>

            <TargetModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedRep(null); }}
                onSave={handleSaveTarget}
                repName={selectedRep?.name}
                currentTarget={performanceData[selectedRep?.id]?.target}
            />
        </div>
    );
};

export default EmployeesPage;