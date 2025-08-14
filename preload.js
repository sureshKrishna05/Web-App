const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Parties Functions ---
  getAllParties: () => ipcRenderer.invoke('get-all-parties'),
  addParty: (party) => ipcRenderer.invoke('add-party', party),
  updateParty: (id, party) => ipcRenderer.invoke('update-party', id, party),
  deleteParty: (id) => ipcRenderer.invoke('delete-party', id),
  // --- NEW: Exposed function for searching parties ---
  searchParties: (searchTerm) => ipcRenderer.invoke('search-parties', searchTerm),

  // --- Existing Functions ---
  getAllClients: () => ipcRenderer.invoke('get-all-clients'),
  addClient: (name) => ipcRenderer.invoke('add-client', name),
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
