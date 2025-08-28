import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Component for the Target Setting Modal ---
const TargetModal = ({ isOpen, onClose, onSave, repName, currentTarget }) => {
    const [target, setTarget] = useState(currentTarget || '');

    useEffect(() => {
        setTarget(currentTarget || '');
    }, [currentTarget, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Set Target for {repName}</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Target Amount (₹)</label>
                    <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={() => onSave(target)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Target</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Employees Page Component ---
const EmployeesPage = () => {
    const [reps, setReps] = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRep, setSelectedRep] = useState(null);

    const fetchData = useCallback(async (month) => {
        try {
            setLoading(true);
            const salesReps = await window.electronAPI.getAllSalesReps();
            setReps(salesReps);

            const performance = {};
            for (const rep of salesReps) {
                performance[rep.id] = await window.electronAPI.getRepPerformance(rep.id, month);
            }
            setPerformanceData(performance);
        } catch (error) {
            console.error("Failed to fetch employee data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedMonth);
    }, [selectedMonth, fetchData]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };
    
    const handleOpenModal = (rep) => {
        setSelectedRep(rep);
        setIsModalOpen(true);
    };

    const handleSaveTarget = async (targetAmount) => {
        if (!selectedRep || !targetAmount) return;
        try {
            await window.electronAPI.setRepTarget(selectedRep.id, selectedMonth, Number(targetAmount));
            setIsModalOpen(false);
            setSelectedRep(null);
            fetchData(selectedMonth); // Refresh data
        } catch (error) {
            console.error("Failed to set target:", error);
        }
    };

    return (
        <div className="p-6 bg-[#E9E9E9] h-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800"></h1>
                <div>
                    <label htmlFor="month-select" className="mr-2 text-sm font-medium">Select Month:</label>
                    <input 
                        type="month" 
                        id="month-select"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading performance data...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reps.map(rep => {
                        const performance = performanceData[rep.id] || { target: 0, achieved: 0 };
                        const percentage = performance.target > 0 ? (performance.achieved / performance.target) * 100 : 0;
                        
                        return (
                            <div key={rep.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-gray-900">{rep.name}</h2>
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">Target:</span>
                                        <span className="font-semibold">₹{performance.target.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">Achieved:</span>
                                        <span className="font-semibold">₹{performance.achieved.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className="bg-green-500 h-4 rounded-full" 
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-sm font-medium">{percentage.toFixed(1)}% Achieved</p>
                                </div>
                                <button onClick={() => handleOpenModal(rep)} className="mt-4 w-full text-center bg-gray-100 py-2 rounded-md hover:bg-gray-200">
                                    Set Target
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <TargetModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTarget}
                repName={selectedRep?.name}
                currentTarget={performanceData[selectedRep?.id]?.target}
            />
        </div>
    );
};

export default EmployeesPage;
