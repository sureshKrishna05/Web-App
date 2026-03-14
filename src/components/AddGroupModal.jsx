import React, { useState, useEffect } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .agm-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: agm-fade 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes agm-fade { from{opacity:0} to{opacity:1} }

  .agm-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 24px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden;
    animation: agm-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes agm-in {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* Header */
  .agm-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid rgba(16,185,129,0.10);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .agm-header-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-right: 12px;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28);
  }
  .agm-title    { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .agm-subtitle { font-size: 12px; color: #6b7f74; margin-top: 2px; }
  .agm-close {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: rgba(16,185,129,0.08); color: #6b7f74;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .agm-close:hover { background: rgba(239,68,68,0.10); color: #ef4444; }

  /* Body */
  .agm-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }

  .agm-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .agm-required { color: #10b981; font-size: 13px; }

  .agm-input {
    width: 100%; height: 38px; padding: 0 12px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .agm-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .agm-input::placeholder { color: #9caea6; }
  .agm-input-mono { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; }

  /* GST suffix input */
  .agm-suffix-wrap {
    display: flex; align-items: center;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px; overflow: hidden;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .agm-suffix-wrap:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .agm-suffix-input {
    flex: 1; height: 38px; padding: 0 12px; border: none; outline: none;
    font-size: 15px; font-family: 'DM Mono', monospace; font-weight: 600;
    color: #0f1f17; background: transparent;
  }
  .agm-suffix-unit {
    padding: 0 14px; height: 38px; display: flex; align-items: center;
    font-size: 13px; font-weight: 700; color: #0D6E4D;
    background: rgba(16,185,129,0.07);
    border-left: 1px solid rgba(16,185,129,0.15);
  }

  /* GST quick-pick pills */
  .agm-gst-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .agm-gst-pill {
    height: 28px; padding: 0 12px; border-radius: 20px;
    border: 1px solid rgba(16,185,129,0.18); background: transparent;
    font-size: 12px; font-weight: 600; font-family: 'DM Mono', monospace;
    color: #6b7f74; cursor: pointer; transition: all 0.14s;
  }
  .agm-gst-pill:hover   { border-color: rgba(16,185,129,0.4); color: #0D6E4D; background: rgba(16,185,129,0.06); }
  .agm-gst-pill.active  { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.45); color: #0D6E4D; }

  /* Measure row */
  .agm-measure-wrap { position: relative; }
  .agm-measure-hint {
    font-size: 11px; color: #9caea6; margin-top: 5px; font-weight: 400;
  }

  /* Error */
  .agm-error {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
    color: #b91c1c; font-size: 12px; font-weight: 500;
  }

  /* Footer */
  .agm-footer {
    padding: 16px 24px; border-top: 1px solid rgba(16,185,129,0.10);
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .agm-cancel {
    height: 38px; padding: 0 18px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .agm-cancel:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .agm-save {
    height: 38px; padding: 0 22px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); transition: all 0.18s;
    display: flex; align-items: center; gap: 7px;
  }
  .agm-save:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.40); transform: translateY(-1px); }
`;

/* Icons */
const IcGroup = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="6" height="10" rx="1"/><rect x="16" y="7" width="6" height="10" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/></svg>;
const IcClose = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSave  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

const GST_PRESETS = [0, 5, 12, 18, 28];

const AddGroupModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ hsn_code: '', gst_percentage: '', measure: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ hsn_code: '', gst_percentage: '', measure: '' });
            setError('');
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleGstPreset = (val) => {
        setFormData(prev => ({ ...prev, gst_percentage: String(val) }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { hsn_code, gst_percentage, measure } = formData;
        if (!hsn_code.trim() || gst_percentage.trim() === '') {
            setError('Please fill out HSN Code and GST Percentage.');
            return;
        }
        const gst = parseFloat(gst_percentage);
        if (isNaN(gst) || gst < 0 || gst > 100) {
            setError('Please enter a valid GST percentage (0–100).');
            return;
        }
        setError('');
        onSave({ hsn_code: hsn_code.trim(), gst_percentage: gst, measure: measure.trim() });
    };

    if (!isOpen) return null;

    const activeGst = parseFloat(formData.gst_percentage);

    return (
        <>
            <style>{css}</style>
            <div className="agm-overlay" onClick={onClose}>
                <div className="agm-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="agm-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="agm-header-icon"><IcGroup /></div>
                            <div>
                                <div className="agm-title">Add New Group</div>
                                <div className="agm-subtitle">Define HSN code and GST slab for this group</div>
                            </div>
                        </div>
                        <button className="agm-close" onClick={onClose}><IcClose /></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="agm-body">

                            {/* HSN Code */}
                            <div>
                                <div className="agm-field-label">HSN Code <span className="agm-required">*</span></div>
                                <input
                                    type="text" name="hsn_code" value={formData.hsn_code}
                                    onChange={handleChange} required autoFocus
                                    placeholder="e.g. 3004"
                                    className={`agm-input agm-input-mono`}
                                />
                            </div>

                            {/* GST Percentage */}
                            <div>
                                <div className="agm-field-label">GST Percentage <span className="agm-required">*</span></div>
                                <div className="agm-suffix-wrap">
                                    <input
                                        type="number" name="gst_percentage"
                                        value={formData.gst_percentage}
                                        onChange={handleChange}
                                        step="0.01" min="0" max="100"
                                        placeholder="0"
                                        className="agm-suffix-input"
                                    />
                                    <div className="agm-suffix-unit">%</div>
                                </div>
                                {/* Quick pick presets */}
                                <div className="agm-gst-pills">
                                    {GST_PRESETS.map(p => (
                                        <button
                                            key={p} type="button"
                                            className={`agm-gst-pill${activeGst === p ? ' active' : ''}`}
                                            onClick={() => handleGstPreset(p)}
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Measure */}
                            <div>
                                <div className="agm-field-label">Unit of Measure</div>
                                <input
                                    type="text" name="measure" value={formData.measure}
                                    onChange={handleChange}
                                    placeholder="e.g. mg, ml, tablet, box"
                                    className="agm-input"
                                />
                                <div className="agm-measure-hint">Optional — used as the scaling unit for items in this group</div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="agm-error"><IcWarn /> {error}</div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="agm-footer">
                            <button type="button" className="agm-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="agm-save"><IcSave /> Save Group</button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
};

export default AddGroupModal;