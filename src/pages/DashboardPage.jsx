import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ── Inline styles (no Tailwind dependency for premium effects) ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

  .db-root { font-family: 'DM Sans', sans-serif; }

  /* ── Stat card ── */
  .stat-card {
    position: relative; overflow: hidden;
    border-radius: 16px;
    padding: 16px 18px;
    cursor: pointer; border: none; text-align: left; width: 100%;
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    animation: card-in 0.5s ease both;
  }
  .stat-card:hover { transform: translateY(-4px) scale(1.01); }
  .stat-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%);
    border-radius: inherit;
    pointer-events: none;
  }
  .stat-card::after {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 130px; height: 130px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }

  /* card stagger */
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.12s; }
  .stat-card:nth-child(3) { animation-delay: 0.19s; }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Spark line canvas ── */
  .spark-wrap {
    position: absolute; bottom: 0; right: 0;
    width: 90px; height: 44px; opacity: 0.35;
    pointer-events: none;
  }

  /* ── Stat number count-up ── */
  .stat-num {
    font-size: 30px; font-weight: 600; color: #fff;
    line-height: 1; letter-spacing: -1px;
    font-variant-numeric: tabular-nums;
  }
  .stat-label {
    font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.7);
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 6px;
  }
  .stat-icon {
    width: 30px; height: 30px; border-radius: 9px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px; backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
  }
  .stat-delta {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 600;
    background: rgba(255,255,255,0.18); border-radius: 20px;
    padding: 3px 8px; color: #fff; margin-top: 6px;
  }

  /* ── Glass panel ── */
  .glass-panel {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.14);
    border-radius: 20px;
    animation: card-in 0.5s ease 0.3s both;
    overflow: hidden;
  }

  /* ── Table rows ── */
  .db-tr {
    transition: background 0.15s;
  }
  .db-tr:hover { background: rgba(16,185,129,0.05); }

  /* ── Stock badge ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 9px;
    border-radius: 20px; white-space: nowrap;
  }
  .badge-ok   { background: rgba(16,185,129,0.12); color: #0a7a4a; }
  .badge-warn { background: rgba(245,158,11,0.12); color: #b45309; }
  .badge-low  { background: rgba(239,68,68,0.10);  color: #b91c1c; }

  /* ── Section header ── */
  .section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 0;
  }
  .section-title {
    font-size: 14px; font-weight: 600; color: #0f1f17;
    display: flex; align-items: center; gap: 8px;
    letter-spacing: -0.2px;
  }
  .section-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.18);
    animation: dot-pulse 2.4s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
    50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0.08); }
  }
  .view-all-btn {
    font-size: 12px; font-weight: 500; color: #10b981;
    background: rgba(16,185,129,0.08); border: none;
    border-radius: 8px; padding: 5px 12px; cursor: pointer;
    transition: background 0.15s;
  }
  .view-all-btn:hover { background: rgba(16,185,129,0.16); }

  /* ── Quick action tiles ── */
  .qa-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
    padding: 12px 16px 16px;
  }
  .qa-tile {
    border-radius: 12px; padding: 12px 10px;
    cursor: pointer; border: 1px solid rgba(16,185,129,0.12);
    background: rgba(255,255,255,0.6); text-align: left;
    transition: all 0.18s ease;
    display: flex; flex-direction: row; align-items: center; gap: 10px;
  }
  .qa-tile:hover {
    background: rgba(255,255,255,0.9);
    border-color: rgba(16,185,129,0.35);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16,185,129,0.10);
  }
  .qa-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .qa-label { font-size: 12px; font-weight: 600; color: #0f1f17; line-height: 1.3; }
  .qa-sub   { font-size: 11px; color: #6b7f74; font-weight: 400; }

  /* ── Loading skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, rgba(16,185,129,0.08) 25%, rgba(16,185,129,0.15) 50%, rgba(16,185,129,0.08) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* ── Bottom two-col layout ── */
  .bottom-grid {
    display: grid; grid-template-columns: 1fr 340px; gap: 20px;
  }
  @media (max-width: 1100px) { .bottom-grid { grid-template-columns: 1fr; } }

  /* ── Alert panel ── */
  .alert-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 24px; border-bottom: 1px solid rgba(16,185,129,0.07);
    transition: background 0.15s;
    cursor: default;
  }
  .alert-item:last-child { border-bottom: none; }
  .alert-item:hover { background: rgba(245,158,11,0.04); }
  .alert-dot-warn { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; }
  .alert-dot-ok   { width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
`;

/* ── SVG Icons ── */
const IcPill    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5L3.5 13.5a5 5 0 017-7l7 7a5 5 0 01-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
const IcWarn    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcReceipt = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcTrend   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcBox     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IcPeople  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcBarChart= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcHistory = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;

/* ── Sparkline canvas renderer ── */
const Spark = ({ data, color }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !data?.length) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * w,
      h - ((v - min) / range) * (h - 8) - 4
    ]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1][0] + pts[i][0]) / 2;
      ctx.bezierCurveTo(cx, pts[i - 1][1], cx, pts[i][1], pts[i][0], pts[i][1]);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // fill under
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = color.replace('1)', '0.25)');
    ctx.fill();
  }, [data, color]);
  return <canvas ref={ref} width={110} height={56} className="spark-wrap" />;
};

/* ── Animated counter ── */
const Counter = ({ target, duration = 900 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(ease * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val}</>;
};

/* ── Skeleton row ── */
const SkRow = () => (
  <tr>
    {[120, 80, 60, 70].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div className="skeleton" style={{ height: 12, width: w }} />
      </td>
    ))}
  </tr>
);

/* ── Stock badge ── */
const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="badge badge-low">● Out</span>;
  if (stock < 20)  return <span className="badge badge-warn">▲ Low</span>;
  return               <span className="badge badge-ok">✓ OK</span>;
};

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
const DashboardPage = ({ setActivePage }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard-stats');
      if (!res.ok) throw new Error('Network error');
      setStats(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Decorative spark data (visual only)
  const sparks = {
    medicines: [12, 18, 15, 22, 19, 28, 24, 31, 27, 35],
    low:       [8,  5,  9, 12,  7,  6, 10,  8,  11, 9],
    invoices:  [5, 10, 8, 14, 12, 18, 15, 21, 19, 25],
  };

  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const STAT_CARDS = [
    {
      label: 'Total Medicines',
      key: 'totalMedicines',
      spark: sparks.medicines,
      bg: 'linear-gradient(135deg, #0D6E4D 0%, #10B981 100%)',
      shadow: 'rgba(13,110,77,0.35)',
      icon: <IcPill />,
      delta: '+4 this week',
      onClick: () => setActivePage('Items'),
    },
    {
      label: 'Low Stock Alert',
      key: 'lowStockItems',
      spark: sparks.low,
      bg: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
      shadow: 'rgba(180,83,9,0.35)',
      icon: <IcWarn />,
      delta: 'Needs attention',
      onClick: () => setActivePage('Items'),
    },
    {
      label: 'Total Invoices',
      key: 'totalInvoices',
      spark: sparks.invoices,
      bg: 'linear-gradient(135deg, #0E7490 0%, #22D3EE 100%)',
      shadow: 'rgba(14,116,144,0.35)',
      icon: <IcReceipt />,
      delta: '+12 this month',
      onClick: () => setActivePage('Sales History'),
    },
  ];

  const QUICK = [
    { label: 'New Invoice',    sub: 'Billing', icon: <IcPlus />,    bg: 'rgba(16,185,129,0.12)', color: '#0D6E4D', page: 'New Invoice' },
    { label: 'Add Medicine',   sub: 'Inventory', icon: <IcBox />,   bg: 'rgba(99,102,241,0.10)', color: '#4338CA', page: 'Items' },
    { label: 'View Clients',   sub: 'CRM',       icon: <IcPeople />, bg: 'rgba(245,158,11,0.10)', color: '#B45309', page: 'Clients' },
    { label: 'Sales Report',   sub: 'Analytics', icon: <IcBarChart />, bg: 'rgba(14,116,144,0.10)', color: '#0E7490', page: 'Reports' },
  ];

  return (
    <div className="db-root" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{css}</style>

      {/* ── Welcome strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2px',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#0f1f17', letterSpacing: '-0.5px' }}>
            Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </div>
          <div style={{ fontSize: 13, color: '#6b7f74', marginTop: 3 }}>{fmtDate(time)}</div>
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 22, fontWeight: 500,
          color: '#0D6E4D', letterSpacing: 1,
          background: 'rgba(16,185,129,0.08)',
          padding: '8px 18px', borderRadius: 12,
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          {fmt(time)}
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {STAT_CARDS.map((c) => (
          <button
            key={c.key}
            className="stat-card"
            onClick={c.onClick}
            style={{ background: c.bg, boxShadow: `0 8px 32px ${c.shadow}` }}
          >
            <Spark data={c.spark} color="rgba(255,255,255,1)" />
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-label">{c.label}</div>
            {loading
              ? <div className="skeleton" style={{ height: 40, width: 80, background: 'rgba(255,255,255,0.2)' }} />
              : <div className="stat-num">
                  <Counter target={stats?.[c.key] ?? 0} />
                </div>
            }
            <div className="stat-delta"><IcTrend /> {c.delta}</div>
          </button>
        ))}
      </div>

      {/* ── Bottom two-col layout ── */}
      <div className="bottom-grid">

        {/* ── Recent medicines table ── */}
        <div className="glass-panel">
          <div className="section-hdr">
            <div className="section-title">
              <span className="section-dot" />
              Recently Added Medicines
            </div>
            <button className="view-all-btn" onClick={() => setActivePage('Items')}>
              View all →
            </button>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                  {['Medicine Name', 'Price (₹)', 'Stock', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.7px',
                      textTransform: 'uppercase', color: '#6b7f74',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => <SkRow key={i} />)
                  : error
                    ? <tr><td colSpan="4" style={{ padding: 32, textAlign: 'center', color: '#ef4444', fontSize: 13 }}>Failed to load: {error}</td></tr>
                    : stats?.recentMedicines?.length > 0
                      ? stats.recentMedicines.map((item, idx) => (
                          <tr key={item.id} className="db-tr" style={{
                            borderBottom: idx < stats.recentMedicines.length - 1 ? '1px solid rgba(16,185,129,0.07)' : 'none',
                          }}>
                            <td style={{ padding: '14px 24px' }}>
                              <div style={{ fontWeight: 500, color: '#0f1f17' }}>{item.name}</div>
                            </td>
                            <td style={{ padding: '14px 24px' }}>
                              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#0D6E4D', fontWeight: 500 }}>
                                ₹{Number(item.price).toFixed(2)}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', color: '#6b7f74' }}>
                              {item.stock}
                            </td>
                            <td style={{ padding: '14px 24px' }}>
                              <StockBadge stock={item.stock} />
                            </td>
                          </tr>
                        ))
                      : <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#6b7f74' }}>No recent medicines found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Quick actions */}
          <div className="glass-panel">
            <div className="section-hdr">
              <div className="section-title">
                <span className="section-dot" style={{ background: '#6366F1', boxShadow: '0 0 0 3px rgba(99,102,241,0.18)' }} />
                Quick Actions
              </div>
            </div>
            <div className="qa-grid">
              {QUICK.map(q => (
                <button key={q.label} className="qa-tile" onClick={() => setActivePage(q.page)}>
                  <div className="qa-icon" style={{ background: q.bg, color: q.color }}>{q.icon}</div>
                  <div>
                    <div className="qa-label">{q.label}</div>
                    <div className="qa-sub">{q.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="glass-panel" style={{ paddingBottom: 8 }}>
            <div className="section-hdr" style={{ paddingBottom: 12 }}>
              <div className="section-title">
                <span className="section-dot" />
                System Status
              </div>
            </div>
            {[
              { label: 'Inventory Sync',  status: 'Live',    ok: true },
              { label: 'Billing Engine',  status: 'Running', ok: true },
              { label: 'Low Stock Alert', status: loading ? '...' : `${stats?.lowStockItems ?? 0} items`, ok: (stats?.lowStockItems ?? 0) === 0 },
              { label: 'Sales History',   status: 'Synced',  ok: true },
            ].map(s => (
              <div key={s.label} className="alert-item">
                <span className={s.ok ? 'alert-dot-ok' : 'alert-dot-warn'} />
                <div style={{ flex: 1, fontSize: 13, color: '#0f1f17', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: s.ok ? '#0a7a4a' : '#b45309', fontWeight: 600 }}>{s.status}</div>
              </div>
            ))}
          </div>

          {/* History shortcut */}
          <button
            className="glass-panel"
            onClick={() => setActivePage('Sales History')}
            style={{
              border: 'none', cursor: 'pointer', padding: '18px 24px',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(13,110,77,0.06) 0%, rgba(16,185,129,0.10) 100%)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #0D6E4D, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
            }}>
              <IcHistory />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1f17' }}>View Sales History</div>
              <div style={{ fontSize: 12, color: '#6b7f74', marginTop: 2 }}>Browse all past invoices</div>
            </div>
            <div style={{ marginLeft: 'auto', color: '#10b981', fontSize: 18 }}>→</div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;