import React, { useState, useEffect, useCallback } from 'react';

import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ItemsPage from './pages/ItemsPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import PartiesPage from './pages/PartiesPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import SalesHistoryPage from './pages/SalesHistoryPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import ManageEmployeesPage from './pages/ManageEmployeesPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';

/* ─────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────── */
const T = {
  brand:      '#0D6E4D',   // deep emerald
  brandLight: '#10B981',   // bright emerald accent
  brandGlow:  '#34D399',   // hover glow
  navBg:      'rgba(255,255,255,0.85)',
  railBg:     'rgba(255,255,255,0.75)',
  surface:    'rgba(255,255,255,0.92)',
  border:     'rgba(16,185,129,0.15)',
  borderMid:  'rgba(16,185,129,0.3)',
  textPrimary:'#0f1f17',
  textMuted:  '#6b7f74',
  pageBg1:    '#e8f5ee',
  pageBg2:    '#f0faf5',
  danger:     '#ef4444',
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES injected once
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body, #root {
      height: 100vh; width: 100vw; overflow: hidden;
      font-family: 'DM Sans', sans-serif;
      background: ${T.pageBg1};
    }

    /* Animated mesh background */
    .pharma-bg {
      position: fixed; inset: 0; z-index: 0; overflow: hidden;
      background:
        radial-gradient(ellipse 80% 60% at 10% 20%, rgba(16,185,129,0.13) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 90% 80%, rgba(13,110,77,0.10) 0%, transparent 55%),
        radial-gradient(ellipse 50% 50% at 50% 50%, rgba(52,211,153,0.06) 0%, transparent 70%),
        linear-gradient(160deg, #e4f5ed 0%, #f0faf5 40%, #e8f5ee 100%);
    }
    .pharma-bg::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        radial-gradient(circle 1px at 1px 1px, rgba(16,185,129,0.25) 0%, transparent 0%);
      background-size: 32px 32px;
      opacity: 0.5;
    }
    .pharma-bg::after {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      top: -200px; right: -150px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
      animation: pulse-bg 8s ease-in-out infinite;
    }
    @keyframes pulse-bg {
      0%, 100% { transform: scale(1) translate(0, 0); opacity: 1; }
      50%       { transform: scale(1.15) translate(20px, 30px); opacity: 0.7; }
    }

    /* Top Navbar */
    .top-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 60px;
      background: ${T.navBg};
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid ${T.border};
      display: flex; align-items: center;
      padding: 0 24px;
      gap: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(16,185,129,0.06);
    }

    /* Brand mark */
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; min-width: 200px;
    }
    .nav-brand-icon {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, ${T.brand}, ${T.brandLight});
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(16,185,129,0.35);
      flex-shrink: 0;
    }
    .nav-brand-name {
      font-size: 15px; font-weight: 600; color: ${T.textPrimary};
      letter-spacing: -0.3px; line-height: 1.1;
    }
    .nav-brand-sub {
      font-size: 10px; font-weight: 400; color: ${T.textMuted};
      letter-spacing: 0.5px; text-transform: uppercase;
    }

    /* Nav pill tabs */
    .nav-tabs {
      display: flex; align-items: center; gap: 2px;
      flex: 1; justify-content: center;
    }
    .nav-tab {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px;
      font-size: 13px; font-weight: 500; color: ${T.textMuted};
      cursor: pointer; border: none; background: transparent;
      transition: all 0.18s ease; white-space: nowrap;
      position: relative;
    }
    .nav-tab:hover {
      color: ${T.brand};
      background: rgba(16,185,129,0.07);
    }
    .nav-tab.active {
      color: ${T.brand};
      background: rgba(16,185,129,0.12);
      font-weight: 600;
    }
    .nav-tab.active::after {
      content: '';
      position: absolute; bottom: -2px; left: 20%; right: 20%; height: 2px;
      background: ${T.brandLight};
      border-radius: 2px;
    }

    /* Dropdown for nav items with submenus */
    .nav-tab-wrapper { position: relative; }
    .nav-dropdown {
      position: absolute; top: calc(100% + 10px); left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(24px);
      border: 1px solid ${T.border};
      border-radius: 14px;
      padding: 8px;
      min-width: 180px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(16,185,129,0.08);
      z-index: 200;
      animation: dropdown-in 0.15s ease;
    }
    @keyframes dropdown-in {
      from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .nav-dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 12px; border-radius: 8px;
      font-size: 13px; font-weight: 500; color: ${T.textMuted};
      cursor: pointer; border: none; background: transparent; width: 100%;
      transition: all 0.15s;
    }
    .nav-dropdown-item:hover { background: rgba(16,185,129,0.08); color: ${T.brand}; }
    .nav-dropdown-item.active { background: rgba(16,185,129,0.12); color: ${T.brand}; font-weight: 600; }
    .nav-dropdown-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(16,185,129,0.35); flex-shrink: 0;
    }
    .nav-dropdown-dot.active { background: ${T.brandLight}; }

    /* Right side of nav */
    .nav-right {
      display: flex; align-items: center; gap: 10px;
      min-width: 200px; justify-content: flex-end;
    }
    .nav-pill-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px;
      font-size: 12px; font-weight: 600;
      border: none; cursor: pointer;
      transition: all 0.18s;
    }
    .nav-pill-btn.primary {
      background: linear-gradient(135deg, ${T.brand}, ${T.brandLight});
      color: white;
      box-shadow: 0 2px 8px rgba(16,185,129,0.3);
    }
    .nav-pill-btn.primary:hover {
      box-shadow: 0 4px 16px rgba(16,185,129,0.45);
      transform: translateY(-1px);
    }
    .nav-icon-btn {
      width: 34px; height: 34px; border-radius: 9px;
      border: 1px solid ${T.border};
      background: rgba(255,255,255,0.7);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.18s; color: ${T.textMuted};
    }
    .nav-icon-btn:hover { border-color: ${T.brandLight}; color: ${T.brand}; background: rgba(16,185,129,0.06); }

    /* Avatar */
    .nav-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, ${T.brand}, ${T.brandGlow});
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: white;
      cursor: pointer; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(16,185,129,0.25);
    }

    /* Page body layout */
    .page-body {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      height: 100vh; overflow: hidden;
      padding-top: 60px;
    }

    /* Secondary subnav bar (breadcrumb / page title strip) */
    .subnav {
      display: flex; align-items: center; gap: 12px;
      padding: 0 28px;
      height: 52px;
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(16,185,129,0.10);
    }
    .subnav-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 20px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
      text-transform: uppercase;
      background: rgba(16,185,129,0.12);
      color: ${T.brand};
    }
    .subnav-title {
      font-size: 17px; font-weight: 600;
      color: ${T.textPrimary}; letter-spacing: -0.3px;
    }
    .subnav-sep {
      color: rgba(16,185,129,0.4); font-size: 16px; line-height: 1;
    }

    /* Main scroll area */
    .main-scroll {
      flex: 1; overflow-y: auto; padding: 28px;
    }
    .main-scroll::-webkit-scrollbar { width: 4px; }
    .main-scroll::-webkit-scrollbar-track { background: transparent; }
    .main-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 4px; }

    /* Chevron icon rotation */
    .chevron { transition: transform 0.2s ease; }
    .chevron.open { transform: rotate(180deg); }

    /* Divider */
    .nav-divider { width: 1px; height: 20px; background: ${T.border}; margin: 0 6px; }
  `}</style>
);

/* ─────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────── */
const Ic = {
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Sales: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Purchases: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Items: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Groups: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="6" height="10" rx="1"/><rect x="16" y="7" width="6" height="10" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/></svg>,
  Connections: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Reports: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Bell: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Plus: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Chevron: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Cross: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="20" rx="2" fill="white"/>
      <rect x="2" y="10" width="20" height="4" rx="2" fill="white"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   NAV DATA
───────────────────────────────────────────── */
const NAV = [
  { name: 'Dashboard', icon: Ic.Dashboard },
  { name: 'Sales',     icon: Ic.Sales,     sub: ['New Invoice', 'Sales History'] },
  { name: 'Purchases', icon: Ic.Purchases, sub: ['New Purchase Bill', 'Purchase History'] },
  { name: 'Items',     icon: Ic.Items },
  { name: 'Groups',    icon: Ic.Groups },
  { name: 'Connections', icon: Ic.Connections, sub: ['Clients', 'Suppliers', 'Employee'] },
  { name: 'Reports',   icon: Ic.Reports },
];

/* ─────────────────────────────────────────────
   TOP NAVBAR
───────────────────────────────────────────── */
const TopNav = ({ activePage, setActivePage, settings }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const activeParent = NAV.find(n =>
    n.name === activePage || n.sub?.includes(activePage)
  )?.name;

  const handleNavClick = (item) => {
    if (item.sub) {
      setOpenMenu(openMenu === item.name ? null : item.name);
    } else {
      setActivePage(item.name);
      setOpenMenu(null);
    }
  };

  const handleSubClick = (subName) => {
    setActivePage(subName);
    setOpenMenu(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <nav className="top-nav">
      {/* Brand */}
      <div className="nav-brand">
        <div className="nav-brand-icon"><Ic.Cross /></div>
        <div>
          <div className="nav-brand-name">{settings?.company_name || 'PharmaOS'}</div>
          <div className="nav-brand-sub">Management Suite</div>
        </div>
      </div>

      <div className="nav-divider" />

      {/* Nav tabs */}
      <div className="nav-tabs" onClick={e => e.stopPropagation()}>
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = activeParent === item.name;
          return (
            <div key={item.name} className="nav-tab-wrapper">
              <button
                className={`nav-tab${isActive ? ' active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <Icon />
                {item.name}
                {item.sub && (
                  <span className={`chevron${openMenu === item.name ? ' open' : ''}`}>
                    <Ic.Chevron />
                  </span>
                )}
              </button>

              {item.sub && openMenu === item.name && (
                <div className="nav-dropdown">
                  {item.sub.map(sub => (
                    <button
                      key={sub}
                      className={`nav-dropdown-item${activePage === sub ? ' active' : ''}`}
                      onClick={() => handleSubClick(sub)}
                    >
                      <span className={`nav-dropdown-dot${activePage === sub ? ' active' : ''}`} />
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="nav-divider" />

      {/* Right actions */}
      <div className="nav-right">
        <button className="nav-pill-btn primary" onClick={() => setActivePage('New Invoice')}>
          <Ic.Plus /> New Invoice
        </button>
        <button className="nav-icon-btn" title="Notifications"><Ic.Bell /></button>
        <button className="nav-icon-btn" onClick={() => setActivePage('Settings')} title="Settings">
          <Ic.Settings />
        </button>
        <div className="nav-avatar" title="Account">
          {(settings?.company_name || 'P').charAt(0).toUpperCase()}
        </div>
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────────
   SUB NAV (breadcrumb + page title)
───────────────────────────────────────────── */
const SubNav = ({ page }) => {
  const parent = NAV.find(n => n.sub?.includes(page));
  return (
    <div className="subnav">
      <span className="subnav-badge">Pharma</span>
      <span className="subnav-sep">›</span>
      {parent && (
        <>
          <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{parent.name}</span>
          <span className="subnav-sep">›</span>
        </>
      )}
      <span className="subnav-title">{page}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN CONTENT
───────────────────────────────────────────── */
const MainContent = ({ page, setActivePage, onSettingsUpdate }) => {
  const renderPage = () => {
    switch (page) {
      case 'Dashboard':       return <DashboardPage setActivePage={setActivePage} />;
      case 'Items':           return <ItemsPage />;
      case 'New Invoice':     return <BillingPage />;
      case 'Clients':         return <PartiesPage />;
      case 'Suppliers':       return <SuppliersPage />;
      case 'Sales History':   return <SalesHistoryPage />;
      case 'Reports':         return <EmployeesPage />;
      case 'Employee':        return <ManageEmployeesPage />;
      case 'Groups':          return <GroupsPage />;
      case 'Settings':        return <SettingsPage onSettingsUpdate={onSettingsUpdate} />;
      default:                return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: T.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Coming Soon</div>
        </div>
      );
    }
  };

  return (
    <div className="page-body">
      <SubNav page={page} />
      <div className="main-scroll">
        {renderPage()}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [settings, setSettings] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return (
    <>
      <GlobalStyles />
      <div className="pharma-bg" />
      <TopNav activePage={activePage} setActivePage={setActivePage} settings={settings} />
      <MainContent page={activePage} setActivePage={setActivePage} onSettingsUpdate={fetchSettings} />
    </>
  );
}