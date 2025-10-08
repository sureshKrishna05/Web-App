import React, { useState, useEffect, useCallback } from 'react';
import ExportModal from '../components/ExportModal';

const SalesHistoryPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [reps, setReps] = useState([]);
    const [filters, setFilters] = useState({
        clientId: '',
        repId: '',
        month: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [clientsRes, repsRes] = await Promise.all([
                    fetch('/api/parties'),
                    fetch('/api/sales-reps')
                ]);
                const clientsData = await clientsRes.json();
                const repsData = await repsRes.json();
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
            const response = await fetch('/api/invoices/filtered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            const data = await response.json();
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
    
    const handleExport = (format) => {
        setIsExportModalOpen(false);
        console.log(`Exporting to ${format}...`);
        // This functionality would need a backend endpoint similar to PDF download.
    };

    const handleDownload = async (invoiceId) => {
        try {
            const response = await fetch('/api/download-invoice-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const contentDisposition = response.headers.get('content-disposition');
                let filename = `invoice-${invoiceId}.pdf`;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch.length === 2)
                        filename = filenameMatch[1];
                }
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Failed to download PDF');
            }
        } catch (err) {
            console.error('An error occurred during download:', err);
        }
    };


    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <select name="clientId" value={filters.clientId} onChange={handleFilterChange} className="w-full p-2 border rounded">
                        <option value="">All Clients</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="repId" value={filters.repId} onChange={handleFilterChange} className="w-full p-2 border rounded">
                        <option value="">All Reps</option>
                        {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <input type="month" name="month" value={filters.month} onChange={handleFilterChange} className="w-full p-2 border rounded"/>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded">
                        <option value="">All Statuses</option>
                        <option value="Estimate">Estimate</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button onClick={() => setIsExportModalOpen(true)} className="bg-gray-700 text-white px-4 py-2 rounded-md shadow hover:bg-gray-800">
                        Export List
                    </button>
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
                                <th className="text-left p-3 font-semibold">Status</th>
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
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            invoice.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">₹{invoice.final_amount.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => handleDownload(invoice.id)} 
                                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow hover:bg-blue-700"
                                        >
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <ExportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
            />
        </div>
    );
};

export default SalesHistoryPage;
