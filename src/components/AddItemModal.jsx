 import React, { useState, useEffect } from 'react';

const AddItemModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        name: '',
        hsn: '',
        item_code: '',
        batch_number: '',
        expiry_date: '',
        price: '',
        stock: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            // EDIT MODE: Pre-fill form with existing item data
            setFormData({
                name: item.name || '',
                hsn: item.hsn || '',
                item_code: item.item_code || '',
                batch_number: item.batch_number || '',
                expiry_date: item.expiry_date || '',
                price: item.price || '',
                stock: item.stock || ''
            });
        } else {
            // ADD MODE: Clear the form for a new entry
            setFormData({
                name: '', hsn: '', item_code: '', batch_number: '',
                expiry_date: '', price: '', stock: ''
            });
        }
    }, [item, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.price || !formData.stock) {
            setError('Please fill out all required fields: Name, Price, and Stock.');
            return;
        }
        setError('');
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#31708E' }}>
                    {item ? 'Edit Item' : 'Add New Item'}
                </h2>
                <div className="border-b-2 border-gray-300 mb-6"></div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">HSN Number</label>
                                <input type="text" name="hsn" value={formData.hsn} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            {/* Item Code is now only shown when editing an existing item */}
                            {item && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Item Code</label>
                                    <input type="text" name="item_code" value={formData.item_code} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                                </div>
                            )}
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Batch No.</label>
                                <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Close
                        </button>
                        <button type="submit" style={{ backgroundColor: '#31708E' }} className="px-6 py-2 text-white rounded-md hover:opacity-90">
                            {item ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;
