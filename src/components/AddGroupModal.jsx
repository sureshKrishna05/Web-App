import React, { useState, useEffect } from 'react';

const AddGroupModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        hsn_code: '',
        gst_percentage: '',
        measure: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset form when modal opens
        if (isOpen) {
            setFormData({ hsn_code: '', gst_percentage: '', measure: '' });
            setError('');
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { hsn_code, gst_percentage, measure } = formData;
        if (!hsn_code.trim() || gst_percentage.trim() === '') {
            setError('Please fill out HSN Code and GST Percentage.');
            return;
        }
        
        const gst = parseFloat(gst_percentage);
        if (isNaN(gst) || gst < 0 || gst > 100) {
            setError('Please enter a valid GST percentage (0-100).');
            return;
        }

        setError('');
        onSave({ 
            hsn_code: hsn_code.trim(), 
            gst_percentage: gst,
            measure: measure.trim() 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Group</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">HSN Code</label>
                        <input type="text" name="hsn_code" value={formData.hsn_code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">GST Percentage (%)</label>
                        <input type="number" step="0.01" min="0" max="100" name="gst_percentage" value={formData.gst_percentage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Measure (e.g., mg, ml, box)</label>
                        <input type="text" name="measure" value={formData.measure} onChange={handleChange} placeholder="Optional scaling unit" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Save Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGroupModal;
