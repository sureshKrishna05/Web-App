const { contextBridge, ipcRenderer } = require('electron');

// Expose database API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Medicine operations
  getAllMedicines: () => ipcRenderer.invoke('get-all-medicines'),
  searchMedicines: (searchTerm) => ipcRenderer.invoke('search-medicines', searchTerm),
  addMedicine: (medicine) => ipcRenderer.invoke('add-medicine', medicine),
  updateMedicine: (id, medicine) => ipcRenderer.invoke('update-medicine', id, medicine),
  deleteMedicine: (id) => ipcRenderer.invoke('delete-medicine', id),
  
  // Invoice operations
  createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
  getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),
  generateInvoiceNumber: () => ipcRenderer.invoke('generate-invoice-number'),
  
  // Dashboard operations
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats')
});