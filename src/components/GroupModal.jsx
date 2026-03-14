import React, { useState, useEffect } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .gm-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: gm-fade 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes gm-fade { from{opacity:0} to{opacity:1} }

  .gm-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 24px;
    width: 100%; max-width: 580px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.16); overflow: hidden;
    animation: gm-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes gm-in {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* Header */
  .gm-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(16,185,129,0.10);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
    display: flex; align-items: center; justify-content: space-between;
  }
  .gm-header-left { display: flex; align-items: center; gap: 12px; }
  .gm-header-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); flex-shrink: 0;
  }
  .gm-title    { font-size: 15px; font-weight: 700; color: #0f1f17; }
  .gm-hsn      { font-size: 12px; color: #10b981; font-family: 'DM Mono', monospace; font-weight: 600; margin-top: 2px; }
  .gm-close {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: rgba(16,185,129,0.08); color: #6b7f74;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .gm-close:hover { background: rgba(239,68,68,0.10); color: #ef4444; }

  /* Body */
  .gm-body {
    padding: 20px 24px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }

  /* Section label */
  .gm-section-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .gm-count-badge {
    display: inline-flex; align-items: center;
    background: rgba(16,185,129,0.10); color: #0D6E4D;
    font-size: 10px; font-weight: 700; padding: 1px 7px;
    border-radius: 20px;
  }

  /* Items list */
  .gm-items-list {
    height: 200px; overflow-y: auto;
    background: rgba(16,185,129,0.03);
    border: 1px solid rgba(16,185,129,0.12);
    border-radius: 12px; padding: 6px;
  }
  .gm-items-list::-webkit-scrollbar { width: 3px; }
  .gm-items-list::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 3px; }

  .gm-item-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 8px; transition: background 0.13s;
  }
  .gm-item-row:hover { background: rgba(16,185,129,0.06); }
  .gm-item-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(16,185,129,0.4); flex-shrink: 0; }
  .gm-item-name { font-size: 12px; color: #374151; font-weight: 500; }

  .gm-empty {
    height: 100%; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 6px; color: #9caea6;
  }
  .gm-empty-icon { font-size: 24px; }
  .gm-empty-text { font-size: 12px; font-weight: 500; text-align: center; }

  /* GST side */
  .gm-gst-side { display: flex; flex-direction: column; gap: 14px; }

  /* Current GST display */
  .gm-gst-current {
    background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);
    border-radius: 12px; padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .gm-gst-current-label { font-size: 11px; color: #6b7f74; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
  .gm-gst-current-val {
    font-size: 26px; font-weight: 700; color: #0D6E4D;
    font-family: 'DM Mono', monospace; line-height: 1;
  }
  .gm-gst-current-unit { font-size: 14px; color: #10b981; font-weight: 600; margin-top: 2px; }

  /* GST input */
  .gm-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
  }
  .gm-suffix-wrap {
    display: flex; align-items: center;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px; overflow: hidden;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .gm-suffix-wrap:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .gm-suffix-input {
    flex: 1; height: 38px; padding: 0 12px; border: none; outline: none;
    font-size: 15px; font-family: 'DM Mono', monospace; font-weight: 600;
    color: #0f1f17; background: transparent;
  }
  .gm-suffix-unit {
    padding: 0 14px; height: 38px; display: flex; align-items: center;
    font-size: 13px; font-weight: 700; color: #0D6E4D;
    background: rgba(16,185,129,0.07);
    border-left: 1px solid rgba(16,185,129,0.15);
  }

  /* GST presets */
  .gm-presets { display: flex; gap: 6px; flex-wrap: wrap; }
  .gm-preset {
    height: 26px; padding: 0 10px; border-radius: 20px;
    border: 1px solid rgba(16,185,129,0.18); background: transparent;
    font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace;
    color: #6b7f74; cursor: pointer; transition: all 0.14s;
  }
  .gm-preset:hover  { border-color: rgba(16,185,129,0.4); color: #0D6E4D; background: rgba(16,185,129,0.06); }
  .gm-preset.active { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.45); color: #0D6E4D; }

  /* Save GST btn */
  .gm-save-gst {
    height: 38px; width: 100%; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .gm-save-gst:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.40); transform: translateY(-1px); }
  .gm-save-gst:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Error */
  .gm-error {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 12px; border-radius: 8px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
    color: #b91c1c; font-size: 11px; font-weight: 500;
  }

  /* Footer */
  .gm-footer {
    padding: 14px 24px; border-top: 1px solid rgba(16,185,129,0.09);
    display: flex; justify-content: flex-end;
    background: rgba(16,185,129,0.02);
  }
  .gm-close-btn {
    height: 36px; padding: 0 18px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .gm-close-btn:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
`;

/* Icons */
const IcGroup = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="6" height="10" rx="1"/><rect x="16" y="7" width="6" height="10" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/></svg>;
const IcClose = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcSave  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcWarn  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const GST_PRESETS = [0, 5, 12, 18, 28];

const GroupModal = ({ isOpen, onClose, onSaveGst, groupDetails }) => {
    const [gst, setGst]     = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (groupDetails) {
            setGst(groupDetails.gst_percentage);
            setError('');
        }
    }, [groupDetails]);

    if (!isOpen || !groupDetails) return null;

    const handleSave = () => {
        const parsedGst = parseFloat(gst);
        if (!isNaN(parsedGst) && parsedGst >= 0 && parsedGst <= 100) {
            setError('');
            onSaveGst(groupDetails.id, parsedGst);
        } else {
            setError('Enter a valid GST percentage between 0 and 100.');
            console.error('Invalid GST value');
        }
    };

    const activeGst = parseFloat(gst);

    return (
        <>
            <style>{css}</style>
            <div className="gm-overlay" onClick={onClose}>
                <div className="gm-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="gm-header">
                        <div className="gm-header-left">
                            <div className="gm-header-icon"><IcGroup /></div>
                            <div>
                                <div className="gm-title">Group Details</div>
                                <div className="gm-hsn">HSN {groupDetails.hsn_code}</div>
                            </div>
                        </div>
                        <button className="gm-close" onClick={onClose}><IcClose /></button>
                    </div>

                    {/* Body */}
                    <div className="gm-body">

                        {/* Left — items list */}
                        <div>
                            <div className="gm-section-label">
                                Items in Group
                                <span className="gm-count-badge">{groupDetails.medicines.length}</span>
                            </div>
                            <div className="gm-items-list">
                                {groupDetails.medicines.length > 0 ? (
                                    groupDetails.medicines.map(med => (
                                        <div key={med.id} className="gm-item-row">
                                            <span className="gm-item-dot" />
                                            <span className="gm-item-name">{med.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="gm-empty">
                                        <div className="gm-empty-icon">💊</div>
                                        <div className="gm-empty-text">No items assigned<br />to this group yet</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right — GST settings */}
                        <div className="gm-gst-side">
                            <div className="gm-section-label">GST Settings</div>

                            {/* Current GST display */}
                            <div className="gm-gst-current">
                                <div>
                                    <div className="gm-gst-current-label">Current Rate</div>
                                    <div className="gm-gst-current-unit">GST Slab</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="gm-gst-current-val">{groupDetails.gst_percentage}</div>
                                    <div className="gm-gst-current-unit">%</div>
                                </div>
                            </div>

                            {/* New GST input */}
                            <div>
                                <div className="gm-field-label">Update GST %</div>
                                <div className="gm-suffix-wrap">
                                    <input
                                        type="number" step="0.01" min="0" max="100"
                                        value={gst} onChange={e => { setGst(e.target.value); setError(''); }}
                                        placeholder="0"
                                        className="gm-suffix-input"
                                    />
                                    <div className="gm-suffix-unit">%</div>
                                </div>

                                {/* Presets */}
                                <div className="gm-presets" style={{ marginTop: 8 }}>
                                    {GST_PRESETS.map(p => (
                                        <button
                                            key={p} type="button"
                                            className={`gm-preset${activeGst === p ? ' active' : ''}`}
                                            onClick={() => { setGst(String(p)); setError(''); }}
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && <div className="gm-error"><IcWarn /> {error}</div>}

                            {/* Save button */}
                            <button className="gm-save-gst" onClick={handleSave}>
                                <IcSave /> Save GST Change
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="gm-footer">
                        <button className="gm-close-btn" onClick={onClose}>Close</button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default GroupModal;