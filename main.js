const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// Assuming your DatabaseService class is in this file
// Note: You will need to create this file and its class methods.
const DatabaseService = require('./src/database/database'); 

let db;

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

  // This logic correctly loads the Vite dev server or the production build file.
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// This function sets up all the specific listeners for your database.
function setupDatabaseHandlers() {
  if (!db) return;

  // --- Medicine Handlers ---
  ipcMain.handle('get-all-medicines', () => db.getAllMedicines());
  ipcMain.handle('search-medicines', (event, searchTerm) => db.searchMedicines(searchTerm));
  ipcMain.handle('add-medicine', (event, medicine) => db.addMedicine(medicine));
  ipcMain.handle('update-medicine', (event, id, medicine) => db.updateMedicine(id, medicine));
  ipcMain.handle('delete-medicine', (event, id) => db.deleteMedicine(id));

  // --- Invoice Handlers ---
  ipcMain.handle('create-invoice', (event, invoiceData) => db.createInvoice(invoiceData));
  ipcMain.handle('get-all-invoices', () => db.getAllInvoices());
  ipcMain.handle('generate-invoice-number', () => db.generateInvoiceNumber());

  // --- Dashboard Handlers ---
  ipcMain.handle('get-dashboard-stats', () => db.getDashboardStats());
}

// Initialize the app
app.whenReady().then(() => {
  // Initialize your database service
  db = new DatabaseService();
  
  // Set up all the IPC handlers
  setupDatabaseHandlers();
  
  // Create the main application window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Important: Close the database connection before quitting.
    if (db) {
      db.close();
    }
    app.quit();
  }
});
