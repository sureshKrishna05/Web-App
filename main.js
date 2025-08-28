const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseService = require('./src/database/database');

let db;

const isDev = !app.isPackaged; // true if running `npm run dev`

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

function setupDatabaseHandlers() {
  if (!db) return;

  // --- NEW IPC HANDLERS for Employee Performance ---
  ipcMain.handle('get-rep-performance', (event, { repId, month }) => {
    if (!repId) throw new Error('Sales Rep ID is required');
    if (!month) throw new Error('Month is required');
    return db.getRepPerformance(repId, month);
  });

  ipcMain.handle('set-rep-target', (event, { repId, month, targetAmount }) => {
    if (!repId) throw new Error('Sales Rep ID is required');
    if (!month) throw new Error('Month is required');
    if (targetAmount == null || isNaN(targetAmount)) throw new Error('Valid target amount is required');
    return db.setRepTarget(repId, month, targetAmount);
  });

  // --- Suppliers Handlers ---
  ipcMain.handle('get-all-suppliers', () => db.getAllSuppliers());
  ipcMain.handle('add-supplier', (event, supplier) => {
    if (!supplier.name?.trim()) throw new Error('Supplier name is required');
    if (!supplier.phone?.trim()) throw new Error('Supplier contact number is required');
    if (!supplier.address?.trim()) throw new Error('Supplier address is required');
    if (!supplier.gstin?.trim()) throw new Error('Supplier GSTIN is required');
    return db.addSupplier(supplier);
  });
  ipcMain.handle('update-supplier', (event, id, supplier) => {
    if (!id) throw new Error('Supplier ID is required for update');
    if (!supplier.name?.trim()) throw new Error('Supplier name is required');
    if (!supplier.phone?.trim()) throw new Error('Supplier contact number is required');
    if (!supplier.address?.trim()) throw new Error('Supplier address is required');
    if (!supplier.gstin?.trim()) throw new Error('Supplier GSTIN is required');
    return db.updateSupplier(id, supplier);
  });
  ipcMain.handle('delete-supplier', (event, id) => {
    if (!id) throw new Error('Supplier ID is required for deletion');
    return db.deleteSupplier(id);
  });

  // --- Parties Handlers ---
  ipcMain.handle('get-all-parties', () => db.getAllParties());
  ipcMain.handle('add-party', (event, party) => {
    if (!party.name?.trim()) throw new Error('Party name is required');
    if (!party.phone?.trim()) throw new Error('Party contact number is required');
    if (!party.address?.trim()) throw new Error('Party address is required');
    if (!party.gstin?.trim()) throw new Error('GSTIN is required');
    return db.addParty(party);
  });
  ipcMain.handle('update-party', (event, id, party) => {
    if (!id) throw new Error('Party ID is required for update');
    if (!party.name?.trim()) throw new Error('Party name is required');
    if (!party.phone?.trim()) throw new Error('Party contact number is required');
    if (!party.address?.trim()) throw new Error('Party address is required');
    if (!party.gstin?.trim()) throw new Error('GSTIN is required');
    return db.updateParty(id, party);
  });
  ipcMain.handle('delete-party', (event, id) => {
    if (!id) throw new Error('Party ID is required for deletion');
    return db.deleteParty(id);
  });
  ipcMain.handle('search-parties', (event, searchTerm) => db.searchParties(searchTerm));

  // --- Clients Handlers ---
  ipcMain.handle('get-all-clients', () => db.getAllClients());
  ipcMain.handle('add-client', (event, name) => {
    if (!name?.trim()) throw new Error('Client name is required');
    return db.addClient(name);
  });

  // --- Sales Reps ---
  ipcMain.handle('get-all-sales-reps', () => db.getAllSalesReps());

  // --- Medicines Handlers ---
  ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
  ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
  ipcMain.handle('add-medicine', (event, medicine) => {
    if (!medicine.name?.trim()) throw new Error('Medicine name is required');
    if (medicine.price == null || isNaN(medicine.price)) throw new Error('Valid price is required');
    if (medicine.stock == null || isNaN(medicine.stock)) throw new Error('Valid stock quantity is required');
    return db.addMedicine(medicine);
  });
  ipcMain.handle('update-medicine', (event, id, medicine) => {
    if (!id) throw new Error('Medicine ID is required for update');
    if (!medicine.name?.trim()) throw new Error('Medicine name is required');
    if (medicine.price == null || isNaN(medicine.price)) throw new Error('Valid price is required');
    if (medicine.stock == null || isNaN(medicine.stock)) throw new Error('Valid stock quantity is required');
    return db.updateMedicine(id, medicine);
  });
  ipcMain.handle('delete-medicine', (event, id) => {
    if (!id) throw new Error('Medicine ID is required for deletion');
    return db.deleteMedicine(id);
  });

  // --- Invoices ---
  ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));

  // --- Misc ---
  ipcMain.handle('get-all-invoices', () => db.getAllInvoices?.() || []);
  ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());
  ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

app.whenReady().then(() => {
  db = new DatabaseService();
  setupDatabaseHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});
