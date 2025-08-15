import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Modal for Add/Edit Party ---
const PartyModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', gstin: '' });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                phone: item.phone || '',
                address: item.address || '',
                gstin: item.gstin || ''
            });
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
            alert('Party name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Edit Party' : 'Add New Party'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">GSTIN</label>
                        <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{item ? 'Update' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PartiesPage = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState(null);

    const fetchParties = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getAllParties();
            setParties(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParties();
    }, [fetchParties]);

    const handleOpenModal = (party = null) => {
        setSelectedParty(party);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedParty(null);
    };

    const handleSave = async (partyData) => {
        try {
            if (selectedParty) {
                await window.electronAPI.updateParty(selectedParty.id, partyData);
            } else {
                await window.electronAPI.addParty(partyData);
            }
            fetchParties();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save party:", err);
            alert("Failed to save party. A party with this name may already exist.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this party?')) {
            try {
                await window.electronAPI.deleteParty(id);
                fetchParties();
            } catch (err) {
                console.error("Failed to delete party:", err);
                alert('Failed to delete party.');
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading parties...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow">
                    Add New Party
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Phone</th>
                            <th className="text-left p-3 font-semibold">Address</th>
                            <th className="text-left p-3 font-semibold">GSTIN</th>
                            <th className="text-center p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parties.map((party) => (
                            <tr key={party.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{party.name}</td>
                                <td className="p-3">{party.phone}</td>
                                <td className="p-3">{party.address}</td>
                                <td className="p-3">{party.gstin}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleOpenModal(party)} className="text-blue-600 hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(party.id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PartyModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={selectedParty} />
        </div>
    );
};

export default PartiesPage;
