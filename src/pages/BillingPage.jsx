import React, { useState, useEffect, useRef, useCallback } from 'react';

const PrintableBill = React.forwardRef(({ billItems, client, invoiceNumber, totals, paymentMode }, ref) => {
    // This component remains the same
    return (
        <div ref={ref} className="hidden print:block p-10 font-sans text-sm">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Matrix Life Science</h1>
                <p>Tvs Tolgate, Trichy</p>
            </div>
            <div className="flex justify-between mb-4 border-b pb-2">
                <div>
                    <p className="font-bold">Bill To:</p>
                    <p>{client?.name || 'N/A'}</p>
                    <p>{client?.address || ''}</p>
                    <p>{client?.phone || ''}</p>
                    <p>GSTIN: {client?.gstin || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">Invoice #:</span> {invoiceNumber}</p>
                    <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-bold">Payment Mode:</span> {paymentMode}</p>
                </div>
            </div>
            <table className="min-w-full">
                <thead>
                    <tr className="border-b">
                        <th className="py-2 text-left font-semibold">Medicine</th>
                        <th className="py-2 text-left font-semibold">HSN</th>
                        <th className="py-2 text-left font-semibold">Batch No</th>
                        <th className="py-2 text-left font-semibold">Expiry</th>
                        <th className="py-2 text-right font-semibold">Qty</th>
                        <th className="py-2 text-right font-semibold">Rate</th>
                        <th className="py-2 text-right font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {billItems.map((item, index) => (
                         <tr key={`${item.id}-${index}`} className="border-b">
                            <td className="py-1">{item.name}</td>
                            <td className="py-1">{item.hsn}</td>
                            <td className="py-1">{item.batch_number}</td>
                            <td className="py-1">{item.expiry_date}</td>
                            <td className="py-1 text-right">{item.quantity}</td>
                            <td className="py-1 text-right">₹{item.price.toFixed(2)}</td>
                            <td className="py-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-end mt-4">
                <div className="w-1/3 space-y-1">
                    <div className="flex justify-between"><span className="font-medium">Subtotal:</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Tax:</span><span>₹{totals.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span >Final Total:</span><span>₹{totals.finalAmount.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
});


const BillingPage = () => {
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [isNewClient, setIsNewClient] = useState(false);
    const [newClientDetails, setNewClientDetails] = useState({ phone: '', address: '', gstin: '' });
    
    const [salesReps, setSalesReps] = useState([]);
    const [selectedRepId, setSelectedRepId] = useState('');

    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
    
    const [medicineSuggestions, setMedicineSuggestions] = useState([]);
    const [medicineSearch, setMedicineSearch] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [itemDetails, setItemDetails] = useState({ hsn: '', batch_number: '', expiry_date: '', ptr: '', quantity: 1, available_stock: '' });

    const [billItems, setBillItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, finalAmount: 0 });
    const [paymentMode, setPaymentMode] = useState('Credit');

    const printableComponentRef = useRef();

    useEffect(() => {
        const fetchInitialData = async () => {
            const newInvoiceNum = await window.electronAPI.generateInvoiceNumber();
            setInvoiceNumber(newInvoiceNum);
            const repsData = await window.electronAPI.getAllSalesReps();
            setSalesReps(repsData);
        };
        fetchInitialData();
    }, []);

    const handleClientSearch = useCallback(async (query) => {
        setClientSearch(query);
        setSelectedClient(null);
        if (query.length > 1) {
            const results = await window.electronAPI.searchParties(query);
            setClientSuggestions(results);
            setIsNewClient(results.length === 0);
        } else {
            setClientSuggestions([]);
            setIsNewClient(false);
        }
    }, []);

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setClientSearch(client.name);
        setClientSuggestions([]);
        setIsNewClient(false);
    };
    
    const handleMedicineSearch = useCallback(async (query) => {
        setMedicineSearch(query);
        if (query.length > 1) {
            const results = await window.electronAPI.searchMedicines(query);
            setMedicineSuggestions(results);
        } else {
            setMedicineSuggestions([]);
        }
    }, []);

    const handleSelectMedicine = (med) => {
        setSelectedMedicine(med);
        setMedicineSearch(med.name);
        setItemDetails({
            hsn: med.hsn || '',
            batch_number: med.batch_number || '',
            expiry_date: med.expiry_date || '',
            ptr: med.price || '',
            quantity: 1,
            available_stock: med.stock
        });
        setMedicineSuggestions([]);
    };
    
    const handleAddItem = () => {
        if (!selectedMedicine) { console.error("No medicine selected"); return; }
        
        const newItem = {
            ...selectedMedicine,
            ...itemDetails,
            price: Number(itemDetails.ptr), // Use the editable PTR as the final price
            quantity: Number(itemDetails.quantity)
        };
        setBillItems(prev => [...prev, newItem]);

        setMedicineSearch('');
        setSelectedMedicine(null);
        setItemDetails({ hsn: '', batch_number: '', expiry_date: '', ptr: '', quantity: 1, available_stock: '' });
    };

    const handleRemoveItem = (index) => {
        setBillItems(items => items.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const subtotal = billItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05; // 5% GST
        const finalAmount = Math.round(subtotal + tax);
        setTotals({ subtotal, tax, finalAmount });
    }, [billItems]);

    const handleSaveInvoice = async (status) => {
        if (!clientSearch.trim()) { console.error("Client name is required"); return; }
        if (billItems.length === 0) { console.error("No items in bill"); return; }

        let clientId = selectedClient?.id;
        if (isNewClient) {
            const newParty = await window.electronAPI.addParty({ name: clientSearch, ...newClientDetails });
            clientId = newParty.id;
        }

        const invoiceData = {
            invoice_number: invoiceNumber,
            client_id: clientId,
            sales_rep_id: selectedRepId || null,
            total_amount: totals.subtotal,
            tax: totals.tax,
            final_amount: totals.finalAmount,
            payment_mode: paymentMode,
            status: status,
            items: billItems.map(item => ({
                medicine_id: item.id,
                hsn: item.hsn,
                quantity: item.quantity,
                free_quantity: 0,
                unit_price: item.price,
                ptr: item.ptr,
                total_price: item.price * item.quantity
            }))
        };
        
        try {
            await window.electronAPI.createInvoice(invoiceData);
            if (status === 'Completed') {
                handlePrint();
            }
            // Reset form
            setClientSearch(''); setSelectedClient(null); setBillItems([]); setPaymentMode('Credit'); setSelectedRepId('');
            const newNum = await window.electronAPI.generateInvoiceNumber();
            setInvoiceNumber(newNum);
        } catch (error) {
            console.error("Failed to save invoice:", error);
        }
    };
    
    const handlePrint = () => {
        setTimeout(() => window.print(), 500);
    };

    return (
        <div className="p-0"> {/* Changed padding to 0 */}
            <div className="bg-white rounded-lg p-6"> {/* Removed shadow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                        <label className="text-sm font-medium">Client</label>
                        <input type="text" value={clientSearch} onChange={(e) => handleClientSearch(e.target.value)} className="w-full p-2 border rounded"/>
                        {clientSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg">
                                {clientSuggestions.map(c => <div key={c.id} onClick={() => handleSelectClient(c)} className="p-2 hover:bg-gray-100 cursor-pointer">{c.name}</div>)}
                            </div>
                        )}
                        {selectedClient && <div className="text-xs text-gray-500 mt-1">GSTIN: {selectedClient.gstin} | Phone: {selectedClient.phone}</div>}
                    </div>
                    <div><label className="text-sm font-medium">Invoice Number</label><input type="text" value={invoiceNumber} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-sm font-medium">Invoice Date</label><input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full p-2 border rounded"/></div>
                </div>

                {isNewClient && (
                     <div className="grid grid-cols-3 gap-4 mb-4 p-4 border rounded border-blue-200 bg-blue-50">
                        <input type="text" placeholder="Phone" value={newClientDetails.phone} onChange={e => setNewClientDetails({...newClientDetails, phone: e.target.value})} className="p-2 border rounded"/>
                        <input type="text" placeholder="GSTIN" value={newClientDetails.gstin} onChange={e => setNewClientDetails({...newClientDetails, gstin: e.target.value})} className="p-2 border rounded"/>
                        <input type="text" placeholder="Address" value={newClientDetails.address} onChange={e => setNewClientDetails({...newClientDetails, address: e.target.value})} className="p-2 border rounded"/>
                    </div>
                )}
                
                <div className="grid grid-cols-9 gap-2 items-end p-2 border-t mt-4">
                    <div className="col-span-2 relative"><label className="text-xs">Select Medicine</label><input type="text" value={medicineSearch} onChange={e => handleMedicineSearch(e.target.value)} className="w-full p-2 border rounded"/>
                        {medicineSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {medicineSuggestions.map(m => <div key={m.id} onClick={() => handleSelectMedicine(m)} className="p-2 hover:bg-gray-100 cursor-pointer">{m.name}</div>)}
                            </div>
                        )}
                    </div>
                    <div><label className="text-xs">HSN</label><input type="text" value={itemDetails.hsn} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">Batch No</label><input type="text" value={itemDetails.batch_number} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">Expiry</label><input type="text" value={itemDetails.expiry_date} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">PTR</label><input type="number" value={itemDetails.ptr} onChange={e => setItemDetails({...itemDetails, ptr: e.target.value})} className="w-full p-2 border rounded"/></div>
                    <div><label className="text-xs">Qty</label><input type="number" value={itemDetails.quantity} onChange={e => setItemDetails({...itemDetails, quantity: e.target.value})} className="w-full p-2 border rounded"/></div>
                    <div><label className="text-xs">Available</label><input type="text" value={itemDetails.available_stock} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><button onClick={handleAddItem} className="w-full bg-green-500 text-white p-2 rounded">Add</button></div>
                </div>

                <table className="w-full mt-4 text-sm">
                    <thead><tr className="border-b"><th className="p-1 text-left">MEDICINE</th><th className="p-1 text-left">HSN</th><th className="p-1 text-left">BATCH NO</th><th className="p-1 text-right">QTY</th><th className="p-1 text-right">RATE</th><th className="p-1 text-right">AMOUNT</th><th className="p-1"></th></tr></thead>
                    <tbody>
                        {billItems.map((item, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50"><td className="p-1">{item.name}</td><td className="p-1">{item.hsn}</td><td className="p-1">{item.batch_number}</td><td className="p-1 text-right">{item.quantity}</td><td className="p-1 text-right">₹{item.price.toFixed(2)}</td><td className="p-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td><td className="p-1 text-center"><button onClick={() => handleRemoveItem(i)} className="text-red-500">X</button></td></tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Payment Mode</label>
                            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full p-2 border rounded">
                                <option>Credit</option><option>Cash</option><option>Online</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Sales Representative</label>
                            <select value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)} className="w-full p-2 border rounded">
                                <option value="">None</option>
                                {salesReps.map(rep => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="w-1/3 text-right space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax (GST):</span><span>₹{totals.tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Final Total:</span><span>₹{totals.finalAmount.toFixed(2)}</span></div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => handleSaveInvoice('Draft')} className="bg-gray-600 text-white px-4 py-2 rounded">Save Draft</button>
                    <button onClick={() => handleSaveInvoice('Completed')} className="bg-blue-600 text-white px-4 py-2 rounded">Save & Print</button>
                </div>
            </div>
            <div className="hidden print:block">
                <PrintableBill ref={printableComponentRef} billItems={billItems} client={selectedClient} invoiceNumber={invoiceNumber} totals={totals} paymentMode={paymentMode} />
            </div>
        </div>
    );
};

export default BillingPage;

