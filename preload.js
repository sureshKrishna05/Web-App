const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Employee Performance Functions ---
  getRepPerformance: (data) => ipcRenderer.invoke('get-rep-performance', data),
  setRepTarget: (data) => ipcRenderer.invoke('set-rep-target', data),
  
  // --- Supplier Functions ---
  getAllSuppliers: () => ipcRenderer.invoke('get-all-suppliers'),
  addSupplier: (supplier) => ipcRenderer.invoke('add-supplier', supplier),
  updateSupplier: (id, supplier) => ipcRenderer.invoke('update-supplier', id, supplier),
  deleteSupplier: (id) => ipcRenderer.invoke('delete-supplier', id),

  // --- Party/Client Functions ---
  getAllParties: () => ipcRenderer.invoke('get-all-parties'),
  addParty: (party) => ipcRenderer.invoke('add-party', party),
  updateParty: (id, party) => ipcRenderer.invoke('update-party', id, party),
  deleteParty: (id) => ipcRenderer.invoke('delete-party', id),
  searchParties: (searchTerm) => ipcRenderer.invoke('search-parties', searchTerm),
  getPartyByName: (name) => ipcRenderer.invoke('get-party-by-name', name),

  // --- Sales Rep Functions ---
  getAllSalesReps: () => ipcRenderer.invoke('get-all-sales-reps'),
  addSalesRep: (employeeData) => ipcRenderer.invoke('add-sales-rep', employeeData),
  deleteSalesRep: (id) => ipcRenderer.invoke('delete-sales-rep', id),

  // --- Medicine/Item Functions ---
  getAllMedicines: () => ipcRenderer.invoke('get-all-medicines'),
  searchMedicines: (searchTerm) => ipcRenderer.invoke('search-medicines', searchTerm),
  addMedicine: (medicine) => ipcRenderer.invoke('add-medicine', medicine),
  updateMedicine: (id, medicine) => ipcRenderer.invoke('update-medicine', id, medicine),
  deleteMedicine: (id) => ipcRenderer.invoke('delete-medicine', id),

  // --- Group Functions (Updated) ---
  getAllGroups: () => ipcRenderer.invoke('get-all-groups'),
  addGroup: (groupData) => ipcRenderer.invoke('add-group', groupData),
  updateGroupGst: (data) => ipcRenderer.invoke('update-group-gst', data),
  updateGroupMeasure: (data) => ipcRenderer.invoke('update-group-measure', data),
  deleteGroup: (id) => ipcRenderer.invoke('delete-group', id),

  // --- Invoice Functions ---
  createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
  getFilteredInvoices: (filters) => ipcRenderer.invoke('get-filtered-invoices', filters),
  getInvoiceDetails: (invoiceId) => ipcRenderer.invoke('get-invoice-details', invoiceId),
  exportInvoicesToCSV: (invoiceIds) => ipcRenderer.invoke('export-invoices-csv', invoiceIds),
  exportInvoicesToXLSX: (invoiceIds) => ipcRenderer.invoke('export-invoices-xlsx', invoiceIds),
  generateInvoicePDF: (invoiceData) => ipcRenderer.invoke('generate-invoice-pdf', invoiceData),

  // --- Dashboard/Utility Functions ---
  generateInvoiceNumber: () => ipcRenderer.invoke('generate-invoice-number'),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
});

