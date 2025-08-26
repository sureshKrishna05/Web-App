import React, { useState, useEffect, useCallback } from 'react';

const SalesHistoryPage = ({ setActivePage, setSelectedInvoiceId }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getAllInvoicesWithClients();
            setInvoices(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleViewDetails = (id) => {
        setSelectedInvoiceId(id);
        setActivePage('Invoice Details');
    };

    if (loading) return <div className="p-8 text-center">Loading sales history...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales History</h1>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left p-3 font-semibold">Invoice #</th>
                            <th className="text-left p-3 font-semibold">Client Name</th>
                            <th className="text-left p-3 font-semibold">Date</th>
                            <th className="text-right p-3 font-semibold">Amount</th>
                            <th className="text-center p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{invoice.invoice_number}</td>
                                <td className="p-3">{invoice.client_name || 'N/A'}</td>
                                <td className="p-3">{new Date(invoice.created_at).toLocaleDateString()}</td>
                                <td className="p-3 text-right">₹{invoice.final_amount.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleViewDetails(invoice.id)} className="text-blue-600 hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesHistoryPage;
