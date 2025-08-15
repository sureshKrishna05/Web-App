const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- NEWLY EXPOSED FUNCTIONS for Suppliers ---
  getAllSuppliers: () => ipcRenderer.invoke('get-all-suppliers'),
  addSupplier: (supplier) => ipcRenderer.invoke('add-supplier', supplier),
  updateSupplier: (id, supplier) => ipcRenderer.invoke('update-supplier', id, supplier),
  deleteSupplier: (id) => ipcRenderer.invoke('delete-supplier', id),

  // --- Existing Functions ---
  getAllParties: () => ipcRenderer.invoke('get-all-parties'),
  addParty: (party) => ipcRenderer.invoke('add-party', party),
  updateParty: (id, party) => ipcRenderer.invoke('update-party', id, party),
  deleteParty: (id) => ipcRenderer.invoke('delete-party', id),
  searchParties: (searchTerm) => ipcRenderer.invoke('search-parties', searchTerm),
  getAllSalesReps: () => ipcRenderer.invoke('get-all-sales-reps'),
  getAllMedicines: () => ipcRenderer.invoke('get-all-medicines'),
  searchMedicines: (searchTerm) => ipcRenderer.invoke('search-medicines', searchTerm),
  addMedicine: (medicine) => ipcRenderer.invoke('add-medicine', medicine),
  updateMedicine: (id, medicine) => ipcRenderer.invoke('update-medicine', id, medicine),
  deleteMedicine: (id) => ipcRenderer.invoke('delete-medicine', id),
  createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
  getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),
  generateInvoiceNumber: () => ipcRenderer.invoke('generate-invoice-number'),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
});
