import React from 'react';

// A reusable component for the dashboard summary cards
const DashboardCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
        <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
        <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
);

const DashboardPage = () => {
    // In the future, this data will come from your database
    const recentItems = [
        { id: 1, name: 'Paracetamol 500mg', batch: 'PC123', stock: 100, price: 5.50 },
        { id: 2, name: 'Amoxicillin 250mg', batch: 'AMX456', stock: 50, price: 12.75 },
    ];

    return (
        // The padding here has been reduced from p-6 to p-4
        <div className="p-4 space-y-8">
            {/* Top row of summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Total Medicine" value="0" color="text-green-500" />
                <DashboardCard title="Pending Invoices" value="0" color="text-yellow-500" />
                <DashboardCard title="Low Stock Items" value="0" color="text-red-500" />
            </div>

            {/* Recently Added Products Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recently Added Products</h2>
                <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="text-left p-3 font-semibold text-gray-600">Product Name</th>
                                <th className="text-left p-3 font-semibold text-gray-600">Batch No.</th>
                                <th className="text-right p-3 font-semibold text-gray-600">Stock Qty</th>
                                <th className="text-right p-3 font-semibold text-gray-600">MRP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentItems.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3">{item.batch}</td>
                                    <td className="p-3 text-right">{item.stock}</td>
                                    <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
