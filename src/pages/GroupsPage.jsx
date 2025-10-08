import React, { useState, useEffect, useCallback } from 'react';
import AddGroupModal from '../components/AddGroupModal';
import GroupModal from '../components/GroupModal';

const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/groups');
            const data = await response.json();
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

    const handleCreateGroup = async (groupData) => {
        try {
            await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData)
            });
            setIsAddModalOpen(false);
            fetchGroups();
        } catch (err) {
            console.error('Failed to add group:', err);
        }
    };
    
    const handleDeleteGroup = async (id) => {
        try {
            await fetch(`/api/groups/${id}`, { method: 'DELETE' });
            fetchGroups();
        } catch (err) {
            console.error('Failed to delete group:', err);
        }
    };

    const handleOpenDetailsModal = async (group) => {
        try {
            const response = await fetch(`/api/groups/${group.id}`);
            const details = await response.json();
            setSelectedGroupDetails(details);
            setIsDetailsModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch group details:', err);
        }
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedGroupDetails(null);
    };

    const handleSaveGstInModal = async (groupId, newGst) => {
        try {
            await fetch(`/api/groups/${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gst_percentage: newGst })
            });
            handleCloseDetailsModal();
            fetchGroups();
        } catch (err) {
            console.error('Failed to update GST from modal:', err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-end items-center mb-6">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
                >
                    <IconPlus />
                    Add New Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white rounded-lg shadow-md flex flex-col">
                        <button 
                            onClick={() => handleOpenDetailsModal(group)}
                            className="p-4 text-left flex-grow hover:bg-gray-50 rounded-t-lg"
                        >
                            <p className="text-sm text-gray-500">HSN Code</p>
                            <h3 className="text-xl font-bold text-gray-800">{group.hsn_code}</h3>
                            <p className="text-sm text-gray-600 mt-2">GST: {group.gst_percentage}%</p>
                            <p className="text-sm text-gray-600">{group.itemCount} item(s) in this group</p>
                        </button>
                        <div className="border-t p-2 flex justify-end">
                             <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                                <IconDelete />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <AddGroupModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleCreateGroup}
            />
            <GroupModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                onSaveGst={handleSaveGstInModal}
                groupDetails={selectedGroupDetails}
            />
        </div>
    );
};

export default GroupsPage;
