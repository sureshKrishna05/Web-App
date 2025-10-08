import React, { useState, useEffect, useCallback, useRef } from 'react';

const BillingPage = () => {
    // --- STATE for data and UI ---
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

    const [highlightedClientIndex, setHighlightedClientIndex] = useState(-1);
    const [highlightedMedicineIndex, setHighlightedMedicineIndex] = useState(-1);

    const clientInputRef = useRef(null);
    const medicineInputRef = useRef(null);
    const ptrInputRef = useRef(null);
    const quantityInputRef = useRef(null);
    const addItemButtonRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                let response = await fetch('/api/invoices/new-number');
                let data = await response.json();
                setInvoiceNumber(data.invoiceNumber);

                response = await fetch('/api/sales-reps');
                data = await response.json();
                setSalesReps(data);
            } catch(e) {
                console.error("Failed to fetch initial data", e);
            }
        };
        fetchInitialData();
    }, []);

    const handleClientSearch = useCallback(async (query) => {
        setClientSearch(query);
        setSelectedClient(null);
        setHighlightedClientIndex(-1);
        if (query.length > 1) {
            const response = await fetch(`/api/parties/search?term=${query}`);
            const results = await response.json();
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
        setHighlightedClientIndex(-1);
        medicineInputRef.current.focus();
    };

    const handleSaveNewClient = async () => {
        if (!clientSearch.trim()) {
            console.error("Please enter a client name before saving.");
            return;
        }
        try {
            const response = await fetch('/api/parties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clientSearch.trim(), ...newClientDetails })
            });
            const newParty = await response.json();
            
            if (newParty) {
                handleSelectClient(newParty);
            }
        } catch (error) {
            console.error("Failed to save new client:", error);
        }
    };
    
    const handleMedicineSearch = useCallback(async (query) => {
        setMedicineSearch(query);
        setHighlightedMedicineIndex(-1);
        if (query.length > 1) {
            const response = await fetch(`/api/medicines/search?term=${query}`);
            const results = await response.json();
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
            available_stock: med.stock,
            gst_percentage: med.gst_percentage
        });
        setMedicineSuggestions([]);
        setHighlightedMedicineIndex(-1);
        ptrInputRef.current.focus();
    };
    
    const handleAddItem = () => {
        if (!selectedMedicine) { console.error("No medicine selected"); return; }
        
        const newItem = {
            ...selectedMedicine,
            ...itemDetails,
            price: Number(itemDetails.ptr),
            quantity: Number(itemDetails.quantity)
        };
        setBillItems(prev => [...prev, newItem]);

        setMedicineSearch('');
        setSelectedMedicine(null);
        setItemDetails({ hsn: '', batch_number: '', expiry_date: '', ptr: '', quantity: 1, available_stock: '' });
        medicineInputRef.current.focus();
    };

    const handleRemoveItem = (index) => {
        setBillItems(items => items.filter((_, i) => i !== index));
    };

    const handleClientKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedClientIndex(prev => (prev + 1) % clientSuggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedClientIndex(prev => (prev - 1 + clientSuggestions.length) % clientSuggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedClientIndex > -1) {
                handleSelectClient(clientSuggestions[highlightedClientIndex]);
            }
        }
    };

    const handleMedicineKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedMedicineIndex(prev => (prev + 1) % medicineSuggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedMedicineIndex(prev => (prev - 1 + medicineSuggestions.length) % medicineSuggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedMedicineIndex > -1) {
                handleSelectMedicine(medicineSuggestions[highlightedMedicineIndex]);
            }
        }
    };
    
    const handleGenericKeyDown = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef.current.focus();
        }
    };

    useEffect(() => {
        const subtotal = billItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalTax = billItems.reduce((acc, item) => {
            const itemTotal = item.price * item.quantity;
            const taxForItem = itemTotal * ((item.gst_percentage || 0) / 100);
            return acc + taxForItem;
        }, 0);
        const finalAmount = Math.round(subtotal + totalTax);
        setTotals({ subtotal, tax: totalTax, finalAmount });
    }, [billItems]);

    const resetForm = async () => {
        setClientSearch(''); 
        setSelectedClient(null); 
        setBillItems([]); 
        setPaymentMode('Credit'); 
        setSelectedRepId('');
        const response = await fetch('/api/invoices/new-number');
        const data = await response.json();
        setInvoiceNumber(data.invoiceNumber);
    };

    const handleSaveInvoice = async (status) => {
        if (!clientSearch.trim() || billItems.length === 0 || isNewClient || !selectedClient) {
            console.error("Form is incomplete. Check client and items.");
            return;
        }

        const invoiceData = {
            invoice_number: invoiceNumber,
            client_id: selectedClient?.id,
            client_name: selectedClient?.name || clientSearch,
            sales_rep_id: selectedRepId || null,
            total_amount: totals.subtotal,
            tax: totals.tax,
            final_amount: totals.finalAmount,
            payment_mode: paymentMode,
            status: status,
            items: billItems.map(item => ({ medicine_id: item.id, name: item.name, hsn: item.hsn, batch_number: item.batch_number, quantity: item.quantity, free_quantity: 0, unit_price: item.price, ptr: item.ptr, total_price: item.price * item.quantity }))
        };
        
        try {
            await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });
            // We can't trigger a print dialog from here, but the invoice is saved.
            // A better UX would be to open the generated PDF in a new tab.
            alert(`Invoice ${status} saved successfully!`);
            resetForm();
        } catch (error) {
            console.error("Failed to save invoice:", error);
        }
    };

    return (
        <div className="p-0">
            <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                        <label className="text-sm font-medium">Client</label>
                        <input type="text" ref={clientInputRef} value={clientSearch} onChange={(e) => handleClientSearch(e.target.value)} onKeyDown={handleClientKeyDown} className="w-full p-2 border rounded"/>
                        {clientSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg">
                                {clientSuggestions.map((c, index) => <div key={c.id} onClick={() => handleSelectClient(c)} className={`p-2 cursor-pointer ${index === highlightedClientIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>{c.name}</div>)}
                            </div>
                        )}
                        {selectedClient && <div className="text-xs text-gray-500 mt-1">GSTIN: {selectedClient.gstin} | Phone: {selectedClient.phone}</div>}
                    </div>
                    <div><label className="text-sm font-medium">Invoice Number</label><input type="text" value={invoiceNumber} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-sm font-medium">Invoice Date</label><input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full p-2 border rounded"/></div>
                </div>

                {isNewClient && (
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded border-blue-200 bg-blue-50 items-end">
                        <div><label className="text-xs">Phone</label><input type="text" placeholder="Phone" value={newClientDetails.phone} onChange={e => setNewClientDetails({...newClientDetails, phone: e.target.value})} className="p-2 border rounded w-full"/></div>
                        <div><label className="text-xs">GSTIN</label><input type="text" placeholder="GSTIN" value={newClientDetails.gstin} onChange={e => setNewClientDetails({...newClientDetails, gstin: e.target.value})} className="p-2 border rounded w-full"/></div>
                        <div><label className="text-xs">Address</label><input type="text" placeholder="Address" value={newClientDetails.address} onChange={e => setNewClientDetails({...newClientDetails, address: e.target.value})} className="p-2 border rounded w-full"/></div>
                        <button onClick={handleSaveNewClient} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 h-10">Save Client</button>
                    </div>
                )}
                
                <div className="grid grid-cols-9 gap-2 items-end p-2 border-t mt-4">
                    <div className="col-span-2 relative"><label className="text-xs">Select Medicine</label><input type="text" ref={medicineInputRef} value={medicineSearch} onChange={e => handleMedicineSearch(e.target.value)} onKeyDown={handleMedicineKeyDown} className="w-full p-2 border rounded"/>
                        {medicineSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {medicineSuggestions.map((m, index) => <div key={m.id} onClick={() => handleSelectMedicine(m)} className={`p-2 cursor-pointer ${index === highlightedMedicineIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>{m.name}</div>)}
                            </div>
                        )}
                    </div>
                    <div><label className="text-xs">HSN</label><input type="text" value={itemDetails.hsn} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">Batch No</label><input type="text" value={itemDetails.batch_number} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">Expiry</label><input type="text" value={itemDetails.expiry_date} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><label className="text-xs">PTR</label><input type="number" ref={ptrInputRef} value={itemDetails.ptr} onChange={e => setItemDetails({...itemDetails, ptr: e.target.value})} onKeyDown={(e) => handleGenericKeyDown(e, quantityInputRef)} className="w-full p-2 border rounded"/></div>
                    <div><label className="text-xs">Qty</label><input type="number" ref={quantityInputRef} value={itemDetails.quantity} onChange={e => setItemDetails({...itemDetails, quantity: e.target.value})} onKeyDown={(e) => handleGenericKeyDown(e, addItemButtonRef)} className="w-full p-2 border rounded"/></div>
                    <div><label className="text-xs">Available</label><input type="text" value={itemDetails.available_stock} readOnly className="w-full p-2 border rounded bg-gray-100"/></div>
                    <div><button ref={addItemButtonRef} onClick={handleAddItem} onKeyDown={(e) => {if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); }}} className="w-full bg-green-500 text-white p-2 rounded">Add</button></div>
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
                    <button onClick={() => handleSaveInvoice('Estimate')} className="bg-gray-600 text-white px-4 py-2 rounded">Save & Print Estimate</button>
                    <button onClick={() => handleSaveInvoice('Completed')} className="bg-blue-600 text-white px-4 py-2 rounded">Save & Print Invoice</button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
