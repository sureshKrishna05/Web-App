import React, { useState, useEffect, useMemo } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .aim-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: aim-fade 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes aim-fade { from{opacity:0} to{opacity:1} }

  .aim-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 24px;
    width: 100%; max-width: 640px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden;
    animation: aim-in 0.22s cubic-bezier(.22,1,.36,1);
    max-width: 860px; display: flex; flex-direction: column;
  }
  @keyframes aim-in {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* Header */
  .aim-header {
    padding: 20px 24px 16px; flex-shrink: 0;
    border-bottom: 1px solid rgba(16,185,129,0.10);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .aim-header-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-right: 12px;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28);
  }
  .aim-title    { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .aim-subtitle { font-size: 12px; color: #6b7f74; margin-top: 2px; }
  .aim-close {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: rgba(16,185,129,0.08); color: #6b7f74;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .aim-close:hover { background: rgba(239,68,68,0.10); color: #ef4444; }

  /* Scrollable body */
  .aim-body {
    padding: 18px 24px;
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px 20px; align-items: start;
  }

  /* Section divider */
  .aim-section-label {
    font-size: 10px; font-weight: 700; color: #10b981;
    text-transform: uppercase; letter-spacing: 1px;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 0;
  }
  .aim-section-label::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(16,185,129,0.15);
  }

  /* 2-col grid */
  .aim-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .aim-grid-1 { display: grid; grid-template-columns: 1fr; }

  /* Field */
  .aim-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .aim-required { color: #10b981; font-size: 13px; }

  .aim-input, .aim-select {
    width: 100%; height: 38px; padding: 0 12px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .aim-input:focus, .aim-select:focus {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .aim-input::placeholder { color: #9caea6; }
  .aim-input-mono { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
  .aim-input-readonly {
    background: rgba(16,185,129,0.04); color: #6b7f74;
    border-color: rgba(16,185,129,0.10); cursor: not-allowed;
  }

  /* Select with custom arrow */
  .aim-select-wrap { position: relative; }
  .aim-select-wrap::after {
    content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent; border-right: 4px solid transparent;
    border-top: 5px solid #6b7f74; pointer-events: none;
  }
  .aim-select { padding-right: 30px; cursor: pointer; appearance: none; -webkit-appearance: none; }

  /* Prefix/suffix wrappers */
  .aim-prefix-wrap, .aim-suffix-wrap {
    display: flex; align-items: center;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px; overflow: hidden;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .aim-prefix-wrap:focus-within, .aim-suffix-wrap:focus-within {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .aim-prefix-unit, .aim-suffix-unit {
    padding: 0 12px; height: 38px; display: flex; align-items: center;
    font-size: 13px; font-weight: 700; color: #0D6E4D;
    background: rgba(16,185,129,0.07); white-space: nowrap;
  }
  .aim-prefix-unit { border-right: 1px solid rgba(16,185,129,0.15); }
  .aim-suffix-unit { border-left: 1px solid rgba(16,185,129,0.15); }
  .aim-affix-input {
    flex: 1; height: 38px; padding: 0 12px; border: none; outline: none;
    font-size: 13px; font-family: 'DM Mono', monospace; font-weight: 500;
    color: #0f1f17; background: transparent;
  }
  .aim-affix-input::placeholder { color: #9caea6; font-family: 'DM Sans', sans-serif; font-weight: 400; }
  .aim-affix-readonly { background: rgba(16,185,129,0.04); color: #6b7f74; }

  /* GST locked badge */
  .aim-gst-lock {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #0D6E4D;
    background: rgba(16,185,129,0.10); border-radius: 20px;
    padding: 3px 10px; margin-top: 6px;
  }

  /* Group hint */
  .aim-hint { font-size: 11px; color: #9caea6; margin-top: 5px; }

  /* Item code chip */
  .aim-code-chip {
    font-family: 'DM Mono', monospace; font-size: 12px;
    background: rgba(16,185,129,0.07); color: #0D6E4D;
    border-radius: 7px; padding: 2px 9px; display: inline-block; margin-top: 6px;
  }

  /* Error */
  .aim-error {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
    color: #b91c1c; font-size: 12px; font-weight: 500;
  }

  /* Footer */
  .aim-footer {
    padding: 14px 24px; border-top: 1px solid rgba(16,185,129,0.10); flex-shrink: 0;
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .aim-cancel {
    height: 38px; padding: 0 18px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .aim-cancel:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .aim-save {
    height: 38px; padding: 0 22px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); transition: all 0.18s;
    display: flex; align-items: center; gap: 7px;
  }
  .aim-save:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.40); transform: translateY(-1px); }
`;

/* Icons */
const IcPill  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5L3.5 13.5a5 5 0 017-7l7 7a5 5 0 01-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
const IcClose = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSave  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcLock  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;

const AddItemModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        name: '', hsn: '', item_code: '', batch_number: '',
        expiry_date: '', price: '', stock: '', gst_percentage: ''
    });
    const [groups, setGroups]               = useState([]);
    const [selectedGroupHsn, setSelectedGroupHsn] = useState('');
    const [isGstEditable, setIsGstEditable] = useState(true);
    const [error, setError]                 = useState('');

    const sortedGroups = useMemo(() =>
        [...groups].sort((a, b) => String(a.hsn_code).localeCompare(String(b.hsn_code))),
    [groups]);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const groupsData = await window.electronAPI.getAllGroups();
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch (err) { console.error('Failed to fetch groups:', err); }
        })();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (item) {
            setFormData({
                name: item.name || '', hsn: item.hsn || '',
                item_code: item.item_code || '', batch_number: item.batch_number || '',
                expiry_date: item.expiry_date || '', price: item.price ?? '',
                stock: item.stock ?? '', gst_percentage: ''
            });
        } else {
            setFormData({ name: '', hsn: '', item_code: '', batch_number: '', expiry_date: '', price: '', stock: '', gst_percentage: '' });
            setSelectedGroupHsn('');
            setIsGstEditable(true);
        }
    }, [item, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const match = groups.find(g => String(g.hsn_code) === String(formData.hsn));
        if (match) {
            setSelectedGroupHsn(match.hsn_code);
            setFormData(prev => ({ ...prev, gst_percentage: match.gst_percentage }));
            setIsGstEditable(false);
        } else {
            setSelectedGroupHsn('');
            setIsGstEditable(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, formData.hsn, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleGroupSelect = (e) => {
        const hsn = e.target.value;
        setSelectedGroupHsn(hsn);
        if (hsn) {
            const g = groups.find(x => String(x.hsn_code) === String(hsn));
            if (g) {
                setFormData(prev => ({ ...prev, hsn: g.hsn_code, gst_percentage: g.gst_percentage }));
                setIsGstEditable(false);
            }
        } else {
            setIsGstEditable(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock || !formData.hsn) {
            setError('Fill required: Name, HSN, Price, Stock.');
            return;
        }
        const payload = {
            name: String(formData.name).trim(),
            hsn: String(formData.hsn).trim(),
            batch_number: formData.batch_number || '',
            expiry_date: formData.expiry_date || '',
            price: Number(formData.price),
            stock: Number(formData.stock),
            gst_percentage: formData.gst_percentage === '' ? 0 : Number(formData.gst_percentage)
        };
        setError('');
        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{css}</style>
            <div className="aim-overlay" onClick={onClose}>
                <div className="aim-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="aim-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="aim-header-icon"><IcPill /></div>
                            <div>
                                <div className="aim-title">{item ? 'Edit Item' : 'Add New Item'}</div>
                                <div className="aim-subtitle">{item ? `Editing — ${item.name}` : 'Fill in medicine details to add to inventory'}</div>
                            </div>
                        </div>
                        <button className="aim-close" onClick={onClose}><IcClose /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div className="aim-body">

                            <div style={{ display: 'contents' }}>
                                <div>
                                    <div className="aim-field-label">Item Name <span className="aim-required">*</span></div>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                                        placeholder="e.g. Paracetamol 500mg" required autoFocus
                                        className="aim-input" />
                                </div>
                                <div>
                                    <div className="aim-field-label">Batch No.</div>
                                    <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange}
                                        placeholder="e.g. BT2024001"
                                        className={`aim-input aim-input-mono`} />
                                </div>
                                <div>
                                    <div className="aim-field-label">Expiry Date</div>
                                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange}
                                        className="aim-input" />
                                </div>
                                {item && (
                                    <div>
                                        <div className="aim-field-label">Item Code</div>
                                        <input type="text" name="item_code" value={formData.item_code} readOnly
                                            className="aim-input aim-input-mono aim-input-readonly" />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'contents' }}>
                                <div>
                                    <div className="aim-field-label">Group (by HSN)</div>
                                    <div className="aim-select-wrap">
                                        <select value={selectedGroupHsn} onChange={handleGroupSelect} className="aim-select">
                                            <option value="">No group / New HSN</option>
                                            {sortedGroups.map(g => (
                                                <option key={g.id} value={g.hsn_code}>HSN {g.hsn_code} — {g.gst_percentage}%</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="aim-hint">Selecting fills HSN & locks GST rate</div>
                                </div>
                                <div>
                                    <div className="aim-field-label">HSN Number <span className="aim-required">*</span></div>
                                    <input type="text" name="hsn" value={formData.hsn} onChange={handleChange}
                                        placeholder="e.g. 3004" required
                                        className={`aim-input aim-input-mono${!isGstEditable ? ' aim-input-readonly' : ''}`}
                                        readOnly={!isGstEditable} />
                                </div>
                                <div>
                                    <div className="aim-field-label">GST %</div>
                                    {isGstEditable ? (
                                        <div className="aim-suffix-wrap">
                                            <input type="number" name="gst_percentage" value={formData.gst_percentage}
                                                onChange={handleChange} step="0.01" min="0" max="100" placeholder="0"
                                                className="aim-affix-input" />
                                            <div className="aim-suffix-unit">%</div>
                                        </div>
                                    ) : (
                                        <div className="aim-suffix-wrap">
                                            <input type="number" name="gst_percentage" value={formData.gst_percentage}
                                                readOnly step="0.01" min="0" max="100"
                                                className="aim-affix-input aim-affix-readonly" />
                                            <div className="aim-suffix-unit">%</div>
                                        </div>
                                    )}
                                    {!isGstEditable && (
                                        <div className="aim-gst-lock"><IcLock /> Locked by group</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'contents' }}>
                                <div>
                                    <div className="aim-field-label">Selling Price <span className="aim-required">*</span></div>
                                    <div className="aim-prefix-wrap">
                                        <div className="aim-prefix-unit">₹</div>
                                        <input type="number" name="price" value={formData.price} onChange={handleChange}
                                            step="0.01" required placeholder="0.00"
                                            className="aim-affix-input" />
                                    </div>
                                </div>
                                <div>
                                    <div className="aim-field-label">Stock Quantity <span className="aim-required">*</span></div>
                                    <div className="aim-suffix-wrap">
                                        <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                                            required placeholder="0"
                                            className="aim-affix-input" />
                                        <div className="aim-suffix-unit">units</div>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && <div className="aim-error" style={{ gridColumn: '1 / -1' }}><IcWarn /> {error}</div>}

                        </div>

                        {/* Footer */}
                        <div className="aim-footer">
                            <button type="button" className="aim-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="aim-save">
                                <IcSave /> {item ? 'Update Item' : 'Save Item'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
};

export default AddItemModal;