import React, { useState, useEffect, useRef } from 'react';
import useDatabase from '../hooks/useDatabase'; // Make sure this path is correct

// Helper component for printing
const PrintableBill = React.forwardRef(({ billItems, patientName, billDate, totals }, ref) => {
    // This component remains unchanged.
    return (
        <div ref={ref} className="hidden print:block p-10">
            <h2 className="text-center text-3xl font-bold mb-2">Pharmacy Invoice</h2>
            <p className="text-center text-gray-600">123 Health St, Wellness City</p>
            <hr className="my-6" />
            <div className="flex justify-between mb-6">
                <div>
                    <p className="font-bold">Bill To:</p>
                    <p>{patientName || 'N/A'}</p>
                </div>
                <div>
                    <p><span className="font-bold">Bill Number:</span> <span>{`INV-${Date.now()}`}</span></p>
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


// The main component for the billing/invoice page
const BillingPage = () => {
    // --- DATABASE STATE ---
    // Use your custom hook to fetch live data.
    const { data: medicines, loading, error } = useDatabase('SELECT * FROM items');

    // --- COMPONENT STATE ---
    const [patientName, setPatientName] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [billItems, setBillItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, gst: 0, grandTotal: 0 });
    
    // --- REFS ---
    const printableComponentRef = useRef();
    const searchInputRef = useRef();
    const suggestionsRef = useRef();

    // --- EFFECTS ---

    // Effect to calculate totals when bill items change
    useEffect(() => {
        const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
        const gst = subtotal * 0.05;
        const grandTotal = subtotal + gst;
        setTotals({ subtotal, gst, grandTotal });
    }, [billItems]);

    // **FIXED**: Effect to handle search suggestions using live DB data
    useEffect(() => {
        if (searchQuery.length > 0 && medicines) {
            const filteredMeds = medicines.filter(med =>
                med.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filteredMeds);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, medicines]); // Dependency array now includes 'medicines'
    
    // Effect to close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- HANDLERS ---

    const handleSelectSuggestion = (med) => {
        setSelectedMedicine(med);
        setSearchQuery(med.name);
        setSuggestions([]);
        searchInputRef.current.focus();
    };

    const handleAddItem = () => {
        // This logic remains largely the same
        if (!selectedMedicine || !quantity || Number(quantity) <= 0) {
            alert("Please select a valid medicine and quantity.");
            return;
        }
        setBillItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === selectedMedicine.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === selectedMedicine.id
                        ? { ...item, quantity: item.quantity + Number(quantity), amount: (item.quantity + Number(quantity)) * item.price }
                        : item
                );
            } else {
                return [...prevItems, { ...selectedMedicine, quantity: Number(quantity), amount: selectedMedicine.price * Number(quantity) }];
            }
        });
        setSearchQuery('');
        setSelectedMedicine(null);
        setQuantity(1);
        searchInputRef.current.focus();
    };

    const handleRemoveItem = (itemId) => {
        setBillItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handlePrint = () => {
        // This logic remains unchanged
        const printContent = printableComponentRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Print Bill</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { font-family: 'Inter', sans-serif; }</style>
                </head>
                <body>${printContent}</body>
            </html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { 
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // --- RENDER LOGIC ---
    
    // Handle loading and error states from the database
    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading medicines...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full"><p className="text-red-500">Error fetching data: {error.message}</p></div>;
    }

    return (
        <>
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                        <input type="text" id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., Jane Doe" />
                    </div>
                    <div>
                        <label htmlFor="billDate" className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                        <input type="date" id="billDate" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        <div className="sm:col-span-6 relative">
                            <label htmlFor="medicineSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Medicine</label>
                            <input type="text" id="medicineSearch" ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Type to search..." autoComplete="off" />
                            {suggestions.length > 0 && (
                                <div ref={suggestionsRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {suggestions.map(med => <div key={med.id} onClick={() => handleSelectSuggestion(med)} className="p-2 hover:bg-gray-200 cursor-pointer">{med.name} - ₹{med.price.toFixed(2)}</div>)}
                                </div>
                            )}
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>
                        <div className="sm:col-span-3">
                            <button onClick={handleAddItem} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">Add Item</button>
                        </div>
                    </div>
                </div>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900">Remove</button></td>
                                    </tr>
                                )) : (<tr><td colSpan="6" className="text-center py-10 text-gray-500">No items added to the bill yet.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col space-y-2">
                        <button onClick={handlePrint} className="w-full md:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">Print Bill</button>
                    </div>
                    <div className="space-y-3 text-right">
                        <div className="flex justify-between items-center"><span className="text-md font-medium text-gray-600">Subtotal:</span><span className="text-md font-semibold text-gray-900">₹{totals.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-md font-medium text-gray-600">GST (5%):</span><span className="text-md font-semibold text-gray-900">₹{totals.gst.toFixed(2)}</span></div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center"><span className="text-xl font-bold text-gray-900">Grand Total:</span><span className="text-xl font-bold text-gray-900">₹{totals.grandTotal.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
            <PrintableBill ref={printableComponentRef} billItems={billItems} patientName={patientName} billDate={billDate} totals={totals} />
        </>
    );
};

export default BillingPage;
