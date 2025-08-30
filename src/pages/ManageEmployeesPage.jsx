import React, { useState, useEffect, useCallback } from 'react';
import AddEmployeeModal from '../components/AddEmployeeModal.jsx'; // We will create this next

const ManageEmployeesPage = () => {
    const [reps, setReps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSalesReps = useCallback(async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getAllSalesReps();
            setReps(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalesReps();
    }, [fetchSalesReps]);

    const handleSaveEmployee = async (employeeData) => {
        try {
            await window.electronAPI.addSalesRep(employeeData);
            fetchSalesReps();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save employee:", err);
            setError(err.message);
        }
    };

    const handleDeleteRep = async (id) => {
        // A non-blocking confirmation
        console.log(`Attempting to delete employee with ID: ${id}. Please confirm in the main process if required.`);
        try {
            await window.electronAPI.deleteSalesRep(id);
            fetchSalesReps();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading employees...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Employees</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700"
                >
                    Add New Employee
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="border-b-2">
                        <tr>
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Contact Number</th>
                            <th className="text-left p-3 font-semibold">Type</th>
                            <th className="text-left p-3 font-semibold">Date of Joining</th>
                            <th className="text-center p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reps.map((rep) => (
                            <tr key={rep.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{rep.name}</td>
                                <td className="p-3">{rep.contact_number}</td>
                                <td className="p-3">{rep.employee_type}</td>
                                <td className="p-3">{rep.date_of_joining}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleDeleteRep(rep.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEmployee}
            />
        </div>
    );
};

export default ManageEmployeesPage;
