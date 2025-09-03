import React, { useState, useEffect, useCallback } from 'react';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getAllGroups();
            setGroups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleGstChange = async (id, newGst) => {
        try {
            await window.electronAPI.updateGroupGst({ id, gst_percentage: newGst });
            fetchGroups(); // Refresh the list
        } catch (err) {
            console.error("Failed to update GST:", err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Item Groups (HSN)</h1>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.hsn_code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <input
                                            type="number"
                                            defaultValue={group.gst_percentage}
                                            onBlur={(e) => handleGstChange(group.id, e.target.value)}
                                            className="p-1 border rounded w-24"
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
