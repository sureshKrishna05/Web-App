import React, { useState, useEffect, useCallback } from 'react';
import ExportModal from '../components/ExportModal';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .sh-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 18px; }

  /* ── Summary chips strip ── */
  .sh-chips { display: flex; gap: 12px; flex-wrap: wrap; }
  .sh-chip {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(16,185,129,0.14);
    border-radius: 14px; padding: 12px 18px;
    flex: 1; min-width: 150px;
    animation: chip-in 0.4s ease both;
  }
  .sh-chip:nth-child(1) { animation-delay: 0.05s; }
  .sh-chip:nth-child(2) { animation-delay: 0.10s; }
  .sh-chip:nth-child(3) { animation-delay: 0.15s; }
  .sh-chip:nth-child(4) { animation-delay: 0.20s; }
  @keyframes chip-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sh-chip-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sh-chip-val  { font-size: 18px; font-weight: 600; color: #0f1f17; letter-spacing: -0.5px; font-family: 'DM Mono', monospace; }
  .sh-chip-lbl  { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }

  /* ── Filter bar ── */
  .sh-filter-bar {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 18px;
    padding: 16px 20px;
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    box-shadow: 0 2px 12px rgba(16,185,129,0.06);
    animation: chip-in 0.4s ease 0.1s both;
  }
  .sh-filter-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.8px;
    white-space: nowrap; margin-right: 4px;
  }
  .sh-select, .sh-input {
    height: 36px; padding: 0 12px;
    border: 1px solid rgba(16,185,129,0.18);
    border-radius: 10px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #0f1f17; background: rgba(255,255,255,0.9);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    flex: 1; min-width: 130px;
  }
  .sh-select:focus, .sh-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .sh-export-btn {
    height: 36px; padding: 0 16px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 2px 10px rgba(13,110,77,0.28);
    transition: all 0.18s ease; display: flex; align-items: center; gap: 6px;
  }
  .sh-export-btn:hover { box-shadow: 0 4px 18px rgba(13,110,77,0.38); transform: translateY(-1px); }

  /* ── Main table panel ── */
  .sh-panel {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(13,110,77,0.07);
    animation: chip-in 0.45s ease 0.2s both;
  }

  /* Table header */
  .sh-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .sh-thead-row { border-bottom: 1px solid rgba(16,185,129,0.12); }
  .sh-th {
    padding: 13px 18px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.9px;
    text-transform: uppercase; color: #6b7f74;
    background: rgba(16,185,129,0.04);
    white-space: nowrap;
  }
  .sh-th:first-child { border-radius: 0; }

  /* Table rows */
  .sh-tr {
    border-bottom: 1px solid rgba(16,185,129,0.07);
    transition: background 0.14s;
    cursor: default;
  }
  .sh-tr:last-child { border-bottom: none; }
  .sh-tr:hover { background: rgba(16,185,129,0.04); }
  .sh-td { padding: 13px 18px; color: #374151; vertical-align: middle; }

  /* Invoice number pill */
  .sh-inv-num {
    font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500;
    color: #0D6E4D; background: rgba(13,110,77,0.08);
    border-radius: 7px; padding: 3px 9px; white-space: nowrap;
    display: inline-block;
  }

  /* Status badges */
  .sh-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; white-space: nowrap;
  }
  .sh-badge-done   { background: rgba(16,185,129,0.12); color: #065f46; }
  .sh-badge-est    { background: rgba(245,158,11,0.12); color: #92400e; }

  /* Amount */
  .sh-amount {
    font-family: 'DM Mono', monospace; font-size: 13px;
    font-weight: 600; color: #0f1f17;
  }

  /* Download btn */
  .sh-dl-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600;
    padding: 5px 12px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(16,185,129,0.10); color: #0D6E4D;
    transition: all 0.15s;
  }
  .sh-dl-btn:hover { background: rgba(16,185,129,0.20); transform: translateY(-1px); }
  .sh-dl-btn.loading { opacity: 0.6; pointer-events: none; }

  /* Empty / error states */
  .sh-empty {
    padding: 64px 0; text-align: center;
    color: #6b7f74; font-size: 14px;
  }
  .sh-empty-icon { font-size: 36px; margin-bottom: 12px; }

  /* Skeleton */
  .sh-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite; border-radius: 6px; display: inline-block;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Totals footer */
  .sh-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid rgba(16,185,129,0.10);
    background: rgba(16,185,129,0.03);
    font-size: 12px; color: #6b7f74;
  }
  .sh-footer-total {
    font-family: 'DM Mono', monospace; font-size: 14px;
    font-weight: 600; color: #0D6E4D;
  }
`;

/* ── Icons ── */
const IcDownload = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcExport  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcFilter  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcDot     = ({ color }) => <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;

const SalesHistoryPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [reps, setReps] = useState([]);
    const [filters, setFilters] = useState({ clientId: '', repId: '', month: '', status: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [clientsRes, repsRes] = await Promise.all([fetch('/api/parties'), fetch('/api/sales-reps')]);
                setClients(await clientsRes.json());
                setReps(await repsRes.json());
            } catch (err) { setError(err.message); }
        };
        fetchFiltersData();
    }, []);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/invoices/filtered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            setInvoices(await response.json());
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
    const handleExport = (format) => { setIsExportModalOpen(false); console.log(`Exporting to ${format}...`); };

    const handleDownload = async (invoiceId) => {
        try {
            setDownloadingId(invoiceId);
            const response = await fetch('/api/download-invoice-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none'; a.href = url;
                const contentDisposition = response.headers.get('content-disposition');
                let filename = `invoice-${invoiceId}.pdf`;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
                }
                a.download = filename;
                document.body.appendChild(a); a.click();
                window.URL.revokeObjectURL(url); a.remove();
            } else {
                let errorMsg = 'Failed to download PDF';
                try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
        } catch (err) { console.error('Download error:', err); alert(`Download failed: ${err.message}`); }
        finally { setDownloadingId(null); }
    };

    /* Derived summary stats */
    const totalRevenue = invoices.reduce((s, i) => s + Number(i.final_amount || 0), 0);
    const completed    = invoices.filter(i => i.status === 'Completed').length;
    const estimates    = invoices.filter(i => i.status === 'Estimate').length;

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const fmtMoney = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="sh-root">
            <style>{css}</style>

            {/* ── Summary chips ── */}
            {!loading && !error && (
                <div className="sh-chips">
                    {[
                        { label: 'Total Invoices', val: invoices.length, icon: '🧾', bg: 'rgba(13,110,77,0.10)', color: '#0D6E4D' },
                        { label: 'Total Revenue',  val: `₹${fmtMoney(totalRevenue)}`, icon: '💰', bg: 'rgba(14,116,144,0.10)', color: '#0E7490' },
                        { label: 'Completed',      val: completed,  icon: '✅', bg: 'rgba(16,185,129,0.10)', color: '#065f46' },
                        { label: 'Estimates',      val: estimates,  icon: '📋', bg: 'rgba(245,158,11,0.10)',  color: '#b45309' },
                    ].map(c => (
                        <div key={c.label} className="sh-chip">
                            <div className="sh-chip-icon" style={{ background: c.bg, fontSize: 16 }}>{c.icon}</div>
                            <div>
                                <div className="sh-chip-val" style={{ color: c.color }}>{c.val}</div>
                                <div className="sh-chip-lbl">{c.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filter bar ── */}
            <div className="sh-filter-bar">
                <span className="sh-filter-label"><IcFilter /> Filters</span>

                <select name="clientId" value={filters.clientId} onChange={handleFilterChange} className="sh-select">
                    <option value="">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select name="repId" value={filters.repId} onChange={handleFilterChange} className="sh-select">
                    <option value="">All Reps</option>
                    {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                <input type="month" name="month" value={filters.month} onChange={handleFilterChange} className="sh-input" />

                <select name="status" value={filters.status} onChange={handleFilterChange} className="sh-select" style={{ maxWidth: 150 }}>
                    <option value="">All Statuses</option>
                    <option value="Estimate">Estimate</option>
                    <option value="Completed">Completed</option>
                </select>

                <button onClick={() => setIsExportModalOpen(true)} className="sh-export-btn">
                    <IcExport /> Export
                </button>
            </div>

            {/* ── Table panel ── */}
            <div className="sh-panel">
                {loading ? (
                    <table className="sh-table">
                        <thead>
                            <tr className="sh-thead-row">
                                {['Invoice #', 'Client', 'Rep', 'Date', 'Status', 'Amount', ''].map(h => (
                                    <th key={h} className="sh-th" style={{ textAlign: h === 'Amount' || h === '' ? 'right' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1,2,3,4,5,6].map(i => (
                                <tr key={i} className="sh-tr">
                                    {[90,120,90,80,70,70,60].map((w, j) => (
                                        <td key={j} className="sh-td"><span className="sh-skel" style={{ height: 12, width: w }} /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : error ? (
                    <div className="sh-empty">
                        <div className="sh-empty-icon">⚠️</div>
                        <div>Failed to load invoices: {error}</div>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="sh-empty">
                        <div className="sh-empty-icon">📭</div>
                        <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>No invoices found</div>
                        <div style={{ fontSize: 13 }}>Try adjusting your filters above</div>
                    </div>
                ) : (
                    <>
                        <table className="sh-table">
                            <thead>
                                <tr className="sh-thead-row">
                                    <th className="sh-th" style={{ textAlign: 'left' }}>Invoice #</th>
                                    <th className="sh-th" style={{ textAlign: 'left' }}>Client</th>
                                    <th className="sh-th" style={{ textAlign: 'left' }}>Rep</th>
                                    <th className="sh-th" style={{ textAlign: 'left' }}>Date</th>
                                    <th className="sh-th" style={{ textAlign: 'center' }}>Status</th>
                                    <th className="sh-th" style={{ textAlign: 'right' }}>Amount</th>
                                    <th className="sh-th" style={{ textAlign: 'right' }}>PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="sh-tr">
                                        <td className="sh-td">
                                            <span className="sh-inv-num">{invoice.invoice_number}</span>
                                        </td>
                                        <td className="sh-td">
                                            <div style={{ fontWeight: 500, color: '#0f1f17' }}>{invoice.client_name || '—'}</div>
                                        </td>
                                        <td className="sh-td" style={{ color: '#6b7f74', fontSize: 12 }}>
                                            {invoice.rep_name || <span style={{ color: '#c4cfc8' }}>—</span>}
                                        </td>
                                        <td className="sh-td" style={{ color: '#6b7f74', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {fmtDate(invoice.created_at)}
                                        </td>
                                        <td className="sh-td" style={{ textAlign: 'center' }}>
                                            <span className={`sh-badge ${invoice.status === 'Completed' ? 'sh-badge-done' : 'sh-badge-est'}`}>
                                                <IcDot color={invoice.status === 'Completed' ? '#10b981' : '#f59e0b'} />
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="sh-td" style={{ textAlign: 'right' }}>
                                            <span className="sh-amount">₹{fmtMoney(invoice.final_amount)}</span>
                                        </td>
                                        <td className="sh-td" style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDownload(invoice.id)}
                                                className={`sh-dl-btn${downloadingId === invoice.id ? ' loading' : ''}`}
                                            >
                                                <IcDownload />
                                                {downloadingId === invoice.id ? 'Saving…' : 'PDF'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer totals */}
                        <div className="sh-footer">
                            <span>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} shown</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>Total Revenue</span>
                                <span className="sh-footer-total">₹{fmtMoney(totalRevenue)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExport} />
        </div>
    );
};

export default SalesHistoryPage;