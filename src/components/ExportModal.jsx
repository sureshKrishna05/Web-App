import React from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .em-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: em-fade 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes em-fade { from{opacity:0} to{opacity:1} }

  .em-modal {
    background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
    border: 1px solid rgba(16,185,129,0.18); border-radius: 24px;
    width: 100%; max-width: 380px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.16); overflow: hidden;
    animation: em-in 0.22s cubic-bezier(.22,1,.36,1);
  }
  @keyframes em-in {
    from { opacity:0; transform:scale(0.96) translateY(14px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* Header */
  .em-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid rgba(16,185,129,0.10);
    background: linear-gradient(135deg, rgba(13,110,77,0.05), rgba(16,185,129,0.04));
    display: flex; align-items: center; justify-content: space-between;
  }
  .em-header-left { display: flex; align-items: center; gap: 12px; }
  .em-header-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(13,110,77,0.28); flex-shrink: 0;
  }
  .em-title    { font-size: 15px; font-weight: 700; color: #0f1f17; }
  .em-subtitle { font-size: 12px; color: #6b7f74; margin-top: 2px; }
  .em-close {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: rgba(16,185,129,0.08); color: #6b7f74;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .em-close:hover { background: rgba(239,68,68,0.10); color: #ef4444; }

  /* Format cards */
  .em-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 10px; }

  .em-format-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    border: 1px solid rgba(16,185,129,0.15);
    background: rgba(255,255,255,0.7);
    cursor: pointer; width: 100%; text-align: left;
    transition: all 0.18s ease; font-family: 'DM Sans', sans-serif;
  }
  .em-format-card:hover {
    border-color: rgba(16,185,129,0.40);
    background: rgba(255,255,255,0.95);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(13,110,77,0.10);
  }
  .em-format-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .em-format-name { font-size: 14px; font-weight: 700; color: #0f1f17; }
  .em-format-desc { font-size: 11px; color: #6b7f74; margin-top: 2px; font-weight: 400; }
  .em-format-arrow {
    margin-left: auto; font-size: 16px; color: #10b981;
    flex-shrink: 0; transition: transform 0.15s;
  }
  .em-format-card:hover .em-format-arrow { transform: translateX(3px); }

  /* Cancel */
  .em-cancel {
    width: 100%; padding: 10px; border-radius: 10px; border: none;
    background: transparent; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; color: #6b7f74;
    cursor: pointer; transition: all 0.15s; margin-top: 2px;
  }
  .em-cancel:hover { background: rgba(16,185,129,0.06); color: #0D6E4D; }
`;

/* Icons */
const IcExport = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcClose  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const FORMATS = [
    {
        id: 'csv',
        emoji: '📄',
        name: 'CSV Format',
        desc: 'Comma-separated values — opens in Excel, Sheets, or any text editor',
        bg: 'rgba(16,185,129,0.10)',
    },
    {
        id: 'xlsx',
        emoji: '📊',
        name: 'XLSX Format',
        desc: 'Microsoft Excel workbook — best for formatted reports and charts',
        bg: 'rgba(59,130,246,0.10)',
    },
];

const ExportModal = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;

    return (
        <>
            <style>{css}</style>
            <div className="em-overlay" onClick={onClose}>
                <div className="em-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="em-header">
                        <div className="em-header-left">
                            <div className="em-header-icon"><IcExport /></div>
                            <div>
                                <div className="em-title">Export Sales Data</div>
                                <div className="em-subtitle">Choose a format to download</div>
                            </div>
                        </div>
                        <button className="em-close" onClick={onClose}><IcClose /></button>
                    </div>

                    {/* Format options */}
                    <div className="em-body">
                        {FORMATS.map(f => (
                            <button key={f.id} className="em-format-card" onClick={() => onExport(f.id)}>
                                <div className="em-format-icon" style={{ background: f.bg }}>{f.emoji}</div>
                                <div>
                                    <div className="em-format-name">{f.name}</div>
                                    <div className="em-format-desc">{f.desc}</div>
                                </div>
                                <div className="em-format-arrow">→</div>
                            </button>
                        ))}

                        <button className="em-cancel" onClick={onClose}>Cancel</button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ExportModal;