import React, { useState, useEffect, useCallback } from 'react';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Local state for creating a new group
    const [newHsn, setNewHsn] = useState('');
    const [newGst, setNewGst] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getAllGroups();
            setGroups(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Failed to load groups');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleGstChange = async (id, newGstValue) => {
        const parsed = parseFloat(newGstValue);
        if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return;
        try {
            await window.electronAPI.updateGroupGst({ id, gst_percentage: parsed });
            fetchGroups(); // Refresh the list
        } catch (err) {
            console.error('Failed to update GST:', err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const hsn = String(newHsn || '').trim();
        const gst = parseFloat(newGst);
        if (!hsn) return;
        if (Number.isNaN(gst) || gst < 0 || gst > 100) return;
        try {
            setCreating(true);
            // Requires IPC handler: electronAPI.addGroup({ hsn_code, gst_percentage })
            await window.electronAPI.addGroup({ hsn_code: hsn, gst_percentage: gst });
            setNewHsn('');
            setNewGst('');
            fetchGroups();
        } catch (err) {
            console.error('Failed to add group:', err);
            alert('Failed to add group. Ensure HSN is unique.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Item Groups (HSN)</h1>

            {/* Add Group Card */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                <form onSubmit={handleCreateGroup} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">HSN Code</label>
                        <input
                            type="text"
                            value={newHsn}
                            onChange={(e) => setNewHsn(e.target.value)}
                            placeholder="e.g. 3917"
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">GST Percentage (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={newGst}
                            onChange={(e) => setNewGst(e.target.value)}
                            placeholder="e.g. 18"
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                        >
                            {creating ? 'Adding…' : 'Add Group'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setNewHsn(''); setNewGst(''); }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">HSN Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">GST Percentage (%)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {group.hsn_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            defaultValue={group.gst_percentage}
                                            onBlur={(e) => handleGstChange(group.id, e.target.value)}
                                            className="p-1 border rounded w-24"
                                            title="Blur to save"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GroupsPage;
