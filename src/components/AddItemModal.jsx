import React, { useState, useEffect, useMemo } from 'react';

const AddItemModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        name: '',
        hsn: '',
        item_code: '',
        batch_number: '',
        expiry_date: '',
        price: '',
        stock: '',
        gst_percentage: ''
    });

    const [groups, setGroups] = useState([]);
    const [selectedGroupHsn, setSelectedGroupHsn] = useState('');
    const [isGstEditable, setIsGstEditable] = useState(true);
    const [error, setError] = useState('');

    const sortedGroups = useMemo(() => {
        return [...groups].sort((a, b) => String(a.hsn_code).localeCompare(String(b.hsn_code)));
    }, [groups]);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const groupsData = await window.electronAPI.getAllGroups();
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch (err) {
                console.error('Failed to fetch groups:', err);
            }
        })();
    }, [isOpen]);

    // Seed state when opening / editing
    useEffect(() => {
        if (!isOpen) return;

        if (item) {
            const base = {
                name: item.name || '',
                hsn: item.hsn || '',
                item_code: item.item_code || '',
                batch_number: item.batch_number || '',
                expiry_date: item.expiry_date || '',
                price: item.price ?? '',
                stock: item.stock ?? '',
                gst_percentage: '' // will be derived from group if exists
            };
            setFormData(base);
        } else {
            setFormData({
                name: '', hsn: '', item_code: '', batch_number: '', expiry_date: '', price: '', stock: '', gst_percentage: ''
            });
            setSelectedGroupHsn('');
            setIsGstEditable(true);
        }
    }, [item, isOpen]);

    // When groups or HSN change, re-evaluate selected group and GST lock
    useEffect(() => {
        if (!isOpen) return;
        const match = groups.find(g => String(g.hsn_code) === String(formData.hsn));
        if (match) {
            setSelectedGroupHsn(match.hsn_code);
            setFormData(prev => ({ ...prev, gst_percentage: match.gst_percentage }));
            setIsGstEditable(false);
        } else {
            setSelectedGroupHsn('');
            setIsGstEditable(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, formData.hsn, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupSelect = (e) => {
        const hsn = e.target.value;
        setSelectedGroupHsn(hsn);
        if (hsn) {
            const g = groups.find(x => String(x.hsn_code) === String(hsn));
            if (g) {
                setFormData(prev => ({ ...prev, hsn: g.hsn_code, gst_percentage: g.gst_percentage }));
                setIsGstEditable(false);
            }
        } else {
            // No group selected (new HSN case). Do not override existing HSN field; allow user to type.
            setIsGstEditable(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock || !formData.hsn) {
            setError('Fill required: Name, HSN, Price, Stock.');
            return;
        }
        const payload = {
            name: String(formData.name).trim(),
            hsn: String(formData.hsn).trim(),
            batch_number: formData.batch_number || '',
            expiry_date: formData.expiry_date || '',
            price: Number(formData.price),
            stock: Number(formData.stock),
            // Only include gst_percentage if editable/new HSN; DB will ignore when group exists
            gst_percentage: formData.gst_percentage === '' ? 0 : Number(formData.gst_percentage)
        };
        setError('');
        onSave(payload);
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
                                <input type="text" name="hsn" value={formData.hsn} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700">Group (by HSN)</label>
                                <select value={selectedGroupHsn} onChange={handleGroupSelect} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="">No group / New HSN</option>
                                    {sortedGroups.map(g => (
                                        <option key={g.id} value={g.hsn_code}>{`HSN: ${g.hsn_code}`}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Selecting a group fills HSN & locks GST.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GST (%)</label>
                                <input type="number" step="0.01" min="0" max="100" name="gst_percentage" value={formData.gst_percentage} onChange={handleChange} readOnly={!isGstEditable} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md ${!isGstEditable ? 'bg-gray-100' : ''}`} />
                            </div>
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
