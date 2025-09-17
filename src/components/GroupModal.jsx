import React, { useState, useEffect } from 'react';

const GroupModal = ({ isOpen, onClose, onSaveGst, groupDetails }) => {
    const [gst, setGst] = useState('');

    useEffect(() => {
        if (groupDetails) {
            setGst(groupDetails.gst_percentage);
        }
    }, [groupDetails]);

    if (!isOpen || !groupDetails) return null;

    const handleSave = () => {
        const parsedGst = parseFloat(gst);
        if (!isNaN(parsedGst) && parsedGst >= 0 && parsedGst <= 100) {
            onSaveGst(groupDetails.id, parsedGst);
        } else {
            // Handle invalid input, maybe show an error
            console.error("Invalid GST value");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Group Details: {groupDetails.hsn_code}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Medicines List */}
                    <div>
                        <h3 className="font-semibold mb-2">Items in this Group ({groupDetails.medicines.length})</h3>
                        <div className="bg-gray-50 border rounded-md p-2 h-48 overflow-y-auto">
                            {groupDetails.medicines.length > 0 ? (
                                <ul>
                                    {groupDetails.medicines.map(med => (
                                        <li key={med.id} className="text-sm py-1">{med.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No items have been assigned to this group yet.</p>
                            )}
                        </div>
                    </div>

                    {/* GST Settings */}
                    <div>
                        <h3 className="font-semibold mb-2">Group GST Setting</h3>
                        <label className="block text-sm font-medium text-gray-700">GST Percentage (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={gst}
                            onChange={(e) => setGst(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                         <button 
                            onClick={handleSave} 
                            className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        >
                            Save GST Change
                        </button>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;

