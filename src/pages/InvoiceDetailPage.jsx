import React, { useState, useEffect, useCallback } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .inv-root { font-family: 'DM Sans', sans-serif; max-width: 900px; margin: 0 auto; }

  /* Back button */
  .inv-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; color: #6b7f74;
    background: rgba(255,255,255,0.7); border: 1px solid rgba(16,185,129,0.15);
    border-radius: 10px; padding: 7px 14px; cursor: pointer;
    transition: all 0.16s; margin-bottom: 20px;
    backdrop-filter: blur(8px);
  }
  .inv-back:hover { color: #0D6E4D; border-color: rgba(16,185,129,0.4); background: rgba(255,255,255,0.95); }

  /* Document card */
  .inv-doc {
    background: rgba(255,255,255,0.93);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 40px rgba(13,110,77,0.08), 0 1px 3px rgba(0,0,0,0.04);
    animation: doc-in 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes doc-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Document top header band */
  .inv-header-band {
    background: linear-gradient(135deg, #0D6E4D 0%, #10B981 100%);
    padding: 28px 36px 24px;
    position: relative; overflow: hidden;
  }
  .inv-header-band::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,0.07);
    pointer-events: none;
  }
  .inv-header-band::after {
    content: '';
    position: absolute; bottom: -40px; right: 120px;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }

  /* Invoice number */
  .inv-number {
    font-size: 26px; font-weight: 600; color: #fff;
    letter-spacing: -0.5px; font-family: 'DM Mono', monospace;
  }
  .inv-date-row {
    display: flex; align-items: center; gap: 16px; margin-top: 6px;
  }
  .inv-date-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 400;
  }

  /* Status badge */
  .inv-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
    text-transform: uppercase; border-radius: 20px;
    padding: 4px 12px;
  }
  .inv-status-completed { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.35); }
  .inv-status-estimate  { background: rgba(245,158,11,0.25); color: #fff; border: 1px solid rgba(245,158,11,0.5); }

  /* Billed-to / from row */
  .inv-parties {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 0; padding: 24px 36px;
    border-bottom: 1px solid rgba(16,185,129,0.1);
    align-items: start;
  }
  .inv-party-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #10b981; margin-bottom: 8px;
  }
  .inv-party-name {
    font-size: 15px; font-weight: 600; color: #0f1f17; margin-bottom: 4px;
  }
  .inv-party-detail {
    font-size: 12px; color: #6b7f74; line-height: 1.6;
  }
  .inv-divider-v {
    width: 1px; background: rgba(16,185,129,0.12);
    margin: 0 32px; align-self: stretch; min-height: 60px;
  }

  /* Amount highlight box */
  .inv-amount-box {
    background: linear-gradient(135deg, rgba(13,110,77,0.06), rgba(16,185,129,0.08));
    border: 1px solid rgba(16,185,129,0.18); border-radius: 14px;
    padding: 14px 18px; text-align: right;
  }
  .inv-amount-label { font-size: 11px; color: #6b7f74; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; }
  .inv-amount-value {
    font-size: 28px; font-weight: 600; color: #0D6E4D;
    font-family: 'DM Mono', monospace; letter-spacing: -1px; margin-top: 4px;
  }

  /* Table section */
  .inv-table-wrap { padding: 0 36px 28px; }
  .inv-table-title {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 1px;
    margin: 20px 0 12px;
  }
  .inv-table {
    width: 100%; border-collapse: collapse; font-size: 13px;
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(16,185,129,0.1);
  }
  .inv-th {
    padding: 10px 16px;
    background: rgba(16,185,129,0.06);
    font-size: 10px; font-weight: 700; color: #0D6E4D;
    text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1px solid rgba(16,185,129,0.12);
  }
  .inv-td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(16,185,129,0.06);
    color: #374151;
    vertical-align: middle;
  }
  .inv-tr:last-child .inv-td { border-bottom: none; }
  .inv-tr:hover .inv-td { background: rgba(16,185,129,0.03); }
  .inv-td-mono {
    font-family: 'DM Mono', monospace; font-size: 12px; color: #0f1f17; font-weight: 500;
  }
  .inv-row-idx {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(16,185,129,0.08); color: #0D6E4D;
    font-size: 11px; font-weight: 600;
    display: inline-flex; align-items: center; justify-content: center;
  }

  /* Totals panel */
  .inv-totals {
    display: flex; justify-content: flex-end;
    padding: 0 36px 28px;
  }
  .inv-totals-box {
    width: 280px;
    background: rgba(16,185,129,0.04);
    border: 1px solid rgba(16,185,129,0.12);
    border-radius: 14px; overflow: hidden;
  }
  .inv-total-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 16px;
    font-size: 13px;
    border-bottom: 1px solid rgba(16,185,129,0.08);
  }
  .inv-total-row:last-child { border-bottom: none; }
  .inv-total-row.final {
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    padding: 14px 16px;
  }
  .inv-total-key { color: #6b7f74; font-weight: 500; }
  .inv-total-val { font-family: 'DM Mono', monospace; font-weight: 500; color: #0f1f17; }
  .inv-total-row.final .inv-total-key,
  .inv-total-row.final .inv-total-val { color: #fff; font-size: 15px; font-weight: 700; }

  /* Action bar */
  .inv-actions {
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
    padding: 16px 36px;
    border-top: 1px solid rgba(16,185,129,0.1);
    background: rgba(16,185,129,0.03);
  }
  .inv-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; padding: 9px 20px;
    border-radius: 10px; cursor: pointer; border: none;
    transition: all 0.18s ease;
  }
  .inv-btn-ghost {
    background: transparent; color: #6b7f74;
    border: 1px solid rgba(16,185,129,0.18);
  }
  .inv-btn-ghost:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; border-color: rgba(16,185,129,0.35); }
  .inv-btn-primary {
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff;
    box-shadow: 0 3px 12px rgba(13,110,77,0.3);
  }
  .inv-btn-primary:hover { box-shadow: 0 6px 20px rgba(13,110,77,0.4); transform: translateY(-1px); }

  /* Loading skeleton */
  .inv-skeleton {
    background: linear-gradient(90deg, rgba(16,185,129,0.07) 25%, rgba(16,185,129,0.13) 50%, rgba(16,185,129,0.07) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite; border-radius: 6px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Print styles */
  @media print {
    .inv-back, .inv-actions { display: none !important; }
    .inv-doc { box-shadow: none; border: 1px solid #ddd; }
  }
`;

/* Icons */
const IcArrow  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IcPrint  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IcCal    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcDot    = () => <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />;

const InvoiceDetailPage = ({ invoiceId, setActivePage }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoiceDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getInvoiceDetails(invoiceId);
            setInvoice(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [invoiceId]);

    useEffect(() => { if (invoiceId) fetchInvoiceDetails(); }, [invoiceId, fetchInvoiceDetails]);

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    /* ── Loading state ── */
    if (loading) return (
        <div className="inv-root">
            <style>{css}</style>
            <div className="inv-doc" style={{ padding: 36 }}>
                <div className="inv-skeleton" style={{ height: 28, width: 220, marginBottom: 12 }} />
                <div className="inv-skeleton" style={{ height: 16, width: 140, marginBottom: 32 }} />
                <div className="inv-skeleton" style={{ height: 14, width: '100%', marginBottom: 10 }} />
                <div className="inv-skeleton" style={{ height: 14, width: '85%', marginBottom: 10 }} />
                <div className="inv-skeleton" style={{ height: 14, width: '70%' }} />
            </div>
        </div>
    );

    if (error) return (
        <div className="inv-root">
            <style>{css}</style>
            <button className="inv-back" onClick={() => setActivePage('Sales History')}><IcArrow /> Back</button>
            <div className="inv-doc" style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
                Failed to load invoice: {error}
            </div>
        </div>
    );

    if (!invoice) return (
        <div className="inv-root">
            <style>{css}</style>
            <button className="inv-back" onClick={() => setActivePage('Sales History')}><IcArrow /> Back</button>
            <div className="inv-doc" style={{ padding: 48, textAlign: 'center', color: '#6b7f74' }}>Invoice not found.</div>
        </div>
    );

    const isCompleted = invoice.status === 'Completed';

    return (
        <div className="inv-root">
            <style>{css}</style>

            {/* Back */}
            <button className="inv-back" onClick={() => setActivePage('Sales History')}>
                <IcArrow /> Back to Sales History
            </button>

            <div className="inv-doc">

                {/* ── Green header band ── */}
                <div className="inv-header-band">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 }}>
                                Tax Invoice
                            </div>
                            <div className="inv-number">{invoice.invoice_number}</div>
                            <div className="inv-date-row">
                                <span className="inv-date-pill"><IcCal /> {fmtDate(invoice.created_at)}</span>
                                <span className={`inv-status ${isCompleted ? 'inv-status-completed' : 'inv-status-estimate'}`}>
                                    <IcDot /> {invoice.status}
                                </span>
                            </div>
                        </div>

                        {/* Total amount box */}
                        <div className="inv-amount-box" style={{ position: 'relative', zIndex: 1 }}>
                            <div className="inv-amount-label">Invoice Total</div>
                            <div className="inv-amount-value">₹{Number(invoice.final_amount).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* ── Parties row ── */}
                <div className="inv-parties">
                    <div>
                        <div className="inv-party-label">Billed To</div>
                        <div className="inv-party-name">{invoice.client_name}</div>
                        <div className="inv-party-detail">
                            {invoice.client_address && <div>{invoice.client_address}</div>}
                            {invoice.client_phone && <div>{invoice.client_phone}</div>}
                        </div>
                    </div>

                    <div className="inv-divider-v" />

                    <div style={{ textAlign: 'right' }}>
                        <div className="inv-party-label">Payment Info</div>
                        <div className="inv-party-name" style={{ color: invoice.payment_mode === 'Cash' ? '#0D6E4D' : invoice.payment_mode === 'Online' ? '#0E7490' : '#B45309' }}>
                            {invoice.payment_mode || 'Credit'}
                        </div>
                        <div className="inv-party-detail">
                            {invoice.rep_name && <div>Rep: {invoice.rep_name}</div>}
                        </div>
                    </div>
                </div>

                {/* ── Items table ── */}
                <div className="inv-table-wrap">
                    <div className="inv-table-title">Line Items — {invoice.items?.length || 0} medicine{invoice.items?.length !== 1 ? 's' : ''}</div>
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th className="inv-th" style={{ width: 40, textAlign: 'center' }}>#</th>
                                <th className="inv-th" style={{ textAlign: 'left' }}>Medicine</th>
                                <th className="inv-th" style={{ textAlign: 'center' }}>Batch</th>
                                <th className="inv-th" style={{ textAlign: 'center' }}>Qty</th>
                                <th className="inv-th" style={{ textAlign: 'center' }}>Free</th>
                                <th className="inv-th" style={{ textAlign: 'right' }}>Rate</th>
                                <th className="inv-th" style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, idx) => (
                                <tr key={item.id} className="inv-tr">
                                    <td className="inv-td" style={{ textAlign: 'center' }}>
                                        <span className="inv-row-idx">{idx + 1}</span>
                                    </td>
                                    <td className="inv-td">
                                        <div style={{ fontWeight: 600, color: '#0f1f17', fontSize: 13 }}>{item.medicine_name}</div>
                                        {item.expiry_date && <div style={{ fontSize: 11, color: '#6b7f74', marginTop: 2 }}>Exp: {item.expiry_date}</div>}
                                    </td>
                                    <td className="inv-td inv-td-mono" style={{ textAlign: 'center', fontSize: 11 }}>{item.batch_number || '—'}</td>
                                    <td className="inv-td" style={{ textAlign: 'center', fontWeight: 600, color: '#0f1f17' }}>{item.quantity}</td>
                                    <td className="inv-td" style={{ textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                                        {item.free_quantity > 0 ? `+${item.free_quantity}` : '—'}
                                    </td>
                                    <td className="inv-td inv-td-mono" style={{ textAlign: 'right' }}>₹{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="inv-td inv-td-mono" style={{ textAlign: 'right', color: '#0D6E4D', fontWeight: 600 }}>
                                        ₹{Number(item.total_price).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Totals ── */}
                <div className="inv-totals">
                    <div className="inv-totals-box">
                        <div className="inv-total-row">
                            <span className="inv-total-key">Subtotal</span>
                            <span className="inv-total-val">₹{Number(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="inv-total-row">
                            <span className="inv-total-key">Tax (GST)</span>
                            <span className="inv-total-val">₹{Number(invoice.tax).toFixed(2)}</span>
                        </div>
                        <div className="inv-total-row final">
                            <span className="inv-total-key">Grand Total</span>
                            <span className="inv-total-val">₹{Number(invoice.final_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Action bar ── */}
                <div className="inv-actions">
                    <button className="inv-btn inv-btn-ghost" onClick={() => setActivePage('Sales History')}>
                        <IcArrow /> Back
                    </button>
                    <button className="inv-btn inv-btn-ghost" onClick={() => window.print()}>
                        <IcPrint /> Print
                    </button>
                    <button className="inv-btn inv-btn-primary" onClick={() => setActivePage('New Invoice')}>
                        + New Invoice
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InvoiceDetailPage;