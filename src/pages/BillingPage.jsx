import React, { useState, useEffect, useRef } from 'react';
import useDatabase from '../hooks/useDatabase';

// Printable Bill Component (hidden by default)
const PrintableBill = React.forwardRef(({ billItems, patientName, billDate, totals, invoiceNumber }, ref) => {
    return (
        <div ref={ref} className="print-area p-10 hidden">
            <h2 className="text-center text-3xl font-bold mb-2">Pharmacy Invoice</h2>
            <p className="text-center text-gray-600">123 Health St, Wellness City</p>
            <hr className="my-6" />
            <div className="flex justify-between mb-6">
                <div>
                    <p className="font-bold">Bill To:</p>
                    <p>{patientName || 'Walk-in Customer'}</p>
                </div>
                <div>
                    <p><span className="font-bold">Bill Number:</span> <span>{invoiceNumber}</span></p>
                    <p><span className="font-bold">Date:</span> <span>{new Date(billDate).toLocaleDateString()}</span></p>
                </div>
            </div>
            <table className="min-w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Medicine</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Qty</th>
                        <th className="py-2 text-left text-sm font-semibold text-gray-900">Rate</th>
                        <th className="py-2 text-right text-sm font-semibold text-gray-900">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {billItems.map(item => (
                         <tr key={item.id}>
                            <td className="py-2">{item.name}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">₹{item.price.toFixed(2)}</td>
                            <td className="py-2 text-right">₹{item.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3" className="py-2 pt-4 text-right font-medium">Subtotal</td>
                        <td className="py-2 pt-4 text-right font-semibold">₹{totals.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="py-2 text-right font-medium">GST (5%)</td>
                        <td className="py-2 text-right font-semibold">₹{totals.gst.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="py-2 text-right font-bold text-lg">Grand Total</td>
                        <td className="py-2 text-right font-bold text-lg">₹{totals.grandTotal.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <p className="text-center text-sm text-gray-500 mt-8">Thank you for your business!</p>
        </div>
    );
});

const BillingPage = () => {
    const { searchMedicines, createInvoice, generateInvoiceNumber, loading, error } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [billItems, setBillItems] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [totals, setTotals] = useState({ subtotal: 0, gst: 0, grandTotal: 0 });
    const printRef = useRef();
    const printableComponentRef = useRef();

    // Generate invoice number on component mount
    useEffect(() => {
        const getInvoiceNumber = async () => {
            const number = await generateInvoiceNumber();
            setInvoiceNumber(number);
        };
        getInvoiceNumber();
    }, []);

    // Calculate totals whenever bill items change
    useEffect(() => {
        const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
        const gst = subtotal * 0.05;
        const grandTotal = subtotal + gst;
        setTotals({ subtotal, gst, grandTotal });
    }, [billItems]);

    // Filter medicines based on search term
    useEffect(() => {
        const filterMedicines = async () => {
            if (searchTerm.trim()) {
                const filtered = await searchMedicines(searchTerm);
                setFilteredMedicines(filtered);
                setShowSuggestions(true);
            } else {
                setFilteredMedicines([]);
                setShowSuggestions(false);
            }
            setSelectedMedicineIndex(-1);
        };
        
        const debounceTimer = setTimeout(filterMedicines, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchMedicines]);

    const handleSelectSuggestion = (med) => {
        setSelectedMedicineIndex(filteredMedicines.indexOf(med));
        setSearchTerm(med.name);
        setShowSuggestions(false);
    };

    const handleAddItem = () => {
        if (selectedMedicineIndex === -1 || !filteredMedicines[selectedMedicineIndex]) {
            alert("Please select a valid medicine.");
            return;
        }

        const med = filteredMedicines[selectedMedicineIndex];
        const existingItem = billItems.find(item => item.id === med.id);
        
        if (existingItem) {
            // Update quantity of existing item
            setBillItems(billItems.map(item =>
                item.id === med.id
                    ? { ...item, quantity: item.quantity + quantity, amount: (item.quantity + quantity) * item.price }
                    : item
            ));
        } else {
            // Add new item
            setBillItems([
                ...billItems,
                {
                    ...med,
                    quantity: quantity,
                    amount: med.price * quantity,
                },
            ]);
        }

        // Reset form fields
        setSearchTerm('');
        setSelectedMedicineIndex(-1);
        setQuantity(1);
    };

    const handleRemoveItem = (itemId) => {
        setBillItems(billItems.filter(item => item.id !== itemId));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveBill = async () => {
        if (billItems.length === 0) {
            alert('Please add items to the bill before saving.');
            return;
        }

        try {
            const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);
            const discount = 0;
            const tax = totalAmount * 0.05;
            const finalAmount = totalAmount - discount + tax;

            const invoiceData = {
                invoice_number: invoiceNumber,
                patient_name: patientName || 'Walk-in Customer',
                total_amount: totalAmount,
                discount: discount,
                tax: tax,
                final_amount: finalAmount,
                items: billItems.map(item => ({
                    medicine_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.amount
                }))
            };

            await createInvoice(invoiceData);
            alert('Invoice saved successfully!');
            
            // Reset form
            setBillItems([]);
            setPatientName('');
            setSearchTerm('');
            
            // Generate new invoice number
            const newNumber = await generateInvoiceNumber();
            setInvoiceNumber(newNumber);
        } catch (error) {
            alert('Failed to save invoice: ' + error.message);
        }
    };

    return (
        <>
            <style>{`
                .print-area { display: none; }
                @media print {
                    body > *:not(.print-area) { display: none; }
                    .print-area { display: block; position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
            <div className="w-full h-full">
                <div className="w-full">
                    <div className="w-full bg-white rounded-lg shadow-lg">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pharmacy Billing</h1>
                            <p className="text-sm text-gray-500 mt-1">Create and manage patient bills with database integration.</p>
                        </div>

                        {/* Patient Details */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    Error: {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter patient name (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date</label>
                                    <input
                                        type="date"
                                        value={billDate}
                                        onChange={(e) => setBillDate(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Medicine Entry Form */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                                <div className="sm:col-span-6 relative">
                                    <label htmlFor="medicineSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Medicine</label>
                                    <input 
                                        type="text" 
                                        id="medicineSearch" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                                        placeholder="Type to search..." 
                                        autoComplete="off"
                                    />
                                    {showSuggestions && filteredMedicines.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                            {filteredMedicines.map((med, index) => (
                                                <div 
                                                    key={med.id}
                                                    onClick={() => handleSelectSuggestion(med)}
                                                    className={`p-2 hover:bg-gray-200 cursor-pointer ${
                                                        index === selectedMedicineIndex ? 'bg-blue-100' : ''
                                                    }`}
                                                >
                                                    {med.name} - ₹{med.price.toFixed(2)} (Stock: {med.stock})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="sm:col-span-3">
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        id="quantity" 
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                        min="1" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <button onClick={handleAddItem} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bill Items Table */}
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Remove</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {billItems.length > 0 ? billItems.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{item.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₹{item.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-10 text-gray-500">No items added to the bill yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="p-6 bg-gray-50 rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="flex flex-col space-y-2">
                                <button 
                                    onClick={handleSaveBill}
                                    disabled={loading}
                                    className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 mr-2"
                                >
                                    {loading ? 'Saving...' : 'Save Invoice'}
                                </button>
                                <button onClick={handlePrint} className="w-full md:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                                    Print Bill
                                </button>
                            </div>
                            <div className="space-y-3 text-right">
                                <div className="flex justify-between items-center">
                                    <span className="text-md font-medium text-gray-600">Subtotal:</span>
                                    <span className="text-md font-semibold text-gray-900">₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-md font-medium text-gray-600">GST (5%):</span>
                                    <span className="text-md font-semibold text-gray-900">₹{totals.gst.toFixed(2)}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">Grand Total:</span>
                                    <span className="text-xl font-bold text-gray-900">₹{totals.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* This component is rendered but hidden. It's used only for printing. */}
            <PrintableBill ref={printableComponentRef} billItems={billItems} patientName={patientName} billDate={billDate} totals={totals} invoiceNumber={invoiceNumber} />
        </>
    );
}
