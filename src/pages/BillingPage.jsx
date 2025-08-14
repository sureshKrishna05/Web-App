import React, { useState, useEffect, useRef, useCallback } from 'react';

// (Your PrintableBill component can remain unchanged)
const PrintableBill = React.forwardRef(({ billItems, clientName, invoiceNumber, totals }, ref) => {
    return (
        <div ref={ref} className="hidden print:block p-10">
            <h2 className="text-center text-3xl font-bold mb-2">Pharmacy Invoice</h2>
            <p className="text-center text-gray-600">Matrix Life Science, Tvs Tolgate, Trichy</p>
            <hr className="my-6" />
            <div className="flex justify-between mb-6">
                <div>
                    <p className="font-bold">Bill To:</p>
                    <p>{clientName || 'N/A'}</p>
                </div>
                <div>
                    <p><span className="font-bold">Invoice Number:</span> <span>{invoiceNumber}</span></p>
                    <p><span className="font-bold">Date:</span> <span>{new Date().toLocaleDateString()}</span></p>
                </div>
            </div>
            <table className="min-w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Medicine</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Qty</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Free</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">PTR</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Rate</th>
                        <th className="py-2 text-right text-sm font-semibold text-gray-900">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {billItems.map((item, index) => (
                         <tr key={`${item.id}-${index}`}>
                            <td className="py-2">{item.name}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{item.free_quantity}</td>
                            <td className="py-2">₹{item.ptr.toFixed(2)}</td>
                            <td className="py-2">₹{item.price.toFixed(2)}</td>
                            <td className="py-2 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="5" className="py-2 pt-4 text-right font-medium">Subtotal</td>
                        <td className="py-2 pt-4 text-right font-semibold">₹{totals.subtotal.toFixed(2)}</td>
                    </tr>
                     <tr>
                        <td colSpan="5" className="py-2 text-right font-medium">Tax (GST {totals.gstRate}%)</td>
                        <td className="py-2 text-right font-semibold">₹{totals.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan="5" className="py-2 text-right font-bold text-lg">Grand Total</td>
                        <td className="py-2 text-right font-bold text-lg">₹{totals.finalAmount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <p className="text-center text-sm text-gray-500 mt-8">Thank you for your business!</p>
        </div>
    );
});


const BillingPage = () => {
    // --- State for new client features ---
    const [isNewClient, setIsNewClient] = useState(false);
    const [newClientDetails, setNewClientDetails] = useState({ phone: '', address: '', GSTIN: '' });
    const [clientSuggestions, setClientSuggestions] = useState([]);
    
    // --- State for existing features ---
    const [salesReps, setSalesReps] = useState([]);
    const [clientName, setClientName] = useState('');
    const [salesRepId, setSalesRepId] = useState('');
    const [gstRate, setGstRate] = useState(5);
    const [ptr, setPtr] = useState('');
    const [freeQuantity, setFreeQuantity] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [medicineSuggestions, setMedicineSuggestions] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [billItems, setBillItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, finalAmount: 0, gstRate: 5 });
    const [invoiceNumber, setInvoiceNumber] = useState('');
    
    const printableComponentRef = useRef();
    const quantityInputRef = useRef();

    // --- Data Fetching ---
    useEffect(() => {
        const fetchReps = async () => {
            const fetchedReps = await window.electronAPI.getAllSalesReps();
            setSalesReps(fetchedReps);
        };
        fetchReps();
    }, []);

    const fetchInvoiceNumber = useCallback(async () => {
        const newInvoiceNum = await window.electronAPI.generateInvoiceNumber();
        setInvoiceNumber(newInvoiceNum);
    }, []);

    useEffect(() => {
        fetchInvoiceNumber();
    }, [fetchInvoiceNumber]);
    
    // --- Client Search Logic ---
    const handleClientSearch = useCallback(async (query) => {
        setClientName(query);
        if (query.length > 0) {
            const results = await window.electronAPI.searchParties(query);
            setClientSuggestions(results);
            const exactMatch = results.find(c => c.name.toLowerCase() === query.toLowerCase());
            setIsNewClient(!exactMatch);
        } else {
            setClientSuggestions([]);
            setIsNewClient(false);
        }
    }, []);

    const handleSelectClient = (name) => {
        setClientName(name);
        setClientSuggestions([]);
        setIsNewClient(false);
    };

    // --- New Client Details Handler ---
    const handleNewClientChange = (e) => {
        const { name, value } = e.target;
        setNewClientDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewClient = async () => {
        if (!clientName) {
            alert("Please enter a name for the new client.");
            return;
        }
        try {
            const newParty = { name: clientName, ...newClientDetails };
            await window.electronAPI.addParty(newParty);
            alert(`Client "${clientName}" saved successfully!`);
            setIsNewClient(false);
        } catch (error) {
            console.error("Failed to save new client:", error);
            alert("Failed to save client. A client with this name may already exist.");
        }
    };
    
    // --- Other Handlers & Effects ---
    useEffect(() => {
        const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * (gstRate / 100);
        const finalAmount = subtotal + tax;
        setTotals({ subtotal, tax, finalAmount, gstRate });
    }, [billItems, gstRate]);

    const handleMedicineSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const results = await window.electronAPI.searchMedicines(query);
            setMedicineSuggestions(results);
        } else {
            setMedicineSuggestions([]);
        }
    }, []);

    const handleSelectMedicine = (med) => {
        setSelectedMedicine(med);
        setSearchQuery(med.name);
        setMedicineSuggestions([]);
        quantityInputRef.current?.focus();
    };

    const handleAddItem = () => {
        if (!selectedMedicine || !quantity || Number(quantity) < 0) {
            alert("Please select a valid medicine and quantity."); return;
        }
        const totalStockNeeded = Number(quantity) + Number(freeQuantity || 0);
        if (totalStockNeeded > selectedMedicine.stock) {
            alert(`Cannot add item. Only ${selectedMedicine.stock} units are in stock.`); return;
        }
        const newItem = { ...selectedMedicine, quantity: Number(quantity), free_quantity: Number(freeQuantity || 0), ptr: Number(ptr || 0) };
        setBillItems(prevItems => [...prevItems, newItem]);
        setSearchQuery(''); setSelectedMedicine(null); setQuantity(1); setFreeQuantity(''); setPtr('');
    };

    const handleRemoveItem = (indexToRemove) => {
        setBillItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
    };

    const resetForm = useCallback(async () => {
        setClientName(''); setSalesRepId(''); setBillItems([]); setGstRate(5); setIsNewClient(false); setNewClientDetails({ phone: '', address: '', GSTIN: '' });
        fetchInvoiceNumber();
    }, [fetchInvoiceNumber]);

    const handleSaveInvoice = async () => {
        if (billItems.length === 0 || !clientName) {
            alert("Please enter a client name and add items."); return;
        }
        const invoiceData = {
            invoice_number: invoiceNumber, party_name: clientName, sales_rep_id: salesRepId,
            total_amount: totals.subtotal, tax: totals.tax, final_amount: totals.finalAmount,
            items: billItems.map(item => ({
                medicine_id: item.id, quantity: item.quantity, free_quantity: item.free_quantity,
                unit_price: item.price, ptr: item.ptr, total_price: item.price * item.quantity
            }))
        };
        try {
            await window.electronAPI.createInvoice(invoiceData);
            alert(`Invoice ${invoiceNumber} saved successfully!`);
            handlePrint(); resetForm();
        } catch (error) {
            console.error("Failed to save invoice:", error); alert("Error saving invoice.");
        }
    };

    const handlePrint = () => {
        const printContent = printableComponentRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Print Invoice</title><script src="https://cdn.tailwindcss.com"></script></head><body>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    };

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Select or Enter Client Name</label>
                        <input type="text" value={clientName} onChange={(e) => handleClientSearch(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        {clientSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {clientSuggestions.map(client => <div key={client.id} onClick={() => handleSelectClient(client.name)} className="p-2 hover:bg-gray-100 cursor-pointer">{client.name}</div>)}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sales Representative</label>
                        <select value={salesRepId} onChange={(e) => setSalesRepId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Select Representative</option>
                            {salesReps.map(rep => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total GST (%)</label>
                        <input type="number" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                </div>

                {isNewClient && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 transition-all duration-300">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" name="address" value={newClientDetails.address} onChange={handleNewClientChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact No</label>
                            <input type="text" name="phone" value={newClientDetails.phone} onChange={handleNewClientChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                           <input type="text" name="GSTIN" value={newClientDetails.GSTIN} onChange={handleNewClientChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="col-span-full text-right">
                           <button onClick={handleSaveNewClient} className="bg-blue-600 text-white py-2 px-4 rounded-md shadow">Save New Client</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-4 items-end border-t pt-6">
                    <div className="col-span-4 relative">
                        <label className="block text-sm font-medium text-gray-700">Select Medicine</label>
                        <input type="text" value={searchQuery} onChange={(e) => handleMedicineSearch(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" autoComplete="off" />
                        {medicineSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {medicineSuggestions.map(med => <div key={med.id} onClick={() => handleSelectMedicine(med)} className="p-2 hover:bg-gray-100 cursor-pointer">{med.name} (Stock: {med.stock})</div>)}
                            </div>
                        )}
                    </div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">P.T.R.</label><input type="number" value={ptr} onChange={(e) => setPtr(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Quantity</label><input ref={quantityInputRef} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Free</label><input type="number" value={freeQuantity} onChange={(e) => setFreeQuantity(e.target.value)} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div className="col-span-2"><button onClick={handleAddItem} className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow">Add to Invoice</button></div>
                </div>

                <div className="mt-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Free</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {billItems.map((item, index) => (
                                <tr key={`${item.id}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.free_quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">₹{item.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t">
                    <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between"><span className="font-medium">Subtotal:</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="font-medium">Tax (GST {totals.gstRate}%):</span><span>₹{totals.tax.toFixed(2)}</span></div>
                         <div className="flex justify-between text-lg font-bold"><span >Grand Total:</span><span>₹{totals.finalAmount.toFixed(2)}</span></div>
                         <button onClick={handleSaveInvoice} className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700" style={{ backgroundColor: '#31708E' }}>Save & Print Invoice</button>
                    </div>
                </div>
            </div>
            <div className="hidden">
                 <PrintableBill ref={printableComponentRef} billItems={billItems} clientName={clientName} invoiceNumber={invoiceNumber} totals={totals} />
            </div>
        </div>
    );
};

export default BillingPage;
