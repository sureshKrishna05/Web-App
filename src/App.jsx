import React, { useState, useEffect } from 'react';

// --- Import the real page components ---
import DashboardPage from './pages/DashboardPage';
//import SettingsPage from './pages/SettingsPage';
import ItemsPage from './pages/ItemsPage';
import BillingPage from './pages/BillingPage';
import PartiesPage from './pages/PartiesPage';
import SuppliersPage from './pages/SuppliersPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import EmployeesPage from './pages/EmployeesPage';
import ManageEmployeesPage from './pages/ManageEmployeesPage';
//import PlaceholderPage from './pages/PlaceholderPage';

// --- Icon Components (No change) ---
const IconDashboard = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const IconSales = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>;
const IconPurchases = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>;
const IconItems = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"></path></svg>;
const IconParties = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const IconReports = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const IconSettings = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const IconCollapse = () => <svg className="w-6 h-6 flex-shrink-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>;
const IconChevronDown = () => <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const IconLogo = () => <svg className="h-10 w-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4"/><path d="M30 70V30L50 50L70 30V70L50 50L30 70Z" stroke="white" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/></svg>;

// --- Data for Navigation (No change) ---
const navItems = [
    { name: 'Dashboard', icon: <IconDashboard /> },
    { name: 'Sales', icon: <IconSales />, submenu: [{ name: 'New Invoice' }, { name: 'Sales History' }] },
    { name: 'Purchases', icon: <IconPurchases />, submenu: [{ name: 'New Purchase Bill' }, { name: 'Purchase History' }] },
    { name: 'Items', icon: <IconItems /> },
    { name: 'Connections', icon: <IconParties />, submenu: [{ name: 'Clients'}, {name: 'Suppliers'}, {name: 'Employee'}]},
    { name: 'Reports', icon: <IconReports /> },
];

// --- Sidebar Component (No change) ---
const Sidebar = ({ activePage, setActivePage }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({});
    useEffect(() => { if (isCollapsed) setOpenSubmenus({}); }, [isCollapsed]);
    const handleToggleSubmenu = (menuName) => { if (!isCollapsed) setOpenSubmenus(prev => ({ ...prev, [menuName]: !prev[menuName] })); };
    return (
        <nav className={`flex flex-col text-white transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-64'}`} style={{ backgroundColor: '#31708E' }}>
            <div className="flex items-center p-4 border-b border-white/10 h-[65px] overflow-hidden">
                <div className="flex-shrink-0"><IconLogo /></div>
                {!isCollapsed && (<div className="ml-3 whitespace-nowrap"><p className="font-bold text-lg">Matrix Life Science</p><p className="text-xs text-gray-300">Tvs Tolgate, Trichy</p></div>)}
            </div>
            <ul className="flex flex-col p-2 space-y-1 flex-grow overflow-y-auto">
                {navItems.map((item) => (
                    <li key={item.name}>
                        {item.submenu ? (
                            <>
                                <button onClick={() => handleToggleSubmenu(item.name)} className="w-full flex items-center justify-between p-3 rounded-md hover:bg-white/10 transition-colors text-left">
                                    <span className="flex items-center">{item.icon}{!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}</span>
                                    {!isCollapsed && <IconChevronDown className={`transition-transform ${openSubmenus[item.name] ? 'rotate-180' : ''}`} />}
                                </button>
                                <ul className={`overflow-hidden transition-all duration-300 ease-in-out ${openSubmenus[item.name] ? 'max-h-40' : 'max-h-0'}`}>
                                    {item.submenu.map(subItem => (<li key={subItem.name}><a href="#" onClick={(e) => { e.preventDefault(); setActivePage(subItem.name); }} className={`flex items-center p-2 rounded-md hover:bg-white/10 transition-colors ml-6 ${activePage === subItem.name ? 'bg-white/10' : ''}`}>{!isCollapsed && <span className="whitespace-nowrap text-sm">{subItem.name}</span>}</a></li>))}
                                </ul>
                            </>
                        ) : (<a href="#" onClick={(e) => { e.preventDefault(); setActivePage(item.name); }} className={`flex items-center p-3 rounded-md hover:bg-white/10 transition-colors ${activePage === item.name ? 'bg-white/10' : ''}`}>{item.icon}{!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}</a>)}
                    </li>
                ))}
            </ul>
            <div className="p-2 border-t border-white/10">
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('Settings'); }} className={`flex items-center w-full p-3 rounded-md hover:bg-white/10 transition-colors ${activePage === 'Settings' ? 'bg-white/10' : ''}`}><IconSettings />{!isCollapsed && <span className="ml-3 whitespace-nowrap">Settings</span>}</a>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center w-full p-3 rounded-md hover:bg-white/10 transition-colors"><IconCollapse className={isCollapsed ? 'rotate-180' : ''}/>{!isCollapsed && <span className="ml-3 whitespace-nowrap">Collapse</span>}</button>
            </div>
        </nav>
    );
};

// --- UPDATED: MainContent Component ---
const MainContent = ({ page, setActivePage }) => {
    const renderPage = () => {
        switch (page) {
            case 'Dashboard': return <DashboardPage setActivePage={setActivePage} />;
            case 'Settings': return <div/>; /* Placeholder for SettingsPage */
            case 'Items': return <ItemsPage />;
            case 'New Invoice': return <BillingPage />;
            case 'Clients': return <PartiesPage />;
            case 'Suppliers': return <SuppliersPage />;
            case 'Sales History': return <SalesHistoryPage/>;
            case 'Reports': return <EmployeesPage/>;
            case 'Employee': return <ManageEmployeesPage/>;
            default: return <div>Page not found: {page}</div>;
        }
    };
    return (
        <main className="flex-1 overflow-auto bg-[#E9E9E9] p-6">
            <h1 className="text-3xl font-bold text-gray-800">{page}</h1>
            <div className="border-b-2 border-gray-300 mt-2 mb-6"></div>
            {renderPage()}
        </main>
    );
};

// --- Main App Component (UPDATED) ---
export default function App() {
    const [activePage, setActivePage] = useState('Dashboard');
    return (
        <div className="flex flex-row h-screen w-screen overflow-hidden">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <MainContent page={activePage} setActivePage={setActivePage} />
        </div>
    );
}

