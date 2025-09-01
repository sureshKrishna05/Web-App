import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Icon Components ---
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

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
            console.error('Party name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Edit Client' : 'Add New Client'}</h2>
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
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{item ? 'Update' : 'Save'}</button>
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
        }
    };

    const handleDelete = async (id) => {
        // Using console.log for a non-blocking confirmation
        console.log(`Are you sure you want to delete client ID ${id}? This action cannot be undone.`);
        try {
            await window.electronAPI.deleteParty(id);
            fetchParties();
        } catch (err) {
            console.error("Failed to delete party:", err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading clients...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800"></h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md">
                    <IconPlus />
                    Add New Client
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">GSTIN</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parties.map((party) => (
                                <tr key={party.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{party.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.gstin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-4">
                                            <button onClick={() => handleOpenModal(party)} className="text-blue-600 hover:text-blue-900 transition-colors"><IconEdit /></button>
                                            <button onClick={() => handleDelete(party.id)} className="text-red-600 hover:text-red-900 transition-colors"><IconDelete /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <PartyModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={selectedParty} />
        </div>
    );
};

export default PartiesPage;
