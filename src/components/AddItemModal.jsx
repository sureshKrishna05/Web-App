import React, { useState } from 'react';

const AddItemModal = ({ onClose, onAddItem }) => {
    const [formData, setFormData] = useState({
        name: '',
        batch: '',
        expiry: '',
        stock: '',
        price: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddItem(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#31708E' }}>Add New Item</h2>
                <div className="border-b-2 border-gray-300 mb-6"></div>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Batch No.</label>
                                <input type="text" name="batch" value={formData.batch} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" name="expiry" value={formData.expiry} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Close
                        </button>
                        <button type="submit" style={{ backgroundColor: '#31708E' }} className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;
