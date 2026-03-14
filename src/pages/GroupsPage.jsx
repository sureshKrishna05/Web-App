import React, { useState, useEffect, useCallback } from 'react';
import AddGroupModal from '../components/AddGroupModal';
import GroupModal from '../components/GroupModal';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .gp-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 20px; }

  /* ── Top bar ── */
  .gp-topbar {
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
    flex-wrap: wrap;
  }
  .gp-search-wrap {
    position: relative; flex: 1; min-width: 200px; max-width: 320px;
  }
  .gp-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #6b7f74; pointer-events: none;
  }
  .gp-search {
    width: 100%; height: 38px; padding: 0 12px 0 36px;
    border: 1px solid rgba(16,185,129,0.18); border-radius: 11px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    color: #0f1f17; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .gp-search:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  .gp-search::placeholder { color: #9caea6; }

  .gp-add-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 38px; padding: 0 18px;
    background: linear-gradient(135deg, #0D6E4D, #10B981);
    color: #fff; border: none; border-radius: 11px;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(13,110,77,0.28);
    transition: all 0.18s ease;
  }
  .gp-add-btn:hover { box-shadow: 0 5px 20px rgba(13,110,77,0.38); transform: translateY(-1px); }

  /* ── Summary strip ── */
  .gp-summary {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .gp-sum-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.13); border-radius: 12px;
    padding: 9px 16px; font-size: 13px;
    animation: gp-in 0.4s ease both;
  }
  .gp-sum-pill:nth-child(1) { animation-delay: 0.05s; }
  .gp-sum-pill:nth-child(2) { animation-delay: 0.10s; }
  .gp-sum-pill:nth-child(3) { animation-delay: 0.15s; }
  .gp-sum-val { font-weight: 700; color: #0D6E4D; font-family: 'DM Mono', monospace; font-size: 15px; }
  .gp-sum-lbl { color: #6b7f74; font-weight: 500; font-size: 12px; }

  /* ── Cards grid ── */
  .gp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
  }

  /* ── Group card ── */
  .gp-card {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(16,185,129,0.13);
    border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s;
    animation: gp-in 0.4s ease both;
    cursor: pointer;
  }
  .gp-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(13,110,77,0.12);
    border-color: rgba(16,185,129,0.32);
  }
  @keyframes gp-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Card accent top bar - color by GST % */
  .gp-card-accent { height: 4px; width: 100%; }

  /* Card body */
  .gp-card-body { padding: 18px 18px 14px; flex: 1; }
  .gp-hsn-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #10b981; margin-bottom: 6px;
  }
  .gp-hsn-code {
    font-size: 22px; font-weight: 600; color: #0f1f17;
    font-family: 'DM Mono', monospace; letter-spacing: -0.5px;
    margin-bottom: 14px; line-height: 1;
  }

  /* GST badge */
  .gp-gst-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 700; padding: 5px 12px;
    border-radius: 20px; margin-bottom: 10px;
  }

  /* Item count bar */
  .gp-item-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 8px;
  }
  .gp-item-count {
    font-size: 12px; color: #6b7f74; font-weight: 500;
    display: flex; align-items: center; gap: 5px;
  }
  .gp-item-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(16,185,129,0.4); }
  .gp-item-bar-wrap { flex: 1; margin-left: 10px; height: 4px; background: rgba(16,185,129,0.1); border-radius: 4px; overflow: hidden; }
  .gp-item-bar { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #0D6E4D, #10B981); transition: width 0.6s ease; }

  /* Card footer */
  .gp-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px;
    border-top: 1px solid rgba(16,185,129,0.08);
    background: rgba(16,185,129,0.02);
  }
  .gp-edit-hint {
    font-size: 11px; color: #6b7f74; font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }
  .gp-del-btn {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: #f87171; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .gp-del-btn:hover { background: rgba(239,68,68,0.08); color: #ef4444; }

  /* Skeleton */
  .gp-skel {
    background: linear-gradient(90deg, rgba(16,185,129,0.06) 25%, rgba(16,185,129,0.12) 50%, rgba(16,185,129,0.06) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite; border-radius: 8px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }

  /* Empty state */
  .gp-empty {
    grid-column: 1 / -1; padding: 64px 0;
    text-align: center; color: #6b7f74;
  }
  .gp-empty-icon { font-size: 40px; margin-bottom: 14px; }
`;

/* Icons */
const IcPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcEdit   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

/* GST tier → color */
const gstColor = (pct) => {
  const n = Number(pct);
  if (n === 0)  return { accent: '#6b7f74', bg: 'rgba(107,127,116,0.10)', text: '#374151', badge: 'rgba(107,127,116,0.12)' };
  if (n <= 5)   return { accent: '#10b981', bg: 'rgba(16,185,129,0.10)',  text: '#065f46', badge: 'rgba(16,185,129,0.12)' };
  if (n <= 12)  return { accent: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  text: '#1e40af', badge: 'rgba(59,130,246,0.12)' };
  if (n <= 18)  return { accent: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#92400e', badge: 'rgba(245,158,11,0.12)' };
  return              { accent: '#ef4444', bg: 'rgba(239,68,68,0.10)',   text: '#991b1b', badge: 'rgba(239,68,68,0.12)' };
};

/* Skeleton card */
const SkelCard = () => (
  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.1)' }}>
    <div className="gp-skel" style={{ height: 4 }} />
    <div style={{ padding: '18px 18px 14px' }}>
      <div className="gp-skel" style={{ height: 10, width: 60, marginBottom: 10 }} />
      <div className="gp-skel" style={{ height: 24, width: 100, marginBottom: 16 }} />
      <div className="gp-skel" style={{ height: 26, width: 80, borderRadius: 20 }} />
    </div>
    <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(16,185,129,0.08)' }}>
      <div className="gp-skel" style={{ height: 10, width: 90 }} />
    </div>
  </div>
);

const GroupsPage = () => {
    const [groups, setGroups]                     = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [error, setError]                       = useState(null);
    const [isAddModalOpen, setIsAddModalOpen]     = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
    const [search, setSearch]                     = useState('');

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/groups');
            const data = await response.json();
            setGroups(Array.isArray(data) ? data : []);
        } catch (err) { setError(err?.message || 'Failed to load groups'); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const handleCreateGroup = async (groupData) => {
        try {
            await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(groupData) });
            setIsAddModalOpen(false); fetchGroups();
        } catch (err) { console.error('Failed to add group:', err); }
    };

    const handleDeleteGroup = async (e, id) => {
        e.stopPropagation();
        try { await fetch(`/api/groups/${id}`, { method: 'DELETE' }); fetchGroups(); }
        catch (err) { console.error('Failed to delete group:', err); }
    };

    const handleOpenDetailsModal = async (group) => {
        try {
            const response = await fetch(`/api/groups/${group.id}`);
            setSelectedGroupDetails(await response.json());
            setIsDetailsModalOpen(true);
        } catch (err) { console.error('Failed to fetch group details:', err); }
    };

    const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedGroupDetails(null); };

    const handleSaveGstInModal = async (groupId, newGst) => {
        try {
            await fetch(`/api/groups/${groupId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gst_percentage: newGst }) });
            handleCloseDetailsModal(); fetchGroups();
        } catch (err) { console.error('Failed to update GST from modal:', err); }
    };

    /* filtered list */
    const filtered = groups.filter(g =>
        g.hsn_code?.toLowerCase().includes(search.toLowerCase())
    );

    const totalItems = groups.reduce((s, g) => s + (g.itemCount || 0), 0);
    const maxItems   = Math.max(...groups.map(g => g.itemCount || 0), 1);

    return (
        <div className="gp-root">
            <style>{css}</style>

            {/* ── Top bar ── */}
            <div className="gp-topbar">
                <div className="gp-search-wrap">
                    <span className="gp-search-icon"><IcSearch /></span>
                    <input
                        className="gp-search"
                        placeholder="Search HSN code…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="gp-add-btn" onClick={() => setIsAddModalOpen(true)}>
                    <IcPlus /> Add New Group
                </button>
            </div>

            {/* ── Summary pills ── */}
            {!loading && !error && (
                <div className="gp-summary">
                    <div className="gp-sum-pill">
                        <span className="gp-sum-val">{groups.length}</span>
                        <span className="gp-sum-lbl">Total Groups</span>
                    </div>
                    <div className="gp-sum-pill">
                        <span className="gp-sum-val">{totalItems}</span>
                        <span className="gp-sum-lbl">Total Items</span>
                    </div>
                    <div className="gp-sum-pill">
                        <span className="gp-sum-val">{[...new Set(groups.map(g => g.gst_percentage))].length}</span>
                        <span className="gp-sum-lbl">GST Slabs</span>
                    </div>
                </div>
            )}

            {/* ── Cards grid ── */}
            <div className="gp-grid">
                {loading
                    ? [1,2,3,4,5,6,7,8].map(i => <SkelCard key={i} />)
                    : error
                        ? <div className="gp-empty"><div className="gp-empty-icon">⚠️</div><div style={{ color: '#ef4444' }}>{error}</div></div>
                        : filtered.length === 0
                            ? <div className="gp-empty">
                                <div className="gp-empty-icon">🔍</div>
                                <div style={{ fontWeight: 600, color: '#0f1f17', marginBottom: 6 }}>No groups found</div>
                                <div style={{ fontSize: 13 }}>Try a different search term</div>
                              </div>
                            : filtered.map((group, idx) => {
                                const c = gstColor(group.gst_percentage);
                                const barPct = Math.round(((group.itemCount || 0) / maxItems) * 100);
                                return (
                                    <div
                                        key={group.id}
                                        className="gp-card"
                                        style={{ animationDelay: `${idx * 0.04}s` }}
                                        onClick={() => handleOpenDetailsModal(group)}
                                    >
                                        {/* Accent bar */}
                                        <div className="gp-card-accent" style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.accent}88)` }} />

                                        {/* Body */}
                                        <div className="gp-card-body">
                                            <div className="gp-hsn-label">HSN Code</div>
                                            <div className="gp-hsn-code">{group.hsn_code}</div>

                                            {/* GST badge */}
                                            <div className="gp-gst-badge" style={{ background: c.badge, color: c.text }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.accent, display: 'inline-block' }} />
                                                GST {group.gst_percentage}%
                                            </div>

                                            {/* Item count + mini bar */}
                                            <div className="gp-item-row">
                                                <div className="gp-item-count">
                                                    <span className="gp-item-dot" />
                                                    {group.itemCount || 0} item{group.itemCount !== 1 ? 's' : ''}
                                                </div>
                                                <div className="gp-item-bar-wrap">
                                                    <div className="gp-item-bar" style={{ width: `${barPct}%`, background: `linear-gradient(90deg, ${c.accent}, ${c.accent}88)` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="gp-card-footer" onClick={e => e.stopPropagation()}>
                                            <span className="gp-edit-hint">
                                                <IcEdit /> Click to edit
                                            </span>
                                            <button
                                                className="gp-del-btn"
                                                onClick={(e) => handleDeleteGroup(e, group.id)}
                                                title="Delete group"
                                            >
                                                <IcTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                }
            </div>

            <AddGroupModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleCreateGroup} />
            <GroupModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} onSaveGst={handleSaveGstInModal} groupDetails={selectedGroupDetails} />
        </div>
    );
};

export default GroupsPage;