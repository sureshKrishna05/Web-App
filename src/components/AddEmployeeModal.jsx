import React, { useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  /* ── Overlay ── */
  .aem-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: aem-fade 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes aem-fade { from{opacity:0} to{opacity:1} }

  /* ── Modal card ── */
  .aem-modal {
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18);
    border-radius: 24px;
    width: 100%; max-width: 520px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    overflow: hidden;
    animation: aem-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes aem-in {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* ── Header ── */
  .aem-header {
    padding: 22px 26px 18px;
    border-bottom: 1px solid rgba(16,185,129,0.10);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .aem-header-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-right: 12px;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28);
  }
  .aem-title     { font-size: 16px; font-weight: 700; color: #0f1f17; }
  .aem-subtitle  { font-size: 12px; color: #6b7f74; margin-top: 2px; }
  .aem-close-btn {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: rgba(16,185,129,0.08); color: #6b7f74;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .aem-close-btn:hover { background: rgba(239,68,68,0.10); color: #ef4444; }

  /* ── Body ── */
  .aem-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; }

  /* Field rows */
  .aem-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .aem-row-1 { display: grid; grid-template-columns: 1fr; gap: 14px; }

  .aem-field-label {
    font-size: 11px; font-weight: 700; color: #6b7f74;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .aem-required { color: #10b981; font-size: 13px; }

  .aem-input, .aem-select {
    width: 100%; height: 38px; padding: 0 12px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1f17;
    background: rgba(255,255,255,0.9); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none; -webkit-appearance: none;
  }
  .aem-input:focus, .aem-select:focus {
    border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .aem-input::placeholder { color: #9caea6; }
  .aem-input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }

  /* Select wrapper with custom arrow */
  .aem-select-wrap { position: relative; }
  .aem-select-wrap::after {
    content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent; border-right: 4px solid transparent;
    border-top: 5px solid #6b7f74; pointer-events: none;
  }
  .aem-select { padding-right: 30px; cursor: pointer; }

  /* Type option pills */
  .aem-type-pills { display: flex; gap: 8px; }
  .aem-type-pill {
    flex: 1; height: 36px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.18);
    background: transparent; cursor: pointer;
    font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .aem-type-pill:hover { border-color: rgba(16,185,129,0.35); color: #0D6E4D; background: rgba(16,185,129,0.05); }
  .aem-type-pill.selected {
    background: linear-gradient(135deg, rgba(13,110,77,0.10), rgba(16,185,129,0.12));
    border-color: rgba(16,185,129,0.40); color: #0D6E4D;
  }

  /* Error */
  .aem-error {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
    color: #b91c1c; font-size: 12px; font-weight: 500;
  }

  /* ── Footer ── */
  .aem-footer {
    padding: 16px 26px;
    border-top: 1px solid rgba(16,185,129,0.10);
    display: flex; justify-content: flex-end; gap: 10px;
    background: rgba(16,185,129,0.02);
  }
  .aem-cancel-btn {
    height: 38px; padding: 0 18px; border-radius: 10px;
    border: 1px solid rgba(16,185,129,0.2); background: transparent;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    color: #6b7f74; cursor: pointer; transition: all 0.15s;
  }
  .aem-cancel-btn:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
  .aem-save-btn {
    height: 38px; padding: 0 22px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28);
    transition: all 0.18s; display: flex; align-items: center; gap: 7px;
  }
  .aem-save-btn:hover { box-shadow: 0 5px 18px rgba(13,110,77,0.40); transform: translateY(-1px); }
`;

/* Icons */
const IcUser   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcClose  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcRep    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcOffice = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;

const EMPLOYEE_TYPES = [
    { value: 'Representative', label: 'Representative', icon: <IcRep /> },
    { value: 'Office',         label: 'Office Staff',   icon: <IcOffice /> },
];

const AddEmployeeModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        contact_number: '',
        employee_type: 'Representative',
        date_of_joining: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleTypeSelect = (value) => {
        setFormData(prev => ({ ...prev, employee_type: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.contact_number || !formData.date_of_joining) {
            setError('Please fill out all required fields: Name, Contact Number, and Date of Joining.');
            return;
        }
        setError('');
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{css}</style>
            <div className="aem-overlay" onClick={onClose}>
                <div className="aem-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="aem-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="aem-header-icon"><IcUser /></div>
                            <div>
                                <div className="aem-title">Add New Employee</div>
                                <div className="aem-subtitle">Fill in the details to onboard a new staff member</div>
                            </div>
                        </div>
                        <button className="aem-close-btn" onClick={onClose}><IcClose /></button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="aem-body">

                            {/* Row 1 — Name + DOB */}
                            <div className="aem-row-2">
                                <div>
                                    <div className="aem-field-label">Full Name <span className="aem-required">*</span></div>
                                    <input
                                        type="text" name="name" value={formData.name}
                                        onChange={handleChange} required autoFocus
                                        placeholder="e.g. Ravi Kumar"
                                        className="aem-input"
                                    />
                                </div>
                                <div>
                                    <div className="aem-field-label">Date of Birth</div>
                                    <input
                                        type="date" name="dob" value={formData.dob}
                                        onChange={handleChange}
                                        className="aem-input"
                                    />
                                </div>
                            </div>

                            {/* Row 2 — Contact + Joining */}
                            <div className="aem-row-2">
                                <div>
                                    <div className="aem-field-label">Contact Number <span className="aem-required">*</span></div>
                                    <input
                                        type="text" name="contact_number" value={formData.contact_number}
                                        onChange={handleChange} required
                                        placeholder="+91 98765 43210"
                                        className="aem-input"
                                    />
                                </div>
                                <div>
                                    <div className="aem-field-label">Date of Joining <span className="aem-required">*</span></div>
                                    <input
                                        type="date" name="date_of_joining" value={formData.date_of_joining}
                                        onChange={handleChange} required
                                        className="aem-input"
                                    />
                                </div>
                            </div>

                            {/* Row 3 — Employee type pill selector */}
                            <div className="aem-row-1">
                                <div>
                                    <div className="aem-field-label">Employee Type</div>
                                    <div className="aem-type-pills">
                                        {EMPLOYEE_TYPES.map(t => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                className={`aem-type-pill${formData.employee_type === t.value ? ' selected' : ''}`}
                                                onClick={() => handleTypeSelect(t.value)}
                                            >
                                                {t.icon} {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="aem-error">
                                    <IcWarn /> {error}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="aem-footer">
                            <button type="button" className="aem-cancel-btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="aem-save-btn">
                                <IcSave /> Save Employee
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
};

export default AddEmployeeModal;