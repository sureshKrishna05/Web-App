import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Icon Components ---
const IconMedicine = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconInvoice = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const StatCard = ({ title, value, icon, colorClass, onClick }) => (
    <button onClick={onClick} className={`w-full text-left bg-white p-6 rounded-lg shadow-md flex items-center ${colorClass} transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
        <div className="p-4 rounded-full bg-white bg-opacity-30">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    </button>
);


const DashboardPage = ({ setActivePage }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard-stats');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Items" 
                    value={stats?.totalMedicines ?? 0}
                    icon={<IconMedicine />}
                    colorClass="bg-blue-100 border-l-4 border-blue-500"
                    onClick={() => setActivePage('Items')}
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats?.lowStockItems ?? 0}
                    icon={<IconWarning />}
                    colorClass="bg-yellow-100 border-l-4 border-yellow-500"
                    onClick={() => setActivePage('Items')}
                />
                <StatCard 
                    title="Total Invoices" 
                    value={stats?.totalInvoices ?? 0}
                    icon={<IconInvoice />}
                    colorClass="bg-green-100 border-l-4 border-green-500"
                    onClick={() => setActivePage('Sales History')}
                />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Medicines</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats?.recentMedicines?.length > 0 ? (
                                stats.recentMedicines.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-gray-500">No recent items to display.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
