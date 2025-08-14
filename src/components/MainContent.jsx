import React from 'react';
import DashboardPage from '../pages/DashboardPage';
import SettingsPage from '../pages/SettingsPage';
import ItemsPage from '../pages/ItemsPage'; 
import BillingPage from '../pages/BillingPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import PartiesPage from '../pages/PartiesPage';

const MainContent = ({ page }) => {
    const renderPage = () => {
        switch (page) {
            case 'Dashboard':
                return <DashboardPage />;
            case 'Settings':
                return <SettingsPage />;
            case 'Items': 
                return <ItemsPage />;
            case 'Billing':
                    return <BillingPage />;
            case 'Parties':
                    return <PartiesPage />;
            default:
                // All other pages will still use the placeholder for now
                return <PlaceholderPage pageName={page} />;
        }
    };

    return (
        <main className="flex-1 overflow-auto bg-[#E9E9E9]">
            {/* The page itself now handles its own title and layout */}
            {renderPage()}
        </main>
    );
};

export default MainContent;
