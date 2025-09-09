import React, { useState, useEffect, useCallback } from 'react';
import AddGroupModal from '../components/AddGroupModal'; // Import the new modal

// --- Helper Icon Components ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

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

    // Handler for saving GST changes on blur
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

    // Handler for saving Measure changes on blur
    const handleMeasureChange = async (id, newMeasure) => {
        try {
            await window.electronAPI.updateGroupMeasure({ id, measure: newMeasure });
            fetchGroups(); // Refresh list
        } catch (err) {
            console.error('Failed to update measure:', err);
        }
    };

    // Handler for creating a new group via the modal
    const handleCreateGroup = async (groupData) => {
        try {
            await window.electronAPI.addGroup(groupData);
            setIsModalOpen(false); // Close modal on success
            fetchGroups(); // Refresh the list
        } catch (err) {
            console.error('Failed to add group:', err);
            alert('Failed to add group. Ensure HSN is unique.');
        }
    };
    
    // Handler for deleting a group
    const handleDeleteGroup = async (id) => {
        // A simple console log to replace window.confirm
        console.log(`Attempting to delete group ID: ${id}. Check main process for confirmation dialog if implemented, or proceed with deletion.`);
        try {
            await window.electronAPI.deleteGroup(id);
            fetchGroups();
        } catch (err) {
            console.error('Failed to delete group:', err);
            alert(err.message); // Show error from main process
        }
    };

    if (loading) return <div className="p-8 text-center">Loading groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-end items-center mb-6">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
                >
                    <IconPlus />
                    Add New Group
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">HSN Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">GST (%)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Measure</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <input
                                            type="text"
                                            defaultValue={group.measure || ''}
                                            onBlur={(e) => handleMeasureChange(group.id, e.target.value)}
                                            className="p-1 border rounded w-24"
                                            placeholder="e.g., box"
                                            title="Blur to save"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteGroup(group.id)} className="text-red-600 hover:text-red-900 transition-colors">
                                            <IconDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Render the modal */}
            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateGroup}
            />
        </div>
    );
};

export default GroupsPage;
