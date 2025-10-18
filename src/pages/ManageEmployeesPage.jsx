import React, { useState, useEffect, useCallback } from 'react';
import AddEmployeeModal from '../components/AddEmployeeModal.jsx';

// --- Helper Icon Components ---
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

const ManageEmployeesPage = () => {
    const [reps, setReps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSalesReps = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sales-reps');
            const data = await response.json();
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
            await fetch('/api/sales-reps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData)
            });
            fetchSalesReps();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save employee:", err);
            setError(err.message);
        }
    };

    const handleDeleteRep = async (id) => {
        if (window.confirm(`Are you sure you want to delete employee ID ${id}?`)) {
            try {
                await fetch(`/api/sales-reps/${id}`, { method: 'DELETE' });
                fetchSalesReps();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading employees...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800"></h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
                >
                    <IconPlus />
                    Add New Employee
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Contact Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date of Joining</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reps.map((rep) => (
                                <tr key={rep.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rep.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rep.contact_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rep.employee_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rep.date_of_joining}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteRep(rep.id)} className="text-red-600 hover:text-red-900 transition-colors">
                                            <IconDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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