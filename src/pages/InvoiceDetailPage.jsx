import React, { useState, useEffect, useCallback } from 'react';

const InvoiceDetailPage = ({ invoiceId, setActivePage }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoiceDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getInvoiceDetails(invoiceId);
            setInvoice(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoiceDetails();
        }
    }, [invoiceId, fetchInvoiceDetails]);

    if (loading) return <div className="p-8 text-center">Loading invoice details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!invoice) return <div className="p-8 text-center">Invoice not found.</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <button onClick={() => setActivePage('Sales History')} className="mb-6 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
                &larr; Back to Sales History
            </button>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
                        <p className="text-gray-500">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Billed To:</h2>
                        <p>{invoice.client_name}</p>
                        <p>{invoice.client_address}</p>
                        <p>{invoice.client_phone}</p>
                    </div>
                </div>
                <table className="w-full table-auto mb-6">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left p-2">Item</th>
                            <th className="text-center p-2">Qty</th>
                            <th className="text-center p-2">Free</th>
                            <th className="text-right p-2">Rate</th>
                            <th className="text-right p-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{item.medicine_name}</td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-center">{item.free_quantity}</td>
                                <td className="p-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                                <td className="p-2 text-right">₹{item.total_price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end">
                    <div className="w-1/3">
                        <div className="flex justify-between"><span className="font-semibold">Subtotal:</span><span>₹{invoice.total_amount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="font-semibold">Tax:</span><span>₹{invoice.tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-xl mt-2"><span >Total:</span><span>₹{invoice.final_amount.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
