const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseService = require('./src/database/database');

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:5173'); // for dev mode
}

// Initialize database when app is ready
app.whenReady().then(() => {
  // Initialize database
  db = new DatabaseService();
  
  createWindow();
  
  // Set up IPC handlers for database operations
  setupDatabaseHandlers();
});

// Clean up database connection when app is closing
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

function setupDatabaseHandlers() {
  // Medicine operations
  ipcMain.handle('get-all-medicines', async () => {
    try {
      return db.getAllMedicines();
    } catch (error) {
      throw new Error(`Failed to get medicines: ${error.message}`);
    }
  });

  ipcMain.handle('search-medicines', async (event, searchTerm) => {
    try {
      return db.searchMedicines(searchTerm);
    } catch (error) {
      throw new Error(`Failed to search medicines: ${error.message}`);
    }
  });

  ipcMain.handle('add-medicine', async (event, medicine) => {
    try {
      return db.addMedicine(medicine);
    } catch (error) {
      throw new Error(`Failed to add medicine: ${error.message}`);
    }
  });

  ipcMain.handle('update-medicine', async (event, id, medicine) => {
    try {
      return db.updateMedicine(id, medicine);
    } catch (error) {
      throw new Error(`Failed to update medicine: ${error.message}`);
    }
  });

  ipcMain.handle('delete-medicine', async (event, id) => {
    try {
      return db.deleteMedicine(id);
    } catch (error) {
      throw new Error(`Failed to delete medicine: ${error.message}`);
    }
  });

  // Invoice operations
  ipcMain.handle('create-invoice', async (event, invoiceData) => {
    try {
      return db.createInvoice(invoiceData);
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  });

  ipcMain.handle('get-all-invoices', async () => {
    try {
      return db.getAllInvoices();
    } catch (error) {
      throw new Error(`Failed to get invoices: ${error.message}`);
    }
  });

  ipcMain.handle('generate-invoice-number', async () => {
    try {
      return db.generateInvoiceNumber();
    } catch (error) {
      throw new Error(`Failed to generate invoice number: ${error.message}`);
    }
  });

  // Dashboard operations
  ipcMain.handle('get-dashboard-stats', async () => {
    try {
      return db.getDashboardStats();
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  });
}
