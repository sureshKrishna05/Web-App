import React, { useState, useEffect, useCallback } from 'react';
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

// --- Reusable Modal for Add/Edit Supplier ---
const SupplierModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', gstin: '' });

    useEffect(() => {
        if (item) {
            setFormData({ name: item.name, phone: item.phone || '', address: item.address || '', gstin: item.gstin || '' });
        } else {
            setFormData({ name: '', phone: '', address: '', gstin: '' });
        }
    }, [item, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Supplier name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">GSTIN</label>
                        <input
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            {item ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/suppliers');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setSuppliers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleOpenModal = (supplier = null) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSupplier(null);
    };

    const handleSave = async (supplierData) => {
        try {
            const url = selectedSupplier ? `/api/suppliers/${selectedSupplier.id}` : '/api/suppliers';
            const method = selectedSupplier ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });
            fetchSuppliers();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save supplier:", err);
            setError("Failed to save supplier. A supplier with this name may already exist.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
                fetchSuppliers();
            } catch (err) {
                console.error("Failed to delete supplier:", err);
                setError('Failed to delete supplier.');
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading suppliers...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800"></h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md">
                    <IconPlus />
                    Add New Supplier
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Phone</th>
                            <th className="text-left p-3 font-semibold">Address</th>
                            <th className="text-center p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{supplier.name}</td>
                                <td className="p-3">{supplier.phone}</td>
                                <td className="p-3">{supplier.address}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleOpenModal(supplier)}
                                        className="text-blue-600 hover:underline mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <SupplierModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                item={selectedSupplier}
            />
        </div>
    );
};

export default SuppliersPage;