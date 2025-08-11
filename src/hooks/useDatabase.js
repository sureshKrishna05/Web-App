import { useState, useEffect } from 'react';

// This hook provides a React interface to the database operations
// It communicates with the main process via IPC
const useDatabase = () => {
    const [medicines, setMedicines] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalMedicines: 0,
        lowStockItems: 0,
        totalInvoices: 0,
        recentMedicines: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Medicine operations
    const getAllMedicines = async () => {
        setLoading(true);
        try {
            const result = await window.electronAPI.getAllMedicines();
            setMedicines(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const searchMedicines = async (searchTerm) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.searchMedicines(searchTerm);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const addMedicine = async (medicine) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.addMedicine(medicine);
            await getAllMedicines(); // Refresh the list
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMedicine = async (id, medicine) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.updateMedicine(id, medicine);
            await getAllMedicines(); // Refresh the list
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMedicine = async (id) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.deleteMedicine(id);
            await getAllMedicines(); // Refresh the list
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Invoice operations
    const createInvoice = async (invoiceData) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.createInvoice(invoiceData);
            await getDashboardStats(); // Refresh stats
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllInvoices = async () => {
        setLoading(true);
        try {
            const result = await window.electronAPI.getAllInvoices();
            setInvoices(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateInvoiceNumber = async () => {
        try {
            return await window.electronAPI.generateInvoiceNumber();
        } catch (err) {
            setError(err.message);
            return `INV-${Date.now()}`;
        }
    };

    // Dashboard operations
    const getDashboardStats = async () => {
        setLoading(true);
        try {
            const result = await window.electronAPI.getDashboardStats();
            setDashboardStats(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize data on hook mount
    useEffect(() => {
        getAllMedicines();
        getDashboardStats();
    }, []);

    return {
        // Data
        medicines,
        invoices,
        dashboardStats,
        loading,
        error,
        
        // Medicine operations
        getAllMedicines,
        searchMedicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        
        // Invoice operations
        createInvoice,
        getAllInvoices,
        generateInvoiceNumber,
        
        // Dashboard operations
        getDashboardStats,
        
        // Utility
        clearError: () => setError(null)
    };
};

export default useDatabase;
