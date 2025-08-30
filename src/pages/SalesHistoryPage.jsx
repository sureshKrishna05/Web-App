import React, { useState, useEffect, useCallback } from 'react';

const SalesHistoryPage = ({ setActivePage, setSelectedInvoiceId }) => {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [reps, setReps] = useState([]);
    const [filters, setFilters] = useState({
        clientId: '',
        repId: '',
        month: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch clients and reps for filter dropdowns
    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const clientsData = await window.electronAPI.getAllParties();
                const repsData = await window.electronAPI.getAllSalesReps();
                setClients(clientsData);
                setReps(repsData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFiltersData();
    }, []);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getFilteredInvoices(filters);
            setInvoices(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleViewDetails = (id) => {
        setSelectedInvoiceId(id);
        setActivePage('Invoice Details');
    };

    const handleExport = async (format) => {
        const invoiceIds = invoices.map(inv => inv.id);
        if (invoiceIds.length === 0) {
            console.log("No invoices to export.");
            return;
        }
        try {
            let result;
            if (format === 'csv') {
                result = await window.electronAPI.exportInvoicesToCSV(invoiceIds);
            } else if (format === 'xlsx') {
                result = await window.electronAPI.exportInvoicesToXLSX(invoiceIds);
            }

            if (result.success) {
                console.log(`Successfully exported to ${result.path}`);
            } else {
                console.error('Export failed:', result.message);
            }
        } catch (err) {
            console.error('An error occurred during export:', err);
        }
    };

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales History</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium">Filter by Client</label>
                        <select name="clientId" value={filters.clientId} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Filter by Representative</label>
                        <select name="repId" value={filters.repId} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">All Reps</option>
                            {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Filter by Month</label>
                        <input type="month" name="month" value={filters.month} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleExport('csv')} className="w-full bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700">
                            Export CSV
                        </button>
                        <button onClick={() => handleExport('xlsx')} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700">
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center">Loading invoices...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Error: {error}</div>
                ) : (
                    <table className="w-full table-auto">
                        <thead className="border-b-2">
                            <tr>
                                <th className="text-left p-3 font-semibold">Invoice #</th>
                                <th className="text-left p-3 font-semibold">Client Name</th>
                                <th className="text-left p-3 font-semibold">Rep Name</th>
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
                                    <td className="p-3">{invoice.rep_name || 'N/A'}</td>
                                    <td className="p-3">{new Date(invoice.created_at).toLocaleDateString()}</td>
                                    <td className="p-3 text-right">₹{invoice.final_amount.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleViewDetails(invoice.id)} className="text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesHistoryPage;

