import React, { useState } from 'react';
import AddItemModal from '../components/AddItemModal';

const ItemsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState([
        // Sample data that will be replaced by your database
        { id: 1, name: 'Paracetamol 500mg', batch: 'PC123', expiry: '2025-12-31', stock: 100, price: 5.50 },
        { id: 2, name: 'Amoxicillin 250mg', batch: 'AMX456', expiry: '2026-06-30', stock: 50, price: 12.75 },
        { id: 3, name: 'Ibuprofen 200mg', batch: 'IBU789', expiry: '2024-10-31', stock: 200, price: 8.00 },
    ]);

    const handleAddItem = (newItem) => {
        // Later, this will save to the database. For now, it just updates the local state.
        console.log("New item to add:", newItem);
        setItems(prevItems => [...prevItems, { ...newItem, id: Date.now() }]);
    };

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Item Master</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ backgroundColor: '#31708E' }}
                    className="text-white px-6 py-2 rounded-md shadow hover:opacity-90 transition-opacity"
                >
                    Add New Item
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="text-left p-3 font-semibold text-gray-600">Item Name</th>
                            <th className="text-left p-3 font-semibold text-gray-600">Batch No.</th>
                            <th className="text-left p-3 font-semibold text-gray-600">Expiry Date</th>
                            <th className="text-right p-3 font-semibold text-gray-600">Stock</th>
                            <th className="text-right p-3 font-semibold text-gray-600">Price</th>
                            <th className="text-center p-3 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.batch}</td>
                                <td className="p-3">{item.expiry}</td>
                                <td className="p-3 text-right">{item.stock}</td>
                                <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                    <button className="text-blue-600 hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AddItemModal 
                    onClose={() => setIsModalOpen(false)} 
                    onAddItem={handleAddItem}
                />
            )}
        </div>
    );
};

export default ItemsPage;
